# reorganize_roboflow_png_masks.py
# Build: data_fp/{labeled,val}/{images,masks} from a Roboflow
# "png-mask-semantic" export where images & *_mask.png live together.

from pathlib import Path
import argparse, shutil, random
import cv2, numpy as np

IMG_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

def read_mask_as_01(p: Path) -> np.ndarray:
    m = cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
    if m is None:
        raise FileNotFoundError(p)
    if m.ndim == 3:
        m = cv2.cvtColor(m, cv2.COLOR_BGR2GRAY)
    m = m.astype(np.uint8)
    if m.max() == 1:
        return m
    uniq = set(np.unique(m).tolist())
    if uniq.issubset({0, 255}):
        return (m // 255).astype(np.uint8)
    return (m > 0).astype(np.uint8)

def find_mask_for(img: Path) -> Path | None:
    # A) exact Roboflow: '<image>.jpg_mask.png'
    cand_a = img.with_name(img.name + "_mask.png")
    if cand_a.exists():
        return cand_a
    # B) variant: '<image_stem>_mask.png'
    cand_b = img.with_name(img.stem + "_mask.png")
    if cand_b.exists():
        return cand_b
    return None

def mask_out_name_for(img: Path) -> str:
    # final normalized mask name: '<image_stem>.png'
    base = img.stem
    if base.endswith(".jpg"):         # rare double .jpg in stem
        base = Path(base).stem
    return base + ".png"

def xfer(src: Path, dst: Path, copy: bool):
    dst.parent.mkdir(parents=True, exist_ok=True)
    (shutil.copy2 if copy else shutil.move)(src, dst)

def collect_pairs(src_dir: Path):
    images = [
        p for p in src_dir.iterdir()
        if p.is_file() and p.suffix.lower() in IMG_EXTS and not p.name.endswith("_mask.png")
           and p.name != "_classes.csv"
    ]
    pairs, missing = [], 0
    for img in images:
        m = find_mask_for(img)
        if m is None:
            missing += 1
            print(f"[WARN] No mask for {img.name}")
            continue
        pairs.append((img, m))
    return pairs, missing

def write_split(pairs, out_img_dir: Path, out_msk_dir: Path, copy: bool):
    for img, m in pairs:
        # 1) copy/move image
        xfer(img, out_img_dir / img.name, copy)
        # 2) load & size-correct mask -> save as <image_stem>.png (0/255)
        mask01 = read_mask_as_01(m)
        bgr = cv2.imread(str(img), cv2.IMREAD_COLOR)
        if bgr is None:
            print(f"[WARN] unreadable image {img}, skipping its mask write")
            continue
        h, w = bgr.shape[:2]
        if mask01.shape[:2] != (h, w):
            mask01 = cv2.resize(mask01, (w, h), interpolation=cv2.INTER_NEAREST)
        cv2.imwrite(str(out_msk_dir / mask_out_name_for(img)), (mask01 * 255).astype(np.uint8))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src_dir", default="train", help="Folder containing images + *_mask.png")
    ap.add_argument("--out_root", default="data_fp", help="Output root")
    ap.add_argument("--val_fraction", type=float, default=0.15)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--copy", action="store_true", help="Copy instead of move")
    args = ap.parse_args()

    src_dir = Path(args.src_dir)
    out_root = Path(args.out_root)
    random.seed(args.seed)

    # make dirs
    tr_im = out_root / "labeled/images"; tr_im.mkdir(parents=True, exist_ok=True)
    tr_ma = out_root / "labeled/masks";  tr_ma.mkdir(parents=True, exist_ok=True)
    va_im = out_root / "val/images";     va_im.mkdir(parents=True, exist_ok=True)
    va_ma = out_root / "val/masks";      va_ma.mkdir(parents=True, exist_ok=True)

    pairs, missing = collect_pairs(src_dir)
    if not pairs:
        raise SystemExit(f"No image/mask pairs found in {src_dir}")

    random.shuffle(pairs)
    k = int(round((1 - args.val_fraction) * len(pairs)))
    train_pairs, val_pairs = pairs[:k], pairs[k:]

    write_split(train_pairs, tr_im, tr_ma, args.copy)
    write_split(val_pairs,   va_im, va_ma, args.copy)

    print(f"Done. Train pairs: {len(train_pairs)} | Val pairs: {len(val_pairs)} | Missing masks: {missing}")
    print(f"Images -> {tr_im}  | {va_im}")
    print(f"Masks  -> {tr_ma}  | {va_ma}")

if __name__ == "__main__":
    main()
