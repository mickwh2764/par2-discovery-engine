# PAR(2) Discovery Engine - Circadian Clock-Target Dynamics Dashboard

## Overview
The PAR(2) Discovery Engine is a statistical platform utilizing AR(2) autoregressive modeling to analyze gene expression time series data. Its core function is to quantify temporal persistence for circadian clock and target genes through the eigenvalue modulus `|λ|`. This project aims to discover and validate patterns in gene expression dynamics related to circadian rhythms, aging, and diseases, facilitating the identification of distinct biological trajectories and potential therapeutic targets. It provides a robust analytical framework for understanding complex biological time-series data and has been used to generate several scientific papers.

## Paper Status (May 2026)
- **Paper A** (Core Methods): NOT in submission. Desk rejected by PLOS ONE (May 20 2026, no external review) and previously by PLOS Computational Biology. Targeting Journal of Biological Rhythms (primary) / Bioinformatics (secondary). v2.4 May 2026: Three amendments from PLOS ONE rejection — (1) Abstract reframed: removes overclaim, now accurately distinguishes rhythmicity detection from temporal persistence measurement; (2) Introduction para 3 rewritten: acknowledges prior JTK_CYCLE/cosinor clock-CCG separation, then precisely states what |λ| adds (self-sustaining dynamics, orthogonal to rhythmicity), with explicit forward reference to head-to-head Figure 9; (3) Cover letter rewritten for JBR. Package zip updated. Preprint on Research Square: https://doi.org/10.21203/rs.3.rs-9283100/v1
- **Paper E** (Phase-Gated PAR(2)): NOT in submission. Desk-rejected by PLOS ONE April 2026. Revision complete. Targeting Journal of Biological Rhythms or Chronobiology International next. Preprint on Research Square.
- **Paper F** (Expression Persistence / No Detectable Half-Life Correlation): NOT in submission. Targeting Genome Biology. Preprint on Research Square: https://doi.org/10.21203/rs.3.rs-9385465/v1. v2 upload in progress. Title revised May 2026: "independence" → "no detectable correlation" to match honest framing in Limitations. Priority future analysis: same-tissue liver-matched half-life comparison — no publicly available genome-wide mouse liver mRNA half-life dataset currently exists; this test cannot yet be performed.
- **Paper G** (Fibonacci Quarterly): IN ACTIVE REVIEW — reply submitted November 2025, currently under review. DO NOT TOUCH under any circumstances.
- **Paper H** (AD Glial Clock Inversion): Draft. Not submitted. Manuscript at manuscripts/paper_h_ad_glial_clock.md. Pre-specified regulon permutation tests complete: core clock p=0.036 (one-tailed), E-box 14 p=0.027 (two-tailed). Supplement zip at public/downloads/PaperH_GlialClockInversion_Supplement.zip. May 2026: Section 3.8 + Discussion 4.5 added — post-hoc Hpgd (15-PGDH) observation prompted by Pieper & Markowitz PNAS 2026: WT Astrocyte |λ|=0.710 (real roots, constitutive, +0.177 above genome median); APP Astrocyte |λ|=0.575 (complex roots, oscillatory), Δ|λ|=−0.135. Real→complex root-type change interpreted as constitutive→oscillatory regime shift in prostaglandin-clearing dynamics, directionally consistent with 15-PGDH neuroinflammation finding. Limitation 7 added (post-hoc); Reference 27 added (Pieper & Markowitz 2026).
- **Paper M** (Methods Platform, GigaScience): Draft. Not submitted. Manuscript at manuscripts/paper_m_gigascience.md. v0.4 May 2026: word count trimmed to ~6,395 words, Figure 3 (method comparison SVG) created. Cover letter at paper-packages/methods-platform/CoverLetter_GigaScience.txt — contact line updated to "[author email — provide before submission]". Remaining blockers: author email, author names/ORCID/funding for manuscript, 3 figure PDFs, bioRxiv preprint.
- **Paper N** (p53 Regulon Temporal Persistence, Cell Death & Differentiation): Draft. Not submitted. Manuscript at manuscripts/paper_n_p53_CDD.md. **v0.4 May 2026** — 15 datasets total: 6 human blood + 4 neuroblastoma (GSE221103 SHEP/SKNAS) + 2 U2OS osteosarcoma (GSE221173, May 2026) + 3 mouse (GSE54650, GSE70499, GSE11923). CORRECTED April 2026: MYC-ON genome=0.525, regulon=0.680, p=0.0037 (significant); MYC-OFF p=0.589 (NOT significant — prior p=0.0024 retracted). NEW May 2026: U2OS independent replication (GSE221173, c-MYC-ER, Rep2, N=25) — MYC-ON regulon=0.725 vs genome=0.579, p=0.021; MYC-OFF p=0.925 (NS). BMAL1-KO mouse liver (GSE70499): gap narrows 57% (WT +0.116 → KO +0.050). Mouse atlas: ONLY Liver confirms PRO < SUR (+0.094); Brainstem indeterminate (−0.013, prior "confirmed" status corrected). GSE11923 1-hour resolution: ordering reverses (caution). GSE113883 excluded post-hoc (anomalous eigenvalues). Package at paper-packages/paper-n-p53-regulon/ — MD synced with canonical, PDF regenerated (150 KB), zip at public/downloads/PaperN_p53_Regulon_Package.zip. Download endpoint: /api/download/paper-n-package.
- **Paper O** (Intestinal Organoid Circadian-Proliferative Hierarchy): Draft. Not submitted. Manuscript at manuscripts/paper_o_organoid.md. **v1.5 May 2026** — Abstract updated (hierarchy collapse mechanism reframed as dual phenomena: continuous persistence shift + categorical regime change from oscillatory to constitutive). Language qualified throughout — "supports", "provisionally", "conceptually consistent". Four new Limitations added: (11) regime conflation (complex-root vs real-root high-|λ|), (12) single-dataset vulnerability, (13) timescale extrapolation beyond 24h window, (14) binomial independence assumption in TCGA concordance. Section 3.3 heading: "Confirms" → "Supports". Conclusions updated to "provisionally establish…candidate model system…pending replication". Gene-selection rationale added to TCGA cross-validation paragraph. PDF regenerated (135 KB). Dataset: GSE157357 (Matsu-ura et al., CMGH 2021, PMID:34534703). Four genotypes: WT, BmalKO, ApcKO, DblKO. Key findings: WT hierarchy gap +0.033 (clock=0.588, target=0.556); ApcKO gap=−0.127 (clock=0.663, target=0.790); ApcKO E2F programme dominant (0.836); TCGA-COAD 10/15 (p=0.151 NS; target 7/8 p=0.035 exploratory, unadjusted); three-layer hierarchy. Targeting Journal of Biological Rhythms (primary) / Chronobiology International (secondary).
- **Paper P** (Temporal Correlation Length): Draft. Not submitted. Package at paper-packages/paper-p-temporal-correlation/. v1.0 May 2026 (14 pages, 234,025 bytes). Reframes |λ| as temporal correlation length ξ — biological analogue of condensed-matter correlation length. G(τ) = |λ|^τ·cos(πτ/T₀); τ_c = −2/ln|λ| (Convention A: per-tissue category mean). Clock τ_c = 3.8h (all 13 datasets), target τ_c = 2.3h, ratio 2× (bootstrap 95% CI [1.46–1.82]), 13/13 tissues (exact binomial p = 1.22e-4), 46.8× 24h residual. Tissue validation: ρ=0.794 (gap vs rhythmic genes), ρ=0.822 (gap vs GR), ρ=0.802 (ratio vs rhythmic), ρ=0.789 (ratio vs GR), p≤0.002. Disease phase diagram: healthy 1.74×, Bmal1-KO 0.99×, APC-KO 0.43× (E2F programme vs clock), DblKO rescue 1.22×. Platform page: /temporal-correlation — fully backend-served, recomputable. Targeting PLOS Computational Biology. Submission blockers: author names/ORCID/funding, bioRxiv preprint.
- **Paper Q** (Central-Peripheral Clock Hierarchy / Light Entrainment): Draft. Not submitted. Manuscript at manuscripts/paper_q_light_entrainment.md. **v1.1 May 2026**: baboon cross-species replication added (pre-specified, GSE98965, 60 tissues, direct SCN measurement). Key finding: Hypothalamus (SCN proxy) has LOWEST mean clock gene |λ|=0.4691; Lung HIGHEST |λ|=0.7966 (1.70× range). Re-entrainment lag ratio Lung/Hyp = 3.33× (τ_c 8.8h vs 2.6h). Replication in GSE11923 liver (48h hourly, mean |λ|=0.735). Baboon replication: SCN |λ|=0.4708 (vs mouse Hyp |λ|=0.4691 — virtually identical across ~30M years evolution); CNS<Peripheral gap p=0.006 (exact enumeration of all C(11,3)=165 label assignments, 1/165 ≥ observed); LUN τc=5.35h vs SCN τc=2.64h (ratio 2.03×); 4/4 pre-specified predictions pass. Supplementary Table S3 (TableS4_Baboon_CrossSpecies_Validation.csv) added to package. Platform page: /light-entrainment — fully backend-served, recomputable. Package: paper-packages/paper-q-light-entrainment/. Targeting Journal of Biological Rhythms. Submission blockers: author names/ORCID/funding, phase-shift validation dataset.

## User Preferences
Preferred communication style: Simple, everyday language. Full transparency on data sources.

## System Architecture

### UI/UX Decisions
The frontend is a React/TypeScript Single Page Application (SPA) built with Vite. It uses Wouter for routing, Tailwind CSS for styling, and Recharts for data visualization. TanStack Query manages data fetching and state.

### Technical Implementations
The core algorithm involves fitting AR(2) models to gene expression time series and calculating `|λ|`. The backend is a Node.js/Express application, using Drizzle ORM for database interactions.

### Feature Specifications
-   **AR(2) Analysis**: Fits AR(2) models and calculates eigenvalue moduli.
-   **Data Validation**: Integrates with NCBI GEO and includes a Data Domain Classifier for uploaded CSVs.
-   **Discovery Engine**: Supports real-time analysis of uploaded CSV data, including half-life metrics and unit circle plots.
-   **ODE Model Zoo**: Validates AR(2) predictions against canonical ODE models.
-   **Reliability Screening**: Provides diagnostics for AR(2) results.
-   **Processed Per-Gene Eigenvalue Tables**: Offers downloadable CSV tables of AR(2) eigenvalue results.
-   **Validation & Benchmarking**: Includes multi-species validation, human circadian disruption validation, genome-wide AR(2) validation, rolling window stability analysis, and comprehensive framework benchmarks against standard time-series methods.
-   **Shareable Analysis Links**: Enables sharing of Discovery Engine analysis results.
-   **Advanced Analysis**: Features Eigenvalue Independence & Downstream Prediction, Cell-Type Persistence Maps, Cross-Context Validation, Root-Space Geometry & φ-Enrichment Analysis, Decomposition Stability Analysis, and Drug Target Overlay for chronotherapy.
-   **Bias Auditing**: Includes automated bias tests (Time-Shuffle Destruction, Irrelevant Metric Correlation, Expression-Matched Null Hierarchy).
-   **Specialized Enrichment & Scoring**: Includes Expression-Matched Null Control, Fibonacci Enrichment Analysis, and a Circadian Health Score.
-   **Comparative & Longitudinal Analysis**: Offers Gene Set Hypothesis Tester, Before/After Trajectory Comparison, and Most Volatile Genes ranking.
-   **Literature & Convergence Mapping**: Features Multi-Dataset Literature Validation, Literature Validation & Falsification, and an interactive Convergence Map.
-   **Reporting**: Provides Export Report and Cross-Page Report Pipeline functionalities.
-   **Genome-Wide Coupling Scan**: Identifies statistical clock coupling for approximately 21,000 genes using AR(2)+exogenous models.
-   **Cross-Metric Independence**: Compares `|λ|` against various biological metrics.
-   **Non-Circadian Validation**: Tests AR(2) persistence hierarchy using non-circadian datasets.
-   **Multi-Tissue Phase Portrait Explorer**: Interactive 24-hour cycle visualization.
-   **Gene Annotation Tooltips**: Provides detailed information on gene function.
-   **Half-Life Independence Replication**: Tests `|λ|`'s independence from mRNA half-life across multiple non-circadian datasets.
-   **Regulatory Core Discovery**: Pathway-agnostic genome-wide scan identifying genes with clock-like dynamics across 12 tissues.
-   **DRMref Multi-Drug Cross-Validation**: Cross-references DRMref scRNA-seq resistance/sensitivity gene lists against AR(2) eigenvalues.
-   **GSE179028 Enteroid Datasets**: Independent replication dataset for LGR5 gating (Mouse and Human subseries).
-   **Method Validation Suite**: Monte Carlo simulation study and head-to-head comparison of AR(2) vs cosinor vs JTK_CYCLE.
-   **Boman-Style Crypt Simulation**: Discrete-time 3-compartment crypt model simulating normal and disease states, with AR(2) fitting.
-   **Reproducibility Package**: Self-contained folder with standalone AR(2) code, datasets, and pre-computed results.
-   **Python Package (par2-circadian v1.0.0)**: Standalone pip-installable Python package for core AR(2) eigenvalue pipeline.
-   **Flagship Consolidated Manuscript**: Comprehensive paper combining the full PAR(2) framework story.
-   **Supplementary Table S9 (AR(1) Benchmark + Rhythm-Matched Coupling)**: AR(1) vs AR(2) comparison and amplitude-matched coupling controls.
-   **Boman ODE Validation Page**: Simulates the 3-compartment crypt ODE system, fits AR(2), and tests Fibonacci-consistency, including sampling-rate sensitivity and AR(2) engine integrity self-tests.
-   **Model Zoo theoretical φ₁ prediction column**: Round-trip validation table measuring oscillation period from ODE simulations and computing theoretical φ₁.
-   **1/φ Enrichment Replication**: Tests the 14-gene E-box target set across four independent datasets with expression-matched permutation.

### System Design Choices
The system prioritizes robust statistical analysis, transparent handling of biological data, and scientific rigor for hypothesis generation and validation in circadian biology.

## External Dependencies

-   **PostgreSQL**: Primary data store.
-   **NCBI GEO**: Source for public gene expression datasets.
-   **React**: Frontend library.
-   **TypeScript**: Programming language.
-   **Vite**: Frontend build tool.
-   **Wouter**: React routing library.
-   **TanStack Query**: Data fetching library.
-   **Tailwind CSS**: CSS framework.
-   **Recharts**: Charting library.
-   **Node.js**: Backend runtime.
-   **Express**: Backend web framework.
-   **Drizzle ORM**: TypeScript ORM.