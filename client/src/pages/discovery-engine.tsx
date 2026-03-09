import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea
} from "recharts";
import {
  Upload, FileUp, Activity, Loader2, AlertCircle, CheckCircle2,
  ArrowLeft, Download, Info, TrendingUp, Zap, Clock, Target,
  BarChart3, X, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp,
  Share2, Copy, Check, FolderOpen, Save
} from "lucide-react";
import { Link } from "wouter";
import HowTo from "@/components/HowTo";
import ExportReport from "@/components/ExportReport";
import { Term } from "@/components/Glossary";
import GeneTooltip from "@/components/GeneTooltip";

interface QualityCheck {
  name: string;
  passed: boolean;
  value: string;
  explanation: string;
  severity: 'info' | 'warning' | 'critical';
}

interface EdgeCaseDiagnostic {
  id: string;
  label: string;
  triggered: boolean;
  severity: 'info' | 'warning' | 'critical';
  detail: string;
}

interface ChannelResult {
  channel: string;
  unit: string;
  sampleCount: number;
  phi1: number;
  phi2: number;
  eigenvalue: number;
  r2: number;
  isComplex: boolean;
  lambda1Real: number;
  lambda1Imag: number;
  lambda2Real: number;
  lambda2Imag: number;
  halfLife: number | null;
  impliedPeriod: number | null;
  mean: number;
  std: number;
  min: number;
  max: number;
  stability: string;
  stabilityColor: string;
  ljungBoxPassed: boolean;
  ljungBoxPValue: number;
  timeSeriesPreview: number[];
  residuals: number[];
  acf: number[];
  qualityChecks?: QualityCheck[];
  edgeCaseDiagnostics?: EdgeCaseDiagnostic[];
  overallConfidence?: 'High' | 'Moderate' | 'Low' | 'Unreliable';
  confidenceColor?: string;
  confidenceScore?: number;
}

interface GearboxAnalysis {
  clockChannel: string;
  clockEigenvalue: number;
  targetChannel: string;
  targetEigenvalue: number;
  gap: number;
  gapUncertainty?: number;
  gapReliable?: boolean;
  hierarchyStatus: string;
  hierarchyColor: string;
}

interface PerGeneAnalysis {
  totalGenes: number;
  clockGenesFound: number;
  targetGenesAnalyzed: number;
  timepointCount: number;
  timepoints: number[];
  clockMeanEigenvalue: number;
  targetMeanEigenvalue: number;
  topByEigenvalue: { gene: string; eigenvalue: number; geneType: string; stability: string }[];
  bottomByEigenvalue: { gene: string; eigenvalue: number; geneType: string; stability: string }[];
}

interface DataDomainClassification {
  domain: 'biological' | 'wearable' | 'non-biological' | 'unknown';
  confidence: number;
  signals: string[];
  warning: string | null;
}

interface BiasAuditTest {
  testName: string;
  description: string;
  passed: boolean;
  verdict: string;
  details: Record<string, any>;
}

interface BiasAudit {
  summary: string;
  overallVerdict: string;
  overallColor: string;
  tests: BiasAuditTest[];
}

interface AnalysisResponse {
  detectedFormat: string;
  fileName: string;
  fileSize: number;
  totalRecords: number;
  channelsAnalyzed: number;
  results: ChannelResult[];
  gearboxAnalysis: GearboxAnalysis | null;
  dataDomain?: DataDomainClassification;
  skippedChannels?: string[];
  perGeneAnalysis?: PerGeneAnalysis;
  biasAudit?: BiasAudit | null;
  dataWarnings?: { type: string; message: string; severity: 'info' | 'warning' | 'error'; genes?: string[] }[];
  parsingValidation?: {
    formatDetected: string;
    formatConfidence: string;
    columnsFound: number;
    rowsRead: number;
    channelsExtracted: number;
    channelsAnalyzed: number;
    channelsSkipped: number;
    checks: { test: string; passed: boolean; detail: string }[];
    summary: string;
    dataReliable: boolean;
  };
  safeguards?: {
    disclaimer: string;
    contextWarning: string;
    minimumTimepoints: number;
    lowPowerChannels: string[];
    negativeResult: boolean;
  };
  metadata: {
    engine: string;
    algorithm: string;
    equation: string;
    eigenvalueEquation: string;
    reference: string;
    timestamp: string;
  };
}

function StabilityRing({ eigenvalue, size = 180, label }: { eigenvalue: number; size?: number; label?: string }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(eigenvalue, 1.2) / 1.2;
  const strokeDashoffset = circumference * (1 - progress);

  let color = '#22c55e';
  if (eigenvalue >= 0.95) color = '#dc2626';
  else if (eigenvalue >= 0.85) color = '#f97316';
  else if (eigenvalue >= 0.7) color = '#facc15';
  else if (eigenvalue >= 0.5) color = '#4ade80';

  const bgColor = `${color}20`;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
        />
        <text x={size / 2} y={size / 2 - 8} textAnchor="middle" fill={color} fontSize="28" fontWeight="bold">
          {eigenvalue.toFixed(3)}
        </text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="#94a3b8" fontSize="11">
          persistence score
        </text>
      </svg>
      {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
    </div>
  );
}

function UnitCirclePlot({ results }: { results: ChannelResult[] }) {
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const plotRadius = size / 2 - 40;

  const eigenPoints = results.flatMap(r => {
    const pts = [];
    pts.push({
      channel: r.channel,
      real: r.lambda1Real,
      imag: r.lambda1Imag,
      modulus: Math.sqrt(r.lambda1Real ** 2 + r.lambda1Imag ** 2),
      color: r.stabilityColor,
      label: r.isComplex ? `λ₁` : `λ₁`,
    });
    if (r.isComplex || Math.abs(r.lambda1Real - r.lambda2Real) > 0.001 || Math.abs(r.lambda1Imag - r.lambda2Imag) > 0.001) {
      pts.push({
        channel: r.channel,
        real: r.lambda2Real,
        imag: r.lambda2Imag,
        modulus: Math.sqrt(r.lambda2Real ** 2 + r.lambda2Imag ** 2),
        color: r.stabilityColor,
        label: `λ₂`,
      });
    }
    return pts;
  });

  const maxExtent = Math.max(1.15, ...eigenPoints.map(p => Math.max(Math.abs(p.real), Math.abs(p.imag))) ) * 1.1;
  const scale = plotRadius / maxExtent;

  const toX = (real: number) => cx + real * scale;
  const toY = (imag: number) => cy - imag * scale;

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <Card className="bg-gradient-to-r from-slate-900 to-slate-900/80 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity size={18} className="text-purple-400" />
          Unit Circle Plot
        </CardTitle>
        <CardDescription className="text-slate-400">
          Eigenvalues plotted in the complex plane. Points inside the unit circle are stable (decaying signal), on the boundary are critical, and outside are divergent. Complex conjugate pairs indicate oscillatory dynamics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible" data-testid="unit-circle-plot">
            <defs>
              <radialGradient id="uc-stable-zone" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.06" />
                <stop offset="70%" stopColor="#22c55e" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx={cx} cy={cy} r={1.0 * scale} fill="url(#uc-stable-zone)" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6" />

            <line x1={cx - plotRadius - 5} y1={cy} x2={cx + plotRadius + 5} y2={cy} stroke="#334155" strokeWidth="1" />
            <line x1={cx} y1={cy - plotRadius - 5} x2={cx} y2={cy + plotRadius + 5} stroke="#334155" strokeWidth="1" />

            {[-0.5, 0.5, -1, 1].filter(v => Math.abs(v) * scale <= plotRadius).map(v => (
              <g key={`tick-r-${v}`}>
                <line x1={toX(v)} y1={cy - 3} x2={toX(v)} y2={cy + 3} stroke="#475569" strokeWidth="1" />
                <text x={toX(v)} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize="9">{v}</text>
              </g>
            ))}
            {[-0.5, 0.5, -1, 1].filter(v => Math.abs(v) * scale <= plotRadius).map(v => (
              <g key={`tick-i-${v}`}>
                <line x1={cx - 3} y1={toY(v)} x2={cx + 3} y2={toY(v)} stroke="#475569" strokeWidth="1" />
                <text x={cx - 10} y={toY(v) + 3} textAnchor="end" fill="#64748b" fontSize="9">{v}i</text>
              </g>
            ))}

            <text x={cx + plotRadius + 8} y={cy + 4} fill="#64748b" fontSize="10" textAnchor="start">Re</text>
            <text x={cx + 4} y={cy - plotRadius - 8} fill="#64748b" fontSize="10" textAnchor="start">Im</text>

            {[0.25, 0.5, 0.75].filter(r => r * scale <= plotRadius).map(r => (
              <circle key={`grid-${r}`} cx={cx} cy={cy} r={r * scale} fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 4" />
            ))}

            {eigenPoints.map((pt, i) => {
              const px = toX(pt.real);
              const py = toY(pt.imag);
              const isHov = hovered === i;
              return (
                <g key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {isHov && <circle cx={px} cy={py} r={12} fill={pt.color} opacity="0.15" />}
                  <circle
                    cx={px} cy={py}
                    r={isHov ? 7 : 5}
                    fill={pt.color}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    opacity={hovered !== null && !isHov ? 0.4 : 1}
                    style={{ transition: 'r 0.15s, opacity 0.15s' }}
                  />
                  {isHov && (
                    <g>
                      <rect x={px + 10} y={py - 32} width={Math.max(120, pt.channel.length * 7 + 20)} height={42} rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x={px + 16} y={py - 18} fill="#e2e8f0" fontSize="11" fontWeight="600">{pt.channel}</text>
                      <text x={px + 16} y={py - 4} fill="#94a3b8" fontSize="10">
                        {pt.real.toFixed(3)}{pt.imag >= 0 ? ' + ' : ' − '}{Math.abs(pt.imag).toFixed(3)}i
                      </text>
                      <text x={px + 16} y={py + 8} fill="#94a3b8" fontSize="9">|λ| = {pt.modulus.toFixed(4)}</text>
                    </g>
                  )}
                </g>
              );
            })}

            <text x={cx + 1.0 * scale + 4} y={cy - 6} fill="#22c55e" fontSize="9" opacity="0.7">|λ|=1</text>
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.stabilityColor }} />
              <span>{r.channel}</span>
              <span className="text-slate-500 font-mono">|λ|={r.eigenvalue.toFixed(3)}</span>
              {r.halfLife != null && <span className="text-emerald-500 font-mono">t½={r.halfLife.toFixed(1)}</span>}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 mt-3 text-center">
          Dashed green circle = unit circle boundary (|λ| = 1). Points inside: stable, decaying dynamics. Complex conjugate pairs appear mirrored across the real axis.
        </p>
      </CardContent>
    </Card>
  );
}

function StateSpacePlot({ results }: { results: ChannelResult[] }) {
  const data = results.map(r => ({
    name: r.channel,
    phi1: r.phi1,
    phi2: r.phi2,
    eigenvalue: r.eigenvalue,
    stability: r.stability,
    color: r.stabilityColor,
    size: 200
  }));

  const stationarityBottom = Array.from({ length: 41 }, (_, i) => {
    const b1 = -2 + i * 0.1;
    return { x: b1, y: -1 };
  });
  const stationarityRight = Array.from({ length: 21 }, (_, i) => {
    const b1 = -2 + i * 0.2;
    return { x: b1, y: 1 - b1 };
  });
  const stationarityLeft = Array.from({ length: 21 }, (_, i) => {
    const b1 = -2 + i * 0.2;
    return { x: b1, y: 1 + b1 };
  });
  const oscillatoryParabola = Array.from({ length: 41 }, (_, i) => {
    const b1 = -2 + i * 0.1;
    return { x: b1, y: -(b1 * b1) / 4 };
  });

  return (
    <ResponsiveContainer width="100%" height={340} minWidth={1} minHeight={1}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis type="number" dataKey="x" name="β₁" domain={[-2.2, 2.2]}
          tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'β₁ (phi1)', position: 'bottom', fill: '#64748b', fontSize: 11, offset: 15 }} />
        <YAxis type="number" dataKey="y" name="β₂" domain={[-1.3, 1.2]}
          tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'β₂ (phi2)', angle: -90, position: 'left', fill: '#64748b', fontSize: 11 }} />
        <ZAxis type="number" dataKey="size" range={[200, 200]} />

        <Scatter data={stationarityBottom} fill="none" line={{ stroke: '#475569', strokeWidth: 1.5, strokeDasharray: '6 3' }} shape={() => <circle r={0} />} legendType="none" />
        <Scatter data={stationarityRight} fill="none" line={{ stroke: '#475569', strokeWidth: 1.5, strokeDasharray: '6 3' }} shape={() => <circle r={0} />} legendType="none" />
        <Scatter data={stationarityLeft} fill="none" line={{ stroke: '#475569', strokeWidth: 1.5, strokeDasharray: '6 3' }} shape={() => <circle r={0} />} legendType="none" />
        <Scatter data={oscillatoryParabola} fill="none" line={{ stroke: '#eab308', strokeWidth: 1.5, strokeDasharray: '4 2' }} shape={() => <circle r={0} />} legendType="none" />

        <ReferenceLine y={0} stroke="#47556950" strokeDasharray="3 3" />
        <ReferenceLine x={0} stroke="#47556950" strokeDasharray="3 3" />
        <Tooltip content={({ payload }) => {
          if (!payload || !payload.length) return null;
          const d = payload[0].payload;
          if (!d.name) return null;
          return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs">
              <div className="font-bold text-white mb-1">{d.name}</div>
              <div className="text-slate-300">β₁ = {d.x?.toFixed(4)}</div>
              <div className="text-slate-300">β₂ = {d.y?.toFixed(4)}</div>
              <div style={{ color: d.color }}>|λ| = {d.eigenvalue?.toFixed(4)}</div>
              <div style={{ color: d.color }}>{d.stability}</div>
            </div>
          );
        }} />
        <Scatter data={data.map(d => ({ ...d, x: d.phi1, y: d.phi2 }))} fill="#22d3ee">
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} stroke={entry.color} strokeWidth={2} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

const FORMAT_INFO: Record<string, { label: string; description: string; example: string }> = {
  generic: {
    label: 'Generic CSV',
    description: 'Any CSV with numeric time-series columns — gene expression, lab measurements, or custom data',
    example: 'time,Gene_A,Gene_B\n0,10.5,20.3\n4,11.2,19.8\n8,9.8,21.1'
  },
  gene_expression: {
    label: 'Gene Expression',
    description: 'Time-course expression data with genes as columns and timepoints as rows',
    example: 'timepoint,Bmal1,Per2,Cry1\n0,8.2,3.1,5.4\n4,6.7,7.8,4.2\n8,4.1,9.5,3.8'
  },
  dexcom: {
    label: 'Dexcom CGM',
    description: 'Continuous Glucose Monitor data export',
    example: 'Timestamp,Glucose Value (mg/dL)\n2025-01-01 00:00,95\n2025-01-01 00:05,97'
  },
  oura: {
    label: 'Oura Ring',
    description: 'Sleep/readiness data with HRV and temperature',
    example: 'date,hrv,temperature_deviation\n2025-01-01,45,0.2\n2025-01-02,42,-0.1'
  },
  gene_expression_matrix: {
    label: 'Gene Expression Matrix',
    description: 'Circadian time-course data — genes as rows, time points as columns. Per-gene AR(2) eigenvalue analysis.',
    example: 'Gene,CT18,CT20,CT22,CT24,CT26,CT28\nPer2,8.2,9.1,7.3,5.4,4.2,6.8\nBmal1,5.1,4.2,3.8,6.7,8.2,7.1'
  },
  heartrate: {
    label: 'Heart Rate',
    description: 'Any device with heart rate time series',
    example: 'timestamp,heart_rate\n2025-01-01 00:00,72\n2025-01-01 00:05,74'
  }
};

export default function DiscoveryEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const name = f.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.tsv') && !name.endsWith('.txt')) {
      setError(`Invalid file type: "${f.name}". Please upload a CSV, TSV, or TXT file.`);
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File too large (max 50 MB). Please use a smaller file.');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.txt') || f.name.endsWith('.tsv'))) {
      handleFile(f);
    } else {
      setError("Please upload a CSV file");
    }
  }, [handleFile]);

  const runAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', 'auto');

      const response = await fetch('/api/analyze/wearable', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze file');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    setSharing(true);
    try {
      const res = await fetch('/api/shared-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisData: result,
          fileName: result.fileName,
          detectedFormat: result.detectedFormat,
        }),
      });
      if (!res.ok) throw new Error('Failed to create share link');
      const data = await res.json();
      const url = `${window.location.origin}/shared/${data.id}`;
      setShareUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to share analysis');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToReports = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const pga = result.perGeneAnalysis;
      const isGeneMatrix = !!pga;
      const genes = pga
        ? (pga.topByEigenvalue || []).concat(pga.bottomByEigenvalue || [])
        : result.results.map((r: any) => ({
            gene: r.channel,
            eigenvalue: r.eigenvalue,
            phi1: r.phi1,
            phi2: r.phi2,
            r2: r.r2,
            stability: r.stability,
            geneType: 'other',
          }));

      const payload = {
        genes,
        fileName: result.fileName,
        detectedFormat: result.detectedFormat,
        gearboxAnalysis: result.gearboxAnalysis || null,
        perGeneAnalysis: pga ? {
          totalGenes: pga.totalGenes,
          clockGenesFound: pga.clockGenesFound,
          clockMeanEigenvalue: pga.clockMeanEigenvalue,
          targetMeanEigenvalue: pga.targetMeanEigenvalue,
        } : null,
      };

      const summary = pga
        ? `${pga.totalGenes} genes, ${pga.clockGenesFound} clock genes. Clock |λ| = ${pga.clockMeanEigenvalue?.toFixed(4) || 'N/A'}, Target |λ| = ${pga.targetMeanEigenvalue?.toFixed(4) || 'N/A'}`
        : `${result.channelsAnalyzed} channels analyzed from ${result.detectedFormat} data`;

      const res = await fetch('/api/saved-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Discovery Engine — ${result.fileName || 'Analysis'}`,
          sourcePage: 'discovery-engine',
          reportType: 'gene_eigenvalue_list',
          summary,
          geneCount: pga ? pga.totalGenes : result.channelsAnalyzed,
          payload,
        }),
      });
      if (!res.ok) throw new Error('Failed to save report');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const loadRosenData = async (variant: 'topflash' | 'bcat') => {
    setError(null);
    setResult(null);
    try {
      const endpoint = variant === 'bcat' ? '/api/sample-data/rosen2026-bcat' : '/api/sample-data/rosen2026';
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to load Rosen et al. data');
      const blob = await response.blob();
      const filename = variant === 'bcat' 
        ? 'Rosen2026_BetaCatenin_AllConditions.csv' 
        : 'Rosen2026_Wnt_AntiResonance_AllConditions.csv';
      const f = new File([blob], filename, { type: 'text/csv' });
      handleFile(f);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample data');
    }
  };

  const [loadingDataset, setLoadingDataset] = useState<string | null>(null);
  const loadDataset = async (name: string, filename: string) => {
    setError(null);
    setResult(null);
    setLoadingDataset(name);
    try {
      const response = await fetch(`/api/sample-data/dataset/${name}`);
      if (!response.ok) throw new Error(`Failed to load dataset: ${name}`);
      const blob = await response.blob();
      const f = new File([blob], filename, { type: 'text/csv' });
      handleFile(f);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset');
    } finally {
      setLoadingDataset(null);
    }
  };

  const generateSampleCSV = (type: string) => {
    let csv = '';
    if (type === 'glucose') {
      csv = 'Timestamp,Glucose Value (mg/dL)\n';
      const baseGlucose = 95;
      for (let i = 0; i < 288; i++) {
        const hour = (i * 5 / 60) % 24;
        const circadian = 15 * Math.sin(2 * Math.PI * (hour - 6) / 24);
        const meal = (hour >= 7 && hour < 9) || (hour >= 12 && hour < 14) || (hour >= 18 && hour < 20) ? 12 : 0;
        const noise = (Math.random() - 0.5) * 8;
        const glucose = Math.round((baseGlucose + circadian + meal + noise) * 10) / 10;
        const date = new Date(2025, 0, 1, Math.floor(i * 5 / 60), (i * 5) % 60);
        csv += `${date.toISOString()},${glucose}\n`;
      }
    } else if (type === 'hrv') {
      csv = 'date,hrv_rmssd,temperature_deviation\n';
      for (let d = 0; d < 30; d++) {
        const date = new Date(2025, 0, d + 1);
        const hrv = 42 + 8 * Math.sin(2 * Math.PI * d / 7) + (Math.random() - 0.5) * 10;
        const temp = 0.1 * Math.sin(2 * Math.PI * d / 28) + (Math.random() - 0.5) * 0.3;
        csv += `${date.toISOString().split('T')[0]},${hrv.toFixed(1)},${temp.toFixed(2)}\n`;
      }
    } else {
      csv = 'time,signal_A,signal_B\n';
      for (let t = 0; t < 100; t++) {
        const a = 5 * Math.sin(2 * Math.PI * t / 24) + (Math.random() - 0.5) * 2;
        const b = 3 * Math.cos(2 * Math.PI * t / 12) + 0.7 * (t > 0 ? 3 * Math.cos(2 * Math.PI * (t - 1) / 12) : 0) + (Math.random() - 0.5) * 1.5;
        csv += `${t},${a.toFixed(3)},${b.toFixed(3)}\n`;
      }
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const f = new File([blob], type === 'glucose' ? 'sample_glucose.csv' : type === 'hrv' ? 'sample_oura.csv' : 'sample_generic.csv', { type: 'text/csv' });
    handleFile(f);
  };

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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent" data-testid="text-page-title">
              PAR(2) Discovery Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1">Upload any CSV time-series data for real-time AR(2) eigenvalue analysis</p>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 mt-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong className="text-white">What you can do:</strong> Upload any CSV with time-series data and get AR(2) eigenvalue analysis in seconds. Results show each channel's persistence score, diagnostic checks, and a shareable link. Download or share your results for collaboration.
              </p>
            </div>
          </div>
          <Link href="/validation-suite">
            <Button variant="outline" size="sm" className="gap-2 border-amber-700/50 text-amber-400 hover:bg-amber-900/20" data-testid="link-validation-suite">
              <ShieldCheck size={14} />
              Stress Tests
            </Button>
          </Link>
          <Badge variant="outline" className="border-cyan-600/50 text-cyan-400">
            <Activity size={12} className="mr-1" /> Live Analysis
          </Badge>
        </div>

        <HowTo
          title="Discovery Engine"
          summary="Upload any CSV time-series data — gene expression profiles, lab measurements, wearable exports, or custom signals — and run AR(2) eigenvalue analysis. The engine detects channels, fits AR(2) models, computes eigenvalues, and provides full quality diagnostics."
          steps={[
            { label: "Upload a CSV", detail: "Drag and drop or click to upload a CSV file with time-series columns. Each numeric column is treated as a channel." },
            { label: "Run analysis", detail: "The engine fits AR(2) models to each channel and reports eigenvalues, R², and stability." },
            { label: "Review diagnostics", detail: "Edge-case checks flag issues like trends, small samples, or non-stationarity that might affect results." },
            { label: "Share results", detail: "Generate a unique shareable link so others can view your analysis." }
          ]}
        />

        {!result ? (
          <div className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload size={18} className="text-cyan-400" />
                  Upload Your Data
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Upload any CSV with numeric time-series columns — gene expression, lab data, wearable exports, or custom signals. The engine auto-detects the format.
                </CardDescription>
                <div className="flex items-start gap-2 mt-2 rounded-md bg-blue-500/5 border border-blue-500/20 px-3 py-2">
                  <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-400">
                    <span className="text-blue-400 font-medium">Data privacy:</span> Your uploaded file is processed in memory and is not stored on our servers. Only analysis results (gene names, eigenvalues, statistics) are saved to enable sharing and comparison features.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                    dragOver ? 'border-cyan-400 bg-cyan-400/5' : file ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="dropzone-upload"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.tsv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    data-testid="input-file"
                  />
                  {file ? (
                    <div className="space-y-3">
                      <CheckCircle2 size={40} className="text-green-400 mx-auto" />
                      <div>
                        <p className="font-medium text-white" data-testid="text-filename">{file.name}</p>
                        <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button
                        onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300"
                        data-testid="button-clear-file"
                      >
                        <X size={14} className="mr-1" /> Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <FileUp size={40} className="text-slate-400 mx-auto" />
                      <div>
                        <p className="font-medium text-slate-300">Drop your CSV file here, or click to browse</p>
                        <p className="text-sm text-slate-400 mt-1">Supports gene expression time series, lab measurements, wearable exports, or any CSV with numeric columns</p>
                      </div>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={runAnalysis}
                      disabled={analyzing}
                      className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8"
                      data-testid="button-analyze"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          Run AR(2) Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle size={16} />
                    <AlertTitle>Analysis Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-slate-300">
                  <Download size={14} className="text-amber-400" />
                  Try with Sample Data
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Load real experimental datasets from published studies or synthetic examples
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">Wnt Signaling (Rosen et al. 2026)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-emerald-700/50 hover:bg-emerald-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadRosenData('topflash')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-rosen-tf"
                    >
                      <span className="font-medium text-emerald-400">TopFlash + Beta-Catenin (All Conditions)</span>
                      <span className="text-xs text-slate-400 leading-snug">14 channels: 7 TF + 7 bcat across NL, 6hr, 9hr, 15hr, 18hr, 21hr, 24hr Wnt pulses. 231 timepoints.</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-emerald-700/50 hover:bg-emerald-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadRosenData('bcat')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-rosen-bcat"
                    >
                      <span className="font-medium text-emerald-400">Beta-Catenin Only</span>
                      <span className="text-xs text-slate-400 leading-snug">7 conditions of beta-catenin protein dynamics. Upstream signal with wide |λ| range (0.91–0.997).</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">Circadian Gene Expression (Genome-Wide)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-blue-700/50 hover:bg-blue-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('mouse-liver', 'GSE54650_Liver_circadian.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-mouse-liver"
                    >
                      <span className="font-medium text-blue-400">{loadingDataset === 'mouse-liver' ? 'Loading...' : 'Mouse Liver (GSE54650)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Hughes et al. Circadian Atlas. ~21K genes, 24 timepoints across 2 circadian cycles. The canonical dataset.</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-blue-700/50 hover:bg-blue-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('human-blood', 'GSE113883_Human_WholeBlood.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-human-blood"
                    >
                      <span className="font-medium text-blue-400">{loadingDataset === 'human-blood' ? 'Loading...' : 'Human Blood (GSE113883)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Whole blood circadian transcriptome. ~58K transcripts, 15 timepoints over 29 hours. Human validation.</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-blue-700/50 hover:bg-blue-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('baboon-liver', 'GSE98965_baboon_FPKM.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-baboon-liver"
                    >
                      <span className="font-medium text-blue-400">{loadingDataset === 'baboon-liver' ? 'Loading...' : 'Baboon Liver (GSE98965)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Primate liver circadian expression. ~29K genes. Cross-species hierarchy validation.</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider mb-2">Disease & Disruption</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-rose-700/50 hover:bg-rose-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('neuroblastoma-myc-on', 'GSE221103_Neuroblastoma_MYC_ON.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-neuro-myc-on"
                    >
                      <span className="font-medium text-rose-400">{loadingDataset === 'neuroblastoma-myc-on' ? 'Loading...' : 'Neuroblastoma MYC-ON (GSE221103)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Cancer cells with MYC oncogene active. ~60K genes, 14 timepoints. Tests circadian disruption in cancer.</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-rose-700/50 hover:bg-rose-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('neuroblastoma-myc-off', 'GSE221103_Neuroblastoma_MYC_OFF.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-neuro-myc-off"
                    >
                      <span className="font-medium text-rose-400">{loadingDataset === 'neuroblastoma-myc-off' ? 'Loading...' : 'Neuroblastoma MYC-OFF (GSE221103)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Same cells with MYC silenced. Compare against MYC-ON to see if circadian hierarchy recovers.</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-rose-700/50 hover:bg-rose-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('organoid-wt', 'GSE157357_Organoid_WT-WT_circadian.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-organoid-wt"
                    >
                      <span className="font-medium text-rose-400">{loadingDataset === 'organoid-wt' ? 'Loading...' : 'Intestinal Organoid WT (GSE157357)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Wild-type organoid circadian data. ~15K genes, 22 timepoints. Baseline for Apc/Bmal knockout comparisons.</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">Sleep & Human Physiology</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-amber-700/50 hover:bg-amber-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('sleep-restriction', 'GSE39445_Blood_SleepRestriction_circadian.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-sleep-restrict"
                    >
                      <span className="font-medium text-amber-400">{loadingDataset === 'sleep-restriction' ? 'Loading...' : 'Sleep Restriction (GSE39445)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Human blood after sleep restriction. ~19K genes, 10 timepoints. Tests circadian disruption from sleep loss.</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-amber-700/50 hover:bg-amber-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('sleep-sufficient', 'GSE39445_Blood_SufficientSleep_circadian.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-sleep-sufficient"
                    >
                      <span className="font-medium text-amber-400">{loadingDataset === 'sleep-sufficient' ? 'Loading...' : 'Sufficient Sleep (GSE39445)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Same subjects with adequate sleep. Compare against restriction to quantify circadian resilience.</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-2">Non-Circadian Validation</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-teal-700/50 hover:bg-teal-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('rabani-lps-curated', 'Rabani2014_DendriticCell_LPS_Curated.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-rabani-curated"
                    >
                      <span className="font-medium text-teal-400">{loadingDataset === 'rabani-lps-curated' ? 'Loading...' : 'Rabani 2014 DC LPS — Curated (39 genes)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Dendritic cell immune response. Fast responders (Il1b, Ptgs2) vs sustained effectors (Ifit1, Stat1) vs housekeeping. Tests regulator→effector hierarchy beyond circadian.</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-teal-700/50 hover:bg-teal-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('rabani-lps-full', 'Rabani2014_DendriticCell_LPS_Full.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-rabani-full"
                    >
                      <span className="font-medium text-teal-400">{loadingDataset === 'rabani-lps-full' ? 'Loading...' : 'Rabani 2014 DC LPS — Full (3,147 genes)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Genome-wide innate immune response time series (0-12h post-LPS). Tests AR(2) persistence hierarchy across entire transcriptome in non-circadian context.</span>
                    </Button>
                  </div>

                  <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-2">Cross-Kingdom & Proteomics</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-violet-700/50 hover:bg-violet-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('yeast-metabolic', 'GSE3431_yeast_metabolic_cycle.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-yeast"
                    >
                      <span className="font-medium text-violet-400">{loadingDataset === 'yeast-metabolic' ? 'Loading...' : 'Yeast Metabolic Cycle (GSE3431)'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Tu et al. ~6.7K genes with ultradian ~4-5hr metabolic oscillation. Non-circadian periodic test case.</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-violet-700/50 hover:bg-violet-900/20 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => loadDataset('mouse-liver-proteomics', 'mouse_liver_circadian_proteomics.csv')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-proteomics"
                    >
                      <span className="font-medium text-violet-400">{loadingDataset === 'mouse-liver-proteomics' ? 'Loading...' : 'Mouse Liver Proteomics'}</span>
                      <span className="text-xs text-slate-400 leading-snug">Circadian protein-level expression for 7 core clock genes. 16 timepoints. Protein vs mRNA persistence.</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 border-slate-700 hover:bg-slate-800 flex flex-col items-start gap-1 text-left whitespace-normal"
                      onClick={() => generateSampleCSV('generic')}
                      disabled={!!loadingDataset}
                      data-testid="button-sample-generic"
                    >
                      <span className="font-medium text-cyan-400">Synthetic Multi-Channel</span>
                      <span className="text-xs text-slate-400 leading-snug">Two synthetic oscillatory signals with different periods. Quick demo of multi-channel AR(2) analysis.</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-slate-300">
                  <Info size={14} className="text-blue-400" />
                  Supported Formats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(FORMAT_INFO).map(([key, info]) => (
                    <div key={key} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs border-slate-600">{info.label}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{info.description}</p>
                      <pre className="text-[10px] text-slate-400 bg-slate-900/50 rounded p-2 overflow-x-auto">{info.example}</pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Analysis Complete</Badge>
                <span className="text-sm text-slate-400">
                  {result.fileName} | {result.totalRecords} {result.detectedFormat === 'gene_expression_matrix' ? 'genes' : 'records'} | Format: {FORMAT_INFO[result.detectedFormat]?.label || result.detectedFormat}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-700 text-green-400 hover:bg-green-900/30"
                  onClick={async () => {
                    if (!result) return;
                    const reportLines: string[] = [];
                    reportLines.push('PAR(2) Discovery Engine - Analysis Report');
                    reportLines.push('='.repeat(50));
                    reportLines.push('');
                    reportLines.push('DISCLAIMER: These results are for hypothesis generation only.');
                    reportLines.push('AR(2) eigenvalue analysis identifies temporal persistence patterns');
                    reportLines.push('but does not establish causation or clinical utility without');
                    reportLines.push('independent validation. Eigenvalue interpretation is context-');
                    reportLines.push('dependent across organisms, tissues, and conditions.');
                    reportLines.push('');
                    reportLines.push('='.repeat(50));
                    reportLines.push(`File: ${result.fileName}`);
                    reportLines.push(`Records: ${result.totalRecords}`);
                    reportLines.push(`Format: ${FORMAT_INFO[result.detectedFormat]?.label || result.detectedFormat}`);
                    reportLines.push(`Date: ${new Date().toLocaleString()}`);
                    if (result.skippedChannels && result.skippedChannels.length > 0) {
                      reportLines.push(`Skipped Channels (< 6 timepoints): ${result.skippedChannels.join(', ')}`);
                    }
                    reportLines.push('');
                    reportLines.push('CHANNEL RESULTS');
                    reportLines.push('-'.repeat(50));
                    for (const ch of result.results) {
                      reportLines.push('');
                      reportLines.push(`Channel: ${ch.channel} (${ch.unit})`);
                      reportLines.push(`  Samples: ${ch.sampleCount}`);
                      reportLines.push(`  phi1 (β₁): ${ch.phi1.toFixed(6)}`);
                      reportLines.push(`  phi2 (β₂): ${ch.phi2.toFixed(6)}`);
                      reportLines.push(`  Eigenvalue |λ|: ${ch.eigenvalue.toFixed(6)}`);
                      reportLines.push(`  R²: ${ch.r2.toFixed(6)}`);
                      reportLines.push(`  Ljung-Box p-value: ${ch.ljungBoxPValue.toFixed(6)} (${ch.ljungBoxPassed ? 'PASS - residuals are white noise' : 'FAIL - residuals have structure'})`);
                      const eig = ch.eigenvalue;
                      const zone = eig < 0.5 ? 'Low Persistence (Resilient)' : eig < 0.8 ? 'Moderate Persistence' : eig < 0.95 ? 'High Persistence' : 'Near-Critical';
                      reportLines.push(`  Persistence Zone: ${zone} (exploratory classification, not clinically validated)`);
                      reportLines.push(`  Stability: ${ch.stability}`);
                      if (ch.halfLife != null) reportLines.push(`  Half-Life: ${ch.halfLife.toFixed(1)} time steps`);
                      if (ch.impliedPeriod) reportLines.push(`  Implied Period: ${ch.impliedPeriod.toFixed(1)} time units`);
                      reportLines.push(`  Mean: ${ch.mean.toFixed(4)}, Std: ${ch.std.toFixed(4)}, Min: ${ch.min.toFixed(4)}, Max: ${ch.max.toFixed(4)}`);
                      if (ch.overallConfidence) {
                        reportLines.push(`  Confidence: ${ch.overallConfidence} (score: ${ch.confidenceScore ?? 'N/A'}/100)`);
                      }
                      const triggered = (ch.edgeCaseDiagnostics || []).filter(d => d.triggered);
                      if (triggered.length > 0) {
                        reportLines.push(`  ⚠ EDGE CASE WARNINGS (${triggered.length}):`);
                        for (const d of triggered) {
                          reportLines.push(`    [${d.severity.toUpperCase()}] ${d.label}: ${d.detail}`);
                        }
                      }
                    }
                    if (result.gearboxAnalysis) {
                      reportLines.push('');
                      reportLines.push('GEARBOX HIERARCHY ANALYSIS');
                      reportLines.push('-'.repeat(50));
                      reportLines.push(`  Clock Proxy: ${result.gearboxAnalysis.clockChannel} (|λ| = ${result.gearboxAnalysis.clockEigenvalue.toFixed(4)})`);
                      reportLines.push(`  Target Proxy: ${result.gearboxAnalysis.targetChannel} (|λ| = ${result.gearboxAnalysis.targetEigenvalue.toFixed(4)})`);
                      reportLines.push(`  Gap (Target - Clock): ${result.gearboxAnalysis.gap.toFixed(4)}`);
                      if (result.gearboxAnalysis.gapUncertainty != null) {
                        reportLines.push(`  Gap Uncertainty: ±${result.gearboxAnalysis.gapUncertainty.toFixed(4)}`);
                        reportLines.push(`  Gap Reliable: ${result.gearboxAnalysis.gapReliable ? 'YES — gap exceeds noise band' : 'NO — gap is within noise band, hierarchy call is uncertain'}`);
                      }
                      reportLines.push(`  Hierarchy Status: ${result.gearboxAnalysis.hierarchyStatus}`);
                    }

                    try {
                      const stressRes = await fetch('/api/stress-tests/run');
                      if (stressRes.ok) {
                        const stress = await stressRes.json();
                        const num = (v: any, d = 4) => typeof v === 'number' ? v.toFixed(d) : 'N/A';
                        reportLines.push('');
                        reportLines.push('');
                        reportLines.push('ENGINE VALIDATION & STRESS TEST RESULTS');
                        reportLines.push('='.repeat(50));
                        reportLines.push(`Overall Verdict: ${stress.overallVerdict || 'UNKNOWN'}`);
                        reportLines.push(`Download Timestamp: ${new Date().toISOString()}`);

                        if (stress.syntheticTests?.tests) {
                          reportLines.push('');
                          reportLines.push('SYNTHETIC ROUND-TRIP TESTS');
                          reportLines.push('-'.repeat(50));
                          const passed = stress.syntheticTests.tests.filter((t: any) => t.passed).length;
                          reportLines.push(`Pass Rate: ${stress.syntheticTests.passRate ?? 'N/A'}% (${passed}/${stress.syntheticTests.tests.length})`);
                          reportLines.push(`Mean Absolute Error: ${stress.syntheticTests.meanAbsError ?? 'N/A'}`);
                          for (const t of stress.syntheticTests.tests) {
                            reportLines.push(`  ${t.passed ? 'PASS' : 'FAIL'} | ${t.name || 'unnamed'} | True |λ|=${num(t.trueEigenvalue)}, Recovered=${num(t.recoveredEigenvalue)}, Error=${num(t.eigenvalueError)}`);
                          }
                        }

                        if (stress.referenceComparison?.tests) {
                          reportLines.push('');
                          reportLines.push('REFERENCE COMPARISON');
                          reportLines.push('-'.repeat(50));
                          reportLines.push(`Pass Rate: ${stress.referenceComparison.passRate ?? 'N/A'}%`);
                          for (const t of stress.referenceComparison.tests) {
                            reportLines.push(`  ${t.passed ? 'PASS' : 'FAIL'} | ${t.name || 'unnamed'} | Ours=${num(t.ourValue)}, Ref=${num(t.referenceValue)}, Error=${num(t.error)}`);
                          }
                        }

                        if (stress.sensitivityAnalysis) {
                          reportLines.push('');
                          reportLines.push('SENSITIVITY ANALYSIS');
                          reportLines.push('-'.repeat(50));
                          const sa = stress.sensitivityAnalysis;
                          if (sa.noiseSensitivity?.values) {
                            reportLines.push('Noise Sensitivity (σ → recovered |λ|, avg over 10 trials):');
                            for (let i = 0; i < sa.noiseSensitivity.values.length; i++) {
                              reportLines.push(`  σ=${sa.noiseSensitivity.values[i]} → |λ|=${num(sa.noiseSensitivity.recoveredEigenvalues?.[i])}, error=${num(sa.noiseSensitivity.errors?.[i])}`);
                            }
                          }
                          if (sa.sampleSizeSensitivity?.values) {
                            reportLines.push('Sample Size Sensitivity (n → recovered |λ|, avg over 10 trials):');
                            for (let i = 0; i < sa.sampleSizeSensitivity.values.length; i++) {
                              reportLines.push(`  n=${sa.sampleSizeSensitivity.values[i]} → |λ|=${num(sa.sampleSizeSensitivity.recoveredEigenvalues?.[i])}, error=${num(sa.sampleSizeSensitivity.errors?.[i])}`);
                            }
                          }
                          if (sa.missingDataSensitivity?.values) {
                            reportLines.push('Missing Data Sensitivity (% missing → recovered |λ|):');
                            for (let i = 0; i < sa.missingDataSensitivity.values.length; i++) {
                              reportLines.push(`  ${sa.missingDataSensitivity.values[i]}% → |λ|=${num(sa.missingDataSensitivity.recoveredEigenvalues?.[i])}, error=${num(sa.missingDataSensitivity.errors?.[i])}`);
                            }
                          }
                        }

                        if (stress.distributionTest?.separation) {
                          reportLines.push('');
                          reportLines.push('DISTRIBUTION SEPARATION TEST');
                          reportLines.push('-'.repeat(50));
                          const sep = stress.distributionTest.separation;
                          reportLines.push(`White Noise mean |λ|: ${num(sep.noiseMean)} (std: ${num(sep.noiseStd)})`);
                          reportLines.push(`Healthy mean |λ|: ${num(sep.healthyMean)} (std: ${num(sep.healthyStd)})`);
                          reportLines.push(`Stressed mean |λ|: ${num(sep.stressedMean)} (std: ${num(sep.stressedStd)})`);
                          reportLines.push(`Clusters Separated: ${sep.separated ? 'YES' : 'NO'}`);
                        }
                      } else {
                        reportLines.push('');
                        reportLines.push('ENGINE VALIDATION: Stress tests unavailable (server returned an error).');
                      }
                    } catch (e) {
                      reportLines.push('');
                      reportLines.push('ENGINE VALIDATION: Stress tests could not be loaded at download time.');
                    }

                    reportLines.push('');
                    reportLines.push('='.repeat(50));
                    reportLines.push('Generated by PAR(2) Discovery Engine');
                    reportLines.push('AR(2) model: y(t) = β₁·y(t-1) + β₂·y(t-2) + ε');

                    const csvLines: string[] = [];
                    csvLines.push('Channel,Unit,Samples,phi1,phi2,Eigenvalue,R_Squared,LjungBox_pValue,LjungBox_Pass,Clinical_Zone,Stability,Mean,Std,Min,Max');
                    for (const ch of result.results) {
                      const eig = ch.eigenvalue;
                      const zone = eig < 0.5 ? 'Healthy' : eig < 0.8 ? 'Moderate' : eig < 0.95 ? 'High' : 'Critical';
                      csvLines.push(`${ch.channel},${ch.unit},${ch.sampleCount},${ch.phi1.toFixed(6)},${ch.phi2.toFixed(6)},${eig.toFixed(6)},${ch.r2.toFixed(6)},${ch.ljungBoxPValue.toFixed(6)},${ch.ljungBoxPassed},${zone},${ch.stability},${ch.mean.toFixed(4)},${ch.std.toFixed(4)},${ch.min.toFixed(4)},${ch.max.toFixed(4)}`);
                    }

                    const fullReport = reportLines.join('\n') + '\n\n--- CSV DATA ---\n' + csvLines.join('\n');
                    const blob = new Blob([fullReport], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `PAR2_Analysis_${result.fileName.replace(/\.[^.]+$/, '')}_${new Date().toISOString().slice(0, 10)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  data-testid="button-download-results"
                >
                  <Download size={14} className="mr-1" />
                  Download Results
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300"
                  onClick={handleShare}
                  disabled={sharing}
                  data-testid="button-share-analysis"
                >
                  {sharing ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Share2 size={14} className="mr-1" />}
                  {sharing ? 'Sharing...' : 'Share'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={saved ? "border-emerald-700 text-emerald-400" : "border-slate-700 text-slate-300"}
                  onClick={handleSaveToReports}
                  disabled={saving || saved}
                  data-testid="button-save-to-reports"
                >
                  {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : saved ? <Check size={14} className="mr-1" /> : <Save size={14} className="mr-1" />}
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save to Reports'}
                </Button>
                <ExportReport
                  title={`PAR(2) Discovery Engine — ${result.fileName || 'Analysis'}`}
                  subtitle={`Format: ${result.detectedFormat} | ${result.channelsAnalyzed} channels | ${result.totalRecords} records | Generated ${new Date().toLocaleDateString()}`}
                  sections={[
                    ...(result.perGeneAnalysis ? [
                      { heading: 'Gene Expression Matrix Summary', content: { type: 'stats' as const, items: [
                        { label: 'Total Genes', value: result.perGeneAnalysis.totalGenes },
                        { label: 'Clock Genes Found', value: result.perGeneAnalysis.clockGenesFound },
                        { label: 'Time Points', value: result.perGeneAnalysis.timepointCount },
                        { label: 'Clock Mean |λ|', value: result.perGeneAnalysis.clockMeanEigenvalue?.toFixed(4) || 'N/A' },
                        { label: 'Target Mean |λ|', value: result.perGeneAnalysis.targetMeanEigenvalue?.toFixed(4) || 'N/A' },
                      ]}},
                      { heading: 'Hierarchy (Gearbox) Analysis', content: result.gearboxAnalysis ? `Clock mean |λ| = ${result.gearboxAnalysis.clockEigenvalue?.toFixed(4) || 'N/A'} vs Target mean |λ| = ${result.gearboxAnalysis.targetEigenvalue?.toFixed(4) || 'N/A'}. Gap = ${result.gearboxAnalysis.gap?.toFixed(4) || 'N/A'}. Status: ${result.gearboxAnalysis.hierarchyStatus || 'Unknown'}.` : 'No gearbox analysis available.' },
                      { heading: 'Top 20 Genes by Eigenvalue', content: { type: 'table' as const, headers: ['Rank', 'Gene', 'Type', '|λ|', 'Stability'], rows: (result.perGeneAnalysis.topByEigenvalue || []).map((g: any, i: number) => [String(i+1), g.gene, g.geneType, g.eigenvalue.toFixed(4), g.stability]) }},
                      { heading: 'Bottom 10 Genes by Eigenvalue', content: { type: 'table' as const, headers: ['Rank', 'Gene', 'Type', '|λ|', 'Stability'], rows: (result.perGeneAnalysis.bottomByEigenvalue || []).map((g: any, i: number) => [String(i+1), g.gene, g.geneType, g.eigenvalue.toFixed(4), g.stability]) }},
                    ] : [
                      { heading: 'Analysis Summary', content: { type: 'stats' as const, items: [
                        { label: 'Channels Analyzed', value: result.channelsAnalyzed },
                        { label: 'Total Records', value: result.totalRecords },
                        { label: 'Format', value: result.detectedFormat },
                      ]}},
                      { heading: 'Channel Results', content: { type: 'table' as const, headers: ['Channel', '|λ|', 'φ₁', 'φ₂', 'R²', 'Stability'], rows: result.results.slice(0, 50).map((ch: any) => [ch.channel, ch.eigenvalue.toFixed(4), ch.phi1.toFixed(4), ch.phi2.toFixed(4), ch.r2.toFixed(4), ch.stability]) }},
                    ]),
                    { heading: 'Methodology', content: `Engine: ${result.metadata?.engine || 'PAR(2) Discovery Engine'}. Algorithm: ${result.metadata?.algorithm || 'AR(2) OLS regression'}. Equation: y(t) = φ₁·y(t-1) + φ₂·y(t-2) + ε. Eigenvalue equation: λ² - φ₁·λ - φ₂ = 0.` },
                  ]}
                  className="border-slate-700 text-slate-300"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300"
                  onClick={() => { setResult(null); setFile(null); setShareUrl(null); }}
                  data-testid="button-new-analysis"
                >
                  New Analysis
                </Button>
              </div>
            </div>

            {shareUrl && (
              <Alert className="bg-emerald-900/30 border-emerald-700/50">
                <Share2 className="h-4 w-4 text-emerald-400" />
                <AlertTitle className="text-emerald-300">Share Link Created</AlertTitle>
                <AlertDescription className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 flex-1 truncate" data-testid="text-share-url">{shareUrl}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-700 text-emerald-300 shrink-0"
                    onClick={handleCopyLink}
                    data-testid="button-copy-share-link"
                  >
                    {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Alert className="bg-amber-950/30 border-amber-800/50" data-testid="alert-disclaimer-banner">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <AlertTitle className="text-amber-300">Important: Exploration Tool</AlertTitle>
              <AlertDescription className="text-xs text-slate-400 space-y-1 mt-1">
                <p>These results help you <span className="text-amber-300 font-semibold">generate hypotheses</span> — they show patterns in your data but don't prove cause and effect on their own.</p>
                <p>The same persistence score can mean different things in different biological contexts. <span className="text-amber-300 font-semibold">Always validate</span> with additional experiments or domain knowledge.</p>
                {result.results.some(ch => ch.sampleCount < 20) && (
                  <p className="text-amber-400 font-semibold">Low sample count detected ({result.results.filter(ch => ch.sampleCount < 20).map(ch => `${ch.channel}: ${ch.sampleCount}`).join(', ')}). Results with fewer than 20 timepoints have reduced statistical power and wider confidence intervals.</p>
                )}
              </AlertDescription>
            </Alert>

            {result.dataDomain?.warning && (
              <Alert className={`${result.dataDomain.domain === 'non-biological' ? 'bg-orange-950/40 border-orange-700/60' : 'bg-amber-950/30 border-amber-700/50'}`} data-testid="alert-data-domain">
                <AlertCircle className={`h-4 w-4 ${result.dataDomain.domain === 'non-biological' ? 'text-orange-400' : 'text-amber-400'}`} />
                <AlertTitle className={result.dataDomain.domain === 'non-biological' ? 'text-orange-300' : 'text-amber-300'}>
                  {result.dataDomain.domain === 'non-biological' ? 'Non-Biological Data Detected' : 'Data Domain Uncertain'}
                </AlertTitle>
                <AlertDescription className="text-xs text-slate-300 space-y-2 mt-1">
                  <p>{result.dataDomain.warning}</p>
                  {result.dataDomain.signals.length > 0 && (
                    <details className="text-slate-400">
                      <summary className="cursor-pointer hover:text-slate-300 text-[11px]">Detection signals ({result.dataDomain.signals.length})</summary>
                      <ul className="mt-1 space-y-0.5 text-[11px] pl-3 list-disc">
                        {result.dataDomain.signals.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {result.skippedChannels && result.skippedChannels.length > 0 && (
              <Alert className="bg-slate-800/50 border-slate-700/50" data-testid="alert-skipped-channels">
                <Info className="h-4 w-4 text-slate-400" />
                <AlertTitle className="text-slate-300">Channels Skipped</AlertTitle>
                <AlertDescription className="text-xs text-slate-400 mt-1">
                  {result.skippedChannels.length} channel(s) had fewer than {result.safeguards?.minimumTimepoints ?? 6} timepoints and were excluded from analysis: {result.skippedChannels.join(', ')}. AR(2) requires a minimum of 6 data points to fit a second-order model reliably.
                </AlertDescription>
              </Alert>
            )}

            {result.results.length === 0 && result.skippedChannels && result.skippedChannels.length > 0 && (
              <Alert className="bg-red-950/30 border-red-800/50" data-testid="alert-no-analyzable">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertTitle className="text-red-300">No Analyzable Channels</AlertTitle>
                <AlertDescription className="text-xs text-slate-400 mt-1">
                  All data channels were excluded because they had fewer than {result.safeguards?.minimumTimepoints ?? 6} timepoints. AR(2) modeling requires at least 6 sequential measurements. Please provide data with more timepoints per channel.
                </AlertDescription>
              </Alert>
            )}

            {result.results.length > 0 && result.results.every(ch => ch.r2 < 0.1) && !result.perGeneAnalysis && (
              <Alert className="bg-red-950/30 border-red-800/50" data-testid="alert-negative-result">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertTitle className="text-red-300">Negative Result Flag</AlertTitle>
                <AlertDescription className="text-xs text-slate-400 mt-1">
                  All channels show R² {"<"} 0.10, meaning the AR(2) model explains very little variance in this data. This is a legitimate and informative negative result — it suggests that second-order autoregressive dynamics are not the dominant pattern in this dataset. Consider alternative models or that the data may lack sufficient temporal structure.
                </AlertDescription>
              </Alert>
            )}

            {result.dataWarnings && result.dataWarnings.length > 0 && (
              <div className="space-y-2" data-testid="data-warnings">
                {result.dataWarnings.map((w, i) => (
                  <Alert key={i} className={
                    w.severity === 'error' ? 'bg-red-950/30 border-red-800/50' :
                    w.severity === 'warning' ? 'bg-amber-950/30 border-amber-800/50' :
                    'bg-blue-950/30 border-blue-800/50'
                  } data-testid={`warning-${w.type}`}>
                    <AlertCircle className={`h-4 w-4 ${
                      w.severity === 'error' ? 'text-red-400' :
                      w.severity === 'warning' ? 'text-amber-400' :
                      'text-blue-400'
                    }`} />
                    <AlertTitle className={
                      w.severity === 'error' ? 'text-red-300' :
                      w.severity === 'warning' ? 'text-amber-300' :
                      'text-blue-300'
                    }>
                      {w.type === 'duplicate_genes' ? 'Duplicate Genes Detected' :
                       w.type === 'constant_genes' ? 'Constant Expression Genes Excluded' :
                       w.type === 'corrupted_rows' ? 'Corrupted Data Rows Excluded' :
                       w.type === 'outlier_genes' ? 'Outlier Values Detected' :
                       'Data Quality Notice'}
                    </AlertTitle>
                    <AlertDescription className="text-xs text-slate-400 mt-1">
                      {w.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {result.parsingValidation && (
              <Card className={`${result.parsingValidation.dataReliable ? 'bg-slate-900/60 border-slate-700/50' : 'bg-red-950/30 border-red-700/50'}`} data-testid="parsing-validation">
                <CardContent className="pt-4 pb-3">
                  <details>
                    <summary className="cursor-pointer flex items-center gap-2 text-sm">
                      {result.parsingValidation.dataReliable ? (
                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
                          <ShieldCheck size={10} className="mr-1" />
                          Data Integrity Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-red-600/20 text-red-400 border-red-600/30 text-xs">
                          <AlertCircle size={10} className="mr-1" />
                          Data Integrity Warning
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">{result.parsingValidation.summary}</span>
                    </summary>
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center mb-3">
                        <div className="bg-slate-800/50 rounded px-2 py-1.5">
                          <div className="text-sm font-medium text-white">{result.parsingValidation.formatDetected}</div>
                          <div className="text-[10px] text-slate-500">Format Detected</div>
                        </div>
                        <div className="bg-slate-800/50 rounded px-2 py-1.5">
                          <div className="text-sm font-medium text-cyan-400">{result.parsingValidation.columnsFound}</div>
                          <div className="text-[10px] text-slate-500">Columns Found</div>
                        </div>
                        <div className="bg-slate-800/50 rounded px-2 py-1.5">
                          <div className="text-sm font-medium text-white">{result.parsingValidation.channelsAnalyzed}</div>
                          <div className="text-[10px] text-slate-500">Channels Analyzed</div>
                        </div>
                        <div className="bg-slate-800/50 rounded px-2 py-1.5">
                          <div className="text-sm font-medium text-white">{result.parsingValidation.rowsRead.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500">Data Points</div>
                        </div>
                      </div>
                      {result.parsingValidation.checks.map((check, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className={`mt-0.5 flex-shrink-0 ${check.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {check.passed ? '✓' : '✗'}
                          </span>
                          <div>
                            <span className="text-slate-300 font-medium">{check.test}:</span>
                            <span className="text-slate-400 ml-1">{check.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </CardContent>
              </Card>
            )}

            {result.perGeneAnalysis && (
              <Card className="bg-emerald-950/30 border-emerald-700/50" data-testid="per-gene-summary">
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-emerald-600/30 text-emerald-400 border-emerald-600/40">Gene Expression Matrix Detected</Badge>
                    <span className="text-xs text-slate-400">Per-gene AR(2) eigenvalue analysis</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xl font-bold text-white" data-testid="text-total-genes">{result.perGeneAnalysis.totalGenes.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Genes Analyzed</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xl font-bold text-cyan-400" data-testid="text-timepoints">{result.perGeneAnalysis.timepointCount}</div>
                      <div className="text-xs text-slate-400">Time Points</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xl font-bold text-amber-400" data-testid="text-clock-genes">{result.perGeneAnalysis.clockGenesFound}</div>
                      <div className="text-xs text-slate-400">Clock Genes Found</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-xl font-bold text-emerald-400" data-testid="text-hierarchy-gap">
                        {(result.perGeneAnalysis.targetMeanEigenvalue - result.perGeneAnalysis.clockMeanEigenvalue).toFixed(3)}
                      </div>
                      <div className="text-xs text-slate-400">Clock→Target Gap</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-2">Highest Persistence (Top 10)</h4>
                      <div className="space-y-1">
                        {result.perGeneAnalysis.topByEigenvalue.slice(0, 10).map((g, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-800/30 rounded px-2 py-1">
                            <span className={g.geneType === 'clock' ? 'text-cyan-400 font-medium' : 'text-slate-300'}><GeneTooltip gene={g.gene}>{g.gene}</GeneTooltip></span>
                            <span className="text-slate-400">|λ| = {g.eigenvalue.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-2">Lowest Persistence (Bottom 10)</h4>
                      <div className="space-y-1">
                        {result.perGeneAnalysis.bottomByEigenvalue.slice(0, 10).map((g, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-800/30 rounded px-2 py-1">
                            <span className={g.geneType === 'clock' ? 'text-cyan-400 font-medium' : 'text-slate-300'}><GeneTooltip gene={g.gene}>{g.gene}</GeneTooltip></span>
                            <span className="text-slate-400">|λ| = {g.eigenvalue.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {result.perGeneAnalysis.clockGenesFound > 0 && (
                    <div className="text-xs text-slate-400 bg-slate-800/30 rounded-lg p-3">
                      <span className="text-cyan-400">Clock genes</span> mean |λ| = {result.perGeneAnalysis.clockMeanEigenvalue.toFixed(4)} vs all other genes mean |λ| = {result.perGeneAnalysis.targetMeanEigenvalue.toFixed(4)}
                      {result.perGeneAnalysis.targetMeanEigenvalue > result.perGeneAnalysis.clockMeanEigenvalue
                        ? ' — Clock < Target hierarchy confirmed (clock genes have lower persistence, consistent with faster-cycling regulatory role)'
                        : ' — Hierarchy not confirmed in this dataset'}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {result.biasAudit && (
              <Card className="bg-slate-900/80 border-slate-700" data-testid="bias-audit-card">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={result.biasAudit.overallColor} strokeWidth="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <h3 className="font-bold text-white text-lg">Bias Audit</h3>
                    </div>
                    <Badge className="text-xs" style={{ backgroundColor: result.biasAudit.overallColor + '20', color: result.biasAudit.overallColor, borderColor: result.biasAudit.overallColor }} data-testid="bias-audit-summary">
                      {result.biasAudit.summary}
                    </Badge>
                  </div>
                  <p className="text-sm mb-4" style={{ color: result.biasAudit.overallColor }}>{result.biasAudit.overallVerdict}</p>
                  <div className="space-y-4">
                    {result.biasAudit.tests.map((test, tIdx) => (
                      <div key={tIdx} className={`rounded-lg p-4 border ${test.passed ? 'border-green-800/50 bg-green-950/20' : 'border-amber-800/50 bg-amber-950/20'}`} data-testid={`bias-test-${tIdx}`}>
                        <div className="flex items-start gap-2 mb-2">
                          <span className={`text-lg mt-0.5 ${test.passed ? 'text-green-400' : 'text-amber-400'}`}>{test.passed ? '✓' : '⚠'}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{test.testName}</h4>
                            <p className="text-xs text-slate-400 mt-1">{test.description}</p>
                          </div>
                        </div>
                        <p className={`text-xs mt-2 ${test.passed ? 'text-green-300' : 'text-amber-300'}`}>{test.verdict}</p>
                        {test.details && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(test.details).filter(([, v]) => typeof v !== 'object').map(([key, value]) => (
                              <div key={key} className="bg-slate-800/40 rounded px-2 py-1">
                                <div className="text-[10px] text-slate-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
                                <div className="text-xs text-slate-300 font-mono">{typeof value === 'number' ? value.toFixed?.(4) ?? value : String(value)}</div>
                              </div>
                            ))}
                            {test.details.correlations && (
                              <div className="col-span-full mt-1">
                                <div className="text-[10px] text-slate-500 mb-1">Spearman Correlations with Eigenvalue</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                  {(test.details.correlations as any[]).map((c: any, ci: number) => (
                                    <div key={ci} className="flex justify-between items-center bg-slate-800/40 rounded px-2 py-1">
                                      <span className="text-[10px] text-slate-400">{c.metric}</span>
                                      <span className={`text-xs font-mono ${Math.abs(c.spearmanRho) > 0.4 ? 'text-amber-400' : Math.abs(c.spearmanRho) > 0.15 ? 'text-yellow-400' : 'text-green-400'}`}>
                                        ρ = {c.spearmanRho.toFixed(3)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.results.length > 0 && (
              <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 px-1" data-testid="persistence-legend">
                <span className="font-medium text-slate-300">{result.perGeneAnalysis ? 'Top genes by persistence:' : 'Persistence scale:'}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /> Low (fades quickly)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Moderate (lingers)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500" /> High (persistent)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Near-critical (very slow decay)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.results.map((ch, idx) => (
                  <Card key={idx} className="bg-slate-900/80 border-slate-700">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-white text-base" data-testid={`text-channel-name-${idx}`}>{ch.channel}</h3>
                          <p className="text-xs text-slate-400">{ch.sampleCount} samples | {ch.unit}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            className="text-xs"
                            style={{ backgroundColor: `${ch.stabilityColor}20`, color: ch.stabilityColor, borderColor: `${ch.stabilityColor}40` }}
                            variant="outline"
                          >
                            {ch.stability}
                          </Badge>
                          {ch.overallConfidence && (
                            <Badge
                              className="text-xs gap-1"
                              style={{ backgroundColor: `${ch.confidenceColor}15`, color: ch.confidenceColor, borderColor: `${ch.confidenceColor}30` }}
                              variant="outline"
                              data-testid={`badge-confidence-${idx}`}
                            >
                              {ch.overallConfidence === 'High' ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                              {ch.overallConfidence} ({ch.confidenceScore}%)
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-center mb-4">
                        <StabilityRing eigenvalue={ch.eigenvalue} size={140} label={ch.channel} />
                      </div>

                      {ch.mean !== 0 && Math.abs(ch.std / ch.mean) < 0.05 && (
                        <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded bg-amber-500/10 border border-amber-500/20" data-testid={`warning-low-amplitude-${idx}`}>
                          <AlertCircle size={12} className="text-amber-400 shrink-0" />
                          <span className="text-[11px] text-amber-400">Low response amplitude — eigenvalue may be less informative</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-800/50 rounded p-2">
                          <span className="text-slate-400"><Term>phi1</Term> (recent influence)</span>
                          <div className="font-mono text-white" data-testid={`text-phi1-${idx}`}>{ch.phi1.toFixed(4)}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                          <span className="text-slate-400"><Term>phi2</Term> (older influence)</span>
                          <div className="font-mono text-white" data-testid={`text-phi2-${idx}`}>{ch.phi2.toFixed(4)}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                          <span className="text-slate-400"><Term>R-squared</Term> (model fit)</span>
                          <div className="font-mono text-white" data-testid={`text-r2-${idx}`}>{ch.r2.toFixed(4)}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2">
                          <span className="text-slate-400"><Term>Ljung-Box</Term> (fit quality)</span>
                          <div className={`font-mono ${ch.ljungBoxPassed ? 'text-green-400' : 'text-amber-400'}`} data-testid={`text-ljung-${idx}`}>
                            {ch.ljungBoxPassed ? 'PASS' : 'FAIL'} (p={ch.ljungBoxPValue.toFixed(3)})
                          </div>
                        </div>
                        {ch.halfLife != null && (
                          <div className="bg-slate-800/50 rounded p-2">
                            <span className="text-slate-400"><Term>half-life</Term> (expression persistence)</span>
                            <div className="font-mono text-emerald-400" data-testid={`text-halflife-${idx}`}>{ch.halfLife.toFixed(1)} steps</div>
                          </div>
                        )}
                        {ch.isComplex && ch.impliedPeriod && (
                          <div className="bg-slate-800/50 rounded p-2">
                            <span className="text-slate-400"><Term>implied period</Term> (cycle length)</span>
                            <div className="font-mono text-cyan-400">{ch.impliedPeriod.toFixed(1)} time units</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              </div>
            )}

            {result.gearboxAnalysis && result.dataDomain?.domain !== 'non-biological' && (
              <Card className="bg-gradient-to-r from-slate-900 to-slate-900/80 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target size={18} className="text-amber-400" />
                    Persistence Hierarchy
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Does one channel persist longer than the other? In healthy circadian systems, the "clock" signal should outlast the "target" signal — like a conductor leading an orchestra.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock size={16} className="text-blue-400" />
                        <span className="text-sm text-slate-400">Clock Proxy</span>
                      </div>
                      <StabilityRing eigenvalue={result.gearboxAnalysis.clockEigenvalue} size={120} label={result.gearboxAnalysis.clockChannel} />
                    </div>

                    <div className="text-center space-y-3">
                      <div className="text-3xl font-bold" style={{ color: result.gearboxAnalysis.hierarchyColor }} data-testid="text-gearbox-gap">
                        {result.gearboxAnalysis.gap >= 0 ? '+' : ''}{result.gearboxAnalysis.gap.toFixed(3)}
                      </div>
                      <div className="text-sm font-medium" style={{ color: result.gearboxAnalysis.hierarchyColor }} data-testid="text-gearbox-status">
                        {result.gearboxAnalysis.hierarchyStatus}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: `${result.gearboxAnalysis.hierarchyColor}40` }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.abs(result.gearboxAnalysis.gap) * 200)}%`,
                              backgroundColor: result.gearboxAnalysis.hierarchyColor
                            }}
                          />
                        </div>
                      </div>
                      {result.gearboxAnalysis.gapUncertainty != null && (
                        <p className="text-xs text-slate-400 font-mono">
                          ±{result.gearboxAnalysis.gapUncertainty.toFixed(3)}
                          {result.gearboxAnalysis.gapReliable === false && (
                            <span className="text-amber-400 ml-1">(uncertain)</span>
                          )}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        Healthy gap: +0.22 to +0.39 (manuscript reference)
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Target size={16} className="text-orange-400" />
                        <span className="text-sm text-slate-400">Target Proxy</span>
                      </div>
                      <StabilityRing eigenvalue={result.gearboxAnalysis.targetEigenvalue} size={120} label={result.gearboxAnalysis.targetChannel} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="quality" className="w-full">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="quality" data-testid="tab-quality" className="gap-1">
                  <ShieldCheck size={14} />
                  Quality Checks
                </TabsTrigger>
                <TabsTrigger value="timeseries" data-testid="tab-timeseries">Raw Data</TabsTrigger>
                <TabsTrigger value="statespace" data-testid="tab-statespace">Dynamics Map</TabsTrigger>
                <TabsTrigger value="unitcircle" data-testid="tab-unitcircle">Unit Circle</TabsTrigger>
                <TabsTrigger value="residuals" data-testid="tab-residuals">Model Fit</TabsTrigger>
                <TabsTrigger value="acf" data-testid="tab-acf">Pattern Check</TabsTrigger>
              </TabsList>

              <TabsContent value="quality">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldCheck size={16} className="text-cyan-400" />
                      How Trustworthy Are These Results?
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Seven independent checks test whether the results are reliable or might be misleading.
                      Each check contributes to an overall confidence score (0–100).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {result.results.map((ch, idx) => (
                      <div key={idx} className="border border-slate-700 rounded-lg p-4" data-testid={`quality-panel-${idx}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-white">{ch.channel}</h3>
                            <span className="text-xs text-slate-400">({ch.sampleCount} samples)</span>
                          </div>
                          {ch.overallConfidence && (
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="text-xs text-slate-400">Confidence</div>
                                <div className="font-bold text-lg" style={{ color: ch.confidenceColor }} data-testid={`text-confidence-${idx}`}>
                                  {ch.overallConfidence}
                                </div>
                              </div>
                              <div className="relative w-12 h-12">
                                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
                                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={ch.confidenceColor}
                                    strokeWidth="3" strokeDasharray={`${(ch.confidenceScore || 0)} ${100 - (ch.confidenceScore || 0)}`}
                                    strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: ch.confidenceColor }}>
                                  {ch.confidenceScore}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {ch.qualityChecks && ch.qualityChecks.length > 0 && (
                          <div className="space-y-2">
                            {ch.qualityChecks.map((qc, qIdx) => (
                              <div key={qIdx} className={`rounded-lg p-3 border ${
                                qc.severity === 'critical' ? 'bg-red-950/30 border-red-900/50' :
                                qc.severity === 'warning' ? 'bg-amber-950/30 border-amber-900/50' :
                                'bg-slate-800/50 border-slate-700/50'
                              }`} data-testid={`quality-check-${idx}-${qIdx}`}>
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">
                                    {qc.passed ? (
                                      <CheckCircle2 size={16} className="text-green-400" />
                                    ) : qc.severity === 'critical' ? (
                                      <ShieldAlert size={16} className="text-red-400" />
                                    ) : (
                                      <AlertCircle size={16} className="text-amber-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-white">{qc.name}</span>
                                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                                        qc.passed ? 'bg-green-900/30 text-green-400' :
                                        qc.severity === 'critical' ? 'bg-red-900/30 text-red-400' :
                                        'bg-amber-900/30 text-amber-400'
                                      }`}>
                                        {qc.value}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{qc.explanation}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {ch.edgeCaseDiagnostics && ch.edgeCaseDiagnostics.some(d => d.triggered) && (
                          <div className="mt-3 space-y-2">
                            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldAlert size={12} />
                              Edge Case Warnings
                            </h4>
                            {ch.edgeCaseDiagnostics.filter(d => d.triggered).map((d, dIdx) => (
                              <div key={dIdx} className={`rounded-lg p-3 border ${
                                d.severity === 'critical' ? 'bg-red-950/30 border-red-900/50' :
                                'bg-amber-950/30 border-amber-900/50'
                              }`} data-testid={`edge-case-${idx}-${d.id}`}>
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">
                                    {d.severity === 'critical' ? (
                                      <ShieldAlert size={16} className="text-red-400" />
                                    ) : (
                                      <AlertCircle size={16} className="text-amber-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-white">{d.label}</span>
                                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{d.detail}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {ch.overallConfidence && (
                          <div className={`mt-4 p-3 rounded-lg border ${
                            ch.overallConfidence === 'High' ? 'bg-green-950/20 border-green-900/40' :
                            ch.overallConfidence === 'Moderate' ? 'bg-yellow-950/20 border-yellow-900/40' :
                            ch.overallConfidence === 'Low' ? 'bg-orange-950/20 border-orange-900/40' :
                            'bg-red-950/20 border-red-900/40'
                          }`}>
                            <div className="flex items-start gap-2">
                              {ch.overallConfidence === 'High' ? (
                                <ShieldCheck size={16} className="text-green-400 mt-0.5" />
                              ) : (
                                <ShieldAlert size={16} className={`mt-0.5 ${
                                  ch.overallConfidence === 'Moderate' ? 'text-yellow-400' :
                                  ch.overallConfidence === 'Low' ? 'text-orange-400' : 'text-red-400'
                                }`} />
                              )}
                              <p className="text-xs text-slate-300">
                                {ch.overallConfidence === 'High' && 'All major quality checks passed. This eigenvalue estimate is reliable and unlikely to be an artifact.'}
                                {ch.overallConfidence === 'Moderate' && 'Most quality checks passed, but some minor concerns exist. The eigenvalue estimate is likely meaningful, but interpret with some caution.'}
                                {ch.overallConfidence === 'Low' && 'Several quality checks flagged issues. The eigenvalue estimate may be affected by data quality problems. Consider collecting more data or preprocessing.'}
                                {ch.overallConfidence === 'Unreliable' && 'Critical quality issues detected. The eigenvalue estimate is likely unreliable and may be an artifact of data problems. Do not draw conclusions from this result.'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeseries">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Your Raw Data Over Time</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Each chart shows the original measurements for one channel, plotted in order. Look for repeating patterns or trends.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.results.map((ch, idx) => (
                      <div key={idx} className="mb-6">
                        <h4 className="text-xs font-medium text-slate-400 mb-2">{ch.channel} ({ch.unit})</h4>
                        <ResponsiveContainer width="100%" height={180} minWidth={1} minHeight={1}>
                          <LineChart data={ch.timeSeriesPreview.map((v, i) => ({ t: i, value: v }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                            <Line type="monotone" dataKey="value" stroke={ch.stabilityColor} dot={false} strokeWidth={1.5} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="statespace">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Dynamics Map</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Each dot is one of your channels. Position shows its behaviour: inside the dashed triangle = stable, above the gold curve = oscillating.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StateSpacePlot results={result.results} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="unitcircle">
                <UnitCirclePlot results={result.results} />
              </TabsContent>

              <TabsContent value="residuals">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Model Fit — What the Model Missed</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      These bars show the leftover patterns after the model's predictions are subtracted. Random-looking bars = good fit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.results.map((ch, idx) => (
                      <div key={idx} className="mb-6">
                        <h4 className="text-xs font-medium text-slate-400 mb-2">
                          {ch.channel} residuals {ch.ljungBoxPassed ?
                            <span className="text-green-400 ml-2">White noise (good fit)</span> :
                            <span className="text-amber-400 ml-2">Autocorrelated (poor fit)</span>
                          }
                        </h4>
                        <ResponsiveContainer width="100%" height={150} minWidth={1} minHeight={1}>
                          <BarChart data={ch.residuals.map((v, i) => ({ t: i, residual: v }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                            <ReferenceLine y={0} stroke="#64748b" />
                            <Bar dataKey="residual" fill={ch.ljungBoxPassed ? '#22c55e40' : '#f9731640'} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="acf">
                <Card className="bg-slate-900/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Pattern Check — Any Leftover Structure?</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Tests if any repeating patterns remain after the model. Bars inside the dashed lines = the model captured everything. Red bars = missed patterns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.results.map((ch, idx) => {
                      const confBound = 1.96 / Math.sqrt(ch.sampleCount);
                      return (
                        <div key={idx} className="mb-6">
                          <h4 className="text-xs font-medium text-slate-400 mb-2">{ch.channel}</h4>
                          <ResponsiveContainer width="100%" height={150} minWidth={1} minHeight={1}>
                            <BarChart data={ch.acf.map((v, i) => ({ lag: i + 1, acf: v }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="lag" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Lag', position: 'bottom', fill: '#64748b', fontSize: 10 }} />
                              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[-0.5, 0.5]} />
                              <ReferenceLine y={confBound} stroke="#64748b" strokeDasharray="5 5" label={{ value: '95% CI', fill: '#64748b', fontSize: 9 }} />
                              <ReferenceLine y={-confBound} stroke="#64748b" strokeDasharray="5 5" />
                              <ReferenceLine y={0} stroke="#475569" />
                              <Bar dataKey="acf">
                                {ch.acf.map((v, i) => (
                                  <Cell key={i} fill={Math.abs(v) > confBound ? '#ef4444' : '#22c55e80'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-slate-300">
                  <BarChart3 size={14} className="text-slate-400" />
                  Persistence Score Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.results.map(r => ({
                    channel: r.channel,
                    eigenvalue: r.eigenvalue,
                    color: r.stabilityColor
                  }))} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" domain={[0, 1.1]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis type="category" dataKey="channel" tick={{ fill: '#64748b', fontSize: 11 }} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <ReferenceLine x={0.7} stroke="#facc15" strokeDasharray="5 5" label={{ value: "Moderate", fill: '#facc1580', fontSize: 10 }} />
                    <ReferenceLine x={1.0} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Unstable", fill: '#ef444480', fontSize: 10 }} />
                    <Bar dataKey="eigenvalue" radius={[0, 4, 4, 0]}>
                      {result.results.map((r, i) => (
                        <Cell key={i} fill={r.stabilityColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-700" data-testid="card-root-space-map">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-slate-300">
                  <Target size={14} className="text-cyan-400" />
                  Your Data in Root Space
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Each dot is one of your uploaded channels plotted by its AR(2) coefficients (β₁, β₂). The dashed triangle marks the stationary region — channels inside it have stable dynamics. The gold parabola separates oscillatory (above) from monotonic (below) behavior.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StateSpacePlot results={result.results} />
                <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-6 h-0 border-t-2 border-dashed border-slate-500" />
                    <span>Stationarity boundary</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-6 h-0 border-t-2 border-dashed border-yellow-500" />
                    <span>Oscillatory boundary</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-3 h-3 rounded-full bg-cyan-400" />
                    <span>Your channels</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-700">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 text-xs text-slate-400">
                  <Info size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="mb-1"><strong className="text-slate-400">Engine:</strong> {result.metadata.engine}</p>
                    <p className="mb-1"><strong className="text-slate-400">Algorithm:</strong> {result.metadata.algorithm}</p>
                    <p className="mb-1"><strong className="text-slate-400">Model:</strong> {result.metadata.equation}</p>
                    <p><strong className="text-slate-400">Eigenvalue:</strong> {result.metadata.eigenvalueEquation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
