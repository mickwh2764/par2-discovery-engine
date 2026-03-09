const fs = require('fs');

console.log("=== FULL PROBE ANNOTATION + RE-ANALYSIS ===\n");

// ============================================================
// STEP 1: Parse the GPL6480 annotation file
// ============================================================
const annotRaw = fs.readFileSync('/tmp/GPL6480.annot', 'utf-8');
const annotLines = annotRaw.split('\n');

const probeToGene = {};
let annotCount = 0;

for (const line of annotLines) {
  if (line.startsWith('#') || line.startsWith('!') || line.trim() === '') continue;
  const parts = line.split('\t');
  const probeId = parts[0]?.trim();
  const geneSymbol = parts[2]?.trim(); // Column 3 = Gene symbol
  if (probeId && geneSymbol && geneSymbol !== '' && geneSymbol !== '---') {
    probeToGene[probeId] = geneSymbol;
    annotCount++;
  }
}

console.log(`Annotated probes: ${annotCount} out of ${annotLines.length} lines`);

// ============================================================
// STEP 2: Re-parse expression data
// ============================================================
const raw = fs.readFileSync('/tmp/GSE93204_series_matrix.txt', 'utf-8');
const lines = raw.split('\n');

let sampleIds = [], sampleTitles = [], dataStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('!Sample_geo_accession'))
    sampleIds = lines[i].split('\t').slice(1).map(s => s.replace(/"/g, ''));
  if (lines[i].startsWith('!Sample_title'))
    sampleTitles = lines[i].split('\t').slice(1).map(s => s.replace(/"/g, ''));
  if (lines[i].startsWith('"ID_REF"')) { dataStart = i; break; }
}

const TIME_ORDER = { 'BL': 0, 'C1D1': 1, 'C1D15': 2, 'Surg': 3 };
const samples = sampleTitles.map((title, idx) => {
  const tp = title.split('_').pop();
  const pidMatch = title.match(/Patient ID_(\d+)/);
  return { gsm: sampleIds[idx], patient: pidMatch?.[1], timepoint: tp, timeOrder: TIME_ORDER[tp] ?? -1, colIdx: idx };
}).filter(s => s.timeOrder >= 0 && s.patient);

const patientMap = {};
for (const s of samples) {
  if (!patientMap[s.patient]) patientMap[s.patient] = {};
  patientMap[s.patient][s.timepoint] = s;
}
const fullPatients = Object.entries(patientMap)
  .filter(([pid, tps]) => Object.keys(tps).length === 4)
  .map(([pid, tps]) => ({ pid, samples: tps }));

const probeData = {};
for (let i = dataStart + 1; i < lines.length; i++) {
  if (lines[i].trim() === '' || lines[i].startsWith('!')) break;
  const parts = lines[i].split('\t');
  probeData[parts[0].replace(/"/g, '')] = parts.slice(1).map(v => parseFloat(v.replace(/"/g, '')));
}

console.log(`Patients with 4 timepoints: ${fullPatients.length}`);
console.log(`Total probes in expression data: ${Object.keys(probeData).length}`);

// Count how many expression probes now have gene names
let matched = 0;
for (const p of Object.keys(probeData)) {
  if (probeToGene[p]) matched++;
}
console.log(`Expression probes with gene annotation: ${matched} (${(matched/Object.keys(probeData).length*100).toFixed(1)}%)\n`);

// ============================================================
// STEP 3: AR(2) fitting
// ============================================================
function fitPopulationAR2(trajectories) {
  let S11=0,S12=0,S22=0,Sy1=0,Sy2=0,n=0;
  for (const traj of trajectories) {
    if (traj.some(v => isNaN(v)||!isFinite(v))) continue;
    const mean = traj.reduce((a,b)=>a+b,0)/traj.length;
    const std = Math.sqrt(traj.reduce((a,b)=>a+(b-mean)**2,0)/traj.length);
    if (std<1e-10) continue;
    const x = traj.map(v=>(v-mean)/std);
    for (let t=2;t<x.length;t++){
      S11+=x[t-1]*x[t-1];S12+=x[t-1]*x[t-2];S22+=x[t-2]*x[t-2];
      Sy1+=x[t]*x[t-1];Sy2+=x[t]*x[t-2];n++;
    }
  }
  if(n<5)return null;
  const det=S11*S22-S12*S12;
  if(Math.abs(det)<1e-10)return null;
  const phi1=(S22*Sy1-S12*Sy2)/det;
  const phi2=(S11*Sy2-S12*Sy1)/det;
  const disc=phi1*phi1+4*phi2;
  let modulus;
  if(disc>=0) modulus=Math.max(Math.abs((phi1+Math.sqrt(disc))/2),Math.abs((phi1-Math.sqrt(disc))/2));
  else modulus=Math.sqrt(phi1*phi1/4+(-disc)/4);
  return{phi1,phi2,modulus,n,isStationary:modulus<1};
}

// Compute for all probes
const allResults = [];
for (const probe of Object.keys(probeData)) {
  const values = probeData[probe];
  const trajs = [];
  for (const {pid, samples: tps} of fullPatients) {
    const traj = ['BL','C1D1','C1D15','Surg'].map(tp => {
      const s = tps[tp]; return s ? values[s.colIdx] : NaN;
    });
    if (traj.every(v=>!isNaN(v)&&isFinite(v))) trajs.push(traj);
  }
  if (trajs.length < 5) continue;
  const fit = fitPopulationAR2(trajs);
  if (!fit || !fit.isStationary) continue;

  const meanTraj = [0,0,0,0];
  for (const traj of trajs) { for(let i=0;i<4;i++) meanTraj[i]+=traj[i]; }
  for(let i=0;i<4;i++) meanTraj[i]/=trajs.length;

  allResults.push({
    probe, gene: probeToGene[probe] || null,
    modulus: fit.modulus, phi1: fit.phi1, phi2: fit.phi2,
    treatmentChange: meanTraj[2]-meanTraj[0],
    surgChange: meanTraj[3]-meanTraj[0],
    nPatients: trajs.length
  });
}

console.log(`Valid stationary AR(2) fits: ${allResults.length}`);
const annotatedResults = allResults.filter(r => r.gene !== null);
console.log(`With gene annotation: ${annotatedResults.length} (${(annotatedResults.length/allResults.length*100).toFixed(1)}%)\n`);

// ============================================================
// STEP 4: Build FULL gene-level categories using annotation
// ============================================================

// For genes with multiple probes, take the median |λ|
const geneModuli = {};
for (const r of annotatedResults) {
  if (!geneModuli[r.gene]) geneModuli[r.gene] = [];
  geneModuli[r.gene].push(r);
}

const geneMedian = {};
for (const [gene, results] of Object.entries(geneModuli)) {
  const mods = results.map(r => r.modulus).sort((a,b) => a-b);
  geneMedian[gene] = {
    modulus: mods[Math.floor(mods.length/2)],
    nProbes: mods.length,
    treatmentChange: results.reduce((a,r) => a+r.treatmentChange,0)/results.length,
    surgChange: results.reduce((a,r) => a+r.surgChange,0)/results.length
  };
}

console.log(`Unique genes with eigenvalue estimates: ${Object.keys(geneMedian).length}\n`);

// FULL biological categories
const CATEGORIES = {
  'Core Clock': ['ARNTL','ARNTL2','CLOCK','NPAS2','PER1','PER2','PER3','CRY1','CRY2','NR1D1','NR1D2','RORA','RORB','RORC','DBP','TEF','HLF','NFIL3','BHLHE40','BHLHE41','CIART','CSNK1D','CSNK1E','FBXL3','FBXW11'],
  'CDK4/6 Pathway': ['CDK4','CDK6','CCND1','CCND2','CCND3','RB1','RBL1','RBL2','E2F1','E2F2','E2F3','E2F4','E2F5','CDKN2A','CDKN2B','CDKN2C','CDKN2D','CDKN1A','CDKN1B','CDKN1C'],
  'Proliferation': ['MKI67','PCNA','MCM2','MCM3','MCM4','MCM5','MCM6','MCM7','TOP2A','CCNB1','CCNB2','CDC20','CDK1','BUB1','BUB1B','AURKA','AURKB','PLK1','CENPE','CENPF','TPX2','KIF11','BIRC5','TTK','CCNA2','FOXM1'],
  'CDK4/6i Resistance': ['CCNE1','CCNE2','CDK2','FGFR1','FGFR2','FGFR3','FGFR4','PIK3CA','PIK3CB','AKT1','AKT2','AKT3','MTOR','PTEN','TSC1','TSC2','RAS','KRAS','HRAS','NRAS','RAF1','BRAF','MAP2K1','MAPK1','MAPK3','MYC','MYCN'],
  'Estrogen Signaling': ['ESR1','ESR2','PGR','GATA3','FOXA1','TFF1','TFF3','AREG','GREB1','XBP1','AGR2','CA12','SLC44A4','PDZK1'],
  'Oncogenes': ['ERBB2','ERBB3','EGFR','MET','ROS1','ALK','RET','NTRK1','NTRK2','NTRK3','FLT3','KIT','PDGFRA','PDGFRB','IGF1R','SRC','ABL1','JAK2','STAT3'],
  'Tumor Suppressors': ['TP53','RB1','PTEN','BRCA1','BRCA2','APC','VHL','NF1','NF2','STK11','SMAD4','WT1','PTCH1','TSC1','TSC2','CDH1','BAP1','ARID1A','ATM','ATR','CHEK1','CHEK2'],
  'Apoptosis': ['BCL2','BCL2L1','MCL1','BAX','BAK1','BID','BAD','BIM','CASP3','CASP7','CASP8','CASP9','XIAP','BIRC5','APAF1','CYCS','TNFRSF10A','TNFRSF10B','FAS','FASLG'],
  'DNA Damage Repair': ['BRCA1','BRCA2','RAD51','ATM','ATR','CHEK1','CHEK2','PARP1','PARP2','XRCC1','MLH1','MSH2','MSH6','PMS2','ERCC1','XPA','XPC'],
  'Immune Markers': ['CD274','PDCD1','CTLA4','LAG3','TIGIT','HAVCR2','CD8A','CD8B','CD4','GZMA','GZMB','PRF1','IFNG','CXCL9','CXCL10','CXCL11','CD3D','CD3E','FOXP3','IL2RA'],
};

// ============================================================
// STEP 5: Category analysis with full gene sets
// ============================================================
console.log("=".repeat(70));
console.log("FULL-ANNOTATION CATEGORY ANALYSIS");
console.log("=".repeat(70));
console.log("\nCategory                    Genes Found   Mean |λ|   vs Global   Direction\n" + "-".repeat(75));

const globalMean = allResults.reduce((a,r) => a+r.modulus,0) / allResults.length;
console.log(`Global mean |λ| (all ${allResults.length} probes): ${globalMean.toFixed(4)}\n`);

const categoryStats = {};
for (const [cat, genes] of Object.entries(CATEGORIES)) {
  const found = genes.filter(g => geneMedian[g]);
  if (found.length === 0) continue;
  
  const meanMod = found.reduce((a,g) => a + geneMedian[g].modulus, 0) / found.length;
  const meanTreat = found.reduce((a,g) => a + geneMedian[g].treatmentChange, 0) / found.length;
  const dir = meanMod > globalMean ? 'ABOVE' : 'BELOW';
  
  categoryStats[cat] = { genes: found, meanMod, meanTreat };
  
  console.log(`${cat.padEnd(28)} ${found.length.toString().padStart(3)}/${genes.length.toString().padEnd(5)} ${meanMod.toFixed(4)}     ${meanMod > globalMean ? '+' : ''}${(meanMod-globalMean).toFixed(4)}    ${dir}`);
}

// Print individual genes for key categories
console.log("\n\n--- KEY CATEGORY DETAILS ---\n");
for (const cat of ['Core Clock', 'CDK4/6 Pathway', 'CDK4/6i Resistance', 'Proliferation', 'Oncogenes']) {
  const stats = categoryStats[cat];
  if (!stats) continue;
  console.log(`\n${cat} (mean |λ| = ${stats.meanMod.toFixed(4)}):`);
  const sorted = stats.genes.map(g => ({gene: g, ...geneMedian[g]})).sort((a,b) => b.modulus - a.modulus);
  for (const g of sorted) {
    const treatDir = g.treatmentChange > 0.2 ? '↑' : g.treatmentChange < -0.2 ? '↓' : '→';
    console.log(`  ${g.gene.padEnd(12)} |λ|=${g.modulus.toFixed(3)}  Δtreat=${g.treatmentChange>=0?'+':''}${g.treatmentChange.toFixed(3)} ${treatDir}  (${g.nProbes} probes)`);
  }
}

// ============================================================
// STEP 6: PERMUTATION TESTS WITH FULL GENE SETS
// ============================================================
console.log("\n\n" + "=".repeat(70));
console.log("PERMUTATION TESTS WITH FULL GENE SETS (5000 permutations)");
console.log("=".repeat(70));

const N_PERM = 5000;
const allGeneNames = Object.keys(geneMedian);

function shuffle(arr) {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;
}

console.log("\nCategory                    n    Obs |λ|   Null Mean   Z-score   p-value     Verdict");
console.log("-".repeat(95));

const permResults = {};

for (const [cat, stats] of Object.entries(categoryStats)) {
  const n = stats.genes.length;
  if (n < 2) continue;
  
  const obsMean = stats.meanMod;
  
  const permMeans = [];
  for (let p = 0; p < N_PERM; p++) {
    const randomGenes = shuffle(allGeneNames).slice(0, n);
    const permMean = randomGenes.reduce((a,g) => a + geneMedian[g].modulus, 0) / n;
    permMeans.push(permMean);
  }
  
  const nullMean = permMeans.reduce((a,b)=>a+b,0)/permMeans.length;
  const nullStd = Math.sqrt(permMeans.reduce((a,b)=>a+(b-nullMean)**2,0)/permMeans.length);
  const zScore = nullStd > 0 ? (obsMean - nullMean) / nullStd : 0;
  
  // One-sided p-values
  const pHigher = permMeans.filter(m => m >= obsMean).length / N_PERM;
  const pLower = permMeans.filter(m => m <= obsMean).length / N_PERM;
  const pTwoSided = 2 * Math.min(pHigher, pLower);
  
  let verdict;
  if (pTwoSided < 0.001) verdict = '*** HIGHLY SIG ***';
  else if (pTwoSided < 0.01) verdict = '** SIGNIFICANT **';
  else if (pTwoSided < 0.05) verdict = '* SIGNIFICANT *';
  else if (pTwoSided < 0.10) verdict = 'marginal';
  else verdict = 'not significant';
  
  permResults[cat] = { n, obsMean, nullMean, nullStd, zScore, pHigher, pLower, pTwoSided, verdict };
  
  console.log(`${cat.padEnd(28)} ${n.toString().padStart(3)}  ${obsMean.toFixed(4)}    ${nullMean.toFixed(4)}      ${zScore>=0?'+':''}${zScore.toFixed(2)}     ${pTwoSided.toFixed(4)}      ${verdict}`);
}

// ============================================================
// STEP 7: Pairwise category comparisons
// ============================================================
console.log("\n\n" + "=".repeat(70));
console.log("PAIRWISE CATEGORY COMPARISONS (5000 permutations)");
console.log("=".repeat(70));

const keyPairs = [
  ['CDK4/6 Pathway', 'Core Clock'],
  ['CDK4/6 Pathway', 'CDK4/6i Resistance'],
  ['Core Clock', 'CDK4/6i Resistance'],
  ['Oncogenes', 'Core Clock'],
  ['Proliferation', 'Core Clock'],
  ['Tumor Suppressors', 'Proliferation'],
  ['CDK4/6 Pathway', 'Proliferation'],
];

console.log("\nComparison                                 Diff      p-value    Verdict");
console.log("-".repeat(80));

for (const [catA, catB] of keyPairs) {
  const statsA = categoryStats[catA];
  const statsB = categoryStats[catB];
  if (!statsA || !statsB) continue;
  
  const obsDiff = statsA.meanMod - statsB.meanMod;
  const combined = [...statsA.genes, ...statsB.genes];
  
  let nExceed = 0;
  for (let p = 0; p < N_PERM; p++) {
    const shuffled = shuffle(combined);
    const permA = shuffled.slice(0, statsA.genes.length);
    const permB = shuffled.slice(statsA.genes.length);
    const permDiff = permA.reduce((a,g)=>a+geneMedian[g].modulus,0)/permA.length -
                     permB.reduce((a,g)=>a+geneMedian[g].modulus,0)/permB.length;
    if (Math.abs(permDiff) >= Math.abs(obsDiff)) nExceed++;
  }
  
  const pVal = nExceed / N_PERM;
  const verdict = pVal < 0.01 ? '** SIGNIFICANT **' : pVal < 0.05 ? '* SIGNIFICANT *' : pVal < 0.10 ? 'marginal' : 'not significant';
  
  const label = `${catA} vs ${catB}`;
  console.log(`${label.padEnd(43)} ${obsDiff>=0?'+':''}${obsDiff.toFixed(4)}    ${pVal.toFixed(4)}     ${verdict}`);
}

// ============================================================
// STEP 8: Bootstrap CIs for categories
// ============================================================
console.log("\n\n" + "=".repeat(70));
console.log("BOOTSTRAP 95% CIs FOR CATEGORIES (1000 resamples)");
console.log("=".repeat(70));

const N_BOOT = 1000;
console.log("\nCategory                    Mean |λ|   95% CI                Width");
console.log("-".repeat(70));

for (const [cat, stats] of Object.entries(categoryStats)) {
  if (stats.genes.length < 2) continue;
  
  // Bootstrap: resample patients
  const bootMeans = [];
  for (let b = 0; b < N_BOOT; b++) {
    const bootPatIdx = [];
    for (let i = 0; i < fullPatients.length; i++) {
      bootPatIdx.push(Math.floor(Math.random() * fullPatients.length));
    }
    
    let catSum = 0, catN = 0;
    for (const gene of stats.genes) {
      // Find all probes for this gene
      const geneProbes = annotatedResults.filter(r => r.gene === gene);
      const probeModuli = [];
      
      for (const gp of geneProbes) {
        const values = probeData[gp.probe];
        if (!values) continue;
        const bootTrajs = [];
        for (const idx of bootPatIdx) {
          const {pid, samples: tps} = fullPatients[idx];
          const traj = ['BL','C1D1','C1D15','Surg'].map(tp => {
            const s = tps[tp]; return s ? values[s.colIdx] : NaN;
          });
          if (traj.every(v=>!isNaN(v)&&isFinite(v))) bootTrajs.push(traj);
        }
        if (bootTrajs.length < 3) continue;
        const fit = fitPopulationAR2(bootTrajs);
        if (fit && fit.isStationary) probeModuli.push(fit.modulus);
      }
      
      if (probeModuli.length > 0) {
        probeModuli.sort((a,b)=>a-b);
        catSum += probeModuli[Math.floor(probeModuli.length/2)];
        catN++;
      }
    }
    
    if (catN > 0) bootMeans.push(catSum/catN);
  }
  
  if (bootMeans.length < 100) continue;
  bootMeans.sort((a,b)=>a-b);
  const lo = bootMeans[Math.floor(bootMeans.length*0.025)];
  const hi = bootMeans[Math.floor(bootMeans.length*0.975)];
  
  console.log(`${cat.padEnd(28)} ${stats.meanMod.toFixed(4)}     [${lo.toFixed(4)}, ${hi.toFixed(4)}]     ${(hi-lo).toFixed(4)}`);
}

// ============================================================
// STEP 9: Re-run maintenance analysis with gene names
// ============================================================
console.log("\n\n" + "=".repeat(70));
console.log("TREATMENT MAINTENANCE BY CATEGORY");
console.log("=".repeat(70));
console.log("\nFor genes changed by treatment (|Δ| > 0.1), what % of change persists to surgery?\n");

for (const [cat, stats] of Object.entries(categoryStats)) {
  const geneResults = stats.genes.map(g => ({gene: g, ...geneMedian[g]}));
  const changed = geneResults.filter(g => Math.abs(g.treatmentChange) > 0.1);
  if (changed.length < 2) continue;
  
  const maintenances = changed.map(g => g.surgChange / g.treatmentChange).filter(m => isFinite(m));
  if (maintenances.length < 2) continue;
  
  const meanMaint = maintenances.reduce((a,b)=>a+b,0)/maintenances.length;
  console.log(`${cat.padEnd(28)} ${changed.length.toString().padStart(3)} genes changed  Mean maintenance: ${(meanMaint*100).toFixed(1)}%`);
}

// ============================================================
// SUMMARY
// ============================================================
console.log("\n\n" + "=".repeat(70));
console.log("VALIDATION SUMMARY");
console.log("=".repeat(70));
console.log(`\nProbes annotated: ${annotatedResults.length}/${allResults.length} (${(annotatedResults.length/allResults.length*100).toFixed(1)}%)`);
console.log(`Unique genes: ${Object.keys(geneMedian).length}`);
console.log(`Global mean |λ|: ${globalMean.toFixed(4)}\n`);

console.log("Category                    Genes   Mean |λ|   Perm p     Bootstrap 95% CI        Pass?");
console.log("-".repeat(95));

for (const [cat, stats] of Object.entries(categoryStats)) {
  const perm = permResults[cat];
  if (!perm) continue;
  const pass = perm.pTwoSided < 0.05 ? 'YES' : perm.pTwoSided < 0.10 ? 'MARGINAL' : 'NO';
  console.log(`${cat.padEnd(28)} ${perm.n.toString().padStart(3)}     ${perm.obsMean.toFixed(4)}     ${perm.pTwoSided.toFixed(4)}     z=${perm.zScore>=0?'+':''}${perm.zScore.toFixed(2)}                    ${pass}`);
}

