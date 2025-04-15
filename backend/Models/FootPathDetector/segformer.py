# segformer.py  (fast, AMP-ready)
import os, random, argparse
from pathlib import Path
import numpy as np
import cv2
import torch
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import albumentations as A
from albumentations.pytorch import ToTensorV2
from transformers import SegformerForSemanticSegmentation

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"

# Speed knobs
torch.backends.cudnn.benchmark = True
if hasattr(torch, "set_float32_matmul_precision"):
    torch.set_float32_matmul_precision("high")

# ---------- utils ----------
def set_seed(s):
    random.seed(s); np.random.seed(s)
    torch.manual_seed(s); torch.cuda.manual_seed_all(s)

def list_images(folder: Path):
    if not folder.exists(): return []
    exts = (".jpg",".jpeg",".png",".bmp",".webp")
    return sorted([p for p in folder.iterdir() if p.suffix.lower() in exts])

def read_mask_bin(p: Path):
    m = cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
    if m is None: raise FileNotFoundError(p)
    if m.ndim == 3: m = cv2.cvtColor(m, cv2.COLOR_BGR2GRAY)
    m = m.astype(np.uint8)
    if m.max() == 1: return m
    uniq = set(np.unique(m).tolist())
    if uniq.issubset({0,255}): return (m//255).astype(np.uint8)
    return (m > 0).astype(np.uint8)

def iou_binary_safe(pred01: np.ndarray, tgt01: np.ndarray, eps=1e-6):
    inter = (pred01 & tgt01).sum()
    union = (pred01 | tgt01).sum()
    if union == 0: return None
    return float((inter+eps)/(union+eps))

def device_str():
    return f"cuda ({torch.cuda.get_device_name(0)})" if torch.cuda.is_available() else "cpu"

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True); return p

def save_mask_and_overlay(img_bgr, mask01, out_prefix: Path, color=(0,255,0), alpha=0.35):
    out_prefix.parent.mkdir(parents=True, exist_ok=True)
    m255 = (mask01*255).astype(np.uint8)
    cv2.imwrite(str(out_prefix.with_name(out_prefix.name+"_pred_mask.png")), m255)
    lay = np.zeros_like(img_bgr); lay[mask01.astype(bool)] = color
    over = cv2.addWeighted(img_bgr, 1.0, lay, alpha, 0.0)
    cv2.imwrite(str(out_prefix.with_name(out_prefix.name+"_overlay.png")), over)

# ---------- datasets ----------
class TrainSegDataset(Dataset):
    def __init__(self, imgs, msks, size):
        self.imgs, self.msks, self.size = imgs, msks, size
        self.tf = A.Compose([
            A.LongestMaxSize(max_size=size),
            A.PadIfNeeded(min_height=size, min_width=size,
                        border_mode=cv2.BORDER_CONSTANT, border_value=0),
            A.RandomResizedCrop(size=(size, size), scale=(0.75, 1.0), ratio=(0.95, 1.05), p=0.5),
            A.HorizontalFlip(p=0.5),
            A.ShiftScaleRotate(0.03, 0.15, 10, border_mode=cv2.BORDER_REFLECT_101, p=0.5),
            A.RandomBrightnessContrast(0.2, 0.2, p=0.4),
            A.Normalize((0.485,0.456,0.406),(0.229,0.224,0.225)),
            ToTensorV2()
        ])
    def __len__(self): return len(self.imgs)
    def __getitem__(self, i):
        img = cv2.imread(str(self.imgs[i]), cv2.IMREAD_COLOR); img = img[:,:,::-1]
        m = read_mask_bin(self.msks[i])
        aug = self.tf(image=img, mask=m)
        return aug["image"], aug["mask"].long()

class ValSegDataset(Dataset):
    def __init__(self, imgs, msks, size):
        self.imgs, self.msks, self.size = imgs, msks, size
        self.tf = A.Compose([
            A.LongestMaxSize(max_size=size),
            A.PadIfNeeded(min_height=size, min_width=size,
                        border_mode=cv2.BORDER_CONSTANT, border_value=0),
            A.Normalize((0.485,0.456,0.406),(0.229,0.224,0.225)),
            ToTensorV2()
        ])
    def __len__(self): return len(self.imgs)
    def __getitem__(self, i):
        img = cv2.imread(str(self.imgs[i]), cv2.IMREAD_COLOR); img = img[:,:,::-1]
        m = read_mask_bin(self.msks[i])
        aug = self.tf(image=img, mask=m)
        return aug["image"], aug["mask"].long()

# ---------- model ----------
def make_model(num_labels=2):
    m = SegformerForSemanticSegmentation.from_pretrained(
        "nvidia/segformer-b1-finetuned-ade-512-512",  # faster than B3; good accuracy
        num_labels=num_labels, ignore_mismatched_sizes=True
    )
    return m

@torch.no_grad()
def ema_update(student, teacher, ema=0.999):
    for ps, pt in zip(student.parameters(), teacher.parameters()):
        pt.data.mul_(ema).add_(ps.data, alpha=1-ema)

# ---------- training ----------
def train(args):
    set_seed(args.seed)
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[INFO] Device: {device_str()}")

    ROOT = Path(args.root)
    OUT = ensure_dir(Path(args.outdir))

    L_images = list_images(ROOT/"labeled/images")
    L_masks  = [ROOT/"labeled/masks"/(p.name.rsplit(".",1)[0] + ".png") for p in L_images]
    if len(L_images)==0: raise RuntimeError("No labeled images found")

    V_images = list_images(ROOT/"val/images")
    V_masks  = [ROOT/"val/masks"/(p.name.rsplit(".",1)[0] + ".png") for p in V_images]
    if len(V_images)==0: print("[WARN] No val/ folder; using small split from labeled.")
    if len(V_images)==0:
        pairs = list(zip(L_images, L_masks)); random.shuffle(pairs)
        k = int(0.85*len(pairs))
        T_pairs, V_pairs = pairs[:k], pairs[k:]
        T_images = [a for a,_ in T_pairs]; T_masks = [b for _,b in T_pairs]
        V_images = [a for a,_ in V_pairs]; V_masks = [b for _,b in V_pairs]
    else:
        T_images, T_masks = L_images, L_masks

    size = args.img_size
    lab_ds = TrainSegDataset(T_images, T_masks, size)
    val_ds = ValSegDataset(V_images, V_masks, size)

    lab_dl = DataLoader(
        lab_ds, batch_size=args.batch_sup, shuffle=True,
        num_workers=args.num_workers, pin_memory=True,
        persistent_workers=(args.num_workers>0), prefetch_factor=4, drop_last=True
    )
    val_dl = DataLoader(
        val_ds, batch_size=args.batch_sup, shuffle=False,
        num_workers=max(1,args.num_workers//2), pin_memory=True
    )

    student = make_model(2).to(dev).to(memory_format=torch.channels_last)
    teacher = make_model(2).to(dev).to(memory_format=torch.channels_last)
    teacher.load_state_dict(student.state_dict()); 
    for p in teacher.parameters(): p.requires_grad_(False)

    opt = torch.optim.AdamW(student.parameters(), lr=args.lr, weight_decay=args.wd)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=args.epochs)
    scaler = torch.cuda.amp.GradScaler(enabled=args.amp and (dev=="cuda"))

    best = 0.0
    for ep in range(1, args.epochs+1):
        student.train()
        tr_loss = 0.0
        for xb, yb in lab_dl:
            xb = xb.to(dev, non_blocking=True).to(memory_format=torch.channels_last)
            yb = yb.to(dev, non_blocking=True)

            with torch.cuda.amp.autocast(enabled=args.amp and (dev=="cuda")):
                out = student(pixel_values=xb)
                logits = out.logits
                _,_,h,w = logits.shape
                y_small = F.interpolate(yb.unsqueeze(1).float(), size=(h,w), mode="nearest").squeeze(1).long()
                loss = F.cross_entropy(logits, y_small, ignore_index=255)

            opt.zero_grad(set_to_none=True)
            scaler.scale(loss).backward()
            scaler.step(opt); scaler.update()
            ema_update(student, teacher, 0.999)
            tr_loss += float(loss.item())

        sched.step()

        # validation
        student.eval()
        vals = []
        with torch.no_grad():
            for xb, yb in val_dl:
                xb = xb.to(dev, non_blocking=True).to(memory_format=torch.channels_last)
                logits = student(pixel_values=xb).logits
                logits_up = F.interpolate(logits, size=yb.shape[-2:], mode="bilinear", align_corners=False)
                pred = logits_up.argmax(1).cpu().numpy().astype(np.uint8)
                gt   = yb.cpu().numpy().astype(np.uint8)
                for p, t in zip(pred, gt):
                    v = iou_binary_safe((p==1).astype(np.uint8), (t==1).astype(np.uint8))
                    if v is not None: vals.append(v)
        miou = float(np.mean(vals)) if vals else 0.0
        print(f"Epoch {ep:03d} | loss={tr_loss/max(1,len(lab_dl)):.4f} | val IoU(fp)={miou:.3f} | used {len(vals)} imgs")

        if miou > best:
            best = miou
            ckpt = OUT/"segformer_b1_fp_best.pth"
            torch.save({"model": student.state_dict(), "miou_fp": best, "epoch": ep}, ckpt)
            print(f"  ✓ Saved best to {ckpt} (IoU={best:.3f})")

    print("Done. Best IoU:", best)

# ---------- inference ----------
@torch.no_grad()
def infer(args):
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[INFO] Device: {device_str()}")
    model = make_model(2).to(dev).eval().to(memory_format=torch.channels_last)
    state = torch.load(args.ckpt, map_location="cpu")
    model.load_state_dict(state["model"], strict=True)

    size = args.img_size
    tf = A.Compose([
        A.LongestMaxSize(max_size=size),
        A.PadIfNeeded(size, size, border_mode=cv2.BORDER_CONSTANT, value=0),
        A.Normalize((0.485,0.456,0.406),(0.229,0.224,0.225)),
        ToTensorV2()
    ])
    imgs = list_images(Path(args.images_dir))
    save_dir = ensure_dir(Path(args.save_dir))
    for p in imgs:
        bgr = cv2.imread(str(p), cv2.IMREAD_COLOR); h0,w0 = bgr.shape[:2]
        rgb = bgr[:,:,::-1]
        x = tf(image=rgb)["image"].unsqueeze(0).to(dev).to(memory_format=torch.channels_last)
        with torch.cuda.amp.autocast(enabled=True and (dev=="cuda")):
            logits = model(pixel_values=x).logits
        ps = logits.argmax(1)[0].detach().cpu().numpy().astype(np.uint8)
        mask01 = cv2.resize(ps, (w0,h0), interpolation=cv2.INTER_NEAREST)
        save_mask_and_overlay(bgr, mask01, save_dir/p.stem)
    print(f"[INFO] Saved to {save_dir}")

# ---------- CLI ----------
def build_parser():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    tr = sub.add_parser("train")
    tr.add_argument("--root", default="data_fp")
    tr.add_argument("--img_size", type=int, default=384)          # smaller → faster
    tr.add_argument("--batch_sup", type=int, default=6)           # tune to VRAM
    tr.add_argument("--epochs", type=int, default=40)
    tr.add_argument("--lr", type=float, default=3e-4)
    tr.add_argument("--wd", type=float, default=1e-4)
    tr.add_argument("--num_workers", type=int, default=6)
    tr.add_argument("--outdir", default="artifacts_fp")
    tr.add_argument("--seed", type=int, default=42)
    tr.add_argument("--amp", action="store_true", help="Enable mixed precision")

    inf = sub.add_parser("infer")
    inf.add_argument("--ckpt", required=True)
    inf.add_argument("--images_dir", required=True)
    inf.add_argument("--save_dir", default="preds_fp")
    inf.add_argument("--img_size", type=int, default=384)
    return ap

def main():
    args = build_parser().parse_args()
    if args.cmd == "train": train(args)
    else: infer(args)

if __name__ == "__main__":
    main()
