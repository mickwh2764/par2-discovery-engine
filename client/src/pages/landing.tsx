import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, BarChart3, ArrowRight, Shield, BookOpen, Dna, Clock, Activity, FlaskConical, ChevronDown } from "lucide-react";
import { useState } from "react";

const PATHS = [
  {
    title: "Upload Your Data",
    desc: "Drop in a CSV file and get results back in seconds. Works with gene expression time series from any source.",
    href: "/discovery-engine",
    icon: Upload,
    color: "from-emerald-500 to-teal-500",
    badge: "Start Here",
    cta: "Open Discovery Engine",
  },
  {
    title: "Explore Pre-Loaded Datasets",
    desc: "Browse 12 datasets already on the platform — mouse, human, baboon, plant, and yeast — and see the results instantly.",
    href: "/dashboard",
    icon: BarChart3,
    color: "from-cyan-500 to-blue-500",
    badge: null,
    cta: "Explore Datasets",
  },
  {
    title: "See the Evidence",
    desc: "Every claim on this platform has been tested. See the robustness checks, cross-species replication, and literature validation.",
    href: "/framework-benchmarks",
    icon: Shield,
    color: "from-purple-500 to-violet-500",
    badge: null,
    cta: "Review Validation",
  },
];

const WHAT_IT_DOES = [
  {
    icon: Clock,
    title: "Measures gene memory",
    plain: "Every gene's activity right now is influenced by what it was doing hours ago. This platform measures how long that influence lasts — we call it \"persistence.\"",
  },
  {
    icon: Dna,
    title: "Separates drivers from followers",
    plain: "Clock genes (the body's timekeepers) hold their signal for a long time. Target genes (the ones they control) fade faster. This platform quantifies that difference for every gene in the genome.",
  },
  {
    icon: Activity,
    title: "Detects when things go wrong",
    plain: "In cancer, aging, and shift work, the gap between drivers and followers shrinks or inverts. The platform can detect this from a standard gene expression dataset.",
  },
  {
    icon: FlaskConical,
    title: "Discovers new candidates",
    plain: "By scanning ~21,000 genes, the platform has flagged 20 genes not previously known to be connected to the body clock — candidates for follow-up experiments.",
  },
];

const KEY_TERMS = [
  {
    term: "Persistence (|λ|)",
    simple: "How long a gene's signal lasts",
    detail: "A number between 0 and 1. High values (like 0.70 for clock genes) mean the signal carries forward strongly. Low values (like 0.45 for target genes) mean it fades quickly. Think of it like an echo — some genes echo loudly for a long time, others fade fast.",
  },
  {
    term: "AR(2) model",
    simple: "A formula that predicts a gene from its recent past",
    detail: "\"Autoregressive, order 2\" — it says a gene's current level depends on what it was doing one time step ago and two time steps ago. Two steps are needed because circadian genes don't just decay, they oscillate (go up, come down, repeat).",
  },
  {
    term: "Persistence gap",
    simple: "The measurable difference between clock and target genes",
    detail: "Clock genes average |λ| ≈ 0.70, target genes average |λ| ≈ 0.45. That gap of ~0.25 is consistent across mouse, human, baboon, and plant tissues. When the gap shrinks or inverts, it indicates disease or disruption.",
  },
  {
    term: "Root-space",
    simple: "A map where each gene's position shows its behavior",
    detail: "A visual plot where the angle shows the gene's cycle speed and the distance from center shows its persistence. Clock genes cluster in one zone, target genes in another — you can literally see the two tiers.",
  },
];

function ExpandableTerm({ term, simple, detail }: { term: string; simple: string; detail: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-lg border border-slate-200 bg-white p-4 space-y-1 cursor-pointer hover:border-slate-300 transition-colors"
      onClick={() => setOpen(!open)}
      data-testid={`term-${term.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <dt className="text-sm font-semibold text-slate-800">{term}</dt>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <dd className="text-sm text-slate-500">{simple}</dd>
      {open && (
        <dd className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100 mt-2">
          {detail}
        </dd>
      )}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">

        <div className="bg-amber-50 border border-amber-300 rounded-lg px-5 py-4 text-center" data-testid="validation-banner">
          <p className="text-amber-900 text-sm leading-relaxed">
            <span className="font-semibold">Active research platform — methods under ongoing validation.</span>{" "}
            The AR(2) computations and eigenvalues presented here are mathematically correct and reproducible.
            Biological interpretations, including claims about persistence hierarchies and clinical relevance,
            are under active investigation and should be treated as exploratory, not established findings.
          </p>
        </div>

        <section className="text-center space-y-5" data-testid="landing-hero">
          <Badge variant="outline" className="text-emerald-600 border-emerald-500/50 text-sm px-4 py-1">
            Open Research Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-slate-900">
            PAR(2) Discovery Engine
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Find out which genes drive the body clock and which ones follow it — 
            from a single time-series dataset. Upload your data or explore ours.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/discovery-engine">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-base text-white" data-testid="landing-upload-btn">
                <Upload className="w-5 h-5" />
                Upload Your Data
              </Button>
            </Link>
            <Link href="/persistence-landscape">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 gap-2 text-base" data-testid="landing-tour-btn">
                <BookOpen className="w-5 h-5" />
                Take the Guided Tour
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5" data-testid="landing-what-it-does">
          {WHAT_IT_DOES.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.plain}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 space-y-4" data-testid="landing-main-finding">
          <h2 className="text-lg font-semibold text-slate-800">The main finding</h2>
          <p className="text-slate-700 leading-relaxed">
            Across <strong>12 public datasets</strong>, <strong>4 species</strong>, and <strong>36 tissue/condition comparisons</strong>, 
            clock genes consistently show higher persistence than the target genes they control. 
            This separation has been validated against <strong>58 of 59 known circadian genes</strong> from the published literature (98.3% accuracy), 
            survives bias testing and permutation controls, and is independent of mRNA half-life.
          </p>
          <p className="text-slate-700 leading-relaxed">
            In disease models — cancer, clock gene knockouts, and aging — the gap shrinks, inverts, or collapses. 
            The platform detects this automatically.
          </p>
          <div className="flex flex-wrap gap-6 pt-2 text-sm">
            <div className="text-center" data-testid="stat-clock">
              <div className="text-2xl font-bold text-emerald-700">0.70</div>
              <div className="text-slate-500">Clock gene persistence</div>
            </div>
            <div className="text-center" data-testid="stat-target">
              <div className="text-2xl font-bold text-blue-700">0.45</div>
              <div className="text-slate-500">Target gene persistence</div>
            </div>
            <div className="text-center" data-testid="stat-accuracy">
              <div className="text-2xl font-bold text-purple-700">98.3%</div>
              <div className="text-slate-500">Literature validation</div>
            </div>
            <div className="text-center" data-testid="stat-species">
              <div className="text-2xl font-bold text-amber-700">4</div>
              <div className="text-slate-500">Species validated</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5" data-testid="landing-paths">
          {PATHS.map((p) => (
            <Link key={p.href} href={p.href}>
              <Card className="bg-white border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer h-full group" data-testid={`landing-path-${p.href.slice(1)}`}>
                <CardContent className="p-6 space-y-3 flex flex-col h-full">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                    {p.badge && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                        {p.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{p.title}</h3>
                  <p className="text-sm text-slate-500 flex-1">{p.desc}</p>
                  <div className="flex items-center gap-1 text-sm text-slate-500 group-hover:text-slate-800 transition-colors">
                    {p.cta} <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <section className="space-y-4" data-testid="landing-key-terms">
          <h2 className="text-lg font-semibold text-slate-800">Key terms used on this platform</h2>
          <p className="text-sm text-slate-500">Tap any term to expand its explanation.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {KEY_TERMS.map((t) => (
              <ExpandableTerm key={t.term} {...t} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4" data-testid="landing-recommended-path">
          <h2 className="text-lg font-semibold text-slate-800">Recommended path for new visitors</h2>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">1</span>
              <span><Link href="/persistence-landscape"><strong className="text-emerald-700 hover:underline cursor-pointer">Take the guided tour</strong></Link> — understand what the platform measures and why it matters, before you see any data.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">2</span>
              <span><Link href="/dashboard"><strong className="text-cyan-700 hover:underline cursor-pointer">Run an analysis</strong></Link> on one of the pre-loaded datasets to see results firsthand.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">3</span>
              <span><Link href="/discovery-engine"><strong className="text-purple-700 hover:underline cursor-pointer">Upload your own data</strong></Link> — any CSV time-series file — and see how your genes compare.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</span>
              <span><Link href="/validation-summary"><strong className="text-blue-700 hover:underline cursor-pointer">Check the validation</strong></Link> — method validation against literature, cross-species, and bias audits.</span>
            </li>
          </ol>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-4" data-testid="landing-limitations">
          <h2 className="text-lg font-semibold text-slate-800">Limitations & Important Scope</h2>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Linear dynamics:</strong> AR(2) assumes linear autoregressive structure. Highly nonlinear systems may be misclassified.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Time resolution:</strong> Standard circadian datasets use 12 timepoints (2h intervals). Cannot resolve oscillations faster than ~4h period.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Stationarity:</strong> AR(2) assumes stationary data. Trending time series will show inflated |λ| values; use differencing if needed.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>BMAL1 coupling:</strong> Inferred from transcriptomic correlation only, not direct temporal protein measurement. Interpret as "transcriptionally associated."</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span><strong>Biological interpretation:</strong> Claims about oscillator hierarchies and disease relevance are under active investigation. Use AR(2) persistence as a signal, not a diagnosis.</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link href="/validation-summary">
              <span className="text-sm text-blue-600 hover:underline font-semibold cursor-pointer">See full validation summary →</span>
            </Link>
          </div>
        </section>

        <div className="flex justify-center gap-4 text-sm text-slate-400" data-testid="landing-footer-links">
          <Link href="/about">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">About</span>
          </Link>
          <span>·</span>
          <Link href="/getting-started">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Getting Started</span>
          </Link>
          <span>·</span>
          <Link href="/manuscript">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Papers</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
