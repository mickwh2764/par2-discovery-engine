import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell, Legend, LineChart, Line
} from "recharts";
import { Download, Dna, Activity, TrendingUp, AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import HowTo from "@/components/HowTo";

const ORGANISM_COLORS: Record<string, string> = {
  'mouse': '#22d3ee',
  'human': '#a855f7',
  'plant': '#4ade80',
  'unknown': '#6b7280'
};

const ORGANISM_LABELS: Record<string, string> = {
  'mouse': 'Mouse (Mus musculus)',
  'human': 'Human (Homo sapiens)',
  'plant': 'Arabidopsis thaliana',
  'unknown': 'Other/Unknown'
};

interface SpeciesResult {
  organism: string;
  datasetCount: number;
  datasets: string[];
  totalPairs: number;
  significantPairs: number;
  significanceRate: number;
  eigenvalueStats: {
    mean: number;
    std: number;
    min: number;
    max: number;
    inStabilityBand: number;
    inBandPercent: number;
  };
  topPairs: Array<{
    clock: string;
    target: string;
    eigenvalue: number;
    pValue: number;
    dataset: string;
  }>;
  stabilityFiltered?: {
    stableCount: number;
    unstableCount: number;
    stablePercent: number;
    stableMeanEigenvalue: number;
    unstablePairs: Array<{
      clock: string;
      target: string;
      eigenvalue: number;
      dataset: string;
    }>;
  };
}

interface CrossSpeciesData {
  summary: {
    organismsAnalyzed: number;
    totalDatasets: number;
    totalPairs: number;
    globalMeanEigenvalue: number;
    conservationEvidence: string;
    stabilityNote?: string;
  };
  speciesResults: SpeciesResult[];
  methodology: {
    description: string;
    stabilityBand: string;
    interpretation: string;
  };
}

interface PiG0Data {
  summary: {
    totalDatasets: number;
    normalDatasets: number;
    mutantDatasets: number;
    normalMeanEigenvalue: number;
    mutantMeanEigenvalue: number;
    deltaLambda: number;
    normalPredictedPiG0: number;
    mutantPredictedPiG0: number;
    pathogenicDriftDetected: boolean;
  };
  datasetMappings: Array<{
    dataset: string;
    organism: string;
    meanEigenvalue: number;
    predictedPiG0: number;
    eigenvalueDistribution: { low: number; stable: number; high: number };
    condition: 'normal' | 'mutant' | 'unknown';
  }>;
  methodology: {
    description: string;
    formula: string;
    interpretation: string;
    biologicalBasis: string;
  };
  conditionComparison: {
    normal: { meanEigenvalue: number; predictedPiG0: number; interpretation: string };
    mutant: { meanEigenvalue: number; predictedPiG0: number; interpretation: string };
  };
}

export default function SpeciesComparison() {
  const { data: crossSpeciesData, isLoading: loadingCrossSpecies } = useQuery<CrossSpeciesData>({
    queryKey: ["/api/analyses/cross-species-comparison"],
    queryFn: async () => {
      const response = await fetch("/api/analyses/cross-species-comparison");
      if (!response.ok) throw new Error("Failed to fetch cross-species data");
      return response.json();
    }
  });

  const { data: piG0Data, isLoading: loadingPiG0 } = useQuery<PiG0Data>({
    queryKey: ["/api/analyses/pi-g0-mapping"],
    queryFn: async () => {
      const response = await fetch("/api/analyses/pi-g0-mapping");
      if (!response.ok) throw new Error("Failed to fetch π_G₀ mapping");
      return response.json();
    }
  });

  const handleDownloadAudit = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/download/stability-audit-report?format=${format}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PAR2_Stability_Audit_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const eigenvalueChartData = crossSpeciesData?.speciesResults.map(s => ({
    organism: ORGANISM_LABELS[s.organism] || s.organism,
    mean: s.eigenvalueStats.mean,
    min: s.eigenvalueStats.min,
    max: s.eigenvalueStats.max,
    std: s.eigenvalueStats.std,
    inBand: s.eigenvalueStats.inBandPercent,
    color: ORGANISM_COLORS[s.organism] || ORGANISM_COLORS.unknown
  })) || [];

  const scatterData = crossSpeciesData?.speciesResults.flatMap(s =>
    s.topPairs.map(p => ({
      x: p.eigenvalue,
      y: -Math.log10(p.pValue),
      organism: s.organism,
      clock: p.clock,
      target: p.target,
      color: ORGANISM_COLORS[s.organism] || ORGANISM_COLORS.unknown
    }))
  ) || [];

  const piG0ChartData = piG0Data?.datasetMappings.map(d => ({
    dataset: d.dataset.replace(/GSE\d+_/, '').replace(/_circadian\.csv$/, '').replace(/_/g, ' ').substring(0, 20),
    eigenvalue: d.meanEigenvalue,
    piG0: d.predictedPiG0,
    condition: d.condition,
    organism: d.organism
  })) || [];

  return (
    <div className="min-h-screen bg-background p-6" data-testid="species-comparison-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Dna className="h-8 w-8 text-cyan-400" />
              Cross-Species Eigenvalue Comparison
            </h1>
            <p className="text-muted-foreground mt-1">
              Conservation of circadian temporal dynamics across organisms
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownloadAudit('csv')}
              data-testid="download-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => handleDownloadAudit('json')}
              data-testid="download-json"
            >
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
        </div>

        <HowTo
          title="Multi-Species Comparison"
          summary="Validates the Gearbox Hypothesis across species by comparing clock vs. target eigenvalue hierarchies in mouse, human, baboon, and Arabidopsis datasets. Cross-species conservation of the hierarchy supports the biological universality of the AR(2) framework."
          steps={[
            { label: "Compare species", detail: "Each panel shows a species with its clock and target mean eigenvalues and whether the hierarchy is preserved." },
            { label: "Check orthology", detail: "Orthologous gene mappings link genes across species so the comparison is biologically meaningful." },
            { label: "Look for conservation", detail: "If clock > target holds across species, the temporal hierarchy is likely a conserved biological feature." }
          ]}
        />

        <div
          className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3"
          data-testid="edge-case-diagnostics-banner"
        >
          <ShieldAlert className="h-5 w-5 mt-0.5 text-amber-400 shrink-0" data-testid="icon-edge-case-diagnostics" />
          <p className="text-sm text-muted-foreground" data-testid="text-edge-case-diagnostics">
            <span className="font-semibold text-amber-400">Edge-case diagnostics enabled:</span>{" "}
            All AR(2) results now include automatic checks for trend detection, sample-size confidence, AR(3) order verification, nonlinearity screening, and boundary proximity assessment.
          </p>
        </div>

        {loadingCrossSpecies || loadingPiG0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <Activity className="h-8 w-8 animate-spin text-cyan-400" />
                <span className="ml-3 text-muted-foreground">Loading cross-species analysis...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="full-results">Full Results</TabsTrigger>
              <TabsTrigger value="eigenvalues">Eigenvalue Distribution</TabsTrigger>
              <TabsTrigger value="pi-g0">π_G₀ Mapping</TabsTrigger>
              <TabsTrigger value="methodology">Methodology</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Organisms Analyzed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-cyan-400">
                      {crossSpeciesData?.summary.organismsAnalyzed || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Datasets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-400">
                      {crossSpeciesData?.summary.totalDatasets || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Global Mean |λ|</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      {crossSpeciesData?.summary.globalMeanEigenvalue || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Conservation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-medium text-amber-400">
                      {crossSpeciesData?.summary.conservationEvidence?.includes('Strong') ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          Conserved
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Variable
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {crossSpeciesData?.speciesResults.map(species => (
                  <Card key={species.organism} className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: ORGANISM_COLORS[species.organism] }}
                        />
                        {ORGANISM_LABELS[species.organism] || species.organism}
                      </CardTitle>
                      <CardDescription>
                        {species.datasetCount} datasets | {species.totalPairs} gene pairs analyzed
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-cyan-400">
                            {species.eigenvalueStats.mean}
                          </div>
                          <div className="text-xs text-muted-foreground">Mean |λ|</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">
                            {species.eigenvalueStats.inBandPercent}%
                          </div>
                          <div className="text-xs text-muted-foreground">In Stability Band</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-400">
                            {species.significanceRate}%
                          </div>
                          <div className="text-xs text-muted-foreground">Significant Pairs</div>
                        </div>
                      </div>

                      {species.stabilityFiltered && (
                        <div className="flex items-center justify-between px-3 py-2 rounded bg-muted/20 border border-border/50" data-testid={`stability-filter-${species.organism}`}>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`h-4 w-4 ${species.stabilityFiltered.stablePercent >= 90 ? 'text-green-400' : species.stabilityFiltered.stablePercent >= 70 ? 'text-amber-400' : 'text-red-400'}`} />
                            <span className="text-sm font-medium">Stable Fits:</span>
                            <span className={`text-sm font-bold ${species.stabilityFiltered.stablePercent >= 90 ? 'text-green-400' : species.stabilityFiltered.stablePercent >= 70 ? 'text-amber-400' : 'text-red-400'}`} data-testid={`stable-percent-${species.organism}`}>
                              {species.stabilityFiltered.stablePercent}%
                            </span>
                          </div>
                          {species.stabilityFiltered.unstableCount > 0 && (
                            <div className="flex items-center gap-1.5" data-testid={`unstable-warning-${species.organism}`}>
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                              <span className="text-xs text-amber-400">{species.stabilityFiltered.unstableCount} unstable</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Top Significant Pairs</div>
                        <div className="space-y-1">
                          {species.topPairs.slice(0, 5).map((pair, i) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-muted/30 px-3 py-1.5 rounded">
                              <span className="font-mono">
                                {pair.clock} → {pair.target}
                              </span>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="font-mono">
                                  |λ|={pair.eigenvalue}
                                </Badge>
                                <span className="text-muted-foreground">
                                  p={pair.pValue.toExponential(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="full-results" className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Complete Cross-Species Results</CardTitle>
                  <CardDescription>
                    All {crossSpeciesData?.summary.totalPairs || 0} gene pairs across {crossSpeciesData?.summary.totalDatasets || 0} datasets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <div className="text-3xl font-bold text-cyan-400">{crossSpeciesData?.summary.organismsAnalyzed || 0}</div>
                      <div className="text-sm text-muted-foreground">Organisms</div>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <div className="text-3xl font-bold text-purple-400">{crossSpeciesData?.summary.totalDatasets || 0}</div>
                      <div className="text-sm text-muted-foreground">Datasets</div>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="text-3xl font-bold text-green-400">{crossSpeciesData?.summary.totalPairs || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Pairs</div>
                    </div>
                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                      <div className="text-3xl font-bold text-amber-400">{crossSpeciesData?.summary.globalMeanEigenvalue || 0}</div>
                      <div className="text-sm text-muted-foreground">Global Mean |λ|</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {crossSpeciesData?.speciesResults.map(species => (
                <Card key={species.organism} className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: ORGANISM_COLORS[species.organism] }}
                      />
                      {ORGANISM_LABELS[species.organism] || species.organism}
                      <Badge variant="outline" className="ml-2">{species.datasetCount} datasets</Badge>
                      <Badge variant="outline">{species.totalPairs} pairs</Badge>
                    </CardTitle>
                    <CardDescription>
                      Mean |λ| = {species.eigenvalueStats.mean} ± {species.eigenvalueStats.std} | Range: [{species.eigenvalueStats.min}, {species.eigenvalueStats.max}] | {species.eigenvalueStats.inBandPercent}% in stability band (0.40-0.80)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Datasets Analyzed:</h4>
                      <div className="flex flex-wrap gap-2">
                        {species.datasets.map((ds, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-mono">
                            {ds.replace(/_circadian\.csv$/, '').replace(/^GSE\d+_/, '')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mb-2">All Significant Gene Pairs ({species.topPairs.length}):</h4>
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background">
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-2">Clock Gene</th>
                            <th className="text-left py-2 px-2">Target Gene</th>
                            <th className="text-right py-2 px-2">|λ|</th>
                            <th className="text-right py-2 px-2">p-value</th>
                            <th className="text-left py-2 px-2">Dataset</th>
                            <th className="text-center py-2 px-2">Stability Band</th>
                            <th className="text-center py-2 px-2">Stable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {species.topPairs.map((pair, i) => (
                            <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-2 px-2 font-mono text-cyan-400">{pair.clock}</td>
                              <td className="py-2 px-2 font-mono text-purple-400">{pair.target}</td>
                              <td className="py-2 px-2 text-right font-mono">
                                <span className={pair.eigenvalue >= 0.40 && pair.eigenvalue <= 0.80 ? 'text-green-400' : 'text-muted-foreground'}>
                                  {pair.eigenvalue.toFixed(3)}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-muted-foreground">
                                {pair.pValue.toExponential(2)}
                              </td>
                              <td className="py-2 px-2 text-xs text-muted-foreground">
                                {pair.dataset.replace(/_circadian\.csv$/, '').replace(/^GSE\d+_/, '').substring(0, 25)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                {pair.eigenvalue >= 0.40 && pair.eigenvalue <= 0.80 ? (
                                  <Badge variant="default" className="bg-green-600 text-xs">In Band</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Outside</Badge>
                                )}
                              </td>
                              <td className="py-2 px-2 text-center" data-testid={`stable-indicator-${species.organism}-${i}`}>
                                {pair.eigenvalue < 1.0 ? (
                                  <Badge variant="default" className="bg-green-600 text-xs inline-flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Stable
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs inline-flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Unstable
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="eigenvalues" className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Eigenvalue Distribution by Organism</CardTitle>
                  <CardDescription>
                    Mean |λ| with range across all datasets per organism
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eigenvalueChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        type="number" 
                        domain={[0, 1]} 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        label={{ value: 'Eigenvalue Modulus |λ|', position: 'insideBottom', offset: -5, fill: 'hsl(var(--foreground))' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="organism" 
                        width={150}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number, name: string) => [value.toFixed(3), name]}
                      />
                      <Bar dataKey="mean" name="Mean |λ|" radius={[0, 4, 4, 0]}>
                        {eigenvalueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Volcano Plot: Eigenvalue vs Significance</CardTitle>
                  <CardDescription>
                    Significant gene pairs colored by organism (higher = more significant)
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="Eigenvalue" 
                        domain={[0, 1]}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        label={{ value: 'Eigenvalue Modulus |λ|', position: 'insideBottom', offset: -5, fill: 'hsl(var(--foreground))' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name="-log10(p)" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        label={{ value: '-log₁₀(p-value)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                      />
                      <ZAxis range={[50, 150]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'Eigenvalue') return [value.toFixed(3), '|λ|'];
                          if (name === '-log10(p)') return [value.toFixed(2), '-log₁₀(p)'];
                          return [value, name];
                        }}
                        labelFormatter={(label) => ''}
                      />
                      <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                      {Object.entries(ORGANISM_COLORS).map(([organism, color]) => (
                        <Scatter 
                          key={organism}
                          name={ORGANISM_LABELS[organism] || organism}
                          data={scatterData.filter(d => d.organism === organism)}
                          fill={color}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pi-g0" className="space-y-6">
              {piG0Data?.summary.pathogenicDriftDetected && (
                <Card className="border-red-500/50 bg-gradient-to-br from-red-500/10 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      Pathogenic Drift Detected
                    </CardTitle>
                    <CardDescription>
                      Mutant tissues show Δλ = {piG0Data.summary.deltaLambda} (threshold: 0.1)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-500/10 rounded-lg">
                        <div className="text-sm text-muted-foreground">Normal Tissue</div>
                        <div className="text-2xl font-bold text-green-400">
                          |λ| = {piG0Data.summary.normalMeanEigenvalue}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          π_G₀ ≈ {piG0Data.summary.normalPredictedPiG0}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-red-500/10 rounded-lg">
                        <div className="text-sm text-muted-foreground">Mutant Tissue</div>
                        <div className="text-2xl font-bold text-red-400">
                          |λ| = {piG0Data.summary.mutantMeanEigenvalue}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          π_G₀ ≈ {piG0Data.summary.mutantPredictedPiG0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>π_G₀ ↔ |λ| Mapping</CardTitle>
                  <CardDescription>
                    Predicted cell-cycle G₀ latency probability from eigenvalue modulus
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        type="number" 
                        dataKey="eigenvalue" 
                        name="Eigenvalue" 
                        domain={[0, 1]}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        label={{ value: 'Eigenvalue Modulus |λ|', position: 'insideBottom', offset: -5, fill: 'hsl(var(--foreground))' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="piG0" 
                        name="π_G₀" 
                        domain={[0, 0.5]}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        label={{ value: 'Predicted π_G₀', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => value.toFixed(3)}
                      />
                      <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                      <Scatter 
                        name="Normal" 
                        data={piG0ChartData.filter(d => d.condition === 'normal')}
                        fill="#4ade80"
                      />
                      <Scatter 
                        name="Mutant" 
                        data={piG0ChartData.filter(d => d.condition === 'mutant')}
                        fill="#f87171"
                      />
                      <Scatter 
                        name="Unknown" 
                        data={piG0ChartData.filter(d => d.condition === 'unknown')}
                        fill="#6b7280"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Dataset Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3">Dataset</th>
                          <th className="text-left py-2 px-3">Organism</th>
                          <th className="text-left py-2 px-3">Condition</th>
                          <th className="text-right py-2 px-3">Mean |λ|</th>
                          <th className="text-right py-2 px-3">Predicted π_G₀</th>
                        </tr>
                      </thead>
                      <tbody>
                        {piG0Data?.datasetMappings.slice(0, 20).map((d, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-2 px-3 font-mono text-xs">
                              {d.dataset.substring(0, 40)}...
                            </td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" style={{ borderColor: ORGANISM_COLORS[d.organism] }}>
                                {d.organism}
                              </Badge>
                            </td>
                            <td className="py-2 px-3">
                              <Badge 
                                variant={d.condition === 'mutant' ? 'destructive' : d.condition === 'normal' ? 'default' : 'secondary'}
                              >
                                {d.condition}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-right font-mono">{d.meanEigenvalue}</td>
                            <td className="py-2 px-3 text-right font-mono">{d.predictedPiG0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="methodology" className="space-y-6">
              <Card className="border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-cyan-400" />
                    Cross-Species Comparison Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground">
                      {crossSpeciesData?.methodology.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="font-semibold text-cyan-400">Stability Band</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {crossSpeciesData?.methodology.stabilityBand}
                        </div>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="font-semibold text-purple-400">Interpretation</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {crossSpeciesData?.methodology.interpretation}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    π_G₀ ↔ |λ| Mapping Formula
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-muted/30 rounded-lg text-center">
                    <div className="text-2xl font-mono text-cyan-400">
                      π_G₀ = |λ|² / (1 + |λ|²)
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {piG0Data?.methodology.formula}
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground">
                      <strong>Description:</strong> {piG0Data?.methodology.description}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Biological Basis:</strong> {piG0Data?.methodology.biologicalBasis}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Interpretation:</strong> {piG0Data?.methodology.interpretation}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-500/30">
                <CardHeader>
                  <CardTitle>Stability Audit Report</CardTitle>
                  <CardDescription>
                    Download complete audit trail with timestamps for all PAR(2) analyses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button onClick={() => handleDownloadAudit('csv')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV Report
                    </Button>
                    <Button onClick={() => handleDownloadAudit('json')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download JSON Report
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    The Stability Audit Report includes: analysis timestamps, dataset names, organism classification,
                    clock-target gene pairs, p-values, significance flags, eigenvalue modulus values, and stability band classification.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
