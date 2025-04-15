import cv2, numpy as np, random

def paste_rgba(img, rgba, x, y):
    H,W = img.shape[:2]
    h,w = rgba.shape[:2]
    x = max(0, min(W-w, x)); y = max(0, min(H-h, y))
    rgb = rgba[:,:,:3].astype(np.float32)
    a   = (rgba[:,:,3:4].astype(np.float32)/255.0)
    rgb *= random.uniform(0.9, 1.1)  # mild color jitter
    a   = cv2.GaussianBlur(a, (5,5), 1)  # soft edges
    out = img.astype(np.float32).copy()
    out[y:y+h, x:x+w] = out[y:y+h, x:x+w]*(1-a) + rgb*a
    out = np.clip(out, 0, 255).astype(np.uint8)
    obm = np.zeros((H,W), np.uint8)
    obm[y:y+h, x:x+w] = np.maximum(obm[y:y+h, x:x+w], (a[:,:,0] > 0.2).astype(np.uint8)*255)
    return out, obm

def chamfer_dt_free(mask01):
    # distance to nearest obstacle (0 = obstacle), ~Euclidean
    H,W = mask01.shape
    INF = 1e6
    dt = np.where(mask01==1, INF, 0).astype(np.float32)
    for y in range(H):
        for x in range(W):
            v = dt[y,x]
            if x>0: v = min(v, dt[y,x-1]+1)
            if y>0: v = min(v, dt[y-1,x]+1)
            if x>0 and y>0: v = min(v, dt[y-1,x-1]+1.4142)
            if x+1<W and y>0: v = min(v, dt[y-1,x+1]+1.4142)
            dt[y,x] = v
    for y in range(H-1, -1, -1):
        for x in range(W-1, -1, -1):
            v = dt[y,x]
            if x+1<W: v = min(v, dt[y,x+1]+1)
            if y+1<H: v = min(v, dt[y+1,x]+1)
            if x+1<W and y+1<H: v = min(v, dt[y+1,x+1]+1.4142)
            if x>0 and y+1<H: v = min(v, dt[y+1,x-1]+1.4142)
            dt[y,x] = v
    return dt

def passable_with_clearance(free01, min_half_width_px, bottom=10, top=10):
    H,W = free01.shape
    dt = chamfer_dt_free(free01)      # clearance field in px
    vis = np.zeros((H,W), np.uint8)
    q = []
    for y in range(H-bottom, H):
        for x in range(W):
            if free01[y,x] and dt[y,x] >= min_half_width_px:
                vis[y,x]=1; q.append((x,y))
    while q:
        x,y = q.pop(0)
        if y < top: return True
        for nx,ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if 0<=nx<W and 0<=ny<H and not vis[ny,nx]:
                if free01[ny,nx] and dt[ny,nx] >= min_half_width_px:
                    vis[ny,nx]=1; q.append((nx,ny))
    return False

def ensure_blocked(base_bgr, fp_bin01, cutouts_rgba, min_half_width_px=8):
    img = base_bgr.copy()
    ob_mask = np.zeros(fp_bin01.shape, np.uint8)
    H,W = fp_bin01.shape
    tries = 0
    while True:
        # free = footpath minus obstacles so far
        free = (fp_bin01.astype(np.uint8)*255)
        free[ob_mask>0] = 0
        free01 = (free>0).astype(np.uint8)
        if not passable_with_clearance(free01, min_half_width_px):
            break  # already blocked
        # paste another obstacle
        rgba = random.choice(cutouts_rgba)
        scale = random.uniform(0.6, 1.2)
        h,w = rgba.shape[:2]
        rgba_rs = cv2.resize(rgba, (int(w*scale), int(h*scale)), cv2.INTER_AREA)
        # sample a location on the footpath
        for _ in range(20):
            x = random.randint(0, W - rgba_rs.shape[1])
            y = random.randint(int(0.5*H), H - rgba_rs.shape[0])
            patch = fp_bin01[y:y+rgba_rs.shape[0], x:x+rgba_rs.shape[1]]
            if patch.sum() > 0.4 * rgba_rs.shape[0]*rgba_rs.shape[1]:
                break
        img, ob = paste_rgba(img, rgba_rs, x, y)
        ob_mask = np.maximum(ob_mask, ob)
        tries += 1
        if tries > 6: break  # safety stop
    # update footpath label by removing obstacle overlap
    fp_new = (fp_bin01.astype(np.uint8)*255)
    fp_new[ob_mask>0] = 0
    return img, fp_new, ob_mask
