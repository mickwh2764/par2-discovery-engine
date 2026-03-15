import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Layers, CheckCircle, XCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter, ReferenceLine } from "recharts";
import { useState } from "react";
import HowTo from "@/components/HowTo";

interface GeneEigenvalue {
  gene: string;
  eigenvalue: number;
  phi1: number;
  phi2: number;
  r2: number;
  layer: 'identity' | 'clock' | 'proliferation';
}

interface TissueResult {
  tissue: string;
  identityLabel: string;
  nTimepoints: number;
  identityMean: number;
  clockMean: number;
  prolifMean: number;
  identityClockGap: number;
  clockProlifGap: number;
  identityProlifGap: number;
  hierarchyConfirmed: boolean;
  partialHierarchy: string;
  identityGenes: GeneEigenvalue[];
  clockGenes: GeneEigenvalue[];
  prolifGenes: GeneEigenvalue[];
  nIdentityFound: number;
  nClockFound: number;
  nProlifFound: number;
}

interface PermutationResult {
  tissue: string;
  observedGap: number;
  pValue: number;
  zScore: number;
  nPermutations: number;
}

interface AnalysisData {
  tissues: TissueResult[];
  summary: {
    nTissues: number;
    nConfirmed: number;
    nPartial: number;
    nFailed: number;
    meanIdentityClockGap: number;
    meanClockProlifGap: number;
    overallVerdict: string;
  };
  permutationTests: PermutationResult[];
  bootstrapCI: {
    identityClockGap: { lower: number; upper: number; mean: number };
    clockProlifGap: { lower: number; upper: number; mean: number };
  };
}

const LAYER_COLORS = {
  identity: '#ef4444',
  clock: '#f59e0b',
  proliferation: '#3b82f6',
};

export default function CrossTissueThreeLayer() {
  const { data, isLoading, error } = useQuery<AnalysisData>({
    queryKey: ['/api/analysis/cross-tissue-three-layer'],
  });
  const [selectedTissue, setSelectedTissue] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Running AR(2) across 8 tissues with tissue-specific identity markers...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">Analysis failed: {(error as Error)?.message || 'Unknown error'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { tissues, summary, permutationTests, bootstrapCI } = data;
  const detail = selectedTissue ? tissues.find(t => t.tissue === selectedTissue) : null;

  const barData = tissues.map(t => ({
    tissue: t.tissue,
    Identity: parseFloat(t.identityMean.toFixed(4)),
    Clock: parseFloat(t.clockMean.toFixed(4)),
    Proliferation: parseFloat(t.prolifMean.toFixed(4)),
    confirmed: t.hierarchyConfirmed,
  }));

  const gapData = tissues.map(t => ({
    tissue: t.tissue,
    'Identity–Clock Gap': parseFloat(t.identityClockGap.toFixed(4)),
    'Clock–Prolif Gap': parseFloat(t.clockProlifGap.toFixed(4)),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/cell-type-persistence">
            <Button variant="ghost" size="sm" data-testid="link-back">
              <ArrowLeft className="h-4 w-4 mr-1" /> Cell-Type Map
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-red-400" />
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Cross-Tissue Three-Layer Validation</h1>
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">8 Tissues</Badge>
          </div>
        </div>
        <p className="text-muted-foreground max-w-4xl">
          Testing whether cell-identity markers sit above clock genes, which sit above proliferation genes,
          independently in each tissue using tissue-specific identity marker panels from GSE54650 (Zhang et al. 2014).
        </p>

        <HowTo
          title="Cross-Tissue Three-Layer Validation"
          summary="Tests the Identity > Clock > Proliferation three-layer temporal hierarchy across 8 different tissues using the GSE54650 dataset. Permutation tests and bootstrap confidence intervals validate that the hierarchy is consistent and not tissue-specific."
          steps={[
            { label: "Browse tissues", detail: "Each panel shows one tissue with its Identity, Clock, and Proliferation mean eigenvalues." },
            { label: "Check the hierarchy", detail: "In each tissue, Identity markers should have the highest eigenvalue, followed by Clock, then Proliferation." },
            { label: "Review statistics", detail: "Permutation p-values and bootstrap CIs quantify whether each layer separation is statistically significant." }
          ]}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400" data-testid="text-confirmed">{summary.nConfirmed}/{summary.nTissues}</p>
              <p className="text-sm text-muted-foreground">Full Hierarchy</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-400" data-testid="text-partial">{summary.nPartial}</p>
              <p className="text-sm text-muted-foreground">Partial (I&gt;C only)</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-400" data-testid="text-ic-gap">{summary.meanIdentityClockGap.toFixed(3)}</p>
              <p className="text-sm text-muted-foreground">Mean I–C Gap</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-400" data-testid="text-cp-gap">{summary.meanClockProlifGap.toFixed(3)}</p>
              <p className="text-sm text-muted-foreground">Mean C–P Gap</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-400" />
              Three-Layer Eigenvalue Means by Tissue
            </CardTitle>
            <CardDescription>
              Red = tissue-specific identity markers, Amber = clock genes, Blue = proliferation genes.
              Full hierarchy requires red above amber above blue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="tissue" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280' }} label={{ value: 'Mean |λ|', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#334155' }}
                />
                <Legend />
                <Bar dataKey="Identity" fill={LAYER_COLORS.identity} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Clock" fill={LAYER_COLORS.clock} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Proliferation" fill={LAYER_COLORS.proliferation} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gap Analysis: Identity–Clock vs Clock–Proliferation</CardTitle>
            <CardDescription>Both gaps should be positive for full three-layer hierarchy. Bootstrap 95% CIs shown below.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="tissue" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280' }} label={{ value: 'Gap (Δ|λ|)', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} labelStyle={{ color: '#334155' }} />
                <Legend />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Bar dataKey="Identity–Clock Gap" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Clock–Prolif Gap" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-300">Identity–Clock Gap (Bootstrap 95% CI)</p>
                <p className="text-xl font-bold text-white mt-1">
                  [{bootstrapCI.identityClockGap.lower.toFixed(3)}, {bootstrapCI.identityClockGap.upper.toFixed(3)}]
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mean: {bootstrapCI.identityClockGap.mean.toFixed(3)} —
                  {bootstrapCI.identityClockGap.lower > 0 ? ' CI excludes zero ✓' : ' CI includes zero ⚠'}
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-300">Clock–Proliferation Gap (Bootstrap 95% CI)</p>
                <p className="text-xl font-bold text-white mt-1">
                  [{bootstrapCI.clockProlifGap.lower.toFixed(3)}, {bootstrapCI.clockProlifGap.upper.toFixed(3)}]
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mean: {bootstrapCI.clockProlifGap.mean.toFixed(3)} —
                  {bootstrapCI.clockProlifGap.lower > 0 ? ' CI excludes zero ✓' : ' CI includes zero ⚠'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Per-Tissue Results</CardTitle>
            <CardDescription>Click a tissue to see individual gene eigenvalues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-tissue-results">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3">Tissue</th>
                    <th className="text-left py-2 px-3">Identity Label</th>
                    <th className="text-right py-2 px-3">Identity |λ|</th>
                    <th className="text-right py-2 px-3">Clock |λ|</th>
                    <th className="text-right py-2 px-3">Prolif |λ|</th>
                    <th className="text-right py-2 px-3">I–C Gap</th>
                    <th className="text-right py-2 px-3">C–P Gap</th>
                    <th className="text-center py-2 px-3">Status</th>
                    <th className="text-right py-2 px-3">Genes</th>
                  </tr>
                </thead>
                <tbody>
                  {tissues.map(t => (
                    <tr
                      key={t.tissue}
                      className={`border-b border-border/50 cursor-pointer hover:bg-muted/30 ${selectedTissue === t.tissue ? 'bg-muted/50' : ''}`}
                      onClick={() => setSelectedTissue(selectedTissue === t.tissue ? null : t.tissue)}
                      data-testid={`row-tissue-${t.tissue.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      <td className="py-2 px-3 font-medium">{t.tissue}</td>
                      <td className="py-2 px-3 text-muted-foreground text-xs">{t.identityLabel}</td>
                      <td className="py-2 px-3 text-right font-mono text-red-400">{t.identityMean.toFixed(4)}</td>
                      <td className="py-2 px-3 text-right font-mono text-amber-400">{t.clockMean.toFixed(4)}</td>
                      <td className="py-2 px-3 text-right font-mono text-blue-400">{t.prolifMean.toFixed(4)}</td>
                      <td className={`py-2 px-3 text-right font-mono ${t.identityClockGap > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.identityClockGap > 0 ? '+' : ''}{t.identityClockGap.toFixed(4)}
                      </td>
                      <td className={`py-2 px-3 text-right font-mono ${t.clockProlifGap > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.clockProlifGap > 0 ? '+' : ''}{t.clockProlifGap.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {t.hierarchyConfirmed ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400 inline" />
                        ) : t.identityClockGap > 0 ? (
                          <AlertTriangle className="h-4 w-4 text-amber-400 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 inline" />
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-xs text-muted-foreground">
                        {t.nIdentityFound}+{t.nClockFound}+{t.nProlifFound}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {detail && (
          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-red-400" />
                {detail.tissue} — Gene-Level Detail
              </CardTitle>
              <CardDescription>{detail.identityLabel} markers vs clock vs proliferation ({detail.nTimepoints} timepoints)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-400 text-sm">{detail.identityLabel} ({detail.nIdentityFound} genes)</h4>
                  {detail.identityGenes.map(g => (
                    <div key={g.gene} className="flex justify-between text-xs bg-red-500/5 rounded px-2 py-1">
                      <span className="text-red-300">{g.gene}</span>
                      <span className="font-mono">{g.eigenvalue.toFixed(4)}</span>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground pt-1">Mean: {detail.identityMean.toFixed(4)}</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-400 text-sm">Clock Genes ({detail.nClockFound} genes)</h4>
                  {detail.clockGenes.map(g => (
                    <div key={g.gene} className="flex justify-between text-xs bg-amber-500/5 rounded px-2 py-1">
                      <span className="text-amber-300">{g.gene}</span>
                      <span className="font-mono">{g.eigenvalue.toFixed(4)}</span>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground pt-1">Mean: {detail.clockMean.toFixed(4)}</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-400 text-sm">Proliferation ({detail.nProlifFound} genes)</h4>
                  {detail.prolifGenes.map(g => (
                    <div key={g.gene} className="flex justify-between text-xs bg-blue-500/5 rounded px-2 py-1">
                      <span className="text-blue-300">{g.gene}</span>
                      <span className="font-mono">{g.eigenvalue.toFixed(4)}</span>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground pt-1">Mean: {detail.prolifMean.toFixed(4)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Permutation Tests (Identity–Clock Gap)</CardTitle>
            <CardDescription>
              10,000 label shuffles per tissue (seed=42). Tests whether identity markers being above clock genes could arise by chance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-permutation">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3">Tissue</th>
                    <th className="text-right py-2 px-3">Observed Gap</th>
                    <th className="text-right py-2 px-3">p-value</th>
                    <th className="text-right py-2 px-3">z-score</th>
                    <th className="text-center py-2 px-3">Significant?</th>
                  </tr>
                </thead>
                <tbody>
                  {permutationTests.map(p => (
                    <tr key={p.tissue} className="border-b border-border/50">
                      <td className="py-2 px-3 font-medium">{p.tissue}</td>
                      <td className="py-2 px-3 text-right font-mono">{p.observedGap.toFixed(4)}</td>
                      <td className="py-2 px-3 text-right font-mono">{p.pValue < 0.001 ? '<0.001' : p.pValue.toFixed(3)}</td>
                      <td className="py-2 px-3 text-right font-mono">{p.zScore.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center">
                        {p.pValue < 0.05 ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">p&lt;0.05</Badge>
                        ) : (
                          <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">n.s.</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className={summary.nConfirmed >= summary.nTissues * 0.75 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {summary.nConfirmed >= summary.nTissues * 0.75 ? (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              )}
              Overall Verdict
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg" data-testid="text-verdict">{summary.overallVerdict}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">Identity–Clock Gap (cross-tissue bootstrap 95% CI)</p>
                <p className="font-mono">
                  [{bootstrapCI.identityClockGap.lower.toFixed(4)}, {bootstrapCI.identityClockGap.upper.toFixed(4)}]
                  {bootstrapCI.identityClockGap.lower > 0 ? ' — excludes zero ✓' : ' — includes zero ⚠'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Clock–Proliferation Gap (cross-tissue bootstrap 95% CI)</p>
                <p className="font-mono">
                  [{bootstrapCI.clockProlifGap.lower.toFixed(4)}, {bootstrapCI.clockProlifGap.upper.toFixed(4)}]
                  {bootstrapCI.clockProlifGap.lower > 0 ? ' — excludes zero ✓' : ' — includes zero ⚠'}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tissue-specific identity markers: hepatocyte (liver), nephron/podocyte (kidney), cardiomyocyte (heart),
              pulmonary epithelial (lung), myocyte (muscle), neural (cerebellum), brown adipocyte (brown fat),
              white adipocyte (white fat). All from GSE54650 (Zhang et al. 2014, 24 timepoints per tissue).
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
