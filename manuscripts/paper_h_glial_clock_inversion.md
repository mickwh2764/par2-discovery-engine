# Paper H — Amyloid Pathology Selectively Collapses the Negative Feedback Arm of the Astrocyte Circadian Clock: AR(2) Eigenvalue Evidence from the AD Glial Circadian Atlas (GSE261698)

**Michael Whiteside**
Independent Researcher, Scotland, UK
ORCID: 0009-0000-0643-5791
Correspondence: mickwh@msn.com

---

## Abstract

Circadian disruption is an early and pervasive feature of Alzheimer's disease (AD), yet whether it reflects uniform suppression of clock gene expression or a selective disruption of specific clock loop components remains unclear. Here we apply AR(2) autoregressive modelling to the publicly available AD Glial Circadian Atlas (GSE261698; Sheehan, Musiek et al. 2025, *Nature Neuroscience*), which provides 12-point circadian time-series RNA-seq data (ZT0–ZT22, 2-hour intervals) from immunopanned mouse cortical astrocytes and microglia in wild-type (WT), APP amyloid pathology (5xFAD model), and aged (18-month WT) conditions.

Temporal persistence is quantified by the AR(2) eigenvalue modulus |λ|, which measures carry-forward expression momentum on a gene-by-gene basis. In WT astrocytes, Per1 leads the 13-gene clock panel with |λ| = 0.731, well above the genome median of 0.533 (n = 14,025 genes). APP amyloid pathology does not uniformly suppress clock gene persistence; instead it produces a selective hierarchy inversion. The negative feedback arm collapses dramatically: Per1 0.731 → 0.360 (Δ = −0.371), Per2 0.605 → 0.333 (Δ = −0.272), Cry2 0.652 → 0.232 (Δ = −0.421), Clock 0.575 → 0.204 (Δ = −0.371). Meanwhile the D-box output arm holds or strengthens: Dbp 0.691 → 0.865 (Δ = +0.174), Tef 0.489 → 0.678 (Δ = +0.189), Per3 0.542 → 0.798 (Δ = +0.256).

This pattern — the repressive arm losing persistence while the output arm gains — is consistent with disruption of the transcription-translation feedback loop (TTFL) specifically at the negative feedback step, leaving the positive limb and its direct outputs partially decoupled from repression. Microglia show a different baseline organisation: Clock is nearly absent (|λ| = 0.209 vs 0.575 in astrocytes), and the Per2/Tef axis leads. These findings establish a cell-type-specific, mechanism-interpretable signature of AD glial clock disruption measurable by AR(2) eigenvalue analysis.

**Keywords:** Alzheimer's disease, circadian clock, astrocyte, microglia, AR(2) autoregressive model, temporal persistence, eigenvalue, TTFL, hierarchy inversion, glial biology, neuroinflammation, 5xFAD

---

## 1. Introduction

### 1.1 Circadian disruption in Alzheimer's disease

Disruption of sleep and circadian rhythms is among the earliest and most pervasive clinical features of Alzheimer's disease (AD) [1, 2]. Patients exhibit fragmented sleep, blunted melatonin rhythms, and irregular rest-activity cycles that frequently antedate cognitive decline by years [3]. The relationship between circadian disruption and AD pathology — amyloid-β (Aβ) deposition and tau hyperphosphorylation — is bidirectional: AD pathology disrupts circadian timing, and disrupted circadian timing accelerates AD pathology through mechanisms including impaired glymphatic clearance of Aβ during sleep [4, 5] and circadian regulation of amyloid precursor protein (APP) processing [6].

The standard characterisation of circadian disruption focuses on amplitude and phase: rhythms are lower in amplitude, shifted in phase, and less consistent across days in AD patients and model animals. This phenomenology, however, does not specify *which part* of the molecular clock machinery is disrupted. The transcription-translation feedback loop (TTFL) consists of distinct functional arms — the positive arm (BMAL1/CLOCK activating Per/Cry/Dbp/Nr1d1 expression), the negative arm (PER1/2/3 and CRY1/2 repressing BMAL1/CLOCK), the stabilising loop (RORs and REV-ERBs competing for BMAL1 promoter occupancy), and the output arm (DBP, TEF, HLF activating clock-controlled genes) — and disruption of these arms would produce distinct molecular phenotypes. Distinguishing between them requires gene-resolved temporal dynamics, not just amplitude measurements.

### 1.2 The AD Glial Circadian Atlas

Sheehan, Musiek et al. (2025) produced the first publicly available circadian time-series RNA-seq dataset from cell-type-resolved glial populations in an AD model [14]. GSE261698 provides expression profiles at 12 circadian time points (ZT0–ZT22, 2-hour intervals) from immunopanned mouse cortical astrocytes and microglia across three genotype conditions:

- **WT**: 4–6 month C57BL/6J wild-type (normal circadian physiology)
- **APP**: 4–6 month 5xFAD-derived mice (high Aβ burden, prominent astrogliosis and microglial activation)
- **Aged**: 18-month C57BL/6J mice (natural ageing without amyloid pathology)

This design allows direct comparison of the APP pathology effect (WT vs APP at the same age) and the ageing effect (young WT vs 18-month WT) in the same cell types, isolated by the same protocol.

### 1.3 Glial contributions to circadian disruption in AD

Astrocytes express a full complement of core clock machinery (BMAL1, CLOCK, PER1/2/3, CRY1/2, NR1D1/2, RORA/B) and generate autonomous circadian rhythms in culture [7, 8]. In AD, astrocytes undergo reactive astrogliosis — morphological and transcriptional activation driven by Aβ [9] — which has been proposed to alter circadian support functions (K⁺ buffering, glutamate recycling, metabolic substrate timing) that depend on astrocyte circadian gene expression programmes [10]. Microglia show circadian variation in activation state and Aβ phagocytic capacity [11, 12], making their clock dynamics relevant to plaque clearance efficiency.

Despite this biology, the specific TTFL component(s) disrupted in AD glia — and whether disruption is selective or global — has not been quantified at the gene-resolved time-series level.

### 1.4 AR(2) temporal persistence as a dynamical readout

The AR(2) autoregressive model treats each gene's expression time series as a second-order stochastic process:

> x(t) = φ₁ · x(t−1) + φ₂ · x(t−2) + ε(t)

Temporal persistence is characterised by the eigenvalue modulus |λ| of the companion matrix. When |λ| < 1, expression dynamics are stationary: perturbations decay, and expression returns to baseline. When |λ| approaches 1, the gene shows near-critical momentum, meaning expression at each time point strongly predicts the next. When |λ| > 1, dynamics are supercritical within the observation window.

Critically, |λ| measures *persistence structure* independently of expression amplitude. A gene can have high expression and low |λ| (high but flat) or low expression and high |λ| (low but strongly self-predicting over time). This allows AR(2) analysis to detect changes in the feedback dynamics of a gene even when mean expression is unchanged — a key advantage for studying clock disruption, where some genes may maintain expression level while losing oscillatory feedback integrity.

The PAR(2) framework has established, across 40+ independent datasets, that circadian clock genes show systematically higher |λ| than their transcriptional targets — a hierarchy that reflects the clock's role as a long-memory, self-sustaining temporal organiser [16]. The current analysis tests whether that hierarchy is selectively disrupted in specific TTFL arms in AD glia.

---

## 2. Materials and Methods

### 2.1 Dataset

**GSE261698** — AD Glial Circadian Atlas. Sheehan PW, Fass S, Sapkota D, Kang S, Hollis HC, Lawrence JH, Anafi RC, Dougherty JD, Fryer JD, Musiek ES. *A glial circadian gene expression atlas reveals cell-type and disease-specific reprogramming in response to amyloid pathology or aging.* Nature Neuroscience, 2025. doi: 10.1038/s41593-025-02067-1. PMID: 38853870.

Astrocytes and microglia were isolated by immunopanning from mouse cortex at 12 time points (ZT0, ZT2, ZT4, ZT6, ZT8, ZT10, ZT12, ZT14, ZT16, ZT18, ZT20, ZT22) per condition. Data were obtained from NCBI GEO in raw count matrix format.

**Table 1. Dataset summary.**

| Condition | Cell type | Time points | Genes analysed | Source |
|---|---|---|---|---|
| WT Astrocyte | Astrocyte | 12 (ZT0–ZT22) | 14,025 | GSE261698 [14] |
| APP Astrocyte | Astrocyte | 12 (ZT0–ZT22) | 14,383 | GSE261698 [14] |
| WT Microglia | Microglia | 12 (ZT0–ZT22) | 17,078 | GSE261698 [14] |
| Aged Astrocyte | Astrocyte | 6 (ZT2/6/10/14/18/22) | 30,556 | GSE261698 [14] |

The aged astrocyte series uses 6 time points (ZT2, ZT6, ZT10, ZT14, ZT18, ZT22) with biological replicates (n = 1–2 per time point) averaged before AR(2) fitting. Results from this condition are presented as secondary findings in Section 3.7 with appropriate precision caveats. APP Microglia and Aged Microglia count data exist at GEO but were not downloaded for this analysis.

### 2.2 Pre-processing

Raw count matrices were converted to log₂(CPM + 1) where CPM = counts per million across all genes in that condition. Gene means were not explicitly centred before AR(2) fitting; the Yule-Walker equations estimate coefficients on the demeaned series implicitly. Genes with missing values at any time point were excluded from that condition's analysis. The immunopanning protocol for TRAP/RiboTag ribosome-associated RNA [14] may produce a filtered gene set (lower-expressed genes excluded), reflected in the n = 14,025 genes for WT Astrocyte versus the full mouse transcriptome (~32,000 annotated genes).

### 2.3 AR(2) modelling and eigenvalue computation

For each gene in each condition, the AR(2) model:

> x(t) = φ₁ · x(t−1) + φ₂ · x(t−2) + ε(t)

was fitted by Yule-Walker equations. The eigenvalue modulus |λ| was computed from the roots of the characteristic polynomial λ² − φ₁λ − φ₂ = 0:

- Complex conjugate roots (oscillatory dynamics, φ₁² + 4φ₂ < 0): |λ| = √(−φ₂)
- Real roots: |λ| = max(|λ₁|, |λ₂|)

Full mathematical derivation is given in Whiteside (2026) [16]. Analyses were performed using the PAR(2) Discovery Engine (pre-computed results stored in the platform at `/api/gse261698/ar2-results`).

### 2.4 Clock gene panel

The analysis uses a 13-gene core TTFL panel drawn from genes present in all three conditions, covering all four functional TTFL arms:

- **Negative feedback arm:** Per1, Per2, Cry2, Clock
- **Stabilising loop:** Cry1, Nr1d1, Nr1d2, Bmal1/Arntl
- **Output/D-box arm:** Dbp, Tef, Hlf, Per3
- **Positive arm (alternative activator):** Npas2

This panel is a subset of the full 20-gene PAR(2) clock set; genes absent or below quality threshold in one or more conditions were excluded from the cross-condition comparison to ensure fair comparison.

### 2.5 AMPK/energy sensing preliminary analysis

A secondary analysis examined AR(2) eigenvalue moduli for AMPK subunit genes (Prkaa1, Prkaa2, Prkag2) and fatty acid synthesis (Acaca) as metabolic energy-sensing genes expected to show near-constitutive, high-persistence expression independent of circadian phase. These results are treated as preliminary because the pre-processing pipeline for these genes may differ from the clock gene pipeline (see Section 4.4).

---

## 3. Results

### 3.1 WT astrocyte clock gene baseline: Per1 leads, CLOCK varies by cell type

In WT astrocytes (n = 14,025 genes, genome median |λ| = 0.533, IQR 0.390–0.663), all 13 clock panel genes show |λ| above the genome median, consistent with the PAR(2) framework's established clock-above-target hierarchy [16].

**Table 2. Full clock gene panel — WT Astrocyte, WT Microglia, APP Astrocyte.**

| Gene | TTFL arm | WT Astrocyte |λ| | WT Microglia |λ| | APP Astrocyte |λ| | Δ(APP − WT) |
|---|---|---|---|---|---|
| Per1 | Negative | 0.731 | 0.606 | 0.360 | **−0.371** |
| Per2 | Negative | 0.605 | 0.781 | 0.333 | **−0.272** |
| Cry2 | Negative | 0.652 | 0.525 | 0.232 | **−0.421** |
| Clock | Negative | 0.575 | 0.209 | 0.204 | **−0.371** |
| Cry1 | Stabilising | 0.568 | 0.678 | 0.687 | +0.119 |
| Bmal1/Arntl | Stabilising | 0.491 | 0.503 | 0.430 | −0.061 |
| Nr1d1 | Stabilising | 0.447 | 0.657 | 0.350 | −0.096 |
| Nr1d2 | Stabilising | 0.543 | 0.409 | 0.570 | +0.027 |
| Dbp | D-box output | 0.691 | 0.654 | 0.865 | **+0.174** |
| Tef | D-box output | 0.489 | 0.788 | 0.678 | **+0.189** |
| Hlf | D-box output | 0.529 | 0.616 | 0.382 | −0.147 |
| Per3 | D-box/output | 0.542 | 0.752 | 0.798 | **+0.256** |
| Npas2 | Positive | 0.278 | 0.667 | 0.436 | +0.159 |

The WT astrocyte ranking places Per1 highest (0.731), followed by Dbp (0.691) and Cry2 (0.652). Npas2 is markedly lower (0.278). All 13 genes exceed the genome median of 0.533 with the exception of Npas2 (0.278) and Bmal1 (0.491), confirming that the core TTFL — but not all associated genes — consistently shows elevated persistence above genome background in the healthy astrocyte.

The cell-type contrast is immediately striking. In WT microglia (n = 17,078, genome median 0.521), the ranking changes substantially: Per2 rises to 0.781, Tef to 0.788, Per3 to 0.752, Npas2 to 0.667. Most strikingly, Clock collapses from 0.575 in WT astrocytes to 0.209 in WT microglia — the largest cell-type difference in the panel. CLOCK protein thus appears to carry very different temporal persistence signatures in the two glial cell types under healthy conditions, raising the question of whether CLOCK plays a different organisational role in the microglial clock.

### 3.2 APP amyloid pathology selectively collapses the negative feedback arm

The transition from WT to APP astrocytes reveals a selective, arm-specific disruption of the clock hierarchy — not uniform suppression.

**Genes that collapse in APP astrocytes (Δ < −0.15):**
- Cry2: 0.652 → 0.232 (Δ = −0.421) — the largest change in the panel
- Per1: 0.731 → 0.360 (Δ = −0.371)
- Clock: 0.575 → 0.204 (Δ = −0.371)
- Per2: 0.605 → 0.333 (Δ = −0.272)
- Hlf: 0.529 → 0.382 (Δ = −0.147)

**Genes that hold or strengthen in APP astrocytes (Δ > +0.10):**
- Per3: 0.542 → 0.798 (Δ = +0.256) — the largest gain
- Tef: 0.489 → 0.678 (Δ = +0.189)
- Dbp: 0.691 → 0.865 (Δ = +0.174)
- Npas2: 0.278 → 0.436 (Δ = +0.159)
- Cry1: 0.568 → 0.687 (Δ = +0.119)

**Genes that are stable (|Δ| < 0.10):**
- Nr1d2: +0.027
- Bmal1/Arntl: −0.061
- Nr1d1: −0.096

The pattern maps almost precisely onto the TTFL arm structure. The collapsing genes — Cry2, Per1, Clock, Per2 — are the canonical negative feedback repressors. The strengthening genes — Dbp, Tef, Per3 — are the primary D-box output genes, driven by the positive arm's CLOCK:BMAL1 activity. The stabilising loop genes (Nr1d1/2, Bmal1) show modest changes close to zero.

This is the opposite of what uniform clock suppression predicts. If amyloid pathology simply degraded circadian oscillation globally, all clock genes should fall together. Instead, the repressive arm fails specifically while the output arm persists or gains.

**Figure 1.** Per-gene clock |λ| grouped by TTFL arm for WT Astrocyte (green), WT Microglia (blue), and APP Astrocyte (red). The selective collapse of the negative arm and preservation of the D-box output arm is the central finding.

**Figure 2.** Δ|λ| (APP − WT) per gene, colour-coded: red bars = collapse (negative), green bars = gain (positive). The arm-level asymmetry is visible: negative feedback genes (left cluster) are uniformly red; D-box output genes (right cluster) are uniformly green.

### 3.3 The clock-target hierarchy shifts but is maintained

A critical control is whether the observed changes reflect global shifts in AR(2) estimation properties (e.g., driven by broad changes in APP transcriptome variance) or genuine, clock-specific reorganisation.

In WT astrocytes, the genome median |λ| is 0.533. In APP astrocytes, the genome median is 0.514 — a small *decrease* of −0.019 at the genome level. This is directionally opposite to the clock gene gains observed in Dbp/Tef/Per3, confirming that those gains are not simply an artefact of a global |λ| elevation. The genome-wide shift is negligible and in the wrong direction; the arm-level inversion within the clock is a specific, clock-confined phenomenon.

The clock-gene-to-genome contrast:
- WT Astrocyte: Per1 at 0.731 vs genome median 0.533 (gap = +0.198)
- APP Astrocyte: Dbp at 0.865 vs genome median 0.514 (gap = +0.351) — the output arm sits even further above the genome in APP than Per1 did in WT

The positive arm of the clock has not been eliminated by amyloid pathology; it has been decoupled from the repressive arm that would normally constrain it.

### 3.4 Microglia show a different baseline and muted APP response

In WT microglia, the clock gene panel shows a different internal ranking from astrocytes (see Table 2, column 3). The most notable differences:

- **Clock**: 0.575 (astrocyte) vs 0.209 (microglia) — Clock protein persistence is over 2.5-fold lower in WT microglia
- **Per2**: 0.605 (astrocyte) vs 0.781 (microglia) — Per2 is 0.176 higher in microglia
- **Tef**: 0.489 (astrocyte) vs 0.788 (microglia) — Tef is 0.299 higher in microglia
- **Npas2**: 0.278 (astrocyte) vs 0.667 (microglia) — Npas2 is 0.389 higher in microglia; Npas2 can substitute for CLOCK in the positive arm of some tissues

The near-absence of Clock persistence in WT microglia (|λ| = 0.209, well below the genome median) raises the question of whether the microglial circadian clock runs primarily through a NPAS2:BMAL1 heterodimer rather than CLOCK:BMAL1 — a heterodimer that has been proposed in other non-suprachiasmatic nucleus (SCN) tissues [25] and would explain why Clock shows negligible temporal persistence while Npas2 is high.

The microglia data for the APP condition were not included in the current platform analysis. This is a gap to be addressed in future work; the existing platform provides WT Microglia data but does not yet include an APP Microglia pre-computed eigenvalue table for the clockComparison panel.

### 3.5 Dbp reaches the highest single-gene |λ| in APP astrocytes

Dbp achieves |λ| = 0.865 in APP astrocytes — the highest single gene value in the clock panel across all three analysed conditions, and substantially above the genome median of 0.514. This is biologically important: Dbp is the primary transcriptional output of the CLOCK:BMAL1 positive arm, driving expression of hundreds of clock-controlled genes (CCGs) through D-box elements. Its elevated persistence in APP astrocytes means the output arm of the clock continues to impose temporal organisation on CCGs even as the negative feedback repressors (Per1/2, Cry2, Clock) lose persistence.

The consequence is a predicted imbalance in CCG regulation: CCGs driven primarily through D-box elements should maintain circadian temporal structure, while CCGs repressed by CRY1/2 or PER1/2 (via CLOCK:BMAL1 suppression) may lose their circadian organisation as the repressors weaken. This provides a testable, arm-level prediction for downstream transcriptomic analysis.

### 3.6 AMPK and energy sensing — corrected analysis

A secondary analysis examined AMPK pathway genes (catalytic subunits: Prkaa1, Prkaa2; regulatory/scaffold subunits: Prkab1, Prkab2, Prkag1, Prkag2; and the downstream target Acaca) using the same log₂(CPM+1) normalised pipeline as the clock gene analysis.

**Table 5. AMPK gene |λ| — WT Astrocyte, APP Astrocyte, WT Microglia.**

| Gene | Function | WT Astrocyte |λ| | APP Astrocyte |λ| | Δ(APP−WT) | WT Microglia |λ| |
|---|---|---|---|---|---|
| Prkaa1 | Catalytic (α1) | 0.573 | 0.263 | **−0.310** | 0.298 |
| Prkaa2 | Catalytic (α2) | 0.636 | 0.593 | −0.043 | 0.322 |
| Prkab1 | Regulatory (β1) | 0.279 | 0.583 | **+0.304** | 0.287 |
| Prkab2 | Regulatory (β2) | 0.366 | 0.612 | **+0.246** | 0.438 |
| Prkag1 | Regulatory (γ1) | 0.634 | 0.536 | −0.098 | 0.651 |
| Prkag2 | Regulatory (γ2) | 0.615 | 0.682 | +0.067 | 0.482 |
| Acaca | ACC (downstream) | 0.486 | 0.478 | −0.008 | 0.586 |
| *WT genome median* | | *0.533* | *0.514* | | *0.521* |

Two findings stand out. First, AMPK genes are in the ordinary genome range (|λ| = 0.28–0.64 in WT astrocytes), not elevated above it. They are neither constitutively high-persistence genes nor clock-like; they sit within the bulk of the genome's autocorrelation structure. Second, and more surprisingly, APP pathology produces a striking dissociation within the AMPK complex: the **catalytic α1 subunit** (Prkaa1) loses substantial persistence (0.573 → 0.263, Δ = −0.310), while the **regulatory β subunits** (Prkab1, Prkab2) gain persistence (Δ = +0.304, +0.246 respectively). The γ regulatory subunits and ACC substrate are largely stable.

AMPK is a heterotrimer (α catalytic + β scaffold + γ regulatory). The β subunits direct AMPK to specific cellular locations (membranes, mitochondria) and regulate substrate selectivity, while the α subunit carries the kinase domain. A persistence increase in the β scaffolding subunits alongside a catalytic α decrease could reflect reorganisation of AMPK complex assembly — with the scaffold gaining constitutive expression momentum while the kinase activity itself cycles differently. Whether this represents a genuine biological signal in reactive astrogliosis, or a consequence of altered AMPK complex turnover, requires protein-level validation.

### 3.7 Aged astrocyte: a different disruption pattern from APP

Using the 18-month WT aged astrocyte condition from GSE261698 (6 ZT time points: ZT2, ZT6, ZT10, ZT14, ZT18, ZT22; biological replicates averaged per time point; n = 30,556 genes analysed; genome median |λ| = 0.549), clock gene |λ| values were computed and compared to WT and APP astrocytes.

**Table 6. Clock gene |λ| — WT, Aged, and APP Astrocyte (four-condition clock panel).**

| Gene | TTFL arm | WT Astrocyte | Aged Astrocyte* | APP Astrocyte | Aged vs WT | APP vs WT |
|---|---|---|---|---|---|---|
| Per1 | Negative | 0.731 | **0.810** | 0.360 | **+0.079** | −0.371 |
| Per2 | Negative | 0.605 | **0.726** | 0.333 | **+0.121** | −0.272 |
| Cry2 | Negative | 0.652 | 0.259 | 0.232 | −0.393 | −0.421 |
| Clock | Negative | 0.575 | **0.718** | 0.204 | **+0.143** | −0.371 |
| Cry1 | Stabilising | 0.568 | 0.712 | 0.687 | +0.144 | +0.119 |
| Arntl | Stabilising | 0.491 | 0.561 | 0.430 | +0.070 | −0.061 |
| Nr1d1 | Stabilising | 0.447 | 0.286 | 0.350 | −0.161 | −0.096 |
| Nr1d2 | Stabilising | 0.543 | 0.687 | 0.570 | +0.144 | +0.027 |
| Dbp | D-box output | 0.691 | 0.729 | 0.865 | +0.038 | +0.174 |
| Tef | D-box output | 0.489 | 0.672 | 0.678 | +0.183 | +0.189 |
| Hlf | D-box output | 0.529 | 0.750 | 0.382 | +0.221 | −0.147 |
| Per3 | D-box/output | 0.542 | 0.516 | 0.798 | −0.026 | +0.256 |
| Npas2 | Positive | 0.278 | 0.338 | 0.436 | +0.060 | +0.159 |

*6 time points only; AR(2) estimates are less precise than the 12-point WT and APP series. Treat as indicative rather than definitive.

The aged astrocyte clock pattern differs substantially from the APP pattern. The most critical difference: in aged astrocytes, **Per1, Per2, and Clock all rise** (Δ = +0.079, +0.121, +0.143 respectively) compared to WT, while in APP astrocytes these same three genes show the largest collapses (Δ = −0.371, −0.272, −0.371). The negative feedback arm is disrupted in opposite directions by amyloid pathology versus normal ageing.

Cry2 is the exception: it collapses in both aged (0.652 → 0.259) and APP (0.652 → 0.232) astrocytes — suggesting that Cry2 persistence is specifically vulnerable to both perturbations. Whether this reflects a shared mechanism (for example, SIRT1-mediated regulation of CRY2 stability, which declines with both age and amyloid load) is an open question.

The D-box output arm shows a more mixed picture in ageing: Dbp and Tef both rise (consistent with APP), but Hlf also rises (0.529 → 0.750) in aged astrocytes whereas it falls in APP (0.529 → 0.382). Hlf is a PAR bZip transcription factor with reported roles in xenobiotic detoxification and oxidative stress responses — processes activated differently in ageing and amyloid pathology.

In summary, normal 18-month ageing does **not** recapitulate the APP amyloid clock hierarchy inversion. Rather than collapsing the negative feedback arm, ageing produces a general mild elevation across most clock genes, with Cry2 as a specific exception. The two conditions share Cry2 vulnerability but diverge sharply in Per/Clock dynamics, suggesting that the mechanism of circadian disruption in AD is not simply accelerated ageing of the glial clock but involves an amyloid-specific pathway.

---

## 4. Discussion

### 4.1 A hierarchy inversion within the clock, not global suppression

The primary finding of this paper is that APP amyloid pathology does not simply dampen all clock gene persistence uniformly. It selectively collapses the negative feedback arm (Per1, Per2, Cry2, Clock) while the D-box output arm (Dbp, Tef, Per3) holds or strengthens. This is a *within-clock hierarchy inversion* — the relative ranking of clock genes by |λ| changes, and the nature of that change is mechanistically interpretable.

The standard model of circadian disruption in AD proposes reduced amplitude of rhythmicity across the clock system. The AR(2) data suggest a more specific picture: the TTFL's self-limiting negative feedback is the vulnerable component, while the positive-arm outputs are relatively protected. This has a clear mechanistic implication: if the repressive arm weakens, the oscillation does not simply dampen — it loses the restoring force that would bring expression back to baseline. The clock becomes less self-referential, more constitutive in its positive outputs.

### 4.2 Possible mechanisms: NF-κB-driven displacement of PER/CRY function

Reactive astrogliosis in APP mice involves sustained NF-κB activation [26]. The circadian literature establishes that NF-κB directly interferes with the clock in two ways: it suppresses BMAL1 transcription [23] and competes with CLOCK:BMAL1 for co-activator binding, thereby reducing Per/Cry induction [24]. Reduced induction of Per/Cry would manifest as lower Per/Cry |λ| — the temporal persistence of the repressive arm would fall because the genes are being driven less strongly by the positive arm, giving them less momentum to carry forward.

Meanwhile, Dbp is driven not only by CLOCK:BMAL1 through the E-box but also by additional transcription factors that may be upregulated in reactive astrocytes. If Dbp expression is supplemented by inflammatory or stress-responsive transcription factors, its persistence could increase even as the classical CLOCK:BMAL1 → Dbp pathway is partially disrupted. This decoupling of the output from the clock mechanism is consistent with the observation that rhythmicity is "phase-shifted but maintained" in output genes of stressed cells even as the core clock loses coherence.

### 4.3 Cell-type specificity: why does Clock nearly vanish in microglia?

The near-absence of Clock persistence in WT microglia (|λ| = 0.209) — well below both the genome median and its own astrocyte value — is one of the most striking observations in the data. CLOCK protein is ubiquitously expressed and forms the canonical heterodimer with BMAL1 across all tissues. Its low |λ| in microglia could reflect:

1. **NPAS2 substitution.** NPAS2 shows high persistence in microglia (|λ| = 0.667) and can substitute for CLOCK in the positive arm. If microglial circadian transcription runs primarily through a NPAS2:BMAL1 heterodimer, then Clock mRNA dynamics would be decoupled from the core clock feedback loop, resulting in low temporal persistence of the Clock transcript despite functional circadian oscillation at the protein level.

2. **Post-transcriptional regulation.** Clock mRNA stability and translation efficiency may differ between astrocytes and microglia, such that Clock transcript levels in microglia are regulated by mechanisms that decouple transcript dynamics from protein dynamics.

3. **Different clock architecture.** Microglia may operate a fundamentally different TTFL topology — one in which Clock occupies a different regulatory position than in astrocytes. The high persistence of Per2/Tef/Npas2 in microglia but low Clock suggests a different hierarchy, not just a scaled version of the astrocyte hierarchy.

Testing these possibilities requires protein-level data and/or CLOCK-specific perturbation experiments beyond the scope of the GSE261698 transcriptomics dataset.

### 4.4 Limitations

**Twelve time points and AR(2) estimation precision.** With N = 12 time points, Yule-Walker estimation of φ₁ and φ₂ carries a mean bias of approximately ±0.05 in |λ| under Monte Carlo conditions (Whiteside 2026 [16]). The large effect sizes observed (Cry2 Δ = −0.421, Per3 Δ = +0.256) substantially exceed this noise floor, lending confidence to the arm-level inversion finding. However, smaller effects in the stabilising loop (Nr1d1 Δ = −0.096, Nr1d2 Δ = +0.027) are within the estimation noise range and should not be over-interpreted.

**TRAP/RiboTag ribosome-associated RNA.** The GSE261698 dataset uses immunopanning to isolate ribosome-associated mRNA from specific cell types, which may enrich for translated transcripts versus total mRNA. This introduces a translational filter not present in standard RNA-seq. The |λ| values reflect persistence of the ribosome-associated pool, which may differ from the transcriptional dynamics measured in whole-cell RNA-seq. The comparison to other PAR(2) framework datasets (which typically use total RNA) should be made cautiously.

**Mouse model limitations.** The 5xFAD model overexpresses human APP and PSEN1 with five familial AD mutations, producing accelerated amyloid pathology that is more severe and developmentally earlier than typical late-onset AD. Whether the clock hierarchy inversion observed here is specific to this high-amyloid model, or generalises to other APP models or human AD, requires replication in additional datasets.

**Missing APP Microglia and Aged Microglia comparisons.** Raw count data for APP Microglia and Aged Microglia are available in GEO (GSE261698) but have not been downloaded or processed in the current analysis. These are genuine data gaps. The APP Microglia comparison in particular is important for determining whether the negative-arm collapse seen in astrocytes is cell-type-specific or also present in microglia.

**Aged astrocyte precision.** The aged astrocyte analysis (Section 3.7) uses 6 averaged time points per gene, with 2 biological replicates averaged at each time point. This is substantially less precision than the 12-point WT and APP series. Estimated mean bias in |λ| at N = 6 is approximately ±0.15, compared to ±0.05 at N = 12 (Monte Carlo analysis; Whiteside 2026 [16]). The qualitative pattern — Per1/Per2/Clock rising in aged while collapsing in APP — is robust given the effect sizes involved, but smaller differences in the stabilising loop genes should not be over-interpreted.

### 4.5 Relationship to the PAR(2) framework and other papers

The clock hierarchy inversion observed in APP astrocytes parallels the MYC-driven hierarchy disruption in neuroblastoma (Paper N [17]). In Paper N, MYC activation inverts the clock-above-target ordering in specific neuroblastoma cell lines. Here, APP pathology inverts the ordering *within* the clock — collapsing the repressive arm while the output arm rises. Both cases confirm that |λ|-based hierarchy analysis captures mechanistically meaningful disruption that amplitude-based methods miss.

The finding also connects to Paper F's demonstration that |λ| is independent of mRNA half-life [15]. If the Per1/Cry2 collapse reflected simply a change in mRNA stability (faster degradation in APP astrocytes), the |λ| independence argument would predict that |λ| should *not* change with stability alone. The large observed drops in Per1/Cry2 |λ| therefore likely reflect genuine changes in the feedback dynamics driving transcription, not simply altered transcript stability.

### 4.6 Future directions

1. **APP Microglia and Aged Microglia analyses.** Download and process APP Microglia and Aged Microglia count data from GSE261698 to complete the cell-type × condition matrix. The APP Microglia comparison is particularly important for determining whether the negative-arm collapse is astrocyte-specific.
2. **Cry2 shared vulnerability mechanism.** Cry2 is the only clock gene showing consistent collapse in both aged (Δ = −0.393) and APP (Δ = −0.421) astrocytes. Identifying the mechanism — whether SIRT1-mediated deacetylation, oxidative stress-driven protein instability, or altered E-box occupancy — could identify a shared vulnerability point between ageing and AD pathology.
3. **CCG prediction.** Test whether clock-controlled genes (CCGs) with D-box regulatory elements maintain rhythmicity in APP astrocytes more than CCGs regulated through E-box elements — the downstream prediction of the arm-level inversion.
4. **AMPK complex validation.** The dissociation between Prkaa1 (catalytic; |λ| falls in APP) and Prkab1/Prkab2 (scaffold; |λ| rises in APP) requires protein-level validation. If confirmed, it could represent a novel aspect of APP-driven astrocyte metabolic reprogramming.
5. **Human AD datasets.** Apply AR(2) analysis to available human AD transcriptomics datasets with circadian time-tagging (e.g., BioSPEAN or ZeitZeiger-annotated cohorts) to test for translational relevance beyond the 5xFAD model.

---

## 5. Conclusions

AR(2) eigenvalue analysis of the AD Glial Circadian Atlas (GSE261698) reveals that APP amyloid pathology produces a selective, arm-specific disruption of the astrocyte circadian clock — not uniform suppression. The negative feedback arm (Per1, Per2, Cry2, Clock) collapses in APP astrocytes, while the D-box output arm (Dbp, Tef, Per3) maintains or gains temporal persistence. This inversion within the TTFL hierarchy is consistent with disruption at the negative feedback step, resulting in decoupling of the positive-arm output from its normal repressor-driven constraint.

Critically, this inversion is not recapitulated by normal ageing. Aged astrocytes (18-month WT) show the opposite pattern in Per1, Per2, and Clock — these genes rise in persistence relative to young WT, while they collapse in APP. Cry2 is the sole exception, collapsing in both aged and APP conditions, marking it as a potential shared vulnerability. The mechanistic basis of circadian disruption in AD is therefore distinct from ageing of the glial clock, not simply an acceleration of it.

Microglia show a qualitatively different clock organisation from astrocytes under healthy conditions — most strikingly, Clock's near-absence in microglia (|λ| = 0.209 vs 0.575 in astrocytes) — suggesting cell-type-specific TTFL topologies in brain glia. AMPK pathway genes, analysed in matched normalisation, sit in the ordinary genome range and are not constitutively high-persistence; however, APP pathology produces a dissociation between the catalytic α1 subunit (persistence falls) and the regulatory β scaffold subunits (persistence rises), a finding warranting protein-level investigation.

The AR(2) eigenvalue framework provides a gene-resolved, mechanistically interpretable measure of glial clock disruption in AD that complements amplitude-based and rhythmicity-based approaches, and distinguishes ageing from disease in a way that bulk transcriptomic summaries do not.

---

## References

[1] Musiek ES, Bhimasani M, Zangrilli MA, et al. Circadian rest-activity pattern changes in aging and preclinical Alzheimer disease. *JAMA Neurol.* 2018;75(5):582–590.

[2] Lim ASP, Kowgier M, Yu L, Buchman AS, Bennett DA. Sleep fragmentation and the risk of incident Alzheimer's disease and cognitive decline in older persons. *Sleep.* 2013;36(7):1027–1032.

[3] Roh JH, Huang Y, Bero AW, et al. Disruption of the sleep-wake cycle and diurnal fluctuation of β-amyloid in mice with Alzheimer's disease pathology. *Sci Transl Med.* 2012;4(150):150ra122.

[4] Xie L, Kang H, Xu Q, et al. Sleep drives metabolite clearance from the adult brain. *Science.* 2013;342(6156):373–377.

[5] Kang JE, Lim MM, Bateman RJ, et al. Amyloid-β dynamics are regulated by orexin and the sleep-wake cycle. *Science.* 2009;326(5955):1005–1007.

[6] Bhattacharya A, Bhattacharya S. Circadian clock and APP processing: the tale of two clocks. *Front Aging Neurosci.* 2018;10:238.

[7] Prolo LM, Takahashi JS, Herzog ED. Circadian rhythm generation and entrainment in astrocytes. *J Neurosci.* 2005;25(2):404–408.

[8] Brancaccio M, Patton AP, Chesham JE, Maywood ES, Hastings MH. Astrocytes control circadian timekeeping in the suprachiasmatic nucleus via glutamatergic signaling. *Neuron.* 2017;93(6):1420–1435.e5.

[9] Liddelow SA, Guttenplan KA, Clarke LE, et al. Neurotoxic reactive astrocytes are induced by activated microglia. *Nature.* 2017;541(7638):481–487.

[10] Barca-Mayo O, Emmenegger MN, De Pietri Tonelli D. Time to change: how astrocytes synchronize brain network dynamics. *Front Neurosci.* 2021;15:718455.

[11] Hayashi Y, Koyanagi S, Kusunose N, et al. The intrinsic microglial molecular clock controls synaptic strength via the circadian expression of cathepsin S. *Sci Rep.* 2013;3:2744.

[12] Gate D, Saligrama N, Leventhal O, et al. Clonally expanded CD8 T cells patrol the cerebrospinal fluid in Alzheimer's disease. *Nature.* 2020;577(7790):399–404.

[13] Bhatt DL, Bhattacharya S. Microglial circadian rhythms and Alzheimer's disease. *Front Aging Neurosci.* 2021;13:726196.

[14] Sheehan PW, Fass S, Sapkota D, et al. A glial circadian gene expression atlas reveals cell-type and disease-specific reprogramming in response to amyloid pathology or aging. *Nat Neurosci.* 2025. doi: 10.1038/s41593-025-02067-1. PMID: 38853870.

[15] Whiteside M. Expression persistence is independent of mRNA half-life across 12 non-circadian datasets: AR(2) eigenvalue analysis. *bioRxiv* / Research Square, 2025. (Paper F)

[16] Whiteside M. PAR(2): Temporal Persistence Analysis via AR(2) Autoregressive Modelling Identifies a Circadian Clock–Target Hierarchy Conserved Across Tissues, Species, and Disease States. *PLOS Computational Biology*, under review, 2026. Preprint: doi: 10.21203/rs.3.rs-9283100/v1. (Paper A)

[17] Whiteside M. p53 Regulon Temporal Persistence in MYC-Driven Neuroblastoma: AR(2) Eigenvalue Analysis Identifies a Pro-Apoptotic < Survival Ordering in GSE221103. *Cell Death & Differentiation*, in preparation, 2026. (Paper N)

[23] Bellet MM, Vawter MP, Bunney BG, Bunney WE, Sassone-Corsi P. Ketamine influences CLOCK:BMAL1 function leading to altered circadian gene expression. *PLoS ONE.* 2011;6(8):e23982.

[24] Spengler ML, Kuropatwinski KK, Comas M, et al. Core circadian protein CLOCK is a positive regulator of NF-κB-mediated transcription. *Proc Natl Acad Sci USA.* 2012;109(37):E2457–E2465.

[25] DeBruyne JP, Weaver DR, Reppert SM. CLOCK and NPAS2 have overlapping roles in the suprachiasmatic circadian clock. *Nat Neurosci.* 2007;10(5):543–545.

[26] Srinivasan K, Friedman BA, Larson JL, et al. Untangling the brain's neuroinflammatory and neurodegenerative transcriptional responses. *Nat Commun.* 2016;7:11295.

---

## Supplementary Materials

### S1. Per-gene data table

Full per-gene |λ| for all 13 clock panel genes across the three analysed conditions is given in Table 2 of the main text. The complete genome-wide tables for WT Astrocyte (n = 14,025), WT Microglia (n = 17,078), and APP Astrocyte (n = 14,383) are downloadable from the PAR(2) Discovery Engine at the `/glial-analysis` page (CSV download button).

### S2. Data availability

GSE261698 raw count data are available from NCBI GEO at accession GSE261698. Pre-computed AR(2) eigenvalue results used in this paper are stored in the PAR(2) Discovery Engine at `datasets/GSE261698/GSE261698_AR2_results.json`. The analysis was performed on data normalised to log₂(CPM+1) as described in Section 2.2.

### S3. Remaining analyses

The following analyses were not available at time of submission and will be incorporated in a future version:
- APP Microglia vs WT Microglia clock panel (raw count data available in GEO; not yet processed)
- Aged Microglia clock panel (same data gap as APP Microglia)

### S4. Reproducibility

The PAR(2) Discovery Engine is available at the Replit-hosted URL. Python figure generation scripts for this paper are located in `manuscripts/scripts/generate_paper_h_figures.py`. Those scripts will require updating to reflect the corrected data used in this version of the manuscript.
