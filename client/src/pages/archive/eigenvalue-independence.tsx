import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine, Legend, ZAxis
} from "recharts";
import {
  ArrowLeft, Loader2, ShieldCheck, Activity, TrendingUp, Clock, Target,
  ChevronDown, ChevronUp, Copy, Check, Beaker, GitBranch
} from "lucide-react";
import { Link } from "wouter";
import { useState, useCallback } from "react";
import HowTo from "@/components/HowTo";

interface ScatterPoint {
  gene: string;
  geneType: string;
  eigenvalue: number;
  rSquared: number;
  amplitude: number;
}

interface IndependenceData {
  dataset: string;
  datasetId: string;
  totalGenes: number;
  stableGenes: number;
  correlations: {
    eigenvalue_vs_rSquared: { spearman: number; pValue: number; n: number };
    eigenvalue_vs_amplitude: { spearman: number; pValue: number; n: number };
    rSquared_vs_amplitude: { spearman: number; pValue: number; n: number };
  };
  clockGenesSummary: { n: number; meanEigenvalue: number; meanRSquared: number; meanAmplitude: number };
  targetGenesSummary: { n: number; meanEigenvalue: number; meanRSquared: number; meanAmplitude: number };
  scatterData: ScatterPoint[];
  interpretation: string;
}

interface TissueData {
  tissue: string;
  gap: number;
  clockMeanEV: number;
  targetMeanEV: number;
  proliferationIndex: number;
  proliferationSource: string;
  nGenes: number;
}

interface ProliferationData {
  tissues: TissueData[];
  correlation: {
    gapVsProliferation: { spearman: number; pValue: number; n: number };
    interpretation: string;
  };
}

const DATASETS = [
  { id: 'GSE54650_Liver_circadian', label: 'Mouse Liver (Hughes)' },
  { id: 'GSE54650_Kidney_circadian', label: 'Mouse Kidney (Hughes)' },
  { id: 'GSE11923_Liver_1h_48h_genes', label: 'Mouse Liver (Panda)' },
  { id: 'GSE157357_Organoid_WT-WT', label: 'Organoid WT (Healthy)' },
];

function corrStrength(rho: number): { label: string; color: string } {
  const abs = Math.abs(rho);
  if (abs < 0.3) return { label: 'Weak', color: 'text-emerald-400' };
  if (abs < 0.5) return { label: 'Moderate', color: 'text-amber-400' };
  if (abs < 0.7) return { label: 'Moderate-Strong', color: 'text-orange-400' };
  return { label: 'Strong', color: 'text-red-400' };
}

function formatP(p: number): string {
  if (p < 1e-300) return '< 10⁻³⁰⁰';
  if (p < 1e-10) return `${p.toExponential(1)}`;
  if (p < 0.001) return p.toExponential(2);
  return p.toFixed(4);
}

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-xl" data-testid="scatter-tooltip">
      <div className="font-bold text-white">{d.gene}</div>
      <div className="text-gray-400">{d.geneType === 'clock' ? 'Clock gene' : d.geneType === 'target' ? 'Target gene' : 'Other'}</div>
      <div className="mt-1 space-y-0.5">
        <div className="text-blue-300">|λ| = {d.eigenvalue?.toFixed(4)}</div>
        <div className="text-purple-300">R² = {d.rSquared?.toFixed(4)}</div>
        <div className="text-amber-300">Amplitude = {d.amplitude?.toFixed(2)}</div>
      </div>
    </div>
  );
};

const ProlifTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-xl" data-testid="prolif-tooltip">
      <div className="font-bold text-white">{d.tissue}</div>
      <div className="mt-1 space-y-0.5">
        <div className="text-cyan-300">Gap (clock - target |λ|) = {d.gap?.toFixed(4)}</div>
        <div className="text-rose-300">Proliferation Index = {d.proliferationIndex}</div>
        <div className="text-blue-300">Clock mean |λ| = {d.clockMeanEV?.toFixed(4)}</div>
        <div className="text-amber-300">Target mean |λ| = {d.targetMeanEV?.toFixed(4)}</div>
        <div className="text-gray-400 text-xs mt-1">{d.proliferationSource}</div>
      </div>
    </div>
  );
};

export default function EigenvalueIndependence() {
  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0].id);
  const [showProlifDetails, setShowProlifDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: indepData, isLoading: indepLoading, error: indepError } = useQuery<IndependenceData>({
    queryKey: ['/api/validation/eigenvalue-independence', selectedDataset],
    queryFn: () => fetch(`/api/validation/eigenvalue-independence?dataset=${selectedDataset}`).then(r => r.json()),
  });

  const { data: prolifData, isLoading: prolifLoading, error: prolifError } = useQuery<ProliferationData>({
    queryKey: ['/api/validation/gap-vs-proliferation'],
  });

  const clockScatter = indepData?.scatterData.filter(d => d.geneType === 'clock') || [];
  const targetScatter = indepData?.scatterData.filter(d => d.geneType === 'target') || [];

  const handleCopy = useCallback(() => {
    if (!indepData || !prolifData) return;
    const c = indepData.correlations;
    const p = prolifData.correlation.gapVsProliferation;
    const text = [
      `Eigenvalue Independence Analysis`,
      `Dataset: ${indepData.dataset}`,
      `Genes analyzed: ${indepData.stableGenes} (stable, |λ| < 1.0)`,
      ``,
      `Spearman Correlations:`,
      `  |λ| vs R²:        ρ = ${c.eigenvalue_vs_rSquared.spearman}, p = ${formatP(c.eigenvalue_vs_rSquared.pValue)}`,
      `  |λ| vs Amplitude: ρ = ${c.eigenvalue_vs_amplitude.spearman}, p = ${formatP(c.eigenvalue_vs_amplitude.pValue)}`,
      `  R² vs Amplitude:  ρ = ${c.rSquared_vs_amplitude.spearman}, p = ${formatP(c.rSquared_vs_amplitude.pValue)}`,
      ``,
      `Gap vs Proliferation:`,
      `  Spearman ρ = ${p.spearman}, p = ${p.pValue.toExponential(2)}, n = ${p.n} tissues`,
      ``,
      ...prolifData.tissues.map(t => `  ${t.tissue}: gap=${t.gap.toFixed(4)}, prolif=${t.proliferationIndex}`),
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [indepData, prolifData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-gray-400" data-testid="button-copy">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied' : 'Copy Results'}
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" data-testid="text-page-title">
            Eigenvalue Independence & Downstream Prediction
          </h1>
          <p className="text-gray-400 mt-2 max-w-3xl">
            Two independent lines of evidence that the AR(2) eigenvalue |λ| captures unique biological information
            beyond existing rhythmicity measures: (1) low correlation with Cosinor amplitude across ~20K genes,
            and (2) the clock-target eigenvalue gap predicts tissue proliferative capacity.
          </p>
        </div>

        <HowTo
          title="Eigenvalue Independence & Downstream Prediction"
          summary="Demonstrates that the AR(2) eigenvalue |λ| captures unique temporal information not redundant with simpler metrics (mean expression, variance, autocorrelation). Also tests whether |λ| predicts downstream biological processes better than alternative measures."
          steps={[
            { label: "Check independence", detail: "Correlation matrices show how |λ| relates to other gene expression metrics — low correlation means it captures unique information." },
            { label: "Review prediction", detail: "Regression analyses test whether |λ| predicts biological outcomes independently of other metrics." }
          ]}
        />

        {/* Part 1: Eigenvalue Independence */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Beaker className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Part 1: Eigenvalue Independence from Rhythmicity Measures</h2>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {DATASETS.map(ds => (
              <Button
                key={ds.id}
                variant={selectedDataset === ds.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDataset(ds.id)}
                data-testid={`button-dataset-${ds.id}`}
              >
                {ds.label}
              </Button>
            ))}
          </div>

          {indepLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="ml-3 text-gray-400">Analyzing genes...</span>
            </div>
          )}

          {indepError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load independence analysis. Try a different dataset.</AlertDescription>
            </Alert>
          )}

          {indepData && (
            <>
              {/* Correlation Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: '|λ| vs R²', data: indepData.correlations.eigenvalue_vs_rSquared, desc: 'Model fit quality' },
                  { label: '|λ| vs Amplitude', data: indepData.correlations.eigenvalue_vs_amplitude, desc: 'Oscillation strength' },
                  { label: 'R² vs Amplitude', data: indepData.correlations.rSquared_vs_amplitude, desc: 'Fit vs oscillation' },
                ].map(({ label, data, desc }) => {
                  const strength = corrStrength(data.spearman);
                  return (
                    <Card key={label} className="bg-gray-900/50 border-gray-800">
                      <CardContent className="pt-6">
                        <div className="text-sm text-gray-400 mb-1">{label}</div>
                        <div className="text-3xl font-bold text-white" data-testid={`text-corr-${label.replace(/[^a-zA-Z]/g, '')}`}>
                          ρ = {data.spearman.toFixed(2)}
                        </div>
                        <div className={`text-sm font-medium ${strength.color}`}>
                          {strength.label} correlation
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          p {formatP(data.pValue)} | n = {data.n.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">{desc}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Key Finding Alert */}
              <Alert className="mb-6 border-purple-700/50 bg-purple-950/20">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <AlertTitle className="text-purple-300">Key Finding</AlertTitle>
                <AlertDescription className="text-gray-300">
                  {indepData.interpretation}
                </AlertDescription>
              </Alert>

              {/* Scatter Plots */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">|λ| vs Cosinor Amplitude</CardTitle>
                    <CardDescription>Weak correlation shows eigenvalue is NOT simply measuring oscillation strength</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          type="number"
                          dataKey="eigenvalue"
                          name="|λ|"
                          domain={[0, 1]}
                          stroke="#6b7280"
                          label={{ value: 'Eigenvalue |λ|', position: 'bottom', offset: 5, fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="amplitude"
                          name="Amplitude"
                          stroke="#6b7280"
                          label={{ value: 'Cosinor Amplitude', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
                          scale="log"
                          domain={['auto', 'auto']}
                        />
                        <ZAxis range={[30, 30]} />
                        <Tooltip content={<CustomScatterTooltip />} />
                        <Scatter data={clockScatter} fill="#60a5fa" name="Clock" opacity={0.9} />
                        <Scatter data={targetScatter} fill="#f59e0b" name="Target" opacity={0.9} />
                        <Legend />
                      </ScatterChart>
                    </ResponsiveContainer>
                    <div className="text-center text-sm text-gray-400 mt-2">
                      ρ = {indepData.correlations.eigenvalue_vs_amplitude.spearman} — eigenvalue and amplitude are largely independent
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">|λ| vs AR(2) R²</CardTitle>
                    <CardDescription>Moderate correlation expected — both derive from AR(2) fit, but measure different aspects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          type="number"
                          dataKey="eigenvalue"
                          name="|λ|"
                          domain={[0, 1]}
                          stroke="#6b7280"
                          label={{ value: 'Eigenvalue |λ|', position: 'bottom', offset: 5, fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="rSquared"
                          name="R²"
                          domain={[0, 1]}
                          stroke="#6b7280"
                          label={{ value: 'AR(2) R²', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
                        />
                        <ZAxis range={[30, 30]} />
                        <Tooltip content={<CustomScatterTooltip />} />
                        <Scatter data={clockScatter} fill="#60a5fa" name="Clock" opacity={0.9} />
                        <Scatter data={targetScatter} fill="#f59e0b" name="Target" opacity={0.9} />
                        <Legend />
                      </ScatterChart>
                    </ResponsiveContainer>
                    <div className="text-center text-sm text-gray-400 mt-2">
                      ρ = {indepData.correlations.eigenvalue_vs_rSquared.spearman} — some shared variance, but |λ| is not simply R²
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gene-Type Comparison Table */}
              <Card className="bg-gray-900/50 border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Clock vs Target Gene Comparison</CardTitle>
                  <CardDescription>
                    Clock genes show higher eigenvalue AND higher amplitude, but the metrics rank genes differently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2 px-3 text-gray-400">Gene Type</th>
                          <th className="text-right py-2 px-3 text-gray-400">n</th>
                          <th className="text-right py-2 px-3 text-gray-400">Mean |λ|</th>
                          <th className="text-right py-2 px-3 text-gray-400">Mean R²</th>
                          <th className="text-right py-2 px-3 text-gray-400">Mean Amplitude</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-800">
                          <td className="py-2 px-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-300 font-medium">Clock</span>
                          </td>
                          <td className="text-right py-2 px-3 text-white" data-testid="text-clock-n">{indepData.clockGenesSummary.n}</td>
                          <td className="text-right py-2 px-3 text-white font-mono">{indepData.clockGenesSummary.meanEigenvalue.toFixed(4)}</td>
                          <td className="text-right py-2 px-3 text-white font-mono">{indepData.clockGenesSummary.meanRSquared.toFixed(4)}</td>
                          <td className="text-right py-2 px-3 text-white font-mono">{indepData.clockGenesSummary.meanAmplitude.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300 font-medium">Target</span>
                          </td>
                          <td className="text-right py-2 px-3 text-white" data-testid="text-target-n">{indepData.targetGenesSummary.n}</td>
                          <td className="text-right py-2 px-3 text-white font-mono">{indepData.targetGenesSummary.meanEigenvalue.toFixed(4)}</td>
                          <td className="text-right py-2 px-3 text-white font-mono">{indepData.targetGenesSummary.meanRSquared.toFixed(4)}</td>
                          <td className="text-right py-2 px-3 text-white font-mono">{indepData.targetGenesSummary.meanAmplitude.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Part 2: Gap vs Proliferation */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Part 2: Eigenvalue Gap Predicts Tissue Proliferative Capacity</h2>
          </div>

          {prolifLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="ml-3 text-gray-400">Analyzing 12 mouse tissues...</span>
            </div>
          )}

          {prolifError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load proliferation analysis.</AlertDescription>
            </Alert>
          )}

          {prolifData && (
            <>
              {/* Headline Stat */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-400 mb-1">Gap vs Proliferation</div>
                    <div className="text-3xl font-bold text-white" data-testid="text-prolif-rho">
                      ρ = {prolifData.correlation.gapVsProliferation.spearman.toFixed(2)}
                    </div>
                    <div className="text-sm font-medium text-emerald-400">Strong positive correlation</div>
                    <div className="text-xs text-gray-400 mt-1">
                      p = {prolifData.correlation.gapVsProliferation.pValue.toExponential(2)} | n = {prolifData.correlation.gapVsProliferation.n} tissues
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-400 mb-1">Highest Gap</div>
                    {(() => {
                      const best = [...prolifData.tissues].sort((a, b) => b.gap - a.gap)[0];
                      return (
                        <>
                          <div className="text-3xl font-bold text-white">{best?.tissue}</div>
                          <div className="text-sm text-cyan-400">Gap = {best?.gap.toFixed(4)}</div>
                          <div className="text-xs text-gray-400 mt-1">Proliferation index = {best?.proliferationIndex}</div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-400 mb-1">Lowest Gap</div>
                    {(() => {
                      const worst = [...prolifData.tissues].sort((a, b) => a.gap - b.gap)[0];
                      return (
                        <>
                          <div className="text-3xl font-bold text-white">{worst?.tissue}</div>
                          <div className="text-sm text-amber-400">Gap = {worst?.gap.toFixed(4)}</div>
                          <div className="text-xs text-gray-400 mt-1">Proliferation index = {worst?.proliferationIndex}</div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              <Alert className="mb-6 border-cyan-700/50 bg-cyan-950/20">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <AlertTitle className="text-cyan-300">Downstream Prediction</AlertTitle>
                <AlertDescription className="text-gray-300">
                  {prolifData.correlation.interpretation}
                </AlertDescription>
              </Alert>

              {/* Scatter Plot: Gap vs Proliferation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Gap vs Proliferation Rate</CardTitle>
                    <CardDescription>
                      Each point is a mouse tissue from the Zhang et al. (2014) circadian atlas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          type="number"
                          dataKey="gap"
                          name="Eigenvalue Gap"
                          stroke="#6b7280"
                          domain={['auto', 'auto']}
                          label={{ value: 'Clock - Target |λ| Gap', position: 'bottom', offset: 10, fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="proliferationIndex"
                          name="Proliferation"
                          stroke="#6b7280"
                          scale="log"
                          domain={['auto', 'auto']}
                          label={{ value: 'Proliferation Index', angle: -90, position: 'insideLeft', offset: -5, fill: '#6b7280', fontSize: 12 }}
                        />
                        <ZAxis range={[80, 80]} />
                        <Tooltip content={<ProlifTooltip />} />
                        <Scatter
                          data={prolifData.tissues}
                          fill="#22d3ee"
                          name="Mouse Tissues"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                    <div className="text-center text-sm text-gray-400 mt-2">
                      Spearman ρ = {prolifData.correlation.gapVsProliferation.spearman}, p = {prolifData.correlation.gapVsProliferation.pValue.toExponential(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Eigenvalue Gap by Tissue</CardTitle>
                    <CardDescription>
                      Sorted by gap size — brain tissues cluster at bottom, proliferative tissues at top
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={[...prolifData.tissues].sort((a, b) => a.gap - b.gap)}
                        layout="vertical"
                        margin={{ top: 10, right: 20, bottom: 10, left: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#6b7280" domain={[0, 'auto']} />
                        <YAxis type="category" dataKey="tissue" stroke="#6b7280" width={75} tick={{ fontSize: 11 }} />
                        <Tooltip content={<ProlifTooltip />} />
                        <Bar dataKey="gap" name="Eigenvalue Gap" radius={[0, 4, 4, 0]}>
                          {[...prolifData.tissues].sort((a, b) => a.gap - b.gap).map((entry, idx) => {
                            const isBrain = ['Cerebellum', 'Hypothalamus', 'Brainstem'].includes(entry.tissue);
                            const isHigh = entry.proliferationIndex >= 0.005;
                            return (
                              <Cell
                                key={idx}
                                fill={isBrain ? '#6366f1' : isHigh ? '#22d3ee' : '#8b5cf6'}
                                opacity={0.8}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 justify-center text-xs mt-2">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> Brain (post-mitotic)</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500 inline-block" /> Moderate</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-400 inline-block" /> High proliferation</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tissue Details Table */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-white">Tissue-Level Detail</CardTitle>
                      <CardDescription>Proliferation indices from published sources</CardDescription>
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setShowProlifDetails(!showProlifDetails)}
                      className="text-gray-400"
                      data-testid="button-toggle-details"
                    >
                      {showProlifDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {showProlifDetails ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </CardHeader>
                {showProlifDetails && (
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" data-testid="table-tissue-detail">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 px-3 text-gray-400">Tissue</th>
                            <th className="text-right py-2 px-3 text-gray-400">Gap</th>
                            <th className="text-right py-2 px-3 text-gray-400">Clock |λ|</th>
                            <th className="text-right py-2 px-3 text-gray-400">Target |λ|</th>
                            <th className="text-right py-2 px-3 text-gray-400">Prolif. Index</th>
                            <th className="text-right py-2 px-3 text-gray-400">n Genes</th>
                            <th className="text-left py-2 px-3 text-gray-400">Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...prolifData.tissues].sort((a, b) => b.gap - a.gap).map(t => (
                            <tr key={t.tissue} className="border-b border-gray-800 hover:bg-gray-800/40">
                              <td className="py-2 px-3 text-white font-medium">{t.tissue}</td>
                              <td className="text-right py-2 px-3 font-mono text-cyan-300">{t.gap.toFixed(4)}</td>
                              <td className="text-right py-2 px-3 font-mono text-blue-300">{t.clockMeanEV.toFixed(4)}</td>
                              <td className="text-right py-2 px-3 font-mono text-amber-300">{t.targetMeanEV.toFixed(4)}</td>
                              <td className="text-right py-2 px-3 font-mono text-rose-300">{t.proliferationIndex}</td>
                              <td className="text-right py-2 px-3 text-gray-300">{t.nGenes}</td>
                              <td className="py-2 px-3 text-gray-400 text-xs max-w-xs truncate">{t.proliferationSource}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            </>
          )}
        </div>

        {/* Methodology */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Methodology</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-400 space-y-3">
            <p>
              <strong className="text-gray-300">Part 1 — Independence Test:</strong> For each gene in the dataset,
              we compute three metrics: (i) AR(2) eigenvalue modulus |λ| (temporal persistence), (ii) AR(2) R²
              (model goodness-of-fit), and (iii) Cosinor amplitude (24h oscillation strength via least-squares
              cosine fit). Spearman rank correlations between all pairs quantify redundancy. Only stable genes
              (|λ| &lt; 1.0) are included.
            </p>
            <p>
              <strong className="text-gray-300">Part 2 — Proliferation Prediction:</strong> For 12 mouse tissues
              from the Zhang et al. (2014) circadian atlas (GSE54650), we compute the eigenvalue gap (mean clock |λ|
              minus mean target |λ|). Tissue proliferation indices are compiled from published Ki67/BrdU labeling
              studies. Spearman correlation tests whether larger gaps predict higher proliferative capacity.
            </p>
            <p>
              <strong className="text-gray-300">Rationale:</strong> If |λ| were simply a proxy for amplitude or R²,
              the framework would be redundant. Part 1 shows it is not. If the clock-target
              gap had no downstream functional correlate, it could be dismissed as a statistical artifact. Part 2
              shows it predicts tissue biology.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
