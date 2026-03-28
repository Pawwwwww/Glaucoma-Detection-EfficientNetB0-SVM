# 🤖 ***Machine Learning Pipeline***

> This folder contains the complete ML pipeline for the **IDSC 2026** competition.  
> The goal is to classify retinal fundus images as **GON+** (Glaucoma) or **GON-** (Normal) using a quality-aware deep learning approach.

---

## 📋 ***Table of Content***

### 🔹 Overview
- 📦 [Dataset](#-dataset)
- 🧰 [Tech Stack](#-tech-stack)
- ⚙️ [How To Run](#-how-to-run)

### 🔹 Pipeline
- 🔄 [Pipeline Overview](#-pipeline-overview)
  - 1️⃣ [EDA](#1%EF%B8%8F⃣-eda)
  - 2️⃣ [Preprocessing](#2%EF%B8%8F⃣-preprocessing)
  - 3️⃣ [Modeling & Evaluation](#3%EF%B8%8F⃣-modeling--evaluation)

### 🔹 Result
- 📊 [Model Results](#-model-results)
- 📁 [Folder Structure](#-folder-structure)

---

## 📦 ***Dataset***

| Item | Detail |
|------|--------|
| **Competition** | IDSC 2026 |
| **Task** |  Glaucoma Detection |
| **Label** | `GON+` (Glaucoma) , `GON-` (Normal) |
| **Quality Score** | Scale 1–10, computed using FundusQ-Net |
| **Kolom** | `Image Name`, `Patient`, `Label`, `Quality Score` |

```
MyDrive/IDSC 2026/
├── Dataset/
│   ├── Images/                        ← original fundus image
│   ├── Images_Filtered/               ← QS Filtering Result >= 4.0
│   ├── Labels.csv                     ← original label
│   └── Labels_Filtered.csv            ← filtered label
│
├── Preprocessing/
│   ├── 1. Resize/Resize 224x224/
│   ├── 1.5. Circle Crop/Crop 224x224/
│   ├── 2. Ben Graham/BG 224x224/
│   └── 3. CLAHE/CLAHE 224x224/        ← ✅ input modeling
│
├── Features/                          ← feature .npy per fold (auto-generated)
└── Output_CNN_SVM/sigmoid/            ← model .pkl & evaluate result
```

---

## 🧰 ***Tech Stack***

| Category | Library |
|----------|---------|
| **Deep Learning** | `PyTorch` · `timm` |
| **Image Processing** | `OpenCV` · `Pillow` |
| **Data** | `Pandas` · `NumPy` |
| **Visualization** | `Matplotlib` · `Seaborn` |
| **ML** | `Scikit-learn` (SVM, StratifiedGroupKFold) |
| **Export** | `openpyxl` (Excel report) |
| **Environment** | Google Colab + Google Drive |

---

## ▶️ ***How To Run***

1. Clone or open this folder in **Google Colab**
2. Enable GPU: **Runtime → Change runtime type → T4 GPU (For good experience)**
3. Run each notebook **in order** following the pipeline below
4. Adjust dataset paths at the top of each notebook:

```python
IMAGE_DIR = '/content/drive/MyDrive/IDSC 2026/...'
CSV_PATH  = '/content/drive/MyDrive/IDSC 2026/Dataset/Labels.csv'
SAVE_DIR  = '/content/drive/MyDrive/IDSC 2026/...'
```

> ⚠️ Each stage depends on the output of the previous stage. Do **not** skip steps.

---

## 🔄 ***Pipeline Overview***

```
Labels.csv + Images/
       │
       ▼
┌──────────────────────────────────────┐
│  1️⃣  EDA                             │
│  Distribusi label, quality score,    │
│  konsistensi pasien, ukuran gambar   │
└──────────────────┬───────────────────┘
                   │  Threshold QS = 4.0
                   ▼
┌──────────────────────────────────────┐
│  2️⃣  Preprocessing                   │
│  Filter → Resize → Circle Crop       │
│  → Ben Graham → CLAHE                │
└──────────────────┬───────────────────┘
                   │  CLAHE 224x224/ ✅
                   ▼
┌──────────────────────────────────────┐
│  3️⃣  Modeling & Evaluation           │
│  Stratified Group K-Fold (K=5)       │
│  CNN Frozen + SVM (3 backbone)       │
│  → Evaluasi → Export Excel           │
└──────────────────────────────────────┘
```

---

### **1️⃣ EDA**
📂 `01 Exploratory Dataset Analysis (EDA)/` · 📄 [`README`](01-Exploratory-Dataset-Analysis-(EDA)/EDA_README.md)

Exploratory analysis to understand the dataset **before** any modification.

| Analisis | Detail |
|----------|--------|
| 📊 Dataset Overview | Shape, missing values, tipe data, statistik deskriptif |
| 🏷️ Label Distribution | Class balance `GON+` vs `GON-` |
| 👤 Patient Analysis | Number of images per patient and label consistency per patient |
| ⭐ Quality Score | Quality Score (QS) distribution, correlation with labels, and threshold simulation (3.0–6.0) |
| 🖼️ Image Analysis | Image size analysis, visual samples per label, and comparison of low vs high QS |

**Key output:** Optimal Quality Score threshold: ≥ 4.0 and defined preprocessing strategy based on data quality and distribution.

---

### **2️⃣ Preprocessing**
📂 `02 Preprocessing/` · 📄 [`README`](02-Preprocessing/Preprocessing_README.md)

Sequential 4-step image processing pipeline sebelum masuk modeling.

| Step | Proses | Output Folder |
|------|--------|---------------|
| 🧹 QS Filtering | Remove images with Quality Score (QS) < 4.0 | `Images_Filtered/` |
| 📏 Resize | `224×224` with  LANCZOS | `1. Resize/Resize 224x224/` |
| ✂️ Circle Crop | Remove black background outside the retinal region | `1.5. Circle Crop/Crop 224x224/` |
| 🔆 Ben Graham | Local contrast enhancement (sigmaX=30) | `2. Ben Graham/BG 224x224/` |
| 🎨 CLAHE | Green channel equalization (clipLimit=2.0) | `3. CLAHE/CLAHE 224x224/` ✅ |

**Key output:** `CLAHE 224x224/` — cleaned and standardized images ready for model input.

---

### **3️⃣ Modeling & Evaluation**
📂 `03. Model and Evaluation/` · 📄 [`README`](03.-Model-and-Evaluation/Model_README.md)

Three CNN backbones are used as **frozen feature extractors**, combined with an **SVM classifier**, and evaluated using **5-Fold Cross Validation** with patient-level data leakage prevention.

#### Backbone

| Backbone | Feature Dim | Warna |
|----------|-------------|-------|
| 🔵 **EfficientNet-B0** | 1.280 | Blue |
| 🟢 **EfficientNet-B3** | 1.536 | Green |
| 🔴 **ResNet-50** | 2.048 | Red |

#### Configuration

| Komponen | Detail |
|----------|--------|
| **Split** | `StratifiedGroupKFold` K=5, group by `Patient` |
| **Augmentasi** | RandomRotation(15°) + ColorJitter — 2 augmentations per training image |
| **Classifier** | `SVM` — kernel Sigmoid, C=1.0 |
| **Scaler** | `StandardScaler` |
| **Metrik** | Accuracy, Sensitivity, Specificity, AUC-ROC |

**Key output:** Model `.pkl` per fold + evaluation report `.xlsx`.

---

## 📊 ***Model Results***

> *Update this table after training is complete.*

| Model | Accuracy | Sensitivity | Specificity | AUC | Time |
|--------|------------|---------------|--------------|------|--------|
| 🔵 EfficientNet-B0 + SVM | **95.23%** | **97.05%** | **90.73%** | **98.27%** |**2353.15s**|
| 🟢 EfficientNet-B3 + SVM | 94.93% | 96.94% | 89.95% | 98.08% |2501.19s|
| 🔴 ResNet-50 + SVM | 94.29% | 95.83% | 89.86% | 98.14% | 2563.09s|

---

## 📁 ***Folder Structure***

```
ml/
├── 01 Exploratory Dataset Analysis (EDA)/
│   ├── Exploratory_Dataset_Analysis.ipynb
│   └── EDA_README.md
│
├── 02. Preprocessing/
│   ├── Preprocessing.ipynb
│   └── Preprocessing_README.md
│
├── 03. Model and Evaluation/
│   ├── Model_and_evaluation.ipynb
│   └── ModelEval_README.md
│
└── README.md                          ← now u are here
```

---

<p align="center">
  <b>IDSC 2026</b> · Glaucoma Detection Pipeline
</p>
