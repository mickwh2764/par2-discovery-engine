import { solveAR2Eigenvalues, type EigenvalueResult } from './par2-engine';

export interface BomanParams {
  nicheSize: number;
  maturationDelay: number;
  divisionLimit: number;
  asymmetricProb: number;
  apoptosisRate: number;
  sheddingRate: number;
  wntStrength: number;
  circadianGating: boolean;
  circadianAmplitude: number;
  mutationRate: number;
  condition: string;
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  k5: number;
}

export interface SimulationRow {
  simulation_id: number;
  time: number;
  C_cells: number;
  P_cells: number;
  D_cells: number;
  Lgr5_like: number;
  Wnt_like: number;
  Bmal1_like: number;
  mutation_load: number;
  condition: string;
}

export interface SweepResult {
  run_id: number;
  niche_size: number;
  maturation_delay: number;
  division_limit: number;
  asymmetric_prob: number;
  apoptosis_rate: number;
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  k5: number;
  phi1_C: number;
  phi2_C: number;
  lambda_modulus_C: number;
  phi1_P: number;
  phi2_P: number;
  lambda_modulus_P: number;
  phi1_D: number;
  phi2_D: number;
  lambda_modulus_D: number;
  root_type_C: string;
  root_type_P: string;
  root_type_D: string;
  pattern_class: string;
  fib_distance: number;
  condition: string;
}

export interface FibRegionRow {
  phi1: number;
  phi2: number;
  region_label: string;
  distance_to_phi_family: number;
  lambda_modulus: number;
  root_type: string;
  eigenperiod: number;
  is_stable: boolean;
}

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const INV_GOLDEN = 1 / GOLDEN_RATIO;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function gaussianNoise(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
}

function fitAR2(series: number[]): { phi1: number; phi2: number; r2: number } {
  if (series.length < 5) return { phi1: 0, phi2: 0, r2: 0 };

  const n = series.length - 2;
  let sumY = 0, sumX1 = 0, sumX2 = 0;
  let sumX1X1 = 0, sumX2X2 = 0, sumX1X2 = 0;
  let sumYX1 = 0, sumYX2 = 0, sumYY = 0;

  for (let i = 2; i < series.length; i++) {
    const y = series[i];
    const x1 = series[i - 1];
    const x2 = series[i - 2];
    sumY += y;
    sumX1 += x1;
    sumX2 += x2;
    sumX1X1 += x1 * x1;
    sumX2X2 += x2 * x2;
    sumX1X2 += x1 * x2;
    sumYX1 += y * x1;
    sumYX2 += y * x2;
    sumYY += y * y;
  }

  const meanY = sumY / n;
  const sYX1 = sumYX1 - n * meanY * (sumX1 / n);
  const sYX2 = sumYX2 - n * meanY * (sumX2 / n);
  const sX1X1 = sumX1X1 - n * (sumX1 / n) * (sumX1 / n);
  const sX2X2 = sumX2X2 - n * (sumX2 / n) * (sumX2 / n);
  const sX1X2 = sumX1X2 - n * (sumX1 / n) * (sumX2 / n);
  const sYY = sumYY - n * meanY * meanY;

  const det = sX1X1 * sX2X2 - sX1X2 * sX1X2;
  if (Math.abs(det) < 1e-12) return { phi1: 0, phi2: 0, r2: 0 };

  const phi1 = (sX2X2 * sYX1 - sX1X2 * sYX2) / det;
  const phi2 = (sX1X1 * sYX2 - sX1X2 * sYX1) / det;

  const ssRes = sYY - phi1 * sYX1 - phi2 * sYX2;
  const r2 = sYY > 0 ? 1 - ssRes / sYY : 0;

  return { phi1, phi2, r2: Math.max(0, Math.min(1, r2)) };
}

function classifyPattern(phi1: number, phi2: number, lambdaMod: number, condition: string): string {
  const fibPhi1 = 1.0;
  const fibPhi2 = 1.0;
  const normalizedDist = Math.sqrt(
    Math.pow((phi1 / (Math.abs(phi1) + Math.abs(phi2) + 0.01)) - (fibPhi1 / (fibPhi1 + fibPhi2)), 2) +
    Math.pow((phi2 / (Math.abs(phi1) + Math.abs(phi2) + 0.01)) - (fibPhi2 / (fibPhi1 + fibPhi2)), 2)
  );

  const ratio = Math.abs(phi2) > 0.01 ? Math.abs(phi1 / phi2) : 99;
  const phiDist = Math.abs(ratio - GOLDEN_RATIO);
  const lucasDist = Math.abs(ratio - 1.0);

  if (condition.includes('adenoma') || lambdaMod > 1.0) return 'adenoma-like';
  if (condition.includes('FAP')) return 'FAP-like';

  if (phiDist < 0.15 && lambdaMod < 1.0 && lambdaMod > 0.3) return 'Fibonacci-consistent';
  if (phiDist < 0.30 && lambdaMod < 1.0 && lambdaMod > 0.3) return 'Fibonacci-adjacent';
  if (lucasDist < 0.15 && lambdaMod < 1.0) return 'Lucas-like';
  if (normalizedDist < 0.15) return 'p-sequence-like';

  return 'normal';
}

function computeFibDistance(phi1: number, phi2: number): number {
  if (Math.abs(phi2) < 0.01) return 99;
  const ratio = Math.abs(phi1 / phi2);
  return Math.abs(ratio - GOLDEN_RATIO);
}

export function runBomanSimulation(params: BomanParams, timeSteps: number = 200, replicates: number = 1): SimulationRow[] {
  const rows: SimulationRow[] = [];

  for (let rep = 0; rep < replicates; rep++) {
    let C = params.nicheSize + gaussianNoise(0, 1);
    let P = params.nicheSize * 1.5 + gaussianNoise(0, 2);
    let D = params.nicheSize * 4 + gaussianNoise(0, 3);
    let mutationLoad = params.condition === 'normal' ? 0 :
                       params.condition === 'FAP-like' ? 0.3 :
                       params.condition === 'adenoma-like' ? 0.6 : 0;

    let Lgr5 = 1.0 + gaussianNoise(0, 0.05);
    let Wnt = 0.9 + gaussianNoise(0, 0.05);
    let Bmal1 = 0.5;

    const Cprev = [C, C];
    const Pprev = [P, P];

    for (let t = 0; t < timeSteps; t++) {
      const circadianMod = params.circadianGating
        ? 1.0 + params.circadianAmplitude * Math.cos(2 * Math.PI * t / 24)
        : 1.0;

      const wntSignal = params.wntStrength * (1.0 - mutationLoad * 0.3);
      const nicheFeedback = 1.0 - (C / (params.nicheSize * 2));

      const divisionRate = params.k1 * circadianMod * clamp(nicheFeedback, 0.1, 1.5);
      const asymRate = params.asymmetricProb * (1.0 - mutationLoad * 0.2);

      const newStem = divisionRate * (1 - asymRate) * C;
      const newTA = divisionRate * asymRate * C;

      const maturationFactor = Math.exp(-params.maturationDelay / 10);
      const taDivision = params.k2 * P * maturationFactor * circadianMod;

      const prevC = Cprev.length >= 2 ? Cprev[Cprev.length - 2] : C;
      const prevP = Pprev.length >= 2 ? Pprev[Pprev.length - 2] : P;
      const fibContrib = params.k3 * prevC * maturationFactor;

      const delayStrength = params.k3 * (1.0 + params.maturationDelay * 0.2);
      const delayedNegC = delayStrength * prevC;
      const delayedNegP = delayStrength * 0.8 * prevP;
      const nicheDamp = 0.3 * (C / params.nicheSize) * C;
      const pDamp = 0.2 * (P / (params.nicheSize * 1.5)) * P;

      const newC = C * (1.0 - params.apoptosisRate) + newStem - delayedNegC - nicheDamp + gaussianNoise(0, 0.3 * Math.sqrt(C + 1));
      const newP = P * (1.0 - params.k4) + newTA + fibContrib - taDivision - delayedNegP - pDamp + gaussianNoise(0, 0.4 * Math.sqrt(P + 1));
      const newD = D * (1.0 - params.sheddingRate) + taDivision - params.k5 * D + gaussianNoise(0, 0.5 * Math.sqrt(D + 1));

      C = clamp(newC, 1, params.nicheSize * 5);
      P = clamp(newP, 0, params.nicheSize * 10);
      D = clamp(newD, 0, params.nicheSize * 20);

      Cprev.push(C);
      if (Cprev.length > 5) Cprev.shift();
      Pprev.push(P);
      if (Pprev.length > 5) Pprev.shift();

      Lgr5 = clamp(0.3 * (C / params.nicheSize) + 0.7 * Lgr5 + gaussianNoise(0, 0.02), 0, 3);
      Wnt = clamp(wntSignal * 0.3 + 0.7 * Wnt + gaussianNoise(0, 0.02), 0, 2);
      Bmal1 = clamp(0.5 + 0.4 * Math.cos(2 * Math.PI * t / 24) + gaussianNoise(0, 0.03), 0, 1);

      if (params.mutationRate > 0 && Math.random() < params.mutationRate) {
        mutationLoad = clamp(mutationLoad + 0.01, 0, 1);
      }

      rows.push({
        simulation_id: rep + 1,
        time: t,
        C_cells: Math.round(C * 100) / 100,
        P_cells: Math.round(P * 100) / 100,
        D_cells: Math.round(D * 100) / 100,
        Lgr5_like: Math.round(Lgr5 * 1000) / 1000,
        Wnt_like: Math.round(Wnt * 1000) / 1000,
        Bmal1_like: Math.round(Bmal1 * 1000) / 1000,
        mutation_load: Math.round(mutationLoad * 1000) / 1000,
        condition: params.condition,
      });
    }
  }
  return rows;
}

function extractTimeSeries(rows: SimulationRow[], simId: number, field: keyof SimulationRow): number[] {
  return rows
    .filter(r => r.simulation_id === simId)
    .sort((a, b) => a.time - b.time)
    .map(r => Number(r[field]));
}

export function runParameterSweep(): { timeseries: SimulationRow[]; sweep: SweepResult[] } {
  const allTimeseries: SimulationRow[] = [];
  const sweepResults: SweepResult[] = [];
  let runId = 0;

  const conditions: Array<{ name: string; overrides: Partial<BomanParams> }> = [
    { name: 'normal', overrides: { mutationRate: 0 } },
    { name: 'normal_no_circadian', overrides: { circadianGating: false, mutationRate: 0 } },
    { name: 'FAP-like', overrides: { asymmetricProb: 0.3, mutationRate: 0.005 } },
    { name: 'adenoma-like', overrides: { asymmetricProb: 0.15, k1: 0.18, mutationRate: 0.01, apoptosisRate: 0.02 } },
    { name: 'high_wnt', overrides: { wntStrength: 1.4, mutationRate: 0 } },
    { name: 'low_wnt', overrides: { wntStrength: 0.4, mutationRate: 0 } },
    { name: 'strong_delay_feedback', overrides: { k1: 0.10, k3: 0.50, k4: 0.12, apoptosisRate: 0.08, mutationRate: 0 } },
    { name: 'balanced_oscillator', overrides: { k1: 0.08, k3: 0.40, k4: 0.15, apoptosisRate: 0.10, circadianAmplitude: 0.35, mutationRate: 0 } },
  ];

  const nicheSizes = [8, 16, 24];
  const maturationDelays = [2, 5, 8];
  const divisionLimits = [3, 5, 8];
  const k3Values = [0.05, 0.15, 0.30, 0.45, 0.60];

  for (const cond of conditions) {
    for (const niche of nicheSizes) {
      for (const matDelay of maturationDelays) {
        for (const divLimit of divisionLimits) {
          for (const k3 of k3Values) {
            runId++;

            const params: BomanParams = {
              nicheSize: niche,
              maturationDelay: matDelay,
              divisionLimit: divLimit,
              asymmetricProb: 0.6,
              apoptosisRate: 0.05,
              sheddingRate: 0.12,
              wntStrength: 0.9,
              circadianGating: true,
              circadianAmplitude: 0.25,
              mutationRate: 0,
              condition: cond.name,
              k1: 0.12,
              k2: 0.15,
              k3: k3,
              k4: 0.08,
              k5: 0.04,
              ...cond.overrides,
            };

            const timeSteps = 200;
            const reps = 3;
            const simRows = runBomanSimulation(params, timeSteps, reps);

            if (runId <= 20) {
              allTimeseries.push(...simRows);
            }

            const phi1s: Record<string, number[]> = { C: [], P: [], D: [] };
            const phi2s: Record<string, number[]> = { C: [], P: [], D: [] };

            for (let rep = 1; rep <= reps; rep++) {
              const cSeries = extractTimeSeries(simRows, rep, 'C_cells');
              const pSeries = extractTimeSeries(simRows, rep, 'P_cells');
              const dSeries = extractTimeSeries(simRows, rep, 'D_cells');

              const fitC = fitAR2(cSeries);
              const fitP = fitAR2(pSeries);
              const fitD = fitAR2(dSeries);

              phi1s.C.push(fitC.phi1); phi2s.C.push(fitC.phi2);
              phi1s.P.push(fitP.phi1); phi2s.P.push(fitP.phi2);
              phi1s.D.push(fitD.phi1); phi2s.D.push(fitD.phi2);
            }

            const avgPhi1C = phi1s.C.reduce((a, b) => a + b, 0) / reps;
            const avgPhi2C = phi2s.C.reduce((a, b) => a + b, 0) / reps;
            const avgPhi1P = phi1s.P.reduce((a, b) => a + b, 0) / reps;
            const avgPhi2P = phi2s.P.reduce((a, b) => a + b, 0) / reps;
            const avgPhi1D = phi1s.D.reduce((a, b) => a + b, 0) / reps;
            const avgPhi2D = phi2s.D.reduce((a, b) => a + b, 0) / reps;

            const eigC = solveAR2Eigenvalues(avgPhi1C, avgPhi2C);
            const eigP = solveAR2Eigenvalues(avgPhi1P, avgPhi2P);
            const eigD = solveAR2Eigenvalues(avgPhi1D, avgPhi2D);

            const patternClass = classifyPattern(avgPhi1C, avgPhi2C, eigC.modulus1, cond.name);

            sweepResults.push({
              run_id: runId,
              niche_size: niche,
              maturation_delay: matDelay,
              division_limit: divLimit,
              asymmetric_prob: params.asymmetricProb,
              apoptosis_rate: params.apoptosisRate,
              k1: params.k1,
              k2: params.k2,
              k3: params.k3,
              k4: params.k4,
              k5: params.k5,
              phi1_C: Math.round(avgPhi1C * 10000) / 10000,
              phi2_C: Math.round(avgPhi2C * 10000) / 10000,
              lambda_modulus_C: Math.round(eigC.modulus1 * 10000) / 10000,
              phi1_P: Math.round(avgPhi1P * 10000) / 10000,
              phi2_P: Math.round(avgPhi2P * 10000) / 10000,
              lambda_modulus_P: Math.round(eigP.modulus1 * 10000) / 10000,
              phi1_D: Math.round(avgPhi1D * 10000) / 10000,
              phi2_D: Math.round(avgPhi2D * 10000) / 10000,
              lambda_modulus_D: Math.round(eigD.modulus1 * 10000) / 10000,
              root_type_C: eigC.isComplex ? 'complex' : 'real',
              root_type_P: eigP.isComplex ? 'complex' : 'real',
              root_type_D: eigD.isComplex ? 'complex' : 'real',
              pattern_class: patternClass,
              fib_distance: Math.round(computeFibDistance(avgPhi1C, avgPhi2C) * 10000) / 10000,
              condition: cond.name,
            });
          }
        }
      }
    }
  }

  return { timeseries: allTimeseries, sweep: sweepResults };
}

export function generateFibonacciRegion(): FibRegionRow[] {
  const rows: FibRegionRow[] = [];

  for (let phi1 = -0.5; phi1 <= 1.5; phi1 += 0.02) {
    for (let phi2 = -1.0; phi2 <= 0.5; phi2 += 0.02) {
      const eig = solveAR2Eigenvalues(phi1, phi2);
      const lambdaMod = eig.modulus1;
      const isStable = lambdaMod < 1.0;
      const ratio = Math.abs(phi2) > 0.01 ? Math.abs(phi1 / phi2) : 99;
      const fibDist = Math.abs(ratio - GOLDEN_RATIO);

      let eigenperiod = 0;
      if (eig.isComplex && eig.lambda1) {
        const angle = Math.atan2(eig.lambda1.imag, eig.lambda1.real);
        if (Math.abs(angle) > 0.01) {
          eigenperiod = Math.round((2 * Math.PI / Math.abs(angle)) * 100) / 100;
        }
      }

      let label = 'outside';
      if (!isStable) {
        label = 'unstable';
      } else if (fibDist < 0.05) {
        label = 'fib_core';
      } else if (fibDist < 0.15) {
        label = 'fib_consistent';
      } else if (fibDist < 0.30) {
        label = 'fib_adjacent';
      } else {
        label = 'non_fibonacci';
      }

      if (fibDist < 0.35 || (isStable && Math.random() < 0.05)) {
        rows.push({
          phi1: Math.round(phi1 * 100) / 100,
          phi2: Math.round(phi2 * 100) / 100,
          region_label: label,
          distance_to_phi_family: Math.round(fibDist * 10000) / 10000,
          lambda_modulus: Math.round(lambdaMod * 10000) / 10000,
          root_type: eig.isComplex ? 'complex' : 'real',
          eigenperiod,
          is_stable: isStable,
        });
      }
    }
  }

  return rows;
}

export function generateAllFiles(): {
  timeseriesCSV: string;
  sweepCSV: string;
  fibRegionCSV: string;
  coefficientSpaceCSV: string;
} {
  console.log('[boman-sim] Starting parameter sweep...');
  const { timeseries, sweep } = runParameterSweep();

  console.log('[boman-sim] Generating Fibonacci region...');
  const fibRegion = generateFibonacciRegion();

  const tsHeader = 'simulation_id,time,C_cells,P_cells,D_cells,Lgr5_like,Wnt_like,Bmal1_like,mutation_load,condition';
  const tsRows = timeseries.map(r =>
    `${r.simulation_id},${r.time},${r.C_cells},${r.P_cells},${r.D_cells},${r.Lgr5_like},${r.Wnt_like},${r.Bmal1_like},${r.mutation_load},${r.condition}`
  );
  const timeseriesCSV = [tsHeader, ...tsRows].join('\n');

  const swHeader = 'run_id,niche_size,maturation_delay,division_limit,asymmetric_prob,apoptosis_rate,k1,k2,k3,k4,k5,phi1_C,phi2_C,lambda_modulus_C,phi1_P,phi2_P,lambda_modulus_P,phi1_D,phi2_D,lambda_modulus_D,root_type_C,root_type_P,root_type_D,pattern_class,fib_distance,condition';
  const swRows = sweep.map(r =>
    `${r.run_id},${r.niche_size},${r.maturation_delay},${r.division_limit},${r.asymmetric_prob},${r.apoptosis_rate},${r.k1},${r.k2},${r.k3},${r.k4},${r.k5},${r.phi1_C},${r.phi2_C},${r.lambda_modulus_C},${r.phi1_P},${r.phi2_P},${r.lambda_modulus_P},${r.phi1_D},${r.phi2_D},${r.lambda_modulus_D},${r.root_type_C},${r.root_type_P},${r.root_type_D},${r.pattern_class},${r.fib_distance},${r.condition}`
  );
  const sweepCSV = [swHeader, ...swRows].join('\n');

  const frHeader = 'phi1,phi2,region_label,distance_to_phi_family,lambda_modulus,root_type,eigenperiod,is_stable';
  const frRows = fibRegion.map(r =>
    `${r.phi1},${r.phi2},${r.region_label},${r.distance_to_phi_family},${r.lambda_modulus},${r.root_type},${r.eigenperiod},${r.is_stable}`
  );
  const fibRegionCSV = [frHeader, ...frRows].join('\n');

  const csHeader = 'gene,dataset,phi1,phi2,root1_real,root1_imag,root2_real,root2_imag,lambda_modulus,root_type,category,fib_distance,pattern_class';
  const csRows: string[] = [];

  for (const result of sweep.slice(0, 100)) {
    const eigC = solveAR2Eigenvalues(result.phi1_C, result.phi2_C);
    const eigP = solveAR2Eigenvalues(result.phi1_P, result.phi2_P);
    const eigD = solveAR2Eigenvalues(result.phi1_D, result.phi2_D);

    csRows.push(`Stem_Cell_Pool,sim_run_${result.run_id}_${result.condition},${result.phi1_C},${result.phi2_C},${eigC.lambda1.real.toFixed(4)},${eigC.lambda1.imag.toFixed(4)},${eigC.lambda2.real.toFixed(4)},${eigC.lambda2.imag.toFixed(4)},${result.lambda_modulus_C},${result.root_type_C},Stem,${result.fib_distance},${result.pattern_class}`);
    csRows.push(`Proliferating_Pool,sim_run_${result.run_id}_${result.condition},${result.phi1_P},${result.phi2_P},${eigP.lambda1.real.toFixed(4)},${eigP.lambda1.imag.toFixed(4)},${eigP.lambda2.real.toFixed(4)},${eigP.lambda2.imag.toFixed(4)},${result.lambda_modulus_P},${result.root_type_P},Proliferating,${computeFibDistance(result.phi1_P, result.phi2_P).toFixed(4)},${classifyPattern(result.phi1_P, result.phi2_P, result.lambda_modulus_P, result.condition)}`);
    csRows.push(`Differentiated_Pool,sim_run_${result.run_id}_${result.condition},${result.phi1_D},${result.phi2_D},${eigD.lambda1.real.toFixed(4)},${eigD.lambda1.imag.toFixed(4)},${eigD.lambda2.real.toFixed(4)},${eigD.lambda2.imag.toFixed(4)},${result.lambda_modulus_D},${result.root_type_D},Differentiated,${computeFibDistance(result.phi1_D, result.phi2_D).toFixed(4)},${classifyPattern(result.phi1_D, result.phi2_D, result.lambda_modulus_D, result.condition)}`);
  }

  const coefficientSpaceCSV = [csHeader, ...csRows].join('\n');

  console.log(`[boman-sim] Generated: ${timeseries.length} timeseries rows, ${sweep.length} sweep results, ${fibRegion.length} Fibonacci region points, ${csRows.length} coefficient-space entries`);

  return { timeseriesCSV, sweepCSV, fibRegionCSV, coefficientSpaceCSV };
}
