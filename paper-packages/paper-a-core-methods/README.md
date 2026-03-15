# Paper A: AR(2) Eigenvalue Modulus as a Measure of Temporal Persistence in Gene Expression

## Target Journal: PLOS Computational Biology

## Status: Ready for Submission (March 2026)

## Package Contents

### Manuscript
- `Paper_A_Core_Methods.tex` - LaTeX source (requires: amsmath, natbib, hyperref, booktabs, graphicx, lineno)
- `Paper_A_Core_Methods.pdf` - Compiled PDF
- `cover_letter.tex` / `cover_letter.pdf` - Cover letter for PLOS Computational Biology
- `references.bib` - Full bibliography (46 references)

### Supplementary Tables
- `Supplementary_Table_S1_Dataset_Summaries.csv` - Per-dataset summary: clock/target gene counts, mean eigenvalues, clock-target gap, hierarchy preservation across 13 tissue/condition datasets
- `Supplementary_Table_S1b_Per_Gene_Eigenvalues.csv` - Per-gene detail: eigenvalue modulus, R², confidence, ADF stationarity for all clock and target genes across all datasets (455 gene-dataset entries)
- `Supplementary_Table_S2_ODE_Validation.csv` - ODE model eigenvalue comparison (5 models: Goodwin, Leloup-Goldbeter, FitzHugh-Nagumo, Lotka-Volterra, Tyson-Novak)
- `Supplementary_Table_S3_Literature_Validation.csv` - 59 curated circadian genes with pathway, discovery method, citation, recovery status across 21 datasets (98.3% recovery)
- `Supplementary_Table_S4_Falsification_Test.csv` - Popper-faithful falsification: Arntl (8.4%) vs housekeeping (0.0-0.3%) vs random (0.0-0.5%) coupling rates (~180x enrichment)
- `Supplementary_Table_S5_NonCircadian_Validation.csv` - Dendritic cell LPS immune response (GSE59784): fast responders vs sustained effectors eigenvalue comparison

### Supporting Data (JSON)
- `multi_species_validation.json` - Cross-species hierarchy preservation results (mouse, human, baboon, Arabidopsis)
- `robustness_suite.json` - Complete 12-analysis robustness suite results
- `ode_model_validation.json` - ODE Model Zoo roundtrip validation
- `dataset_summaries.json` - Per-dataset eigenvalue summaries

## Key Results Summary
- **Core finding**: Clock (median |λ| = 0.647, mean = 0.689) > Target (median = 0.529) > Other (median = 0.496), preserved 12/12 mouse tissues
- **Cross-species**: 4 species, >400 million years of evolution
- **Causal validation**: Bmal1-KO collapses hierarchy (gap: +0.152 -> -0.005)
- **Literature validation**: 58/59 curated circadian genes recovered (98.3%)
- **Falsification**: ~180x enrichment of Arntl over housekeeping controls
- **Bias audit**: 3/3 tests pass (time-shuffle, irrelevant metrics, expression-matched null)
- **Non-circadian**: Immune response hierarchy validates generality
- **Half-life independence**: rho = 0.012 across 22,989 genes

## Data Sources
All datasets are publicly available from NCBI GEO: GSE54650, GSE11923, GSE48113, GSE39445, GSE98965, GSE242964, GSE157357, GSE221103, GSE70499, GSE59784.

## Figures
All 7 figures are included in both PDF (vector) and PNG (300 DPI) formats:
- `Figure_1_Method_Schematic` - AR(2) model fitting, eigenvalue extraction, unit circle plot
- `Figure_2_Eigenvalue_Hierarchy` - Bar chart + heatmap across 12 mouse tissues (GSE54650)
- `Figure_3_ODE_Validation` - AR(2) vs Jacobian eigenvalues for 5 ODE models
- `Figure_4_Robustness_Suite` - Sub-sampling, bootstrap, permutation test, leave-one-tissue-out
- `Figure_5_Bmal1_Knockout` - Wild-type vs Bmal1-KO eigenvalue distributions (GSE70499)
- `Figure_6_Literature_Falsification` - Pathway recovery rates + Arntl vs controls enrichment
- `Figure_7_Bias_NonCircadian` - Time-shuffle destruction + immune response hierarchy (GSE59784)

## Interactive Application
The PAR(2) Discovery Engine web application provides interactive access to all results: https://par2-discovery-engine.replit.app
