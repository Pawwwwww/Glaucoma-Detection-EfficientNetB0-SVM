import torch
import timm
import joblib
import numpy as np
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
import base64
import cv2

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── Load CNN frozen — tidak perlu .pth ───────────────────
def load_cnn(device):
    backbone = timm.create_model(
        "efficientnet_b0",
        pretrained  = True,   # ← ImageNet weights langsung
        num_classes = 0       # ← feature extractor mode, bukan classifier
    )
    for param in backbone.parameters():
        param.requires_grad = False
    backbone.eval()
    print(f"✅ CNN loaded — frozen ImageNet weights")
    return backbone.to(device)

# ── Load SVM ─────────────────────────────────────────────
def load_svm(pkl_path: str):
    pipeline = joblib.load(pkl_path)
    print(f"✅ SVM loaded — {pkl_path}")
    return pipeline

# ── Ekstrak fitur dari CNN ────────────────────────────────
@torch.no_grad()
def extract_features(model, tensor):
    inp      = tensor.unsqueeze(0).to(DEVICE)
    features = model(inp)           # ← langsung call model, bukan forward_features
    return features.cpu().numpy()  # shape: (1, 1280)

# ── Prediksi ─────────────────────────────────────────────
def predict(model, svm_pipeline, tensor):
    features = extract_features(model, tensor)

    pred  = svm_pipeline.predict(features)[0]
    proba = svm_pipeline.predict_proba(features)[0]

    label         = "GON+" if pred == 1 else "GON-"
    confidence    = float(proba[pred])
    prob_gon_plus = float(proba[1])

    return {
        "label"         : label,
        "confidence"    : round(confidence * 100, 2),
        "prob_gon_plus" : round(prob_gon_plus * 100, 2),
        "prob_gon_minus": round((1 - prob_gon_plus) * 100, 2),
    }

# ── Grad-CAM ─────────────────────────────────────────────
def generate_gradcam(model, tensor, img_rgb, label):
    try:
        # Sementara enable grad untuk Grad-CAM
        model.train()
        for param in model.parameters():
            param.requires_grad = True

        target_layers = [model.conv_head]
        cam           = GradCAM(model=model, target_layers=target_layers)
        inp           = tensor.unsqueeze(0).to(DEVICE)
        targets       = [ClassifierOutputTarget(label)]
        grayscale_cam = cam(input_tensor=inp, targets=targets)[0]

        # Kembalikan ke frozen eval mode
        model.eval()
        for param in model.parameters():
            param.requires_grad = False

        img_norm  = img_rgb.astype(np.float32) / 255.0
        cam_image = show_cam_on_image(img_norm, grayscale_cam, use_rgb=True)

        _, buffer  = cv2.imencode(
            ".jpg", cv2.cvtColor(cam_image, cv2.COLOR_RGB2BGR))
        b64_string = base64.b64encode(buffer).decode("utf-8")
        return b64_string

    except Exception as e:
        print(f"⚠️ Grad-CAM gagal: {e}")
        # Pastikan model kembali ke eval frozen meski error
        model.eval()
        for param in model.parameters():
            param.requires_grad = False
        return None

# ── Saran ────────────────────────────────────────────────
def get_saran(label: str, confidence: float) -> str:
    if label == "GON+":
        if confidence >= 85:
            return ("Hasil menunjukkan indikasi kuat Glaucomatous Optic Neuropathy (GON+). "
                    "Segera konsultasikan dengan dokter spesialis mata untuk pemeriksaan "
                    "lebih lanjut seperti OCT dan perimetri.")
        else:
            return ("Hasil menunjukkan kemungkinan GON+, namun confidence masih moderat. "
                    "Disarankan untuk melakukan pemeriksaan ulang dengan gambar berkualitas "
                    "lebih baik dan konsultasi ke dokter mata.")
    else:
        if confidence >= 85:
            return ("Hasil tidak menunjukkan indikasi GON. Tetap lakukan pemeriksaan "
                    "mata rutin setiap 1-2 tahun untuk memantau kesehatan retina.")
        else:
            return ("Hasil menunjukkan kemungkinan tidak ada GON, namun confidence masih "
                    "moderat. Tetap disarankan konsultasi ke dokter mata untuk konfirmasi.")