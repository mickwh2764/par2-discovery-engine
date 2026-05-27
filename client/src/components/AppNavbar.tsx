import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dna, Activity, Atom, Mountain, Globe, Layers, Flame, MapPin, Network,
  Heart, Target, AlertTriangle, Pill, FlaskConical, GitCompare,
  CheckCircle2, Shield, Moon, Beaker, Microscope, Bug,
  BookOpen, Info, Lock, ShieldCheck, Sparkles, ChevronDown,
  Menu, Home, Upload, Search, Award, CircleDot, BarChart3, FolderOpen, Zap, ChevronRight,
  FileText, Compass, TestTube, Brain, Clock, TrendingDown, Map, Watch, Sun, Eye,
  BarChart2, Download, Database, RefreshCw, History,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Paper A",
    color: "from-blue-600 to-indigo-600",
    items: [
      { label: "The Claim", href: "#claim", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/category-tests", icon: BarChart3, color: "text-emerald-400", label: "Category Tests", desc: "Clock > target > background hierarchy" },
      { href: "/dashboard", icon: BarChart3, color: "text-blue-400", label: "Dashboard", desc: "See it across 22 datasets" },
      { href: "/genome-wide", icon: Globe, color: "text-blue-400", label: "Genome-Wide Scan", desc: "Every gene individually" },
      { href: "/gene-explorer", icon: Dna, color: "text-pink-400", label: "Gene Explorer", desc: "Look up any specific gene" },
      { label: "Does It Replicate?", href: "#replication", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/cross-context-validation", icon: Layers, color: "text-rose-400", label: "Cross-Context Validation", desc: "4 species, 12 tissues, 36 series" },
      { href: "/literature-validation", icon: BookOpen, color: "text-emerald-400", label: "Literature Validation", desc: "59 known genes — 98.3% match" },
      { href: "/model-zoo", icon: Beaker, color: "text-orange-400", label: "Model Zoo", desc: "6 ODE models + Floquet analysis" },
      { href: "/framework-benchmarks", icon: Award, color: "text-amber-400", label: "Framework Benchmarks", desc: "vs JTK_CYCLE, cosinor, RAIN" },
      { href: "/method-validation", icon: BarChart3, color: "text-sky-400", label: "Method Validation", desc: "Monte Carlo bias/RMSE · Tables S6 & S7" },
      { label: "Is It Robust?", href: "#robustness", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/robustness-suite", icon: Shield, color: "text-blue-400", label: "Robustness Suite", desc: "12 statistical stress tests" },
      { href: "/validation-suite", icon: TestTube, color: "text-amber-400", label: "Validation Suite", desc: "Edge-case diagnostics & eigenvalue independence" },
      { href: "/decomposition-stability", icon: Shield, color: "text-blue-400", label: "Decomposition Stability", desc: "Driver removal stability" },
      { href: "/validation-summary", icon: CheckCircle2, color: "text-emerald-400", label: "Validation Summary", desc: "All evidence at a glance" },
      { href: "/core-evidence", icon: ShieldCheck, color: "text-sky-400", label: "Core Evidence", desc: "4-panel skeptic primer" },
      { href: "/manuscript-validation", icon: ShieldCheck, color: "text-emerald-400", label: "Manuscript Validation", desc: "Live reproduction of claims" },
      { label: "Try It Yourself", href: "#try", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/discovery-engine", icon: Activity, color: "text-purple-400", label: "Discovery Engine", desc: "Upload & analyze your own data" },
    ],
  },
  {
    label: "Papers E\u2013Q",
    color: "from-violet-600 to-purple-600",
    items: [
      { label: "Geometry & Structure", href: "#geometry", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/root-space", icon: Atom, color: "text-violet-400", label: "Root-Space Geometry", desc: "Damping-period decomposition" },
      { href: "/oscillator-taxonomy", icon: Zap, color: "text-yellow-400", label: "Oscillator Taxonomy", desc: "Biological oscillator classification" },
      { href: "/temporal-correlation", icon: Clock, color: "text-cyan-400", label: "Temporal Correlation Length", desc: "τ_c: clock 4.7h vs target 2.4h · 13/13 tissues" },
      { label: "Coupling Analysis", href: "#coupling", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/genome-wide-coupling", icon: Dna, color: "text-cyan-400", label: "Genome-Wide Coupling", desc: "BMAL1 coupling scan (~21k genes)" },
      { href: "/cross-metric-independence", icon: GitCompare, color: "text-cyan-400", label: "Cross-Metric Independence", desc: "|λ| vs centrality, chromatin, etc." },
      { href: "/convergence-map", icon: Network, color: "text-sky-400", label: "Convergence Map", desc: "Cross-disciplinary research links" },
      { label: "E: Phase-Gating", href: "#paper-e", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/phase-gating", icon: Sparkles, color: "text-fuchsia-400", label: "Phase-Gating Analysis", desc: "28,138 clock-target pairs" },
      { href: "/phase-portrait", icon: CircleDot, color: "text-violet-400", label: "Phase Portrait Explorer", desc: "24h cycle across tissues" },
      { href: "/gse157357-analysis", icon: TestTube, color: "text-purple-400", label: "GSE157357 Organoid Explorer", desc: "4-condition pairwise · double-mutant paradox" },
      { href: "/tcga-validation", icon: Dna, color: "text-red-400", label: "TCGA Colorectal Validation", desc: "10/15 concordance (target 7/8, p=0.035) · ApcKO-like mechanism" },
      { label: "F: Half-Life Independence", href: "#paper-f", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/halflife-replication", icon: Microscope, color: "text-cyan-400", label: "Half-Life Replication", desc: "ρ = 0.012 across 23k genes" },
      { label: "G: Time-Domain Fibonacci Analogue — reply to Boman (under review)", href: "#paper-g", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/boman-par2-mapping", icon: Target, color: "text-amber-400", label: "Boman Rules → PAR(2) Parameters", desc: "Algebraic bridge q²=1−q · 5-rule mapping · divergence angle ↔ ω" },
      { href: "/phi-inevitability-test", icon: FlaskConical, color: "text-rose-400", label: "Candidate 1: Is φ-Proximity Inevitable?", desc: "Monte Carlo null test — 10k random AR(2) processes vs biological enrichment" },
      { href: "/phi-timescale-buffering", icon: FlaskConical, color: "text-violet-400", label: "Candidate 3: Is φ a Timescale Buffer?", desc: "WT vs BmalKO vs ApcKO vs DblKO — does removing a timescale reduce φ-proximity?" },
      { href: "/boman-simulation", icon: Beaker, color: "text-orange-400", label: "Boman Simulation", desc: "3-compartment crypt model with AR(2) fitting" },
      { href: "/boman-ode", icon: Beaker, color: "text-emerald-400", label: "ODE → AR(2) Validation", desc: "Boman crypt ODE Jacobian at Fibonacci fixed point" },
      { href: "/clock-target-phi", icon: Atom, color: "text-yellow-400", label: "Clock-Target 1/φ Enrichment", desc: "Core clock |λ| near Boman's q · p=0.041 · 12 tissues" },
      { href: "/phi-enrichment-replication", icon: GitCompare, color: "text-yellow-400", label: "1/φ Enrichment Replication", desc: "4-dataset mammalian · plant extension · Arabidopsis 3 replicates" },
      { href: "/fibonacci-twinning-extended", icon: Sparkles, color: "text-amber-400", label: "Fibonacci Twinning — 5 Arguments", desc: "Algebraic identity · Floquet monodromy · 252 gene-tissue combos" },
      { href: "/cross-species-phi", icon: Globe, color: "text-teal-400", label: "Cross-Species φ Prediction", desc: "Eigenvalue φ prediction across species" },
      { href: "/crypt-villus", icon: Layers, color: "text-orange-400", label: "Crypt-Villus Analysis", desc: "Gut spatial dynamics" },
      { href: "/abm-minimal", icon: Beaker, color: "text-slate-400", label: "ABM Demo", desc: "Agent-based model" },
      { label: "Q: Central-Peripheral Clock Hierarchy", href: "#paper-q", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/light-entrainment", icon: Sun, color: "text-yellow-400", label: "Light Entrainment Hierarchy", desc: "12-tissue AR(2) gradient · SCN low |λ|=0.469, Lung high 0.797 · 2.84× lag ratio" },
      { href: "/retinal-analysis", icon: Eye, color: "text-cyan-400", label: "Retinal Circadian Analysis", desc: "GSE98965 baboon retina · phototransduction module · OPN4 post-hoc finding" },
    ],
  },
  {
    label: "Exploratory",
    color: "",
    items: [
      { label: "Disease & Cancer", href: "#disease", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/glial-analysis", icon: Brain, color: "text-blue-400", label: "Glial Circadian Analysis", desc: "GSE261698 · Astrocyte vs Microglia · Alzheimer's" },
      { href: "/mnd-als", icon: Zap, color: "text-red-400", label: "MND/ALS Motor Neuron Analysis", desc: "GSE297373 + GSE18597 · ALS-RBPs mean |λ|=0.812 · pre-loaded vulnerability" },
      { href: "/gbm-zman-seq", icon: FlaskConical, color: "text-orange-400", label: "GBM Immune Clock — Zman-seq", desc: "GSE232040 · NK clock suppression · non-circadian true-negative" },
      { href: "/p53-regulon", icon: Shield, color: "text-violet-400", label: "p53 Regulon Persistence", desc: "Apoptotic vs survival arm eigenvalue profiling" },
      { href: "/p53-oscillator", icon: FlaskConical, color: "text-fuchsia-400", label: "p53–MDM2 Oscillator", desc: "Pre-specified: feedback loop → complex roots · GOF → real roots" },
      { href: "/feedback-loop-threshold", icon: TrendingDown, color: "text-red-400", label: "Feedback Loop Threshold", desc: "MDM2 amplification gradient — where the oscillator breaks" },
      { href: "/nfkb-universality", icon: Zap, color: "text-yellow-400", label: "NF-κB Universality Test", desc: "Does AR(2) detect non-circadian oscillators? LPS/Amit2009" },
      { href: "/p53-tissue-landscape", icon: Map, color: "text-emerald-400", label: "p53 Tissue Landscape", desc: "p53 target |λ| across 12 tissues (GSE54650) — healthy baseline" },
      { href: "/myc-on-discrepancy", icon: GitCompare, color: "text-teal-400", label: "MYC-ON Discrepancy Resolved", desc: "Why MYC-ON shows higher |λ| — tug-of-war equilibrium" },
      { href: "/u2os-myc-ar2", icon: FlaskConical, color: "text-violet-400", label: "GSE221173 U2OS MYC-ER AR(2)", desc: "Pre-specified full analysis · 60k genes · 4 robustness layers · p=0.021" },
      { href: "/disease-screen", icon: AlertTriangle, color: "text-yellow-400", label: "Disease Screen", desc: "Eigenvalue shifts in disease" },
      { href: "/cancer-browser", icon: Activity, color: "text-red-400", label: "Cancer Browser", desc: "Drug targets on gene dynamics" },
      { href: "/drug-durability", icon: Pill, color: "text-teal-400", label: "Drug Target Overlay", desc: "Chronotherapy candidates" },
      { href: "/chronotherapy-predictor", icon: Clock, color: "text-orange-400", label: "Chronotherapy Predictor", desc: "AR(2)-derived optimal dosing windows" },
      { href: "/cancer-state-swap", icon: GitCompare, color: "text-purple-400", label: "Cancer State-Swap", desc: "Identity vs Proliferation markers" },
      { href: "/ar2-diagnostics", icon: ShieldCheck, color: "text-emerald-400", label: "AR(2) Fit Diagnostics", desc: "Category-wise quality audit (Table S8)" },
      { href: "/supplementary-analyses", icon: ShieldCheck, color: "text-lime-400", label: "AR(1) Benchmark & Controls", desc: "AR(1) vs AR(2) + coupling controls (Table S9)" },
      { href: "/before-after", icon: GitCompare, color: "text-cyan-400", label: "Before/After Comparison", desc: "Paired condition comparisons" },
      { label: "Specialized Tests", href: "#specialized", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/wearable-analysis", icon: Watch, color: "text-sky-400", label: "Wearable Circadian Analysis", desc: "Apple Watch, Fitbit, Oura, CGM — AR(2) on your data" },
      { href: "/light-entrainment", icon: Sun, color: "text-yellow-400", label: "Central-Peripheral Clock Hierarchy", desc: "12-tissue AR(2) eigenvalue gradient · SCN vs periphery · jet lag dynamics (Paper Q)" },
      { href: "/health-score", icon: Heart, color: "text-emerald-400", label: "Circadian Health Score", desc: "0-100 clock health rating" },
      { href: "/volatile-genes", icon: Flame, color: "text-amber-400", label: "Most Volatile Genes", desc: "Cross-dataset variance ranking" },
      { href: "/gene-set-tester", icon: FlaskConical, color: "text-fuchsia-400", label: "Gene Set Tester", desc: "Permutation test custom gene lists" },
      { href: "/cell-type-persistence", icon: Layers, color: "text-orange-400", label: "Cell-Type Persistence", desc: "Compare cell-type markers" },
      { href: "/mixture-simulation", icon: FlaskConical, color: "text-violet-400", label: "Composition Confound Test", desc: "Can cell-type mixing alone produce AR(2) signatures?" },
      { href: "/gene-protein-map", icon: MapPin, color: "text-emerald-400", label: "Gene-Protein Map", desc: "mRNA vs protein persistence" },
      { href: "/regulatory-discovery", icon: Zap, color: "text-yellow-400", label: "Regulatory Discovery", desc: "Pathway-agnostic oscillator scan" },
      { href: "/human-disruption", icon: Moon, color: "text-indigo-400", label: "Human Disruption", desc: "Sleep & circadian disruption" },
      { href: "/phase-sensitivity", icon: Activity, color: "text-rose-400", label: "Phase Estimation Sensitivity", desc: "Phase detection robustness analysis" },
      { href: "/yeast-validation", icon: Bug, color: "text-lime-400", label: "Yeast Validation", desc: "Metabolic cycle validation" },
      { href: "/bacterial-persistence", icon: Bug, color: "text-green-400", label: "Bacterial Persistence", desc: "Evolutionary persistence tests" },
      { href: "/proteome-validation", icon: Microscope, color: "text-cyan-400", label: "Proteome Validation", desc: "Protein-level dynamics" },
      { href: "/state-space-comparison", icon: GitCompare, color: "text-cyan-400", label: "State-Space Comparison", desc: "VAR vs AR model comparison" },
      { href: "/persistence-landscape", icon: Mountain, color: "text-cyan-400", label: "Persistence Landscape", desc: "Guided platform tour" },
      { href: "/reports", icon: FolderOpen, color: "text-cyan-400", label: "Saved Reports", desc: "Load & analyze saved results" },
    ],
  },
  {
    label: "More",
    color: "",
    items: [
      { label: "Data & Replication", href: "#more-data", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/geo-replication", icon: Database, color: "text-sky-400", label: "GEO Independent Replication", desc: "Public GEO datasets — independent validation studies" },
      { href: "/gse11923-checkpoint", icon: RefreshCw, color: "text-teal-400", label: "GSE11923 Checkpoint", desc: "48h hourly liver series · stability checkpoint analysis" },
      { href: "/cofe-context", icon: Layers, color: "text-violet-400", label: "COFE Context", desc: "Stability-constrained coefficient-ratio clustering" },
      { label: "Platform", href: "#more-platform", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/analytics", icon: BarChart2, color: "text-emerald-400", label: "Platform Analytics", desc: "Usage statistics and page-view metrics" },
      { href: "/figure-gallery", icon: FolderOpen, color: "text-violet-400", label: "Figures Gallery", desc: "All paper figures — view & download" },
      { href: "/disease-phase-diagram", icon: Activity, color: "text-red-400", label: "Disease Phase Diagram", desc: "Clock/target τ_c ratio: Healthy 1.74× → APC-KO 0.43×" },
    ],
  },
  {
    label: "Info",
    color: "",
    items: [
      { href: "/getting-started", icon: BookOpen, color: "text-emerald-400", label: "Getting Started", desc: "How to use this platform" },
      { href: "/about", icon: Info, color: "text-slate-400", label: "About", desc: "Background and methodology" },
      { href: "/manuscript", icon: FileText, color: "text-indigo-400", label: "Manuscripts", desc: "Downloadable paper packages" },
    ],
  },
];

function NavDropdown({ group }: { group: typeof NAV_GROUPS[0] }) {
  const [location] = useLocation();
  const isActive = group.items.some(item => location === item.href);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant={group.color ? "default" : "outline"}
          className={`h-8 gap-1.5 text-xs ${group.color ? `bg-gradient-to-r ${group.color} hover:opacity-90 text-white font-medium shadow-sm` : ""} ${isActive ? "ring-2 ring-primary/50" : ""}`}
          data-testid={`nav-${group.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
        >
          {group.label}
          <ChevronDown size={11} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-primary">{group.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {group.items.map(item => {
          if ((item as any).isSection) {
            return (
              <div key={item.href} className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {item.label}
              </div>
            );
          }
          if ((item as any).locked) {
            return (
              <DropdownMenuItem
                key={item.href}
                disabled
                className="gap-3 py-2 opacity-40 cursor-not-allowed select-none"
                data-testid={`nav-link-${item.href.slice(1)}`}
              >
                <item.icon size={15} className="shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-muted-foreground">{item.label}</div>
                  <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                </div>
                <Lock size={11} className="shrink-0 text-muted-foreground" />
              </DropdownMenuItem>
            );
          }
          return (
            <Link key={item.href} href={item.href}>
              <DropdownMenuItem
                className={`gap-3 cursor-pointer py-2 ${location === item.href ? "bg-primary/10" : ""}`}
                data-testid={`nav-link-${item.href.slice(1)}`}
              >
                <item.icon size={15} className={`shrink-0 ${item.color}`} />
                <div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                </div>
              </DropdownMenuItem>
            </Link>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileSidebarContent({ onClose }: { onClose: () => void }) {
  const [location] = useLocation();

  return (
    <ScrollArea className="h-full">
      <div className="py-4 space-y-6">
        <Link href="/" onClick={onClose}>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${location === "/" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
            <Home size={16} />
            <span className="font-medium text-sm">Home</span>
          </div>
        </Link>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="px-4 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</span>
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                if ((item as any).isSection) {
                  return (
                    <div key={item.href} className="px-4 pt-2 pb-1">
                      <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide">{item.label}</span>
                    </div>
                  );
                }
                if ((item as any).locked) {
                  return (
                    <div key={item.href} className="flex items-center gap-3 px-4 py-2 rounded-lg opacity-35 cursor-not-allowed select-none">
                      <item.icon size={15} className="shrink-0 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <Lock size={11} className="ml-auto shrink-0 text-muted-foreground" />
                    </div>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${location === item.href ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                      <item.icon size={15} className={`shrink-0 ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default function AppNavbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (location.startsWith("/shared/")) return null;

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-50" data-testid="app-navbar">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer group" data-testid="nav-logo">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors">
                  <Dna size={17} />
                </div>
                <div className="hidden sm:block">
                  <div className="font-semibold text-sm tracking-tight leading-tight">PAR(2) Discovery</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">Circadian Dynamics</div>
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 ml-2">
              {NAV_GROUPS.map(group => (
                <NavDropdown key={group.label} group={group} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/getting-started">
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs hidden lg:flex text-muted-foreground" data-testid="nav-getting-started">
                <BookOpen size={13} />
                Getting Started
              </Button>
            </Link>
            <Link href="/discovery-engine">
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs hidden sm:flex" data-testid="nav-upload">
                <Upload size={13} />
                Upload Data
              </Button>
            </Link>
            <Link href="/gene-explorer">
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs hidden sm:flex" data-testid="nav-search">
                <Search size={13} />
                Search Genes
              </Button>
            </Link>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 md:hidden" data-testid="nav-mobile-menu">
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/50">
                  <SheetTitle className="flex items-center gap-2 text-sm">
                    <Dna size={16} className="text-primary" />
                    PAR(2) Discovery Engine
                  </SheetTitle>
                </SheetHeader>
                <MobileSidebarContent onClose={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
