import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, BarChart3, Zap } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine, Cell } from "recharts";
import HowTo from "@/components/HowTo";

interface GeneEigenvalue {
  gene: string;
  eigenvalue: number;
  phi1: number;
  phi2: number;
  r2: number;
  layer: 'identity' | 'clock' | 'proliferation';
}

interface HighResData {
  gse11923: {
    dataset: string;
    tissue: string;
    nTimepoints: number;
    nParams: number;
    npRatio: number;
    npAdequacy: string;
    identityGenes: GeneEigenvalue[];
    clockGenes: GeneEigenvalue[];
    prolifGenes: GeneEigenvalue[];
    identityMean: number;
    clockMean: number;
    prolifMean: number;
    identityClockGap: number;
    clockProlifGap: number;
    hierarchyOrder: string;
    hierarchyConfirmed: boolean;
  };
  gse54650: {
    dataset: string;
    tissue: string;
    nTimepoints: number;
    nParams: number;
    npRatio: number;
    npAdequacy: string;
    identityMean: number;
    clockMean: number;
    prolifMean: number;
    identityClockGap: number;
    clockProlifGap: number;
    hierarchyOrder: string;
    hierarchyConfirmed: boolean;
  };
  comparison: {
    npRatioImprovement: string;
    identityClockGapAgreement: boolean;
    hierarchyAgreement: boolean;
    eigenvalueCorrelation: number;
    verdict: string;
  };
  permutationTest: {
    observedGap: number;
    pValue: number;
    zScore: number;
    nPermutations: number;
  };
  bootstrapCI: {
    identityClockGap: { lower: number; upper: number; mean: number };
    clockProlifGap: { lower: number; upper: number; mean: number };
  };
  geneComparison: {
    gene: string;
    layer: string;
    gse11923Eigenvalue: number;
    gse54650Eigenvalue: number | null;
    difference: number | null;
  }[];
}

const LAYER_COLORS = {
  identity: '#f59e0b',
  clock: '#3b82f6',
  proliferation: '#ef4444',
};

export default function HighResValidation() {
  const { data, isLoading, error } = useQuery<HighResData>({
    queryKey: ['/api/validation/high-res-np'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-slate-700 rounded" />
            <div className="h-64 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-6">
              <p className="text-red-400">Failed to load high-resolution validation data.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const barData = [
    {
      name: `GSE11923 (n/p=${data.gse11923.npRatio.toFixed(1)})`,
      Identity: +data.gse11923.identityMean.toFixed(4),
      Clock: +data.gse11923.clockMean.toFixed(4),
      Proliferation: +data.gse11923.prolifMean.toFixed(4),
    },
    {
      name: `GSE54650 (n/p=${data.gse54650.npRatio.toFixed(1)})`,
      Identity: +data.gse54650.identityMean.toFixed(4),
      Clock: +data.gse54650.clockMean.toFixed(4),
      Proliferation: +data.gse54650.prolifMean.toFixed(4),
    },
  ];

  const scatterData = data.geneComparison
    .filter(g => g.gse54650Eigenvalue !== null)
    .map(g => ({
      gene: g.gene,
      layer: g.layer,
      x: g.gse54650Eigenvalue,
      y: g.gse11923Eigenvalue,
    }));

  const geneBarData = data.gse11923.identityGenes
    .map(g => ({ gene: g.gene, eigenvalue: +g.eigenvalue.toFixed(4), layer: 'Identity' }))
    .concat(data.gse11923.clockGenes.map(g => ({ gene: g.gene, eigenvalue: +g.eigenvalue.toFixed(4), layer: 'Clock' })))
    .concat(data.gse11923.prolifGenes.map(g => ({ gene: g.gene, eigenvalue: +g.eigenvalue.toFixed(4), layer: 'Proliferation' })));

  const verdictColor = data.comparison.verdict.startsWith('STRONG') ? 'emerald' :
    data.comparison.verdict.startsWith('PARTIAL') ? 'amber' : 'red';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400" data-testid="button-back">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white" data-testid="text-page-title">High-Resolution n/p Validation</h1>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">GSE11923 vs GSE54650</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Addressing the n/p ≈ 1.75 criticism: validating the hierarchy with 48 hourly timepoints (n/p = {data.gse11923.npRatio.toFixed(1)})
            </p>
          </div>
        </div>

        <HowTo
          title="High-Resolution Validation"
          summary="Validates AR(2) eigenvalue predictions using high-resolution time-series datasets with dense temporal sampling. Higher resolution data provides more statistical power to confirm the clock-target hierarchy."
          steps={[
            { label: "Review datasets", detail: "Each dataset has more time points than the standard experiments, giving more confident AR(2) estimates." },
            { label: "Compare results", detail: "Results should be consistent with the standard-resolution analyses — confirming robustness to sampling density." }
          ]}
        />

        <Card className={`bg-${verdictColor}-500/10 border-${verdictColor}-500/30`} data-testid="card-verdict">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              {verdictColor === 'emerald' ? <CheckCircle className="text-emerald-400 mt-1 flex-shrink-0" size={24} /> :
               verdictColor === 'amber' ? <AlertTriangle className="text-amber-400 mt-1 flex-shrink-0" size={24} /> :
               <XCircle className="text-red-400 mt-1 flex-shrink-0" size={24} />}
              <div>
                <h2 className={`text-lg font-bold text-${verdictColor}-400`} data-testid="text-verdict">Verdict</h2>
                <p className="text-slate-300 mt-1" data-testid="text-verdict-detail">{data.comparison.verdict}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-cyan-400">
                  <Zap className="inline mr-2" size={16} />
                  GSE11923 — High Resolution
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30" data-testid="badge-np-high">
                  n/p = {data.gse11923.npRatio.toFixed(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-900/50 rounded p-2">
                  <span className="text-muted-foreground">Dataset:</span>
                  <span className="text-white ml-1 font-mono">{data.gse11923.dataset}</span>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <span className="text-muted-foreground">Timepoints:</span>
                  <span className="text-white ml-1 font-mono" data-testid="text-tp-high">{data.gse11923.nTimepoints} (hourly)</span>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <span className="text-muted-foreground">n/p adequacy:</span>
                  <span className="text-emerald-400 ml-1 text-xs">{data.gse11923.npAdequacy}</span>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <span className="text-muted-foreground">Hierarchy:</span>
                  <span className="text-white ml-1 text-xs" data-testid="text-hierarchy-high">{data.gse11923.hierarchyOrder}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-amber-500/10 rounded p-2 border border-amber-500/20">
                  <div className="text-amber-400 font-bold" data-testid="text-identity-high">{data.gse11923.identityMean.toFixed(4)}</div>
                  <div className="text-[10px] text-muted-foreground">Identity |λ|</div>
                </div>
                <div className="bg-blue-500/10 rounded p-2 border border-blue-500/20">
                  <div className="text-blue-400 font-bold" data-testid="text-clock-high">{data.gse11923.clockMean.toFixed(4)}</div>
                  <div className="text-[10px] text-muted-foreground">Clock |λ|</div>
                </div>
                <div className="bg-red-500/10 rounded p-2 border border-red-500/20">
                  <div className="text-red-400 font-bold" data-testid="text-prolif-high">{data.gse11923.prolifMean.toFixed(4)}</div>
                  <div className="text-[10px] text-muted-foreground">Prolif |λ|</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-400">
                  <BarChart3 className="inline mr-2" size={16} />
                  GSE54650 — Standard Resolution
                </CardTitle>
                <Badge className={`${data.gse54650.npRatio >= 5 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`} data-testid="badge-np-low">
                  n/p = {data.gse54650.npRatio.toFixed(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-900/50 rounded p-2">
                  <span className="text-muted-foreground">Dataset:</span>
                  <span className="text-white ml-1 font-mono">{data.gse54650.dataset}</span>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <span className="text-muted-foreground">Timepoints:</span>
                  <span className="text-white ml-1 font-mono" data-testid="text-tp-low">{data.gse54650.nTimepoints} (2h intervals)</span>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <span className="text-muted-foreground">n/p adequacy:</span>
                  <span className={`ml-1 text-xs ${data.gse54650.npRatio >= 5 ? 'text-amber-400' : 'text-red-400'}`}>{data.gse54650.npAdequacy}</span>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <span className="text-muted-foreground">Hierarchy:</span>
                  <span className="text-white ml-1 text-xs" data-testid="text-hierarchy-low">{data.gse54650.hierarchyOrder}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-amber-500/10 rounded p-2 border border-amber-500/20">
                  <div className="text-amber-400 font-bold">{data.gse54650.identityMean.toFixed(4)}</div>
                  <div className="text-[10px] text-muted-foreground">Identity |λ|</div>
                </div>
                <div className="bg-blue-500/10 rounded p-2 border border-blue-500/20">
                  <div className="text-blue-400 font-bold">{data.gse54650.clockMean.toFixed(4)}</div>
                  <div className="text-[10px] text-muted-foreground">Clock |λ|</div>
                </div>
                <div className="bg-red-500/10 rounded p-2 border border-red-500/20">
                  <div className="text-red-400 font-bold">{data.gse54650.prolifMean.toFixed(4)}</div>
                  <div className="text-[10px] text-muted-foreground">Prolif |λ|</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400" data-testid="text-np-improvement">{data.comparison.npRatioImprovement}</div>
              <div className="text-sm text-muted-foreground">n/p Ratio Improvement</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${data.permutationTest.pValue < 0.05 ? 'text-emerald-400' : 'text-amber-400'}`} data-testid="text-perm-p">
                p = {data.permutationTest.pValue < 0.001 ? '<0.001' : data.permutationTest.pValue.toFixed(4)}
              </div>
              <div className="text-sm text-muted-foreground">Permutation Test ({data.permutationTest.nPermutations.toLocaleString()} shuffles)</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${Math.abs(data.comparison.eigenvalueCorrelation) > 0.5 ? 'text-emerald-400' : 'text-amber-400'}`} data-testid="text-correlation">
                r = {data.comparison.eigenvalueCorrelation.toFixed(3)}
              </div>
              <div className="text-sm text-muted-foreground">Cross-Dataset Eigenvalue Correlation</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-white">Layer Means: High-Res vs Standard</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Identity" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Clock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Proliferation" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-white">Gene-Level Eigenvalue Correlation</CardTitle>
              <p className="text-xs text-muted-foreground">Each dot = one gene. Points near diagonal = consistent estimates across datasets.</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="x" name="GSE54650 |λ|" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'GSE54650 |λ|', position: 'bottom', fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" name="GSE11923 |λ|" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'GSE11923 |λ|', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => [value.toFixed(4), name]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.gene || ''}
                  />
                  <ReferenceLine segment={[{ x: 0.3, y: 0.3 }, { x: 1.1, y: 1.1 }]} stroke="#475569" strokeDasharray="5 5" />
                  <Scatter data={scatterData.filter(d => d.layer === 'identity')} fill="#f59e0b" name="Identity">
                    {scatterData.filter(d => d.layer === 'identity').map((_, i) => <Cell key={i} fill="#f59e0b" />)}
                  </Scatter>
                  <Scatter data={scatterData.filter(d => d.layer === 'clock')} fill="#3b82f6" name="Clock">
                    {scatterData.filter(d => d.layer === 'clock').map((_, i) => <Cell key={i} fill="#3b82f6" />)}
                  </Scatter>
                  <Scatter data={scatterData.filter(d => d.layer === 'proliferation')} fill="#ef4444" name="Proliferation">
                    {scatterData.filter(d => d.layer === 'proliferation').map((_, i) => <Cell key={i} fill="#ef4444" />)}
                  </Scatter>
                  <Legend />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-base text-white">GSE11923 Per-Gene Eigenvalues (48 Timepoints, n/p = {data.gse11923.npRatio.toFixed(1)})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={geneBarData} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="gene" stroke="#64748b" tick={{ fontSize: 9 }} height={60} interval={0} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: '|λ|', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                <Bar dataKey="eigenvalue" radius={[2, 2, 0, 0]}>
                  {geneBarData.map((entry, index) => (
                    <Cell key={index} fill={entry.layer === 'Identity' ? LAYER_COLORS.identity : entry.layer === 'Clock' ? LAYER_COLORS.clock : LAYER_COLORS.proliferation} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Identity</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Clock</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Proliferation</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-white">Bootstrap Confidence Intervals (5,000 iterations)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Identity – Clock Gap</span>
                  <Badge className={data.bootstrapCI.identityClockGap.lower > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}>
                    {data.bootstrapCI.identityClockGap.lower > 0 ? 'SIGNIFICANT' : 'OVERLAPS ZERO'}
                  </Badge>
                </div>
                <div className="font-mono text-white text-lg" data-testid="text-ic-gap-ci">
                  {data.bootstrapCI.identityClockGap.mean.toFixed(4)} [{data.bootstrapCI.identityClockGap.lower.toFixed(4)}, {data.bootstrapCI.identityClockGap.upper.toFixed(4)}]
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Clock – Proliferation Gap</span>
                  <Badge className={data.bootstrapCI.clockProlifGap.lower > 0 ? 'bg-emerald-500/20 text-emerald-300' : data.bootstrapCI.clockProlifGap.upper < 0 ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}>
                    {data.bootstrapCI.clockProlifGap.lower > 0 ? 'CLOCK > PROLIF' : data.bootstrapCI.clockProlifGap.upper < 0 ? 'PROLIF > CLOCK' : 'OVERLAPS ZERO'}
                  </Badge>
                </div>
                <div className="font-mono text-white text-lg" data-testid="text-cp-gap-ci">
                  {data.bootstrapCI.clockProlifGap.mean.toFixed(4)} [{data.bootstrapCI.clockProlifGap.lower.toFixed(4)}, {data.bootstrapCI.clockProlifGap.upper.toFixed(4)}]
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-base text-white">Gene-by-Gene Cross-Dataset Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-muted-foreground">Gene</th>
                    <th className="text-left py-2 px-3 text-muted-foreground">Layer</th>
                    <th className="text-right py-2 px-3 text-muted-foreground">GSE11923 |λ|</th>
                    <th className="text-right py-2 px-3 text-muted-foreground">GSE54650 |λ|</th>
                    <th className="text-right py-2 px-3 text-muted-foreground">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {data.geneComparison.map((g, i) => (
                    <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50" data-testid={`row-gene-${g.gene}`}>
                      <td className="py-2 px-3 font-mono text-white">{g.gene}</td>
                      <td className="py-2 px-3">
                        <Badge className={`text-[10px] ${g.layer === 'identity' ? 'bg-amber-500/20 text-amber-300' : g.layer === 'clock' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}>
                          {g.layer}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{g.gse11923Eigenvalue.toFixed(4)}</td>
                      <td className="py-2 px-3 text-right font-mono">{g.gse54650Eigenvalue !== null ? g.gse54650Eigenvalue.toFixed(4) : '—'}</td>
                      <td className={`py-2 px-3 text-right font-mono ${g.difference !== null ? (g.difference > 0 ? 'text-emerald-400' : 'text-red-400') : 'text-slate-400'}`}>
                        {g.difference !== null ? (g.difference > 0 ? '+' : '') + g.difference.toFixed(4) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
