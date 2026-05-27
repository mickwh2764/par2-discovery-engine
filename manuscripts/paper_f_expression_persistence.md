# Paper F: Expression Persistence Shows No Detectable Correlation with mRNA Half-Life across Non-Circadian Datasets

**Target journal:** Genome Biology  
**Status:** NOT in submission. Preprint on Research Square: https://doi.org/10.21203/rs.3.rs-9385465/v1 (v2 upload in progress, April 2026).  
**Author:** Michael Whiteside, Independent Researcher, Scotland, UK. ORCID: 0009-0000-0643-5791. Correspondence: mickwh@msn.com

---

## Abstract

*(Preprint abstract — see Research Square link above.)*

The AR(2) eigenvalue modulus |λ|, the core persistence metric of the PAR(2) framework, shows no detectable correlation with mRNA half-life across 12 non-circadian datasets given the available measurement noise. Genes with short half-lives and genes with long half-lives span the same range of |λ| values; Spearman correlations between intrinsic decay rate and temporal persistence are negligible across all tested datasets (median r = 0.031, IQR: −0.018 to +0.063). This absence of detectable correlation is consistent with |λ| measuring regulatory dynamics rather than mRNA stability. The inference of *independence* — a stronger claim than undetectability — requires ruling out genuine but small correlations masked by measurement precision, a point addressed in the Limitations (Section 4.2).

---

## 1. Introduction

*(Full introduction in preprint.)*

---

## 2. Methods

*(Full methods in preprint.)*

---

## 3. Results

*(Full results in preprint.)*

Key result: Spearman correlation between mRNA half-life (Tani et al. 2012, Schwanhäusser et al. 2011) and AR(2) |λ| across 12 non-circadian datasets: median r = 0.031 (IQR: −0.018 to +0.063). Independence holds with adequate temporal resolution (≥24 timepoints, n > 1000 genes). Weak correlations in short time-series (7–14 timepoints) are artefacts of low statistical power and confounding variables, not genuine biological coupling (see MASTER_VALIDATION_RESULTS.md §5 for the full 11-test robustness deep dive).

---

## 4. Discussion

*(Full discussion in preprint. The following subsections are draft additions for the revision stage.)*

---

### 4.1 Relationship to concurrent stability metrics

A complementary approach to characterising gene regulation beyond mean expression has been developed concurrently by Chen (2025, *Genome Biology*), who introduces the gene homeostasis Z-index — a measure of cross-cell expression stability in single-cell RNA-seq data. The Z-index detects genes that are stably expressed in the majority of cells but sharply upregulated in a small subset, a regulatory pattern invisible to standard variance-based metrics. The philosophical starting point is directly parallel to that of the present work: mean expression level is an insufficient descriptor of a gene's regulatory behaviour, and stability-oriented metrics reveal dynamics that variability-oriented metrics conceal.

The two frameworks address orthogonal axes of gene regulation. The Z-index measures stability *across cells* at a single time point in single-cell, cross-sectional data. The AR(2) eigenvalue modulus |λ| measures persistence *across time* in a time series, in bulk longitudinal data. Both dimensions are biologically meaningful and neither subsumes the other. A gene with high |λ| — one that maintains an autocorrelated expression trajectory — is not necessarily cross-cellularly homeostatic, and vice versa. In the circadian context, a natural prediction is that core clock genes should score *both* high |λ| (temporally persistent, as shown across the PAR(2) dataset panel) *and* low Z-index (cross-cellularly stable, because consistent rhythmicity implies similar cell-level behaviour across a synchronised cell population). Testing this cross-platform prediction in single-cell circadian data represents a tractable future direction. Conversely, acutely regulated stress-response genes — those with low |λ| but occasional sharp bursts in responding cells — would be predicted to show high Z-index, placing them in the opposite quadrant. Mapping genes into this two-dimensional stability space (cross-cell Z-index × temporal |λ|) would provide a more complete regulatory characterisation than either metric alone.

---

### 4.2 Limitations

**1. Species and tissue mismatch.** The primary mRNA half-life reference datasets (Schwanhäusser et al. 2011; Tani et al. 2012) were measured in mouse fibroblasts (NIH 3T3 cells) and mouse embryonic stem cells under standard culture conditions. The AR(2) eigenvalue data in this paper derive from human blood, mouse liver, mouse circadian atlas tissues, and cancer cell lines. Half-life is not a universal gene property: it varies substantially across cell types, species, and physiological states. A gene with a 60-minute half-life in fibroblasts may have a 3-hour half-life in hepatocytes and a 20-minute half-life in activated lymphocytes. Applying fibroblast half-life values to human blood AR(2) data therefore introduces measurement error in the half-life variable, which will attenuate any genuine correlation toward zero — making the "independence" finding partly a product of assay mismatch rather than true regulatory decoupling. The claim of independence is therefore more conservatively stated as: **no detectable correlation at the level of measurement precision available from cross-species, cross-tissue half-life estimates**. This is a meaningful negative result — the correlation, if present, is small relative to the noise floor — but it is not the same as demonstrating that |λ| and half-life are biologically orthogonal within a matched species and tissue context.

**2. Half-life measurement conditions.** The Schwanhäusser et al. (2011) metabolic labelling measurements were conducted in rapidly proliferating NIH 3T3 cells. Circadian AR(2) datasets derive from slowly cycling or non-cycling tissue samples in vivo. RNA degradation rates differ between proliferating and quiescent cells (mRNA half-lives are generally longer in quiescent cells). This condition mismatch compounds the species/tissue mismatch above.

**3. Boundary of detectability.** The median Spearman r = 0.031 across 12 datasets corresponds to a very small effect. A genuine correlation of r ≈ 0.10–0.15 between half-life and |λ| could be present without being detectable at the power available from cross-tissue, cross-species comparisons with noisy half-life proxies. Power calculations for detecting r = 0.10 at α = 0.05 with the gene counts available (300–2,000 genes per dataset after half-life matching) suggest 70–95% power — adequate for detecting correlations above this threshold within a well-matched dataset. But the effective power is lower when the half-life variable itself is measured with error, as it is here.

**4. Conclusion for revision.** The title and framing of this paper ("independence") should be revisited for the revision. The empirically accurate framing is: "no detectable correlation between |λ| and mRNA half-life given cross-species, cross-tissue half-life proxy measurements — consistent with independence, but the measurement gap between the two assays limits the strength of the inference." A properly matched study using half-life measurements from the same tissue and species as the AR(2) data, ideally using metabolic labelling in human blood or circadian tissue directly, would provide a more decisive test of independence.

---

## 5. References

Chen M. A novel gene expression stability metric to unveil homeostasis and regulation. *Genome Biology* (2025) 26:351. https://doi.org/10.1186/s13059-025-03810-4

Schwanhäusser B et al. Global quantification of mammalian gene expression control. *Nature* (2011) 473:337–342.

Tani H et al. Genome-wide determination of RNA stability reveals hundreds of short-lived noncoding transcripts in mammals. *Genome Research* (2012) 22:947–956.

Whiteside M. PAR(2) Discovery Engine — AR(2) autoregressive modelling of circadian gene expression time series. *Research Square* (preprint), 2025. https://doi.org/10.21203/rs.3.rs-9385465/v1

---

*Draft file created: April 2026. Section 4.1 added following review of Chen (2025), Genome Biology, the target journal for this paper.*
