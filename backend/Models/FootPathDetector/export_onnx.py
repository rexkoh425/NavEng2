#!/usr/bin/env python3
"""
1) From your checkpoint (trained head, saved as {"model": state_dict, ...}):
   python export_onnx.py --hf_src nvidia/segformer-b1-finetuned-ade-512-512 \
          --ckpt artifacts_fp/segformer_b1_fp_best.pth \
          --num_labels 2 \
          --img_h 384 --img_w 384 \
          --onnx_path segformer_fp.onnx \
          --smoke_test

2) From a local fine-tuned HF folder (no .pth):
   python export_onnx.py --hf_src ./my_segformer --num_labels 2 --onnx_path segformer_fp.onnx

3) Fixed-shape graph (some runtimes prefer static input dims):
   python export_onnx.py --hf_src ... --ckpt ... --no_dynamic --img_h 384 --img_w 384

Notes
- Preprocess outside the ONNX graph: resize/pad, normalize to ImageNet stats, NCHW float32.
- Output is logits of shape (B, num_labels, h, w). Do argmax over channel dim. Upsample if needed.
"""

from pathlib import Path
import argparse
from typing import Optional

import torch
import torch.nn as nn

try:
    from transformers import SegformerForSemanticSegmentation
except Exception as e:
    raise ImportError("transformers is required. Install with: pip install transformers") from e


def build_model(model_name: str, num_labels: int) -> nn.Module:
    """
    Build SegFormer model from a HF id or local directory.
    """
    model = SegformerForSemanticSegmentation.from_pretrained(
        model_name,
        num_labels=num_labels,
        ignore_mismatched_sizes=True,   # handy if your head size differs at load-time
    )
    return model


class Wrapper(nn.Module):
    """
    Simple wrapper so ONNX sees a clean tensor-in/tensor-out signature.
    Returns raw logits (B, C, h, w).
    """
    def __init__(self, m: nn.Module):
        super().__init__()
        self.m = m

    def forward(self, pixel_values: torch.Tensor):
        out = self.m(pixel_values=pixel_values)
        return out.logits


def _load_state_dict(state_path: Path):
    state = torch.load(state_path, map_location="cpu")
    if isinstance(state, dict) and "model" in state and isinstance(state["model"], dict):
        return state["model"]
    if isinstance(state, dict):
        return state
    raise ValueError(f"Unsupported checkpoint format at {state_path}")


def export_onnx(
    hf_src: str,
    ckpt_path: Optional[str],
    onnx_path: str,
    img_h: int,
    img_w: int,
    num_labels: int,
    opset: int,
    dynamic: bool,
    smoke_test: bool,
) -> None:
    # Always export on CPU for portability (avoid CUDA-only ops creeping in)
    device = torch.device("cpu")

    # 1) Build base model and load checkpoint if provided
    model = build_model(hf_src, num_labels=num_labels).to(device).eval()
    if ckpt_path:
        sd = _load_state_dict(Path(ckpt_path))
        missing, unexpected = model.load_state_dict(sd, strict=False)
        if missing:
            print(f"[WARN] Missing keys in state_dict ({len(missing)}): {missing[:8]}{' ...' if len(missing)>8 else ''}")
        if unexpected:
            print(f"[WARN] Unexpected keys in state_dict ({len(unexpected)}): {unexpected[:8]}{' ...' if len(unexpected)>8 else ''}")

    wrapped = Wrapper(model).to(device).eval()

    # 2) Dummy input (match your preprocessed tensor: BCHW float32)
    dummy = torch.randn(1, 3, img_h, img_w, dtype=torch.float32, device=device)

    # 3) Dynamic axes (default) or fixed-shape
    dynamic_axes = None
    if dynamic:
        dynamic_axes = {
            "pixel_values": {0: "batch", 2: "height", 3: "width"},
            "logits":       {0: "batch", 2: "height", 3: "width"},
        }

    # 4) Export
    onnx_path = str(onnx_path)
    torch.onnx.export(
        wrapped,
        (dummy,),
        onnx_path,
        input_names=["pixel_values"],
        output_names=["logits"],
        opset_version=opset,
        do_constant_folding=True,
        dynamic_axes=dynamic_axes,
    )
    print(f"[ONNX] Exported to: {onnx_path}")

    # 5) Validate with onnx
    try:
        import onnx
        m = onnx.load(onnx_path)
        onnx.checker.check_model(m)
        print("[ONNX] Model check: OK")
    except Exception as e:
        print(f"[ONNX] Checker warning: {e}")

    # 6) Optional ONNX Runtime smoke test
    if smoke_test:
        try:
            import onnxruntime as ort
            providers = ["CPUExecutionProvider"]
            # Prefer GPU if available, fall back to CPU
            try:
                sess = ort.InferenceSession(onnx_path, providers=["CUDAExecutionProvider"] + providers)
            except Exception:
                sess = ort.InferenceSession(onnx_path, providers=providers)
            outs = sess.run(None, {"pixel_values": dummy.numpy()})
            print("[ONNX] Smoke test output shape:", outs[0].shape)
        except Exception as e:
            print(f"[ONNX] Smoke test skipped: {e}")


def parse_args():
    ap = argparse.ArgumentParser(description="Export SegFormer to ONNX (standalone).")
    ap.add_argument("--hf_src", default="nvidia/segformer-b1-finetuned-ade-512-512",
                    help="HF model id or local fine-tuned directory.")
    ap.add_argument("--ckpt", default=None,
                    help="Optional path to .pth/.pt (state_dict or {'model': state_dict}).")
    ap.add_argument("--onnx_path", default="segformer.onnx", help="Output ONNX file path.")
    ap.add_argument("--num_labels", type=int, default=2, help="Number of classes in your head.")
    ap.add_argument("--img_h", type=int, default=384, help="Dummy input height (preprocessed).")
    ap.add_argument("--img_w", type=int, default=384, help="Dummy input width (preprocessed).")
    ap.add_argument("--opset", type=int, default=17, help="ONNX opset (>=17 recommended).")
    ap.add_argument("--no_dynamic", action="store_true",
                    help="Disable dynamic batch/H/W; export a fixed-shape graph.")
    ap.add_argument("--smoke_test", action="store_true",
                    help="Run a quick ONNX Runtime inference check.")
    return ap.parse_args()


def main():
    args = parse_args()
    export_onnx(
        hf_src=args.hf_src,
        ckpt_path=args.ckpt,
        onnx_path=args.onnx_path,
        img_h=args.img_h,
        img_w=args.img_w,
        num_labels=args.num_labels,
        opset=args.opset,
        dynamic=(not args.no_dynamic),
        smoke_test=args.smoke_test,
    )


if __name__ == "__main__":
    main()
