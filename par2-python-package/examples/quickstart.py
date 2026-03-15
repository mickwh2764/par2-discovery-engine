"""Quick-start example for par2-circadian."""

import numpy as np
import par2

t = np.arange(0, 48, 2)

bmal1 = 2.0 * np.cos(2 * np.pi * t / 24) + 0.3 * np.random.randn(len(t))
per2 = 1.5 * np.cos(2 * np.pi * t / 24 + np.pi) * np.exp(-0.02 * t) + 0.3 * np.random.randn(len(t))
noise = np.random.randn(len(t))

print("=== Single gene analysis ===")
result = par2.fit_ar2(bmal1)
print(f"Bmal1: |λ| = {result['eigenvalue']:.3f}, type = {result['root_type']}")
print(f"  Half-life = {result['half_life']} intervals")
print(f"  Eigenperiod = {result['eigenperiod']} intervals")
print(f"  Classification = {par2.classify_dynamics(result['eigenvalue'], result['root_type'])}")

print("\n=== Batch analysis ===")
matrix = np.vstack([bmal1, per2, noise])
genes = ["Bmal1", "Per2", "Noise"]
results = par2.fit_ar2_batch(matrix, genes)
for r in results:
    print(f"  {r['gene']:8s}: |λ| = {r['eigenvalue']:.3f} ({r['root_type']})")

print("\n=== Save to CSV ===")
par2.save_results(results, "example_output.csv")
print("Results saved to example_output.csv")
