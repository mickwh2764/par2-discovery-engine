# Paper E: Phase-Gated AR(2) Framework for Cross-Tissue Circadian Gating Architectures

## Target Journal: Cell Systems (Research Article)

## Package Contents

### Manuscript
- `Paper_E_Phase_Gated_PAR2.tex` — LaTeX source
- `cover_letter.tex` — Cover letter for Cell Systems
- `references.bib` — Full bibliography

### Supplementary Data
- `Supplementary_Table_S1_Tissue_Gating_Modules.csv` — Cross-tissue gating architecture summary
- `Supplementary_Table_S2_Golden_Ratio_Enrichment.csv` — Golden-ratio-like eigenstructure enrichment by tissue
- `Supplementary_Table_S3_Tiered_Hits.csv` — Tiered discovery results (Tier 0/1/2) across tissues
- `Supplementary_Table_S4_Organoid_Perturbation.csv` — Intestinal organoid Apc/Bmal1 perturbation results
- `Supplementary_Table_S5_Eigenvalue_Summaries.csv` — Per-tissue eigenvalue summaries for significant PAR(2) fits

### Supporting Data (JSON)
- `cross_tissue_gating.json` — Full cross-tissue gating architecture analysis results
- `phase_dependent_coefficients.json` — Phase-dependent AR(2) coefficient examples

## Platform Demonstration
The following platform pages demonstrate the analyses described in this paper:
- **Phase Portrait Explorer** (`/phase-portrait`) — Interactive animated 24-hour cycle with BMAL1 coupling across 12 tissues
- **Root-Space Geometry** (`/root-space`) — AR(2) stability triangle, golden-ratio region, gene clustering
- **Cross-Context Validation** (`/cross-context-validation`) — Cross-tissue replication and permutation tests
- **Cancer Browser** (`/cancer-browser`) — Organoid perturbation data (WT vs APC-KO)
- **Phase Gating Analysis** (`/phase-gating`) — Phase-dependent gating analysis

## Data Sources
All datasets are publicly available from NCBI GEO:
- GSE54650 (12 mouse tissues), GSE11923 (mouse liver), GSE157357 (intestinal organoids),
  GSE70499 (Bmal1-knockout), GSE48113 (human blood)

## Manuscript Number
CELL-SYSTEMS-D-25-00764
