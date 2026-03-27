import cv2
import numpy as np

def compute_quality_score(img_bytes: bytes) -> float:
    nparr = np.frombuffer(img_bytes, np.uint8)
    img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return 0.0

    # Resize untuk konsistensi
    img = cv2.resize(img, (224, 224))

    # 1. Laplacian variance — deteksi blur
    gray      = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F).var()

    # 2. Brightness mean
    brightness = img.mean()

    # Normalisasi ke skala 0-10
    # Laplacian tinggi = gambar tajam = kualitas baik
    lap_score   = min(laplacian / 100, 1.0)       # cap di 1.0
    bright_score = 1.0 if 50 < brightness < 200 else 0.5

    qs = (lap_score * 0.7 + bright_score * 0.3) * 10
    return round(float(qs), 2)  # type: ignore[call-overload]
