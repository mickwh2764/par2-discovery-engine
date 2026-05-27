import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Download, ArrowLeft, ArrowRight, BookOpen,
  FlaskConical, Microscope, Brain, Dna, Clock, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Info, Eye
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PAPER_TO_PAGES } from "@/components/PaperCrossLinks";

interface PaperConfig {
  id: string;
  letter: string;
  endpoint: string;
  title: string;
  subtitle: string;
  status: 'draft' | 'target' | 'submitted' | 'under-review' | 'archive';
  statusLabel: string;
  preprintUrl?: string;
  version: string;
  lastUpdated: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  abstract: string;
  keyNumbers: { label: string; value: string }[];
  contents: string[];
}

const PRIMARY_PAPERS: PaperConfig[] = [
  {
    id: "methods-platform",
    letter: "M",
    endpoint: "/api/download/methods-platform-package",
    title: "PAR(2) Platform: Methods & Architecture",
    subtitle: "From a Fibonacci cell division hypothesis to a research-grade computational platform for circadian gene expression analysis",
    status: "archive",
    statusLabel: "",
    version: "0.4",
    lastUpdated: "2026-05-10",
    icon: <FlaskConical className="w-6 h-6" />,
    accentColor: "text-teal-400",
    borderColor: "border-teal-500/50",
    bgColor: "bg-teal-600/20",
    abstract: "Describes the conceptual origin, architecture, and development methodology of the PAR(2) Discovery Engine. The platform traces to a June 2025 hypothesis about Fibonacci timing in cell division: that circadian gating of asymmetric division cycles produces population growth dynamics converging toward the golden ratio (Φ ≈ 1.618) under healthy conditions, with deviations serving as markers of dysfunction. This biological question — how to measure temporal memory in a regulated time series — motivated the October 2025 formalisation of the AR(2) persistence framework. Covers the mathematical derivation of |λ| from the AR(2) characteristic equation, the modular platform architecture (React/TypeScript frontend, Node.js/Express backend, PostgreSQL, Drizzle ORM), and the AI-assisted development methodology. Includes validation infrastructure (ODE zoo, three-layer bias auditing, Monte Carlo simulation), dataset coverage (64 datasets, 5 species), and output metrics. Section 6 (Discussion) added April 2026: (1) oscillatory-high vs constitutively-saturated-high distinction — AR(2) discriminant (φ₁² + 4φ₂) determines whether high |λ| reflects genuine rhythm or constitutive persistence; (2) context-sensitivity of eigenvalues — Wnt target gene means vary 0.44 → 0.55 → 0.71 from inactive to active to constitutive Wnt contexts, demonstrating that |λ| is a gene-in-context property rather than a fixed gene constant; (3) near-unit-root precision limitations with n = 12 timepoints.",
    keyNumbers: [
      { label: "Platform size", value: "68 modules, 64 datasets" },
      { label: "Species covered", value: "5 (mouse, human, baboon, Arabidopsis, yeast)" },
      { label: "Development period", value: "Jun 2025 – Apr 2026" },
      { label: "Outputs", value: "6 manuscripts, 2 preprints" },
    ],
    contents: [
      "PAR2_Methods_Platform_Paper.pdf — Compiled PDF (v0.4, May 2026 — regenerated from .md source)",
      "PAR2_Methods_Platform_Paper.md — Manuscript source (Markdown, v0.4, authoritative)",
      "PAR2_Methods_Platform_Paper.tex — LaTeX source (v0.1 base — .md is current)",
      "Figure_1_Architecture.svg — Platform architecture diagram (SVG, vector)",
      "Figure_2_Validation_Summary.svg — Multi-species validation summary (SVG, vector)",
      "Figure_3_Method_Comparison.svg — AR(2) vs cosinor vs JTK_CYCLE comparison (SVG, vector)",
      "LITERATURE_SUPPORT.pdf — Independent literature evidence for all key claims",
      "LITERATURE_SUPPORT.md — Literature support source (Markdown)",
      "CoverLetter_GigaScience.txt — Cover letter for GigaScience",
      "references.bib — Bibliography",
      "README.md — Package guide and submission checklist",
    ],
  },
  {
    id: "paper-a",
    letter: "A",
    endpoint: "/api/download/paper-a-package",
    title: "AR(2) Eigenvalue Hierarchy",
    subtitle: "A blind metric recovers a three-layer dynamical hierarchy in mammalian gene expression",
    status: "archive",
    statusLabel: "",
    preprintUrl: "https://doi.org/10.21203/rs.3.rs-9283100/v1",
    version: "2.3",
    lastUpdated: "2026-05-07",
    icon: <Brain className="w-6 h-6" />,
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-500/50",
    bgColor: "bg-cyan-600/20",
    abstract: "Demonstrates that eigenvalue modulus |λ| from AR(2) regression, fitted without any prior knowledge of gene class, recovers a three-layer hierarchy — clock genes score highest, cancer-relevant targets intermediate, and the genome-wide background lowest — across 13 independent datasets and 4 species. The hierarchy survives 11 robustness checks including bootstrap resampling, permutation testing, rolling-window stability analysis, and ODE round-trip validation. Median clock gene |λ| = 0.647; p < 0.001 against permuted null.",
    keyNumbers: [
      { label: "Datasets", value: "13, across 4 species" },
      { label: "Genes tested", value: "20,955 genome-wide" },
      { label: "Clock median |λ|", value: "0.647 (p < 0.001)" },
      { label: "Robustness checks", value: "11 independent tests" },
    ],
    contents: [
      "Paper_A_Core_Methods.pdf — Compiled manuscript PDF (v2.3, May 2026)",
      "Paper_A_Core_Methods.tex — LaTeX source (requires: amsmath, natbib, hyperref, booktabs, graphicx, lineno)",
      "cover_letter.tex / cover_letter.pdf — Cover letter for PLOS ONE",
      "references.bib — Full bibliography (46 references)",
      "Paper_A_Submission_Package.zip — Self-contained reproducibility bundle",
      "Supplementary_Table_S1_Dataset_Summaries.csv — Per-dataset summary: clock/target means, hierarchy gap (13 datasets)",
      "Supplementary_Table_S1b_Per_Gene_Eigenvalues.csv — Per-gene |λ|, R², confidence, ADF stationarity (455 entries)",
      "Supplementary_Table_S2_ODE_Validation.csv — ODE round-trip φ₁ validation (6 models, 11 variables; 9/11 pass)",
      "Supplementary_Table_S3_Literature_Validation.csv — 59 curated circadian genes, 21 datasets (98.3% recovery)",
      "Supplementary_Table_S4_Falsification_Test.csv — Arntl vs housekeeping vs random coupling (~180× enrichment)",
      "Supplementary_Table_S5_NonCircadian_Validation.csv — GSE59784 immune response fast vs sustained hierarchy",
      "Supplementary_Table_S6_Monte_Carlo.csv — Monte Carlo simulation study (150 scenarios)",
      "Supplementary_Table_S7_Method_Comparison.csv — Head-to-head vs cosinor and JTK_CYCLE",
      "Figure_1_Method_Schematic.pdf / .png — AR(2) fitting, eigenvalue extraction, unit circle plot",
      "Figure_2_Eigenvalue_Hierarchy.pdf / .png — Bar chart + heatmap across 12 mouse tissues",
      "Figure_3_ODE_Validation.pdf / .png — AR(2) vs Jacobian eigenvalues; round-trip φ₁ table",
      "Figure_4_Robustness_Suite.pdf / .png — Sub-sampling, bootstrap, permutation, leave-one-out",
      "Figure_5_Bmal1_Knockout.pdf / .png — WT vs Bmal1-KO eigenvalue distributions (GSE70499)",
      "Figure_6_Literature_Falsification.pdf / .png — Pathway recovery rates + Arntl enrichment",
      "Figure_7_Bias_NonCircadian.pdf / .png — Time-shuffle destruction + immune hierarchy (GSE59784)",
      "Figure_8_Monte_Carlo.pdf / .png — Monte Carlo power and sample-size analysis",
      "Figure_9_Head_to_Head.pdf / .png — AR(2) vs cosinor vs JTK_CYCLE benchmark panel",
      "dataset_summaries.json — Per-dataset eigenvalue summaries (structured)",
      "multi_species_validation.json — Cross-species hierarchy preservation (4 species)",
      "robustness_suite.json — 12-analysis robustness suite results (structured)",
      "ode_model_validation.json — ODE Model Zoo round-trip validation (structured)",
      "README.md — Package guide, key results, data sources, submission checklist",
    ],
  },
  {
    id: "paper-e",
    letter: "E",
    endpoint: "/api/download/paper-e-package",
    title: "Dynamical Clock–Target Coupling Across Mammalian Tissues",
    subtitle: "Phase-varying AR(2) framework with stability constraints maps tissue-specific circadian gating architectures",
    status: "archive",
    statusLabel: "",
    preprintUrl: "https://doi.org/10.21203/rs.3.rs-9214347/v1",
    version: "4.0",
    lastUpdated: "2026-05-07",
    icon: <Dna className="w-6 h-6" />,
    accentColor: "text-pink-400",
    borderColor: "border-pink-500/50",
    bgColor: "bg-pink-600/20",
    abstract: "Introduces stability-constrained phase-dependent AR(2) (PAR(2)) where autoregressive coefficients vary smoothly over circadian phase via sinusoidal Fourier expansion. Applied to 28,138 clock-target pairs across liver, heart, cerebellum, and intestinal organoids (22 public datasets), PAR(2) recovers tissue-specific gating architectures: Wee1-centred in liver (Tier 0, FDR-significant in GSE54650 and GSE11923), Tead1/YAP1-linked in heart (directionality caveat: Abenza et al. 2023 show YAP acts upstream of clock — coupling is real but bidirectional), Cdk1-centred in cerebellum. A formal mathematical proof shows PAR(2) coupling information (phase-varying coefficients β₁, β₂) is structurally absent from cross-correlation and cosinor phase-difference metrics; simulation confirms 98.5% PAR(2) power vs 8.5%/1.7% for cross-correlation/cosinor on phase-concentrated couplings. In GSE157357 intestinal organoids (corrected analysis: 12 unique timepoints, replicate-averaged), APC and Bmal1 knockouts each collapse the eigenvalue hierarchy via opposite mechanisms — ApcKO elevates targets (gap −0.024), BmalKO suppresses clock genes — and the double mutant paradoxically partially restores the gap (+0.043). Pre-correction values (+0.347 WT, +0.107 DblKO) are retracted.",
    keyNumbers: [
      { label: "Clock-target pairs", value: "28,138 tested" },
      { label: "PAR(2) power (phase-concentrated)", value: "98.5% vs 8.5% cross-corr" },
      { label: "Wee1 liver coupling", value: "Tier 0 — 2 datasets + 2 tissues" },
      { label: "Organoid WT gap (corrected)", value: "+0.073 (retracted: +0.347)" },
    ],
    contents: [
      "Paper_E_Phase_Gated_PAR2.pdf — Compiled manuscript PDF (v4.0, May 2026)",
      "Paper_E_Phase_Gated_PAR2.tex — LaTeX source",
      "Paper_E_Phase_Gated_PAR2_PLOSONE.docx — Word document (PLOS ONE submission format)",
      "CoverLetter_Target_Journal.txt — Current cover letter (target journal, v4.0)",
      "cover_letter_PONE-D-26-14164.txt — PLOS ONE submission cover letter (desk-rejected Apr 2026)",
      "cover_letter.tex / cover_letter.pdf — Original cover letter (archived)",
      "references.bib — Full bibliography (35+ references)",
      "Figure_1_PAR2_Schematic.pdf / .png — PAR(2) phase-dependent coupling schematic",
      "Figure_2_Cross_Tissue_Coupling.pdf / .png — Cross-tissue significant coupling, 3 tissue modules",
      "Figure_3_Organoid_Perturbation.pdf / .png — Organoid hierarchy gap panels (corrected 12-timepoint values)",
      "Supplementary_Fig_S5_PAR2_Benchmark.pdf / .png — Power comparison: PAR(2) vs cross-correlation vs cosinor",
      "Simulation_par2_benchmark_simulation.py — Monte Carlo power analysis code",
      "Simulation_par2_realdata_benchmark.py — Real-data benchmark (5 validated pairs)",
      "Simulation_simulation_results.csv — Monte Carlo results data",
      "Simulation_realdata_benchmark_results.json — Real-data benchmark results (JSON)",
      "Simulation_null_fpr_results.txt — False positive rate analysis",
      "cross_tissue_gating.json — Cross-tissue gating module data",
      "phase_dependent_coefficients.json — Phase-dependent AR(2) coefficients",
      "Supplementary_Table_S1_Tissue_Gating_Modules.csv — Cross-tissue gating architecture summary",
      "Supplementary_Table_S2_Golden_Ratio_Enrichment.csv — Golden-ratio-like eigenstructure enrichment by tissue",
      "Supplementary_Table_S3_Tiered_Hits.csv — Tiered discovery results (Tier 0/1/2) across tissues",
      "Supplementary_Table_S4a_Gating_Analysis.csv — PAR(2) gating counts by genotype (Section A) — clean data only",
      "Supplementary_Table_S4b_Hierarchy_Gap.csv — Eigenvalue hierarchy gap by condition; corrected May 2026 values (Section B) — clean data only",
      "Supplementary_Table_S4c_Pairwise_Comparisons.csv — Pairwise perturbation comparisons (Section C) — clean data only",
      "Supplementary_Table_S4d_Key_Gene_Trajectories.csv — Key gene four-condition trajectories (Section D) — clean data only",
      "Supplementary_Table_S4_Notes.md — Full correction history, retracted values, and methodology notes for S4",
      "README.md — Package guide, key numbers, correction log",
    ],
  },
  {
    id: "paper-h",
    letter: "H",
    endpoint: "/api/download/paper-h-package",
    title: "Asymmetric Clock Inversion in Alzheimer's Pathology",
    subtitle: "AR(2) eigenvalue analysis reveals selective collapse of the feedback arm alongside output-limb gain in APP astrocytes",
    status: "archive",
    statusLabel: "",
    version: "0.3",
    lastUpdated: "2026-05-10",
    icon: <Brain className="w-6 h-6" />,
    accentColor: "text-orange-400",
    borderColor: "border-orange-500/50",
    bgColor: "bg-orange-600/20",
    abstract: "Applies AR(2) eigenvalue modulus |λ| to single-cell translatome data from mouse cortex (GSE261698; Sheehan et al., Nature Neuroscience 2025) to ask whether APP amyloid pathology uniformly suppresses the circadian clock or selectively disrupts specific architectural components. In the APP model, four components show sharp selective collapse: Cry2 (Δ|λ|=−0.421), Per1 (−0.371), Clock (−0.371), Per2 (−0.272). Simultaneously, Dbp (+0.174), Tef (+0.189), and Per3 (+0.256) gain persistence. The genome-wide median shift is only −0.019, confirming the inversion is specific to clock architecture. Two falsification tests pass: time-shuffle destruction (Z=2.93, p=0.0017) and expression-matched null (Z=2.99, p=0.0015), computed across 13,803 genome-wide gene pairs. One open falsification remains: aging specificity (does normal aging produce the same inversion?).",
    keyNumbers: [
      { label: "Dataset", value: "GSE261698 (Sheehan 2025)" },
      { label: "Per1 Δ|λ| (APP vs WT)", value: "−0.371" },
      { label: "Time-shuffle test", value: "p=0.0017 ✓" },
      { label: "Expression-matched null", value: "p=0.0015 ✓" },
    ],
    contents: [
      "Paper_AD_Glial_Clock_Inversion.pdf — Compiled manuscript PDF (v0.2, May 2026 — incl. Hpgd §3.8 + Discussion 4.5)",
      "Paper_AD_Glial_Clock_Inversion.tex — LaTeX source (v0.2)",
      "references.bib — Bibliography",
      "cover_letter_JBR.txt — Draft cover letter for Journal of Biological Rhythms",
      "README.md — Data sources, key numbers, falsification test plan",
    ],
  },
  {
    id: "paper-n",
    letter: "N",
    endpoint: "/api/download/paper-n-package",
    title: "p53 Regulon Temporal Persistence",
    subtitle: "Pro-apoptotic/survival eigenvalue ordering in healthy human blood is disrupted by sleep restriction and MYC-driven oncogenesis",
    status: "archive",
    statusLabel: "",
    version: "0.4",
    lastUpdated: "2026-05-15",
    icon: <Dna className="w-6 h-6" />,
    accentColor: "text-violet-400",
    borderColor: "border-violet-500/50",
    bgColor: "bg-violet-600/20",
    abstract: "Applies AR(2) eigenvalue analysis to a 21-gene p53 regulon across 15 datasets spanning healthy human blood, three circadian disruption paradigms, two neuroblastoma states (GSE221103, N-MYCN-ER system), and independent replication in U2OS osteosarcoma (GSE221173, c-MYC-ER, May 2026). In healthy blood with intact circadian architecture, pro-apoptotic genes (BAX, BBC3, PMAIP1, FAS, APAF1, CASP6, PERP, TNFRSF10B) show consistently lower temporal persistence than survival genes (BCL2, BCL2L1, MCL1, BIRC5, XIAP) — median |λ| 0.330 vs 0.399 in Blood Circadian, 0.701 vs 0.815 in Sufficient Sleep. This ordering is reversed under sleep restriction (0.679 > 0.630) and in Nurses Night Shift (0.636 > 0.572). In MYC-ON neuroblastoma, p53 regulon temporal persistence is significantly elevated above the genome background (regulon median |λ| = 0.680, genome = 0.525, Mann-Whitney p = 0.0037; CORRECTED — prior p=0.0004 retracted). MYC-OFF is not significant (p = 0.589; prior p=0.0024 retracted). NEW v0.3 (May 2026): Independent replication in U2OS osteosarcoma (GSE221173, c-MYC-ER, Rep2, N=25, 2-hour resolution) — MYC-ON regulon mean |λ| = 0.725 vs genome 0.579, permutation p = 0.021; MYC-OFF non-significant (p = 0.925). Oscillatory fraction collapses 49.3% → 23.7% under MYC-ON. Clock asymmetry: ARNTL/CLOCK constitutively elevated; NR1D1/NR1D2/PER1 suppressed. Cross-species validation in mouse liver (GSE54650, N=24): only Liver confirms PRO < SUR (gap +0.094); brainstem is indeterminate; heart, lung, kidney reversed. BMAL1-KO mouse liver (GSE70499): gap narrows 57% (WT +0.116 → KO +0.050). NEW v0.4 (May 2026): Discussion 4.3 extended with mechanistic convergence paragraph — Fuhr, Relógio et al. (2022) show BAX, TNFRSF10B, and TP53 undergo differential alternative splicing under BMAL1/REV-ERBα/PER2 knockout in HCT116 colorectal cancer cells, with 'Resisting Cell Death' the dominant affected hallmark (96–143 events per KO). Clock disruption reshapes p53 regulon output at both transcriptional and post-transcriptional levels simultaneously.",
    keyNumbers: [
      { label: "Datasets total", value: "15 (6 blood + 4 neuroblastoma + 2 U2OS + 3 mouse)" },
      { label: "MYC-ON neuroblastoma (corrected)", value: "p = 0.0037; prior p=0.0004 retracted" },
      { label: "U2OS replication (May 2026)", value: "p = 0.021; MYC-OFF p = 0.925 (NS)" },
      { label: "BMAL1-KO gap narrowing", value: "57% (WT +0.116 → KO +0.050, mouse liver)" },
      { label: "v0.4 AS convergence (Fuhr/Relogio 2022)", value: "BAX, TNFRSF10B, TP53 — spliced under clock KO in HCT116" },
    ],
    contents: [
      "PaperN_p53_Regulon_Draft.pdf — Manuscript PDF (v0.4, regenerated May 2026 from canonical source)",
      "PaperN_p53_Regulon_Draft.md — Markdown source (v0.4, May 2026 — canonical, 521 lines)",
      "CoverLetter_CDD.pdf — Cover letter (Cell Death & Differentiation)",
      "FigureLegends.pdf — Figure legends with full methodological footnotes",
      "Figure1_BloodDatasets_GroupMedians.png — Group median |λ| across 6 blood datasets",
      "Figure2_MYC_ON_vs_OFF_PerGene.png — Per-gene |λ|: MYC-ON vs MYC-OFF neuroblastoma",
      "Figure3_TP53_Trajectory.png — TP53 |λ| trajectory across all 8 conditions",
      "Figure4_MouseAtlas_TissueOrdering.png — PRO vs SUR ordering, 5 mouse tissues (GSE54650, N=24)",
      "TableS1_PerGene_Eigenvalues.csv — Per-gene |λ| across 10 datasets — clean data only (column header + data rows)",
      "TableS1_Notes.md — Methodology notes, dataset descriptions, and coding conventions for TableS1",
      "generate_figures.py — Python reproducibility script for all 4 figures",
      "README.md — Package guide, key numbers, all datasets, corrections log (v0.4, May 2026)",
    ],
  },
  {
    id: "paper-o",
    letter: "O",
    endpoint: "/api/download/paper-o-package",
    title: "Intestinal Organoid Circadian-Proliferative Hierarchy",
    subtitle: "APC Loss Collapses the Circadian Clock–Cell Cycle Temporal Hierarchy in Intestinal Organoids: An AR(2) Eigenvalue Study",
    status: "archive",
    statusLabel: "",
    version: "1.4",
    lastUpdated: "2026-05-08",
    icon: <Dna className="w-6 h-6" />,
    accentColor: "text-lime-400",
    borderColor: "border-lime-500/50",
    bgColor: "bg-lime-600/20",
    abstract: "v1.5 May 2026 — Applies AR(2) autoregressive eigenvalue analysis to replicate-averaged, chronologically-ordered circadian RNA-seq data from mouse intestinal organoids across four genotypes (WT, BmalKO, ApcKO, DblKO) from GSE157357. In WT organoids, clock mean |λ| = 0.601, target mean = 0.527 (gap +0.073). ApcKO collapses the gap (−0.024) via target elevation (+0.138 mean Δ); formal gene-set gap tests not significant. Hierarchy collapse involves both a continuous shift in persistence and a categorical regime change (complex-root oscillatory → real-root constitutive). Programme-level regulon analysis: WT hierarchy Clock (0.588) > Wnt (0.552) > NF-κB (0.520) > E2F (0.512); ApcKO E2F dominant (0.836) — highest-scoring programme, permutation significance pending. NF-κB drops (0.416). DblKO restores WT ordering. Independent replication in GSE179028 — all three pre-specified directional predictions confirmed (Wnt 0.782 > E2F 0.645 > Clock 0.504 > NF-κB 0.411). TCGA-COAD: target 7/8 (p = 0.035, one-tailed, unadjusted, exploratory — binomial independence assumed); overall 10/15 (p = 0.151, ns). NEW v1.5: Qualified language throughout — 'supports', 'provisionally', 'conceptually consistent'. Four new limitations: (11) regime conflation (oscillatory vs constitutive high-|λ|), (12) single-dataset vulnerability (GSE157357 only), (13) timescale extrapolation beyond 24h window, (14) binomial independence assumption. Conclusions updated: 'provisionally establish' with explicit single-dataset qualifier. Bootstrap CIs and permutation p-values for all four hierarchy gaps — none individually significant (best: ApcKO p = 0.122). Three-layer temporal hierarchy (Cell Identity > Clock > Proliferation). Targeting Journal of Biological Rhythms.",
    keyNumbers: [
      { label: "WT hierarchy gap", value: "+0.073 (clock 0.601 vs target 0.527) — CORRECTED" },
      { label: "ApcKO E2F programme", value: "0.836 mean |λ| — inverts hierarchy; rescued to 0.517 in DblKO" },
      { label: "ApcKO gap bootstrap", value: "−0.127, 95% CI [−0.280, +0.036], permutation p = 0.122" },
      { label: "Wee1 WT → ApcKO", value: "0.655 → 0.877 (+0.222) — clock-driven to constitutive" },
    ],
    contents: [
      "PaperO_Organoid_Circadian_Hierarchy.pdf — Compiled manuscript PDF (v1.5, May 2026 — 135 KB, includes all 5 figures with legends)",
      "PaperO_Organoid_Circadian_Hierarchy.md — Manuscript source (Markdown, v1.5)",
      "LITERATURE_SUPPORT.pdf — Independent literature evidence for all key claims (8 sources, refs 19–26)",
      "LITERATURE_SUPPORT.md — Literature support source (Markdown)",
      "CoverLetter_JBR.txt — Cover letter for Journal of Biological Rhythms",
      "TableS1_Condition_Summaries.csv — Condition-level eigenvalue summaries (4 genotypes) — clean data only",
      "TableS2_PerGene_AllConditions.csv — Per-gene |λ| across all 4 conditions — clean data only",
      "TableS3_TCGA_Concordance.csv — 15-gene TCGA-COAD cross-validation — clean data only (10/15 p=0.151; target 7/8 p=0.035)",
      "TableS4_ThreeLayer_Hierarchy.csv — Three-layer temporal hierarchy — clean data only",
      "TableS5_Condition_Mechanism_Summary.csv — Mechanistic decomposition per condition — clean data only",
      "Supplementary_Notes.md — Methodology notes, full correction history, and interpretation for all tables",
      "TableS6_PerGene_Eigenvalues_R2_Uncapped.csv — Per-gene |λ| (capped + raw), R², root type, all 4 conditions (NEW v1.4)",
      "Figure1_HierarchyGap_FourConditions.svg — Figure 1: Four-condition clock–target hierarchy gap bar chart with bootstrap CIs",
      "Figure2_ThreeLayer_Hierarchy.svg — Figure 2: Three-layer temporal persistence hierarchy (Cell Identity > Clock > Proliferation)",
      "FigureS1_Gene_Trajectories.svg — Supplementary Figure S1: AR(2) eigenvalue trajectories for 10 key genes across four genotypes",
      "FigureS2_Programme_Level_Regulon.svg — Supplementary Figure S2: Programme-level regulon analysis (4 programmes × 4 conditions)",
      "FigureS3_Algebraic_Bridge.svg — Supplementary Figure S3: Algebraic bridge schematic — Boman q² + q − 1 = 0 and PAR(2)",
      "README.md — Package guide: key numbers, bootstrap results, data sources, methods summary",
    ],
  },
  {
    id: "paper-p",
    letter: "P",
    endpoint: "/api/download/paper-p-package",
    title: "Temporal Correlation Length of Gene Expression",
    subtitle: "|λ| as the biological analogue of ξ in condensed matter physics: a two-point autocorrelation framework for circadian dynamics",
    status: "archive",
    statusLabel: "",
    version: "1.2",
    lastUpdated: "2026-05-07",
    icon: <Dna className="w-6 h-6" />,
    accentColor: "text-teal-400",
    borderColor: "border-teal-500/50",
    bgColor: "bg-teal-600/20",
    abstract: "Reframes the AR(2) eigenvalue modulus |λ| as a temporal analogue of the correlation length ξ in condensed matter physics. τ_c = −Δt/ln|λ| (in biological hours) aggregates regulatory-network feedback dynamics and intrinsic mRNA decay kinetics into a single persistence timescale. Across 169 oscillatory clock-gene measurements and 286 oscillatory target-gene measurements, mean τ_c = 3.9 h for clock genes and 2.0 h for target genes (ratio 2.0×, 95% bootstrap CI [1.6, 2.4]; p = 0.000122, 13/13 concordant tissue samples within the GSE54650 and GSE48113 cohorts — interpreted as within-cohort consistency, not cross-study universality). The 24-hour residual G(24) is 18.5× higher for clock than target genes. Covariate associations: rhythmic gene count (ρ = 0.802, p = 0.002) and GR expression (ρ = 0.789, p = 0.002; both interpreted as supportive rather than independent validation). Condition map: healthy liver (1.74×, GSE54650) → Bmal1-KO regime boundary (0.99×, within GSE70499) → APC-KO organoids (0.43×, inverted when targets are E2F/cell-cycle, within GSE157357) → DblKO rescue (1.22×); within each source system the direction is internally consistent; cross-system concatenation requires system-matched replication. REVISED v1.2 May 2026 (second Q.E.D. review): (1) τ_c framed as 'temporal analogue' rather than 'exact biological analogue'; (2) transcript-stability confound limitation added — Paper F (companion paper in this series) already shows genome-wide |λ| independence from half-life (|ρ| < 0.1 across all tested datasets), substantially weakening the confound; residual concern is category-level half-life differences in circadian contexts (planned future SLAM-seq test); Bmal1-KO collapse to 0.99× also provides indirect evidence; (3) cross-system heterogeneity in regime diagram explicitly acknowledged; (4) AR(2) model adequacy section added (Ljung–Box, AIC/BIC); (5) ω-independence of τ_c clarified; (6) covariate language updated to 'supportive rather than independent validation'; (7) oncogenic-disruption scoped to APC-driven Wnt activation throughout. Seven limitations now explicitly acknowledged.",
    keyNumbers: [
      { label: "Clock τ_c (avg)", value: "3.9 h (13/13 healthy tissues, within-cohort)" },
      { label: "Target τ_c (avg)", value: "2.0 h (ratio 2.0×, CI [1.6, 2.4])" },
      { label: "24-h G(24) residual", value: "18.5× clock > target" },
      { label: "APC-KO ratio", value: "0.43× (inverted when targets = E2F/cell-cycle)" },
    ],
    contents: [
      "Paper_P_Temporal_Correlation.tex — LaTeX source",
      "Paper_P_Temporal_Correlation.pdf — Compiled manuscript (14 pages)",
      "cover_letter.tex / cover_letter.pdf — PLOS Computational Biology cover letter",
      "references.bib — 20 bibliography entries (natbib/plainnat)",
      "Supplementary_Table_S1_PerTissue_TauC.csv — Per-tissue τ_c for 13 datasets — clean data only",
      "Supplementary_Table_S2_Test2_Covariates.csv — Tissue gap vs rhythmic gene count & GR — clean data only",
      "Supplementary_Table_S3_Disease_Phase_Diagram.csv — Disease phase diagram (6 conditions) — clean data only",
      "Supplementary_Table_S4_AutocorrelationFunction.csv — G(τ) values for 13 time lags — clean data only",
      "Supplementary_Notes.md — All methodology notes, convention explanations, and statistical summaries for S1–S4",
      "README.md — Package guide, key numbers, submission checklist",
    ],
  },
  {
    id: "paper-q",
    letter: "Q",
    endpoint: "/api/download/paper-q-package",
    title: "Central-Peripheral Clock Hierarchy",
    subtitle: "AR(2) eigenvalue gradient across 12 mouse tissues reveals SCN as rapid oscillator and peripheral tissues as sustained integrators",
    status: "archive",
    statusLabel: "",
    version: "1.1",
    lastUpdated: "2026-05-10",
    icon: <Clock className="w-6 h-6" />,
    accentColor: "text-yellow-400",
    borderColor: "border-yellow-500/50",
    bgColor: "bg-yellow-600/20",
    abstract: "Applies AR(2) eigenvalue modulus |λ| to 16 circadian clock genes across 12 mouse tissues from GSE54650 (Hogenesch / Lahens lab, n=288 samples, 2h circadian time intervals) to test whether the known central-peripheral clock hierarchy is encoded in temporal persistence. Contrary to the intuition that the master circadian pacemaker should have the highest clock gene expression dynamics, the hypothalamus — which contains the suprachiasmatic nucleus (SCN) — shows the LOWEST mean clock gene temporal persistence of all 12 tissues (|λ|=0.469). The lung has the highest persistence (|λ|=0.797), with a 1.70× tissue range. Translated into temporal correlation lengths (τ_c = −Δt/ln|λ|), the hypothalamus has τ_c=3.1h and the lung τ_c=8.8h, giving a peripheral/central re-entrainment lag ratio of 2.84×. This quantitatively predicts the well-documented multi-day delay of peripheral clocks after jet lag. Finding replicated in independent dataset GSE11923 (liver, 48h hourly, n=48; mean |λ|=0.735). Interpretation: the SCN is an architectural rapid-adaptor optimised for phase detection and reset; peripheral tissues are sustained temporal integrators that resist perturbation, producing the clinically observed peripheral re-entrainment delay. v1.1 — Cross-species replication in baboon (GSE98965, Mure et al. 2018; 60 tissues, 16 clock gene orthologues, DIRECT SCN measurement): 3/4 pre-specified predictions pass. Baboon SCN |λ|=0.4708 — virtually identical to mouse hypothalamus |λ|=0.4690 (Δ=+0.0018) across ~30 million years of mammalian divergence. CNS < Peripheral group gap statistically significant (p=0.022, permutation, 10,000 iterations). SCN–Lung τc ratio 2.07× in baboon vs 2.84× in mouse — directionally concordant.",
    keyNumbers: [
      { label: "Hypothalamus mean |λ|", value: "0.469 (lowest of 12 tissues)" },
      { label: "Lung mean |λ|", value: "0.797 (highest of 12 tissues)" },
      { label: "Re-entrainment lag ratio", value: "2.84× (Lung 8.8h vs Hyp 3.1h τ_c)" },
      { label: "Replication (GSE11923)", value: "Liver |λ|=0.735 (48h hourly)" },
      { label: "Baboon SCN |λ| (direct, v1.1)", value: "0.4708 ≈ Mouse Hyp 0.4690 (Δ=0.0018)" },
      { label: "Baboon Lung/SCN τc ratio", value: "2.07× (5.48h vs 2.65h)" },
      { label: "Cross-species replication", value: "3/4 predictions pass; CNS<Per p=0.022" },
    ],
    contents: [
      "PaperQ_LightEntrainment_Manuscript.md — Full manuscript source (~7,500 words, v1.1 May 2026)",
      "PaperQ_LightEntrainment_Manuscript.pdf — Typeset PDF version",
      "Supplementary_Materials.md — All supplementary tables, figure captions & methods notes",
      "Supplementary_Materials.pdf — PDF version of supplementary",
      "TableS1_Tissue_Summary_TauC.csv — 12-tissue mean |λ|, τ_c and lag ratio (S1)",
      "TableS2_PerGene_FocalTissues.csv — 16 genes × 4 tissues with R² and root type (S2)",
      "TableS3_GSE11923_Liver_Eigenvalues.csv — All 16 genes, GSE11923 replication (S3)",
      "TableS4_Baboon_CrossSpecies_Validation.csv — 60-tissue baboon AR(2), 16 clock genes, pre-specified (S4 NEW v1.1)",
      "CoverLetter_JBR.txt — Cover letter shell for Journal of Biological Rhythms",
      "README.md — Package guide: key numbers, datasets, submission blockers",
    ],
  },
  {
    id: "paper-f",
    letter: "F",
    endpoint: "/api/download/paper-f-package",
    title: "Half-Life Independence",
    subtitle: "AR(2) eigenvalue |λ| shows no detectable correlation with intrinsic mRNA half-life across non-circadian datasets",
    status: "archive",
    statusLabel: "",
    preprintUrl: "https://doi.org/10.21203/rs.3.rs-9385465/v1",
    version: "2.1",
    lastUpdated: "2026-04-14",
    icon: <Microscope className="w-6 h-6" />,
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/50",
    bgColor: "bg-emerald-600/20",
    abstract: "Shows no detectable correlation between AR(2) eigenvalue |λ| and intrinsic mRNA half-life (Spearman ρ = 0.006, n = 5,945 genes, p = 0.63, R² < 0.0001), consistent with |λ| capturing regulatory dynamics rather than biochemical decay rate. Cross-validated in four non-circadian datasets (immune response, yeast metabolic cycle, Drosophila development, human influenza). Key example: IFIT1 has a 31-minute mRNA half-life yet |λ| = 0.72, explained by sustained interferon-driven retranscription. Three automated bias audits confirm the null result holds after matching for expression level, shuffling time coordinates, and correlating against irrelevant metrics. Note: cross-tissue half-life proxies limit the precision of the inference; a same-tissue liver-matched comparison would provide a more sensitive test, but no publicly available genome-wide mouse liver half-life dataset currently exists — this is the identified priority future analysis pending such data.",
    keyNumbers: [
      { label: "Spearman ρ (half-life)", value: "0.006 (p = 0.63)" },
      { label: "Genes tested", value: "5,945" },
      { label: "Cross-validation sets", value: "4 non-circadian datasets" },
      { label: "Bias audits", value: "3 automated tests" },
    ],
    contents: [
      "Paper_F_Expression_Persistence.pdf — Compiled manuscript PDF",
      "Paper_F_Expression_Persistence.tex — LaTeX source",
      "cover_letter.tex — Cover letter for Genome Biology",
      "Supplementary_Table_S1_HalfLife_Eigenvalue.csv — Half-life vs |λ| for 50 representative genes",
      "Supplementary_Table_S4_NonCircadian_Replication.csv — Non-circadian replication across 7 datasets",
      "Supplementary_Table_S5_Robustness_DeepDive.csv — 11-test robustness deep dive",
      "expression_persistence_results.json — Structured results (correlations, cross-species, bias audit, exemplar genes)",
      "figures/ — Figure source files",
      "README.md — Package guide, key results, companion paper notes",
    ],
  },
];

const REVIEW_PAPER: PaperConfig = {
  id: "fibonacci-reply",
  letter: "G",
  endpoint: "/api/download/fibonacci-reply-zip",
  title: "A Time-Domain Analogue to Fibonacci Structure via Phase-Gated AR(2) Dynamics: Reply to Boman on Tissue Fibonacci Patterns and Colonic Crypt Renewal",
  subtitle: "Reply to Boman (Fibonacci Quarterly) — submitted November 2025, currently under review.",
  status: "under-review",
  statusLabel: "Under review since Nov 2025 — DO NOT resubmit or contact journal",
  version: "Platform package",
  lastUpdated: "2026-04-22",
  icon: <Clock className="w-6 h-6" />,
  accentColor: "text-purple-400",
  borderColor: "border-purple-500/50",
  bgColor: "bg-purple-600/20",
  abstract: "A reply to Boman et al. proposing that Fibonacci-like structure in colonic crypts appears not only in static spatial cell counts but also in the dynamics of phase-aligned renewal observables. The Phase-Gated AR(2) (PAR(2)) companion matrix plays an analogous role to Boman's age-structured renewal matrix: its eigenvalues encode growth, decay and oscillation of crypt-level variables. Key crypt genes (Lgr5, Arntl, Per2, Axin2) from GSE157357 show stable complex AR(2) roots, consistent with a damped discrete-time oscillator. Boman's five biological rules are mapped onto PAR(2) parameters. Falsifiable predictions are derived for BMAL1 disruption, tuft cell dynamics after injury, chronotherapy alignment, and Boman-compatible simulation signatures. The platform package includes supplementary data tables, cross-validation results across 22 datasets and 5 species, and supporting materials.",
  keyNumbers: [
    { label: "Status", value: "Under peer review (Nov 2025)" },
    { label: "Journal", value: "Fibonacci Quarterly" },
    { label: "Cross-validation", value: "22 datasets, 5 species" },
    { label: "Package", value: "Password protected" },
  ],
  contents: [
    "Paper_G_Fibonacci_Reply.pdf — Compiled PDF, main manuscript (18 pages, Apr 2026)",
    "Paper_G_Fibonacci_Reply.tex — LaTeX source (anticipated Apr 2026 revision)",
    "supplementary_extended_twinning.pdf — Compiled PDF, supplementary note (9 pages, Apr 2026)",
    "supplementary_extended_twinning.tex — LaTeX source: five additional twinning arguments incl. Floquet monodromy results and Boman p-number extension",
    "cover_letter.tex — Cover letter",
    "references.bib — 18 references",
    "Supplementary_Table_S1_Crypt_Gene_Eigenvalues.csv — Per-gene eigenvalue data, 12 tissues",
    "Supplementary_Table_S2_Platform_Validation.csv — Claim-by-claim cross-validation (13 claims, 22 datasets, 4 species)",
    "Supplementary_Table_S3_BMAL1_Coupling_Crypt.csv — BMAL1 coupling across crypt-relevant genes",
    "Supplementary_Table_S4_Organoid_Perturbation.csv — GSE157357 organoid perturbation (WT, APC-KO, BMAL1-KO, double)",
    "Supplementary_Table_S5_Nguyen_Integration.csv — Nguyen 2025 cell-type integration",
    "fibonacci_reply_validation.json — Full platform cross-validation results and amendment log",
    "crypt_gene_eigenvalues.json — Structured eigenvalue data for crypt genes, tuft cells, organoid perturbation",
    "README.md — Package guide, p-value table, full formal content inventory",
  ],
};

const ARCHIVE_PAPERS: { id: string; letter?: string; title: string; note: string; endpoint: string }[] = [
  { id: "flagship", title: "Flagship Consolidated Manuscript", note: "Single comprehensive paper combining full framework — used for Zenodo upload (750+ downloads). Not a separate submission.", endpoint: "/api/download/flagship-package" },
  { id: "unified", title: "Unified Manuscript", note: "All-in-one version combining Papers 1 and 2. Superseded by A, E, F as separate targeted submissions.", endpoint: "/api/download/unified-package" },
  { id: "paper1", title: "Paper 1: Method + Atlas (v1.0)", note: "Early iteration of Paper A. Content revised and extended in Paper A v2.0.", endpoint: "/api/download/paper1-package" },
  { id: "paper2", title: "Paper 2: Cancer Biology (v1.0)", note: "Early iteration of cancer biology content, later split into Papers E and F.", endpoint: "/api/download/paper2-package" },
  { id: "paper-b", letter: "B", title: "Paper B: Resonance Zone Discovery", note: "Resonance zone findings largely incorporated into Paper A's results. Not currently a separate submission target.", endpoint: "/api/download/paper-b-package" },
  { id: "paper-c", letter: "C", title: "Paper C: 12-Tissue Coupling Atlas", note: "Coupling atlas content integrated into Paper E's cross-tissue results.", endpoint: "/api/download/paper-c-package" },
  { id: "paper-d", letter: "D", title: "Paper D: Memory as a Biological Property (Perspective)", note: "Perspective piece. Core argument subsumed by Paper F's empirical half-life independence demonstration.", endpoint: "/api/download/paper-d-package" },
  { id: "all-papers", title: "Complete Paper Suite (A, E, F, G, H, M, N, O, P, Q)", note: "Bundle of all current papers for reference.", endpoint: "/api/download/all-papers-package" },
];

function StatusBadge({ status, label }: { status: PaperConfig['status']; label: string }) {
  const base = "whitespace-normal h-auto text-[11px] leading-snug inline-flex items-start gap-1";
  if (status === 'draft') {
    return <Badge className={`${base} bg-orange-500/20 text-orange-400 border-orange-500/30`}><Info size={10} className="mt-0.5 shrink-0" />{label}</Badge>;
  }
  if (status === 'target') {
    return <Badge className={`${base} bg-blue-500/20 text-blue-300 border-blue-500/30`}><CheckCircle2 size={10} className="mt-0.5 shrink-0" />{label}</Badge>;
  }
  if (status === 'submitted') {
    return <Badge className={`${base} bg-green-500/20 text-green-300 border-green-500/30`}><CheckCircle2 size={10} className="mt-0.5 shrink-0" />{label}</Badge>;
  }
  if (status === 'under-review') {
    return <Badge className={`${base} bg-amber-500/20 text-amber-300 border-amber-500/30`}><AlertCircle size={10} className="mt-0.5 shrink-0" />{label}</Badge>;
  }
  return <Badge className={`${base} bg-slate-600/30 text-slate-500 border-slate-300/30`}>{label}</Badge>;
}


const PAPER_PDF_VIEW_URLS: Record<string, string> = {
  'methods-platform': '/api/view/paper-pdf?id=methods-platform',
  'paper-a':          '/api/view/paper-pdf?id=paper-a',
  'paper-e':          '/api/view/paper-pdf?id=paper-e',
  'paper-f':          '/api/view/paper-pdf?id=paper-f',
  'fibonacci-reply':  '/api/view/paper-pdf?id=fibonacci-reply',
  'paper-h':          '/api/view/paper-pdf?id=paper-h',
  'paper-n':          '/api/view/paper-pdf?id=paper-n',
  'paper-o':          '/api/view/paper-pdf?id=paper-o',
  'paper-p':          '/api/view/paper-pdf?id=paper-p',
  'paper-q':          '/api/view/paper-pdf?id=paper-q',
};

function PaperCard({ paper, downloadCount, viewCount }: { paper: PaperConfig; downloadCount?: number; viewCount?: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pendingEndpoint, setPendingEndpoint] = useState<string>("");
  const [showAbstract, setShowAbstract] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [paperGPassword, setPaperGPassword] = useState("");

  useEffect(() => {
    if (showAbstract && !hasTrackedView) {
      setHasTrackedView(true);
      fetch('/api/app/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'page_view', page: `/manuscript/${paper.id}` }),
      }).catch(() => {});
    }
  }, [showAbstract, hasTrackedView, paper.id]);

  const doPublicDownload = async (overrideGPassword?: string) => {
    setLoading(true);
    setError("");
    try {
      const headers: Record<string, string> = {};
      const gPass = overrideGPassword ?? paperGPassword;
      if (paper.id === "fibonacci-reply" && gPass) {
        headers["x-paper-g-password"] = gPass;
      }
      const response = await fetch(paper.endpoint, { headers });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Download failed");
        setLoading(false);
        return;
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename=(.+)/);
      a.download = filenameMatch ? filenameMatch[1] : `${paper.id}_package.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleDownload = (endpoint?: string) => {
    if (paper.id !== "fibonacci-reply") {
      doPublicDownload();
      return;
    }
    setPendingEndpoint(endpoint || paper.endpoint);
    setShowPasswordPrompt(true);
    setPasswordInput("");
    setPasswordError("");
  };

  const handlePasswordSubmit = async () => {
    if (paper.id === "fibonacci-reply") {
      try {
        const res = await fetch("/api/verify-paper-g-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordInput }),
        });
        const data = await res.json();
        if (data.valid) {
          setPaperGPassword(passwordInput);
          setShowPasswordPrompt(false);
          setPasswordError("");
          await doPublicDownload(passwordInput);
        } else {
          setPasswordError("Incorrect password.");
        }
      } catch {
        setPasswordError("Verification failed. Please try again.");
      }
      return;
    }
    await doPublicDownload();
  };

  return (
    <Card className={`bg-slate-50 border ${paper.borderColor} text-slate-900`} data-testid={`card-paper-${paper.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 mb-2">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className={`w-11 h-11 rounded-xl ${paper.bgColor} border ${paper.borderColor} flex items-center justify-center`}>
              <span className={`text-2xl font-black leading-none ${paper.accentColor}`}>{paper.letter}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-semibold tracking-widest uppercase">Paper</span>
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-bold leading-tight" data-testid={`text-${paper.id}-title`}>
              {paper.title}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 italic">{paper.subtitle}</p>
            {paper.statusLabel && (
              <div className="mt-2">
                <StatusBadge status={paper.status} label={paper.statusLabel} />
              </div>
            )}
            {paper.preprintUrl && (
              <div className="mt-2">
                <a
                  href={paper.preprintUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 underline underline-offset-2"
                >
                  Preprint: Research Square
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-slate-500 font-mono">v{paper.version} · {paper.lastUpdated}</span>
          {viewCount !== undefined && viewCount > 0 && (
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1" title="Abstract views by external visitors">
              <Eye className="w-3 h-3" />
              {viewCount} {viewCount === 1 ? 'view' : 'views'}
            </span>
          )}
          {downloadCount !== undefined && downloadCount > 0 && (
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1" title="External downloads (your own excluded)">
              <Download className="w-3 h-3" />
              {downloadCount} {downloadCount === 1 ? 'ext. download' : 'ext. downloads'}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAbstract(v => !v)}
          className={`mt-2 flex items-center gap-1.5 text-xs font-semibold transition-colors ${paper.accentColor} hover:opacity-80`}
          data-testid={`button-toggle-abstract-${paper.id}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          {showAbstract ? "Hide abstract" : "View abstract"}
          {showAbstract ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showAbstract && (
          <CardDescription className="text-slate-600 text-sm mt-2 leading-relaxed border-l-2 pl-3" style={{ borderColor: 'currentColor' }} data-testid={`text-abstract-${paper.id}`}>
            {paper.abstract}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {paper.keyNumbers.map((d) => (
            <div key={d.label} className="bg-slate-200/40 rounded px-2.5 py-2">
              <span className="text-[10px] text-slate-500 block">{d.label}</span>
              <span className="text-xs font-semibold text-slate-800">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">Package contents:</p>
          <ul className="space-y-1">
            {paper.contents.map((item, i) => (
              <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                <span className="text-slate-600 mt-0.5">–</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {PAPER_TO_PAGES[paper.id] && PAPER_TO_PAGES[paper.id].length > 0 && (
          <div className="bg-slate-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-500 mb-2">See it live on the platform:</p>
            <div className="flex flex-wrap gap-1.5">
              {PAPER_TO_PAGES[paper.id].map((pg) => (
                <Link key={pg.path} href={pg.path}>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border cursor-pointer hover:brightness-125 transition ${paper.bgColor} ${paper.borderColor} ${paper.accentColor}`} data-testid={`link-live-${paper.id}-${pg.path.slice(1)}`}>
                    {pg.label}
                    <ArrowRight size={10} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {paper.status === 'under-review' && paper.id === 'fibonacci-reply' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300">
            <AlertCircle size={12} className="inline mr-1" />
            Paper G is currently under peer review at The Fibonacci Quarterly (submitted November 2025). The download below is the anticipated April 2026 revision incorporating 9 post-submission amendments — including formal proofs (Theorem 1, Propositions 1–2), Floquet monodromy computed results, the Boman p-number extension, and a focused φ-enrichment test (p=0.041). Package includes compiled PDFs of both documents. For reference only. Do not resubmit or contact the journal.
          </div>
        )}
        {paper.status === 'under-review' && paper.id !== 'fibonacci-reply' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300">
            <AlertCircle size={12} className="inline mr-1" />
            This manuscript is currently under peer review. The download package is provided for reference only.
          </div>
        )}
        {PAPER_PDF_VIEW_URLS[paper.id] && !showPasswordPrompt && (paper.id !== "fibonacci-reply" || paperGPassword) && (
          <a
            href={paper.id === "fibonacci-reply" && paperGPassword
              ? `${PAPER_PDF_VIEW_URLS[paper.id]}&password=${encodeURIComponent(paperGPassword)}`
              : PAPER_PDF_VIEW_URLS[paper.id]}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`button-view-${paper.id}`}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-md text-sm font-semibold transition-all border ${
              paper.id === "paper-a" ? "border-cyan-500/50 text-cyan-700 hover:bg-cyan-50"
              : paper.id === "paper-e" ? "border-pink-500/50 text-pink-700 hover:bg-pink-50"
              : paper.id === "paper-f" ? "border-emerald-500/50 text-emerald-700 hover:bg-emerald-50"
              : paper.id === "paper-h" ? "border-orange-500/50 text-orange-700 hover:bg-orange-50"
              : paper.id === "fibonacci-reply" ? "border-purple-500/50 text-purple-700 hover:bg-purple-50"
              : paper.id === "paper-n" ? "border-violet-500/50 text-violet-700 hover:bg-violet-50"
              : paper.id === "paper-o" ? "border-lime-500/50 text-lime-700 hover:bg-lime-50"
              : paper.id === "paper-p" ? "border-teal-500/50 text-teal-700 hover:bg-teal-50"
              : paper.id === "paper-q" ? "border-yellow-500/50 text-yellow-700 hover:bg-yellow-50"
              : "border-teal-500/50 text-teal-700 hover:bg-teal-50"
            }`}
          >
            <Eye className="w-4 h-4" />
            View Manuscript PDF
          </a>
        )}
        {paper.endpoint && !showPasswordPrompt && (
          <Button
            onClick={() => handleDownload()}
            disabled={loading}
            className={`w-full py-4 text-slate-900 font-semibold transition-all ${
              paper.id === "paper-a" ? "bg-cyan-600 hover:bg-cyan-700"
              : paper.id === "paper-e" ? "bg-pink-600 hover:bg-pink-700"
              : paper.id === "paper-f" ? "bg-emerald-600 hover:bg-emerald-700"
              : paper.id === "paper-h" ? "bg-orange-600 hover:bg-orange-700"
              : paper.id === "methods-platform" ? "bg-teal-600 hover:bg-teal-700"
              : "bg-purple-600 hover:bg-purple-700"
            }`}
            data-testid={`button-download-${paper.id}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Preparing package...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Package (.zip)
              </span>
            )}
          </Button>
        )}
        {paper.id === 'paper-e' && !showPasswordPrompt && (
          <Button
            onClick={() => handleDownload('/api/download/paper-e-word')}
            variant="outline"
            className="w-full border-pink-500/50 text-pink-300 hover:bg-pink-900/20"
            data-testid="button-download-paper-e-word"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Manuscript (.docx)
            </span>
          </Button>
        )}
        {showPasswordPrompt && (
          <div
            className="rounded-lg p-4 space-y-3 bg-purple-500/10 border border-purple-500/30"
            data-testid="paper-g-password-prompt"
          >
            <p className="text-xs font-semibold text-purple-300">
              This download is password protected.
            </p>
            <input
              type="password"
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(""); }}
              onKeyDown={e => { if (e.key === "Enter") handlePasswordSubmit(); }}
              placeholder="Enter password"
              className="w-full bg-slate-900 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none border border-purple-500/40 focus:border-purple-400"
              data-testid="input-paper-g-password"
              autoFocus
            />
            {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
            <div className="flex gap-2">
              <Button
                onClick={handlePasswordSubmit}
                disabled={loading}
                className="flex-1 text-white text-sm bg-purple-600 hover:bg-purple-700"
                data-testid="button-paper-g-password-submit"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
                    Verifying...
                  </span>
                ) : "Unlock & Download"}
              </Button>
              <Button
                onClick={() => { setShowPasswordPrompt(false); setPasswordInput(""); setPasswordError(""); }}
                variant="outline"
                className="border-slate-600 text-slate-400 hover:bg-slate-800 text-sm"
                data-testid="button-paper-g-password-cancel"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </CardContent>
    </Card>
  );
}

function ArchiveSection() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = async (paper: typeof ARCHIVE_PAPERS[0]) => {
    setLoading(paper.id);
    try {
      const response = await fetch(paper.endpoint);
      if (!response.ok) { setLoading(null); return; }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${paper.id}_package.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {}
    setLoading(null);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden" data-testid="archive-section">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-100 hover:bg-slate-50 transition text-left"
        data-testid="btn-toggle-archive"
      >
        <div>
          <span className="text-sm font-semibold text-slate-600">Previous versions & archive</span>
          <p className="text-xs text-slate-500 mt-0.5">
            Flagship, Unified, Papers 1 & 2, Papers B/C/D — earlier iterations whose content is captured in Papers A, E, and F
          </p>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-200/40">
          {ARCHIVE_PAPERS.map((paper) => (
            <div key={paper.id} className="px-5 py-3 bg-slate-50 flex items-start justify-between gap-4" data-testid={`archive-row-${paper.id}`}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {paper.letter && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200/60 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-black text-slate-500">{paper.letter}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 font-medium">{paper.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{paper.note}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(paper)}
                disabled={loading === paper.id}
                className="border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex-shrink-0 text-xs"
                data-testid={`button-archive-download-${paper.id}`}
              >
                {loading === paper.id ? (
                  <span className="animate-spin rounded-full h-3 w-3 border border-slate-400 border-t-transparent" />
                ) : (
                  <><Download size={12} className="mr-1" /> .zip</>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManuscriptDownload() {
  const { data: downloadCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["/api/paper-download-counts"],
    refetchInterval: 30000,
  });

  const { data: viewCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["/api/paper-view-counts"],
    refetchInterval: 60000,
  });

  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  const [downloadAllError, setDownloadAllError] = useState("");
  const [showDownloadAllPassword, setShowDownloadAllPassword] = useState(false);
  const [downloadAllPassword, setDownloadAllPassword] = useState("");
  const [downloadAllPasswordError, setDownloadAllPasswordError] = useState("");

  const handleDownloadAll = async (password: string) => {
    setDownloadAllLoading(true);
    setDownloadAllPasswordError("");
    setDownloadAllError("");
    try {
      const url = `/api/download/all-papers-package?password=${encodeURIComponent(password)}`;
      const response = await fetch(url);
      if (!response.ok) {
        const data = await response.json();
        setDownloadAllPasswordError(data.error || "Incorrect password.");
        setDownloadAllLoading(false);
        return;
      }
      setShowDownloadAllPassword(false);
      setDownloadAllPassword("");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename=(.+)/);
      a.download = filenameMatch ? filenameMatch[1] : "PAR2_All_Papers.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setDownloadAllPasswordError("Network error. Please try again.");
    }
    setDownloadAllLoading(false);
  };

  const getCount = (endpoint: string) => {
    const key = endpoint.replace('/api/download/', '');
    return downloadCounts[key];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4" data-testid="manuscript-download-page">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <button className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm" data-testid="back-home-link">
              <ArrowLeft size={16} /> Home
            </button>
          </Link>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="text-manuscripts-heading">
              Manuscripts
            </h1>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Ten papers spanning the PAR(2) framework. Each download includes the manuscript, cover letter, supplementary tables, and supporting data. Paper G additionally includes compiled PDFs of both the main manuscript and supplementary note.
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-10 gap-2">
            {[
              { letter: "M", title: "Platform Methods & Architecture", color: "text-teal-400", bg: "bg-teal-600/10", border: "border-teal-600/30" },
              { letter: "A", title: "AR(2) Eigenvalue Hierarchy", color: "text-cyan-400", bg: "bg-cyan-600/10", border: "border-cyan-600/30" },
              { letter: "E", title: "Dynamical Clock–Target Coupling", color: "text-pink-400", bg: "bg-pink-600/10", border: "border-pink-600/30" },
              { letter: "F", title: "Half-Life Independence", color: "text-emerald-400", bg: "bg-emerald-600/10", border: "border-emerald-600/30" },
              { letter: "G", title: "Fibonacci Analogue (Reply)", color: "text-purple-400", bg: "bg-purple-600/10", border: "border-purple-600/30" },
              { letter: "H", title: "Clock Inversion in Alzheimer's", color: "text-orange-400", bg: "bg-orange-600/10", border: "border-orange-600/30" },
              { letter: "N", title: "p53 Regulon Temporal Persistence", color: "text-violet-400", bg: "bg-violet-600/10", border: "border-violet-600/30" },
              { letter: "O", title: "Organoid Circadian-Proliferative Hierarchy", color: "text-lime-400", bg: "bg-lime-600/10", border: "border-lime-600/30" },
              { letter: "P", title: "Temporal Correlation Length", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30" },
              { letter: "Q", title: "Central-Peripheral Clock Hierarchy", color: "text-yellow-400", bg: "bg-yellow-600/10", border: "border-yellow-600/30" },
            ].map(p => (
              <div key={p.letter} className={`${p.bg} border ${p.border} rounded-lg px-3 py-3 flex flex-col items-center text-center gap-1.5`}>
                <span className={`text-2xl font-black leading-none ${p.color}`}>{p.letter}</span>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{p.title}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="text-slate-500">Author:</span>
              <span className="text-slate-800 font-medium">Michael Whiteside</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-500">Independent researcher</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="text-slate-500">ORCID:</span>
              <span className="text-slate-800 font-mono">0009-0000-0643-5791</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/30">
              <CheckCircle2 size={11} className="text-blue-400" />
              <span className="text-blue-300">Ronin Institute affiliation pending</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="/api/download/all-papers-pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
              data-testid="button-download-all-papers-pdf"
            >
              <FileText size={16} />
              Download Combined PDF (A, E, F, G, H, M, N, O, P, Q)
            </a>
            <span className="text-xs text-slate-400">Single PDF · all manuscripts merged</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            {!showDownloadAllPassword && (
              <button
                onClick={() => { setShowDownloadAllPassword(true); setDownloadAllPassword(""); setDownloadAllPasswordError(""); }}
                disabled={downloadAllLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                data-testid="button-download-all-papers"
              >
                <Download size={16} />
                Download All Papers (A, E, F, G, H, M, N, O, P, Q)
              </button>
            )}
            {!showDownloadAllPassword && (
              <span className="text-xs text-slate-400">Single .zip · LaTeX source, PDFs, cover letters, supplements</span>
            )}
          </div>
          {showDownloadAllPassword && (
            <div className="mt-4 rounded-lg p-4 space-y-3 bg-indigo-500/10 border border-indigo-500/30" data-testid="download-all-password-prompt">
              <p className="text-xs font-semibold text-indigo-300">Enter the download password to package all papers.</p>
              <input
                type="password"
                value={downloadAllPassword}
                onChange={e => { setDownloadAllPassword(e.target.value); setDownloadAllPasswordError(""); }}
                onKeyDown={e => { if (e.key === "Enter") handleDownloadAll(downloadAllPassword); }}
                placeholder="Enter password"
                className="w-full bg-slate-900 border border-indigo-500/40 focus:border-indigo-400 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                data-testid="input-download-all-password"
                autoFocus
              />
              {downloadAllPasswordError && <p className="text-red-400 text-xs">{downloadAllPasswordError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadAll(downloadAllPassword)}
                  disabled={downloadAllLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                  data-testid="button-download-all-password-submit"
                >
                  {downloadAllLoading ? (
                    <><span className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" /> Packaging…</>
                  ) : (
                    <><Download size={14} /> Unlock &amp; Download</>
                  )}
                </button>
                <button
                  onClick={() => { setShowDownloadAllPassword(false); setDownloadAllPassword(""); setDownloadAllPasswordError(""); }}
                  className="px-4 py-2 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-800 text-sm transition-colors"
                  data-testid="button-download-all-password-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {downloadAllError && (
            <p className="mt-2 text-xs text-red-500">{downloadAllError}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Papers</h2>
          </div>
          <p className="text-xs text-slate-500 ml-4">Ten independent papers, each with a single central claim</p>
        </div>

        <div className="space-y-6 mb-10">
          {PRIMARY_PAPERS.map(paper => (
            <PaperCard key={paper.id} paper={paper} downloadCount={getCount(paper.endpoint)} viewCount={viewCounts[paper.id]} />
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Under Review</h2>
          </div>
          <p className="text-xs text-slate-500 ml-4">Do not submit elsewhere while under review</p>
        </div>

        <div className="mb-10">
          <PaperCard paper={REVIEW_PAPER} downloadCount={getCount(REVIEW_PAPER.endpoint)} viewCount={viewCounts[REVIEW_PAPER.id]} />
        </div>

        <ArchiveSection />

        <div className="mt-8 bg-slate-100 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-600">Platform as live evidence</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Every claim in these papers has a corresponding live analysis on this platform. The platform runs the same AR(2) code on the same public datasets — it is the reproducibility package made interactive. Reviewers and readers can verify results directly rather than relying on pre-computed figures.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/manuscript-validation">
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 cursor-pointer transition">
                Manuscript Validation Dashboard <ArrowRight size={11} />
              </span>
            </Link>
            <Link href="/gse157357-analysis">
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-pink-600/20 border border-pink-500/30 text-pink-300 hover:bg-pink-600/30 cursor-pointer transition">
                GSE157357 Organoid Explorer <ArrowRight size={11} />
              </span>
            </Link>
            <Link href="/tcga-validation">
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 cursor-pointer transition">
                TCGA Cross-Validation <ArrowRight size={11} />
              </span>
            </Link>
            <Link href="/category-tests">
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 cursor-pointer transition">
                Category Tests <ArrowRight size={11} />
              </span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
