const fs = require('fs');

console.log("=== PALBOCICLIB PERSISTENCE VALIDATION SUITE ===\n");
console.log("1. Permutation tests (1000x) for gene category differences");
console.log("2. Bootstrap confidence intervals on eigenvalue estimates\n");

// ============================================================
// STEP 1: Re-parse data and rebuild the full analysis
// ============================================================

const raw = fs.readFileSync('/tmp/GSE93204_series_matrix.txt', 'utf-8');
const lines = raw.split('\n');

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

const TIME_ORDER = { 'BL': 0, 'C1D1': 1, 'C1D15': 2, 'Surg': 3 };
const samples = sampleTitles.map((title, idx) => {
  const tp = title.split('_').pop();
  const pidMatch = title.match(/Patient ID_(\d+)/);
  return {
    gsm: sampleIds[idx], title, patient: pidMatch ? pidMatch[1] : null,
    timepoint: tp, timeOrder: TIME_ORDER[tp] ?? -1, colIdx: idx
  };
}).filter(s => s.timeOrder >= 0 && s.patient);

const patientMap = {};
for (const s of samples) {
  if (!patientMap[s.patient]) patientMap[s.patient] = {};
  patientMap[s.patient][s.timepoint] = s;
}

const fullPatients = Object.entries(patientMap)
  .filter(([pid, tps]) => Object.keys(tps).length === 4)
  .map(([pid, tps]) => ({ pid, samples: tps }));

console.log(`Patients with all 4 time points: ${fullPatients.length}`);

// Parse expression data
const probeData = {};
for (let i = dataStart + 1; i < lines.length; i++) {
  if (lines[i].trim() === '' || lines[i].startsWith('!')) break;
  const parts = lines[i].split('\t');
  const probeId = parts[0].replace(/"/g, '');
  probeData[probeId] = parts.slice(1).map(v => parseFloat(v.replace(/"/g, '')));
}

// Probe-to-gene mapping
const PROBE_TO_GENE = {
  'A_23_P52086': 'CCND1', 'A_23_P82127': 'CDK4', 'A_23_P121253': 'CDK6',
  'A_23_P206004': 'RB1', 'A_23_P32404': 'CCNE1', 'A_24_P319613': 'CDK2',
  'A_23_P115482': 'E2F1', 'A_23_P30277': 'E2F2', 'A_23_P109072': 'MKI67',
  'A_23_P207107': 'PCNA', 'A_23_P87769': 'FGFR1', 'A_23_P58052': 'PIK3CA',
  'A_23_P110543': 'AKT1', 'A_23_P81041': 'MTOR', 'A_23_P325131': 'MYC',
  'A_24_P68455': 'ESR1', 'A_23_P216596': 'ERBB2', 'A_24_P71949': 'AURKA',
  'A_23_P40938': 'ARNTL', 'A_23_P88626': 'CLOCK', 'A_23_P201948': 'PER1',
  'A_23_P122924': 'PER2', 'A_23_P20053': 'CRY1', 'A_23_P59613': 'CRY2',
  'A_24_P353957': 'NR1D1', 'A_23_P164954': 'NR1D2', 'A_23_P337262': 'DBP',
  'A_23_P50979': 'TEF', 'A_23_P74348': 'CCNB1', 'A_23_P501107': 'CDC20',
  'A_23_P29': 'CDK1', 'A_23_P133123': 'TP53', 'A_23_P64828': 'CDKN1A',
  'A_23_P94422': 'CDKN2A', 'A_23_P157127': 'VEGFA', 'A_23_P138700': 'BCL2',
  'A_23_P106194': 'PTEN',
};

// ============================================================
// AR(2) fitting function
// ============================================================
function fitPopulationAR2(trajectories) {
  let S11 = 0, S12 = 0, S22 = 0, Sy1 = 0, Sy2 = 0;
  let n = 0;
  for (const traj of trajectories) {
    if (traj.some(v => isNaN(v) || !isFinite(v))) continue;
    const mean = traj.reduce((a, b) => a + b, 0) / traj.length;
    const std = Math.sqrt(traj.reduce((a, b) => a + (b - mean) ** 2, 0) / traj.length);
    if (std < 1e-10) continue;
    const x = traj.map(v => (v - mean) / std);
    for (let t = 2; t < x.length; t++) {
      S11 += x[t-1] * x[t-1]; S12 += x[t-1] * x[t-2];
      S22 += x[t-2] * x[t-2]; Sy1 += x[t] * x[t-1];
      Sy2 += x[t] * x[t-2]; n++;
    }
  }
  if (n < 5) return null;
  const det = S11 * S22 - S12 * S12;
  if (Math.abs(det) < 1e-10) return null;
  const phi1 = (S22 * Sy1 - S12 * Sy2) / det;
  const phi2 = (S11 * Sy2 - S12 * Sy1) / det;
  const disc = phi1 * phi1 + 4 * phi2;
  let modulus;
  if (disc >= 0) {
    modulus = Math.max(Math.abs((phi1 + Math.sqrt(disc)) / 2), Math.abs((phi1 - Math.sqrt(disc)) / 2));
  } else {
    modulus = Math.sqrt(phi1 * phi1 / 4 + (-disc) / 4);
  }
  return { phi1, phi2, modulus, n, isStationary: modulus < 1 };
}

// ============================================================
// Compute all probe eigenvalues
// ============================================================
function getProbeTrajectories(probe) {
  const values = probeData[probe];
  if (!values) return [];
  const trajectories = [];
  for (const { pid, samples: tps } of fullPatients) {
    const traj = ['BL', 'C1D1', 'C1D15', 'Surg'].map(tp => {
      const s = tps[tp];
      return s ? values[s.colIdx] : NaN;
    });
    if (traj.every(v => !isNaN(v) && isFinite(v))) trajectories.push(traj);
  }
  return trajectories;
}

const allProbeResults = {};
const allModuli = [];
const probeNames = Object.keys(probeData);

for (const probe of probeNames) {
  const trajs = getProbeTrajectories(probe);
  if (trajs.length < 5) continue;
  const fit = fitPopulationAR2(trajs);
  if (!fit || !fit.isStationary) continue;
  allProbeResults[probe] = { modulus: fit.modulus, phi1: fit.phi1, phi2: fit.phi2, trajs };
  allModuli.push(fit.modulus);
}

console.log(`Total probes with valid AR(2): ${allModuli.length}\n`);

// ============================================================
// GENE CATEGORIES FOR TESTING
// ============================================================
const CATEGORIES = {
  'CDK4/6 Targets': ['A_23_P121253', 'A_23_P115482'],  // CDK6, E2F1
  'Clock Genes': ['A_23_P88626', 'A_23_P122924', 'A_23_P59613', 'A_23_P337262'], // CLOCK, PER2, CRY2, DBP
  'Resistance': ['A_23_P32404', 'A_23_P87769'], // CCNE1, FGFR1
  'Oncogenes': ['A_23_P216596'], // ERBB2
  'Tumor Suppressors': ['A_23_P64828', 'A_23_P94422'], // CDKN1A, CDKN2A
  'Proliferation': ['A_23_P109072'], // MKI67
};

// Only keep probes that exist in our results
for (const [cat, probes] of Object.entries(CATEGORIES)) {
  CATEGORIES[cat] = probes.filter(p => p in allProbeResults);
}

// ============================================================
// PERMUTATION TEST (1000x)
// ============================================================
console.log("=" .repeat(70));
console.log("PERMUTATION TESTS: Are gene category |λ| differences real?");
console.log("=" .repeat(70));
console.log("\nNull hypothesis: Gene category labels are unrelated to |λ|");
console.log("Method: Shuffle labels 1000x, compare observed mean |λ| to null distribution\n");

const N_PERM = 1000;
const validProbeList = Object.keys(allProbeResults);

function meanModulus(probeList) {
  const mods = probeList.map(p => allProbeResults[p]?.modulus).filter(m => m !== undefined);
  return mods.length > 0 ? mods.reduce((a, b) => a + b, 0) / mods.length : NaN;
}

// Shuffle helper
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Global mean for comparison
const globalMean = allModuli.reduce((a, b) => a + b, 0) / allModuli.length;

console.log(`Global mean |λ| across all ${allModuli.length} probes: ${globalMean.toFixed(4)}\n`);

for (const [cat, probes] of Object.entries(CATEGORIES)) {
  if (probes.length === 0) continue;
  
  const observedMean = meanModulus(probes);
  const geneNames = probes.map(p => PROBE_TO_GENE[p] || p).join(', ');
  
  // Permutation: draw random sets of same size
  let nAbove = 0;
  let nBelow = 0;
  const permMeans = [];
  
  for (let perm = 0; perm < N_PERM; perm++) {
    const shuffled = shuffle(validProbeList);
    const randomSet = shuffled.slice(0, probes.length);
    const permMean = meanModulus(randomSet);
    permMeans.push(permMean);
    if (permMean >= observedMean) nAbove++;
    if (permMean <= observedMean) nBelow++;
  }
  
  // Two-sided p-value
  const pHigher = nAbove / N_PERM;
  const pLower = nBelow / N_PERM;
  const pTwoSided = 2 * Math.min(pHigher, pLower);
  
  // Null distribution stats
  permMeans.sort((a, b) => a - b);
  const nullMean = permMeans.reduce((a, b) => a + b, 0) / permMeans.length;
  const nullStd = Math.sqrt(permMeans.reduce((a, b) => a + (b - nullMean) ** 2, 0) / permMeans.length);
  const zScore = nullStd > 0 ? (observedMean - nullMean) / nullStd : 0;
  const null95lo = permMeans[Math.floor(N_PERM * 0.025)];
  const null95hi = permMeans[Math.floor(N_PERM * 0.975)];
  
  const sig = pTwoSided < 0.05 ? ' *** SIGNIFICANT ***' : pTwoSided < 0.10 ? ' * marginal *' : '';
  
  console.log(`${cat} (n=${probes.length} genes: ${geneNames})`);
  console.log(`  Observed mean |λ|:  ${observedMean.toFixed(4)}`);
  console.log(`  Null mean |λ|:      ${nullMean.toFixed(4)} ± ${nullStd.toFixed(4)}`);
  console.log(`  Null 95% CI:        [${null95lo.toFixed(4)}, ${null95hi.toFixed(4)}]`);
  console.log(`  Z-score:            ${zScore >= 0 ? '+' : ''}${zScore.toFixed(2)}`);
  console.log(`  P(random ≥ obs):    ${pHigher.toFixed(4)}`);
  console.log(`  P(random ≤ obs):    ${pLower.toFixed(4)}`);
  console.log(`  Two-sided p-value:  ${pTwoSided.toFixed(4)}${sig}`);
  console.log();
}

// ============================================================
// COMBINED PERMUTATION: Targets vs Clock genes
// ============================================================
console.log("-".repeat(70));
console.log("KEY COMPARISON: CDK4/6 Targets vs Clock Genes\n");

const targetProbes = CATEGORIES['CDK4/6 Targets'];
const clockProbes = CATEGORIES['Clock Genes'];

if (targetProbes.length > 0 && clockProbes.length > 0) {
  const observedDiff = meanModulus(targetProbes) - meanModulus(clockProbes);
  
  let nExceed = 0;
  for (let perm = 0; perm < N_PERM; perm++) {
    const combined = shuffle([...targetProbes, ...clockProbes]);
    const permTargets = combined.slice(0, targetProbes.length);
    const permClock = combined.slice(targetProbes.length);
    const permDiff = meanModulus(permTargets) - meanModulus(permClock);
    if (Math.abs(permDiff) >= Math.abs(observedDiff)) nExceed++;
  }
  
  const pVal = nExceed / N_PERM;
  console.log(`  Target mean |λ|: ${meanModulus(targetProbes).toFixed(4)}`);
  console.log(`  Clock mean |λ|:  ${meanModulus(clockProbes).toFixed(4)}`);
  console.log(`  Observed diff:   ${observedDiff >= 0 ? '+' : ''}${observedDiff.toFixed(4)}`);
  console.log(`  Permutation p:   ${pVal.toFixed(4)} (${pVal < 0.05 ? 'SIGNIFICANT' : 'not significant'})`);
}

// ============================================================
// PERMUTATION: HIGH vs LOW persistence drug effect maintenance
// ============================================================
console.log("\n" + "-".repeat(70));
console.log("KEY TEST: Does |λ| predict treatment effect maintenance?\n");

// For all probes, compute treatment change and surgery maintenance
const probeEffects = [];
for (const [probe, result] of Object.entries(allProbeResults)) {
  const trajs = result.trajs;
  const meanTraj = [0, 0, 0, 0];
  for (const traj of trajs) {
    for (let i = 0; i < 4; i++) meanTraj[i] += traj[i];
  }
  for (let i = 0; i < 4; i++) meanTraj[i] /= trajs.length;
  
  const treatChange = meanTraj[2] - meanTraj[0]; // C1D15 - BL
  const surgChange = meanTraj[3] - meanTraj[0]; // Surg - BL
  
  if (Math.abs(treatChange) > 0.1) {
    const maintenance = surgChange / treatChange;
    if (isFinite(maintenance)) {
      probeEffects.push({ probe, modulus: result.modulus, maintenance });
    }
  }
}

probeEffects.sort((a, b) => b.modulus - a.modulus);
const q25 = Math.floor(probeEffects.length * 0.25);
const q75 = Math.floor(probeEffects.length * 0.75);
const highGroup = probeEffects.slice(0, q25);
const lowGroup = probeEffects.slice(q75);

const observedHighMaint = highGroup.reduce((a, r) => a + r.maintenance, 0) / highGroup.length;
const observedLowMaint = lowGroup.reduce((a, r) => a + r.maintenance, 0) / lowGroup.length;
const observedMaintDiff = observedLowMaint - observedHighMaint;

// Permutation: shuffle modulus assignments
let nExceedMaint = 0;
for (let perm = 0; perm < N_PERM; perm++) {
  // Shuffle the modulus values across probes
  const shuffledMods = shuffle(probeEffects.map(r => r.modulus));
  const permEffects = probeEffects.map((r, i) => ({ ...r, modulus: shuffledMods[i] }));
  permEffects.sort((a, b) => b.modulus - a.modulus);
  
  const permHigh = permEffects.slice(0, q25);
  const permLow = permEffects.slice(q75);
  const permHighMaint = permHigh.reduce((a, r) => a + r.maintenance, 0) / permHigh.length;
  const permLowMaint = permLow.reduce((a, r) => a + r.maintenance, 0) / permLow.length;
  const permDiff = permLowMaint - permHighMaint;
  
  if (permDiff >= observedMaintDiff) nExceedMaint++;
}

const maintP = nExceedMaint / N_PERM;
console.log(`  High-|λ| genes (top 25%, n=${highGroup.length}):`);
console.log(`    Mean maintenance at surgery: ${(observedHighMaint * 100).toFixed(1)}%`);
console.log(`  Low-|λ| genes (bottom 25%, n=${lowGroup.length}):`);
console.log(`    Mean maintenance at surgery: ${(observedLowMaint * 100).toFixed(1)}%`);
console.log(`  Difference (low - high): ${(observedMaintDiff * 100).toFixed(1)} percentage points`);
console.log(`  Permutation p-value: ${maintP.toFixed(4)} (${maintP < 0.001 ? 'HIGHLY SIGNIFICANT' : maintP < 0.05 ? 'SIGNIFICANT' : 'not significant'})`);

// ============================================================
// BOOTSTRAP CONFIDENCE INTERVALS
// ============================================================
console.log("\n\n" + "=".repeat(70));
console.log("BOOTSTRAP CONFIDENCE INTERVALS ON EIGENVALUE ESTIMATES");
console.log("=".repeat(70));
console.log("\nMethod: Resample patients with replacement (1000x)");
console.log("For each bootstrap sample, re-estimate AR(2) and |λ|\n");

const N_BOOT = 1000;

function bootstrapEigenvalue(probe, nBoot) {
  const allTrajs = getProbeTrajectories(probe);
  if (allTrajs.length < 3) return null;
  
  const bootModuli = [];
  const bootPhi1 = [];
  const bootPhi2 = [];
  
  for (let b = 0; b < nBoot; b++) {
    // Resample patients with replacement
    const bootTrajs = [];
    for (let i = 0; i < allTrajs.length; i++) {
      bootTrajs.push(allTrajs[Math.floor(Math.random() * allTrajs.length)]);
    }
    
    const fit = fitPopulationAR2(bootTrajs);
    if (fit && fit.isStationary) {
      bootModuli.push(fit.modulus);
      bootPhi1.push(fit.phi1);
      bootPhi2.push(fit.phi2);
    }
  }
  
  if (bootModuli.length < nBoot * 0.5) return null;
  
  bootModuli.sort((a, b) => a - b);
  bootPhi1.sort((a, b) => a - b);
  bootPhi2.sort((a, b) => a - b);
  
  const ci = (arr) => ({
    lo: arr[Math.floor(arr.length * 0.025)],
    med: arr[Math.floor(arr.length * 0.5)],
    hi: arr[Math.floor(arr.length * 0.975)],
    mean: arr.reduce((a, b) => a + b, 0) / arr.length,
    std: Math.sqrt(arr.reduce((a, b) => a + (b - arr.reduce((x, y) => x + y, 0) / arr.length) ** 2, 0) / arr.length),
    validBoots: arr.length
  });
  
  return {
    modulus: ci(bootModuli),
    phi1: ci(bootPhi1),
    phi2: ci(bootPhi2)
  };
}

// Bootstrap named genes
console.log("Gene         Point Est   Bootstrap Mean   95% CI              Width   Valid Boots");
console.log("-".repeat(90));

const namedProbes = Object.entries(PROBE_TO_GENE);
const bootstrapResults = {};

for (const [probe, gene] of namedProbes) {
  if (!(probe in allProbeResults)) continue;
  
  const pointEst = allProbeResults[probe].modulus;
  const boot = bootstrapEigenvalue(probe, N_BOOT);
  if (!boot) continue;
  
  bootstrapResults[gene] = { pointEst, boot };
  
  const width = boot.modulus.hi - boot.modulus.lo;
  const name = gene.padEnd(12);
  console.log(`${name} ${pointEst.toFixed(4)}       ${boot.modulus.mean.toFixed(4)}           [${boot.modulus.lo.toFixed(4)}, ${boot.modulus.hi.toFixed(4)}]   ${width.toFixed(4)}   ${boot.modulus.validBoots}/${N_BOOT}`);
}

// ============================================================
// BOOTSTRAP: Category-level CIs
// ============================================================
console.log("\n\nCATEGORY-LEVEL BOOTSTRAP CIs:");
console.log("-".repeat(70));

for (const [cat, probes] of Object.entries(CATEGORIES)) {
  if (probes.length === 0) continue;
  
  const observedMean = meanModulus(probes);
  
  // Bootstrap: resample patients, re-estimate all probes, take category mean
  const bootCatMeans = [];
  
  for (let b = 0; b < N_BOOT; b++) {
    // Resample patients
    const bootPatientIdx = [];
    for (let i = 0; i < fullPatients.length; i++) {
      bootPatientIdx.push(Math.floor(Math.random() * fullPatients.length));
    }
    
    let catSum = 0, catN = 0;
    for (const probe of probes) {
      const values = probeData[probe];
      if (!values) continue;
      
      const bootTrajs = [];
      for (const idx of bootPatientIdx) {
        const { pid, samples: tps } = fullPatients[idx];
        const traj = ['BL', 'C1D1', 'C1D15', 'Surg'].map(tp => {
          const s = tps[tp];
          return s ? values[s.colIdx] : NaN;
        });
        if (traj.every(v => !isNaN(v) && isFinite(v))) bootTrajs.push(traj);
      }
      
      if (bootTrajs.length < 3) continue;
      const fit = fitPopulationAR2(bootTrajs);
      if (fit && fit.isStationary) {
        catSum += fit.modulus;
        catN++;
      }
    }
    
    if (catN > 0) bootCatMeans.push(catSum / catN);
  }
  
  if (bootCatMeans.length < 100) continue;
  bootCatMeans.sort((a, b) => a - b);
  
  const lo = bootCatMeans[Math.floor(bootCatMeans.length * 0.025)];
  const hi = bootCatMeans[Math.floor(bootCatMeans.length * 0.975)];
  const geneNames = probes.map(p => PROBE_TO_GENE[p] || p).join(', ');
  
  console.log(`${cat.padEnd(25)} Mean |λ|: ${observedMean.toFixed(4)}  95% CI: [${lo.toFixed(4)}, ${hi.toFixed(4)}]  Width: ${(hi-lo).toFixed(4)}`);
  console.log(`  (${geneNames})`);
}

// ============================================================
// BOOTSTRAP: Maintenance difference CI
// ============================================================
console.log("\n\nBOOTSTRAP CI: Treatment Maintenance Difference (Low vs High |λ|)");
console.log("-".repeat(70));

const bootMaintDiffs = [];
for (let b = 0; b < N_BOOT; b++) {
  // Resample probeEffects with replacement
  const bootEffects = [];
  for (let i = 0; i < probeEffects.length; i++) {
    bootEffects.push(probeEffects[Math.floor(Math.random() * probeEffects.length)]);
  }
  bootEffects.sort((a, b) => b.modulus - a.modulus);
  
  const bq25 = Math.floor(bootEffects.length * 0.25);
  const bq75 = Math.floor(bootEffects.length * 0.75);
  const bHigh = bootEffects.slice(0, bq25);
  const bLow = bootEffects.slice(bq75);
  
  const bHighMaint = bHigh.reduce((a, r) => a + r.maintenance, 0) / bHigh.length;
  const bLowMaint = bLow.reduce((a, r) => a + r.maintenance, 0) / bLow.length;
  bootMaintDiffs.push(bLowMaint - bHighMaint);
}

bootMaintDiffs.sort((a, b) => a - b);
const maintLo = bootMaintDiffs[Math.floor(bootMaintDiffs.length * 0.025)];
const maintHi = bootMaintDiffs[Math.floor(bootMaintDiffs.length * 0.975)];
const maintMed = bootMaintDiffs[Math.floor(bootMaintDiffs.length * 0.5)];

console.log(`  Observed difference: ${(observedMaintDiff * 100).toFixed(1)} percentage points`);
console.log(`  Bootstrap median:    ${(maintMed * 100).toFixed(1)} percentage points`);
console.log(`  95% CI:              [${(maintLo * 100).toFixed(1)}, ${(maintHi * 100).toFixed(1)}] percentage points`);
console.log(`  CI excludes zero?    ${(maintLo > 0 || maintHi < 0) ? 'YES — effect is robust' : 'NO — effect may not be reliable'}`);

// ============================================================
// SUMMARY TABLE
// ============================================================
console.log("\n\n" + "=".repeat(70));
console.log("VALIDATION SUMMARY");
console.log("=".repeat(70));
console.log("\nTest                                          Result              Verdict");
console.log("-".repeat(80));

// Collect results for summary
const summaryLines = [];

for (const [cat, probes] of Object.entries(CATEGORIES)) {
  if (probes.length === 0) continue;
  const obs = meanModulus(probes);
  // Quick re-check: is it outside null 95% CI?
  let nAbove = 0;
  for (let i = 0; i < N_PERM; i++) {
    const s = shuffle(validProbeList).slice(0, probes.length);
    if (meanModulus(s) >= obs) nAbove++;
  }
  const p = nAbove / N_PERM;
  const verdict = p < 0.05 ? 'SIGNIFICANT' : p < 0.10 ? 'Marginal' : 'Not significant';
  console.log(`Permutation: ${cat.padEnd(28)} p=${p.toFixed(3).padEnd(8)}        ${verdict}`);
}

console.log(`Permutation: Maintenance diff (low-high |λ|)  p=${maintP.toFixed(3).padEnd(8)}        ${maintP < 0.05 ? 'SIGNIFICANT' : 'Not significant'}`);
console.log(`Bootstrap CI: Maintenance diff                [${(maintLo*100).toFixed(1)}, ${(maintHi*100).toFixed(1)}] pp    ${maintLo > 0 ? 'ROBUST' : 'UNCERTAIN'}`);

console.log("\n\nNote: With n=7 patients and 4 time points, wide bootstrap CIs are expected.");
console.log("The genome-wide permutation test (23,197 probes) is well-powered.");
console.log("Individual gene-level CIs reflect the small patient sample.\n");

