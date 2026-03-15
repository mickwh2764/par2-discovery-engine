import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ArrowLeft, ArrowRight, Lock, BookOpen, FlaskConical, Microscope, Star, Map, Brain, Target, Layers, Lightbulb, Package, Dna, Crown } from "lucide-react";
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
  version: string;
  lastUpdated: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  details: { label: string; value: string }[];
  contents: string[];
}

const papers: PaperConfig[] = [
  {
    id: "flagship",
    endpoint: "/api/download/flagship-package",
    title: "Flagship Paper: Temporal Persistence as a Measurable Property of Gene Expression",
    shortTitle: "Consolidated Framework",
    description: "The complete PAR(2) story in one paper. From biological motivation (crypt renewal paradoxes) through AR(2) eigenvalue analysis to genome-wide validation across 20,955 genes, 12 tissues, and 4 species. Integrates persistence hierarchy (clock |λ|=0.647), phase-gated regulation (Wee1 gated by all 8 clock genes), eigenperiod cancer biomarker, PALOMA-3 clinical validation, and four falsifiable predictions.",
    journal: "PLOS Computational Biology",
    version: "1.0",
    lastUpdated: "2026-03-11 UTC",
    icon: <Crown className="w-6 h-6" />,
    color: "text-amber-300",
    bgColor: "bg-gradient-to-br from-amber-600/30 to-orange-600/20",
    borderColor: "border-amber-400/60",
    details: [
      { label: "Scope", value: "Complete unified framework" },
      { label: "Datasets", value: "10 GEO datasets, 4 species, 36 tissue-conditions" },
      { label: "Key results", value: "Hierarchy + Phase-gating + Eigenperiod + Clinical" },
    ],
    contents: [
      "LaTeX source (Flagship_Consolidated_PAR2.tex)",
      "Cover letter (cover_letter.tex)",
      "References bibliography (references.bib)",
      "Table S1: 9-Category Persistence Hierarchy (CSV)",
      "Table S2: Cross-Species Validation (CSV)",
      "Table S3: ODE Model Round-Trip Validation (CSV)",
      "Table S4: Wee1 Phase-Gating by All 8 Clock Genes (CSV)",
      "Table S5: Eigenperiod by Tissue (CSV)",
      "Table S6: Negative Control Panel Results (CSV)",
      "Table S7: 12-Analysis Robustness Suite (CSV)",
      "Table S8: PALOMA-3 Clinical Key Genes (CSV)",
      "README with companion paper references",
    ],
  },
  {
    id: "unified",
    endpoint: "/api/download/unified-package",
    title: "Unified Manuscript: Complete PAR(2) Framework",
    shortTitle: "All-in-One Submission",
    description: "Phase-Amplitude-Relationship (PAR2) Analysis Reveals Emergent Temporal Dynamics in Circadian-Cancer Gene Networks. Combines the full Method+Atlas and Cancer Biology papers into a single comprehensive manuscript with all 26 tables, tri-model ODE validation, ODE round-trip eigenvalue recovery (5/5 pass), eleven-analysis robustness suite, and complete caveats.",
    journal: "Journal Submission Package",
    version: "1.0",
    lastUpdated: "2026-02-26 05:28 UTC",
    icon: <Star className="w-6 h-6" />,
    color: "text-amber-400",
    bgColor: "bg-amber-600/20",
    borderColor: "border-amber-500/50",
    details: [
      { label: "Scope", value: "Methods + Atlas + Cancer Biology" },
      { label: "Datasets", value: "14 dataset-level analyses across 4 species" },
      { label: "Tables", value: "26 tables, 86 references" },

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
    version: "1.0",
    lastUpdated: "2026-02-26 05:28 UTC",
    icon: <BookOpen className="w-6 h-6" />,
    color: "text-blue-400",
    bgColor: "bg-blue-600/20",
    borderColor: "border-blue-500/50",
    details: [
      { label: "Sections", value: "Methods, Results, Discussion" },
      { label: "Datasets", value: "GSE54650 (12 tissues), GSE11923, GSE70499" },
      { label: "Scope", value: "AR(2) method + pan-tissue atlas" },

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
    version: "1.0",
    lastUpdated: "2026-02-26 05:28 UTC",
    icon: <FlaskConical className="w-6 h-6" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-600/20",
    borderColor: "border-emerald-500/50",
    details: [
      { label: "Sections", value: "Methods, Results, Discussion" },
      { label: "Datasets", value: "GSE157357, GSE221103, GSE93903" },
      { label: "Scope", value: "APC two-hit + cancer biology" },

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
    version: "2.0",
    lastUpdated: "2026-02-27 16:13 UTC",
    icon: <Brain className="w-6 h-6" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-600/20",
    borderColor: "border-cyan-500/50",
    details: [
      { label: "Datasets", value: "13 datasets, 4 species" },
      { label: "Validation", value: "ODE round-trip, robustness suite" },
      { label: "Hierarchy", value: "Clock > Target > Background" },

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
    version: "1.0",
    lastUpdated: "2026-02-26 05:28 UTC",
    icon: <Target className="w-6 h-6" />,
    color: "text-rose-400",
    bgColor: "bg-rose-600/20",
    borderColor: "border-rose-500/50",
    details: [
      { label: "Enrichment", value: "60× clock gene enrichment" },
      { label: "Novel genes", value: "22 multi-tissue resonance" },
      { label: "Datasets", value: "6 datasets scanned" },

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
    description: "Maps AR(2)+BMAL1 exogenous coupling across 12 mouse tissues (636 gene-tissue tests). Reports 180-fold enrichment over random predictors, Wee1 coupled in 10/12 tissues, 25 distinct findings (7 consistent with published circadian biology, 10 untested candidates).",
    journal: "Molecular Systems Biology",
    version: "1.0",
    lastUpdated: "2026-02-26 05:58 UTC",
    icon: <Layers className="w-6 h-6" />,
    color: "text-orange-400",
    bgColor: "bg-orange-600/20",
    borderColor: "border-orange-500/50",
    details: [
      { label: "Tissues", value: "12 GSE54650 tissues" },
      { label: "Tests", value: "636 gene-tissue combinations" },
      { label: "Enrichment", value: "180× over random predictors" },

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
    version: "1.0",
    lastUpdated: "2026-02-26 11:51 UTC",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-600/20",
    borderColor: "border-yellow-500/50",
    details: [
      { label: "Type", value: "Perspective / Opinion" },
      { label: "Independence", value: "|λ| vs 4 metrics" },
      { label: "Key result", value: "ρ = 0.08 vs chromatin" },

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
    title: "Complete Paper Suite (A + B + C + D + E + F)",
    shortTitle: "All 6 Papers",
    description: "Download all six companion papers in a single zip. Includes all manuscripts, cover letters, supplementary data tables, and supporting JSON data files organized in separate folders.",
    journal: "Combined Package",
    version: "2.0",
    lastUpdated: "2026-02-27 16:13 UTC",
    icon: <Package className="w-6 h-6" />,
    color: "text-violet-400",
    bgColor: "bg-violet-600/20",
    borderColor: "border-violet-500/50",
    details: [
      { label: "Papers", value: "6 manuscripts" },
      { label: "Journals", value: "PLOS, PNAS, MSB, Cell Sys ×2, Genome Bio" },
      { label: "Data tables", value: "15+ supplementary CSVs" },

    ],
    contents: [
      "Paper A: Core Methods (PLOS Comp Bio)",
      "Paper B: Resonance Zone (PNAS)",
      "Paper C: Coupling Atlas (Mol Sys Bio)",
      "Paper D: Perspective (Cell Systems)",
      "Paper E: Phase-Gated PAR(2) (Cell Systems)",
      "Paper F: Expression Persistence (Genome Biology)",
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
    version: "1.0",
    lastUpdated: "2026-02-26 05:28 UTC",
    icon: <Dna className="w-6 h-6" />,
    color: "text-pink-400",
    bgColor: "bg-pink-600/20",
    borderColor: "border-pink-500/50",
    details: [
      { label: "Innovation", value: "Phase-varying AR(2) coefficients" },
      { label: "Tissues", value: "Liver, Heart, Cerebellum, Intestine" },
      { label: "Discovery", value: "Tiered cross-tissue replication" },

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
    id: "paper-f",
    endpoint: "/api/download/paper-f-package",
    title: "Paper F: Context-Dependent Expression Persistence",
    shortTitle: "Genome Biology",
    description: "Demonstrates that AR(2) eigenvalue |λ| is independent of intrinsic mRNA half-life (ρ = 0.006, n = 5,945 genes) but captures context-dependent expression persistence. Cross-validates against four public datasets (Amit 2009, Tu 2005, Arbeitman 2002, Zaas 2009) with complete bias audits. Key finding: IFIT1 has 31-min mRNA half-life but |λ| = 0.72, revealing sustained interferon-driven retranscription.",
    journal: "Genome Biology",
    version: "2.0",
    lastUpdated: "2026-02-27 15:04 UTC",
    icon: <Microscope className="w-6 h-6" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-600/20",
    borderColor: "border-emerald-500/50",
    details: [
      { label: "Key result", value: "ρ = 0.006 vs mRNA half-life" },
      { label: "Genes", value: "5,945 genes tested" },
      { label: "Datasets", value: "4 cross-validation sets" },

    ],
    contents: [
      "LaTeX source (Paper_F_Expression_Persistence.tex)",
      "Cover letter for Genome Biology",
      "Cross-metric independence data (JSON)",
      "Bias audit results (CSV)",
      "mRNA half-life vs eigenvalue scatter data",
    ],
  },
  {
    id: "fibonacci-reply",
    endpoint: "/api/download/fibonacci-reply-zip",
    title: "Fibonacci Reply Package",
    shortTitle: "Fibonacci Reply",
    description: "Reply to Boman (Fibonacci Quarterly 2025): Golden-Ratio-Like Recursion in Mammalian Circadian Gene Expression — A Stability-Constrained Reanalysis",
    journal: "The Fibonacci Quarterly",
    version: "1.2",
    lastUpdated: "2026-02-26 19:47 UTC",
    icon: <Microscope className="w-6 h-6" />,
    color: "text-purple-400",
    bgColor: "bg-purple-600/20",
    borderColor: "border-purple-500/50",
    details: [
      { label: "Type", value: "Reply / Letter" },
      { label: "Focus", value: "Temporal Fibonacci dynamics" },
      { label: "Method", value: "Stability-filtered AR(2)" },

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

function PaperCard({ paper, password }: { paper: PaperConfig; password: string | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [localPassword, setLocalPassword] = useState("");
  const [localPasswordVerified, setLocalPasswordVerified] = useState<string | null>(password);

  const handleDownload = async () => {
    const pw = localPasswordVerified || password;
    if (!pw) {
      setShowPasswordPrompt(true);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch(paper.endpoint, {
        headers: { 'x-download-password': pw }
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
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/50" data-testid={`text-${paper.id}-version`}>
            v{paper.version}
          </span>
          <span className="text-[11px] text-slate-500 font-mono" data-testid={`text-${paper.id}-timestamp`}>
            {paper.lastUpdated}
          </span>
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

        {showPasswordPrompt && !localPasswordVerified ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!localPassword.trim()) return;
            try {
              const response = await fetch(`/api/verify-download-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: localPassword.trim() }),
              });
              const data = await response.json();
              if (data.valid) {
                setLocalPasswordVerified(localPassword.trim());
                setShowPasswordPrompt(false);
                setError("");
              } else {
                setError("Incorrect password");
              }
            } catch {
              setError("Connection error");
            }
          }} className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter download password"
                value={localPassword}
                onChange={(e) => setLocalPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm"
                data-testid={`input-password-${paper.id}`}
              />
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4">
                Unlock
              </Button>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </form>
        ) : (
          <Button
            onClick={handleDownload}
            disabled={loading}
            className={`w-full py-5 text-white font-semibold transition-all ${
              paper.id === "flagship"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                : paper.id === "unified"
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
                : paper.id === "paper-f"
                ? "bg-emerald-600 hover:bg-emerald-700"
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
        )}
        {error && <p className="text-red-400 text-xs text-center" data-testid={`text-${paper.id}-error`}>{error}</p>}
      </CardContent>
    </Card>
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
  { figure: "Fig E4", title: "Root-Space Geometry", page: "/root-space", description: "Stability triangle with eigenvalue distribution" },
  { figure: "Fig E5", title: "Phase-Gated Coupling Analysis", page: "/phase-gating", description: "Phase-dependent clock-target coupling functions" },
];

export default function ManuscriptDownload() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white" data-testid="text-manuscripts-heading">
            Companion Papers
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

        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="flex items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-600/20">
                <BookOpen className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-bold text-white" data-testid="text-python-package-title">Python Package (par2-circadian v1.0.0)</p>
                <p className="text-xs text-slate-400">Standalone pip-installable package: AR(2) eigenvalue pipeline with CLI and Python API. Requires only NumPy + pandas. MIT license.</p>
              </div>
            </div>
            <a href="/api/download/python-package" download>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2" data-testid="button-download-python-package">
                <Download className="w-4 h-4" />
                Download Package
              </Button>
            </a>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-500/20 text-green-300 ring-1 ring-green-500/40">SUBMITTING NEXT</span>
            <h2 className="text-xl font-bold text-white" data-testid="text-submitting-heading">1. Paper A — Core Methods</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            The foundational paper establishing the AR(2) eigenvalue method. Targeted at PLOS Computational Biology. This is the next paper to submit.
          </p>
          <PaperCard paper={papers.find(p => p.id === "paper-a")!} password={null} />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/40">UNDER REVIEW</span>
            <h2 className="text-xl font-bold text-white" data-testid="text-under-review-heading">2. Paper G — Fibonacci Reply</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Submitted to The Fibonacci Quarterly in November 2025. Currently under peer review.
          </p>
          <PaperCard paper={papers.find(p => p.id === "fibonacci-reply")!} password={null} />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40">SUBMITS AFTER PAPER A</span>
            <h2 className="text-xl font-bold text-white" data-testid="text-flagship-heading">3. Flagship — Consolidated Framework</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            The comprehensive single-paper version combining the full PAR(2) story. Will be submitted after Paper A is accepted.
          </p>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-xl blur-sm"></div>
            <div className="relative">
              <PaperCard paper={papers.find(p => p.id === "flagship")!} password={null} />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40">PLANNED</span>
            <h2 className="text-xl font-bold text-white" data-testid="text-companion-heading">4. Companion Papers (B–F)</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Five focused manuscripts to be submitted after the flagship. Each covers a distinct aspect of the PAR(2) framework: resonance zone, coupling atlas, universal metric perspective, phase-gated gating, and expression persistence.
          </p>
          <div className="mb-4">
            {papers.find(p => p.id === "all-papers") && (
              <PaperCard paper={papers.find(p => p.id === "all-papers")!} password={null} />
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {papers.filter(p => ["paper-b", "paper-c", "paper-d", "paper-e", "paper-f"].includes(p.id)).map((paper) => (
              <PaperCard key={paper.id} paper={paper} password={null} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/40">SUPERSEDED</span>
            <h2 className="text-xl font-bold text-white" data-testid="text-earlier-papers-heading">5. Earlier Drafts</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Previous manuscript versions retained for reference. These have been consolidated into the flagship paper and Paper A above.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {papers.filter(p => ["unified", "paper1", "paper2"].includes(p.id)).map((paper) => (
              <PaperCard key={paper.id} paper={paper} password={null} />
            ))}
          </div>
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
