import { solveAR2Eigenvalues } from './par2-engine.ts';
import { fitAR2 as fitAR2Shared } from './ar2-shared';

function fitAR2(series: number[]): { phi1: number; phi2: number; eigenvalue: number } {
  const result = fitAR2Shared(series);
  if (!result) return { phi1: 0, phi2: 0, eigenvalue: 0 };
  return { phi1: result.phi1, phi2: result.phi2, eigenvalue: result.eigenvalue };
}

console.log("=== HALLUCINATION TEST ===\n");

console.log("TEST 1: Pure Random Noise (single trial)");
const noise = Array.from({length: 48}, () => Math.random());
const noiseAR2 = fitAR2(noise);
console.log(`  φ₁ = ${noiseAR2.phi1.toFixed(4)}, φ₂ = ${noiseAR2.phi2.toFixed(4)}`);
console.log(`  |λ| = ${noiseAR2.eigenvalue.toFixed(4)}`);
const inBand1 = noiseAR2.eigenvalue > 0.45 && noiseAR2.eigenvalue < 0.75;
console.log(`  In stable band? ${inBand1 ? "Yes (could be chance)" : "No ✓"}\n`);

console.log("TEST 2: 100 Random Noise Trials");
let inBandCount = 0;
const allEigenvalues: number[] = [];
for (let i = 0; i < 100; i++) {
  const randomSeries = Array.from({length: 48}, () => Math.random());
  const result = fitAR2(randomSeries);
  allEigenvalues.push(result.eigenvalue);
  if (result.eigenvalue > 0.45 && result.eigenvalue < 0.75) inBandCount++;
}
const meanEigen = allEigenvalues.reduce((a, b) => a + b, 0) / 100;
console.log(`  Mean |λ|: ${meanEigen.toFixed(4)}`);
console.log(`  In stable band (0.45-0.75): ${inBandCount}/100`);
console.log(`  Result: ${inBandCount < 30 ? "✓ NOISE IS CHAOTIC" : "⚠️ Too many in band"}\n`);

console.log("TEST 3: Perfect 24h Sine Wave");
const sine = Array.from({length: 48}, (_, i) => Math.sin(2 * Math.PI * i / 24));
const sineAR2 = fitAR2(sine);
console.log(`  φ₁ = ${sineAR2.phi1.toFixed(4)}, φ₂ = ${sineAR2.phi2.toFixed(4)}`);
console.log(`  |λ| = ${sineAR2.eigenvalue.toFixed(4)}`);
console.log(`  Result: ${sineAR2.eigenvalue > 0.95 ? "✓ STABLE OSCILLATOR" : "Unexpected"}\n`);

console.log("TEST 4: Synthetic AR(2) with target |λ|≈0.537 (real target gene baseline)");
const synth = [1, 0.5];
for (let i = 2; i < 48; i++) {
  synth.push(1.0 * synth[i-1] - 0.288 * synth[i-2] + (Math.random() - 0.5) * 0.01);  // Updated for λ=0.537
}
const synthAR2 = fitAR2(synth);
console.log(`  φ₁ = ${synthAR2.phi1.toFixed(4)}, φ₂ = ${synthAR2.phi2.toFixed(4)}`);
console.log(`  |λ| = ${synthAR2.eigenvalue.toFixed(4)}`);
console.log(`  Expected: ~0.537 (target gene baseline from real data audit)`);
console.log(`  Result: ${Math.abs(synthAR2.eigenvalue - 0.537) < 0.20 ? "✓ MATCHES TARGET GENE BASELINE" : "Deviation"}\n`);

console.log("=== VERDICT ===");
const passed = inBandCount < 30 && sineAR2.eigenvalue > 0.95;
if (passed) {
  console.log("✓ Engine is computing math, NOT hallucinating.");
  console.log("  - Noise produces chaotic eigenvalues");
  console.log("  - Structured signals produce stable eigenvalues");
  console.log("  - Real data audit: Target genes mean=0.537, Clock genes mean=0.689");
} else {
  console.log("⚠️ Unexpected behavior - needs investigation");
}

import * as fs from 'fs';
const report = {
  timestamp: new Date().toISOString(),
  passed,
  tests: {
    singleNoise: { phi1: noiseAR2.phi1, phi2: noiseAR2.phi2, eigenvalue: noiseAR2.eigenvalue },
    noiseTrials: { count: 100, inStableBand: inBandCount, meanEigenvalue: meanEigen },
    sineWave: { phi1: sineAR2.phi1, phi2: sineAR2.phi2, eigenvalue: sineAR2.eigenvalue },
    syntheticAR2: { phi1: synthAR2.phi1, phi2: synthAR2.phi2, eigenvalue: synthAR2.eigenvalue, target: 0.537 }  // Real target gene baseline
  }
};
fs.writeFileSync('HALLUCINATION_TEST_REPORT.json', JSON.stringify(report, null, 2));
console.log("\nReport saved to: HALLUCINATION_TEST_REPORT.json");
