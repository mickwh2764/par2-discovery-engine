import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, BarChart3, ArrowRight, Shield } from "lucide-react";

const PATHS = [
  {
    title: "Upload Your Data",
    desc: "Drop in a CSV file and get persistence scores back in seconds. Works with gene expression, wearable data, or any time series.",
    href: "/discovery-engine",
    icon: Upload,
    color: "from-emerald-500 to-teal-500",
    badge: "Start Here",
    cta: "Open Discovery Engine",
  },
  {
    title: "Explore Datasets",
    desc: "Browse 38 pre-loaded datasets across 5 species: mouse, human, baboon, plant, and yeast.",
    href: "/persistence-landscape",
    icon: BarChart3,
    color: "from-cyan-500 to-blue-500",
    badge: null,
    cta: "Explore Datasets",
  },
  {
    title: "See the Evidence",
    desc: "Tests, benchmarks, and cross-references that show these methods are reliable and reproducible.",
    href: "/framework-benchmarks",
    icon: Shield,
    color: "from-purple-500 to-violet-500",
    badge: null,
    cta: "Review Validation",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">

        <section className="text-center space-y-5" data-testid="landing-hero">
          <Badge variant="outline" className="text-emerald-400 border-emerald-400/50 text-sm px-4 py-1">
            Open Research Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              PAR(2) Discovery Engine
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Measure how long a gene's signal persists over time. 
            Upload data, explore patterns, and discover which genes drive the body clock.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/discovery-engine">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-base" data-testid="landing-upload-btn">
                <Upload className="w-5 h-5" />
                Upload Your Data
              </Button>
            </Link>
            <Link href="/persistence-landscape">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800 gap-2 text-base" data-testid="landing-dashboard-btn">
                <BarChart3 className="w-5 h-5" />
                Explore Datasets
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5" data-testid="landing-paths">
          {PATHS.map((p) => (
            <Link key={p.href} href={p.href}>
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-500 transition-all cursor-pointer h-full group" data-testid={`landing-path-${p.href.slice(1)}`}>
                <CardContent className="p-6 space-y-3 flex flex-col h-full">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                    {p.badge && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                        {p.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                  <p className="text-sm text-slate-400 flex-1">{p.desc}</p>
                  <div className="flex items-center gap-1 text-sm text-slate-300 group-hover:text-white transition-colors">
                    {p.cta} <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <div className="flex justify-center gap-4 text-sm text-slate-500" data-testid="landing-footer-links">
          <Link href="/about">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">About</span>
          </Link>
          <span>·</span>
          <Link href="/getting-started">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Getting Started</span>
          </Link>
          <span>·</span>
          <Link href="/manuscript">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Papers</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
