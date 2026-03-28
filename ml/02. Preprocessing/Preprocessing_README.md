# ⚙️ ***Preprocessing***

> This notebook represents the second stage of the ML pipeline for IDSC 2026.  
> Its purpose is to **clean, filter, and prepare** fundus images before they are used in model training.

---

## 📋 ***Table of Content***

> Quick navigation to each section of the preprocessing pipeline

### 🔹 Dataset & Setup
- 📦 [Dataset Used](#-dataset-used)
- 🧰 [Libraries](#-libraries)
- ⚙️ [How To Run](#-how-to-run)

### 🔹 Pipeline
- 🔄 [Workflow Pipeline](#-workflow-pipeline)
  - 1️⃣ [Quality Score Filtering](#1--quality-score-filtering)
  - 2️⃣ [Resize](#2--resize)
  - 3️⃣ [Circle Crop](#3--circle-crop)
  - 4️⃣ [Ben Graham](#4--ben-graham)
  - 5️⃣ [CLAHE](#5--clahe)

### 🔹 Result
- ✅ [Verification](#-verification)
- 💡 [Findings and Insights](#-findings-and-insights)
- 🚀 [Output & Next Steps](#-output--next-steps)

---

## 📦 ***Dataset Used***

| Item | Detail |
|------|--------|
| **Input label** | `Labels.csv` |
| **Input images** | `Dataset/Images/` |
| **Output label** | `Labels_Filtered.csv` |
| **Output images** | `Dataset/Images_Filtered/` → lanjut ke tiap step preprocessing |
| **Label target** | `GON+` (Glaucoma) · `GON-` (Normal) |
| **Quality Score** | Scale of 1–10, computed using FundusQ-Net |

```
MyDrive/IDSC 2026/
├── Dataset/
│   ├── Images/                  ← original image
│   ├── Images_Filtered/         ← filtering image
│   ├── Labels.csv               ← original label
│   └── Labels_Filtered.csv      ← filtering label
│
└── Preprocessing/
    ├── 1. Resize/
    │   └── Resize 224x224/      ← resize result
    ├── 1.5. Circle Crop/
    │   └── Crop 224x224/        ← circle crop result
    ├── 2. Ben Graham/
    │   └── BG 224x224/          ← ben graham result 
    └── 3. CLAHE/
        └── CLAHE 224x224/       ← CLAHE result
```

---

## 🧰 ***Libraries***

```python
import cv2
import numpy as np
import pandas as pd
from PIL import Image
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
import os, shutil, random
from google.colab import drive
```

---

## ▶️ ***How To Run***

1. Open the notebook in **Google Colab**
2. Enable GPU *(optional for preprocessing, but recommended for training stage)*
3. Adjust the dataset path in the **Mount & Load Dataset cell**:

```python
dataset       = pd.read_csv("/content/drive/MyDrive/IDSC 2026/Dataset/Labels.csv")
folder_gambar = "/content/drive/MyDrive/IDSC 2026/Dataset/Images"
```

4. Run all cells sequentially (**Runtime → Run all**)

> ⚠️ Each preprocessing step depends on the output of the previous step. Make sure to run cells **in order**.

---

## 🔄 ***Workflow Pipeline***

```
Labels.csv + Images/
       │
       ▼
┌─────────────────────┐
│  1. QS Filtering    │  Threshold >= 4.0
└────────┬────────────┘
         │  Labels_Filtered.csv + Images_Filtered/
         ▼
┌─────────────────────┐
│  2. Resize          │  224×224 (LANCZOS)
└────────┬────────────┘
         │  Resize 224x224/
         ▼
┌─────────────────────┐
│  3. Circle Crop     │  Remove black background 
└────────┬────────────┘
         │  Crop 224x224/
         ▼
┌─────────────────────┐
│  4. Ben Graham      │  Enhance local contrast
└────────┬────────────┘
         │  BG 224x224/
         ▼
┌─────────────────────┐
│  5. CLAHE           │  Green channel enhancement
└────────┬────────────┘
         │  CLAHE 224x224/ ✅ Final output
         ▼
    Ready for Training
```

---

### **1. 🧹 Quality Score Filtering**

Filter images that do not meet the minimum quality standard.

| Parameter | Nilai |
|-----------|-------|
| **Threshold** | `Quality Score >= 4.0` |
| **Input** | `Labels.csv` + `Images/` |
| **Output** | `Labels_Filtered.csv` + `Images_Filtered/` |

Printed output:

```
==================================================
      🧹 FILTERING QUALITY SCORE >= 4.0
==================================================

📊 Ringkasan Filtering
   Dataset original  : ... gambar
   Dataset filtered  : ... gambar
   Gambar dibuang    : ... gambar
   Persentase tersisa: ...%

🏷️  Distribusi Label Setelah Filter
   GON+  ... gambar  (...%)  ████████████
   GON-  ... gambar  (...%)  ████████████

⭐ Quality Score Setelah Filter
   Min    : 4.00
   Max    : ...
   Mean   : ...
   Median : ...
```

> 💡 A threshold of 4.0 was selected based on the EDA simulation results — balancing between retaining sufficient data and ensuring acceptable image quality.

---

### **2. 📏 Resize**

Standardize all images to a fixed resolution:
`224×224` pixels for EfficientNet-B0 and ResNet50,
`300×300` pixels for EfficientNet-B3
| Parameter | Nilai |
|-----------|-------|
| **Target size** | `224 × 224` |
| **Metode** | `Image.LANCZOS` (best quality for downscaling) |
| **Input** | `Images_Filtered/` |
| **Output** | `Preprocessing/1. Resize/Resize 224x224/` |

Printed output:

```
==================================================
        📏 RESIZE 224x224 SELESAI
==================================================

   Target size  : (224, 224)
   ✅ Berhasil  : ... gambar
   ✅ Semua gambar ditemukan

   📁 Tersimpan di:
   .../Preprocessing/1. Resize/Resize 224x224
==================================================
   ✅ Resize selesai, siap Cropping!
==================================================
```

> ⚠️ LANCZOS is selected because it provides the highest quality when downscaling images, outperforming other methods such as `BILINEAR` and `NEAREST`.

---

### **3. ✂️ Circle Crop**

To remove irrelevant background, the area outside the retinal circle is cropped, eliminating unnecessary black regions

| Parameter | Nilai |
|-----------|-------|
| **Padding** | `5 piksel` |
| **Input** | `Resize 224x224/` |
| **Output** | `Preprocessing/1.5. Circle Crop/Crop 224x224/` |

How `circle_crop()` Works:
1. Convert the image to grayscale
2. Apply binary thresholding to detect non-black regions
3. Determine the retinal area using a bounding box with padding
4. Crop the image and resize it back to `224×224`

Printed output:

```
==================================================
        ✂️  CIRCLE CROP SELESAI
==================================================

   Input   : Resize 224x224
   ✅ Berhasil   : ... gambar
   ✅ Semua gambar berhasil diproses

   📁 Tersimpan di:
   .../Preprocessing/1.5. Circle Crop/Crop 224x224
==================================================
   ✅ Circle Crop selesai, siap Ben Graham!
==================================================
```

---

### **4. 🔆 Ben Graham**

A local contrast enhancement technique commonly used in retinal image datasets, popularized by `Kaggle Diabetic Retinopathy Competition`.

| Parameter | Nilai |
|-----------|-------|
| **Formula** | `addWeighted(img, 4, GaussianBlur(img, sigmaX=10), -4, 128)` |
| **sigmaX** | `10` |
| **Input** | `Circle Crop 224x224/` |
| **Output** | `Preprocessing/2. Ben Graham/BG 224x224/` |

How it Works:
- Gaussian blur is applied to estimate background illumination
- The blurred image is subtracted from the original → retaining only local details
- A constant value (128) is added to keep pixel values within the range of 0–255

Printed output:

```
==================================================
        🔆 BEN GRAHAM SELESAI
==================================================

   Input   : Circle Crop 224x224
   ✅ Berhasil   : ... gambar
   ✅ Semua gambar berhasil diproses

   📁 Tersimpan di:
   .../Preprocessing/2. Ben Graham/BG 224x224
==================================================
   ✅ Ben Graham selesai, siap CLAHE!
==================================================
```

---

### **5. 🎨 CLAHE**

*Contrast Limited Adaptive Histogram Equalization* — A technique to enhance local contrast while preventing excessive noise amplification.

| Parameter | Nilai |
|-----------|-------|
| **clipLimit** | `2.0` |
| **tileGridSize** | `(8, 8)` |
| **Channel** | Green channel only  |
| **Input** | `Ben Graham BG 224x224/` |
| **Output** | `Preprocessing/3. CLAHE/CLAHE 224x224/` ✅ |

How it Works
1. Convert image from BGR → RGB
2. Split into R, G, B channels
3. Apply CLAHE only to the **Green channel**
4. Merge channels → convert RGB → BGR → save image

Printed output:

```
==================================================
        🎨 CLAHE SELESAI
==================================================

   Input      : Ben Graham 224x224
   Mode       : Green Channel
   clipLimit  : 2.0
   tileGrid   : (8, 8)

   ✅ Berhasil : ... gambar
   ✅ Semua gambar berhasil diproses

   📁 Tersimpan di:
   .../Preprocessing/3. CLAHE/CLAHE 224x224
==================================================
   ✅ CLAHE selesai, preprocessing done!
==================================================
```

> 💡 The green channel is selected because retinal blood vessels exhibit the highest contrast against the background in the green channel compared to the red or blue channels.

---

## ✅ ***Verification***

After completing all preprocessing steps, the notebook performs a final verification: 

### File Count Check per Folder

```
=======================================================
        ✅ VERIFIKASI HASIL PREPROCESSING
=======================================================

📁 Jumlah File per Folder
   ✅ Original (Filtered)      : ... gambar
   ✅ 1. Resize 224x224        : ... gambar
   ✅ 2. Circle Crop           : ... gambar
   ✅ 3. Ben Graham            : ... gambar
   ✅ 4. CLAHE                 : ... gambar
```

> ⚠️ If the number of images is inconsistent across folders, it indicates that some images may have failed during one of the processing steps.

### Before vs After Visualization (3 Samples)

A `1×5` grid is displayed for each sample, showing the transformation of the image across each processing stage:

| Kolom | Warna Label | Isi |
|-------|-------------|-----|
| Original | 🟠 Orange | Image after Quality Score filtering |
| Resize 224 | 🔵 Blue | Image after resizing |
| Circle Crop | 🩷 Pink | Background removed (retinal area focused) |
| Ben Graham | 🟡 Yellow | After local contrast enhancement |
| CLAHE | 🟢 Green | Final preprocessed image |

---

## 💡 ***Findings and Insights***

> *Fill this section after running the notebook on the actual dataset.*

Example format:

```
- Gambar original        : ...
- Gambar setelah filter  : ... (QS >= 4.0)
- Gambar dibuang         : ... (...%)
- Distribusi label akhir : GON+ ...% | GON- ...% → [seimbang / tidak seimbang]
- Ukuran output          : semua 224×224 piksel
- Circle Crop            : ... gambar berhasil diproses
- Ben Graham             : ... gambar berhasil diproses
- CLAHE                  : ... gambar berhasil diproses
- Konsistensi folder     : [semua jumlah sama / ada ketidaksesuaian]
```

---

## 📤 ***Output & Next Steps***

The following files are generated after completing the preprocessing stage:

```
Dataset/
└── Labels_Filtered.csv          ← CSV containing images with QS >= 4.0

Preprocessing/
├── 1. Resize/Resize 224x224/    ←  resized images
├── 1.5. Circle Crop/Crop 224x224/  ← cropped retinal images
├── 2. Ben Graham/BG 224x224/    ← contrast-enhanced images
└── 3. CLAHE/CLAHE 224x224/      ← ✅ FINAL — input for training
```

**Decisions to Make Before Training:**

- [ ] Verify the final number of images in the `CLAHE_224x224/` folder
- [ ] Define the data splitting strategy (Train / Validation / Test)
- [ ] Determine whether additional augmentation is needed during training
- [ ] Check class balance after filtering → apply class weighting if necessary

**Next step →** [`03. Model and Evaluation/Model_and_evaluation.ipynb`](../03.-Model-and-Evaluation/Model_and_evaluation.ipynb)

---

<p align="center">
  <b>IDSC 2026</b> · Glaucoma Detection Pipeline · Preprocessing Stage
</p>
