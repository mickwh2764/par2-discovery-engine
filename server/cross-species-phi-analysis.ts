import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const PHI = 1.6180339887498949;
const INV_PHI = 1 / PHI;

export interface GenePhiResult {
  gene: string;
  species: string;
  tissue: string;
  beta1: number;
  beta2: number;
  ratio: number | null;
  distToPhiAbs: number | null;
  fibSimilarity: number;
  isFibLike: boolean;
  eigenvalue: number;
  nPoints: number;
  category: 'clock' | 'background';
}

export interface SpeciesResult {
  species: string;
  tissue: string;
  dataset: string;
  clockGenes: GenePhiResult[];
  backgroundGenes: GenePhiResult[];
  clockMeanRatio: number | null;
  clockMeanFibSim: number;
  clockFibLikeCount: number;
  clockFibLikePct: number;
  nullFibLikeRate: number;
  enrichmentRatio: number;
  pValue: number;
}

export interface CrossSpeciesPhiResult {
  species: SpeciesResult[];
  sharedGenes: SharedGeneResult[];
  nullFibRate: number;
  summary: string;
}

export interface SharedGeneResult {
  humanName: string;
  ratios: { species: string; gene: string; ratio: number | null; fibSim: number; isFibLike: boolean }[];
  allNearPhi: boolean;
  meanRatio: number | null;
  consistency: 'high' | 'moderate' | 'low';
}

function fitAR2(raw: number[]): { beta1: number; beta2: number; eigenvalue: number } | null {
  if (raw.length < 5) return null;
  const mean = raw.reduce((a, b) => a + b, 0) / raw.length;
  const y = raw.map(v => v - mean);

  let s11 = 0, s12 = 0, s22 = 0, sy1 = 0, sy2 = 0;
  for (let t = 2; t < y.length; t++) {
    s11 += y[t - 1] * y[t - 1];
    s12 += y[t - 1] * y[t - 2];
    s22 += y[t - 2] * y[t - 2];
    sy1 += y[t] * y[t - 1];
    sy2 += y[t] * y[t - 2];
  }

  const det = s11 * s22 - s12 * s12;
  if (Math.abs(det) < 1e-15) return null;

  const beta1 = (sy1 * s22 - sy2 * s12) / det;
  const beta2 = (sy2 * s11 - sy1 * s12) / det;

  const disc = beta1 * beta1 + 4 * beta2;
  let eigenvalue: number;
  if (disc >= 0) {
    eigenvalue = Math.max(
      Math.abs((beta1 + Math.sqrt(disc)) / 2),
      Math.abs((beta1 - Math.sqrt(disc)) / 2)
    );
  } else {
    eigenvalue = Math.sqrt(-beta2);
  }

  if (!isFinite(eigenvalue) || eigenvalue > 2) return null;
  eigenvalue = Math.min(eigenvalue, 1.0);

  return { beta1, beta2, eigenvalue };
}

function computePhiMetrics(beta1: number, beta2: number): {
  ratio: number | null;
  distToPhiAbs: number | null;
  fibSimilarity: number;
  isFibLike: boolean;
} {
  if (Math.abs(beta2) < 1e-10) {
    return { ratio: null, distToPhiAbs: null, fibSimilarity: 0, isFibLike: false };
  }
  const ratio = Math.abs(beta1 / beta2);
  const distToPhiAbs = Math.abs(ratio - PHI);
  const fibSimilarity = Math.max(0, 1 - distToPhiAbs / PHI);
  const isFibLike = distToPhiAbs < PHI * 0.10;
  return { ratio, distToPhiAbs, fibSimilarity, isFibLike };
}

function isStableAR2(b1: number, b2: number): boolean {
  return Math.abs(b2) < 1 && b1 + b2 < 1 && b2 - b1 < 1;
}

function runNullSurvey(n = 50000): number {
  const threshold = PHI * 0.10;
  let hits = 0;
  let stable = 0;
  for (let i = 0; i < n; i++) {
    const b1 = (Math.random() * 4) - 2;
    const b2 = (Math.random() * 2) - 1;
    if (!isStableAR2(b1, b2)) continue;
    stable++;
    const ratio = Math.abs(b2) > 1e-10 ? Math.abs(b1 / b2) : 0;
    if (Math.abs(ratio - PHI) < threshold) hits++;
  }
  return stable > 0 ? hits / stable : 0.04;
}

function binomialPValue(observed: number, total: number, nullRate: number): number {
  if (total === 0 || nullRate <= 0) return 1;
  const expected = total * nullRate;
  const variance = total * nullRate * (1 - nullRate);
  if (variance <= 0) return 1;
  const z = (observed - expected) / Math.sqrt(variance);
  return 1 - normalCDF(z);
}

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const p = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return z >= 0 ? p : 1 - p;
}

function processGenes(
  geneMap: Record<string, number[]>,
  clockList: string[],
  backgroundList: string[],
  species: string,
  tissue: string,
  dataset: string
): { clock: GenePhiResult[]; background: GenePhiResult[] } {
  const processGene = (gene: string, category: 'clock' | 'background'): GenePhiResult | null => {
    const values = geneMap[gene];
    if (!values || values.length < 5) return null;
    const fit = fitAR2(values);
    if (!fit) return null;
    const metrics = computePhiMetrics(fit.beta1, fit.beta2);
    return {
      gene,
      species,
      tissue,
      beta1: fit.beta1,
      beta2: fit.beta2,
      ratio: metrics.ratio,
      distToPhiAbs: metrics.distToPhiAbs,
      fibSimilarity: metrics.fibSimilarity,
      isFibLike: metrics.isFibLike,
      eigenvalue: fit.eigenvalue,
      nPoints: values.length,
      category,
    };
  };

  const clock = clockList.map(g => processGene(g, 'clock')).filter(Boolean) as GenePhiResult[];
  const background = backgroundList.map(g => processGene(g, 'background')).filter(Boolean) as GenePhiResult[];
  return { clock, background };
}

function loadMouseLiver(): Record<string, number[]> {
  const fp = path.join(process.cwd(), 'datasets', 'GSE54650_Liver_circadian.csv');
  if (!fs.existsSync(fp)) return {};
  const rows = parse(fs.readFileSync(fp, 'utf-8'), { columns: true, skip_empty_lines: true }) as Record<string, string>[];
  const map: Record<string, number[]> = {};
  for (const row of rows) {
    const gene = row['Gene'] || row['gene'] || row['GeneSymbol'];
    if (!gene) continue;
    const vals = Object.entries(row)
      .filter(([k]) => k !== 'Gene' && k !== 'gene' && k !== 'GeneSymbol')
      .map(([, v]) => parseFloat(v as string))
      .filter(v => isFinite(v));
    if (vals.length >= 5) map[gene] = vals;
  }
  return map;
}

function loadHumanBlood(): Record<string, number[]> {
  const fp = path.join(process.cwd(), 'datasets', 'GSE113883_Human_WholeBlood.csv');
  if (!fs.existsSync(fp)) return {};
  const rows = parse(fs.readFileSync(fp, 'utf-8'), { columns: true, skip_empty_lines: true }) as Record<string, string>[];
  const map: Record<string, number[]> = {};
  for (const row of rows) {
    const gene = row['gene_id'] || row['Gene'] || row['gene'];
    if (!gene) continue;
    const vals = Object.entries(row)
      .filter(([k]) => k !== 'gene_id' && k !== 'Gene' && k !== 'gene')
      .map(([, v]) => parseFloat(v as string))
      .filter(v => isFinite(v));
    if (vals.length >= 5) map[gene] = vals;
  }
  return map;
}

function loadBaboonLiver(): Record<string, number[]> {
  const fp = path.join(process.cwd(), 'datasets', 'GSE98965_baboon_FPKM.csv');
  if (!fs.existsSync(fp)) return {};
  const rows = parse(fs.readFileSync(fp, 'utf-8'), { columns: true, skip_empty_lines: true }) as Record<string, string>[];
  const liverPrefix = 'LIV';
  const map: Record<string, number[]> = {};
  for (const row of rows) {
    const gene = row['Symbol'] || row['EnsemblID'];
    if (!gene || gene.startsWith('ENSPANG')) continue;
    const vals = Object.entries(row)
      .filter(([k]) => k.startsWith(liverPrefix + '.'))
      .map(([, v]) => parseFloat(v as string))
      .filter(v => isFinite(v));
    if (vals.length >= 5) map[gene] = vals;
  }
  return map;
}

function loadArabidopsis(): Record<string, number[]> {
  const candidates = [
    'GSE242964_Arabidopsis_DayA_CT-header.csv',
    'GSE242964_arabidopsis_circadian_averaged.csv',
    'GSE242964_arabidopsis_circadian.csv',
  ];
  let fp = '';
  for (const c of candidates) {
    const p = path.join(process.cwd(), 'datasets', c);
    if (fs.existsSync(p)) { fp = p; break; }
  }
  if (!fp) return {};
  const rows = parse(fs.readFileSync(fp, 'utf-8'), { columns: true, skip_empty_lines: true }) as Record<string, string>[];
  const map: Record<string, number[]> = {};
  for (const row of rows) {
    const gene = row['Gene'] || row['gene'] || row['gene_id'] || row['ID'];
    if (!gene) continue;
    const vals = Object.entries(row)
      .filter(([k]) => k !== 'Gene' && k !== 'gene' && k !== 'gene_id' && k !== 'ID')
      .map(([, v]) => parseFloat(v as string))
      .filter(v => isFinite(v));
    const uniqueVals = [...new Set(vals)];
    if (uniqueVals.length >= 3 && vals.length >= 5) map[gene] = vals;
  }
  return map;
}

function sampleBackground(geneMap: Record<string, number[]>, clockGenes: string[], n = 80): string[] {
  const all = Object.keys(geneMap).filter(g => !clockGenes.includes(g));
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function runCrossSpeciesPhiAnalysis(): CrossSpeciesPhiResult {
  const nullFibRate = runNullSurvey(50000);

  const mouseClockGenes = ['Per1','Per2','Per3','Cry1','Cry2','Arntl','Clock','Nr1d1','Nr1d2','Dbp','Rora','Rorc','Bhlhe40','Bhlhe41'];
  const humanClockGenes = ['PER1','PER2','PER3','CRY1','CRY2','ARNTL','CLOCK','NR1D1','NR1D2','DBP','RORA','RORC','BHLHE40','BHLHE41'];
  const arabidopsisClockGenes = ['CCA1','LHY','TOC1','PRR5','PRR7','PRR9','GI','ELF3','ELF4','LUX'];

  const mouseMap = loadMouseLiver();
  const humanMap = loadHumanBlood();
  const baboonMap = loadBaboonLiver();
  const arabMap = loadArabidopsis();

  const mouseBg = sampleBackground(mouseMap, mouseClockGenes);
  const humanBg = sampleBackground(humanMap, humanClockGenes);
  const baboonBg = sampleBackground(baboonMap, humanClockGenes);
  const arabBg = sampleBackground(arabMap, arabidopsisClockGenes);

  const buildSpeciesResult = (
    species: string,
    tissue: string,
    dataset: string,
    geneMap: Record<string, number[]>,
    clockList: string[],
    bgList: string[]
  ): SpeciesResult => {
    const { clock, background } = processGenes(geneMap, clockList, bgList, species, tissue, dataset);
    const validRatios = clock.filter(g => g.ratio !== null).map(g => g.ratio as number);
    const clockMeanRatio = validRatios.length > 0 ? validRatios.reduce((a, b) => a + b, 0) / validRatios.length : null;
    const clockMeanFibSim = clock.length > 0 ? clock.reduce((a, b) => a + b.fibSimilarity, 0) / clock.length : 0;
    const clockFibLikeCount = clock.filter(g => g.isFibLike).length;
    const clockFibLikePct = clock.length > 0 ? clockFibLikeCount / clock.length : 0;
    const pVal = binomialPValue(clockFibLikeCount, clock.length, nullFibRate);
    const enrichmentRatio = nullFibRate > 0 ? clockFibLikePct / nullFibRate : 1;

    return {
      species, tissue, dataset,
      clockGenes: clock,
      backgroundGenes: background,
      clockMeanRatio,
      clockMeanFibSim,
      clockFibLikeCount,
      clockFibLikePct,
      nullFibLikeRate: nullFibRate,
      enrichmentRatio,
      pValue: pVal,
    };
  };

  const speciesResults: SpeciesResult[] = [
    buildSpeciesResult('Mouse', 'Liver', 'GSE54650', mouseMap, mouseClockGenes, mouseBg),
    buildSpeciesResult('Human', 'Whole Blood', 'GSE113883', humanMap, humanClockGenes, humanBg),
    buildSpeciesResult('Baboon', 'Liver', 'GSE98965', baboonMap, humanClockGenes, baboonBg),
    buildSpeciesResult('Arabidopsis', 'Shoot', 'GSE242964', arabMap, arabidopsisClockGenes, arabBg),
  ];

  const sharedPairs: Array<{ humanName: string; mouseGene: string; humanGene: string; baboonGene: string; arabGene: string | null }> = [
    { humanName: 'ARNTL/Arntl (BMAL1)', mouseGene: 'Arntl', humanGene: 'ARNTL', baboonGene: 'ARNTL', arabGene: 'CCA1' },
    { humanName: 'PER2/Per2', mouseGene: 'Per2', humanGene: 'PER2', baboonGene: 'PER2', arabGene: 'TOC1' },
    { humanName: 'CRY1/Cry1', mouseGene: 'Cry1', humanGene: 'CRY1', baboonGene: 'CRY1', arabGene: null },
    { humanName: 'NR1D1/Nr1d1 (REV-ERBα)', mouseGene: 'Nr1d1', humanGene: 'NR1D1', baboonGene: 'NR1D1', arabGene: null },
    { humanName: 'CLOCK/Clock', mouseGene: 'Clock', humanGene: 'CLOCK', baboonGene: 'CLOCK', arabGene: null },
  ];

  const getGeneResult = (speciesResult: SpeciesResult, gene: string): GenePhiResult | null =>
    speciesResult.clockGenes.find(g => g.gene === gene) || null;

  const sharedGenes: SharedGeneResult[] = sharedPairs.map(pair => {
    const mouseRes = speciesResults.find(s => s.species === 'Mouse');
    const humanRes = speciesResults.find(s => s.species === 'Human');
    const baboonRes = speciesResults.find(s => s.species === 'Baboon');
    const arabRes = speciesResults.find(s => s.species === 'Arabidopsis');

    const entries: { species: string; gene: string; ratio: number | null; fibSim: number; isFibLike: boolean }[] = [];

    const addEntry = (res: SpeciesResult | undefined, gene: string, speciesName: string) => {
      if (!res || !gene) return;
      const r = getGeneResult(res, gene);
      if (r) entries.push({ species: speciesName, gene, ratio: r.ratio, fibSim: r.fibSimilarity, isFibLike: r.isFibLike });
    };

    addEntry(mouseRes, pair.mouseGene, 'Mouse');
    addEntry(humanRes, pair.humanGene, 'Human');
    addEntry(baboonRes, pair.baboonGene, 'Baboon');
    if (pair.arabGene) addEntry(arabRes, pair.arabGene, 'Arabidopsis');

    const validRatios = entries.filter(e => e.ratio !== null).map(e => e.ratio as number);
    const meanRatio = validRatios.length > 0 ? validRatios.reduce((a, b) => a + b, 0) / validRatios.length : null;
    const allNearPhi = entries.length >= 2 && entries.filter(e => e.isFibLike).length >= Math.ceil(entries.length * 0.5);

    const spread = validRatios.length > 1
      ? Math.max(...validRatios) - Math.min(...validRatios)
      : Infinity;

    const consistency: 'high' | 'moderate' | 'low' =
      spread < 0.3 && allNearPhi ? 'high' :
      spread < 0.8 ? 'moderate' : 'low';

    return { humanName: pair.humanName, ratios: entries, allNearPhi, meanRatio, consistency };
  });

  const significantSpecies = speciesResults.filter(s => s.pValue < 0.05).length;
  const summary = `Cross-species φ analysis: ${significantSpecies}/4 species show significant Fibonacci-like coefficient ratios in clock genes (p<0.05 vs stability-filtered null rate of ${(nullFibRate * 100).toFixed(1)}%). ${sharedGenes.filter(g => g.consistency === 'high').length} of ${sharedGenes.length} conserved gene pairs show high cross-species consistency near φ = ${PHI.toFixed(4)}.`;

  return { species: speciesResults, sharedGenes, nullFibRate, summary };
}
