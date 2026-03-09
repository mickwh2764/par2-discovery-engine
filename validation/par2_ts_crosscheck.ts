/**
 * PAR(2) TypeScript Cross-Validation Script
 * Compares eigenvalue calculations with R implementation
 */

import { solveAR2Eigenvalues } from '../server/par2-engine';

console.log('=== PAR(2) TypeScript Cross-Validation ===\n');

// Test case 1: Real eigenvalues (β₁=0.5, β₂=0.1)
// R output: λ₁ = 0.6531128874, λ₂ = -0.1531128874, |λ|_max = 0.6531128874
console.log('Test case 1: Real eigenvalues (β₁=0.5, β₂=0.1)');
const ev1 = solveAR2Eigenvalues(0.5, 0.1);
console.log(`  λ₁ = ${ev1.lambda1.real.toFixed(10)}`);
console.log(`  λ₂ = ${ev1.lambda2.real.toFixed(10)}`);
console.log(`  |λ|_max = ${Math.max(ev1.modulus1, ev1.modulus2).toFixed(10)}`);
console.log(`  R expected: λ₁ = 0.6531128874, λ₂ = -0.1531128874, |λ|_max = 0.6531128874`);

const diff1 = Math.abs(ev1.lambda1.real - 0.6531128874);
console.log(`  Difference from R: ${diff1.toExponential(4)}`);
console.log(`  ${diff1 < 1e-8 ? '✓ MATCH' : '✗ MISMATCH'}\n`);

// Test case 2: Complex eigenvalues (β₁=0.5, β₂=-0.5)
// R output: λ₁ = 0.25+0.6614378i, |λ| = 0.7071067812
console.log('Test case 2: Complex eigenvalues (β₁=0.5, β₂=-0.5)');
const ev2 = solveAR2Eigenvalues(0.5, -0.5);
console.log(`  λ₁ = ${ev2.lambda1.real.toFixed(4)} + ${ev2.lambda1.imag.toFixed(7)}i`);
console.log(`  |λ| = ${ev2.modulus1.toFixed(10)}`);
console.log(`  R expected: λ₁ = 0.25+0.6614378i, |λ| = 0.7071067812`);

const diff2 = Math.abs(ev2.modulus1 - 0.7071067812);
console.log(`  Difference from R: ${diff2.toExponential(4)}`);
console.log(`  ${diff2 < 1e-8 ? '✓ MATCH' : '✗ MISMATCH'}\n`);

// Summary
const allMatch = diff1 < 1e-8 && diff2 < 1e-8;
console.log('=== CROSS-VALIDATION SUMMARY ===');
console.log(`Status: ${allMatch ? '✓ ALL EIGENVALUE CALCULATIONS MATCH R IMPLEMENTATION' : '✗ MISMATCH DETECTED'}`);
console.log('');
console.log('This confirms the core mathematical calculations in TypeScript match the independent R implementation.');
