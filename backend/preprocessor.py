import cv2
import numpy as np
import torchvision.transforms as T
from PIL import Image

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

to_tensor_norm = T.Compose([
    T.ToTensor(),
    T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
])

def preprocess_image(img_bytes: bytes, img_size=224, sigma=30):
    # Decode bytes
    nparr   = np.frombuffer(img_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise ValueError("Gambar tidak bisa dibaca")

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    h, w    = img_rgb.shape[:2]

    # ── 1. Circle Crop ───────────────────────────────────
    gray    = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    _, mask = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY)
    coords  = cv2.findNonZero(mask)
    if coords is not None:
        x, y, cw, ch = cv2.boundingRect(coords)
        pad  = 5
        x1   = max(0, x - pad)
        y1   = max(0, y - pad)
        x2   = min(w, x + cw + pad)
        y2   = min(h, y + ch + pad)
        img_rgb = img_rgb[y1:y2, x1:x2]

    # ── 2. Ben Graham ────────────────────────────────────
    img_float = img_rgb.astype(np.float32)
    blur      = cv2.GaussianBlur(img_float, (0, 0), sigmaX=sigma)
    img_bg    = cv2.addWeighted(img_float, 4, blur, -4, 128)
    img_bg    = np.clip(img_bg, 0, 255).astype(np.uint8)

    # ── 3. CLAHE channel Green ───────────────────────────
    clahe   = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    r, g, b = cv2.split(img_bg)
    g_clahe = clahe.apply(g)
    img_enh = cv2.merge([r, g_clahe, b])

    # ── 4. Resize ────────────────────────────────────────
    img_resized = cv2.resize(
        img_enh, (img_size, img_size),
        interpolation=cv2.INTER_AREA
    )

    # ── 5. Normalize → Tensor ────────────────────────────
    pil_img = Image.fromarray(img_resized)
    tensor  = to_tensor_norm(pil_img)

    return tensor, img_resized