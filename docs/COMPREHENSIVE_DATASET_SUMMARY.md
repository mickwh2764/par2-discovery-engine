# Comprehensive Dataset Analysis Summary

**Generated:** 2026-01-04
**Total Datasets:** 26

---

## 1. Overview Table

| Dataset | Tissue | Timepoints | Genes | Mean |λ| | Fib% | Explosive% | Null z-score | Claim Strength |
|---------|--------|------------|-------|---------|------|------------|--------------|----------------|
| GSE157357_APC-Mut_BMAL-WT.csv | APC-Mut | 22 | 29,465 | 0.487 | 28.6% | 0.08% | 4.0* | Weak |
| GSE157357_APC-WT_BMAL-WT.csv | APC-WT | 22 | 27,809 | 0.416 | 24.0% | 0.03% | 1.0 | Weak |
| GSE157357_Organoid_ApcKO-BmalKO_cir | Organoid | 22 | 15,311 | 0.435 | 24.9% | 0.09% | -1.5 | Weak |
| GSE157357_Organoid_ApcKO-WT_circadi | Intestinal Organoid | 22 | 15,559 | 0.563 | 34.8% | 0.07% | 4.4* | Weak |
| GSE157357_Organoid_WT-BmalKO_circad | Intestinal Organoid | 22 | 15,736 | 0.440 | 30.1% | 0.00% | 1.9 | Weak |
| GSE157357_Organoid_WT-WT_circadian. | Intestinal Organoid | 22 | 15,772 | 0.434 | 27.9% | 0.01% | -0.6 | Weak |
| GSE17739_Kidney_CCD.csv | Kidney (CCD) | 6 | 21,510 | 0.725 | 26.2% | 12.32% | -0.2 | Artifact Risk |
| GSE17739_Kidney_DCT.csv | Kidney (DCT) | 6 | 21,510 | 0.711 | 26.4% | 12.24% | -1.7 | Artifact Risk |
| GSE201207_Young_Kidney_Aging.csv | Kidney | 12 | 23,442 | 0.550 | 34.6% | 0.78% | 1.0 | Weak |
| GSE221103_Neuroblastoma_MYC_OFF.csv | Neuroblastoma | 14 | 34,119 | 0.485 | 31.2% | 0.36% | 1.1 | Weak |
| GSE221103_Neuroblastoma_MYC_ON.csv | Neuroblastoma | 14 | 35,353 | 0.550 | 29.3% | 3.15% | -3.1 | Weak |
| GSE261698_APP_Bulk.csv | Cortex (Glia) | 24 | 4,276 | 0.706 | 27.0% | 0.00% | -1.4 | Weak |
| GSE261698_WT_Bulk.csv | Cortex (Glia) | 23 | 4,253 | 0.549 | 52.0% | 0.00% | 23.1* | Weak |
| GSE54650_Adrenal_circadian.csv | Adrenal | 24 | 20,955 | 0.427 | 23.0% | 0.01% | -1.5 | Weak |
| GSE54650_Aorta_circadian.csv | Aorta | 24 | 20,955 | 0.419 | 25.3% | 0.00% | 0.2 | Weak |
| GSE54650_Brainstem_circadian.csv | Brainstem | 24 | 20,955 | 0.436 | 29.2% | 0.00% | - | Weak |
| GSE54650_Brown_Fat_circadian.csv | Brown | 24 | 20,955 | 0.421 | 25.4% | 0.02% | - | Weak |
| GSE54650_Cerebellum_circadian.csv | Cerebellum | 24 | 20,955 | 0.438 | 29.4% | 0.00% | - | Weak |
| GSE54650_Heart_circadian.csv | Heart | 24 | 20,955 | 0.435 | 28.4% | 0.00% | - | Weak |
| GSE54650_Hypothalamus_circadian.csv | Hypothalamus | 24 | 20,955 | 0.402 | 21.8% | 0.00% | - | Weak |
| GSE54650_Kidney_circadian.csv | Kidney | 24 | 20,955 | 0.457 | 32.6% | 0.00% | - | Weak |
| GSE54650_Liver_circadian.csv | Liver | 24 | 20,955 | 0.486 | 37.6% | 0.00% | - | Weak |
| GSE54650_Lung_circadian.csv | Lung | 24 | 20,955 | 0.486 | 35.3% | 0.03% | - | Weak |
| GSE54650_Muscle_circadian.csv | Muscle | 24 | 20,955 | 0.449 | 30.4% | 0.00% | - | Weak |
| GSE54650_White_Fat_circadian.csv | White | 24 | 20,955 | 0.413 | 24.1% | 0.00% | - | Weak |
| GSE59396_Lung_Basal.csv | Lung | 12 | 17,127 | 0.525 | 36.5% | 0.19% | - | Weak |

*z-score with asterisk indicates significant enrichment above null (p<0.05)*

---

## 2. Disease Model Contrasts (Strongest Findings)

### 2.1 Alzheimer's Model (GSE261698): WT vs APP

| Metric | WT (Healthy) | APP (Alzheimer's) | Change | Interpretation |
|--------|--------------|-------------------|--------|----------------|
| Mean |λ| | 0.549 | 0.706 | +0.157 | Disease destabilizes AR(2) |
| Fibonacci % | **51.0%** | 27.0% | -24.0% | Loss of stability band |
| Complex Root % | 10.2% | 3.0% | -7.2% | Loss of oscillatory structure |
| Null z-score | **23.09*** | -1.38 | - | WT is genuinely anomalous |

**Novelty:** HIGH - WT glial cells show strongest Fibonacci enrichment of any dataset
**Independent Support:** Same experimental design, matched samples
**Claim Strength:** STRONG for WT anomaly; MODERATE for disease contrast

### 2.2 Cancer Model (GSE221103): MYC OFF vs MYC ON

| Metric | MYC OFF (Quiescent) | MYC ON (Proliferative) | Change | Interpretation |
|--------|---------------------|------------------------|--------|----------------|
| Mean |λ| | 0.485 | 0.550 | +0.065 | Proliferation increases instability |
| Fibonacci % | 31.2% | 29.3% | -1.9% | Small decrease |
| Explosive % | 0.54% | 3.30% | +2.76% | 6x increase in explosive genes |
| Null z-score | 1.07 | -3.13 | - | Neither exceeds null |

**Novelty:** MEDIUM - Direction consistent with biological expectation
**Independent Support:** Human cells, inducible system
**Claim Strength:** MODERATE for |λ| shift; WEAK for Fibonacci claim

### 2.3 APC Mutation (GSE157357): WT vs ApcKO Organoids

| Metric | WT-WT | ApcKO-WT | Change | Interpretation |
|--------|-------|----------|--------|----------------|
| Mean |λ| | 0.434 | 0.563 | +0.129 | APC loss destabilizes |
| Fibonacci % | 27.9% | 34.8% | +6.9% | Paradoxical increase |
| Null z-score | -0.56 | **4.41*** | - | ApcKO is significant |

**Novelty:** MEDIUM - APC mutation shows genuine signal above null
**Independent Support:** Genetic model, organoid system
**Claim Strength:** MODERATE

---

## 3. Validation Test Results

### 3.1 Null Model Test Summary

| Result | Count | Datasets |
|--------|-------|----------|
| Significant (z>2) | 3 | GSE261698_WT, GSE157357_ApcKO-WT, GSE157357_APC-Mut |
| Not significant | 12 | All others tested |

**Implication:** Most Fibonacci% values are NOT distinguishable from shuffled data

### 3.2 Timepoint Sensitivity

| Timepoints | Explosive % | Reliability |
|------------|-------------|-------------|
| 6 | 22% | UNRELIABLE - artifact |
| 8-10 | 10-12% | CAUTION |
| 12-14 | 0.1-0.2% | ACCEPTABLE |
| 18-24 | <0.1% | RELIABLE |

### 3.3 Period Distribution

| Period Range | Percentage | Circadian? |
|--------------|------------|------------|
| <12h | 46.7% | Ultradian |
| 12-20h | 40.4% | Sub-circadian |
| **20-28h** | **9.9%** | **Circadian** |
| >28h | 3.1% | Infradian |

**Implication:** Only ~10% of oscillatory genes have circadian periods

---

## 4. Novelty Assessment by Level

### Level 1: Mathematical Framework
| Aspect | Status | Novelty |
|--------|--------|--------|
| AR(2) model for gene expression | Valid | Low (established) |
| Eigenvalue stability metric | Valid | Medium (novel application) |
| Fibonacci range 0.518-0.718 | NOT validated | None (not special) |

### Level 2: Biological Claims
| Claim | Evidence | Novelty |
|-------|----------|--------|
| Disease increases |λ| | Supported (3 models) | Medium-High |
| Clock genes in Fibonacci band | NOT supported | None |
| Circadian dynamics detected | Weak (10% circadian) | Low |
| WT glia have unique stability | Strong (z=23) | HIGH |

### Level 3: Translational Claims
| Claim | Evidence | Novelty |
|-------|----------|--------|
| |λ| as disease biomarker | Moderate | Medium |
| Fibonacci = healthy | NOT supported | None |
| Explosive = pathology | Artifact for short series | Weak |

---

## 5. Publication Recommendations

### Defensible Claims (KEEP)
1. AR(2) eigenvalue |λ| distinguishes disease from healthy tissue
2. WT glial cells (GSE261698) show anomalously high stability structure
3. Disease states (Alzheimer's, cancer, APC mutation) shift |λ| distribution upward
4. Minimum 12 timepoints required for reliable estimates

### Overclaims to Remove
1. ~~Fibonacci range is biologically special~~
2. ~~Universal circadian homeostasis~~
3. ~~Explosive genes mark disease~~ (artifact for short series)
4. ~~Clock genes preferentially in stability band~~

### Revised Manuscript Title Suggestion
> "AR(2) Eigenvalue Profiling Reveals Stability Signatures in Disease Transcriptomes"

---

*Report generated by PAR(2) Discovery Engine - Comprehensive Summary*
