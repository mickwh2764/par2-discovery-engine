import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, ReferenceLine, Legend
} from "recharts";
import {
  ArrowLeft, Loader2, FlaskConical, BarChart3, CheckCircle2, XCircle,
  Download, Info
} from "lucide-react";

const DATASETS: { id: string; label: string }[] = [
  { id: 'liver', label: 'Liver' },
  { id: 'kidney', label: 'Kidney' },
  { id: 'heart', label: 'Heart' },
  { id: 'lung', label: 'Lung' },
  { id: 'muscle', label: 'Muscle' },
  { id: 'cerebellum', label: 'Cerebellum' },
  { id: 'brainstem', label: 'Brainstem' },
  { id: 'hypothalamus', label: 'Hypothalamus' },
  { id: 'adrenal', label: 'Adrenal' },
  { id: 'aorta', label: 'Aorta' },
  { id: 'brown_fat', label: 'Brown Fat' },
  { id: 'white_fat', label: 'White Fat' },
];

interface CategoryResult {
  category: string;
  label: string;
  color: string;
  n: number;
  nBackground: number;
  medianLambda: number;
  meanLambda: number;
  stdLambda: number;
  backgroundMedianLambda: number;
  backgroundMeanLambda: number;
  mannWhitneyU: number;
  mannWhitneyP: number;
  mannWhitneyPAdjusted: number;
  cohensD: number;
  rankBiserialR: number;
  pctComplexRoots: number;
  backgroundPctComplexRoots: number;
  fisherOddsRatio: number;
  fisherP: number;
  fisherPAdjusted: number;
  fisherContingency: { a: number; b: number; c: number; d: number };
  direction: string;
  significant: boolean;
  complexEnriched: boolean;
}

interface PairwiseResult {
  categoryA: string;
  categoryB: string;
  nA: number;
  nB: number;
  medianA: number;
  medianB: number;
  mannWhitneyP: number;
  cohensD: number;
}

interface TestData {
  success: boolean;
  dataset: string;
  totalGenes: number;
  categorizedGenes: number;
  categoryAssignment: string;
  categories: CategoryResult[];
  pairwiseComparisons: PairwiseResult[];
  summaryTable: string;
  methodology: string;
}

function formatP(p: number): string {
  if (p < 0.0001) return p.toExponential(2);
  if (p < 0.01) return p.toFixed(4);
  return p.toFixed(3);
}

function sigStars(p: number): string {
  if (p < 0.001) return '***';
  if (p < 0.01) return '**';
  if (p < 0.05) return '*';
  return '';
}

function effectLabel(d: number): string {
  const abs = Math.abs(d);
  if (abs >= 0.8) return 'large';
  if (abs >= 0.5) return 'medium';
  if (abs >= 0.2) return 'small';
  return 'negligible';
}

function downloadCSV(categories: CategoryResult[], pairwise: PairwiseResult[], dataset: string) {
  let csv = 'Category,n,Median |λ|,Background Median |λ|,Mean |λ|,SD |λ|,Mann-Whitney U,MW p-value,MW p-adjusted (BH),Cohens d,Rank-Biserial r,% Complex Roots,BG % Complex,Fisher OR,Fisher p,Fisher p-adjusted (BH),Direction,MW Significant,Complex Enriched\n';
  for (const c of categories) {
    csv += `${c.label},${c.n},${c.medianLambda},${c.backgroundMedianLambda},${c.meanLambda},${c.stdLambda},${c.mannWhitneyU},${c.mannWhitneyP},${c.mannWhitneyPAdjusted},${c.cohensD},${c.rankBiserialR},${c.pctComplexRoots},${c.backgroundPctComplexRoots},${c.fisherOddsRatio === Infinity ? 'Inf' : c.fisherOddsRatio},${c.fisherP},${c.fisherPAdjusted},${c.direction},${c.significant},${c.complexEnriched}\n`;
  }
  csv += '\nPairwise Comparisons\n';
  csv += 'Category A,Category B,n(A),n(B),Median A,Median B,MW p-value,Cohens d\n';
  for (const p of pairwise) {
    csv += `${p.categoryA},${p.categoryB},${p.nA},${p.nB},${p.medianA},${p.medianB},${p.mannWhitneyP},${p.cohensD}\n`;
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `category_statistical_tests_${dataset}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CategoryTests() {
  const [dataset, setDataset] = useState('liver');

  const { data, isLoading, error } = useQuery<TestData>({
    queryKey: ['/api/validation/category-statistical-tests', dataset],
    queryFn: () => fetch(`/api/validation/category-statistical-tests?dataset=${dataset}`).then(r => r.json()),
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/robustness-suite">
            <Button variant="ghost" size="sm" data-testid="link-back-robustness">
              <ArrowLeft className="w-4 h-4 mr-1" /> Robustness Suite
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900" data-testid="text-page-title">
              <FlaskConical className="w-8 h-8 text-amber-600" />
              Category Statistical Tests
            </h1>
            <p className="text-slate-500 mt-1">
              Mann-Whitney U + Fisher's exact test for all 9 gene categories with Benjamini-Hochberg correction
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {DATASETS.map(ds => (
            <Button
              key={ds.id}
              variant={dataset === ds.id ? "default" : "outline"}
              size="sm"
              onClick={() => setDataset(ds.id)}
              data-testid={`button-dataset-${ds.id}`}
              className={dataset === ds.id ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
            >
              {ds.label}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20" data-testid="status-loading">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mr-3" />
            <span className="text-lg text-slate-500">Running statistical tests on {DATASETS.find(d => d.id === dataset)?.label}...</span>
          </div>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-600" data-testid="text-error">Error: {(error as Error).message}</p>
            </CardContent>
          </Card>
        )}

        {data?.success && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-slate-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600" data-testid="text-total-genes">{data.totalGenes.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Total Genes Analyzed</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600" data-testid="text-categorized-genes">{data.categorizedGenes}</div>
                  <div className="text-xs text-slate-500">Categorized Genes</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-sig-categories">
                    {data.categories.filter(c => c.significant).length} / {data.categories.length}
                  </div>
                  <div className="text-xs text-slate-500">Significant (MW, adj. p &lt; 0.05)</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600" data-testid="text-complex-enriched">
                    {data.categories.filter(c => c.complexEnriched).length} / {data.categories.length}
                  </div>
                  <div className="text-xs text-slate-500">Complex-Root Enriched (Fisher, adj. p &lt; 0.05)</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 mb-6">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                    Summary Table — {data.dataset}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCSV(data.categories, data.pairwiseComparisons, dataset)}
                    data-testid="button-download-csv"
                  >
                    <Download className="w-4 h-4 mr-1" /> Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-summary">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="text-left p-3">Category</th>
                        <th className="text-right p-3">n</th>
                        <th className="text-right p-3">Median |λ|</th>
                        <th className="text-right p-3">BG Median</th>
                        <th className="text-right p-3">MW p</th>
                        <th className="text-right p-3">MW p(adj)</th>
                        <th className="text-right p-3">Cohen's d</th>
                        <th className="text-right p-3">r<sub>rb</sub></th>
                        <th className="text-right p-3">% Complex</th>
                        <th className="text-right p-3">BG %Complex</th>
                        <th className="text-right p-3">Fisher OR</th>
                        <th className="text-right p-3">Fisher p(adj)</th>
                        <th className="text-center p-3">Sig?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.categories.map(c => (
                        <tr
                          key={c.category}
                          className={`border-b border-slate-100 hover:bg-slate-50 ${c.significant ? 'bg-green-50' : ''}`}
                          data-testid={`row-category-${c.category}`}
                        >
                          <td className="p-3 font-medium text-slate-900 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                            {c.label}
                          </td>
                          <td className="text-right p-3 text-slate-500">{c.n}</td>
                          <td className="text-right p-3 font-mono text-slate-800">{c.medianLambda.toFixed(3)}</td>
                          <td className="text-right p-3 font-mono text-slate-400">{c.backgroundMedianLambda.toFixed(3)}</td>
                          <td className="text-right p-3 font-mono text-slate-700">{formatP(c.mannWhitneyP)}</td>
                          <td className="text-right p-3 font-mono font-bold">
                            <span className={c.significant ? 'text-green-600' : 'text-slate-400'}>
                              {formatP(c.mannWhitneyPAdjusted)} {sigStars(c.mannWhitneyPAdjusted)}
                            </span>
                          </td>
                          <td className="text-right p-3 font-mono text-slate-700">
                            <span title={effectLabel(c.cohensD)}>
                              {c.cohensD.toFixed(3)}
                            </span>
                          </td>
                          <td className="text-right p-3 font-mono text-slate-500">{c.rankBiserialR.toFixed(3)}</td>
                          <td className="text-right p-3 font-mono text-slate-700">{(c.pctComplexRoots ?? 0).toFixed(1)}%</td>
                          <td className="text-right p-3 font-mono text-slate-400">{(c.backgroundPctComplexRoots ?? 0).toFixed(1)}%</td>
                          <td className="text-right p-3 font-mono text-slate-700">
                            {c.fisherOddsRatio == null ? '—' : c.fisherOddsRatio === Infinity ? '∞' : c.fisherOddsRatio.toFixed(2)}
                          </td>
                          <td className="text-right p-3 font-mono">
                            <span className={c.complexEnriched ? 'text-purple-600 font-bold' : 'text-slate-400'}>
                              {c.fisherPAdjusted != null ? formatP(c.fisherPAdjusted) : '—'} {c.complexEnriched ? '↑' : ''}
                            </span>
                          </td>
                          <td className="text-center p-3">
                            {c.significant ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900">Median |λ| by Category vs Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={data.categories.map(c => ({
                        name: c.label,
                        median: c.medianLambda,
                        background: c.backgroundMedianLambda,
                        fill: c.color,
                        sig: c.significant,
                      }))}
                      margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-35} textAnchor="end" />
                      <YAxis tick={{ fill: '#64748b' }} domain={[0, 'auto']} label={{ value: '|λ|', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        labelStyle={{ color: '#334155' }}
                        itemStyle={{ color: '#475569' }}
                        formatter={(value: number, name: string) => [value.toFixed(4), name === 'median' ? 'Category Median' : 'Background Median']}
                      />
                      <Bar dataKey="median" name="Category Median" radius={[4, 4, 0, 0]}>
                        {data.categories.map((c, i) => (
                          <Cell key={i} fill={c.color} opacity={c.significant ? 1 : 0.5} />
                        ))}
                      </Bar>
                      <Bar dataKey="background" name="Background Median" fill="#cbd5e1" radius={[4, 4, 0, 0]} opacity={0.5} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900">Complex-Root Enrichment (Fisher's Exact)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="pctComplex"
                        name="% Complex"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        label={{ value: '% Complex Roots in Category', position: 'bottom', fill: '#64748b', offset: 25 }}
                      />
                      <YAxis
                        dataKey="logOR"
                        name="log₂(OR)"
                        tick={{ fill: '#64748b' }}
                        label={{ value: 'log₂(Odds Ratio)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                      />
                      <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        labelStyle={{ color: '#334155' }}
                        itemStyle={{ color: '#475569' }}
                        formatter={(value: number, name: string) => {
                          if (name === 'log₂(OR)') return [value.toFixed(2), name];
                          return [value.toFixed(1) + '%', name];
                        }}
                        labelFormatter={(_, payload) => {
                          if (payload?.[0]?.payload?.label) return payload[0].payload.label;
                          return '';
                        }}
                      />
                      <Scatter
                        data={data.categories.map(c => ({
                          pctComplex: c.pctComplexRoots ?? 0,
                          logOR: c.fisherOddsRatio == null ? 0 : c.fisherOddsRatio === Infinity ? 3 : Math.log2(Math.max(0.01, c.fisherOddsRatio)),
                          label: c.label,
                          fill: c.color,
                          enriched: c.complexEnriched,
                          n: c.n,
                        }))}
                        name="log₂(OR)"
                      >
                        {data.categories.map((c, i) => (
                          <Cell
                            key={i}
                            fill={c.color}
                            stroke={c.complexEnriched ? '#7c3aed' : '#94a3b8'}
                            strokeWidth={c.complexEnriched ? 3 : 1}
                            r={Math.max(6, Math.min(16, c.n / 2))}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-slate-400 mt-1 text-center">
                    Circle size ~ n genes. Purple outline = significant enrichment (BH-adjusted p &lt; 0.05).
                    Dashed line = OR = 1 (no enrichment).
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-900">Key Pairwise Comparisons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-pairwise">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="text-left p-3">Comparison</th>
                        <th className="text-right p-3">n(A)</th>
                        <th className="text-right p-3">n(B)</th>
                        <th className="text-right p-3">Median A</th>
                        <th className="text-right p-3">Median B</th>
                        <th className="text-right p-3">Δ Median</th>
                        <th className="text-right p-3">MW p</th>
                        <th className="text-right p-3">Cohen's d</th>
                        <th className="text-right p-3">Effect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pairwiseComparisons.map((p, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`row-pairwise-${i}`}>
                          <td className="p-3 font-medium text-slate-900">{p.categoryA} vs {p.categoryB}</td>
                          <td className="text-right p-3 text-slate-500">{p.nA}</td>
                          <td className="text-right p-3 text-slate-500">{p.nB}</td>
                          <td className="text-right p-3 font-mono text-slate-700">{p.medianA.toFixed(3)}</td>
                          <td className="text-right p-3 font-mono text-slate-700">{p.medianB.toFixed(3)}</td>
                          <td className="text-right p-3 font-mono font-bold">
                            <span className={(p.medianA - p.medianB) > 0 ? 'text-green-600' : 'text-red-600'}>
                              {(p.medianA - p.medianB) > 0 ? '+' : ''}{(p.medianA - p.medianB).toFixed(3)}
                            </span>
                          </td>
                          <td className="text-right p-3 font-mono text-slate-700">
                            {formatP(p.mannWhitneyP)} {sigStars(p.mannWhitneyP)}
                          </td>
                          <td className="text-right p-3 font-mono text-slate-700">{p.cohensD.toFixed(3)}</td>
                          <td className="text-right p-3">
                            <Badge variant="outline" className={
                              Math.abs(p.cohensD) >= 0.8 ? 'border-green-500 text-green-600' :
                              Math.abs(p.cohensD) >= 0.5 ? 'border-yellow-500 text-yellow-600' :
                              Math.abs(p.cohensD) >= 0.2 ? 'border-blue-500 text-blue-600' :
                              'border-slate-300 text-slate-400'
                            }>
                              {effectLabel(p.cohensD)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {data.categories.map(c => (
              <div key={c.category} className="mb-3">
                <Card className={`border ${c.significant ? 'bg-green-50 border-green-200' : 'border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-bold text-lg text-slate-900">{c.label}</span>
                        <Badge variant="outline" className="text-xs">{c.n} genes</Badge>
                        {c.significant && <Badge className="bg-green-600 text-white text-xs">MW significant</Badge>}
                        {c.complexEnriched && <Badge className="bg-purple-600 text-white text-xs">Complex enriched</Badge>}
                      </div>
                      <div className="flex gap-4 text-sm text-slate-500">
                        <span>Median |λ|: <span className="font-mono font-bold text-slate-900">{c.medianLambda.toFixed(3)}</span> (bg: {c.backgroundMedianLambda.toFixed(3)})</span>
                        <span>Direction: <span className={c.direction === 'higher' ? 'text-green-600' : c.direction === 'lower' ? 'text-red-600' : 'text-slate-400'}>{c.direction}</span></span>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-slate-500">
                      <div>MW U = {c.mannWhitneyU.toFixed(0)}, p = {formatP(c.mannWhitneyP)}, p(adj) = <span className={c.significant ? 'text-green-600 font-bold' : ''}>{formatP(c.mannWhitneyPAdjusted)}</span></div>
                      <div>Cohen's d = {c.cohensD.toFixed(3)} ({effectLabel(c.cohensD)})</div>
                      <div>r<sub>rb</sub> = {c.rankBiserialR.toFixed(3)}</div>
                      <div>Complex: {(c.pctComplexRoots ?? 0).toFixed(1)}% (bg: {(c.backgroundPctComplexRoots ?? 0).toFixed(1)}%)</div>
                      <div>Fisher OR = {c.fisherOddsRatio == null ? '—' : c.fisherOddsRatio === Infinity ? '∞' : c.fisherOddsRatio.toFixed(2)}, p(adj) = <span className={c.complexEnriched ? 'text-purple-600 font-bold' : ''}>{c.fisherPAdjusted != null ? formatP(c.fisherPAdjusted) : '—'}</span></div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {c.fisherContingency ? `Contingency: [${c.fisherContingency.a} complex in-cat, ${c.fisherContingency.b} real in-cat | ${c.fisherContingency.c} complex bg, ${c.fisherContingency.d} real bg]` : 'Contingency: insufficient data'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            <Card className="border-slate-200 mt-6 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                  <Info className="w-4 h-4 text-blue-600" />
                  Methodology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-slate-500 whitespace-pre-wrap font-mono" data-testid="text-methodology">
                  {data.methodology}
                </pre>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  <strong>Category assignment:</strong> {data.categoryAssignment}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
