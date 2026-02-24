# PAR(2) Discovery Engine v2.0.0 - Installation Guide

This guide explains how to install and run the PAR(2) Discovery Engine locally on your machine.

## License Notice

This software is available under a **dual-license model**:

- **Academic/Research Use**: Free for non-commercial research (citation required)
- **Commercial Use**: License required - contact mickwh@msn.com for terms

**Patent Notice**: The PAR(2) methodology is subject to a pending UK patent application. 
Commercial use requires a license that includes patent rights.

See [LICENSE](LICENSE) for full terms.

## Quick Start (5 minutes)

### Prerequisites
- **Node.js 18+** - Download from https://nodejs.org
- **PostgreSQL** (optional) - For persistent data storage
- **Git** (optional) - For cloning the repository

### Option 1: Full Web Application

```bash
# 1. Install dependencies
npm install

# 2. Start the application
npm run dev

# 3. Open http://localhost:5000 in your browser
```

### Option 2: Command Line Interface (No Server Required)

```bash
# 1. Install dependencies
npm install

# 2. Run analysis on your data
npx tsx scripts/local-analyze.ts your_data.csv --all-pairs
```

### Option 3: One-Command Reproduction

```bash
# 1. Start the application
npm run dev

# 2. Download the reproduction script
curl -O http://localhost:5000/api/download/reproduction-script
chmod +x reproduce.sh
./reproduce.sh
```

This downloads all 6 GEO datasets from NCBI and runs the full analysis pipeline.

## Detailed Installation

### Step 1: System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| Node.js | 18.x | 20.x or later |
| RAM | 2 GB | 4 GB |
| Disk Space | 500 MB | 1 GB (with all datasets) |
| OS | Windows 10+, macOS 10.15+, Linux | Any modern OS |

### Step 2: Download

**From Zenodo:**
1. Download the archive from the Zenodo DOI link
2. Extract to a folder of your choice

**From Git:**
```bash
git clone https://github.com/your-repo/par2-discovery-engine.git
cd par2-discovery-engine
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages (~150 MB).

### Step 4: Configure Database (Optional)

By default, the CLI tool works without any database. For the web application:

**PostgreSQL (Recommended)**
Set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/database"
```

### Step 5: Start the Application

```bash
npm run dev
# Open http://localhost:5000
```

## Web Interface

The application provides 11 frontend routes:

| Route | Feature |
|-------|---------|
| `/` | Dashboard with core AR(2) eigenvalue analysis |
| `/discovery-engine` | Upload wearable/CGM data for real-time analysis |
| `/model-zoo` | ODE Model Zoo (5 canonical models, 12/12 PASS) |
| `/validation` | Validation suite with multi-species panel |
| `/robustness` | Edge-case diagnostics and robustness checks |
| `/species-comparison` | Cross-species eigenvalue comparison |

## API Endpoints

### Core Analysis
- `POST /api/analyze` - Run AR(2) analysis on uploaded data
- `GET /api/datasets` - List embedded datasets

### Processed Per-Gene Tables
- `GET /api/processed-tables/available` - List available datasets
- `GET /api/processed-tables/download/:id` - Download 17-column CSV per gene
- `GET /api/processed-tables/summary/:id` - Summary statistics

### Validation
- `GET /api/validation/multi-species` - Multi-species hierarchy (8/8 PASS)
- `GET /api/ode-model-zoo` - ODE Model Zoo results (12/12 PASS)

### Downloads
- `GET /api/download/reproduction-script` - GEO reproduction bash script
- `GET /api/download/source-package` - Source code archive

## CLI Analysis

```bash
# Run analysis on all 152 gene pairs
npx tsx scripts/local-analyze.ts datasets/my_data.csv --all-pairs

# Custom parameters
npx tsx scripts/local-analyze.ts data.csv --period 24 --threshold 0.01 --output results.json

# Include CSV output
npx tsx scripts/local-analyze.ts data.csv --all-pairs --csv --verbose
```

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Port 5000 already in use
```bash
PORT=3000 npm run dev
```

### Data not loading
- Check file format matches expected CSV/TSV structure
- Ensure gene IDs match Ensembl format or gene symbols
- Verify UTF-8 encoding
- Minimum 6 timepoints required

### Large dataset processing
- Some datasets (40,000+ genes) may take 30-60 seconds to process
- The per-gene table endpoints cache results after first computation

## Verification

To verify your installation:

```bash
# Start the app
npm run dev

# Test multi-species validation (should return 8/8 PASS)
curl http://localhost:5000/api/validation/multi-species

# Test ODE Model Zoo (should return 12/12 PASS)
curl http://localhost:5000/api/ode-model-zoo

# List available processed tables
curl http://localhost:5000/api/processed-tables/available
```

## Getting Help

- Check `README.md` for general information
- See `datasets/README.md` for data format details
- See `PAR2_VERIFICATION_REPORT.md` for validation details

---

*PAR(2) Discovery Engine v2.0.0 - Circadian Clock-Target Dynamics Analysis*
