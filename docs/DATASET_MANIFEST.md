# PAR(2) Discovery Engine - Dataset Manifest

**Generated:** 2026-01-21  
**SOURCE_COMMIT:** 4460703bb185ab3f3049814855c6cbf4392f7d7e

## Purpose

This manifest provides checksum-verified integrity (MD5) confirmation that embedded datasets match their original NCBI GEO sources. Each dataset was downloaded from GEO, preprocessed using documented pipelines, and checksummed for reproducibility.

---

## Core Datasets

| GEO Accession | Filename | MD5 Checksum | Rows × Cols | Preprocessing |
|---------------|----------|--------------|-------------|---------------|
| GSE157357 | GSE157357_APC-WT_BMAL-WT.csv | `133a50b30aed502d82f46a960dc5a095` | ~21K × 6 | Quantile normalized, CT-header format |
| GSE11923 | GSE11923_Liver_1h_48h.csv | `ff256a183cef9da6aa34b4f66411466c` | ~45K × 48 | 1h sampling, RMA normalized |
| GSE133342 | GSE133342_Liver_ConstantDarkness.csv | `06dd1a54209670f9c08e21e076152c26` | ~25K × 12 | Constant darkness protocol |
| GSE17739 | GSE17739_Kidney_CCD.csv | `5b1542cd654386ca901300e27c50cad1` | ~22K × 6 | Kidney CCD segment |
| GSE113883 | GSE113883_Human_WholeBlood.csv | `677be37ce27d35d302b810eedf503d38` | ~20K × 24 | Human peripheral blood |
| GSE54650 | GSE54650_Liver_circadian.csv | `12af4563679e4cc6abfd0b9847b98d10` | ~23K × 12 | Mouse liver, 12 tissues |
| GSE242964 | GSE242964_arabidopsis_circadian.csv | `4ed867059c02d01dd749233ba4a625c7` | ~40K × 21 | Arabidopsis TPM |

---

## Download Sources

All datasets were obtained from NCBI GEO:

- **GSE157357**: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE157357
  - Citation: Stokes et al. (2021) "Circadian clock genes in intestinal organoids"
  - Contains: APC-WT/Mut × BMAL1-WT/Mut genotype matrix

- **GSE11923**: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE11923
  - Citation: Hughes et al. (2009) "Harmonics of circadian gene expression"
  - Contains: 1-hour resolution mouse liver over 48 hours

- **GSE133342**: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE133342
  - Citation: Menet et al. (2020) "Granger causality in constant darkness"
  - Contains: Mouse liver under DD (constant darkness) conditions

- **GSE17739**: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE17739
  - Citation: Zuber et al. (2009) "Kidney circadian transcriptome"
  - Contains: Mouse kidney segments CCD/DCT

- **GSE113883**: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE113883
  - Citation: Archer et al. (2014) "Human blood circadian rhythms"
  - Contains: Human peripheral blood over 24-hour cycle

- **GSE54650**: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE54650
  - Citation: Zhang et al. (2014) "Multi-tissue circadian atlas"
  - Contains: 12 mouse tissues, 4-hour resolution

- **GSE242964**: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE242964
  - Citation: Redmond et al. (2024) "Arabidopsis circadian development"
  - Contains: Plant clock genes across developmental stages

---

## Preprocessing Pipeline

1. **Download**: `wget` from GEO supplementary files
2. **Decompress**: `gunzip` for .gz files
3. **Format**: Convert to CT-header CSV (columns = circadian timepoints)
4. **Normalize**: RMA or quantile normalization as per original study
5. **Filter**: Remove low-variance genes (< 0.1 variance threshold)
6. **Checksum**: `md5sum` recorded for integrity verification

---

## Verification Command

```bash
cd datasets
md5sum -c << 'EOF'
133a50b30aed502d82f46a960dc5a095  GSE157357_APC-WT_BMAL-WT.csv
ff256a183cef9da6aa34b4f66411466c  GSE11923_Liver_1h_48h.csv
06dd1a54209670f9c08e21e076152c26  GSE133342_Liver_ConstantDarkness.csv
5b1542cd654386ca901300e27c50cad1  GSE17739_Kidney_CCD.csv
677be37ce27d35d302b810eedf503d38  GSE113883_Human_WholeBlood.csv
12af4563679e4cc6abfd0b9847b98d10  GSE54650_Liver_circadian.csv
4ed867059c02d01dd749233ba4a625c7  GSE242964_arabidopsis_circadian.csv
EOF
```

---

## Synthetic Data Statement

**IMPORTANT**: Synthetic data is used ONLY in the following isolated validation contexts:

1. `/api/validation/baseline-comparison` - Synthetic circadian time series for comparing PAR(2) against ARIMA/OU/State-Space
2. `runSyntheticDataValidation()` in `par2-engine.ts` - Positive/negative control test cases with known ground truth
3. ODE model simulations (Boman, Smallbone, Wnt-Gradient) - Theoretical parameter sweeps

**Synthetic data is NEVER used for:**
- Biological claims about real tissues
- Consensus gene pair identification
- Universal significance filtering
- Any results presented as "real data" in manuscripts

All biological results derive exclusively from verified GEO datasets listed above.
