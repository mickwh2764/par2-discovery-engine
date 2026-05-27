# PAR(2) Supplementary Data Summary
Generated: 2026-02-26
Version: 3.0

## Data Overview

| Category | Count |
|----------|-------|
| Total mRNA tests | 83055 |
| FDR-significant mRNA | 72 |
| Total proteomics tests | 464 |
| FDR-significant proteomics | 48 |
| Concordance comparisons | 760 |
| Literature-validated genes | 59 |
| Before/After comparison pairs | 6 |
| Health score components | 4 |
| Decomposition stability tests | 66 |
| State-space comparison genes | 301 |

## Concordance Breakdown

| Status | Count | Percentage |
|--------|-------|------------|
| Both significant | 0 | 0.0% |
| mRNA only | 0 | 0.0% |
| Protein only | 120 | 15.8% |
| Neither | 640 | 84.2% |

## Files

- **S1_mRNA_PAR2_Results_Complete.csv.gz**: All 83055 mRNA PAR(2) tests across 630 datasets
- **S2_Proteomics_PAR2_Results.csv**: All 464 protein-level PAR(2) tests
- **S3_mRNA_Protein_Concordance.csv**: mRNA vs protein comparison for 760 gene pairs
- **S4_Literature_Validation_59Genes.csv**: 59 literature-validated circadian genes with pathway, discovery method, citation, and finding
- **S5_Before_After_Pairs.csv**: 6 pre-loaded before/after trajectory comparison pairs with dataset references
- **S6_Health_Score_Components.csv**: Circadian Health Score formula components with weights and scoring descriptions
- **S7_Decomposition_Stability.csv**: 66 decomposition stability tests (11 datasets x 6 methods) testing hierarchy preservation
- **S8_State_Space_Comparison.csv**: Per-gene state-space model comparison results (AR(2) OLS vs SARIMAX MLE vs Local Level) across 3 datasets
- **PAR2_Complete_Results.csv**: Complete PAR(2) results across all datasets
- **PAR2_FALSIFIABLE_PREDICTIONS.tex**: Falsifiable predictions derived from PAR(2) framework
- **PAR2_METHODS_VALIDATION.tex**: Methods validation supplementary section
- **PAR2_NULL_SURVEY.json**: Null survey results (JSON format)
- **PAR2_NULL_SURVEY.txt**: Null survey results (text format)
- **Supplementary_Materials.tex**: LaTeX supplementary materials document
- **EIGENVALUE_SURVEY.json**: Eigenvalue survey across all datasets
- **gene_atlas_cancer_state_swap.csv**: Cancer state swap analysis from gene atlas
- **gene_atlas_category_summary.csv**: Gene atlas category summary statistics
- **gene_atlas_per_gene_eigenvalues.csv**: Per-gene eigenvalue results from gene atlas
- **gene_atlas_unstable_genes.csv**: Unstable genes identified in gene atlas analysis

## Methods

PAR(2) Phase-Gated Autoregressive analysis with:
- Bonferroni correction within gene pairs (7 clock genes)
- Benjamini-Hochberg FDR correction across all pairs
- Effect size: Cohen's f² (small: 0.02, medium: 0.15, large: 0.35)

### Literature Validation (S4)
59 genes curated from peer-reviewed publications (Panda 2002, Matsuo 2003, Kang 2009, Zhang 2014, etc.) across 14 biological pathways. Used for convergence validation and negative-control falsification testing with ~180x enrichment ratio (Arntl 8.4% vs controls 0.0-0.3%). Multi-dataset scan across 21 datasets recovers 58/59 genes (98.3%); only Tp53 missed due to post-translational regulation.

### Before/After Trajectories (S5)
6 pre-loaded comparison pairs spanning immune activation, oncogene toggle, cancer initiation, sleep restriction, shift work, and clock knockout. Each pair computes per-gene eigenvalue shifts and regime changes between conditions.

### Circadian Health Score (S6)
0-100 composite score with A-F letter grades (A≥80, B≥60, C≥40, D≥20, F<20). Four weighted components: gearbox gap (40%), hierarchy rate (30%), model fit (15%), and gene coverage (15%).

### Decomposition Stability (S7)
Analysis of PAR(2) eigenvalue hierarchy across 11 datasets using 6 global driver removal methods: raw, mean regression, median regression, PC1 projection, 25% variance removal, and 50% variance removal.
- **Aggregate DSI**: 0.527
- **Mean Rank Correlation**: 0.619
- **Gap Preservation**: 8/11 datasets
- **Verdict**: Robust for tissues with moderate-to-large initial gaps (>0.10), weak for marginal tissues.
- **Simulations**: 4/4 benchmarks passed (true hierarchy recovered, no false hierarchies induced).

## Paper G: Fibonacci Reply (Amended)

See `paper-packages/paper-g-fibonacci-reply/` for the complete amended Fibonacci Reply paper package including:
- `Supplementary_Table_S1_Crypt_Gene_Eigenvalues.csv`: Per-gene eigenvalue data with PAR(2) layer assignments
- `Supplementary_Table_S2_Platform_Validation.csv`: 13-claim cross-validation results
- `Supplementary_Table_S3_BMAL1_Coupling_Crypt.csv`: BMAL1 coupling for crypt-relevant genes
- `Supplementary_Table_S4_Organoid_Perturbation.csv`: Four-genotype GSE157357 perturbation results
- `Supplementary_Table_S5_Nguyen_Integration.csv`: Cell-type integration of Nguyen 2025 with PAR(2)
- `fibonacci_reply_validation.json`: Complete platform cross-validation data
- `crypt_gene_eigenvalues.json`: Structured crypt gene eigenvalue data
