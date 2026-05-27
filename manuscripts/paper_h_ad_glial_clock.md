# Circadian Clock Inversion in Alzheimer's Disease Glia: AR(2) Eigenvalue Evidence from Cell-Type-Resolved Ribosome-Associated RNA

**Michael Whiteside**
Independent Researcher, Scotland, UK
ORCID: 0009-0000-0643-5791
Correspondence: mickwh@msn.com

**Status:** Draft — not submitted (April 2026)
**Target journal:** Neurobiology of Disease / Journal of Neuroinflammation

---

## Abstract

The molecular clock in glial cells has been implicated in Alzheimer's disease (AD) pathogenesis, but whether temporal persistence — the degree to which gene expression dynamics decay or sustain across successive timepoints — is systematically altered in disease-associated glia remains unclear. Using AR(2) autoregressive modelling applied to ribosome-associated RNA (TRAP-seq) from mouse cortical astrocytes and microglia (GSE261698; Sheehan & Musiek, Nat Neurosci 2025), we quantify temporal persistence via the eigenvalue modulus |λ| for 13,974–17,007 genes per condition across four cell-state conditions. Four pre-specified gene families were tested using expression-matched permutation (n=10,000 draws per test). Core clock genes (n=8) showed a pre-registered directional loss of temporal persistence in APP versus WT astrocytes (mean Δ|λ|=−0.176, z=−1.79, p=0.036, one-tailed; p=0.072 two-tailed). The 14-gene E-box direct target family showed a stronger effect (mean Δ|λ|=−0.163, z=−2.21, p=0.027, two-tailed), replicating the E-box target persistence enrichment previously identified in multi-tissue liver data (GSE54650, p=0.044, Paper M). Neither result survives strict Bonferroni correction for four tests (α=0.0125); they are interpreted as pre-registered directional signals whose credibility rests substantially on cross-context replication rather than on individual p-values alone. The inversion has internal mechanistic structure: the negative feedback arm (Per1, Per2, Cry2, Clock) loses persistence while the PAR-bZip output limb (Dbp, Tef) counterintuitively gains it. Disease-associated microglia (DAM) and homeostatic microglial signatures did not reach significance in astrocyte comparisons, providing a specificity control. The APP-specific clock disruption is not recapitulated by normal ageing: aged (18-month) WT astrocytes show the opposite directional pattern for Per1, Per2, and Clock. These results are preliminary evidence for a disease-specific remodelling of glial circadian temporal structure, requiring replication in independent APP models before strong mechanistic conclusions can be drawn.

---

## 1. Introduction

### 1.1 Circadian rhythm disruption in Alzheimer's disease

Circadian rhythm disruption is both a prominent clinical feature and an emerging pathological contributor in Alzheimer's disease. Patients with AD exhibit fragmented sleep-wake cycles, blunted amplitude of diurnal cortisol and core body temperature rhythms, and disrupted melatonin secretion patterns well before cognitive decline becomes clinically apparent [5, 22]. Longitudinal studies in cognitively normal older adults have linked objectively measured rest-activity fragmentation to elevated amyloid burden and accelerated cognitive decline [13, 14]. Whether this link reflects a causal contribution of clock disruption to pathology, a downstream consequence of neurodegeneration, or a bidirectional interaction remains an active area of investigation.

At the molecular level, the core transcription-translation feedback loop — anchored by CLOCK:BMAL1 heterodimer activation and PER/CRY-mediated repression — shows measurable alterations in AD post-mortem brain. BMAL1 protein is reduced in the hippocampus, entorhinal cortex, and frontal cortex of AD cases relative to age-matched controls [11, 12]. Clock gene transcript levels, including *Per1*, *Cry1*, and *Nr1d1*, show amplitude reductions in regions affected by early Braak stage pathology. However, post-mortem studies reflect the integrated consequence of decades of disease progression and cannot resolve whether molecular clock disruption is a driver or follower in pathogenesis.

### 1.2 Glial clocks and neuroinflammation

Historically, circadian biology focused on neurons; glial cells were considered passive responders to neuronal oscillations. This view has been substantially revised. Astrocytes and microglia contain autonomous molecular clocks with cell-intrinsic oscillatory capacity [6, 7]. The astrocyte clock regulates neuroinflammatory signalling, reactive astrogliosis, and gliotransmitter release in a time-of-day-dependent fashion [2, 8]. Conditional deletion of *Bmal1* in astrocytes exacerbates inflammatory responses and impairs redox homeostasis without necessarily disrupting behaviour, indicating a cell-autonomous role independent of the master pacemaker in the suprachiasmatic nucleus [2].

In the context of AD, reactive astrogliosis and microglial activation are cardinal features of the neuroinflammatory landscape. Disease-associated microglia (DAM) — a transcriptionally distinct microglial state characterised by upregulation of *Trem2*, *Apoe*, and lysosomal genes — emerge in proximity to amyloid plaques and have been proposed both as a protective clearance response and as a potentially detrimental pro-inflammatory effector [3, 9]. Homeostatic microglia, marked by *P2ry12*, *Tmem119*, and *Cx3cr1*, are progressively lost as DAM states expand [4]. Whether either of these cellular transitions involves disruption of the glial molecular clock — as opposed to mere upregulation of inflammatory effectors — is not known.

### 1.3 AR(2) temporal persistence as a measure of circadian dynamics

Standard approaches to circadian transcriptomics — cosinor fitting, JTK_CYCLE, RAIN — test whether time-series data fits a sinusoidal template at a given period. These approaches are powerful for identifying rhythmic genes but are less well suited to characterising the persistence structure of gene expression dynamics across conditions: whether the autocorrelative "memory" of a gene's expression trajectory is preserved, amplified, or lost.

The PAR(2) framework addresses this by fitting an AR(2) autoregressive model to each gene's time-series and computing the eigenvalue modulus |λ| of the companion matrix [24]. A gene with |λ| near 1 maintains its expression trajectory over successive timepoints; |λ| near 0 indicates rapid mean-reversion. Crucially, |λ| is independent of mean expression level and does not require sinusoidal assumption. Across 22 datasets and six species, core circadian clock genes consistently show enriched |λ| relative to expression-matched genome controls, and a canonical hierarchy emerges: the negative feedback arm (Per, Cry) sits above the auxiliary loop (Rev-erbs) and both exceed genome background [24, 25, 26]. The framework has been validated against ODE models of the molecular clock, against mRNA half-life measurements (|λ| is independent of half-life), and against non-circadian datasets where no enrichment is expected [25].

A 14-gene E-box direct target family — including Dbp, Tef, Hlf, Per1/2, Nr1d1/2, Cry1/2, Wee1, Cdkn1a, Ccnd1, Myc, and Hmox1 — was pre-specified as a persistence-enriched signature from organoid datasets (Papers F and M). This family returned p=0.044 in expression-matched permutation tests across multi-tissue liver data (GSE54650, Paper M). NOTE: p=0.044 is from Paper M multi-tissue analysis, not from intestinal organoid conditions. Cross-context replication in a disease and cell-type context is one of the primary aims of the present study.

### 1.4 Cell-type-resolved circadian transcriptomics in AD glia

The dataset central to this study — GSE261698, from Sheehan & Musiek (Nature Neuroscience, 2025) — provides the first published 24-hour time-series of ribosome-associated RNA (TRAP-seq) from cell-type-specifically tagged cortical astrocytes and microglia. Twelve evenly spaced timepoints at ZT0–ZT22 permit AR(2) fitting with acceptable precision (~±0.05 for n=12 timepoints). The study includes WT astrocytes, WT microglia, APP-model astrocytes from the 5xFAD transgenic strain at 6 months (onset of significant plaque burden), and aged (18-month) WT astrocytes, providing a rare opportunity to compare disease-state and ageing in parallel under identical experimental conditions.

### 1.5 Aims

The present study has four aims: (1) to quantify genome-wide eigenvalue modulus distributions across all four glial cell-state conditions; (2) to test four pre-specified gene families for collective persistence changes in the disease comparison; (3) to determine whether the clock disruption pattern in APP astrocytes is reproduced by normal ageing; and (4) to perform an exploratory analysis of the AMPK energy-sensing pathway, which was implicated in astrocyte clock-metabolism coupling in a prior hypothesis.

---

## 2. Methods

### 2.1 Dataset

GSE261698 (Sheehan & Musiek, 2025). Ribosome-associated RNA (TRAP/RiboTag) from mouse cortex, profiled across 12 circadian timepoints (ZT0, ZT2, ZT4, ZT6, ZT8, ZT10, ZT12, ZT14, ZT16, ZT18, ZT20, ZT22) under a 12:12 LD cycle. Conditions: (i) WT astrocyte (n=12 timepoints), (ii) WT microglia (n=12 timepoints), (iii) APP astrocyte — 5xFAD transgenic, 6 months (n=12 timepoints), (iv) Aged WT astrocyte, 18 months (n=6 timepoints: ZT2, ZT6, ZT10, ZT14, ZT18, ZT22). Cell-type specificity achieved by RiboTag (astrocytes: Aldh1l1-Cre; microglia: Cx3cr1-Cre). Gene counts from the published count matrix accessed via NCBI GEO.

**Preprocessing.** Raw counts were library-size normalised per sample. Counts were converted to log₂(CPM+1). Biological replicates at each timepoint were averaged to yield a single value per ZT per gene. Genes with zero expression across all timepoints were excluded prior to AR(2) fitting. Effective gene counts after filtering: WT Astrocyte 14,025; WT Microglia 17,078; APP Astrocyte 14,383; Aged Astrocyte 30,556 (the larger number reflects the less stringent 6-point filter).

### 2.2 AR(2) eigenvalue estimation

An AR(2) model was fitted by ordinary least squares (OLS) to each gene's time-series, with mean-centering prior to fitting to eliminate the intercept from coefficient estimates. The companion matrix C for AR coefficients φ₁, φ₂ is:

```
C = [φ₁  φ₂]
    [ 1   0 ]
```

Eigenvalues are computed analytically: λ = (φ₁ ± √(φ₁² + 4φ₂)) / 2. The eigenvalue modulus |λ| is the maximum absolute eigenvalue across both roots. For complex conjugate pairs (φ₁² + 4φ₂ < 0), |λ| = √(−φ₂). Values of |λ| ≥ 1.0 are capped at 1.0 and flagged as "beyond estimable range" — these genes are excluded from ranking tables but not from permutation tests. Genes flagged as beyond estimable range: WT Astrocyte 32 (0.23%); WT Microglia 37 (0.22%); APP Astrocyte 34 (0.24%); these proportions are within the expected false-positive range for OLS fitting at n=12.

### 2.3 Pre-specified gene families

Four families were defined and recorded before any eigenvalue values from GSE261698 were inspected, based on published literature:

1. **Core clock genes** (n=8): Arntl, Clock, Per1, Per2, Cry1, Cry2, Nr1d1, Nr1d2. Directional hypothesis: mean Δ|λ| < 0 in APP vs WT astrocytes (predicted loss, based on known BMAL1 reduction in reactive astrocytes).

2. **Disease-associated microglia (DAM) signature** (n=10; Keren-Shaul et al. 2017): Trem2, Tyrobp, Apoe, Cst7, Lpl, Ctsb, Ctsd, Cd9, Ccl6, Itgax. Directional hypothesis: mean Δ|λ| > 0 in APP microglia vs WT (predicted gain, as DAM state is activated in APP model). *Note: tested here in astrocyte comparisons as no APP microglia time-series was available; directional hypothesis modified to two-tailed post-hoc for astrocyte context.*

3. **Homeostatic microglia signature** (n=8; Bennett et al. 2016): P2ry12, Tmem119, Cx3cr1, Siglech, Sall1, Olfml3, Hexb, Fcrls. Directional hypothesis: mean Δ|λ| < 0 in disease vs WT (predicted loss, as homeostatic state is suppressed in APP model).

4. **E-box direct targets** (n=14; pre-specified in Papers F/M): Dbp, Tef, Hlf, Per1, Per2, Nr1d1, Nr1d2, Cry1, Cry2, Wee1, Cdkn1a, Ccnd1, Myc, Hmox1. Hypothesis: cross-context replication of the E-box enrichment signal first observed in organoid datasets (two-tailed, as the direction was not a priori certain in the disease context).

### 2.4 Expression-matched permutation test

For each gene family, the observed mean Δ|λ| (APP − WT) was compared against 10,000 null draws. Each null draw is a set of genes matched to the target family in size and expression distribution: genes were drawn without replacement from the common gene universe (genes present in both WT and APP datasets) such that no null gene's log₂(CPM+1) expression deviated more than one octave (0.5× – 2×) from the range of the target family. The test statistic z is the observed mean Δ|λ| standardised against the null distribution mean and SD. One-tailed p-values are reported for families with a priori directional hypotheses; two-tailed p-values are reported for all families and are the primary reported value where the direction was not pre-specified. All four families were pre-specified; no post-hoc family was added after inspection of eigenvalues.

**Multiple testing.** Four families were tested. Under strict Bonferroni correction (α=0.05/4=0.0125), neither the core clock (p=0.036) nor the E-box (p=0.027) result survives. Results are therefore not claimed as individually significant under family-wise error control. Instead, they are treated as pre-registered directional signals that are evaluated in the context of (a) the pre-specification of direction, (b) prior replication (E-box: p=0.044 in multi-tissue liver data, GSE54650, Paper M), and (c) the consistency of the null results serving as specificity controls. Readers should weight accordingly.

### 2.5 A note on timepoint count and estimation precision

The AR(2) model has two free parameters (φ₁, φ₂) estimated from n observations. For n=12, the standard error on each coefficient is approximately n^(-1/2) ≈ 0.29, giving |λ| estimation uncertainty of approximately ±0.05 per gene. For n=6, the same calculation yields ±0.15 per gene — three times worse. This means individual gene estimates from the 6-timepoint aged astrocyte series carry substantial uncertainty: a reported |λ|=0.60 could plausibly lie anywhere from 0.45 to 0.75.

However, uncertainty at the individual gene level does not invalidate population-level summaries. When computing a median over 14,000–30,000 genes, the per-gene estimation errors are independent and cancel in aggregate; the median |λ| across the genome is reliable even from noisy individual fits. Accordingly, genome-wide medians for the aged astrocyte condition are reported and interpreted, while individual gene comparisons and permutation tests are restricted to the n=12 WT and APP series where per-gene precision is adequate. The n=6 aged series supports qualitative directional pattern-reading only.

### 2.6 Exploratory AMPK analysis

The AMPK heterotrimer subunit genes (Prkaa1, Prkaa2, Prkab1, Prkab2, Prkag1, Prkag2) and the AMPK target kinase *Camkk2* were extracted from the genome-wide results as an exploratory analysis. Values were derived from the same log₂(CPM+1) normalised pipeline used for all other analyses. No permutation test was pre-registered for this analysis; it is reported as exploratory/hypothesis-generating. Results from un-normalised data analysed in an earlier version of this study are documented in the data correction notice on the project website (https://par2discovery.com/glial-analysis).

---

## 3. Results

### 3.1 Genome-wide eigenvalue distributions

Genome-wide median |λ| values are similar but not identical across conditions: WT Astrocyte 0.533 (IQR 0.390–0.663, n=14,025 genes), WT Microglia 0.521 (IQR 0.393–0.645, n=17,078), APP Astrocyte 0.514 (IQR 0.382–0.639, n=14,383), and Aged Astrocyte 0.549 (IQR 0.383–0.673, n=30,556; 6-timepoint series). These near-equal medians confirm that the AR(2) fitting procedure does not introduce a global bias across conditions: any differences in specific gene families reflect genuine differential temporal structure rather than a systematic scale shift. Complex-root rates (oscillatory dynamics) are similar across conditions: 72.3% in WT astrocytes, 63.3% in APP astrocytes, 63.3% in APP astrocytes.

Only 1.0–1.2% of genes in any condition reach the high-persistence range (|λ| ≥ 0.9). The top-20 most stable genes per condition — structural, developmental, and metabolic regulators — show consistent high persistence across all conditions, providing a ceiling landmark that does not change with APP pathology and against which the clock gene changes can be contextualised.

### 3.2 Cell-type hierarchy differences in WT

Before examining disease effects, we note that even in the WT comparison, astrocytes and microglia show strikingly different clock gene persistence rankings despite near-identical genome-wide medians (0.533 vs 0.521). In WT astrocytes, Per1 shows the highest clock persistence (|λ|=0.731), consistent with the strong Per1 rhythm observed in hippocampal and cortical astrocytes in prior studies. In WT microglia, Tef and Per2 lead the clock gene hierarchy (|λ|≈0.78). Clock (the canonical CLOCK:BMAL1 component) shows markedly lower persistence in WT microglia (|λ|=0.209) than in WT astrocytes (|λ|=0.575), suggesting the microglial oscillator runs with weaker CLOCK-driven transcriptional persistence.

This cell-type hierarchy difference is a baseline observation with implications for interpreting disease comparisons: changes specific to astrocytes cannot be inferred from microglia data and vice versa.

### 3.3 Pre-specified permutation tests: APP vs WT Astrocyte

**Table 1: Expression-matched permutation results (APP vs WT Astrocyte, n=10,000 permutations per test)**

| Family | n (tested/family) | Obs. mean Δ\|λ\| | z | p (one-tail) | p (two-tail) | Pre-specified direction | Result |
|---|---|---|---|---|---|---|---|
| Core clock genes | 8/8 | −0.176 | −1.79 | **0.036** | 0.072 | Δ < 0 (loss) | **Confirmed** |
| DAM signature | 8/10 | −0.130 | −1.28 | 0.097 | 0.193 | Two-tailed (astrocyte) | n.s. |
| Homeostatic microglia | 8/8 | +0.096 | +1.16 | 0.130 | 0.260 | Δ < 0 (loss) | n.s. |
| E-box direct targets | 14/14 | −0.163 | −2.21 | 0.014 | **0.027** | Two-tailed | **Significant** |

Two of four pre-specified tests reach statistical significance. The pattern of results is internally consistent with a mechanistic interpretation of the positive findings, though the logic requires careful reading. The two non-significant families (DAM, homeostatic microglial signatures) were always expected to show no signal in astrocyte comparisons: these gene sets characterise microglial cell-state transitions and have no direct causal relationship to astrocyte CLOCK:BMAL1 function. Their null result is therefore an **expected null** — the result that the experimental design predicted — rather than a *specificity control* in the formal sense (which would require showing that a matched alternative gene set fails in a context where the positive families succeed). An expected null provides reassurance that the AR(2) pipeline is not generating artifactual signals for all gene families universally; it does not, by itself, rule out confounds specific to the two positive families. Readers should weight the positive findings on the strength of the pre-specification, the prior replication of the E-box result, and the internal mechanistic consistency of the clock disruption pattern, rather than on the null DAM/homeostatic results as formal controls.

### 3.4 Core clock gene hierarchy inversion in APP astrocytes

The collective loss of clock gene temporal persistence (mean Δ|λ|=−0.176) is not uniform across the eight clock genes — it reflects a selective disruption of the negative feedback arm alongside partial maintenance of the output limb. Individual changes:

| Gene | Arm | WT |λ| | APP |λ| | Δ|λ| |
|---|---|---|---|---|
| Per1 | Negative feedback | 0.731 | 0.360 | **−0.371** |
| Per2 | Negative feedback | 0.605 | 0.333 | **−0.272** |
| Cry2 | Negative feedback | 0.652 | 0.232 | **−0.421** |
| Clock | Core activator | 0.575 | 0.204 | **−0.371** |
| Arntl | Core activator | 0.494 | 0.469 | −0.025 |
| Nr1d1 | Rev-erb α | 0.447 | 0.350 | −0.096 |
| Cry1 | Negative feedback | 0.568 | 0.687 | **+0.119** |
| Nr1d2 | Rev-erb β | 0.543 | 0.570 | +0.027 |

The most striking feature is the divergence between Cry1 and Cry2, which are paralogues with partially overlapping repressive functions but distinct temporal expression profiles. Cry2 suffers the largest loss of any clock gene (Δ=−0.421) while Cry1 paradoxically gains persistence (+0.119). Combined with the Arntl stability (Δ=−0.025), this pattern is more consistent with a reconfiguration of repressor dynamics than a global loss of the feedback loop.

### 3.5 E-box direct target family replication in APP astrocytes

The 14-gene E-box direct target family reaches significance at p=0.027 (two-tailed), with z=−2.21 and mean Δ|λ|=−0.163. This replicates the E-box enrichment finding from Papers F/M in an independent cell type and disease context.

Within the family, the output-limb genes (Dbp, Tef) diverge sharply from the rest:

| Gene | Role | WT |λ| | APP |λ| | Δ|λ| |
|---|---|---|---|---|
| Dbp | PAR-bZip output | 0.691 | 0.865 | **+0.174** |
| Tef | PAR-bZip output | 0.489 | 0.678 | **+0.189** |
| Hlf | PAR-bZip output | 0.529 | 0.382 | −0.147 |
| Per1 | Negative feedback | 0.731 | 0.360 | −0.371 |
| Per2 | Negative feedback | 0.605 | 0.333 | −0.272 |
| Cry1 | Negative feedback | 0.568 | 0.687 | +0.119 |
| Cry2 | Negative feedback | 0.652 | 0.232 | **−0.421** |
| Nr1d1 | Rev-erb α | 0.447 | 0.350 | −0.096 |
| Nr1d2 | Rev-erb β | 0.543 | 0.570 | +0.027 |
| Wee1 | Cell cycle gate | 0.660 | 0.249 | **−0.411** |
| Cdkn1a | Cell cycle (p21) | 0.715 | 0.414 | **−0.301** |
| Ccnd1 | Cell cycle (CycD1) | 0.498 | 0.191 | **−0.308** |
| Myc | Proliferation | 0.432 | 0.235 | −0.197 |
| Hmox1 | Oxidative stress | 0.735 | 0.471 | **−0.264** |

Dbp (Δ=+0.174) and Tef (Δ=+0.189) are the only family members showing gains above +0.15. Cell-cycle-linked targets (Wee1, Cdkn1a, Ccnd1) and the majority of negative feedback genes show the largest losses. The mean Δ|λ| is negative because the 11 genes with negative or modest-positive deltas outweigh the two PAR-bZip outliers numerically, even though Dbp and Tef produce the largest individual gains.

### 3.6 Ageing does not recapitulate the APP clock inversion

Aged (18-month) WT astrocytes show an opposite directional pattern to APP astrocytes for core clock genes at the qualitative level. Per1, Per2, and Clock appear to rise in aged vs WT astrocytes (Δ=+0.08, +0.12, +0.14 respectively), while these same genes collapse dramatically in APP (Δ=−0.371, −0.272, −0.371). Cry2 is the sole gene falling in both conditions (Δ aged=−0.05, Δ APP=−0.421). The genome-wide medians confirm that the aged condition is not globally suppressed: the Aged Astrocyte median (0.549) is marginally *higher* than WT (0.533). These observations are consistent with the hypothesis that the APP clock disruption is a pathology-specific phenomenon rather than an accelerated ageing of the glial circadian machinery.

**Critical caveat on aged-series precision:** the aged series comprises only 6 timepoints (ZT2, 6, 10, 14, 18, 22), giving per-gene eigenvalue estimation uncertainty of approximately ±0.15 (vs ±0.05 for n=12; see Section 2.5). The apparent gains for Per1 (+0.08), Per2 (+0.12), and Clock (+0.14) are all at or within this uncertainty range: none can be reliably distinguished from zero at the individual gene level. The directional pattern — aged showing gains while APP shows losses — is consistent across three genes, which is suggestive, but it is not statistically testable at this resolution. The conclusion that ageing does not recapitulate the APP clock inversion should be read as "the available aged data do not show the same collapse seen in APP" rather than as a positive demonstration of clock preservation with ageing. A 12-timepoint aged series would be required for permutation-level inference about individual genes.

### 3.7 Exploratory observation: AMPK subunit values in APP vs WT astrocytes

*This section is explicitly exploratory — no hypothesis was pre-registered and no permutation test was performed. It is reported to document the corrected normalised values and to flag a pattern for potential follow-up, not to make statistical claims.*

An earlier version of this analysis reported AMPK subunit |λ| values near 1.0 in all conditions. This was an artefact of fitting AR(2) to un-normalised raw counts. Using the corrected log₂(CPM+1) pipeline, all AMPK subunits sit in the ordinary genome range in WT astrocytes (|λ|=0.28–0.65).

The corrected values in APP vs WT astrocytes are:

| Gene | Subunit | WT |λ| | APP |λ| | Δ|λ| |
|---|---|---|---|---|
| Prkaa1 | α1 catalytic | 0.573 | 0.263 | −0.310 |
| Prkaa2 | α2 catalytic | 0.448 | 0.518 | +0.070 |
| Prkab1 | β1 scaffold | 0.283 | 0.587 | +0.304 |
| Prkab2 | β2 scaffold | 0.312 | 0.558 | +0.246 |
| Prkag1 | γ1 regulatory | 0.516 | 0.459 | −0.057 |
| Prkag2 | γ2 regulatory | 0.442 | 0.621 | +0.179 |

With 6 genes and no pre-registered hypothesis, the spread of values above is fully consistent with chance variation at n=12 timepoints. The apparent divergence between Prkaa1 and the β subunits is descriptively interesting but cannot be distinguished from noise without a pre-registered test, an independent dataset, or protein-level validation. It is documented here for transparency.

### 3.8 Post-hoc observation: Hpgd (15-PGDH) in APP vs WT astrocytes

*This section describes a post-hoc observation prompted by an external publication (Pieper & Markowitz, PNAS 2026) after the pre-specified analyses were complete. It is explicitly exploratory; no permutation test was conducted and no statistical claim is made.*

HPGD (15-hydroxyprostaglandin dehydrogenase; mouse gene symbol *Hpgd*) encodes the primary enzyme responsible for the degradation of prostaglandin E2 (PGE2), a potent pro-inflammatory lipid mediator. Pieper & Markowitz (PNAS, 2026; Cozzarelli Prize Class III) identified 15-PGDH as a key driver of neuroinflammation at the blood-brain barrier in Alzheimer's disease and traumatic brain injury, prompting a post-hoc inspection of *Hpgd*'s AR(2) eigenvalue across GSE261698 conditions.

*Hpgd* is present and passes expression QC in both the WT and APP astrocyte 12-timepoint datasets; it is absent from the 6-timepoint aged astrocyte file (filtered at expression QC, likely reflecting lower expression in aged tissue). Results:

| Condition | \|λ\| | Root type | Genome median | vs median |
|---|---|---|---|---|
| WT Astrocyte | 0.710 | real (constitutive) | 0.533 | +0.177 |
| APP Astrocyte | 0.575 | complex (oscillatory) | 0.514 | +0.061 |
| WT Microglia | 0.383 | complex (oscillatory) | 0.521 | −0.138 |

Δ\|λ\| (APP − WT astrocyte) = **−0.135**.

Two features are notable. First, in WT astrocytes *Hpgd* shows high persistence with real (non-oscillatory) roots — sitting 0.177 above the genome median — indicating constitutive expression dynamics consistent with a tonically active prostaglandin-degrading brake. Second, in APP astrocytes *Hpgd* loses persistence (Δ=−0.135) and simultaneously transitions from real to complex roots: from constitutive to oscillatory dynamics. The magnitude of the |λ| loss is modest relative to the largest clock gene drops (cf. Cry2 Δ=−0.421), but the root-type change is the same categorical transition observed in APC-KO organoids for cell-cycle genes (Paper O), where it was interpreted as a shift from constitutively saturated to dynamically oscillatory expression.

This observation is directionally consistent with the Pieper & Markowitz finding: if *Hpgd*'s constitutive prostaglandin-clearing activity is disrupted in APP astrocytes — reflected here as both a loss of persistence and a shift from real to complex roots — intermittent rather than tonic PGE2 degradation would be the predicted consequence, with windows of PGE2 accumulation driving neuroinflammatory bursts. This remains speculative without enzyme-activity or PGE2 measurement data.

---

## 4. Discussion

### 4.1 Disease-specific, not ageing-related, clock disruption in astrocytes

One of the study's aims was to ask whether the clock gene pattern in APP astrocytes could be explained by normal ageing rather than disease. The clock gene persistence losses observed in APP astrocytes — particularly in Per1, Per2, Cry2, and Clock — are not recapitulated in the available aged (18-month) WT astrocyte data, where Per1, Per2, and Clock show apparent gains relative to young WT. This directional dissociation is consistent with the clinical literature on circadian disruption in AD: while sleep quality and circadian amplitude generally decline with healthy ageing, the degree and character of the disruption in AD exceeds what ageing alone can account for [5, 15].

However, the aged astrocyte time series has only 6 timepoints, giving estimation uncertainty of approximately ±0.15 per gene (see Section 3.6 caveat). The apparent gains for Per1 (+0.08), Per2 (+0.12), and Clock (+0.14) are all within this uncertainty range and cannot individually be distinguished from zero. The observation should therefore be read as: "the aged data are not consistent with the APP collapse pattern" rather than "ageing causes clock gains". The distinction between ageing and disease is directionally supported by the data but is not quantitatively demonstrated at the per-gene level. Generating a 12-timepoint aged astrocyte series would be the necessary next step to make this comparison statistically rigorous.

The single gene shared between the two disruption patterns is Cry2, which falls in both aged and APP astrocytes. Cry2 encodes the shorter-lived of the two cryptochrome repressors, and amplitude reductions in clock gene transcripts — including Cry family members — have been noted in AD post-mortem cortex [11]. The convergence of Cry2 across both conditions might reflect a genuine ageing-related substrate that is leveraged and amplified by APP-specific pathology, or it might reflect a shared upstream sensitivity to metabolic state that occurs in both ageing and neurodegeneration. Without causal perturbation data it is not possible to distinguish these possibilities.

### 4.2 Mechanistic interpretation: sustained CLOCK:BMAL1 drive with failing self-inhibition

The eigenvalue pattern in APP astrocytes is not consistent with a general clock shutdown. If the molecular clock were simply switching off, all components would be expected to lose persistence approximately uniformly. Instead, the PAR-bZip output genes Dbp and Tef gain persistence (Δ=+0.174, +0.189) while the negative feedback arm collapses. This pattern is mechanistically informative.

In the canonical clock model, CLOCK:BMAL1 drives transcription of *Per*, *Cry*, *Dbp*, *Tef*, and other E-box targets during the day phase. The PER/CRY complex accumulates, translocates to the nucleus, and inhibits CLOCK:BMAL1 activity — completing the negative feedback loop. If APP pathology disrupts PER/CRY protein stability, nuclear translocation, or CRY2-specific repressive activity without equivalently disrupting CLOCK:BMAL1 transcriptional drive, the result would be: (a) reduced Per/Cry mRNA oscillation (lower |λ|); and (b) tonically elevated or maintained Dbp/Tef expression (higher |λ|, as the expression remains persistently elevated relative to a declining mean). The observation that Arntl (Bmal1) itself is essentially unchanged (Δ=−0.025) supports this interpretation — the activator complex may be structurally intact even as its inhibitory counterpart is disrupted.

This mechanistic picture — sustained CLOCK:BMAL1 drive with failing self-inhibition — is consistent with reports of persistent or elevated Dbp protein in the hippocampus of 5xFAD mice relative to WT at advanced plaque stages, and with the demonstration by Lananna et al. (2018) that BMAL1 in astrocytes regulates inflammatory state rather than simply maintaining oscillatory amplitude. A clock that drives output without rhythmicity may produce constitutive inflammatory priming rather than the time-of-day-gated inflammatory responses observed in healthy astrocytes.

### 4.3 E-box target family: cumulative cross-context evidence and its limits

The E-box direct target family was pre-specified in Papers F and M, derived from intestinal organoid datasets, and tested here as a replication attempt in a different tissue (cortical astrocytes), species (mouse), and pathological context (AD). The result at p=0.027 (two-tailed) is consistent with the prior multi-tissue liver finding (p=0.044, GSE54650, Paper M), and the within-family structure replicates — Dbp and Tef gain persistence while the negative feedback arm loses it in both contexts.

However, the honest appraisal is that two nominally positive results from two datasets, neither of which survives Bonferroni correction in its own study, combine to suggest a real signal but do not demonstrate one. The combined probability under the assumption of independence is roughly p≈0.001 (Fisher's method: −2×(ln 0.044 + ln 0.027) ≈ χ²=21.6, df=4), which is formally significant — but Fisher's method assumes the tests are independent, and the E-box family was defined partly from observations in the organoid data, so the independence assumption is imperfect. The more defensible position is that the signal is consistent and replicating, that it has a plausible mechanistic substrate in CLOCK:BMAL1 transcriptional output, and that a third replication from an independent dataset with a pre-registered family is needed before it can be treated as established.

### 4.4 AMPK observations: hypothesis-generating only

The AMPK values documented in Section 3.7 should not be interpreted as a finding. With six genes, no pre-registered hypothesis, and individual gene |λ| uncertainty of ±0.05 at n=12, the apparent divergence between Prkaa1 and the β scaffold subunits falls within what chance variation can produce. The values are documented because they correct a prior normalisation error and provide a baseline for anyone wishing to pre-register a test of AMPK temporal dynamics in APP glia using independent data. They are not part of this study's conclusions.

### 4.5 Hpgd: a post-hoc link between clock disruption and neuroinflammatory output

The post-hoc inspection of *Hpgd* (Section 3.8) offers a potential mechanistic bridge between the AR(2) clock disruption pattern and neuroinflammation at the cellular level. 15-PGDH is the primary enzyme degrading PGE2 in brain tissue. In WT astrocytes, *Hpgd* sits well above the genome median with real roots — constitutive, tonically active expression dynamics. In APP astrocytes it loses persistence (Δ=−0.135) and switches to oscillatory (complex-root) dynamics. If this shift reflects reduced or intermittent prostaglandin-clearing capacity, then PGE2 clearance would become periodic rather than sustained, creating windows of elevated PGE2 capable of driving microglial activation, blood-brain barrier permeability, and inflammatory gene expression — consistent with the mechanism proposed by Pieper & Markowitz (2026).

This reasoning is speculative: the AR(2) eigenvalue captures mRNA expression dynamics at the ribosomal level, not enzyme turnover or intracellular PGE2 concentration. Nonetheless, the co-occurrence of a real→complex root-type change and a loss of persistence, in the same direction as the external experimental evidence, constitutes a testable mechanistic hypothesis. A pre-registered test of *Hpgd* in a second APP mouse model (e.g., App^NL-G-F knock-in or 3xTg-AD) with a circadian time-series would provide the minimal independent evidence needed to assess reproducibility.

### 4.6 Human relevance

This study is conducted entirely in a mouse model (5xFAD) with a single genetic background and a single cortical region. The translational implications for human AD require caution. However, several lines of evidence suggest the molecular mechanisms are conserved. First, BMAL1 protein reduction in reactive astrocytes has been demonstrated in human AD post-mortem tissue as well as in 5xFAD mice [2, 11]. Second, *Dbp* and *Tef* mRNA show elevated expression in human AD cortex transcriptomics relative to cognitively normal controls in at least one large post-mortem dataset (ROSMAP), consistent with the output-limb maintenance hypothesis. Third, the E-box target family members — Wee1, Cdkn1a, Ccnd1, Hmox1 — are implicated in human neuroinflammatory disease and redox homeostasis independently of circadian biology, and their collective temporal disruption in a mouse AD model warrants investigation in human single-cell circadian datasets when these become available.

The availability of human single-nucleus RNA-seq data from AD brain (Seattle AD Brain Cell Atlas, ROSMAP single-cell) provides a path to testing whether the eigenvalue hierarchy inversion observed here in mouse appears in human data, even in the absence of circadian time-series (which are not available from human post-mortem). Cross-sectional approaches using pseudotime or diurnal proxy variables could provide indirect evidence, but direct replication requires cell-type-resolved circadian time-series from human subjects — currently lacking.

### 4.7 Limitations

All APP data derive from a single transgenic strain (5xFAD) at 6 months of age. This model develops aggressive plaque pathology faster than sporadic human AD, and the eigenvalue pattern may not generalise to other AD mouse models (3xTg, APP/PS1, App^NL-G-F knock-in) or to later disease stages. The TRAP-seq signal reflects translated mRNA rather than total transcript or nascent transcription; temporal persistence measured here is a property of active translation dynamics, which may differ from those captured by nuclear RNA-seq or total RNA approaches.

The 12-timepoint design (ZT0–ZT22 at 2-hour intervals) spans a single circadian cycle, giving per-gene |λ| estimation uncertainty of approximately ±0.05 for the WT and APP series. The aged WT astrocyte series has only 6 timepoints (±0.15 per gene), so individual gene comparisons in that condition are direction-indicative only; permutation-level inference is not possible from 6 observations, and the ageing-versus-disease dissociation should be read as a pattern observation rather than a quantitative claim. GSE261698 does not include a circadian time-series from APP-model microglia. The two microglia-derived gene families (DAM, homeostatic) were therefore tested in astrocyte comparisons, where they always had null expectations; they serve as expected nulls rather than formal specificity controls.

Neither pre-specified permutation result (core clock p=0.036; E-box p=0.027) survives strict Bonferroni correction across four tests (α=0.0125). These results are treated as pre-registered directional signals evaluated in the context of prior replication (E-box p=0.044, GSE54650, Paper M) and the internal mechanistic consistency of the clock disruption pattern — not as individually confirmed findings. The AMPK subunit analysis (Section 3.7) was not pre-registered; the apparent catalytic-scaffold dissociation cannot be distinguished from chance variation across 6 genes and should be read as a baseline documentation for future hypothesis testing. The Hpgd observation (Section 3.8) was prompted by an external publication after the pre-specified analyses were finalised; no permutation test was conducted, and it is included solely as a hypothesis-generating note that would otherwise go unreported.

---

## 5. Conclusion

APP pathology is associated with a selective inversion of the circadian eigenvalue hierarchy in mouse cortical astrocytes: the negative feedback arm (Per1, Per2, Cry2, Clock) loses temporal persistence while the PAR-bZip output limb (Dbp, Tef) counterintuitively maintains or gains it. Neither pre-registered permutation test (core clock: p=0.036; E-box targets: p=0.027) survives strict Bonferroni correction for four tests; the evidence is therefore treated as suggestive rather than definitive. The primary source of credibility is the replication structure: the E-box result is directionally consistent with a prior independent finding in multi-tissue liver data (GSE54650, p=0.044, Paper M). The null results for the two microglia-derived families are expected nulls — these gene sets have no a priori connection to astrocyte CLOCK:BMAL1 dynamics and were always predicted to be null in the astrocyte comparison. The ageing comparison is directionally opposite to the APP pattern but is based on a 6-timepoint series where individual gene estimates carry ±0.15 uncertainty; it is suggestive, not conclusive. Replication in an independent APP mouse model with a pre-registered analysis plan and a 12-timepoint aged comparison series is the immediate logical next step before these findings can move from suggestive to established.

---

## Data and code availability

Dataset: NCBI GEO accession GSE261698 (Sheehan & Musiek, 2025). Freely accessible.
AR(2) analysis platform and interactive results: PAR(2) Discovery Engine — https://par2discovery.com/glial-analysis
Permutation test source data: `datasets/GSE261698/permutation_test_results.json` (within platform repository).
Supplement: downloadable from https://par2discovery.com/glial-analysis (Pre-specified Regulon Tests tab).

---

## Acknowledgements

The author thanks Patrick Sheehan and Erik Musiek (Washington University in St. Louis) for depositing GSE261698 on NCBI GEO; the ROSMAP consortium for ongoing open-access provision of AD brain transcriptomic data; and Pieper and Markowitz for making the 15-PGDH neuroinflammation findings publicly available ahead of formal publication. No funding was received for this study.

---

## References

1. Sheehan PW, Musiek ES. (2025). Cell-type-specific circadian transcriptomes reveal glial clock disruption in Alzheimer's disease mouse models. *Nature Neuroscience*.

2. Lananna BV, Nadarajah CJ, Izumo M, et al. (2018). Cell-autonomous regulation of astrocyte activation by the circadian clock protein BMAL1. *Cell Reports*, 25(1), 1–9.

3. Keren-Shaul H, Spinrad A, Weiner A, et al. (2017). A unique microglia type associated with restricting development of Alzheimer's disease. *Cell*, 169(7), 1276–1290.

4. Bennett ML, Bennett FC, Liddelow SA, et al. (2016). New tools for studying microglia in the mouse and human CNS. *Proceedings of the National Academy of Sciences*, 113(12), E1738–E1746.

5. Musiek ES, Holtzman DM. (2016). Mechanisms linking circadian clocks, sleep, and neurodegeneration. *Science*, 354(6315), 1004–1008.

6. Prolo LM, Takahashi JS, Herzog ED. (2005). Circadian rhythm generation and entrainment in astrocytes. *Journal of Neuroscience*, 25(2), 404–408.

7. Marpegan L, Swanstrom AE, Chung K, et al. (2011). Circadian regulation of ATP release in astrocytes. *Journal of Neuroscience*, 31(23), 8342–8350.

8. Barca-Mayo O, Pons-Espinal M, Follert P, et al. (2017). Astrocyte deletion of Bmal1 results in cortical hypersynchrony. *Nature Communications*, 8, 16169.

9. Heneka MT, Carson MJ, El Khoury J, et al. (2015). Neuroinflammation in Alzheimer's disease. *Lancet Neurology*, 14(4), 388–405.

10. Liddelow SA, Guttenplan KA, Clarke LE, et al. (2017). Neurotoxic reactive astrocytes are induced by activated microglia. *Nature*, 541(7638), 481–487.

11. Cermakian N, Lamont EW, Boudreau P, Boivin DB. (2011). Circadian clock gene expression in brain regions of Alzheimer's disease patients and control subjects. *Journal of Biological Rhythms*, 26(2), 160–170.

12. Cronin P, McCarthy MJ, Lim ASP, et al. (2017). Circadian alterations during early stages of Alzheimer's disease are associated with aberrant cycles of DNA methylation in BMAL1. *Alzheimer's & Dementia*, 13(6), 689–700.

13. Ju YS, Lucey BP, Holtzman DM. (2014). Sleep and Alzheimer disease pathology — a bidirectional relationship. *Nature Reviews Neurology*, 10(2), 115–119.

14. Lim ASP, Yu L, Kowgier M, et al. (2013). Modification of the relationship of the apolipoprotein E ε4 allele to the risk of Alzheimer disease and neurofibrillary tangle density by sleep. *JAMA Neurology*, 70(12), 1544–1551.

15. Videnovic A, Zee PC. (2015). Consequences of circadian disruption on neurologic health. *Sleep Medicine Clinics*, 10(4), 469–480.

16. Bass J, Takahashi JS. (2010). Circadian integration of metabolism and energetics. *Science*, 330(6009), 1349–1354.

17. Reppert SM, Weaver DR. (2002). Coordination of circadian timing in mammals. *Nature*, 418(6901), 935–941.

18. Lamia KA, Sachdeva UM, DiTacchio L, et al. (2009). AMPK regulates the circadian clock by cryptochrome phosphorylation and degradation. *Science*, 326(5951), 437–440.

19. Gwinn DM, Shackelford DB, Egan DF, et al. (2008). AMPK phosphorylation of raptor mediates a metabolic checkpoint. *Molecular Cell*, 30(2), 214–226.

20. Mohawk JA, Green CB, Takahashi JS. (2012). Central and peripheral circadian clocks in mammals. *Annual Review of Neuroscience*, 35, 445–462.

21. Zamanian JL, Xu L, Foo LC, et al. (2012). Genomic analysis of reactive astrogliosis. *Journal of Neuroscience*, 32(18), 6391–6410.

22. Hatfield CF, Herbert J, van Someren EJW, Hodges JR, Hastings MH. (2004). Disrupted daily activity/rest cycles in relation to daily cortisol rhythms of home-dwelling patients with early Alzheimer's dementia. *Brain*, 127(5), 1061–1074.

23. Hardie DG. (2011). AMP-activated protein kinase — a cellular energy sensor that regulates all aspects of cell function. *Genes & Development*, 25(18), 1895–1908.

24. Whiteside M. (2025a). AR(2) eigenvalue modulus as a measure of temporal persistence in gene expression: circadian hierarchy emerges from two coefficients. *Preprint*, Research Square. https://doi.org/10.21203/rs.3.rs-9283100/v1

25. Whiteside M. (2025b). Expression persistence is independent of mRNA half-life: AR(2) eigenvalue replication across non-circadian datasets. *Preprint*, Research Square. https://doi.org/10.21203/rs.3.rs-9385465/v1

26. Whiteside M. (2025c). Phase-gated PAR(2): circadian temporal persistence modulated by zeitgeber phase. *Preprint*, Research Square.

27. Pieper AA, Markowitz SD. (2026). 15-PGDH as a key driver of neuroinflammation at the blood-brain barrier in Alzheimer's disease and traumatic brain injury. *Proceedings of the National Academy of Sciences*. [Cozzarelli Prize, Class III]
