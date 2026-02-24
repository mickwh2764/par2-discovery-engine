import { useState, useMemo, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  ArrowLeft, Upload, Loader2, GitCompare
} from "lucide-react";
import { Link } from "wouter";
import HowTo from "@/components/HowTo";
import InsightCallout from "@/components/InsightCallout";
import DownloadResultsButton from "@/components/DownloadResultsButton";

interface TrajectoryGene {
  gene: string;
  beforeBeta1: number;
  beforeBeta2: number;
  afterBeta1: number;
  afterBeta2: number;
  beforeEigenvalue: number;
  afterEigenvalue: number;
  shift: number;
  beforeR2: number;
  afterR2: number;
  regimeChange: boolean;
}

interface TrajectoryResult {
  sharedGenes: number;
  analyzedGenes: number;
  beforeFile: string;
  afterFile: string;
  meanAbsShift: number;
  meanShift: number;
  regimeChanges: number;
  topShifts: TrajectoryGene[];
  allTrajectories: TrajectoryGene[];
}

type SortField = "gene" | "beforeEigenvalue" | "afterEigenvalue" | "shift" | "beforeR2" | "afterR2" | "regimeChange";
type SortDir = "asc" | "desc";

function TrajectoryMap({ genes }: { genes: TrajectoryGene[] }) {
  const svgX = (b1: number) => 50 + (b1 + 2) * (500 / 4);
  const svgY = (b2: number) => 380 - (b2 + 1) * (350 / 2);
  const [hoveredGene, setHoveredGene] = useState<TrajectoryGene | null>(null);
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
  const displayed = genes.slice(0, 50);

  return (
    <div className="relative">
      <svg viewBox="0 0 600 400" className="w-full" style={{ maxHeight: 400 }} data-testid="trajectory-map-svg">
        <rect width="600" height="400" fill="#0f172a" />
        <defs>
          <marker id="arrowhead-ba" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>
        <polygon points={trianglePoints} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 3" />
        <polyline points={parabolaPoints} fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <line x1={svgX(-2)} y1={svgY(0)} x2={svgX(2)} y2={svgY(0)} stroke="#334155" strokeWidth="0.5" />
        <line x1={svgX(0)} y1={svgY(-1)} x2={svgX(0)} y2={svgY(1)} stroke="#334155" strokeWidth="0.5" />
        <text x={svgX(2) + 5} y={svgY(0) + 4} fill="#94a3b8" fontSize="11">β₁</text>
        <text x={svgX(0) + 5} y={svgY(1) - 5} fill="#94a3b8" fontSize="11">β₂</text>
        {displayed.map((g, idx) => {
          const bx = svgX(g.beforeBeta1);
          const by = svgY(g.beforeBeta2);
          const ax = svgX(g.afterBeta1);
          const ay = svgY(g.afterBeta2);
          return (
            <g
              key={idx}
              onMouseEnter={(e) => {
                setHoveredGene(g);
                const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                const scaleX = rect.width / 600;
                const scaleY = rect.height / 400;
                setTooltipPos({ x: (bx + ax) / 2 * scaleX, y: Math.min(by, ay) * scaleY - 10 });
              }}
              onMouseLeave={() => setHoveredGene(null)}
              className="cursor-pointer"
              data-testid={`trajectory-gene-${idx}`}
            >
              <line x1={bx} y1={by} x2={ax} y2={ay} stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowhead-ba)" opacity="0.7" />
              <circle cx={bx} cy={by} r={3} fill="#22c55e" />
              <circle cx={ax} cy={ay} r={3} fill="#ef4444" />
            </g>
          );
        })}
        <g transform="translate(460, 20)">
          <rect width="130" height="70" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
          <circle cx={15} cy={18} r={4} fill="#22c55e" />
          <text x={25} y={22} fill="#94a3b8" fontSize="10">Before</text>
          <circle cx={15} cy={38} r={4} fill="#ef4444" />
          <text x={25} y={42} fill="#94a3b8" fontSize="10">After</text>
          <line x1={10} y1={58} x2={30} y2={58} stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrowhead-ba)" />
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
          <div className="text-emerald-400">Before |λ|: {Math.abs(hoveredGene.beforeEigenvalue).toFixed(4)}</div>
          <div className="text-red-400">After |λ|: {Math.abs(hoveredGene.afterEigenvalue).toFixed(4)}</div>
          <div className="text-cyan-400">Shift: {hoveredGene.shift > 0 ? "+" : ""}{hoveredGene.shift.toFixed(4)}</div>
          {hoveredGene.regimeChange && <div className="text-amber-400">⚠ Regime change</div>}
        </div>
      )}
    </div>
  );
}

export default function BeforeAfter() {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);
  const [sortField, setSortField] = useState<SortField>("shift");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/analysis/before-after-trajectory', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<TrajectoryResult>;
    },
  });

  const handleCompare = () => {
    if (!beforeFile || !afterFile) return;
    const fd = new FormData();
    fd.append('before', beforeFile);
    fd.append('after', afterFile);
    mutation.mutate(fd);
  };

  const result = mutation.data;

  const sortedShifts = useMemo(() => {
    if (!result?.topShifts) return [];
    return [...result.topShifts].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case "gene": aVal = a.gene; bVal = b.gene; break;
        case "beforeEigenvalue": aVal = Math.abs(a.beforeEigenvalue); bVal = Math.abs(b.beforeEigenvalue); break;
        case "afterEigenvalue": aVal = Math.abs(a.afterEigenvalue); bVal = Math.abs(b.afterEigenvalue); break;
        case "shift": aVal = a.shift; bVal = b.shift; break;
        case "beforeR2": aVal = a.beforeR2; bVal = b.beforeR2; break;
        case "afterR2": aVal = a.afterR2; bVal = b.afterR2; break;
        case "regimeChange": aVal = a.regimeChange ? 1 : 0; bVal = b.regimeChange ? 1 : 0; break;
        default: aVal = a.shift; bVal = b.shift;
      }
      if (typeof aVal === "string") return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [result?.topShifts, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const shiftDistribution = useMemo(() => {
    if (!result?.allTrajectories) return [];
    const shifts = result.allTrajectories.map(g => g.shift);
    const min = Math.min(...shifts);
    const max = Math.max(...shifts);
    const binCount = 20;
    const binWidth = (max - min) / binCount || 0.1;
    const bins: { center: number; count: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      bins.push({ center: +(min + (i + 0.5) * binWidth).toFixed(4), count: 0 });
    }
    shifts.forEach(s => {
      const idx = Math.min(Math.floor((s - min) / binWidth), binCount - 1);
      if (idx >= 0 && idx < binCount) bins[idx].count++;
    });
    return bins;
  }, [result?.allTrajectories]);

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="text-center p-3 text-slate-400 cursor-pointer hover:text-white select-none"
      onClick={() => toggleSort(field)}
      data-testid={`sort-${field}`}
    >
      {label} {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8" data-testid="before-after-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <GitCompare className="h-6 w-6 text-cyan-400" />
              Before/After Trajectory Comparison
            </h1>
            <p className="text-sm text-muted-foreground">
              Compare how gene dynamics shift between two experimental conditions
            </p>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 mt-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong className="text-white">What you can do:</strong> Upload two CSV files representing different conditions and see which genes show the largest AR(2) eigenvalue shifts between them. The trajectory map displays the direction and magnitude of each shift. Download results for further analysis in your own workflow.
              </p>
            </div>
          </div>
          {mutation.data && (
            <DownloadResultsButton
              data={mutation.data.allTrajectories.map(g => ({
                gene: g.gene,
                beforeEigenvalue: g.beforeEigenvalue,
                afterEigenvalue: g.afterEigenvalue,
                shift: g.shift,
                beforeBeta1: g.beforeBeta1,
                beforeBeta2: g.beforeBeta2,
                afterBeta1: g.afterBeta1,
                afterBeta2: g.afterBeta2,
                beforeR2: g.beforeR2,
                afterR2: g.afterR2,
                regimeChange: g.regimeChange,
              }))}
              filename="PAR2_BeforeAfter_Results.csv"
            />
          )}
        </div>

        <HowTo
          title="Before/After Trajectory Comparison"
          summary="Upload two CSV time-series files from the same experiment at different conditions (e.g., before and after treatment). The engine computes AR(2) eigenvalues for each gene in both conditions and visualizes how they shift in root-space."
          steps={[
            { label: "Upload Before file", detail: "Select a CSV with time-series gene expression data for the control/before condition." },
            { label: "Upload After file", detail: "Select a CSV with time-series gene expression data for the treatment/after condition." },
            { label: "Click Compare", detail: "The engine fits AR(2) models to every shared gene and computes eigenvalue shifts." },
            { label: "Explore results", detail: "View the trajectory map, summary statistics, top shifts table, and shift distribution." }
          ]}
        />

        <Card className="border-slate-700" data-testid="card-upload">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-400" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  beforeFile ? "border-green-500/50 bg-green-500/5" : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                }`}
                onClick={() => beforeRef.current?.click()}
                data-testid="dropzone-before"
              >
                <input
                  ref={beforeRef}
                  type="file"
                  accept=".csv,.tsv,.csv.gz"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setBeforeFile(e.target.files[0])}
                  data-testid="input-before-file"
                />
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-300">Before / Control</p>
                {beforeFile ? (
                  <p className="text-sm text-green-400 mt-1" data-testid="text-before-filename">{beforeFile.name}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">.csv, .tsv, .csv.gz</p>
                )}
              </div>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  afterFile ? "border-green-500/50 bg-green-500/5" : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                }`}
                onClick={() => afterRef.current?.click()}
                data-testid="dropzone-after"
              >
                <input
                  ref={afterRef}
                  type="file"
                  accept=".csv,.tsv,.csv.gz"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setAfterFile(e.target.files[0])}
                  data-testid="input-after-file"
                />
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-300">After / Treatment</p>
                {afterFile ? (
                  <p className="text-sm text-green-400 mt-1" data-testid="text-after-filename">{afterFile.name}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">.csv, .tsv, .csv.gz</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleCompare}
                disabled={!beforeFile || !afterFile || mutation.isPending}
                className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8"
                data-testid="button-compare"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <GitCompare className="h-4 w-4" />
                    Compare
                  </>
                )}
              </Button>
            </div>
            {mutation.isError && (
              <div className="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm" data-testid="error-message">
                {(mutation.error as Error).message}
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3" data-testid="summary-stats">
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white" data-testid="stat-shared-genes">{result.sharedGenes.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Shared Genes</div>
                </CardContent>
              </Card>
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white" data-testid="stat-analyzed">{result.analyzedGenes.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Analyzed</div>
                </CardContent>
              </Card>
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400" data-testid="stat-mean-abs-shift">{result.meanAbsShift.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">Mean |Shift|</div>
                </CardContent>
              </Card>
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400" data-testid="stat-mean-shift">{result.meanShift > 0 ? "+" : ""}{result.meanShift.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">Mean Shift</div>
                </CardContent>
              </Card>
              <Card className="border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-400" data-testid="stat-regime-changes">{result.regimeChanges}</div>
                  <div className="text-xs text-muted-foreground">Regime Changes</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-700" data-testid="card-trajectory-map">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-cyan-400" />
                  Trajectory Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrajectoryMap genes={result.topShifts} />
              </CardContent>
            </Card>

            <Card className="border-slate-700" data-testid="card-top-shifts">
              <CardHeader>
                <CardTitle className="text-lg">Top Shifts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-top-shifts">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <SortHeader field="gene" label="Gene" />
                        <SortHeader field="beforeEigenvalue" label="Before |λ|" />
                        <SortHeader field="afterEigenvalue" label="After |λ|" />
                        <SortHeader field="shift" label="Shift" />
                        <SortHeader field="beforeR2" label="Before R²" />
                        <SortHeader field="afterR2" label="After R²" />
                        <SortHeader field="regimeChange" label="Regime" />
                      </tr>
                    </thead>
                    <tbody>
                      {sortedShifts.map((g, idx) => (
                        <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50" data-testid={`row-shift-${idx}`}>
                          <td className="p-3 font-mono font-medium text-center">{g.gene}</td>
                          <td className="p-3 text-center font-mono">{Math.abs(g.beforeEigenvalue).toFixed(4)}</td>
                          <td className="p-3 text-center font-mono">{Math.abs(g.afterEigenvalue).toFixed(4)}</td>
                          <td className="p-3 text-center font-mono">
                            <span className={g.shift > 0 ? "text-emerald-400" : "text-red-400"}>
                              {g.shift > 0 ? "+" : ""}{g.shift.toFixed(4)}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-muted-foreground">{g.beforeR2.toFixed(3)}</td>
                          <td className="p-3 text-center font-mono text-muted-foreground">{g.afterR2.toFixed(3)}</td>
                          <td className="p-3 text-center">
                            {g.regimeChange ? (
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

            {shiftDistribution.length > 0 && (
              <Card className="border-slate-700" data-testid="card-shift-distribution">
                <CardHeader>
                  <CardTitle className="text-lg">Shift Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250} minWidth={1} minHeight={1}>
                    <BarChart data={shiftDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="center" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => v.toFixed(2)} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm shadow-xl">
                              <div className="text-slate-300">Shift: {payload[0].payload.center.toFixed(4)}</div>
                              <div className="text-cyan-400">Count: {payload[0].value}</div>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" fill="#22d3ee" radius={[2, 2, 0, 0]}>
                        {shiftDistribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry.center >= 0 ? "#22c55e" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <InsightCallout title="Interpreting the Trajectory Map">
              Arrows show how each gene's dynamical position shifts between your two conditions.
              Long arrows indicate large changes in temporal dynamics. Genes that cross the parabola
              boundary undergo a regime change — switching between oscillatory and non-oscillatory behavior.
            </InsightCallout>
          </>
        )}
      </div>
    </div>
  );
}
