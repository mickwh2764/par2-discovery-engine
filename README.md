# PAR(2) Discovery Engine

**Circadian Clock-Target Dynamics Analysis Platform**

[![License: Dual](https://img.shields.io/badge/License-Dual%20(Academic%2FCommercial)-blue.svg)](LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.18730681.svg)](https://doi.org/10.5281/zenodo.18730681)

**Live Platform**: [https://par-2-discovery--6tbwkcht9k.replit.app](https://par-2-discovery--6tbwkcht9k.replit.app)

A statistical platform for analyzing circadian clock-target gene dynamics using AR(2) autoregressive modeling. The eigenvalue modulus |λ| quantifies temporal persistence in gene expression, revealing how circadian clock genes maintain higher stability than their downstream targets across species and conditions.

---

## Overview

The PAR(2) Discovery Engine fits order-2 autoregressive models to gene expression time series:

```
y(t) = β₁·y(t-1) + β₂·y(t-2) + ε
```

The eigenvalue modulus |λ| derived from the characteristic equation measures how robustly a gene maintains its expression pattern over time. The key biological finding: **clock genes consistently show higher |λ| than target genes**, validated across 4 species and 10 GEO datasets with hierarchy preservation across 36 tissue/condition series. The platform provides 79 embedded datasets spanning 5 species and ~125,000 unique genes for broader exploration.

### Key Capabilities

- **AR(2) Eigenvalue Analysis** across 79 embedded datasets spanning mouse, human, baboon, Arabidopsis, and yeast (~406K gene identifiers, ~125K unique symbols)
- **Edge Case Diagnostics**: 6-check reliability screening (trend, sample size, model order, nonlinearity, boundary proximity, ADF stationarity) with confidence scoring
- **Multi-Tissue Phase Portrait Explorer**: Animated 24-hour cycle visualization with BMAL1 coupling analysis across 12 mouse tissues (636 gene-tissue tests)
- **Root-Space Geometry**: AR(2) coefficient mapping to stationarity triangle with functional enrichment analysis (GO, KEGG)
- **Drug Target Overlay**: 168 gene targets mapped to 256 FDA-approved drugs for chronotherapy identification
- **DRMref Multi-Drug Cross-Validation**: Resistance/sensitivity gene lists from 19 drugs (12 cancer types) cross-referenced against AR(2) eigenvalues with per-drug permutation tests
- **Drug Durability Analysis**: Palbociclib persistence analysis (GSE93204, n=7) — low-|λ| genes maintain drug effects at 88.5% vs 40.6% for high-|λ| genes (47.9pp, p<0.001)
- **Literature Validation**: Cross-reference against 59 curated circadian genes (Panda, Takahashi, Sancar et al.) with falsification controls
- **Genome-Wide Coupling Scan**: AR(2)+exogenous models testing all ~21,000 genes for BMAL1 coupling with BH-FDR correction
- **Discovery Engine**: Upload and analyze custom CSV data with real-time AR(2) eigenvalue computation
- **ODE Model Zoo**: 5 canonical biological models (Goodwin, Leloup-Goldbeter, FitzHugh-Nagumo, Lotka-Volterra, Tyson-Novak) — all validation checks PASS
- **Framework Benchmarks**: Comparison against cosinor, JTK_CYCLE, RAIN, ARSER, ARIMA, Ornstein-Uhlenbeck, and State-Space methods
- **12-Analysis Robustness Suite**: Sub-sampling recovery, bootstrap CIs, stationarity defenses, permutation tests, cross-validation, Bmal1-knockout causal validation, decomposition stability

---

## Quick Start

### Web Application

```bash
git clone https://github.com/mickwh2764/par2-discovery-engine.git
cd par2-discovery-engine
npm install
cp .env.example .env.local
# Edit .env.local — set STORAGE_MODE=sqlite for local use (no database needed)
npm run dev
# Open http://localhost:5000
```

SQLite mode works fully offline with no external dependencies. For PostgreSQL, set `STORAGE_MODE=postgres` and provide a `DATABASE_URL`.

### Command Line

```bash
npx tsx scripts/local-analyze.ts your_data.csv --all-pairs
npx tsx scripts/local-analyze.ts --help
```

---

## Embedded Datasets

79 datasets across 5 species:

| Species | Datasets | Genes | Key Sources |
|---------|----------|-------|-------------|
| Mouse (*Mus musculus*) | 42 | ~21K per dataset | GSE54650 (Hughes Atlas, 12 tissues), GSE11923, GSE157357, GSE67305 |
| Human (*Homo sapiens*) | 11 | ~19-58K per dataset | GSE48113, GSE113883, GSE221103, GSE93204 |
| Baboon (*Papio anubis*) | 8 | ~29K | GSE98965 (7 tissues) |
| Arabidopsis (*A. thaliana*) | 12 | ~22K | GSE242964 (3 developmental stages) |
| Yeast (*S. cerevisiae*) | 4 | ~5.8K | Metabolic cycle |
| Other | 2 | varies | Proteomics, CGM glucose |

Datasets are not included in this repository (too large). They are served from the live platform and can be downloaded from NCBI GEO using the accession numbers above.

---

## Core Results

### Clock > Target Hierarchy

| Gene Type | Mean |λ| | Interpretation |
|-----------|---------|----------------|
| Clock Genes | 0.70 | Higher temporal persistence |
| Target Genes | 0.45 | Lower persistence, faster decay |
| Gap | +0.25 | Hierarchy preserved across species |

### Validation Summary

| Test | Result | Details |
|------|--------|---------|
| Literature recovery | 58/59 (98.3%) | Blind AR(2) vs curated circadian genes across 21 datasets |
| BMAL1 enrichment | ~180× | Over housekeeping/random gene controls (falsification test) |
| Half-life independence | ρ = 0.012 | |λ| orthogonal to mRNA stability |
| Bmal1-knockout | Gap collapses | +0.152 → -0.005 (GSE70499), confirming causal dependence |
| Decomposition stability | DSI = 0.527 | Hierarchy tested under 6 decomposition methods × 11 datasets |
| Robustness suite | 12/12 pass | Sub-sampling, bootstrap, permutation, LOO-CV, detrending, etc. |
| Bias audit | 3/3 pass | Time-shuffle, irrelevant metric, expression-matched null |
| Non-circadian validation | PASS | Immune response hierarchy inverts (rapid alarm > sustained defense) |

### Multi-Tissue BMAL1 Coupling (GSE54650)

53 genes tested across 12 tissues (636 total tests):
- 85 significant coupling events across 33 genes
- Wee1 coupled in 10/12 tissues; Nampt in 8/12
- 25 distinct findings: 7 independently confirmed, 8 strongly supported, 10 novel predictions

### Drug Durability (GSE93204)

Palbociclib + anastrozole in breast cancer (n=7 patients, 4 time points):
- Low-|λ| genes maintain 88.5% of drug effects at surgery
- High-|λ| genes maintain only 40.6% (they bounce back)
- 47.9 percentage point difference (p < 0.001, bootstrap CI [43.5, 52.4])
- DRMref cross-validation: 12/19 drugs show predicted direction (resistance genes have higher persistence)

---

## AR(2) Methodology

### Why AR(2)?

| Model | Can Oscillate? | AIC Comparison | Verdict |
|-------|----------------|----------------|---------|
| AR(1) | No (monotonic decay only) | Baseline | Cannot capture circadian dynamics |
| **AR(2)** | **Yes (complex eigenvalues)** | **ΔAIC = −148 vs AR(1)** | **Optimal for oscillatory systems** |
| AR(3) | Yes | ΔAIC = +3 vs AR(2) | Overfitting; extra parameter not justified |

### Eigenvalue Interpretation

| |λ| Range | Biological Meaning |
|-----------|-------------------|
| 0.0–0.3 | Rapid decay, minimal persistence |
| 0.3–0.6 | Moderate persistence (typical target genes) |
| 0.6–0.8 | High persistence (typical clock genes) |
| 0.8–1.0 | Near-sustained oscillation |
| > 1.0 | Unstable/growing oscillation (flag for review) |

### Complementary to JTK_CYCLE

JTK_CYCLE determines *whether* a gene is rhythmic (period detection). PAR(2) quantifies *how robustly* that rhythm persists (stability metric). The two methods answer different questions and are complementary.

---

## Data Format

### Input CSV (Gene-Rows)

```csv
GeneID,CT0,CT4,CT8,CT12,CT16,CT20
Per2,5.2,6.1,7.3,6.8,5.5,5.0
Myc,3.1,4.2,5.8,6.2,4.5,3.3
```

- First column: gene identifiers (symbols or Ensembl IDs)
- Remaining columns: evenly-spaced timepoints
- Values: expression (TPM, FPKM, or normalized counts)
- Minimum: 6 timepoints (18+ recommended)

### Output Per-Gene Table (17 columns)

| Column | Description |
|--------|-------------|
| gene | Gene symbol |
| eigenvalueModulus | |λ| from AR(2) fit |
| phi1, phi2 | AR(2) coefficients |
| rSquared | Model fit quality |
| ljungBoxP | Ljung-Box whiteness test |
| confidence | Diagnostic confidence (0-100) |
| classification | Gene category |
| 6 diagnostic flags | Trend, sample size, AR(3), nonlinearity, boundary, ADF |

---

## Project Structure

```
par2-discovery-engine/
├── client/                        # React/TypeScript frontend
│   └── src/pages/                 # ~50 route pages
├── server/                        # Node.js/Express backend
│   ├── routes.ts                  # API endpoints
│   ├── par2-engine.ts             # Core AR(2) algorithm
│   ├── drmref-validation.ts       # DRMref multi-drug cross-validation
│   ├── processed-tables.ts        # Per-gene eigenvalue tables
│   ├── edge-case-diagnostics.ts   # 6-check reliability screening
│   ├── genome-wide-coupling.ts    # BMAL1 coupling scan
│   ├── literature-validation.ts   # 59-gene literature cross-reference
│   ├── robustness-analysis.ts     # 12-analysis robustness suite
│   └── storage.ts                 # Database (Drizzle ORM)
├── shared/                        # Shared types and schema
├── datasets/                      # 79 embedded datasets (not in repo)
├── manuscripts/                   # Analysis reports and summaries
├── paper-packages/                # LaTeX manuscript source (Papers A-G)
├── CITATION.cff
├── LICENSE
└── zenodo.json
```

---

## Manuscript Packages

The `paper-packages/` directory contains LaTeX source for seven manuscripts:

| Paper | Target Journal | Focus |
|-------|---------------|-------|
| A — Core Methods | PLOS Computational Biology | AR(2) framework, 12-analysis robustness, literature validation |
| B — Resonance Zone | PLOS Computational Biology | Root-space geometry and dynamical classification |
| C — Coupling Atlas | PLOS Computational Biology | Genome-wide BMAL1 coupling scan |
| D — Perspective | PLOS Computational Biology | Eigenvalue as universal metric |
| E — Cell Systems | PLOS Computational Biology | Cell-type persistence maps |
| F — Expression Persistence | PLOS Computational Biology | Half-life independence and non-circadian validation |
| G — Fibonacci Reply | Fibonacci Quarterly | Fibonacci enrichment in eigenvalue distributions |

---

## Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| Node.js | 18.x | 20.x+ |
| PostgreSQL | 14.x (optional) | 15.x+ |
| RAM | 2 GB | 4 GB |
| Disk | 500 MB | 1 GB |

SQLite mode requires no external database.

---

## Citation

If you use this software in your research, please cite:

```bibtex
@software{par2_discovery_engine,
  title = {PAR(2) Discovery Engine: Circadian Clock-Target Dynamics Analysis Platform},
  author = {{Michael Whiteside, Independant Researcher, Scotland}},
  year = {2026},
  doi = {10.5281/zenodo.18730681},
  url = {https://par-2-discovery--6tbwkcht9k.replit.app},
  version = {2.0.0}
}
```

See [CITATION.cff](CITATION.cff) for machine-readable citation metadata.

---

## License

| License | Who | Terms |
|---------|-----|-------|
| **Academic/Research** | Universities, non-profits, students | **Free** — non-commercial use, citation required |
| **Commercial** | Pharma, biotech, CROs | **License required** — contact for terms |

**Patent Notice**: The PAR(2) methodology is the subject of a pending UK patent application. Commercial use requires a license that includes patent rights.

See [LICENSE](LICENSE) for full terms. Commercial inquiries: mickwh@msn.com

---

## Contributing

Contributions are welcome. By contributing, you agree to the [Contributor License Agreement](CLA.md).

---

*PAR(2) Discovery Engine v2.0.0*
