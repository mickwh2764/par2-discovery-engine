import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft, Activity, AlertTriangle, CheckCircle2, XCircle, 
  ArrowRight, GitBranch, Info, Play, Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import HowTo from "@/components/HowTo";

interface GrangerResult {
  clockGene: string;
  targetGene: string;
  fStatistic: number;
  pValue: number;
  significant: boolean;
  direction: 'clock→target' | 'target→clock' | 'bidirectional' | 'none';
  lags: number;
  interpretation: string;
  warnings: string[];
  minimumSamplesRequired: number;
  actualSamples: number;
}

function FDRWarningBadge({ level }: { level: 'EXPLORATORY' | 'REPLICATED' | 'VALIDATED' }) {
  const colors = {
    EXPLORATORY: 'bg-red-500/20 text-red-400 border-red-500/30',
    REPLICATED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    VALIDATED: 'bg-green-500/20 text-green-400 border-green-500/30'
  };
  
  return (
    <Badge className={`${colors[level]} border flex items-center gap-1`}>
      <AlertTriangle className="w-3 h-3" />
      {level}
    </Badge>
  );
}

function DirectionArrow({ direction }: { direction: GrangerResult['direction'] }) {
  switch (direction) {
    case 'clock→target':
      return (
        <div className="flex items-center gap-2 text-green-400">
          <span className="font-medium">Clock</span>
          <ArrowRight className="w-5 h-5" />
          <span className="font-medium">Target</span>
        </div>
      );
    case 'target→clock':
      return (
        <div className="flex items-center gap-2 text-yellow-400">
          <span className="font-medium">Target</span>
          <ArrowRight className="w-5 h-5" />
          <span className="font-medium">Clock</span>
        </div>
      );
    case 'bidirectional':
      return (
        <div className="flex items-center gap-2 text-cyan-400">
          <span className="font-medium">Bidirectional</span>
          <GitBranch className="w-5 h-5" />
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-medium">No causality</span>
          <XCircle className="w-5 h-5" />
        </div>
      );
  }
}

export default function GrangerAnalysis() {
  const [clockGene, setClockGene] = useState("Per1");
  const [targetGene, setTargetGene] = useState("Wee1");
  const [lags, setLags] = useState(2);
  const [clockValues, setClockValues] = useState("1.2, 0.8, 1.5, 0.6, 1.8, 0.4, 1.1, 0.9, 1.6, 0.5, 1.7, 0.3, 1.0, 0.7, 1.4, 0.55");
  const [targetValues, setTargetValues] = useState("0.9, 1.1, 0.7, 1.3, 0.5, 1.5, 0.8, 1.2, 0.6, 1.4, 0.55, 1.45, 0.75, 1.25, 0.65, 1.35");
  const [result, setResult] = useState<GrangerResult | null>(null);

  const testMutation = useMutation({
    mutationFn: async () => {
      const clockArray = clockValues.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      const targetArray = targetValues.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      
      const response = await apiRequest('POST', '/api/granger-causality/test', {
        clockGene,
        targetGene,
        clockValues: clockArray,
        targetValues: targetArray,
        lags
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <GitBranch className="w-6 h-6 text-cyan-400" />
                Granger Causality Analysis
              </h1>
              <p className="text-slate-400 text-sm">
                Exploratory test of predictive relationships between clock and target genes (underpowered with typical circadian data)
              </p>
            </div>
          </div>
          <FDRWarningBadge level="EXPLORATORY" />
        </div>

        <HowTo
          title="Granger Causality Analysis"
          summary="Tests whether clock gene expression Granger-causes target gene expression in the time-series data. A positive result means past clock gene values help predict future target gene values, supporting a regulatory relationship."
          steps={[
            { label: "Select a dataset", detail: "Choose which dataset to test for Granger causality between clock and target genes." },
            { label: "Read the results", detail: "Each pair shows the F-statistic and p-value for the Granger test." },
            { label: "Look for significance", detail: "Low p-values (< 0.05) indicate statistically significant predictive relationships." }
          ]}
        />

        <Alert className="border-amber-600/50 bg-amber-950/30 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <AlertTitle className="text-amber-300 text-lg">Supplementary / Exploratory Analysis</AlertTitle>
          <AlertDescription className="text-amber-200/80 space-y-2">
            <p>
              This Granger causality analysis is included for completeness but should be treated as 
              <strong className="text-amber-300"> hypothesis-generating only</strong>. Key limitations:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Circadian time series typically have 6-12 timepoints — well below the ≥30 recommended for reliable Granger testing</li>
              <li>No multiple testing correction is applied across gene pairs</li>
              <li>Granger causality tests predictive relationships, not mechanistic causation</li>
              <li>Results should not be cited as evidence of causal gene regulatory relationships</li>
            </ul>
            <p className="text-sm italic mt-2">
              For publication: cite as "exploratory Granger analysis (underpowered)" in supplementary materials only.
            </p>
          </AlertDescription>
        </Alert>

        {/* Method Explanation */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-cyan-400 mb-1">What is Granger Causality?</p>
                <p>
                  X "Granger-causes" Y if past values of X help predict Y better than Y's own history alone.
                  This tests whether clock genes provide predictive information about target gene dynamics
                  beyond simple correlation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Form */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Enter gene names and time series data (comma-separated values)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clockGene">Clock Gene</Label>
                <Input 
                  id="clockGene"
                  value={clockGene}
                  onChange={(e) => setClockGene(e.target.value)}
                  className="bg-slate-800 border-slate-600"
                  data-testid="input-clock-gene"
                />
              </div>
              <div>
                <Label htmlFor="targetGene">Target Gene</Label>
                <Input 
                  id="targetGene"
                  value={targetGene}
                  onChange={(e) => setTargetGene(e.target.value)}
                  className="bg-slate-800 border-slate-600"
                  data-testid="input-target-gene"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clockValues">Clock Gene Values (comma-separated)</Label>
              <Input 
                id="clockValues"
                value={clockValues}
                onChange={(e) => setClockValues(e.target.value)}
                className="bg-slate-800 border-slate-600 font-mono text-xs"
                data-testid="input-clock-values"
              />
            </div>

            <div>
              <Label htmlFor="targetValues">Target Gene Values (comma-separated)</Label>
              <Input 
                id="targetValues"
                value={targetValues}
                onChange={(e) => setTargetValues(e.target.value)}
                className="bg-slate-800 border-slate-600 font-mono text-xs"
                data-testid="input-target-values"
              />
            </div>

            <div>
              <Label>Lag Order: {lags}</Label>
              <Slider 
                value={[lags]}
                onValueChange={(v) => setLags(v[0])}
                min={1}
                max={5}
                step={1}
                className="mt-2"
                data-testid="slider-lags"
              />
              <p className="text-xs text-slate-400 mt-1">
                Higher lags test for longer-range temporal dependencies
              </p>
            </div>

            <Button 
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
              className="w-full"
              data-testid="button-run-test"
            >
              {testMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Granger Causality Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className={`border ${result.significant ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 bg-slate-900'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Results: {result.clockGene} → {result.targetGene}</span>
                <Badge variant={result.significant ? "default" : "secondary"}>
                  {result.significant ? 'Significant' : 'Not Significant'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center py-4">
                <DirectionArrow direction={result.direction} />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="text-2xl font-bold text-cyan-400">
                    {result.fStatistic.toFixed(3)}
                  </div>
                  <div className="text-sm text-slate-400">F-statistic</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className={`text-2xl font-bold ${result.pValue < 0.05 ? 'text-green-400' : 'text-slate-400'}`}>
                    {result.pValue < 0.001 ? '<0.001' : result.pValue.toFixed(4)}
                  </div>
                  <div className="text-sm text-slate-400">p-value</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="text-2xl font-bold text-pink-400">
                    {result.actualSamples}
                  </div>
                  <div className="text-sm text-slate-400">Samples</div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-slate-300">{result.interpretation}</p>
              </div>

              {result.warnings.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-medium text-sm">Warnings</p>
                      <ul className="text-yellow-400/80 text-sm mt-1 space-y-1">
                        {result.warnings.map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {result.actualSamples < result.minimumSamplesRequired && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                    <p className="text-red-400 text-sm">
                      Sample size ({result.actualSamples}) is below the recommended minimum ({result.minimumSamplesRequired}).
                      Results should be treated with caution.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Caveats */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-sm text-slate-400">
                <p className="font-medium text-yellow-400 mb-2">Important Caveats</p>
                <ul className="space-y-1">
                  <li>• Granger causality is predictive, not mechanistic — it cannot prove gene A regulates gene B</li>
                  <li>• Circadian datasets (6-12 timepoints) are fundamentally underpowered for this test (minimum 30+ recommended)</li>
                  <li>• No FDR/Bonferroni correction is applied — individual p-values are nominal only</li>
                  <li>• This analysis is included as a supplementary exploration, not as primary evidence</li>
                  <li>• For publication-grade Granger analysis, use dedicated tools (R vars package, statsmodels) with longer time series</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
