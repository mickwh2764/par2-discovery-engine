import * as fs from 'fs';
import * as path from 'path';

const ENSEMBL_TO_SYMBOL: Record<string, string> = {
  'ENSMUSG00000020893': 'Per1', 'ENSMUSG00000055866': 'Per2', 'ENSMUSG00000028957': 'Per3',
  'ENSMUSG00000020038': 'Cry1', 'ENSMUSG00000068742': 'Cry2',
  'ENSMUSG00000029238': 'Clock', 'ENSMUSG00000055116': 'Arntl',
  'ENSMUSG00000020889': 'Nr1d1', 'ENSMUSG00000021775': 'Nr1d2',
  'ENSMUSG00000028150': 'Rorc', 'ENSMUSG00000059824': 'Dbp',
  'ENSMUSG00000022389': 'Tef', 'ENSMUSG00000026077': 'Npas2',
  'ENSMUSG00000022346': 'Myc', 'ENSMUSG00000070348': 'Ccnd1',
  'ENSMUSG00000041431': 'Ccnb1', 'ENSMUSG00000019942': 'Cdk1',
  'ENSMUSG00000019461': 'Cdk1', 'ENSMUSG00000031016': 'Wee1',
  'ENSMUSG00000023067': 'Cdkn1a', 'ENSMUSG00000020140': 'Lgr5',
  'ENSMUSG00000000142': 'Axin2', 'ENSMUSG00000006932': 'Ctnnb1',
  'ENSMUSG00000005871': 'Apc', 'ENSMUSG00000059552': 'Trp53',
  'ENSMUSG00000020184': 'Mdm2', 'ENSMUSG00000034218': 'Atm',
  'ENSMUSG00000029521': 'Chek2', 'ENSMUSG00000057329': 'Bcl2',
  'ENSMUSG00000003873': 'Bax', 'ENSMUSG00000000440': 'Pparg',
  'ENSMUSG00000020063': 'Sirt1', 'ENSMUSG00000021109': 'Hif1a',
  'ENSMUSG00000002068': 'Ccne1', 'ENSMUSG00000028399': 'Ccne2',
  'ENSMUSG00000025544': 'Mcm6', 'ENSMUSG00000031004': 'Mki67',
};

const CLOCK_GENES = new Set([
  'per1', 'per2', 'per3', 'cry1', 'cry2', 'clock', 'arntl', 'bmal1',
  'nr1d1', 'nr1d2', 'dbp', 'tef', 'npas2'
]);

const TARGET_GENES = new Set([
  'myc', 'ccnd1', 'ccnb1', 'cdk1', 'wee1', 'cdkn1a', 'lgr5', 'axin2',
  'ctnnb1', 'apc'
]);

function classifyGene(name: string): 'clock' | 'target' | 'other' {
  const lower = name.toLowerCase();
  if (CLOCK_GENES.has(lower)) return 'clock';
  if (TARGET_GENES.has(lower)) return 'target';
  return 'other';
}

function fitAR2(timeSeries: number[]): { beta1: number; beta2: number; eigenvalue: number; r2: number } {
  const n = timeSeries.length;
  if (n < 5) {
    return { beta1: 0, beta2: 0, eigenvalue: 0, r2: 0 };
  }

  const mean = timeSeries.reduce((a, b) => a + b, 0) / n;
  const centered = timeSeries.map(v => v - mean);

  const Y: number[] = [];
  const X1: number[] = [];
  const X2: number[] = [];

  for (let t = 2; t < n; t++) {
    Y.push(centered[t]);
    X1.push(centered[t - 1]);
    X2.push(centered[t - 2]);
  }

  const m = Y.length;
  let sumX1X1 = 0, sumX1X2 = 0, sumX2X2 = 0;
  let sumX1Y = 0, sumX2Y = 0;

  for (let i = 0; i < m; i++) {
    sumX1X1 += X1[i] * X1[i];
    sumX1X2 += X1[i] * X2[i];
    sumX2X2 += X2[i] * X2[i];
    sumX1Y += X1[i] * Y[i];
    sumX2Y += X2[i] * Y[i];
  }

  const det = sumX1X1 * sumX2X2 - sumX1X2 * sumX1X2;
  if (Math.abs(det) < 1e-10) {
    return { beta1: 0, beta2: 0, eigenvalue: 0, r2: 0 };
  }

  const beta1 = (sumX2X2 * sumX1Y - sumX1X2 * sumX2Y) / det;
  const beta2 = (sumX1X1 * sumX2Y - sumX1X2 * sumX1Y) / det;

  let ssRes = 0;
  let ssTot = 0;
  const yMean = Y.reduce((a, b) => a + b, 0) / m;

  for (let i = 0; i < m; i++) {
    const predicted = beta1 * X1[i] + beta2 * X2[i];
    const resid = Y[i] - predicted;
    ssRes += resid * resid;
    ssTot += (Y[i] - yMean) * (Y[i] - yMean);
  }

  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

  const discriminant = beta1 * beta1 + 4 * beta2;
  let eigenvalue: number;

  if (discriminant < 0) {
    eigenvalue = Math.sqrt(-beta2);
  } else {
    const lambda1 = (beta1 + Math.sqrt(discriminant)) / 2;
    const lambda2 = (beta1 - Math.sqrt(discriminant)) / 2;
    eigenvalue = Math.max(Math.abs(lambda1), Math.abs(lambda2));
  }

  return { beta1, beta2, eigenvalue, r2 };
}

export interface RealEigenvalueEntry {
  gene: string;
  eigenvalue: number;
  type: 'clock' | 'target' | 'other';
  beta1: number;
  beta2: number;
  r2: number;
  timeSeries: number[];
}

function parseDatasetFile(filePath: string): RealEigenvalueEntry[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const results: RealEigenvalueEntry[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const rawGene = cols[0].trim().replace(/"/g, '');
    if (!rawGene) continue;

    const gene = ENSEMBL_TO_SYMBOL[rawGene] || rawGene;
    const type = classifyGene(gene);
    if (type === 'other') continue;

    const key = gene.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const values = cols.slice(1).map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (values.length < 5) continue;

    const fit = fitAR2(values);

    results.push({
      gene,
      eigenvalue: fit.eigenvalue,
      type,
      beta1: fit.beta1,
      beta2: fit.beta2,
      r2: fit.r2,
      timeSeries: values,
    });
  }

  return results;
}

export function computeRealEigenvalueData(): RealEigenvalueEntry[] {
  const filePath = path.join(process.cwd(), 'datasets', 'GSE54650_Liver_circadian.csv');
  return parseDatasetFile(filePath);
}

export interface RealTimeSeriesEntry extends RealEigenvalueEntry {
  timepoints: number[];
}

export function computeRealTimeSeriesData(): RealTimeSeriesEntry[] {
  const filePath = path.join(process.cwd(), 'datasets', 'GSE54650_Liver_circadian.csv');

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const timepoints: number[] = [];
  for (let j = 1; j < headers.length; j++) {
    const match = headers[j].match(/(\d+)/);
    if (match) {
      timepoints.push(parseFloat(match[1]));
    } else {
      timepoints.push(j - 1);
    }
  }

  const eigenvalueData = parseDatasetFile(filePath);

  return eigenvalueData.map(entry => ({
    ...entry,
    timepoints: timepoints.slice(0, entry.timeSeries.length),
  }));
}
