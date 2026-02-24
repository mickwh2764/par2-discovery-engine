import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from "recharts";
import {
  ArrowLeft, ArrowRight, Loader2, TrendingUp, TrendingDown, Search, Filter, Dna, Activity, AlertTriangle, BarChart3,
  Shield, CheckCircle2, XCircle, ChevronDown, ChevronUp, GitBranch
} from "lucide-react";
import { Link } from "wouter";
import HowTo from "@/components/HowTo";
import PaperCrossLinks from "@/components/PaperCrossLinks";
import InsightCallout from "@/components/InsightCallout";
import ExportReport from "@/components/ExportReport";
import DownloadResultsButton from "@/components/DownloadResultsButton";

interface DiseasePair {
  id: number;
  healthyId: string;
  diseaseId: string;
  label: string;
  category: string;
  healthyName: string;
  diseaseName: string;
}

interface ShiftEntry {
  gene: string;
  geneType: string;
  geneCategory: string;
  healthyEigenvalue: number;
  diseaseEigenvalue: number;
  shift: number;
  absShift: number;
  healthyBeta1: number;
  healthyBeta2: number;
  diseaseBeta1: number;
  diseaseBeta2: number;
  healthyR2: number;
  diseaseR2: number;
  healthyConfidence: string;
  diseaseConfidence: string;
  healthyStable: boolean;
  diseaseStable: boolean;
  regimeChange: boolean;
}

interface ScreenResult {
  pair: { label: string; category: string; healthyName: string; diseaseName: string; healthyId: string; diseaseId: string };
  summary: {
    totalHealthyGenes: number;
    totalDiseaseGenes: number;
    sharedGenes: number;
    filteredGenes: number;
    genesUp: number;
    genesDown: number;
    meanShift: number;
    meanAbsShift: number;
    regimeChanges: number;
    regimeChangePercent: number;
    filters: { minR2: number; onlyStable: boolean };
  };
  shifts: ShiftEntry[];
  totalShifts: number;
  categoryStats: { category: string; count: number; meanShift: number; meanAbsShift: number }[];
  shiftDistribution: { center: number; count: number }[];
  highlights: ShiftEntry[];
}

interface RobustnessData {
  pairIndex: number;
  pairLabel: string;
  pairCategory: string;
  sharedGeneCount: number;
  categoryPermutations: Array<{
    category: string;
    nGenes: number;
    observedMeanShift: number;
    pValue: number;
    zScore: number;
    nullHistogram: Array<{ binMin: number; binMax: number; count: number }>;
  }>;
  globalTest: { testStatistic: number; pValue: number; significant: boolean };
  bootstrapShifts: Array<{
    gene: string;
    category: string;
    pointEstimate: number;
    ci95Lower: number;
    ci95Upper: number;
    ciWidth: number;
    excludesZero: boolean;
  }>;
  fdr: {
    totalGenesTested: number;
    significantAt005: number;
    significantAt010: number;
    significantAt020: number;
    highlightQValues: Array<{ gene: string; pValue: number; qValue: number; significant005: boolean }>;
  };
  diagnosticsSummary: {
    healthyCounts: Record<string, number>;
    diseaseCounts: Record<string, number>;
    confidenceDropped: Array<{ gene: string; healthyConfidence: string; diseaseConfidence: string }>;
    highlightDiagnostics: Array<{ gene: string; healthyConfidence: string; diseaseConfidence: string }>;
  };
  conclusion: string;
}

type SortField = "gene" | "geneCategory" | "healthyEigenvalue" | "diseaseEigenvalue" | "shift" | "healthyR2" | "diseaseR2" | "regimeChange";
type SortDir = "asc" | "desc";

const R2_OPTIONS = [0, 0.05, 0.1, 0.2];

const CATEGORY_COLORS: Record<string, string> = {
  Cancer: "bg-red-900/50 text-red-300 border-red-700",
  "Clock Disruption": "bg-blue-900/50 text-blue-300 border-blue-700",
  "Circadian Disruption": "bg-purple-900/50 text-purple-300 border-purple-700",
  Aging: "bg-amber-900/50 text-amber-300 border-amber-700",
};

function geneTypeBadge(geneType: string) {
  if (geneType === "clock") return <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">clock</Badge>;
  if (geneType === "target") return <Badge className="bg-amber-900/50 text-amber-300 border-amber-700">target</Badge>;
  return <Badge variant="outline" className="text-slate-400 border-slate-600">{geneType}</Badge>;
}

function categoryBadge(cat: string) {
  const cls = CATEGORY_COLORS[cat] || "text-slate-400 border-slate-600";
  return <Badge className={cls}>{cat}</Badge>;
}

function TrajectoryMap({ highlights }: { highlights: ShiftEntry[] }) {
  const svgX = (b1: number) => 50 + (b1 + 2) * (500 / 4);
  const svgY = (b2: number) => 380 - (b2 + 1) * (350 / 2);
  const [hoveredGene, setHoveredGene] = useState<ShiftEntry | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const parabolaPoints = useMemo(() => {
    const pts: string[] = [];
    for (let b1 = -2; b1 <= 2; b1 += 0.05) {
      const b2 = b1 * b1 / 4;
      if (b2 <= 1) {
        pts.push(`${svgX(b1)},${svgY(b2)}`);
      }
    }
    return pts.join(" ");
  }, []);

  const trianglePoints = `${svgX(-2)},${svgY(-1)} ${svgX(0)},${svgY(1)} ${svgX(2)},${svgY(-1)}`;

  return (
    <div className="relative">
      <svg viewBox="0 0 600 400" className="w-full" style={{ maxHeight: 400 }} data-testid="trajectory-map-svg">
        <rect width="600" height="400" fill="#0f172a" />
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>
        <polygon points={trianglePoints} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 3" />
        <polyline points={parabolaPoints} fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <line x1={svgX(-2)} y1={svgY(0)} x2={svgX(2)} y2={svgY(0)} stroke="#334155" strokeWidth="0.5" />
        <line x1={svgX(0)} y1={svgY(-1)} x2={svgX(0)} y2={svgY(1)} stroke="#334155" strokeWidth="0.5" />
        <text x={svgX(2) + 5} y={svgY(0) + 4} fill="#94a3b8" fontSize="11">β₁</text>
        <text x={svgX(0) + 5} y={svgY(1) - 5} fill="#94a3b8" fontSize="11">β₂</text>
        {highlights.map((h, idx) => {
          const hx = svgX(h.healthyBeta1);
          const hy = svgY(h.healthyBeta2);
          const dx = svgX(h.diseaseBeta1);
          const dy = svgY(h.diseaseBeta2);
          return (
            <g
              key={idx}
              onMouseEnter={(e) => {
                setHoveredGene(h);
                const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                const scaleX = rect.width / 600;
                const scaleY = rect.height / 400;
                setTooltipPos({ x: (hx + dx) / 2 * scaleX, y: Math.min(hy, dy) * scaleY - 10 });
              }}
              onMouseLeave={() => setHoveredGene(null)}
              className="cursor-pointer"
              data-testid={`trajectory-gene-${idx}`}
            >
              <line x1={hx} y1={hy} x2={dx} y2={dy} stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowhead)" opacity="0.7" />
              <circle cx={hx} cy={hy} r={3} fill="#22c55e" />
              <circle cx={dx} cy={dy} r={3} fill="#ef4444" />
            </g>
          );
        })}
        <g transform="translate(460, 20)">
          <rect width="130" height="70" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
          <circle cx={15} cy={18} r={4} fill="#22c55e" />
          <text x={25} y={22} fill="#94a3b8" fontSize="10">Healthy</text>
          <circle cx={15} cy={38} r={4} fill="#ef4444" />
          <text x={25} y={42} fill="#94a3b8" fontSize="10">Disease</text>
          <line x1={10} y1={58} x2={30} y2={58} stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
          <text x={38} y={62} fill="#94a3b8" fontSize="10">Trajectory</text>
        </g>
      </svg>
      {hoveredGene && (
        <div
          className="absolute pointer-events-none bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm shadow-xl z-10"
          style={{ left: tooltipPos.x, top: tooltipPos.y, transform: "translate(-50%, -100%)" }}
          data-testid="trajectory-tooltip"
        >
          <div className="font-bold text-white">{hoveredGene.gene}</div>
          <div className="text-emerald-400">Healthy |λ|: {Math.abs(hoveredGene.healthyEigenvalue).toFixed(4)}</div>
          <div className="text-red-400">Disease |λ|: {Math.abs(hoveredGene.diseaseEigenvalue).toFixed(4)}</div>
          <div className="text-cyan-400">Shift: {hoveredGene.shift > 0 ? "+" : ""}{hoveredGene.shift.toFixed(4)}</div>
          {hoveredGene.regimeChange && <div className="text-amber-400">⚠ Regime change</div>}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
      <div className="font-bold text-white">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toFixed(4) : p.value}</div>
      ))}
    </div>
  );
};

export default function DiseaseScreen() {
  const [selectedPair, setSelectedPair] = useState(0);
  const [minR2, setMinR2] = useState(0);
  const [onlyStable, setOnlyStable] = useState(false);
  const [geneSearch, setGeneSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("shift");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [robustnessOpen, setRobustnessOpen] = useState(true);

  const { data: pairs, isLoading: pairsLoading } = useQuery<DiseasePair[]>({
    queryKey: ["/api/analysis/disease-screen/pairs"],
  });

  const { data: screenData, isLoading: screenLoading } = useQuery<ScreenResult>({
    queryKey: [`/api/analysis/disease-screen/${selectedPair}?minR2=${minR2}&onlyStable=${onlyStable}&topN=100&gene=${geneSearch}`],
    enabled: !!pairs,
  });

  const { data: robustnessData, isLoading: robustnessLoading } = useQuery<RobustnessData>({
    queryKey: ['/api/analysis/disease-screen', selectedPair, 'robustness'],
    queryFn: async () => {
      const res = await fetch(`/api/analysis/disease-screen/${selectedPair}/robustness?nPermutations=1000&nBootstrap=500`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!screenData,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const sortedBootstrapShifts = useMemo(() => {
    if (!robustnessData?.bootstrapShifts) return [];
    return [...robustnessData.bootstrapShifts].sort((a, b) => Math.abs(b.pointEstimate) - Math.abs(a.pointEstimate));
  }, [robustnessData?.bootstrapShifts]);

  const groupedPairs = useMemo(() => {
    if (!pairs) return {};
    const groups: Record<string, DiseasePair[]> = {};
    pairs.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [pairs]);

  const sortedShifts = useMemo(() => {
    if (!screenData?.shifts) return [];
    return [...screenData.shifts].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      if (sortField === "regimeChange") {
        aVal = a.regimeChange ? 1 : 0;
        bVal = b.regimeChange ? 1 : 0;
      }
      if (typeof aVal === "string") return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [screenData?.shifts, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const isLoading = pairsLoading || screenLoading;

  if (pairsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center" data-testid="loading-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8" data-testid="disease-screen-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-back-home">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
                <Dna className="h-6 w-6 text-cyan-400" />
                Genome-Wide Disease Screen
              </h1>
              <p className="text-sm text-muted-foreground">
                Differential persistence analysis across matched disease/healthy pairs — comparing temporal dynamics of every gene
              </p>
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 mt-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">What you can do:</strong> Compare computed eigenvalue distributions between healthy and disease-condition datasets. Statistical tests show whether the distributions differ significantly between groups. Download results to include these comparisons in your research.
                </p>
              </div>
            </div>
          </div>
          <PaperCrossLinks currentPage="/disease-screen" />
          <DownloadResultsButton
            data={screenData?.shifts?.map(s => ({
              gene: s.gene,
              geneType: s.geneType,
              geneCategory: s.geneCategory,
              healthyEigenvalue: s.healthyEigenvalue,
              diseaseEigenvalue: s.diseaseEigenvalue,
              shift: s.shift,
              absShift: s.absShift,
              healthyR2: s.healthyR2,
              diseaseR2: s.diseaseR2,
              regimeChange: s.regimeChange,
            }))}
            filename="PAR2_DiseaseScreen_Results.csv"
          />
          {screenData && (
            <ExportReport
              title={`Disease Screen: ${screenData.pair.healthyName} vs ${screenData.pair.diseaseName}`}
              subtitle={`Genome-wide AR(2) eigenvalue shift analysis`}
              sections={[
                { heading: 'Summary', content: { type: 'stats', items: [
                  { label: 'Shared Genes', value: screenData.summary.sharedGenes },
                  { label: 'Genes Up', value: screenData.summary.genesUp },
                  { label: 'Genes Down', value: screenData.summary.genesDown },
                  { label: 'Mean |Shift|', value: screenData.summary.meanAbsShift.toFixed(4) },
                  { label: 'Regime Changes', value: `${screenData.summary.regimeChangePercent.toFixed(1)}%` },
                ]}},
                { heading: 'Key Genes', content: { type: 'table', headers: ['Gene', 'Type', 'Healthy |λ|', 'Disease |λ|', 'Shift', 'Regime Change'], rows: screenData.highlights.map(h => [h.gene, h.geneType, Math.abs(h.healthyEigenvalue).toFixed(4), Math.abs(h.diseaseEigenvalue).toFixed(4), h.shift.toFixed(4), h.regimeChange ? 'Yes' : 'No']) }},
              ]}
            />
          )}
        </div>

        <HowTo
          title="Genome-Wide Disease Screen"
          summary="Compares AR(2) eigenvalue signatures between matched healthy and disease conditions across 10 disease pairs. Identifies genes with the largest eigenvalue shifts and tests whether the clock-target hierarchy is preserved or disrupted in disease."
          steps={[
            { label: "Select a disease pair", detail: "Choose from 10 matched healthy/disease comparisons (e.g. colitis vs. healthy colon)." },
            { label: "Review the shift table", detail: "Genes are ranked by the magnitude of their eigenvalue shift between healthy and disease states." },
            { label: "Check hierarchy", detail: "The summary shows whether clock > target hierarchy is maintained or lost in the disease condition." },
            { label: "Filter by gene type", detail: "Use the search and filter options to focus on clock genes, target genes, or specific categories." }
          ]}
        />

        <Card className="border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Disease / Healthy Pairs
            </CardTitle>
            <CardDescription>Select a matched pair to compare eigenvalue persistence shifts across all shared genes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedPairs).map(([category, catPairs]) => (
                <div key={category}>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {catPairs.map((p) => (
                      <Button
                        key={p.id}
                        variant={selectedPair === p.id ? "default" : "outline"}
                        size="sm"
                        className={selectedPair === p.id ? "bg-cyan-700 hover:bg-cyan-600" : "border-slate-600 hover:bg-slate-800"}
                        onClick={() => setSelectedPair(p.id)}
                        data-testid={`button-pair-${p.id}`}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">R² threshold:</span>
                <div className="flex gap-1">
                  {R2_OPTIONS.map((val) => (
                    <Button
                      key={val}
                      variant={minR2 === val ? "default" : "outline"}
                      size="sm"
                      className={`h-7 px-2 text-xs ${minR2 === val ? "bg-cyan-700 hover:bg-cyan-600" : "border-slate-600"}`}
                      onClick={() => setMinR2(val)}
                      data-testid={`button-r2-${val}`}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Stable only:</span>
                <Switch checked={onlyStable} onCheckedChange={setOnlyStable} data-testid="switch-stable-only" />
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gene..."
                  value={geneSearch}
                  onChange={(e) => setGeneSearch(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700"
                  data-testid="input-gene-search"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {screenLoading && (
          <div className="flex items-center justify-center py-12" data-testid="loading-data">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
            <span className="text-muted-foreground">Analyzing genome-wide shifts...</span>
          </div>
        )}

        {screenData && !screenLoading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3" data-testid="summary-stats">
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white" data-testid="stat-shared-genes">{screenData.summary.sharedGenes.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Shared Genes</div>
                </CardContent>
              </Card>
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400 flex items-center justify-center gap-1" data-testid="stat-genes-up">
                    <TrendingUp className="h-5 w-5" /> {screenData.summary.genesUp.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Genes Up</div>
                </CardContent>
              </Card>
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1" data-testid="stat-genes-down">
                    <TrendingDown className="h-5 w-5" /> {screenData.summary.genesDown.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Genes Down</div>
                </CardContent>
              </Card>
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400" data-testid="stat-mean-shift">{screenData.summary.meanAbsShift.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">Mean |Shift|</div>
                </CardContent>
              </Card>
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400" data-testid="stat-regime-changes">{screenData.summary.regimeChangePercent.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Regime Changes</div>
                </CardContent>
              </Card>
            </div>

            {screenData.highlights.length > 0 && (
              <Card className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    Key Genes — Clock, Cancer & Growth Markers
                  </CardTitle>
                  <CardDescription>
                    Known clock, cancer, and growth genes with significant persistence shifts between {screenData.pair.healthyName} and {screenData.pair.diseaseName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-highlights">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left p-3 text-slate-400">Gene</th>
                          <th className="text-left p-3 text-slate-400">Type</th>
                          <th className="text-center p-3 text-slate-400">Healthy |λ|</th>
                          <th className="text-center p-3 text-slate-400">Disease |λ|</th>
                          <th className="text-center p-3 text-slate-400">Shift</th>
                          <th className="text-center p-3 text-slate-400">R² Change</th>
                          <th className="text-center p-3 text-slate-400">Regime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {screenData.highlights.map((h, idx) => (
                          <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50" data-testid={`row-highlight-${idx}`}>
                            <td className="p-3 font-mono font-medium">{h.gene}</td>
                            <td className="p-3">{geneTypeBadge(h.geneType)}</td>
                            <td className="p-3 text-center font-mono">{Math.abs(h.healthyEigenvalue).toFixed(4)}</td>
                            <td className="p-3 text-center font-mono">{Math.abs(h.diseaseEigenvalue).toFixed(4)}</td>
                            <td className="p-3 text-center font-mono">
                              <span className={h.shift > 0 ? "text-emerald-400" : "text-red-400"}>
                                {h.shift > 0 ? "+" : ""}{h.shift.toFixed(4)}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono text-muted-foreground">
                              {(h.diseaseR2 - h.healthyR2).toFixed(3)}
                            </td>
                            <td className="p-3 text-center">
                              {h.regimeChange ? (
                                <Badge className="bg-red-900/50 text-red-300 border-red-700">Yes</Badge>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {screenData.highlights.length > 0 && (
              <Card className="border-slate-700" data-testid="card-trajectory">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-cyan-400" />
                    Root-Space Disease Trajectory
                  </CardTitle>
                  <CardDescription>
                    AR(2) stationarity triangle showing healthy → disease trajectories for key genes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TrajectoryMap highlights={screenData.highlights} />
                  <InsightCallout title="What This Means">
                    Arrows show how each gene's dynamical position shifts between healthy and disease states. Long arrows indicate large changes in temporal dynamics. Genes crossing the parabola boundary (dashed yellow curve) undergo a regime change — switching between oscillatory and non-oscillatory behavior.
                  </InsightCallout>
                  <div className="pt-2">
                    <Link href="/root-space">
                      <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300" data-testid="link-trajectory-rootspace">
                        <ArrowRight className="h-4 w-4 mr-1" /> Explore full Root-Space
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  Shift Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of eigenvalue persistence shifts across all shared genes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={screenData.shiftDistribution} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="center"
                        stroke="#94a3b8"
                        tick={{ fontSize: 11 }}
                        label={{ value: "Shift (Disease − Healthy)", position: "insideBottom", offset: -15, fill: "#94a3b8", fontSize: 12 }}
                      />
                      <YAxis stroke="#94a3b8" label={{ value: "Gene Count", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine x={0} stroke="#ef4444" strokeDasharray="3 3" />
                      <Bar dataKey="count" name="Genes" radius={[2, 2, 0, 0]}>
                        {screenData.shiftDistribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry.center < 0 ? "#f87171" : "#34d399"} opacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 justify-center text-xs mt-2">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Negative shift (decreased persistence)</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> Positive shift (increased persistence)</span>
                </div>
              </CardContent>
            </Card>

            {screenData.categoryStats.length > 0 && (
              <Card className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    Category Impact
                  </CardTitle>
                  <CardDescription>Mean eigenvalue shift by gene category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <BarChart data={screenData.categoryStats} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis type="number" stroke="#94a3b8" />
                        <YAxis type="category" dataKey="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
                        <Bar dataKey="meanShift" name="Mean Shift" radius={[0, 4, 4, 0]}>
                          {screenData.categoryStats.map((entry, idx) => (
                            <Cell key={idx} fill={entry.meanShift >= 0 ? "#34d399" : "#f87171"} opacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dna className="h-5 w-5 text-cyan-400" />
                  Full Genome-Wide Rankings
                </CardTitle>
                <CardDescription>
                  Showing {screenData.shifts.length} of {screenData.totalShifts.toLocaleString()} genes — click column headers to sort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-rankings">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => toggleSort("gene")} data-testid="sort-gene">
                          Gene {sortField === "gene" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="text-left p-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => toggleSort("geneCategory")} data-testid="sort-category">
                          Category {sortField === "geneCategory" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="text-center p-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => toggleSort("healthyEigenvalue")} data-testid="sort-healthy-ev">
                          Healthy |λ| {sortField === "healthyEigenvalue" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="text-center p-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => toggleSort("diseaseEigenvalue")} data-testid="sort-disease-ev">
                          Disease |λ| {sortField === "diseaseEigenvalue" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="text-center p-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => toggleSort("shift")} data-testid="sort-shift">
                          Shift {sortField === "shift" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="text-center p-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => toggleSort("healthyR2")} data-testid="sort-r2-healthy">
                          R²(H) {sortField === "healthyR2" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="text-center p-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => toggleSort("diseaseR2")} data-testid="sort-r2-disease">
                          R²(D) {sortField === "diseaseR2" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                        <th className="text-center p-3 text-slate-400 cursor-pointer hover:text-white" onClick={() => toggleSort("regimeChange")} data-testid="sort-regime">
                          Regime {sortField === "regimeChange" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedShifts.map((s, idx) => (
                        <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50" data-testid={`row-ranking-${idx}`}>
                          <td className="p-3 font-mono font-medium">{s.gene}</td>
                          <td className="p-3">{categoryBadge(s.geneCategory)}</td>
                          <td className="p-3 text-center font-mono">{Math.abs(s.healthyEigenvalue).toFixed(4)}</td>
                          <td className="p-3 text-center font-mono">{Math.abs(s.diseaseEigenvalue).toFixed(4)}</td>
                          <td className="p-3 text-center font-mono">
                            <span className={s.shift > 0 ? "text-emerald-400" : "text-red-400"}>
                              {s.shift > 0 ? "+" : ""}{s.shift.toFixed(4)}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-muted-foreground">{s.healthyR2.toFixed(3)}</td>
                          <td className="p-3 text-center font-mono text-muted-foreground">{s.diseaseR2.toFixed(3)}</td>
                          <td className="p-3 text-center">
                            {s.regimeChange ? (
                              <Badge className="bg-red-900/50 text-red-300 border-red-700">Yes</Badge>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div data-testid="robustness-section">
              <div
                className="flex items-center justify-between cursor-pointer p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                onClick={() => setRobustnessOpen(!robustnessOpen)}
                data-testid="button-toggle-robustness"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-lg font-bold">Statistical Robustness Suite</h2>
                </div>
                {robustnessOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </div>

              {robustnessOpen && (
                <div className="space-y-4 mt-4">
                  {robustnessLoading && (
                    <div className="flex items-center justify-center py-12" data-testid="loading-robustness">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
                      <span className="text-muted-foreground">Running 1,000 permutation tests and 500 bootstrap iterations...</span>
                    </div>
                  )}

                  {robustnessData && !robustnessLoading && (
                    <>
                      <Card className="border-slate-700" data-testid="card-permutation-tests">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-purple-400" />
                            Category Permutation Tests
                          </CardTitle>
                          <CardDescription>Observed mean shift per category vs null distribution ({robustnessData.sharedGeneCount} shared genes)</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                              <BarChart
                                data={robustnessData.categoryPermutations.map(cp => ({
                                  ...cp,
                                  label: `${cp.category} (n=${cp.nGenes})`,
                                  pLabel: cp.pValue < 0.001 ? `p=${cp.pValue.toExponential(1)} ***` : cp.pValue < 0.01 ? `p=${cp.pValue.toFixed(3)} **` : cp.pValue < 0.05 ? `p=${cp.pValue.toFixed(3)} *` : `p=${cp.pValue.toFixed(3)}`,
                                }))}
                                layout="vertical"
                                margin={{ top: 5, right: 120, bottom: 5, left: 120 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" stroke="#94a3b8" />
                                <YAxis type="category" dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} width={110} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
                                <Bar dataKey="observedMeanShift" name="Observed Mean Shift" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#94a3b8", fontSize: 10, formatter: (_: any, __: any, index: number) => robustnessData.categoryPermutations[index]?.pValue < 0.001 ? "***" : robustnessData.categoryPermutations[index]?.pValue < 0.01 ? "**" : robustnessData.categoryPermutations[index]?.pValue < 0.05 ? "*" : "" }}>
                                  {robustnessData.categoryPermutations.map((cp, idx) => (
                                    <Cell key={idx} fill={cp.observedMeanShift >= 0 ? "#34d399" : "#f87171"} opacity={0.8} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-sm" data-testid="text-global-test">
                            {robustnessData.globalTest.significant ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-muted-foreground">
                              Global test: H={robustnessData.globalTest.testStatistic.toFixed(2)}, p={robustnessData.globalTest.pValue < 0.001 ? robustnessData.globalTest.pValue.toExponential(2) : robustnessData.globalTest.pValue.toFixed(4)}
                            </span>
                            <Badge className={robustnessData.globalTest.significant ? "bg-emerald-900/50 text-emerald-300 border-emerald-700" : "bg-red-900/50 text-red-300 border-red-700"}>
                              {robustnessData.globalTest.significant ? "Significant" : "Not Significant"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-700" data-testid="card-bootstrap-ci">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-cyan-400" />
                            Bootstrap Confidence Intervals
                          </CardTitle>
                          <CardDescription>500 bootstrap iterations — sorted by |point estimate|</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm" data-testid="table-bootstrap">
                              <thead>
                                <tr className="border-b border-slate-700">
                                  <th className="text-left p-3 text-slate-400">Gene</th>
                                  <th className="text-left p-3 text-slate-400">Category</th>
                                  <th className="text-center p-3 text-slate-400">Point Estimate</th>
                                  <th className="text-center p-3 text-slate-400">95% CI</th>
                                  <th className="text-center p-3 text-slate-400">CI Width</th>
                                  <th className="text-center p-3 text-slate-400">Excludes Zero</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortedBootstrapShifts.map((bs, idx) => (
                                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50" data-testid={`row-bootstrap-${idx}`}>
                                    <td className="p-3 font-mono font-medium">{bs.gene}</td>
                                    <td className="p-3">{categoryBadge(bs.category)}</td>
                                    <td className="p-3 text-center font-mono">
                                      <span className={bs.pointEstimate > 0 ? "text-emerald-400" : "text-red-400"}>
                                        {bs.pointEstimate > 0 ? "+" : ""}{bs.pointEstimate.toFixed(4)}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-mono text-muted-foreground">
                                      [{bs.ci95Lower.toFixed(4)}, {bs.ci95Upper.toFixed(4)}]
                                    </td>
                                    <td className="p-3 text-center font-mono text-muted-foreground">{bs.ciWidth.toFixed(4)}</td>
                                    <td className="p-3 text-center">
                                      {bs.excludesZero ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 inline-block" />
                                      ) : (
                                        <span className="text-slate-400">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-700" data-testid="card-fdr">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5 text-amber-400" />
                            FDR-Corrected Significance
                          </CardTitle>
                          <CardDescription>Benjamini-Hochberg correction across {robustnessData.fdr.totalGenesTested} tested genes</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-3 mb-4" data-testid="fdr-summary-stats">
                            <div className="border border-slate-700 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-emerald-400" data-testid="stat-fdr-005">{robustnessData.fdr.significantAt005}</div>
                              <div className="text-xs text-muted-foreground">Sig at FDR 0.05</div>
                            </div>
                            <div className="border border-slate-700 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-amber-400" data-testid="stat-fdr-010">{robustnessData.fdr.significantAt010}</div>
                              <div className="text-xs text-muted-foreground">Sig at FDR 0.10</div>
                            </div>
                            <div className="border border-slate-700 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-cyan-400" data-testid="stat-fdr-020">{robustnessData.fdr.significantAt020}</div>
                              <div className="text-xs text-muted-foreground">Sig at FDR 0.20</div>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm" data-testid="table-fdr">
                              <thead>
                                <tr className="border-b border-slate-700">
                                  <th className="text-left p-3 text-slate-400">Gene</th>
                                  <th className="text-center p-3 text-slate-400">Raw p-value</th>
                                  <th className="text-center p-3 text-slate-400">q-value (FDR)</th>
                                  <th className="text-center p-3 text-slate-400">Significance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {robustnessData.fdr.highlightQValues.map((fq, idx) => (
                                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50" data-testid={`row-fdr-${idx}`}>
                                    <td className="p-3 font-mono font-medium">{fq.gene}</td>
                                    <td className="p-3 text-center font-mono text-muted-foreground">
                                      {fq.pValue < 0.001 ? fq.pValue.toExponential(2) : fq.pValue.toFixed(4)}
                                    </td>
                                    <td className="p-3 text-center font-mono">
                                      <span className={fq.qValue < 0.05 ? "text-emerald-400" : fq.qValue < 0.20 ? "text-amber-400" : "text-slate-400"}>
                                        {fq.qValue < 0.001 ? fq.qValue.toExponential(2) : fq.qValue.toFixed(4)}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center">
                                      {fq.significant005 ? (
                                        <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700">FDR &lt; 0.05</Badge>
                                      ) : fq.qValue < 0.20 ? (
                                        <Badge className="bg-amber-900/50 text-amber-300 border-amber-700">FDR &lt; 0.20</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-slate-400 border-slate-600">NS</Badge>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-700" data-testid="card-diagnostics">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                            Diagnostic Quality Assurance
                          </CardTitle>
                          <CardDescription>Confidence level distributions and quality degradation under disease</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="border border-slate-700 rounded-lg p-4" data-testid="block-healthy-confidence">
                              <h4 className="text-sm font-semibold text-emerald-400 mb-3">Healthy Condition</h4>
                              <div className="space-y-2">
                                {Object.entries(robustnessData.diagnosticsSummary.healthyCounts).map(([level, count]) => (
                                  <div key={level} className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{level}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-emerald-500"
                                          style={{ width: `${Math.min(100, (count / Math.max(1, robustnessData.sharedGeneCount)) * 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-mono w-8 text-right">{count}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="border border-slate-700 rounded-lg p-4" data-testid="block-disease-confidence">
                              <h4 className="text-sm font-semibold text-red-400 mb-3">Disease Condition</h4>
                              <div className="space-y-2">
                                {Object.entries(robustnessData.diagnosticsSummary.diseaseCounts).map(([level, count]) => (
                                  <div key={level} className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{level}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-red-500"
                                          style={{ width: `${Math.min(100, (count / Math.max(1, robustnessData.sharedGeneCount)) * 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-mono w-8 text-right">{count}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3" data-testid="text-confidence-drops">
                            Confidence drops: <span className="text-amber-400 font-medium">{robustnessData.diagnosticsSummary.confidenceDropped.length}</span> genes dropped from High to Low/Unreliable in disease
                          </div>
                          {robustnessData.diagnosticsSummary.highlightDiagnostics.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm" data-testid="table-diagnostics">
                                <thead>
                                  <tr className="border-b border-slate-700">
                                    <th className="text-left p-3 text-slate-400">Gene</th>
                                    <th className="text-center p-3 text-slate-400">Healthy Confidence</th>
                                    <th className="text-center p-3 text-slate-400">Disease Confidence</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {robustnessData.diagnosticsSummary.highlightDiagnostics.map((d, idx) => (
                                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50" data-testid={`row-diagnostic-${idx}`}>
                                      <td className="p-3 font-mono font-medium">{d.gene}</td>
                                      <td className="p-3 text-center">
                                        <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700">{d.healthyConfidence}</Badge>
                                      </td>
                                      <td className="p-3 text-center">
                                        <Badge className={
                                          d.diseaseConfidence === "High" ? "bg-emerald-900/50 text-emerald-300 border-emerald-700" :
                                          d.diseaseConfidence === "Moderate" ? "bg-amber-900/50 text-amber-300 border-amber-700" :
                                          "bg-red-900/50 text-red-300 border-red-700"
                                        }>{d.diseaseConfidence}</Badge>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-3">
                            Confidence levels reflect the AR(2) model fit quality. Genes that drop from High to Low/Unreliable in disease may have disrupted temporal dynamics that are harder to model, indicating genuine biological signal rather than noise.
                          </p>
                        </CardContent>
                      </Card>

                      <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30" data-testid="text-robustness-conclusion">
                        <p className="text-sm text-muted-foreground italic">{robustnessData.conclusion}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <Card className="border-slate-700 bg-slate-900/50">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Methodology</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The genome-wide disease screen compares AR(2) eigenvalue persistence between matched healthy and disease conditions.
                  For each shared gene, a second-order autoregressive model is fitted independently to both conditions, extracting the
                  dominant eigenvalue |λ| as a measure of temporal persistence. The shift (disease − healthy) quantifies how much each
                  gene's dynamical regime changes under disease. A regime change occurs when a gene transitions between stable (|λ| &lt; 1)
                  and unstable (|λ| ≥ 1) regimes. Quality filters (R² threshold, stability requirement) ensure that only well-fitted genes
                  are compared. This differential persistence approach reveals which genes undergo the most significant temporal reprogramming
                  in disease, complementing traditional differential expression analysis by focusing on dynamical structure rather than amplitude.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
