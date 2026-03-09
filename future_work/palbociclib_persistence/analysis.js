const fs = require('fs');

// ============================================================
// PALBOCICLIB AR(2) PERSISTENCE ANALYSIS
// GSE93204: Breast cancer patients, 4 time points
// ============================================================

console.log("=== PALBOCICLIB PERSISTENCE ANALYSIS (GSE93204) ===\n");
console.log("Dataset: 46 breast cancer patients treated with palbociclib");
console.log("Time points: Baseline → C1D1 (anastrozole) → C1D15 (anastrozole+palbociclib) → Surgery\n");

// Parse the series matrix
const raw = fs.readFileSync('/tmp/GSE93204_series_matrix.txt', 'utf-8');
const lines = raw.split('\n');

// Extract sample metadata
let sampleIds = [];
let sampleTitles = [];
let dataStart = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('!Sample_geo_accession')) {
    sampleIds = lines[i].split('\t').slice(1).map(s => s.replace(/"/g, ''));
  }
  if (lines[i].startsWith('!Sample_title')) {
    sampleTitles = lines[i].split('\t').slice(1).map(s => s.replace(/"/g, ''));
  }
  if (lines[i].startsWith('"ID_REF"')) {
    dataStart = i;
    break;
  }
}

// Map samples to patients and time points
const TIME_ORDER = { 'BL': 0, 'C1D1': 1, 'C1D15': 2, 'Surg': 3 };
const samples = sampleTitles.map((title, idx) => {
  const parts = title.split('_');
  const tp = parts[parts.length - 1];
  const pidMatch = title.match(/Patient ID_(\d+)/);
  return {
    gsm: sampleIds[idx],
    title,
    patient: pidMatch ? pidMatch[1] : null,
    timepoint: tp,
    timeOrder: TIME_ORDER[tp] ?? -1,
    colIdx: idx
  };
}).filter(s => s.timeOrder >= 0 && s.patient);

// Find patients with ALL 4 time points
const patientMap = {};
for (const s of samples) {
  if (!patientMap[s.patient]) patientMap[s.patient] = {};
  patientMap[s.patient][s.timepoint] = s;
}

const fullPatients = Object.entries(patientMap)
  .filter(([pid, tps]) => Object.keys(tps).length === 4)
  .map(([pid, tps]) => ({ pid, samples: tps }));

console.log(`Patients with all 4 time points: ${fullPatients.length}`);
console.log(`Patient IDs: ${fullPatients.map(p => p.pid).join(', ')}\n`);

// Parse expression data
const probeData = {};
for (let i = dataStart + 1; i < lines.length; i++) {
  if (lines[i].trim() === '' || lines[i].startsWith('!')) break;
  const parts = lines[i].split('\t');
  const probeId = parts[0].replace(/"/g, '');
  const values = parts.slice(1).map(v => parseFloat(v.replace(/"/g, '')));
  probeData[probeId] = values;
}

console.log(`Total probes: ${Object.keys(probeData).length}\n`);

// ============================================================
// APPROACH: Cross-sectional AR(2)-inspired persistence analysis
// 
// With only 4 time points per patient, we can't fit a traditional
// AR(2) to individual patients. Instead, we use a POPULATION-LEVEL
// approach:
//
// For each gene, across all patients with 4 time points:
// 1. Collect the 4-point trajectories [BL, C1D1, C1D15, Surg]
// 2. Pool across patients to estimate population-level AR(2) coefficients
// 3. Compute eigenvalue modulus from pooled coefficients
//
// This tests: Does the POPULATION-LEVEL temporal structure of this
// gene's expression show persistence during palbociclib treatment?
// ============================================================

// Agilent probe → gene symbol mapping (key cancer/clock genes)
const PROBE_TO_GENE = {
  // CDK4/6 pathway targets (what palbociclib hits)
  'A_23_P52086': 'CCND1',   'A_23_P82127': 'CDK4',
  'A_23_P121253': 'CDK6',   'A_23_P206004': 'RB1',
  'A_23_P32404': 'CCNE1',   'A_24_P319613': 'CDK2',
  'A_23_P115482': 'E2F1',   'A_23_P30277': 'E2F2',
  'A_23_P109072': 'MKI67',  'A_23_P207107': 'PCNA',
  // Resistance pathways
  'A_23_P87769': 'FGFR1',   'A_23_P58052': 'PIK3CA',
  'A_23_P110543': 'AKT1',   'A_23_P81041': 'MTOR',
  'A_23_P325131': 'MYC',    'A_24_P68455': 'ESR1',
  'A_23_P216596': 'ERBB2',  'A_24_P71949': 'AURKA',
  // Clock genes
  'A_23_P40938': 'ARNTL',   'A_23_P88626': 'CLOCK',
  'A_23_P201948': 'PER1',   'A_23_P122924': 'PER2',
  'A_23_P20053': 'CRY1',    'A_23_P59613': 'CRY2',
  'A_24_P353957': 'NR1D1',  'A_23_P164954': 'NR1D2',
  'A_23_P337262': 'DBP',    'A_23_P50979': 'TEF',
  // Cell cycle
  'A_23_P74348': 'CCNB1',   'A_23_P501107': 'CDC20',
  'A_23_P29': 'CDK1',       'A_23_P133123': 'TP53',
  'A_23_P64828': 'CDKN1A',  'A_23_P94422': 'CDKN2A',
  // Growth/survival
  'A_23_P157127': 'VEGFA',  'A_23_P138700': 'BCL2',
  'A_23_P106194': 'PTEN',
};

// Instead of relying on probe-to-gene mapping (which may be incomplete),
// let's analyze ALL probes with a population-level approach

function fitPopulationAR2(trajectories) {
  // trajectories: array of [x0, x1, x2, x3] arrays (4 time points per patient)
  // Pool all patients to estimate AR(2): x(t) = phi1*x(t-1) + phi2*x(t-2) + e
  
  let S11 = 0, S12 = 0, S22 = 0, Sy1 = 0, Sy2 = 0;
  let n = 0;
  
  for (const traj of trajectories) {
    if (traj.some(v => isNaN(v) || !isFinite(v))) continue;
    
    // Standardize each trajectory
    const mean = traj.reduce((a, b) => a + b, 0) / traj.length;
    const std = Math.sqrt(traj.reduce((a, b) => a + (b - mean) ** 2, 0) / traj.length);
    if (std < 1e-10) continue;
    const x = traj.map(v => (v - mean) / std);
    
    // Add to pooled regression (t=2,3 for AR(2) with lags t-1, t-2)
    for (let t = 2; t < x.length; t++) {
      S11 += x[t-1] * x[t-1];
      S12 += x[t-1] * x[t-2];
      S22 += x[t-2] * x[t-2];
      Sy1 += x[t] * x[t-1];
      Sy2 += x[t] * x[t-2];
      n++;
    }
  }
  
  if (n < 5) return null;
  
  const det = S11 * S22 - S12 * S12;
  if (Math.abs(det) < 1e-10) return null;
  
  const phi1 = (S22 * Sy1 - S12 * Sy2) / det;
  const phi2 = (S11 * Sy2 - S12 * Sy1) / det;
  
  // Eigenvalue modulus
  const disc = phi1 * phi1 + 4 * phi2;
  let modulus;
  if (disc >= 0) {
    modulus = Math.max(Math.abs((phi1 + Math.sqrt(disc)) / 2), Math.abs((phi1 - Math.sqrt(disc)) / 2));
  } else {
    modulus = Math.sqrt(phi1 * phi1 / 4 + (-disc) / 4);
  }
  
  // R-squared
  let ssRes = 0, ssTot = 0;
  for (const traj of trajectories) {
    if (traj.some(v => isNaN(v) || !isFinite(v))) continue;
    const mean = traj.reduce((a, b) => a + b, 0) / traj.length;
    const std = Math.sqrt(traj.reduce((a, b) => a + (b - mean) ** 2, 0) / traj.length);
    if (std < 1e-10) continue;
    const x = traj.map(v => (v - mean) / std);
    for (let t = 2; t < x.length; t++) {
      const pred = phi1 * x[t-1] + phi2 * x[t-2];
      ssRes += (x[t] - pred) ** 2;
      ssTot += x[t] * x[t];
    }
  }
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  
  return { phi1, phi2, modulus, r2, n, isStationary: modulus < 1 };
}

// Build trajectories for each probe
const probeResults = [];
const probeNames = Object.keys(probeData);

for (const probe of probeNames) {
  const values = probeData[probe];
  const trajectories = [];
  
  for (const { pid, samples: tps } of fullPatients) {
    const traj = ['BL', 'C1D1', 'C1D15', 'Surg'].map(tp => {
      const s = tps[tp];
      return s ? values[s.colIdx] : NaN;
    });
    if (traj.every(v => !isNaN(v) && isFinite(v))) {
      trajectories.push(traj);
    }
  }
  
  if (trajectories.length < 5) continue;
  
  const fit = fitPopulationAR2(trajectories);
  if (!fit || !fit.isStationary) continue;
  
  const geneName = PROBE_TO_GENE[probe] || probe;
  
  // Compute mean trajectory across patients
  const meanTraj = [0, 0, 0, 0];
  for (const traj of trajectories) {
    for (let i = 0; i < 4; i++) meanTraj[i] += traj[i];
  }
  for (let i = 0; i < 4; i++) meanTraj[i] /= trajectories.length;
  
  // Direction of change during treatment
  const treatmentChange = meanTraj[2] - meanTraj[0]; // C1D15 vs Baseline
  const surgChange = meanTraj[3] - meanTraj[0]; // Surgery vs Baseline
  
  probeResults.push({
    probe, gene: geneName,
    modulus: fit.modulus,
    phi1: fit.phi1, phi2: fit.phi2,
    r2: fit.r2,
    nPatients: trajectories.length,
    meanTraj,
    treatmentChange,
    surgChange,
    isNamed: probe in PROBE_TO_GENE
  });
}

probeResults.sort((a, b) => b.modulus - a.modulus);

console.log(`\nProbes with valid stationary AR(2): ${probeResults.length}`);

// Summary statistics
const allMod = probeResults.map(r => r.modulus);
const meanMod = allMod.reduce((a, b) => a + b, 0) / allMod.length;
const medMod = allMod.sort((a, b) => a - b)[Math.floor(allMod.length / 2)];

console.log(`Mean |λ|: ${meanMod.toFixed(4)}`);
console.log(`Median |λ|: ${medMod.toFixed(4)}`);
console.log(`Range: ${Math.min(...allMod).toFixed(4)} — ${Math.max(...allMod).toFixed(4)}`);

// Distribution
const bins = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
console.log("\nEigenvalue distribution:");
for (let i = 0; i < bins.length - 1; i++) {
  const count = probeResults.filter(r => r.modulus >= bins[i] && r.modulus < bins[i+1]).length;
  const bar = '█'.repeat(Math.round(count / probeResults.length * 100));
  console.log(`  ${bins[i].toFixed(1)}-${bins[i+1].toFixed(1)}: ${count.toString().padStart(5)} ${bar}`);
}

// ============================================================
// KEY QUESTION: Do named cancer/clock genes cluster differently?
// ============================================================
console.log("\n\n=== NAMED GENE PERSISTENCE PROFILES ===\n");

const namedResults = probeResults.filter(r => r.isNamed).sort((a, b) => b.modulus - a.modulus);

console.log("Gene          |λ|    φ₁     φ₂     R²     BL→C1D15   BL→Surg   Trajectory");
console.log("-".repeat(100));

for (const r of namedResults) {
  const name = r.gene.padEnd(12);
  const trajDir = r.treatmentChange > 0.2 ? '↑ RISES' : r.treatmentChange < -0.2 ? '↓ DROPS' : '→ STABLE';
  const surgDir = r.surgChange > 0.2 ? '↑' : r.surgChange < -0.2 ? '↓' : '→';
  console.log(`${name}  ${r.modulus.toFixed(3)}  ${r.phi1 >= 0 ? '+' : ''}${r.phi1.toFixed(3)}  ${r.phi2 >= 0 ? '+' : ''}${r.phi2.toFixed(3)}  ${r.r2.toFixed(3)}  ${r.treatmentChange >= 0 ? '+' : ''}${r.treatmentChange.toFixed(3)}     ${r.surgChange >= 0 ? '+' : ''}${r.surgChange.toFixed(3)}     ${trajDir}`);
}

// Category analysis
console.log("\n\n=== CATEGORY PERSISTENCE COMPARISON ===\n");

const categories = {
  'CDK4/6 Targets (what drug hits)': ['CCND1', 'CDK4', 'CDK6', 'RB1', 'E2F1', 'E2F2'],
  'Proliferation markers': ['MKI67', 'PCNA', 'CCNB1', 'CDC20', 'CDK1'],
  'Resistance pathways': ['CCNE1', 'CDK2', 'FGFR1', 'PIK3CA', 'AKT1', 'MTOR', 'AURKA'],
  'Clock genes': ['ARNTL', 'CLOCK', 'PER1', 'PER2', 'CRY1', 'CRY2', 'NR1D1', 'NR1D2', 'DBP', 'TEF'],
  'Tumor suppressors': ['TP53', 'PTEN', 'CDKN1A', 'CDKN2A'],
  'Oncogenes': ['MYC', 'ESR1', 'ERBB2'],
};

for (const [cat, genes] of Object.entries(categories)) {
  const catRes = genes.map(g => namedResults.find(r => r.gene === g)).filter(Boolean);
  if (catRes.length === 0) continue;
  
  const meanLambda = catRes.reduce((a, r) => a + r.modulus, 0) / catRes.length;
  const meanChange = catRes.reduce((a, r) => a + r.treatmentChange, 0) / catRes.length;
  const geneList = catRes.map(r => `${r.gene}(${r.modulus.toFixed(2)})`).join(', ');
  
  console.log(`${cat.padEnd(35)} mean |λ|=${meanLambda.toFixed(3)}  mean Δ(treatment)=${meanChange >= 0 ? '+' : ''}${meanChange.toFixed(3)}`);
  console.log(`  Genes: ${geneList}`);
}

// ============================================================
// THE BIG TEST: Does persistence predict drug effect durability?
// ============================================================
console.log("\n\n=== PERSISTENCE vs TREATMENT RESPONSE ===\n");

// For each gene, compare its persistence with how much its expression
// changes during treatment and whether it bounces back at surgery

// High-persistence genes should:
// 1. Show SMALLER expression changes during treatment (they resist being moved)
// 2. Show MORE rebound at surgery (they snap back to baseline)
// 3. OR: If the drug successfully moves a high-persistence gene, the change
//    should PERSIST to surgery (because persistence works in both directions)

// Split probes into high and low persistence
const sortedByMod = [...probeResults].sort((a, b) => b.modulus - a.modulus);
const highPersist = sortedByMod.slice(0, Math.floor(sortedByMod.length * 0.25)); // Top 25%
const lowPersist = sortedByMod.slice(Math.floor(sortedByMod.length * 0.75)); // Bottom 25%

// Measure: Does treatment-induced change persist to surgery?
function persistenceOfChange(results) {
  let totalChange = 0;
  let totalRebound = 0;
  let n = 0;
  
  for (const r of results) {
    if (Math.abs(r.treatmentChange) < 0.1) continue; // Skip genes that barely changed
    const maintainedAtSurgery = r.surgChange / r.treatmentChange; // 1.0 = fully maintained, 0 = fully rebounded
    if (isFinite(maintainedAtSurgery) && !isNaN(maintainedAtSurgery)) {
      totalChange += Math.abs(r.treatmentChange);
      totalRebound += maintainedAtSurgery;
      n++;
    }
  }
  
  return {
    meanAbsChange: n > 0 ? totalChange / n : 0,
    meanMaintenanceRatio: n > 0 ? totalRebound / n : 0,
    n
  };
}

const highStats = persistenceOfChange(highPersist);
const lowStats = persistenceOfChange(lowPersist);

console.log("Does eigenvalue modulus predict whether drug effects persist to surgery?\n");
console.log(`HIGH persistence genes (top 25%, |λ| > ${highPersist[highPersist.length-1].modulus.toFixed(3)}):`);
console.log(`  Mean |treatment change|: ${highStats.meanAbsChange.toFixed(4)}`);
console.log(`  Change maintenance at surgery: ${(highStats.meanMaintenanceRatio * 100).toFixed(1)}%`);
console.log(`  (n=${highStats.n} genes with measurable change)\n`);

console.log(`LOW persistence genes (bottom 25%, |λ| < ${lowPersist[0].modulus.toFixed(3)}):`);
console.log(`  Mean |treatment change|: ${lowStats.meanAbsChange.toFixed(4)}`);
console.log(`  Change maintenance at surgery: ${(lowStats.meanMaintenanceRatio * 100).toFixed(1)}%`);
console.log(`  (n=${lowStats.n} genes with measurable change)\n`);

if (highStats.meanMaintenanceRatio > lowStats.meanMaintenanceRatio) {
  console.log("→ HIGH-persistence genes MAINTAIN treatment changes better at surgery");
} else {
  console.log("→ LOW-persistence genes maintain treatment changes better at surgery");
}

// ============================================================
// DRUG TARGET SPECIFIC: Do palbociclib's targets persist?
// ============================================================
console.log("\n\n=== PALBOCICLIB TARGET PERSISTENCE ===\n");

console.log("Key question: When palbociclib suppresses CDK4/6 pathway genes,");
console.log("does the suppression PERSIST to surgery (weeks later)?\n");

const targetGenes = ['CCND1', 'CDK4', 'CDK6', 'RB1', 'MKI67', 'PCNA', 'E2F1'];
const resistGenes = ['CCNE1', 'CDK2', 'FGFR1', 'PIK3CA', 'AKT1', 'AURKA'];

console.log("TARGETS (should be suppressed by drug):");
for (const g of targetGenes) {
  const r = namedResults.find(r => r.gene === g);
  if (!r) continue;
  const maintained = Math.abs(r.treatmentChange) > 0.05 ? 
    (r.surgChange / r.treatmentChange * 100).toFixed(0) : 'N/A';
  console.log(`  ${g.padEnd(10)} |λ|=${r.modulus.toFixed(3)}  BL→Treat: ${r.treatmentChange >= 0 ? '+' : ''}${r.treatmentChange.toFixed(3)}  BL→Surg: ${r.surgChange >= 0 ? '+' : ''}${r.surgChange.toFixed(3)}  Maintained: ${maintained}%`);
}

console.log("\nRESISTANCE ESCAPE ROUTES (may activate during/after treatment):");
for (const g of resistGenes) {
  const r = namedResults.find(r => r.gene === g);
  if (!r) continue;
  console.log(`  ${g.padEnd(10)} |λ|=${r.modulus.toFixed(3)}  BL→Treat: ${r.treatmentChange >= 0 ? '+' : ''}${r.treatmentChange.toFixed(3)}  BL→Surg: ${r.surgChange >= 0 ? '+' : ''}${r.surgChange.toFixed(3)}`);
}

// Clock gene dynamics during treatment
console.log("\nCLOCK GENES (do they survive palbociclib treatment?):");
const clockGenes = ['ARNTL', 'CLOCK', 'PER1', 'PER2', 'CRY1', 'CRY2', 'NR1D1', 'NR1D2'];
for (const g of clockGenes) {
  const r = namedResults.find(r => r.gene === g);
  if (!r) continue;
  console.log(`  ${g.padEnd(10)} |λ|=${r.modulus.toFixed(3)}  BL→Treat: ${r.treatmentChange >= 0 ? '+' : ''}${r.treatmentChange.toFixed(3)}  BL→Surg: ${r.surgChange >= 0 ? '+' : ''}${r.surgChange.toFixed(3)}`);
}

// ============================================================
// GENOME-WIDE: Top most persistent and least persistent
// ============================================================
console.log("\n\n=== TOP 20 MOST PERSISTENT GENES (TREATMENT-RESISTANT EXPRESSION) ===\n");
console.log("Gene/Probe        |λ|    φ₁     φ₂     Treatment Δ   Surgery Δ");
console.log("-".repeat(80));
for (let i = 0; i < Math.min(20, probeResults.length); i++) {
  const r = probeResults[i];
  const name = (r.isNamed ? r.gene : r.probe).padEnd(18);
  console.log(`${name} ${r.modulus.toFixed(3)}  ${r.phi1 >= 0 ? '+' : ''}${r.phi1.toFixed(3)}  ${r.phi2 >= 0 ? '+' : ''}${r.phi2.toFixed(3)}  ${r.treatmentChange >= 0 ? '+' : ''}${r.treatmentChange.toFixed(3)}       ${r.surgChange >= 0 ? '+' : ''}${r.surgChange.toFixed(3)}`);
}

console.log("\n\n=== TOP 20 LEAST PERSISTENT GENES (MOST RESPONSIVE TO TREATMENT) ===\n");
const bottom = [...probeResults].sort((a, b) => a.modulus - b.modulus);
console.log("Gene/Probe        |λ|    φ₁     φ₂     Treatment Δ   Surgery Δ");
console.log("-".repeat(80));
for (let i = 0; i < Math.min(20, bottom.length); i++) {
  const r = bottom[i];
  const name = (r.isNamed ? r.gene : r.probe).padEnd(18);
  console.log(`${name} ${r.modulus.toFixed(3)}  ${r.phi1 >= 0 ? '+' : ''}${r.phi1.toFixed(3)}  ${r.phi2 >= 0 ? '+' : ''}${r.phi2.toFixed(3)}  ${r.treatmentChange >= 0 ? '+' : ''}${r.treatmentChange.toFixed(3)}       ${r.surgChange >= 0 ? '+' : ''}${r.surgChange.toFixed(3)}`);
}

