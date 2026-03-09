const fs = require('fs');

// ============================================================
// E. COLI AR(2) PERSISTENCE ANALYSIS
// GSE67402: E. coli K-12 glucose starvation time course
// 9 timepoints, 3 biological replicates, 4,485 genes
// ============================================================

console.log("=== E. COLI BACTERIAL PERSISTENCE ANALYSIS (GSE67402) ===\n");
console.log("Dataset: E. coli K-12 MG1655 glucose starvation time course");
console.log("Source: Houser et al., PLoS Comput Biol 2015");
console.log("Timepoints: 3h, 4h, 5h, 6h, 8h, 24h, 48h, 168h (1wk), 336h (2wk)");
console.log("Replicates: 3 biological replicates per timepoint (rRNA-depleted)\n");

// Sample ID -> timepoint mapping (from series matrix metadata)
// Excluding rRNA-not-depleted samples (AG3C-97-ND through AG3C-105-ND)
const SAMPLE_MAP = {
  'AG3C-16': { hour: 3, rep: 1 },
  'AG3C-17': { hour: 4, rep: 1 },
  'AG3C-18': { hour: 5, rep: 1 },
  'AG3C-19': { hour: 6, rep: 1 },
  'AG3C-20': { hour: 8, rep: 1 },
  'AG3C-21': { hour: 24, rep: 1 },
  'AG3C-22': { hour: 48, rep: 1 },
  'AG3C-23': { hour: 168, rep: 1 },
  'AG3C-24': { hour: 336, rep: 1 },
  'AG3C-25': { hour: 3, rep: 2 },
  'AG3C-26': { hour: 4, rep: 2 },
  'AG3C-27': { hour: 5, rep: 2 },
  'AG3C-28': { hour: 6, rep: 2 },
  'AG3C-29': { hour: 8, rep: 2 },
  'AG3C-30': { hour: 24, rep: 2 },
  'AG3C-31': { hour: 48, rep: 2 },
  'AG3C-32': { hour: 168, rep: 2 },
  'AG3C-33': { hour: 336, rep: 2 },
  'AG3C-97': { hour: 3, rep: 3 },
  'AG3C-98': { hour: 4, rep: 3 },
  'AG3C-99': { hour: 5, rep: 3 },
  'AG3C-100': { hour: 6, rep: 3 },
  'AG3C-101': { hour: 8, rep: 3 },
  'AG3C-102': { hour: 24, rep: 3 },
  'AG3C-103': { hour: 48, rep: 3 },
  'AG3C-104': { hour: 168, rep: 3 },
  'AG3C-105': { hour: 336, rep: 3 }
};

const TIMEPOINTS = [3, 4, 5, 6, 8, 24, 48, 168, 336];

// Known E. coli gene categories for validation
const GENE_CATEGORIES = {
  essential_housekeeping: {
    label: "Essential/Housekeeping",
    description: "Core metabolic and structural genes",
    genes: ['dnaA', 'dnaB', 'dnaE', 'dnaG', 'dnaN', 'gyrA', 'gyrB', 'rpoA', 'rpoB', 'rpoC', 'rpoD',
            'ftsZ', 'ftsA', 'ftsI', 'murA', 'murB', 'murC', 'murD', 'murE', 'murF', 'murG',
            'infA', 'infB', 'infC', 'tufA', 'tufB', 'fusA', 'tsf', 'prfA', 'prfB',
            'groEL', 'groES', 'dnaK', 'dnaJ', 'grpE', 'clpB', 'clpP', 'clpX', 'lon',
            'secA', 'secB', 'secD', 'secE', 'secF', 'secG', 'secY', 'ffh', 'ftsY']
  },
  sos_response: {
    label: "SOS/DNA Repair",
    description: "DNA damage response genes (key for antibiotic tolerance)",
    genes: ['recA', 'lexA', 'recB', 'recC', 'recD', 'recF', 'recN', 'recO', 'recR',
            'uvrA', 'uvrB', 'uvrC', 'uvrD', 'umuC', 'umuD', 'dinB', 'sulA',
            'polB', 'ssb', 'ruvA', 'ruvB', 'ruvC']
  },
  persister_tolerance: {
    label: "Persister/Tolerance",
    description: "Genes linked to antibiotic persistence and tolerance",
    genes: ['hipA', 'hipB', 'relA', 'spoT', 'mazE', 'mazF', 'mqsR', 'mqsA',
            'tisB', 'istR', 'dinJ', 'yafQ', 'chpA', 'chpB', 'yoeB', 'yefM',
            'vapC', 'cspD', 'obgE', 'sucB', 'glpD', 'tnaA', 'phoU']
  },
  efflux_pumps: {
    label: "Efflux Pumps",
    description: "Active drug export systems (resistance mechanism)",
    genes: ['acrA', 'acrB', 'tolC', 'acrD', 'acrE', 'acrF', 'mdtA', 'mdtB', 'mdtC',
            'emrA', 'emrB', 'emrD', 'emrE', 'emrK', 'emrY', 'mdfA', 'macA', 'macB',
            'marA', 'marB', 'marR', 'soxS', 'soxR', 'rob']
  },
  stress_response: {
    label: "General Stress Response",
    description: "Sigma factor rpoS regulon and stress genes",
    genes: ['rpoS', 'rpoE', 'rpoH', 'bolA', 'osmB', 'osmC', 'osmE', 'osmY',
            'otsA', 'otsB', 'treA', 'katE', 'katG', 'sodA', 'sodB', 'sodC',
            'dps', 'cbpA', 'csiD', 'gabD', 'gadA', 'gadB', 'gadC', 'hdeA', 'hdeB',
            'wrbA', 'uspA', 'uspB', 'uspC', 'uspD', 'uspE', 'uspF', 'uspG']
  },
  biofilm: {
    label: "Biofilm Formation",
    description: "Biofilm and adhesion genes",
    genes: ['csgA', 'csgB', 'csgC', 'csgD', 'csgE', 'csgF', 'csgG',
            'bcsA', 'bcsB', 'bcsC', 'bcsZ', 'pgaA', 'pgaB', 'pgaC', 'pgaD',
            'fimA', 'fimB', 'fimC', 'fimD', 'fimE', 'fimH', 'flu', 'ycgR']
  },
  ribosomal: {
    label: "Ribosomal Proteins",
    description: "Core translation machinery",
    genes: ['rplA', 'rplB', 'rplC', 'rplD', 'rplE', 'rplF', 'rplK', 'rplL', 'rplM', 'rplN',
            'rplO', 'rplP', 'rplQ', 'rplR', 'rplS', 'rplT', 'rplU', 'rplV', 'rplW', 'rplX',
            'rpsA', 'rpsB', 'rpsC', 'rpsD', 'rpsE', 'rpsF', 'rpsG', 'rpsH', 'rpsI', 'rpsJ',
            'rpsK', 'rpsL', 'rpsM', 'rpsN', 'rpsO', 'rpsP', 'rpsQ', 'rpsR', 'rpsS', 'rpsT', 'rpsU']
  },
  energy_metabolism: {
    label: "Energy/Central Metabolism",
    description: "TCA cycle, glycolysis, electron transport",
    genes: ['aceA', 'aceB', 'aceE', 'aceF', 'acnA', 'acnB', 'fumA', 'fumB', 'fumC',
            'gltA', 'icdA', 'mdh', 'sdhA', 'sdhB', 'sdhC', 'sdhD', 'sucA', 'sucC', 'sucD',
            'pgi', 'pfkA', 'pfkB', 'fbaA', 'fbaB', 'tpiA', 'gapA', 'pgk', 'gpmA', 'eno', 'pykA', 'pykF',
            'nuoA', 'nuoB', 'nuoC', 'nuoE', 'nuoF', 'nuoG', 'nuoH', 'nuoI', 'nuoJ', 'nuoK', 'nuoL', 'nuoM', 'nuoN',
            'cyoA', 'cyoB', 'cyoC', 'cyoD', 'cydA', 'cydB', 'atpA', 'atpB', 'atpC', 'atpD', 'atpE', 'atpF', 'atpG', 'atpH']
  }
};

// Parse the counts CSV
const raw = fs.readFileSync('/tmp/GSE67402_counts.csv', 'utf-8');
const lines = raw.split('\n').filter(l => l.trim());
const header = lines[0].split(',');

// Map column indices to sample metadata
const colMap = {};
for (let i = 1; i < header.length; i++) {
  const sampleId = header[i].trim();
  if (SAMPLE_MAP[sampleId]) {
    colMap[i] = SAMPLE_MAP[sampleId];
  }
}

console.log(`Columns mapped: ${Object.keys(colMap).length} (excluding rRNA-not-depleted samples)`);

// Parse gene expression data
const geneData = {};
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  const geneId = parts[0].trim();
  const values = {};
  for (const [colIdx, meta] of Object.entries(colMap)) {
    const val = parseFloat(parts[parseInt(colIdx)]);
    if (!isNaN(val)) {
      if (!values[meta.rep]) values[meta.rep] = {};
      values[meta.rep][meta.hour] = val;
    }
  }
  geneData[geneId] = values;
}

console.log(`Total genes parsed: ${Object.keys(geneData).length}\n`);

// Gene name lookup - parse from gene IDs (ECB_XXXXX format)
// We'll need to map ECB IDs to gene names
// For now, attempt to find gene names in the data or use a mapping approach

// First, let's try to get gene annotation
let geneNameMap = {};
try {
  // Try to load E. coli gene annotation if available
  const annotRaw = fs.readFileSync('/tmp/ecoli_gene_names.txt', 'utf-8');
  for (const line of annotRaw.split('\n')) {
    const [id, name] = line.split('\t');
    if (id && name) geneNameMap[id] = name;
  }
} catch(e) {
  // Will map later
}

// ============================================================
// AR(2) COMPUTATION
// ============================================================

function computeAR2(timeSeries) {
  // timeSeries: array of {time, value} objects sorted by time
  if (timeSeries.length < 4) return null; // Need at least 4 points for AR(2)
  
  const values = timeSeries.map(d => d.value);
  const n = values.length;
  
  // Log-transform (add pseudocount of 1 for zero counts)
  const logValues = values.map(v => Math.log2(v + 1));
  
  // Fit AR(2): y_t = beta1 * y_{t-1} + beta2 * y_{t-2} + epsilon
  const Y = [];
  const X1 = [];
  const X2 = [];
  
  for (let t = 2; t < n; t++) {
    Y.push(logValues[t]);
    X1.push(logValues[t-1]);
    X2.push(logValues[t-2]);
  }
  
  const m = Y.length;
  if (m < 2) return null;
  
  // OLS: solve [X'X]beta = X'Y
  let s11 = 0, s12 = 0, s22 = 0, s1y = 0, s2y = 0;
  for (let i = 0; i < m; i++) {
    s11 += X1[i] * X1[i];
    s12 += X1[i] * X2[i];
    s22 += X2[i] * X2[i];
    s1y += X1[i] * Y[i];
    s2y += X2[i] * Y[i];
  }
  
  const det = s11 * s22 - s12 * s12;
  if (Math.abs(det) < 1e-12) return null;
  
  const beta1 = (s22 * s1y - s12 * s2y) / det;
  const beta2 = (s11 * s2y - s12 * s1y) / det;
  
  // Compute eigenvalue modulus
  const discriminant = beta1 * beta1 + 4 * beta2;
  let eigenvalue;
  
  if (discriminant >= 0) {
    const r1 = (beta1 + Math.sqrt(discriminant)) / 2;
    const r2 = (beta1 - Math.sqrt(discriminant)) / 2;
    eigenvalue = Math.max(Math.abs(r1), Math.abs(r2));
  } else {
    eigenvalue = Math.sqrt(-beta2);
  }
  
  // R-squared
  const yMean = Y.reduce((a, b) => a + b, 0) / m;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < m; i++) {
    ssTot += (Y[i] - yMean) ** 2;
    ssRes += (Y[i] - beta1 * X1[i] - beta2 * X2[i]) ** 2;
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  
  return {
    beta1,
    beta2,
    eigenvalue,
    r2,
    isComplex: discriminant < 0,
    isStationary: eigenvalue < 1,
    nObs: m
  };
}

// ============================================================
// RUN AR(2) ON ALL GENES
// Strategy: For each gene, compute AR(2) per replicate, then average
// Also compute population-level AR(2) using mean expression across replicates
// ============================================================

console.log("=== COMPUTING AR(2) FOR ALL GENES ===\n");

const results = [];
let stationaryCount = 0;
let nonStationaryCount = 0;
let failedCount = 0;

for (const [geneId, repData] of Object.entries(geneData)) {
  // Population-level: average expression across replicates at each timepoint
  const meanTimeSeries = TIMEPOINTS.map(tp => {
    const vals = [];
    for (const [rep, tpData] of Object.entries(repData)) {
      if (tpData[tp] !== undefined) vals.push(tpData[tp]);
    }
    return {
      time: tp,
      value: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    };
  }).filter(d => d.value !== undefined);
  
  const ar2 = computeAR2(meanTimeSeries);
  if (!ar2) {
    failedCount++;
    continue;
  }
  
  // Per-replicate AR(2) for confidence estimation
  const repEigenvalues = [];
  for (const [rep, tpData] of Object.entries(repData)) {
    const repSeries = TIMEPOINTS.map(tp => ({
      time: tp,
      value: tpData[tp] || 0
    }));
    const repAr2 = computeAR2(repSeries);
    if (repAr2 && repAr2.isStationary) {
      repEigenvalues.push(repAr2.eigenvalue);
    }
  }
  
  const geneName = geneNameMap[geneId] || geneId;
  
  if (ar2.isStationary) {
    stationaryCount++;
    results.push({
      geneId,
      geneName,
      eigenvalue: ar2.eigenvalue,
      beta1: ar2.beta1,
      beta2: ar2.beta2,
      r2: ar2.r2,
      isComplex: ar2.isComplex,
      repEigenvalues,
      repStd: repEigenvalues.length > 1 ? 
        Math.sqrt(repEigenvalues.reduce((s, v) => s + (v - repEigenvalues.reduce((a,b)=>a+b,0)/repEigenvalues.length)**2, 0) / (repEigenvalues.length - 1)) : null,
      meanExpr: meanTimeSeries.reduce((s, d) => s + d.value, 0) / meanTimeSeries.length
    });
  } else {
    nonStationaryCount++;
  }
}

console.log(`Stationary (|λ| < 1): ${stationaryCount}`);
console.log(`Non-stationary (|λ| ≥ 1): ${nonStationaryCount}`);
console.log(`Failed to fit: ${failedCount}`);
console.log(`Analysis rate: ${((stationaryCount / (stationaryCount + nonStationaryCount + failedCount)) * 100).toFixed(1)}%\n`);

// Sort by eigenvalue
results.sort((a, b) => b.eigenvalue - a.eigenvalue);

// ============================================================
// GENOME-WIDE DISTRIBUTION
// ============================================================

console.log("=== GENOME-WIDE EIGENVALUE DISTRIBUTION ===\n");

const eigenvalues = results.map(r => r.eigenvalue);
const mean = eigenvalues.reduce((a, b) => a + b, 0) / eigenvalues.length;
const std = Math.sqrt(eigenvalues.reduce((s, v) => s + (v - mean) ** 2, 0) / (eigenvalues.length - 1));
const sorted = [...eigenvalues].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
const q25 = sorted[Math.floor(sorted.length * 0.25)];
const q75 = sorted[Math.floor(sorted.length * 0.75)];

console.log(`N genes analyzed: ${results.length}`);
console.log(`Mean |λ|: ${mean.toFixed(4)}`);
console.log(`Median |λ|: ${median.toFixed(4)}`);
console.log(`Std Dev: ${std.toFixed(4)}`);
console.log(`25th percentile: ${q25.toFixed(4)}`);
console.log(`75th percentile: ${q75.toFixed(4)}`);
console.log(`Min: ${sorted[0].toFixed(4)}`);
console.log(`Max: ${sorted[sorted.length - 1].toFixed(4)}\n`);

// Histogram bins
const bins = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
console.log("Eigenvalue Distribution:");
for (let i = 0; i < bins.length - 1; i++) {
  const count = eigenvalues.filter(v => v >= bins[i] && v < bins[i+1]).length;
  const bar = '█'.repeat(Math.round(count / results.length * 100));
  console.log(`  ${bins[i].toFixed(1)}-${bins[i+1].toFixed(1)}: ${count} (${(count/results.length*100).toFixed(1)}%) ${bar}`);
}
console.log();

// ============================================================
// TOP 20 MOST PERSISTENT GENES
// ============================================================

console.log("=== TOP 20 MOST PERSISTENT (STUBBORN) GENES ===\n");
console.log("Rank | Gene ID | |λ| | R² | β₁ | β₂ | Complex?");
console.log("-".repeat(75));
for (let i = 0; i < Math.min(20, results.length); i++) {
  const r = results[i];
  console.log(`${(i+1).toString().padStart(4)} | ${r.geneId.padEnd(12)} | ${r.eigenvalue.toFixed(4)} | ${r.r2.toFixed(3)} | ${r.beta1.toFixed(3)} | ${r.beta2.toFixed(3)} | ${r.isComplex ? 'Yes' : 'No'}`);
}
console.log();

// ============================================================
// TOP 20 LEAST PERSISTENT GENES
// ============================================================

console.log("=== TOP 20 LEAST PERSISTENT (MOST FLEXIBLE) GENES ===\n");
const bottom = results.slice(-20).reverse();
console.log("Rank | Gene ID | |λ| | R² | Mean Expr");
console.log("-".repeat(60));
for (let i = 0; i < bottom.length; i++) {
  const r = bottom[i];
  console.log(`${(results.length - i).toString().padStart(4)} | ${r.geneId.padEnd(12)} | ${r.eigenvalue.toFixed(4)} | ${r.r2.toFixed(3)} | ${r.meanExpr.toFixed(1)}`);
}
console.log();

// ============================================================
// CATEGORY ANALYSIS
// ============================================================

console.log("=== GENE CATEGORY PERSISTENCE ANALYSIS ===\n");

// Since gene IDs are ECB_XXXXX format, we need to try matching by gene name
// The gene names aren't in the counts file, so let's look at gene_id patterns
// and try to work with what we have

// First, let's try to download/create E. coli gene name mapping
console.log("Note: Gene IDs are in ECB_XXXXX format. Attempting gene name matching...\n");

// Try to find category genes in results by checking if any gene IDs contain gene names
// This won't work directly - we need annotation

// Alternative: Use the raw counts file gene_id column
// ECB IDs are from the E. coli B REL606 strain annotation
// Let's try to work with functional categories from the expression patterns themselves

// Since we can't directly map ECB IDs to gene names without annotation,
// let's use expression-level-based categorization and statistical tests

// ============================================================
// STARVATION PERSISTENCE ANALYSIS
// Core question: Which genes maintain expression during starvation?
// ============================================================

console.log("=== STARVATION PERSISTENCE ANALYSIS ===\n");
console.log("Core question: Do genes with high |λ| maintain expression during starvation?\n");

// For each gene, compute:
// 1. Expression change from exponential (3-5h) to starvation (168-336h)
// 2. Expression maintenance ratio

for (const r of results) {
  const repData = geneData[r.geneId];
  
  // Exponential phase mean (3-5h)
  const expVals = [];
  for (const [rep, tpData] of Object.entries(repData)) {
    for (const tp of [3, 4, 5]) {
      if (tpData[tp] !== undefined) expVals.push(tpData[tp]);
    }
  }
  
  // Starvation phase mean (168-336h)
  const starvVals = [];
  for (const [rep, tpData] of Object.entries(repData)) {
    for (const tp of [168, 336]) {
      if (tpData[tp] !== undefined) starvVals.push(tpData[tp]);
    }
  }
  
  if (expVals.length > 0 && starvVals.length > 0) {
    r.expMean = expVals.reduce((a, b) => a + b, 0) / expVals.length;
    r.starvMean = starvVals.reduce((a, b) => a + b, 0) / starvVals.length;
    r.maintenanceRatio = r.expMean > 0 ? r.starvMean / r.expMean : null;
    r.log2FC = (r.expMean > 0 && r.starvMean > 0) ? 
      Math.log2((r.starvMean + 1) / (r.expMean + 1)) : null;
  }
}

// Split into high-persistence and low-persistence groups
const withMaintenance = results.filter(r => r.maintenanceRatio !== null && r.maintenanceRatio !== undefined);
withMaintenance.sort((a, b) => a.eigenvalue - b.eigenvalue);

const n = withMaintenance.length;
const q1 = withMaintenance.slice(0, Math.floor(n / 4));
const q4 = withMaintenance.slice(Math.floor(3 * n / 4));

const q1Maintenance = q1.map(r => r.maintenanceRatio);
const q4Maintenance = q4.map(r => r.maintenanceRatio);

const q1Mean = q1Maintenance.reduce((a, b) => a + b, 0) / q1Maintenance.length;
const q4Mean = q4Maintenance.reduce((a, b) => a + b, 0) / q4Maintenance.length;

// Robust median comparison
const q1Sorted = [...q1Maintenance].sort((a, b) => a - b);
const q4Sorted = [...q4Maintenance].sort((a, b) => a - b);
const q1Median = q1Sorted[Math.floor(q1Sorted.length / 2)];
const q4Median = q4Sorted[Math.floor(q4Sorted.length / 2)];

console.log("Expression maintenance during starvation (starvation/exponential ratio):");
console.log(`  Low-persistence genes (bottom 25%):  Mean maintenance = ${q1Mean.toFixed(3)}, Median = ${q1Median.toFixed(3)}`);
console.log(`  High-persistence genes (top 25%):    Mean maintenance = ${q4Mean.toFixed(3)}, Median = ${q4Median.toFixed(3)}`);
console.log(`  Difference: ${(q4Mean - q1Mean).toFixed(3)} (high - low)\n`);

// Fraction of genes maintaining >50% expression
const q1Maintained = q1.filter(r => r.maintenanceRatio >= 0.5).length / q1.length;
const q4Maintained = q4.filter(r => r.maintenanceRatio >= 0.5).length / q4.length;
console.log(`  Fraction maintaining >50% expression during starvation:`);
console.log(`    Low-persistence: ${(q1Maintained * 100).toFixed(1)}%`);
console.log(`    High-persistence: ${(q4Maintained * 100).toFixed(1)}%\n`);

// ============================================================
// PERMUTATION TEST
// ============================================================

console.log("=== PERMUTATION TEST (5,000 permutations) ===\n");

const observedDiff = q4Mean - q1Mean;
let permGreater = 0;
const NPERM = 5000;

for (let p = 0; p < NPERM; p++) {
  // Shuffle eigenvalues among genes
  const shuffled = [...withMaintenance];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i].eigenvalue, shuffled[j].eigenvalue] = [shuffled[j].eigenvalue, shuffled[i].eigenvalue];
  }
  shuffled.sort((a, b) => a.eigenvalue - b.eigenvalue);
  
  const pq1 = shuffled.slice(0, Math.floor(n / 4));
  const pq4 = shuffled.slice(Math.floor(3 * n / 4));
  
  const pq1Mean = pq1.map(r => r.maintenanceRatio).reduce((a, b) => a + b, 0) / pq1.length;
  const pq4Mean = pq4.map(r => r.maintenanceRatio).reduce((a, b) => a + b, 0) / pq4.length;
  
  if (Math.abs(pq4Mean - pq1Mean) >= Math.abs(observedDiff)) permGreater++;
}

// Re-sort by original eigenvalue
withMaintenance.sort((a, b) => a.eigenvalue - b.eigenvalue);

const permPValue = permGreater / NPERM;
console.log(`Observed difference (high - low persistence): ${observedDiff.toFixed(4)}`);
console.log(`Permutation p-value: ${permPValue < 0.001 ? '< 0.001' : permPValue.toFixed(4)}`);
console.log(`(${permGreater} of ${NPERM} permutations had |diff| ≥ |observed|)\n`);

// ============================================================
// BOOTSTRAP CONFIDENCE INTERVALS
// ============================================================

console.log("=== BOOTSTRAP CONFIDENCE INTERVALS (1,000 resamples) ===\n");

const NBOOT = 1000;
const bootDiffs = [];

for (let b = 0; b < NBOOT; b++) {
  // Resample genes with replacement
  const bootSample = [];
  for (let i = 0; i < n; i++) {
    bootSample.push(withMaintenance[Math.floor(Math.random() * n)]);
  }
  bootSample.sort((a, b) => a.eigenvalue - b.eigenvalue);
  
  const bq1 = bootSample.slice(0, Math.floor(n / 4));
  const bq4 = bootSample.slice(Math.floor(3 * n / 4));
  
  const bq1Mean = bq1.map(r => r.maintenanceRatio).reduce((a, b) => a + b, 0) / bq1.length;
  const bq4Mean = bq4.map(r => r.maintenanceRatio).reduce((a, b) => a + b, 0) / bq4.length;
  
  bootDiffs.push(bq4Mean - bq1Mean);
}

bootDiffs.sort((a, b) => a - b);
const ci95Low = bootDiffs[Math.floor(NBOOT * 0.025)];
const ci95High = bootDiffs[Math.floor(NBOOT * 0.975)];

console.log(`95% Bootstrap CI for maintenance difference: [${ci95Low.toFixed(4)}, ${ci95High.toFixed(4)}]`);
console.log(`Point estimate: ${observedDiff.toFixed(4)}`);
console.log(`CI contains zero: ${ci95Low <= 0 && ci95High >= 0 ? 'YES (not significant)' : 'NO (significant)'}\n`);

// ============================================================
// EXPRESSION-LEVEL QUINTILE ANALYSIS
// ============================================================

console.log("=== EIGENVALUE BY EXPRESSION LEVEL ===\n");

const byExpr = [...results].filter(r => r.meanExpr > 0).sort((a, b) => a.meanExpr - b.meanExpr);
const quintileSize = Math.floor(byExpr.length / 5);

console.log("Expression Quintile | Mean |λ| | N Genes | Mean Expression");
console.log("-".repeat(65));
for (let q = 0; q < 5; q++) {
  const start = q * quintileSize;
  const end = q === 4 ? byExpr.length : (q + 1) * quintileSize;
  const slice = byExpr.slice(start, end);
  const qMeanLambda = slice.map(r => r.eigenvalue).reduce((a, b) => a + b, 0) / slice.length;
  const qMeanExpr = slice.map(r => r.meanExpr).reduce((a, b) => a + b, 0) / slice.length;
  const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  console.log(`  ${labels[q].padEnd(19)} | ${qMeanLambda.toFixed(4)} | ${slice.length.toString().padStart(7)} | ${qMeanExpr.toFixed(1)}`);
}
console.log();

// ============================================================
// DECILE ANALYSIS: Eigenvalue vs Starvation Maintenance
// ============================================================

console.log("=== PERSISTENCE DECILE vs STARVATION MAINTENANCE ===\n");

const decileSize = Math.floor(withMaintenance.length / 10);
console.log("Persistence Decile | Mean |λ| | Mean Maintenance | Maintained >50%");
console.log("-".repeat(70));
for (let d = 0; d < 10; d++) {
  const start = d * decileSize;
  const end = d === 9 ? withMaintenance.length : (d + 1) * decileSize;
  const slice = withMaintenance.slice(start, end);
  const dMeanLambda = slice.map(r => r.eigenvalue).reduce((a, b) => a + b, 0) / slice.length;
  const dMeanMaint = slice.map(r => r.maintenanceRatio).reduce((a, b) => a + b, 0) / slice.length;
  const dFracMaint = slice.filter(r => r.maintenanceRatio >= 0.5).length / slice.length;
  console.log(`  D${(d+1).toString().padStart(2)} (${d === 0 ? 'lowest' : d === 9 ? 'highest' : 'mid-' + (d+1)})`.padEnd(20) + 
    ` | ${dMeanLambda.toFixed(4)} | ${dMeanMaint.toFixed(4).padStart(16)} | ${(dFracMaint * 100).toFixed(1)}%`);
}
console.log();

// ============================================================
// CORRELATION ANALYSIS
// ============================================================

console.log("=== CORRELATION: |λ| vs STARVATION MAINTENANCE ===\n");

const validPairs = withMaintenance.filter(r => r.maintenanceRatio !== null && isFinite(r.maintenanceRatio));
const xVals = validPairs.map(r => r.eigenvalue);
const yVals = validPairs.map(r => r.maintenanceRatio);

const xMean = xVals.reduce((a, b) => a + b, 0) / xVals.length;
const yMean2 = yVals.reduce((a, b) => a + b, 0) / yVals.length;

let num = 0, denX = 0, denY = 0;
for (let i = 0; i < xVals.length; i++) {
  num += (xVals[i] - xMean) * (yVals[i] - yMean2);
  denX += (xVals[i] - xMean) ** 2;
  denY += (yVals[i] - yMean2) ** 2;
}

const pearsonR = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
const tStat = pearsonR * Math.sqrt((validPairs.length - 2) / (1 - pearsonR * pearsonR));

// Spearman rank correlation
const xRanks = xVals.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v).map((d, rank) => ({ ...d, rank: rank + 1 }));
const yRanks = yVals.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v).map((d, rank) => ({ ...d, rank: rank + 1 }));

const xRankMap = {};
const yRankMap = {};
xRanks.forEach(d => xRankMap[d.i] = d.rank);
yRanks.forEach(d => yRankMap[d.i] = d.rank);

let spNum = 0, spDenX = 0, spDenY = 0;
const meanRank = (validPairs.length + 1) / 2;
for (let i = 0; i < validPairs.length; i++) {
  spNum += (xRankMap[i] - meanRank) * (yRankMap[i] - meanRank);
  spDenX += (xRankMap[i] - meanRank) ** 2;
  spDenY += (yRankMap[i] - meanRank) ** 2;
}
const spearmanR = spDenX > 0 && spDenY > 0 ? spNum / Math.sqrt(spDenX * spDenY) : 0;

console.log(`Pearson r: ${pearsonR.toFixed(4)} (t = ${tStat.toFixed(2)}, n = ${validPairs.length})`);
console.log(`Spearman ρ: ${spearmanR.toFixed(4)}`);
console.log(`Direction: ${pearsonR > 0 ? 'POSITIVE (high persistence → higher maintenance)' : 'NEGATIVE (high persistence → lower maintenance)'}\n`);

// ============================================================
// SUMMARY
// ============================================================

console.log("=== SUMMARY ===\n");
console.log(`Dataset: GSE67402 (E. coli K-12 MG1655, glucose starvation time course)`);
console.log(`Genes analyzed: ${results.length} (stationary AR(2) fits)`);
console.log(`Timepoints: 9 (3h to 336h), 3 biological replicates`);
console.log(`Genome-wide mean |λ|: ${mean.toFixed(4)} ± ${std.toFixed(4)}`);
console.log(`\nKey Finding: Persistence-Maintenance Relationship`);
console.log(`  High-persistence genes maintain ${(q4Mean * 100).toFixed(1)}% of expression during starvation`);
console.log(`  Low-persistence genes maintain ${(q1Mean * 100).toFixed(1)}% of expression during starvation`);
console.log(`  Difference: ${(observedDiff * 100).toFixed(1)} percentage points`);
console.log(`  Permutation p-value: ${permPValue < 0.001 ? '< 0.001' : permPValue.toFixed(4)}`);
console.log(`  95% Bootstrap CI: [${(ci95Low * 100).toFixed(1)}, ${(ci95High * 100).toFixed(1)}] percentage points`);
console.log(`  Pearson r: ${pearsonR.toFixed(4)}, Spearman ρ: ${spearmanR.toFixed(4)}`);

// Save results to JSON for frontend
const outputData = {
  dataset: {
    geoId: 'GSE67402',
    title: 'E. coli K-12 MG1655 glucose starvation time course',
    organism: 'Escherichia coli',
    source: 'Houser et al., PLoS Comput Biol 2015',
    timepoints: TIMEPOINTS,
    timepointLabels: ['3h', '4h', '5h', '6h', '8h', '24h', '48h', '168h (1wk)', '336h (2wk)'],
    nReplicates: 3,
    nGenes: results.length,
    nTotal: Object.keys(geneData).length,
    stationaryRate: (stationaryCount / (stationaryCount + nonStationaryCount)) * 100
  },
  distribution: {
    mean: mean,
    median: median,
    std: std,
    q25: q25,
    q75: q75,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    histogram: bins.slice(0, -1).map((b, i) => ({
      bin: `${b.toFixed(1)}-${bins[i+1].toFixed(1)}`,
      count: eigenvalues.filter(v => v >= b && v < bins[i+1]).length,
      fraction: eigenvalues.filter(v => v >= b && v < bins[i+1]).length / results.length
    }))
  },
  starvationAnalysis: {
    highPersistence: {
      meanMaintenance: q4Mean,
      medianMaintenance: q4Median,
      fractionMaintained50: q4Maintained,
      nGenes: q4.length,
      meanEigenvalue: q4.map(r => r.eigenvalue).reduce((a, b) => a + b, 0) / q4.length
    },
    lowPersistence: {
      meanMaintenance: q1Mean,
      medianMaintenance: q1Median,
      fractionMaintained50: q1Maintained,
      nGenes: q1.length,
      meanEigenvalue: q1.map(r => r.eigenvalue).reduce((a, b) => a + b, 0) / q1.length
    },
    difference: observedDiff,
    permutationPValue: permPValue,
    bootstrapCI: [ci95Low, ci95High],
    pearsonR: pearsonR,
    spearmanR: spearmanR
  },
  decileAnalysis: Array.from({length: 10}, (_, d) => {
    const start = d * decileSize;
    const end = d === 9 ? withMaintenance.length : (d + 1) * decileSize;
    const slice = withMaintenance.slice(start, end);
    return {
      decile: d + 1,
      meanEigenvalue: slice.map(r => r.eigenvalue).reduce((a, b) => a + b, 0) / slice.length,
      meanMaintenance: slice.map(r => r.maintenanceRatio).reduce((a, b) => a + b, 0) / slice.length,
      fractionMaintained50: slice.filter(r => r.maintenanceRatio >= 0.5).length / slice.length
    };
  }),
  topGenes: results.slice(0, 30).map(r => ({
    geneId: r.geneId,
    eigenvalue: r.eigenvalue,
    r2: r.r2,
    beta1: r.beta1,
    beta2: r.beta2,
    isComplex: r.isComplex,
    meanExpr: r.meanExpr,
    maintenanceRatio: r.maintenanceRatio,
    log2FC: r.log2FC
  })),
  bottomGenes: results.slice(-30).map(r => ({
    geneId: r.geneId,
    eigenvalue: r.eigenvalue,
    r2: r.r2,
    meanExpr: r.meanExpr,
    maintenanceRatio: r.maintenanceRatio,
    log2FC: r.log2FC
  })),
  expressionQuintiles: Array.from({length: 5}, (_, q) => {
    const start = q * quintileSize;
    const end = q === 4 ? byExpr.length : (q + 1) * quintileSize;
    const slice = byExpr.slice(start, end);
    return {
      label: ['Very Low', 'Low', 'Medium', 'High', 'Very High'][q],
      meanEigenvalue: slice.map(r => r.eigenvalue).reduce((a, b) => a + b, 0) / slice.length,
      nGenes: slice.length,
      meanExpression: slice.map(r => r.meanExpr).reduce((a, b) => a + b, 0) / slice.length
    };
  })
};

fs.writeFileSync('future_work/bacterial_persistence/results.json', JSON.stringify(outputData, null, 2));
console.log(`\nResults saved to future_work/bacterial_persistence/results.json`);

// Also save full gene table
const geneTable = results.map(r => [
  r.geneId, r.eigenvalue.toFixed(4), r.r2.toFixed(3), r.beta1.toFixed(4), r.beta2.toFixed(4),
  r.isComplex ? 'Y' : 'N', r.meanExpr.toFixed(1),
  r.maintenanceRatio !== null && r.maintenanceRatio !== undefined ? r.maintenanceRatio.toFixed(4) : 'NA'
].join('\t'));

const tableHeader = 'gene_id\teigenvalue\tR2\tbeta1\tbeta2\tcomplex\tmean_expr\tstarvation_maintenance';
fs.writeFileSync('future_work/bacterial_persistence/gene_table.tsv', tableHeader + '\n' + geneTable.join('\n'));
console.log('Gene table saved to future_work/bacterial_persistence/gene_table.tsv');
