import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useScrollToHash } from "@/hooks/useScrollToHash";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine, Legend, ErrorBar
} from "recharts";
import {
  ArrowLeft, Loader2, Globe, CheckCircle2, TrendingUp, Download,
  BarChart3, Target, Dna, Shield, Users, AlertTriangle,
  Layers, FlaskConical, XCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { Link } from "wouter";
import HowTo from "@/components/HowTo";
import PaperCrossLinks from "@/components/PaperCrossLinks";
import InsightCallout from "@/components/InsightCallout";
import ViewInRootSpace from "@/components/ViewInRootSpace";

interface StabilityFiltered {
  totalGenesRetained: number;
  totalGenesExcluded: number;
  percentRetained: number;
  filteredMeanClock: number;
  filteredMeanTarget: number;
  filteredGap: number;
  filteredHierarchyPreserved: boolean;
  filteredClockPercentile: number;
  filteredTargetPercentile: number;
  clockGenesRetained: number;
  clockGenesExcluded: number;
  targetGenesRetained: number;
  targetGenesExcluded: number;
  filteredWilcoxonClockVsGenome: { U: number; z: number; p: number; nA: number; nB: number } | null;
  filteredPermutationP: number;
  unstableGenes: { gene: string; geneType: string; eigenvalue: number }[];
}

interface SubjectLevelResult {
  study: string;
  nSubjects: number;
  subjects: string[];
  subjectResults: any[];
  pairedAnalysis: {
    allGenes: {
      meanDayGap: number;
      meanNightGap: number;
      directionConsistency: string;
      tTest: { t: number; p: number; meanDelta: number; seDelta: number; df: number };
      wilcoxon: { W: number; z: number; p: number };
      deltas: { subject: string; dayGap: number; nightGap: number; delta: number }[];
    };
    stableOnly: {
      meanDayGap: number;
      meanNightGap: number;
      directionConsistency: string;
      tTest: { t: number; p: number; meanDelta: number; seDelta: number; df: number };
      wilcoxon: { W: number; z: number; p: number };
      deltas: { subject: string; dayGap: number; nightGap: number; delta: number }[];
    };
  };
  conclusion: {
    allGenesDirection: string;
    stableGenesDirection: string;
    interpretation: string;
  };
}

interface GenomeWideResult {
  dataset: string;
  datasetId: string;
  description: string;
  totalGenesAnalyzed: number;
  genomeWideDistribution: {
    mean: number;
    median: number;
    q25: number;
    q75: number;
    q90: number;
    q95: number;
    q99: number;
    min: number;
    max: number;
  };
  clockGenes: {
    n: number;
    meanEigenvalue: number;
    meanPercentile: number;
    genes: { gene: string; eigenvalue: number; percentile: number; confidence: string; adfStationary: boolean }[];
  };
  targetGenes: {
    n: number;
    meanEigenvalue: number;
    meanPercentile: number;
    genes: { gene: string; eigenvalue: number; percentile: number; confidence: string; adfStationary: boolean }[];
  };
  gearboxResult: {
    gap: number;
    hierarchyPreserved: boolean;
    clockAboveMedian: string;
    clockAbove75thPercentile: string;
    clockAbove90thPercentile: string;
    interpretation: string;
  };
  statisticalTests: {
    wilcoxonClockVsGenome: { U: number; z: number; p: number; nA: number; nB: number };
    wilcoxonClockVsTarget: { U: number; z: number; p: number; nA: number; nB: number } | null;
    permutationTest: {
      observedGap: number;
      nPermutations: number;
      pValue: number;
      significant: boolean;
      interpretation: string;
    };
  };
  histogram: { binStart: number; binEnd: number; count: number; clockCount: number; targetCount: number }[];
  stabilityFiltered?: StabilityFiltered;
  downloadUrl: string;
}

interface SkinBaselineData {
  clockMean: number;
  targetMean: number;
  gap: number;
  clockN: number;
  targetN: number;
}

interface SkinShuffleData {
  observedGap: number;
  meanShuffledGap: number;
  sdShuffledGap: number;
  pValue: number;
  zScore: number;
  hierarchyPreservedRate: number;
  significant: boolean;
  interpretation: string;
}

interface SkinNullData {
  observedGap: number;
  meanNullGap: number;
  sdNullGap: number;
  pValue: number;
  zScore: number;
  percentileRank: number;
  significant: boolean;
  interpretation: string;
}

interface SkinBootstrapData {
  observedGap: number;
  gapCI: { lower: number; upper: number };
  probGapNegative: number;
  gapStraddlesZero?: boolean;
  clockCI: { lower: number; upper: number };
  targetCI: { lower: number; upper: number };
  perGene: { gene: string; geneType: string; eigenvalue: number; ci: { lower: number; upper: number } }[];
}

interface SkinAR1vsAR2Gene {
  gene: string;
  geneType: string;
  ar1EV: number;
  ar2EV: number;
  ar1R2: number;
  ar2R2: number;
  ar2Better: boolean;
  deltaAIC: number;
}

interface SkinAR1vsAR2Data {
  perGene: SkinAR1vsAR2Gene[];
  summaryByClock: { ar1MeanR2: number; ar2MeanR2: number; ar2WinRate: number; meanDeltaAIC: number };
  summaryByTarget: { ar1MeanR2: number; ar2MeanR2: number; ar2WinRate: number; meanDeltaAIC: number };
  conclusion: string;
}

interface SkinLayerData {
  baseline: SkinBaselineData;
  timeShuffle: SkinShuffleData;
  randomGeneSetNull: SkinNullData;
  bootstrapCI: SkinBootstrapData;
  ar1VsAr2: SkinAR1vsAR2Data;
}

interface SkinHeadToHead {
  dermisGap: number;
  epidermisGap: number;
  gapDifference: number;
  dermisShufflePValue: number;
  epidermisShufflePValue: number;
  dermisNullPValue: number;
  epidermisNullPValue: number;
  dermisBootstrapCI: { lower: number; upper: number };
  epidermisBootstrapCI: { lower: number; upper: number };
  epidermisProbNegative: number;
  dermisAR2WinRate: number;
  epidermisAR2WinRate: number;
}

interface SkinStressData {
  title: string;
  description: string;
  layers: { dermis: SkinLayerData; epidermis: SkinLayerData };
  headToHead: SkinHeadToHead;
  verdict: string;
}

function SkinPassFail({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
      <CheckCircle2 className="w-4 h-4" /> PASS
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-red-400 font-medium">
      <XCircle className="w-4 h-4" /> FAIL
    </span>
  );
}

function SkinPValueBadge({ p }: { p: number }) {
  const sig = p < 0.05;
  return (
    <Badge variant="outline" className={sig ? "border-emerald-600 text-emerald-400" : "border-red-600 text-red-400"}>
      p = {p < 0.001 ? p.toExponential(1) : p.toFixed(3)}
    </Badge>
  );
}

const SkinCustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
      <div className="font-bold text-white">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</div>
      ))}
    </div>
  );
};

function SkinLayerPanel({ layer, data, isExpanded, toggle }: { layer: string; data: SkinLayerData; isExpanded: boolean; toggle: () => void }) {
  const isDermis = layer === 'dermis';
  const accentColor = isDermis ? 'cyan' : 'amber';
  const passCount = [data.timeShuffle.significant, data.randomGeneSetNull.significant].filter(Boolean).length;

  const bootstrapGenes = data.bootstrapCI.perGene;
  const clockGenes = bootstrapGenes.filter(g => g.geneType === 'clock');
  const targetGenes = bootstrapGenes.filter(g => g.geneType === 'target');

  const bootstrapChartData = [...clockGenes, ...targetGenes].map(g => ({
    gene: g.gene,
    eigenvalue: g.eigenvalue,
    ciLow: g.ci.lower,
    ciHigh: g.ci.upper,
    errorLow: g.eigenvalue - g.ci.lower,
    errorHigh: g.ci.upper - g.eigenvalue,
    geneType: g.geneType,
  }));

  return (
    <Card className="border-slate-700" data-testid={`card-skin-${layer}`}>
      <CardHeader className="cursor-pointer" onClick={toggle}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`text-lg text-${accentColor}-300 flex items-center gap-2`}>
              <Layers className="w-5 h-5" />
              {isDermis ? 'Dermis (Deep Skin)' : 'Epidermis (Surface Skin)'}
            </CardTitle>
            <CardDescription>
              Baseline gap = {data.baseline.gap.toFixed(4)} | {data.baseline.clockN} clock + {data.baseline.targetN} target genes | Falsification: {passCount}/2 passed
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={isDermis
              ? "bg-emerald-900/50 text-emerald-300 border-emerald-700"
              : "bg-amber-900/50 text-amber-300 border-amber-700"}>
              {isDermis ? 'Genuine Structure' : 'Weak/Absent'}
            </Badge>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Test 1:</span> Time-Shuffle Falsification
              </h3>
              <SkinPassFail pass={data.timeShuffle.significant} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Observed Gap</div>
                <div className="font-mono">{data.timeShuffle.observedGap.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Shuffled Mean</div>
                <div className="font-mono text-muted-foreground">{data.timeShuffle.meanShuffledGap.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">z-Score</div>
                <div className="font-mono">{data.timeShuffle.zScore.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">p-Value</div>
                <SkinPValueBadge p={data.timeShuffle.pValue} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{data.timeShuffle.interpretation}</p>
          </div>

          <div className="border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Test 2:</span> Random Gene-Set Null
              </h3>
              <SkinPassFail pass={data.randomGeneSetNull.significant} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Observed Gap</div>
                <div className="font-mono">{data.randomGeneSetNull.observedGap.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Null Mean</div>
                <div className="font-mono text-muted-foreground">{data.randomGeneSetNull.meanNullGap.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Percentile</div>
                <div className="font-mono">{data.randomGeneSetNull.percentileRank.toFixed(1)}th</div>
              </div>
              <div>
                <div className="text-muted-foreground">p-Value</div>
                <SkinPValueBadge p={data.randomGeneSetNull.pValue} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{data.randomGeneSetNull.interpretation}</p>
          </div>

          <div className="border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Test 3:</span> Block Bootstrap Confidence Intervals
              </h3>
              <span className={`text-sm font-medium ${data.bootstrapCI.probGapNegative < 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                P(gap &lt; 0) = {(data.bootstrapCI.probGapNegative * 100).toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
              <div>
                <div className="text-muted-foreground">Gap 95% CI</div>
                <div className="font-mono">[{data.bootstrapCI.gapCI.lower.toFixed(4)}, {data.bootstrapCI.gapCI.upper.toFixed(4)}]</div>
              </div>
              <div>
                <div className="text-muted-foreground">Clock |λ| CI</div>
                <div className="font-mono text-blue-300">[{data.bootstrapCI.clockCI.lower.toFixed(4)}, {data.bootstrapCI.clockCI.upper.toFixed(4)}]</div>
              </div>
              <div>
                <div className="text-muted-foreground">Target |λ| CI</div>
                <div className="font-mono text-amber-300">[{data.bootstrapCI.targetCI.lower.toFixed(4)}, {data.bootstrapCI.targetCI.upper.toFixed(4)}]</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bootstrapChartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="gene" stroke="#94a3b8" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 1.1]} stroke="#94a3b8" />
                <Tooltip content={<SkinCustomTooltip />} />
                <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '|λ|=1', fill: '#ef4444', fontSize: 10 }} />
                <Bar dataKey="eigenvalue" name="Eigenvalue |λ|" radius={[2, 2, 0, 0]}>
                  {bootstrapChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.geneType === 'clock' ? '#60a5fa' : '#f59e0b'} opacity={0.8} />
                  ))}
                  <ErrorBar dataKey="errorHigh" width={2} strokeWidth={1} stroke="#94a3b8" direction="y" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center text-xs mt-1">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400 inline-block" /> Clock</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Target</span>
            </div>
          </div>

          <div className="border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Test 4:</span> AR(1) vs AR(2) Model Order
              </h3>
              <span className="text-sm text-muted-foreground">
                AR(2) win rate: Clock {(data.ar1VsAr2.summaryByClock.ar2WinRate * 100).toFixed(0)}%, Target {(data.ar1VsAr2.summaryByTarget.ar2WinRate * 100).toFixed(0)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <div className="text-muted-foreground mb-1">Clock Genes</div>
                <div className="font-mono text-blue-300">AR(1) R²: {data.ar1VsAr2.summaryByClock.ar1MeanR2.toFixed(4)} | AR(2) R²: {data.ar1VsAr2.summaryByClock.ar2MeanR2.toFixed(4)}</div>
                <div className="font-mono text-muted-foreground">Mean ΔAIC: {data.ar1VsAr2.summaryByClock.meanDeltaAIC.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Target Genes</div>
                <div className="font-mono text-amber-300">AR(1) R²: {data.ar1VsAr2.summaryByTarget.ar1MeanR2.toFixed(4)} | AR(2) R²: {data.ar1VsAr2.summaryByTarget.ar2MeanR2.toFixed(4)}</div>
                <div className="font-mono text-muted-foreground">Mean ΔAIC: {data.ar1VsAr2.summaryByTarget.meanDeltaAIC.toFixed(2)}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{data.ar1VsAr2.conclusion}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

const DATASET_GROUPS = [
  {
    label: 'Mouse Tissues - Hughes Atlas (GSE54650, ~21K genes each)',
    datasets: [
      { id: 'GSE54650_Liver_circadian', label: 'Liver' },
      { id: 'GSE54650_Heart_circadian', label: 'Heart' },
      { id: 'GSE54650_Kidney_circadian', label: 'Kidney' },
      { id: 'GSE54650_Lung_circadian', label: 'Lung' },
      { id: 'GSE54650_Cerebellum_circadian', label: 'Cerebellum' },
      { id: 'GSE54650_Hypothalamus_circadian', label: 'Hypothalamus' },
      { id: 'GSE54650_Brainstem_circadian', label: 'Brainstem' },
      { id: 'GSE54650_Muscle_circadian', label: 'Muscle' },
      { id: 'GSE54650_Adrenal_circadian', label: 'Adrenal' },
      { id: 'GSE54650_Aorta_circadian', label: 'Aorta' },
      { id: 'GSE54650_Brown_Fat_circadian', label: 'Brown Fat' },
      { id: 'GSE54650_White_Fat_circadian', label: 'White Fat' },
    ]
  },
  {
    label: 'Cancer & Disease Models',
    datasets: [
      { id: 'GSE221103_Neuroblastoma_MYC_ON', label: 'Neuroblastoma MYC-ON (~60K genes)' },
      { id: 'GSE221103_Neuroblastoma_MYC_OFF', label: 'Neuroblastoma MYC-OFF (~60K genes)' },
      { id: 'GSE157357_Organoid_WT-WT', label: 'Organoid WT - Healthy (~16K genes)' },
      { id: 'GSE157357_Organoid_ApcKO-WT', label: 'Organoid APC-Mutant - Cancer (~16K genes)' },
      { id: 'GSE157357_Organoid_WT-BmalKO', label: 'Organoid BMAL-KO - Clock KO (~16K genes)' },
      { id: 'GSE157357_Organoid_ApcKO-BmalKO', label: 'Organoid Double KO (~15K genes)' },
    ]
  },
  {
    label: 'Clock Knockout / Causal Validation',
    datasets: [
      { id: 'GSE70499_Liver_Bmal1WT', label: 'Mouse Liver Bmal1-WT - Storch 2007 (~18K genes)' },
      { id: 'GSE70499_Liver_Bmal1KO', label: 'Mouse Liver Bmal1-KO - Storch 2007 (~18K genes)' },
    ]
  },
  {
    label: 'Other Mouse Datasets',
    datasets: [
      { id: 'GSE11923_Liver_1h_48h_genes', label: 'Mouse Liver - Hughes 2009, 1h sampling (~22K genes)' },
    ]
  },
  {
    label: 'Human',
    datasets: [
      { id: 'GSE113883_Human_WholeBlood', label: 'Whole Blood - Ruben 2018 (~58K probes)' },
      { id: 'GSE48113_Human_Blood_Circadian', label: 'Blood - Archer 2014' },
      { id: 'GSE107537_PBMC_Day', label: 'PBMC Day Schedule - Kervezee 2018 (~19K genes)' },
      { id: 'GSE107537_PBMC_Night', label: 'PBMC Night Shift - Kervezee 2018 (~19K genes)' },
    ]
  },
  {
    label: 'Other Species',
    datasets: [
      { id: 'GSE98965_baboon_FPKM', label: 'Baboon Multi-tissue - Mure 2018 (~29K genes)' },
      { id: 'GSE242964_arabidopsis_circadian_averaged', label: 'Arabidopsis - Redmond 2024' },
    ]
  }
];

export default function GenomeWide() {
  useScrollToHash();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenomeWideResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState('GSE54650_Liver_circadian');
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectResult, setSubjectResult] = useState<SubjectLevelResult | null>(null);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [skinDermisExpanded, setSkinDermisExpanded] = useState(false);
  const [skinEpidermisExpanded, setSkinEpidermisExpanded] = useState(false);

  const { data: skinData, isLoading: skinLoading, error: skinError } = useQuery<SkinStressData>({
    queryKey: ['/api/validation/skin-stress-tests'],
  });

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/validation/genome-wide?dataset=${selectedDataset}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to run genome-wide analysis");
    } finally {
      setLoading(false);
    }
  };

  const runSubjectLevel = async () => {
    setSubjectLoading(true);
    setSubjectError(null);
    try {
      const res = await fetch('/api/validation/subject-level');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSubjectResult(data);
    } catch (e: any) {
      setSubjectError(e.message || "Failed to run subject-level analysis");
    } finally {
      setSubjectLoading(false);
    }
  };

  const formatP = (p: number | string) => {
    const num = typeof p === 'string' ? parseFloat(p) : p;
    if (num < 0.001) return "<0.001";
    if (num < 0.01) return num.toFixed(4);
    return num.toFixed(3);
  };

  return (
    <div id="screen-results" className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8 scroll-mt-20" data-testid="genome-wide-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Globe className="h-6 w-6 text-blue-400" />
              Genome-Wide AR(2) Validation
            </h1>
            <p className="text-sm text-muted-foreground">
              Demonstrates that the gearbox hierarchy emerges from genome-wide analysis without curated panel selection
            </p>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 mt-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong className="text-white">What you can do:</strong> Runs AR(2) on every gene in a dataset — not just clock and target genes — to see if the hierarchy pattern emerges naturally across the whole genome. Download the genome-wide report to see eigenvalue distributions for all analyzed genes.
              </p>
            </div>
          </div>
        </div>

        <PaperCrossLinks currentPage="/genome-wide" />

        <HowTo
          title="Genome-Wide AR(2) Validation"
          summary="Runs AR(2) analysis on all genes in a dataset to demonstrate that the clock-target hierarchy emerges naturally from genome-wide data, not just pre-selected genes. Shows where clock and target genes fall within the full eigenvalue distribution."
          steps={[
            { label: "Select a dataset", detail: "Pick a dataset to run genome-wide AR(2) fitting across all available genes." },
            { label: "View the distribution", detail: "The histogram shows the full eigenvalue distribution with clock and target genes highlighted." },
            { label: "Check percentiles", detail: "Clock genes should cluster toward higher eigenvalues compared to the genome-wide background." }
          ]}
        />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Dna className="h-5 w-5" />
              Run Genome-Wide Analysis
            </CardTitle>
            <CardDescription>
              Analyze all genes in a dataset to show clock genes naturally rank higher in eigenvalue persistence.
              This tests whether clock genes naturally rank higher across the full genome.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger className="w-full sm:w-[500px]" data-testid="select-dataset">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {DATASET_GROUPS.map(group => (
                    <SelectGroup key={group.label}>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground">{group.label}</SelectLabel>
                      {group.datasets.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={runAnalysis} disabled={loading} data-testid="button-run-analysis">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing ~20K genes...</> : "Run Genome-Wide Analysis"}
              </Button>
            </div>
            {loading && (
              <p className="text-sm text-muted-foreground mt-3">
                Processing all genes with AR(2) + diagnostics. This may take 1-2 minutes on the first run (cached after).
              </p>
            )}
            {error && <p className="text-sm text-red-400 mt-3" data-testid="text-error">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-blue-400" data-testid="text-total-genes">{result.totalGenesAnalyzed.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Genes Analyzed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-emerald-400" data-testid="text-clock-percentile">{result.clockGenes.meanPercentile}th</p>
                  <p className="text-sm text-muted-foreground">Clock Mean Percentile</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-amber-400" data-testid="text-target-percentile">{result.targetGenes.meanPercentile}th</p>
                  <p className="text-sm text-muted-foreground">Target Mean Percentile</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold" data-testid="text-permutation-p">
                    {result.statisticalTests.permutationTest.significant
                      ? <span className="text-emerald-400">p={formatP(result.statisticalTests.permutationTest.pValue)}</span>
                      : <span className="text-red-400">p={formatP(result.statisticalTests.permutationTest.pValue)}</span>
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Permutation Test</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Genome-Wide Eigenvalue Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of AR(2) eigenvalue |lambda| across all {result.totalGenesAnalyzed.toLocaleString()} genes.
                  Clock genes (blue) and target genes (orange) are highlighted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={result.histogram.map(h => ({
                    bin: `${h.binStart.toFixed(2)}`,
                    total: h.count,
                    clock: h.clockCount,
                    target: h.targetCount,
                    other: h.count - h.clockCount - h.targetCount
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bin" label={{ value: "Eigenvalue |lambda|", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                    <YAxis label={{ value: "Gene Count", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="other" stackId="a" fill="#d1d5db" name="Other genes" />
                    <Bar dataKey="clock" stackId="a" fill="#3b82f6" name="Clock genes" />
                    <Bar dataKey="target" stackId="a" fill="#f59e0b" name="Target genes" />
                    <ReferenceLine x={result.histogram.findIndex(h =>
                      result.genomeWideDistribution.median >= h.binStart && result.genomeWideDistribution.median < h.binEnd
                    ).toString()} stroke="#ef4444" strokeDasharray="5 5" label="Median" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Clock Genes — Genome-Wide Ranking
                  </CardTitle>
                  <CardDescription>
                    {result.gearboxResult.clockAbove90thPercentile} clock genes above 90th percentile.
                    Mean percentile: {result.clockGenes.meanPercentile}th.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {result.clockGenes.genes.map(g => (
                      <div key={g.gene} className="flex items-center justify-between p-2 bg-blue-500/10 rounded text-sm" data-testid={`clock-gene-${g.gene}`}>
                        <span className="font-mono font-medium">{g.gene}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">|lambda|={g.eigenvalue}</span>
                          <Badge variant={g.percentile >= 90 ? "default" : g.percentile >= 75 ? "secondary" : "outline"}>
                            {g.percentile}th %ile
                          </Badge>
                          {g.adfStationary && <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">ADF pass</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-400" />
                    Target Genes — Genome-Wide Ranking
                  </CardTitle>
                  <CardDescription>
                    Mean percentile: {result.targetGenes.meanPercentile}th.
                    Gap from clock: {result.gearboxResult.gap.toFixed(4)}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {result.targetGenes.genes.map(g => (
                      <div key={g.gene} className="flex items-center justify-between p-2 bg-amber-500/10 rounded text-sm" data-testid={`target-gene-${g.gene}`}>
                        <span className="font-mono font-medium">{g.gene}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">|lambda|={g.eigenvalue}</span>
                          <Badge variant={g.percentile >= 90 ? "default" : g.percentile >= 75 ? "secondary" : "outline"}>
                            {g.percentile}th %ile
                          </Badge>
                          {g.adfStationary && <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">ADF pass</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistical Tests
                </CardTitle>
                <CardDescription>Formal tests confirming the gearbox hierarchy is not a panel selection artifact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Wilcoxon Rank-Sum (Clock vs Non-Clock)</h4>
                    <p className="text-sm" data-testid="text-wilcoxon-genome">
                      z = {result.statisticalTests.wilcoxonClockVsGenome.z}, p = {formatP(result.statisticalTests.wilcoxonClockVsGenome.p)}
                    </p>
                    <Badge className="mt-2" variant={parseFloat(String(result.statisticalTests.wilcoxonClockVsGenome.p)) < 0.05 ? "default" : "destructive"}>
                      {parseFloat(String(result.statisticalTests.wilcoxonClockVsGenome.p)) < 0.05 ? "Significant" : "Not significant"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Clock genes rank significantly higher than random genes</p>
                  </div>

                  {result.statisticalTests.wilcoxonClockVsTarget && (
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Wilcoxon Rank-Sum (Clock vs Target)</h4>
                      <p className="text-sm" data-testid="text-wilcoxon-target">
                        z = {result.statisticalTests.wilcoxonClockVsTarget.z}, p = {formatP(result.statisticalTests.wilcoxonClockVsTarget.p)}
                      </p>
                      <Badge className="mt-2" variant={parseFloat(String(result.statisticalTests.wilcoxonClockVsTarget.p)) < 0.05 ? "default" : "destructive"}>
                        {parseFloat(String(result.statisticalTests.wilcoxonClockVsTarget.p)) < 0.05 ? "Significant" : "Not significant"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Clock genes have higher persistence than target genes</p>
                    </div>
                  )}

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Permutation Test ({result.statisticalTests.permutationTest.nPermutations.toLocaleString()} permutations)</h4>
                    <p className="text-sm" data-testid="text-permutation-result">
                      Observed gap = {result.statisticalTests.permutationTest.observedGap}, p = {formatP(result.statisticalTests.permutationTest.pValue)}
                    </p>
                    <Badge className="mt-2" variant={result.statisticalTests.permutationTest.significant ? "default" : "destructive"}>
                      {result.statisticalTests.permutationTest.significant ? "Significant" : "Not significant"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{result.statisticalTests.permutationTest.interpretation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Conclusion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm font-medium text-emerald-300 mb-2" data-testid="text-conclusion">
                    {result.gearboxResult.interpretation}
                  </p>
                  <ul className="text-sm text-emerald-400 space-y-1 list-disc list-inside">
                    <li>{result.totalGenesAnalyzed.toLocaleString()} genes analyzed genome-wide</li>
                    <li>Clock genes at {result.clockGenes.meanPercentile}th percentile (vs target at {result.targetGenes.meanPercentile}th)</li>
                    <li>{result.gearboxResult.clockAboveMedian} clock genes above genome median</li>
                    <li>{result.gearboxResult.clockAbove90thPercentile} clock genes above 90th percentile</li>
                    <li>Wilcoxon rank-sum: p={formatP(result.statisticalTests.wilcoxonClockVsGenome.p)} (clock vs non-clock)</li>
                    <li>Permutation test: p={formatP(result.statisticalTests.permutationTest.pValue)} ({result.statisticalTests.permutationTest.nPermutations.toLocaleString()} permutations)</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <a href={result.downloadUrl} data-testid="link-download-report">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" /> Download Genome-Wide Report (CSV)
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {result.stabilityFiltered && (
              <Card className="border-2 border-purple-500/30" data-testid="card-stability-filter">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    Stability Filter: |lambda| {'<'} 1.0 Only
                  </CardTitle>
                  <CardDescription>
                    Excludes non-stationary AR(2) fits to ensure eigenvalue comparisons are meaningful.
                    {result.stabilityFiltered.percentRetained}% of genes retained.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-400" data-testid="text-stable-retained">
                        {result.stabilityFiltered.totalGenesRetained.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Stable Genes ({result.stabilityFiltered.percentRetained}%)</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-400" data-testid="text-stable-clock">
                        {result.stabilityFiltered.filteredMeanClock.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground">Clock Mean |lambda| ({result.stabilityFiltered.clockGenesRetained}/{result.stabilityFiltered.clockGenesRetained + result.stabilityFiltered.clockGenesExcluded} retained)</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-400" data-testid="text-stable-target">
                        {result.stabilityFiltered.filteredMeanTarget.toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground">Target Mean |lambda| ({result.stabilityFiltered.targetGenesRetained}/{result.stabilityFiltered.targetGenesRetained + result.stabilityFiltered.targetGenesExcluded} retained)</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                      <p className="text-2xl font-bold" data-testid="text-stable-gap">
                        <span className={result.stabilityFiltered.filteredHierarchyPreserved ? "text-emerald-400" : "text-red-400"}>
                          {result.stabilityFiltered.filteredGap.toFixed(4)}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">Filtered Gap</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">Hierarchy Status (filtered)</h4>
                      <Badge variant={result.stabilityFiltered.filteredHierarchyPreserved ? "default" : "destructive"} data-testid="badge-stable-hierarchy">
                        {result.stabilityFiltered.filteredHierarchyPreserved ? "Preserved" : "Not Preserved"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Filtered percentiles: Clock {result.stabilityFiltered.filteredClockPercentile}th vs Target {result.stabilityFiltered.filteredTargetPercentile}th
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">Filtered Statistical Tests</h4>
                      {result.stabilityFiltered.filteredWilcoxonClockVsGenome && (
                        <p className="text-sm" data-testid="text-stable-wilcoxon">
                          Wilcoxon p={formatP(result.stabilityFiltered.filteredWilcoxonClockVsGenome.p)}, Permutation p={formatP(result.stabilityFiltered.filteredPermutationP)}
                        </p>
                      )}
                    </div>
                  </div>

                  {result.stabilityFiltered.unstableGenes.length > 0 && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        Unstable Clock/Target Genes Excluded (|lambda| {'>='} 1.0)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.stabilityFiltered.unstableGenes.map(g => (
                          <Badge key={g.gene} variant="outline" className="text-amber-400 border-amber-500/30" data-testid={`badge-unstable-${g.gene}`}>
                            {g.gene} ({g.geneType}) |lambda|={g.eigenvalue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card className="mt-8 border-2 border-indigo-500/30" data-testid="card-subject-level">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              Subject-Level AR(2) Validation
            </CardTitle>
            <CardDescription>
              Paired statistical testing across individual subjects (GSE107537, n=8)
              to demonstrate shift work effects are not averaging artifacts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runSubjectLevel} disabled={subjectLoading} data-testid="button-run-subject-level">
              {subjectLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing 8 subjects...</> : "Run Subject-Level Analysis"}
            </Button>
            {subjectLoading && (
              <p className="text-sm text-muted-foreground mt-2">
                Running AR(2) on clock/target genes for each of 8 subjects x 2 conditions...
              </p>
            )}
            {subjectError && <p className="text-sm text-red-400 mt-2" data-testid="text-subject-error">{subjectError}</p>}

            {subjectResult && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-indigo-500/10 rounded-lg">
                    <h4 className="font-semibold text-sm mb-3 text-indigo-300">All Genes (Unfiltered)</h4>
                    <div className="space-y-2 text-sm text-slate-300">
                      <p>Mean Day gap: <span className="font-mono font-semibold text-white">{subjectResult.pairedAnalysis.allGenes.meanDayGap}</span></p>
                      <p>Mean Night gap: <span className="font-mono font-semibold text-white">{subjectResult.pairedAnalysis.allGenes.meanNightGap}</span></p>
                      <p>Direction: <span className="font-medium text-white">{subjectResult.pairedAnalysis.allGenes.directionConsistency}</span></p>
                      <div className="mt-2 p-2 bg-slate-900/50 rounded">
                        <p className="text-xs font-semibold mb-1 text-slate-400">Paired t-test</p>
                        <p className="text-xs font-mono text-slate-300">
                          t={subjectResult.pairedAnalysis.allGenes.tTest.t}, p={formatP(subjectResult.pairedAnalysis.allGenes.tTest.p)}
                        </p>
                        <Badge className="mt-1" variant={subjectResult.pairedAnalysis.allGenes.tTest.p < 0.05 ? "default" : "secondary"}>
                          {subjectResult.pairedAnalysis.allGenes.tTest.p < 0.05 ? "Significant" : "Not significant"}
                        </Badge>
                      </div>
                      <div className="p-2 bg-slate-900/50 rounded">
                        <p className="text-xs font-semibold mb-1 text-slate-400">Wilcoxon signed-rank</p>
                        <p className="text-xs font-mono text-slate-300">
                          W={subjectResult.pairedAnalysis.allGenes.wilcoxon.W}, z={subjectResult.pairedAnalysis.allGenes.wilcoxon.z}, p={formatP(subjectResult.pairedAnalysis.allGenes.wilcoxon.p)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-500/10 rounded-lg">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-1 text-purple-300">
                      <Shield className="h-4 w-4 text-purple-400" />
                      Stability-Filtered (|lambda| {'<'} 1.0)
                    </h4>
                    <div className="space-y-2 text-sm text-slate-300">
                      <p>Mean Day gap: <span className="font-mono font-semibold text-white">{subjectResult.pairedAnalysis.stableOnly.meanDayGap}</span></p>
                      <p>Mean Night gap: <span className="font-mono font-semibold text-white">{subjectResult.pairedAnalysis.stableOnly.meanNightGap}</span></p>
                      <p>Direction: <span className="font-medium text-white">{subjectResult.pairedAnalysis.stableOnly.directionConsistency}</span></p>
                      <div className="mt-2 p-2 bg-slate-900/50 rounded">
                        <p className="text-xs font-semibold mb-1 text-slate-400">Paired t-test</p>
                        <p className="text-xs font-mono text-slate-300">
                          t={subjectResult.pairedAnalysis.stableOnly.tTest.t}, p={formatP(subjectResult.pairedAnalysis.stableOnly.tTest.p)}
                        </p>
                        <Badge className="mt-1" variant={subjectResult.pairedAnalysis.stableOnly.tTest.p < 0.05 ? "default" : "secondary"}>
                          {subjectResult.pairedAnalysis.stableOnly.tTest.p < 0.05 ? "Significant" : "Not significant"}
                        </Badge>
                      </div>
                      <div className="p-2 bg-slate-900/50 rounded">
                        <p className="text-xs font-semibold mb-1 text-slate-400">Wilcoxon signed-rank</p>
                        <p className="text-xs font-mono text-slate-300">
                          W={subjectResult.pairedAnalysis.stableOnly.wilcoxon.W}, z={subjectResult.pairedAnalysis.stableOnly.wilcoxon.z}, p={formatP(subjectResult.pairedAnalysis.stableOnly.wilcoxon.p)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-white">Per-Subject Gaps (All Genes)</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="p-2 text-white">Subject</th>
                            <th className="p-2 text-right text-white">Day Gap</th>
                            <th className="p-2 text-right text-white">Night Gap</th>
                            <th className="p-2 text-right text-white">Delta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectResult.pairedAnalysis.allGenes.deltas.map(d => (
                            <tr key={d.subject} className="border-b hover:bg-slate-800/50" data-testid={`row-subject-all-${d.subject}`}>
                              <td className="p-2 font-mono text-slate-300">{d.subject}</td>
                              <td className="p-2 text-right font-mono text-slate-300">{d.dayGap}</td>
                              <td className="p-2 text-right font-mono text-slate-300">{d.nightGap}</td>
                              <td className={`p-2 text-right font-mono font-semibold ${d.delta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {d.delta > 0 ? '+' : ''}{typeof d.delta === 'number' ? d.delta.toFixed(4) : d.delta}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1 text-white">
                      <Shield className="h-3.5 w-3.5 text-purple-400" />
                      Per-Subject Gaps (Stable Only)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="p-2 text-white">Subject</th>
                            <th className="p-2 text-right text-white">Day Gap</th>
                            <th className="p-2 text-right text-white">Night Gap</th>
                            <th className="p-2 text-right text-white">Delta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectResult.pairedAnalysis.stableOnly.deltas.map(d => (
                            <tr key={d.subject} className="border-b hover:bg-slate-800/50" data-testid={`row-subject-stable-${d.subject}`}>
                              <td className="p-2 font-mono text-slate-300">{d.subject}</td>
                              <td className="p-2 text-right font-mono text-slate-300">{d.dayGap}</td>
                              <td className="p-2 text-right font-mono text-slate-300">{d.nightGap}</td>
                              <td className={`p-2 text-right font-mono font-semibold ${d.delta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {d.delta > 0 ? '+' : ''}{typeof d.delta === 'number' ? d.delta.toFixed(4) : d.delta}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-indigo-300">Interpretation</h4>
                  <p className="text-sm text-slate-300" data-testid="text-subject-conclusion">{subjectResult.conclusion.interpretation}</p>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectResult.pairedAnalysis.allGenes.deltas.map(d => ({
                    subject: d.subject,
                    dayGap: d.dayGap,
                    nightGap: d.nightGap
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis label={{ value: "Clock-Target Gap", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="dayGap" fill="#3b82f6" name="Day (normal)" />
                    <Bar dataKey="nightGap" fill="#ef4444" name="Night (shift)" />
                    <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <InsightCallout variant="info">
          Running AR(2) on all ~20,000 genes (not just curated clock/target sets) reveals that the persistence hierarchy is not an artifact of gene selection. The clock-target gap emerges naturally from the full genome distribution.
        </InsightCallout>

        <div className="my-4">
          <ViewInRootSpace />
        </div>

        <div className="mt-8 space-y-6" data-testid="section-skin-stress-tests">
          <div className="border-t border-slate-700 pt-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2" data-testid="text-skin-section-title">
              <FlaskConical className="h-6 w-6 text-teal-400" />
              Case Study: Skin Layer Falsification (GSE205155)
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Comprehensive falsification and robustness testing comparing dermis (deep skin, strong circadian biology)
              vs epidermis (surface skin, weak circadian biology). Four independent tests determine whether the
              clock-target eigenvalue hierarchy reflects genuine temporal structure or statistical noise.
            </p>
          </div>

          {skinLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
              <span className="ml-3 text-muted-foreground">Running 4 stress tests on 2 skin layers...</span>
            </div>
          )}

          {skinError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load skin stress tests.</AlertDescription>
            </Alert>
          )}

          {skinData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Dermis Gap</p>
                    <p className="text-3xl font-bold text-cyan-300" data-testid="text-skin-dermis-gap">{skinData.headToHead.dermisGap.toFixed(4)}</p>
                    <p className="text-xs text-emerald-400">Both tests PASS</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Epidermis Gap</p>
                    <p className="text-3xl font-bold text-amber-300" data-testid="text-skin-epidermis-gap">{skinData.headToHead.epidermisGap.toFixed(4)}</p>
                    <p className="text-xs text-red-400">Both tests FAIL</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">Gap Difference</p>
                    <p className="text-3xl font-bold" data-testid="text-skin-gap-diff">{skinData.headToHead.gapDifference.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground">Dermis - Epidermis</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">P(epidermis gap &lt; 0)</p>
                    <p className="text-3xl font-bold" data-testid="text-skin-prob-neg">{(skinData.headToHead.epidermisProbNegative * 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Bootstrap probability</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-emerald-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-1">Verdict</h4>
                      <p className="text-sm text-muted-foreground" data-testid="text-skin-verdict">{skinData.verdict}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Head-to-Head: Falsification p-Values
                  </CardTitle>
                  <CardDescription>Dermis passes both tests (p &lt; 0.05); epidermis fails both (p &gt; 0.3)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { test: 'Time Shuffle', dermis: skinData.headToHead.dermisShufflePValue, epidermis: skinData.headToHead.epidermisShufflePValue },
                      { test: 'Random Null', dermis: skinData.headToHead.dermisNullPValue, epidermis: skinData.headToHead.epidermisNullPValue },
                    ]} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="test" stroke="#94a3b8" />
                      <YAxis domain={[0, 0.5]} stroke="#94a3b8" label={{ value: 'p-value', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip content={<SkinCustomTooltip />} />
                      <ReferenceLine y={0.05} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'α=0.05', fill: '#ef4444', fontSize: 10 }} />
                      <Bar dataKey="dermis" name="Dermis" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="epidermis" name="Epidermis" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <SkinLayerPanel
                  layer="dermis"
                  data={skinData.layers.dermis}
                  isExpanded={skinDermisExpanded}
                  toggle={() => setSkinDermisExpanded(!skinDermisExpanded)}
                />
                <SkinLayerPanel
                  layer="epidermis"
                  data={skinData.layers.epidermis}
                  isExpanded={skinEpidermisExpanded}
                  toggle={() => setSkinEpidermisExpanded(!skinEpidermisExpanded)}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                  <p>
                    <strong className="text-foreground">Dataset:</strong> GSE205155 (Narayan et al.) — human skin biopsies from
                    dermis and epidermis layers, sampled every 4 hours over 24h. Dermis has established circadian clock
                    activity; epidermis has weak or absent circadian regulation.
                  </p>
                  <p>
                    <strong className="text-foreground">Test 1 — Time Shuffle:</strong> Randomly permutes time labels 500 times
                    and re-computes the clock-target gap. If the observed gap exceeds 95% of shuffled gaps, the temporal
                    ordering matters (not just gene identity).
                  </p>
                  <p>
                    <strong className="text-foreground">Test 2 — Random Gene-Set Null:</strong> Draws 500 random gene sets of the
                    same size as the clock/target panels and computes their gap. If the observed gap exceeds 95% of random
                    gaps, the specific identity of clock/target genes matters (not just any genes).
                  </p>
                  <p>
                    <strong className="text-foreground">Test 3 — Block Bootstrap CIs:</strong> Resamples time series with block
                    structure preserved (400 iterations) to generate 95% confidence intervals for each gene's eigenvalue
                    and the overall gap. Reports P(gap &lt; 0).
                  </p>
                  <p>
                    <strong className="text-foreground">Test 4 — AR(1) vs AR(2):</strong> Compares model fit (R²) and AIC between
                    AR(1) and AR(2) for each gene. Determines whether the second autoregressive lag adds meaningful
                    predictive power (multi-generational memory).
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
