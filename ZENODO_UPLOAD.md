# Zenodo Upload Instructions

This document explains how to create a Zenodo deposit for the PAR(2) Discovery Engine v2.0.0.

## Pre-Upload Checklist

Before uploading, verify these files are ready:

- [x] `zenodo.json` - Metadata for Zenodo (license, keywords, references)
- [x] `CITATION.cff` - Citation format file (used by GitHub/Zenodo)
- [x] `LICENSE` - Dual license terms (academic free / commercial paid)
- [x] `README.md` - Main documentation with all platform features
- [x] `INSTALL.md` - Installation guide
- [x] `datasets/README.md` - Documentation for 50+ embedded datasets
- [x] `NOTICE` - Third-party attribution (Drizzle ORM Apache 2.0)
- [x] `PAR2_VERIFICATION_REPORT.md` - Verification and validation report

## Step 1: Create the Archive

Run this command to create a clean archive for upload:

```bash
zip -r PAR2-Discovery-Engine-v2.0.0.zip \
  client/ \
  server/ \
  shared/ \
  datasets/ \
  public/ \
  CITATION.cff \
  CLA.md \
  drizzle.config.ts \
  INSTALL.md \
  LICENSE \
  NOTICE \
  package.json \
  package-lock.json \
  postcss.config.js \
  README.md \
  PAR2_VERIFICATION_REPORT.md \
  tsconfig.json \
  vite.config.ts \
  zenodo.json \
  par2_results.json \
  -x "*.log" \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.tar.gz" \
  -x "*.tar" \
  -x "attached_assets/*" \
  -x "datasets/tmp_quant/*" \
  -x "datasets/A0R1_quant/*" \
  -x "datasets/colas2019_temp/*" \
  -x "datasets/shanghai_diabetes/*" \
  -x "datasets/sleep_multiomics/*" \
  -x "datasets/sleep_multiomics_backup.zip" \
  -x "datasets/diabetes_dataset.zip" \
  -x "datasets/Colas2019_CGM_data.zip" \
  -x "datasets/GSE242964_RAW.tar" \
  -x "datasets/GSM*_quant.tar.gz"
```

Or use the download button in the web interface (Downloads section).

## Step 2: Upload to Zenodo

1. Go to [zenodo.org](https://zenodo.org) and log in (or create account)
2. Click **"New upload"**
3. Upload the `PAR2-Discovery-Engine-v2.0.0.zip` file
4. Fill in the metadata form:

### Required Metadata

| Field | Value |
|-------|-------|
| **Upload type** | Software |
| **Title** | PAR(2) Discovery Engine: Circadian Clock-Target Dynamics Analysis Platform |
| **Publication date** | 2026-02-08 |
| **Version** | 2.0.0 |
| **License** | Other (Open) - then add note about dual license |

### Description (Copy/Paste)

```
A statistical validation platform for analyzing circadian clock-target gene 
dynamics using AR(2) autoregressive modeling. The eigenvalue modulus |lambda| 
quantifies temporal persistence in gene expression, revealing how circadian 
clock genes maintain higher stability than their downstream targets.

Key features in v2.0.0:
- AR(2) eigenvalue profiling with edge-case diagnostics (5 failure-mode checks)
- ODE Model Zoo: 5 canonical biological models, 12/12 prediction checks PASS
- Multi-species validation: 4 species, 8 datasets, 100% hierarchy preservation
- Per-gene eigenvalue tables: 17-column CSV downloads for 7 datasets
- Discovery Engine: real-time wearable/CGM data analysis
- One-command GEO reproduction script
- 50+ embedded circadian datasets (mouse, human, baboon, Arabidopsis)

Platform scale: ~68,000 lines of code, 60+ API endpoints, 11 frontend routes.

DUAL LICENSE: Free for academic/research use; commercial license required 
for pharmaceutical, biotech, or revenue-generating applications. 
Contact mickwh@msn.com for commercial licensing.

PATENT NOTICE: The PAR(2) methodology is subject to a pending UK patent application.
```

### Keywords

Add these keywords (one per field):
- circadian rhythms
- chronobiology
- cancer biology
- gene expression
- time-series analysis
- AR(2) autoregressive model
- eigenvalue analysis
- PAR(2)
- Gearbox Hypothesis
- cross-species validation
- ODE model validation
- bioinformatics
- chronotherapy
- wearable data analysis

### Related Identifiers

Add these GEO datasets:
- `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE11923` (References)
- `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE54650` (References)
- `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE113883` (References)
- `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE48113` (References)
- `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE98965` (References)
- `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE242964` (References)
- `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE157357` (References)
- `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE221103` (References)

### References

- Stokes K, et al. (2021) The circadian clock gene BMAL1 coordinates intestinal regeneration. Genes Dev. 35(17-18):1290-1301.
- Hughes ME, et al. (2009) Harmonics of circadian gene transcription in mammals. PLoS Genet 5(4):e1000442.
- Zhang R, et al. (2014) A circadian gene expression atlas in mammals. PNAS 111(45):16219-16224.
- Mure LS, et al. (2018) Diurnal transcriptome atlas of a primate across major neural and peripheral tissues. Science 359(6381).

## Step 3: Publish

1. Review all metadata
2. Click **"Publish"**
3. Copy the DOI (format: `10.5281/zenodo.XXXXXXX`)

## Step 4: Update README Badge

After publishing, update `README.md` with the real DOI:

```markdown
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)
```

Replace `XXXXXXX` with your actual Zenodo record number.

## Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| 1.0.0 | 2025-12-04 | Initial release: 152-pair PAR(2) analysis, 21 datasets |
| 2.0.0 | 2026-02-08 | AR(2) eigenvalue engine, ODE Model Zoo, multi-species validation (4 species, 8 datasets), edge-case diagnostics, processed tables, Discovery Engine, GEO reproduction script, 50+ datasets |

## Troubleshooting

### "Invalid community identifier"
Remove the `communities` field from `zenodo.json` - those communities may not exist.

### "License not recognized"
Use `"other-open"` as the license ID, then explain the dual license in the description and notes fields.

### Large file size
The embedded datasets add ~100MB. This is acceptable for Zenodo (limit: 50GB per record).
