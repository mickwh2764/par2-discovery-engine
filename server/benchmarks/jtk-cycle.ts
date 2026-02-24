/**
 * JTK_CYCLE-Inspired Implementation (Simplified)
 * 
 * Simplified TypeScript implementation inspired by JTK_CYCLE (Hughes et al., 2010)
 * "JTK_CYCLE: An Efficient Nonparametric Algorithm for Detecting Rhythmic Components"
 * Journal of Biological Rhythms, 25(5):372-380
 * 
 * NOTE: This is a SIMPLIFIED implementation that uses Kendall tau correlation
 * against cosine reference waveforms. The original JTK_CYCLE uses a more complex
 * Jonckheere-Terpstra statistic with proper permutation testing and tie handling.
 * 
 * For exact JTK_CYCLE results, use the original R implementation (MetaCycle package).
 * This implementation provides comparable detection for most circadian patterns.
 */

export interface JTKResult {
  gene: string;
  period: number;
  phase: number;
  amplitude: number;
  pValue: number;
  qValue: number;
  tau: number;
  isRhythmic: boolean;
}

export interface JTKConfig {
  periods: number[];
  timepoints: number[];
  replicates?: number;
  pValueThreshold?: number;
}

function generateReferenceWaveforms(
  timepoints: number[],
  period: number
): { cos: number[]; sin: number[] } {
  const omega = (2 * Math.PI) / period;
  const cos = timepoints.map(t => Math.cos(omega * t));
  const sin = timepoints.map(t => Math.sin(omega * t));
  return { cos, sin };
}

function rankData(data: number[]): number[] {
  const indexed = data.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => a.val - b.val);
  
  const ranks = new Array(data.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length && indexed[j].val === indexed[i].val) {
      j++;
    }
    const avgRank = (i + j + 1) / 2;
    for (let k = i; k < j; k++) {
      ranks[indexed[k].idx] = avgRank;
    }
    i = j;
  }
  return ranks;
}

function kendallTau(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  
  let concordant = 0;
  let discordant = 0;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const xDiff = x[j] - x[i];
      const yDiff = y[j] - y[i];
      const product = xDiff * yDiff;
      
      if (product > 0) concordant++;
      else if (product < 0) discordant++;
    }
  }
  
  const pairs = (n * (n - 1)) / 2;
  return (concordant - discordant) / pairs;
}

function jonckheereTerpstraStatistic(data: number[], reference: number[]): number {
  const rankedData = rankData(data);
  const rankedRef = rankData(reference);
  return kendallTau(rankedData, rankedRef);
}

function computeJTKPValue(tau: number, n: number): number {
  if (n < 10) {
    return Math.exp(-2 * tau * tau * n);
  }
  
  const variance = (4 * n + 10) / (9 * n * (n - 1));
  const z = tau / Math.sqrt(variance);
  
  return 2 * (1 - normalCDF(Math.abs(z)));
}

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return 0.5 * (1.0 + sign * y);
}

function estimateAmplitude(data: number[], timepoints: number[], period: number, phase: number): number {
  const omega = (2 * Math.PI) / period;
  const n = data.length;
  
  const mean = data.reduce((a, b) => a + b, 0) / n;
  
  let sumCos = 0;
  let sumSin = 0;
  
  for (let i = 0; i < n; i++) {
    const t = timepoints[i];
    sumCos += (data[i] - mean) * Math.cos(omega * t - phase);
    sumSin += (data[i] - mean) * Math.sin(omega * t - phase);
  }
  
  return Math.sqrt(sumCos * sumCos + sumSin * sumSin) / n * 2;
}

function benjaminiHochberg(pValues: number[]): number[] {
  const n = pValues.length;
  const indexed = pValues.map((p, i) => ({ p, i }));
  indexed.sort((a, b) => a.p - b.p);
  
  const qValues = new Array(n);
  let minQ = 1;
  
  for (let i = n - 1; i >= 0; i--) {
    const q = Math.min(minQ, indexed[i].p * n / (i + 1));
    minQ = q;
    qValues[indexed[i].i] = q;
  }
  
  return qValues;
}

export function runJTKCycle(
  geneData: Map<string, number[]>,
  config: JTKConfig
): JTKResult[] {
  const { periods, timepoints, pValueThreshold = 0.05 } = config;
  const results: JTKResult[] = [];
  
  for (const [gene, expression] of Array.from(geneData.entries())) {
    if (expression.length !== timepoints.length) {
      continue;
    }
    
    let bestTau = 0;
    let bestPValue = 1;
    let bestPeriod = periods[0];
    let bestPhase = 0;
    
    for (const period of periods) {
      const phases = [];
      for (let p = 0; p < period; p += period / 8) {
        phases.push(p);
      }
      
      for (const phase of phases) {
        const omega = (2 * Math.PI) / period;
        const reference = timepoints.map(t => Math.cos(omega * t - (phase * 2 * Math.PI / period)));
        
        const tau = jonckheereTerpstraStatistic(expression, reference);
        const pValue = computeJTKPValue(tau, expression.length);
        
        if (pValue < bestPValue) {
          bestPValue = pValue;
          bestTau = tau;
          bestPeriod = period;
          bestPhase = phase;
        }
      }
    }
    
    const amplitude = estimateAmplitude(expression, timepoints, bestPeriod, bestPhase * 2 * Math.PI / bestPeriod);
    
    results.push({
      gene,
      period: bestPeriod,
      phase: bestPhase,
      amplitude,
      pValue: bestPValue,
      qValue: 0,
      tau: bestTau,
      isRhythmic: false
    });
  }
  
  const pValues = results.map(r => r.pValue);
  const qValues = benjaminiHochberg(pValues);
  
  for (let i = 0; i < results.length; i++) {
    results[i].qValue = qValues[i];
    results[i].isRhythmic = qValues[i] < pValueThreshold;
  }
  
  return results.sort((a, b) => a.pValue - b.pValue);
}

export function runJTKCycleSingle(
  expression: number[],
  timepoints: number[],
  periods: number[] = [24]
): Omit<JTKResult, 'gene'> {
  let bestTau = 0;
  let bestPValue = 1;
  let bestPeriod = periods[0];
  let bestPhase = 0;
  
  for (const period of periods) {
    for (let phase = 0; phase < period; phase += period / 8) {
      const omega = (2 * Math.PI) / period;
      const reference = timepoints.map(t => Math.cos(omega * t - (phase * 2 * Math.PI / period)));
      
      const tau = jonckheereTerpstraStatistic(expression, reference);
      const pValue = computeJTKPValue(tau, expression.length);
      
      if (pValue < bestPValue) {
        bestPValue = pValue;
        bestTau = tau;
        bestPeriod = period;
        bestPhase = phase;
      }
    }
  }
  
  const amplitude = estimateAmplitude(expression, timepoints, bestPeriod, bestPhase * 2 * Math.PI / bestPeriod);
  
  return {
    period: bestPeriod,
    phase: bestPhase,
    amplitude,
    pValue: bestPValue,
    qValue: bestPValue,
    tau: bestTau,
    isRhythmic: bestPValue < 0.05
  };
}
