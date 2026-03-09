# PAR(2) Discovery Engine - Source Code

## Circadian Clock-Target Dynamics Analysis Platform

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17920428.svg)](https://doi.org/10.5281/zenodo.17920428)

**Version 2.1.0** | **Updated: January 18, 2026**

## Overview

A statistical validation platform for analyzing circadian clock-target gene dynamics using AR(2) eigenvalue profiling. The eigenvalue modulus |λ| quantifies temporal persistence—values clustering in the stable band (0.52-0.72) indicate healthy dynamics, while drift toward |λ| → 1.0 signals instability (observed in cancer models).

### AR(2) Order Validation (New in v2.1)

The choice of AR(2) is now independently validated by the Boman C-P-D ODE model for crypt cell kinetics (Boman RM et al., Cancers 2026, 18:44). When the mechanistic ODEs are sampled at 24-hour intervals, discrete-time series show:
- **ΔAIC > +148** favoring AR(2) over AR(1) in Normal/FAP tissues
- **PACF lag-2 significant** (|value| > 0.8)
- **Loss of AR(2) structure in adenoma** — potential early decoherence marker

### Key Capabilities
- **721 completed analyses** across 72 unique biological contexts
- **129 consensus gene pairs** validated as significant in 3+ independent datasets
- **Cross-kingdom validation**: Mouse tissues, human blood/organoids, Arabidopsis
- **Granger causality** confirmed in darkness (ruling out light artifacts)
- **FFT phase-randomized surrogates** prove findings reflect specific temporal relationships
- **Boman ODE validation**: AR(2) order independently verified by mechanistic crypt model

## Mathematical Framework

The PAR(2) model:

```
R_n = α₀ + α₁(Φ_{n-1})R_{n-1} + α₂(Φ_{n-2})R_{n-2} + ε_n
```

Where:
- `R_n` = target gene expression at timepoint n
- `Φ_n` = clock gene phase at timepoint n  
- `α₁(Φ)`, `α₂(Φ)` = phase-dependent AR coefficients (expanded as Fourier series)
- `ε_n` = error term

The phase-dependence is modeled via sinusoidal expansion:
```
α_k(Φ) = a_k + b_k·cos(Φ) + c_k·sin(Φ)
```

## Installation

### Requirements
- Node.js 18+ or Python 3.9+
- npm or pip

### Node.js/TypeScript
```bash
cd src/typescript
npm install
```

### Python
```bash
cd src/python
pip install -r requirements.txt
```

## Usage

### Command Line Interface

```bash
# TypeScript/Node.js
npx tsx src/typescript/par2-cli.ts --input data/example_timeseries.csv --period 24

# Python
python src/python/par2_cli.py --input data/example_timeseries.csv --period 24
```

### As a Library

**TypeScript:**
```typescript
import { runPAR2Analysis, GeneData } from './par2-core';

const targetData: GeneData = {
  time: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
  expression: [1.2, 1.5, 2.1, 1.8, 1.3, 1.1, 1.3, 1.6, 2.0, 1.7]
};

const clockData: GeneData = {
  time: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
  expression: [0.5, 1.2, 1.8, 1.5, 0.8, 0.3, 0.5, 1.3, 1.9, 1.4]
};

const result = runPAR2Analysis(targetData, clockData, { period: 24 });
console.log('Significant:', result.significant);
console.log('P-value:', result.pValue);
```

**Python:**
```python
from par2_core import run_par2_analysis

target_data = {
    'time': [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
    'expression': [1.2, 1.5, 2.1, 1.8, 1.3, 1.1, 1.3, 1.6, 2.0, 1.7]
}

clock_data = {
    'time': [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
    'expression': [0.5, 1.2, 1.8, 1.5, 0.8, 0.3, 0.5, 1.3, 1.9, 1.4]
}

result = run_par2_analysis(target_data, clock_data, period=24)
print(f"Significant: {result['significant']}")
print(f"P-value: {result['pValue']}")
```

## Input Data Format

CSV file with columns:
- First column: Gene names (or Ensembl IDs)
- Subsequent columns: Expression values at each timepoint
- Header row: Timepoint labels (e.g., CT0, CT4, CT8...)

Example:
```csv
Gene,CT0,CT4,CT8,CT12,CT16,CT20,CT24,CT28,CT32,CT36
Per2,0.5,1.2,1.8,1.5,0.8,0.3,0.5,1.3,1.9,1.4
Wee1,1.2,1.5,2.1,1.8,1.3,1.1,1.3,1.6,2.0,1.7
Ccnd1,2.1,1.8,1.4,1.6,2.0,2.3,2.0,1.7,1.5,1.7
```

## Output

The analysis returns:
- `significant`: Boolean indicating if phase-gating relationship detected
- `pValue`: Minimum p-value across phase interaction terms
- `qValue`: FDR-adjusted q-value (when running batch analysis)
- `significantTerms`: Which interaction terms are significant
- `coefficients`: Fitted AR and phase interaction coefficients

## Statistical Corrections

1. **Within-pair Bonferroni**: Corrects for 4 interaction terms per gene pair
2. **Benjamini-Hochberg FDR**: Controls false discovery rate across all pairs

## Three-Equation Theoretical Stack

1. **Boman's C-P-D ODEs**: Mechanistic cell kinetics (stem cells → proliferating → differentiated)
2. **Phase-gated VAR(2)**: Multivariate latent dynamics [C, P, D, Clock, Niche]ᵀ
3. **PAR(2) scalar projection**: Dominant eigenmode for observable gene expression

## Validation

Stress testing with 36,000+ simulations showed:
- Cross-tissue consensus reduces FDR from 16% to ~2%
- 129 gene pairs replicate across 3+ independent datasets
- Eigenvalue shift in APC-knockout: Healthy |λ|=0.554 → Adenoma |λ|=0.599

## Citation

```bibtex
@article{whiteside2026par2,
  title={PAR(2) Discovery Engine: Eigenvalue-Based Quantification of 
         Circadian Clock-Target Gene Dynamics Across Species},
  author={Whiteside, Michael},
  year={2026},
  doi={10.5281/zenodo.17920428}
}
```

## License

Apache License 2.0 - See LICENSE file for details.

Academic/research use is free (citation required).
Commercial use requires a license - contact mickwh@msn.com.

## Links

- **Web Application**: https://par2-discovery-engine.replit.app
- **Zenodo Record**: https://doi.org/10.5281/zenodo.17920428
- **Contact**: mickwh@msn.com
