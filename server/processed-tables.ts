import * as fs from 'fs';
import * as path from 'path';
import { fitAR2WithDiagnostics, computeADF } from './edge-case-diagnostics';

const DEFAULT_CLOCK_GENES = [
  'Per1', 'Per2', 'Per3', 'Cry1', 'Cry2', 'Clock', 'Arntl', 'Bmal1',
  'Nr1d1', 'Nr1d2', 'Rorc', 'Dbp', 'Tef', 'Npas2',
  'PER1', 'PER2', 'PER3', 'CRY1', 'CRY2', 'CLOCK', 'ARNTL', 'BMAL1',
  'NR1D1', 'NR1D2', 'RORC', 'DBP', 'TEF', 'NPAS2'
];

const DEFAULT_TARGET_GENES = [
  'Myc', 'Ccnd1', 'Ccnb1', 'Cdk1', 'Wee1', 'Cdkn1a', 'Lgr5', 'Axin2',
  'Ctnnb1', 'Apc', 'Tp53', 'Trp53', 'Mdm2', 'Atm', 'Chek2', 'Bcl2',
  'Bax', 'Pparg', 'Sirt1', 'Hif1a', 'Ccne1', 'Ccne2', 'Mcm6', 'Mki67',
  'MYC', 'CCND1', 'CCNB1', 'CDK1', 'WEE1', 'CDKN1A', 'LGR5', 'AXIN2',
  'CTNNB1', 'APC', 'TP53', 'TRP53', 'MDM2', 'ATM', 'CHEK2', 'BCL2',
  'BAX', 'PPARG', 'SIRT1', 'HIF1A', 'CCNE1', 'CCNE2', 'MCM6', 'MKI67'
];

const ENSEMBL_TO_SYMBOL: Record<string, string> = {
  'ENSMUSG00000020893': 'Per1', 'ENSMUSG00000055866': 'Per2', 'ENSMUSG00000028957': 'Per3',
  'ENSMUSG00000020038': 'Cry1', 'ENSMUSG00000068742': 'Cry2',
  'ENSMUSG00000029238': 'Clock', 'ENSMUSG00000055116': 'Arntl',
  'ENSMUSG00000020889': 'Nr1d1', 'ENSMUSG00000021775': 'Nr1d2',
  'ENSMUSG00000032238': 'Rora', 'ENSMUSG00000028150': 'Rorc',
  'ENSMUSG00000059824': 'Dbp', 'ENSMUSG00000022389': 'Tef',
  'ENSMUSG00000003949': 'Hlf', 'ENSMUSG00000056749': 'Nfil3',
  'ENSMUSG00000022346': 'Myc', 'ENSMUSG00000070348': 'Ccnd1',
  'ENSMUSG00000041431': 'Ccnb1', 'ENSMUSG00000019942': 'Cdk1',
  'ENSMUSG00000031016': 'Wee1', 'ENSMUSG00000023067': 'Cdkn1a',
  'ENSMUSG00000020140': 'Lgr5', 'ENSMUSG00000000142': 'Axin2',
  'ENSMUSG00000006932': 'Ctnnb1', 'ENSMUSG00000005871': 'Apc',
  'ENSMUSG00000059552': 'Trp53', 'ENSMUSG00000020184': 'Mdm2',
  'ENSMUSG00000034218': 'Atm', 'ENSMUSG00000029521': 'Chek2',
  'ENSMUSG00000057329': 'Bcl2', 'ENSMUSG00000003873': 'Bax',
  'ENSMUSG00000000440': 'Pparg', 'ENSMUSG00000020063': 'Sirt1',
  'ENSMUSG00000021109': 'Hif1a',
  'ENSMUSG00000026077': 'Npas2',
  'ENSMUSG00000002068': 'Ccne1', 'ENSMUSG00000028399': 'Ccne2',
  'ENSMUSG00000025544': 'Mcm6', 'ENSMUSG00000031004': 'Mki67',
};

export interface GeneResult {
  gene: string;
  geneType: 'clock' | 'target' | 'other';
  eigenvalueModulus: number;
  phi1: number;
  phi2: number;
  rSquared: number;
  ljungBoxP: number;
  ljungBoxPassed: boolean;
  confidenceScore: number;
  confidenceLevel: string;
  classification: string;
  nTimepoints: number;
  trendFlag: boolean;
  sampleSizeFlag: boolean;
  ar3OrderFlag: boolean;
  nonlinearityFlag: boolean;
  boundaryFlag: boolean;
  adfStationarityFlag: boolean;
  adfTestStatistic: number;
  stable: boolean;
}

function classifyEigenvalue(eigenvalue: number): string {
  if (eigenvalue < 0.4) return 'fast_decay';
  if (eigenvalue <= 0.8) return 'stable_band';
  if (eigenvalue < 1.0) return 'near_critical';
  return 'explosive';
}

function classifyGeneType(
  geneName: string,
  clockSet: Set<string>,
  targetSet: Set<string>
): 'clock' | 'target' | 'other' {
  const upper = geneName.toUpperCase();
  if (clockSet.has(upper)) return 'clock';
  if (targetSet.has(upper)) return 'target';
  return 'other';
}

function getDiagnosticFlag(diagnostics: { edgeCaseDiagnostics: { id: string; triggered: boolean }[] }, id: string): boolean {
  const d = diagnostics.edgeCaseDiagnostics.find(d => d.id === id);
  return d ? d.triggered : false;
}

const processedTableCache = new Map<string, GeneResult[]>();

export function generateProcessedTable(
  datasetPath: string,
  options?: { clockGenes?: string[]; targetGenes?: string[] }
): GeneResult[] {
  const cacheKey = datasetPath + '|' + (options?.clockGenes?.join(',') ?? '') + '|' + (options?.targetGenes?.join(',') ?? '');
  const cached = processedTableCache.get(cacheKey);
  if (cached) return cached;

  const clockGenes = options?.clockGenes || DEFAULT_CLOCK_GENES;
  const targetGenes = options?.targetGenes || DEFAULT_TARGET_GENES;

  const clockSet = new Set(clockGenes.map(g => g.toUpperCase()));
  const targetSet = new Set(targetGenes.map(g => g.toUpperCase()));

  const content = fs.readFileSync(datasetPath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const results: GeneResult[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 2) continue;

    const rawGene = parts[0].trim().replace(/"/g, '');
    if (!rawGene) continue;
    const gene = ENSEMBL_TO_SYMBOL[rawGene] || rawGene;

    const values: number[] = [];
    for (let j = 1; j < parts.length; j++) {
      const v = parseFloat(parts[j]);
      if (!isNaN(v)) values.push(v);
    }

    if (values.length < 5) continue;

    const result = fitAR2WithDiagnostics(values);
    if (result === null) continue;

    const { phi1, phi2, eigenvalue, r2, ljungBoxPassed, ljungBoxPValue, diagnostics } = result;

    const adfResult = computeADF(values);

    results.push({
      gene,
      geneType: classifyGeneType(gene, clockSet, targetSet),
      eigenvalueModulus: eigenvalue,
      phi1,
      phi2,
      rSquared: r2,
      ljungBoxP: ljungBoxPValue,
      ljungBoxPassed,
      confidenceScore: diagnostics.confidenceScore,
      confidenceLevel: diagnostics.overallConfidence,
      classification: classifyEigenvalue(eigenvalue),
      nTimepoints: values.length,
      trendFlag: getDiagnosticFlag(diagnostics, 'trend_detection'),
      sampleSizeFlag: getDiagnosticFlag(diagnostics, 'sample_size_confidence'),
      ar3OrderFlag: getDiagnosticFlag(diagnostics, 'model_order_check'),
      nonlinearityFlag: getDiagnosticFlag(diagnostics, 'nonlinearity_test'),
      boundaryFlag: getDiagnosticFlag(diagnostics, 'boundary_proximity'),
      adfStationarityFlag: !adfResult.stationary,
      adfTestStatistic: adfResult.testStatistic,
      stable: eigenvalue < 1.0
    });
  }

  processedTableCache.set(cacheKey, results);
  return results;
}

export function generateProcessedTableCSV(
  datasetPath: string,
  datasetName: string,
  options?: { clockGenes?: string[]; targetGenes?: string[] }
): string {
  const results = generateProcessedTable(datasetPath, options);

  const clockResults = results.filter(r => r.geneType === 'clock').sort((a, b) => b.eigenvalueModulus - a.eigenvalueModulus);
  const targetResults = results.filter(r => r.geneType === 'target').sort((a, b) => b.eigenvalueModulus - a.eigenvalueModulus);
  const otherResults = results.filter(r => r.geneType === 'other').sort((a, b) => b.eigenvalueModulus - a.eigenvalueModulus);

  const sorted = [...clockResults, ...targetResults, ...otherResults];

  const meanEV = (arr: GeneResult[]) => arr.length > 0 ? arr.reduce((s, r) => s + r.eigenvalueModulus, 0) / arr.length : 0;

  const lines: string[] = [];
  lines.push(`# PAR(2) Processed Eigenvalue Table`);
  lines.push(`# Dataset: ${datasetName}`);
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Total genes analyzed: ${results.length}`);
  lines.push(`# Clock genes: ${clockResults.length}`);
  lines.push(`# Target genes: ${targetResults.length}`);
  lines.push(`# Other genes: ${otherResults.length}`);
  lines.push(`# Mean eigenvalue (clock): ${meanEV(clockResults).toFixed(4)}`);
  lines.push(`# Mean eigenvalue (target): ${meanEV(targetResults).toFixed(4)}`);
  lines.push(`# Mean eigenvalue (other): ${meanEV(otherResults).toFixed(4)}`);
  lines.push(`# ADF stationarity pass rate: ${(sorted.filter(r => !r.adfStationarityFlag).length / Math.max(1, sorted.length) * 100).toFixed(1)}%`);

  const stableResults = results.filter(r => r.stable);
  const stableClockResults = clockResults.filter(r => r.stable);
  const stableTargetResults = targetResults.filter(r => r.stable);
  lines.push(`# Stable genes (|lambda| < 1.0): ${stableResults.length}/${results.length} (${(stableResults.length / Math.max(1, results.length) * 100).toFixed(1)}%)`);
  lines.push(`# Stable clock genes: ${stableClockResults.length}/${clockResults.length}`);
  lines.push(`# Stable target genes: ${stableTargetResults.length}/${targetResults.length}`);
  lines.push(`# Mean eigenvalue (stable clock): ${meanEV(stableClockResults).toFixed(4)}`);
  lines.push(`# Mean eigenvalue (stable target): ${meanEV(stableTargetResults).toFixed(4)}`);
  lines.push(`# Stability-filtered gap: ${(meanEV(stableTargetResults) - meanEV(stableClockResults)).toFixed(4)}`);

  lines.push('gene,gene_type,eigenvalue_modulus,phi1,phi2,r_squared,ljung_box_p,ljung_box_passed,confidence_score,confidence_level,classification,n_timepoints,trend_flag,sample_size_flag,ar3_order_flag,nonlinearity_flag,boundary_flag,adf_stationary_flag,adf_test_statistic,stable');

  for (const r of sorted) {
    lines.push([
      r.gene,
      r.geneType,
      r.eigenvalueModulus.toFixed(6),
      r.phi1.toFixed(6),
      r.phi2.toFixed(6),
      r.rSquared.toFixed(6),
      r.ljungBoxP.toFixed(6),
      r.ljungBoxPassed ? 'true' : 'false',
      r.confidenceScore.toFixed(2),
      r.confidenceLevel,
      r.classification,
      r.nTimepoints.toString(),
      r.trendFlag ? 'true' : 'false',
      r.sampleSizeFlag ? 'true' : 'false',
      r.ar3OrderFlag ? 'true' : 'false',
      r.nonlinearityFlag ? 'true' : 'false',
      r.boundaryFlag ? 'true' : 'false',
      r.adfStationarityFlag ? 'true' : 'false',
      r.adfTestStatistic.toFixed(4),
      r.stable ? 'true' : 'false'
    ].join(','));
  }

  return lines.join('\n') + '\n';
}
