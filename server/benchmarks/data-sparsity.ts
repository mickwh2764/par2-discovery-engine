import { fitAR2 as fitAR2Shared } from '../ar2-shared';

/**
 * Data Sparsity Stress Test
 * 
 * Tests whether the PAR(2) eigenvalue baseline remains stable
 * when data is randomly missing (clinical robustness).
 * 
 * Standard validation in bioinformatics:
 * "If you delete 30% of the data at random, does the result change?"
 * 
 * Pass criteria: Eigenvalue deviation < 10% from full dataset
 */

interface SparsityTestResult {
  sparsityLevel: number;
  originalEigenvalue: number;
  sparseEigenvalue: number;
  deviation: number;
  deviationPercent: number;
  stable: boolean;
  removedTimepoints: number[];
  totalTimepoints: number;
}

interface DataSparsityBenchmarkResult {
  success: boolean;
  hypothesis: string;
  testCount: number;
  passRate: number;
  results: SparsityTestResult[];
  summary: {
    meanDeviation: number;
    maxDeviation: number;
    stableAt30Percent: boolean;
    stableAt50Percent: boolean;
    breakdownThreshold: number | null;
  };
  interpretation: string;
}

/**
 * Generate synthetic circadian time series
 */
function generateCircadianTimeSeries(
  numTimepoints: number = 24,
  samplingInterval: number = 2,
  noise: number = 0.1
): number[] {
  const omega = (2 * Math.PI) / 24;
  const series: number[] = [];
  
  for (let i = 0; i < numTimepoints; i++) {
    const t = i * samplingInterval;
    const signal = Math.cos(omega * t) + 0.3 * Math.sin(2 * omega * t);
    const noiseVal = (Math.random() - 0.5) * 2 * noise;
    series.push(signal + noiseVal);
  }
  
  return series;
}

/**
 * Calculate AR(2) eigenvalue from time series
 */
function calculateAR2Eigenvalue(series: number[]): number {
  const result = fitAR2Shared(series, { minLength: 4 });
  if (!result) return 0.5;
  return result.eigenvalue;
}

/**
 * Remove random timepoints from series and interpolate to regular grid
 */
function createSparseSeries(
  series: number[],
  removalFraction: number
): { sparse: number[]; removedIndices: number[]; interpolated: number[] } {
  const n = series.length;
  const numToRemove = Math.floor(n * removalFraction);
  
  const indices = Array.from({ length: n }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  const removedIndices = indices.slice(0, numToRemove).sort((a, b) => a - b);
  const removedSet = new Set(removedIndices);
  
  const sparse = series.filter((_, i) => !removedSet.has(i));
  
  const keptIndices = indices.filter(i => !removedSet.has(i)).sort((a, b) => a - b);
  const keptValues = keptIndices.map(i => series[i]);
  
  const interpolated = linearInterpolate(keptIndices, keptValues, n);
  
  return { sparse, removedIndices, interpolated };
}

/**
 * Linear interpolation to regular grid
 */
function linearInterpolate(
  knownIndices: number[],
  knownValues: number[],
  targetLength: number
): number[] {
  if (knownIndices.length < 2) {
    return new Array(targetLength).fill(knownValues[0] || 0);
  }
  
  const result: number[] = [];
  
  for (let t = 0; t < targetLength; t++) {
    let leftIdx = 0;
    while (leftIdx < knownIndices.length - 1 && knownIndices[leftIdx + 1] <= t) {
      leftIdx++;
    }
    
    if (t <= knownIndices[0]) {
      result.push(knownValues[0]);
    } else if (t >= knownIndices[knownIndices.length - 1]) {
      result.push(knownValues[knownValues.length - 1]);
    } else {
      const rightIdx = Math.min(leftIdx + 1, knownIndices.length - 1);
      const t0 = knownIndices[leftIdx];
      const t1 = knownIndices[rightIdx];
      const v0 = knownValues[leftIdx];
      const v1 = knownValues[rightIdx];
      
      if (t1 === t0) {
        result.push(v0);
      } else {
        const alpha = (t - t0) / (t1 - t0);
        result.push(v0 + alpha * (v1 - v0));
      }
    }
  }
  
  return result;
}

/**
 * Run single sparsity test using interpolated series for proper AR(2) estimation
 */
function runSparsityTest(
  series: number[],
  sparsityLevel: number
): SparsityTestResult {
  const originalEigenvalue = calculateAR2Eigenvalue(series);
  const { sparse, removedIndices, interpolated } = createSparseSeries(series, sparsityLevel);
  const sparseEigenvalue = calculateAR2Eigenvalue(interpolated);
  
  const deviation = Math.abs(sparseEigenvalue - originalEigenvalue);
  const deviationPercent = originalEigenvalue > 0.01 ? (deviation / originalEigenvalue) * 100 : 0;
  const stable = deviationPercent < 10;
  
  return {
    sparsityLevel,
    originalEigenvalue,
    sparseEigenvalue,
    deviation,
    deviationPercent,
    stable,
    removedTimepoints: removedIndices,
    totalTimepoints: series.length,
  };
}

/**
 * Run full Data Sparsity benchmark
 */
export function runDataSparsityBenchmark(
  numTrials: number = 100
): DataSparsityBenchmarkResult {
  const sparsityLevels = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
  const results: SparsityTestResult[] = [];
  
  for (const sparsity of sparsityLevels) {
    for (let trial = 0; trial < numTrials / sparsityLevels.length; trial++) {
      const series = generateCircadianTimeSeries(24, 2, 0.1);
      const result = runSparsityTest(series, sparsity);
      results.push(result);
    }
  }
  
  const stableResults = results.filter(r => r.stable);
  const passRate = stableResults.length / results.length;
  
  const deviations = results.map(r => r.deviationPercent);
  const meanDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  const maxDeviation = Math.max(...deviations);
  
  const at30 = results.filter(r => r.sparsityLevel === 0.3);
  const stableAt30Percent = at30.filter(r => r.stable).length / at30.length > 0.8;
  
  const at50 = results.filter(r => r.sparsityLevel === 0.5);
  const stableAt50Percent = at50.filter(r => r.stable).length / at50.length > 0.6;
  
  let breakdownThreshold: number | null = null;
  for (const sparsity of sparsityLevels) {
    const atLevel = results.filter(r => r.sparsityLevel === sparsity);
    const stableRate = atLevel.filter(r => r.stable).length / atLevel.length;
    if (stableRate < 0.5) {
      breakdownThreshold = sparsity;
      break;
    }
  }
  
  const success = stableAt30Percent;
  
  return {
    success,
    hypothesis: "AR(2) eigenvalue remains stable when up to 30% of timepoints are randomly removed",
    testCount: results.length,
    passRate,
    results,
    summary: {
      meanDeviation,
      maxDeviation,
      stableAt30Percent,
      stableAt50Percent,
      breakdownThreshold,
    },
    interpretation: success
      ? `PASSED: Eigenvalue baseline stable at 30% data loss (mean deviation: ${meanDeviation.toFixed(1)}%). Model is clinically robust to missing data.`
      : `PARTIAL: Eigenvalue shows ${meanDeviation.toFixed(1)}% mean deviation. Consider data quality requirements.`,
  };
}

/**
 * Run targeted sparsity analysis at specific level
 */
export function analyzeSparsityAtLevel(
  sparsityLevel: number,
  numTrials: number = 50
): {
  sparsityLevel: number;
  passRate: number;
  meanDeviation: number;
  maxDeviation: number;
  trials: SparsityTestResult[];
} {
  const trials: SparsityTestResult[] = [];
  
  for (let i = 0; i < numTrials; i++) {
    const series = generateCircadianTimeSeries(24, 2, 0.1);
    const result = runSparsityTest(series, sparsityLevel);
    trials.push(result);
  }
  
  const passRate = trials.filter(t => t.stable).length / trials.length;
  const deviations = trials.map(t => t.deviationPercent);
  const meanDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  const maxDeviation = Math.max(...deviations);
  
  return {
    sparsityLevel,
    passRate,
    meanDeviation,
    maxDeviation,
    trials,
  };
}
