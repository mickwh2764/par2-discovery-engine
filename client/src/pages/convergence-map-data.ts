export interface DiscoveryNode {
  id: string;
  label: string;
  detail: string;
  year: string;
  source: "boman" | "par2" | "convergence";
  position: [number, number, number];
  connections: string[];
  confidence?: number;
  citation?: string;
}

export const DISCOVERIES: DiscoveryNode[] = [
  // --- BOMAN'S PUBLISHED RESEARCH (left side, blue) ---
  {
    id: "b1",
    label: "Tissue Renewal Theory",
    detail: "Cancer arises from stem cell overpopulation disrupting tissue renewal, not just mutation accumulation.",
    year: "2001–2008",
    source: "boman",
    position: [-5, 0, -3],
    connections: ["b2", "c1"],
    citation: "Boman BM et al., Cancer Res 2001; J Clin Invest 2008",
  },
  {
    id: "b2",
    label: "APC → Stem Cell Expansion",
    detail: "APC mutation drives stem cell overpopulation in colonic crypts, initiating tumorigenesis through renewal disruption.",
    year: "2004–2008",
    source: "boman",
    position: [-5, 1.5, -1],
    connections: ["b3", "c2"],
    citation: "Boman BM & Wicha MS, J Clin Invest 2008",
  },
  {
    id: "b3",
    label: "Hierarchical Crypt Organization",
    detail: "Normal tissue maintains strict stem → progenitor → differentiated hierarchy. Cancer disrupts this order.",
    year: "2008–2020",
    source: "boman",
    position: [-5, 3, 1],
    connections: ["c1", "c3"],
    citation: "Boman BM et al., multiple publications",
  },
  {
    id: "b4",
    label: "Cell-Type Marker Dynamics",
    detail: "Stem cell markers (LGR5, OLFM4, ASCL2) behave differently from differentiation markers under APC loss.",
    year: "2020–2025",
    source: "boman",
    position: [-5, 4.5, 3],
    connections: ["c4", "c5"],
    citation: "Nguyen, Lausten & Boman, Cells 2025",
  },
  {
    id: "b5",
    label: "Renewal-Driven Tumorigenesis",
    detail: "Cancer as fundamentally a disease of disrupted tissue renewal, not just genetic mutation.",
    year: "2025",
    source: "boman",
    position: [-5, 6, 5],
    connections: ["c5", "c6"],
    citation: "Boman BM, Cancers 2025",
  },

  // --- PAR(2) INDEPENDENT DISCOVERIES (right side, cyan) ---
  {
    id: "p1",
    label: "AR(2) Eigenvalue Framework",
    detail: "One equation: x(t) = φ₁x(t-1) + φ₂x(t-2) + ε. The eigenvalue modulus |λ| measures temporal persistence from any time-series data.",
    year: "2024",
    source: "par2",
    position: [5, 0, -3],
    connections: ["p2", "c1"],
    confidence: 95,
  },
  {
    id: "p2",
    label: "Clock > Target Hierarchy",
    detail: "14/14 datasets across 4 species: clock genes consistently have higher |λ| than the target genes they regulate. Not built into the equation.",
    year: "2024–2025",
    source: "par2",
    position: [5, 1.5, -1],
    connections: ["p3", "c1", "c3"],
    confidence: 88,
  },
  {
    id: "p3",
    label: "Cross-Species Conservation",
    detail: "Same hierarchy emerges in mouse, human, baboon, Arabidopsis. The equation doesn't know what species it's analyzing.",
    year: "2025",
    source: "par2",
    position: [5, 3, 1],
    connections: ["c3"],
    confidence: 87,
  },
  {
    id: "p4",
    label: "Cancer Signature Detection",
    detail: "ApcKO organoids show abrupt eigenvalue collapse/inversion. Aging shows gradual narrowing. Equation distinguishes them without knowing which is which.",
    year: "2025",
    source: "par2",
    position: [5, 4.5, 3],
    connections: ["c2", "c4"],
    confidence: 80,
  },
  {
    id: "p5",
    label: "Cell-Type Persistence Map",
    detail: "Identity markers > Clock > Proliferation: three-layer hierarchy emerged purely from eigenvalue ranking. Stem cell markers show largest APC-driven drift.",
    year: "2025",
    source: "par2",
    position: [5, 6, 5],
    connections: ["c4", "c5"],
    confidence: 75,
  },
  {
    id: "p6",
    label: "Drug Resistance Gene Detection",
    detail: "AR(2) flagged CDK6 and CCNE1 as high-persistence — textbook palbociclib resistance genes confirmed by decades of bench work.",
    year: "2025",
    source: "par2",
    position: [5, 7.5, 7],
    connections: ["c6"],
    confidence: 65,
  },

  // --- CONVERGENCE POINTS (center, gold) ---
  {
    id: "c1",
    label: "Hierarchical Organization Matters",
    detail: "Both approaches independently conclude that tissues maintain strict temporal/renewal hierarchy, and its disruption alters dynamics.",
    year: "Convergence",
    source: "convergence",
    position: [0, 1.5, -1],
    connections: [],
  },
  {
    id: "c2",
    label: "APC Disrupts the Hierarchy",
    detail: "Boman: APC mutation drives stem cell overpopulation. PAR(2): ApcKO causes eigenvalue collapse/inversion. Same biology, different measurement.",
    year: "Convergence",
    source: "convergence",
    position: [0, 3, 1],
    connections: [],
  },
  {
    id: "c3",
    label: "Conservation Across Systems",
    detail: "Boman: renewal theory applies across tissue types. PAR(2): hierarchy preserved across 4 species. Universal principle detected by both approaches.",
    year: "Convergence",
    source: "convergence",
    position: [0, 4.5, 3],
    connections: [],
  },
  {
    id: "c4",
    label: "Stem Cells Most Affected",
    detail: "Boman: stem cell markers show biggest changes under APC loss. PAR(2): stem cell markers show largest eigenvalue drift. Identical conclusion, zero shared methodology.",
    year: "Convergence",
    source: "convergence",
    position: [0, 5.5, 4.5],
    connections: [],
  },
  {
    id: "c5",
    label: "Temporal Order = Tumor Suppression",
    detail: "Boman: orderly renewal suppresses tumors. PAR(2): intact persistence hierarchy collapses in perturbed datasets. Both say: losing temporal order disrupts function.",
    year: "Convergence",
    source: "convergence",
    position: [0, 7, 6],
    connections: [],
  },
  {
    id: "c6",
    label: "Persistence → Treatment Resistance",
    detail: "Boman: self-renewing cells resist therapy. PAR(2): high-|λ| genes maintain expression through drug treatment. Memory enables resistance in both frameworks.",
    year: "Convergence",
    source: "convergence",
    position: [0, 8, 7.5],
    connections: [],
  },
];

export const SOURCE_COLORS: Record<string, string> = {
  boman: "#3b82f6",
  par2: "#06b6d4",
  convergence: "#f59e0b",
};

export interface TissueRule {
  id: string;
  rule: number;
  bomanLabel: string;
  bomanDetail: string;
  par2Label: string;
  par2Detail: string;
  par2Evidence: string;
  confidence: number;
  link: string;
  bomanPos: [number, number, number];
  par2Pos: [number, number, number];
  speculative?: boolean;
}

export const TISSUE_CODE_RULES: TissueRule[] = [
  {
    id: "r1", rule: 1,
    bomanLabel: "Timing of Cell Division",
    bomanDetail: "The tissue code specifies precisely when each cell divides. Temporal asymmetry of division — parent cells produce progeny (mature M vs. immature I) with different temporal properties — is the key mechanism.",
    par2Label: "Eigenvalue |λ| Quantifies Division Timing",
    par2Detail: "AR(2) eigenvalue modulus directly measures temporal persistence — how long a gene's expression state lasts before changing. High |λ| genes maintain state across division cycles; low |λ| genes reset quickly. The equation captures 'when cells change state' from time-series data alone.",
    par2Evidence: "Clock genes |λ| ≈ 0.94 (slow cycling) vs. proliferation genes |λ| ≈ 0.82–0.90 (fast cycling). See Cross-Context Validation.",
    confidence: 82, link: "/cross-context-validation",
    bomanPos: [-4, 0, 0], par2Pos: [4, 0, 0],
  },
  {
    id: "r2", rule: 2,
    bomanLabel: "Temporal Order of Cell Division",
    bomanDetail: "Cells divide in a strict temporal sequence — not randomly. The order in which stem, progenitor, and differentiated cells divide is encoded and maintained during every renewal cycle (3–5 days in colon).",
    par2Label: "Clock > Target Hierarchy Preserves Temporal Order",
    par2Detail: "AR(2) reveals a strict persistence ordering: identity markers > clock genes > targets > proliferation. This ordering is preserved across 14/14 datasets and 4 species. The equation independently discovers that gene expression follows a temporal sequence — not random fluctuation.",
    par2Evidence: "14/14 datasets: clock |λ| > target |λ|. Cross-species conservation in mouse, human, baboon, plant.",
    confidence: 88, link: "/cell-type-persistence",
    bomanPos: [-4, 1.8, 0], par2Pos: [4, 1.8, 0],
  },
  {
    id: "r3", rule: 3,
    bomanLabel: "Spatial Direction of Cell Division",
    bomanDetail: "Division is spatially asymmetric — daughter cells move in specific directions along the crypt axis. This directional movement maintains the stem → transit-amplifying → differentiated spatial organization.",
    par2Label: "Root-Space Geometry May Reflect Directional Dynamics",
    par2Detail: "The AR(2) root-space (φ₁–φ₂ plane) maps genes to positions that reflect their dynamical behavior. Genes cluster by functional category in distinct regions. However, this is a mapping of temporal dynamics to a parameter space — not a direct measurement of spatial direction. The analogy to Boman's spatial rule is suggestive but indirect. AR(2) operates on time-series, not spatial coordinates.",
    par2Evidence: "Root-space clustering is real but the connection to physical spatial direction in tissue is speculative. See Root-Space Geometry page.",
    confidence: 55, link: "/root-space",
    bomanPos: [-4, 3.6, 0], par2Pos: [4, 3.6, 0],
    speculative: true,
  },
  {
    id: "r4", rule: 4,
    bomanLabel: "Number of Cell Divisions",
    bomanDetail: "Each compartment has a defined number of allowed divisions. Stem cells self-renew indefinitely; transit-amplifying cells undergo 4–5 divisions; differentiated cells do not divide. APC mutation disrupts this count.",
    par2Label: "Stationarity Boundary May Constrain Division Capacity",
    par2Detail: "Genes at the unit root boundary (|λ| ≈ 1.0) show persistence consistent with unlimited self-renewal. Genes below decay over time. This is a plausible analogy to Boman's division-count rule, but AR(2) measures expression persistence, not actual division counts. The mapping is conceptually appealing but not directly validated — eigenvalue decay rate is not the same as a cell counting its divisions.",
    par2Evidence: "Identity markers |λ| ≈ 1.0; stem markers drift under APC-KO. Analogy to division count is speculative.",
    confidence: 58, link: "/cell-type-persistence",
    bomanPos: [-4, 5.4, 0], par2Pos: [4, 5.4, 0],
    speculative: true,
  },
  {
    id: "r5", rule: 5,
    bomanLabel: "Cell Lifespan",
    bomanDetail: "Different cell types have distinct, precisely encoded lifespans. Tuft cells and enteroendocrine cells persist 28+ days; goblet cells 3–5 days; enterocytes 3–5 days. The tissue code specifies when cells die.",
    par2Label: "Eigenvalue Magnitude Maps to Expression Half-Life",
    par2Detail: "AR(2) eigenvalue magnitude directly relates to how long a gene's expression persists. The three-layer hierarchy — Identity (|λ| ≈ 1.0) > Clock (|λ| ≈ 0.94) > Proliferation (|λ| variable) — mirrors the lifespan hierarchy Boman measured with wet-lab methods. DCLK1 (tuft marker) at |λ| = 0.9999 is consistent with the longest-lived cell type.",
    par2Evidence: "DCLK1 |λ| = 0.9999 (longest-lived); EEC markers |λ| ≈ 0.999; proliferation genes |λ| ≈ 0.82–0.97.",
    confidence: 80, link: "/cell-type-persistence",
    bomanPos: [-4, 7.2, 0], par2Pos: [4, 7.2, 0],
  },
];

export interface CircadianConvergence {
  id: string;
  num: number;
  canonLabel: string;
  canonDetail: string;
  canonSource: string;
  par2Label: string;
  par2Detail: string;
  par2Evidence: string;
  confidence: number;
  link: string;
  canonPos: [number, number, number];
  par2Pos: [number, number, number];
}

export const CIRCADIAN_CONVERGENCES: CircadianConvergence[] = [
  {
    id: "cc1", num: 1,
    canonLabel: "TTFL Hierarchical Architecture",
    canonDetail: "Takahashi established that mammalian circadian clocks are organized as a hierarchical transcriptional-translational feedback loop (TTFL). CLOCK:BMAL1 heterodimers activate Period and Cryptochrome genes, which feed back to repress their own activators. A stabilizing loop via REV-ERBα/β and RORα adds robustness. The architecture is strictly layered: master regulators → core oscillators → clock-controlled output genes.",
    canonSource: "Takahashi, Nature Reviews Genetics 2017; Gekakis et al., Science 1998",
    par2Label: "Clock > Target Eigenvalue Hierarchy",
    par2Detail: "AR(2) independently recovers a strict persistence hierarchy: identity markers (|λ| ≈ 1.0) > core clock genes (|λ| ≈ 0.94) > clock-controlled targets (|λ| ≈ 0.87) > proliferation genes (|λ| ≈ 0.82). This ordering was discovered without prior knowledge of the TTFL, from time-series regression alone. It matches Takahashi's hierarchical architecture — the genes he placed at the top of the transcriptional cascade show the highest temporal persistence.",
    par2Evidence: "14/14 datasets: clock |λ| > target |λ|. Mean gap 0.07 ± 0.02. Hierarchy preserved across all contexts tested.",
    confidence: 92, link: "/cross-context-validation",
    canonPos: [-4, 0, 0], par2Pos: [4, 0, 0],
  },
  {
    id: "cc2", num: 2,
    canonLabel: "43% of Genome is Circadian",
    canonDetail: "Hogenesch's circadian atlas (Zhang et al., PNAS 2014) profiled 12 mouse organs and found that 43% of all protein-coding genes show circadian rhythms in at least one tissue. This was a landmark finding — circadian regulation is not restricted to a handful of 'clock genes' but pervades nearly half the genome.",
    canonSource: "Zhang et al., PNAS 2014 (PMID: 25349387); Hogenesch Lab CircaDB",
    par2Label: "Genome-Wide Hierarchy Emergence",
    par2Detail: "When AR(2) is applied to all genes in a dataset (not just pre-selected clock/target panels), the clock > target eigenvalue hierarchy appears to emerge from the full transcriptome. This genome-wide pattern is consistent with Hogenesch's finding that circadian regulation is pervasive — suggesting the hierarchy is not an artifact of cherry-picked gene lists. However, genome-wide AR(2) has only been tested on a limited number of datasets; broader replication across tissues and species would strengthen this claim.",
    par2Evidence: "Genome-wide AR(2) on GSE54652: hierarchy appears across 12,000+ genes. Clock genes sit near the top without being pre-specified.",
    confidence: 85, link: "/genome-wide",
    canonPos: [-4, 1.8, 0], par2Pos: [4, 1.8, 0],
  },
  {
    id: "cc3", num: 3,
    canonLabel: "Tissue-Specific Circadian Programs",
    canonDetail: "Hogenesch demonstrated that while core clock genes oscillate ubiquitously, the majority of circadian output genes are tissue-specific. Liver, heart, kidney, and brain each have distinct circadian transcriptional programs. The clock provides a universal timing signal, but downstream targets are context-dependent.",
    canonSource: "Zhang et al., PNAS 2014; Ruben et al., Science Translational Medicine 2018",
    par2Label: "Context-Dependent Eigenvalue Signatures",
    par2Detail: "AR(2) eigenvalue profiles vary by tissue context — liver, intestine, and SCN datasets produce different eigenvalue distributions — yet the clock > target ordering is preserved across all contexts. This mirrors Hogenesch's finding precisely: the core hierarchy is universal, but the specific genes participating and their eigenvalue magnitudes are tissue-dependent.",
    par2Evidence: "Cross-tissue comparison shows tissue-specific |λ| distributions but preserved clock > target ordering. See Cross-Context Validation.",
    confidence: 80, link: "/cross-context-validation",
    canonPos: [-4, 3.6, 0], par2Pos: [4, 3.6, 0],
  },
  {
    id: "cc4", num: 4,
    canonLabel: "Cross-Species TTFL Conservation",
    canonDetail: "Takahashi and others showed that the TTFL mechanism is remarkably conserved from fungi (Neurospora WC-1/WC-2) through Drosophila (CLK/CYC) to mammals (CLOCK/BMAL1). The hierarchical principle — master regulators driving downstream oscillators — is an ancient evolutionary feature.",
    canonSource: "Takahashi, Nature Reviews Genetics 2017; multiple comparative studies",
    par2Label: "4-Species Eigenvalue Hierarchy Conservation",
    par2Detail: "AR(2) confirms that the clock > target persistence hierarchy is preserved across mouse, human, baboon, and Arabidopsis. Four species spanning 1.5 billion years of evolution all show the same eigenvalue ordering. This is consistent with Takahashi's observation that the TTFL hierarchy is deeply conserved — AR(2) detects the temporal signature of that conservation from expression data alone.",
    par2Evidence: "Mouse, human, baboon, Arabidopsis: all show clock |λ| > target |λ|. See Multi-Species Validation.",
    confidence: 88, link: "/cross-context-validation",
    canonPos: [-4, 5.4, 0], par2Pos: [4, 5.4, 0],
  },
  {
    id: "cc5", num: 5,
    canonLabel: "Post-Transcriptional Circadian Memory",
    canonDetail: "Koike et al. (Science 2012, Takahashi Lab) showed that only 22% of cycling mRNAs are driven by de novo transcription — the majority of circadian gene expression involves post-transcriptional mechanisms (mRNA stability, splicing, translation). The clock's memory extends beyond simple transcription-repression cycles.",
    canonSource: "Koike et al., Science 2012 (Takahashi Lab)",
    par2Label: "AR(2) Captures Multi-Generational Memory",
    par2Detail: "The second-order autoregressive model (AR(2)) inherently captures memory that extends beyond a single time step — it measures how expression at time t depends on both t-1 and t-2. This mathematical structure is well-suited to detect the post-transcriptional persistence Takahashi's group documented. The high eigenvalues for clock genes may reflect not just transcriptional cycling but the accumulated stability from post-transcriptional regulation.",
    par2Evidence: "AR(2) coefficients encode two-step memory. AR(1) vs AR(2) comparison shows AR(2) captures additional structure (lower AIC).",
    confidence: 75, link: "/cross-context-validation",
    canonPos: [-4, 7.2, 0], par2Pos: [4, 7.2, 0],
  },
  {
    id: "cc6", num: 6,
    canonLabel: "Circadian Drug Targets",
    canonDetail: "Hogenesch's team (Ruben et al., Sci Transl Med 2018) found that the majority of best-selling drugs and WHO essential medicines target products of rhythmically expressed genes. Nearly 1,000 cycling genes encode drug transporters, metabolizers, or are direct drug targets — supporting chronotherapy (time-of-day dosing).",
    canonSource: "Ruben et al., Science Translational Medicine 2018 (PMID: 30209245)",
    par2Label: "Drug Target Root-Space Clustering",
    par2Detail: "AR(2) root-space analysis suggests that FDA-approved and investigational drug targets may cluster in specific dynamical regions rather than being randomly distributed. This is consistent with Hogenesch's finding that drug targets are disproportionately circadian. However, the root-space clustering has been tested against expression-matched controls in a limited number of datasets — further validation across drug classes and tissues is needed before chronotherapy applications can be inferred.",
    par2Evidence: "Drug target enrichment in oscillatory root-space region vs. expression-matched null controls. Preliminary but suggestive.",
    confidence: 78, link: "/root-space",
    canonPos: [-4, 9, 0], par2Pos: [4, 9, 0],
  },
];

export interface WaddingtonConvergence {
  id: string;
  num: number;
  wadLabel: string;
  wadDetail: string;
  wadSource: string;
  par2Label: string;
  par2Detail: string;
  par2Evidence: string;
  confidence: number;
  link: string;
}

export const WADDINGTON_CONVERGENCES: WaddingtonConvergence[] = [
  {
    id: "wc1", num: 1,
    wadLabel: "Valleys = Cell Fate Attractors",
    wadDetail: "Valleys represent stable cell states — attractors where cells settle. Each valley corresponds to a distinct cell type. The landscape's topology is determined by gene regulatory network architecture.",
    wadSource: "Waddington 1957; Huang et al., BioEssays 2012; Bhattacharya et al., BMC Syst Biol 2011",
    par2Label: "Root-Space Functional Clusters",
    par2Detail: "Genes naturally cluster by functional category in the φ₁–φ₂ plane — clock, identity, proliferation genes occupy distinct regions from two regression coefficients alone. Suggestive parallel: both frameworks find discrete dynamical states in parameter space. However, root-space maps temporal autocorrelation, not gene regulatory network topology directly.",
    par2Evidence: "Functional clustering validated across multiple datasets. Clock, identity, proliferation genes occupy distinct root-space regions.",
    confidence: 82, link: "/root-space",
  },
  {
    id: "wc2", num: 2,
    wadLabel: "Ridges = Forbidden Barriers",
    wadDetail: "Ridges between valleys represent unstable states — dynamical barriers that cells rarely occupy. These forbidden zones separate basins of attraction and enforce the discreteness of cell types.",
    wadSource: "Ferrell, Current Biology 2012; Wang et al., PNAS 2011",
    par2Label: "Root-Space Voids",
    par2Detail: "Root-space consistently shows reproducible void regions — areas where few or no genes map. These voids separate functional clusters and emerge independently across datasets. The void structure is consistent with dynamical constraints, though the specific relationship to gene network barriers remains to be established.",
    par2Evidence: "Void regions reproduced across GSE54652, GSE11923, and genome-wide datasets. GO/KEGG enrichment differs by region.",
    confidence: 85, link: "/root-space",
  },
  {
    id: "wc3", num: 3,
    wadLabel: "Landscape from Network Architecture",
    wadDetail: "The landscape's shape — valleys, depth, barrier heights — is determined by the underlying gene regulatory network. It is not imposed externally but emerges from the network's dynamical properties.",
    wadSource: "Huang, BioEssays 2012; Wang et al., PNAS 2011; Bhattacharya et al., 2011",
    par2Label: "Geometry from Two Coefficients",
    par2Detail: "Root-space geometry emerges from just two AR(2) coefficients (φ₁, φ₂) — a remarkably simple parameterization that produces structured, reproducible landscapes. Conceptually compelling but indirect: AR(2) summarizes temporal dynamics, while Waddington encodes regulatory network interactions.",
    par2Evidence: "Two coefficients produce structured landscapes with clustering, voids, and hierarchy across all datasets tested.",
    confidence: 78, link: "/root-space",
  },
  {
    id: "wc4", num: 4,
    wadLabel: "Differentiation Barrier",
    wadDetail: "The boundary between stem cell valleys and differentiated valleys represents a commitment barrier. Once a cell crosses it (via saddle-node bifurcation), it is locked into a new fate.",
    wadSource: "Ferrell, Current Biology 2012; Lang et al., PLoS Comp Bio 2014",
    par2Label: "Unit Root Stationarity Boundary",
    par2Detail: "The unit circle (|λ| = 1.0) separates persistent states from transient ones. Identity markers cluster at the boundary; proliferation genes sit interior. Suggestive parallel to Waddington's commitment barrier, but the stationarity boundary is a mathematical property of AR processes, not a direct measurement of cell commitment.",
    par2Evidence: "Identity markers at |λ| ≈ 1.0. Proliferation genes at |λ| ≈ 0.82–0.90. APC-KO shifts markers toward boundary.",
    confidence: 80, link: "/root-space",
  },
  {
    id: "wc5", num: 5,
    wadLabel: "Bifurcations = Fate Decisions",
    wadDetail: "Ferrell (2012) formalized branching points as bifurcations — saddle-node bifurcations where valleys disappear (irreversible commitment) and pitchfork bifurcations where valleys split (symmetry-breaking).",
    wadSource: "Ferrell, Current Biology 2012; Huang, BioEssays 2012",
    par2Label: "APC-KO Eigenvalue Shifts",
    par2Detail: "Under APC knockout, stem cell marker eigenvalues shift — root-space positions change in a manner consistent with a bifurcation. Consistent with landscape reshaping by mutation, but represents a single perturbation experiment; more disease models would strengthen the analogy.",
    par2Evidence: "APC-KO: stem marker eigenvalue shifts observed. Limited to one mutation model.",
    confidence: 72, link: "/cell-type-persistence",
  },
];
