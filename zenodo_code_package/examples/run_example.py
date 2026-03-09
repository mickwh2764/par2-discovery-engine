#!/usr/bin/env python3
"""
Example: Run PAR(2) analysis on example data
"""

import sys
sys.path.insert(0, '../src/python')

from par2_core import run_par2_analysis, run_batch_analysis, calculate_eigenperiod

# Example 1: Single pair analysis
print("=" * 60)
print("Example 1: Single Gene Pair Analysis")
print("=" * 60)

target_data = {
    'time': [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
    'expression': [1.22, 1.55, 2.12, 1.82, 1.28, 1.08, 1.25, 1.58, 2.08, 1.78]  # Wee1
}

clock_data = {
    'time': [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
    'expression': [0.52, 1.24, 1.85, 1.48, 0.76, 0.31, 0.55, 1.28, 1.92, 1.42]  # Per2
}

result = run_par2_analysis(target_data, clock_data, period=24)

print(f"Clock gene: Per2")
print(f"Target gene: Wee1")
print(f"Timepoints: {result['nTimepoints']}")
print(f"Significant: {result['significant']}")
print(f"P-value: {result['pValue']:.4f}")
print(f"Significant terms: {result['significantTerms']}")
print()

# Example 2: Eigenperiod calculation
print("=" * 60)
print("Example 2: Eigenperiod Calculation")
print("=" * 60)

ar1 = result['coefficients'].get('R_n_1', 0)
ar2 = result['coefficients'].get('R_n_2', 0)

eigenperiod = calculate_eigenperiod(ar1, ar2, sampling_interval=4)
print(f"AR(1) coefficient: {ar1:.4f}")
print(f"AR(2) coefficient: {ar2:.4f}")
print(f"Eigenperiod: {eigenperiod['eigenperiod']:.1f}h")
print(f"System stable: {eigenperiod['stable']}")
print(f"Damping ratio: {eigenperiod['dampingRatio']:.4f}")
print()

# Example 3: Batch analysis with FDR correction
print("=" * 60)
print("Example 3: Batch Analysis with FDR Correction")
print("=" * 60)

clock_genes = {
    'Per2': [0.52, 1.24, 1.85, 1.48, 0.76, 0.31, 0.55, 1.28, 1.92, 1.42],
    'Arntl': [1.72, 1.35, 0.68, 0.42, 0.85, 1.48, 1.78, 1.32, 0.62, 0.45],
}

target_genes = {
    'Wee1': [1.22, 1.55, 2.12, 1.82, 1.28, 1.08, 1.25, 1.58, 2.08, 1.78],
    'Ccnd1': [2.15, 1.82, 1.42, 1.62, 2.05, 2.28, 2.12, 1.78, 1.48, 1.65],
    'Myc': [1.85, 2.12, 1.75, 1.42, 1.28, 1.52, 1.88, 2.08, 1.72, 1.45],
}

time = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36]

analyses = []
for clock_name, clock_expr in clock_genes.items():
    for target_name, target_expr in target_genes.items():
        analyses.append({
            'id': f'{clock_name}->{target_name}',
            'clockData': {'time': time, 'expression': clock_expr},
            'targetData': {'time': time, 'expression': target_expr}
        })

batch_result = run_batch_analysis(analyses, period=24)

print(f"Total pairs analyzed: {len(analyses)}")
print(f"Significant before FDR: {batch_result['fdrCorrection']['significantCount']}")
print(f"Significant after FDR: {batch_result['fdrCorrection']['significantCountAfterFDR']}")
print()

print("Results (all pairs):")
for i, analysis in enumerate(analyses):
    r = batch_result['results'][i]
    status = "***" if r['significant'] else "   "
    print(f"  {status} {analysis['id']}: p={r['pValue']:.4f}, q={r['qValue']:.4f}")

print()
print("Note: *** indicates significant after FDR correction")
