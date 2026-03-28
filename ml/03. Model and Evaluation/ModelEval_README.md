# 🤖 ***Modeling & Evaluation***

> This notebook represents the third and final stage of the ML pipeline for IDSC 2026.  
> Its purpose is to **train and evaluate** three CNN + SVM pipelines for classifying retinal fundus images as **GON+** (Glaucoma) or **GON-** (Normal).

---

## 📋 ***Table of Content***

> Quick navigation to each section

### 🔹 Dataset & Setup
- 📦 [Dataset Used](#-dataset-used)
- 🧰 [Libraries](#-libraries)
- ⚙️ [How To Run](#-how-to-run)

### 🔹 Pipeline
- 🔄 [Workflow Pipeline](#-workflow-pipeline)
  - 1️⃣ [Splitting Dataset](#1%EF%B8%8F⃣-splitting-dataset)
  - 2️⃣ [Dataset & Augmentasi](#2%EF%B8%8F⃣-dataset--augmentasi)
  - 3️⃣ [Feature Extractor](#3%EF%B8%8F⃣-feature-extractor)
  - 4️⃣ [SVM Classifier](#4%EF%B8%8F⃣-svm-classifier)
  - 5️⃣ [Evaluasi & Export](#5%EF%B8%8F⃣-evaluasi--export)

### 🔹 Result
- 💡 [Findings and Insights](#-findings-and-insights)
- 🚀 [Output & Next Steps](#-output--next-steps)

---

## 📦 ***Dataset Used***

| Item | Detail |
|------|--------|
| **Input images** | `Preprocessing/3. CLAHE/CLAHE 224x224/` |
| **Input label** | `Dataset/Labels_Filtered.csv` |
| **Label target** | `GON+` (Glaucoma) · `GON-` (Normal) |
| **Kolom kunci** | `Image Name`, `Patient`, `label_enc` |
| **Split strategy** | Stratified Group K-Fold (K=5) |

```
MyDrive/IDSC 2026/
├── Preprocessing/
│   └── 3. CLAHE/CLAHE 224x224/   ← image input  ✅
├── Dataset/
│   └── Labels_Filtered.csv        ← label input ✅
├── Features/                      ← .npy features per fold(auto-generated)
└── Output_CNN_SVM/sigmoid/        ← model output and evaluation
```

---

## 🧰 ***Libraries***

```python
import torch, timm                             # deep learning & backbone
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T
import cv2, numpy as np, pandas as pd          # image processing & data
from PIL import Image
from sklearn.svm import SVC                    # classifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.metrics import roc_auc_score, accuracy_score, confusion_matrix
import openpyxl                                # export result to Excel
import matplotlib.pyplot as plt
import pickle, time, os, warnings
```

---

## ▶️ ***How To Run***

1. Open the notebook in **Google Colab**
2. Enable GPU: **Runtime → Change runtime type → T4 GPU (For Good Experience)**
3. Adjust the dataset path in the **Mount & Load Dataset cell**:

```python
IMAGE_DIR = "/content/drive/MyDrive/IDSC 2026/Preprocessing/3. CLAHE/CLAHE 224x224"
CSV_PATH  = "/content/drive/MyDrive/IDSC 2026/Dataset/Labels_Filtered.csv"
SAVE_DIR  = "/content/drive/MyDrive/IDSC 2026/Features"
```

4. Run all cells sequentially (**Runtime → Run all**)

> ⚠️ This notebook requires the output from the **Preprocessing stage** (`CLAHE 224x224/` and `Labels_Filtered.csv`). Make sure the preprocessing has been completed before running this notebook.

---

## 🔄 ***Workflow Pipeline***

```
CLAHE 224x224/ + Labels_Filtered.csv
         │
         ▼
┌──────────────────────────────────┐
│  1️⃣  Splitting Dataset           │  Stratified Group K-Fold (K=5)
│      Cek data leakage per fold   │
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│  2️⃣  Dataset & Augmentation        │  Preprocessing inline + Random Augmentation
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐   ┌──────────────────┐   ┌──────────────┐
│  3️⃣  Feature Extractor           │   │  🔵 EfficientNet │   │  🔴 ResNet   │
│      CNN Frozen (3 backbone)     ├──►│     B0 & B3      │   │     50       │
└─────────────┬────────────────────┘   └──────────────────┘   └──────────────┘
              │  Features .npy per fold
              ▼
┌──────────────────────────────────┐
│  4️⃣  SVM Classifier              │  StandardScaler + SVM (Sigmoid, C=1)
│      5-Fold CV per backbone      │  Save .pkl per fold
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│  5️⃣  Evaluation & Export           │  Confusion Matrix + Excel Report
└──────────────────────────────────┘
```

---

### **1️⃣ Splitting Dataset**

The dataset was divided using **Stratified Group K-Fold** to ensure:
- The distribution of the `GON+` / `GON-` tables is balanced in each fold.
- Images from the **same patient are not spread** in train and test (not data leakage)

| Parameter | Value |
|-----------|-------|
| **Metode** | `StratifiedGroupKFold` |
| **K** | `5` |
| **Group** | `Patient` (patient ID column) |
| **Random State** | `42` |

Output printed:

```
=================================================================
     🔀 STRATIFIED GROUP K-FOLD  —  K = 5
=================================================================

Fold   Train    Test    GON+ Tr    GON- Tr   GON+ Test   GON- Test
-----------------------------------------------------------------
0       ...     ...       ...        ...        ...        ...
...
-----------------------------------------------------------------

=======================================================
     🔍 CHECK LEAKAGE DATA BETWEEN FOLDS
=======================================================
   Fold 0 : ✅ Safe
   Fold 1 : ✅ Safe
   ...
-------------------------------------------------------
🎉 All folds are safe!
```

> ⚠️ If a patient appears in both train and test, the model will overfit because it is learning patterns from the same patient. `StratifiedGroupKFold` prevents this.

---

### **2️⃣ Dataset & Augmentation**

#### Preprocessing Inline (`preprocess_fundus`)

Each image is reprocessed in real-time as it is loaded, with the same pipeline as the Preprocessing stage:

| Step | Process |
|------|--------|
| ✂️ Circle Crop | retina bounding box detection, remove black background (pad=5) |
| 🔆 Ben Graham | `addWeighted(img, 4, GaussianBlur(sigmaX=30), -4, 128)` |
| 🎨 CLAHE | Green channel, clipLimit=2.0, tileGridSize=(8,8) |
| 📏 Resize | `224×224` (INTER_AREA) |

#### Augmentation

Augmentation is only applied to **training data**, not testing.

| Augmentation | Parameter |
|------------|-----------|
| `RandomRotation` | degrees=15 |
| `ColorJitter` | brightness=0.3, contrast=0.3 |
| **Aug per citra** | 2 (1 original + 2 augmented = 3× data train) |

```
✅ Dataset class ready
   Aug per image : 2
   Total aug      : 1 original + 2 augmentation = 3 per image train
```

---

### **3️⃣ Feature Extractor**

The backbone CNN is used as a frozen feature extractor — all weights are locked, no fine-tuning is done. The backbone is only used to generate feature vectors from images.

| Backbone | Feature Dim | Colors |
|----------|-------------|-------|
| 🔵 **EfficientNet-B0** | 1.280 | Blue |
| 🟢 **EfficientNet-B3** | 1.536 | Green |
| 🔴 **ResNet-50** | 2.048 | Red |

Features are extracted per fold and saved as `.npy` files:

```
Features/
├── EfNetB0/
│   ├── fold_0/ → X_train.npy, y_train.npy, X_test.npy, y_test.npy
│   ├── fold_1/ → ...
│   └── fold_4/ → ...
├── EfNetB3/
│   └── fold_0~4/ → ...
└── ResNet50/
    └── fold_0~4/ → ...
```

Verification output:

```
=================================================================
      ✅ VERIFICATION EXTRACTION RESULT
=================================================================

  🔵 EfNetB0
    Fold 0 ✅ | Train (N, 1280) | Test (N, 1280)
    ...
  🟢 EfNetB3
    Fold 0 ✅ | Train (N, 1536) | Test (N, 1536)
    ...
  🔴 ResNet50
    Fold 0 ✅ | Train (N, 2048) | Test (N, 2048)
```

---

### **4️⃣ SVM Classifier**

Each backbone is paired with an **SVM classifier** using the `StandardScaler → SVC` pipeline.

| Parameter | Values |
|-----------|-------|
| **Kernel** | `Sigmoid` |
| **C** | `1.0` |
| **Gamma** | `scale` |
| **Probability** | `True` (for AUC) |

Pipeline per fold:
1. Extract train features → record `t_feat_train`
2. Extract test features → record `t_feat_test`
3. Fit SVM → record `t_svm_train`
4. Predict & calculate metrics

Output per fold:

```
  ── Fold 1/5 ─────────────────────────────────
  Sampel train (dgn aug): ...  |  test: ...
  [1/3] Extraction features train...
        Shape: (N, D)  |  Time: ...s
  [2/3] Extraction features test...
        Shape: (N, D)  |  Time: ...s
  [3/3] Training SVM (C=1.0, kernel=rbf)...
        SVM done  |  Time: ...s

  Fold 1 Result:
    Acc=...  Sen=...  Spe=...  AUC=...
    Time → Feat-train: ...s | Feat-test: ...s | SVM: ...s | Total: ...s
```

The SVM model for each fold is saved as `.pkl`:

```
Features/
├── efficientnet_b0_svm_fold1.pkl
├── efficientnet_b0_svm_fold2.pkl
├── ...
├── efficientnet_b3_svm_fold1~5.pkl
└── resnet50_svm_fold1~5.pkl
```

---

### **5️⃣ Evaluation & Export**

#### Evaluation Metrik

| Metrik | Information |
|--------|-----------|
| **Accuracy** | Proportion of correct predictions out of total images |
| **Sensitivity** | TP / (TP + FN) — GON+ detection capability |
| **Specificity** | TN / (TN + FP) — GON- detection capability |
| **AUC-ROC** | Area under ROC curve — overall performance |

#### Confusion Matrix

Grid confusion matrix visualized for each fold + average, saved as `.png` per backbone:

```
/content/efficientnet_b0_confusion_matrix.png
/content/efficientnet_b3_confusion_matrix.png
/content/resnet50_confusion_matrix.png
```

#### Export to Excel

The evaluation results are saved to a `.xlsx` file with neat formatting and color styling per model:

```
evaluation_cnn_svm_sigmoid.xlsx
├── Sheet: Summary          ← all models in one table
├── Sheet: EfficientNet-B0  ← result per fold + average (blue)
├── Sheet: EfficientNet-B3  ← result per fold + average (green)
└── Sheet: ResNet-50        ← result per fold + average (red)
```
Available columns:

```
Fold | Accuracy | Sensitivity | Specificity | AUC |
Time Feat-Train (s) | Time Feat-Test (s) | Time Feat-Total (s) |
Waktu SVM (s) | Time Total (s)
```

---

## 💡 ***Findings and Insights***

> *Fill this section after training is complete.*

Example format:

```
- Total images (input)   : ...
- Folds                  : 5-Fold Stratified Group K-Fold
- Data leakage           : ✅ All folds are safe
- Augmentarion train       : 1 original + 2 aug = 3× per images

EfficientNet-B0 + SVM:
  Acc: ...±...  Sen: ...±...  Spe: ...±...  AUC: ...±...

EfficientNet-B3 + SVM:
  Acc: ...±...  Sen: ...±...  Spe: ...±...  AUC: ...±...

ResNet-50 + SVM:
  Acc: ...±...  Sen: ...±...  Spe: ...±...  AUC: ...±...

- Best Model          : [name model] (AUC: ...)
```

---

## 📤 ***Output & Next Steps***

The resulting file after modeling is complete:

```
Output_CNN_SVM/sigmoid/
├── evaluation_cnn_svm_sigmoid.xlsx      ← evaluation result complete
├── efficientnet_b0_confusion_matrix.png
├── efficientnet_b3_confusion_matrix.png
├── resnet50_confusion_matrix.png
├── efficientnet_b0_svm_fold1~5.pkl    ← model SVM ready
├── efficientnet_b3_svm_fold1~5.pkl
└── resnet50_svm_fold1~5.pkl
```

**Decisions to Make After Evaluation:**

- [ ] Select the best model based on the highest Accuracy and efficient time
- [ ] Determine the best fold for deployment
- [ ] Consider fine-tuning the backbone if the results are not satisfactory
- [ ] Integrate `.pkl` model into backend for inference

**Previous step →** [`02. Preprocessing/Preprocessing.ipynb`](../02.%20Preprocessing/Preprocessing.ipynb)

---

<p align="center">
  <b>IDSC 2026</b> · Glaucoma Detection Pipeline · Modeling Stage
</p>
