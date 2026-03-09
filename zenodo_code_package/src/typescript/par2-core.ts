/**
 * PAR(2) Discovery Engine - Core Algorithm Implementation
 * 
 * Phase-Amplitude-Relationship (2) Analysis for Circadian Gene Networks
 * 
 * Copyright (c) 2025 Michael Whiteside
 * Licensed under Apache License 2.0
 * 
 * PATENT NOTICE: The PAR(2) methodology is subject to a pending UK patent.
 * Commercial use requires a separate license. Contact: mickwh@msn.com
 */

export interface GeneData {
  time: number[];
  expression: number[];
}

export interface PAR2Config {
  period?: number;
  significanceThreshold?: number;
}

export interface PAR2Result {
  significant: boolean;
  pValue: number;
  qValue?: number;
  significantTerms: string[];
  coefficients: Record<string, number>;
  nTimepoints: number;
}

export interface BatchResult {
  results: PAR2Result[];
  fdrCorrection: {
    method: string;
    significantCount: number;
    significantCountAfterFDR: number;
  };
}

/**
 * Benjamini-Hochberg FDR correction
 */
export function benjaminiHochberg(pValues: number[], alpha: number = 0.05): { qValues: number[]; significant: boolean[] } {
  const n = pValues.length;
  if (n === 0) return { qValues: [], significant: [] };
  
  const indexed = pValues.map((p, i) => ({ p, i }));
  indexed.sort((a, b) => a.p - b.p);
  
  const qValues = new Array(n).fill(1);
  const significant = new Array(n).fill(false);
  
  let minQSoFar = 1;
  for (let rank = n; rank >= 1; rank--) {
    const idx = indexed[rank - 1].i;
    const originalP = indexed[rank - 1].p;
    const q = Math.min(minQSoFar, (originalP * n) / rank);
    qValues[idx] = Math.min(q, 1);
    minQSoFar = qValues[idx];
  }
  
  for (let i = 0; i < n; i++) {
    significant[i] = qValues[i] < alpha;
  }
  
  return { qValues, significant };
}

/**
 * Fit cosine phase to clock gene expression
 */
function fitCosinePhase(time: number[], expression: number[], period: number): number[] {
  const n = time.length;
  const meanExpr = expression.reduce((a, b) => a + b, 0) / n;
  const omega = 2 * Math.PI / period;
  
  if (n < 4) {
    return time.map(t => (omega * t) % (2 * Math.PI));
  }
  
  const centeredExpr = expression.map(e => e - meanExpr);
  
  let sumCosSq = 0, sumSinSq = 0, sumCosSin = 0;
  let sumExprCos = 0, sumExprSin = 0;
  
  for (let i = 0; i < n; i++) {
    const theta = omega * time[i];
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    
    sumCosSq += c * c;
    sumSinSq += s * s;
    sumCosSin += c * s;
    sumExprCos += centeredExpr[i] * c;
    sumExprSin += centeredExpr[i] * s;
  }
  
  const det = sumCosSq * sumSinSq - sumCosSin * sumCosSin;
  let phaseOffset = 0;
  
  if (Math.abs(det) > 1e-10) {
    const a = (sumSinSq * sumExprCos - sumCosSin * sumExprSin) / det;
    const b = (sumCosSq * sumExprSin - sumCosSin * sumExprCos) / det;
    phaseOffset = Math.atan2(b, a);
  }
  
  return time.map(t => {
    const rawPhase = omega * t - phaseOffset;
    return ((rawPhase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  });
}

/**
 * Student's t-distribution CDF approximation
 */
function studentTCDF(t: number, df: number): number {
  if (df <= 0) return 0.5;
  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;
  
  let result = 0.5 * incompleteBeta(x, a, b);
  return t >= 0 ? 1 - result : result;
}

function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x)
  );
  
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaCF(x, a, b) / a;
  }
  return 1 - bt * betaCF(1 - x, b, a) / b;
}

function betaCF(x: number, a: number, b: number): number {
  const maxIter = 100;
  const eps = 1e-10;
  
  let c = 1, d = 1 - (a + b) * x / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  
  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    
    aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

function logGamma(x: number): number {
  const c = [76.18009173, -86.50532033, 24.01409822, -1.231739516, 0.00120858003, -5.36382e-6];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += c[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Multiple linear regression with p-values
 */
function multipleLinearRegression(X: number[][], y: number[]): {
  coefficients: number[];
  pValues: number[];
  residuals: number[];
} {
  const n = X.length;
  const p = X[0].length;
  
  // X'X
  const XtX: number[][] = Array(p).fill(0).map(() => Array(p).fill(0));
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < n; k++) {
        XtX[i][j] += X[k][i] * X[k][j];
      }
    }
  }
  
  // X'y
  const Xty: number[] = Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    for (let k = 0; k < n; k++) {
      Xty[i] += X[k][i] * y[k];
    }
  }
  
  // Solve via Cholesky or regularized inversion
  const XtXinv = invertMatrix(XtX);
  const coefficients: number[] = Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      coefficients[i] += XtXinv[i][j] * Xty[j];
    }
  }
  
  // Residuals and SSE
  const residuals: number[] = [];
  let sse = 0;
  for (let i = 0; i < n; i++) {
    let pred = 0;
    for (let j = 0; j < p; j++) {
      pred += X[i][j] * coefficients[j];
    }
    const resid = y[i] - pred;
    residuals.push(resid);
    sse += resid * resid;
  }
  
  const df = n - p;
  const mse = df > 0 ? sse / df : 0;
  
  // Standard errors and p-values
  const pValues: number[] = [];
  for (let i = 0; i < p; i++) {
    const se = Math.sqrt(Math.max(0, mse * XtXinv[i][i]));
    const tStat = se > 0 ? Math.abs(coefficients[i] / se) : 0;
    const pValue = 2 * (1 - studentTCDF(tStat, df));
    pValues.push(Math.min(1, Math.max(0, pValue)));
  }
  
  return { coefficients, pValues, residuals };
}

function invertMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const augmented: number[][] = matrix.map((row, i) => 
    [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]
  );
  
  // Add small regularization for numerical stability
  for (let i = 0; i < n; i++) {
    augmented[i][i] += 1e-10;
  }
  
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    const pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-12) continue;
    
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }
  
  return augmented.map(row => row.slice(n));
}

/**
 * Run PAR(2) analysis on a single gene pair
 * 
 * Tests whether clock gene phase modulates target gene AR dynamics
 */
export function runPAR2Analysis(
  targetData: GeneData,
  clockData: GeneData,
  config: PAR2Config = {}
): PAR2Result {
  const period = config.period || 24;
  const significanceThreshold = config.significanceThreshold || 0.05;
  
  if (targetData.time.length !== clockData.time.length) {
    throw new Error("Target and clock data must have the same length");
  }
  
  const nTimepoints = targetData.time.length;
  
  if (nTimepoints < 10) {
    return {
      significant: false,
      pValue: 1.0,
      significantTerms: [],
      coefficients: {},
      nTimepoints
    };
  }
  
  // Fit clock gene phase
  const phi = fitCosinePhase(clockData.time, clockData.expression, period);
  
  // Build AR(2) design with phase interactions
  const R = targetData.expression;
  const R_n = R.slice(2);
  const R_n_1 = R.slice(1, -1);
  const R_n_2 = R.slice(0, -2);
  const Phi_n_1 = phi.slice(1, -1);
  const Phi_n_2 = phi.slice(0, -2);
  
  const n = R_n.length;
  const X: number[][] = [];
  
  for (let i = 0; i < n; i++) {
    X.push([
      1,                                    // intercept
      R_n_1[i],                             // AR(1) term
      R_n_1[i] * Math.cos(Phi_n_1[i]),      // phase interaction lag-1 cos
      R_n_1[i] * Math.sin(Phi_n_1[i]),      // phase interaction lag-1 sin
      R_n_2[i],                             // AR(2) term
      R_n_2[i] * Math.cos(Phi_n_2[i]),      // phase interaction lag-2 cos
      R_n_2[i] * Math.sin(Phi_n_2[i])       // phase interaction lag-2 sin
    ]);
  }
  
  const regression = multipleLinearRegression(X, R_n);
  
  const coeffNames = ['const', 'R_n_1', 'R_n_1_cos', 'R_n_1_sin', 'R_n_2', 'R_n_2_cos', 'R_n_2_sin'];
  const periodicTermIndices = [2, 3, 5, 6];
  const periodicTermNames = ['R_n_1_cos', 'R_n_1_sin', 'R_n_2_cos', 'R_n_2_sin'];
  
  const significantTerms: string[] = [];
  let minPValue = 1.0;
  
  periodicTermIndices.forEach((idx, i) => {
    const pValue = regression.pValues[idx];
    if (pValue < minPValue) minPValue = pValue;
    if (pValue < significanceThreshold) {
      significantTerms.push(periodicTermNames[i]);
    }
  });
  
  // Apply within-pair Bonferroni correction (4 interaction terms)
  const correctedPValue = Math.min(minPValue * 4, 1.0);
  
  const coefficients: Record<string, number> = {};
  coeffNames.forEach((name, i) => {
    coefficients[name] = regression.coefficients[i];
  });
  
  return {
    significant: correctedPValue < significanceThreshold,
    pValue: correctedPValue,
    significantTerms,
    coefficients,
    nTimepoints
  };
}

/**
 * Run batch PAR(2) analysis with FDR correction
 */
export function runBatchAnalysis(
  analyses: { targetData: GeneData; clockData: GeneData; id: string }[],
  config: PAR2Config = {}
): BatchResult {
  const significanceThreshold = config.significanceThreshold || 0.05;
  
  const results: PAR2Result[] = [];
  const pValues: number[] = [];
  
  for (const analysis of analyses) {
    const result = runPAR2Analysis(analysis.targetData, analysis.clockData, config);
    results.push(result);
    pValues.push(result.pValue);
  }
  
  const { qValues, significant } = benjaminiHochberg(pValues, significanceThreshold);
  
  for (let i = 0; i < results.length; i++) {
    results[i].qValue = qValues[i];
    results[i].significant = significant[i];
  }
  
  return {
    results,
    fdrCorrection: {
      method: 'Benjamini-Hochberg',
      significantCount: results.filter(r => r.pValue < significanceThreshold).length,
      significantCountAfterFDR: results.filter(r => r.significant).length
    }
  };
}

/**
 * Calculate eigenperiod from AR coefficients
 * Returns the natural period of the AR(2) system in hours
 */
export function calculateEigenperiod(
  ar1Coeff: number,
  ar2Coeff: number,
  samplingInterval: number = 4
): { eigenperiod: number; stable: boolean; dampingRatio: number } {
  // Characteristic equation: λ² - α₁λ - α₂ = 0
  const discriminant = ar1Coeff * ar1Coeff + 4 * ar2Coeff;
  
  if (discriminant >= 0) {
    // Real roots - no oscillation
    const r1 = (ar1Coeff + Math.sqrt(discriminant)) / 2;
    const r2 = (ar1Coeff - Math.sqrt(discriminant)) / 2;
    return {
      eigenperiod: Infinity,
      stable: Math.abs(r1) < 1 && Math.abs(r2) < 1,
      dampingRatio: 1
    };
  }
  
  // Complex conjugate roots - oscillatory
  const realPart = ar1Coeff / 2;
  const imagPart = Math.sqrt(-discriminant) / 2;
  const modulus = Math.sqrt(realPart * realPart + imagPart * imagPart);
  const angle = Math.atan2(imagPart, realPart);
  
  const eigenperiod = angle !== 0 ? (2 * Math.PI / Math.abs(angle)) * samplingInterval : Infinity;
  
  return {
    eigenperiod,
    stable: modulus < 1,
    dampingRatio: modulus
  };
}
