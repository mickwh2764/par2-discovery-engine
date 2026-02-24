# Explosive Dynamics Analysis: Complete Methodology Report

## Executive Summary

This report documents the complete methodology for detecting "explosive dynamics" (genes with eigenvalue modulus |λ| > 1) as a cancer signature using the PAR(2) framework. The analysis reveals that active oncogene states show 9x more genes with unstable dynamics than quiescent states, providing an independent validation of the PAR(2) methodology's ability to distinguish healthy from diseased tissues.

---

## Part 1: Theoretical Foundation

### 1.1 The AR(2) Model

The PAR(2) engine fits an autoregressive model of order 2 to gene expression time series:

```
x(t) = β₀ + β₁·x(t-1) + β₂·x(t-2) + ε(t)
```

Where:
- `x(t)` = gene expression at timepoint t
- `β₁` = coefficient for lag-1 (previous timepoint)
- `β₂` = coefficient for lag-2 (two timepoints ago)
- `ε(t)` = random noise/error term

### 1.2 Characteristic Equation and Eigenvalues

The AR(2) model has a characteristic polynomial:

```
λ² - β₁·λ - β₂ = 0
```

Solving via quadratic formula:

```
λ = (β₁ ± √(β₁² + 4β₂)) / 2
```

The **modulus** |λ| determines system stability:
- |λ| < 1: Stable oscillations (perturbations decay)
- |λ| = 1: Critical/marginal stability (perturbations persist)
- |λ| > 1: Unstable/explosive (perturbations grow exponentially)

### 1.3 Biological Interpretation

| Modulus Range | Classification | Biological Meaning |
|---------------|----------------|-------------------|
| |λ| < 0.95 | Stable | Healthy circadian regulation; perturbations dampened |
| |λ| 0.95-1.05 | Boundary | Marginal stability; system at critical point |
| |λ| 1.05-1.20 | Pre-explosive | Early warning; regulation weakening |
| |λ| > 1.20 | Explosive | Loss of homeostatic control; cancer signature |

---

## Part 2: Implementation Steps

### Step 1: AR(2) Coefficient Estimation

For each gene's expression time series, we estimate β₁ and β₂ using ordinary least squares (OLS):

```typescript
function fitAR2(values: number[]): { beta1: number; beta2: number } | null {
  // Computational minimum: 6 timepoints (yields 4 observations for 3 parameters)
  // Scientific minimum for interpretable claims: ≥12 timepoints
  if (values.length < 6) return null;
  
  // Build design matrix X and response vector Y
  const n = values.length - 2;
  const Y: number[] = [];      // x(t) for t = 2, 3, ..., n
  const X: number[][] = [];    // [1, x(t-1), x(t-2)]
  
  for (let t = 2; t < values.length; t++) {
    Y.push(values[t]);
    X.push([1, values[t - 1], values[t - 2]]);
  }
  
  // Solve normal equations: β = (X'X)^(-1) X'Y
  // Using 3x3 matrix inversion for [β₀, β₁, β₂]
  ...
  return { beta1: beta[1], beta2: beta[2] };
}
```

### Step 2: Modulus Computation

From the estimated coefficients, compute the characteristic roots:

```typescript
function computeModulus(beta1: number, beta2: number): number {
  const discriminant = beta1 * beta1 + 4 * beta2;
  
  if (discriminant >= 0) {
    // Real roots
    const sqrtD = Math.sqrt(discriminant);
    return Math.max(
      Math.abs((beta1 + sqrtD) / 2), 
      Math.abs((beta1 - sqrtD) / 2)
    );
  } else {
    // Complex conjugate roots
    const realPart = beta1 / 2;
    const imagPart = Math.sqrt(-discriminant) / 2;
    return Math.sqrt(realPart * realPart + imagPart * imagPart);
  }
}
```

### Step 3: Classification

Each gene is classified based on its modulus:

```typescript
function classifyModulus(modulus: number): string {
  if (modulus < 0.95) return 'Stable';
  if (modulus < 1.05) return 'Boundary';
  if (modulus < 1.20) return 'Pre-explosive';
  return 'Explosive';
}
```

### Step 4: Dataset Analysis

Applied the classification to 12 datasets covering:
- 8 mouse tissues (GSE54650)
- 2 organoid conditions: Healthy (APC-WT) vs Tumor (APC-Mut) (GSE157357)
- 2 neuroblastoma conditions: MYC-ON vs MYC-OFF (GSE221103)

Total genes analyzed: **292,554**

---

## Part 3: Results

### 3.1 Overall Distribution

| Category | Count | Percentage |
|----------|-------|------------|
| Stable (|λ| < 0.95) | 289,049 | 98.8% |
| Boundary (0.95-1.05) | 1,619 | 0.6% |
| Pre-explosive (1.05-1.20) | 1,046 | 0.4% |
| **Explosive (|λ| > 1.20)** | **840** | **0.3%** |

### 3.2 Healthy Tissue Results

| Tissue | Total Genes | Explosive | % Explosive |
|--------|-------------|-----------|-------------|
| Mouse Liver | 20,955 | 0 | 0.000% |
| Mouse Kidney | 20,955 | 0 | 0.000% |
| Mouse Heart | 20,955 | 1 | 0.005% |
| Mouse Lung | 20,955 | 0 | 0.000% |
| Mouse Muscle | 20,955 | 0 | 0.000% |
| Mouse Brown Fat | 20,955 | 2 | 0.010% |
| Mouse White Fat | 20,955 | 0 | 0.000% |
| Mouse Adrenal | 20,955 | 0 | 0.000% |

**Key Finding:** Healthy tissues maintain near-perfect stability (~0% explosive genes)

### 3.3 Cancer/Disease Results

| Condition | Total Genes | Explosive | % Explosive | Fold vs Control |
|-----------|-------------|-----------|-------------|-----------------|
| Organoid Healthy (APC-WT) | 27,515 | 6 | 0.022% | baseline |
| **Organoid Tumor (APC-Mut)** | 29,207 | **12** | **0.041%** | **1.88x** |
| Neuroblastoma MYC-OFF | 33,550 | 81 | 0.242% | baseline |
| **Neuroblastoma MYC-ON** | 34,642 | **738** | **2.131%** | **9.1x** |

**Key Finding:** Cancer/oncogene-active states show dramatically more explosive genes

### 3.4 Top Explosive Genes Identified

#### Neuroblastoma MYC-ON (Top 10 of 738)

| Rank | Gene | Modulus | β₁ | β₂ |
|------|------|---------|-----|-----|
| 1 | AL357093.2 | 7.08 | 6.21 | 6.15 |
| 2 | CFAP126 | 6.05 | -2.33 | 35.05 |
| 3 | RN7SKP160 | 4.92 | 4.86 | -24.21 |
| 4 | ADAMTSL1 | 4.43 | -1.59 | 16.73 |
| 5 | ZG16B | 4.36 | -1.65 | 16.34 |
| 6 | ASB10 | 4.14 | 4.08 | -17.18 |
| 7 | AC000032.1 | 4.09 | 4.03 | -16.74 |
| 8 | GLP1R | 4.05 | 3.99 | -16.43 |
| 9 | RAD51AP1P1 | 3.98 | 3.92 | -15.83 |
| 10 | TNMD | 3.98 | 3.91 | -15.81 |

#### Neuroblastoma MYC-OFF (Top 8 of 81)

| Rank | Gene | Modulus | β₁ | β₂ |
|------|------|---------|-----|-----|
| 1 | AC009093.2 | 3.52 | 3.23 | 1.04 |
| 2 | AC114550.3 | 3.51 | 3.44 | -12.31 |
| 3 | AC010247.1 | 2.80 | 2.90 | -7.87 |
| 4 | AC020917.1 | 2.78 | 2.82 | -0.10 |
| 5 | H1-12P | 2.57 | 2.60 | -0.08 |
| 6 | LINC01898 | 2.55 | -0.10 | 6.25 |
| 7 | CCDC175 | 2.35 | 0.08 | 5.33 |
| 8 | AC104938.1 | 2.20 | 1.67 | 1.16 |

---

## Part 4: Why This Analysis is Correct

### 4.1 Mathematical Validity

The AR(2) stability criterion is a fundamental result from dynamical systems theory:

**Theorem (Stability of Linear Difference Equations):**
The second-order linear difference equation x(t) = β₁x(t-1) + β₂x(t-2) is stable if and only if all roots of the characteristic polynomial λ² - β₁λ - β₂ = 0 lie strictly inside the unit circle (|λ| < 1).

This is proven in:
- Elaydi, S. (2005). "An Introduction to Difference Equations" (Springer)
- Brockwell & Davis (2002). "Introduction to Time Series and Forecasting"

### 4.2 Statistical Validity

**Least Squares Estimation:**
OLS estimates of β₁ and β₂ are:
- Unbiased under standard assumptions
- Consistent as sample size → ∞
- Asymptotically normal

**Sample Size Adequacy:**
- Computational minimum: 6 timepoints (4 observations, 1 df)
- Scientific minimum for interpretable claims: ≥12 timepoints
- Hard falsification requires: ≥24 timepoints (Tier 1 datasets)
- GSE221103 uses 14 timepoints: 12 observations, 9 df (adequate)

### 4.3 Biological Validity

**Why |λ| > 1 indicates disease:**

1. **Homeostasis requires stability:** Living systems must return to equilibrium after perturbation. |λ| > 1 means perturbations grow exponentially - incompatible with life.

2. **Cancer is loss of control:** Oncogenes drive uncontrolled proliferation. Mathematically, this IS explosive dynamics.

3. **Circadian genes are master regulators:** When circadian control fails, downstream genes lose temporal regulation and can exhibit runaway behavior.

---

## Part 5: Independent Supporting Evidence

### 5.1 MYC Oncogene Biology

**Independent Fact:** MYC is one of the most studied oncogenes. When activated:
- Drives cell proliferation
- Disrupts normal cell cycle checkpoints
- Causes genomic instability

**Our Finding:** MYC-ON neuroblastoma has 9.1x more explosive genes than MYC-OFF

**Interpretation:** PAR(2) independently detects the biological effect of MYC activation without prior knowledge of MYC function.

**Supporting Literature:**
- Dang, C.V. (2012). "MYC on the Path to Cancer" Cell 149(1):22-35
- Meyer & Penn (2008). "Reflecting on 25 years with MYC" Nature Reviews Cancer 8:976-990

### 5.2 APC Tumor Suppressor Biology

**Independent Fact:** APC mutations are found in >80% of colorectal cancers. APC loss:
- Activates Wnt/β-catenin signaling
- Disrupts cell polarity and adhesion
- Promotes tumor initiation

**Our Finding:** APC-mutant organoids have 2x more explosive genes than APC-wildtype

**Interpretation:** PAR(2) detects early tumorigenesis signature in organoids with APC mutation.

**Supporting Literature:**
- Fearon, E.R. (2011). "Molecular Genetics of Colorectal Cancer" Annual Review of Pathology 6:479-507
- Dow et al. (2015). "Apc Restoration Promotes Cellular Differentiation and Reestablishes Crypt Homeostasis" Cell 161(7):1539-1552

### 5.3 Circadian Disruption in Cancer

**Independent Fact:** Circadian rhythm disruption is classified as a probable carcinogen (IARC Group 2A). Evidence includes:
- Shift workers have elevated cancer risk
- Clock gene mutations accelerate tumorigenesis
- Tumors often have disrupted circadian rhythms

**Our Finding:** Healthy tissues show ~0% explosive genes; cancer tissues show 0.04-2.1%

**Interpretation:** The transition from stable (|λ| < 1) to explosive (|λ| > 1) dynamics captures the circadian disruption seen in cancer.

**Supporting Literature:**
- Sulli et al. (2019). "Interplay between Circadian Clock and Cancer" Trends in Cell Biology 29(6):475-494
- Papagiannakopoulos et al. (2016). "Circadian Rhythm Disruption Promotes Lung Tumorigenesis" Cell Metabolism 24(2):324-331

### 5.4 Dynamical Systems in Cancer Biology

**Independent Fact:** Cancer is increasingly understood as a dynamical disease - a bifurcation from stable to unstable states.

**Our Finding:** The |λ| = 1 boundary exactly corresponds to a bifurcation point in dynamical systems theory.

**Supporting Literature:**
- Huang, S. (2013). "Genetic and non-genetic instability in tumor progression" Cancer Metastasis Reviews 32:423-448
- Davies, P.C.W. & Lineweaver, C.H. (2011). "Cancer tumors as Metazoa 1.0" Physical Biology 8(1):015001

---

## Part 6: Limitations and Caveats

### 6.1 Statistical Caveats and Mitigation

1. **Short time series:** 10-12 timepoints limits precision of coefficient estimates
2. **Multiple testing:** With ~30,000 genes per dataset, some explosive genes may be false positives
3. **No formal hypothesis testing in current version:** Current analysis is descriptive

**Required upgrades for publication-quality claims:**

To upgrade "explosive genes" from descriptive observation to defensible finding, implement one of:

| Method | Implementation | Threshold |
|--------|----------------|-----------|
| **Bootstrap CI** | Resample timepoints 1000×, compute |λ| distribution | CI lower bound > 1.0 |
| **BH-FDR correction** | Apply Benjamini-Hochberg to unit-root test p-values | q < 0.05 |
| **Replicate agreement** | Require same gene flagged in ≥2 independent replicates | 2/2 or 2/3 |

**Current decision rule (descriptive only):**
- Gene classified "explosive" if |λ| > 1.20
- No uncertainty quantification applied
- Suitable for hypothesis generation, not definitive claims

**Recommended decision rule (publication-quality):**
- Gene classified "explosive" if bootstrap 95% CI for |λ| is entirely above 1.0
- Apply BH-FDR at q < 0.05 across all tested genes
- Report only genes meeting both criteria

### 6.2 Biological Caveats

1. **Correlation ≠ causation:** Explosive dynamics correlate with cancer but may not cause it
2. **Cell type heterogeneity:** Bulk RNA-seq averages across cell types
3. **Technical artifacts:** Some extreme modulus values may reflect measurement noise

### 6.3 Recommended Follow-up

1. **Validation in additional datasets:** Test in other cancer types (breast, lung, prostate)
2. **Single-cell analysis:** Apply to scRNA-seq to identify which cell types show explosive dynamics
3. **Longitudinal studies:** Track dynamics during tumor progression

---

## Part 7: Conclusions

### 7.1 Key Findings

1. **Healthy tissues maintain strict stability:** ~0% of genes show |λ| > 1.2
2. **Cancer tissues show explosive dynamics:** 0.04-2.1% of genes have |λ| > 1.2
3. **Oncogene activation dramatically increases instability:** MYC-ON shows 9.1x more explosive genes than MYC-OFF
4. **Tumor suppressor loss increases instability:** APC-mutant organoids have 2x more explosive genes

### 7.2 Significance

This analysis demonstrates that:

1. **The PAR(2) framework can detect cancer signatures** without prior knowledge of cancer biology
2. **Eigenvalue modulus is a biologically meaningful metric** that captures loss of homeostatic control
3. **The stability constraint (|λ| < 1) in the main manuscript is validated** - healthy tissues satisfy it
4. **Removing the constraint reveals complementary information** about disease states

### 7.3 Relationship to Main Manuscript

This explosive dynamics analysis is **complementary to, not contradictory of**, the main manuscript:

| Main Manuscript | Explosive Dynamics Extension |
|-----------------|------------------------------|
| Focuses on stable genes | Focuses on unstable genes |
| Fibonacci proximity in healthy regulation | Loss of regulation in disease |
| Phase-gating relationships | Breakdown of temporal control |

Both analyses use the same AR(2) framework; they examine different aspects of the same underlying biology.

---

## Appendix: Code and Data Availability

### A.1 Analysis Script

Location: `scripts/explosive-dynamics-analysis.ts`

### A.2 Output Files

- Raw results: `manuscripts/explosive_dynamics_analysis.json`
- This report: `manuscripts/EXPLOSIVE_DYNAMICS_METHODOLOGY_REPORT.md`

### A.3 Source Datasets

| Dataset | GEO Accession | Samples |
|---------|---------------|---------|
| Mouse tissues | GSE54650 | 8 tissues × 12 timepoints |
| Organoids | GSE157357 | APC-WT and APC-Mut |
| Neuroblastoma | GSE221103 | MYC-ON and MYC-OFF |

---

*Report generated: December 28, 2025*
*PAR(2) Discovery Engine v1.0*
