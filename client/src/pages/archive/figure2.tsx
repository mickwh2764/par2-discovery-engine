import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ErrorBar, Cell } from "recharts";
import { ArrowLeft, Download, CheckCircle, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { Link } from "wouter";
import HowTo from "@/components/HowTo";

interface GearboxGapData {
  title: string;
  subtitle: string;
  source: string;
  clockGenes: {
    label: string;
    genes: string[];
    mean: number;
    std: number;
    range: [number, number];
    n: number;
    color: string;
  };
  targetGenes: {
    label: string;
    genes: string[];
    mean: number;
    std: number;
    range: [number, number];
    n: number;
    color: string;
  };
  gearboxGap: {
    value: number;
    previousClaim: number;
    status: string;
    interpretation: string;
  };
  byTissue: Array<{
    tissue: string;
    clockMean: number;
    targetMean: number;
    gap: number;
  }>;
  byCondition: {
    healthy: { clockMean: number; targetMean: number; pattern: string };
    disease: { clockMean: number; targetMean: number; pattern: string };
  };
  keyFinding: string;
  chartData: Array<{
    category: string;
    mean: number;
    std: number;
    lower: number;
    upper: number;
  }>;
  generatedAt: string;
  version: string;
}

export default function Figure2() {
  const { data, isLoading, error } = useQuery<GearboxGapData>({
    queryKey: ["/api/figure2/gearbox-gap"],
    queryFn: async () => {
      const res = await fetch("/api/figure2/gearbox-gap");
      if (!res.ok) throw new Error("Failed to fetch Figure 2 data");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading Figure 2 data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-red-400">Error loading Figure 2 data</div>
      </div>
    );
  }

  const mainChartData = [
    { 
      name: "Clock Genes", 
      mean: data.clockGenes.mean, 
      std: data.clockGenes.std,
      fill: data.clockGenes.color 
    },
    { 
      name: "Target Genes", 
      mean: data.targetGenes.mean, 
      std: data.targetGenes.std,
      fill: data.targetGenes.color 
    },
  ];

  const tissueChartData = data.byTissue.map(t => ({
    tissue: t.tissue,
    clock: t.clockMean,
    target: t.targetMean,
    gap: t.gap
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white" data-testid="link-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
            {data.version}
          </Badge>
        </div>

        <HowTo
          title="Figure 2: Clock vs. Target Eigenvalue Distribution"
          summary="Visualizes the core result of the PAR(2) framework — the separation between clock and target gene eigenvalue distributions. This is the key figure for the manuscript, showing that clock genes systematically exhibit higher temporal persistence than target genes."
          steps={[
            { label: "Read the distributions", detail: "The histogram shows eigenvalue (|λ|) distributions for clock genes (blue) and target genes (orange)." },
            { label: "Check the gap", detail: "The gap between the two distribution means is the primary evidence for the Gearbox Hypothesis." },
            { label: "Export", detail: "Use the export buttons to save the figure for manuscript preparation." }
          ]}
        />

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent" data-testid="text-figure2-title">
            {data.title}
          </h1>
          <p className="text-slate-400">{data.subtitle}</p>
          <p className="text-xs text-slate-400">{data.source}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                <Activity size={16} />
                Clock Genes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400" data-testid="text-clock-mean">{data.clockGenes.mean.toFixed(3)}</div>
              <div className="text-sm text-slate-400">± {data.clockGenes.std.toFixed(3)} (n={data.clockGenes.n})</div>
              <div className="text-xs text-slate-400 mt-2">Range: {data.clockGenes.range[0].toFixed(3)} - {data.clockGenes.range[1].toFixed(3)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-emerald-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
                <TrendingUp size={16} />
                Target Genes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400" data-testid="text-target-mean">{data.targetGenes.mean.toFixed(3)}</div>
              <div className="text-sm text-slate-400">± {data.targetGenes.std.toFixed(3)} (n={data.targetGenes.n})</div>
              <div className="text-xs text-slate-400 mt-2">Range: {data.targetGenes.range[0].toFixed(3)} - {data.targetGenes.range[1].toFixed(3)}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                <CheckCircle size={16} />
                Gearbox Gap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400" data-testid="text-gearbox-gap">{(data.gearboxGap.value * 100).toFixed(1)}%</div>
              <div className="text-sm text-slate-400">Validated (was {(data.gearboxGap.previousClaim * 100).toFixed(0)}%)</div>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                {data.gearboxGap.status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Eigenvalue Distribution Comparison</CardTitle>
            <CardDescription>Mean eigenvalue modulus |λ| with standard deviation bars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80" data-testid="chart-main">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis domain={[0, 1]} stroke="#6b7280" label={{ value: '|λ| Eigenvalue Modulus', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#334155' }}
                  />
                  <Bar dataKey="mean" name="Mean |λ|">
                    {mainChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <ErrorBar dataKey="std" width={4} strokeWidth={2} stroke="#fff" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Tissue-Specific Breakdown</CardTitle>
            <CardDescription>Clock vs Target gene eigenvalues by tissue type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80" data-testid="chart-tissue">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={tissueChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="tissue" stroke="#6b7280" />
                  <YAxis domain={[0, 1]} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#334155' }}
                  />
                  <Legend />
                  <Bar dataKey="clock" name="Clock Genes" fill="#3b82f6" />
                  <Bar dataKey="target" name="Target Genes" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={20} />
              Key Finding: Gearbox Convergence in Disease
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-sm text-emerald-400 font-medium mb-2">Healthy/WT Condition</div>
                <div className="text-2xl font-bold text-white">Clock: {data.byCondition.healthy.clockMean.toFixed(3)}</div>
                <div className="text-2xl font-bold text-white">Target: {data.byCondition.healthy.targetMean.toFixed(3)}</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-400">{data.byCondition.healthy.pattern}</Badge>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="text-sm text-red-400 font-medium mb-2">Disease/Mutant Condition</div>
                <div className="text-2xl font-bold text-white">Clock: {data.byCondition.disease.clockMean.toFixed(3)}</div>
                <div className="text-2xl font-bold text-white">Target: {data.byCondition.disease.targetMean.toFixed(3)}</div>
                <Badge className="mt-2 bg-red-500/20 text-red-400">{data.byCondition.disease.pattern}</Badge>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed" data-testid="text-key-finding">
              {data.keyFinding}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Interpretation Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm leading-relaxed">
              {data.gearboxGap.interpretation}
            </p>
            <div className="mt-4 text-xs text-slate-400">
              Generated: {new Date(data.generatedAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            onClick={() => window.print()}
            className="bg-gradient-to-r from-blue-600 to-emerald-600"
            data-testid="button-download"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Figure 2
          </Button>
        </div>
      </div>
    </div>
  );
}
