import os, cv2, math, random
import numpy as np
from glob import glob
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

import albumentations as A
from albumentations.pytorch import ToTensorV2
import segmentation_models_pytorch as smp

# =========================
# CONFIG
# =========================
SEED = 42
random.seed(SEED); np.random.seed(SEED); torch.manual_seed(SEED)

DATA_DIR = "data"
IMG_DIR  = f"{DATA_DIR}/images"
FP_DIR   = f"{DATA_DIR}/masks_footpath"   # used if exists
OB_DIR   = f"{DATA_DIR}/masks_obstacle"   # used if exists
CLS_DIR  = f"{DATA_DIR}/masks_classes"    # used if exists

OUT_DIR      = "artifacts_unet_r34_3c"
IMG_SIZE     = 512          # train/infer size (square)
BATCH        = 8
EPOCHS       = 80
LR           = 3e-4
WEIGHT_DECAY = 1e-4
NUM_WORKERS  = 4
DEVICE       = "cuda" if torch.cuda.is_available() else "cpu"

os.makedirs(OUT_DIR, exist_ok=True)

# =========================
# SPLIT
# =========================
train_ids, val_ids = None, None
if Path(f"{DATA_DIR}/train.txt").exists():
    train_ids = [x.strip() for x in open(f"{DATA_DIR}/train.txt")]
if Path(f"{DATA_DIR}/val.txt").exists():
    val_ids = [x.strip() for x in open(f"{DATA_DIR}/val.txt")]

def list_basenames():
    ids = []
    for p in glob(f"{IMG_DIR}/*"):
        ids.append(Path(p).stem)
    ids = sorted(list(set(ids)))
    random.shuffle(ids)
    k = int(0.85*len(ids))
    return ids[:k], ids[k:]

if train_ids is None or val_ids is None:
    train_ids, val_ids = list_basenames()

# =========================
# DATASET
# =========================
mean = (0.485, 0.456, 0.406)
std  = (0.229, 0.224, 0.225)

train_tf = A.Compose([
    A.LongestMaxSize(max_size=IMG_SIZE),
    A.PadIfNeeded(IMG_SIZE, IMG_SIZE, border_mode=cv2.BORDER_CONSTANT, value=0),
    A.RandomResizedCrop(IMG_SIZE, IMG_SIZE, scale=(0.75, 1.0), ratio=(0.95,1.05), p=0.5),
    A.HorizontalFlip(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.03, scale_limit=0.15, rotate_limit=10,
                       border_mode=cv2.BORDER_REFLECT_101, p=0.5),
    A.RandomBrightnessContrast(0.2, 0.2, p=0.5),
    A.HueSaturationValue(10, 10, 10, p=0.3),
    A.MotionBlur(blur_limit=3, p=0.15),
    A.Normalize(mean=mean, std=std),
    ToTensorV2(),
])

val_tf = A.Compose([
    A.LongestMaxSize(max_size=IMG_SIZE),
    A.PadIfNeeded(IMG_SIZE, IMG_SIZE, border_mode=cv2.BORDER_CONSTANT, value=0),
    A.Normalize(mean=mean, std=std),
    ToTensorV2(),
])

def load_image_any(stem):
    for ext in (".jpg", ".png", ".jpeg", ".bmp", ".webp"):
        p = Path(IMG_DIR) / f"{stem}{ext}"
        if p.exists():
            img = cv2.imread(str(p), cv2.IMREAD_COLOR)
            if img is not None:
                return img
    raise FileNotFoundError(f"Image for {stem} not found in {IMG_DIR}")

def has_dir(d): return Path(d).exists()

USE_SEPARATE = has_dir(FP_DIR) or has_dir(OB_DIR)
USE_CLASSES  = has_dir(CLS_DIR)

class Seg3CDataset(Dataset):
    # Returns: x: FloatTensor [3,H,W]; y: LongTensor [H,W] with {0,1,2}
    def __init__(self, ids, tf):
        self.ids = ids
        self.tf = tf
        assert USE_SEPARATE or USE_CLASSES, \
            "Provide either masks_footpath/masks_obstacle or masks_classes"

    def __len__(self): return len(self.ids)

    def _load_classmap(self, stem):
        # priority: CLS_DIR if exists
        if USE_CLASSES:
            p = Path(CLS_DIR) / f"{stem}.png"
            m = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
            if m is None:
                raise FileNotFoundError(f"class mask missing: {p}")
            # ensure values in {0,1,2}
            m = m.astype(np.int64)
            m[m<0] = 0
            m[m>2] = 2
            return m

        # else build from separate binary masks
        fp = cv2.imread(str(Path(FP_DIR)/f"{stem}.png"), cv2.IMREAD_GRAYSCALE) \
             if Path(FP_DIR).exists() else None
        ob = cv2.imread(str(Path(OB_DIR)/f"{stem}.png"), cv2.IMREAD_GRAYSCALE) \
             if Path(OB_DIR).exists() else None
        if fp is None and ob is None:
            raise FileNotFoundError(f"no masks for {stem}")
        H=W=None
        if fp is not None:
            H,W = fp.shape[:2]
            fp = (fp>127).astype(np.uint8)
        else:
            # create empty footpath if missing
            # (unlikely, but keeps code robust)
            img = load_image_any(stem)
            H,W = img.shape[:2]
            fp = np.zeros((H,W), np.uint8)

        if ob is not None:
            ob = (ob>127).astype(np.uint8)
        else:
            ob = np.zeros((H,W), np.uint8)

        m = np.zeros((H,W), dtype=np.int64)   # bg=0
        m[fp==1] = 1
        m[ob==1] = 2
        # obstacle should override footpath if overlap
        return m

    def __getitem__(self, i):
        stem = self.ids[i]
        img_bgr = load_image_any(stem)
        m = self._load_classmap(stem)

        # Albumentations expects RGB
        img_rgb = img_bgr[:,:,::-1]
        aug = self.tf(image=img_rgb, mask=m)
        x = aug["image"]                 # FloatTensor [3,H,W]
        y = aug["mask"].long()           # LongTensor [H,W]
        return x, y

train_ds = Seg3CDataset(train_ids, train_tf)
val_ds   = Seg3CDataset(val_ids,   val_tf)
train_dl = DataLoader(train_ds, batch_size=BATCH, shuffle=True,
                      num_workers=NUM_WORKERS, pin_memory=True, persistent_workers=NUM_WORKERS>0)
val_dl   = DataLoader(val_ds,   batch_size=BATCH, shuffle=False,
                      num_workers=max(1, NUM_WORKERS//2), pin_memory=True)

# =========================
# MODEL / LOSS / OPT
# =========================
model = smp.Unet(
    encoder_name="resnet34",
    encoder_weights="imagenet",
    in_channels=3,
    classes=3
).to(DEVICE)

# Class weights: bg, footpath, obstacle
# Start with a slight upweight for obstacle
ce_weights = torch.tensor([0.25, 0.6, 1.2], device=DEVICE, dtype=torch.float32)
ce = nn.CrossEntropyLoss(weight=ce_weights)

def dice_multiclass(logits, y, classes=(1,2), eps=1e-6):
    # logits: [B,3,H,W], y: [B,H,W]
    probs = torch.softmax(logits, dim=1)
    loss = 0.0
    for c in classes:
        pc = probs[:, c]                  # [B,H,W]
        yc = (y == c).float()             # [B,H,W]
        inter = (pc*yc).sum((1,2))
        denom = (pc*pc + yc*yc).sum((1,2)) + eps
        loss += 1 - (2*inter + eps)/(denom)
    return (loss/len(classes)).mean()

def loss_fn(logits, y):
    return ce(logits, y) + 0.5*dice_multiclass(logits, y)

def iou_per_class(logits, y, n_class=3, eps=1e-6):
    # returns list of IoU for each class
    preds = torch.argmax(logits, dim=1)  # [B,H,W]
    ious = []
    for c in range(n_class):
        p = (preds==c)
        t = (y==c)
        inter = (p & t).sum().item()
        union = (p | t).sum().item()
        iou = (inter + eps) / (union + eps)
        ious.append(iou)
    return ious

opt = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=EPOCHS)

scaler = torch.cuda.amp.GradScaler(enabled=(DEVICE=="cuda"))

# =========================
# TRAIN
# =========================
best_miou = 0.0
patience, bad = 15, 0

for ep in range(1, EPOCHS+1):
    model.train()
    tr_loss = 0.0
    for x,y in train_dl:
        x,y = x.to(DEVICE, non_blocking=True), y.to(DEVICE, non_blocking=True)
        opt.zero_grad(set_to_none=True)
        with torch.cuda.amp.autocast(enabled=(DEVICE=="cuda")):
            logits = model(x)
            loss = loss_fn(logits, y)
        scaler.scale(loss).backward()
        scaler.step(opt)
        scaler.update()
        tr_loss += loss.item()*x.size(0)
    tr_loss /= len(train_dl.dataset)

    model.eval()
    vl_loss = 0.0
    iou_sum = np.zeros(3, dtype=np.float64)
    npix = 0
    with torch.no_grad():
        for x,y in val_dl:
            x,y = x.to(DEVICE, non_blocking=True), y.to(DEVICE, non_blocking=True)
            logits = model(x)
            vl_loss += loss_fn(logits, y).item()*x.size(0)
            ious = iou_per_class(logits, y)
            iou_sum += np.array(ious)
            npix += 1
    vl_loss /= len(val_dl.dataset)
    cls_iou = (iou_sum / max(1,npix)).tolist()
    miou = float(np.mean(cls_iou))

    sched.step()

    print(f"Epoch {ep:03d} | train_loss={tr_loss:.4f} | val_loss={vl_loss:.4f} | IoU(bg/fp/ob)=({cls_iou[0]:.3f}/{cls_iou[1]:.3f}/{cls_iou[2]:.3f}) | mIoU={miou:.3f}")

    # checkpoint
    if miou > best_miou:
        best_miou = miou
        ckpt = f"{OUT_DIR}/unet_r34_3c_best.pth"
        torch.save({"model": model.state_dict(), "miou": best_miou, "epoch": ep}, ckpt)
        print(f"  ✓ Saved best to {ckpt} (mIoU={best_miou:.3f})")
        bad = 0
    else:
        bad += 1
        if bad >= patience:
            print("Early stopping.")
            break

print(f"Done. Best mIoU={best_miou:.3f}")