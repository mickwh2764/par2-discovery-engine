import * as fs from 'fs';
import * as path from 'path';
import { ENSEMBL_TO_SYMBOL } from './gene-categories';
import { fitAR2 as fitAR2Shared } from './ar2-shared';

export interface DatasetInfo {
  id: string;
  name: string;
  file: string;
  species: string;
}

export interface VolatileGene {
  gene: string;
  geneType: 'clock' | 'target' | 'other';
  datasetsFound: number;
  eigenvalues: { datasetId: string; datasetName: string; eigenvalue: number; r2: number }[];
  meanEigenvalue: number;
  eigenvalueRange: number;
  eigenvalueStdDev: number;
  volatilityScore: number;
  interpretation: string;
}

interface GeneEntry {
  originalName: string;
  geneType: 'clock' | 'target' | 'other';
  observations: { datasetId: string; datasetName: string; eigenvalue: number; r2: number }[];
}

interface VolatileGenesResult {
  topVolatile: VolatileGene[];
  totalGenesAcross: number;
  totalDatasetsUsed: number;
  clockVolatility: number;
  targetVolatility: number;
  otherVolatility: number;
}

let cachedResult: VolatileGenesResult | null = null;
let cachedDatasetKey: string | null = null;

const CLOCK_GENES = new Set([
  'ARNTL','BMAL1','CLOCK','PER1','PER2','PER3','CRY1','CRY2',
  'NR1D1','NR1D2','DBP','TEF','HLF','RORA','RORC','NPAS2','NFIL3','CSNK1D','CSNK1E'
].map(g => g.toUpperCase()));

const TARGET_GENES = new Set([
  'WEE1','MYC','CCND1','CCNB1','CDK1','TOP2A','MKI67','CDKN1A',
  'TP53','APC','CTNNB1','AXIN2','BCL2','HIF1A','VEGFA','MDM2',
  'SIRT1','CCNE1','CCNE2','CHEK2','CDK2','RB1','E2F1','CDK4','CDK6',
  'CD44','PTEN','NOTCH1','WNT5A'
].map(g => g.toUpperCase()));

function classifyGene(gene: string): 'clock' | 'target' | 'other' {
  const upper = gene.toUpperCase();
  if (CLOCK_GENES.has(upper)) return 'clock';
  if (TARGET_GENES.has(upper)) return 'target';
  return 'other';
}

function fastAR2(values: number[]): { eigenvalue: number; r2: number } | null {
  const result = fitAR2Shared(values);
  if (!result) return null;
  if (result.eigenvalue >= 1.5 || result.eigenvalue <= 0 || !isFinite(result.eigenvalue)) return null;
  return { eigenvalue: result.eigenvalue, r2: result.r2 };
}

function stdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const sumSqDiff = values.reduce((s, v) => s + (v - mean) ** 2, 0);
  return Math.sqrt(sumSqDiff / (values.length - 1));
}

function interpretVolatility(gene: VolatileGene): string {
  const { geneType, eigenvalueRange, eigenvalueStdDev, datasetsFound, meanEigenvalue } = gene;
  const parts: string[] = [];

  if (geneType === 'clock') {
    parts.push(`Core clock gene with high context-dependent eigenvalue variation (range ${eigenvalueRange.toFixed(3)}).`);
  } else if (geneType === 'target') {
    parts.push(`Clock-controlled target gene showing variable AR(2) dynamics across ${datasetsFound} datasets.`);
  } else {
    parts.push(`Non-clock gene with substantial eigenvalue variability across ${datasetsFound} conditions.`);
  }

  if (meanEigenvalue > 0.9) {
    parts.push('Near-critical mean eigenvalue suggests proximity to instability threshold.');
  } else if (meanEigenvalue > 0.7) {
    parts.push('Moderate mean eigenvalue in the stable oscillatory band.');
  } else {
    parts.push('Low mean eigenvalue indicates generally fast-decaying dynamics.');
  }

  if (eigenvalueStdDev > 0.2) {
    parts.push('Very high variability — dynamics shift dramatically between conditions.');
  } else if (eigenvalueStdDev > 0.1) {
    parts.push('Moderate variability — context-dependent regulatory changes likely.');
  }

  return parts.join(' ');
}

const fileCache = new Map<string, { gene: string; geneType: 'clock' | 'target' | 'other'; eigenvalue: number; r2: number }[]>();

function processDatasetFast(filePath: string): { gene: string; geneType: 'clock' | 'target' | 'other'; eigenvalue: number; r2: number }[] {
  const cached = fileCache.get(filePath);
  if (cached) return cached;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const results: { gene: string; geneType: 'clock' | 'target' | 'other'; eigenvalue: number; r2: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 4) continue;

    const rawGene = parts[0].trim().replace(/"/g, '');
    if (!rawGene) continue;
    const gene = ENSEMBL_TO_SYMBOL[rawGene] || rawGene;

    const values: number[] = [];
    for (let j = 1; j < parts.length; j++) {
      const v = parseFloat(parts[j]);
      if (!isNaN(v)) values.push(v);
    }

    const fit = fastAR2(values);
    if (!fit) continue;

    results.push({
      gene,
      geneType: classifyGene(gene),
      eigenvalue: fit.eigenvalue,
      r2: fit.r2
    });
  }

  fileCache.set(filePath, results);
  return results;
}

export function computeVolatileGenes(datasets: DatasetInfo[]): VolatileGenesResult {
  const cacheKey = datasets.map(d => d.id).sort().join('|');
  if (cachedResult && cachedDatasetKey === cacheKey) {
    return cachedResult;
  }

  console.log(`[volatile-genes] Processing ${datasets.length} datasets...`);
  const geneMap = new Map<string, GeneEntry>();
  let totalDatasetsUsed = 0;

  for (const dataset of datasets) {
    const filePath = path.join(process.cwd(), 'datasets', dataset.file);
    if (!fs.existsSync(filePath)) continue;

    let results: { gene: string; geneType: 'clock' | 'target' | 'other'; eigenvalue: number; r2: number }[];
    try {
      results = processDatasetFast(filePath);
    } catch (err) {
      console.warn(`[volatile-genes] Error processing ${dataset.file}:`, err);
      continue;
    }

    if (results.length === 0) continue;
    totalDatasetsUsed++;
    console.log(`[volatile-genes] Processed ${dataset.name}: ${results.length} genes`);

    for (const r of results) {
      const normalizedName = r.gene.toUpperCase();
      let entry = geneMap.get(normalizedName);
      if (!entry) {
        entry = {
          originalName: r.gene,
          geneType: r.geneType,
          observations: []
        };
        geneMap.set(normalizedName, entry);
      }
      entry.observations.push({
        datasetId: dataset.id,
        datasetName: dataset.name,
        eigenvalue: r.eigenvalue,
        r2: r.r2
      });
    }
  }

  const totalGenesAcross = geneMap.size;
  const volatileGenes: VolatileGene[] = [];

  for (const entry of geneMap.values()) {
    if (entry.observations.length < 3) continue;

    const eigenvalues = entry.observations.map(o => o.eigenvalue);
    const meanEV = eigenvalues.reduce((s, v) => s + v, 0) / eigenvalues.length;
    const minEV = Math.min(...eigenvalues);
    const maxEV = Math.max(...eigenvalues);
    const range = maxEV - minEV;
    const sd = stdDev(eigenvalues, meanEV);
    const score = sd * Math.sqrt(entry.observations.length);

    const vg: VolatileGene = {
      gene: entry.originalName,
      geneType: entry.geneType,
      datasetsFound: entry.observations.length,
      eigenvalues: entry.observations,
      meanEigenvalue: +meanEV.toFixed(6),
      eigenvalueRange: +range.toFixed(6),
      eigenvalueStdDev: +sd.toFixed(6),
      volatilityScore: +score.toFixed(6),
      interpretation: ''
    };
    vg.interpretation = interpretVolatility(vg);
    volatileGenes.push(vg);
  }

  volatileGenes.sort((a, b) => b.volatilityScore - a.volatilityScore);

  const topVolatile = volatileGenes.slice(0, 100);

  const clockScores = volatileGenes.filter(g => g.geneType === 'clock').map(g => g.volatilityScore);
  const targetScores = volatileGenes.filter(g => g.geneType === 'target').map(g => g.volatilityScore);
  const otherScores = volatileGenes.filter(g => g.geneType === 'other').map(g => g.volatilityScore);

  const meanArr = (arr: number[]) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  const result: VolatileGenesResult = {
    topVolatile,
    totalGenesAcross,
    totalDatasetsUsed,
    clockVolatility: +meanArr(clockScores).toFixed(6),
    targetVolatility: +meanArr(targetScores).toFixed(6),
    otherVolatility: +meanArr(otherScores).toFixed(6)
  };

  cachedResult = result;
  cachedDatasetKey = cacheKey;

  console.log(`[volatile-genes] Done. ${totalGenesAcross} genes across ${totalDatasetsUsed} datasets.`);
  return result;
}
