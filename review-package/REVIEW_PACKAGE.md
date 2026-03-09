# PAR(2) Discovery Engine — Independent Review Package

## INSTRUCTIONS FOR REVIEWER
This package contains the core statistical code and sample outputs from the PAR(2) Discovery Engine, a computational biology platform for analyzing gene expression time-series using AR(2) autoregressive modeling.

**Please review for:**
1. Statistical methodology — are the AR(2) fits, permutation tests, bootstrap CIs, and FDR corrections correctly implemented?
2. Claims vs evidence — does each claim match what the code actually computes?
3. Overclaims — are there places where language is stronger than evidence supports?
4. Missing controls — are there analyses that should have been done but weren't?
5. Reproducibility — could an independent researcher reproduce these results from public GEO datasets?
6. Presentation — is the platform transparent, or does it hide unfavourable results?

## PLATFORM OVERVIEW
- 24 interactive pages analyzing circadian gene expression dynamics
- 15 independent public GEO datasets across 4 species (mouse, human, baboon, Arabidopsis)
- ~180,000 genome-wide AR(2) fits
- 326 drug target annotations mapped to root-space positions
- Core claim: clock genes show systematically higher temporal persistence (|λ|) than target genes

## FILE INDEX
1. `01_AR2_CORE_ENGINE.ts` — Core AR(2) fitting and eigenvalue computation
2. `02_ROBUSTNESS_SUITE.ts` — Sub-sampling, bootstrap CIs, detrending, permutation tests
3. `03_CROSS_TISSUE_THREE_LAYER.ts` — Three-layer hierarchy validation across 8 tissues
4. `04_ROOT_SPACE_ENRICHMENT.ts` — GO/KEGG functional enrichment in root-space
5. `05_EIGENVALUE_INDEPENDENCE.ts` — Independence from expression level/variance
6. `06_EDGE_CASE_DIAGNOSTICS.ts` — ADF stationarity, trend detection, quality checks
7. `07_SAMPLE_API_OUTPUTS.json` — Representative computed results
8. `Paper1_Method_Atlas.tex` — Manuscript 1 (methods + multi-tissue atlas)
9. `Paper2_Cancer_Biology.tex` — Manuscript 2 (cancer chronotherapy)

---

## KEY STATISTICAL METHODS IMPLEMENTED

### 1. AR(2) Model Fitting (01_AR2_CORE_ENGINE.ts)
- Mean-centered OLS regression: y(t) = φ₁·y(t-1) + φ₂·y(t-2) + ε(t)
- Eigenvalue modulus: |λ| = max(|r₁|, |r₂|) from characteristic equation λ² - φ₁λ - φ₂ = 0
- Complex roots: |λ| = √(-φ₂) when discriminant < 0
- Stationarity check: |λ| < 1

### 2. Benjamini-Hochberg FDR (01_AR2_CORE_ENGINE.ts, line ~1019)
- Standard step-up procedure
- Applied after within-pair Bonferroni correction for 4 interaction terms

### 3. Bootstrap CIs (02_ROBUSTNESS_SUITE.ts)
- Block bootstrap on AR(2) residuals
- 200-5,000 iterations depending on analysis
- 2.5th/97.5th percentile CIs

### 4. Permutation Tests (03_CROSS_TISSUE_THREE_LAYER.ts)
- 10,000 label shuffles per tissue
- Tests whether observed clock-target gap exceeds null distribution
- One-sided p-value: fraction of permutations ≥ observed gap

### 5. Spatial Clustering (04_ROOT_SPACE_ENRICHMENT.ts)
- Mean pairwise distance within functional categories vs random subsets
- Permutation-based p-values (200-1,000 iterations)
- Pole enrichment analysis at 4 dynamical poles

### 6. ADF Stationarity Test (06_EDGE_CASE_DIAGNOSTICS.ts)
- Augmented Dickey-Fuller with automatic lag selection
- MacKinnon critical values approximation
- Reports stationarity failures transparently

### 7. Spearman Correlation (05_EIGENVALUE_INDEPENDENCE.ts)
- Rank-based correlation with t-distribution p-values
- Tests independence of |λ| from R², amplitude, expression level

### 8. Cosinor Analysis (05_EIGENVALUE_INDEPENDENCE.ts)
- Fits y(t) = M + β·cos(ωt) + γ·sin(ωt)
- 3×3 normal equations solved via determinant inversion
- R² and amplitude computed per gene

---

## KNOWN LIMITATIONS (SELF-REPORTED)
- Cross-validation win rate: 45.2% (explicitly described as "descriptive framework, not predictive model")
- Blood datasets show weaker hierarchy than solid tissues (79th vs 95th percentile)
- Sub-sampling to N=8 preserves hierarchy in only 34% of iterations
- PAR(2) explicitly called "descriptive discovery framework" in manuscripts
- All p-values, including non-significant ones, are displayed
