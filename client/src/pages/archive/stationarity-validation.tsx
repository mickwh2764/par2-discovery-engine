import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend
} from "recharts";
import {
  ArrowLeft, Loader2, ShieldCheck, ShieldAlert, AlertCircle,
  Activity, TrendingUp, Zap, Target, ChevronDown, ChevronUp, FlaskConical, Clock
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import HowTo from "@/components/HowTo";

interface RWGapWindow {
  windowIdx: number;
  clockMean: number;
  targetMean: number;
  gap: number;
}

interface RWGeneWindowAnalysis {
  gene: string;
  geneType: 'clock' | 'target';
  meanEigenvalue: number;
  maxDrift: number;
  coefficientOfVariation: number;
  isStable: boolean;
}

interface RWDatasetResult {
  datasetId: string;
  datasetName: string;
  species: string;
  totalTimepoints: number;
  windowSize: number;
  stepSize: number;
  nWindows: number;
  clockGenes: RWGeneWindowAnalysis[];
  targetGenes: RWGeneWindowAnalysis[];
  clockMeanDrift: number;
  targetMeanDrift: number;
  clockMeanCV: number;
  targetMeanCV: number;
  clockStableCount: number;
  targetStableCount: number;
  gapStability: {
    windowGaps: RWGapWindow[];
    gapMean: number;
    gapStd: number;
    gapCV: number;
    hierarchyPreservedInAllWindows: boolean;
  };
  chowTest: { fStatistic: number; breakpoint: number; significantBreak: boolean; pApprox: number } | null;
  verdict: 'STABLE' | 'MARGINAL' | 'UNSTABLE';
  verdictExplanation: string;
}

interface RollingWindowData {
  datasets: RWDatasetResult[];
  summary: {
    totalDatasets: number;
    stableCount: number;
    marginalCount: number;
    unstableCount: number;
    overallVerdict: string;
    meanClockCV: number;
    meanTargetCV: number;
    gapPreservedInAllWindows: boolean;
  };
}

const rwVerdictColor = (v: string) =>
  v === 'STABLE' ? 'text-emerald-400' : v === 'MARGINAL' ? 'text-amber-400' : 'text-red-400';
const rwVerdictBg = (v: string) =>
  v === 'STABLE' ? 'bg-emerald-900/30 border-emerald-700/50' : v === 'MARGINAL' ? 'bg-amber-900/30 border-amber-700/50' : 'bg-red-900/30 border-red-700/50';

export default function StationarityValidation() {
  const { data: stationarity, isLoading: loadingStat, error: errorStat } = useQuery({
    queryKey: ["/api/validation/stationarity-predictive"],
    queryFn: async () => {
      const res = await fetch("/api/validation/stationarity-predictive");
      if (!res.ok) throw new Error("Failed to load stationarity validation");
      return res.json();
    },
    staleTime: 3600000,
  });

  const { data: perturbation, isLoading: loadingPert, error: errorPert } = useQuery({
    queryKey: ["/api/validation/perturbation-prediction"],
    queryFn: async () => {
      const res = await fetch("/api/validation/perturbation-prediction");
      if (!res.ok) throw new Error("Failed to load perturbation validation");
      return res.json();
    },
    staleTime: 3600000,
  });

  const { data: rollingWindow, isLoading: loadingRW, error: errorRW } = useQuery<RollingWindowData>({
    queryKey: ["/api/validation/rolling-window"],
    queryFn: async () => {
      const res = await fetch("/api/validation/rolling-window");
      if (!res.ok) throw new Error("Failed to load rolling window analysis");
      return res.json();
    },
    staleTime: 1800000,
  });

  const [expandedDataset, setExpandedDataset] = useState<string | null>(null);
  const [expandedPerturbation, setExpandedPerturbation] = useState<string | null>(null);
  const [expandedRWDataset, setExpandedRWDataset] = useState<string | null>(null);

  const isLoading = loadingStat || loadingPert || loadingRW;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-lg" data-testid="status-loading">Running stationarity and predictive validation...</p>
          <p className="text-slate-400 text-sm">This may take 30-60 seconds (computing KPSS, ADF, and rolling-origin forecasts)</p>
        </div>
      </div>
    );
  }

  if (errorStat || errorPert || errorRW) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-center" data-testid="status-error">Error loading validation data</p>
        </div>
      </div>
    );
  }

  const verdictColor = (v: string) => {
    if (v === 'ROBUST' || v === 'PREDICTIONS CONFIRMED') return 'text-emerald-400';
    if (v === 'MODERATE' || v === 'PARTIALLY CONFIRMED') return 'text-amber-400';
    return 'text-red-400';
  };

  const verdictBg = (v: string) => {
    if (v === 'ROBUST' || v === 'PREDICTIONS CONFIRMED') return 'bg-emerald-500/20 border-emerald-500/40';
    if (v === 'MODERATE' || v === 'PARTIALLY CONFIRMED') return 'bg-amber-500/20 border-amber-500/40';
    return 'bg-red-500/20 border-red-500/40';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Stationarity, Stability & Predictive Validation</h1>
            <p className="text-slate-400 mt-1">ADF/KPSS stationarity testing, rolling window stability, forecasting benchmarks, and perturbation prediction validation</p>
          </div>
        </div>

        <HowTo
          title="Stationarity & Rolling Window Validation"
          summary="Tests whether AR(2) eigenvalue signatures are stable across different sub-windows of the time series. Stable signatures indicate robust, reliable measurements; unstable ones suggest the eigenvalue may be an artefact of a particular time window."
          steps={[
            { label: "Select a dataset", detail: "Choose a dataset to run rolling-window analysis on." },
            { label: "Review window results", detail: "Each window shows the eigenvalue computed from that time segment — consistent values across windows mean stability." },
            { label: "Check ADF test", detail: "The Augmented Dickey-Fuller test confirms whether the time series is stationary (a requirement for valid AR(2) fitting)." }
          ]}
        />

        {stationarity?.overallSummary && (
          <div className={`border rounded-xl p-6 ${verdictBg(stationarity.overallSummary.overallVerdict)}`} data-testid="card-stationarity-verdict">
            <div className="flex items-center gap-3 mb-3">
              {stationarity.overallSummary.overallVerdict === 'ROBUST' ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-amber-400" />
              )}
              <div>
                <h2 className={`text-2xl font-bold ${verdictColor(stationarity.overallSummary.overallVerdict)}`} data-testid="text-stationarity-verdict">
                  Stationarity: {stationarity.overallSummary.overallVerdict}
                </h2>
                <p className="text-slate-300 text-sm">{stationarity.overallSummary.totalDatasets} datasets, {stationarity.overallSummary.totalGenes} gene-series analyzed</p>
              </div>
            </div>
            <p className="text-slate-300" data-testid="text-stationarity-interpretation">{stationarity.overallSummary.interpretation}</p>
          </div>
        )}

        {stationarity?.overallSummary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-cyan-400" data-testid="text-adf-rate">{(stationarity.overallSummary.meanADFPassRate * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-400">ADF Pass Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-400" data-testid="text-kpss-rate">{(stationarity.overallSummary.meanKPSSPassRate * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-400">KPSS Pass Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400" data-testid="text-dual-rate">{(stationarity.overallSummary.meanDualStationaryRate * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-400">Dual Stationary</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-400" data-testid="text-hierarchy-count">{stationarity.overallSummary.hierarchyPreservedCount}/{stationarity.overallSummary.totalDatasets}</p>
                <p className="text-xs text-slate-400">Hierarchy Preserved</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-rose-400" data-testid="text-ar2-winrate">{(stationarity.overallSummary.meanAR2WinRate * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-400">AR(2) Win Rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-cyan-400" />
              Two-Track Analysis: All Genes vs Stationary-Only
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stationarity?.datasets && (
              <div className="space-y-3">
                {stationarity.datasets.map((ds: any) => (
                  <div key={ds.datasetId} className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                      onClick={() => setExpandedDataset(expandedDataset === ds.datasetId ? null : ds.datasetId)}
                      data-testid={`button-expand-${ds.datasetId}`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={ds.twoTrack.hierarchyPreserved ? 'border-emerald-500 text-emerald-400' : 'border-amber-500 text-amber-400'}>
                          {ds.twoTrack.hierarchyPreserved ? 'PRESERVED' : 'CHECK'}
                        </Badge>
                        <span className="text-white font-medium">{ds.datasetName}</span>
                        <span className="text-slate-400 text-sm">{ds.species}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-sm">ADF: {(ds.adfPassRate * 100).toFixed(0)}% | KPSS: {(ds.kpssPassRate * 100).toFixed(0)}% | Dual: {(ds.dualStationaryRate * 100).toFixed(0)}%</span>
                        {expandedDataset === ds.datasetId ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {expandedDataset === ds.datasetId && (
                      <div className="px-4 pb-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">All Genes</h4>
                            <div className="space-y-1 text-sm">
                              <div><span className="text-slate-400">Clock |l|:</span> <span className="text-cyan-400">{ds.twoTrack.allGenes.meanClockEigenvalue.toFixed(4)}</span> <span className="text-slate-400">(n={ds.twoTrack.allGenes.nClock})</span></div>
                              <div><span className="text-slate-400">Target |l|:</span> <span className="text-rose-400">{ds.twoTrack.allGenes.meanTargetEigenvalue.toFixed(4)}</span> <span className="text-slate-400">(n={ds.twoTrack.allGenes.nTarget})</span></div>
                              <div><span className="text-slate-400">Gap:</span> <span className="text-white font-medium">{ds.twoTrack.allGenes.gap.toFixed(4)}</span></div>
                              <div><span className="text-slate-400">Effect size:</span> <span className="text-white">{ds.twoTrack.allGenes.effectSize.toFixed(3)}</span></div>
                              <div><span className="text-slate-400">Wilcoxon p:</span> <span className={ds.twoTrack.allGenes.wilcoxonP < 0.05 ? 'text-emerald-400' : 'text-amber-400'}>{ds.twoTrack.allGenes.wilcoxonP < 0.001 ? '<0.001' : ds.twoTrack.allGenes.wilcoxonP.toFixed(4)}</span></div>
                            </div>
                          </div>
                          <div className="bg-slate-800/80 rounded-lg p-4 border border-purple-600/30">
                            <h4 className="text-sm font-medium text-purple-300 mb-2">KPSS-Stationary Only</h4>
                            <div className="space-y-1 text-sm">
                              <div><span className="text-slate-400">Clock |l|:</span> <span className="text-cyan-400">{ds.twoTrack.kpssOnly?.meanClockEigenvalue?.toFixed(4) || 'N/A'}</span> <span className="text-slate-400">(n={ds.twoTrack.kpssOnly?.nClock || 0})</span></div>
                              <div><span className="text-slate-400">Target |l|:</span> <span className="text-rose-400">{ds.twoTrack.kpssOnly?.meanTargetEigenvalue?.toFixed(4) || 'N/A'}</span> <span className="text-slate-400">(n={ds.twoTrack.kpssOnly?.nTarget || 0})</span></div>
                              <div><span className="text-slate-400">Gap:</span> <span className="text-white font-medium">{ds.twoTrack.kpssOnly?.gap?.toFixed(4) || 'N/A'}</span></div>
                              <div><span className="text-slate-400">Effect size:</span> <span className="text-white">{ds.twoTrack.kpssOnly?.effectSize?.toFixed(3) || 'N/A'}</span></div>
                              <div><span className="text-slate-400">Preserved:</span> <span className={ds.twoTrack.kpssHierarchyPreserved ? 'text-emerald-400' : 'text-amber-400'}>{ds.twoTrack.kpssHierarchyPreserved ? 'Yes' : 'No'}</span></div>
                            </div>
                          </div>
                          <div className="bg-slate-800/80 rounded-lg p-4 border border-emerald-600/30">
                            <h4 className="text-sm font-medium text-emerald-300 mb-2">Dual ADF+KPSS</h4>
                            <div className="space-y-1 text-sm">
                              <div><span className="text-slate-400">Clock |l|:</span> <span className="text-cyan-400">{ds.twoTrack.stationaryOnly.meanClockEigenvalue.toFixed(4)}</span> <span className="text-slate-400">(n={ds.twoTrack.stationaryOnly.nClock})</span></div>
                              <div><span className="text-slate-400">Target |l|:</span> <span className="text-rose-400">{ds.twoTrack.stationaryOnly.meanTargetEigenvalue.toFixed(4)}</span> <span className="text-slate-400">(n={ds.twoTrack.stationaryOnly.nTarget})</span></div>
                              <div><span className="text-slate-400">Gap:</span> <span className="text-white font-medium">{ds.twoTrack.stationaryOnly.gap.toFixed(4)}</span></div>
                              <div><span className="text-slate-400">Effect size:</span> <span className="text-white">{ds.twoTrack.stationaryOnly.effectSize.toFixed(3)}</span></div>
                              <div><span className="text-slate-400">Preserved:</span> <span className={ds.twoTrack.hierarchyPreserved ? 'text-emerald-400' : 'text-amber-400'}>{ds.twoTrack.hierarchyPreserved ? 'Yes' : 'No'}</span></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm" data-testid={`text-twotrack-${ds.datasetId}`}>{ds.twoTrack.interpretation}</p>
                        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600">
                          <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-rose-400" /> Forecasting Benchmark</h4>
                          <p className="text-slate-400 text-sm">{ds.forecasting.interpretation}</p>
                          <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                            <div><span className="text-slate-400">AR(2) MAE:</span> <span className="text-cyan-400">{ds.forecasting.meanAR2MAE.toFixed(4)}</span></div>
                            <div><span className="text-slate-400">AR(1) MAE:</span> <span className="text-slate-300">{ds.forecasting.meanAR1MAE.toFixed(4)}</span></div>
                            <div><span className="text-slate-400">Naive MAE:</span> <span className="text-slate-300">{ds.forecasting.meanNaiveMAE.toFixed(4)}</span></div>
                          </div>
                        </div>
                        {ds.geneResults && ds.geneResults.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-slate-400 border-b border-slate-700">
                                  <th className="text-left py-2 px-2">Gene</th>
                                  <th className="text-left py-2 px-2">Type</th>
                                  <th className="text-right py-2 px-2">|l|</th>
                                  <th className="text-right py-2 px-2">R2</th>
                                  <th className="text-center py-2 px-2">ADF</th>
                                  <th className="text-center py-2 px-2">KPSS</th>
                                  <th className="text-center py-2 px-2">Verdict</th>
                                  <th className="text-right py-2 px-2">MASE</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ds.geneResults.map((g: any) => (
                                  <tr key={g.gene} className="border-b border-slate-800 hover:bg-slate-800/30">
                                    <td className="py-1.5 px-2 text-white font-mono">{g.gene}</td>
                                    <td className="py-1.5 px-2">
                                      <Badge variant="outline" className={g.type === 'clock' ? 'border-cyan-500 text-cyan-400 text-xs' : 'border-rose-500 text-rose-400 text-xs'}>
                                        {g.type}
                                      </Badge>
                                    </td>
                                    <td className="py-1.5 px-2 text-right font-mono">{g.eigenvalue.toFixed(4)}</td>
                                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">{g.r2.toFixed(3)}</td>
                                    <td className="py-1.5 px-2 text-center">
                                      {g.adfStationary ? <span className="text-emerald-400">Pass</span> : <span className="text-amber-400">Fail</span>}
                                    </td>
                                    <td className="py-1.5 px-2 text-center">
                                      {g.kpssStationary ? <span className="text-emerald-400">Pass</span> : <span className="text-amber-400">Fail</span>}
                                    </td>
                                    <td className="py-1.5 px-2 text-center">
                                      <Badge variant="outline" className={
                                        g.dualVerdict === 'stationary' ? 'border-emerald-500 text-emerald-400 text-xs' :
                                        g.dualVerdict === 'non_stationary' ? 'border-red-500 text-red-400 text-xs' :
                                        'border-amber-500 text-amber-400 text-xs'
                                      }>{g.dualVerdict}</Badge>
                                    </td>
                                    <td className="py-1.5 px-2 text-right font-mono text-slate-400">{isFinite(g.mase) ? g.mase.toFixed(3) : 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {stationarity?.datasets && stationarity.datasets.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-rose-400" />
                Forecasting Comparison: AR(2) vs AR(1) vs Naive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stationarity.datasets.map((ds: any) => ({
                    name: ds.datasetId.replace(/_/g, ' '),
                    'AR(2)': ds.forecasting.meanAR2MAE,
                    'AR(1)': ds.forecasting.meanAR1MAE,
                    'Naive': ds.forecasting.meanNaiveMAE,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'MAE', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="AR(2)" fill="#22d3ee" />
                    <Bar dataKey="AR(1)" fill="#a78bfa" />
                    <Bar dataKey="Naive" fill="#94a3b8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {rollingWindow?.summary && (
          <>
            <div className={`border rounded-xl p-6 ${rwVerdictBg(rollingWindow.summary.stableCount === rollingWindow.summary.totalDatasets ? 'STABLE' : rollingWindow.summary.unstableCount > 0 ? 'UNSTABLE' : 'MARGINAL')}`} data-testid="card-rolling-window-verdict">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-8 h-8 text-cyan-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white" data-testid="text-rolling-window-verdict">
                    Rolling Window Stability
                  </h2>
                  <p className="text-slate-300 text-sm">{rollingWindow.summary.totalDatasets} datasets analyzed across multiple time windows</p>
                </div>
              </div>
              <p className="text-slate-300" data-testid="text-rolling-window-overall">{rollingWindow.summary.overallVerdict}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-white" data-testid="text-rw-total">{rollingWindow.summary.totalDatasets}</p>
                  <p className="text-xs text-slate-400">Datasets Tested</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400" data-testid="text-rw-stable">{rollingWindow.summary.stableCount}</p>
                  <p className="text-xs text-slate-400">Stable</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-amber-400" data-testid="text-rw-marginal">{rollingWindow.summary.marginalCount}</p>
                  <p className="text-xs text-slate-400">Marginal</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-400" data-testid="text-rw-unstable">{rollingWindow.summary.unstableCount}</p>
                  <p className="text-xs text-slate-400">Unstable</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  {rollingWindow.summary.gapPreservedInAllWindows
                    ? <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                    : <ShieldAlert className="w-6 h-6 text-amber-400 mx-auto" />}
                  <p className="text-xs text-slate-400 mt-1">Gap Preserved</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Per-Dataset Rolling Window Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rollingWindow.datasets.map((ds) => {
                  const isExpanded = expandedRWDataset === ds.datasetId;
                  const allGenes = [...ds.clockGenes, ...ds.targetGenes];
                  const gapChartData = ds.gapStability.windowGaps.map(g => ({
                    window: `W${g.windowIdx + 1}`,
                    clockMean: g.clockMean,
                    targetMean: g.targetMean,
                    gap: g.gap,
                  }));
                  return (
                    <div key={ds.datasetId} className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                        onClick={() => setExpandedRWDataset(isExpanded ? null : ds.datasetId)}
                        data-testid={`button-expand-rw-${ds.datasetId}`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`${rwVerdictColor(ds.verdict)} border-current`}>
                            {ds.verdict}
                          </Badge>
                          <span className="text-white font-medium">{ds.datasetName}</span>
                          <span className="text-slate-400 text-sm">{ds.species}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400 text-sm">
                            {ds.nWindows} windows | Clock CV: {(ds.clockMeanCV * 100).toFixed(1)}% | Target CV: {(ds.targetMeanCV * 100).toFixed(1)}%
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4">
                          <p className="text-slate-400 text-sm">{ds.verdictExplanation}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-slate-800/80 rounded p-3 text-center">
                              <p className="text-lg font-bold text-cyan-400">{ds.clockStableCount}/{ds.clockGenes.length}</p>
                              <p className="text-xs text-slate-400">Clock Stable</p>
                            </div>
                            <div className="bg-slate-800/80 rounded p-3 text-center">
                              <p className="text-lg font-bold text-purple-400">{ds.targetStableCount}/{ds.targetGenes.length}</p>
                              <p className="text-xs text-slate-400">Target Stable</p>
                            </div>
                            <div className="bg-slate-800/80 rounded p-3 text-center">
                              <p className={`text-lg font-bold font-mono ${ds.clockMeanCV < 0.15 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {(ds.clockMeanCV * 100).toFixed(1)}%
                              </p>
                              <p className="text-xs text-slate-400">Clock Mean CV</p>
                            </div>
                            <div className="bg-slate-800/80 rounded p-3 text-center">
                              <p className={`text-lg font-bold font-mono ${ds.targetMeanCV < 0.15 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {(ds.targetMeanCV * 100).toFixed(1)}%
                              </p>
                              <p className="text-xs text-slate-400">Target Mean CV</p>
                            </div>
                          </div>

                          {gapChartData.length > 1 && (
                            <div>
                              <p className="text-sm text-slate-400 mb-2 flex items-center gap-1">
                                <Activity size={14} />
                                Gearbox Gap Stability Across Windows
                                {ds.gapStability.hierarchyPreservedInAllWindows
                                  ? <Badge className="bg-emerald-900/30 text-emerald-300 text-xs ml-2">Hierarchy preserved</Badge>
                                  : <Badge className="bg-red-900/30 text-red-300 text-xs ml-2">Hierarchy broken</Badge>}
                              </p>
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={gapChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="window" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Bar dataKey="clockMean" name="Clock |λ|" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="targetMean" name="Target |λ|" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="flex justify-center gap-6 text-xs text-slate-400 mt-1">
                                <span>Gap Mean: <span className="text-white font-mono">{ds.gapStability.gapMean.toFixed(4)}</span></span>
                                <span>Gap Std: <span className="text-white font-mono">{ds.gapStability.gapStd.toFixed(4)}</span></span>
                                <span>Gap CV: <span className={`font-mono ${ds.gapStability.gapCV < 0.3 ? 'text-emerald-400' : 'text-amber-400'}`}>{(ds.gapStability.gapCV * 100).toFixed(1)}%</span></span>
                              </div>
                            </div>
                          )}

                          {ds.chowTest && (
                            <div className="bg-slate-800/50 rounded-lg p-3">
                              <p className="text-xs text-slate-400 mb-1">Chow Structural Break Test</p>
                              <div className="flex gap-4 text-sm">
                                <span className="text-slate-400">F: <span className="text-white font-mono">{ds.chowTest.fStatistic}</span></span>
                                <span className="text-slate-400">p: <span className="text-white font-mono">{ds.chowTest.pApprox}</span></span>
                                <Badge className={ds.chowTest.significantBreak ? 'bg-red-900/30 text-red-300' : 'bg-emerald-900/30 text-emerald-300'}>
                                  {ds.chowTest.significantBreak ? 'Break Detected' : 'No Break'}
                                </Badge>
                              </div>
                            </div>
                          )}

                          <div className="space-y-1 max-h-[300px] overflow-y-auto">
                            <p className="text-sm text-slate-400 mb-1">Per-Gene Details ({allGenes.length} genes)</p>
                            {allGenes.map((g, i) => (
                              <div key={i} className="flex items-center justify-between text-xs bg-slate-800/30 px-3 py-1.5 rounded">
                                <div className="flex items-center gap-2">
                                  {g.geneType === 'clock' ? <Clock size={10} className="text-cyan-400" /> : <Target size={10} className="text-violet-400" />}
                                  <span className="text-slate-300 font-mono">{g.gene}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-400">|λ̄| = <span className="text-white">{g.meanEigenvalue.toFixed(4)}</span></span>
                                  <span className="text-slate-400">drift = <span className={g.maxDrift < 0.15 ? 'text-emerald-400' : 'text-amber-400'}>{g.maxDrift.toFixed(4)}</span></span>
                                  <span className="text-slate-400">CV = <span className={g.coefficientOfVariation < 0.15 ? 'text-emerald-400' : 'text-amber-400'}>{(g.coefficientOfVariation * 100).toFixed(1)}%</span></span>
                                  {g.isStable
                                    ? <ShieldCheck size={12} className="text-emerald-400" />
                                    : <ShieldAlert size={12} className="text-amber-400" />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}

        {loadingRW && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Loading rolling window stability analysis...</p>
            </CardContent>
          </Card>
        )}

        {perturbation?.overallSummary && (
          <>
            <div className={`border rounded-xl p-6 ${verdictBg(perturbation.overallSummary.overallVerdict)}`} data-testid="card-perturbation-verdict">
              <div className="flex items-center gap-3 mb-3">
                <FlaskConical className="w-8 h-8 text-purple-400" />
                <div>
                  <h2 className={`text-2xl font-bold ${verdictColor(perturbation.overallSummary.overallVerdict)}`} data-testid="text-perturbation-verdict">
                    Perturbation Validation: {perturbation.overallSummary.overallVerdict}
                  </h2>
                  <p className="text-slate-300 text-sm">{perturbation.overallSummary.totalComparisons} paired experiments, {perturbation.overallSummary.totalPairedGenes} paired gene comparisons</p>
                </div>
              </div>
              <p className="text-slate-300" data-testid="text-perturbation-interpretation">{perturbation.overallSummary.interpretation}</p>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Perturbation Experiments: Predicted vs Observed Eigenvalue Shifts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {perturbation.comparisons?.map((comp: any) => (
                  <div key={comp.id} className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                      onClick={() => setExpandedPerturbation(expandedPerturbation === comp.id ? null : comp.id)}
                      data-testid={`button-expand-pert-${comp.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={comp.summary.overallConcordance >= 0.6 ? 'border-emerald-500 text-emerald-400' : comp.summary.overallConcordance >= 0.4 ? 'border-amber-500 text-amber-400' : 'border-red-500 text-red-400'}>
                          {(comp.summary.overallConcordance * 100).toFixed(0)}%
                        </Badge>
                        <span className="text-white font-medium">{comp.name}</span>
                        <span className="text-slate-400 text-sm">{comp.perturbationType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">p={comp.summary.signTestP < 0.001 ? '<0.001' : comp.summary.signTestP.toFixed(3)}</span>
                        {expandedPerturbation === comp.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {expandedPerturbation === comp.id && (
                      <div className="px-4 pb-4 space-y-4">
                        <p className="text-slate-400 text-sm"><strong className="text-slate-300">Expected:</strong> {comp.expectedDirection}</p>
                        <p className="text-slate-300 text-sm" data-testid={`text-pert-interp-${comp.id}`}>{comp.summary.interpretation}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-slate-800/80 rounded p-3 text-center">
                            <p className="text-lg font-bold text-cyan-400">{comp.summary.controlGap.toFixed(4)}</p>
                            <p className="text-xs text-slate-400">Control Gap</p>
                          </div>
                          <div className="bg-slate-800/80 rounded p-3 text-center">
                            <p className="text-lg font-bold text-purple-400">{comp.summary.perturbedGap.toFixed(4)}</p>
                            <p className="text-xs text-slate-400">Perturbed Gap</p>
                          </div>
                          <div className="bg-slate-800/80 rounded p-3 text-center">
                            <p className={`text-lg font-bold ${comp.summary.gapChange < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{comp.summary.gapChange > 0 ? '+' : ''}{comp.summary.gapChange.toFixed(4)}</p>
                            <p className="text-xs text-slate-400">Gap Change ({comp.summary.gapChangeDirection})</p>
                          </div>
                          <div className="bg-slate-800/80 rounded p-3 text-center">
                            <p className="text-lg font-bold text-white">{comp.summary.nPairedGenes}</p>
                            <p className="text-xs text-slate-400">Paired Genes</p>
                          </div>
                        </div>
                        {comp.pairedComparisons && comp.pairedComparisons.length > 0 && (
                          <div>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comp.pairedComparisons.map((p: any) => ({
                                  gene: p.gene,
                                  shift: p.shift,
                                  correct: p.directionCorrect
                                }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                  <XAxis dataKey="gene" tick={{ fill: '#64748b', fontSize: 10 }} />
                                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Eigenvalue Shift', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                                  <ReferenceLine y={0} stroke="#475569" />
                                  <Bar dataKey="shift">
                                    {comp.pairedComparisons.map((p: any, idx: number) => (
                                      <Cell key={idx} fill={p.directionCorrect ? '#22c55e' : '#ef4444'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Green = shift in predicted direction, Red = opposite direction</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-400">
            {stationarity?.methodology && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Augmented Dickey-Fuller (ADF) Test</h4>
                  <p>{stationarity.methodology.adfDescription}</p>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Kwiatkowski-Phillips-Schmidt-Shin (KPSS) Test</h4>
                  <p>{stationarity.methodology.kpssDescription}</p>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Dual Verdict Logic</h4>
                  <p>{stationarity.methodology.dualVerdictLogic}</p>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">One-Step-Ahead Forecasting</h4>
                  <p>{stationarity.methodology.forecastingMethod}</p>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Two-Track Robustness Analysis</h4>
                  <p>{stationarity.methodology.twoTrackLogic}</p>
                </div>
              </div>
            )}
            {rollingWindow && (
              <div className="space-y-3 border-t border-slate-700 pt-4 mt-4">
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Rolling Window Stability</h4>
                  <p>AR(2) models are re-fit across overlapping sub-windows (50% of total timepoints, ~5 windows per dataset). Eigenvalue stability is measured by coefficient of variation (CV &lt; 15%) and max drift (&lt; 0.15). Chow structural break tests detect regime changes at the midpoint.</p>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Gap Stability</h4>
                  <p>The clock–target eigenvalue hierarchy is verified in every window. If the gap (clock |λ| &gt; target |λ|) is preserved across all windows, the biological signal is robust against temporal sub-sampling.</p>
                </div>
              </div>
            )}
            {perturbation?.methodology && (
              <div className="space-y-3 border-t border-slate-700 pt-4 mt-4">
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Perturbation Validation Approach</h4>
                  <p>{perturbation.methodology.approach}</p>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Expected Perturbation Directions</h4>
                  <p>{perturbation.methodology.expectedDirections}</p>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Statistical Test</h4>
                  <p>{perturbation.methodology.statisticalTest}</p>
                </div>
                <div>
                  <h4 className="text-slate-300 font-medium mb-1">Limitations</h4>
                  <p>{perturbation.methodology.limitations}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
