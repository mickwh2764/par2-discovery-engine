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
  Menu, Home, Upload, Search, Award, CircleDot, BarChart3,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Explore",
    color: "from-violet-600 to-purple-600",
    items: [
      { href: "/persistence-landscape", icon: Mountain, color: "text-cyan-400", label: "The Persistence Landscape", desc: "Guided tour through the platform" },
      { href: "/root-space", icon: Atom, color: "text-violet-400", label: "Root-Space Geometry", desc: "Map genes by temporal dynamics" },
      { href: "/discovery-engine", icon: Activity, color: "text-purple-400", label: "Discovery Engine", desc: "Upload your own data" },
      { href: "/gene-explorer", icon: Dna, color: "text-pink-400", label: "Gene Explorer", desc: "Look up any gene across datasets" },
      { href: "/phase-portrait", icon: CircleDot, color: "text-violet-400", label: "Phase Portrait Explorer", desc: "Animated 24h cycle across tissues" },
      { href: "/genome-wide", icon: Globe, color: "text-blue-400", label: "Genome-Wide Scan", desc: "All genes in a dataset" },
      { href: "/convergence-map", icon: Network, color: "text-sky-400", label: "Convergence Map", desc: "Research convergence visualization" },
    ],
  },
  {
    label: "Analyze",
    color: "from-red-600 to-orange-600",
    items: [
      { href: "/health-score", icon: Heart, color: "text-emerald-400", label: "Circadian Health Score", desc: "0-100 clock health rating" },
      { href: "/disease-screen", icon: AlertTriangle, color: "text-yellow-400", label: "Disease Screen", desc: "Gene shifts in disease" },
      { href: "/cancer-browser", icon: Activity, color: "text-red-400", label: "Cancer Browser", desc: "Drug targets on gene dynamics" },
      { href: "/drug-durability", icon: Pill, color: "text-teal-400", label: "Drug Target Overlay", desc: "Chronotherapy candidates" },
      { href: "/genome-wide-coupling", icon: Dna, color: "text-cyan-400", label: "Genome-Wide Coupling", desc: "Scan all genes for clock influence" },
      { href: "/cell-type-persistence", icon: Layers, color: "text-orange-400", label: "Cell-Type Persistence", desc: "Compare cell-type markers" },
      { href: "/cross-metric-independence", icon: GitCompare, color: "text-cyan-400", label: "Cross-Metric Independence", desc: "Eigenvalue vs other metrics" },
      { href: "/gene-set-tester", icon: FlaskConical, color: "text-fuchsia-400", label: "Gene Set Tester", desc: "Permutation test custom gene lists" },
      { href: "/before-after", icon: GitCompare, color: "text-cyan-400", label: "Before/After Comparison", desc: "Compare two conditions" },
      { href: "/volatile-genes", icon: Flame, color: "text-amber-400", label: "Most Volatile Genes", desc: "Cross-dataset variance ranking" },
      { href: "/gene-protein-map", icon: MapPin, color: "text-emerald-400", label: "Gene-Protein Map", desc: "mRNA vs protein persistence" },
    ],
  },
  {
    label: "Validate",
    color: "",
    items: [
      { href: "/framework-benchmarks", icon: Award, color: "text-amber-400", label: "Framework Benchmarks", desc: "Accuracy, FDR & reliability report" },
      { href: "/robustness-suite", icon: Shield, color: "text-sky-400", label: "Robustness Suite", desc: "Bootstrap & permutation tests" },
      { href: "/cross-context-validation", icon: Layers, color: "text-rose-400", label: "Cross-Context Validation", desc: "Cross-species & tissue tests" },
      { href: "/literature-validation", icon: BookOpen, color: "text-emerald-400", label: "Literature Validation", desc: "Cross-reference vs published findings" },
      { href: "/validation-suite", icon: CheckCircle2, color: "text-green-400", label: "Model Comparison", desc: "AR(1) vs AR(2) vs AR(3)" },
      { href: "/model-zoo", icon: Beaker, color: "text-teal-400", label: "ODE Model Zoo", desc: "ODE round-trip validation" },
      { href: "/human-disruption", icon: Moon, color: "text-indigo-400", label: "Human Disruption", desc: "Shift work & jet lag effects" },
      { href: "/phase-gating", icon: Sparkles, color: "text-fuchsia-400", label: "Phase-Gating Analysis", desc: "Clock-cell cycle coupling tests" },
      { href: "/proteome-validation", icon: Dna, color: "text-teal-400", label: "Proteome Validation", desc: "Protein-level AR(2) hierarchy" },
      { href: "/yeast-validation", icon: Microscope, color: "text-lime-400", label: "Cross-Kingdom (Yeast)", desc: "Yeast metabolic cycles" },
      { href: "/bacterial-persistence", icon: Bug, color: "text-green-400", label: "Bacterial Persistence", desc: "E. coli persistence analysis" },
      { href: "/crypt-villus", icon: FlaskConical, color: "text-amber-400", label: "Crypt-Villus Axis", desc: "Spatial-temporal analysis" },
    ],
  },
  {
    label: "Info",
    color: "",
    items: [
      { href: "/getting-started", icon: BookOpen, color: "text-emerald-400", label: "Getting Started", desc: "How to use this platform" },
      { href: "/about", icon: Info, color: "text-slate-400", label: "About", desc: "Background and methodology" },
      { href: "/manuscript", icon: Lock, color: "text-indigo-400", label: "Manuscripts", desc: "Downloadable paper packages" },
      { href: "/manuscript-validation", icon: ShieldCheck, color: "text-emerald-400", label: "Manuscript Validation", desc: "Live reproduction of paper claims" },
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
          data-testid={`nav-${group.label.toLowerCase()}`}
        >
          {group.label}
          <ChevronDown size={11} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-primary">{group.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {group.items.map(item => (
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
        ))}
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
        <Link href="/dashboard" onClick={onClose}>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${location === "/dashboard" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
            <BarChart3 size={16} />
            <span className="font-medium text-sm">Dashboard</span>
          </div>
        </Link>

        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="px-4 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</span>
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${location === item.href ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                    <item.icon size={15} className={`shrink-0 ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              ))}
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
              <Link href="/dashboard">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-8 gap-1.5 text-xs ${location === "/dashboard" ? "bg-primary/10 text-primary" : ""}`}
                  data-testid="nav-dashboard"
                >
                  <BarChart3 size={13} />
                  Dashboard
                </Button>
              </Link>
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
