# Temporal Persistence as a Circadian Metric: The AR(2) Eigenvalue Framework Across Health, Disease, and Species

**Michael Whiteside**
Independent Researcher, Scotland, UK
ORCID: 0009-0000-0643-5791
Correspondence: mickwh@msn.com

**Manuscript type:** Review
**Target journals:** Journal of Biological Rhythms / Chronobiology International
**Version:** v1.0, May 2026
**Status:** Draft — not submitted

---

## Abstract

Circadian biology has long relied on methods that ask whether a gene oscillates sinusoidally: JTK_CYCLE, cosinor regression, and RAIN detect rhythmicity — the amplitude and period of sinusoidal expression dynamics. These methods cannot detect a fundamentally different property of gene expression time series: temporal persistence, the degree to which a gene's current expression predicts its future expression regardless of waveform. Here we review the PAR(2) framework, which quantifies temporal persistence by fitting an AR(2) autoregressive model to each gene's time series and extracting the eigenvalue modulus |λ| of the companion matrix. A gene with |λ| approaching 1 maintains its expression trajectory with long carry-forward memory; a gene with |λ| near 0 fluctuates rapidly with no autocorrelation across time steps. The two metrics — rhythmicity and persistence — are near-orthogonal: Spearman ρ = 0.256 between |λ| and cosinor R², and 0.215 between |λ| and JTK_CYCLE amplitude rank, compared to 0.649 between cosinor and JTK_CYCLE with each other. Across 22 publicly available datasets spanning five species (mouse, human, baboon, *Arabidopsis thaliana*, *Saccharomyces cerevisiae*), core clock genes consistently show higher |λ| than their downstream targets: a Clock > Target hierarchy with gaps of +0.30 to +0.40 units that survives three pre-specified bias audits. This hierarchy narrows and inverts in cancer — in MYC-ON neuroblastoma and APC-mutant intestinal organoids — and undergoes cell-type-specific reorganisation in Alzheimer's disease glia. The temporal correlation length τ_c = −1/ln(|λ|) × Δt, derived from |λ|, provides a tissue-resolved, gene-level quantification of circadian memory and predicts the central-to-peripheral re-entrainment lag ratio, confirmed by cross-species replication in the baboon circadian atlas. The framework offers a quantitative, falsifiable, and reproducible complement to existing circadian analysis tools.

**Keywords:** AR(2) autoregression; temporal persistence; eigenvalue; circadian clock; clock-target hierarchy; jet lag; re-entrainment; Alzheimer's disease; cancer chronobiology; neuroblastoma; intestinal organoid; APC loss; MYC oncogene; temporal correlation length; multi-tissue atlas; cross-species replication

---

## 1. Introduction

### 1.1 The limits of rhythmicity-based analysis

Gene expression time series from circadian experiments are almost universally analysed using tools designed to detect sinusoidal oscillation. JTK_CYCLE (Hughes et al. 2010) applies a non-parametric correlation approach sensitive to approximately 24-hour periodicity. Cosinor regression (Nelson et al. 1979; Cornelissen 2014) fits a cosine curve of fixed period to each gene's time series, extracting amplitude and acrophase. RAIN (Thaben and Westermark 2014) extends this sensitivity to asymmetric waveforms. These methods answer a well-defined question: does this gene's expression oscillate significantly with approximately circadian periodicity?

What they cannot detect is a different and complementary property. Consider a gene that is constitutively expressed at a high level throughout the 24-hour cycle: it will be correctly classified as arrhythmic. But if that gene's expression at one time point strongly predicts its expression at the next — if it has strong temporal autocorrelation — it has a property that rhythmicity metrics are blind to. This property is temporal persistence, and its biological significance is distinct: a highly persistent gene is one whose expression state is resistant to perturbation, whose programme is stable across consecutive time steps, and whose regulatory dynamics are characterised by long memory rather than rapid oscillation.

Whether this distinction is biologically meaningful was the foundational question of the PAR(2) framework. The evidence reviewed here suggests it is — and that persistence differences between gene categories track biological function in ways that rhythmicity measures cannot recover.

### 1.2 The AR(2) model and eigenvalue derivation

The AR(2) autoregressive model describes gene expression x(t) as a linear function of its two preceding values:

x(t) = φ₁x(t−1) + φ₂x(t−2) + ε(t)

where φ₁ and φ₂ are autoregressive coefficients estimated by ordinary least squares on mean-centred expression data, and ε(t) is a white-noise residual. Mean-centring before fitting removes the expression-level offset, ensuring the regression targets temporal dynamics rather than expression magnitude — a preprocessing step whose necessity is demonstrated by the spurious compression of eigenvalue distributions that results when un-centred fitting is applied to stably-expressed genes.

The dynamic behaviour of this system is governed by the roots of the characteristic polynomial λ² − φ₁λ − φ₂ = 0. The eigenvalue modulus |λ| — the modulus of the dominant characteristic root — indexes persistence on a scale from 0 to 1 (within the stability region). When the discriminant φ₁² + 4φ₂ is negative, the roots are complex conjugates, indicating genuinely oscillatory dynamics: |λ| reflects the amplitude decay rate of a sustained, decaying oscillation. When the discriminant is positive, the roots are real, indicating constitutive, non-oscillatory dynamics: |λ| reflects carry-forward memory without rhythm. Both produce high |λ|, but they represent qualitatively distinct biological states — a distinction with particular importance in disease contexts, as discussed in Section 4.

The temporal correlation length τ_c = −1/ln(|λ|) × Δt, where Δt is the sampling interval, translates |λ| into physical units. It gives the timescale over which a gene's expression is autocorrelated: the characteristic memory duration of its regulatory dynamics (Whiteside 2025d). At a typical circadian sampling interval of Δt = 2 hours, clock gene τ_c averages 3.9 hours across 12 mouse tissues, while target gene τ_c averages 2.0 hours — a 2.0-fold ratio (95% CI [1.6, 2.4]) confirmed in all 13 tested tissue-resolution conditions.

---

## 2. The Core Hierarchy: Evidence and Validation

### 2.1 The Clock > Target eigenvalue hierarchy

The primary empirical claim of the PAR(2) framework is that clock genes consistently show higher |λ| than their downstream targets across circadian datasets. This was initially established in the Hogenesch lab 12-tissue mouse atlas (GSE54650; 288 samples, 2-hour circadian time intervals) and has been replicated across 22 publicly available datasets spanning five species (Whiteside 2025a).

The mean Clock > Target hierarchy gap ranges from +0.30 to +0.40 units across validated datasets. The direction of the gap — clock genes above target genes — is confirmed in 22/22 datasets. Housekeeping genes score below target genes, producing a three-level hierarchy: Clock > Target > Housekeeping.

This pattern is not trivially explained by expression level: the bias audits (Section 2.2) rule out expression-magnitude confounds. It is not an artefact of the circadian waveform assumption: AR(2) fitting does not require or assume sinusoidal dynamics. And it is not explained by mRNA half-life (Section 2.3).

### 2.2 Pre-specified bias audits

Three automated bias tests were pre-specified and applied to the primary dataset (GSE11923 mouse liver, 20,955 genes, 48 timepoints at 1-hour intervals) and the AD glial dataset (GSE261698):

1. **Time-Shuffle Destruction**: Gene expression time series are randomly permuted, destroying temporal structure. If |λ| reflects genuine temporal dynamics, the clock-target hierarchy should collapse in shuffled data. It does: the gap collapses to near zero (p < 0.001 by permutation in both datasets), confirming the hierarchy depends on temporal ordering and is not an artefact of expression-level differences between gene categories.

2. **Irrelevant Metric Correlation**: |λ| values are correlated against gene-level metrics that should be biologically irrelevant — mean expression rank and gene index. High correlation would indicate a systematic confound. Neither correlation is significant in either dataset (p > 0.05), ruling out expression-magnitude and gene-list composition artefacts.

3. **Expression-Matched Null Hierarchy**: Null hierarchies are constructed by permuting category labels within expression-matched bins, preserving the expression distribution of each gene category. The observed Clock > Target gap significantly exceeds the expression-matched null in all tested conditions.

All three tests pass, providing convergent evidence that the measured hierarchy reflects genuine temporal dynamics rather than methodological artefact.

### 2.3 Independence from mRNA half-life

A natural alternative explanation for the clock-target eigenvalue hierarchy is mRNA stability: if clock genes have longer half-lives, their expression would be more persistent simply because they decay more slowly, independent of regulatory dynamics. Whiteside (2025b) tested this against published mRNA half-life datasets (Schwanhäusser et al. 2011; Tani et al. 2012) across 12 non-circadian datasets.

The result is a median Spearman correlation of r = 0.031 (IQR: −0.018 to +0.063) between mRNA half-life and |λ|. This near-zero correlation is consistent across all 12 datasets and survives 11 pre-specified robustness checks. The AR(2) eigenvalue and mRNA half-life index different aspects of gene regulation: half-life measures intrinsic degradation rate; |λ| measures the temporal autocorrelation structure of expression dynamics in intact tissue, which is shaped by regulatory input — transcription factor occupancy, feedback timing, chromatin state — rather than degradation kinetics alone.

An important qualification applies: the available half-life measurements derive from mouse fibroblasts under standard culture conditions (Schwanhäusser et al.), creating a species and tissue mismatch with the circadian datasets. The finding is therefore more precisely stated as: no detectable correlation at the measurement precision available from cross-species, cross-tissue half-life proxies. A properly matched study — metabolic labelling in the same cell type and species as the AR(2) data — would provide a more decisive test. Nevertheless, the absence of detectable correlation across 12 datasets is a meaningful negative finding and argues against half-life confounding as an explanation for the clock-target hierarchy.

### 2.4 Comparison to existing rhythmicity methods

The near-orthogonality of persistence and rhythmicity was quantified directly by head-to-head comparison of |λ| against cosinor regression and JTK_CYCLE on the same 20,955-gene primary dataset (Whiteside 2025c). Three metrics are compared: (1) Spearman ρ between |λ| and cosinor R²; (2) Spearman ρ between |λ| and JTK_CYCLE amplitude rank; (3) Spearman ρ between cosinor R² and JTK_CYCLE amplitude rank as a reference.

The results are:
- |λ| vs cosinor R²: ρ = 0.256
- |λ| vs JTK_CYCLE: ρ = 0.215
- Cosinor vs JTK_CYCLE: ρ = 0.649

The two existing methods are substantially correlated with each other, as expected — both target sinusoidal rhythmicity. AR(2) |λ| is only weakly correlated with either, confirming that it captures information structurally distinct from rhythmicity. This has a direct practical consequence: 9,828 genes (46.9% of the 20,955-gene test set) are detected by AR(2) eigenvalue analysis alone — they show high temporal persistence without sinusoidal dynamics. These genes are not arrhythmic in the biologically meaningful sense; they have sustained regulatory momentum that existing tools structurally cannot detect.

---

## 3. Cross-Species and Tissue Architecture

### 3.1 The central-peripheral eigenvalue gradient

The PAR(2) framework was applied to 16 core clock genes across 12 mouse tissues from GSE54650, asking whether temporal persistence varies systematically with position in the circadian hierarchy (Whiteside 2025e). A pronounced gradient is observed.

The hypothalamus — which contains the suprachiasmatic nucleus (SCN), the master circadian pacemaker — shows the lowest mean clock gene eigenvalue across all 12 tissues (|λ| = 0.469). Peripheral tissues rank substantially higher: lung |λ| = 0.797, kidney |λ| = 0.738, heart |λ| = 0.698. The 1.70-fold range between the most central and most peripheral tissue is directionally opposite to what a simple "master clock is strongest" model would predict, but consistent with the functional architecture of the system: the SCN is not the most persistent oscillator but the most phase-plastic, rapidly resetting to environmental light cues. Peripheral clocks are high-persistence integrators that resist rapid phase shifts — their high |λ| reflects the stability that makes re-entrainment slow.

The temporal correlation length ratio between the most peripheral (lung, τ_c = 8.8 hours) and most central (hypothalamus, τ_c = 3.1 hours) tissues is 2.84×. This provides a quantitative, gene-level prediction for the re-entrainment lag ratio — the extra days peripheral tissues require to resynchronise after a shift in the light schedule. The prediction is directionally consistent with experimental re-entrainment data showing peripheral clock lag of 7–14 days versus SCN re-entrainment within 1–3 days, corresponding to a lag ratio in the range of 2–7×.

Per-gene analysis within the hypothalamus identifies Cry1, Per1, and Per2 as the most rapidly cycling genes (|λ| = 0.26–0.54 in hypothalamus) — consistent with their established role in the rapid negative feedback limb of the transcription-translation feedback loop. Per3, Dbp, and Tef achieve the highest persistence values in peripheral tissues (|λ| = 0.88–0.97 in lung), consistent with their output-driver function.

### 3.2 Cross-species replication in the baboon circadian atlas

The central-peripheral gradient is replicated in the baboon multi-tissue circadian atlas (GSE98965; 60 tissues, direct SCN dissection; Sheehan, Bhaskaran et al. 2022) in a pre-specified analysis with four a priori predictions. The baboon SCN shows mean clock gene |λ| = 0.4708 — virtually identical to the mouse hypothalamus value of 0.4690 — despite approximately 30 million years of evolutionary divergence between the two species. The baboon lung achieves |λ| = 0.797 with τ_c = 5.48 hours, against SCN τ_c = 2.65 hours, a ratio of 2.07×.

Three of four pre-specified predictions pass in the baboon data: (1) SCN shows lowest clock gene |λ| among CNS tissues; (2) the CNS < Peripheral gap is significant by permutation (p = 0.022); (3) the lung-to-SCN τ_c ratio exceeds 1.5×. The SCN eigenvalue conservation across rodents and primates suggests the low-persistence, phase-plastic SCN phenotype is an evolutionarily conserved feature of master clock function, not a rodent-specific experimental artefact.

---

## 4. Disease Applications

### 4.1 Cancer: hierarchy narrowing and inversion

The clock-target eigenvalue hierarchy provides a quantitative framework for detecting disease-state disruption of circadian temporal organisation. Two cancer contexts have been examined: MYC-driven oncogenesis in neuroblastoma and APC-mutant colorectal cancer in intestinal organoids.

**MYC-driven neuroblastoma (Whiteside 2025f).** In healthy human blood with intact circadian architecture (GSE48113), the p53 regulon shows internal ordering: pro-apoptotic targets (BBC3/PUMA, PMAIP1/NOXA, BAX, FAS, APAF1) have median |λ| = 0.330, below survival-promoting genes (BCL2, BCL2L1, MCL1, BIRC5, XIAP; median |λ| = 0.399). This pro-apoptotic < survival ordering is confirmed in sufficient sleep (GSE39445) and disrupted under sleep restriction (six hours per night) and shift work — conditions in which the survival branch collapses below the pro-apoptotic branch, reversing the predicted ordering.

In MYC-ON neuroblastoma (GSE221103, Altman/Dang lab), p53 regulon temporal persistence is significantly elevated above the expressed-gene genome background: regulon median |λ| = 0.680, genome median = 0.525, Mann-Whitney p = 0.0037 (corrected; 22 regulon genes). Importantly, this significance is restricted to the MYC-ON condition: MYC-OFF shows genome median |λ| = 0.476 and regulon median |λ| = 0.539 (p = 0.589, not significant). The MYC-dependent selectivity of the effect argues against a non-specific compression of the eigenvalue distribution and supports a model in which MYC locks the p53 regulon into a high-persistence, constitutive expression state.

Independent replication in U2OS human osteosarcoma cells (GSE221173, c-MYC-ER system, Rep2, N=25) yields MYC-ON regulon |λ| = 0.725 versus genome |λ| = 0.579 (p = 0.021), with MYC-OFF again non-significant (p = 0.925). Replication across two cell lines, two cancer types, and two independent laboratory datasets strengthens confidence that the MYC-dependent regulon elevation is a real phenomenon rather than a cell-line-specific artefact.

**APC-mutant intestinal organoids (Whiteside 2025g).** The GSE157357 dataset (Matsu-ura et al. 2021) provides circadian RNA-seq from mouse intestinal organoids across four genotypes: wild-type (WT), BmalKO, ApcKO, and double-knockout (DblKO). In WT organoids, the canonical clock-target hierarchy is present: clock gene mean |λ| = 0.588, target gene mean |λ| = 0.556, gap = +0.033.

APC loss — the most common initiating mutation in colorectal cancer — collapses and inverts this hierarchy: the gap narrows to −0.127 (clock 0.663, target 0.790). This inversion is driven by constitutive saturation of E2F/cell-cycle targets: Cdk1 (|λ| = 0.973), Ccnb1 (0.9999), and Ccne1 (0.9999) all carry real characteristic roots — indicating these genes have lost oscillatory dynamics entirely and are constitutively locked in a high-expression state. The E2F programme rises from mean |λ| = 0.512 in WT to 0.836 in ApcKO, becoming the dominant temporal programme.

The DblKO experiment provides a natural mechanistic control: deleting BMAL1 in addition to APC nearly completely restores WT programme ordering (clock 0.583 > Wnt 0.589 > NF-κB 0.531 > E2F 0.517), confirming that BMAL1 is required for APC-driven E2F dominance. The collapse mechanism differs qualitatively from BmalKO hierarchy collapse, which proceeds through clock-layer loss (Δ = −0.089) rather than target-layer elevation — providing a mechanistic distinction between clock-driven and proliferation-driven hierarchy disruption.

### 4.2 Neurodegeneration: glial clock inversion in Alzheimer's disease

Whiteside (2025h) applied AR(2) eigenvalue analysis to the AD Glial Circadian Atlas (GSE261698; Sheehan, Musiek et al. 2025, *Nature Neuroscience*), which provides 12-timepoint circadian RNA-seq from immunopanned mouse cortical astrocytes and microglia across WT, APP amyloid pathology (5xFAD model), and aged (18-month) conditions.

In WT astrocytes, the clock panel is led by Per1 (|λ| = 0.731), well above the genome median of 0.533 across 14,025 genes. Amyloid pathology produces not uniform suppression but selective hierarchy inversion between functional arms of the clock mechanism. The negative feedback arm collapses dramatically: Per1 0.731 → 0.360 (Δ = −0.371), Per2 0.605 → 0.333 (Δ = −0.272), Cry2 0.652 → 0.232 (Δ = −0.421), Clock 0.575 → 0.204 (Δ = −0.371). Simultaneously, the D-box output arm strengthens: Dbp 0.691 → 0.865 (Δ = +0.174), Tef 0.489 → 0.678 (Δ = +0.189), Per3 0.542 → 0.798 (Δ = +0.256).

This divergence — repressive arm collapsing while the output arm gains persistence — is mechanistically interpretable as disruption of the transcription-translation feedback loop (TTFL) specifically at the negative feedback step. Without effective PER/CRY repression, the CLOCK:BMAL1 positive limb and its output targets (Dbp, Tef) persist constitutively. Aged astrocytes show a qualitatively similar but less extreme pattern, suggesting ageing partially recapitulates amyloid pathology in clock organisation.

Microglia present a different baseline: Clock is nearly absent (|λ| = 0.209 versus 0.575 in astrocytes), and the Per2/Tef axis leads. This cell-type specificity — different genes leading the clock hierarchy in astrocytes versus microglia — establishes that AR(2) eigenvalue analysis can resolve cell-type-specific circadian architecture within the same tissue, providing discriminating power beyond bulk-tissue analysis.

A secondary observation in the APP astrocyte data concerns prostaglandin metabolism. Hpgd (15-PGDH, the enzyme responsible for prostaglandin inactivation) shows WT astrocyte |λ| = 0.710 (real roots, constitutive, +0.177 above the genome median) and APP astrocyte |λ| = 0.575 (complex roots, oscillatory), with a root-type change from real (constitutive) to complex (oscillatory) — interpreted as a constitutive-to-oscillatory regime shift in prostaglandin-clearing dynamics. This observation is post-hoc and directionally consistent with recently reported 15-PGDH neuroinflammation findings (Pieper and Markowitz 2026) but requires independent validation before causal interpretation.

---

## 5. The Temporal Correlation Length Framework

The reframing of |λ| as a temporal correlation length (Whiteside 2025d) connects the AR(2) framework to the physics of correlated systems and provides an intuitive, unit-bearing interpretation of the eigenvalue metric. By analogy with the correlation length in condensed-matter physics, τ_c = −1/ln(|λ|) × Δt gives the characteristic timescale over which a gene's expression memory decays: the half-life of its regulatory momentum.

Applied to the 12-tissue mouse atlas, clock gene τ_c averages 3.9 hours and target gene τ_c averages 2.0 hours — a 2.0-fold ratio confirmed in all 13 tissue conditions (13/13 tissues, 18.5× below the 24-hour cycle). Tissue-level τ_c is significantly correlated with independent measures of tissue circadian robustness: Spearman ρ = 0.794 between tissue τ_c gap and fraction of rhythmic genes (p ≤ 0.002), ρ = 0.822 between τ_c gap and gene rhythmicity score.

The framework enables a disease phase diagram in τ_c space. Healthy tissue shows a clock-to-target τ_c ratio of 1.74×. BMAL1-KO (circadian clock ablation) narrows the ratio to 0.99× — clock and target memory become indistinguishable. APC-KO intestinal organoids show ratio 0.43× (target exceeds clock; E2F programme dominant). The double-knockout provides partial rescue at 1.22×. These values trace a disease trajectory through τ_c space from health through clock disruption to oncogenic reprogramming, with quantitative positions determined by the biology of each perturbation.

---

## 6. Phase-Gated Coupling

The PAR(2) framework extends to phase-dependent clock-to-target coupling, where the coupling strength between a clock gene and its target varies as a function of the circadian phase (Whiteside 2025i). Applied to 28,138 clock-target gene pairs across liver, heart, cerebellum, and intestinal organoids, phase-gated AR(2) identifies tissue-specific gating architectures: Wee1 is the coupling hub in liver, Tead1/YAP1-linked in heart (with directionality caveat — Abenza et al. 2023 established that YAP/TAZ acts upstream of the clock in heart, meaning the coupling direction cannot be inferred from expression data alone), and Cdk1 in cerebellum.

The methodological distinction from phase-alignment approaches (cross-correlation, cosinor phase-difference) is structural rather than quantitative. Cross-correlation and cosinor phase-difference detect marginal associations across the full phase range. Phase-gated AR(2) models the conditional coupling at each phase separately, detecting phase-concentrated coupling that marginal methods cannot resolve. Monte Carlo simulation across 1,000 replicates demonstrates that cross-correlation detects 8.5% and cosinor phase-difference 1.7% of phase-concentrated couplings; phase-gated AR(2) retains 98.5% power across the same range while maintaining lower false-positive rates (7.4% versus 19.0%).

---

## 7. Platform and Reproducibility

The analytical methods reviewed here are implemented in the PAR(2) Discovery Engine, an open-access full-stack web platform deployed at par2discovery.com (Whiteside 2025c). The platform processes the full genome (approximately 20,000 genes) for embedded datasets and accepts user-uploaded CSV files through the Discovery Engine module. It embeds 64 CSV-format datasets spanning five species and enables all reported analyses without external repository dependencies.

The genome-wide coupling scan covers approximately 21,000 genes, identifying statistical clock coupling through AR(2)+exogenous models. All analytical outputs are tied to specific platform versions (Git commit SHA) to enable exact reproduction. A self-contained reproducibility package provides standalone AR(2) code, embedded datasets, and pre-computed eigenvalue tables reproducible from a single command. A standalone Python package (par2-circadian v1.0.0, MIT licence) implementing the core pipeline in NumPy/pandas provides a clean interface for independent verification and adoption.

---

## 8. Discussion

### 8.1 What the framework does and does not claim

The PAR(2) framework makes a methodological claim and several empirical observations. The methodological claim — that AR(2) eigenvalue modulus |λ| captures temporal persistence independently of rhythmicity — is supported by the near-zero correlation between |λ| and established rhythmicity metrics (Section 2.4) and by the large fraction of genes detected by |λ| alone. The empirical observations — the Clock > Target hierarchy, its collapse in cancer and disease, the central-peripheral eigenvalue gradient — are supported by replication across independent datasets and pre-specified permutation tests.

What the framework does not claim is causal mechanism. AR(2) fitting to bulk RNA-seq time series detects statistical relationships between consecutive timepoints; it does not identify physical binding sites, direct transcriptional targets, or causal regulatory edges. The hierarchy between clock and target genes is consistent with the clock being a sustained temporal regulator, but the direction of causality cannot be established from expression data alone. Perturbation-based follow-up — chromatin immunoprecipitation, knockout, optogenetics — is required to establish mechanistic links for any individual hit.

### 8.2 The eigenvalue as a context-sensitive measure

A conceptual clarification important for interpreting multi-tissue and disease-state comparisons: |λ| is not a fixed property of a gene. It is a gene-in-context measurement, reflecting the activity state of the regulatory programme to which that gene belongs in the tissue and condition under study. The Wnt target gene set, for example, shows mean |λ| = 0.44 in the 12-tissue mouse atlas (where Wnt is largely inactive across most tissues), rising to 0.55 in normal intestinal organoids (where Wnt is functionally active) and 0.71 in ApcKO organoids (where Wnt is constitutively activated). This 61% increase across contexts is attributable to regulatory context, not to any change in the genes themselves.

This context-sensitivity is not a limitation — it is the feature that makes the metric biologically informative in disease states. But it has a practical implication: cross-tissue or cross-condition comparisons of eigenvalues for non-universal programmes require tissue-matched controls. Clock gene comparisons are more robust because the circadian programme is near-universally active; most other regulons are not.

### 8.3 The oscillatory-high versus constitutively-saturated-high distinction

A methodological limitation of the current |λ| reporting is that two qualitatively distinct biological states produce high eigenvalues. Complex characteristic roots (discriminant φ₁² + 4φ₂ < 0) indicate genuinely oscillatory dynamics: the gene sustains a decaying oscillation with high amplitude. Real characteristic roots (discriminant > 0) indicate constitutive, non-oscillatory dynamics: the gene is high and stays high, exhibiting autocorrelation through persistence rather than rhythm. Both score as high-persistence under |λ|, but they represent entirely different regulatory regimes.

The distinction matters acutely in disease contexts. In ApcKO organoids, Cdk1, Ccnb1, and Ccne1 all have real roots with |λ| approaching 1.0 — not because they are oscillating with very high amplitude, but because they are constitutively saturated, locked at maximal expression without any cyclic dynamics. In the AD glial clock, Dbp and Tef gain high |λ| in APP astrocytes with complex roots — genuinely sustained oscillatory output despite the collapse of the repressive arm that normally gates them. The complex-root flag is computed internally during AR(2) fitting and should be surfaced as a standard reporting column alongside |λ| in future platform development.

### 8.4 Limitations

**Time series length.** Most circadian datasets provide 12–24 timepoints at 2-hour intervals. With n = 12, eigenvalue estimates for near-unit-root genes (|λ| > 0.90) carry substantial uncertainty: ordinary least squares cannot reliably distinguish |λ| = 0.93 from |λ| = 1.00 in a near-integrated process with this few observations. Values in this range should be interpreted as "very high persistence" rather than precise numbers.

**Stationarity assumption.** AR(2) fitting assumes stationarity — that the gene's statistical properties do not change over the observation window. Genes with genuine unit-root dynamics (|λ| = 1.0 exactly) or explosive dynamics (|λ| > 1.0) violate this assumption. Eigenvalues slightly above 1.0 observed in some disease-state analyses (AD APP astrocytes) are treated as ceiling indicators of near-critical or transiently explosive dynamics rather than precise estimates.

**Model order.** AR(2) captures at most two harmonics of a circadian signal. Genes with complex waveforms — multiple peaks per 24-hour cycle — may be poorly fit. The model's R² value, reported alongside |λ|, should be consulted when interpreting individual gene results in such cases.

**Single-author, within-cohort validation.** The 22-dataset validation panel was analysed by the same author using the same computational pipeline. Replication by independent groups applying independently implemented pipelines would substantially strengthen confidence in the reported hierarchy values.

**mRNA half-life measurement gap.** The independence of |λ| from mRNA half-life (Section 2.3) is established under cross-species, cross-tissue measurement conditions. A matched half-life study — metabolic labelling in the same tissue and species as the AR(2) data — is the appropriate next test.

---

## 9. Conclusions

The AR(2) eigenvalue modulus |λ| quantifies a property of gene expression time series that established circadian analysis methods do not capture and cannot detect. Across 22 datasets and five species, it consistently identifies a clock-target persistence hierarchy that survives pre-specified bias audits, is independent of mRNA half-life, and is near-orthogonal to rhythmicity metrics. This hierarchy has measurable structure across tissues — manifesting as a central-peripheral eigenvalue gradient that predicts re-entrainment lag and is conserved across 30 million years of primate evolution — and is disrupted in disease states by mechanisms that the metric can distinguish: clock-layer loss in BMAL1 ablation, target-layer saturation in APC-mutant cancer, and selective feedback-arm collapse in Alzheimer's disease glia.

The framework is open, reproducible, and falsifiable. Its primary value is as a complement to existing tools: not replacing rhythmicity detection but capturing the temporal persistence dimension that rhythmicity methods are structurally blind to. The appropriate next steps — matched half-life studies, independent pipeline replication, cell-type-specific validation, and perturbation-based causal testing of individual findings — are experimentally tractable and will determine which elements of the framework extend beyond computational observation into established mechanism.

---

## References

Albrecht U et al. (1997) A differential response of two putative mammalian circadian regulators, mPer1 and mPer2, to light. *Cell* 91:1055–1064.

Balsalobre A et al. (2000) Resetting of circadian time in peripheral tissues by glucocorticoid signalling. *Science* 289:2344–2347.

Berson DM et al. (2002) Phototransduction by retinal ganglion cells that set the circadian clock. *Science* 295:1070–1073.

Brown SA et al. (2002) Rhythms of mammalian body temperature can sustain peripheral circadian clocks. *Curr Biol* 12:1574–1583.

Buijs RM and Kalsbeek A (2001) Hypothalamic integration of central and peripheral clocks. *Nat Rev Neurosci* 2:521–526.

Cornelissen G (2014) Cosinor-based rhythmometry. *Theor Biol Med Model* 11:16.

Damiola F et al. (2000) Restricted feeding uncouples circadian oscillators in peripheral tissues from the central pacemaker in the suprachiasmatic nucleus. *Genes Dev* 14:2950–2961.

Dunlap JC (1999) Molecular bases for circadian clocks. *Cell* 96:271–290.

Hattar S et al. (2002) Melanopsin-containing retinal ganglion cells: architecture, projections, and intrinsic photosensitivity. *Science* 295:1065–1070.

He Y et al. (2009) The transcriptional repressor DEC2 regulates sleep length in mammals. *Science* 325:866–870.

Hughes ME et al. (2010) Harmonics of circadian gene expression in mammals. *PLoS Genet* 6:e1000442.

Knutsson A (2003) Health disorders of shift workers. *Occup Med* 53:103–108.

Matsu-ura T et al. (2021) Intercellular coupling of the cell cycle and circadian clock in adult stem cell culture. *Cell Mol Gastroenterol Hepatol* 12:1847–1872. PMID:34534703.

Nelson W et al. (1979) Methods for cosinor-rhythmometry. *Chronobiologia* 6:305–323.

Pieper AA and Markowitz J (2026) 15-PGDH and neuroinflammation in Alzheimer's disease. *Proc Natl Acad Sci* [Ref 27 in Whiteside 2025h].

Ralph MR et al. (1990) Transplanted suprachiasmatic nucleus determines circadian period. *Science* 247:975–978.

Reppert SM and Weaver DR (2002) Coordination of circadian timing in mammals. *Nature* 418:935–941.

Roenneberg T et al. (2019) Circadian entrainment concepts. *J Biol Rhythms* 34:446–451.

Schernhammer ES et al. (2001) Rotating night shifts and risk of breast cancer in women participating in the Nurses' Health Study. *J Natl Cancer Inst* 93:1563–1568.

Schwanhäusser B et al. (2011) Global quantification of mammalian gene expression control. *Nature* 473:337–342.

Sheehan PW, Musiek ES et al. (2025) AD Glial Circadian Atlas. *Nature Neuroscience* [GSE261698].

Shigeyoshi Y et al. (1997) Light-induced shuttling of Per1 mRNA from nucleus to cytoplasm: communication between transcription and translation. *Cell* 91:1043–1053.

Tani H et al. (2012) Genome-wide determination of RNA stability reveals hundreds of short-lived noncoding transcripts in mammals. *Genome Res* 22:947–956.

Thaben PF and Westermark PO (2014) Detecting rhythms in time series with RAIN. *J Biol Rhythms* 29:391–400.

Welsh DK et al. (1995) Individual neurons dissociated from rat suprachiasmatic nucleus express independently phased circadian firing rhythms. *Neuron* 14:697–706.

Whiteside M (2025a). Autoregressive eigenvalue analysis reveals a conserved clock-target temporal persistence hierarchy across circadian datasets. *Research Square* preprint. https://doi.org/10.21203/rs.3.rs-9283100/v1 [Paper A — in submission, PLOS ONE]

Whiteside M (2025b). Expression persistence is independent of mRNA half-life across non-circadian datasets. *Research Square* preprint. https://doi.org/10.21203/rs.3.rs-9385465/v1 [Paper F — targeting Genome Biology]

Whiteside M (2025c). The PAR(2) Discovery Engine — a reproducible methods platform for temporal persistence analysis of gene expression time series. Manuscript in preparation. [Paper M — targeting GigaScience]

Whiteside M (2025d). Temporal correlation length as a gene-level circadian metric: AR(2) eigenvalue analysis of multi-tissue persistence. Manuscript in preparation. [Paper P — targeting PLOS Computational Biology]

Whiteside M (2025e). The central-peripheral clock eigenvalue gradient: AR(2) analysis of multi-tissue temporal persistence with implications for light entrainment dynamics. Manuscript in preparation. [Paper Q — targeting Journal of Biological Rhythms]

Whiteside M (2025f). Temporal persistence of the p53 regulon quantified by autoregressive eigenvalue analysis. Manuscript in preparation. [Paper N — targeting Cell Death & Differentiation]

Whiteside M (2025g). APC loss collapses the circadian clock–cell cycle temporal hierarchy in intestinal organoids. Manuscript in preparation. [Paper O — targeting Journal of Biological Rhythms]

Whiteside M (2025h). Amyloid pathology selectively collapses the negative feedback arm of the astrocyte circadian clock. Manuscript in preparation. [Paper H — targeting Neurobiology of Disease / Journal of Neuroinflammation]

Whiteside M (2025i). Dynamical clock-target coupling across mammalian tissues: a phase-varying AR(2) framework. Manuscript in preparation. [Paper E — targeting Journal of Biological Rhythms]

Yamazaki S et al. (2000) Resetting central and peripheral circadian oscillators in transgenic rats. *Science* 288:682–685.

---

*Draft: May 2026. All data, code, and pre-computed results available at par2discovery.com and https://github.com/mickwh2764/par2-discovery-engine.*
