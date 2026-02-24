import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useScrollToHash } from "@/hooks/useScrollToHash";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ReferenceLine, Legend, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
  ArrowLeft, Loader2, ShieldCheck, Target, Activity, Beaker,
  TrendingUp, BarChart3, Crosshair, Award, AlertTriangle, CheckCircle2, XCircle, Info,
  ChevronDown, ChevronUp, Microscope, Network, Clock, Dna, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import EvidenceLink from "@/components/EvidenceLink";
import PaperCrossLinks from "@/components/PaperCrossLinks";

interface SimBenchResult {
  trueEigenvalue: number;
  estimatedMean: number;
  estimatedStd: number;
  bias: number;
  rmse: number;
  n: number;
  nSimulations: number;
}

interface ResidualResult {
  gene: string;
  type: string;
  eigenvalue: number;
  ljungBoxStat: number;
  pValue: number;
  isWellSpecified: boolean;
}

interface ModelCompResult {
  gene: string;
  type: string;
  ar1: { aic: number; bic: number; eigenvalue: number };
  ar2: { aic: number; bic: number; eigenvalue: number };
  ar3: { aic: number; bic: number; eigenvalue: number };
  preferredModel: string;
  preferredByAIC: string;
  preferredByBIC: string;
}

interface AltMetricResult {
  gene: string;
  type: string;
  ar2Eigenvalue: number;
  ar1Autocorr: number;
  sumArCoeffs: number;
  spectralDensityPeak: number;
}

interface BaselineModel {
  model: string;
  coefficients: number[];
  eigenvalueModulus: number;
  aic: number;
  bic: number;
  residualVariance: number;
  logLikelihood: number;
}

interface BaselineResult {
  dataset: string;
  condition: string;
  sampleSize: number;
  models: { par2: BaselineModel; arima: BaselineModel; ou: BaselineModel; stateSpace: BaselineModel };
  comparison: { eigenvalueDifferences: any; aicRanking: string[]; conclusion: string };
}

interface MasterBenchmark {
  name: string;
  question: string;
  status: "PASSED" | "PARTIAL" | "FAILED";
  expectedResult: string;
  actualResult: string;
  score: number;
  details: any;
}

function formatP(p: number): string {
  if (p < 1e-10) return `${p.toExponential(1)}`;
  if (p < 0.001) return p.toExponential(2);
  return p.toFixed(4);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "PASSED") return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" data-testid="badge-passed">PASSED</Badge>;
  if (status === "PARTIAL") return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30" data-testid="badge-partial">PARTIAL</Badge>;
  return <Badge className="bg-red-500/20 text-red-400 border-red-500/30" data-testid="badge-failed">FAILED</Badge>;
}

const DATA_SOURCE_META: Record<string, { label: string; color: string; tooltip: string }> = {
  turing: {
    label: 'Simulation Only',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    tooltip: 'Schnakenberg reaction-diffusion simulation. Parameters tuned to produce bifurcation at φ. Not validated against real tissue data on this page — see Turing Deep Dive for real-data test.'
  },
  fisher: {
    label: 'Theoretical Model',
    color: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    tooltip: 'Transfer function model evaluating information throughput at different eigenvalue levels. Mathematical framework, not derived from measured signaling data.'
  },
  network: {
    label: 'Literature + Real Eigenvalues',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    tooltip: 'STRING v12.0 interaction counts (curated from literature). Eigenvalues computed from real GSE54650 Liver dataset.'
  },
  ueda: {
    label: 'Real Dataset (GEO)',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    tooltip: 'Computed from GSE157357 organoid time-series (WT vs APC-KO). Cross-condition prediction using real expression data.'
  },
};

function DataSourceBadge({ benchmarkKey }: { benchmarkKey: string }) {
  const meta = DATA_SOURCE_META[benchmarkKey];
  if (!meta) return null;
  return (
    <div className="group relative inline-block">
      <Badge className={`${meta.color} text-[10px] cursor-help`} data-testid={`badge-data-source-${benchmarkKey}`}>
        {meta.label}
      </Badge>
      <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50 w-64 p-2 bg-slate-900 border border-slate-600 rounded text-[10px] text-slate-300 shadow-xl">
        {meta.tooltip}
      </div>
    </div>
  );
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  const bgColor = score >= 80 ? "bg-emerald-500/10 border-emerald-500/30" : score >= 60 ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30";
  return (
    <div className={`rounded-lg border p-4 text-center ${bgColor}`} data-testid={`gauge-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`text-3xl font-bold ${color}`}>{score}%</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-xl">
      <div className="font-bold text-white mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
        </div>
      ))}
    </div>
  );
};

function TuringDetailPanel({ details }: { details: any }) {
  if (!details) return null;
  const simulations = details.simulations || [];
  const chartData = simulations.map((s: any) => ({
    eigenvalue: s.eigenvalue,
    amplitude: s.patternAmplitude,
    turingNumber: s.turingNumber,
    wavelength: s.patternWavelength,
    classification: s.classification,
  }));

  return (
    <div id="turing-detail" className="space-y-4 mt-4 scroll-mt-20" data-testid="turing-detail-panel">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Bifurcation Point</div>
          <div className="text-xl font-bold text-amber-400">{details.bifurcationPoint}</div>
          <div className="text-[10px] text-slate-400">Golden Ratio: 0.618</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Critical Threshold</div>
          <div className="text-xl font-bold text-cyan-400">{details.criticalThreshold}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Matches Golden Ratio</div>
          <div className={`text-xl font-bold ${details.validation?.matchesGoldenRatio ? 'text-emerald-400' : 'text-red-400'}`}>
            {details.validation?.matchesGoldenRatio ? 'YES' : 'NO'}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Deviation from phi</div>
          <div className="text-xl font-bold text-slate-300">{(details.validation?.deviationFromPhi * 100)?.toFixed(1)}%</div>
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 text-sm">Pattern Amplitude vs Eigenvalue</h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="eigenvalue" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '|lambda|', fill: '#94a3b8', position: 'bottom', offset: -5 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Amplitude', fill: '#94a3b8', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0.618} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'phi=0.618', fill: '#f59e0b', fontSize: 11 }} />
            <Line type="monotone" dataKey="amplitude" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} name="Pattern Amplitude" />
            <Line type="monotone" dataKey="turingNumber" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} name="Turing Number" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 text-sm">Simulation Results by Eigenvalue</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" data-testid="table-turing-detail">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 pb-2 pr-3">|lambda|</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Pattern Intact</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Wavelength</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Amplitude</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Turing #</th>
                <th className="text-left text-slate-400 pb-2">Classification</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map((s: any, i: number) => (
                <tr key={i} className={`border-b border-slate-800/50 ${s.eigenvalue === 0.618 ? 'bg-amber-500/10' : ''}`}>
                  <td className="py-1.5 pr-3 font-mono text-cyan-300">{s.eigenvalue}</td>
                  <td className="py-1.5 pr-3">{s.patternIntact ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}</td>
                  <td className="py-1.5 pr-3 font-mono text-slate-300">{s.patternWavelength}</td>
                  <td className="py-1.5 pr-3 font-mono text-slate-300">{s.patternAmplitude?.toFixed(4)}</td>
                  <td className="py-1.5 pr-3 font-mono text-slate-300">{s.turingNumber?.toFixed(4)}</td>
                  <td className="py-1.5">
                    <Badge className={
                      s.classification === 'stable_pattern' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      s.classification === 'critical_transition' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }>{s.classification?.replace('_', ' ')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Alert className="bg-slate-800/50 border-slate-700/50">
        <AlertDescription className="text-slate-300 text-xs">
          <strong>Interpretation:</strong> {details.interpretation}
        </AlertDescription>
      </Alert>
      <Alert className="bg-orange-500/10 border-orange-500/30 mt-3">
        <AlertDescription className="text-orange-200 text-xs">
          <strong>Data source note:</strong> This benchmark uses Schnakenberg reaction-diffusion simulation with parameters tuned to produce a bifurcation at φ = 0.618. The simulation confirms the mathematical connection but is not an independent empirical test. For a real-data validation using actual tissue eigenvalues, see the Turing Deep Dive page.
        </AlertDescription>
      </Alert>
      <div className="flex items-center gap-2 pt-2 flex-wrap">
        <span className="text-xs text-slate-400">Related:</span>
        <EvidenceLink label="Deep dive: Turing patterns" to="/turing-deep-dive" />
        <EvidenceLink label="Real-data validation" to="/turing-deep-dive" hash="real-data-validation" />
        <EvidenceLink label="Root-space geometry" to="/root-space" hash="phi-enrichment" />
        <EvidenceLink label="Crypt-villus patterns" to="/crypt-villus" />
      </div>
    </div>
  );
}

function FisherDetailPanel({ details }: { details: any }) {
  if (!details) return null;
  const analyses = details.analyses || [];
  const chartData = analyses.map((a: any) => ({
    eigenvalue: a.eigenvalue,
    fisherInfo: a.fisherInformation,
    snr: a.signalToNoiseRatio,
    efficiency: a.informationEfficiency,
    capacity: a.channelCapacity,
  }));

  return (
    <div id="fisher-detail" className="space-y-4 mt-4 scroll-mt-20" data-testid="fisher-detail-panel">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Peak Fisher Info</div>
          <div className="text-xl font-bold text-cyan-400">{details.peakFisherInfo?.fisherInformation?.toFixed(1)}</div>
          <div className="text-[10px] text-slate-400">at |lambda| = {details.peakFisherInfo?.eigenvalue}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Peak in Stable Band</div>
          <div className={`text-xl font-bold ${details.validation?.peakInStableBand ? 'text-emerald-400' : 'text-red-400'}`}>
            {details.validation?.peakInStableBand ? 'YES' : 'NO'}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Cancer Info Loss</div>
          <div className="text-xl font-bold text-red-400">{(details.validation?.informationLossInCancer * 100)?.toFixed(0)}%</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Optimal Band</div>
          <div className="text-xl font-bold text-emerald-400">{details.optimalBand?.lower}-{details.optimalBand?.upper}</div>
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 text-sm">Fisher Information & Efficiency vs Eigenvalue</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="eigenvalue" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '|lambda|', fill: '#94a3b8', position: 'bottom', offset: -5 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Fisher Info', fill: '#94a3b8', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Efficiency', fill: '#94a3b8', angle: 90, position: 'insideRight' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine x={0.56} stroke="#f59e0b" strokeDasharray="5 5" yAxisId="left" label={{ value: 'Peak', fill: '#f59e0b', fontSize: 11 }} />
            <Line type="monotone" dataKey="fisherInfo" stroke="#60a5fa" strokeWidth={2} dot={false} name="Fisher Information" yAxisId="left" />
            <Line type="monotone" dataKey="efficiency" stroke="#22c55e" strokeWidth={2} dot={false} name="Efficiency" yAxisId="right" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 text-sm">Signal Classification by Eigenvalue Region</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['optimal', 'suboptimal', 'degraded', 'noisy'].map(cls => {
            const count = analyses.filter((a: any) => a.classification === cls).length;
            const colors: Record<string, string> = {
              optimal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              suboptimal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
              degraded: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
              noisy: 'bg-red-500/20 text-red-400 border-red-500/30',
            };
            return (
              <div key={cls} className={`rounded-lg border p-3 text-center ${colors[cls]}`}>
                <div className="text-lg font-bold">{count}</div>
                <div className="text-xs capitalize">{cls}</div>
              </div>
            );
          })}
        </div>
      </div>

      <Alert className="bg-slate-800/50 border-slate-700/50">
        <AlertDescription className="text-slate-300 text-xs">
          <strong>Interpretation:</strong> {details.interpretation}
        </AlertDescription>
      </Alert>
      <Alert className="bg-violet-500/10 border-violet-500/30 mt-3">
        <AlertDescription className="text-violet-200 text-xs">
          <strong>Data source note:</strong> This is a mathematical transfer function model, not derived from measured signaling data. It demonstrates that intermediate eigenvalues are theoretically optimal for information transmission, but empirical validation would require measuring actual signal fidelity in biological circuits at different eigenvalue levels.
        </AlertDescription>
      </Alert>
      <div className="flex items-center gap-2 pt-2">
        <span className="text-xs text-slate-400">Related:</span>
        <EvidenceLink label="Eigenvalue independence" to="/validation-suite" hash="eigenvalue-independence" />
        <EvidenceLink label="Robustness suite" to="/robustness-suite" />
      </div>
    </div>
  );
}

function NetworkDetailPanel({ details }: { details: any }) {
  const [geneSearch, setGeneSearch] = useState("");
  if (!details) return null;
  const genes = details.geneAnalyses || [];

  const filteredGenes = genes.filter((g: any) =>
    g.gene.toLowerCase().includes(geneSearch.toLowerCase())
  );

  const chartData = filteredGenes.map((g: any) => ({
    gene: g.gene,
    eigenvalue: g.eigenvalue,
    degree: g.networkDegree,
    isHub: g.isHub,
    class: g.eigenvalueClass,
  }));

  return (
    <div id="network-detail" className="space-y-4 mt-4 scroll-mt-20" data-testid="network-detail-panel">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Stable Genes as Hubs</div>
          <div className="text-xl font-bold text-emerald-400">{(details.validation?.stableGenesAsHubs * 100)?.toFixed(0)}%</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Unstable as Hubs</div>
          <div className="text-xl font-bold text-red-400">{(details.validation?.unstableGenesAsHubs * 100)?.toFixed(0)}%</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Correlation (r)</div>
          <div className="text-xl font-bold text-cyan-400">{details.validation?.correlationCoefficient?.toFixed(3)}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Genes Analyzed</div>
          <div className="text-xl font-bold text-slate-300">{genes.length}</div>
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 text-sm">Network Degree vs Eigenvalue</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="eigenvalue" name="Eigenvalue" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '|lambda|', fill: '#94a3b8', position: 'bottom', offset: -5 }} />
            <YAxis dataKey="degree" name="Network Degree" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'STRING Degree', fill: '#94a3b8', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-xl">
                  <div className="font-bold text-white">{d.gene}</div>
                  <div className="text-cyan-300">|lambda| = {d.eigenvalue?.toFixed(3)}</div>
                  <div className="text-slate-300">Degree: {d.degree}</div>
                  <div className={d.isHub ? 'text-emerald-400' : 'text-slate-400'}>{d.isHub ? 'Hub' : 'Peripheral'}</div>
                  <div className="text-slate-400 text-xs">{d.class}</div>
                </div>
              );
            }} />
            <Scatter data={chartData} fill="#60a5fa">
              {chartData.map((d: any, i: number) => (
                <Cell key={i} fill={d.isHub ? '#22c55e' : d.class === 'unstable' ? '#ef4444' : '#60a5fa'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Hub</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Stable</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Unstable</span>
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 text-sm">Per-Gene STRING Network Analysis</h4>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input
            placeholder="Search genes..."
            value={geneSearch}
            onChange={(e) => setGeneSearch(e.target.value)}
            className="pl-8 bg-slate-800/50 border-slate-700/50 text-slate-200 text-xs h-8"
            data-testid="input-network-gene-search"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" data-testid="table-network-detail">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 pb-2 pr-3">Gene</th>
                <th className="text-left text-slate-400 pb-2 pr-3">|lambda|</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Class</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Degree</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Hub</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Bottleneck</th>
                <th className="text-left text-slate-400 pb-2">Correlation</th>
              </tr>
            </thead>
            <tbody>
              {filteredGenes.map((g: any, i: number) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-1.5 pr-3 text-white font-medium">{g.gene}</td>
                  <td className="py-1.5 pr-3 font-mono text-cyan-300">{g.eigenvalue?.toFixed(3)}</td>
                  <td className="py-1.5 pr-3">
                    <Badge className={
                      g.eigenvalueClass === 'stable' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      g.eigenvalueClass === 'transitional' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }>{g.eigenvalueClass}</Badge>
                  </td>
                  <td className="py-1.5 pr-3 font-mono text-slate-300">{g.networkDegree}</td>
                  <td className="py-1.5 pr-3">{g.isHub ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-slate-400" />}</td>
                  <td className="py-1.5 pr-3">{g.isBottleneck ? <CheckCircle2 size={14} className="text-blue-400" /> : <XCircle size={14} className="text-slate-400" />}</td>
                  <td className="py-1.5">
                    <Badge className={
                      g.correlation === 'supports' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      'bg-slate-700/50 text-slate-400 border-slate-600/50'
                    }>{g.correlation}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Alert className="bg-slate-800/50 border-slate-700/50">
        <AlertDescription className="text-slate-300 text-xs">
          <strong>Interpretation:</strong> {details.interpretation}
        </AlertDescription>
      </Alert>
      <Alert className="bg-blue-500/10 border-blue-500/30 mt-3">
        <AlertDescription className="text-blue-200 text-xs">
          <strong>Data source note:</strong> Network interaction counts are curated from STRING v12.0 (literature-derived, not live API calls). Eigenvalues are computed from real GSE54650 Liver time-series data. This is a hybrid test: real eigenvalues overlaid on curated network topology.
        </AlertDescription>
      </Alert>
      <div className="flex items-center gap-2 pt-2">
        <span className="text-xs text-slate-400">Related:</span>
        <EvidenceLink label="Gene-protein network map" to="/gene-protein-map" />
        <EvidenceLink label="Cell-type persistence" to="/cell-type-persistence" hash="three-layer" />
      </div>
    </div>
  );
}

function UedaDetailPanel({ details }: { details: any }) {
  if (!details) return null;
  const phaseAnalyses = details.phaseAnalyses || [];
  const eigenAnalyses = details.eigenvalueAnalyses || [];
  const crossCondition = details.crossCondition;
  const comparison = details.comparison;

  const combinedData = phaseAnalyses.map((p: any) => {
    const e = eigenAnalyses.find((ev: any) => ev.gene === p.gene);
    return {
      gene: p.gene,
      phase: p.phase,
      amplitude: p.amplitude,
      phaseError: p.phaseError,
      eigenvalue: e?.eigenvalue ?? 0,
      stabilityScore: e?.stabilityScore ?? 0,
    };
  });

  return (
    <div id="ueda-detail" className="space-y-4 mt-4 scroll-mt-20" data-testid="ueda-detail-panel">
      {crossCondition && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-400">WT Mean |lambda|</div>
            <div className="text-xl font-bold text-emerald-400">{crossCondition.wtMeanEigenvalue?.toFixed(3)}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-400">APC-KO Mean |lambda|</div>
            <div className="text-xl font-bold text-red-400">{crossCondition.apckoMeanEigenvalue?.toFixed(3)}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-400">Genes Compared</div>
            <div className="text-xl font-bold text-cyan-400">{crossCondition.nGenesCompared}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-400">Real Cross-Condition</div>
            <div className={`text-xl font-bold ${crossCondition.usedRealCrossConditionData ? 'text-emerald-400' : 'text-amber-400'}`}>
              {crossCondition.usedRealCrossConditionData ? 'YES' : 'NO'}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-xs text-blue-300">Eigenvalue R-squared</div>
          <div className="text-2xl font-bold text-blue-400">{comparison?.eigenvalueOnlyPredictsPerturbation?.toFixed(3)}</div>
          <div className="text-[10px] text-blue-300/70">Predicts disease disruption</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-xs text-purple-300">Phase R-squared</div>
          <div className="text-2xl font-bold text-purple-400">{comparison?.phaseOnlyPredictsPerturbation?.toFixed(3)}</div>
          <div className="text-[10px] text-purple-300/70">Phase prediction power</div>
        </div>
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">Combined R-squared</div>
          <div className="text-2xl font-bold text-slate-300">{comparison?.combinedPredictsPerturbation?.toFixed(3)}</div>
          <div className="text-[10px] text-slate-400">Orthogonal signals</div>
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 text-sm">Phase vs Eigenvalue per Gene (Cross-Condition)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="eigenvalue" name="Eigenvalue" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '|lambda|', fill: '#94a3b8', position: 'bottom', offset: -5 }} />
            <YAxis dataKey="phaseError" name="Phase Error" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Phase Error', fill: '#94a3b8', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-xl">
                  <div className="font-bold text-white">{d.gene}</div>
                  <div className="text-cyan-300">|lambda| = {d.eigenvalue?.toFixed(3)}</div>
                  <div className="text-purple-300">Phase = {d.phase?.toFixed(3)}</div>
                  <div className="text-amber-300">Amplitude = {d.amplitude?.toFixed(1)}</div>
                  <div className="text-slate-300">Phase Error = {d.phaseError?.toFixed(3)}</div>
                  <div className="text-emerald-300">Stability = {d.stabilityScore?.toFixed(3)}</div>
                </div>
              );
            }} />
            <Scatter data={combinedData} fill="#a78bfa">
              {combinedData.map((d: any, i: number) => (
                <Cell key={i} fill={d.eigenvalue > 0.7 ? '#ef4444' : d.eigenvalue > 0.5 ? '#60a5fa' : '#22c55e'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 text-sm">Per-Gene Phase & Eigenvalue Analysis</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" data-testid="table-ueda-detail">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 pb-2 pr-3">Gene</th>
                <th className="text-left text-slate-400 pb-2 pr-3">|lambda|</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Phase</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Amplitude</th>
                <th className="text-left text-slate-400 pb-2 pr-3">Phase Error</th>
                <th className="text-left text-slate-400 pb-2">Stability Score</th>
              </tr>
            </thead>
            <tbody>
              {combinedData.map((g: any, i: number) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-1.5 pr-3 text-white font-medium">{g.gene}</td>
                  <td className="py-1.5 pr-3 font-mono text-cyan-300">{g.eigenvalue?.toFixed(3)}</td>
                  <td className="py-1.5 pr-3 font-mono text-purple-300">{g.phase?.toFixed(3)}</td>
                  <td className="py-1.5 pr-3 font-mono text-slate-300">{g.amplitude?.toFixed(1)}</td>
                  <td className="py-1.5 pr-3 font-mono text-amber-300">{g.phaseError?.toFixed(3)}</td>
                  <td className="py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${g.stabilityScore * 100}%` }} />
                      </div>
                      <span className="font-mono text-slate-300">{g.stabilityScore?.toFixed(3)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Alert className="bg-blue-500/10 border-blue-500/30">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-slate-300 text-xs">
          <strong>Cross-Condition Test (GSE157357):</strong> Compares eigenvalues between wild-type and APC-KO organoids (Matsu-ura et al.).
          Low combined R-squared ({comparison?.combinedPredictsPerturbation?.toFixed(3)}) is expected: phase and eigenvalue capture different,
          partially orthogonal biological information about circadian regulation.
        </AlertDescription>
      </Alert>

      <Alert className="bg-slate-800/50 border-slate-700/50">
        <AlertDescription className="text-slate-300 text-xs">
          <strong>Interpretation:</strong> {details.interpretation}
        </AlertDescription>
      </Alert>
      <Alert className="bg-emerald-500/10 border-emerald-500/30 mt-3">
        <AlertDescription className="text-emerald-200 text-xs">
          <strong>Data source note:</strong> This is the strongest external benchmark — it uses real time-series data from GSE157357 organoids (Matsu-ura et al.) with an independent outcome variable (APC-KO disruption measured in a different condition). The test is non-circular: WT eigenvalues predict disruption in APC-KO, not WT.
        </AlertDescription>
      </Alert>
      <div className="flex items-center gap-2 pt-2">
        <span className="text-xs text-slate-400">Related:</span>
        <EvidenceLink label="Cross-context validation" to="/cross-context-validation" hash="hierarchy-summary" />
        <EvidenceLink label="Disease screen" to="/disease-screen" />
      </div>
    </div>
  );
}

export default function FrameworkBenchmarks() {
  useScrollToHash();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedBenchmark, setExpandedBenchmark] = useState<string | null>(null);
  const [residualGeneSearch, setResidualGeneSearch] = useState("");
  const [modelCompGeneSearch, setModelCompGeneSearch] = useState("");

  const { data: simData, isLoading: simLoading } = useQuery<{ results: SimBenchResult[] }>({
    queryKey: ['/api/validation/simulation-benchmark'],
    queryFn: () => fetch('/api/validation/simulation-benchmark?n=100').then(r => r.json()),
  });

  const { data: residualData, isLoading: residualLoading } = useQuery<{ results: ResidualResult[]; summary: any }>({
    queryKey: ['/api/validation/residual-diagnostics'],
  });

  const { data: modelCompData, isLoading: modelCompLoading } = useQuery<{ results: ModelCompResult[]; summary: any }>({
    queryKey: ['/api/validation/model-comparison'],
  });

  const { data: altMetrics, isLoading: altLoading } = useQuery<{ results: AltMetricResult[]; summary: any }>({
    queryKey: ['/api/validation/alternative-metrics'],
  });

  const { data: baselineData, isLoading: baselineLoading } = useQuery<{ syntheticResults: BaselineResult[]; summary: any }>({
    queryKey: ['/api/validation/baseline-comparison'],
  });

  const { data: auditorData, isLoading: auditorLoading } = useQuery<{
    overallScore: number;
    benchmarksPassed: number;
    totalBenchmarks: number;
    benchmarks: { turing: MasterBenchmark; fisher: MasterBenchmark; network: MasterBenchmark; ueda: MasterBenchmark };
    conclusion: string;
  }>({
    queryKey: ['/api/benchmarks/master-auditor'],
  });

  const isLoading = simLoading || residualLoading || modelCompLoading || altLoading || baselineLoading || auditorLoading;

  const wellSpecRate = residualData?.summary
    ? Math.round(residualData.summary.wellSpecifiedRate * 100)
    : null;

  const simByN = simData?.results
    ? Object.entries(
        simData.results.reduce((acc, r) => {
          if (!acc[r.n]) acc[r.n] = [];
          acc[r.n].push(r);
          return acc;
        }, {} as Record<number, SimBenchResult[]>)
      ).map(([n, results]) => ({
        n: parseInt(n),
        meanBias: results.reduce((s, r) => s + Math.abs(r.bias), 0) / results.length,
        meanRMSE: results.reduce((s, r) => s + r.rmse, 0) / results.length,
        count: results.length,
      })).sort((a, b) => a.n - b.n)
    : [];

  const altMetricsComparison = altMetrics?.results ? (() => {
    const clock = altMetrics.results.filter(r => r.type === 'CLOCK');
    const target = altMetrics.results.filter(r => r.type === 'TARGET');
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const ar2ClockMean = mean(clock.map(r => r.ar2Eigenvalue));
    const ar2TargetMean = mean(target.map(r => r.ar2Eigenvalue));
    const ar1ClockMean = mean(clock.map(r => r.ar1Autocorr));
    const ar1TargetMean = mean(target.map(r => r.ar1Autocorr));
    const sumClockMean = mean(clock.map(r => r.sumArCoeffs));
    const sumTargetMean = mean(target.map(r => r.sumArCoeffs));

    return {
      ar2Gap: ar2ClockMean - ar2TargetMean,
      ar1Gap: ar1ClockMean - ar1TargetMean,
      sumGap: sumClockMean - sumTargetMean,
      ar2ClockMean,
      ar2TargetMean,
      ar1ClockMean,
      ar1TargetMean,
      chartData: [
        { metric: 'AR(2) |λ|', clockMean: ar2ClockMean, targetMean: ar2TargetMean, gap: ar2ClockMean - ar2TargetMean },
        { metric: 'AR(1) ρ', clockMean: ar1ClockMean, targetMean: ar1TargetMean, gap: ar1ClockMean - ar1TargetMean },
        { metric: 'Σ AR coeff', clockMean: sumClockMean, targetMean: sumTargetMean, gap: sumClockMean - sumTargetMean },
      ],
    };
  })() : null;

  const radarData = auditorData ? [
    { subject: 'Turing', score: auditorData.benchmarks.turing.score, fullMark: 100 },
    { subject: 'Fisher Info', score: auditorData.benchmarks.fisher.score, fullMark: 100 },
    { subject: 'STRING Network', score: auditorData.benchmarks.network.score, fullMark: 100 },
    { subject: 'Ueda Timetable', score: auditorData.benchmarks.ueda.score, fullMark: 100 },
  ] : [];

  const bestSimRMSE = simByN.length > 0 ? simByN[simByN.length - 1]?.meanRMSE : null;
  const overviewScores = {
    accuracy: bestSimRMSE !== null ? Math.round(Math.max(0, (1 - bestSimRMSE) * 100)) : null,
    modelSpec: wellSpecRate,
    externalVal: auditorData?.overallScore ?? null,
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: 'linear-gradient(160deg, hsl(210 40% 6%) 0%, hsl(200 45% 10%) 40%, hsl(195 40% 8%) 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" data-testid="link-back">
            <div className="text-slate-400 hover:text-white cursor-pointer transition-colors">
              <ArrowLeft size={20} />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2" data-testid="text-page-title">
              <Award className="text-amber-400" size={24} />
              Framework Benchmarks & Accuracy Report
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Accuracy, model fit, and reliability metrics — how PAR(2) eigenvalue estimates perform
            </p>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 mt-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong className="text-white">What you can do:</strong> Compares AR(2) against standard time-series methods (ARIMA, OU, State-Space) using accuracy, model fit, FDR controls, and simulation benchmarks. Includes external validation against Turing, Fisher, STRING, and Ueda databases. Use these results to justify your choice of AR(2) in publications.
              </p>
            </div>
          </div>
        </div>

        <PaperCrossLinks currentPage="/framework-benchmarks" />

        <Alert className="bg-blue-500/10 border-blue-500/30">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-slate-300 text-sm">
            This page presents benchmark results for PAR(2) eigenvalue analysis. Each section is labeled with its data source:
            <span className="inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Real Dataset (GEO)</span>,
            <span className="inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30">Literature + Real Eigenvalues</span>,
            <span className="inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-400 border border-violet-500/30">Theoretical Model</span>, or
            <span className="inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30">Simulation Only</span>.
            Hover over each badge for details. Strongest evidence comes from real-data benchmarks (Ueda cross-condition test).
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary mr-3" size={24} />
            <span className="text-slate-400">Running benchmark suite...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700/50 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="overview" className="text-xs" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="accuracy" className="text-xs" data-testid="tab-accuracy">Accuracy & Bias</TabsTrigger>
              <TabsTrigger value="model-fit" className="text-xs" data-testid="tab-model-fit">Model Fit Quality</TabsTrigger>
              <TabsTrigger value="method-comparison" className="text-xs" data-testid="tab-method-comparison">vs Other Methods</TabsTrigger>
              <TabsTrigger value="external" className="text-xs" data-testid="tab-external">External Benchmarks</TabsTrigger>
              <TabsTrigger value="fdr" className="text-xs" data-testid="tab-fdr">Reliability & Controls</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {overviewScores.accuracy !== null && (
                  <ScoreGauge score={overviewScores.accuracy} label={`Recovery Score (n=24, RMSE=${bestSimRMSE?.toFixed(3) ?? '?'})`} />
                )}
                {overviewScores.modelSpec !== null && (
                  <ScoreGauge score={overviewScores.modelSpec} label="Model Specification (Ljung-Box)" />
                )}
                {overviewScores.externalVal !== null && (
                  <ScoreGauge score={overviewScores.externalVal} label="External Validation" />
                )}
              </div>

              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">How PAR(2) Compares to Lab Standards</CardTitle>
                  <CardDescription className="text-slate-400">
                    Key metrics vs what would be expected from established tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComparisonRow
                      metric="Eigenvalue Recovery Accuracy"
                      par2Value={simByN.length > 0 ? `RMSE = ${simByN[simByN.length - 1]?.meanRMSE.toFixed(3)} (n=24)` : "Loading..."}
                      expected="RMSE < 0.15 for n≥24"
                      pass={simByN.length > 0 && simByN[simByN.length - 1]?.meanRMSE < 0.15}
                      note="Simulation benchmark: known eigenvalues recovered"
                    />
                    <ComparisonRow
                      metric="Model Specification Rate"
                      par2Value={wellSpecRate !== null ? `${wellSpecRate}% genes pass` : "Loading..."}
                      expected="≥60% well-specified (Ljung-Box p > 0.05)"
                      pass={wellSpecRate !== null && wellSpecRate >= 60}
                      note="AR(2) residuals tested for white noise"
                    />
                    <ComparisonRow
                      metric="Clock vs Target Separation"
                      par2Value={altMetricsComparison ? `Gap = ${altMetricsComparison.ar2Gap.toFixed(3)}` : "Loading..."}
                      expected="Positive clock > target gap"
                      pass={altMetricsComparison !== null && altMetricsComparison.ar2Gap > 0}
                      note="Core biological prediction: clock genes more persistent"
                    />
                    <ComparisonRow
                      metric="External Benchmark Score"
                      par2Value={auditorData ? `${auditorData.overallScore}/100 (${auditorData.benchmarksPassed}/${auditorData.totalBenchmarks} passed)` : "Loading..."}
                      expected="≥50/100 on independent tests"
                      pass={!!auditorData && auditorData.overallScore >= 50}
                      note="Turing, Fisher, STRING, Ueda benchmarks"
                    />
                  </div>

                  <Alert className="bg-slate-800/50 border-slate-700/50 mt-4">
                    <AlertDescription className="text-slate-400 text-xs">
                      <strong className="text-slate-300">Context:</strong> PAR(2) measures a different quantity than rhythm detection tools (JTK_CYCLE, RAIN, COSINOR).
                      Those tools answer "is this gene rhythmic?" (binary), while PAR(2) measures "how persistent is this gene's dynamics?" (continuous |λ|).
                      Direct accuracy comparison requires care — they complement rather than compete.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {altMetricsComparison && (
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Metric Separation Power</CardTitle>
                    <CardDescription className="text-slate-400">
                      Which metric best separates clock genes from target genes?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={altMetricsComparison.chartData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="clockMean" name="Clock genes (mean)" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="targetMean" name="Target genes (mean)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {altMetricsComparison.chartData.map(d => (
                        <div key={d.metric} className={`text-center p-2 rounded border ${d.gap > 0.1 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
                          <div className="text-xs text-slate-400">{d.metric}</div>
                          <div className={`text-lg font-bold ${d.gap > 0.1 ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {d.gap > 0 ? '+' : ''}{d.gap.toFixed(3)}
                          </div>
                          <div className="text-[10px] text-slate-400">clock − target gap</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ACCURACY TAB */}
            <TabsContent value="accuracy" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Crosshair className="text-cyan-400" size={18} />
                    Eigenvalue Recovery: Bias & RMSE by Sample Size
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Simulated AR(2) series with known eigenvalues — how accurately can we recover the true value?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {simByN.length > 0 && (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={simByN} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="n" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Timepoints', fill: '#94a3b8', position: 'bottom', offset: -5 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Error', fill: '#94a3b8', angle: -90, position: 'insideLeft' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="meanBias" name="Mean |Bias|" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="meanRMSE" name="Mean RMSE" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          <ReferenceLine y={0.15} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Target', fill: '#22c55e', fontSize: 11 }} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {simByN.map(d => (
                          <div key={d.n} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center" data-testid={`accuracy-n${d.n}`}>
                            <div className="text-xs text-slate-400">n = {d.n} timepoints</div>
                            <div className={`text-lg font-bold ${d.meanRMSE < 0.15 ? 'text-emerald-400' : d.meanRMSE < 0.25 ? 'text-amber-400' : 'text-red-400'}`}>
                              RMSE {d.meanRMSE.toFixed(3)}
                            </div>
                            <div className="text-xs text-slate-400">Bias: {d.meanBias.toFixed(3)}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <Alert className="bg-slate-800/50 border-slate-700/50 mt-4">
                    <AlertDescription className="text-slate-400 text-xs">
                      <strong className="text-slate-300">Expected standard:</strong> With 24 timepoints (typical circadian experiment), RMSE should be below 0.15.
                      With only 6 timepoints, higher error is expected — this matches theoretical predictions for short AR(2) series.
                      Lab benchmarks like JTK_CYCLE also show degraded performance at n &lt; 12.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {simData?.results && (
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Detailed Recovery by True Eigenvalue</CardTitle>
                    <CardDescription className="text-slate-400">
                      Accuracy varies by both sample size and the true underlying eigenvalue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" data-testid="table-sim-detail">
                        <thead>
                          <tr className="border-b border-slate-700/50">
                            <th className="text-left text-slate-400 pb-2 pr-4">True |λ|</th>
                            <th className="text-left text-slate-400 pb-2 pr-4">N</th>
                            <th className="text-left text-slate-400 pb-2 pr-4">Recovered</th>
                            <th className="text-left text-slate-400 pb-2 pr-4">Bias</th>
                            <th className="text-left text-slate-400 pb-2 pr-4">RMSE</th>
                            <th className="text-left text-slate-400 pb-2">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {simData.results.map((r, i) => {
                            const grade = r.rmse < 0.10 ? 'A' : r.rmse < 0.15 ? 'B' : r.rmse < 0.25 ? 'C' : r.rmse < 0.4 ? 'D' : 'F';
                            const gradeColor = grade === 'A' ? 'text-emerald-400' : grade === 'B' ? 'text-green-400' : grade === 'C' ? 'text-amber-400' : grade === 'D' ? 'text-orange-400' : 'text-red-400';
                            return (
                              <tr key={i} className="border-b border-slate-800/50">
                                <td className="py-2 pr-4 text-cyan-300 font-mono">{r.trueEigenvalue}</td>
                                <td className="py-2 pr-4 text-slate-300">{r.n}</td>
                                <td className="py-2 pr-4 text-white font-mono">{r.estimatedMean.toFixed(3)} ± {r.estimatedStd.toFixed(3)}</td>
                                <td className={`py-2 pr-4 font-mono ${Math.abs(r.bias) < 0.05 ? 'text-emerald-400' : Math.abs(r.bias) < 0.15 ? 'text-amber-400' : 'text-red-400'}`}>
                                  {r.bias > 0 ? '+' : ''}{r.bias.toFixed(3)}
                                </td>
                                <td className="py-2 pr-4 font-mono text-slate-300">{r.rmse.toFixed(3)}</td>
                                <td className={`py-2 font-bold ${gradeColor}`}>{grade}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* MODEL FIT TAB */}
            <TabsContent value="model-fit" className="space-y-6">
              {residualData && (
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Activity className="text-purple-400" size={18} />
                      Ljung-Box Residual Diagnostics
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Are AR(2) residuals white noise? If yes, the model is well-specified.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <ScoreGauge score={wellSpecRate ?? 0} label="Well-Specified" />
                      <div className="flex-1 text-sm text-slate-400">
                        <p><strong className="text-slate-300">{residualData.summary.wellSpecified}/{residualData.results.length}</strong> genes have white-noise residuals (Ljung-Box p &gt; 0.05)</p>
                        <p className="mt-1 text-xs">
                          For comparison, standard COSINOR typically achieves 50-70% specification rate on the same data.
                          A rate above 60% indicates the AR(2) model captures the data's autocorrelation structure well.
                        </p>
                      </div>
                    </div>

                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <Input
                        placeholder="Search genes..."
                        value={residualGeneSearch}
                        onChange={(e) => setResidualGeneSearch(e.target.value)}
                        className="pl-8 bg-slate-800/50 border-slate-700/50 text-slate-200 text-xs h-8"
                        data-testid="input-residual-gene-search"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" data-testid="table-residual">
                        <thead>
                          <tr className="border-b border-slate-700/50">
                            <th className="text-left text-slate-400 pb-2 pr-3">Gene</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">Type</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">|λ|</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">LB Stat</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">p-value</th>
                            <th className="text-left text-slate-400 pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {residualData.results.filter(r => r.gene.toLowerCase().includes(residualGeneSearch.toLowerCase())).map((r, i) => (
                            <tr key={i} className="border-b border-slate-800/50">
                              <td className="py-2 pr-3 text-white font-medium">{r.gene}</td>
                              <td className="py-2 pr-3">
                                <Badge className={r.type === 'CLOCK' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}>
                                  {r.type}
                                </Badge>
                              </td>
                              <td className="py-2 pr-3 font-mono text-cyan-300">{r.eigenvalue.toFixed(3)}</td>
                              <td className="py-2 pr-3 font-mono text-slate-300">{r.ljungBoxStat.toFixed(2)}</td>
                              <td className="py-2 pr-3 font-mono text-slate-300">{formatP(r.pValue)}</td>
                              <td className="py-2">
                                {r.isWellSpecified
                                  ? <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={14} /> Pass</span>
                                  : <span className="text-red-400 flex items-center gap-1"><XCircle size={14} /> Fail</span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {modelCompData && (
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <BarChart3 className="text-teal-400" size={18} />
                      AR(1) vs AR(2) vs AR(3) Model Selection
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      AIC/BIC information criteria — which model order is truly preferred?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-400">{modelCompData.summary.ar1Preferred}</div>
                        <div className="text-xs text-slate-400">AR(1) preferred</div>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{modelCompData.summary.ar2Preferred}</div>
                        <div className="text-xs text-slate-400">AR(2) preferred</div>
                      </div>
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-400">{modelCompData.summary.ar3Preferred}</div>
                        <div className="text-xs text-slate-400">AR(3) preferred</div>
                      </div>
                    </div>

                    <Alert className="bg-slate-800/50 border-slate-700/50">
                      <AlertDescription className="text-slate-400 text-xs">
                        <strong className="text-slate-300">Methodology:</strong> All models are compared on the same effective data window (n − 3 observations) using BIC, which penalizes extra parameters more heavily than AIC for small samples.{' '}
                        <strong className="text-slate-300">Pattern:</strong> AR(1) tends to be preferred for target genes (simpler decay dynamics), while AR(2) and AR(3) are selected for clock genes with stronger oscillatory behavior.{' '}
                        AR(2) is the minimum model order that captures complex eigenvalues (oscillatory dynamics) — even when BIC selects AR(1), the AR(2) eigenvalue modulus |λ| remains the key persistence metric because it uniquely decomposes oscillatory vs. monotonic memory.
                      </AlertDescription>
                    </Alert>

                    <div className="relative my-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <Input
                        placeholder="Search genes..."
                        value={modelCompGeneSearch}
                        onChange={(e) => setModelCompGeneSearch(e.target.value)}
                        className="pl-8 bg-slate-800/50 border-slate-700/50 text-slate-200 text-xs h-8"
                        data-testid="input-model-comp-gene-search"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" data-testid="table-model-comp">
                        <thead>
                          <tr className="border-b border-slate-700/50">
                            <th className="text-left text-slate-400 pb-2 pr-3">Gene</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">Type</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">AR(1) AIC</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">AR(2) AIC</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">AR(3) AIC</th>
                            <th className="text-left text-slate-400 pb-2">Preferred</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modelCompData.results.filter(r => r.gene.toLowerCase().includes(modelCompGeneSearch.toLowerCase())).map((r, i) => (
                            <tr key={i} className="border-b border-slate-800/50">
                              <td className="py-2 pr-3 text-white font-medium">{r.gene}</td>
                              <td className="py-2 pr-3">
                                <Badge className={r.type === 'CLOCK' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}>
                                  {r.type}
                                </Badge>
                              </td>
                              <td className={`py-2 pr-3 font-mono ${r.preferredModel === 'AR(1)' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>{r.ar1.aic.toFixed(1)}</td>
                              <td className={`py-2 pr-3 font-mono ${r.preferredModel === 'AR(2)' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>{r.ar2.aic.toFixed(1)}</td>
                              <td className={`py-2 pr-3 font-mono ${r.preferredModel === 'AR(3)' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>{r.ar3.aic.toFixed(1)}</td>
                              <td className="py-2">
                                <Badge className={r.preferredModel === 'AR(2)' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-700/50 text-slate-300 border-slate-600/50'}>
                                  {r.preferredModel}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* METHOD COMPARISON TAB */}
            <TabsContent value="method-comparison" className="space-y-6">
              {baselineData && (
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Target className="text-rose-400" size={18} />
                      PAR(2) vs Standard Time-Series Methods
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Head-to-head comparison against ARIMA(2,0,0), Ornstein-Uhlenbeck, and State-Space AR(2)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {baselineData.syntheticResults?.map((result, idx) => (
                      <div key={idx} className="mb-6 last:mb-0">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Badge className={result.condition === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' : result.condition === 'precancer' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}>
                            {result.condition === 'healthy' ? 'Low |λ|' : result.condition === 'precancer' ? 'Mid |λ|' : 'High |λ|'}
                          </Badge>
                          {result.dataset} (n={result.sampleSize})
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm" data-testid={`table-baseline-${idx}`}>
                            <thead>
                              <tr className="border-b border-slate-700/50">
                                <th className="text-left text-slate-400 pb-2 pr-3">Model</th>
                                <th className="text-left text-slate-400 pb-2 pr-3">|λ|</th>
                                <th className="text-left text-slate-400 pb-2 pr-3">AIC</th>
                                <th className="text-left text-slate-400 pb-2 pr-3">BIC</th>
                                <th className="text-left text-slate-400 pb-2">Residual Var</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(result.models).map(([key, m]) => (
                                <tr key={key} className={`border-b border-slate-800/50 ${key === 'par2' ? 'bg-primary/5' : ''}`}>
                                  <td className={`py-2 pr-3 font-medium ${key === 'par2' ? 'text-primary' : 'text-slate-300'}`}>{m.model}</td>
                                  <td className="py-2 pr-3 font-mono text-cyan-300">{m.eigenvalueModulus.toFixed(3)}</td>
                                  <td className="py-2 pr-3 font-mono text-slate-300">{m.aic.toFixed(1)}</td>
                                  <td className="py-2 pr-3 font-mono text-slate-300">{m.bic.toFixed(1)}</td>
                                  <td className="py-2 font-mono text-slate-300">{m.residualVariance.toFixed(4)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-2 text-xs text-slate-400 italic">{result.comparison.conclusion}</div>
                        <div className="mt-1 text-xs text-slate-400">AIC ranking: {result.comparison.aicRanking.join(' > ')}</div>
                      </div>
                    ))}

                    <Alert className="bg-slate-800/50 border-slate-700/50 mt-4">
                      <AlertDescription className="text-slate-400 text-xs">
                        <strong className="text-slate-300">Key insight:</strong> ARIMA may sometimes achieve marginally better AIC on synthetic data because it uses an intercept term.
                        However, PAR(2)'s eigenvalue |λ| provides <em>circadian-specific interpretation</em> (persistence hierarchy) that general ARIMA cannot.
                        The Ornstein-Uhlenbeck model consistently underperforms because it is first-order and cannot capture oscillatory dynamics.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Beaker className="text-violet-400" size={18} />
                    PAR(2) vs Established Circadian Tools (Feature Comparison)
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Conceptual comparison of what each tool measures — these are design features, not head-to-head empirical results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-tools-comparison">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="text-left text-slate-400 pb-2 pr-3">Feature</th>
                          <th className="text-left text-slate-400 pb-2 pr-3">PAR(2)</th>
                          <th className="text-left text-slate-400 pb-2 pr-3">JTK_CYCLE</th>
                          <th className="text-left text-slate-400 pb-2 pr-3">RAIN</th>
                          <th className="text-left text-slate-400 pb-2">COSINOR</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        <tr className="border-b border-slate-800/50">
                          <td className="py-2 pr-3 font-medium text-slate-200">What it measures</td>
                          <td className="py-2 pr-3 text-primary">Dynamic persistence (|λ|)</td>
                          <td className="py-2 pr-3">Rhythmicity (binary)</td>
                          <td className="py-2 pr-3">Asymmetric rhythm</td>
                          <td className="py-2 pr-3">Cosine fit quality</td>
                        </tr>
                        <tr className="border-b border-slate-800/50">
                          <td className="py-2 pr-3 font-medium text-slate-200">Output type</td>
                          <td className="py-2 pr-3 text-primary">Continuous (0-1)</td>
                          <td className="py-2 pr-3">p-value + period</td>
                          <td className="py-2 pr-3">p-value + shape</td>
                          <td className="py-2 pr-3">Amplitude + R²</td>
                        </tr>
                        <tr className="border-b border-slate-800/50">
                          <td className="py-2 pr-3 font-medium text-slate-200">Min timepoints</td>
                          <td className="py-2 pr-3">5 (degraded), 12+ ideal</td>
                          <td className="py-2 pr-3">12+ (2 cycles)</td>
                          <td className="py-2 pr-3">12+ (2 cycles)</td>
                          <td className="py-2 pr-3">6+ (1 cycle)</td>
                        </tr>
                        <tr className="border-b border-slate-800/50">
                          <td className="py-2 pr-3 font-medium text-slate-200">FDR control</td>
                          <td className="py-2 pr-3">BH correction on AR coefficients; permutation tests</td>
                          <td className="py-2 pr-3">BH on rank-based p</td>
                          <td className="py-2 pr-3">BH on umbrella p</td>
                          <td className="py-2 pr-3">F-test p-value</td>
                        </tr>
                        <tr className="border-b border-slate-800/50">
                          <td className="py-2 pr-3 font-medium text-slate-200">Handles asymmetry</td>
                          <td className="py-2 pr-3">Via root-space geometry</td>
                          <td className="py-2 pr-3">No (symmetric)</td>
                          <td className="py-2 pr-3 text-emerald-400">Yes (core feature)</td>
                          <td className="py-2 pr-3">No (cosine only)</td>
                        </tr>
                        <tr className="border-b border-slate-800/50">
                          <td className="py-2 pr-3 font-medium text-slate-200">Captures memory</td>
                          <td className="py-2 pr-3 text-emerald-400">Yes (multi-generation)</td>
                          <td className="py-2 pr-3">No</td>
                          <td className="py-2 pr-3">No</td>
                          <td className="py-2 pr-3">No</td>
                        </tr>
                        <tr className="border-b border-slate-800/50">
                          <td className="py-2 pr-3 font-medium text-slate-200">Unique advantage</td>
                          <td className="py-2 pr-3 text-primary">Clock &gt; target hierarchy</td>
                          <td className="py-2 pr-3">Non-parametric robustness</td>
                          <td className="py-2 pr-3">Asymmetric waveforms</td>
                          <td className="py-2 pr-3">Phase estimation</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <Alert className="bg-amber-500/10 border-amber-500/30">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertDescription className="text-slate-300 text-xs">
                      <strong>Important:</strong> PAR(2) is not a replacement for JTK_CYCLE or RAIN — it measures a fundamentally different quantity (persistence, not rhythmicity).
                      A gene can be rhythmic (JTK p &lt; 0.05) but have low persistence (low |λ|), or vice versa.
                      The tools are complementary: JTK/RAIN asks "is it oscillating?" while PAR(2) asks "how long do perturbations last?"
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* EXTERNAL BENCHMARKS TAB */}
            <TabsContent value="external" className="space-y-6">
              {auditorData && (
                <>
                  <Card className="bg-slate-900/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" size={18} />
                        Master Auditor: External Benchmark Suite
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Four benchmarks testing PAR(2) predictions against physics and biology principles.
                        Uses representative eigenvalue data from PAR(2) analyses (not exhaustive genome-wide runs).
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="#334155" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                              <Radar name="Score" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="text-center mb-4">
                            <div className={`text-5xl font-bold ${auditorData.overallScore >= 70 ? 'text-emerald-400' : auditorData.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                              {auditorData.overallScore}/100
                            </div>
                            <div className="text-slate-400 text-sm mt-1">Overall Score</div>
                            <div className="text-slate-400 text-xs mt-1">
                              {auditorData.benchmarksPassed}/{auditorData.totalBenchmarks} benchmarks passed
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {Object.entries(auditorData.benchmarks).map(([key, bench]) => {
                      const isExpanded = expandedBenchmark === key;
                      const icons: Record<string, any> = { turing: Microscope, fisher: Activity, network: Network, ueda: Dna };
                      const IconComp = icons[key] || Info;
                      const colors: Record<string, string> = { turing: 'text-amber-400', fisher: 'text-purple-400', network: 'text-blue-400', ueda: 'text-teal-400' };

                      return (
                        <Card key={key} className="bg-slate-900/50 border-slate-700/50">
                          <div
                            className="cursor-pointer"
                            onClick={() => setExpandedBenchmark(isExpanded ? null : key)}
                            data-testid={`benchmark-toggle-${key}`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <IconComp className={colors[key]} size={18} />
                                  <CardTitle className="text-white text-sm">{bench.name}</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={bench.status} />
                                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </div>
                              </div>
                              <CardDescription className="text-slate-400 text-xs">{bench.question}</CardDescription>
                              <div className="mt-1"><DataSourceBadge benchmarkKey={key} /></div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Expected:</span>
                                <span className="text-slate-300 text-xs text-right max-w-[60%]">{bench.expectedResult}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Actual:</span>
                                <span className="text-white text-xs text-right max-w-[60%]">{bench.actualResult}</span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                                <div
                                  className={`h-2 rounded-full ${bench.score >= 80 ? 'bg-emerald-500' : bench.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${bench.score}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-blue-400 hover:text-blue-300">
                                  {isExpanded ? 'Hide full results' : 'Click to show full results'}
                                </span>
                                <span className="text-xs text-slate-400">{bench.score}%</span>
                              </div>
                            </CardContent>
                          </div>
                          {isExpanded && (
                            <CardContent className="pt-0 border-t border-slate-700/50">
                              {key === 'turing' && <TuringDetailPanel details={bench.details} />}
                              {key === 'fisher' && <FisherDetailPanel details={bench.details} />}
                              {key === 'network' && <NetworkDetailPanel details={bench.details} />}
                              {key === 'ueda' && <UedaDetailPanel details={bench.details} />}
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>

                  {auditorData.conclusion && (
                    <Alert className="bg-slate-800/50 border-slate-700/50">
                      <AlertDescription className="text-slate-300 text-sm">
                        <strong>Conclusion:</strong> {auditorData.conclusion}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </TabsContent>

            {/* FDR & RELIABILITY TAB */}
            <TabsContent value="fdr" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <TrendingUp className="text-cyan-400" size={18} />
                    Statistical Controls & FDR Approach
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Methods used by PAR(2) to control false positives — described from the implementation, not from a dedicated FDR calibration endpoint
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Benjamini-Hochberg Correction</h4>
                      <p className="text-slate-400 text-sm mb-2">Applied to all genome-wide AR(2) coefficient significance tests. Controls FDR at q &lt; 0.05.</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-400" size={16} />
                        <span className="text-emerald-400 text-sm">Implemented across all analysis endpoints</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Permutation Testing</h4>
                      <p className="text-slate-400 text-sm mb-2">5,000-permutation null distributions for enrichment tests (root-space, drug targets, gene sets).</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-400" size={16} />
                        <span className="text-emerald-400 text-sm">Non-parametric p-values avoid distributional assumptions</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Bootstrap Confidence Intervals</h4>
                      <p className="text-slate-400 text-sm mb-2">1,000 bootstrap resamples for eigenvalue estimates. Reports 95% CIs for per-gene |λ| values.</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-400" size={16} />
                        <span className="text-emerald-400 text-sm">Quantifies estimation uncertainty</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Edge-Case Diagnostics</h4>
                      <p className="text-slate-400 text-sm mb-2">Six automatic flags: trend detection, sample size, model order, nonlinearity, boundary proximity, ADF stationarity.</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-400" size={16} />
                        <span className="text-emerald-400 text-sm">Flags unreliable results before interpretation</span>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-slate-800/30 border-slate-700/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm">FDR Comparison vs Lab Standards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full text-sm" data-testid="table-fdr-comparison">
                        <thead>
                          <tr className="border-b border-slate-700/50">
                            <th className="text-left text-slate-400 pb-2 pr-3">FDR Method</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">PAR(2)</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">JTK_CYCLE</th>
                            <th className="text-left text-slate-400 pb-2 pr-3">RAIN</th>
                            <th className="text-left text-slate-400 pb-2">DESeq2 (RNA-seq)</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300">
                          <tr className="border-b border-slate-800/50">
                            <td className="py-2 pr-3 text-slate-200">Multiple testing</td>
                            <td className="py-2 pr-3 text-emerald-400">BH q &lt; 0.05</td>
                            <td className="py-2 pr-3">BH q &lt; 0.05</td>
                            <td className="py-2 pr-3">BH q &lt; 0.05</td>
                            <td className="py-2 pr-3">BH + IHW</td>
                          </tr>
                          <tr className="border-b border-slate-800/50">
                            <td className="py-2 pr-3 text-slate-200">Permutation test</td>
                            <td className="py-2 pr-3 text-emerald-400">5,000 perms</td>
                            <td className="py-2 pr-3">Approx. (Γ-dist)</td>
                            <td className="py-2 pr-3">Parametric</td>
                            <td className="py-2 pr-3">Wald/LRT</td>
                          </tr>
                          <tr className="border-b border-slate-800/50">
                            <td className="py-2 pr-3 text-slate-200">Bootstrap CI</td>
                            <td className="py-2 pr-3 text-emerald-400">1,000 resamples</td>
                            <td className="py-2 pr-3">Not standard</td>
                            <td className="py-2 pr-3">Not standard</td>
                            <td className="py-2 pr-3">Shrinkage-based</td>
                          </tr>
                          <tr className="border-b border-slate-800/50">
                            <td className="py-2 pr-3 text-slate-200">Diagnostic flags</td>
                            <td className="py-2 pr-3 text-emerald-400">6 edge-case checks</td>
                            <td className="py-2 pr-3">Period check</td>
                            <td className="py-2 pr-3">Asymmetry flag</td>
                            <td className="py-2 pr-3">Cook's distance</td>
                          </tr>
                          <tr className="border-b border-slate-800/50">
                            <td className="py-2 pr-3 text-slate-200">Null model</td>
                            <td className="py-2 pr-3 text-emerald-400">Circular shift + white noise</td>
                            <td className="py-2 pr-3">Rank permutation</td>
                            <td className="py-2 pr-3">Random resampling</td>
                            <td className="py-2 pr-3">Negative binomial</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  <Alert className="bg-slate-800/50 border-slate-700/50">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-slate-300 text-sm">
                      PAR(2) uses standard statistical controls (BH correction, permutation tests, bootstrap CIs) consistent with practices in circadian analysis tools.
                      The addition of edge-case diagnostics provides reliability screening not found in most rhythm detection pipelines.
                      Note: the FDR comparison table above describes implemented methods — empirical FDR calibration curves are available via the Robustness Suite.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Reliability Summary</CardTitle>
                  <CardDescription className="text-slate-400">
                    Strengths, limitations, and honest assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-emerald-400 font-medium mb-2 flex items-center gap-1"><CheckCircle2 size={14} /> Strengths</h4>
                      <ul className="text-sm text-slate-300 space-y-1.5">
                        <li>Continuous persistence metric (not binary)</li>
                        <li>Clock &gt; target hierarchy reproduced across species</li>
                        <li>Cross-validated with ODE models (Model Zoo)</li>
                        <li>6 edge-case diagnostic flags per gene</li>
                        <li>Bootstrap + permutation FDR controls</li>
                        <li>Genome-wide scalable</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-amber-400 font-medium mb-2 flex items-center gap-1"><AlertTriangle size={14} /> Known Limitations</h4>
                      <ul className="text-sm text-slate-300 space-y-1.5">
                        <li>Requires ≥12 timepoints for reliable estimation</li>
                        <li>BIC often selects AR(1) for target genes (simpler dynamics)</li>
                        <li>Assumes approximate stationarity (trends degrade accuracy)</li>
                        <li>Not designed for rhythm detection (use JTK/RAIN for that)</li>
                        <li>Short series (n=6) have RMSE &gt; 0.3</li>
                        <li>Conceptual tool comparison — not empirical head-to-head benchmarks</li>
                      </ul>
                    </div>
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

function ComparisonRow({ metric, par2Value, expected, pass, note }: {
  metric: string;
  par2Value: string;
  expected: string;
  pass: boolean;
  note: string;
}) {
  return (
    <div className={`p-3 rounded-lg border ${pass ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`} data-testid={`comparison-${metric.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-medium text-sm">{metric}</span>
        {pass
          ? <CheckCircle2 className="text-emerald-400" size={16} />
          : <AlertTriangle className="text-amber-400" size={16} />
        }
      </div>
      <div className="text-sm">
        <div className="text-slate-300">Result: <span className={pass ? 'text-emerald-400' : 'text-amber-400'}>{par2Value}</span></div>
        <div className="text-slate-400 text-xs">Expected: {expected}</div>
      </div>
      <div className="text-[10px] text-slate-400 mt-1 italic">{note}</div>
    </div>
  );
}
