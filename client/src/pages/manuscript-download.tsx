import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ArrowLeft, ArrowRight, Lock, BookOpen, FlaskConical, Microscope, Unlock, Star, Map, Brain, Target, Layers, Lightbulb, Package, Dna } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import HowTo from "@/components/HowTo";
import { PAPER_TO_PAGES } from "@/components/PaperCrossLinks";

interface PaperConfig {
  id: string;
  endpoint: string;
  title: string;
  shortTitle: string;
  description: string;
  journal: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  details: { label: string; value: string }[];
  contents: string[];
}

const papers: PaperConfig[] = [
  {
    id: "unified",
    endpoint: "/api/download/unified-package",
    title: "Unified Manuscript: Complete PAR(2) Framework",
    shortTitle: "All-in-One Submission",
    description: "Phase-Amplitude-Relationship (PAR2) Analysis Reveals Emergent Temporal Dynamics in Circadian-Cancer Gene Networks. Combines the full Method+Atlas and Cancer Biology papers into a single comprehensive manuscript with all 26 tables, tri-model ODE validation, ODE round-trip eigenvalue recovery (5/5 pass), eleven-analysis robustness suite, and complete caveats.",
    journal: "Journal Submission Package",
    icon: <Star className="w-6 h-6" />,
    color: "text-amber-400",
    bgColor: "bg-amber-600/20",
    borderColor: "border-amber-500/50",
    details: [
      { label: "Scope", value: "Methods + Atlas + Cancer Biology" },
      { label: "Datasets", value: "14 dataset-level analyses across 4 species" },
      { label: "Tables", value: "26 tables, 86 references" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "LaTeX source (PAR2_Complete_Manuscript.tex)",
      "Cover letter (cover_letter_unified.tex)",
      "All raw CSV datasets",
      "Supplementary materials & data",
      "References bibliography",
      "Publication-ready figures",
    ],
  },
  {
    id: "paper1",
    endpoint: "/api/download/paper1-package",
    title: "Paper 1: Method + Atlas",
    shortTitle: "PLOS Comp Bio",
    description: "PAR(2): A Phase-Gated Autoregressive Framework Reveals Tissue-Specific Circadian Gating of Cancer-Relevant Genes Across Mammalian Tissues. 12-tissue survey, Wee1 universal gatekeeper, three-layer hierarchy, ODE validation, seven-analysis robustness suite.",
    journal: "PLOS Computational Biology",
    icon: <BookOpen className="w-6 h-6" />,
    color: "text-blue-400",
    bgColor: "bg-blue-600/20",
    borderColor: "border-blue-500/50",
    details: [
      { label: "Sections", value: "Methods, Results, Discussion" },
      { label: "Datasets", value: "GSE54650 (12 tissues), GSE11923, GSE70499" },
      { label: "Scope", value: "AR(2) method + pan-tissue atlas" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "LaTeX source (Paper1_Method_Atlas.tex)",
      "Cover letter (cover_letter_paper1.tex)",
      "Supplementary tables & data",
      "All raw CSV datasets",
      "References bibliography",
    ],
  },
  {
    id: "paper2",
    endpoint: "/api/download/paper2-package",
    title: "Paper 2: Cancer Biology",
    shortTitle: "Cancer Research",
    description: "Compensatory Circadian Gating and Eigenperiod Dynamics Reveal a Two-Hit Threshold for Clock-Mediated Tumor Suppression. APC compensatory gating, LGR5 stem cell discovery, Pparg MYC-ON target, aging vs cancer trajectories.",
    journal: "Cancer Research",
    icon: <FlaskConical className="w-6 h-6" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-600/20",
    borderColor: "border-emerald-500/50",
    details: [
      { label: "Sections", value: "Methods, Results, Discussion" },
      { label: "Datasets", value: "GSE157357, GSE221103, GSE93903" },
      { label: "Scope", value: "APC two-hit + cancer biology" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "LaTeX source (Paper2_Cancer_Biology.tex)",
      "Cover letter (cover_letter_paper2.tex)",
      "Organoid + neuroblastoma datasets",
      "Aging trajectory datasets",
      "References bibliography",
    ],
  },
  {
    id: "paper-a",
    endpoint: "/api/download/paper-a-package",
    title: "Paper A: Core Methods — AR(2) Eigenvalue Hierarchy",
    shortTitle: "PLOS Comp Bio (Revised)",
    description: "Demonstrates that eigenvalue modulus |λ| from AR(2) regression recovers a three-layer hierarchy (clock > target > genome-wide) across 13 datasets and 4 species, validated by ODE round-trip testing and 11-analysis robustness suite.",
    journal: "PLOS Computational Biology",
    icon: <Brain className="w-6 h-6" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-600/20",
    borderColor: "border-cyan-500/50",
    details: [
      { label: "Datasets", value: "13 datasets, 4 species" },
      { label: "Validation", value: "ODE round-trip, robustness suite" },
      { label: "Hierarchy", value: "Clock > Target > Background" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "LaTeX source (Paper_A_Core_Methods.tex)",
      "Compiled PDF manuscript",
      "Cover letter (PDF + LaTeX)",
      "Table S1: Dataset summaries (CSV)",
      "Table S2: ODE validation (CSV)",
      "Supporting JSON data files",
    ],
  },
  {
    id: "paper-b",
    endpoint: "/api/download/paper-b-package",
    title: "Paper B: Circadian Resonance Zone Discovery",
    shortTitle: "PNAS",
    description: "Reports discovery of a resonance zone in AR(2) root-space where 33% of clock genes cluster vs 0.52% of background genes — a 60-fold enrichment (p < 10⁻⁶) — identifying 22 novel multi-tissue resonance genes.",
    journal: "PNAS",
    icon: <Target className="w-6 h-6" />,
    color: "text-rose-400",
    bgColor: "bg-rose-600/20",
    borderColor: "border-rose-500/50",
    details: [
      { label: "Enrichment", value: "60× clock gene enrichment" },
      { label: "Novel genes", value: "22 multi-tissue resonance" },
      { label: "Datasets", value: "6 datasets scanned" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "LaTeX source (Paper_B_Resonance_Zone.tex)",
      "Compiled PDF manuscript",
      "Cover letter (PDF + LaTeX)",
      "Table S1: All resonance zone genes (CSV)",
      "Table S2: Per-dataset summary (CSV)",
      "Resonance scan results (JSON)",
    ],
  },
  {
    id: "paper-c",
    endpoint: "/api/download/paper-c-package",
    title: "Paper C: 12-Tissue BMAL1 Coupling Atlas",
    shortTitle: "Mol Sys Bio",
    description: "Maps AR(2)+BMAL1 exogenous coupling across 12 mouse tissues (636 gene-tissue tests). Reports 180-fold enrichment over random predictors, Wee1 coupled in 10/12 tissues, 25 distinct findings (7 independently confirmed, 10 novel).",
    journal: "Molecular Systems Biology",
    icon: <Layers className="w-6 h-6" />,
    color: "text-orange-400",
    bgColor: "bg-orange-600/20",
    borderColor: "border-orange-500/50",
    details: [
      { label: "Tissues", value: "12 GSE54650 tissues" },
      { label: "Tests", value: "636 gene-tissue combinations" },
      { label: "Enrichment", value: "180× over random predictors" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "LaTeX source (Paper_C_Coupling_Atlas.tex)",
      "Compiled PDF manuscript",
      "Cover letter (PDF + LaTeX)",
      "Table S1: Clock/target eigenvalues (CSV)",
      "Table S2: Summary statistics (CSV)",
      "Table S3: Eigenvalue distribution (CSV)",
    ],
  },
  {
    id: "paper-d",
    endpoint: "/api/download/paper-d-package",
    title: "Paper D: Memory as a Biological Property (Perspective)",
    shortTitle: "Cell Systems",
    description: "Perspective arguing that eigenvalue modulus captures a genuine biological property — temporal memory — that is nearly independent of chromatin state, network connectivity, and expression amplitude, validated across metrics.",
    journal: "Cell Systems (Perspective)",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-600/20",
    borderColor: "border-yellow-500/50",
    details: [
      { label: "Type", value: "Perspective / Opinion" },
      { label: "Independence", value: "|λ| vs 4 metrics" },
      { label: "Key result", value: "ρ = 0.08 vs chromatin" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "LaTeX source (Paper_D_Perspective.tex)",
      "Compiled PDF manuscript",
      "Cover letter (PDF + LaTeX)",
      "Table S1: Cross-metric correlations (CSV)",
      "Table S2: Partial correlations (CSV)",
      "Scatter plot data (CSV)",
    ],
  },
  {
    id: "all-papers",
    endpoint: "/api/download/all-papers-package",
    title: "Complete Paper Suite (A + B + C + D + E)",
    shortTitle: "All 5 Papers",
    description: "Download all five companion papers in a single zip. Includes all manuscripts, cover letters, supplementary data tables, and supporting JSON data files organized in separate folders.",
    journal: "Combined Package",
    icon: <Package className="w-6 h-6" />,
    color: "text-violet-400",
    bgColor: "bg-violet-600/20",
    borderColor: "border-violet-500/50",
    details: [
      { label: "Papers", value: "5 manuscripts" },
      { label: "Journals", value: "PLOS, PNAS, MSB, Cell Sys ×2" },
      { label: "Data tables", value: "15+ supplementary CSVs" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "Paper A: Core Methods (PLOS Comp Bio)",
      "Paper B: Resonance Zone (PNAS)",
      "Paper C: Coupling Atlas (Mol Sys Bio)",
      "Paper D: Perspective (Cell Systems)",
      "Paper E: Phase-Gated PAR(2) (Cell Systems)",
      "All supplementary tables and JSON data",
    ],
  },
  {
    id: "paper-e",
    endpoint: "/api/download/paper-e-package",
    title: "Paper E: Phase-Gated PAR(2) — Cross-Tissue Gating Architectures",
    shortTitle: "Cell Systems",
    description: "Introduces stability-constrained, phase-dependent AR(2) where coefficients vary smoothly over circadian phase. Maps tissue-specific gating modules (Wee1 in liver, Tead1/YAP1 in heart, Cdk1 in cerebellum) and shows Apc/Bmal1 double mutation collapses gating in organoids.",
    journal: "Cell Systems (Research Article)",
    icon: <Dna className="w-6 h-6" />,
    color: "text-pink-400",
    bgColor: "bg-pink-600/20",
    borderColor: "border-pink-500/50",
    details: [
      { label: "Innovation", value: "Phase-varying AR(2) coefficients" },
      { label: "Tissues", value: "Liver, Heart, Cerebellum, Intestine" },
      { label: "Discovery", value: "Tiered cross-tissue replication" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "LaTeX source (Paper_E_Phase_Gated_PAR2.tex)",
      "Cover letter for Cell Systems",
      "Table S1: Tissue gating modules (CSV)",
      "Table S2: Golden-ratio enrichment (CSV)",
      "Table S3: Tiered hits (CSV)",
      "Table S4: Organoid perturbation (CSV)",
      "Table S5: Eigenvalue summaries (CSV)",
      "Cross-tissue gating data (JSON)",
    ],
  },
  {
    id: "fibonacci-reply",
    endpoint: "/api/download/fibonacci-reply-zip",
    title: "Fibonacci Reply Package",
    shortTitle: "Fibonacci Reply",
    description: "Reply to Boman (Fibonacci Quarterly 2025): Golden-Ratio-Like Recursion in Mammalian Circadian Gene Expression — A Stability-Constrained Reanalysis",
    journal: "The Fibonacci Quarterly",
    icon: <Microscope className="w-6 h-6" />,
    color: "text-purple-400",
    bgColor: "bg-purple-600/20",
    borderColor: "border-purple-500/50",
    details: [
      { label: "Type", value: "Reply / Letter" },
      { label: "Focus", value: "Temporal Fibonacci dynamics" },
      { label: "Method", value: "Stability-filtered AR(2)" },
      { label: "Updated", value: "February 2026" },
    ],
    contents: [
      "LaTeX source (Reply_to_Boman_FQ_2025.tex)",
      "Fibonacci Reply revisions (Markdown)",
      "CGM Fibonacci analysis data (JSON)",
      "Fibonacci proximity results (JSON)",
      "Shanghai T2DM Fibonacci analysis (JSON)",
    ],
  },
];

function PaperCard({ paper, password }: { paper: PaperConfig; password: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(paper.endpoint, {
        headers: { 'x-download-password': password }
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Download failed");
        setLoading(false);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename=(.+)/);
      a.download = filenameMatch ? filenameMatch[1] : `${paper.id}_package.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Card className={`bg-slate-800/50 border ${paper.borderColor} text-white hover:bg-slate-800/70 transition-colors`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-lg ${paper.bgColor}`}>
            <div className={paper.color}>{paper.icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold leading-tight" data-testid={`text-${paper.id}-title`}>
              {paper.title}
            </CardTitle>
            <p className={`text-xs font-medium mt-1 ${paper.color}`}>{paper.journal}</p>
          </div>
        </div>
        <CardDescription className="text-slate-400 text-sm mt-2 leading-relaxed">
          {paper.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {paper.details.map((d) => (
            <div key={d.label} className="bg-slate-700/40 rounded px-3 py-2">
              <span className="text-xs text-slate-400 block">{d.label}</span>
              <span className="text-sm text-slate-200">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-700/30 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-400 mb-2">Package Contents:</p>
          <ul className="space-y-1">
            {paper.contents.map((item, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                <span className="text-slate-400 mt-0.5">-</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {PAPER_TO_PAGES[paper.id] && PAPER_TO_PAGES[paper.id].length > 0 && (
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-400 mb-2">See It Live on Platform:</p>
            <div className="flex flex-wrap gap-1.5">
              {PAPER_TO_PAGES[paper.id].map((pg) => (
                <Link key={pg.path} href={pg.path}>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border cursor-pointer hover:brightness-125 transition ${paper.bgColor} ${paper.borderColor} ${paper.color}`} data-testid={`link-live-${paper.id}-${pg.path.slice(1)}`}>
                    {pg.label}
                    <ArrowRight size={10} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={loading}
          className={`w-full py-5 text-white font-semibold transition-all ${
            paper.id === "unified"
              ? "bg-amber-600 hover:bg-amber-700"
              : paper.id === "paper1"
              ? "bg-blue-600 hover:bg-blue-700"
              : paper.id === "paper2"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : paper.id === "paper-a"
              ? "bg-cyan-600 hover:bg-cyan-700"
              : paper.id === "paper-b"
              ? "bg-rose-600 hover:bg-rose-700"
              : paper.id === "paper-c"
              ? "bg-orange-600 hover:bg-orange-700"
              : paper.id === "paper-d"
              ? "bg-yellow-600 hover:bg-yellow-700"
              : paper.id === "paper-e"
              ? "bg-pink-600 hover:bg-pink-700"
              : paper.id === "all-papers"
              ? "bg-violet-600 hover:bg-violet-700"
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
              <Lock className="w-4 h-4" />
              <Download className="w-4 h-4" />
              Download Submission Package (.zip)
            </span>
          )}
        </Button>
        {error && <p className="text-red-400 text-xs text-center" data-testid={`text-${paper.id}-error`}>{error}</p>}
      </CardContent>
    </Card>
  );
}

function PadlockGate({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setChecking(true);
    setError("");

    try {
      const response = await fetch(`/api/verify-download-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await response.json();
      if (data.valid) {
        onUnlock(password.trim());
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="bg-slate-800/60 border border-slate-700 text-white max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-indigo-400" />
          </div>
          <CardTitle className="text-2xl font-bold" data-testid="text-padlock-heading">
            Manuscript Downloads
          </CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            These manuscripts are password-protected. Enter the password to access the companion paper submission packages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-12 text-center text-lg tracking-widest"
              data-testid="input-padlock-password"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm text-center" data-testid="text-padlock-error">{error}</p>
            )}
            <Button
              type="submit"
              disabled={checking || !password.trim()}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              data-testid="button-padlock-unlock"
            >
              {checking ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Unlock Downloads
                </span>
              )}
            </Button>
          </form>
          <div className="text-center mt-6">
            <Link href="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white text-sm" data-testid="link-padlock-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const FIGURE_MAP = [
  { figure: "Fig 1", title: "Root-Space Geometry & Stationarity Triangle", page: "/root-space", description: "AR(2) coefficient mapping and gene clustering" },
  { figure: "Fig 2", title: "Waddington Landscape", page: "/root-space", description: "Gene density terrain with void annotation" },
  { figure: "Fig 3", title: "Multi-Species Hierarchy Validation", page: "/cross-context-validation", description: "Clock > target ordering across 4 species" },
  { figure: "Fig 4", title: "Genome-Wide AR(2) Distribution", page: "/genome-wide", description: "All genes AR(2) eigenvalue histogram" },
  { figure: "Fig 5", title: "ODE Model Bridge", page: "/model-zoo", description: "Five canonical ODE models vs AR(2) predictions" },
  { figure: "Fig 6", title: "Disease Disruption Screen", page: "/disease-screen", description: "Eigenvalue shifts across disease conditions" },
  { figure: "Fig 7", title: "Cancer Organoid Comparison", page: "/cancer-browser", description: "WT vs APC-KO gearbox gap analysis" },
  { figure: "Fig 8", title: "Human Circadian Disruption", page: "/human-disruption", description: "Sleep restriction and forced desynchrony" },
  { figure: "Fig 9", title: "Robustness Suite Results", page: "/robustness-suite", description: "Bootstrap, permutation, and stationarity tests" },
  { figure: "Fig 10", title: "Cell-Type Persistence Hierarchy", page: "/cell-type-persistence", description: "Three-layer Identity > Clock > Proliferation" },
  { figure: "Fig 11", title: "Drug Target Root-Space Overlay", page: "/root-space", description: "326 drug targets mapped to dynamical positions" },
  { figure: "Table S2", title: "AR(1) vs AR(2) vs AR(3) Model Comparison", page: "/validation-suite", description: "AIC/BIC information criteria across 8 datasets" },
  { figure: "Fig E1", title: "Phase-Dependent Gating (PAR(2))", page: "/phase-portrait", description: "Animated 24h cycle with phase-varying clock-target coupling" },
  { figure: "Fig E2", title: "Cross-Tissue Gating Architectures", page: "/cross-context-validation", description: "Tissue-specific gating modules and cross-tissue replication" },
  { figure: "Fig E3", title: "Organoid Perturbation (Apc/Bmal1)", page: "/cancer-browser", description: "Gating collapse in Apc/Bmal1 double mutant organoids" },
  { figure: "Fig E4", title: "Golden-Ratio Eigenstructure Region", page: "/root-space", description: "Stability triangle with golden-ratio-like clustering" },
  { figure: "Fig E5", title: "Phase-Gated Coupling Analysis", page: "/phase-gating", description: "Phase-dependent clock-target coupling functions" },
];

export default function ManuscriptDownload() {
  const [unlockedPassword, setUnlockedPassword] = useState<string | null>(null);

  if (!unlockedPassword) {
    return <PadlockGate onUnlock={setUnlockedPassword} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center">
            <Unlock className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white" data-testid="text-manuscripts-heading">
            Companion Paper Downloads
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Unified manuscript and companion papers on the PAR(2) Discovery Engine framework. Each download includes LaTeX source, cover letters, and datasets.
          </p>
        </div>

        <HowTo
          title="Manuscript & Figures"
          summary="Download the companion manuscript drafts, supplementary materials, and publication-ready figures. All figures are generated from the same data and analyses available on this platform."
          steps={[
            { label: "Download manuscripts", detail: "Click the download buttons to get the PLOS Computational Biology and Cancer Research manuscript drafts." },
            { label: "Export figures", detail: "Individual figures can be downloaded in high-resolution PNG or SVG format for publication." }
          ]}
        />

        <Card className="bg-slate-800/50 border border-slate-700 text-white mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-indigo-600/20">
                <Map className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold" data-testid="text-figure-map-title">Interactive Figure Map</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Every figure in the manuscripts has a live, interactive counterpart on this platform. Click any figure to explore the data yourself.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {FIGURE_MAP.map((item) => (
                <Link key={item.figure} href={item.page}>
                  <div
                    className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/50 transition cursor-pointer flex flex-col gap-2 h-full"
                    data-testid={`card-figure-${item.figure.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-indigo-500/20 px-2 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
                        {item.figure}
                      </span>
                      <span className="text-sm font-bold text-white leading-tight">{item.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 flex-1">{item.description}</p>
                    <div className="flex items-center gap-1 text-xs font-medium text-indigo-400 mt-1">
                      View Live <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border border-teal-500/30 text-white mb-6">
          <CardContent className="flex items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-teal-600/20">
                <BookOpen className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <p className="font-bold text-white" data-testid="text-user-guide-title">User Guide &amp; Handbook</p>
                <p className="text-xs text-slate-400">Complete guide to every feature, page, and concept — no password required. Save as PDF from your browser's print dialog.</p>
              </div>
            </div>
            <a href="/api/download/user-guide" download>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-2" data-testid="button-download-user-guide">
                <Download className="w-4 h-4" />
                Download Guide
              </Button>
            </a>
          </CardContent>
        </Card>

        <div className="mb-6">
          <PaperCard paper={papers[0]} password={unlockedPassword} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {papers.filter(p => ["paper1", "paper2", "fibonacci-reply"].includes(p.id)).map((paper) => (
            <PaperCard key={paper.id} paper={paper} password={unlockedPassword} />
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1" data-testid="text-new-papers-heading">Companion Paper Suite (A-E)</h2>
          <p className="text-sm text-slate-400 mb-4">
            Five focused manuscripts covering the core AR(2) method, resonance zone discovery, BMAL1 coupling atlas, eigenvalue as a universal metric, and phase-gated cross-tissue gating architectures.
          </p>
        </div>

        <div className="mb-6">
          {papers.find(p => p.id === "all-papers") && (
            <PaperCard paper={papers.find(p => p.id === "all-papers")!} password={unlockedPassword} />
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {papers.filter(p => ["paper-a", "paper-b", "paper-c", "paper-d", "paper-e"].includes(p.id)).map((paper) => (
            <PaperCard key={paper.id} paper={paper} password={unlockedPassword} />
          ))}
        </div>


        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
