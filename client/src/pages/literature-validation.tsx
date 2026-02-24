import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  ArrowLeft, Loader2, Search, CheckCircle, XCircle, AlertTriangle,
  BookOpen, ShieldCheck, ShieldX, Sparkles, ArrowDown, Target,
  FlaskConical, Microscope, ChevronDown, ChevronUp, Download,
} from "lucide-react";
import DownloadResultsButton, { downloadAsCSV } from "@/components/DownloadResultsButton";
import PaperCrossLinks from "@/components/PaperCrossLinks";

interface ValidationGene {
  gene: string;
  par2Found: boolean;
  par2DeltaAIC: number;
  par2FDR: number;
  par2Significant: boolean;
  literatureValidated: boolean;
  literatureMethod: string;
  literatureCitation: string;
  literatureYear: number;
  literatureFinding: string;
  pathway: string;
  convergenceType: 'confirmed' | 'novel_par2' | 'literature_only' | 'both_negative';
}

interface FalsificationResult {
  predictorGene: string;
  predictorType: 'clock' | 'housekeeping' | 'random';
  totalGenesAnalyzed: number;
  totalSignificant: number;
  percentSignificant: number;
  topPathways: { pathway: string; pValue: number; foldEnrichment: number; coupledInPathway: number }[];
  overlapWithArntl: number;
  overlapPercent: number;
  medianDeltaAIC: number;
}

interface ConvergenceSummary {
  totalLiteratureGenes: number;
  foundInDataset: number;
  confirmedByPAR2: number;
  confirmationRate: number;
  novelPAR2Only: number;
  literatureOnlyMissed: number;
  pathwayBreakdown: { pathway: string; total: number; confirmed: number; rate: number }[];
}

interface ValidationResponse {
  dataset: string;
  validationMap: ValidationGene[];
  convergenceSummary: ConvergenceSummary;
  falsificationTests: FalsificationResult[];
  falsificationVerdict: string;
}

const DATASETS = [
  { value: 'GSE54650_Liver_circadian.csv', label: 'Zhang 2014 - Liver (2h/12pt)' },
  { value: 'GSE11923_Liver_1h_48h_genes.csv', label: 'Hughes 2009 - Liver (1h/48pt)' },
];

function FunnelStep({ number, label, value, color, width, detail }: {
  number: number; label: string; value: string; color: string; width: string; detail?: string;
}) {
  return (
    <div className="flex flex-col items-center" data-testid={`funnel-step-${number}`}>
      <div
        className={`${width} py-3 px-4 rounded-lg border text-center transition-all hover:scale-105 cursor-default`}
        style={{ backgroundColor: `${color}20`, borderColor: `${color}60` }}
      >
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        <div className="text-xs text-slate-400 mt-1">{label}</div>
        {detail && <div className="text-[10px] text-slate-400 mt-0.5">{detail}</div>}
      </div>
      {number < 4 && (
        <ArrowDown className="w-5 h-5 text-slate-400 my-2 animate-pulse" />
      )}
    </div>
  );
}

function PathwayNode({ pathway, confirmed, total, rate, isSelected, onClick }: {
  pathway: string; confirmed: number; total: number; rate: number; isSelected: boolean; onClick: () => void;
}) {
  const rateColor = rate >= 40 ? '#22c55e' : rate >= 20 ? '#f59e0b' : '#64748b';
  const size = Math.max(60, Math.min(110, total * 12));
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-full transition-all duration-300 hover:scale-110 ${
        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
      }`}
      style={{
        width: size,
        height: size,
        backgroundColor: `${rateColor}20`,
        border: `2px solid ${rateColor}`,
      }}
      data-testid={`pathway-node-${pathway.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <span className="text-lg font-bold" style={{ color: rateColor }}>{rate}%</span>
      <span className="text-[9px] text-slate-400 text-center leading-tight px-1 max-w-full truncate">
        {pathway.length > 14 ? pathway.slice(0, 12) + '..' : pathway}
      </span>
      <span className="text-[9px] text-slate-400">{confirmed}/{total}</span>
    </button>
  );
}

export default function LiteratureValidationPage() {
  const [dataset, setDataset] = useState(DATASETS[0].value);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'confirmed' | 'novel_par2' | 'literature_only'>('all');
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [showAllFalsification, setShowAllFalsification] = useState(false);
  const [expandedGene, setExpandedGene] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<ValidationResponse>({
    queryKey: ['/api/literature-validation/analyze', dataset],
    queryFn: async () => {
      const res = await fetch(`/api/literature-validation/analyze?dataset=${encodeURIComponent(dataset)}`);
      if (!res.ok) throw new Error('Analysis failed');
      return res.json();
    },
    staleTime: 300000,
  });

  const filteredGenes = useMemo(() => {
    if (!data) return [];
    return data.validationMap
      .filter(g => {
        if (filterType !== 'all' && g.convergenceType !== filterType) return false;
        if (selectedPathway && g.pathway !== selectedPathway && g.pathway !== 'Novel Discovery') return false;
        if (searchTerm && !g.gene.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !g.pathway.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !g.literatureCitation.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      });
  }, [data, filterType, searchTerm, selectedPathway]);

  const convergencePieData = useMemo(() => {
    if (!data) return [];
    const cs = data.convergenceSummary;
    return [
      { name: 'Confirmed by PAR(2)', value: cs.confirmedByPAR2, fill: '#22c55e' },
      { name: 'Literature Only', value: cs.literatureOnlyMissed, fill: '#94a3b8' },
    ];
  }, [data]);

  const falsificationChartData = useMemo(() => {
    if (!data) return [];
    return data.falsificationTests.map(f => ({
      gene: f.predictorGene,
      type: f.predictorType,
      percentSignificant: parseFloat(f.percentSignificant.toFixed(2)),
      totalSignificant: f.totalSignificant,
      pathwayCount: f.topPathways.length,
      overlap: parseFloat(f.overlapPercent.toFixed(1)),
      medianDeltaAIC: parseFloat(f.medianDeltaAIC.toFixed(2)),
      fill: f.predictorType === 'clock' ? '#22c55e' : f.predictorType === 'housekeeping' ? '#f59e0b' : '#ef4444',
    }));
  }, [data]);

  const clockResult = data?.falsificationTests.find(f => f.predictorType === 'clock');
  const controlResults = data?.falsificationTests.filter(f => f.predictorType !== 'clock') || [];
  const avgControlPercent = controlResults.length > 0
    ? controlResults.reduce((a, f) => a + f.percentSignificant, 0) / controlResults.length : 0;
  const enrichmentRatio = avgControlPercent > 0 ? (clockResult?.percentSignificant || 0) / avgControlPercent : Infinity;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/genome-wide-coupling">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent" data-testid="text-page-title">
              Literature Validation & Falsification
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Cross-referencing AR(2) coupling results against published circadian literature and negative controls
            </p>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 mt-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong className="text-white">What you can do:</strong> Cross-references genes identified by AR(2) analysis against 59 circadian genes curated from published literature (Panda, Takahashi, Sancar). Shows where AR(2) results overlap with independently reported findings. Download the cross-reference table for your methods section.
              </p>
            </div>
          </div>
          {data && (
            <DownloadResultsButton
              data={data.validationMap.map(g => ({
                gene: g.gene,
                par2Found: g.par2Found,
                par2DeltaAIC: g.par2DeltaAIC,
                par2FDR: g.par2FDR,
                par2Significant: g.par2Significant,
                literatureValidated: g.literatureValidated,
                literatureMethod: g.literatureMethod,
                literatureCitation: g.literatureCitation,
                literatureYear: g.literatureYear,
                literatureFinding: g.literatureFinding,
                pathway: g.pathway,
                convergenceType: g.convergenceType,
              }))}
              filename="PAR2_LiteratureValidation_Results.csv"
            />
          )}
          <Select value={dataset} onValueChange={(v) => { setDataset(v); setSelectedPathway(null); }}>
            <SelectTrigger className="w-[280px] bg-slate-800 border-slate-700" data-testid="select-dataset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATASETS.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <PaperCrossLinks currentPage="/literature-validation" />

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4" data-testid="status-loading">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-400" />
            <div className="text-center">
              <p className="text-slate-300 font-semibold">Running validation + falsification tests...</p>
              <p className="text-slate-400 text-sm mt-1">Testing Arntl against 10+ control predictors across ~21,000 genes</p>
            </div>
          </div>
        )}

        {error && (
          <Card className="bg-red-900/30 border-red-700">
            <CardContent className="p-6">
              <p className="text-red-400" data-testid="status-error">Analysis failed: {(error as Error).message}</p>
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            {/* ========== SECTION 1: THE STORY - Discovery Funnel ========== */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 mb-8 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-sm">1</span>
                  </div>
                  <CardTitle className="text-xl">Analysis Summary</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  AR(2) coupling scan applied to all genes in the dataset. Results filtered by FDR and ΔAIC thresholds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-6 gap-0">
                  <FunnelStep
                    number={1}
                    label="Total Genes Scanned"
                    value={clockResult ? clockResult.totalGenesAnalyzed.toLocaleString() : '~21,000'}
                    color="#94a3b8"
                    width="w-80"
                    detail="All genes in the dataset"
                  />
                  <FunnelStep
                    number={2}
                    label="Significantly Clock-Coupled"
                    value={clockResult ? clockResult.totalSignificant.toLocaleString() : '-'}
                    color="#22c55e"
                    width="w-64"
                    detail={`${clockResult?.percentSignificant.toFixed(1)}% passed FDR < 0.05 + ΔAIC > 2`}
                  />
                  <FunnelStep
                    number={3}
                    label="Match Published Literature"
                    value={`${data.convergenceSummary.confirmedByPAR2}`}
                    color="#06b6d4"
                    width="w-48"
                    detail={`of ${data.convergenceSummary.foundInDataset} known circadian genes in dataset`}
                  />
                  <FunnelStep
                    number={4}
                    label="Not in Literature Database"
                    value={data.convergenceSummary.novelPAR2Only.toLocaleString()}
                    color="#a855f7"
                    width="w-56"
                    detail="Significant by AR(2) but absent from our 59-gene curated list"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/50">
                    <div className="text-2xl font-bold text-emerald-400" data-testid="text-confirmation-rate">
                      {Math.round(data.convergenceSummary.confirmationRate * 100)}%
                    </div>
                    <div className="text-xs text-slate-400">Overlap Rate</div>
                    <div className="text-[10px] text-slate-400">Literature genes reaching FDR threshold</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-cyan-900/20 border border-cyan-800/50">
                    <div className="text-2xl font-bold text-cyan-400" data-testid="text-novel-count">
                      {data.convergenceSummary.novelPAR2Only.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Unlisted Significant</div>
                    <div className="text-[10px] text-slate-400">Not in curated literature database</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-900/20 border border-amber-800/50">
                    <div className="text-2xl font-bold text-amber-400">
                      {data.convergenceSummary.pathwayBreakdown.filter(p => p.rate > 0).length}
                    </div>
                    <div className="text-xs text-slate-400">Pathways with Overlap</div>
                    <div className="text-[10px] text-slate-400">Pathways containing at least one shared gene</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ========== SECTION 2: FALSIFICATION - The Decisive Test ========== */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 mb-8">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 font-bold text-sm">2</span>
                  </div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {data.falsificationVerdict.startsWith('PASSED') ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ShieldX className="w-6 h-6 text-red-400" />
                    )}
                    The Falsification Test
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Negative control test: replacing the clock predictor (Arntl) with housekeeping or random genes
                  to check whether coupling results are predictor-specific or a general statistical artifact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* The dramatic comparison */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Arntl - The Real Signal */}
                  <div className="relative p-6 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-700/50">
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-600 text-white">CLOCK PREDICTOR</Badge>
                    </div>
                    <div className="text-sm text-emerald-300 font-semibold mb-1">Predictor: Arntl (BMAL1)</div>
                    <div className="text-6xl font-black text-emerald-400 my-3" data-testid="text-arntl-percent">
                      {clockResult?.percentSignificant.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-400">
                      {clockResult?.totalSignificant.toLocaleString()} genes reached significance
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {clockResult?.topPathways.slice(0, 4).map((p, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] border-emerald-700 text-emerald-400">
                          {p.pathway}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Controls - The Noise */}
                  <div className="relative p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="border-slate-600 text-slate-400">CONTROLS</Badge>
                    </div>
                    <div className="text-sm text-slate-400 font-semibold mb-1">
                      {controlResults.length} Housekeeping & Random Genes
                    </div>
                    <div className="text-6xl font-black text-slate-400 my-3" data-testid="text-control-percent">
                      {avgControlPercent.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-400">
                      Average: {Math.round(controlResults.reduce((a, f) => a + f.totalSignificant, 0) / Math.max(controlResults.length, 1))} genes
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      GAPDH, Actb, Tbp, Hprt, + random genes
                    </div>
                  </div>
                </div>

                {/* The Verdict */}
                <div className={`p-5 rounded-xl mb-6 ${
                  data.falsificationVerdict.startsWith('PASSED')
                    ? 'bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-emerald-600/50'
                    : 'bg-gradient-to-r from-red-900/40 to-amber-900/40 border border-red-600/50'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {data.falsificationVerdict.startsWith('PASSED') ? (
                      <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-lg font-bold text-white">
                        {enrichmentRatio >= 10 ? `${Math.round(enrichmentRatio)}x Enrichment Ratio` :
                         enrichmentRatio >= 3 ? `${enrichmentRatio.toFixed(1)}x Enrichment Ratio` :
                         'Low Enrichment'}
                      </div>
                      <div className="text-sm text-slate-400">
                        Clock predictor vs control average ({clockResult?.percentSignificant.toFixed(1)}% vs {avgControlPercent.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-2" data-testid="text-falsification-verdict">
                    {data.falsificationVerdict}
                  </p>
                </div>

                {/* Comparison Chart */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Significant Genes by Predictor (Arntl vs Controls)</h3>
                  <ResponsiveContainer width="100%" height={Math.min(400, falsificationChartData.length * 34 + 40)}>
                    <BarChart data={falsificationChartData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#94a3b8" tickFormatter={v => `${v}%`} fontSize={11} />
                      <YAxis type="category" dataKey="gene" width={70} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(value: number, name: string) => [`${value}%`, '% Genome Significant']}
                        labelFormatter={(label) => {
                          const item = falsificationChartData.find(d => d.gene === label);
                          return `${label} (${item?.type || ''}) — ${item?.totalSignificant.toLocaleString() || 0} genes`;
                        }}
                      />
                      <Bar dataKey="percentSignificant" radius={[0, 4, 4, 0]} barSize={18}>
                        {falsificationChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllFalsification(!showAllFalsification)}
                  className="text-slate-400 hover:text-white"
                  data-testid="button-toggle-falsification-table"
                >
                  {showAllFalsification ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  {showAllFalsification ? 'Hide' : 'Show'} detailed comparison table
                </Button>

                {showAllFalsification && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-falsification">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400">
                          <th className="text-left py-2 px-3">Predictor</th>
                          <th className="text-left py-2 px-3">Type</th>
                          <th className="text-right py-2 px-3">Significant</th>
                          <th className="text-right py-2 px-3">% Significant</th>
                          <th className="text-right py-2 px-3">Pathways</th>
                          <th className="text-right py-2 px-3">Overlap w/ Arntl</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.falsificationTests.map((f, i) => (
                          <tr key={i} className={`border-b border-slate-800 ${f.predictorType === 'clock' ? 'bg-emerald-900/20' : ''}`}>
                            <td className="py-2 px-3 font-mono font-semibold">{f.predictorGene}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className={
                                f.predictorType === 'clock' ? 'border-emerald-500 text-emerald-400' :
                                f.predictorType === 'housekeeping' ? 'border-amber-500 text-amber-400' :
                                'border-red-500 text-red-400'
                              }>{f.predictorType}</Badge>
                            </td>
                            <td className="py-2 px-3 text-right font-semibold">{f.totalSignificant.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right font-semibold">{f.percentSignificant.toFixed(1)}%</td>
                            <td className="py-2 px-3 text-right">{f.topPathways.length}</td>
                            <td className="py-2 px-3 text-right">{f.predictorType === 'clock' ? '-' : `${f.overlapPercent.toFixed(1)}%`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ========== SECTION 3: CONVERGENCE MAP ========== */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 mb-8">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-sm">3</span>
                  </div>
                  <CardTitle className="text-xl">Interactive Convergence Map</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Each circle is a biological pathway. Size = gene count. Color = how well PAR(2) confirmed published findings.
                  Click any pathway to see its genes below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 justify-center py-6">
                  {data.convergenceSummary.pathwayBreakdown.map((p) => (
                    <PathwayNode
                      key={p.pathway}
                      pathway={p.pathway}
                      confirmed={p.confirmed}
                      total={p.total}
                      rate={Math.round(p.rate * 100)}
                      isSelected={selectedPathway === p.pathway}
                      onClick={() => setSelectedPathway(selectedPathway === p.pathway ? null : p.pathway)}
                    />
                  ))}
                </div>

                {selectedPathway && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{selectedPathway}</h4>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPathway(null)} className="text-slate-400 h-6">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      {data.validationMap
                        .filter(g => g.pathway === selectedPathway)
                        .map((g, i) => (
                          <div key={i} className={`flex items-center gap-3 p-2 rounded text-sm ${
                            g.par2Significant ? 'bg-emerald-900/20' : 'bg-slate-800/50'
                          }`}>
                            <span className="font-mono font-semibold w-16 text-white">{g.gene}</span>
                            {g.par2Significant ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            )}
                            <span className="text-xs text-slate-400 flex-1">{g.literatureFinding}</span>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">{g.literatureCitation}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Confirmation by Pathway</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={data.convergenceSummary.pathwayBreakdown.map(p => ({
                          pathway: p.pathway.length > 18 ? p.pathway.slice(0, 16) + '..' : p.pathway,
                          fullPathway: p.pathway,
                          confirmed: p.confirmed,
                          missed: p.total - p.confirmed,
                          rate: Math.round(p.rate * 100),
                        }))}
                        layout="vertical"
                        margin={{ left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                        <YAxis type="category" dataKey="pathway" width={120} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(value: number, name: string) => [value, name === 'confirmed' ? 'PAR(2) Confirmed' : 'Literature Only']}
                          labelFormatter={(label) => {
                            const item = data.convergenceSummary.pathwayBreakdown.find(p =>
                              p.pathway === label || p.pathway.startsWith(label.replace('..', ''))
                            );
                            return item ? `${item.pathway} (${Math.round(item.rate * 100)}% confirmed)` : label;
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="confirmed" stackId="a" fill="#22c55e" name="PAR(2) Confirmed" />
                        <Bar dataKey="missed" stackId="a" fill="#334155" name="Literature Only" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Overall Convergence</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={convergencePieData}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {convergencePieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-center text-xs text-slate-400 -mt-4">
                      Of {data.convergenceSummary.foundInDataset} literature genes found in dataset
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ========== SECTION 4: INTERPRETATION & LIMITATIONS ========== */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 mb-8">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 font-bold text-sm">4</span>
                  </div>
                  <CardTitle className="text-xl">Interpretation & Limitations</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  What these results show, what they don't, and how they could be used.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-semibold text-white">Chronotherapy Hypothesis Generation</h4>
                    </div>
                    <p className="text-sm text-slate-400">
                      Genes reaching significance here are candidates for clock-dependent regulation. 
                      Where these overlap with known drug targets, they suggest hypotheses for time-of-day 
                      dosing that would require independent validation (e.g., Storch et al. 2002, Takahashi 2017).
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <h4 className="font-semibold text-white">Unlisted Genes</h4>
                    </div>
                    <p className="text-sm text-slate-400">
                      {data.convergenceSummary.novelPAR2Only.toLocaleString()} genes reached significance but are 
                      not in our curated literature list. This does not confirm they are circadian - our database 
                      covers only 59 genes. Many may already be known via other databases (CircaDB, KEGG) or may 
                      represent false positives despite FDR correction.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <FlaskConical className="w-5 h-5 text-amber-400" />
                      <h4 className="font-semibold text-white">What the Falsification Test Shows</h4>
                    </div>
                    <p className="text-sm text-slate-400">
                      The enrichment ratio indicates the coupling signal is predictor-specific rather than a 
                      general regression artifact. This is necessary but not sufficient to establish biological 
                      causation. The test design follows negative control logic standard in genomics 
                      (Storey & Tibshirani 2003).
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Microscope className="w-5 h-5 text-purple-400" />
                      <h4 className="font-semibold text-white">Key Limitations</h4>
                    </div>
                    <p className="text-sm text-slate-400">
                      Results are from a single dataset and tissue. Literature database is manually curated 
                      (59 genes) and not exhaustive. Overlap rate depends on dataset quality, tissue match, 
                      and statistical power. Cross-tissue and cross-species replication is needed before 
                      drawing broad conclusions.
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-slate-900/50 border border-amber-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h4 className="font-semibold text-white">Note on Interpretation</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Statistical significance in this context means the AR(2)+clock model fits better than the 
                    AR(2)-only model for a given gene (ΔAIC &gt; 2, FDR &lt; 0.05). This indicates a statistical 
                    association with the clock predictor, not proven biological regulation. The overlap with 
                    published wet-lab findings and the negative control enrichment ratio provide supporting 
                    evidence, but independent experimental confirmation remains the standard for biological claims.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ========== SECTION 5: GENE EXPLORER ========== */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-500/20 flex items-center justify-center">
                    <span className="text-slate-400 font-bold text-sm">5</span>
                  </div>
                  <CardTitle className="text-xl">Gene Explorer</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Browse individual genes. Click any gene to see AR(2) coupling statistics alongside published literature.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search gene, pathway, or citation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white w-64 focus:border-emerald-500 focus:outline-none"
                      data-testid="input-search-genes"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'confirmed', 'novel_par2', 'literature_only'] as const).map(f => {
                      const count = data.validationMap.filter(g => f === 'all' || g.convergenceType === f).length;
                      const colors: Record<string, string> = {
                        all: 'bg-slate-600', confirmed: 'bg-emerald-600', novel_par2: 'bg-cyan-600', literature_only: 'bg-slate-500'
                      };
                      const labels: Record<string, string> = {
                        all: 'All', confirmed: 'Confirmed', novel_par2: 'Unlisted', literature_only: 'Lit Only'
                      };
                      return (
                        <Button
                          key={f}
                          size="sm"
                          onClick={() => setFilterType(f)}
                          className={`${filterType === f ? colors[f] + ' text-white' : 'bg-transparent border border-slate-600 text-slate-400 hover:text-white'}`}
                          data-testid={`button-filter-${f}`}
                        >
                          {labels[f]} ({count})
                        </Button>
                      );
                    })}
                  </div>
                  {selectedPathway && (
                    <Badge variant="outline" className="border-cyan-500 text-cyan-400 flex items-center gap-1">
                      Pathway: {selectedPathway}
                      <button onClick={() => setSelectedPathway(null)} className="ml-1 hover:text-white">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                  {filteredGenes.slice(0, 100).map((g) => (
                    <div key={g.gene + g.pathway}>
                      <button
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          expandedGene === g.gene
                            ? 'bg-slate-700/50 border border-slate-600'
                            : 'hover:bg-slate-800/50'
                        } ${
                          g.convergenceType === 'confirmed' ? 'border-l-2 border-l-emerald-500' :
                          g.convergenceType === 'novel_par2' ? 'border-l-2 border-l-cyan-500' :
                          'border-l-2 border-l-slate-700'
                        }`}
                        onClick={() => setExpandedGene(expandedGene === g.gene ? null : g.gene)}
                        data-testid={`gene-row-${g.gene}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-white w-20 flex-shrink-0">{g.gene}</span>
                          <div className="flex-shrink-0">
                            {g.convergenceType === 'confirmed' && (
                              <Badge className="bg-emerald-600/30 text-emerald-400 text-[10px]">
                                <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
                              </Badge>
                            )}
                            {g.convergenceType === 'novel_par2' && (
                              <Badge className="bg-cyan-600/30 text-cyan-400 text-[10px]">
                                <Sparkles className="w-3 h-3 mr-1" /> Unlisted
                              </Badge>
                            )}
                            {g.convergenceType === 'literature_only' && (
                              <Badge className="bg-slate-600/30 text-slate-400 text-[10px]">
                                <BookOpen className="w-3 h-3 mr-1" /> Lit Only
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 flex-1 truncate">{g.pathway}</span>
                          {g.par2Found && (
                            <span className={`text-xs font-mono ${g.par2Significant ? 'text-emerald-400' : 'text-slate-400'}`}>
                              ΔAIC {g.par2DeltaAIC.toFixed(1)}
                            </span>
                          )}
                          {expandedGene === g.gene ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {expandedGene === g.gene && (
                        <div className="ml-4 p-4 bg-slate-900/50 rounded-b-lg border-l-2 border-slate-700 space-y-3 text-sm animate-in fade-in duration-200">
                          {g.par2Found && (
                            <div>
                              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">PAR(2) Result</div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <div className="text-xs text-slate-400">ΔAIC</div>
                                  <div className={`font-mono font-bold ${g.par2DeltaAIC > 2 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {g.par2DeltaAIC.toFixed(2)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-400">FDR</div>
                                  <div className={`font-mono ${g.par2FDR < 0.05 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {g.par2FDR < 0.001 ? g.par2FDR.toExponential(2) : g.par2FDR.toFixed(4)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-400">Status</div>
                                  <div className={g.par2Significant ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                                    {g.par2Significant ? 'Significant' : 'Not significant'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {g.literatureValidated && (
                            <div>
                              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Published Literature</div>
                              <div className="space-y-1">
                                <div className="text-slate-300">{g.literatureFinding}</div>
                                <div className="text-xs text-slate-400">
                                  Method: {g.literatureMethod} | {g.literatureCitation}
                                </div>
                              </div>
                            </div>
                          )}
                          {g.convergenceType === 'novel_par2' && (
                            <div className="text-cyan-400 text-xs p-2 bg-cyan-900/20 rounded">
                              This gene reached statistical significance but is not in our curated literature 
                              database. It may be known via other circadian databases or may warrant further investigation.
                            </div>
                          )}
                          {g.convergenceType === 'confirmed' && (
                            <div className="text-emerald-400 text-xs p-2 bg-emerald-900/20 rounded">
                              Also reported by {g.literatureCitation.split(',')[0]} using {g.literatureMethod.toLowerCase()} ({g.literatureYear}).
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredGenes.length > 100 && (
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Showing first 100 of {filteredGenes.length} genes. Use search to narrow results.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
