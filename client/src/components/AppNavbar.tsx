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
  FileText, Compass, TestTube,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Paper A",
    color: "from-blue-600 to-indigo-600",
    items: [
      { label: "The Claim", href: "#claim", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/category-tests", icon: BarChart3, color: "text-emerald-400", label: "Category Tests", desc: "Clock > target > background hierarchy" },
      { href: "/dashboard", icon: BarChart3, color: "text-blue-400", label: "Dashboard", desc: "See it across 12 datasets" },
      { href: "/genome-wide", icon: Globe, color: "text-blue-400", label: "Genome-Wide Scan", desc: "Every gene individually" },
      { href: "/gene-explorer", icon: Dna, color: "text-pink-400", label: "Gene Explorer", desc: "Look up any specific gene" },
      { label: "Does It Replicate?", href: "#replication", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/cross-context-validation", icon: Layers, color: "text-rose-400", label: "Cross-Context Validation", desc: "4 species, 12 tissues, 36 series" },
      { href: "/literature-validation", icon: BookOpen, color: "text-emerald-400", label: "Literature Validation", desc: "59 known genes — 98.3% match" },
      { href: "/model-zoo", icon: Beaker, color: "text-orange-400", label: "Model Zoo", desc: "5 ODE ground-truth models" },
      { href: "/framework-benchmarks", icon: Award, color: "text-amber-400", label: "Framework Benchmarks", desc: "vs JTK_CYCLE, cosinor, RAIN" },
      { label: "Is It Robust?", href: "#robustness", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/robustness-suite", icon: Shield, color: "text-blue-400", label: "Robustness Suite", desc: "12 statistical stress tests" },
      { href: "/decomposition-stability", icon: Shield, color: "text-blue-400", label: "Decomposition Stability", desc: "Driver removal stability" },
      { href: "/validation-summary", icon: CheckCircle2, color: "text-emerald-400", label: "Validation Summary", desc: "All evidence at a glance" },
      { href: "/manuscript-validation", icon: ShieldCheck, color: "text-emerald-400", label: "Manuscript Validation", desc: "Live reproduction of claims" },
      { label: "Try It Yourself", href: "#try", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/discovery-engine", icon: Activity, color: "text-purple-400", label: "Discovery Engine", desc: "Upload & analyze your own data" },
    ],
  },
  {
    label: "Papers B\u2013G",
    color: "from-violet-600 to-purple-600",
    items: [
      { label: "B: Resonance Zone", href: "#paper-b", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/root-space", icon: Atom, color: "text-violet-400", label: "Root-Space Geometry", desc: "Damping-period decomposition" },
      { href: "/oscillator-taxonomy", icon: Zap, color: "text-yellow-400", label: "Oscillator Taxonomy", desc: "Biological oscillator classification" },
      { label: "C: Coupling Atlas", href: "#paper-c", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/genome-wide-coupling", icon: Dna, color: "text-cyan-400", label: "Genome-Wide Coupling", desc: "BMAL1 coupling scan (~21k genes)" },
      { label: "D: Perspective", href: "#paper-d", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/cross-metric-independence", icon: GitCompare, color: "text-cyan-400", label: "Cross-Metric Independence", desc: "|λ| vs centrality, chromatin, etc." },
      { href: "/convergence-map", icon: Network, color: "text-sky-400", label: "Convergence Map", desc: "Cross-disciplinary research links" },
      { label: "E: Phase-Gating", href: "#paper-e", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/phase-gating", icon: Sparkles, color: "text-fuchsia-400", label: "Phase-Gating Analysis", desc: "28,138 clock-target pairs" },
      { href: "/phase-portrait", icon: CircleDot, color: "text-violet-400", label: "Phase Portrait Explorer", desc: "24h cycle across tissues" },
      { label: "F: Half-Life Independence", href: "#paper-f", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/halflife-replication", icon: Microscope, color: "text-cyan-400", label: "Half-Life Replication", desc: "ρ = 0.012 across 23k genes" },
      { label: "G: Fibonacci & Crypt (under review)", href: "#paper-g", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/boman-simulation", icon: Beaker, color: "text-orange-400", label: "Boman Simulation", desc: "3-compartment crypt model" },
      { href: "/crypt-villus", icon: Layers, color: "text-orange-400", label: "Crypt-Villus Analysis", desc: "Gut spatial dynamics" },
      { href: "/abm-minimal", icon: Beaker, color: "text-slate-400", label: "ABM Demo", desc: "Agent-based model" },
    ],
  },
  {
    label: "Exploratory",
    color: "",
    items: [
      { label: "Disease & Cancer", href: "#disease", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/disease-screen", icon: AlertTriangle, color: "text-yellow-400", label: "Disease Screen", desc: "Eigenvalue shifts in disease" },
      { href: "/cancer-browser", icon: Activity, color: "text-red-400", label: "Cancer Browser", desc: "Drug targets on gene dynamics" },
      { href: "/drug-durability", icon: Pill, color: "text-teal-400", label: "Drug Target Overlay", desc: "Chronotherapy candidates" },
      { href: "/before-after", icon: GitCompare, color: "text-cyan-400", label: "Before/After Comparison", desc: "Paired condition comparisons" },
      { label: "Specialized Tests", href: "#specialized", icon: Target, color: "text-slate-400", isSection: true, desc: "" },
      { href: "/health-score", icon: Heart, color: "text-emerald-400", label: "Circadian Health Score", desc: "0-100 clock health rating" },
      { href: "/volatile-genes", icon: Flame, color: "text-amber-400", label: "Most Volatile Genes", desc: "Cross-dataset variance ranking" },
      { href: "/gene-set-tester", icon: FlaskConical, color: "text-fuchsia-400", label: "Gene Set Tester", desc: "Permutation test custom gene lists" },
      { href: "/cell-type-persistence", icon: Layers, color: "text-orange-400", label: "Cell-Type Persistence", desc: "Compare cell-type markers" },
      { href: "/gene-protein-map", icon: MapPin, color: "text-emerald-400", label: "Gene-Protein Map", desc: "mRNA vs protein persistence" },
      { href: "/regulatory-discovery", icon: Zap, color: "text-yellow-400", label: "Regulatory Discovery", desc: "Pathway-agnostic oscillator scan" },
      { href: "/human-disruption", icon: Moon, color: "text-indigo-400", label: "Human Disruption", desc: "Sleep & circadian disruption" },
      { href: "/yeast-validation", icon: Bug, color: "text-lime-400", label: "Yeast Validation", desc: "Metabolic cycle validation" },
      { href: "/bacterial-persistence", icon: Bug, color: "text-green-400", label: "Bacterial Persistence", desc: "Evolutionary persistence tests" },
      { href: "/proteome-validation", icon: Microscope, color: "text-cyan-400", label: "Proteome Validation", desc: "Protein-level dynamics" },
      { href: "/state-space-comparison", icon: GitCompare, color: "text-cyan-400", label: "State-Space Comparison", desc: "VAR vs AR model comparison" },
      { href: "/persistence-landscape", icon: Mountain, color: "text-cyan-400", label: "Persistence Landscape", desc: "Guided platform tour" },
      { href: "/reports", icon: FolderOpen, color: "text-cyan-400", label: "Saved Reports", desc: "Load & analyze saved results" },
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
