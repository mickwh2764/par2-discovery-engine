import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ReferenceLine, Legend
} from "recharts";
import {
  ArrowLeft, Loader2, CheckCircle2, XCircle, AlertTriangle, Beaker, Activity,
  Download, ShieldCheck, FlaskConical, Dna, TrendingUp
} from "lucide-react";
import { downloadAsCSV } from "@/components/DownloadResultsButton";
import PaperCrossLinks from "@/components/PaperCrossLinks";

interface GeneResult {
  gene: string;
  category: string;
  eigenvalue: number;
  phi1: number;
  phi2: number;
  r2: number;
  stable: boolean;
}

interface DiagResult {
  pass: boolean;
  value: number | string;
  note: string;
  threshold?: number;
}

interface PairedGene {
  gene: string;
  category: string;
  proteinEigenvalue: number;
  mrnaEigenvalue: number;
}

interface ProteomeData {
  dataset: string;
  source: string;
  dataType: string;
  tissue: string;
  species: string;
  timepoints: number[];
  totalProteins: number;
  hierarchy: {
    clockMean: number;
    clockStd: number;
    clockN: number;
    targetMean: number;
    targetStd: number;
    targetN: number;
    backgroundMean: number;
    backgroundStd: number;
    backgroundN: number;
    clockTargetGap: number;
    targetBgGap: number;
    hierarchyPreserved: boolean;
  };
  permutationTest: {
    observedGap: number;
    nPermutations: number;
    pValue: number;
    significant: boolean;
  };
  bootstrapCI: {
    lower: number;
    upper: number;
    nBootstrap: number;
    excludesZero: boolean;
  };
  edgeCaseDiagnostics: Record<string, DiagResult>;
  passRate: string;
  verdicts: string[];
  perGene: {
    clock: GeneResult[];
    target: GeneResult[];
    background: GeneResult[];
  };
  mrnaComparison: {
    pairedGenes: PairedGene[];
    totalPaired: number;
    correlation: number;
    interpretation: string;
  } | null;
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-lg font-bold font-mono ${color || "text-white"}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const isPass = verdict.startsWith("PASS");
  const isCaution = verdict.startsWith("CAUTION") || verdict.startsWith("NOTE");
  const isFail = verdict.startsWith("FAIL");
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${
      isPass ? "bg-emerald-500/10 border-emerald-500/30" :
      isFail ? "bg-red-500/10 border-red-500/30" :
      "bg-amber-500/10 border-amber-500/30"
    }`} data-testid={`verdict-${isPass ? 'pass' : isFail ? 'fail' : 'caution'}`}>
      {isPass ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> :
       isFail ? <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" /> :
       <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />}
      <span className={`text-sm ${isPass ? "text-emerald-300" : isFail ? "text-red-300" : "text-amber-300"}`}>
        {verdict}
      </span>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  clock: "#06b6d4",
  target: "#f59e0b",
  background: "#64748b",
};

export default function ProteomeValidation() {
  const { data, isLoading, error } = useQuery<ProteomeData>({
    queryKey: ["/api/proteome-validation"],
    queryFn: async () => {
      const res = await fetch("/api/proteome-validation");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400 mx-auto" />
          <p className="text-slate-400">Running AR(2) on proteome data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-300">{error?.message || "Failed to load proteome data"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hierarchyBarData = [
    { category: "Clock", mean: data.hierarchy.clockMean, std: data.hierarchy.clockStd, n: data.hierarchy.clockN, fill: CATEGORY_COLORS.clock },
    { category: "Target", mean: data.hierarchy.targetMean, std: data.hierarchy.targetStd, n: data.hierarchy.targetN, fill: CATEGORY_COLORS.target },
    { category: "Background", mean: data.hierarchy.backgroundMean, std: data.hierarchy.backgroundStd, n: data.hierarchy.backgroundN, fill: CATEGORY_COLORS.background },
  ];

  const allGenes = [
    ...data.perGene.clock.map(g => ({ ...g, fill: CATEGORY_COLORS.clock })),
    ...data.perGene.target.map(g => ({ ...g, fill: CATEGORY_COLORS.target })),
    ...data.perGene.background.slice(0, 30).map(g => ({ ...g, fill: CATEGORY_COLORS.background })),
  ];

  const scatterData = data.mrnaComparison?.pairedGenes.map(g => ({
    ...g,
    fill: g.category === 'clock' ? CATEGORY_COLORS.clock : g.category === 'target' ? CATEGORY_COLORS.target : CATEGORY_COLORS.background,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" data-testid="link-back-home">
              <ArrowLeft size={16} className="mr-1" />
              Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-slate-300 border-slate-600"
            onClick={() => {
              const rows = [
                ...data.perGene.clock.map(g => ({ ...g, category: 'clock' })),
                ...data.perGene.target.map(g => ({ ...g, category: 'target' })),
                ...data.perGene.background.map(g => ({ ...g, category: 'background' })),
              ];
              downloadAsCSV(rows.map(r => ({
                Gene: r.gene, Category: r.category, Eigenvalue: r.eigenvalue,
                Phi1: r.phi1, Phi2: r.phi2, R2: r.r2, Stable: r.stable
              })), "proteome_liver_ar2_eigenvalues");
            }}
            data-testid="button-download-csv"
          >
            <Download size={14} className="mr-2" />
            Download Results (CSV)
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Dna className="h-8 w-8 text-teal-400" />
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">
                Proteome-Level AR(2) Validation
              </h1>
              <p className="text-sm text-teal-400 font-medium">{data.source}</p>
            </div>
          </div>
          <p className="text-slate-400 max-w-3xl mt-2">
            Tests whether the AR(2) eigenvalue hierarchy (clock &gt; target &gt; background) holds at the
            protein abundance level using whole-cell liver proteome data from the Mouse Circadian Proteome Atlas
            (32 tissues, ~19,000 proteins, Orbitrap Astral mass spectrometry). This is a fundamentally different
            validation than cross-species or cross-tissue mRNA comparisons — it tests whether temporal persistence
            is a property of the biological system, not just an artifact of transcript measurement.
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="border-teal-500/50 text-teal-400">Protein Level</Badge>
            <Badge variant="outline" className="border-slate-500/50 text-slate-400">{data.tissue}</Badge>
            <Badge variant="outline" className="border-slate-500/50 text-slate-400">{data.timepoints.length} time points</Badge>
            <Badge variant="outline" className="border-slate-500/50 text-slate-400">{data.totalProteins} proteins</Badge>
          </div>
        </div>

        <PaperCrossLinks currentPage="/proteome-validation" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatBox label="Clock Mean |λ|" value={data.hierarchy.clockMean.toFixed(3)} sub={`n=${data.hierarchy.clockN}`} color="text-cyan-400" />
          <StatBox label="Target Mean |λ|" value={data.hierarchy.targetMean.toFixed(3)} sub={`n=${data.hierarchy.targetN}`} color="text-amber-400" />
          <StatBox label="Background Mean |λ|" value={data.hierarchy.backgroundMean.toFixed(3)} sub={`n=${data.hierarchy.backgroundN}`} color="text-slate-400" />
          <StatBox
            label="Hierarchy"
            value={data.hierarchy.hierarchyPreserved ? "PRESERVED" : "DISRUPTED"}
            sub={`Gap: ${data.hierarchy.clockTargetGap.toFixed(3)}`}
            color={data.hierarchy.hierarchyPreserved ? "text-emerald-400" : "text-red-400"}
          />
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-400" />
                Category Eigenvalue Comparison (Protein Level)
              </CardTitle>
              <CardDescription className="text-slate-400">
                Mean AR(2) eigenvalue |λ| by gene category — clock genes should show highest persistence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hierarchyBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="category" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" label={{ value: "Mean |λ|", angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                    labelStyle={{ color: "#e2e8f0" }}
                    formatter={(value: number, name: string) => [value.toFixed(4), name]}
                  />
                  <Bar dataKey="mean" name="Mean |λ|" radius={[6, 6, 0, 0]}>
                    {hierarchyBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {hierarchyBarData.map(cat => (
                  <div key={cat.category} className="text-center">
                    <div className="text-sm font-semibold" style={{ color: cat.fill }}>{cat.category}</div>
                    <div className="text-xs text-slate-400">
                      {cat.mean.toFixed(4)} ± {cat.std.toFixed(4)} (n={cat.n})
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Robustness & Validation Verdicts
              </CardTitle>
              <CardDescription className="text-slate-400">
                Permutation test, bootstrap CIs, and edge case diagnostics — {data.passRate} checks passed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.verdicts.map((v, i) => (
                <VerdictBadge key={i} verdict={v} />
              ))}

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Edge Case Diagnostics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(data.edgeCaseDiagnostics).map(([key, diag]) => (
                    <div key={key} className={`flex items-center gap-2 p-2 rounded border ${
                      diag.pass ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
                    }`} data-testid={`diag-${key}`}>
                      {diag.pass ?
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> :
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                      }
                      <div className="min-w-0">
                        <span className="text-xs text-slate-300">{diag.note}</span>
                        <span className="text-xs text-slate-500 ml-2">({String(diag.value)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Beaker className="h-5 w-5 text-cyan-400" />
                Per-Gene Eigenvalue Results
              </CardTitle>
              <CardDescription className="text-slate-400">
                Individual protein-level AR(2) eigenvalues for clock, target, and top background genes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={allGenes} margin={{ top: 10, right: 20, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="gene"
                    stroke="#94a3b8"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis stroke="#94a3b8" label={{ value: "|λ|", angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                    formatter={(value: number, _: string, props: any) => [
                      `${value.toFixed(4)} (${props.payload.category})`,
                      "|λ|"
                    ]}
                  />
                  <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Stability", fill: "#ef4444", fontSize: 10 }} />
                  <Bar dataKey="eigenvalue" name="|λ|" radius={[3, 3, 0, 0]}>
                    {allGenes.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-3">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: CATEGORY_COLORS.clock }} /><span className="text-xs text-slate-400">Clock</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: CATEGORY_COLORS.target }} /><span className="text-xs text-slate-400">Target</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: CATEGORY_COLORS.background }} /><span className="text-xs text-slate-400">Background</span></div>
              </div>
            </CardContent>
          </Card>

          {data.mrnaComparison && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  mRNA vs Protein Eigenvalue Comparison
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Same genes measured at protein level (this study) vs mRNA level (GSE54650 Liver) — Pearson r = {data.mrnaComparison.correlation.toFixed(3)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="mrnaEigenvalue"
                      name="mRNA |λ|"
                      stroke="#94a3b8"
                      label={{ value: "mRNA Eigenvalue |λ|", position: "insideBottom", offset: -10, fill: "#94a3b8" }}
                      type="number"
                      domain={[0, 'auto']}
                    />
                    <YAxis
                      dataKey="proteinEigenvalue"
                      name="Protein |λ|"
                      stroke="#94a3b8"
                      label={{ value: "Protein |λ|", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                      type="number"
                      domain={[0, 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                      formatter={(value: number) => value.toFixed(4)}
                      labelFormatter={() => ""}
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const d = payload[0].payload as PairedGene;
                        return (
                          <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs">
                            <p className="font-bold text-white">{d.gene} ({d.category})</p>
                            <p className="text-slate-300">Protein |λ|: {d.proteinEigenvalue.toFixed(4)}</p>
                            <p className="text-slate-300">mRNA |λ|: {d.mrnaEigenvalue.toFixed(4)}</p>
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine stroke="#475569" strokeDasharray="3 3" segment={[{ x: 0, y: 0 }, { x: 1.5, y: 1.5 }]} />
                    <Scatter data={scatterData.filter(g => g.category === 'clock')} name="Clock" fill={CATEGORY_COLORS.clock} />
                    <Scatter data={scatterData.filter(g => g.category === 'target')} name="Target" fill={CATEGORY_COLORS.target} />
                    <Scatter data={scatterData.filter(g => g.category === 'background')} name="Background" fill={CATEGORY_COLORS.background} />
                    <Legend />
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-purple-400">Correlation: r = {data.mrnaComparison.correlation.toFixed(3)}</span>
                    <span className="text-slate-400 ml-2">({data.mrnaComparison.totalPaired} paired genes)</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{data.mrnaComparison.interpretation}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-amber-900/20 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Caveats & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-200/80">
              <p>1. <strong>6 time points:</strong> AR(2) estimates from 6-point protein series have 4 residuals — individual gene estimates are noisy. Category-level aggregation provides statistical power.</p>
              <p>2. <strong>Protein vs mRNA dynamics:</strong> Protein half-lives (hours to days) differ from mRNA (minutes to hours). Eigenvalue differences between molecular levels may reflect genuine biology, not methodological artifacts.</p>
              <p>3. <strong>Representative values:</strong> Protein abundance values are representative of temporal profiles reported in Otobe et al. (2026). Full raw data available from chronoproteinology.org/circadian_atlas.</p>
              <p>4. <strong>Single tissue:</strong> This initial validation covers liver whole-cell proteome only. The atlas includes 32 tissues — future expansion will test cross-tissue protein hierarchy preservation.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-slate-400" />
                Gene Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {(['clock', 'target', 'background'] as const).map(cat => {
                  const genes = cat === 'clock' ? data.perGene.clock :
                                cat === 'target' ? data.perGene.target :
                                data.perGene.background.slice(0, 15);
                  return (
                    <div key={cat}>
                      <h4 className="text-sm font-semibold mb-2 capitalize" style={{ color: CATEGORY_COLORS[cat] }}>
                        {cat} Genes ({cat === 'background' ? `top ${genes.length} of ${data.hierarchy.backgroundN}` : genes.length})
                      </h4>
                      <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {genes.map(g => (
                          <div key={g.gene} className="flex justify-between items-center text-xs bg-slate-700/30 rounded px-2 py-1" data-testid={`gene-${g.gene}`}>
                            <span className="text-slate-300 font-mono">{g.gene}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-white">{g.eigenvalue.toFixed(3)}</span>
                              {g.stable ?
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> :
                                <XCircle className="h-3 w-3 text-red-400" />
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
