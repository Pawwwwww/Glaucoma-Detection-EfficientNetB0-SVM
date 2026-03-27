from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os

from preprocessor import preprocess_image
from quality_check import compute_quality_score
from predictor import load_cnn, load_svm, predict, generate_gradcam, get_saran, DEVICE

app = FastAPI(title="Glaucoma GON Detection API")

# ── CORS — izinkan React frontend ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:5173", "http://localhost:3000"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Load model saat startup ───────────────────────────────
SVM_PATH = "models/best_svm.pkl"

cnn_model    = load_cnn(DEVICE)

if os.path.exists(SVM_PATH):
    svm_pipeline = load_svm(SVM_PATH)
    print("✅ SVM Model loaded!")
else:
    svm_pipeline = None
    print(f"❌ Error: {SVM_PATH} not found!")


@app.get("/")
def root():
    return {"message": "Glaucoma GON Detection API is running!"}


@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):

    # ── 0. Cek SVM loaded ────────────────────────────────
    if svm_pipeline is None:
        raise HTTPException(
            status_code = 500,
            detail      = "Model belum siap. Hubungi administrator."
        )

    # ── 1. Validasi ukuran file ───────────────────────────
    MAX_SIZE  = 10 * 1024 * 1024
    img_bytes = await file.read()

    if len(img_bytes) > MAX_SIZE:
        raise HTTPException(
            status_code = 400,
            detail      = "Ukuran file melebihi 10MB. Silakan upload ulang."
        )

    # ── 2. Validasi format file ───────────────────────────
    allowed = ["image/jpeg", "image/jpg", "image/png"]
    if file.content_type not in allowed:
        raise HTTPException(
            status_code = 400,
            detail      = "Format file tidak didukung. Gunakan JPG atau PNG."
        )

    # ── 3. Hitung Quality Score ───────────────────────────
    qs = compute_quality_score(img_bytes)

    if qs < 5.0:
        raise HTTPException(
            status_code = 422,
            detail      = f"Image quality is too low (QS: {qs:.1f}). "
                           f"Ensure the image is not blurry and lighting is sufficient."
        )

    # ── 4. Preprocessing ──────────────────────────────────
    try:
        tensor, img_rgb = preprocess_image(img_bytes)
    except Exception as e:
        raise HTTPException(
            status_code = 500,
            detail      = f"Preprocessing gagal: {str(e)}"
        )

    # ── 5. Prediksi ───────────────────────────────────────
    try:
        result = predict(cnn_model, svm_pipeline, tensor)
    except Exception as e:
        raise HTTPException(
            status_code = 500,
            detail      = f"Prediksi gagal: {str(e)}"
        )

    # ── 6. Grad-CAM ───────────────────────────────────────
    label_int   = 1 if result["label"] == "GON+" else 0
    gradcam_b64 = generate_gradcam(cnn_model, tensor, img_rgb, label_int)

    # ── 7. Saran ─────────────────────────────────────────
    saran = get_saran(result["label"], result["confidence"])

    return JSONResponse({
        "label"         : result["label"],
        "confidence"    : result["confidence"],
        "prob_gon_plus" : result["prob_gon_plus"],
        "prob_gon_minus": result["prob_gon_minus"],
        "quality_score" : qs,
        "gradcam_image" : gradcam_b64,
        "saran"         : saran,
    })


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)