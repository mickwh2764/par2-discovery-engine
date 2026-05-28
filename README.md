# PAR(2) Discovery Engine

**Temporal Persistence Analysis of Gene Expression via AR(2) Eigenvalue Modulus**

[![Live Platform](https://img.shields.io/badge/Live-par2discovery.com-blue)](https://par2discovery.com)
[![CI](https://github.com/mickwh2764/par2-discovery-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/mickwh2764/par2-discovery-engine/actions)

## Overview

The PAR(2) Discovery Engine applies second-order autoregressive (AR(2)) modelling to gene expression time series, computing the eigenvalue modulus |lambda| as a quantitative measure of temporal persistence. The framework recovers a three-layer hierarchy (Clock > Target > Background) across 13 datasets and 4 species, without using any prior biological knowledge in the model fitting.

Key result: Clock genes show median |lambda| = 0.647, clock-controlled targets = 0.529, genome-wide background = 0.496. This hierarchy is replicated across mouse, human, rat, and baboon datasets.

## Live Platform

The interactive companion platform is available at: [https://par2discovery.com](https://par2discovery.com)

Every figure and table in the manuscripts can be explored interactively on the platform.

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (local, [Neon](https://neon.tech), or [Supabase](https://supabase.com))

### Setup

```bash
git clone https://github.com/mickwh2764/par2-discovery-engine.git
cd par2-discovery-engine
npm install

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL connection string

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`.

### Production Build

```bash
npm run build          # Builds client (Vite) + server (esbuild) into dist/
npm run start          # Runs the production server from dist/
```

### Docker

```bash
cp .env.example .env   # Edit .env with your database credentials
docker-compose up
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Server port (default: 5000) |
| `HOST` | No | Bind address (default: 0.0.0.0) |
| `NODE_ENV` | No | `development` or `production` |
| `DRAFT_PAPER_PASSWORD` | No | Password-protect draft manuscript downloads |

## Repository Structure

    client/                     React/TypeScript frontend (Vite)
    server/                     Node.js/Express backend
    shared/                     Shared types and schema
    script/                     Build tooling
    paper-packages/             Manuscript LaTeX source and data
      paper-g-fibonacci-reply/  Paper G: Fibonacci Reply (FQ)
    manuscripts/                Manuscript drafts, figures, and supplementary data
    reproducibility-package/    Standalone reproducibility code
    par2-python-package/        pip-installable Python package

## Method

For each gene, an AR(2) model is fitted to the mean-centred expression time series:

    x(t) = phi1 * x(t-1) + phi2 * x(t-2) + epsilon

The eigenvalue modulus |lambda| is computed from the companion matrix. For complex roots: |lambda| = sqrt(-phi2). For real roots: |lambda| = max(|r1|, |r2|).

Higher |lambda| indicates stronger temporal persistence.

## Validation

- Cross-species replication across mouse, human, rat, and baboon
- ODE round-trip testing (5/5 canonical models recovered)
- 11-analysis robustness suite (bootstrap, permutation, stationarity, etc.)
- BMAL1-KO perturbation: hierarchy collapses from +0.152 to -0.005 gap
- Non-circadian extension: persistence hierarchy in immune response data
- Half-life independence: rho = 0.006 vs mRNA half-life (n = 5,945 genes)
- Monte Carlo simulation: 150 scenarios x 1,000 replicates
- Head-to-head comparison: AR(2) vs cosinor vs JTK_CYCLE on 20,955 genes
- Three automated bias audits on every analysis

## Datasets

All source datasets are publicly available from NCBI GEO (https://www.ncbi.nlm.nih.gov/geo/):

GSE54650 - 12 mouse tissues, 24 timepoints (Mouse)
GSE11923 - Liver, 48 timepoints (Mouse)
GSE48113 - SCN, 18 timepoints (Mouse)
GSE39445 - Human blood, 8 timepoints (Human)
GSE98965 - Human epidermis (Human)
GSE242964 - Baboon multi-tissue (Baboon)
GSE157357 - Intestinal organoids, WT/APC/BMAL1-KO (Mouse)
GSE221103 - PDA organoids (Mouse)
GSE70499 - BMAL1-KO liver (Mouse)
GSE59784 - Rat liver (Rat)

## Python Package

A standalone Python package is available in par2-python-package/:

    par2 data.csv -o results.csv

## Reproducibility

The reproducibility-package/ directory contains standalone code and pre-computed results that reproduce every key finding without requiring the web platform.

## Author

Michael Whiteside
ORCID: 0009-0000-0643-5791
Email: mickwh@msn.com

## License

MIT License
