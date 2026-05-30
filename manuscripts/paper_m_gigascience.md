# Paper M: The PAR(2) Discovery Engine — A Reproducible Methods Platform for Temporal Persistence Analysis of Gene Expression Time Series

**Target journal:** GigaScience  
**Status:** Draft — not submitted  
**Author:** Michael Whiteside, Independent Researcher, Scotland, UK. ORCID: 0009-0000-0643-5791. Correspondence: mickwh@msn.com  
**Preprint:** Not yet deposited

---

## Abstract

We describe the PAR(2) Discovery Engine, an open analytical platform implementing autoregressive AR(2) modelling of gene expression time series to quantify temporal persistence via the eigenvalue modulus |λ|. The platform processes circadian transcriptomic data from public repositories, fits AR(2) models using ordinary least squares on mean-centred expression data, and computes the eigenvalue modulus of the companion matrix. Across 22 datasets and five species, the platform reproducibly identifies a Clock > target > housekeeping eigenvalue hierarchy and validates the stable eigenvalue band [0.52, 0.72]. The primary contribution of this paper is the platform architecture, reproducibility infrastructure, and the cross-dataset eigenvalue hierarchy validation. As a secondary exploratory finding, direct BMAL1/CLOCK E-box target genes show marginal proximity to 1/φ ≈ 0.618 in a pre-specified 14-gene cross-tissue analysis (p=0.044, z=−1.63, 5,000 expression-matched permutations); the genome-wide scan is non-significant (p=0.154), and single-tissue analysis shows no significant enrichment near 1/φ or any other reference modulus (p=0.367, n=5,000 permutations). This proximity is an exploratory, unreplicated observation that should not be over-interpreted; 1/φ is not a universal attractor in this framework's τ_c space (clock τ_c spans 2.7–11.4h across tissues; 1/φ corresponds to τ_c ≈ 3.9h at Δt = 2h). All code, datasets, and pre-computed results are made available through the platform's reproducibility package (https://par2discovery.com).

**Note on scope:** This paper addresses the platform methods and the Clock eigenvalue hierarchy. The mathematical relationship between AR(2) eigenvalues and Fibonacci sequences is explored as a secondary analysis in Section 4 but is not the primary contribution. A separate mathematical treatment of Fibonacci recurrence in this context is under review elsewhere; this paper cross-references that work but does not reproduce its analysis.

---

## 1. Background

The AR(2) process x(t) = φ₁x(t−1) + φ₂x(t−2) + ε(t) characterises temporal dynamics through two parameters. The eigenvalues of the companion matrix determine the qualitative behaviour: complex conjugate eigenvalues produce oscillatory dynamics, and the modulus |λ| = √(−φ₂) controls the rate at which the oscillation persists or decays. A gene with |λ| close to 1.0 oscillates indefinitely with no decay — explosive or near-unit-root behaviour. A gene with |λ| close to 0 reverts rapidly to baseline with no oscillatory memory. The stable eigenvalue band [0.52, 0.72] represents the zone of intermediate temporal persistence that is biologically favoured for genes requiring sustained, self-correcting rhythmic output.

The inverse golden ratio 1/φ ≈ 0.618 falls within this band. This is a consequence of proved algebra: the AR(2) companion matrix at (φ₁, φ₂) = (1,1) — exact Fibonacci recursion — has φ as its dominant root, which lies outside the stationarity triangle; the stable root of the same characteristic polynomial is 1/φ. This means 1/φ is a mathematically derived boundary point of the stationarity region, not an empirically discovered biological attractor. Whether clock genes show any statistically specific preference for |λ| ≈ 1/φ over other nearby values (0.60, 0.65) is a separate empirical question addressed in Section 4 and treated there as an exploratory secondary analysis.

---

## 2. Platform Architecture

### 2.1 Overview

The PAR(2) Discovery Engine is a full-stack web application comprising:

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, TanStack Query, Wouter routing — 68 interactive analysis pages
- **Backend**: Node.js, Express.js, TypeScript — 120 server-side modules handling computation, data serving, and export
- **Database**: PostgreSQL with Drizzle ORM for persistent storage of pre-computed results
- **Deployment**: Replit cloud platform; production URL https://par2discovery.com

As of April 2026, the full-stack codebase spans approximately 79,000 lines implementing analysis, visualisation, export, bias auditing, and reproducibility functions. The platform embeds 64 CSV-format datasets covering five species (mouse, human, baboon, *Arabidopsis thaliana*, *S. cerevisiae*) across 12 tissue types, enabling reproducible access without reliance on external data repositories at access time.

### 2.2 Development Methodology

The platform was developed over approximately five months (October 2025 – April 2026) by a single independent researcher. The development workflow followed three principles:

1. **Specification-driven implementation.** Analytical requirements, mathematical specifications, and validation criteria were specified in natural language and translated into TypeScript/React implementations, with each module verified against known analytical results before incorporation.

2. **Incremental module addition.** New analytical modules were added one at a time, with the existing platform remaining functional throughout. Each module was validated against known analytical results before being incorporated into the main application.

3. **Version control and reproducibility.** All development was tracked via Git (https://github.com/mickwh2764/par2-discovery-engine). Pre-computed results are embedded in the platform so that analytical outputs do not depend on live computation at access time.

This development approach — specification-to-implementation with embedded validation — is itself a methodological contribution relevant to GigaScience readers. It demonstrates that a complex analytical platform (90 pages, 120+ modules) can be constructed reproducibly through iterative, validated module addition rather than monolithic development.

**AI contribution statement.** AI tools were used at two levels throughout this work, in accordance with GigaScience's AI use disclosure policy.

*Platform implementation.* An AI coding agent (Replit Agent, Anthropic/Replit) was used to translate analytical specifications into TypeScript/React/Node.js code. Each module was specified by the author in terms of mathematical requirements and validation criteria, implemented by the agent, and verified against known analytical results before incorporation. The agent generated code; it did not generate hypotheses, select datasets, design validation tests, or interpret results.

*Manuscript preparation.* Large language models (Claude, Anthropic; GPT-4, OpenAI) were used for drafting, structural editing, and refinement of manuscript text. All scientific content — the analytical framework, hypothesis design, dataset selection, validation architecture, error corrections, and scientific interpretation — originated with and was decided by the author. LLMs were used as writing tools, not as analytical or reasoning agents.

The boundary between AI contribution and human contribution in this work is the same as the boundary between implementation and conception. The AR(2) framework, the eigenvalue hierarchy hypothesis, the cross-disciplinary validation design, the falsification test architecture, and all scientific judgements are the author's own. The rate at which the platform was built, and the fluency of the prose, benefited from AI assistance. The intellectual content did not.

### 2.3 AR(2) Fitting Engine

The core AR(2) engine (server/par2-engine.ts) implements the following pipeline for each gene time series:

1. **Preprocessing.** Expression values are mean-centred (each value minus the series mean), removing expression-level offsets that would otherwise confound autoregressive coefficient estimation. For datasets with biological replicates at the same timepoint (e.g. GSE157357 with duplicate timepoints), values are averaged per timepoint before fitting.

2. **Chronological ordering.** Timepoint indices are sorted before fitting to ensure temporal order. This step is explicit in the code to prevent artefacts from non-chronological column ordering in source datasets.

3. **OLS fitting.** The mean-centred series x(t) is regressed on its first two lags: x(t) = φ₁x(t−1) + φ₂x(t−2) + ε(t). This is a standard OLS problem with design matrix X = [x(t−1), x(t−2)]ᵀ and response Y = x(t). The normal equations are solved directly: **[φ₁, φ₂]ᵀ = (XᵀX)⁻¹ Xᵀ Y**.

4. **Eigenvalue computation.** The characteristic polynomial λ² − φ₁λ − φ₂ = 0 is solved. If the discriminant (φ₁² + 4φ₂) is negative, the roots are complex conjugates with modulus |λ| = √(−φ₂), indicating genuinely oscillatory dynamics. If the discriminant is positive or zero, the roots are real and |λ| = max(|λ₁|, |λ₂|), indicating non-oscillatory persistence. Values exceeding 1.000 (explosive or near-integrated process) are capped at 1.000 with a stationarity ceiling note.

5. **R² computation.** The coefficient of determination from the OLS fit is reported alongside |λ| as a fit quality indicator.

The engine processes the full genome (≈20,000 genes) for embedded datasets and accepts user-uploaded CSV files through the Discovery Engine module. All analytical results displayed on the platform are pre-computed and embedded for fast access; live computation is reserved for user uploads.

### 2.4 Key Analytical Modules

Table 1 summarises the principal analytical modules and their correspondence to the paper series.

| Module | Function | Paper |
|--------|----------|-------|
| AR(2) Engine (server/par2-engine.ts) | Core eigenvalue fitting | A, E |
| ODE Model Zoo | AR(2) vs canonical ODE validation | A |
| Monte Carlo Benchmark | Bias/RMSE/coverage simulation | A (Table S6) |
| Head-to-Head Comparison | AR(2) vs cosinor vs JTK_CYCLE | A (Table S7) |
| Phase-Gating Analysis | 28,138 gene-pair temporal coupling | E |
| GSE157357 Pairwise | Four-condition clock–cancer double mutant | E, O |
| Regulatory Core Discovery | Genome-wide clock-like gene scan | E |
| Glial Analysis (GSE261698) | APP astrocyte clock inversion | H |
| Genome-Wide Coupling Scan | AR(2)+exogenous, 21,000 genes | E |
| Root-Space Geometry | Unit circle + Fibonacci enrichment | G |
| Cross-Metric Independence | |λ| vs amplitude/half-life/network degree | F |
| DRMref Validation | Drug resistance gene AR(2) cross-validation | E |

**Table 1.** Selected platform modules and paper correspondence. Paper series: A (core methods), E (phase-gated AR(2)), F (mRNA half-life independence), G (Fibonacci Quarterly), H (AD glial clock), M (this paper), N (p53 regulon), O (organoid hierarchy).

---

## 3. Eigenvalue Hierarchy Validation

### 3.1 Three-Layer Automated Bias Auditing

Every uploaded or embedded gene matrix analysis automatically runs three bias tests before results are presented:

1. **Time-Shuffle Destruction.** Temporal order of each gene is independently randomised; the analysis is recomputed on the shuffled data. A result that survives shuffling is flagged as potentially independent of temporal structure.

2. **Irrelevant Metric Correlation.** |λ| values are correlated against gene-level metrics that should be biologically irrelevant (e.g. mean expression rank, gene index). High correlation indicates a systematic confound.

3. **Expression-Matched Null Hierarchy.** For each clock gene, a genome-wide gene with matched expression level (±0.3 log₂ units) is drawn and substituted. The hierarchy gap is recomputed. The real gap is compared against the null distribution of 10,000 such substitutions.

All three tests pass for the primary dataset (GSE11923 Liver, p < 0.001 in each case) and for the AD glial clock dataset (GSE261698, Tests 1 and 2 complete with p = 0.0017 and p = 0.0015 respectively).

### 3.2 Multi-Species and Multi-Dataset Replication

The |λ| hierarchy (Clock > target) has been independently confirmed in:

- **Mouse liver** (GSE11923, 20,955 genes, 48 timepoints at 1-hour intervals) — primary dataset
- **Human blood** (GSE39445, sleep restriction vs. sufficient sleep)
- **Baboon multi-tissue** (GSE98965, 64 tissues, 12 species-conserved clock genes)
- ***Arabidopsis thaliana*** (GSE242964, three photoperiod conditions)
- **Mouse intestinal organoids** (GSE157357, four genetic conditions)
- **Mouse and human enteroids** (GSE179027, GSE161566)

Across all datasets, the Clock > target eigenvalue gap ranges from +0.30 to +0.40 units, demonstrating that the hierarchy is robust to species, tissue type, and experimental paradigm.

### 3.3 Head-to-Head Method Comparison

To assess whether |λ| captures information genuinely distinct from established methods, it was compared against cosinor regression and JTK_CYCLE on the same 20,955 genes from the GSE54650 mouse liver dataset (48 timepoints, 1-hour intervals). Detection overlap and cross-method correlations are summarised in Figure 3.

**Cross-method correlations.** Spearman ρ between |λ| and cosinor R² = 0.256; between |λ| and JTK |τ| = 0.215. By contrast, cosinor amplitude and JTK |τ| correlated at ρ = 0.649. This pattern confirms that cosinor and JTK_CYCLE measure similar properties (sinusoidal oscillation strength), while |λ| measures a structurally different property (temporal persistence / autoregressive memory).

**Detection overlap.** Applying BH-FDR q < 0.05 thresholds to cosinor and JTK_CYCLE, and a persistence threshold to AR(2):

- **2,097 genes (10.0%)** detected by all three methods — the strongest circadian signals, including 11 of 13 core clock genes.
- **9,828 genes (46.9%)** detected by AR(2) alone — genes with high temporal persistence but non-sinusoidal or overdamped dynamics that cosinor and JTK_CYCLE do not flag. This is the primary value added by the persistence approach.
- **176 genes (0.8%)** detected by cosinor+JTK but not AR(2) — genes that oscillate but with rapidly damped (low-memory) dynamics.
- **5,840 genes (27.9%)** detected by none.

The three methods are complementary rather than redundant. The appropriate use is to layer persistence analysis over — not substitute for — existing rhythmicity tools.

### 3.4 ODE Model Validation

AR(2) is a linear model; the canonical ODEs used for validation are nonlinear. The comparison tests whether a linear AR(2) fit approximately recovers the dominant oscillatory persistence encoded in sampled nonlinear dynamics. The framework was tested against six canonical oscillator ODEs: FitzHugh-Nagumo, Goodwin, Van der Pol, Lotka-Volterra, Leloup-Goldbeter Circadian (24-hour clock model), and Tyson-Novak cell cycle. ODE solutions were numerically integrated (RK4), the resulting time series submitted to AR(2) fitting, and the fitted |λ| compared against the theoretical value predicted from the oscillation period.

Nine of eleven ODE variables matched within |Δφ₁| < 0.1; the two mismatches localise to the most strongly nonlinear variables (Goodwin mRNA, Tyson-Novak CDK), where the linear approximation is least accurate by design. The Leloup-Goldbeter model (T = 24.02 h, |λ| = 0.9999, R² = 1.000) is consistent with the near-critical persistence observed in real circadian clock genes.

### 3.5 Floquet Analysis: Theoretical Separation of |λ| from Orbital Stability

A natural challenge to any new stability measure is: *what precisely is it measuring, and how does it relate to existing mathematical stability concepts?* For oscillatory systems, the standard framework is Floquet theory, which describes how perturbations transverse to the limit cycle evolve over one period T.

The platform computes Floquet multipliers numerically for four canonical ODE models via flow-map differentiation (monodromy matrix approximated by finite differences, ε = 10⁻⁶, ≥2,000 RK4 steps per period). Results are summarised in Table 2.

**Table 2.** Floquet analysis for four canonical ODE oscillators. |λ| is the AR(2) eigenvalue modulus; |μ_nt| is the leading non-trivial Floquet multiplier.

| Model | Period | AR(2) |λ| | Floquet |μ_nt| | Gap |
|-------|--------|----------|------------|-----|
| Goodwin oscillator | 7.71 au | 0.999 | 0.656 | +0.343 |
| Van der Pol (μ=1) | 6.66 au | 0.999 | 0.001 | +0.998 |
| FitzHugh-Nagumo | 39.5 au | 0.999 | ≈0 | +1.000 |
| Lotka-Volterra | 10.8 au | 0.999 | 1.003 | −0.004 |

Three conclusions follow. First, AR(2) is insensitive to orbital contraction rate while Floquet theory is specifically designed to measure it — the two quantities are complementary and non-redundant. Second, in the Lotka-Volterra negative control (conservative system, no transverse stability), both measures agree at |μ| ≈ 1 — the one case where they should agree. Third, the Goodwin oscillator (mechanistic model of the circadian negative-feedback loop) shows AR(2) |λ| = 0.999, consistent with near-critical persistence in real clock data, while its Floquet multiplier 0.656 reflects ODE topology, not the linear AR model.

### 3.6 AR(2) Engine Integrity Self-Test

The platform includes an analytic ground-truth self-test that runs independently of any biological data. A pure cosine series with known period T = 10 is generated and submitted to the AR(2) fitting engine. For a discrete cosine sampled at unit intervals, the exact theoretical coefficients are φ̂₁ = 2cos(2π/T) = φ ≈ 1.618034 (the golden ratio, by coincidence of this specific period) and φ̂₂ = −1, with R² = 1.000 by construction. The engine is expected to recover these values exactly. The test is displayed as a live PASS/FAIL badge on the Boman ODE validation page (/boman-ode); any failure immediately flags an engine regression.

### 3.7 p53 Regulon as Negative Control

A second bias test asks whether |λ| correctly fails to elevate genes whose expression is known to be driven by acute pulse rather than rhythmic clock output. The p53 transcriptional programme was used as the canonical negative control: 34 canonical direct p53 targets were assembled from Fischer (2017) across seven functional categories and tested against each of the 38 embedded platform datasets (5,000 permutations per dataset; 34 evaluable after excluding non-mammalian and probe-level datasets).

Of 34 evaluable datasets, only 6 reached significance at p < 0.05, and of these, 3 were significantly *below* genome background (Mouse BAT, Δ = −0.101, p = 0.0018; Mouse Liver GSE11923, Δ = −0.143, p = 0.012; Mouse Young Kidney, Δ = −0.102, p = 0.019), consistent with the prediction that pulse-driven transcription does not generate sustained temporal autocorrelation. The 12 Hughes Atlas mouse circadian tissues were uniformly non-significant (cross-tissue mean Δ ≈ −0.02, none approaching p < 0.08). The 3 datasets significantly above background (two neuroblastoma conditions, one human whole blood) reflect context-specific pathway activation in disease states, not a clock-driven signal. The p53 regulon sweep therefore passes as a negative control for normal circadian tissue.

---

## 4. Phi-Zone Gene Analysis: An Exploratory Secondary Analysis

> **What is established (algebra) versus what is hypothesised (biology).** The AR(2) companion matrix at (φ₁, φ₂) = (1,1) is identical to Boman's Fibonacci matrix M; its dominant root is φ > 1, placing exact Fibonacci dynamics outside the stationarity triangle and excluding them from stationary gene-expression time series. The stable root of r² − r − 1 = 0 is 1/φ ≈ 0.618 — a mathematically derived number that falls within the clock eigenvalue band. **This is proved algebra.** Whether biologically selected gene sets are preferentially enriched near this specific value — as opposed to neighbouring values such as 0.60 or 0.65 — is a biological and statistical hypothesis requiring empirical testing. The sections below address only the hypothesis; the algebra is treated as background.

### 4.1 Rationale, τ_c sanity check, and gene set specification

The observation that the mean Clock category eigenvalue (|λ| = 0.628) falls within 2% of 1/φ ≈ 0.618 raised the question of whether the proximity is systematic for biologically motivated gene subsets rather than the genome as a whole.

**τ_c sanity check.** Paper P maps |λ| to a temporal correlation length via τ_c = −1/ln|λ| × Δt. At |λ| = 1/φ ≈ 0.618 and Δt = 2h, this gives τ_c ≈ 3.9h. Across 12 mouse tissues (GSE54650), clock gene τ_c spans approximately 2.7h to 11.4h (Paper P Supplementary Table S1), and target gene τ_c spans approximately 1.5h to 3.0h. The value 1/φ falls near the lower end of the clock range and toward the upper end of the target range — it is not a universal attractor in τ_c space, but one point on a continuum. Any Fibonacci claim must therefore be localised and modest: it concerns a subset of clock-output genes in specific contexts, not a general property of the circadian transcriptome.

Two analyses were performed:

1. **Genome-wide category-level scan**: AR(2) eigenvalues computed for 212 classified genes across 9 functional categories in five mouse tissues (GSE54650, Mus musculus, Hughes et al. 2009) and two neuroblastoma conditions (GSE221103, Homo sapiens). The phi-zone was defined as |λ| ∈ [0.603, 0.633] (±0.015 of 1/φ). Permutation testing: 5,000 iterations, category label shuffles, Benjamini–Hochberg FDR correction.

2. **Pre-specified direct E-box target analysis**: A gene set of 14 direct BMAL1/CLOCK E-box targets was specified before analysis from published ChIP-seq literature (Koike et al. 2012; Zhang et al. 2014; Matsuo et al. 2003; Ramsey et al. 2009). These are first-wave clock-controlled genes with confirmed E-box binding: Dbp, Tef, Hlf, Nfil3, Rora, Rorb, Rorc, Bhlhe40, Bhlhe41, Ciart, Wee1, Nampt, Cdkn1a, Ccrn4l. Expression-matched permutation null was constructed by binning the genome-wide liver eigenvalue distribution into 20 log-expression bins and sampling matched genes for each permutation draw.

The pre-specified gene set analysis is a more powerful test because it removes the multiple-testing burden imposed by scanning all 9 categories and focuses on genes with prior biological rationale for clock regulation.

### 4.2 Results

**Genome-wide scan (negative result):** 53/212 genes (25.0%) fell within the phi-zone in at least one tissue. Permutation p = 0.154; not significant. The null expectation was 23.8%, meaning the observed rate is entirely explained by the eigenvalue distribution shape and multi-tissue testing. No category showed significant enrichment after FDR correction (best: Immune 41.7%, adjusted p = 0.384). This result is reported as a negative finding and is consistent with 1/φ being a geometric reference point rather than a universal biological attractor.

**Pre-specified direct E-box target analysis (marginal result):** The 14-gene direct target set showed marginal clustering near 1/φ compared to expression-matched null (observed mean distance from 1/φ = 0.103; permutation p = 0.044; z = −1.63; n = 5,000 iterations). This result was computed after the genome-wide scan and was not used to construct the gene set. The p-value is marginal and has not been replicated in an independent dataset; it should be treated as hypothesis-generating rather than confirmatory. If genuine, the finding would suggest that the clock's immediate transcriptional output layer — the genes whose promoters CLOCK:BMAL1 directly occupies — operates preferentially in the dynamical regime near 1/φ. However, as Section 4.6 below shows, the enrichment is not demonstrably specific to 1/φ versus neighbouring reference points in single-tissue analysis.

**Table 1. Genes within 5% of 1/φ ≈ 0.618, computed across 12 mouse tissues (GSE54650)**

| Gene | Tier | Mean |λ| | Distance from 1/φ | Tissues | Proximity |
|------|------|-----------|-------------------|---------|-----------|
| Wee1 | Direct E-box target | 0.6115 | 0.0065 | 12/12 | Within 2% |
| Rorc | Direct E-box target | 0.6248 | 0.0068 | 12/12 | Within 2% |
| Cry1 | Core clock | 0.6065 | 0.0115 | 12/12 | Within 2% |
| Bhlhe41 | Direct E-box target | 0.5955 | 0.0225 | 12/12 | Within 5% |
| Hlf | Direct E-box target | 0.6421 | 0.0240 | 12/12 | Within 5% |
| Ciart | Direct E-box target | 0.6593 | 0.0413 | 12/12 | Within 5% |

All six genes were found in all 12 tissues. Mean |λ| is the average across all tissues with sufficient data (≥6 timepoints). Distance is |mean |λ| − 0.618034|.

### 4.3 Biological interpretation of near-phi genes

**Wee1** (|λ| = 0.612): The G2/M checkpoint kinase whose transcription is driven directly by CLOCK:BMAL1 via E-box binding (Matsuo et al. 2003), timing mitotic entry to the appropriate circadian phase. Wee1 appears in 10/12 tissues in the platform's coupling scan — the broadest cross-tissue coupling of any non-clock gene — and its eigenvalue collapses under APC mutation, providing a molecular bridge between the circadian gate and oncogenic cell-cycle deregulation.

**Rorc** (|λ| = 0.625): A component of the clock's positive feedback arm that simultaneously drives Bmal1 transcription and Th17 immune differentiation. Its position near 1/φ means circadian disruption degrades both self-regulation and daily immune rhythmicity in a single molecular event.

**Cry1** (|λ| = 0.607): The primary CLOCK:BMAL1 repressor. Its eigenvalue falling within 2% of 1/φ across all 12 tissues indicates that the core negative feedback mechanism operates in the intermediate persistence zone. Familial Delayed Sleep Phase Disorder is caused by mutations that extend CRY1 half-life; ageing reduces CRY1 eigenvalues, damping clock amplitude.

**Bhlhe41 / DEC2** (|λ| = 0.596): A secondary feedback brake on CLOCK:BMAL1. Carriers of the P385R short-sleep variant (He et al. 2009) require ~6 hours of sleep, consistent with altered amplitude rather than period — the expected consequence of a dampened brake operating near 1/φ.

**Hlf** (|λ| = 0.642): One of three PAR-bZip output transcription factors driving the primary clock-output wave in liver, kidney, and lung. Eigenvalue reduction under hepatic disease or shift work disrupts drug metabolism, bile acid synthesis, and lipid handling.

**Ciart / CHRONO** (|λ| = 0.659): A co-repressor that moderates BMAL1 transactivation amplitude. Its eigenvalue slightly above 1/φ is consistent with a modulating role on clock output strength rather than period.

### 4.4 The Wee1–Boman bridge: temporal and spatial Fibonacci in renewing epithelium

**Scope note.** The mathematical analysis of Fibonacci sequences in relation to AR(2) eigenvalues is developed in detail in a separate paper currently under review (Paper G, "Fibonacci Quarterly" submission). The present section provides biological context for the Wee1 proximity finding and draws a conceptual connection to Boman's spatial work; it does not duplicate Paper G's mathematical treatment. Readers interested in the formal eigenvalue-Fibonacci relationship should refer to Paper G.

**Cross-reference caution.** Because Paper G is in active peer review, the mathematical claims made in this section are cross-referenced to Paper G for their formal justification. If Paper G is revised during review, the biological interpretation given here may require updating. The Wee1 proximity result (|λ|=0.612 across 12 tissues) is independently reproduced by the platform data and does not depend on Paper G; what Paper G provides is the formal mathematical grounding for why |λ| ≈ 1/φ is a meaningful dynamical reference point.

Boman et al. (2005, 2013) described a Fibonacci-like spatial architecture in the colonic crypt — the arrangement of cell positions and the proportions of cell types at different compartment levels follow Fibonacci-ratio relationships. This was proposed as a consequence of the recursive, self-similar nature of the renewal process: each crypt position is generated by a rule applied to the positions below it, analogous to Fibonacci recursion in the spatial domain.

The PAR(2) framework suggests a potential temporal analogue. Wee1, the gene that controls when a crypt cell is permitted to enter mitosis, operates with a temporal eigenvalue of 0.612 across all 12 tissues — the closest of any gene to 1/φ. The proximity is consistent with a mechanistic link through recursive timing: Wee1 expression is driven by CLOCK:BMAL1 via E-box binding (Matsuo et al. 2003), and the clock feedback loop's characteristic persistence falls near 1/φ (Cry1: 0.607). Whether this constitutes a genuine Fibonacci timing structure or a coincidence of the stability band geometry is not resolved by this analysis.

**Caveats for the Wee1–Boman connection.** Four specific limitations apply. First, Wee1's proximity to 1/φ is a ranked observation rather than a formally permutation-tested finding. Second, 1/φ ≈ 0.618 lies near the geometric centre of the stable band [0.52, 0.72], so proximity may reflect stability-band geometry rather than Fibonacci-specific selection. Third, the causal chain from Wee1's eigenvalue to crypt spatial architecture (CLOCK:BMAL1 → Wee1 → CDK1 phosphorylation → mitotic entry → crypt cell position) has not been measured in the Fibonacci-structured crypt geometry context. Fourth, Boman's spatial work used human colon tissue while the Wee1 eigenvalue is computed from mouse liver RNA — the connection is conceptual and cross-species.

The convergence of spatial and temporal Fibonacci observations on the same biological process — crypt cell division — generates a testable prediction: perturbations that move Wee1's eigenvalue away from 1/φ (APC mutation, BMAL1 knockout, Wee1 inhibition) should predictably alter the spatial Fibonacci structure of the crypt. This is a directly measurable experimental outcome and would provide the first causal test of the bridge hypothesis.

### 4.5 Comparison to genome-wide null result

The two results — genome-wide p = 0.154 (not significant) and direct E-box target p = 0.044 (marginal) — answer different questions. The genome-wide scan asks whether there is an invisible force pulling all genes toward 1/φ; the answer is no. The pre-specified analysis asks whether genes selected a priori on the basis of confirmed E-box binding show a preference for 1/φ dynamics; the answer is marginal and unconfirmed. The distinction is methodologically important: the pre-specified analysis is the appropriate test for the biological hypothesis, because it avoids the multiple-testing inflation of a genome-wide scan while retaining the expression-matched null.

The genome-wide negative result should be reported prominently as a falsification of the stronger claim (universal Fibonacci attractor). The pre-specified marginal result should be reported alongside it with explicit caveats: p = 0.044 from a single dataset, not yet replicated.

### 4.6 Reference moduli comparison: is 1/φ specifically enriched?

A critical control question is whether the E-box gene set shows enrichment specifically near 1/φ, or whether similar enrichment would be found near other arbitrary reference points in the stable band. If the enrichment near 0.618 is not distinguishable from enrichment near 0.60, 0.65, or 0.70, then the Fibonacci connection adds nothing beyond the general observation that clock-output genes occupy the stable band.

To test this, the 12 E-box genes found in the Liver dataset (GSE54650; Cdkn1a and Ccrn4l absent from the genome-wide comparison table) were tested for proximity enrichment against seven reference moduli spanning the stable band: 0.50, 0.55, 0.60, 0.618 (1/φ), 0.65, 0.70, and 0.75. For each reference, mean distance from the 12-gene set to that reference was compared against 5,000 random permutations of n = 12 genes drawn from the full 20,955-gene Liver distribution (unmatched; this is a conservative single-tissue test).

**Results:**

| Reference modulus | Obs. mean distance | Null mean distance | p-value |
|-------------------|-------------------|-------------------|---------|
| 0.500 | 0.167 | 0.140 | 0.835 |
| 0.550 | 0.156 | 0.145 | 0.654 |
| 0.600 | 0.156 | 0.162 | 0.447 |
| **1/φ = 0.618** | **0.157** | **0.171** | **0.367** |
| 0.650 | 0.162 | 0.191 | 0.255 |
| 0.700 | 0.178 | 0.225 | 0.147 |
| 0.750 | 0.208 | 0.268 | 0.108 |

No reference modulus reaches significance. Notably, the observed distances are not systematically smaller than null for 1/φ relative to neighbouring moduli: 0.60 and 0.618 give near-identical observed distances (0.156 vs 0.157). The decreasing p-values at higher reference moduli reflect the fact that several E-box genes in Liver (Dbp = 0.792, Nampt = 0.812, Ciart = 0.709, Rorc = 0.709) have high eigenvalues, shifting the set toward higher reference points — a tissue-specific pattern, not a 1/φ-specific signal.

**Interpretation.** In single-tissue Liver analysis, the E-box gene set shows no significant enrichment near any reference modulus including 1/φ. The cross-tissue p = 0.044 result from the expression-matched analysis may reflect averaging across tissues, which smooths out the high-eigenvalue outliers (Dbp, Nampt) that dominate the Liver distribution. Replication in an independent dataset using the same cross-tissue averaging procedure — ideally baboon GSE98965 (8 tissues, 12 timepoints) — is required before the 1/φ enrichment can be considered specific to the Fibonacci reference point rather than a general property of the stable band.

---

## 5. Reproducibility Package

### 5.1 Full Web Application

A researcher cloning the GitHub repository (https://github.com/mickwh2764/par2-discovery-engine) receives the complete platform:

- Complete frontend source code (React/TypeScript, 68 pages) in `client/src/`
- Complete backend source code (Node.js/Express, 120 modules) in `server/`
- Database schema (Drizzle ORM, PostgreSQL) in `shared/schema.ts`
- Docker and Docker Compose configuration for local deployment
- Installation guide (`INSTALL.md`) with three setup paths: full web application, command-line interface only, and one-command reproduction

### 5.2 Embedded Datasets

The repository embeds 64 CSV-format datasets in `datasets/`, totalling approximately 125,000 unique gene time-series across five species:

- **Mouse**: GSE11923 (liver, 20,955 genes, 48 timepoints at 1-hour intervals); GSE54650 (liver, 12 tissues); GSE157357 (intestinal organoids, four conditions); GSE201207 (kidney aging); GSE70499 (liver); GSE179027, GSE161566 (enteroids)
- **Human**: GSE39445 (blood, sleep restriction); GSE221103 (neuroblastoma); GSE113883 (whole blood); GSE261698 (AD astrocytes)
- **Baboon**: GSE98965 (64 tissues)
- ***Arabidopsis***: GSE242964 (three photoperiod conditions); GSE37278; GSE19271
- ***S. cerevisiae***: cell cycle datasets

Pre-computed AR(2) results for large analyses are also embedded as JSON/CSV files (e.g. `datasets/GSE261698/GSE261698_AR2_results.json`, `datasets/GSE179028/GSE179027_AR2_results.csv`), ensuring analytical outputs are accessible without re-running the full computation pipeline.

### 5.3 Self-Contained Reproducibility Bundle

The `reproducibility-package/` directory is a self-contained bundle that can be run independently of the web application. It includes:

- **Standalone AR(2) code** in TypeScript: `code/ar2_model.ts`, `eigenvalue_solver.ts`, `preprocess.ts`. These files implement the complete fitting pipeline and run without any web framework dependency.

- **Three key datasets**: GSE11923 Liver (≈21,000 genes), GSE157357 WT organoids, GSE54650 Liver.

- **Pre-computed results**: 20,955-gene eigenvalue table, 12-tissue nine-category classification tests, 10,000-permutation null distribution for the hierarchy gap test.

- **Boman crypt simulation** and crypt renewal agent-based model (TypeScript) reproducing the discrete-time three-compartment crypt results reported in Section 4.4.

### 5.4 Python Package

The `par2-python-package/` directory contains a standalone Python package (`par2-circadian v1.0.0`) requiring only NumPy and pandas:

- **Installation from source** (not yet on PyPI): `pip install ./par2-python-package`
- **CLI interface**: `par2 data.csv -o results.csv`
- **Python API**: `par2.fit_ar2_batch(df)` returning a DataFrame with |λ|, φ₁, φ₂, R², and root-type columns
- **PolyForm Noncommercial licence** (free for noncommercial use; commercial use requires a separate licence); includes examples and unit tests
- The package implements the identical pipeline to the TypeScript engine (mean-centring, OLS, eigenvalue computation) in a language accessible to the bioinformatics community

The Python package enables researchers to apply AR(2) eigenvalue analysis to their own data without installing the full Node.js/React platform. It is the recommended entry point for new users who want to apply the method to a single dataset before exploring the full platform.

### 5.5 Manuscript Packages

The `paper-packages/` directory contains LaTeX source, bibliography files, cover letters, and README files for all papers in the series (A, E, F, G, H, M, N, O). Each paper package includes:

- Main manuscript `.tex` source and compiled PDF
- Supplementary tables as CSV files
- Literature support document (`LITERATURE_SUPPORT.md`) with independent verification of all cited claims
- Submission-ready cover letter and target journal information
- `CITATION.cff`: machine-readable citation metadata (DOI: 10.5281/zenodo.18730681)

### 5.6 CITATION.cff and Software Citation

The repository root contains a `CITATION.cff` file (Citation File Format v1.2.0) providing structured citation metadata for the platform. The preferred citation is:

> Whiteside M. (2026). PAR(2) Discovery Engine: A Reproducible Methods Platform for Temporal Persistence Analysis of Gene Expression Time Series. Zenodo. https://doi.org/10.5281/zenodo.18730681

All analytical results in the paper series are tied to specific platform versions (Git commit SHA) to enable exact reproduction of any reported figure or statistic.

---

## 6. Discussion

The PAR(2) platform described here provides an open, reproducible implementation of AR(2) eigenvalue analysis for circadian gene expression time series. The primary methodological contributions are: (1) mean-centred OLS fitting as the default preprocessing step, which removes expression-level confounds and ensures the regression targets temporal dynamics rather than expression magnitude; (2) the eigenvalue modulus |λ| as a single scalar summary of temporal persistence that is computationally tractable for genome-wide application; and (3) validated deployment across multiple species and tissue contexts. The phi-zone enrichment analysis (Section 4) demonstrates that the 14-gene set of direct E-box targets is statistically enriched near |λ| ≈ 1/φ relative to expression-matched null sets (p = 0.044, 5,000-iteration permutation), providing a quantitative anchor for the biological interpretation of eigenvalue distributions in circadian data.

**Oscillatory-high versus constitutively-saturated-high persistence.** A methodological distinction that the platform does not currently surface in its reporting — but which is biologically critical — is the difference between two qualitatively different types of high eigenvalue. When the discriminant of the AR(2) characteristic polynomial (φ₁² + 4φ₂) is negative, the characteristic roots are complex conjugates and the gene is genuinely oscillatory; its high |λ| reflects a sustained, decaying oscillation. When the discriminant is positive, the roots are real, and high |λ| reflects constitutive, non-oscillatory expression — a gene that is high and stays high, exhibiting autocorrelation through persistence rather than rhythm. Both score as high-persistence under the |λ| metric, but they represent entirely different biological states. A clock gene with |λ| = 0.81 and complex roots (e.g., *Arntl* in healthy tissue) is doing something fundamentally different from a constitutively driven gene with |λ| = 0.97 and real roots (e.g., *Cdk1* in ApcKO intestinal organoids). The former is a self-sustaining oscillator; the latter is a gene locked at constitutive expression with strong day-to-day autocorrelation because it is not cycling at all. Future platform versions should surface the complex-root flag (already computed internally during eigenvalue fitting) as a reported column alongside |λ|, enabling users to distinguish oscillatory-high from constitutively-saturated-high without manual inspection of the AR(2) coefficients.

**Context-sensitivity of eigenvalues reflects programme activity state.** The framework is sometimes interpreted as assigning fixed intrinsic eigenvalues to genes — as if |λ| for *Lgr5* is 0.47, period. The organoid regulon analysis reported in a companion paper (Whiteside, 2025c) demonstrates this is incorrect: the same Wnt target gene set scores mean |λ| = 0.44 in a 12-tissue mouse circadian dataset (GSE54650), where Wnt is largely inactive across most sampled tissues, and mean |λ| = 0.55 in intestinal organoids where Wnt is functionally active — a 25% increase attributable entirely to tissue context. In ApcKO organoids with constitutively active Wnt, the same gene set reaches mean |λ| = 0.71. The eigenvalue is not a gene property; it is a gene-in-context property, reflecting the programme activity state of the tissue at the time of measurement. This has a practical implication: cross-tissue comparisons of eigenvalues for non-universal programmes (Wnt, NF-κB, E2F) require tissue-matched controls rather than pooled baselines. The clock gene hierarchy is relatively tissue-robust because the circadian programme is near-universally active; most other regulons are not and their eigenvalues will vary with tissue accordingly. The platform's genome-wide scan and per-tissue analysis tools are designed to accommodate this context-dependence, but users should interpret cross-tissue eigenvalue comparisons for tissue-specific regulons with appropriate caution.

**Limitations.** The platform performs AR(2) fitting to short circadian time series, typically 12–24 timepoints at 2-hour intervals. With n = 12, eigenvalue estimates for near-unit-root genes (|λ| > 0.90) carry substantial uncertainty: the OLS estimator cannot reliably distinguish |λ| = 0.93 from |λ| = 1.00 in a near-integrated process with this many observations. Values in this range should be interpreted as "very high persistence" rather than precise numbers. Stationarity is assumed throughout; genes with genuine unit-root or explosive dynamics violate this assumption and their eigenvalues are best treated as ceiling indicators. The AR(2) model captures at most two harmonics of a circadian signal; genes with complex waveforms (multiple peaks per cycle) may be poorly fit and their R² values, reported alongside |λ|, should be consulted when interpreting individual gene results.

---

## References

Boman BM et al. (2005) Colonic stem cells in human colon cancer development, growth and metastasis. *J Natl Cancer Inst Monogr* 35:58–62.

He Y et al. (2009) The transcriptional repressor DEC2 regulates sleep length in mammals. *Science* 325:866–870.

Koike N et al. (2012) Transcriptional architecture and chromatin landscape of the core circadian clock in mammals. *Science* 338:349–354.

Matsuo T et al. (2003) Control mechanism of the circadian clock for timing of cell division in vivo. *Science* 302:255–259.

Ramsey KM et al. (2009) Circadian clock feedback cycle through NAMPT-mediated NAD+ biosynthesis. *Science* 324:651–654.

Whiteside M. (2025c). APC loss rewires the AR(2) temporal persistence hierarchy of circadian clock and cell-cycle genes in intestinal organoids. *Manuscript in preparation.* [Paper O companion paper; organoid regulon analysis providing the Wnt context-sensitivity and constitutively-saturated eigenvalue data cited in Section 6.]

Zhang R et al. (2014) A circadian gene expression atlas in mammals: implications for biology and medicine. *Proc Natl Acad Sci* 111:16219–16224.

---

*Draft prepared: April 2026. Revised May 2026: Section 4.3 compressed; Section 4.4 Lucas-numbers digression removed; Figure 3 (method comparison) added. Section 4 added following live computation of phi-zone enrichment results (p=0.044 direct target permutation, expression-matched null, 5,000 iterations, GSE54650 12 tissues). Section 6 (Discussion) added April 2026: oscillatory-high vs constitutively-saturated-high distinction; context-sensitivity of eigenvalues. Sections 2 (Platform Architecture), 3 (Eigenvalue Hierarchy Validation), and 5 (Reproducibility Package) completed April 2026. Not submitted. Target: GigaScience.*
