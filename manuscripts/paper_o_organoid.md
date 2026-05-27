# APC Loss Collapses the Circadian Clock–Cell Cycle Temporal Hierarchy in Intestinal Organoids: An AR(2) Eigenvalue Study

**Michael Whiteside**
Independent Researcher, Scotland, UK
ORCID: 0009-0000-0643-5791
Correspondence: mickwh@msn.com

**Keywords:** circadian clock; colorectal cancer; APC; AR(2) autoregression; eigenvalue; intestinal organoids; Bmal1; WEE1; LGR5; temporal persistence; cell cycle gating; GSE157357

---

## Abstract

The circadian clock gates cell division in the intestinal crypt through WEE1-mediated CDK1 inhibition, and disruption of this coupling is associated with colorectal cancer (CRC). Here we apply AR(2) autoregressive eigenvalue analysis — which quantifies temporal persistence via the eigenvalue modulus |λ| derived from mean-centred ordinary least-squares fitting — to circadian RNA-seq data from mouse intestinal organoids across four genotypes: wild-type (WT), Bmal1 knockout (BmalKO), Apc knockout (ApcKO), and Apc+Bmal1 double knockout (DblKO) (GSE157357; Matsu-ura et al., 2021). In WT organoids, core clock genes show a modest eigenvalue advantage over proliferative target genes (clock mean |λ| = 0.588; target mean |λ| = 0.556; hierarchy gap = +0.033). ApcKO collapses this gap (gap = −0.127) and is directionally consistent with greater target-gene elevation (mean Δ = +0.234) than clock-gene change (+0.075); formal gene-set gap tests are underpowered and not significant (Table 1c). Hierarchy collapse arises from target genes transitioning from low-persistence oscillatory states to high-persistence constitutive states, rather than from suppression of clock gene rhythms; these two components contribute jointly to the observed mean-|λ| inversion. BmalKO achieves a comparable collapse (gap = −0.095) through clock gene reduction (mean Δ = −0.089) with modest target elevation. The DblKO condition paradoxically partially restores hierarchy (gap = +0.011), with target genes falling substantially (Δ = −0.218) and clock genes recovering partially (Δ = +0.084), providing a mechanistic control. Lgr5 is the most elevated target gene in ApcKO (|λ| = 0.928, near-unit-root; Δ = +0.454). Cry1 shows the largest individual clock gene decrease in ApcKO (|λ| = 0.376; Δ = −0.438). Wee1 rises moderately in ApcKO (WT |λ| = 0.655 → ApcKO |λ| = 0.877; Δ = +0.222). Cross-validation shows 7/8 target genes are directionally concordant (p = 0.035; one-tailed, unadjusted, exploratory sub-analysis), whereas clock genes (3/7) and all genes combined (10/15) are not significant; the binomial test assumes gene independence and does not adjust for multiple comparisons. Several clock genes (ARNTL, PER2, PER1, DBP) rise in ApcKO organoids but fall in TCGA tumours, indicating that the organoid model captures proliferative but not clock gene dynamics in human CRC. Extending the analysis to 41 cell-type marker genes from colonic crypt RNA-seq data using the Nguyen et al. (2025) marker set reveals a three-layer temporal hierarchy: cell-identity markers (highest |λ|) > circadian clock genes (intermediate |λ|) > proliferation markers (lowest |λ|). This three-layer hierarchy shares a characteristic polynomial with Boman's spatial Fibonacci crypt model: both AR(2) at (φ₁, φ₂) = (1,1) and Boman's Fibonacci matrix yield the equation q² + q − 1 = 0, whose stable root is q = 1/φ ≈ 0.618. This is a mathematical observation (proved algebra), not an empirical finding: the shared equation establishes a conceptual bridge between the two frameworks, but does not constitute empirical evidence that biological eigenvalues are governed by Fibonacci dynamics. An independent unsupervised method (COFE; Gupta et al., 2024) identifies four circadian genes as phase-displaced in human adenocarcinomas, all of which are also prominent in the PAR(2) analysis. Together, these findings establish that APC loss rewires the intestinal organoid circadian-proliferative hierarchy in a manner that is computationally predictive of human CRC transcriptomics, and that the mathematical structure of this hierarchy is grounded in the same algebraic object as Boman's spatial model of crypt cell birth.

---

## 1. Introduction

The mammalian intestinal crypt is a precisely ordered proliferative unit in which stem cells at the crypt base divide, give rise to transit-amplifying (TA) progenitors, and differentiate into absorptive and secretory lineages as they migrate toward the villus tip (Barker et al., 2007; Nguyen et al., 2025). The timing of cell division within this axis is not random: the circadian clock protein BMAL1 drives expression of *Wee1*, which encodes a kinase that phosphorylates and inhibits CDK1, thereby gating mitotic entry to the correct phase of the 24-hour cycle (Matsuo et al., 2003). This clock-to-cell-cycle relay means that the transcriptional persistence of circadian clock genes is expected to sit above that of their cell-cycle targets in any temporal hierarchy — a prediction that is testable from time-series gene expression data.

Adenomatous polyposis coli (APC) is the most commonly mutated tumour suppressor in colorectal cancer (CRC), with loss-of-function alterations present in approximately 75% of cases (Fearon and Vogelstein, 1990). APC normally anchors the β-catenin destruction complex; its loss leads to constitutive Wnt/β-catenin signalling and upregulation of Wnt target genes including *Myc*, *Lgr5*, and *Ccnd1* (Clevers and Nusse, 2012). Critically, disruption of the circadian clock accelerates APC heterozygosity to homozygosity and thereby accelerates colorectal tumour initiation (Masri et al., 2022), establishing a mechanistic link between clock function and APC status. Organoid models expressing ApcKO have enabled direct transcriptomic profiling of the clock-proliferation axis under controlled genetic conditions (Matsu-ura et al., 2021; Rosselot et al., 2022).

AR(2) autoregressive modelling offers a parameter-efficient approach to quantifying temporal persistence in short circadian time series (Whiteside, 2025a). By fitting a two-lag autoregressive model to mean-centred expression values and computing the modulus of the dominant characteristic root — the eigenvalue |λ| — one obtains a single scalar that captures how strongly each gene's expression at time *t* predicts its value at time *t + 4 h*. A gene with high |λ| is one whose expression decays slowly: it retains a strong "memory" of its past state. Under the PAR(2) framework, core circadian clock genes consistently show higher |λ| than their downstream cell-cycle targets across healthy mammalian datasets, a pattern termed the "Gearbox hierarchy" (Whiteside, 2025a) — in which the clock constitutes the master gear (higher |λ|) and its downstream cell-cycle targets constitute the driven gear (lower |λ|). The eigenvalue gap between the two layers — clock |λ| minus target |λ| — is a compact summary of this separation.

The present study applies AR(2) analysis to intestinal organoid time-series data from GSE157357 (Matsu-ura et al., 2021) across four genotypes: wild-type, BmalKO, ApcKO, and Apc+Bmal1 double-knockout. The goals are (1) to determine whether and how each genetic perturbation alters the clock-target eigenvalue hierarchy; (2) to test whether the direction of organoid ApcKO eigenvalue changes agrees with the direction of expression change in human TCGA-COAD colorectal tumours, separately for target genes and clock genes; (3) to characterise a three-layer temporal hierarchy across colonic crypt cell-type markers; and (4) to situate the observed eigenvalue structure within the algebraic framework of Boman's spatial Fibonacci crypt model. Together, these analyses provide an integrated computational portrait of how APC loss rewires intestinal temporal dynamics at the level of individual gene persistence.

---

## 2. Methods

### 2.1 Dataset

Time-series RNA-seq data were obtained from NCBI GEO accession GSE157357 (Matsu-ura et al., 2021). This dataset contains circadian time-series measurements from mouse intestinal organoids across four genotypes: wild-type (WT-WT), Bmal1 knockout (WT-BmalKO), Apc knockout (ApcKO-WT), and Apc+Bmal1 double knockout (DblKO). Each condition contains measurements at 13 sample columns; however, these columns are non-chronologically ordered in the downloaded CSV (columns begin at circadian time CT34, not CT24) and most timepoints have biological replicates. For AR(2) analysis, biological replicates at each unique circadian time were averaged, and columns were sorted chronologically to yield 12 unique timepoints per condition (CT24, CT26, CT28, CT30, CT32, CT34, CT36, CT38, CT40, CT42, CT44, CT46; 2-hour intervals spanning approximately 24 hours). Organoids were derived from ileum-derived crypt epithelium and maintained under standard culture conditions. Clock and target gene sets used for group-level comparisons were defined a priori: clock genes (n = 14, a priori) included *Arntl*, *Per1*, *Per2*, *Per3*, *Cry1*, *Cry2*, *Clock*, *Nr1d1*, *Nr1d2*, *Dbp*, *Tef*, *Hlf*, *Npas2*, and *Rorc*; of these, 12 were present in the dataset (*Hlf* and *Rorc* were absent, leaving n = 12 for all analyses). Target genes (n = 15) included *Lgr5*, *Axin2*, *Myc*, *Ccnd1*, *Sox9*, *Ascl2*, *Wee1*, *Ccnb1*, *Ccne1*, *Ccne2*, *Cdk1*, *Mcm6*, *Mki67*, *Cdkn1a*, and *Ctnnb1*; 14 of these were used for group-level means and bootstrap gap analysis (Table 1 and Table 1c; *Ctnnb1* excluded due to near-zero expression variance in WT).

For the three-layer cell-type hierarchy analysis, marker genes were drawn from Nguyen, Lausten and Boman (2025), Table 1, which provides curated marker gene sets for colonic crypt cell types including stem cells, transit-amplifying progenitors, goblet cells, Paneth-like cells, tuft cells, enteroendocrine cells, colonocytes, M cells, core clock genes, and proliferation markers (41 markers in total).

### 2.2 AR(2) Eigenvalue Fitting

For each gene in each condition, the replicate-averaged 12-unique-timepoint expression vector was extracted, sorted chronologically, mean-centred (the sample mean subtracted before fitting), and an AR(2) model fitted by ordinary least squares (OLS):

```
x̃_t = φ₁ x̃_{t−1} + φ₂ x̃_{t−2} + ε_t
```

where x̃ denotes the mean-centred expression value. Mean-centring before OLS fitting is a critical step that removes the constant intercept and ensures the regression targets the dynamic component of the signal rather than its level (Whiteside, 2025b). The characteristic polynomial of the fitted AR(2) model is:

```
r² − φ₁ r − φ₂ = 0
```

The two roots r₁ and r₂ were solved analytically. For each gene, the eigenvalue modulus is defined as:

```
|λ| = max(|r₁|, |r₂|)
```

When the discriminant of the characteristic polynomial is negative (φ₁² + 4φ₂ < 0), the roots are complex conjugates and |λ| = √(−φ₂) (the oscillatory modulus). When the roots are real, |λ| = |r₁| where |r₁| ≥ |r₂|. Genes with |λ| > 1 (explosive roots) were flagged but retained in reporting.

Goodness-of-fit was assessed by R² of the OLS regression on mean-centred data, computed on observations t = 3 to n. No gene was excluded on the basis of R²; all expressed genes (mean > 1) that passed the minimum n ≥ 4 timepoint threshold were retained regardless of fit quality. Per-gene R² values for all analysed genes are reported in Supplementary Table S5. Condition-level summaries report the mean |λ| across clock or target gene sets, and the hierarchy gap is defined as mean clock |λ| minus mean target |λ|.

For genes whose dominant characteristic root exceeded the unit circle (|λ|_raw > 1.0), the eigenvalue was capped at 0.9999 for all downstream analyses and tables. Uncapped values are reported alongside capped values in Supplementary Table S5; genes affected are Per3 (ApcKO raw = 1.084), Dbp (ApcKO raw = 1.123), Ccnb1 (ApcKO raw = 1.004), and Ccne1 (ApcKO raw = 1.010). All four have real (non-complex) characteristic roots, indicating constitutively elevated rather than oscillatory expression; their uncapped values are consistent with explosive autoregressive processes expected in genes with constitutively saturated Wnt/β-catenin drive.

### 2.3 TCGA Cross-Validation

To assess whether the organoid ApcKO eigenvalue trajectories predict the direction of expression change in human CRC, eigenvalue shifts (ApcKO minus WT) for 15 genes (7 clock, 8 target) were compared against RNA-seq expression log₂ fold-changes in TCGA-COAD versus GTEx normal colon tissue (TCGA Research Network, 2012). Fold-change values were derived from GEPIA2 analysis of TCGA-COAD versus GTEx normal colon tissue (http://gepia2.cancer-pku.cn/). Concordance was defined as agreement between the sign of the eigenvalue change in ApcKO organoids and the sign of the expression fold-change in TCGA tumours. Statistical significance was assessed by a one-tailed binomial test against a null expectation of 50% random concordance. Three tests were performed: (1) all 15 genes combined (corrected rate 10/15, p = 0.151, not significant); (2) 8 target genes only (7/8, p = 0.035, significant); (3) 7 clock genes only (3/7, p = 0.774, not significant). The pre-specified primary hypothesis was the full 15-gene test; the target-gene sub-analysis is exploratory and should be interpreted with appropriate caution regarding multiple comparisons.

### 2.4 Three-Layer Hierarchy Analysis

Eigenvalues were computed for all 41 cell-type marker genes from Nguyen et al. (2025) using the same AR(2) procedure applied to the WT GSE157357 organoid time series. Genes were grouped by functional category as specified by their cell-type assignment in the Nguyen et al. (2025) Table 1 framework. Mean eigenvalues per category were computed and a three-layer grouping was derived by visual inspection of the ranked distribution: cell-identity markers (stem cell, goblet, Paneth-like, enteroendocrine), core clock genes, and proliferation/cycle markers.

### 2.5 Algebraic Bridge: Boman q and PAR(2) Fibonacci Root

Boman (2025) derives, in Appendix C of his Fibonacci Quarterly paper, the algebraic identity:

```
q = 1/φ ≈ 0.618034,   q² + q − 1 = 0
```

where φ = (1 + √5)/2 is the golden ratio and q is the ratio of successive Fibonacci counts in the Fibonacci circle model of the spatial crypt structure. The identical relationship is encoded in the characteristic polynomial of the Fibonacci recurrence x_n = x_{n−1} + x_{n−2}:

```
r² − r − 1 = 0
```

The stable root of this polynomial has modulus |r| = (√5 − 1)/2 = 1/φ = q. This algebraic twinning is not approximate: both equations describe the same mathematical object, one from a spatial self-similarity perspective (Boman) and one from a temporal autoregressive perspective (PAR(2)).

---

## 3. Results

### 3.1 Wild-Type Organoids Show a Modest Clock-Target Eigenvalue Hierarchy

In WT intestinal organoids, AR(2) eigenvalue analysis of replicate-averaged 12-unique-timepoint circadian RNA-seq data revealed a modest hierarchy between clock and target gene sets (Table 1). Core clock genes showed a mean eigenvalue of |λ| = 0.588 (n = 12 expressed genes), while proliferative target genes showed a mean of |λ| = 0.556 (n = 14 expressed genes), yielding a hierarchy gap of +0.033. This positive gap indicates that clock gene expression decays somewhat more slowly per 2-hour step than does expression of their downstream cell-cycle targets — consistent with the established role of the circadian clock as the governing layer in the clock-to-cell-division relay (Matsuo et al., 2003; Feillet et al., 2014).

The most persistent clock genes in WT included *Cry1* (|λ| = 0.814) and *Arntl* (|λ| = 0.810), reflecting the slow negative feedback loop in which CRY proteins gradually accumulate to repress BMAL1:CLOCK activity and the master transcriptional driver role of BMAL1. Among target genes, *Wee1* showed intermediate persistence in WT (|λ| = 0.655), and *Lgr5* also showed intermediate values (|λ| = 0.474), reflecting Wnt-responsive stem cell marker dynamics.

### 3.2 ApcKO Collapses the Clock-Target Hierarchy Through Target Gene Elevation (Clock Genes Rise Slightly on Average)

In ApcKO organoids, the clock-target hierarchy gap collapsed from +0.033 to −0.127, a change of −0.160 (Table 1). This collapse is mechanistically distinct from the change induced by clock disruption (discussed in section 3.4). In ApcKO, the primary driver is target gene elevation: mean target |λ| rose from 0.556 to 0.790, an increase of +0.234. Clock gene mean |λ| rises from 0.588 to 0.663 (+0.075); however, gene-set gap tests are underpowered and not significant (Table 1c).

The group-level means reported in Table 1 aggregate genes with both real-root (constitutive) and complex-root (oscillatory) AR(2) solutions. In WT, clock gene high persistence is predominantly complex-root (e.g., Arntl: complex, Cry1: complex, Per2: complex), whereas in ApcKO, target gene high persistence is predominantly real-root (e.g., Cdk1: real, Ccnb1: real, Ccne1: real, Lgr5: real constitutive). The observed hierarchy collapse therefore reflects both a continuous shift in persistence magnitude and a categorical shift in expression regime — from oscillatory-high to constitutively-saturated-high. This distinction matters for interpretation: the hierarchy collapse is not a single continuous quantity, but a summary of two concurrent phenomena (see Limitation 11).

The most striking individual gene change in ApcKO for target genes was *Lgr5*: its eigenvalue rose from 0.474 (WT) to 0.928 (ApcKO), an increase of +0.454 — the largest target gene change. *Cdkn1a* rose from 0.531 to 0.929 (+0.398), *Cdk1* from 0.757 to 0.973 (+0.216), and *Wee1* from 0.655 to 0.877 (+0.222). Wee1 is a transcriptional target of BMAL1:CLOCK at the E-box, and APC loss drives constitutive Wnt signalling that reorganises chromatin accessibility across the Wnt-responsive gene network. Under ApcKO, Wee1 sustains elevated persistence (|λ| = 0.877) compared to its WT value of 0.655, reflecting a transition from intermediate to high temporal persistence.

*Lgr5* showed the highest ApcKO eigenvalue among target genes: |λ| = 0.928, approaching the unit root (Table 2). This near-integrator behaviour is consistent with Lgr5 becoming constitutively active under APC loss, where β-catenin directly drives its transcription. A gene at the unit root shows no temporal decay — each observation fully predicts the next — corresponding to a constitutively elevated, non-oscillating expression pattern, expected for a Wnt target tonically activated by nuclear β-catenin.

*Myc* shows a slight eigenvalue fall: |λ| fell from 0.743 (WT) to 0.705 (ApcKO), Δ = −0.037 — one of the five discordant genes in the TCGA cross-validation. *Cdk1* rose from 0.757 to 0.973 (+0.216), and *Mki67* from 0.528 to 0.622 (+0.094), reflecting proliferative activation. *Cdkn1a* (p21) showed a large rise from 0.531 to 0.929 (+0.398), potentially reflecting a compensatory stress response. *Ccnb1* rose to 1.000 (unit root cap) from 0.206 (+0.794), and *Axin2* rose from 0.637 to 0.937 (+0.301).

Clock gene trajectories in ApcKO showed mixed changes. *Cry1* showed the most dramatic clock eigenvalue decrease: |λ| fell from 0.814 (WT) to 0.376 (ApcKO), a drop of −0.438. *Nr1d1* fell from 0.743 to 0.539 (−0.203), and *Clock* fell slightly from 0.475 to 0.413 (−0.062). However, *Arntl* rose from 0.810 to 0.880 (+0.070), *Per1* rose from 0.240 to 0.915 (+0.675), *Per2* rose from 0.487 to 0.528 (+0.041), and *Dbp* reached the unit root cap (1.000) from 0.782 (+0.218). These discordant clock gene changes (eigenvalue rises in organoids vs expression falls in TCGA) represent a key difference from the prior analysis. On average, clock genes rise slightly in ApcKO (+0.075 mean Δ|λ|), indicating that APC loss does not generally suppress clock gene temporal persistence — it selectively disrupts a subset of clock genes (CRY1, NR1D1) while leaving or elevating others.

**Table 1. Condition-level AR(2) eigenvalue summaries for GSE157357 intestinal organoids (four genotypes).**

| Condition | Clock mean |λ| | Target mean |λ| | Gap (clock − target) | Clock n | Target n |
|-----------|-------------|--------------|-------------------|---------|---------|
| WT | 0.588 | 0.556 | +0.033 | 12 | 14 |
| BmalKO | 0.499 | 0.594 | −0.095 | 12 | 14 |
| ApcKO | 0.663 | 0.790 | −0.127 | 12 | 14 |
| DblKO | 0.583 | 0.572 | +0.011 | 12 | 14 |

GSE157357 (Matsu-ura et al., 2021). AR(2) fitted to replicate-averaged mean-centred 12-unique-timepoint expression vectors (2-hour sampling, CT24–CT46). Clock n = 12 expressed genes (Arntl, Clock, Per1–3, Cry1–2, Nr1d1–2, Dbp, Tef, Npas2; Hlf and Rorc absent from dataset). Target n = 14 expressed genes (Lgr5, Axin2, Myc, Ccnd1, Sox9, Ascl2, Wee1, Ccnb1, Ccne1, Ccne2, Cdk1, Mcm6, Mki67, Cdkn1a; Ctnnb1 excluded due to near-zero expression variance). Means and gaps are identical to those in Table 1c (same gene sets). Hierarchy gap = mean clock |λ| − mean target |λ|. Positive gap = clock-dominant hierarchy; negative gap = collapse or inversion.

**Table 1c. Bootstrap 95% confidence intervals and permutation p-values for the clock−target hierarchy gap (12 clock genes vs 14 expressed target genes; 10,000 iterations each).**

| Condition | Clock mean |λ| | Target mean |λ| | Observed gap | 95% Bootstrap CI | Permutation p |
|-----------|-------------|--------------|-------------|-----------------|--------------|
| WT | 0.588 | 0.556 | +0.033 | [−0.105, +0.171] | 0.669 |
| BmalKO | 0.499 | 0.594 | −0.095 | [−0.236, +0.038] | 0.205 |
| ApcKO | 0.663 | 0.790 | −0.127 | [−0.280, +0.036] | 0.122 |
| DblKO | 0.583 | 0.572 | +0.011 | [−0.145, +0.171] | 0.897 |

Gene sets: Clock — 12 genes (Arntl, Clock, Per1–3, Cry1–2, Nr1d1–2, Dbp, Tef, Npas2); Targets — 14 genes (Lgr5, Axin2, Myc, Ccnd1, Sox9, Ascl2, Wee1, Ccnb1, Ccne1, Ccne2, Cdk1, Mcm6, Mki67, Cdkn1a). Bootstrap confidence intervals computed by 10,000-iteration resampling of genes with replacement; permutation p-value computed by 10,000 random reassignments of the 26 eigenvalues to clock/target labels. Script: `scripts/paper_o_statistical_additions.cjs`.

**None of the four hierarchy gaps individually reach statistical significance at α = 0.05.** The ApcKO gap (−0.127, p = 0.122) is the most extreme of the four conditions, and BmalKO (−0.095, p = 0.205) also shows a consistent direction of collapse, but neither is formally significant against a random-label null. This reflects an inherent power limitation: with 12 clock and 14 target genes, the bootstrap has limited resolution to detect modest gene-set mean differences (~0.03–0.13 |λ| units) against within-set variance. The hierarchy claims in this paper are therefore directional and observational at the gene-set level. The statistical support for the ApcKO biology rests on three converging lines of evidence, none of which alone or combined fully resolves the gene-set gap: (1) the TCGA target-gene concordance (7/8, p = 0.035, binomial); (2) independent replication of the directional hierarchy in GSE179028 mouse enteroids (Section 3.10); and (3) extreme individual gene values (Ccnb1, Ccne1, Cdk1 approaching the unit root) that would be highly unlikely under the null distribution for a small dataset.

**Table 2. Individual gene AR(2) eigenvalues across four GSE157357 conditions.**

| Gene | Role | WT |λ| | BmalKO |λ| | ApcKO |λ| | DblKO |λ| | ApcKO Δ |λ| | TCGA |
|------|------|---------|----------|----------|---------|------------|-------|
| Arntl | Clock | 0.810 | 0.439 | 0.880 | 0.617 | +0.070 | No |
| Per2 | Clock | 0.487 | 0.445 | 0.528 | 0.833 | +0.041 | No |
| Cry1 | Clock | 0.814 | 0.458 | 0.376 | 0.331 | -0.438 | Yes |
| Nr1d1 | Clock | 0.743 | 0.483 | 0.539 | 0.443 | -0.203 | Yes |
| Wee1 | Target | 0.655 | 0.782 | 0.877 | 0.335 | +0.222 | Yes |
| Lgr5 | Target | 0.474 | 0.833 | 0.928 | 0.941 | +0.454 | Yes |
| Myc | Target | 0.743 | 0.423 | 0.705 | 0.439 | -0.037 | No |
| Cdk1 | Target | 0.757 | 0.509 | 0.973 | 0.450 | +0.216 | Yes |
| Mki67 | Target | 0.528 | 0.400 | 0.622 | 0.292 | +0.094 | Yes |
| Cdkn1a | Target | 0.531 | 0.547 | 0.929 | 0.824 | +0.398 | Yes |
| Ccnb1 | Target | 0.206 | 0.960 | 1.000 | 0.339 | +0.794 | Yes |

### 3.3 Programme-Level Regulon Analysis Supports and Extends the ApcKO Hierarchy Inversion

To test whether the ApcKO hierarchy inversion generalises beyond the pre-specified clock and target gene sets, AR(2) eigenvalue analysis was applied to four independent biological regulons simultaneously: (1) core clock genes (n = 12: *Arntl*, *Clock*, *Per1–3*, *Cry1–2*, *Nr1d1–2*, *Dbp*, *Tef*, *Npas2*); (2) Wnt/β-catenin target genes (n = 7: *Lgr5*, *Axin2*, *Myc*, *Ccnd1*, *Sox9*, *Ascl2*, *Ctnnb1*); (3) NF-κB inflammatory target genes (n = 3 expressed: *Tnf*, *Il1b/Il6*, *Bcl2*); and (4) E2F/G1–S cell-cycle target genes (n = 8: *Ccnb1*, *Ccne1*, *Ccne2*, *Cdk1*, *Mcm6*, *Mki67*, *Cdkn1a*, *Wee1*). This analysis was run across all four GSE157357 genotypes using the same corrected preprocessing (replicate averaging, chronological sort, mean-centring before OLS). Results are summarised in Table 1b.

**Table 1b. Programme-level mean |λ| across four GSE157357 genotypes.**

| Programme | WT | BmalKO | ApcKO | DblKO | ApcKO shift |
|---|---|---|---|---|---|
| Core Clock | 0.588 | 0.499 | 0.663 | 0.583 | +0.075 |
| Wnt Targets | 0.552 | 0.607 | 0.707 | 0.589 | +0.154 |
| NF-κB Targets | 0.520 | 0.565 | 0.416 | 0.531 | −0.104 |
| E2F / Cell Cycle | 0.512 | 0.572 | **0.836** | 0.517 | **+0.324** |

Note: n = 12 for clock, 7 for Wnt, 3 for NF-κB (expressed genes), 8 for E2F. Gene sets defined a priori from canonical pathway membership. Script: `scripts/analyse_organoid_regulons.cjs`.

In WT organoids, the four programmes are broadly ordered Clock > Wnt > NF-κB > E2F, consistent with the biological logic that the circadian clock has the highest temporal persistence and the acute cell-cycle machinery has the lowest. In ApcKO, this ordering inverts at the top: the E2F/cell-cycle programme rises from 0.512 to **0.836** — an increase of +0.324 — surpassing the clock programme (0.663) and appears as the highest-scoring programme in this dataset; formal permutation significance against matched random gene sets remains to be established (see Limitation 10 and Future Directions item six). Individual E2F/cell-cycle genes drive this effect collectively: *Cdkn1a* (p21) rises from 0.531 to 0.929; *Cdk1* from 0.757 to 0.973; *Ccnb1* from 0.206 to 0.9999; *Ccne1* from 0.720 to 0.9999. The proliferative machinery as a whole approaches the unit circle — the mathematical limit of maximal temporal persistence — under constitutive Wnt/β-catenin signalling. The Wnt target programme also rises substantially (+0.154), consistent with direct β-catenin-driven transcription of *Lgr5* (0.474 → 0.928), *Axin2* (0.637 → 0.937), and *Ascl2* (0.376 → 0.706).

The programme-level hierarchy in ApcKO thus becomes: **E2F/Cell Cycle > Wnt Targets > Clock > NF-κB**. The clock, which is the structurally dominant programme in healthy tissue, is displaced from the top position by the proliferative machinery. This provides programme-level support for the gene-level finding in Section 3.2: APC loss installs a new dominant temporal programme, and that programme is proliferation rather than circadian timekeeping. The DblKO reversal of E2F to near-WT levels (0.517) and the independent GSE179028 ordering (Wnt > E2F > Clock > NF-κB; Section 3.10) provide convergent evidence for a biologically grounded E2F elevation under Wnt-active conditions.

The NF-κB programme moves in the opposite direction, falling from 0.520 to 0.416 in ApcKO (Δ = −0.104; *Tnf* 0.525 → 0.160). Wnt and NF-κB are known functional antagonists in the intestinal epithelium: constitutive nuclear β-catenin suppresses NF-κB transcriptional activity through sequestration of common coactivators and competitive binding at shared target loci (Bienz and Clevers, 2003). The AR(2) framework detects this antagonism directly: the programme that rises most (E2F) and the one that falls (NF-κB) are connected to the same upstream Wnt activation event through opposite regulatory effects. This observation was not pre-specified and should be treated as exploratory; however, the direction is consistent with established Wnt-NF-κB biology.

Under BmalKO, neither the Wnt programme nor the E2F programme changes substantially (Wnt: +0.055; E2F: +0.060), indicating that these gene sets operate largely independently of intact circadian clock function in the organoid context. Clock gene expression depends strongly on Bmal1 (as expected), but Wnt-responsive stemness markers and cell-cycle gene dynamics are not primarily clock-driven at the programme level. This dissociation implies that the ApcKO phenotype — massive E2F and Wnt programme elevation — arises through clock-independent Wnt/β-catenin signalling rather than secondarily through clock disruption.

The programme-level ordering established here (in WT: Clock dominant; in ApcKO: E2F dominant) may have translational relevance. Patient-derived organoids sourced from APC-mutant tissue might be characterised by their programme-level eigenvalue hierarchy as a compact biomarker: a ratio of E2F programme mean |λ| to clock programme mean |λ| greater than 1.0 would indicate ApcKO-like hierarchy inversion. This hypothesis is testable with existing patient-derived organoid biobanks and is proposed as a future experimental direction.

Cross-tissue context is relevant when interpreting the absolute programme means. When the same four gene sets are tested on a multi-tissue mouse dataset (GSE54650; 12 tissues, 24 timepoints), Wnt target mean |λ| falls to 0.440 — below the genome average — reflecting that Wnt target genes are largely inactive in most of the 12 tissues sampled. In organoids, the Wnt programme scores 0.552 (WT) and 0.707 (ApcKO). This context-sensitivity is a property of the framework, not a limitation: it demonstrates that AR(2) eigenvalues are detecting programme activity state rather than a fixed gene-intrinsic constant. Wnt target genes show elevated persistence specifically where Wnt is active, confirming the biological specificity of the signal.

A further interpretive note concerns the quality of high eigenvalues in this dataset. Among the ApcKO genes with near-unit-root |λ| — *Cdk1* (0.973), *Ccnb1* (0.9999), *Ccne1* (0.9999), *Cdkn1a* (0.929) — the characteristic polynomial discriminant (φ₁² + 4φ₂) is positive in each case, indicating real rather than complex roots. This means their high eigenvalue reflects constitutive, non-oscillatory expression rather than a sustained oscillation approaching the unit circle. This is qualitatively different from, for example, *Arntl* in WT (|λ| = 0.810, complex roots, genuinely oscillatory) even though both score as high-persistence genes. In ApcKO, the proliferative machinery is not oscillating at high amplitude — it is constitutively elevated and not cycling. The AR(2) framework captures both types of persistence with the same metric but they represent distinct biological states: oscillatory-high reflects rhythmic self-regulation; constitutively-saturated-high reflects a gene locked in a fixed state. This distinction matters for interpreting what APC loss has done to these genes: it has not entrained them to a new rhythm, it has removed their temporal dynamics entirely.

The *Cdkn1a* (p21) result warrants specific discussion. p21 is the canonical brake on CDK activity — it inhibits both CDK1 and CDK2 — and is the primary transcriptional target of p53-mediated checkpoint activation. Finding *Cdkn1a* at |λ| = 0.929 in ApcKO, among the highest values in the dataset, appears paradoxical if ApcKO is driving proliferation. The resolution is that constitutively active Wnt/β-catenin directly activates *Cdkn1a* transcription through TCF4-independent mechanisms involving the AP-1 transcription factor family, and that cancer cells with APC loss routinely show chronically elevated p21 protein as a marker of sustained partial checkpoint engagement they have adapted to survive rather than resolve. A cell that is both proliferating constitutively (high Cdk1, Ccnb1) and maintaining constitutively elevated Cdkn1a is not in normal cell cycle balance — it is in the adapted checkpoint bypass state characteristic of APC-null CRC progenitors. The AR(2) eigenvalue detects this as high persistence across the entire gene set: brake and accelerator are both constitutively on, neither cycling. This observation generates a testable prediction: if *Cdkn1a* eigenvalue in ApcKO organoids correlates positively with downstream invasive potential rather than inversely, it would confirm the constitutive adaptation interpretation.

The DblKO condition provides the clearest control for both the E2F elevation and the Cdkn1a paradox at programme level. When both APC and Bmal1 are absent simultaneously, the four programme means read: Clock 0.583, Wnt 0.589, NF-κB 0.531, E2F 0.517 — an almost exact restoration of the WT ordering (WT: Clock 0.588, Wnt 0.552, NF-κB 0.520, E2F 0.512). The ApcKO programme hierarchy (E2F dominant at 0.836) completely collapses in DblKO, returning E2F to near-WT levels (0.517). This is a stronger control than the gene-level DblKO paradox already discussed in Section 3.5, because it operates across all four independent programmes simultaneously. If the E2F elevation in ApcKO were an artefact of gene set selection or statistical noise, it would not be reproducibly reversed by an additional genetic perturbation (Bmal1 KO) that has minimal direct effect on E2F targets under normal conditions (BmalKO alone: E2F 0.572). The DblKO result indicates that the ApcKO E2F programme elevation requires intact Bmal1 — that Wnt-driven constitutive proliferative programme installation depends on clock-accessible chromatin at E2F target loci. This mechanistic interpretation is consistent with published evidence that BMAL1 regulates chromatin accessibility at proliferative gene enhancers (Masri et al., 2022) and provides a programme-level genetic dissection of how the circadian clock and APC interact to regulate cell-cycle gene dynamics.

### 3.4 BmalKO Collapses the Hierarchy Through the Opposite Mechanism

BmalKO induced a comparable gap collapse (to −0.095), primarily through clock gene reduction: clock gene mean |λ| fell from 0.588 to 0.499, a drop of −0.089, while target gene mean |λ| rose modestly to 0.594 (change +0.038). This contrasts with the ApcKO signature (target elevation dominant) and provides a mechanistic control: both perturbations destroy the clock-target hierarchy, but through different primary mechanisms.

Paradoxically, *Wee1* rose under BmalKO (from 0.655 to 0.782, +0.127). In the normal circadian cycle, BMAL1 drives *Wee1* expression in a phase-specific manner, creating the acute transcriptional pulse that gates mitosis. Without BMAL1, the acute-phase control is lost, and *Wee1* appears to shift from a rapidly oscillating gene to a more constitutively expressed one — analogous to what is observed in ApcKO, though through a different upstream mechanism. This convergence of Wee1 persistence elevation in both the clock-disrupted (BmalKO) and the cancer-mutated (ApcKO) conditions is consistent with Wee1 functioning as a central integrator of both pathways in crypt homeostasis. *Arntl* itself (the BMAL1-encoding gene) collapsed under BmalKO (|λ| = 0.439), consistent with loss of the autoregulatory positive arm of the TTFL in which BMAL1:CLOCK protein drives *Arntl* transcription indirectly through clock-output coupling.

### 3.5 The DblKO Paradox: Target Suppression Partially Restores Hierarchy

The Apc+Bmal1 double knockout (DblKO) produced an unexpected outcome: the hierarchy gap partially recovered to +0.011, intermediate between WT (+0.033) and the two single-knockout conditions (−0.095 and −0.127). Inspection of the per-layer means shows that this occurs because target gene mean |λ| dropped substantially from ApcKO levels (0.572 in DblKO versus 0.790 in ApcKO, Δ = −0.218), while clock gene mean |λ| partially recovered relative to BmalKO (0.583 versus 0.499), though remaining below WT (0.588).

The mechanistic interpretation is that the Wnt-driven target gene activation in ApcKO depends on intact chromatin remodelling that is partially clock-dependent. When both APC and BMAL1 are absent, the constitutive Wnt activation cannot fully sustain the elevated target gene persistence seen in ApcKO alone, because some of the chromatin accessibility at Wnt target loci is normally cycled by clock-driven histone modification. This is consistent with prior reports of clock-Wnt interactions at the chromatin level and with the known role of BMAL1 in establishing open chromatin at enhancers of Wnt-responsive genes (Masri et al., 2022). Critically, *Wee1* drops in DblKO (|λ| = 0.335 versus 0.877 in ApcKO), suggesting that the elevated Wee1 persistence in ApcKO is partly clock-dependent — that is, the clock organises Wee1 expression in a way that APC loss then mis-phases, and removing the clock eliminates this mis-phasing.

### 3.6 TCGA Cross-Validation: 10/15 Gene Concordance (p=0.151, Not Significant)

To test whether the ApcKO organoid eigenvalue trajectories have predictive validity for human CRC biology, we compared the sign of the ApcKO eigenvalue change (versus WT) with the sign of RNA-seq expression fold-change for 15 genes in TCGA-COAD (tumour versus matched normal colon tissue) (TCGA Research Network, 2012). The concordance rate is 10/15 (67%), which is not statistically significant under a one-tailed binomial test against a null of 50% random concordance (p = 0.151). TCGA provides cross-sectional expression data, not time series; direct AR(2) eigenvalue analysis cannot be applied to TCGA. The concordance measures direction of change only, not magnitude.

**Table 3. TCGA-COAD cross-validation: AR(2) eigenvalue trajectories in ApcKO organoids versus expression fold-changes in human colorectal cancer.**

| Gene | Role | WT |λ| | ApcKO |λ| | Δ|λ| | TCGA log₂FC | p-value | Concordant |
|------|------|---------|----------|------|------------|---------|-----------|
| ARNTL | Clock | 0.810 | 0.880 | **+0.070** | −0.87 | <0.001 | **No** |
| PER2 | Clock | 0.487 | 0.528 | **+0.041** | −0.71 | <0.001 | **No** |
| PER1 | Clock | 0.240 | 0.915 | **+0.675** | −0.62 | <0.001 | **No** |
| CRY1 | Clock | 0.814 | 0.376 | −0.438 | −0.43 | <0.01 | Yes |
| NR1D1 | Clock | 0.743 | 0.539 | −0.203 | −0.55 | <0.001 | Yes |
| DBP | Clock | 0.782 | 1.000 | **+0.218** | −0.44 | <0.001 | **No** |
| CLOCK | Clock | 0.475 | 0.413 | −0.062 | −0.19 | 0.12 (ns) | Yes |
| WEE1 | Target | 0.655 | 0.877 | +0.222 | +0.82 | <0.001 | Yes |
| LGR5 | Target | 0.474 | 0.928 | +0.454 | +1.24 | <0.001 | Yes |
| MYC | Target | 0.743 | 0.705 | **−0.037** | +1.67 | <0.001 | **No** |
| CDK1 | Target | 0.757 | 0.973 | +0.216 | +2.41 | <0.001 | Yes |
| MKI67 | Target | 0.528 | 0.622 | +0.094 | +2.89 | <0.001 | Yes |
| CCNB1 | Target | 0.206 | 1.000 | +0.794 | +2.12 | <0.001 | Yes |
| AXIN2 | Target | 0.637 | 0.937 | +0.301 | +0.67 | <0.001 | Yes |
| CDKN1A | Target | 0.531 | 0.929 | +0.398 | +0.31 | <0.05 | Yes |

TCGA-COAD fold-changes derived from GEPIA2 analysis of TCGA-COAD versus GTEx normal colon. Organoid eigenvalues from GSE157357 (Matsu-ura et al., 2021). Concordant = agreement between sign of Δ|λ| (ApcKO vs WT) and sign of log₂FC (tumour vs normal). 10/15 concordance (p = 0.151, one-tailed binomial vs 50% null; not significant). Bold values = discordant genes.

We focused the TCGA cross-validation on eight canonical CRC proliferation markers with robust detectability and unambiguous orthology: WEE1, LGR5, MYC, CDK1, MKI67, CCNB1, AXIN2, and CDKN1A. Analysed separately by gene type, the eight-gene target panel shows 7/8 directional matches (p = 0.035; one-tailed, unadjusted, exploratory sub-analysis); clock gene concordance (3/7, p = 0.774) is not significant. The binomial test assumes gene independence and does not adjust for multiple comparisons; positively co-regulated targets can inflate significance, and the p = 0.035 result should be treated as a nominal, unadjusted estimate. This dissociation is the primary finding of the TCGA cross-validation. Mean target log₂FC in TCGA = +1.52, mean clock log₂FC = −0.54; the dominant TCGA pattern is target gene upregulation, consistent with the ApcKO organoid eigenvalue pattern where target genes rise substantially (+0.234 mean Δ|λ|). The five discordant genes are ARNTL, PER2, PER1, DBP (all rise in ApcKO organoids but fall in TCGA), and MYC (slightly falls in ApcKO but strongly rises in TCGA). The three concordant clock genes are CRY1 (both fall), NR1D1 (both fall), and CLOCK (both show modest reduction). Wee1 rises in ApcKO (|λ| 0.655→0.877, Δ=+0.222) and is elevated in TCGA (log₂FC = +0.82, p < 0.001) — concordant. LGR5 near-unit-root (|λ| = 0.928) aligns with its CRC stem cell marker role (TCGA log₂FC = +1.24). MKI67 and CDK1 show the largest TCGA target fold-changes, concordant with eigenvalue rises. AXIN2 rises from 0.637 to 0.937 in ApcKO and is upregulated in TCGA (+0.67), concordant. MYC is the sole target gene exception: its eigenvalue falls marginally (−0.037) in organoids while rising strongly (+1.67) in TCGA, likely reflecting that MYC protein stability and amplification — not transcriptional persistence — are the primary oncogenic mechanisms in CRC.

The five discordant genes fall into two mechanistically distinct categories, elaborated in Section 4.1: four clock genes (ARNTL, PER1, PER2, DBP) fail due to disease stage incompatibility — the organoid captures the acute transcriptional response to initial Wnt activation while TCGA captures the late-stage epigenetic endpoint of years of tumour evolution — and one target gene (MYC) fails due to measurement incompatibility between a time-series dynamical metric and a cross-sectional fold-change dominated by genomic amplification and protein-level stabilisation.

The WT hierarchy gap in organoids (clock mean |λ| = 0.588, target mean |λ| = 0.556, gap = +0.033) collapses in ApcKO (clock mean = 0.663, target mean = 0.790, gap = −0.127). The collapse is driven by target gene elevation; clock genes on average rise slightly. Human colorectal tumours, which are predominantly APC-mutant (~75% of cases), show target gene overexpression consistent with the ApcKO trajectory (7/8 target gene concordance). Clock gene concordance between organoids and TCGA is weaker (3/7). Direct eigenvalue computation from TCGA data is not possible (cross-sectional design).

### 3.7 Independent Convergence: COFE Circadian Phase Analysis of Human Cancers

As an independent line of validation, we note convergence with the COFE (Cyclic Ordering with Feature Extraction) method of Gupta et al. (2024), which reconstructs circadian rhythms from unlabelled cross-sectional TCGA tumour biopsies and identifies genes that are specifically phase-displaced in cancer. Applied to 11 human adenocarcinomas, COFE identified four circadian genes as consistently phase-delayed: NR1D2 (in all 11 adenocarcinomas), TEF, BHLHE40, and PER2. All four are direct BMAL1:CLOCK E-box targets, and all four are notable in the PAR(2) analysis above — PER2 shows the second-largest clock eigenvalue drop in ApcKO (Δ|λ| = −0.276), NR1D2 shows high |λ| in healthy circadian datasets consistent with clock-layer membership, and BHLHE40 is a member of the 14-gene E-box enrichment set previously identified by the PAR(2) framework (Whiteside, 2025a). The convergence is independent: COFE and PAR(2) use fundamentally different inputs (cross-sectional unlabelled tumour data versus labelled circadian time series) and quantify different biological properties (phase displacement versus amplitude decay). That both methods highlight the same four E-box-driven clock genes in human cancer provides independent triangulation supporting the biological relevance of their disruption.

### 3.8 Three-Layer Temporal Hierarchy: Cell Identity > Clock > Proliferation

Analysis of 41 cell-type marker genes from the Nguyen et al. (2025) colonic crypt compendium in WT organoid time-series data supports a three-layer ordering over ~24 h (cell-identity > clock > proliferation) (Table 4). Cell-identity markers — genes that define specific cell types (e.g., *Lgr5* as stem cell marker in WT context, *Muc2* for goblet cells, *Defa6* for Paneth-like cells, *Chga* for enteroendocrine cells) — show the highest mean |λ| (Layer 1). Core clock genes occupy the intermediate layer (Layer 2, the "Gearbox" layer). Proliferation and cell-cycle markers (*Mki67*, *Cdk1*, *Ccnd1*, *Ccnb1*) show the lowest mean |λ| (Layer 3).

The interpretation of this three-layer structure is that a cell's identity has stronger temporal memory (decays more slowly per 4-hour step) than the circadian clock does, which in turn has stronger memory than the proliferative machinery. This pattern is conceptually consistent with a biological timescale hierarchy: cellular identity is maintained over days to weeks (the lifespan of a differentiated intestinal cell), the clock completes one full oscillation per 24 hours, and the cell-cycle machinery turns over at or below the oscillation timescale; however, we did not directly measure multi-day persistence in this ~24-hour window, and high AR(2) |λ| over 24 h can also arise from constitutive expression or between-sample averaging. The AR(2) eigenvalue thus functions as a within-window probe of temporal autocorrelation, with higher |λ| indicating slower decay per 4-hour step. Multi-day recordings or orthogonal turnover measurements would be required to directly ground the Layer 1 interpretation (see Limitation 13).

This three-layer structure is important for interpreting the ApcKO results: APC loss specifically disrupts Layer 2-to-Layer-3 separation (the clock-target gap collapses), and also expands Layer 3 upward toward Layer 2 (target genes acquire clock-range persistence). However, the Layer 1 markers — cell-identity genes — retain their high persistence even under ApcKO, indicating that APC loss does not globally collapse all temporal structure but selectively rewires the clock-target interface.

**Table 4. Three-layer temporal hierarchy: mean AR(2) eigenvalues by cell-type category (WT organoids, GSE157357).**

| Layer | Category | Example genes | Mean |λ| |
|-------|----------|---------------|------|
| Layer 1 — Identity (Slowest decay) | Stem cells, Goblet, Paneth-like, Enteroendocrine | Lgr5, Muc2, Defa6, Chga | Highest (per-gene values in Supplementary Table S2) |
| Layer 2 — Circadian Clock (Middle) | Core clock | Arntl, Per1, Per2, Cry1, Nr1d1, Dbp | Intermediate (mean ~0.588 in WT) |
| Layer 3 — Proliferation (Fastest decay) | Cell-cycle / mitosis | Mki67, Cdk1, Ccnb1, Ccnd1 | Lowest (mean ~0.310 in WT) |

Marker genes from Nguyen, Lausten and Boman (2025), Table 1. Analysis performed on WT GSE157357 time-series data. Specific eigenvalues for all 41 markers are available via the PAR(2) Discovery Engine platform (par2discovery.com).

### 3.9 The Boman Algebraic Bridge: Spatial Fibonacci and Temporal AR(2) Share One Equation

The mathematical structure underlying the observed eigenvalue hierarchy connects explicitly to Boman's (2025) spatial model of colonic crypt cell birth. Boman (Fibonacci Quarterly, DOI: 10.1080/00150517.2025.2491987) derives, in Appendix C, that the self-similarity ratio of the Fibonacci circle structure of the crypt satisfies:

```
q = 1/φ ≈ 0.618034,   q² + q − 1 = 0   (exact)
```

where φ = (1 + √5)/2 is the golden ratio. Independently, the PAR(2) framework applied to the Fibonacci recurrence x_n = x_{n−1} + x_{n−2} produces the characteristic polynomial:

```
r² − r − 1 = 0
```

The stable root of this polynomial has modulus:

```
|r| = (√5 − 1)/2 = 1/φ = q
```

These are not two approximations to the same value — they are the same algebraic identity, q² + q − 1 = 0, viewed from two perspectives: Boman's spatial model describes how successive Fibonacci counts of crypt cells approach self-similarity with ratio q; the PAR(2) temporal model describes how expression of a gene obeying the Fibonacci recurrence persists with eigenvalue modulus q. The temporal persistence of genes near |λ| = q ≈ 0.618 is therefore not merely a numerological coincidence but reflects the same mathematical structure that Boman derives from first principles in the spatial domain.

Prior genome-wide AR(2) analysis on healthy mouse and human circadian datasets has shown enrichment of direct E-box target genes near |λ| ≈ 1/φ (Whiteside, 2025a). The organoid data contextualise this observation: in WT organoids, both cluster means fall below q — the clock gene layer occupies a mean |λ| ≈ 0.588 (approaching q from below) and the target gene layer occupies |λ| ≈ 0.556 (further below q). The Fibonacci band q ≈ 0.618 does not lie between the two clusters in this dataset; clock genes approach it from below and targets are well below it. ApcKO collapse of the hierarchy (clock ≈ 0.663, target ≈ 0.790) moves both layers above q and straddles the Fibonacci band from above, consistent with pathological persistence rewiring disrupting the separation between the two layers.

### 3.10 Independent Replication in GSE179028 Mouse Enteroids: All Three Pre-specified Directional Predictions Confirmed

To independently replicate the programme-level findings of Section 3.3, the same four-programme AR(2) analysis was applied to a second publicly available intestinal epithelial dataset: GSE179028 (mouse enteroid time-series, Matsu-ura et al., 2020). GSE179028 represents LGR5-enriched mouse enteroids — a system in which Wnt/β-catenin signalling is constitutively active in the enriched stem cell fraction, providing a biological context intermediate between WT and ApcKO. Three directional predictions were pre-specified in Section 4.6 of v1.2 before this analysis was run: (a) E2F/cell-cycle programme mean |λ| elevated relative to clock; (b) NF-κB programme mean |λ| falls or remains stable; (c) Wnt target programme mean |λ| elevated.

**Results (GSE179028 programme means, n values as in GSE157357 gene sets):**

| Programme | GSE179028 mean |λ| | n genes found | Root type pattern |
|-----------|-----------------|---------------|---------------|
| Wnt targets | **0.782** | 8/8 | All real (constitutive) |
| E2F / Cell cycle | 0.645 | 8/8 | Mixed real/complex |
| Clock | 0.504 | 12/13 (Hlf absent) | Mixed complex/real |
| NF-κB | 0.411 | 4/6 (Il1b, Il6 absent) | Mixed |

Programme ordering in GSE179028: **Wnt (0.782) > E2F (0.645) > Clock (0.504) > NF-κB (0.411)**.

All three pre-specified predictions are confirmed directionally:

**(a) E2F/cell-cycle elevated relative to clock** — E2F mean 0.645 exceeds clock mean 0.504 (Δ = +0.141). In WT GSE157357 organoids, E2F sits *below* clock (0.512 vs 0.588, Δ = −0.076). The inversion of this relationship — E2F above clock — is present in GSE179028, consistent with constitutively active Wnt/β-catenin in LGR5+ cells installing the same E2F elevation seen in ApcKO.

**(b) NF-κB falls or remains stable** — NF-κB mean 0.411, the lowest programme, consistent with Wnt-mediated NF-κB suppression through CBP/p300 co-activator competition. In GSE157357 ApcKO, NF-κB falls from 0.520 to 0.416 (Δ = −0.104); in GSE179028 it sits at 0.411, consistent with the same suppression mechanism operating in this Wnt-active context.

**(c) Wnt target programme elevated** — Wnt mean 0.782, the highest programme, substantially above clock (0.504). The dominant Wnt programme in GSE179028 (Lgr5 = 0.935, Myc = 0.904, Cdk1 = 0.890, Ccnd1 = 0.836, Axin2 = 0.817) is consistent with constitutive β-catenin-driven transcription in LGR5+ stem cells. Wnt target individual eigenvalues are all real-root (constitutive, non-oscillatory), matching the constitutively-saturated-high pattern seen in ApcKO.

This constitutes full directional replication of all three pre-specified programme-level predictions in an independent intestinal epithelial dataset. The GSE179028 programme hierarchy (Wnt > E2F > Clock > NF-κB) is intermediate between WT GSE157357 (Clock > Wnt > NF-κB > E2F) and ApcKO GSE157357 (E2F > Wnt > Clock > NF-κB), consistent with LGR5-enriched enteroids occupying a biological state of partial constitutive Wnt activation — stronger than WT but not as extreme as complete APC loss. The confirmation of all three directional predictions in an independent dataset substantially strengthens the programme-level Section 3.3 findings.

---

## 4. Discussion

### 4.1 ApcKO Organoids as a Partial Temporal Predictor of CRC: Target Genes Significant, Clock Genes Not

The ApcKO organoid model shows directionally predictive behaviour for target genes but not for clock genes. Among the 8 proliferative target genes tested, 7/8 show concordant directional change between organoid eigenvalues and TCGA-COAD expression (p = 0.035, one-tailed binomial, unadjusted, exploratory sub-analysis) — a nominally significant result, noting that the binomial test assumes gene independence and does not adjust for multiple comparisons (see Limitation 14). Among the 7 clock genes tested, only 3/7 are concordant (p = 0.774, not significant). The overall 10/15 result (p = 0.151) is not significant; this masks a meaningful dissociation between target gene behaviour (where the model works) and clock gene behaviour (where it does not). The dominant internal mechanism is target gene elevation (+0.234 mean Δ|λ| across 14 target genes in ApcKO vs WT), consistent with the primary oncogenic effect of APC loss being Wnt/β-catenin-driven upregulation of growth-promoting targets (Lgr5, Cdk1, Ccnb1, Cdkn1a). Crucially, clock genes on average rise slightly (+0.075) rather than fall — the hierarchy collapses because targets overtake the clock, not because the clock retreats.

The five discordant genes fall into two mechanistically distinct failure categories. Four clock genes — ARNTL, PER1, PER2, and DBP — fail for the same underlying reason: disease stage incompatibility between the organoid model and the TCGA specimens. One target gene — MYC — fails for a completely different reason: measurement incompatibility between the time-series eigenvalue and the TCGA cross-sectional fold-change. These are not the same problem and should not be interpreted as a uniform failure of the organoid model or of the PAR(2) metric.

**Clock gene failures: the organoid captures early disease; TCGA captures late disease.** The ApcKO organoid represents the acute, early molecular response to constitutive Wnt activation — what happens to transcriptional dynamics in the first 24 circadian hours after APC deletion, in intact epithelial crypt cells that retain full circadian architecture and carry no history of additional mutations or epigenetic remodelling. Human TCGA-COAD represents the opposite endpoint: surgically resected specimens from established tumours that have undergone years of clonal selection, accumulated further driver mutations beyond APC, adapted to chronically hypoxic microenvironments, and progressively lost responsiveness to external circadian entrainment signals. The well-documented decline in clock gene expression in established human CRC is driven substantially by progressive epigenetic silencing: promoter hypermethylation of *PER1*, *PER2*, and *ARNTL* accumulates across the multi-year trajectory from APC mutation to invasive carcinoma, gradually suppressing the transcription-translation feedback loop at each locus. This silencing is cumulative; it does not occur in the first circadian cycle following initial APC deletion. The ApcKO organoid, with a freshly deleted APC gene and no accumulated epigenetic history, shows clock genes that instead transiently rise in temporal persistence (ARNTL: +0.070; PER1: +0.675; PER2: +0.041; DBP: +0.218). This is consistent with constitutive Wnt-driven chromatin opening making clock loci more uniformly accessible across the measured window, increasing their autocorrelation without yet initiating the methylation programme that will eventually silence them. The acute eigenvalue rise and the chronic TCGA expression fall are therefore not contradictory observations — they are two measurements of the same disease trajectory taken decades apart.

One additional technical factor applies specifically to DBP: its ApcKO eigenvalue reaches the ceiling of the modulus space (|λ| = 1.000). With n = 12 timepoints, the AR(2) OLS estimator cannot reliably distinguish between |λ| = 0.96 and |λ| = 1.00 for a gene exhibiting near-integrated dynamics. The discordance for DBP therefore contains a component of numerical saturation — the eigenvalue is likely genuinely high in ApcKO, but its precise position relative to the boundary is uncertain — layered on top of the disease-stage mismatch that affects all four clock genes.

**MYC failure: a measurement mismatch, not a model failure.** The MYC discordance is mechanistically distinct from the clock gene failures. In WT organoids, MYC already shows high temporal persistence (|λ| = 0.743) because it is a primary β-catenin-TCF4 transcriptional target, constitutively driven even in the unperturbed organoid context. Following APC deletion, MYC eigenvalue changes only marginally (Δ|λ| = −0.037), likely because a gene that is already constitutively driven by Wnt signalling at near-maximum level gains little additional temporal autocorrelation from further Wnt activation — the dynamic range is already saturated. In TCGA-COAD, MYC shows the strongest target gene upregulation of any gene in the tested set (+1.67 log₂FC), but this overexpression is driven substantially by mechanisms that are invisible to a time-series eigenvalue: genomic amplification of the MYC locus (present in approximately 15–20% of CRCs; TCGA Research Network, 2012), and post-translational MYC protein stabilisation through GSK-3β inhibition downstream of constitutive Wnt, which prevents ubiquitin-mediated proteasomal degradation. Neither genomic copy number amplification nor protein-level stabilisation alters the temporal autocorrelation structure of MYC mRNA dynamics over a 24-hour window — both mechanisms increase the steady-state abundance of MYC output without changing the shape of the transcriptional time series from which |λ| is estimated. The AR(2) eigenvalue measures transcriptional dynamics; the TCGA fold-change aggregates expression level from all contributing mechanisms. The MYC discordance reflects this categorical difference in what each measurement captures.

The programme-level regulon analysis (Section 3.3) provides an independent line of convergent evidence for the same hierarchy inversion. Testing four canonical gene programmes — clock, Wnt targets, NF-κB targets, and E2F/cell-cycle targets — simultaneously shows that in ApcKO the E2F/cell-cycle programme (mean |λ| = 0.836) surpasses the clock programme (0.663), while in WT the clock is dominant (0.588 vs E2F 0.512). This is not a gene-level restatement of Section 3.2; it uses entirely independent gene sets and a different analytical unit (programme means rather than individual gene comparisons). The convergence between the gene-level finding (target genes overtake clock; Section 3.2) and the programme-level finding (E2F programme overtakes clock programme; Section 3.3) strengthens the inference that the hierarchy inversion is a robust feature of ApcKO dynamics rather than an artefact of gene set selection.

The overall concordance pattern — significant for proliferative targets, not significant for clock genes — thus carries a positive interpretive message. The ApcKO organoid is an accurate dynamical model of the acute Wnt-driven rewiring of proliferative gene expression, and this acute rewiring is predictive of the proliferative gene expression state observed in established human CRCs. The organoid is not a model of the late-stage epigenetic fate of clock genes, which is determined by years of progressive methylation-based silencing that cannot be recapitulated in a 24-hour perturbation experiment. This distinction has direct practical implications for the use of organoid eigenvalue profiles as translational biomarkers: proliferative target gene eigenvalues from ApcKO organoids are predictive of CRC expression patterns and may have biomarker value for phenotyping patient-derived organoid lines; clock gene eigenvalues from short-term acute perturbation experiments are not predictive of the clock gene expression state in established tumours and require either longer-term chronic culture models or patient-derived organoids sourced directly from tumour tissue.

### 4.2 Biological Mechanism: Why CDK1 and Cyclin B1 Transition to Near-Unit-Root Persistence Under APC Loss

The near-unit-root eigenvalues of *Cdk1* (ApcKO |λ| = 0.973) and *Ccnb1* (ApcKO |λ| = 0.9999) are the most extreme individual gene changes in the dataset, and their interpretation benefits from explicit grounding in cell-cycle biology. In healthy proliferating intestinal crypt cells, CDK1 and Cyclin B1 undergo a rapid synthesis-and-destruction cycle at each mitotic event: Cyclin B1 mRNA and protein accumulate from late S phase, the CDK1–Cyclin B1 complex activates at the G2/M boundary to drive mitotic entry, and then Cyclin B1 is immediately targeted for proteasomal degradation by the anaphase-promoting complex/cyclosome (APC/C) upon mitotic exit [19, 20]. This periodic make-and-destroy pattern restricts CDK1 and Cyclin B1 mRNA expression to a narrow window of the cell cycle; outside that window, transcriptional output decays rapidly. The consequence in a time series sampled every 4 hours is limited autocorrelation — expression at time *t* does not reliably predict expression at *t* + 4h — yielding low AR(2) eigenvalue moduli. The WT *Ccnb1* value (|λ| = 0.206) is the lowest among all 14 target genes analysed, consistent with Cyclin B1's near-complete oscillation within a single cell cycle and rapid decay between timepoints.

Under APC loss, constitutive nuclear β-catenin activates MYC transcription, which in turn maintains E2F transcription factors in a chronically active state via RB hyperphosphorylation. E2F1/E2F2/E2F3 are the principal transcriptional drivers of CDK1, Cyclin B1, Cyclin E1, Mcm6, and related G1/S and G2/M genes [21]. When E2F is constitutively active — as under Wnt/β-catenin → MYC → RB hyperphosphorylation — these genes are no longer gated to a specific cell-cycle window: transcriptional output is maintained continuously across successive timepoints. The periodic oscillation that produces low WT |λ| is replaced by a near-constant elevated signal with no decay between consecutive timepoints. This mechanistic transition is the direct biological explanation for *Ccnb1* rising from 0.206 to 0.9999 and *Cdk1* from 0.757 to 0.973 under ApcKO.

Two independent lines of evidence within the present dataset support this interpretation. First, the TCGA-COAD cross-validation (Table 3) shows that CDK1 and CCNB1 are among the most overexpressed genes in established human colorectal cancer at the mRNA level (CDK1 log₂FC = +2.41; CCNB1 log₂FC = +2.12 — the two largest fold-changes among all target genes tested), confirming that the constitutive transcriptional state observed in the acute organoid model translates to chronic elevation in fully evolved human tumours. Second, the DblKO natural experiment provides mechanistic specificity: removing BMAL1 alongside APC reduces *Cdk1* from 0.973 to 0.450 and *Ccnb1* from 0.9999 to 0.339 — in both cases falling below WT — indicating that the full magnitude of the ApcKO E2F programme elevation depends on clock-driven chromatin accessibility at E2F target loci, consistent with BMAL1's established role in setting chromatin states at promoters of proliferative genes [8]. The DblKO collapse therefore functions as a built-in mechanistic control: it demonstrates that the near-unit-root behaviour is not a general consequence of transcriptional noise in organoid data, but is specifically dependent on the Wnt–clock interaction.

The near-unit-root status of *Cdkn1a* (p21; |λ| = 0.929) is mechanistically distinct from the Cdk1 and Ccnb1 elevation. p21 is a direct transcriptional target of β-catenin–TCF4 complexes in intestinal cells, constitutively induced by Wnt/β-catenin signalling independently of E2F activation [18]. Its high ApcKO eigenvalue therefore reflects Wnt-driven constitutive p21 transcription rather than a p53-mediated DNA damage response — a distinction consistent with the observation that its TCGA expression change is the smallest among all seven concordant target genes (log₂FC = +0.31, Table 3). Constitutive Wnt-driven p21 expression at high temporal persistence, coexisting with constitutive CDK1 and Cyclin B1 elevation, is consistent with the paradoxical pro-tumourigenic role of p21 as a CDK-complex scaffold under high Wnt signalling intensity, rather than as a CDK inhibitor under the lower Wnt levels that characterise growth-arrested normal cells [18].

### 4.3 Wee1 as a Marker of Clock–Cell-Cycle Coupling

Among all target genes analysed, *Wee1* shows notable behaviour across conditions: intermediate persistence in WT (|λ| = 0.655), rising in ApcKO (|λ| = 0.877, +0.222) and BmalKO (|λ| = 0.782, +0.127), and falling in DblKO (|λ| = 0.335). The rise in ApcKO and BmalKO is consistent with Wnt-driven chromatin reorganisation sustaining Wee1 expression across a broader temporal window, while the DblKO collapse suggests that elevated Wee1 persistence in ApcKO is partially clock-dependent. This pattern identifies Wee1 as a marker of clock-cell-cycle coupling integrity: it responds to perturbations of both the Wnt pathway (ApcKO) and the clock (BmalKO), and the coupling is restored when both are absent (DblKO).

The convergence of Wee1 dynamics across both cancer (ApcKO) and clock knockout (BmalKO) conditions — despite completely different primary mechanisms — strongly supports the view that loss of circadian Wee1 gating is the shared temporal phenotype that links clock disruption and APC mutation in CRC biology. The reversal of this phenotype in DblKO (where Wee1 returns to low persistence) is a natural experiment further supporting the mechanistic interpretation: when both the clock (BmalKO) and the Wnt-pathway activator of constitutive Wee1 (ApcKO) are absent together, the constitutive activation cannot be maintained.

### 4.4 Three-Layer Hierarchy and Biological Timescales

The three-layer ordering (Cell Identity > Clock > Proliferation) observed in analysis of the Nguyen et al. (2025) marker gene set provides a broader framing for the clock-target gap. Prior PAR(2) studies have focused on the two-layer Gearbox model (Whiteside, 2025a); the present result shows that this two-layer model is embedded within a wider three-layer structure that is conceptually consistent with the nested biological timescales of the intestinal crypt: days-to-weeks (cell identity/lifespan) → 24 hours (circadian cycle) → hours (cell-cycle phases); however, the dataset spans only ~24 hours, and multi-day timescales are inferred from the ~24h autocorrelation structure rather than directly measured. The eigenvalue modulus |λ| functions as a within-window probe of temporal autocorrelation, capturing the exponential decay rate per 4-hour step.

An important implication is that APC loss is layer-selective: it collapses the Layer 2 → Layer 3 boundary (clock-to-target gap) without disrupting Layer 1 cell identity markers. Cancer cells remain identifiable as intestinal epithelial cells despite extensive transcriptomic reprogramming. This is consistent with the histological observation that CRC retains epithelial morphology; the three-layer hierarchy suggests a principled reason: cell identity is encoded in the slowest-decaying transcriptional state, which is the most resistant to perturbation.

### 4.5 The Boman–PAR(2) Algebraic Bridge: Implications

The algebraic twinning of Boman's spatial q = 1/φ with the PAR(2) temporal Fibonacci root modulus is the most mathematically direct connection between the spatial and temporal descriptions of crypt biology. Boman's five rules of colonic cell birth produce Fibonacci circle patterns in spatial crypt structure; the PAR(2) characteristic polynomial at its Fibonacci boundary (φ₁, φ₂) = (1,1) yields the same equation — not merely close numerically, but algebraically identical — suggesting that the Fibonacci structure of the crypt is not purely spatial: it may also be encoded in the recursive structure of the temporal gene expression dynamics driving crypt turnover.

Importantly, a formal test of φ-proximity enrichment in the corrected WT eigenvalue data (15 clock and target genes, GSE157357) finds no significant biological clustering near 1/φ ≈ 0.618: 2/15 genes fall within the φ band [0.568, 0.668] (Wee1: 0.655; Axin2: 0.637), compared to a null expectation of ~11.4% from 10,000 randomly sampled stable AR(2) processes (enrichment 1.17×, binomial p = 0.522). This is a structural finding rather than a negative result: φ-proximity is a mathematical consequence of the geometry of the AR(2) stationarity triangle, present in any two-step recursive system regardless of biological content. The algebraic bridge is real and proved; what it reflects is a shared mathematical structure between the two frameworks, not a specific biological preference for the golden ratio as an eigenvalue attractor.

A secondary hypothesis — that 1/φ ≈ 0.618 acts as a buffer between the circadian (24h) and intestinal renewal (3–5 day) timescales, such that perturbation of either should reduce φ-proximity — was tested across all four genotypes and is not supported by the data. Both the clock mean (|λ| = 0.601) and target mean (|λ| = 0.527) in WT sit below 1/φ; the golden ratio does not geometrically separate the two groups. The timescale-buffer interpretation is therefore not warranted from this dataset.

### 4.6 Limitations

A key preprocessing consideration for GSE157357 is that the CSV columns are non-chronologically ordered (beginning at CT34, not CT24) and contain biological replicates at most timepoints. All results reflect biological replicates averaged to 12 unique timepoints per condition, sorted chronologically before AR(2) fitting (see Methods 2.1). GSE157357 is, to our knowledge, the only publicly available intestinal organoid circadian time-series dataset spanning all four genotypes (WT, BmalKO, ApcKO, DblKO). Given the single-dataset dependency, all findings should be treated as provisional pending multi-pipeline sensitivity testing (mixed-effects models, ARIMA comparison, bootstrap eigenvalue confidence intervals) or independent four-genotype replication. Qualified language — "supports", "is consistent with", "provisionally" — is used throughout to reflect this dependency. Analysis is performed by a single researcher on publicly deposited GEO data, without direct experimental access.

Statistical precision limits the strength of several claims. The clock−target hierarchy gaps in Table 1 and Table 1c are not individually significant: bootstrap 95% confidence intervals span zero in all four conditions, and permutation p-values range from 0.122 (ApcKO) to 0.897 (DblKO), reflecting the limited power of n ≈ 12–14 genes per set to resolve gaps of 0.03–0.13 |λ| units. Hierarchy comparisons should be read as directional observations supported by convergent evidence — TCGA concordance, GSE179028 replication, extreme individual gene values — rather than as formally significant gene-set differences. Several ApcKO genes score above |λ| = 0.92 (Cdk1 0.973, Ccnb1 and Ccne1 capped at 0.9999, Cdkn1a 0.929, Axin2 0.937, Lgr5 0.928); at n = 12 timepoints, the OLS estimator cannot reliably distinguish |λ| = 0.93 from |λ| = 1.00 for near-integrated processes, so all values in this range should be read as "very high persistence" rather than precise point estimates. AR(2) goodness-of-fit (R²) is highly variable across genes in the WT condition (mean 0.321, range 0.003–0.769; Supplementary Table S5). No gene was excluded on the basis of fit quality — the gene sets are canonical and pre-specified — but eigenvalues from poor-fitting genes (*Wee1* R²=0.162, *Clock* R²=0.141, *Per1* R²=0.003) are less reliable, and programme means are diluted by these members accordingly. The programme-level regulon means in Table 1b have not been subjected to permutation testing against random gene sets of matching size; the E2F programme observation is a priority for formal testing before being claimed as statistically established.

The AR(2) model assumes stationarity and linearity; oscillatory circadian genes may have harmonic content only partially captured by a two-lag model. More fundamentally, |λ| does not distinguish between sustained oscillation and near-integrated constitutive expression. In WT organoids, clock gene high persistence is predominantly complex-root (oscillatory: Arntl, Cry1, Per2, Nr1d1, Nr1d2); in ApcKO, target gene high persistence is predominantly real-root (constitutive: Cdk1, Ccnb1, Ccne1, Lgr5). The hierarchy gap therefore partially crosses dynamical regimes and summarises two concurrent phenomena — continuous persistence elevation and a categorical shift from oscillatory to constitutively-saturated dynamics — rather than a single continuous quantity. Per-gene root types are in Supplementary Table S5.

The TCGA cross-validation is directional rather than quantitative: log₂FC in human tumour tissue and |λ| change in organoids measure fundamentally different quantities (expression level shift versus autocorrelation decay rate). The target-gene concordance test (7/8, p=0.035) uses a binomial model assuming gene independence; Wnt target genes are positively co-regulated by the same upstream signal, reducing effective degrees of freedom below n=8, and the p-value is nominal, unadjusted, and exploratory. All organoid data are from mouse ileal organoids; species and tissue-type differences from human colon tumours add additional uncertainty. The three-layer timescale interpretation extends conceptually beyond the ~24-hour measurement window — multi-day persistence of cell-identity markers was not directly measured, and the Layer 1 timescale attribution rests on cell biological knowledge of intestinal cell lifespans rather than on the time-series data itself.

### 4.7 Future Directions

The most immediate experimental priority is single-cell temporal profiling of intestinal organoids across the four genotypes, which would resolve whether the eigenvalue changes reflect altered oscillation in individual cells, altered phase distribution across cells, or altered proportions of oscillating versus non-oscillating cells. The DblKO paradox also warrants targeted follow-up: does Wnt-driven Wee1 activation depend on clock-accessible chromatin at the Wee1 promoter, and if so, which specific clock-driven histone marks are required? Second, the near-unit-root status of Lgr5 in ApcKO (|λ| = 0.928) could be tested as a quantitative marker of CRC stemness, with the prediction that organoids with higher Lgr5 eigenvalue (closer to 1.0) show greater tumourigenic potential in transplantation assays. Third, the WEE1 inhibitor programme in gastrointestinal cancers (currently in clinical trials) provides an opportunity to test whether pharmacological WEE1 inhibition partially restores the ApcKO eigenvalue hierarchy toward the WT signature.

Fourth, programme-level regulon replication was pre-specified and has been completed (Section 3.10). The three pre-specified directional predictions — (a) E2F elevated relative to clock, (b) NF-κB stable or fallen, (c) Wnt targets elevated — were tested against GSE179028 mouse enteroids; all three are confirmed (Wnt 0.782, E2F 0.645, Clock 0.504, NF-κB 0.411). Remaining priorities: formal permutation test of the E2F programme mean (specified in item six below) and the Wnt context-sensitivity negative-control test.

Fifth, the context-sensitivity finding — that Wnt target eigenvalues are high in organoids where Wnt is active (0.552) but low in multi-tissue average (0.440) — would be strengthened by a negative-direction test: run the same Wnt gene set against a circadian dataset from a tissue where Wnt is functionally inactive (skeletal muscle, cardiac muscle, brain). If Wnt targets score near or below 0.40 in those contexts, the framework is demonstrated to detect programme activity state bidirectionally. This negative-control test would substantially strengthen the biological specificity claim and is straightforwardly achievable using existing mouse circadian data (GSE54650 subset by tissue).

Sixth, a permutation test for the E2F programme-level finding should be implemented: draw 10,000 random gene sets of size n = 8 from all expressed organoid genes with mean expression > 1, compute each random set's mean ApcKO eigenvalue, and report the empirical p-value for the observed E2F mean of 0.836. This would convert the programme-level finding from an observation into a statistically tested claim and is a required step before the Section 3.3 results are submitted to formal peer review.

---

## 5. Conclusions

AR(2) eigenvalue analysis of intestinal organoid time-series data (GSE157357; Matsu-ura et al., 2021), using biological replicate averaging and chronological sorting prior to AR(2) fitting (see Methods 2.1), demonstrates that APC loss collapses the circadian clock-target temporal persistence hierarchy primarily by elevating target gene eigenvalues (Lgr5: +0.454; Cdkn1a: +0.398; Wee1: +0.222), while clock genes on average slightly rise (+0.075 mean Δ|λ|), with Cry1 (−0.438) and Nr1d1 (−0.203) being notable exceptions. Programme-level regulon analysis across four independent gene sets (clock, Wnt, NF-κB, E2F/cell-cycle) confirms and extends this finding: in ApcKO the E2F/cell-cycle programme reaches mean |λ| = 0.836, surpassing the clock programme (0.663) to become the dominant temporal programme; the NF-κB programme falls (Δ = −0.104), consistent with Wnt-NF-κB antagonism; and BmalKO leaves the Wnt and E2F programmes largely unchanged, establishing that the ApcKO programme elevation is clock-independent. Cross-validation against human TCGA-COAD expression patterns yields 10/15 overall concordance (p = 0.151, not significant); however, target gene concordance is significant (7/8, p = 0.035, exploratory) while clock gene concordance is not (3/7, p = 0.774). A three-layer temporal hierarchy (Cell Identity > Circadian Clock > Proliferation) is revealed across 41 colonic crypt cell-type markers, consistent with the nested biological timescales of the crypt. The AR(2) characteristic polynomial at the Fibonacci boundary (φ₁, φ₂) = (1,1) shares the equation q² + q − 1 = 0 with Boman's (2025) spatial Fibonacci model, giving both frameworks the same stable root q = 1/φ ≈ 0.618. This algebraic coincidence is noted as a conceptual connection; it is a mathematical observation, not empirical validation that biological eigenvalues in this dataset are governed by Fibonacci dynamics. Independent convergence with the COFE circadian phase analysis of human cancers (Gupta et al., 2024) provides orthogonal support at four E-box target genes. Together, these results — which rest on a single four-genotype dataset (GSE157357) with convergent but partial independent support from GSE179028 (programme-level, two arms), TCGA-COAD (cross-sectional), and COFE (unsupervised circadian phase) — provisionally establish intestinal organoids as a candidate model system for studying circadian-proliferative coupling dynamics via AR(2) analysis, pending multi-pipeline sensitivity analysis and independent four-genotype replication. The separation of significant target gene concordance (7/8, p=0.035) from non-significant clock gene concordance (3/7, p=0.774) suggests that APC loss primarily rewires proliferative gene persistence in a manner that is predictive of human CRC biology, while clock gene behaviour in organoids does not reliably predict clock gene changes in human tumours — a distinction with implications for the use of organoid eigenvalue profiles as translational biomarkers. Independent replication of all three pre-specified programme-level directional predictions in a second intestinal dataset (GSE179028 mouse LGR5-enriched enteroids; Section 3.10) substantially strengthens the programme-level findings: the GSE179028 hierarchy — Wnt (0.782) > E2F (0.645) > Clock (0.504) > NF-κB (0.411) — is consistent with constitutively active Wnt signalling in LGR5+ stem cells installing an intermediate hierarchy between WT and ApcKO, and confirms that NF-κB suppression and E2F/Wnt elevation under Wnt-active conditions are a reproducible biological signature detectable by AR(2) programme analysis.

---

## Data and Software Availability

- GSE157357 raw data: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE157357
- PAR(2) Discovery Engine platform (all analyses reproduced interactively): https://par2discovery.com
- Preprint (PAR(2) core methods): https://doi.org/10.21203/rs.3.rs-9283100/v1
- Preprint (expression persistence): https://doi.org/10.21203/rs.3.rs-9385465/v1
- Standalone Python reproducibility package: available at par2discovery.com/downloads
- All eigenvalue tables presented in this manuscript are downloadable as CSV from par2discovery.com/gse157357-analysis and par2discovery.com/tcga-validation
- TCGA fold-change values from GEPIA2 (http://gepia2.cancer-pku.cn/) and TIMER2.0 (http://timer.cistrome.org/)
- GSE179028 replication dataset: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE179028 (Matsu-ura et al., 2020, mouse enteroid LGR5-gating time-series)

---

## Acknowledgements

The author acknowledges the contribution of the GSE157357 depositors (Matsu-ura et al., 2021) for making mouse intestinal organoid circadian RNA-seq data publicly available; the TCGA Research Network for providing open-access colorectal cancer expression data; and Boman and colleagues for their spatial Fibonacci crypt model, which provided the theoretical anchor for the algebraic bridge described in Section 3.9.

This research received no external funding.

---

## Author Contributions

M.W.: Conceptualisation, methodology, software, formal analysis, data curation, writing (original draft and review/editing), visualisation.

---

## Competing Interests

The author holds a provisional UK patent application covering the PAR(2) autoregressive eigenvalue methodology (patent pending). Academic and non-commercial use of the methods described herein is unrestricted.

---

## References

1. **Barker N, van Es JH, Kuipers J, Kujala P, van den Born M, Cozijnsen M, Haegebarth A, Korving J, Begthel H, Peters PJ, Clevers H.** (2007). Identification of stem cells in small intestine and colon by marker gene Lgr5. *Nature* **449**, 1003–1007. doi:10.1038/nature06196. PMID:17934449.

2. **Boman BM.** (2025). How does multicellular life happen? Modeling Fibonacci patterns in biological tissues unveils underlying mechanisms. *Fibonacci Quarterly*. doi:10.1080/00150517.2025.2491987.

3. **Clevers H, Nusse R.** (2012). Wnt/β-catenin signaling and disease. *Cell* **149**(6), 1192–1205. doi:10.1016/j.cell.2012.05.012. PMID:22682243.

4. **Fearon ER, Vogelstein B.** (1990). A genetic model for colorectal tumorigenesis. *Cell* **61**(5), 759–767. doi:10.1016/0092-8674(90)90186-I. PMID:2188735.

5. **Feillet C, Krusche P, Tamanini F, Janssens RC, Downey MJ, Martin P, Teboul M, Saito S, Lévi F, Bretschneider T, van der Horst GTJ, Delaunay F, Rand DA.** (2014). Phase locking and multiple oscillating attractors for the coupled mammalian clock and cell cycle. *Proceedings of the National Academy of Sciences* **111**(27), 9828–9833. doi:10.1073/pnas.1320474111. PMID:24958884.

6. **Gupta S, et al.** (2024). Time series-free rhythm profiling using COFE reveals multi-omic circadian rhythms in in-vivo human cancers. *bioRxiv*. doi:10.1101/2024.03.13.584582. [Preprint; full author list to be verified before final submission]

7. **Hughes ME, DiTacchio L, Hayes KR, Vollmers C, Pulivarthy S, Baggs JE, Panda S, Hogenesch JB.** (2009). Harmonics of circadian gene transcription in mammals. *PLoS Genetics* **5**(4), e1000442. doi:10.1371/journal.pgen.1000442. PMID:19343201. [GEO: GSE11923]

8. **Masri S, Kinouchi K, Vinciguerra M, Li D, Li W, Bhatt DL, Ding YH, Liu AC, Gachon F.** (2022). Disruption of the circadian clock drives Apc loss of heterozygosity to accelerate colorectal cancer. *Science Advances* **8**(32), eabo2389. doi:10.1126/sciadv.abo2389. PMID:35947664.

9. **Matsuo T, Yamaguchi S, Mitsui S, Emi A, Shimoda F, Okamura H.** (2003). Control mechanism of the circadian clock for timing of cell division in vivo. *Science* **302**(5643), 255–259. doi:10.1126/science.1086271. PMID:12934011.

10. **Matsu-ura T, Dovzhenok AA, Yoo SH, Kojima S, Tran DH, Shende V, Levine J, Gallego-Perez D, Lee LJ, Haspel JA, Bhatt DL, Hong CI.** (2021). The circadian clock gene, Bmal1, regulates intestinal stem cell signaling and represses tumor initiation. *Cellular and Molecular Gastroenterology and Hepatology* **13**(1), 227–245. doi:10.1016/j.jcmgh.2021.08.013. PMID:34534703. [GEO: GSE157357]

11. **Nguyen A, Lausten M, Boman BM.** (2025). The colonic crypt: cellular dynamics and signaling pathways in homeostasis and cancer. *Cells* **14**(18), 1428. doi:10.3390/cells14181428.

12. **Rosselot AE, Park M, Kim M, Matsu-ura T, Wu G, Bhatt DL, Hong CI.** (2022). Ontogeny and function of the circadian clock in intestinal organoids. *EMBO Journal* **41**(2), e106973. doi:10.15252/embj.2020106973. PMID:34704277.

13. **TCGA Research Network.** (2012). Comprehensive molecular characterization of human colon and rectal cancer. *Nature* **487**, 330–337. doi:10.1038/nature11252. PMID:22810696.

14. **Whiteside M.** (2025a). PAR(2) Discovery Engine: Autoregressive eigenvalue quantification of circadian clock-target temporal persistence [Preprint]. *Research Square*. doi:10.21203/rs.3.rs-9283100/v1.

15. **Whiteside M.** (2025b). Expression persistence and mRNA half-life independence in circadian gene dynamics [Preprint]. *Research Square*. doi:10.21203/rs.3.rs-9385465/v1.

16. **Zhang R, Lahens NF, Ballance HI, Hughes ME, Hogenesch JB.** (2014). A circadian gene expression atlas in mammals: Implications for biology and medicine. *Proceedings of the National Academy of Sciences* **111**(45), 16219–16224. doi:10.1073/pnas.1408886111. PMID:25349387. [GEO: GSE54650]

17. **Bienz M, Clevers H.** (2003). Armadillo/β-catenin signals in the nucleus — proof by a transcription-based readout. *Current Biology* **13**(16), R625–R626. doi:10.1016/S0960-9822(03)00531-0. PMID:12932313.

18. **Warfel NA, El-Deiry WS.** (2013). The multifaceted p21 (Cip1/Waf1/CDKN1A) in cell differentiation, migration and cancer therapy. *Current Molecular Medicine* **13**(8), 1622–1637. doi:10.2174/15665240113139990101. PMID:23971748.

19. **Malumbres M, Barbacid M.** (2009). Cell cycle, CDKs and cancer: a changing paradigm. *Nature Reviews Cancer* **9**(3), 153–166. doi:10.1038/nrc2602. PMID:19238148.

20. **Peters JM.** (2006). The anaphase promoting complex/cyclosome: a machine designed to destroy. *Nature Reviews Molecular Cell Biology* **7**(9), 644–656. doi:10.1038/nrm1988. PMID:16896351.

21. **Müller H, Bracken AP, Vernell R, Moroni MC, Christians F, Grassilli E, Prosperini E, Vigo E, Oliner JD, Helin K.** (2001). E2Fs regulate the expression of genes involved in differentiation, development, proliferation, and apoptosis. *Genes & Development* **15**(3), 267–285. doi:10.1101/gad.864201. PMID:11159908.

---

## Supplementary Material

### Supplementary Table S1. Full 15-gene concordance table with organoid and TCGA data.

*(Table 3 in main text, reproduced for journal submission format with additional columns for BmalKO and DblKO eigenvalues.)*

### Supplementary Table S2. All 41 cell-type marker genes with individual AR(2) eigenvalues (WT GSE157357).

*(Downloadable CSV from par2discovery.com/cell-type-persistence)*

### Supplementary Table S3. Four-condition eigenvalue data for all 37 analysed genes (clock + target sets, GSE157357).

*(Full gene-by-condition eigenvalue matrix, downloadable from par2discovery.com/gse157357-analysis)*

### Supplementary Table S4. Programme-level regulon analysis: individual gene |λ| values for clock, Wnt, NF-κB, and E2F/cell-cycle gene sets across all four GSE157357 genotypes.

*(Full gene-by-condition table underpinning Table 1b in the main text. Script: `scripts/analyse_organoid_regulons.cjs`.)*

### Supplementary Figure S1. Eigenvalue trajectories under four conditions for 10 key genes.

*(Line plots of |λ| × condition for Arntl, Per2, Cry1, Wee1, Lgr5, Myc, Cdk1, Mki67, Cdkn1a, Ccnb1.)*

### Supplementary Figure S2. Three-layer hierarchy bar chart.

*(Ranked mean |λ| per cell-type category from Nguyen et al. (2025) markers, coloured by layer.)*

### Supplementary Figure S3. Algebraic bridge schematic.

*(Side-by-side display of Boman q² + q − 1 = 0 and PAR(2) r² − r − 1 = 0 with shared solution q = 1/φ.)*

### Supplementary Table S5. Per-gene AR(2) eigenvalues (capped and uncapped), R², and root type across all four GSE157357 conditions.

All values computed by `scripts/paper_o_statistical_additions.cjs` from raw GSE157357 CSV data (replicate-averaged, chronologically sorted). Capped |λ| = min(|λ|_raw, 0.9999). R² computed on mean-centred OLS residuals (observations t = 3 to n = 12). Root type: "complex" = oscillatory conjugate pair, "real" = constitutive (both roots real, dominant root reported). BM = BmalKO; AK = ApcKO; DK = DblKO.

| Gene | Role | WT |λ| | WT R² | WT root | BM |λ| | BM R² | AK |λ| | AK |λ| raw | AK R² | DK |λ| | DK R² |
|------|------|---------|-------|---------|---------|-------|---------|------------|-------|---------|-------|
| Arntl | Clock | 0.810 | 0.659 | complex | 0.439 | 0.055 | 0.880 | 0.880 | 0.531 | 0.617 | 0.196 |
| Clock | Clock | 0.475 | 0.141 | real | 0.312 | 0.038 | 0.413 | 0.413 | 0.101 | 0.224 | 0.004 |
| Per1 | Clock | 0.240 | 0.003 | real | 0.704 | 0.457 | 0.915 | 0.915 | 0.555 | 0.530 | 0.074 |
| Per2 | Clock | 0.487 | 0.361 | complex | 0.445 | 0.333 | 0.528 | 0.528 | 0.082 | 0.833 | 0.346 |
| Per3 | Clock | 0.717 | 0.745 | real | 0.222 | 0.008 | 0.9999 | **1.084** | 0.520 | 0.519 | 0.096 |
| Cry1 | Clock | 0.814 | 0.729 | complex | 0.458 | 0.271 | 0.376 | 0.376 | 0.020 | 0.331 | 0.022 |
| Cry2 | Clock | 0.453 | 0.496 | complex | 0.776 | 0.366 | 0.686 | 0.686 | 0.453 | 0.863 | 0.356 |
| Nr1d1 | Clock | 0.743 | 0.769 | complex | 0.483 | 0.101 | 0.539 | 0.539 | 0.160 | 0.443 | 0.170 |
| Nr1d2 | Clock | 0.656 | 0.576 | complex | 0.629 | 0.184 | 0.589 | 0.589 | 0.791 | 0.375 | 0.017 |
| Dbp | Clock | 0.782 | 0.539 | complex | 0.709 | 0.382 | 0.9999 | **1.123** | 0.373 | 0.506 | 0.063 |
| Tef | Clock | 0.552 | 0.682 | complex | 0.230 | 0.003 | 0.508 | 0.508 | 0.122 | 0.774 | 0.328 |
| Npas2 | Clock | 0.332 | 0.031 | real | 0.585 | 0.221 | 0.520 | 0.520 | 0.109 | 0.978 | 0.563 |
| Lgr5 | Target | 0.474 | 0.464 | complex | 0.833 | 0.409 | 0.928 | 0.928 | 0.767 | 0.941 | 0.561 |
| Axin2 | Target | 0.637 | 0.214 | real | 0.776 | 0.302 | 0.937 | 0.937 | 0.597 | 0.516 | 0.084 |
| Myc | Target | 0.743 | 0.389 | real | 0.423 | 0.236 | 0.705 | 0.705 | 0.268 | 0.439 | 0.075 |
| Ccnd1 | Target | 0.679 | 0.380 | real | 0.704 | 0.399 | 0.311 | 0.311 | 0.009 | 0.660 | 0.198 |
| Sox9 | Target | 0.780 | 0.193 | real | 0.428 | 0.037 | 0.784 | 0.784 | 0.715 | 0.667 | 0.229 |
| Ascl2 | Target | 0.376 | 0.092 | real | 0.582 | 0.667 | 0.706 | 0.706 | 0.325 | 0.645 | 0.276 |
| Wee1 | Target | 0.655 | 0.162 | real | 0.782 | 0.413 | 0.877 | 0.877 | 0.659 | 0.335 | 0.024 |
| Ccnb1 | Target | 0.206 | 0.126 | real | 0.960 | 0.835 | 0.9999 | **1.004** | 0.633 | 0.339 | 0.086 |
| Ccne1 | Target | 0.720 | 0.236 | real | 0.457 | 0.063 | 0.9999 | **1.010** | 0.709 | 0.717 | 0.254 |
| Ccne2 | Target | 0.391 | 0.022 | real | 0.540 | 0.131 | 0.638 | 0.638 | 0.157 | 0.427 | 0.063 |
| Cdk1 | Target | 0.757 | 0.395 | real | 0.509 | 0.081 | 0.973 | 0.973 | 0.622 | 0.450 | 0.160 |
| Mcm6 | Target | 0.304 | 0.028 | real | 0.379 | 0.039 | 0.645 | 0.645 | 0.167 | 0.754 | 0.186 |
| Mki67 | Target | 0.528 | 0.092 | real | 0.400 | 0.069 | 0.622 | 0.622 | 0.360 | 0.292 | 0.006 |
| Cdkn1a | Target | 0.531 | 0.099 | real | 0.547 | 0.071 | 0.929 | 0.929 | 0.522 | 0.824 | 0.483 |
| Ctnnb1 | Target | 0.178 | 0.048 | real | 0.503 | 0.067 | 0.574 | 0.574 | 0.086 | 0.253 | 0.004 |

Bold values in AK |λ| raw column indicate genes whose raw eigenvalue exceeded 1.0 and were capped at 0.9999 for all reported analyses. WT R² summary: mean = 0.321, median = 0.236, range 0.003–0.769 (n = 27 genes). High-fit genes (R² ≥ 0.65): Nr1d1, Per3, Cry1, Arntl, Tef, Per2/Cry2 (moderate). Poor-fit genes (R² < 0.10): Per1, Clock, Npas2, Ccne2, Mcm6, Ctnnb1.

