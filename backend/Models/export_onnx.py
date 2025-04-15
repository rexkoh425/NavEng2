import torch, onnx
import segmentation_models_pytorch as smp

CKPT = "artifacts_unet_r34_3c/unet_r34_3c_best.pth"
OUT  = "artifacts_unet_r34_3c/unet_r34_3c_512.onnx"

model = smp.Unet(encoder_name="resnet34", encoder_weights=None, in_channels=3, classes=3)
sd = torch.load(CKPT, map_location="cpu")["model"]
model.load_state_dict(sd, strict=True)
model.eval()

dummy = torch.randn(1,3,512,512, dtype=torch.float32)

torch.onnx.export(
    model, dummy, OUT,
    input_names=["input"], output_names=["logits"],
    opset_version=17, do_constant_folding=True,
    dynamic_axes=None
)

onnx_model = onnx.load(OUT)
onnx.checker.check_model(onnx_model)
print("Exported:", OUT)
