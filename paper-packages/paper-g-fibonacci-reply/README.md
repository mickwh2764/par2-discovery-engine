# Paper G: A Phase-Gated AR(2) Framework for Colonic Crypt Renewal — Fibonacci Reply (Amended)

## Target Journal: The Fibonacci Quarterly (Reply Article)

## Amendment History
- **Original submission:** November 17, 2025
- **Amended version:** February 26, 2026
- **Key amendments:** (1) Nguyen 2025 citation added, (2) BMAL1-KO prediction corrected, (3) tuft cell readout qualified as "delayed", (4) bidirectional tuft CRC pattern incorporated, (5) φ-enrichment transparency, (6) M-cell terminology flagged

## Package Contents

### Manuscript
- `Paper_G_Fibonacci_Reply.tex` — LaTeX source (amended version)
- `cover_letter.tex` — Cover letter for Fibonacci Quarterly
- `references.bib` — Full bibliography (18 references)

### Supplementary Data (CSV)
- `Supplementary_Table_S1_Crypt_Gene_Eigenvalues.csv` — Per-gene eigenvalue data across tissues, with PAR(2) layer assignments and Nguyen classifications
- `Supplementary_Table_S2_Platform_Validation.csv` — Claim-by-claim cross-validation status (13 claims, 22 datasets, 5 species)
- `Supplementary_Table_S3_BMAL1_Coupling_Crypt.csv` — BMAL1 coupling results for crypt-relevant genes across 12 tissues
- `Supplementary_Table_S4_Organoid_Perturbation.csv` — GSE157357 four-genotype perturbation results (WT, APC-KO, BMAL1-KO, double)
- `Supplementary_Table_S5_Nguyen_Integration.csv` — Cell-type-by-cell-type integration of Nguyen 2025 review with PAR(2) framework

### Supporting Data (JSON)
- `fibonacci_reply_validation.json` — Complete platform cross-validation results, amendment log, Nguyen 2025 integration details
- `crypt_gene_eigenvalues.json` — Structured eigenvalue data for crypt genes, organoid perturbation, tuft cell analysis, kernel architecture evidence

## Key Findings

### Confirmed by Platform
- AR(2) as minimum sufficient model (70-80% AIC preference)
- Clock > target eigenvalue hierarchy (22 datasets, 5 species)
- BMAL1 as circadian phase source (85 coupling events, 180x enrichment)
- WNT/AXIN2 as slow kernel α₂ (APC-KO inverts hierarchy)

### Amended After Platform Validation
- BMAL1-KO: hierarchy collapses (not "eigenvalues preserved" as originally claimed)
- Tuft readout: delayed and accumulative (DCLK1 |λ| ≈ 1.0, near-critical)
- Tuft CRC pattern: bidirectional (reduced in tumours, upregulated post-FOLFIRI)
- φ-enrichment: p = 0.154 (not significant genome-wide)

### Untested
- AXIN2-KO → AR(1) collapse (no dataset available)
- Chronotherapy prediction (no trial data)

## Platform Demonstration
The following platform pages demonstrate the analyses underlying this paper:
- **Discovery Engine** (`/`) — Upload and AR(2) analysis of gene expression data
- **Phase Portrait Explorer** (`/phase-portrait`) — BMAL1 coupling across 12 tissues
- **Root-Space Geometry** (`/root-space`) — AR(2) stability triangle, φ-zone, gene clustering
- **Before/After Trajectories** (`/before-after`) — Cancer initiation (WT vs APC-KO) comparison
- **Cross-Context Validation** (`/cross-context-validation`) — Multi-species hierarchy preservation
- **Health Score** (`/health-score`) — Circadian health scoring of datasets
- **Bias Audit** (automatic on analysis) — Three automated bias tests

## Data Sources
- GSE157357 (intestinal organoids: WT, APC-KO, BMAL1-KO, double mutant)
- GSE54650 (12 mouse tissues, Hughes circadian atlas)
- GSE11923 (mouse liver high-resolution)
- GSE48113 (human blood)
- GSE98965 (baboon multi-tissue)
- Cross-validation across 22 datasets total

## Relationship to Other Papers
- **Paper A** (Core Methods): Provides the 22-dataset, 5-species cross-validation base
- **Paper C** (Coupling Atlas): BMAL1 coupling data across 12 tissues
- **Paper E** (Cell Systems): Phase-gated architecture, organoid perturbation data
- **Paper D** (Perspective): Eigenvalue independence from other biological metrics
- **Paper F** (Expression Persistence): Independence from mRNA half-life
