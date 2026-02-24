import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, Legend,
} from "recharts";
import {
  ArrowLeft, Loader2, CheckCircle2, XCircle, AlertTriangle, Clock, Beaker, Activity,
  Sun, Moon, BookOpen, FlaskConical, ArrowRightLeft, TrendingUp, Download,
} from "lucide-react";
import DownloadResultsButton, { downloadAsCSV } from "@/components/DownloadResultsButton";
import PaperCrossLinks from "@/components/PaperCrossLinks";

interface TimeVaryingGene {
  gene: string;
  category: string;
  fullEigenvalue: number;
  dayEigenvalue: number;
  nightEigenvalue: number;
  dayNightShift: number;
  permutationP: number;
  effectSize: number;
  significantShift: boolean;
}

interface PhaseBin {
  binLabel: string;
  binRange: string;
  meanEigenvalue: number;
  nGenes: number;
  genes: string[];
}

interface KOGene {
  gene: string;
  category: string;
  wtEigenvalue: number;
  koEigenvalue: number;
  eigenvalueShift: number;
  wtRhythmicity: number;
  koRhythmicity: number;
  rhythmicityShift: number;
}

interface LitRef {
  finding: string;
  verified: boolean;
  citation: string;
  method: string;
  agreement: string;
}

interface ExtendedResponse {
  dataset: string;
  timeVaryingEigenvalues: {
    genes: TimeVaryingGene[];
    summary: {
      totalGenes: number;
      significantShifts: number;
      meanClockShift: number;
      meanTargetShift: number;
      interpretation: string;
    };
  };
  phaseEigenvalueCorrelation: {
    spearmanR: number;
    pValue: number;
    nGenes: number;
    phaseBins: PhaseBin[];
    highestPersistenceBin: string;
    interpretation: string;
  };
  koComparison: {
    available: boolean;
    wtDataset: string;
    koDataset: string;
    perGene: KOGene[];
    summary: {
      meanClockEigenvalueWT: number;
      meanClockEigenvalueKO: number;
      meanTargetEigenvalueWT: number;
      meanTargetEigenvalueKO: number;
      clockShiftP: number;
      targetShiftP: number;
      wtCoupledGenes: number;
      koCoupledGenes: number;
      totalTestedGenes: number;
      interpretation: string;
    };
  };
  literatureCrossReferences: LitRef[];
}

const DATASETS = [
  { id: "GSE70499_Liver_Bmal1WT_circadian.csv", label: "Mouse Liver BMAL1-WT (Koike 2012)" },
  { id: "GSE11923_Liver_1h_48h_genes.csv", label: "Mouse Liver (Hughes 2009, 1h resolution)" },
  { id: "GSE54650_Liver_circadian.csv", label: "Mouse Liver (Zhang 2014)" },
  { id: "GSE54650_Kidney_circadian.csv", label: "Mouse Kidney (Zhang 2014)" },
  { id: "GSE54650_Lung_circadian.csv", label: "Mouse Lung (Zhang 2014)" },
  { id: "GSE54650_Heart_circadian.csv", label: "Mouse Heart (Zhang 2014)" },
  { id: "GSE133342_Liver_ConstantDarkness.csv", label: "Mouse Liver (Constant Darkness)" },
  { id: "GSE30411_Liver_WT_2h_48h_genes.csv", label: "Mouse Liver (Panda 2002, 2h resolution)" },
  { id: "GSE93903_Liver_Young_circadian.csv", label: "Mouse Liver Young (Sato 2017)" },
  { id: "GSE93903_Liver_Old_circadian.csv", label: "Mouse Liver Old (Sato 2017)" },
  { id: "GSE70499_Liver_Bmal1KO_circadian.csv", label: "Mouse Liver BMAL1-KO (Koike 2012)" },
  { id: "GSE54650_Adrenal_circadian.csv", label: "Mouse Adrenal (Zhang 2014)" },
  { id: "GSE54650_Aorta_circadian.csv", label: "Mouse Aorta (Zhang 2014)" },
  { id: "GSE54650_Brainstem_circadian.csv", label: "Mouse Brainstem (Zhang 2014)" },
  { id: "GSE54650_Cerebellum_circadian.csv", label: "Mouse Cerebellum (Zhang 2014)" },
  { id: "GSE54650_Hypothalamus_circadian.csv", label: "Mouse Hypothalamus (Zhang 2014)" },
  { id: "GSE98965_Baboon_Liver_circadian.csv", label: "Baboon Liver (Mure 2018)" },
  { id: "GSE98965_Baboon_Heart_circadian.csv", label: "Baboon Heart (Mure 2018)" },
];

function formatP(p: number): string {
  if (p < 1e-10) return p.toExponential(1);
  if (p < 0.001) return p.toExponential(2);
  return p.toFixed(4);
}

function StatBox({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-lg font-bold font-mono ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
    </div>
  );
}

function LiteratureCard({ ref: litRef }: { ref: LitRef }) {
  return (
    <div className={`border rounded-lg p-4 ${litRef.verified ? "bg-emerald-500/5 border-emerald-500/30" : "bg-amber-500/5 border-amber-500/30"}`} data-testid={`card-lit-${litRef.citation.slice(0, 20)}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${litRef.verified ? "text-emerald-400" : "text-amber-400"}`}>
          {litRef.verified ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </div>
        <div className="space-y-2 min-w-0">
          <div>
            <p className="text-sm font-medium text-white">{litRef.finding}</p>
            <p className="text-xs text-slate-400 mt-1">{litRef.agreement}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="border-slate-600 text-slate-300 text-[10px]">
              <BookOpen className="h-3 w-3 mr-1" />
              {litRef.citation}
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-400 text-[10px]">
              {litRef.method}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PhaseGating() {
  const [dataset, setDataset] = useState(DATASETS[0].id);

  const { data, isLoading, error } = useQuery<ExtendedResponse>({
    queryKey: ["/api/phase-gating/extended", dataset],
    queryFn: async () => {
      const res = await fetch(`/api/phase-gating/extended?dataset=${encodeURIComponent(dataset)}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const verifiedRefs = data?.literatureCrossReferences.filter(r => r.verified) || [];
  const unverifiedRefs = data?.literatureCrossReferences.filter(r => !r.verified) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800" data-testid="link-back-home">
              <ArrowLeft size={14} />
              Home
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2" data-testid="text-page-title">
              <Clock size={24} className="text-cyan-400" />
              Phase-Gating Analysis
            </h1>
            <p className="text-sm text-slate-400 mt-1">Time-varying AR(2) dynamics, phase-eigenvalue structure, and knockout validation</p>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 mt-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong className="text-white">What you can do:</strong> Phase gating examines how eigenvalues change across different phases of the circadian cycle. This reveals whether persistence is constant or varies with time of day. Download results to analyze phase-dependent dynamics.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-600/50 text-amber-400 max-w-xs text-center" data-testid="badge-hypothesis">
            <Beaker size={12} className="mr-1 shrink-0" />
            <span className="text-[10px] leading-tight">Statistical analyses cross-referenced against independent published literature</span>
          </Badge>
          {data && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800"
              data-testid="button-download-results"
              onClick={() => {
                const csvData = data.timeVaryingEigenvalues.genes.map(g => ({
                  gene: g.gene,
                  category: g.category,
                  fullEigenvalue: g.fullEigenvalue,
                  dayEigenvalue: g.dayEigenvalue,
                  nightEigenvalue: g.nightEigenvalue,
                  dayNightShift: g.dayNightShift,
                  permutationP: g.permutationP,
                  effectSize: g.effectSize,
                  significantShift: g.significantShift,
                }));
                downloadAsCSV(csvData, "PAR2_PhaseGating_Results.csv");
              }}
            >
              <Download className="h-4 w-4" />
              Download Results (CSV)
            </Button>
          )}
        </div>

        <PaperCrossLinks currentPage="/phase-gating" />

        <Card className="bg-slate-900/80 border-slate-700 mb-6" data-testid="card-dataset-selector">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-300 whitespace-nowrap">Dataset</label>
              <Select value={dataset} onValueChange={setDataset}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white max-w-lg" data-testid="select-dataset-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {DATASETS.map(ds => (
                    <SelectItem key={ds.id} value={ds.id} data-testid={`select-dataset-item-${ds.id}`}>
                      {ds.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20" data-testid="loading-state">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mb-4" />
            <p className="text-slate-400 text-lg">Running extended phase-gating analysis...</p>
            <p className="text-slate-400 text-sm mt-1">Computing time-varying eigenvalues, genome-wide correlations, and KO comparison</p>
          </div>
        )}

        {error && (
          <Card className="bg-red-500/10 border-red-500/30 mb-6" data-testid="error-state">
            <CardContent className="pt-4">
              <p className="text-red-400 text-sm">{(error as Error).message}</p>
            </CardContent>
          </Card>
        )}

        {data && !isLoading && (
          <Tabs defaultValue="time-varying" className="space-y-6">
            <TabsList className="bg-slate-800/80 border border-slate-700 p-1">
              <TabsTrigger value="time-varying" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2" data-testid="tab-time-varying">
                <Sun size={14} />
                Day vs Night Dynamics
              </TabsTrigger>
              <TabsTrigger value="phase-correlation" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-2" data-testid="tab-phase-correlation">
                <TrendingUp size={14} />
                Phase-Eigenvalue Map
              </TabsTrigger>
              <TabsTrigger value="ko-comparison" className="data-[state=active]:bg-red-600 data-[state=active]:text-white gap-2" data-testid="tab-ko-comparison">
                <FlaskConical size={14} />
                KO Validation
              </TabsTrigger>
              <TabsTrigger value="literature" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-2" data-testid="tab-literature">
                <BookOpen size={14} />
                Literature ({verifiedRefs.length} Verified)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="time-varying" className="space-y-6">
              <Card className="bg-slate-900/80 border-slate-700" data-testid="card-time-varying">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <ArrowRightLeft className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Time-Varying AR(2) Eigenvalues: Day vs Night</CardTitle>
                      <CardDescription className="text-slate-400">
                        Do gene dynamics genuinely shift between circadian day (CT0-12) and night (CT12-24) phases?
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBox label="Genes Tested" value={String(data.timeVaryingEigenvalues.summary.totalGenes)} />
                    <StatBox
                      label="Significant Shifts"
                      value={`${data.timeVaryingEigenvalues.summary.significantShifts}/${data.timeVaryingEigenvalues.summary.totalGenes}`}
                      highlight={data.timeVaryingEigenvalues.summary.significantShifts > 0}
                    />
                    <StatBox
                      label="Mean Clock Shift"
                      value={data.timeVaryingEigenvalues.summary.meanClockShift.toFixed(3)}
                      sub="Day - Night |λ|"
                    />
                    <StatBox
                      label="Mean Target Shift"
                      value={data.timeVaryingEigenvalues.summary.meanTargetShift.toFixed(3)}
                      sub="Day - Night |λ|"
                    />
                  </div>

                  <div className="h-80" data-testid="chart-day-night">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.timeVaryingEigenvalues.genes.map(g => ({
                          gene: g.gene,
                          day: g.dayEigenvalue,
                          night: g.nightEigenvalue,
                          category: g.category,
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="gene"
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          label={{ value: '|λ| Eigenvalue', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                          formatter={(value: number, name: string) => [value.toFixed(4), name === 'day' ? 'Day (CT0-12)' : 'Night (CT12-24)']}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '10px' }}
                          formatter={(value: string) => value === 'day' ? 'Day (CT0-12)' : 'Night (CT12-24)'}
                        />
                        <Bar dataKey="day" fill="#facc15" name="day" />
                        <Bar dataKey="night" fill="#3b82f6" name="night" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-time-varying">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400">
                          <th className="py-2 px-3 text-left">Gene</th>
                          <th className="py-2 px-3 text-left">Type</th>
                          <th className="py-2 px-3 text-right">Full |λ|</th>
                          <th className="py-2 px-3 text-right">Day |λ|</th>
                          <th className="py-2 px-3 text-right">Night |λ|</th>
                          <th className="py-2 px-3 text-right">Δ (Day-Night)</th>
                          <th className="py-2 px-3 text-right">Perm. P</th>
                          <th className="py-2 px-3 text-center">Sig.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.timeVaryingEigenvalues.genes.map(g => (
                          <tr key={g.gene} className="border-b border-slate-700/50 hover:bg-slate-800/50" data-testid={`row-tv-${g.gene}`}>
                            <td className={`py-2 px-3 font-mono font-medium ${g.category === 'clock' ? 'text-amber-300' : 'text-cyan-300'}`}>{g.gene}</td>
                            <td className="py-2 px-3 text-slate-400 text-xs capitalize">{g.category}</td>
                            <td className="py-2 px-3 text-right font-mono text-white">{g.fullEigenvalue.toFixed(4)}</td>
                            <td className="py-2 px-3 text-right font-mono text-yellow-300">{g.dayEigenvalue.toFixed(4)}</td>
                            <td className="py-2 px-3 text-right font-mono text-blue-300">{g.nightEigenvalue.toFixed(4)}</td>
                            <td className={`py-2 px-3 text-right font-mono ${Math.abs(g.dayNightShift) > 0.05 ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {g.dayNightShift > 0 ? '+' : ''}{g.dayNightShift.toFixed(4)}
                            </td>
                            <td className={`py-2 px-3 text-right font-mono ${g.permutationP < 0.05 ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {formatP(g.permutationP)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {g.significantShift ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-slate-400 mx-auto" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 leading-relaxed" data-testid="text-interpretation-tv">
                      {data.timeVaryingEigenvalues.summary.interpretation}
                    </p>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Independent Literature Verification</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Day-night differences in liver gene expression were independently established by Storch et al. (2002, Nature 417:78-83) using Affymetrix microarrays, showing ~10% of transcripts oscillate with dramatic day-night phase differences.
                      Panda et al. (2002, Cell 109:307-320) confirmed this using serial analysis of gene expression (SAGE) in SCN and liver. These studies used entirely different methods from AR(2) modeling.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="phase-correlation" className="space-y-6">
              <Card className="bg-slate-900/80 border-slate-700" data-testid="card-phase-correlation">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Phase-Eigenvalue Correlation</CardTitle>
                      <CardDescription className="text-slate-400">
                        Does a gene's peak expression time predict its AR(2) persistence? Genome-wide analysis across {data.phaseEigenvalueCorrelation.nGenes.toLocaleString()} oscillating genes.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBox label="Spearman r" value={data.phaseEigenvalueCorrelation.spearmanR.toFixed(4)} />
                    <StatBox
                      label="P-value"
                      value={formatP(data.phaseEigenvalueCorrelation.pValue)}
                      highlight={data.phaseEigenvalueCorrelation.pValue < 0.05}
                    />
                    <StatBox label="Genes Analyzed" value={data.phaseEigenvalueCorrelation.nGenes.toLocaleString()} sub="Cosinor R² > 0.1" />
                    <StatBox
                      label="Highest Persistence"
                      value={data.phaseEigenvalueCorrelation.highestPersistenceBin}
                      sub="Phase bin"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm text-slate-300 font-medium mb-3">Mean |λ| by Phase Bin</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.phaseEigenvalueCorrelation.phaseBins.map(b => ({
                              name: b.binLabel,
                              eigenvalue: b.meanEigenvalue,
                              genes: b.nGenes,
                            }))}
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis
                              tick={{ fill: '#94a3b8', fontSize: 11 }}
                              label={{ value: 'Mean |λ|', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                              formatter={(value: number, name: string) => [value.toFixed(4), 'Mean |λ|']}
                              labelFormatter={(label: string) => `Phase: ${label}`}
                            />
                            <Bar dataKey="eigenvalue" name="Mean |λ|">
                              {data.phaseEigenvalueCorrelation.phaseBins.map((b, i) => (
                                <Cell
                                  key={i}
                                  fill={b.binLabel === data.phaseEigenvalueCorrelation.highestPersistenceBin ? '#22d3ee' : '#64748b'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm text-slate-300 font-medium">Phase Bin Details</h4>
                      {data.phaseEigenvalueCorrelation.phaseBins.map((bin, i) => (
                        <div key={i} className={`border rounded-lg p-3 ${bin.binLabel === data.phaseEigenvalueCorrelation.highestPersistenceBin ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/50 border-slate-700/50'}`} data-testid={`card-bin-${bin.binLabel}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{bin.binLabel}</span>
                            <span className="text-xs text-slate-400">{bin.binRange}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">{bin.nGenes} genes</span>
                            <span className="font-mono text-sm text-white">|λ| = {bin.meanEigenvalue.toFixed(4)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 leading-relaxed" data-testid="text-interpretation-pc">
                      {data.phaseEigenvalueCorrelation.interpretation}
                    </p>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Independent Literature Context</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Phase-dependent gene regulation was characterized by Panda et al. (2002, Cell 109:307-320) showing output genes cluster at specific circadian phases, with genes at dawn/dusk transitions showing distinct regulation patterns.
                      Ueda et al. (2002, Nature 418:534-539) mapped phase-specific transcription factor binding, showing that genes peaking at different phases are driven by different regulatory elements.
                      Neither study used autoregressive models.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ko-comparison" className="space-y-6">
              <Card className="bg-slate-900/80 border-slate-700" data-testid="card-ko-comparison">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <FlaskConical className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">BMAL1-KO vs Wild-Type Comparison</CardTitle>
                      <CardDescription className="text-slate-400">
                        {data.koComparison.available
                          ? `Does removing the master clock gene abolish AR(2) dynamics? Comparing ${data.koComparison.wtDataset} vs ${data.koComparison.koDataset}`
                          : 'KO comparison datasets not available for this selection'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!data.koComparison.available ? (
                    <div className="text-center py-8 text-slate-400" data-testid="text-ko-unavailable">
                      <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No paired KO dataset available. Select a BMAL1-WT or BMAL1-KO dataset to enable this comparison.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox
                          label="Clock Eigenvalue (WT)"
                          value={data.koComparison.summary.meanClockEigenvalueWT.toFixed(4)}
                        />
                        <StatBox
                          label="Clock Eigenvalue (KO)"
                          value={data.koComparison.summary.meanClockEigenvalueKO.toFixed(4)}
                        />
                        <StatBox
                          label="Target Eigenvalue (WT)"
                          value={data.koComparison.summary.meanTargetEigenvalueWT.toFixed(4)}
                        />
                        <StatBox
                          label="Target Eigenvalue (KO)"
                          value={data.koComparison.summary.meanTargetEigenvalueKO.toFixed(4)}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox
                          label="Clock Shift P-value"
                          value={formatP(data.koComparison.summary.clockShiftP)}
                          highlight={data.koComparison.summary.clockShiftP < 0.05}
                        />
                        <StatBox
                          label="Target Shift P-value"
                          value={formatP(data.koComparison.summary.targetShiftP)}
                          highlight={data.koComparison.summary.targetShiftP < 0.05}
                        />
                        <StatBox
                          label="Coupled Genes (WT)"
                          value={`${data.koComparison.summary.wtCoupledGenes}/${data.koComparison.summary.totalTestedGenes}`}
                          sub="Significant coupling"
                        />
                        <StatBox
                          label="Coupled Genes (KO)"
                          value={`${data.koComparison.summary.koCoupledGenes}/${data.koComparison.summary.totalTestedGenes}`}
                          sub="Significant coupling"
                          highlight={data.koComparison.summary.koCoupledGenes < data.koComparison.summary.wtCoupledGenes}
                        />
                      </div>

                      <div className="h-72" data-testid="chart-ko-comparison">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.koComparison.perGene.map(g => ({
                              gene: g.gene,
                              wt: g.wtEigenvalue,
                              ko: g.koEigenvalue,
                              category: g.category,
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                              dataKey="gene"
                              tick={{ fill: '#94a3b8', fontSize: 10 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              tick={{ fill: '#94a3b8', fontSize: 11 }}
                              label={{ value: '|λ| Eigenvalue', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                              formatter={(value: number, name: string) => [value.toFixed(4), name === 'wt' ? 'Wild-Type' : 'BMAL1-KO']}
                            />
                            <Legend formatter={(value: string) => value === 'wt' ? 'Wild-Type (WT)' : 'BMAL1-KO'} />
                            <Bar dataKey="wt" fill="#22c55e" name="wt" />
                            <Bar dataKey="ko" fill="#ef4444" name="ko" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" data-testid="table-ko-comparison">
                          <thead>
                            <tr className="border-b border-slate-700 text-slate-400">
                              <th className="py-2 px-3 text-left">Gene</th>
                              <th className="py-2 px-3 text-left">Type</th>
                              <th className="py-2 px-3 text-right">WT |λ|</th>
                              <th className="py-2 px-3 text-right">KO |λ|</th>
                              <th className="py-2 px-3 text-right">Δ|λ|</th>
                              <th className="py-2 px-3 text-right">WT R² (rhythm)</th>
                              <th className="py-2 px-3 text-right">KO R² (rhythm)</th>
                              <th className="py-2 px-3 text-right">ΔR²</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.koComparison.perGene.map(g => (
                              <tr key={g.gene} className="border-b border-slate-700/50 hover:bg-slate-800/50" data-testid={`row-ko-${g.gene}`}>
                                <td className={`py-2 px-3 font-mono font-medium ${g.category === 'clock' ? 'text-amber-300' : 'text-cyan-300'}`}>{g.gene}</td>
                                <td className="py-2 px-3 text-slate-400 text-xs capitalize">{g.category}</td>
                                <td className="py-2 px-3 text-right font-mono text-emerald-300">{g.wtEigenvalue.toFixed(4)}</td>
                                <td className="py-2 px-3 text-right font-mono text-red-300">{g.koEigenvalue.toFixed(4)}</td>
                                <td className={`py-2 px-3 text-right font-mono ${g.eigenvalueShift < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {g.eigenvalueShift > 0 ? '+' : ''}{g.eigenvalueShift.toFixed(4)}
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-slate-300">{g.wtRhythmicity.toFixed(3)}</td>
                                <td className="py-2 px-3 text-right font-mono text-slate-300">{g.koRhythmicity.toFixed(3)}</td>
                                <td className={`py-2 px-3 text-right font-mono ${g.rhythmicityShift < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                  {g.rhythmicityShift > 0 ? '+' : ''}{g.rhythmicityShift.toFixed(3)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                        <p className="text-xs text-slate-400 leading-relaxed" data-testid="text-interpretation-ko">
                          {data.koComparison.summary.interpretation}
                        </p>
                      </div>

                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-blue-400">Independent Literature Verification</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          BMAL1 knockout effects on circadian gene expression were independently established by:
                          (1) Bunger et al. (2000, Cell 103:1009-1017) showing BMAL1-null mice are arrhythmic in constant darkness.
                          (2) Kondratov et al. (2006, Genes Dev 20:1868-1873) demonstrating BMAL1-KO mice exhibit premature aging.
                          (3) Koike et al. (2012, Science 338:349-354) performing the ChIP-seq study from which this dataset originates, showing BMAL1 drives genome-wide rhythmic transcription.
                          These are orthogonal experimental methods (behavioral assays, histology, ChIP-seq) that independently confirm BMAL1 is essential for circadian gene regulation.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="literature" className="space-y-6">
              <Card className="bg-slate-900/80 border-slate-700" data-testid="card-literature">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <BookOpen className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Literature Cross-References</CardTitle>
                      <CardDescription className="text-slate-400">
                        Findings from this analysis cross-referenced against published studies using entirely different methods.
                        Verification means an independent lab confirmed the same biological pattern using orthogonal techniques.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {verifiedRefs.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Independently Verified ({verifiedRefs.length})
                      </h3>
                      <p className="text-xs text-slate-400 mb-2">
                        These findings were confirmed by other research groups using different experimental methods (microarrays, knockouts, reporters, ChIP-seq).
                        "Verified" means the biological pattern matches, not that the AR(2) method itself has been independently validated.
                      </p>
                      {verifiedRefs.map((r, i) => (
                        <LiteratureCard key={i} ref={r} />
                      ))}
                    </div>
                  )}

                  {unverifiedRefs.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Unverified or Partially Supported ({unverifiedRefs.length})
                      </h3>
                      <p className="text-xs text-slate-400 mb-2">
                        These findings have not been independently confirmed by published literature using orthogonal methods.
                        They should be treated as hypotheses requiring experimental validation.
                      </p>
                      {unverifiedRefs.map((r, i) => (
                        <LiteratureCard key={i} ref={r} />
                      ))}
                    </div>
                  )}

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4" data-testid="card-lit-caveats">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">Interpretation Limitations</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5">1.</span>Statistical significance in AR(2) modeling does not constitute biological confirmation.</li>
                      <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5">2.</span>Literature verification means the biological pattern was found by others, not that AR(2) is the right model for it.</li>
                      <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5">3.</span>Most analyses here use a single dataset per condition. Multi-dataset replication is needed.</li>
                      <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5">4.</span>mRNA expression levels do not directly reflect protein activity, post-translational modifications, or functional output.</li>
                      <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5">5.</span>Correlation between phase and eigenvalue does not imply causation.</li>
                      <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5">6.</span>KO comparison uses datasets from different experimental conditions, which may introduce confounds beyond BMAL1 loss.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
