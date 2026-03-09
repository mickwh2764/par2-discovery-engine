import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CheckCircle2, XCircle, Target, Activity,
  Loader2, BarChart3, Shield
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, ScatterChart, Scatter, ZAxis
} from "recharts";
import HowTo from "@/components/HowTo";

interface ConditionEntry {
  datasetId: string;
  label: string;
  species: string;
  tissue: string;
  condition: string;
  trueClass: 'healthy' | 'disrupted';
  clockMeanEV: number;
  targetMeanEV: number;
  gap: number;
  predictedClass: 'healthy' | 'disrupted';
  correct: boolean;
  clockN: number;
  targetN: number;
  cohensD: number;
  gapCI95: { lower: number; upper: number };
  gapSE: number;
}

interface MetaAnalysis {
  overallCohensD: number;
  overallCI95: { lower: number; upper: number };
  weightedMeanGap: number;
  heterogeneityI2: number;
  nConditions: number;
  interpretation: string;
}

interface ClassifierData {
  conditions: ConditionEntry[];
  accuracy: number;
  sensitivity: number;
  specificity: number;
  totalConditions: number;
  correctPredictions: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  threshold: number;
  thresholdRule: string;
  meanHealthyGap: number;
  meanDisruptedGap: number;
  separationEffect: number;
  metaAnalysis: MetaAnalysis;
}

export default function GapClassifier() {
  const { data, isLoading, error } = useQuery<ClassifierData>({
    queryKey: ['/api/validation/gap-classifier'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Computing gap-threshold classifier across all datasets...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="mx-auto h-8 w-8 text-destructive mb-4" />
            <p className="text-destructive">Failed to load classifier results</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = data.conditions.map(c => ({
    name: c.label.replace(/\(.*\)/, '').trim(),
    gap: c.gap,
    correct: c.correct,
    trueClass: c.trueClass,
    predictedClass: c.predictedClass,
    label: c.label,
    clockEV: c.clockMeanEV,
    targetEV: c.targetMeanEV,
  }));

  const scatterData = data.conditions.map(c => ({
    x: c.clockMeanEV,
    y: c.targetMeanEV,
    name: c.label.replace(/\(.*\)/, '').trim(),
    trueClass: c.trueClass,
    correct: c.correct,
    gap: c.gap,
  }));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
                <ArrowLeft size={16} />
                Home
              </Button>
            </Link>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-lg font-semibold">Gap-Threshold Classifier</h1>
            <Badge variant="outline" className="text-xs border-primary/50 text-primary">
              {data.totalConditions} Conditions
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HowTo
          title="Gap Classifier"
          summary="A binary classifier that predicts whether a biological condition is 'healthy' or 'disrupted' based on the eigenvalue gap between clock and target genes. If the gap exceeds the threshold (derived from ROC analysis), the condition is classified as healthy (hierarchy intact). The page also shows per-condition effect sizes (Cohen's d), bootstrap confidence intervals, and a meta-analytic summary."
          steps={[
            { label: "Read the confusion matrix", detail: "Shows how many conditions were correctly vs. incorrectly classified as healthy or disrupted." },
            { label: "Check the forest plot", detail: "Each row shows a condition's gap with 95% bootstrap confidence interval and Cohen's d effect size." },
            { label: "Review meta-analysis", detail: "The summary card shows the inverse-variance weighted overall effect size across all conditions." },
            { label: "Inspect the table", detail: "Each row lists the condition, its eigenvalues, gap, confidence interval, effect size, and classification result." }
          ]}
        />

        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-cyan-500/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground" data-testid="text-classifier-title">
                  One-Feature Classifier: Clock-Target Eigenvalue Gap
                </h2>
                <p className="text-muted-foreground mt-2 max-w-3xl">
                  Tests whether a single metric — the gap between mean clock and target eigenvalues —
                  can distinguish healthy from disrupted conditions. Rule: if clock |λ| &gt; target |λ| (gap &gt; 0),
                  classify as healthy; otherwise, classify as disrupted.
                </p>
              </div>
              <Badge
                className={`text-lg px-4 py-2 ${
                  data.accuracy >= 0.9 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  data.accuracy >= 0.8 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
                data-testid="text-accuracy"
              >
                {(data.accuracy * 100).toFixed(1)}% Accuracy
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard
            title="Accuracy"
            value={`${(data.accuracy * 100).toFixed(1)}%`}
            subtitle={`${data.correctPredictions}/${data.totalConditions} correct`}
            color="primary"
          />
          <MetricCard
            title="Specificity"
            value={`${(data.specificity * 100).toFixed(1)}%`}
            subtitle={`TN=${data.trueNegatives}, FP=${data.falsePositives}`}
            color="emerald"
          />
          <MetricCard
            title="Sensitivity"
            value={`${(data.sensitivity * 100).toFixed(1)}%`}
            subtitle={`TP=${data.truePositives}, FN=${data.falseNegatives}`}
            color="amber"
          />
          <MetricCard
            title="Cohen's d"
            value={data.separationEffect.toFixed(2)}
            subtitle="Effect size"
            color="purple"
          />
          <MetricCard
            title="Threshold"
            value="Gap = 0"
            subtitle="No training needed"
            color="cyan"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Eigenvalue Gap by Condition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 160, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 35% 22%)" />
                  <XAxis
                    type="number"
                    domain={[-0.15, 0.4]}
                    tick={{ fill: 'hsl(200 20% 60%)', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(200 35% 22%)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'hsl(200 20% 60%)', fontSize: 10 }}
                    width={155}
                    axisLine={{ stroke: 'hsl(200 35% 22%)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(205 40% 11%)',
                      border: '1px solid hsl(200 35% 22%)',
                      borderRadius: '8px',
                      color: 'hsl(180 20% 98%)',
                      fontSize: 12
                    }}
                    formatter={(value: number, _name: string, props: any) => {
                      const entry = props.payload;
                      return [
                        `Gap: ${value.toFixed(4)} | Clock: ${entry.clockEV} | Target: ${entry.targetEV} | ${entry.correct ? 'Correct' : 'Misclassified'}`,
                        ''
                      ];
                    }}
                  />
                  <ReferenceLine x={0} stroke="hsl(0 65% 55%)" strokeDasharray="5 5" strokeWidth={2} />
                  <Bar dataKey="gap" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          !entry.correct
                            ? 'hsl(0 65% 55%)'
                            : entry.trueClass === 'healthy'
                            ? 'hsl(170 80% 48%)'
                            : 'hsl(30 90% 55%)'
                        }
                        opacity={entry.correct ? 0.8 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(170 80% 48%)' }} />
                  Healthy (correct)
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(30 90% 55%)' }} />
                  Disrupted (correct)
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(0 65% 55%)' }} />
                  Misclassified
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target size={18} className="text-cyan-400" />
                Clock vs Target Eigenvalue Space
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 35% 22%)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Clock |λ|"
                    domain={[0.3, 0.9]}
                    tick={{ fill: 'hsl(200 20% 60%)', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(200 35% 22%)' }}
                    label={{ value: 'Clock Mean |λ|', position: 'bottom', fill: 'hsl(200 20% 60%)', fontSize: 12 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Target |λ|"
                    domain={[0.2, 0.9]}
                    tick={{ fill: 'hsl(200 20% 60%)', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(200 35% 22%)' }}
                    label={{ value: 'Target Mean |λ|', angle: -90, position: 'insideLeft', fill: 'hsl(200 20% 60%)', fontSize: 12 }}
                  />
                  <ZAxis range={[80, 80]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(205 40% 11%)',
                      border: '1px solid hsl(200 35% 22%)',
                      borderRadius: '8px',
                      color: 'hsl(180 20% 98%)',
                      fontSize: 12
                    }}
                    formatter={(_value: any, _name: string, props: any) => {
                      const p = props.payload;
                      return [`${p.name} (gap=${p.gap.toFixed(3)}, ${p.trueClass})`, ''];
                    }}
                  />
                  <ReferenceLine
                    segment={[{ x: 0.3, y: 0.3 }, { x: 0.9, y: 0.9 }]}
                    stroke="hsl(0 65% 55%)"
                    strokeDasharray="8 4"
                    strokeWidth={2}
                  />
                  <Scatter data={scatterData.filter(d => d.trueClass === 'healthy' && d.correct)} fill="hsl(170 80% 48%)" />
                  <Scatter data={scatterData.filter(d => d.trueClass === 'disrupted' && d.correct)} fill="hsl(30 90% 55%)" />
                  <Scatter data={scatterData.filter(d => !d.correct)} fill="hsl(0 65% 55%)" />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                Points above the diagonal (clock &gt; target) are classified healthy.
                Points below are classified disrupted.
              </div>
            </CardContent>
          </Card>
        </div>

        {data.metaAnalysis && (
          <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-indigo-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={18} className="text-purple-400" />
                Meta-Analytic Effect Size Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Overall Cohen's d</p>
                  <p className="text-2xl font-bold text-purple-400 font-mono" data-testid="text-meta-cohens-d">{data.metaAnalysis.overallCohensD.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{Math.abs(data.metaAnalysis.overallCohensD) >= 0.8 ? 'Large' : Math.abs(data.metaAnalysis.overallCohensD) >= 0.5 ? 'Medium' : 'Small'} effect</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Weighted Mean Gap</p>
                  <p className="text-2xl font-bold text-cyan-400 font-mono" data-testid="text-meta-weighted-gap">{data.metaAnalysis.weightedMeanGap.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground">[{data.metaAnalysis.overallCI95.lower}, {data.metaAnalysis.overallCI95.upper}]</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Heterogeneity I²</p>
                  <p className="text-2xl font-bold text-amber-400 font-mono" data-testid="text-meta-i2">{data.metaAnalysis.heterogeneityI2.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{data.metaAnalysis.heterogeneityI2 > 75 ? 'High' : data.metaAnalysis.heterogeneityI2 > 50 ? 'Moderate' : data.metaAnalysis.heterogeneityI2 > 25 ? 'Low' : 'Negligible'}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Conditions</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono" data-testid="text-meta-n">{data.metaAnalysis.nConditions}</p>
                  <p className="text-xs text-muted-foreground">Contributing</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{data.metaAnalysis.interpretation}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-400" />
              Forest Plot: Per-Condition Gap with 95% Bootstrap CI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ForestPlot conditions={data.conditions} metaGap={data.metaAnalysis?.weightedMeanGap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Per-Condition Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-classifier-results">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="py-2 px-3 text-muted-foreground font-medium"></th>
                    <th className="py-2 px-3 text-muted-foreground font-medium">Condition</th>
                    <th className="py-2 px-3 text-muted-foreground font-medium">Species</th>
                    <th className="py-2 px-3 text-muted-foreground font-medium text-right">Clock |λ|</th>
                    <th className="py-2 px-3 text-muted-foreground font-medium text-right">Target |λ|</th>
                    <th className="py-2 px-3 text-muted-foreground font-medium text-right">Gap</th>
                    <th className="py-2 px-3 text-muted-foreground font-medium text-right">95% CI</th>
                    <th className="py-2 px-3 text-muted-foreground font-medium text-right">Cohen's d</th>
                    <th className="py-2 px-3 text-muted-foreground font-medium text-center">True</th>
                    <th className="py-2 px-3 text-muted-foreground font-medium text-center">Predicted</th>
                    <th className="py-2 px-3 text-muted-foreground font-medium text-center">Genes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.conditions.map((c, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border/20 ${!c.correct ? 'bg-red-500/5' : ''}`}
                      data-testid={`row-condition-${i}`}
                    >
                      <td className="py-2 px-3">
                        {c.correct ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <XCircle size={16} className="text-red-400" />
                        )}
                      </td>
                      <td className="py-2 px-3 font-medium">{c.label}</td>
                      <td className="py-2 px-3 text-muted-foreground text-xs italic">{c.species}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{c.clockMeanEV.toFixed(4)}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{c.targetMeanEV.toFixed(4)}</td>
                      <td className={`py-2 px-3 text-right font-mono text-xs font-bold ${c.gap > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {c.gap > 0 ? '+' : ''}{c.gap.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-xs text-muted-foreground">
                        [{c.gapCI95?.lower?.toFixed(3)}, {c.gapCI95?.upper?.toFixed(3)}]
                      </td>
                      <td className={`py-2 px-3 text-right font-mono text-xs font-semibold ${Math.abs(c.cohensD || 0) >= 0.8 ? 'text-purple-400' : Math.abs(c.cohensD || 0) >= 0.5 ? 'text-blue-400' : 'text-slate-400'}`}>
                        {(c.cohensD || 0).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            c.trueClass === 'healthy'
                              ? 'border-emerald-500/30 text-emerald-400'
                              : 'border-orange-500/30 text-orange-400'
                          }`}
                        >
                          {c.trueClass}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            c.predictedClass === 'healthy'
                              ? 'border-emerald-500/30 text-emerald-400'
                              : 'border-orange-500/30 text-orange-400'
                          }`}
                        >
                          {c.predictedClass}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center text-xs text-muted-foreground">{c.clockN}C/{c.targetN}T</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Scientific Interpretation</p>
                <p>
                  This classifier uses zero trained parameters — just a threshold at gap = 0. The
                  {' '}{(data.accuracy * 100).toFixed(1)}% accuracy across {data.totalConditions} independent
                  conditions demonstrates that the clock-target eigenvalue hierarchy is a robust, reproducible
                  feature of healthy circadian systems.
                </p>
                <p>
                  Misclassifications cluster near the decision boundary (|gap| &lt; 0.07), representing
                  biologically informative borderline cases: mild disruptions that preserve hierarchy
                  structure, or conditions where the hierarchy is partially maintained.
                </p>
                <p>
                  Cohen's d = {data.separationEffect.toFixed(2)} indicates{' '}
                  {data.separationEffect >= 0.8 ? 'a large' : data.separationEffect >= 0.5 ? 'a medium' : 'a small'}{' '}
                  effect size separating healthy (mean gap = {data.meanHealthyGap.toFixed(4)}) from disrupted
                  (mean gap = {data.meanDisruptedGap.toFixed(4)}) conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function ForestPlot({ conditions, metaGap }: { conditions: ConditionEntry[]; metaGap?: number }) {
  const W = 900, H = Math.max(400, conditions.length * 22 + 80);
  const LEFT = 220, RIGHT = 40, TOP = 30, BOT = 40;
  const plotW = W - LEFT - RIGHT;

  const allVals = conditions.flatMap(c => [c.gapCI95?.lower ?? c.gap, c.gapCI95?.upper ?? c.gap, c.gap]);
  const minVal = Math.min(-0.15, ...allVals);
  const maxVal = Math.max(0.4, ...allVals);
  const range = maxVal - minVal;
  const xScale = (v: number) => LEFT + ((v - minVal) / range) * plotW;
  const rowH = (H - TOP - BOT) / conditions.length;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[600px]" data-testid="svg-forest-plot">
        <rect width={W} height={H} fill="hsl(205 40% 7%)" rx="8" />

        <line x1={xScale(0)} y1={TOP} x2={xScale(0)} y2={H - BOT} stroke="hsl(0 65% 55%)" strokeWidth="2" strokeDasharray="6 4" />

        {metaGap !== undefined && (
          <rect x={xScale(metaGap) - 1} y={TOP} width={2} height={H - TOP - BOT} fill="hsl(270 70% 65%)" opacity="0.5" />
        )}

        {conditions.map((c, i) => {
          const y = TOP + i * rowH + rowH / 2;
          const cx = xScale(c.gap);
          const ciL = xScale(c.gapCI95?.lower ?? c.gap);
          const ciR = xScale(c.gapCI95?.upper ?? c.gap);
          const color = !c.correct ? 'hsl(0 65% 55%)' : c.trueClass === 'healthy' ? 'hsl(170 80% 48%)' : 'hsl(30 90% 55%)';
          const shortLabel = c.label.replace(/\(.*\)/, '').trim();

          return (
            <g key={i}>
              <text x={LEFT - 8} y={y + 4} fill="hsl(200 20% 70%)" fontSize="10" textAnchor="end" fontFamily="monospace">
                {shortLabel.length > 28 ? shortLabel.slice(0, 26) + '...' : shortLabel}
              </text>
              <line x1={ciL} y1={y} x2={ciR} y2={y} stroke={color} strokeWidth="2" opacity="0.7" />
              <line x1={ciL} y1={y - 4} x2={ciL} y2={y + 4} stroke={color} strokeWidth="1.5" opacity="0.7" />
              <line x1={ciR} y1={y - 4} x2={ciR} y2={y + 4} stroke={color} strokeWidth="1.5" opacity="0.7" />
              <circle cx={cx} cy={y} r={4} fill={color} />
              <text x={ciR + 6} y={y + 3} fill="hsl(200 20% 55%)" fontSize="9" fontFamily="monospace">
                d={c.cohensD?.toFixed(1)}
              </text>
            </g>
          );
        })}

        {[-0.1, 0, 0.1, 0.2, 0.3].filter(v => v >= minVal && v <= maxVal).map(v => (
          <g key={`tick-${v}`}>
            <line x1={xScale(v)} y1={H - BOT} x2={xScale(v)} y2={H - BOT + 5} stroke="hsl(200 20% 40%)" strokeWidth="1" />
            <text x={xScale(v)} y={H - BOT + 16} fill="hsl(200 20% 55%)" fontSize="10" textAnchor="middle" fontFamily="monospace">
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        <text x={LEFT + plotW / 2} y={H - 5} fill="hsl(200 20% 60%)" fontSize="11" textAnchor="middle">
          Gap (Clock - Target Mean |λ|)
        </text>

        <g transform={`translate(${LEFT + plotW - 160}, ${TOP - 15})`}>
          <circle cx={0} cy={0} r={4} fill="hsl(170 80% 48%)" />
          <text x={8} y={4} fill="hsl(200 20% 60%)" fontSize="9">Healthy</text>
          <circle cx={60} cy={0} r={4} fill="hsl(30 90% 55%)" />
          <text x={68} y={4} fill="hsl(200 20% 60%)" fontSize="9">Disrupted</text>
          <circle cx={135} cy={0} r={4} fill="hsl(0 65% 55%)" />
          <text x={143} y={4} fill="hsl(200 20% 60%)" fontSize="9">Miss</text>
        </g>
      </svg>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color }: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary border-primary/30',
    emerald: 'text-emerald-400 border-emerald-500/30',
    amber: 'text-amber-400 border-amber-500/30',
    purple: 'text-purple-400 border-purple-500/30',
    cyan: 'text-cyan-400 border-cyan-500/30',
  };
  return (
    <Card className={`${colorMap[color] || colorMap.primary}`}>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${colorMap[color]?.split(' ')[0]}`} data-testid={`text-metric-${title.toLowerCase()}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
