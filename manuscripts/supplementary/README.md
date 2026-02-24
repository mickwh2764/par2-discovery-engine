# PAR(2) Supplementary Data Summary
Generated: 2025-12-19T14:46:28.914Z

## Data Overview

| Category | Count |
|----------|-------|
| Total mRNA tests | 83055 |
| FDR-significant mRNA | 72 |
| Total proteomics tests | 464 |
| FDR-significant proteomics | 48 |
| Concordance comparisons | 760 |

## Concordance Breakdown

| Status | Count | Percentage |
|--------|-------|------------|
| Both significant | 0 | 0.0% |
| mRNA only | 0 | 0.0% |
| Protein only | 120 | 15.8% |
| Neither | 640 | 84.2% |

## Files

- **S1_mRNA_PAR2_Results_Complete.csv**: All 83055 mRNA PAR(2) tests across 630 datasets
- **S2_Proteomics_PAR2_Results.csv**: All 464 protein-level PAR(2) tests
- **S3_mRNA_Protein_Concordance.csv**: mRNA vs protein comparison for 760 gene pairs

## Methods

PAR(2) Phase-Gated Autoregressive analysis with:
- Bonferroni correction within gene pairs (7 clock genes)
- Benjamini-Hochberg FDR correction across all pairs
- Effect size: Cohen's f² (small: 0.02, medium: 0.15, large: 0.35)
