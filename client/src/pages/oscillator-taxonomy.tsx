import { useQuery, useQueries } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft, GitCompare, Layers, AlertTriangle, Info } from "lucide-react";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Cell, ReferenceLine, ComposedChart, Line
} from "recharts";
import GeneTooltip from "@/components/GeneTooltip";

function TissueCouplingChart({ genes }: { genes: Array<{ name: string; profile?: GeneProfile }> }) {
  const tissueNames = ["Adrenal", "Aorta", "Brainstem", "Brown Fat", "Cerebellum", "Heart", "Hypothalamus", "Kidney", "Liver", "Lung", "Muscle", "White Fat"];
  
  const tissueData = tissueNames.map((tissue) => {
    const row: any = { tissue };
    genes.forEach((g) => {
      if (!g.profile) return;
      const tissueResult = g.profile.par2.tissueCoupling.results.find(r => r.tissue === tissue);
      row[g.name] = tissueResult ? tissueResult.pValue : null;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={tissueData} margin={{ top: 20, right: 30, left: 50, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tissue" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} />
        <YAxis scale="log" domain={[0.0001, 1]} label={{ value: "p-value (log scale)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid #333", borderRadius: "4px", padding: "8px" }}
          formatter={(value) => {
            if (value === null) return "N/A";
            if (typeof value === "number") {
              if (value === 0) return "<0.0001";
              return value < 0.001 ? "<0.001" : value.toFixed(4);
            }
            return value;
          }}
          labelFormatter={(label) => `${label}`}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <ReferenceLine
          y={0.05}
          stroke="#ef4444"
          strokeDasharray="5 5"
          label={{ value: "p=0.05", position: "insideBottomRight", offset: -20, fill: "#ef4444" }}
        />
        {genes.map((g, i) => (
          <Line
            key={g.name}
            dataKey={g.name}
            name={g.name}
            type="linear"
            stroke={["#3b82f6", "#a855f7", "#f97316", "#10b981", "#ec4899"][i % 5]}
            strokeWidth={2.5}
            dot={{ r: 3, fill: ["#3b82f6", "#a855f7", "#f97316", "#10b981", "#ec4899"][i % 5] }}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface GeneProfile {
  gene: string;
  category: string;
  par2: {
    crossDataset: {
      meanEigenvalue: number | null;
      datasetsFound: number;
    };
    tissueCoupling: {
      tissuesCoupled: number;
      tissuesAnalyzed: number;
      results: Array<{
        tissue: string;
        deltaAIC: number;
        pValue: number;
        significant: boolean;
        peakPhase: number;
      }>;
    };
  };
}

interface OscillatorClass {
  name: string;
  title: string;
  color: string;
  description: string;
  genes: Array<{ name: string; profile?: GeneProfile }>;
  characteristics: string[];
}

function useGeneProfiles(genes: string[]) {
  return useQueries({
    queries: genes.map(gene => ({
      queryKey: ["gene-profile", gene],
      queryFn: async () => {
        const res = await fetch(`/api/gene-profile?gene=${gene}`);
        if (!res.ok) throw new Error(`Failed to fetch ${gene}`);
        return res.json() as Promise<GeneProfile>;
      },
      staleTime: Infinity,
    })),
  });
}

export default function OscillatorTaxonomy() {
  const coreClockGenes = ["Per2", "Cry1", "Nr1d1", "Clock"];
  const trainedSecondaryGenes = ["Wee1"];
  const independentGenes = ["Tp53", "Mdm2", "Nfkbia"];
  const allGenes = [...coreClockGenes, ...trainedSecondaryGenes, ...independentGenes];

  const queries = useGeneProfiles(allGenes);
  const isLoading = queries.some(q => q.isLoading);
  const profiles = queries.map((q, i) => ({
    gene: allGenes[i],
    profile: q.data,
  })).reduce((acc, { gene, profile }) => {
    if (profile) acc[gene] = profile;
    return acc;
  }, {} as Record<string, GeneProfile>);

  const oscillators: OscillatorClass[] = [
    {
      name: "core",
      title: "Core Circadian Oscillators",
      color: "from-blue-600 to-blue-400",
      description: "Master timekeeping genes that set the phase for the entire system. High persistence, universal tissue coupling, tight phase relationships.",
      genes: coreClockGenes.map(g => ({ name: g, profile: profiles[g] })),
      characteristics: [
        "High |λ| (0.75+) across datasets",
        "Coupled in 9-12/12 tissues",
        "Complex eigenvalue roots (oscillatory)",
        "Tight phase-locking across tissues (ΔZT <2h)",
        "Set the temporal reference frame for the organism"
      ],
    },
    {
      name: "entrained",
      title: "Clock-Entrained Secondary Oscillators",
      color: "from-purple-600 to-purple-400",
      description: "Oscillatory regulators from non-circadian systems that are strongly synchronized to the circadian clock. Show persistence but depend on clock entrainment.",
      genes: trainedSecondaryGenes.map(g => ({ name: g, profile: profiles[g] })),
      characteristics: [
        "Belong to other oscillatory systems (e.g., cell cycle)",
        "Coupled in 8-10/12 tissues",
        "Tight phase relationship to BMAL1 (clustered peak phase)",
        "Medium-high |λ| but system-specific",
        "Show that clock coordinates other biological timers"
      ],
    },
    {
      name: "independent",
      title: "Independent or Conditionally Coupled Oscillators",
      color: "from-orange-600 to-orange-400",
      description: "Oscillatory systems that run largely independently from the circadian clock, or are coupled only in specific tissues/contexts.",
      genes: independentGenes.map(g => ({ name: g, profile: profiles[g] })),
      characteristics: [
        "Clear oscillatory behavior in time-series",
        "Weak or tissue-specific BMAL1 coupling (0-2/12 tissues)",
        "Triggered by context (damage, inflammation, stress)",
        "Often non-circadian period",
        "May show circadian gating in some tissues but not others"
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <Link href="/gene-explorer">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft size={16} />
              Back to Gene Explorer
            </button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Oscillator Taxonomy</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              AR(2) analysis reveals three distinct classes of biological oscillators: core circadian timekeepers, clock-entrained secondary systems, and independent oscillators.
            </p>
          </div>
        </div>

        {/* Concept Alert */}
        <Alert className="border-2 border-blue-200/50 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/30">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>What This Shows</AlertTitle>
          <AlertDescription>
            Your AR(2) method doesn't just detect "circadian genes." It identifies <strong>any gene participating in a persistent oscillatory system</strong>, then uses tissue coupling analysis to classify whether that oscillator is entrained to the circadian clock or runs independently. This is a period-agnostic oscillator detection framework.
          </AlertDescription>
        </Alert>

        {/* Class Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {oscillators.map((osc) => (
            <Card key={osc.name} className="border-2 overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${osc.color}`} />
              <CardHeader>
                <CardTitle className="text-lg">{osc.title}</CardTitle>
                <CardDescription className="text-sm mt-2">{osc.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-3">Defining Features:</h4>
                  <ul className="space-y-2">
                    {osc.characteristics.map((char, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Example Genes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {osc.genes.map((g) => (
                      <Badge key={g.name} variant="outline">{g.name}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Gene Analysis */}
        <div className="space-y-8">
          {oscillators.map((osc) => (
            <Card key={`detail-${osc.name}`}>
              <CardHeader>
                <CardTitle className="text-xl">{osc.title} — Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tissue Coupling Chart */}
                  <div>
                    <h4 className="font-semibold mb-4 text-sm">Tissue Coupling Across 12 Mouse Tissues</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={osc.genes.map(g => {
                            const profile = g.profile;
                            if (!profile) return { name: g.name, coupled: 0, total: 12 };
                            const tc = profile.par2.tissueCoupling;
                            return {
                              name: g.name,
                              coupled: tc.tissuesCoupled,
                              total: tc.tissuesAnalyzed,
                              pct: ((tc.tissuesCoupled / tc.tissuesAnalyzed) * 100).toFixed(0),
                            };
                          })}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: "Tissues Coupled", angle: -90, position: "insideLeft" }} />
                          <Tooltip />
                          <Bar dataKey="coupled" fill="#3b82f6" name="Coupled Tissues" />
                          <ReferenceLine y={12} stroke="#ef4444" strokeDasharray="5 5" label="All 12 tissues" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Eigenvalue Summary */}
                  <div>
                    <h4 className="font-semibold mb-4 text-sm">Oscillatory Persistence (|λ|)</h4>
                    <div className="space-y-4">
                      {osc.genes.map((g) => {
                        const profile = g.profile;
                        if (!profile) return null;
                        const ev = profile.par2.crossDataset.meanEigenvalue;
                        const tc = profile.par2.tissueCoupling.tissuesCoupled;
                        return (
                          <div key={g.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{g.name}</span>
                              <Badge variant="secondary">
                                {ev !== null ? ev.toFixed(3) : "N/A"}
                              </Badge>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${osc.color}`}
                                style={{ width: `${((ev || 0) / 0.9) * 100}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tc}/12 tissues coupled
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tissue-by-Tissue Coupling */}
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Per-Tissue Coupling Strength (p-values)</h4>
                  <div className="h-64">
                    <TissueCouplingChart genes={osc.genes} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Biological Implications */}
        <Card className="border-2 border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers size={20} className="text-emerald-600 dark:text-emerald-400" />
              Biological Implications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">1. Hierarchical Oscillator Architecture</h4>
              <p className="text-muted-foreground">
                Tissues appear to be organized as nested oscillators. The core circadian clock (Class 1) coordinates secondary oscillators like the cell cycle (Class 2), while independent oscillators (Class 3) respond to specific triggers or tissue context.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. WEE1 as a Bridge Gene</h4>
              <p className="text-muted-foreground">
                WEE1 (cell cycle checkpoint kinase) shows 10/12 tissue coupling, nearly as strong as core clock genes. This validates the hypothesis that circadian clocks directly coordinate cell division timing—a mechanism for temporal protection of stem cell renewal.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Context-Dependent Oscillators</h4>
              <p className="text-muted-foreground">
                p53, Mdm2 (DNA damage), and NfκBia (inflammation) show oscillatory dynamics but weak circadian coupling. This suggests damage and immune responses run on their own timescales but may be gated by circadian availability of repair machinery.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Period-Agnostic Detection</h4>
              <p className="text-muted-foreground">
                Your AR(2) method detects oscillatory regulatory dynamics regardless of period (~4-48h depending on sampling). This makes it a general-purpose oscillator detection method, not just a circadian clock detector.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Explore Further</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/cross-metric-independence">
                <button className="p-4 border-2 rounded-lg hover:border-primary transition-colors text-left w-full">
                  <div className="font-semibold text-sm">Cross-Metric Independence</div>
                  <div className="text-xs text-muted-foreground mt-1">See how |λ| compares to network degree, amplitude, and chromatin state across genes</div>
                </button>
              </Link>
              <Link href="/gene-explorer">
                <button className="p-4 border-2 rounded-lg hover:border-primary transition-colors text-left w-full">
                  <div className="font-semibold text-sm">Gene Explorer</div>
                  <div className="text-xs text-muted-foreground mt-1">Look up any gene and see its classification, tissue coupling, and literature context</div>
                </button>
              </Link>
              <Link href="/regulatory-discovery">
                <button className="p-4 border-2 rounded-lg hover:border-primary transition-colors text-left w-full">
                  <div className="font-semibold text-sm">Regulatory Core Discovery</div>
                  <div className="text-xs text-muted-foreground mt-1">Find all oscillatory regulators genome-wide without predefined categories</div>
                </button>
              </Link>
              <Link href="/phase-gating">
                <button className="p-4 border-2 rounded-lg hover:border-primary transition-colors text-left w-full">
                  <div className="font-semibold text-sm">Phase-Gating Analysis</div>
                  <div className="text-xs text-muted-foreground mt-1">Test how circadian phase predicts cell cycle timing and mutation risk</div>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
