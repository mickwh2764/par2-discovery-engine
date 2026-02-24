import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Dna, Clock, Activity, Target, Shield, Globe, Beaker, TrendingUp,
  ArrowRight, CheckCircle2, Atom, BarChart3, FileText, Upload,
  GitBranch, Zap, Brain, Layers, AlertTriangle, Microscope,
  ChevronRight, BookOpen
} from "lucide-react";
import HowTo from "@/components/HowTo";
import EvidenceLink from "@/components/EvidenceLink";

const PLATFORM_FEATURES = [
  { title: "Root-Space Geometry", route: "/root-space", icon: "Atom", color: "cyan", description: "Map genes into coefficient space with 5 interpretive overlays: Waddington landscape, phase portrait, functional geography, PCA comparison, and drug target overlay." },
  { title: "Discovery Engine", route: "/discovery-engine", icon: "Upload", color: "emerald", description: "Upload your own CSV data for real-time AR(2) eigenvalue analysis with edge-case diagnostics and confidence scoring." },
  { title: "Genome-Wide Validation", route: "/genome-wide", icon: "Globe", color: "blue", description: "Run AR(2) on all ~20,000 genes in a dataset to see the full eigenvalue distribution and hierarchy emergence." },
  { title: "Disease Screen", route: "/disease-screen", icon: "Activity", color: "red", description: "Compare eigenvalue persistence shifts between matched healthy and disease conditions across 10 disease pairs." },
  { title: "Cancer Browser", route: "/cancer-browser", icon: "Target", color: "purple", description: "Analyze the gearbox gap across cancer cohorts with FDR guidance and verification checks." },
  { title: "ODE Model Zoo", route: "/model-zoo", icon: "Beaker", color: "amber", description: "Simulate five canonical ODE models and verify AR(2) eigenvalue predictions against known dynamical systems. Includes independent ODE-to-AR(2) round-trip validation (5/5 pass)." },
  { title: "Robustness Suite", route: "/robustness-suite", icon: "Shield", color: "emerald", description: "Seven-analysis robustness framework: sub-sampling, bootstrap CIs, permutation tests, stationarity defenses." },
  { title: "Human Disruption", route: "/human-disruption", icon: "Clock", color: "blue", description: "Sleep restriction and forced desynchrony studies showing real-world circadian disruption effects." },
  { title: "Gene Explorer", route: "/gene-explorer", icon: "Dna", color: "cyan", description: "Track any gene across 72 datasets. Compare up to 5 genes side-by-side with Fibonacci enrichment analysis." },
  { title: "Cell-Type Persistence", route: "/cell-type-persistence", icon: "Layers", color: "red", description: "Discover the three-layer temporal hierarchy: Identity > Clock > Proliferation across cell-type markers." },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Atom, Upload, Globe, Activity, Target, Beaker, Shield, Clock, Dna, Layers,
};

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; hoverBorder: string }> = {
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30", hoverBorder: "hover:border-cyan-500/30" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", hoverBorder: "hover:border-emerald-500/30" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", hoverBorder: "hover:border-blue-500/30" },
  red: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", hoverBorder: "hover:border-red-500/30" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", hoverBorder: "hover:border-purple-500/30" },
  amber: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", hoverBorder: "hover:border-amber-500/30" },
};

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        <header className="text-center space-y-6">
          <div className="flex justify-center">
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/50 px-4 py-1 text-sm">
              v2.2.0
            </Badge>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent leading-tight" data-testid="text-about-title">
            PAR(2) Discovery Engine
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            A Low-Dimensional Framework for Quantifying Circadian Hierarchy Persistence
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/">
              <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium gap-2" data-testid="button-go-to-home">
                <Dna size={16} />
                Go to Home
              </Button>
            </Link>
            <Link href="/getting-started">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-2" data-testid="button-getting-started">
                <BookOpen size={16} />
                Getting Started
              </Button>
            </Link>
          </div>
        </header>

        <HowTo
          title="About This Platform"
          summary="Background information about the PAR(2) Discovery Engine, the research team, the scientific motivation, and the underlying methodology. Start here if you want to understand what this platform does and why."
          steps={[
            { label: "Read the overview", detail: "Learn what the AR(2) eigenvalue framework is and why it matters for circadian biology." },
            { label: "Explore the methodology", detail: "Understand how AR(2) models are fit to gene expression time series and what eigenvalues represent." }
          ]}
        />

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Executive Summary</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              Circadian biology traditionally classifies genes as "rhythmic" or "non-rhythmic," a binary distinction based on periodicity. This approach overlooks a deeper and more consequential property: <strong className="text-white">temporal persistence</strong> — how strongly clock-derived timing information propagates across successive cellular states.
            </p>
            <p>
              The PAR(2) Discovery Engine introduces a minimal dynamical systems framework that quantifies this persistence using second-order autoregressive (AR(2)) modeling. Rather than asking whether a gene oscillates, the framework measures how strongly its expression at one time point predicts future behavior via the eigenvalue modulus |λ| derived from AR(2) coefficients.
            </p>
            <div className="bg-slate-900/80 border border-slate-600 rounded-lg p-5 text-center font-mono text-cyan-300 text-xl">
              x<sub>t</sub> = β₁ x<sub>t-1</sub> + β₂ x<sub>t-2</sub> + ε<sub>t</sub>
            </div>
            <p>
              The eigenvalue modulus provides a continuous measure of temporal memory:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-emerald-400 font-mono">|λ| ≈ 1</span>
                <span className="text-sm text-slate-400">Strong persistence (long memory)</span>
              </div>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-400 font-mono">|λ| ≈ 0</span>
                <span className="text-sm text-slate-400">Rapid decay (no memory)</span>
              </div>
            </div>
            <p>
              This formulation captures intergenerational propagation of temporal information — including delayed and multi-step effects — in a low-dimensional, statistically testable manner.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">What This Is Not</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              Existing circadian analysis tools — JTK_CYCLE <span className="text-slate-400">(Hughes et al. 2010)</span>, RAIN <span className="text-slate-400">(Thaben & Westermark 2014)</span>, MetaCycle <span className="text-slate-400">(Wu et al. 2016)</span>, CircaCompare <span className="text-slate-400">(Parsons et al. 2020)</span>, and ARSER <span className="text-slate-400">(Yang & Su 2010)</span> — answer the question: <em>"Is this gene rhythmic?"</em> They detect oscillation and measure period, amplitude, and phase.
            </p>
            <p>
              <strong className="text-white">PAR(2) does not detect rhythms.</strong> It measures temporal persistence via the eigenvalue modulus |λ| of an AR(2) process. This is mathematically independent of oscillation amplitude (Spearman ρ = 0.26 across ~20,000 genes). A gene can be highly persistent without being rhythmic, or strongly rhythmic without being persistent. These are different biological states. <EvidenceLink label="See independence analysis" to="/validation-suite" hash="eigenvalue-independence" /> <EvidenceLink label="Robustness suite" to="/robustness-suite" />
            </p>
            <p>
              ARSER <span className="text-slate-400">(Yang & Su 2010)</span> notably uses autoregressive spectral estimation — the same AR mathematical framework — but extracts only period and amplitude from it, discarding the eigenvalue structure. PAR(2) recovers and analyzes what ARSER discards.
            </p>
            <p>
              Prior autoregressive work in gene expression (sparse VAR for network inference, <span className="text-slate-400">Fujita et al. 2007</span>; wavelet dynamic VAR, <span className="text-slate-400">Sato et al. 2007</span>) used AR models to infer causal regulatory edges between genes. None applied eigenvalue decomposition to quantify intrinsic temporal persistence of individual genes.
            </p>
            <p>
              The most ambitious recent comparator, COFE <span className="text-slate-400">(Ananthasubramaniam & Venkataramanan 2025, PLOS Biology)</span>, uses unsupervised ML to detect rhythms in unlabeled cancer transcriptomes — a different and complementary approach asking "what oscillates in tumors without time labels?"
            </p>
            <p className="text-slate-400 text-base italic border-t border-slate-700 pt-4">
              These tools are cited for positioning, not competition. PAR(2) complements rhythm detection; it does not replace it. The eigenvalue modulus adds a new measurement axis to the same data these tools already analyze.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Independent Convergence</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              The multi-generational memory that AR(2) captures — where a cell's state depends on both its mother and grandmother — has been independently demonstrated in cell lineage research:
            </p>
            <div className="space-y-3">
              <div className="bg-slate-900/80 border border-slate-600 rounded-lg p-4">
                <p className="text-white font-medium">Phillips et al. (2019) Nature Communications</p>
                <p className="text-slate-400 text-sm">"Mean transcriptional activity is transmitted from mother to daughter cells, leading to multi-generational transcriptional memory." Demonstrated using live-cell imaging with luminescent reporters across cell divisions.</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-600 rounded-lg p-4">
                <p className="text-white font-medium">Kuchen et al. (2020) eLife</p>
                <p className="text-slate-400 text-sm">"Hidden long-range memories of growth and cycle speed correlate cell cycles in lineage trees." Two coupled heritable quantities — growth/size and cell-cycle progression speed — explain correlations across 10-generation neuroblastoma lineage trees. Strong external justification for the two-term memory structure in AR(2).</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-600 rounded-lg p-4">
                <p className="text-white font-medium">Sandler et al. (2015) Nature</p>
                <p className="text-slate-400 text-sm">Lineage correlations of single cell division time as a probe of cell-cycle dynamics. Established that cell-cycle timing carries multi-generational correlations.</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-600 rounded-lg p-4">
                <p className="text-white font-medium">Binder et al. (2024) Nature Communications (GEMLI)</p>
                <p className="text-slate-400 text-sm">Reconstructed cell lineages from scRNA-seq data using gene expression memory alone — proving the memory is strong enough to infer family trees without experimental tracing.</p>
              </div>
            </div>
            <p>
              These papers are from the cell lineage / single-cell genomics community. None connected multi-generational memory to circadian biology. PAR(2) is the first framework to measure this memory structure in circadian time-series data, bridging two fields that were asking the same underlying question independently.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Microscope className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Mechanistic Support</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              Independent experimental work provides direct mechanistic evidence for the biological processes PAR(2) quantifies:
            </p>
            <div className="space-y-3">
              <div className="bg-slate-900/80 border border-emerald-600/40 rounded-lg p-4">
                <p className="text-white font-medium">Hwang-Verslues et al. (2023) Scientific Reports</p>
                <p className="text-slate-400 text-sm">BMAL1 transcriptionally activates MEX3A, which binds and stabilizes Lgr5 mRNA in intestinal crypt cells. A clean mechanistic bridge between clock machinery and stemness marker maintenance — timing control directly reshapes the renewal hierarchy.</p>
              </div>
              <div className="bg-slate-900/80 border border-emerald-600/40 rounded-lg p-4">
                <p className="text-white font-medium">Stokes et al. (2021) Cell Mol Gastroenterol Hepatol</p>
                <p className="text-slate-400 text-sm">Loss of BMAL1 or environmental circadian disruption increases tumor initiation in Apc-min mice. Circadian photoperiod disruption rewires ISC pathway dominance (high YAP/Hippo, low Wnt). Direct evidence that temporal order is tumor-suppressive at the initiation stage.</p>
              </div>
              <div className="bg-slate-900/80 border border-emerald-600/40 rounded-lg p-4">
                <p className="text-white font-medium">Andersen, Duan & Karri (2023) Stem Cells</p>
                <p className="text-slate-400 text-sm">Review summarizing diurnal oscillations in epithelial stem cell proliferation across tissues. Intrinsic circadian clock function is required for proliferative rhythms, providing biological plausibility for PAR(2)'s temporal architecture.</p>
              </div>
              <div className="bg-slate-900/80 border border-emerald-600/40 rounded-lg p-4">
                <p className="text-white font-medium">IBD Epigenetic Memory (2025) bioRxiv</p>
                <p className="text-slate-400 text-sm">Patient-matched organoids from prior-inflamed regions retain thousands of distinct accessible chromatin regions. Silent at baseline, but re-challenge produces heightened responses — direct empirical support for memory in renewal systems that is silent until perturbed.</p>
              </div>
            </div>
            <p>
              Together with the lineage memory papers above, these studies confirm that (1) circadian clocks directly regulate stem cell renewal hierarchies, (2) disrupting temporal order potentiates tumorigenesis, and (3) epithelial tissues retain persistent memory states — precisely the phenomena PAR(2) eigenvalue analysis quantifies.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Central Finding: The Persistence Gap</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              Across <strong className="text-white">14 dataset-level analyses</strong> spanning <strong className="text-white">four species</strong> (mouse, human, baboon, Arabidopsis), clock genes consistently exhibit higher eigenvalue moduli than the target genes they regulate. Note: some datasets share cohort-level variance; cross-tissue claims are qualified by block permutation testing.
            </p>
            <p>
              This difference — termed the <strong className="text-cyan-400">persistence gap</strong> — reflects a hierarchical organization:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-5">
                <div className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Clock Genes
                </div>
                <p className="text-sm text-slate-400">
                  Function as stable temporal reference nodes with high persistence
                </p>
              </div>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-5">
                <div className="text-slate-300 font-semibold mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Target Genes
                </div>
                <p className="text-sm text-slate-400">
                  Respond with lower persistence, maintaining flexible downstream dynamics
                </p>
              </div>
            </div>
            <p>
              At the dataset-aggregate level, 14/14 analyses preserve <strong className="text-emerald-400">clock &gt; target ordering</strong>. However, tissue-level resolution varies: baboon data (GSE98965) shows preservation in 8/14 individual tissues (57%), indicating the hierarchy is robust at the aggregate level but not universal across every tissue. <EvidenceLink label="See cross-species data" to="/cross-context-validation" hash="hierarchy-summary" /> <EvidenceLink label="Multi-species panel" to="/species-comparison" /> <EvidenceLink label="Yeast validation" to="/yeast-validation" /> <EvidenceLink label="Human disruption" to="/human-disruption" />
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Perturbation Sensitivity</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              The framework distinguishes between different biological perturbations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5">
                <div className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Aging
                </div>
                <p className="text-sm text-slate-400">
                  Gradual narrowing of the persistence gap — the clock weakens but the hierarchy persists
                </p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5">
                <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                  <Activity size={16} />
                  Cancer Organoids (ApcKO)
                </div>
                <p className="text-sm text-slate-400">
                  Abrupt collapse or inversion of the gap — targets acquire persistence comparable to clock genes
                </p>
              </div>
            </div>
            <p>
              In cancer models, root-space distributions shift significantly (Mann-Whitney p &lt; 0.001), with targets acquiring persistence comparable to clock genes. This pattern is distinct from age-matched controls and from gradual aging trajectories. <EvidenceLink label="See perturbation analysis" to="/root-space" hash="perturbation-shifts" /> <EvidenceLink label="Disease screen" to="/disease-screen" />
            </p>
            <p>
              These results suggest that <strong className="text-white">loss of circadian hierarchical separation is associated with oncogenic disruption</strong>. <EvidenceLink label="Drug target durability" to="/drug-durability" variant="inline" />
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Atom className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Root-Space Geometry</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              Mapping AR(2) coefficients into root space (r, θ) reveals non-uniform clustering relative to phase-randomized null models.
            </p>
            <p className="font-semibold text-white">Key structural observations:</p>
            <ul className="space-y-3 text-base">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                <span>Strong concentration of biological genes near θ ≈ 0° (monotonic decay regime), significantly exceeding null expectations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                <span>φ-band occupancy enrichment (Bonferroni-corrected p = 0.0048) under the primary angular reference (θ = 2π/φ) <EvidenceLink label="See enrichment tests" to="/root-space" hash="phi-enrichment" variant="inline" /></span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                <span>Threshold sweep (19 cutoffs) demonstrates enrichment persists across a range of D<sub>φ</sub> values (peak 2.2× at D<sub>φ</sub> &lt; 0.8)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                <span>Mapping sensitivity analysis confirms partial robustness (2/3 plausible angular references significant), with enrichment over analytical baseline observed only under the production mapping</span>
              </li>
            </ul>
            <p>
              These findings indicate <strong className="text-white">structured stability geometry</strong> rather than uniform AR(2) coefficient sampling. <EvidenceLink label="Explore root-space" to="/root-space" hash="enrichment-tests" />
            </p>
            <p className="text-slate-400 text-base italic">
              The Fibonacci reference point (β₁, β₂) = (1,1) lies outside the stationary region; the analysis treats φ as a geometric reference axis, not a universal attractor.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Model Validation and Safeguards</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              The framework incorporates multiple reliability checks:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                "Stationarity enforcement (|λ| < 1)",
                "Augmented Dickey-Fuller pre-screening",
                "Ljung-Box residual diagnostics",
                "AR(1) vs AR(2) order comparison",
                "Structural break testing (Chow)",
                "Block bootstrap robustness",
                "Phase-randomized surrogate nulls",
              ].map((check) => (
                <div key={check} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-400">{check}</span>
                </div>
              ))}
            </div>
            <p>
              ODE simulations (Goodwin, van der Pol, Tyson-Novak, Lotka-Volterra, FitzHugh-Nagumo) confirm that AR(2) captures regime shifts and persistence structure from nonlinear systems when projected into low-dimensional dynamics. <EvidenceLink label="See ODE round-trip validation" to="/model-zoo" hash="round-trip" />
            </p>
            <p className="text-emerald-400 font-medium">
              All analyses use deterministic seeded computation (seed=42) and publicly accessible GEO datasets.
            </p>
          </div>
        </section>

        <section className="space-y-6" data-testid="section-why-ar2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Why AR(2) Instead of Simpler Methods?</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              A fair question: why use a second-order autoregressive model when simpler metrics exist? Here's what each approach captures — and misses:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-slate-200 text-base">Variance (SD)</p>
                <p className="text-sm text-slate-400">Measures spread but is blind to temporal order. Shuffling timepoints doesn't change variance — so it cannot distinguish oscillation from noise.</p>
                <p className="text-xs text-red-400">Misses: persistence, oscillation, memory</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-slate-200 text-base">Lag-1 Autocorrelation (AR(1))</p>
                <p className="text-sm text-slate-400">Captures first-order persistence (does expression carry forward one step?) but cannot detect oscillatory dynamics requiring two lags to characterize.</p>
                <p className="text-xs text-amber-400">Misses: oscillation period, complex eigenvalues</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-slate-200 text-base">AR(2) Eigenvalue Modulus</p>
                <p className="text-sm text-slate-400">Captures both persistence strength and oscillatory structure in a single metric. The eigenvalue modulus integrates how strongly past states influence the future across two generations.</p>
                <p className="text-xs text-emerald-400">Captures: persistence + oscillation + multi-step memory</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Our <Link href="/validation-suite" className="text-cyan-400 hover:underline">Validation Suite</Link> includes AIC/BIC information criteria confirming AR(2) preference across most datasets. However, AR(2) is not universally better — for short time series ({"<"}8 points) or purely monotonic trends, simpler models may be more appropriate.
            </p>
          </div>
        </section>

        <section className="space-y-6" data-testid="section-explore-platform">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Explore the Platform</h2>
              <p className="text-slate-400 text-sm mt-1">Every analysis page is interactive. Click to explore.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORM_FEATURES.map((feature) => {
              const IconComponent = ICON_MAP[feature.icon];
              const colors = COLOR_CLASSES[feature.color];
              return (
                <div
                  key={feature.route}
                  className={`bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:bg-slate-800/80 transition-all ${colors.hoverBorder}`}
                  data-testid={`card-feature-${feature.route.replace('/', '')}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      {IconComponent && <IconComponent className={`w-4 h-4 ${colors.text}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base">{feature.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{feature.description}</p>
                      <Link href={feature.route}>
                        <span className="text-sm text-cyan-400 flex items-center gap-1 mt-3 hover:text-cyan-300" data-testid={`link-explore-${feature.route.replace('/', '')}`}>
                          Explore <ChevronRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Interpretation</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              The results support a parsimonious dynamical model of circadian organization:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
                <div className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Healthy Tissue
                </div>
                <p className="text-sm text-slate-400">
                  Maintains a stable persistence hierarchy
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5">
                <div className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Aging
                </div>
                <p className="text-sm text-slate-400">
                  Weakens but preserves this hierarchy
                </p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5">
                <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                  <Activity size={16} />
                  Oncogenic Perturbation
                </div>
                <p className="text-sm text-slate-400">
                  Disrupts or collapses the hierarchy entirely
                </p>
              </div>
            </div>
            <p>
              The eigenvalue modulus thus provides a <strong className="text-white">continuous metric of circadian structural integrity</strong> beyond binary rhythmicity classification. <EvidenceLink label="See external benchmarks" to="/framework-benchmarks" hash="turing-detail" /> <EvidenceLink label="Model zoo validation" to="/model-zoo" hash="round-trip" />
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-600/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Scope and Limits</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-5 text-slate-300 text-lg leading-relaxed">
            <p>
              The framework quantifies persistence geometry; it does not assert mechanistic causality. φ-related structure appears as a constrained subregion within root space and is partially reference-robust but not universally invariant.
            </p>
            <p>
              Wearable device analyses extend the methodology to physiological time series; these applications are exploratory and distinct from gene-expression validation.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Platform Capabilities</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                icon: <Dna size={18} />,
                title: "AR(2) Analysis Dashboard",
                desc: "Upload gene expression CSV data, fit AR(2) models, compute eigenvalue moduli, and visualize clock vs target hierarchies across tissues.",
                link: "/",
                color: "text-emerald-400"
              },
              {
                icon: <Upload size={18} />,
                title: "Discovery Engine (Wearable Data)",
                desc: "Analyze your own wearable device data (CGM, Oura Ring) with real-time AR(2) eigenvalue profiling, stability ring visualization, state-space plots, and residual diagnostics.",
                link: "/discovery-engine",
                color: "text-violet-400"
              },
              {
                icon: <Beaker size={18} />,
                title: "ODE Model Zoo",
                desc: "Validate AR(2) predictions against 5 canonical differential equation models from biology using RK4 numerical integration.",
                link: "/model-zoo",
                color: "text-emerald-400"
              },
              {
                icon: <Globe size={18} />,
                title: "Multi-Species Validation",
                desc: "Cross-species hierarchy confirmation across 4 species and 14 datasets — 14/14 preserved at dataset-aggregate level; tissue-level preservation varies (e.g. baboon: 8/14 tissues, 57%).",
                link: "/validation-suite",
                color: "text-cyan-400"
              },
              {
                icon: <BarChart3 size={18} />,
                title: "Genome-Wide Screening",
                desc: "Run AR(2) on all ~20,000+ genes to verify the hierarchy emerges without curated panels. Wilcoxon rank-sum and permutation testing included.",
                link: "/genome-wide",
                color: "text-violet-400"
              },
              {
                icon: <Activity size={18} />,
                title: "Cancer Browser",
                desc: "Compare eigenvalue trajectories between healthy tissue, aging, and cancer organoids to identify distinct disease signatures and gap collapse patterns.",
                link: "/cancer-browser",
                color: "text-red-400"
              },
              {
                icon: <Atom size={18} />,
                title: "Root-Space Geometry & φ-Enrichment",
                desc: "Map AR(2) coefficients to root space, visualize stationarity boundaries, run threshold sweeps, angular distribution analysis, and test golden-mean proximity enrichment with formal null distributions.",
                link: "/root-space",
                color: "text-purple-400"
              },
              {
                icon: <Shield size={18} />,
                title: "Robustness Suite",
                desc: "Comprehensive robustness framework: sub-sampling recovery, bootstrap CIs, stationarity testing (ADF/KPSS), rolling window stability, first-difference and linear detrending defences, gap permutation test (10K shuffles), leave-one-tissue-out cross-validation, and population-level cross-validation.",
                link: "/robustness-suite",
                color: "text-orange-400"
              },
            ].map((cap) => (
              <Link key={cap.title} href={cap.link}>
                <div className="bg-slate-800/50 border border-slate-700 hover:border-slate-500 rounded-xl p-5 flex items-start gap-4 cursor-pointer transition-all group" data-testid={`link-capability-${cap.link.replace('/', '')}`}>
                  <div className={`mt-1 ${cap.color}`}>{cap.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      {cap.title}
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-sm text-slate-400 mt-1">{cap.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-violet-500/10 border border-cyan-500/20 rounded-2xl p-10 text-center space-y-5">
          <h2 className="text-3xl font-bold text-white">Conclusion</h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            The PAR(2) Discovery Engine introduces a reproducible, low-dimensional dynamical measure of circadian hierarchy that replicates across species and datasets, distinguishes aging from oncogenic perturbation, and reveals structured stability geometry beyond rhythmic classification. It provides a quantitative lens for evaluating temporal control integrity in biological systems.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/">
              <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium gap-2" data-testid="button-explore-platform">
                <ArrowRight size={16} />
                Explore the Platform
              </Button>
            </Link>
          </div>
        </section>

        <footer className="text-center text-sm text-slate-400 py-8 border-t border-slate-700">
          <p>PAR(2) Discovery Engine v2.2.0 — Built for open science and reproducible circadian research.</p>
          <p className="mt-1 text-xs text-slate-400 font-mono">Build locked: February 20, 2026</p>
          <p className="mt-2">Patent Pending UK</p>
        </footer>

      </div>
    </div>
  );
}
