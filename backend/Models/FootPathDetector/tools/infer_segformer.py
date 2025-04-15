# infer_segformer.py
import torch, cv2
import numpy as np
from pathlib import Path
import albumentations as A
from albumentations.pytorch import ToTensorV2
from transformers import SegformerForSemanticSegmentation

# ------------ CONFIG ------------
CKPT = Path("artifacts_fp/segformer_b1_fp_best.pth")  # your checkpoint
IMG_DIR = Path("test")                                # input images folder
SAVE_DIR = Path("preds_test")                         # where to save results
IMG_SIZE = 384
# --------------------------------

SAVE_DIR.mkdir(parents=True, exist_ok=True)
device = "cuda" if torch.cuda.is_available() else "cpu"

# same backbone as training
model = SegformerForSemanticSegmentation.from_pretrained(
    "nvidia/segformer-b1-finetuned-ade-512-512",
    num_labels=2,
    ignore_mismatched_sizes=True
).to(device).eval()

state = torch.load(CKPT, map_location="cpu")
model.load_state_dict(state["model"], strict=True)
print(f"[INFO] Loaded checkpoint from {CKPT}")

tf = A.Compose([
    A.LongestMaxSize(max_size=IMG_SIZE),
    A.PadIfNeeded(min_height=IMG_SIZE, min_width=IMG_SIZE,
                  border_mode=cv2.BORDER_CONSTANT, value=0, mask_value=0),
    A.Normalize((0.485,0.456,0.406),(0.229,0.224,0.225)),
    ToTensorV2()
])

def save_results(img_path: Path, mask01: np.ndarray):
    h, w = mask01.shape
    mask255 = (mask01 * 255).astype(np.uint8)
    base = SAVE_DIR / img_path.stem
    cv2.imwrite(str(base.with_name(img_path.stem + "_pred_mask.png")), mask255)

    img_bgr = cv2.imread(str(img_path), cv2.IMREAD_COLOR)
    overlay = img_bgr.copy()
    overlay[mask01.astype(bool)] = (0, 255, 0)  # green overlay
    blended = cv2.addWeighted(img_bgr, 0.7, overlay, 0.3, 0)
    cv2.imwrite(str(base.with_name(img_path.stem + "_overlay.png")), blended)

# inference loop
img_exts = {".jpg",".jpeg",".png",".bmp",".webp"}
for p in sorted(IMG_DIR.iterdir()):
    if p.suffix.lower() not in img_exts: 
        continue
    bgr = cv2.imread(str(p), cv2.IMREAD_COLOR)
    if bgr is None:
        print(f"[WARN] Could not read {p}"); continue

    rgb = bgr[:,:,::-1]
    x = tf(image=rgb)["image"].unsqueeze(0).to(device)

    with torch.cuda.amp.autocast(enabled=True):
        logits = model(pixel_values=x).logits

    ps = logits.argmax(1)[0].detach().cpu().numpy().astype(np.uint8)
    mask01 = cv2.resize(ps, (bgr.shape[1], bgr.shape[0]), interpolation=cv2.INTER_NEAREST)

    save_results(p, mask01)
    print(f"[OK] {p.name} -> saved mask+overlay")

print(f"[INFO] All done. Results in {SAVE_DIR}")