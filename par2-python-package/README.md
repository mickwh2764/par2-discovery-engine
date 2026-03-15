# par2-circadian

**AR(2) eigenvalue analysis for gene expression time series**

Fits second-order autoregressive models to gene expression data and computes the eigenvalue modulus |λ|, a single number that quantifies how strongly a gene's past determines its future (temporal persistence).

## Installation

```bash
pip install par2-circadian
```

Or install from source:

```bash
git clone https://github.com/mickwh2764/par2-discovery-engine.git
cd par2-discovery-engine/par2-python-package
pip install .
```

## Quick Start

### Python API

```python
import par2

# Single gene
result = par2.fit_ar2([1.2, 3.4, 2.1, 4.5, 3.2, 5.1, 2.8, 4.9, 3.5, 5.2, 2.9, 4.7])
print(f"|λ| = {result['eigenvalue']:.3f}, type = {result['root_type']}")

# Whole matrix from CSV
matrix, genes = par2.load_expression_matrix("my_data.csv")
results = par2.fit_ar2_batch(matrix, genes)

# Save results
par2.save_results(results, "ar2_results.csv")
```

### Command Line

```bash
# Analyse a CSV file (genes as rows, timepoints as columns)
par2 my_data.csv -o results.csv

# Show top 20 genes by eigenvalue
par2 my_data.csv --top 20
```

## Input Format

CSV file with:
- First row: header (timepoint labels)
- First column: gene names
- Remaining columns: expression values (minimum 6 timepoints)

Example:
```
Gene,ZT0,ZT2,ZT4,ZT6,ZT8,ZT10,ZT12,ZT14,ZT16,ZT18,ZT20,ZT22
Bmal1,12.3,14.1,15.8,16.2,14.5,11.2,9.8,8.1,7.5,8.9,10.2,11.5
Per2,8.1,7.2,6.5,7.8,10.2,13.5,15.1,14.8,13.2,10.5,9.1,8.5
```

## Output

Each gene gets:
- **eigenvalue**: |λ|, the eigenvalue modulus (0 to ~1). Higher = more persistent.
- **phi1, phi2**: AR(2) coefficients
- **r2**: goodness of fit
- **root_type**: 'Complex' (oscillatory) or 'Real' (monotone decay)
- **half_life**: persistence half-life in sampling intervals
- **eigenperiod**: intrinsic oscillation period (complex roots only)

## Interpreting |λ|

| Range | Interpretation |
|-------|---------------|
| 0.8–1.0 | Sustained oscillator (e.g., core clock genes) |
| 0.5–0.8 | Damped oscillator (e.g., clock-controlled targets) |
| 0.3–0.5 | Weak persistence (e.g., downstream effectors) |
| 0.0–0.3 | Rapidly decaying / noise-dominated |

## Method

The AR(2) model fits:

```
x(t) = φ₁·x(t-1) + φ₂·x(t-2) + ε
```

The characteristic equation r² − φ₁r − φ₂ = 0 yields eigenvalues whose modulus |λ| quantifies temporal persistence. Expression values are mean-centred before fitting.

For complex roots: |λ| = √(−φ₂)
For real roots: |λ| = max(|r₁|, |r₂|)

See: Whiteside M (2026). "AR(2) eigenvalue modulus as a measure of temporal persistence in circadian gene expression." *PLOS Computational Biology* (submitted).

## License

MIT
