# 🔍 ***Exploratory Dataset Analysis***

> This notebook represents the first stage of the ML pipeline for IDSC 2026.  
> Its purpose is to gain a comprehensive understanding of the dataset before proceeding to preprocessing and training.

---

## 📋 ***Table of Content***

> Quick navigation to each section of the analysis

### 🔹 Dataset & Setup
- 📦 [Dataset Used](#-dataset-used)
- 🧰 [Libraries](#-libraries)
- ⚙️ [How To Run](#-how-to-run)

### 🔹 Analysis
- 🔍 [Workflow Analysis](#-workflow-analysis)
  - 1️⃣ [Dataset Overview](#1--dataset-overview)
  - 2️⃣ [Label Distribution](#2--label-distribution)
  - 3️⃣ [Patient Analysis](#3--patient-analysis)
  - 4️⃣ [Quality Score Analysis](#4--quality-score-analysis)
  - 5️⃣ [Image Analysis](#5--image-analysis)

### 🔹 Result
- 💡 [Findings and Insights](#-findings-and-insights)
- 🚀 [Output & Next Steps](#-output--next-steps)

---

## 📦 ***Dataset Used***

| Item | Detail |
|------|--------|
| **File label** | `Labels.csv` |
| **Folder gambar** | `Dataset/Images/` |
| **Kolom** | `Image Name`, `Patient`, `Label`, `Quality Score` |
| **Label target** | `GON+` (Glaucoma) , `GON-` (Normal) |
| **Quality Score** | Scale of 1–10, computed using FundusQ-Net |

```
MyDrive/IDSC 2026/Dataset/
├── Images/        ← # all fundus images
└── Labels.csv     ← # metadata, labels, and quality scores
```

---

## 🔧 ***Libraries***

```python
import cv2
import numpy as np
import pandas as pd
from PIL import Image
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import os, random
from google.colab import drive
```

---

## ▶️ ***How To Run***

1. Open the notebook in **Google Colab**
2. Enable GPU *(optional for EDA, but recommended for training stage)*
3. Adjust the dataset path in the **Mount & Load Dataset cell**:

```python
dataset    = pd.read_csv("/content/drive/MyDrive/IDSC 2026/Dataset/Labels.csv")
folder_gambar = "/content/drive/MyDrive/IDSC 2026/Dataset/Images"
```

4. Run all cells sequentially (**Runtime → Run all**)

---

## 🔄 ***Workflow Analysis***

### **1. 📊 Dataset Overview**

A general overview of the dataset before performing deeper analysis.

What is analyzed:
- Number of rows (images) and columns
- Data types of each column
- Missing values — checking for any incomplete data
- Descriptive statistics for `Patient` and `Quality Score`
- Total number of unique patients & average images per patient
- Verification that all image files exist in the directory

```
📐 Shape Dataset
   Baris (gambar)  : ...
   Kolom           : 4

📁 Cek File Gambar
   ✅ Semua file gambar tersedia
```

---

### **2. 🏷️ Label Distribution**

Analyze whether the dataset is **balanced** between `GON+` and `GON-`.

What is analyzed:
- Label distribution using `value_counts()`
- Bar chart visualization of label distribution

> ⚠️ If the distribution is highly imbalanced, techniques such as **class weighting** or **oversampling** may be required during training.

---

### **3. 👤 Patient Analysis**

Since a single patient can have multiple images, it is important to ensure data consistency:

#### *Image per Patient*
- Distribution of the number of images per patient
- Bar chart of image counts per patient

#### *Label Consistency per Patient*
Check whether any patient has conflicting labels across different images.

```
Pasien dengan label konsisten (1 label)      : ...
Pasien dengan label tidak konsisten (>1 label): ...
✅ Semua pasien hanya punya satu label — data konsisten.
```

> ⚠️ If inconsistencies are found, manual investigation is required before performing data splitting.

---

### **4. ⭐ Quality Score Analysis**

The Quality Score determines whether an image is suitable for training.

#### **Quality Score Statistics**
```
count   mean    std     min     25%     50%     75%     max
...
```

#### **Quality Score per Label**
- Boxplot of Quality Score for `GON+` vs `GON-`
- Histogram showing overlap of Quality Score per label
- Analyze whether there is any correlation between image quality and diagnosis

#### **Impact Simulation of Quality Score Threshold**

A table showing how many images remain after applying different Quality Score thresholds:

```
Threshold    Sisa Gambar    GON+     GON-     Rasio GON+/GON-
>= 3.0       ...
>= 3.5       ...
>= 4.0       ...            ← rekomendasi threshold
>= 4.5       ...
>= 5.0       ...
>= 5.5       ...
>= 6.0       ...
```

> 💡 Use this table to determine the optimal Quality Score threshold during preprocessing. Choose a threshold that retains sufficient data while maintaining class balance.  

---

### **5. 🖼️ Image Analysis**

#### **Image Size & Format**
- Color Mode (RGB)
- Image resolution (unifomrm of variying?)
- Distribution of unique image sizes

> ⚠️ If resolutions vary, images must be resized to a consistent size during preprocessing (`224×224` for EfficientNetB0 and ResNet50, then `300x300` for EfficientNetB3).

#### **Sample Visualization per Label**

A 2×5 grid displaying:
- Top row: 5 **GON+** (Glaucoma) images with their Quality Scores
- Bottom row: 5 **GON-** (Normal) images with their Quality Scores

#### **Low vs High Quality Score Comparison**

A 2×3 grid comparing:
- 3 images with the lowest Quality Scores → typically blurry, dark, or unclear
- 3 images with the highest Quality Scores → sharp and well-illuminated

> 🔎 This visualization helps provide an intuitive understanding of what the Quality Score represents in fundus images.

---

## 💡 ***Findings and Insights***

> *Fill this section after running the notebook on the actual dataset.*

Example format:

```
- Total gambar    : ...
- Total pasien    : ...
- Distribusi label: GON+ XX% | GON- XX% → [seimbang / tidak seimbang]
- QS rata-rata    : X.XX (std: X.XX)
- Threshold QS    : dipilih >= X.X (menyisakan ... gambar)
- Resolusi gambar : semua [seragam / bervariasi] → [perlu / tidak perlu] resize
- Konsistensi     : [semua konsisten / ada X pasien tidak konsisten]
```

---

## 📤 ***Output & Next Steps***

This EDA stage does not produce new files — it focuses purely on analysis and visualization.

**Decisions to Make Before Preprocessing:**

- [ ] Selected Quality Score threshold
- [ ] Image size standardization
- [ ] Data filtering strategy
- [ ] Data splitting strategy

**Next step →** [`02. Preprocessing/Preprocessing.ipynb`](../02.%20Preprocessing/Preprocessing.ipynb)

---

<p align="center">
  <b>IDSC 2026</b> · Glaucoma Detection Pipeline · EDA Stage
</p>
