import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, BarChart3, ArrowRight, Dna, Clock, Activity, FlaskConical, Play, FileText, ChevronDown, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const PATHS = [
  {
    title: "Try with example data",
    desc: "See the three-tier hierarchy across 12 mouse tissues. No upload, no setup — results load instantly.",
    href: "/dashboard",
    icon: Play,
    color: "from-emerald-500 to-teal-500",
    badge: "No upload needed",
    cta: "Explore pre-loaded datasets",
  },
  {
    title: "Upload your own data",
    desc: "Drop in a CSV of gene expression time series and get eigenvalue persistence scores back in seconds.",
    href: "/discovery-engine",
    icon: Upload,
    color: "from-cyan-500 to-blue-500",
    badge: null,
    cta: "Open Discovery Engine",
  },
  {
    title: "Read the papers",
    desc: "Paper A covers the full method, 22 datasets, and 11 robustness checks.",
    href: "/manuscript",
    icon: FileText,
    color: "from-indigo-500 to-violet-500",
    badge: null,
    cta: "View manuscripts",
  },
];

const WHAT_IT_DOES = [
  {
    icon: Clock,
    title: "Measures gene memory, not just rhythmicity",
    plain: "Tools like JTK_CYCLE and MetaCycle ask: is this gene rhythmic? This platform asks something different: how long does a gene's signal persist over time? The answer — the eigenvalue modulus |λ| — is mathematically independent of amplitude and reveals a layer of circadian biology that rhythmicity tests miss entirely.",
  },
  {
    icon: Dna,
    title: "Separates clock drivers from downstream targets",
    plain: "Clock genes (ARNTL, CLOCK, PER2, NR1D1) consistently score higher than the genes they regulate (WEE1, MYC, CCND1). This platform quantifies that separation across 22 datasets and 4 species — without any gene labels as input.",
  },
  {
    icon: Activity,
    title: "Detects disease-state collapse",
    plain: "In cancer, the persistence gap between clock genes and their targets shrinks or inverts — proliferative genes (E2F targets, cyclin-dependent kinases) acquire clock-level persistence. In APC-mutant organoids the gap directionally reverses (from +0.033 to −0.127), consistent with hierarchy collapse. The platform detects this from standard RNA-seq time series.",
  },
  {
    icon: FlaskConical,
    title: "Works on your data, in your browser",
    plain: "Upload a CSV of gene expression time series — any organism, any tissue, any number of timepoints — and get AR(2) eigenvalue scores back within seconds. No R required, no installation, no code.",
  },
];

const COMPARISONS = [
  { feature: "Measures temporal persistence (|λ|)", us: true, jtk: false, metacycle: false },
  { feature: "Works without gene labels as input", us: true, jtk: false, metacycle: false },
  { feature: "Detects hierarchy collapse in disease", us: true, jtk: false, metacycle: false },
  { feature: "Live browser-based analysis", us: true, jtk: false, metacycle: false },
  { feature: "Validated across 4 species", us: true, jtk: true, metacycle: true },
  { feature: "Detects rhythmic genes (p-value)", us: false, jtk: true, metacycle: true },
];

export default function Landing() {
  const [howOpen, setHowOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">

        {/* ── HERO ── */}
        <section className="text-center space-y-5" data-testid="landing-hero">

          {/* Audience badge */}
          <div className="flex flex-wrap justify-center gap-2 text-xs" data-testid="audience-badges">
            <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-medium">Circadian biologists</span>
            <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 font-medium">Cancer researchers</span>
            <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">Computational biologists</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-slate-900">
            PAR(2) Discovery Engine
          </h1>
          <p className="text-sm text-slate-400 -mt-3 font-mono">AR(2) autoregressive modelling · circadian time-series gene expression</p>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Why do clock genes stay stable across tissues and species while the genes they
            regulate don't? And why does that gap <strong>collapse in cancer, shift-work
            disruption, and neurodegeneration</strong>?
          </p>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed -mt-2">
            This platform answers both questions from standard gene expression time series —
            no biological labels required, no installation, no code.
            Validated across 22 datasets and 4 species.
          </p>

          {/* Three-tier chart — the core finding */}
          <div className="mx-auto max-w-lg pt-1" data-testid="hero-persistence-chart">
            <svg viewBox="0 0 480 185" className="w-full" aria-label="Three-tier eigenvalue hierarchy: clock genes highest, target genes intermediate, background lowest">
              {[0.2, 0.4, 0.6, 0.8].map(v => (
                <line key={v} x1={112 + v * 310} y1="8" x2={112 + v * 310} y2="134" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 2" />
              ))}
              <rect x="112" y="8" width={0.647 * 310} height="33" rx="4" fill="#22d3ee" opacity="0.9" />
              <text x="104" y="29" textAnchor="end" fontSize="11" fontWeight="600" fill="#0891b2">Clock</text>
              <text x={112 + 0.647 * 310 + 7} y="29" fontSize="12" fontWeight="700" fill="#0891b2">0.65</text>
              <text x={112 + 0.588 * 310} y="52" textAnchor="middle" fontSize="8.5" fill="#94a3b8">← gap = 0.12 →</text>
              <rect x="112" y="58" width={0.530 * 310} height="33" rx="4" fill="#f472b6" opacity="0.9" />
              <text x="104" y="79" textAnchor="end" fontSize="11" fontWeight="600" fill="#be185d">Target</text>
              <text x={112 + 0.530 * 310 + 7} y="79" fontSize="12" fontWeight="700" fill="#be185d">0.53</text>
              <text x={112 + 0.513 * 310} y="102" textAnchor="middle" fontSize="8.5" fill="#94a3b8">← gap = 0.03 →</text>
              <rect x="112" y="108" width={0.496 * 310} height="33" rx="4" fill="#94a3b8" opacity="0.75" />
              <text x="104" y="129" textAnchor="end" fontSize="11" fontWeight="600" fill="#64748b">Genome</text>
              <text x={112 + 0.496 * 310 + 7} y="129" fontSize="12" fontWeight="700" fill="#64748b">0.50</text>
              <line x1="112" y1="148" x2="422" y2="148" stroke="#cbd5e1" strokeWidth="1" />
              {[0, 0.2, 0.4, 0.6, 0.8].map(v => (
                <g key={v}>
                  <line x1={112 + v * 310} y1="148" x2={112 + v * 310} y2="154" stroke="#94a3b8" strokeWidth="1" />
                  <text x={112 + v * 310} y="165" textAnchor="middle" fontSize="9" fill="#94a3b8">{v.toFixed(1)}</text>
                </g>
              ))}
              <text x="267" y="181" textAnchor="middle" fontSize="9.5" fill="#94a3b8">Persistence  |λ|  — median across 22 datasets, 4 species</text>
            </svg>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 pt-0 text-sm" data-testid="landing-stats">
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-700">22 datasets</div>
              <div className="text-slate-500 text-xs">4 species (validated)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-700">11</div>
              <div className="text-slate-500 text-xs">Robustness checks</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-700">~21k</div>
              <div className="text-slate-500 text-xs">Genes scanned</div>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Link href="/dashboard">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-base text-white" data-testid="landing-example-btn">
                <Play className="w-5 h-5" />
                See a live result
              </Button>
            </Link>
            <Link href="/discovery-engine">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 gap-2 text-base" data-testid="landing-upload-btn">
                <Upload className="w-5 h-5" />
                Upload your data
              </Button>
            </Link>
            <Link href="/manuscript">
              <Button size="lg" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 gap-2 text-base" data-testid="landing-papers-btn">
                <FileText className="w-5 h-5" />
                Read the papers
              </Button>
            </Link>
          </div>

          {/* Preprint links — key credibility signal for academic visitors */}
          <div className="flex flex-wrap justify-center gap-4 pt-1 text-xs" data-testid="preprint-links">
            <a
              href="https://doi.org/10.21203/rs.3.rs-9283100/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
              data-testid="preprint-paper-a"
            >
              <ExternalLink className="w-3 h-3" />
              Preprint: Paper A — Research Square
            </a>
            <span className="text-slate-300">·</span>
            <a
              href="https://doi.org/10.21203/rs.3.rs-9214347/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
              data-testid="preprint-paper-e"
            >
              <ExternalLink className="w-3 h-3" />
              Preprint: Paper E — Research Square
            </a>
            <span className="text-slate-300">·</span>
            <a
              href="https://doi.org/10.21203/rs.3.rs-9385465/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
              data-testid="preprint-paper-f"
            >
              <ExternalLink className="w-3 h-3" />
              Preprint: Paper F — Research Square
            </a>
            <span className="text-slate-300">·</span>
            <Link href="/manuscript">
              <span className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                <FileText className="w-3 h-3" />
                All papers →
              </span>
            </Link>
          </div>
        </section>

        {/* ── THREE PATHS ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="landing-paths">
          {PATHS.map((p) => (
            <Link key={p.href} href={p.href}>
              <Card className="bg-white border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer h-full group" data-testid={`landing-path-${p.href.slice(1)}`}>
                <CardContent className="p-5 space-y-3 flex flex-col h-full">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                      <p.icon className="w-4 h-4 text-white" />
                    </div>
                    {p.badge && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                        {p.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">{p.title}</h3>
                  <p className="text-sm text-slate-500 flex-1">{p.desc}</p>
                  <div className="flex items-center gap-1 text-sm text-slate-500 group-hover:text-slate-800 transition-colors">
                    {p.cta} <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        {/* ── HOW IT WORKS (collapsible) ── */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden" data-testid="landing-how-it-works">
          <button
            className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
            onClick={() => setHowOpen(!howOpen)}
            data-testid="how-it-works-toggle"
          >
            <h2 className="text-base font-semibold text-slate-800">How it works</h2>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${howOpen ? 'rotate-180' : ''}`} />
          </button>
          {howOpen && (
            <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
              <div className="space-y-4 text-slate-700 leading-relaxed pt-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">1</div>
                  <p className="text-sm"><strong>Fit a simple model.</strong> For each gene, we ask: how well does its expression at time <em>t</em> predict time <em>t+1</em> and <em>t+2</em>? This is a standard AR(2) autoregressive model — two coefficients, one equation.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">2</div>
                  <p className="text-sm"><strong>Extract the eigenvalue.</strong> From those two coefficients, we calculate an eigenvalue modulus |λ| — a single number between 0 and 1 measuring how persistent the gene's signal is over time.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">3</div>
                  <p className="text-sm"><strong>Compare across genes.</strong> Clock genes consistently score higher than the targets they regulate. This separation appears robustly across species and healthy tissues — and collapses in disease models. No biological labels needed as input.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── WHAT IT DOES ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="landing-what-it-does">
          {WHAT_IT_DOES.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.plain}</p>
            </div>
          ))}
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden" data-testid="landing-comparison">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">How this differs from existing tools</h2>
            <p className="text-xs text-slate-400 mt-1">JTK_CYCLE and MetaCycle are the standard — they detect rhythmicity. This platform measures something orthogonal.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left p-3 text-slate-600 font-medium w-1/2">Capability</th>
                  <th className="text-center p-3 text-slate-600 font-medium">PAR(2)</th>
                  <th className="text-center p-3 text-slate-600 font-medium">JTK_CYCLE</th>
                  <th className="text-center p-3 text-slate-600 font-medium">MetaCycle</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3 text-slate-700">{row.feature}</td>
                    <td className="p-3 text-center">
                      {row.us
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {row.jtk
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      {row.metacycle
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-400">PAR(2) and JTK_CYCLE/MetaCycle are complementary, not competing. Use rhythmicity tools to find rhythmic genes; use this platform to quantify their temporal dynamics and hierarchy.</p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div className="space-y-3 text-center pb-4" data-testid="landing-footer">
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
            <span>·</span>
            <Link href="/validation-suite">
              <span className="hover:text-slate-600 transition-colors cursor-pointer">Validation</span>
            </Link>
          </div>
          <p className="text-xs text-slate-400 max-w-xl mx-auto" data-testid="validation-banner">
            Pre-print platform. AR(2) computations are mathematically reproducible.
            Biological interpretations are hypotheses under peer review, not established findings.
          </p>
        </div>

      </div>
    </div>
  );
}
