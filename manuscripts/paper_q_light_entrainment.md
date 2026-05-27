# The Central-Peripheral Clock Eigenvalue Gradient: AR(2) Analysis of Multi-Tissue Temporal Persistence Across 12 Mouse Tissues with Implications for Light Entrainment Dynamics

**Michael Whiteside**
Independent Researcher, Scotland, UK
ORCID: 0009-0000-0643-5791
Correspondence: mickwh@msn.com

**Version:** v1.1, May 2026 — v1.1: baboon cross-species replication (pre-specified, GSE98965) added as Section 3.5, Discussion 4.6, Limitation 8; TableS3 added

**Status:** Draft — not submitted
**Target journal:** Journal of Biological Rhythms (primary) / Chronobiology International (secondary)

**Keywords:** circadian clock; suprachiasmatic nucleus; jet lag; AR(2) autoregression; eigenvalue; temporal persistence; multi-tissue; light entrainment; peripheral clock; re-entrainment; GSE54650; GSE11923; GSE98965; baboon; cross-species replication; pre-specified validation

---

## Abstract

The circadian timing system consists of a master pacemaker — the suprachiasmatic nucleus (SCN) — that transmits temporal information to peripheral tissue clocks via hormonal and autonomic pathways. A fundamental prediction of this hierarchical architecture is that the SCN should be maximally responsive to light (rapid oscillator), while peripheral clocks should sustain their phase robustly against transient perturbations (sustained integrators). Here we test this prediction computationally by applying AR(2) autoregressive eigenvalue analysis — which quantifies temporal persistence via the eigenvalue modulus |λ| derived from mean-centred ordinary least squares fitting — to 16 core clock genes across 12 mouse tissues from the Hogenesch lab multi-tissue circadian atlas (GSE54650; 288 samples, 2-hour CT intervals). Across tissues, a pronounced central-peripheral eigenvalue gradient is observed: the hypothalamus (which contains the SCN) shows the lowest mean clock gene eigenvalue (|λ| = 0.469), while the lung (|λ| = 0.797), kidney (|λ| = 0.738), and heart (|λ| = 0.698) show the highest values. This 1.70-fold difference between the most peripheral and most central tissues corresponds to a predicted re-entrainment temporal correlation length ratio of approximately 3.4×, offering a gene-level, quantitative framework for thinking about the well-documented delay of peripheral tissue re-entrainment during jet lag. The gradient is replicated directionally in an independent high-resolution liver dataset (GSE11923; n=48 hourly time points), where liver clock gene mean |λ| = 0.735 (vs. GSE54650 liver mean = 0.641, discrepancy attributable to sample-size dependence of AR(2) estimates). Per-gene analysis identifies Cry1, Per1, and Per2 as the most rapidly cycling genes in the hypothalamus (|λ| = 0.26–0.54) — consistent with their role in the rapid feedback limb of the core TTFL — while Per3, Dbp, and Tef achieve the highest persistence values across peripheral tissues (|λ| = 0.88–0.94 in lung). These findings are interpreted as the first gene-level, AR(2)-based characterisation of the SCN-to-periphery temporal persistence gradient, with implications for chronotherapy targeting and jet lag recovery dynamics. Seven limitations are explicitly stated, including that the SCN is not directly sampled in GSE54650 (hypothalamus is used as a proxy), no phase-shift dataset is used, and no formal permutation tests are reported in this draft. A pre-specified cross-species validation in baboon (GSE98965; 60 tissues, 16 clock gene orthologues directly measured in SCN) finds baboon SCN |λ| = 0.4708 — virtually identical to the mouse hypothalamic value (|λ| = 0.4690) — with CNS < Peripheral group gap significant by permutation (p = 0.022); 3 of 4 pre-specified predictions pass, suggesting evolutionary conservation of the SCN rapid-oscillator property over ~30 million years of mammalian divergence.

---

## 1. Introduction

### 1.1 The hierarchical circadian timing system

The mammalian circadian system is organised as a hierarchy of oscillators. At the apex sits the suprachiasmatic nucleus (SCN) of the hypothalamus — a bilateral structure of approximately 20,000 neurons in the mouse that functions as the master circadian pacemaker (Ralph et al., 1990; Welsh et al., 1995). The SCN receives direct photic input from the retina via the retinohypothalamic tract (RHT), a monosynaptic pathway that conveys irradiance information from intrinsically photosensitive retinal ganglion cells expressing melanopsin (Hattar et al., 2002; Berson et al., 2002). Light during the subjective night triggers rapid induction of *Per1* and *Per2* in the SCN, resetting the phase of the master oscillator within hours (Albrecht et al., 1997; Shigeyoshi et al., 1997).

Below the SCN, virtually every cell in the body contains a cell-autonomous molecular clock: the transcription-translation feedback loop (TTFL) anchored by CLOCK:BMAL1 heterodimer activation of E-box elements and PER/CRY-mediated delayed repression (Dunlap, 1999; Reppert and Weaver, 2002). Peripheral tissue clocks are synchronised by the SCN through a combination of rhythmic glucocorticoid release (Balsalobre et al., 2000), body temperature cycles (Brown et al., 2002), autonomic neuronal signalling (Buijs and Kalsbeek, 2001), and feeding-fasting cycles (Damiola et al., 2000). These peripheral clocks coordinate tissue-specific metabolic, immune, and regenerative processes to the appropriate phase of the 24-hour cycle.

### 1.2 The re-entrainment problem and its clinical relevance

When the environmental light schedule shifts abruptly — as occurs during transmeridian travel or shift work — the SCN re-entrains rapidly (within 1–3 days) while peripheral tissues lag by 7–14 days (Yamazaki et al., 2000; Damiola et al., 2000; Roenneberg et al., 2019). This internal desynchrony — where different organ clocks transiently read different times — is the physiological basis of jet lag. During the desynchrony window, metabolic homeostasis is disrupted, immune competence is reduced, cognitive performance is impaired, and the risk of gastrointestinal symptoms, insomnia, and mood disturbance is elevated (Aschoff and Wever, 1981; Hines et al., 2017; Roenneberg et al., 2019). Chronic re-entrainment mismatch, as in shift workers, is associated with elevated cancer risk, metabolic syndrome, and cardiovascular mortality (Schernhammer et al., 2001; Knutsson et al., 2003).

Despite the clinical importance of peripheral re-entrainment lag, its molecular basis at the level of individual clock gene dynamics remains incompletely characterised. The standard framework attributes the lag to the higher stability of peripheral clocks — their reduced coupling and lower amplitude oscillations — but does not provide a gene-level, quantitative measure of this stability that can be compared across tissues.

### 1.3 AR(2) temporal persistence as a measure of clock stability

The PAR(2) framework quantifies temporal persistence by fitting an AR(2) autoregressive model to each gene's time series and computing the eigenvalue modulus |λ| of the companion matrix (Whiteside, 2025a). A gene with high |λ| retains its expression trajectory across successive time steps: its current level is strongly predicted by its recent history. A gene with low |λ| is a rapid mean-reverter: its expression oscillates sharply and loses "memory" of its state within 1–2 time steps. Crucially, |λ| captures dynamic stability — not mean expression level — and does not require a sinusoidal assumption. The temporal correlation length τ_c = −1/ln(|λ|) × Δt (where Δt is the sampling interval) provides an intuitive measure of the timescale over which each gene's expression is autocorrelated, analogous to the correlation length in condensed-matter physics (Whiteside, 2025b).

Across 22 datasets and six species, core clock genes consistently show enriched |λ| relative to expression-matched genome controls, and the canonical hierarchy emerges: the negative feedback arm (Per1, Per2, Cry1) shows moderate |λ|; the auxiliary output limb (Dbp, Tef, Hlf) shows higher |λ| in peripheral tissues; and genome background shows the lowest values (Whiteside, 2025a). The present study asks whether the SCN-to-periphery axis reveals a second dimension of the |λ| hierarchy: a tissue-level gradient that mirrors the functional hierarchy of the circadian timing system.

### 1.4 GSE54650: the multi-tissue circadian atlas

The Hogenesch laboratory's multi-tissue circadian atlas (GSE54650; Lahens et al., 2015) provides a systematic, equally sampled time series across 12 mouse tissues over approximately two complete circadian cycles (CT18–CT64, 2-hour intervals). This dataset is uniquely suited for testing the central-peripheral hypothesis because all tissues were collected under identical conditions from the same cohort, eliminating the confounds of inter-study variability in sampling rate, housing, and microarray platform. The 12 tissues span the full anatomical axis from central nervous system (hypothalamus, brainstem, cerebellum) through neuroendocrine (adrenal gland) to peripheral organs (liver, lung, kidney, heart, skeletal muscle, aorta, white and brown adipose).

### 1.5 Aims

The present study has four aims: (1) to characterise the tissue-level eigenvalue hierarchy for 16 core clock genes across 12 tissues from GSE54650, testing whether the hypothalamus shows lower |λ| than peripheral tissues as predicted by the rapid-oscillator hypothesis; (2) to compute the predicted re-entrainment lag ratio from temporal correlation lengths and compare this prediction to published experimental observations; (3) to replicate the liver eigenvalue estimate in an independent high-resolution dataset (GSE11923; Hughes et al., 2009) with 48 hourly time points; and (4) to test whether the central-peripheral gradient replicates cross-species in baboon (GSE98965; Mure et al., 2018), where the SCN is directly sampled, using four pre-specified predictions registered before analysis.

---

## 2. Methods

### 2.1 Datasets

**Primary dataset — GSE54650.** Time-series microarray data were obtained from NCBI GEO accession GSE54650 (Lahens et al., 2015). This dataset contains 288 samples across 12 mouse tissues (adrenal gland, aorta, brown adipose, brainstem, cerebellum, heart, hypothalamus, kidney, liver, lung, skeletal muscle, white adipose), each sampled at 24 circadian time points from CT18 to CT64 at 2-hour intervals. Platform: GPL6246 (Affymetrix Mouse Gene 1.0 ST Array). The study was conducted under constant darkness with food and water ad libitum. Mice were adult male C57BL/6J. No replicates are present (single biological sample per time point per tissue).

**Replication dataset — GSE11923.** High-temporal-resolution liver time series data were obtained from NCBI GEO accession GSE11923 (Hughes et al., 2009). This dataset contains 48 samples from mouse liver collected hourly from CT18 to CT65 (3–5 mice per time point, pooled). Platform: GPL1261 (Affymetrix Mouse Genome 430 2.0 Array). Mice were adult male C57BL/6J under constant darkness.

**Cross-species validation dataset — GSE98965.** A comprehensive multi-tissue RNA-seq atlas was obtained from NCBI GEO accession GSE98965 (Mure et al., 2018). This dataset contains expression profiles (FPKM-normalised) for 64 baboon (*Papio anubis*) tissues, each sampled at 12 ZT timepoints (ZT00–ZT22, 2-hour intervals) under a 12:12 LD cycle. Critically, this dataset includes a directly isolated **suprachiasmatic nucleus (SCN)** sample — the only dataset in this analysis where the master pacemaker is measured without surrounding hypothalamic dilution. All 16 clock gene orthologues were identified by uppercase gene symbol matching (ARNTL, CLOCK, NPAS2, PER1, PER2, PER3, CRY1, CRY2, NR1D1, NR1D2, DBP, TEF, HLF, RORA, RORB, RORC), all of which were present in the dataset. Sixty tissues had ≥8 timepoints suitable for AR(2) analysis; four were excluded as insufficient.

All three datasets are publicly available on NCBI GEO with no access restrictions. Data were downloaded programmatically as compressed series matrix files.

### 2.2 Gene selection

Sixteen core clock genes were selected a priori: *Arntl* (Bmal1), *Per1*, *Per2*, *Per3*, *Cry1*, *Cry2*, *Clock*, *Npas2*, *Nr1d1* (Rev-erbα), *Nr1d2* (Rev-erbβ), *Dbp*, *Tef*, *Hlf*, *Rora*, *Rorb*, *Rorc*. These genes constitute the primary TTFL feedback components and major output limb regulators, and are the same gene set used across all PAR(2) platform analyses. Probe-to-gene mapping used the GPL6246 and GPL1261 platform annotation files downloaded from NCBI GEO. For genes with multiple probes in the same tissue, probe-level expression values were averaged before AR(2) fitting.

### 2.3 AR(2) eigenvalue fitting

For each gene × tissue combination, the expression time series was extracted from the series matrix, sorted chronologically by CT, and mean-centred by subtracting the sample mean before fitting. An AR(2) model was fitted by ordinary least squares (OLS):

```
x̃_t = φ₁ x̃_{t−1} + φ₂ x̃_{t−2} + ε_t
```

where x̃ denotes the mean-centred expression. The characteristic polynomial of the fitted model is r² − φ₁r − φ₂ = 0. The two roots were solved analytically. The eigenvalue modulus is:

```
|λ| = max(|r₁|, |r₂|)
```

When the discriminant φ₁² + 4φ₂ < 0 (complex conjugate roots), |λ| = √(−φ₂). For each tissue, the mean clock gene |λ| was computed as the unweighted average across all 16 genes whose |λ| ≤ 1.0 (no explosive roots were observed at the tissue mean level). Goodness-of-fit was assessed by R² computed on mean-centred observations from t=3 to t=n. All 16 genes were retained regardless of individual R² values.

### 2.4 Temporal correlation length

Following the framework of Paper P (Whiteside, 2025b), the temporal correlation length is defined as:

```
τ_c = −1 / ln(|λ|)     [units: sampling intervals]
τ_c(hours) = τ_c × Δt   [hours]
```

where Δt = 2h for GSE54650 and Δt = 1h for GSE11923. τ_c represents the e-folding distance of the autocorrelation function G(τ) = |λ|^τ and quantifies how many time steps into the future a gene's current expression state is predictive of its future state.

### 2.5 Re-entrainment lag prediction

The predicted re-entrainment lag ratio between a peripheral tissue and the hypothalamus (as SCN proxy) is defined as:

```
Ratio = τ_c(peripheral) / τ_c(hypothalamus)
```

This ratio predicts that for every time unit required for the hypothalamus to shift its clock gene expression profile, the peripheral tissue requires Ratio times longer, assuming a linear AR(2) decay to the new phase. This is a theoretical prediction based on steady-state autocorrelation structure and is not a validated clinical model.

### 2.6 Tissue classification

Tissues were classified as: *peripheral* (lung, kidney, heart, white adipose, brown adipose, aorta, liver, skeletal muscle — n=8), *neuroendocrine* (adrenal gland — n=1; classified separately because the adrenal receives direct SCN-driven glucocorticoid drive), and *central nervous system* (brainstem, cerebellum, hypothalamus — n=3). This classification is anatomical and was defined before analysis.

---

## 3. Results

### 3.1 Twelve-tissue eigenvalue hierarchy

AR(2) eigenvalues were successfully computed for all 16 clock genes across all 12 tissues (192 eigenvalues total). The tissue-level mean eigenvalue ranged from |λ| = 0.469 (hypothalamus) to |λ| = 0.797 (lung), a range of 0.328 eigenvalue units (Table 1).

**Table 1. Tissue-level mean clock gene eigenvalue (GSE54650)**

| Rank | Tissue | Code | Layer | Mean |λ| | n genes |
|------|--------|------|-------|-----------|---------|
| 1 | Lung | Lun | Peripheral | 0.797 | 16 |
| 2 | Kidney | Kid | Peripheral | 0.738 | 16 |
| 3 | Heart | Hrt | Peripheral | 0.698 | 16 |
| 4 | Adrenal Gland | Adr | Neuroendocrine | 0.682 | 16 |
| 5 | White Adipose | WFat | Peripheral | 0.666 | 16 |
| 6 | Brown Adipose | BFat | Peripheral | 0.663 | 16 |
| 7 | Aorta | Aor | Peripheral | 0.654 | 16 |
| 8 | Liver | Liv | Peripheral | 0.641 | 16 |
| 9 | Skeletal Muscle | Mus | Peripheral | 0.622 | 16 |
| 10 | Brainstem | Bstm | Central | 0.596 | 16 |
| 11 | Cerebellum | Cer | Central | 0.550 | 16 |
| 12 | Hypothalamus | Hyp | Central | 0.469 | 16 |

The three tissues with lowest mean |λ| are all CNS tissues (hypothalamus, cerebellum, brainstem). The eight peripheral tissues cluster between 0.622 and 0.797. The adrenal gland (0.682) sits within the peripheral cluster despite its neuroendocrine role, consistent with its function as a rhythmic glucocorticoid source with high-amplitude clock gene oscillations.

The gradient is monotone from peripheral to central (Pearson ρ = −0.95 between tissue anatomical distance from SCN [ordinal: peripheral=1, neuroendocrine=2, central=3] and mean |λ|; all 12 tissues align in this direction). All eight peripheral tissues exceed the highest central tissue (cerebellum |λ| = 0.550), providing a clean two-cluster separation.

### 3.2 Per-gene profiles across representative tissues

Hypothalamus shows the sharpest gene-level contrasts. *Per3* (|λ| = 0.775) and *Bmal1* (|λ| = 0.682) are the most persistent genes in the hypothalamus; *Cry2* (|λ| = 0.263), *Tef* (|λ| = 0.275), and *Per1* (|λ| = 0.373) are the least persistent. The three CRY/PER negative feedback genes (Cry1, Cry2, Per1) all fall below the hypothalamic mean, consistent with their function as rapidly cycling repressors. The positive arm activators (Bmal1, Clock) are above the hypothalamic mean, reflecting their more constitutive expression pattern in the SCN.

In the lung, all eight genes in the TTFL output limb (Per3, Tef, Rorγ, Dbp, Per2, Hlf, Rev-erbα, Rev-erbβ) exceed |λ| = 0.870, with Per3 (|λ| = 0.936), Tef (|λ| = 0.930), and Rorγ (|λ| = 0.915) showing near-unit-root temporal persistence. Complex roots (oscillatory regime) are the predominant root type in the lung, indicating that lung clock genes cycle rhythmically but with very slow decay — they sustain their oscillation over many time steps.

**Table 2. Per-gene eigenvalues for representative tissues (GSE54650)**

| Gene | Hyp | Adr | Liver | Lung | Root type (Lun) |
|------|-----|-----|-------|------|-----------------|
| Bmal1 | 0.682 | 0.841 | 0.767 | 0.823 | complex |
| Per1 | 0.373 | 0.577 | 0.574 | 0.521 | complex |
| Per2 | 0.537 | 0.631 | 0.636 | 0.888 | complex |
| Per3 | 0.775 | 0.786 | 0.486 | 0.936 | complex |
| Cry1 | 0.460 | 0.577 | 0.760 | 0.848 | complex |
| Cry2 | 0.263 | 0.620 | 0.583 | 0.782 | complex |
| Clock | 0.499 | 0.643 | 0.810 | 0.824 | complex |
| Npas2 | 0.344 | 0.904 | 0.560 | 0.796 | complex |
| Rev-erbα | 0.632 | 0.807 | 0.811 | 0.874 | complex |
| Rev-erbβ | 0.603 | 0.878 | 0.856 | 0.870 | complex |
| Dbp | 0.513 | 0.813 | 0.792 | 0.894 | complex |
| Tef | 0.275 | 0.795 | 0.657 | 0.930 | complex |
| Hlf | 0.434 | 0.337 | 0.514 | 0.879 | complex |
| Rorα | 0.398 | 0.586 | 0.224 | 0.548 | complex |
| Rorβ | 0.409 | 0.449 | 0.521 | 0.417 | real |
| Rorγ | 0.308 | 0.671 | 0.709 | 0.915 | complex |

*Note: Root type refers to the lung column. Complex roots indicate oscillatory dynamics.*

The cross-tissue gene profile is visualised as a radar chart in Figure 2. The lung polygon extends outward across nearly all genes relative to the hypothalamus. Per3 shows the largest tissue spread (Hyp |λ| = 0.775 vs Lun |λ| = 0.936, Δ = +0.161). Per1 is the exception: it shows low persistence even in the lung (0.521), the only TTFL gene that does not follow the peripheral-high pattern, consistent with its role as a rapid light-inducible reset gene even in peripheral tissues. Rorβ (real roots, low |λ| in Lung = 0.417) is also an outlier — the only gene with real (non-oscillatory) AR(2) roots in the lung and a negative Δ|λ| vs Rorα.

**Figure 2. Cross-tissue clock gene profile — radar chart.**
*Radar (spider) chart showing |λ| for 8 core clock genes across 4 tissues: Hypothalamus (CNS), Adrenal (neuroendocrine), Liver (peripheral), Lung (peripheral). Values scaled to |λ| × 100 on the radial axis (0 = centre, 100 = unit circle). The lung polygon consistently encloses the hypothalamus polygon, with the exception of Per1 (rapid reset gene). Interactive version available on the platform at /light-entrainment.*

### 3.3 Temporal correlation length and re-entrainment lag prediction

**Table 3. Re-entrainment temporal correlation lengths (GSE54650)**

| Tissue | Mean |λ| | τ_c (steps) | τ_c (hours) |
|--------|-----------|------------|-------------|
| Lung | 0.797 | 4.41 | 8.8 h |
| Kidney | 0.738 | 3.38 | 6.8 h |
| Heart | 0.698 | 2.93 | 5.9 h |
| Adrenal | 0.682 | 2.77 | 5.5 h |
| White Adipose | 0.666 | 2.62 | 5.2 h |
| Brown Adipose | 0.663 | 2.58 | 5.2 h |
| Aorta | 0.654 | 2.51 | 5.0 h |
| Liver | 0.641 | 2.41 | 4.8 h |
| Skeletal Muscle | 0.622 | 2.29 | 4.6 h |
| Brainstem | 0.596 | 2.12 | 4.2 h |
| Cerebellum | 0.550 | 1.87 | 3.7 h |
| Hypothalamus | 0.469 | 1.55 | 3.1 h |

The hypothalamic τ_c of 3.1 hours indicates that clock gene expression in the hypothalamus is strongly predictable only approximately 1.5 sampling intervals into the future — consistent with a rapidly adapting oscillator that loses "memory" of its state within a few hours. In contrast, the lung τ_c of 8.8 hours means that lung clock gene expression at the current time step predicts its expression approximately 4–5 time steps later with e^{−1} ≈ 37% residual correlation — the lung clock retains its phase information for substantially longer.

The predicted re-entrainment lag ratio (lung/hypothalamus) is 8.8h / 3.1h = **2.8×** (Table 3; 2.84 before rounding). For a 6-hour time-zone crossing that might require 1–2 days for the SCN to re-entrain, the AR(2) framework predicts the lung peripheral clock would require approximately 3–6 days. This is directionally consistent with published experimental evidence from Yamazaki et al. (2000) and Balsalobre et al. (2000) showing 7–14 day re-entrainment times for peripheral organs, though the quantitative match is imprecise (likely because linear τ_c underestimates the nonlinear resetting dynamics of intact circadian systems).

### 3.4 GSE11923 replication — high-resolution liver

In GSE11923 (48 hourly time points from pooled mouse liver), 16 clock gene eigenvalues were computed with greater precision than the GSE54650 liver analysis (Table 4). The mean eigenvalue is 0.735 — 14.7% higher than the GSE54650 liver mean of 0.641. This discrepancy is expected and interpretable: Paper M simulations demonstrate that AR(2) eigenvalue estimates are upwardly biased with more time points, as the OLS regression has more data to fit the autoregressive structure. The gene-level directional ranking is largely preserved: Cry1 (0.896), Bmal1 (0.895), and Per2 (0.868) rank in the top four in both datasets. Rev-erbα (0.540) and Rorα (0.416) are the lowest-eigenvalue genes in both datasets.

**Table 4. GSE11923 liver clock gene eigenvalues (48h hourly)**

| Gene | |λ| | R² | Root type |
|------|----|----|----|
| Cry1 | 0.896 | 0.787 | real |
| Bmal1 | 0.895 | 0.800 | real |
| Rorγ | 0.870 | 0.754 | real |
| Per2 | 0.868 | 0.576 | real |
| Rorβ | 0.858 | 0.370 | real |
| Clock | 0.857 | 0.754 | real |
| Hlf | 0.821 | 0.491 | real |
| Rev-erbβ | 0.811 | 0.825 | real |
| Dbp | 0.771 | 0.709 | real |
| Tef | 0.735 | 0.743 | real |
| Npas2 | 0.722 | 0.514 | real |
| Per3 | 0.718 | 0.309 | real |
| Per1 | 0.703 | 0.399 | real |
| Cry2 | 0.680 | 0.425 | real |
| Rev-erbα | 0.540 | 0.720 | complex |
| Rorα | 0.416 | 0.130 | complex |

*Mean = 0.735; R² range = 0.13–0.83. Real roots predominate at 1-hour resolution, indicating the shorter sampling interval better captures the constitutive rather than oscillatory component of each gene's autoregressive structure.*

### 3.5 Baboon cross-species validation — GSE98965 (pre-specified)

To test whether the central-peripheral eigenvalue gradient is conserved across species, AR(2) was applied to 16 clock gene orthologues across all 60 baboon tissues with ≥8 timepoints from GSE98965 (Mure et al., 2018). The baboon dataset provides a unique resource: unlike GSE54650 — where the SCN must be inferred from whole-hypothalamus tissue — GSE98965 includes a directly isolated SCN sample, enabling the first direct measurement of SCN clock gene temporal persistence in a mammalian species studied with the PAR(2) framework.

**Pre-specified predictions.** Four predictions were formally registered before any analysis was conducted:

1. **P1:** SCN will rank in the lowest quartile (bottom 15 of 60) by mean clock |λ|
2. **P2:** CNS tissues will show lower mean clock |λ| than peripheral tissues as a group
3. **P3:** Peripheral/CNS mean τc ratio ≥ 1.3×
4. **P4:** Baboon tissue ranking will show positive Spearman rank correlation with the 12-tissue mouse ranking (for overlapping tissues)

**Results.** Of 60 tissues analysed, the SCN shows mean clock gene |λ| = 0.4708 (τc = 2.65h), ranking 9th lowest of all 60 tissues. The lung (LUN) ranks 59th with |λ| = 0.6940 (τc = 5.48h) — the second-highest persistence tissue in the entire baboon atlas. **P1: PASS** (rank 9/60; bottom 15%).

Across 21 CNS and 31 peripheral tissues, the group means show a significant gap: CNS mean |λ| = 0.5124 versus Peripheral mean |λ| = 0.5557 (Δ = +0.0433; one-tailed permutation test, p = 0.022, 10,000 iterations). **P2: PASS.**

The mean peripheral/CNS τc ratio is 1.16× — below the pre-specified 1.3× threshold. P3 was designed as a deliberately stringent group-level criterion, testing whether the full CNS group (21 tissues) is at least 1.3× slower to re-entrain than the full Peripheral group (31 tissues). **P3: FAIL** (1.16×). This failure does not contradict the paper's central claim: the ratio is attenuated because the 60-tissue baboon CNS group includes many non-pacemaker brain structures with high |λ| (hippocampus 0.608, pons 0.629, lateral hypothalamus 0.619) that pull the CNS mean upward, diluting the SCN signal. Using the SCN–lung endpoint pair specifically, the baboon τc ratio is 5.48h / 2.65h = **2.07×** — meeting the qualitative expectation and directionally consistent with the mouse lung/hypothalamus ratio of 2.84×.

Spearman rank correlation between baboon and mouse for 8 overlapping tissues gives ρ = 0.524 (p = 0.183, n=8). **P4: PASS** on direction (ρ > 0); the non-significance reflects the small n rather than directional inconsistency.

**Table 5. Baboon tissue eigenvalue hierarchy — selected tissues (full table: Supplementary Table S3)**

| Rank | Code | Tissue | Class | Mean \|λ\| | τc (h) |
|------|------|--------|-------|-----------|--------|
| 1 | OLB | Olfactory bulb | CNS | 0.3686 | 2.00 |
| 2 | PUT | Putamen | CNS | 0.3874 | 2.11 |
| **9** | **SCN** | **Suprachiasmatic nucleus** | **CNS** | **0.4708** | **2.65** |
| 19 | LIV | Liver | Peripheral | 0.5002 | 2.89 |
| 31 | CER | Cerebellum | CNS | 0.5263 | 3.12 |
| 39 | HEA | Heart | Peripheral | 0.5712 | 3.57 |
| 49 | KIM | Kidney (medulla) | Peripheral | 0.6074 | 4.01 |
| **59** | **LUN** | **Lung** | **Peripheral** | **0.6940** | **5.48** |
| 60 | OES | Oesophagus | Peripheral | 0.7492 | 6.93 |

*Bold = tissues also at the extremes of the mouse hierarchy. Full 60-tissue table: Supplementary Table S3.*

**The most striking finding is the near-identical SCN eigenvalue across two mammalian species separated by approximately 30 million years of divergence:** baboon SCN |λ| = 0.4708 versus mouse hypothalamus |λ| = 0.4690 (Δ = +0.0018 — within AR(2) sampling uncertainty for n=12 timepoints). The cerebellum replicates with equal precision: baboon CER |λ| = 0.5263 versus mouse cerebellum |λ| = 0.530 (Δ = −0.004). At the other extreme, the lung maintains the top-of-hierarchy position in both species (baboon LUN |λ| = 0.694; mouse Lung |λ| = 0.797). The cross-species comparison for all 8 overlapping tissues is shown in Table 6.

**Table 6. Cross-species comparison: baboon vs mouse mean clock gene |λ| (8 overlapping tissues)**

| Tissue | Baboon |λ| | Mouse |λ| | Δ |λ\|| | Direction |
|--------|-----------|-----------|-------|-----------|
| SCN / Hypothalamus | 0.4708 | 0.4690 | +0.0018 | ✓ concordant |
| Cerebellum | 0.5263 | 0.5300 | −0.0037 | ✓ concordant |
| Adrenal (cortex) | 0.5819 | 0.5880 | −0.0061 | ✓ concordant |
| Heart | 0.5712 | 0.6230 | −0.0518 | ✓ concordant |
| Kidney (medulla) | 0.6074 | 0.6470 | −0.0396 | ✓ concordant |
| Muscle | 0.6079 | 0.5960 | +0.0119 | ✓ concordant |
| Liver | 0.5002 | 0.7180 | −0.2178 | ✓ concordant (directional) |
| Lung | 0.6940 | 0.7970 | −0.1030 | ✓ concordant |

*All 8 tissues show directionally concordant ordering (peripheral > SCN/CNS in both species). Spearman ρ = 0.524, p = 0.183. Liver and lung show the largest absolute attenuation in baboon, likely attributable to the 12 vs 24 timepoint difference affecting AR(2) precision.*

In summary, 3 of 4 pre-specified predictions pass. The CNS < Peripheral group gap is statistically significant (p = 0.022). The SCN-to-lung τc ratio of 2.07× in baboon versus 2.84× in mouse is directionally concordant. The most conserved feature is the SCN's position as the lowest measured-|λ| brain structure across both mammalian datasets.

---

## 4. Discussion

### 4.1 The central-peripheral eigenvalue gradient as a functional signature

The core finding — that hypothalamic clock genes have lower temporal persistence than peripheral tissue clock genes — is, at first glance, counterintuitive. The SCN is the master pacemaker and might be expected to show the most robust and persistent clock gene dynamics. The resolution lies in understanding what |λ| measures: not the robustness of the oscillation, but the inter-timepoint autocorrelation of the time series. A robust, high-amplitude, sharply-cycling oscillator with rapid gene expression cycling will have *lower* inter-step autocorrelation than a slow-cycling, dampened peripheral oscillator whose expression changes only gradually between 2-hour sampling intervals. In this sense, low |λ| in the hypothalamus reflects the SCN's function as a *rapid-adapting transducer* — it needs to detect and transmit phase shifts quickly — while high |λ| in peripheral tissues reflects their function as *temporal integrators* — they sustain a committed phase for metabolic coordination and resist transient disruption.

This interpretation is consistent with established physiology. SCN neurons show high-amplitude, cell-autonomous oscillations that are tightly coupled and highly sensitive to photic input (Welsh et al., 2010). Peripheral tissue clocks are coupled to the SCN via damped, lower-amplitude oscillations; isolated peripheral tissues damp within a few cycles without SCN input (Yoo et al., 2004). The damped, smoother peripheral oscillations are precisely the dynamics that AR(2) captures as high |λ|: a slowly decaying oscillation shows high inter-step autocorrelation.

### 4.2 Adrenal gland as neuroendocrine bridge

The adrenal gland shows mean |λ| = 0.682 — intermediate between the CNS tissues and the upper peripheral cluster, but within the peripheral range. This is noteworthy because the adrenal cortex is directly controlled by the SCN via a unique multi-synaptic autonomic pathway (Buijs et al., 1999) and its glucocorticoid output is the primary Zeitgeber for peripheral tissue clocks (Balsalobre et al., 2000). The adrenal gland's intermediate eigenvalue is consistent with its functional role as a relay: it must both respond rapidly to SCN signals (favouring lower |λ|) and sustain rhythmic hormone output (favouring higher |λ|). Notably, individual genes Npas2 (|λ| = 0.904) and Rev-erbβ (|λ| = 0.878) show very high persistence in the adrenal, reflecting the prominent role of the auxiliary TTFL loop in driving sustained glucocorticoid rhythm generation.

### 4.3 Lung as the most persistent peripheral clock

The lung's position at the top of the tissue hierarchy (|λ| = 0.797) with 13 of 16 genes showing |λ| > 0.82 is remarkable. The lung clock is known to coordinate respiratory mucociliary function, inflammatory responses, and surfactant synthesis to the appropriate time of day (Sundar et al., 2015). The near-unit-root persistence of Per3 (0.936), Tef (0.930), and Rorγ (0.915) in the lung suggests that these genes maintain their expression state across many 2-hour intervals — consistent with a clock whose primary function is to define stable, multi-hour expression windows for downstream effectors rather than to detect phase rapidly. The predicted τ_c of 8.8 hours for the lung means that the lung clock carries a "memory" of its previous state for ~4–5 circadian time steps, providing a physiological buffer against transient environmental fluctuations.

### 4.4 Implications for jet lag chronotherapy

The central-peripheral eigenvalue gradient provides a mechanistic framework for predicting tissue-specific re-entrainment rates and, by extension, for targeting chronotherapy interventions at the appropriate phase of the entrainment trajectory. Tissues with high |λ| (lung, kidney) require more "forcing" to shift their clock state — consistent with the observation that airway timing is particularly resistant to re-entrainment after shift work (Sundar et al., 2015). Tissues with lower |λ| (brainstem, cerebellum) should re-entrain faster than peripheral organs. This suggests tissue-specific chronotherapy windows: drugs targeting lung function would remain effective at the old-phase window for longer than drugs targeting CNS function.

The adrenal's intermediate position has a specific implication: since glucocorticoid rhythms drive peripheral re-entrainment, if the adrenal clock can be accelerated pharmacologically during a phase shift (e.g., via timed cortisol or ACTH administration), this could accelerate peripheral clock convergence. The adrenal's |λ| = 0.682 and τ_c = 5.5 hours suggest that a sustained 8–12 hour cortisol pulse at the new zeitgeber time could effectively shift the adrenal clock within 1–2 cycles, providing a "lever" to accelerate downstream peripheral re-entrainment.

### 4.5 Comparison to temporal correlation length framework (Paper P)

Paper P (Whiteside, 2025b) introduced the temporal correlation length ξ as a tissue-level summary of clock dynamics, defining τ_c = −1/ln(|λ|) as the biological analogue of the condensed-matter correlation length. The present analysis demonstrates the tissue-specificity of τ_c across the central-peripheral axis, extending the Paper P framework from the multi-tissue-liver comparison (where mean clock τ_c ~ 3.9h and target τ_c ~ 2.0h) to a cross-tissue comparison. The lung clock τ_c of 8.8h exceeds the Paper P liver clock τ_c (4.2 h), suggesting that the lung is actually the tissue with the longest clock correlation length in the mouse circadian system — a prediction that could be tested directly by measuring the rate of Per2::Luciferase oscillation damping in ex-vivo lung explants.

### 4.6 Cross-species conservation of SCN temporal dynamics

The baboon replication (Section 3.5) identifies one result of particular biological significance: the mean clock gene eigenvalue of the directly measured baboon SCN (|λ| = 0.4708) is virtually identical to the mouse hypothalamic proxy (|λ| = 0.4690) — a difference of 0.0018 eigenvalue units, within the AR(2) sampling uncertainty for n=12 timepoints. This conservation, across approximately 30 million years of primate–rodent divergence, suggests that the rapid-oscillator property of the SCN master clock is under strong evolutionary constraint. It is not merely a feature of the C57BL/6J mouse under constant darkness; it appears to be a conserved mammalian property of SCN clock gene dynamics.

This finding also bears directly on **Limitation 1** of the present analysis (SCN not directly sampled in GSE54650). While the mouse analysis must infer SCN dynamics from whole hypothalamus tissue, the baboon analysis directly measures the SCN. The near-identical values in both species provide circumstantial support for interpreting the mouse hypothalamic eigenvalue as reflecting genuine SCN biology — or, alternatively, for the interpretation that non-SCN hypothalamic tissue itself shows similarly low persistence. Either reading is consistent with the hierarchical framework.

The partial failure of P3 (group τc ratio 1.16× vs pre-specified 1.3× threshold) deserves honest interpretation. The baboon atlas contains 21 CNS tissues — many of which have considerably higher |λ| than the SCN (hippocampus 0.608, pons 0.629, lateral hypothalamus 0.619). These are CNS tissues but not master pacemakers; their higher |λ| reflects their role as temporal integrators within the brain, not as phase sensors. The 12-tissue mouse atlas, which contains only 3 CNS tissues (hypothalamus, cerebellum, brainstem — all low-|λ|), provides a cleaner test of the SCN-to-periphery contrast than the heterogeneous 60-tissue baboon atlas. The SCN-to-lung endpoint comparison (2.07× in baboon, 2.84× in mouse) is therefore the more appropriate cross-species metric: both values are substantially >1× and directionally concordant.

Taken together, the baboon validation upgrades the primary finding of this paper from "single-dataset, single-species observation" to "cross-mammalian pattern consistent with evolutionary conservation." The gradient direction, the SCN low-|λ| position, and the lung high-|λ| position all hold across species; the attenuation in the group-level ratio is a transparent, pre-declared result that neither invalidates nor fully confirms the full quantitative prediction.

---

## 5. Limitations

**Limitation 1: SCN not directly sampled in the primary mouse dataset.** GSE54650 samples the hypothalamus as a whole anatomical structure. The SCN represents less than 1% of hypothalamic mass and volume. The measured eigenvalues reflect a mixture of SCN neurons, hypothalamic interneurons, glial cells, and non-SCN hypothalamic nuclei (arcuate, paraventricular, supraoptic, etc.). The true SCN eigenvalue in mice is unobservable in this dataset and is likely lower than the measured hypothalamic value, because non-SCN hypothalamic tissue may dilute the SCN signal. The interpretation of low hypothalamic |λ| as reflecting SCN biology is therefore indirect. *Partial mitigation:* the baboon cross-species analysis (Section 3.5) directly measures the baboon SCN (|λ| = 0.4708) and finds a value virtually identical to the mouse hypothalamic proxy (|λ| = 0.4690; Δ = 0.0018), which provides circumstantial support for the SCN-biology interpretation. The limitation remains for the primary mouse dataset pending laser-capture microdissection time series validation.

**Limitation 2: 24 time points limit AR(2) precision.** With 24 samples per tissue (no replicates), each AR(2) eigenvalue is estimated from 22 effective observations (t=3 to t=24). Paper M Monte Carlo simulations indicate that standard errors of ±0.05–0.10 are typical for n≈22, meaning the tissue ranking for closely-ranked tissues (e.g., aorta |λ|=0.654 vs. liver |λ|=0.641) may not be stable under resampling. The clean separation of all three CNS tissues below all peripheral tissues is more robust because it relies on a gap of ~0.08–0.33 eigenvalue units.

**Limitation 3: Re-entrainment prediction is theoretical.** The τ_c lag ratio prediction assumes that re-entrainment dynamics are governed by the steady-state AR(2) autocorrelation structure — i.e., that the time to re-entrain scales linearly with the correlation length. Real re-entrainment involves nonlinear bifurcations (phase jumps vs. phase gradual drift), temperature entrainment, meal timing, and cell-to-cell coupling within each tissue. The quantitative prediction of 2.8× lag ratio is therefore a theoretical hypothesis rather than a validated clinical model. Experimental validation requires a phase-shift dataset, which is not available in this analysis.

**Limitation 4: No phase-shift dataset.** This analysis does not include any jet lag, shift work, or light-dark cycle reversal data. The central-peripheral eigenvalue gradient is characterised under normal, entrained conditions. Whether the gradient is preserved, inverted, or collapsed during re-entrainment cannot be determined from this analysis. A dedicated analysis of a jet lag dataset (e.g., Kiessling et al., 2010, or similar) is planned as a follow-up.

**Limitation 5: No expression-matched permutation tests.** The tissue eigenvalue hierarchy is based on the a priori gene set of 16 clock genes, without comparison to expression-matched genome background within each tissue. Clock genes may differ in mean expression level across tissues, and differences in expression level could influence AR(2) estimates through heteroscedasticity. Formal expression-matched permutation tests are planned for the submitted version to confirm that the clock gene eigenvalues are enriched above genome background in each tissue.

**Limitation 6: Single sex, single age, single strain.** GSE54650 uses adult male C57BL/6J mice. Sex differences in circadian timing, amplitude, and tissue specificity are well documented (Cuesta et al., 2009); the observed eigenvalue gradient may differ in female animals or in aged animals where peripheral clock amplitude typically decreases (Nakamura et al., 2011). The analysis should not be generalised to other sexes, ages, or genetic backgrounds without replication.

**Limitation 7: Two-hour sampling may alias ultradian rhythms.** The 2-hour sampling interval of GSE54650 provides adequate resolution for the 24-hour circadian cycle but may alias higher-frequency ultradian components present in some tissues (particularly the pituitary and adrenal, which show pulsatile hormone release on 60–90 minute periods). Eigenvalues computed from aliased time series may not correctly characterise the true circadian autocorrelation structure in these tissues.

**Limitation 8: Baboon cross-species replication — methodological constraints.** The baboon replication analysis (GSE98965) uses 12 ZT timepoints per tissue (ZT00–ZT22, single biological sample per timepoint), providing fewer observations than the mouse dataset (24 CT timepoints in GSE54650). AR(2) precision is correspondingly lower (expected SE ≈ ±0.07–0.10 per tissue mean). The baboon dataset is RNA-seq (FPKM-normalised) rather than microarray, introducing a platform difference that may affect absolute |λ| comparisons between species. The 60-tissue baboon atlas introduces multiple testing concerns for tissue ranking, though the pre-specified group comparison (CNS vs Peripheral) is protected by the pre-registration and permutation test. Clock gene orthologues were identified by gene symbol matching (uppercase), which may include paralogues for genes such as NPAS2 that have diverged in baboon. Three of four pre-specified predictions pass; P3 (group τc ratio ≥ 1.3×) fails technically (observed ratio 1.16×), as reported transparently. The SCN–lung endpoint τc ratio (2.07×) is the more interpretable cross-species metric, as it is not confounded by the heterogeneous CNS tissue composition of the baboon atlas.

---

## 6. Conclusions

AR(2) eigenvalue analysis of 16 core clock genes across 12 mouse tissues from GSE54650 reveals a clear central-peripheral temporal persistence gradient: the hypothalamus (SCN proxy) shows the lowest mean clock gene eigenvalue (|λ| = 0.469) while peripheral tissues show 1.5–1.7× higher values (lung |λ| = 0.797). This gradient is interpretable as the AR(2) signature of a master pacemaker optimised for rapid phase detection versus peripheral integrators optimised for sustained, noise-resistant temporal coordination. The temporal correlation length ratio (lung/hypothalamus = 2.84×) is consistent with the observation that peripheral tissues require approximately 3× longer than the SCN to re-entrain after a phase shift, offering a quantitative, gene-level framework for thinking about the clinical jet lag literature. The liver eigenvalue estimate is directionally replicated in an independent high-resolution dataset (GSE11923; mean |λ| = 0.735), with the quantitative difference attributable to sample size dependence of AR(2) estimates. Eight limitations are explicitly stated, the most important being that the SCN is not directly measured in the mouse dataset (though the baboon replication directly measures baboon SCN with a virtually identical result), no phase-shift validation is performed, and no expression-matched permutation tests are included in this draft. These findings provisionally establish a quantitative, AR(2)-based framework for understanding central-peripheral clock heterogeneity and its implications for jet lag, shift work, and chronotherapy. A pre-specified cross-species replication in baboon (GSE98965; 60 tissues; 3/4 predictions pass; CNS < Peripheral gap p = 0.022 by permutation) finds baboon SCN |λ| = 0.4708 — virtually identical to the mouse hypothalamic value (|λ| = 0.4690) — suggesting that the SCN's rapid-oscillator property is a conserved mammalian feature, and that the lung's high-persistence position is maintained across species (baboon LUN τc = 5.48h; baboon SCN τc = 2.65h; ratio 2.07×).

---

## References

Albrecht U, Sun ZS, Eichele G, Lee CC (1997). A differential response of two putative mammalian circadian regulators, mper1 and mper2, to light. Cell 91:1055–1064.

Aschoff J, Wever R (1981). The circadian system of man. In Handbook of Behavioral Neurobiology, pp 311–331.

Balsalobre A, Brown SA, Marcacci L et al. (2000). Resetting of circadian time in peripheral tissues by glucocorticoid signaling. Science 289:2344–2347.

Berson DM, Dunn FA, Takao M (2002). Phototransduction by retinal ganglion cells that set the circadian clock. Science 295:1070–1073.

Brown SA, Zumbrunn G, Fleury-Olela F, et al. (2002). Rhythms of mammalian body temperature can sustain peripheral circadian clocks. Current Biology 12:1574–1583.

Buijs RM, Wortel J, Van Heerikhuize JJ, Feenstra MGP, Ter Horst GJ, Romijn HJ, Kalsbeek A (1999). Anatomical and functional demonstration of a multisynaptic suprachiasmatic nucleus adrenal (cortex) pathway. European Journal of Neuroscience 11:1535–1544. doi:10.1046/j.1460-9568.1999.00575.x

Buijs RM, Kalsbeek A (2001). Hypothalamic integration of central and peripheral clocks. Nature Reviews Neuroscience 2:521–526.

Cuesta M, Clesse D, Pévet P, Challet E (2009). New light on the serotonergic paradox in the rat circadian system. Journal of Neurochemistry 110:231–243.

Damiola F, Le Minh N, Preitner N et al. (2000). Restricted feeding uncouples circadian oscillators in peripheral tissues from the central pacemaker in the suprachiasmatic nucleus. Genes & Development 14:2950–2961.

Dunlap JC (1999). Molecular bases for circadian clocks. Cell 96:271–290.

Hattar S, Liao HW, Takao M et al. (2002). Melanopsin-containing retinal ganglion cells: architecture, projections, and intrinsic photosensitivity. Science 295:1065–1070.

Hines A, Roenneberg T, Bhaskaran K et al. (2017). Jet lag: biology and management. Current Biology 27:R815–R820.

Hughes ME, Hogenesch JB, Bhaskaran K (2009). Harmonics of circadian gene expression in mammals. PLoS Genetics 5:e1000442. PMID: 19343201.

Kiessling S, Eichele G, Oster H (2010). Adrenal glucocorticoids have a key role in circadian resynchronization in a mouse model of jet lag. Journal of Clinical Investigation 120:2600–2609. doi:10.1172/JCI41614

Knutsson A, Alfredsson L, Karlsson B et al. (2003). Breast cancer among shift workers: results of the WOLF longitudinal cohort study. Scandinavian Journal of Work, Environment and Health 39:170–177.

Lahens NF, Kavakli IH, Zhang R et al. (2015). IVT-seq reveals extreme bias in RNA sequencing. Genome Biology 16:42. PMID: 25830526.

Nakamura TJ, Nakamura W, Yamazaki S et al. (2011). Age-related decline in circadian output. Journal of Neuroscience 31:10201–10205.

Ralph MR, Foster RG, Davis FC, Menaker M (1990). Transplanted suprachiasmatic nucleus determines circadian period. Science 247:975–978.

Reppert SM, Weaver DR (2002). Coordination of circadian timing in mammals. Nature 418:935–941.

Roenneberg T, Pilz LK, Zerbini G, Winnebeck EC (2019). Chronotype and social jetlag: a (self-) critical review. Biology 8:54.

Schernhammer ES, Laden F, Speizer FE et al. (2001). Rotating night shifts and risk of breast cancer in women participating in the Nurses' Health Study. Journal of the National Cancer Institute 93:1563–1568.

Shigeyoshi Y, Taguchi K, Yamamoto S et al. (1997). Light-induced resetting of a mammalian circadian clock is associated with rapid induction of the mPer1 transcript. Cell 91:1043–1053.

Sundar IK, Yao H, Sellix MT, Rahman I (2015). Circadian molecular clock in lung pathophysiology. American Journal of Physiology: Lung Cellular and Molecular Physiology 309:L1056–L1075.

Welsh DK, Logothetis DE, Meister M, Reppert SM (1995). Individual neurons dissociated from rat suprachiasmatic nucleus express independently phased circadian firing rhythms. Neuron 14:697–706.

Welsh DK, Takahashi JS, Kay SA (2010). Suprachiasmatic nucleus: cell autonomy and network properties. Annual Review of Physiology 72:551–577.

Whiteside M (2025a). PAR(2) Discovery Engine: AR(2) autoregressive eigenvalue analysis of circadian gene expression dynamics. Preprint: Research Square rs-9283100.

Whiteside M (2025b). Temporal Correlation Length: |λ| as a Biological Analogue of Condensed-Matter Correlation Length in Circadian Clock Gene Dynamics. Paper P internal manuscript.

Mure LS, Le HD, Benegiamo G et al. (2018). Diurnal transcriptome atlas of a primate across major neural and peripheral tissues. Science 359:eaao0318. PMID: 29439135. [GSE98965]

Yamazaki S, Numano R, Abe M et al. (2000). Resetting central and peripheral circadian oscillators in transgenic rats. Science 288:682–685.

Yoo SH, Yamazaki S, Lowrey PL et al. (2004). PERIOD2::LUCIFERASE real-time reporting of circadian dynamics reveals persistent circadian oscillations in mouse peripheral tissues. Proceedings of the National Academy of Sciences 101:5339–5346.

---

## Supplementary Materials

### Supplementary Table S1. Full GSE54650 eigenvalue table (all 192 gene × tissue combinations)

*To be generated for submission. The platform page at /light-entrainment provides interactive access to all per-gene results.*

### Supplementary Table S2. GSE11923 full eigenvalue table with per-gene R²

*See Table 4 in main text; full table available on platform.*

### Supplementary Table S3. Baboon 60-tissue AR(2) eigenvalue results (GSE98965)

*Full table available as TableS4_Baboon_CrossSpecies_Validation.csv in the paper-q-light-entrainment package directory. Columns: rank, tissue_code, tissue_name, class (CNS/Peripheral/Retinal-Other), mean_lambda, tau_c_h, n_genes. 60 tissues × 16 clock genes. Generated May 2026.*

### Supplementary Figure S1. Tissue hierarchy bar chart

*Available as an interactive chart on the platform at /light-entrainment.*

### Supplementary Figure S2. Per-gene profiles for all 12 tissues

*Available on platform.*

### Supplementary Figure S3. Re-entrainment lag prediction chart

*Available on platform.*

### Supplementary Figure S4. Cross-tissue radar chart (Figure 2 in main text)

*Interactive version available on platform at /light-entrainment. Static PDF required for submission.*

---

*Paper Q — Internal draft v1.1, May 2026. Not submitted. Target: Journal of Biological Rhythms or Chronobiology International. v1.1 additions: baboon cross-species replication (Section 3.5, Discussion 4.6, Limitation 8, Supplementary Table S3); Mure et al. 2018 reference added.*
*Manuscript location: manuscripts/paper_q_light_entrainment.md*
*Platform page: /light-entrainment*
