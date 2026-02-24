# PAR(2) Discovery Engine - Journal Submission Package

## Overview

This package contains a complete journal submission for the PAR(2) (Phase-Amplitude-Relationship) circadian gatekeeper analysis framework.

## Package Contents

### Main Manuscript
- `PAR2_Complete_Manuscript.tex` - Complete LaTeX manuscript (IMRAD format)
- `PAR2_Complete_Manuscript.pdf` - Compiled PDF (if available)

### Supplementary Materials
- `supplementary/Supplementary_Materials.tex` - Supplementary methods, tables, and figures
- `supplementary/PAR2_Complete_Results.csv` - All 5,299 gene pair results with tier classifications
- `supplementary/EIGENVALUE_SURVEY.json` - Complete eigenperiod analysis across 21 datasets
- `supplementary/PAR2_NULL_SURVEY.json` - Permutation validation results
- `supplementary/PAR2_NULL_SURVEY.txt` - Human-readable stress test report

### Figures
- `figures/` - Publication-ready figure data and scripts

### Scripts
- `scripts/figure1_discovery_rates.R` - Discovery rate analysis
- `scripts/figure2_heatmap.R` - Tissue comparison heatmap
- `scripts/figure_compensatory_gating.R` - Compensatory gating analysis

### Administrative
- `cover_letter.tex` - Cover letter template
- `SUBMISSION_CHECKLIST.md` - Pre-submission checklist

## Key Findings Summary

### Validated (Robust Under Permutation)
1. **Eigenperiod Separation**: Healthy tissues show 7-13h eigenperiods; cancer shows 22-23h (~2x difference)
2. **Stability Loss in Cancer**: 88-100% stable dynamics in healthy vs 42% in cancer
3. **AR(2) Captures Real Structure**: Temporal memory in gene expression is reproducible
4. **Three-Layer Hierarchy**: Identity > Proliferation > Clock validated across two independent datasets (GSE11923 n/p=15.3, GSE54650 n/p=7.3) with gene-level correlation r=0.786 and permutation p=0.0032

### Hypothesis-Generating (~16% FDR single-tissue, ~2% with 3+ tissue consensus)
1. Individual gene pair significance claims (single-tissue: ~16% FDR)
2. Specific "Gene X gates Gene Y" relationships (require cross-tissue validation)
3. Top CANDIDATE pairs (Pparg with clock genes in neuroblastoma)

### Tissue-Specific (Conditional) Findings
1. **Golden-ratio dynamics**: 48× enrichment in 3 tissues (hypothalamus, heart, kidney CCD) with 100% of stable pairs near φ (p < 10^-11); no enrichment in other tissues - highly conditional pattern
2. **Circadian gating**: Tissue-specific effects dominate - not universal across all tissues

## Compilation Instructions

### LaTeX Manuscript
```bash
pdflatex PAR2_Complete_Manuscript.tex
bibtex PAR2_Complete_Manuscript
pdflatex PAR2_Complete_Manuscript.tex
pdflatex PAR2_Complete_Manuscript.tex
```

### R Figures (requires ggplot2, dplyr, viridis)
```r
source("scripts/figure1_discovery_rates.R")
source("scripts/figure2_heatmap.R")
```

## Data Sources

### Primary Datasets (30 GEO accessions across 4 species)

#### Mus musculus
| Dataset | Description | Source |
|---------|-------------|--------|
| GSE54650 | 12 mouse tissues (Liver, Heart, Kidney, Lung, Muscle, Adrenal, Hypothalamus, Brainstem, Cerebellum, Aorta, Brown Fat, White Fat), 2h sampling, Hughes Circadian Atlas | GEO/PMID:25349387 |
| GSE54651 | Mouse tissue circadian atlas (companion to GSE54650) | GEO |
| GSE54652 | Mouse tissue circadian atlas (companion to GSE54650) | GEO |
| GSE11923 | Mouse liver, 1h sampling over 48h (Hughes 2009) | GEO |
| GSE113883 | Mouse/Human whole blood circadian (Ruben 2018) | GEO |
| GSE157357 | Intestinal organoids, WT vs APC-mutant (cancer model) | GEO |
| GSE221103 | Neuroblastoma MYC-ON/OFF (cancer vs recovery) | GEO |
| GSE17739 | Mouse kidney segments | GEO |
| GSE59396 | Mouse lung inflammation | GEO |
| GSE93903 | Mouse liver aging (Young/Old/Young+CR/Old+CR, Sato 2017) | GEO |
| GSE245295 | Mouse pancreas aging (Young 4mo vs Old 24mo) | GEO |
| GSE107537 | Mouse circadian tissues | GEO |
| GSE133342 | Mouse circadian tissues | GEO |
| GSE30411 | Mouse circadian expression | GEO |
| GSE36407 | Mouse circadian expression | GEO |
| GSE43071 | Mouse circadian expression | GEO |
| GSE70497 | Mouse circadian expression | GEO |
| GSE70499 | Mouse circadian expression | GEO |
| GSE84521 | Mouse circadian expression | GEO |

#### Homo sapiens
| Dataset | Description | Source |
|---------|-------------|--------|
| GSE48113 | Human blood forced desynchrony (Aligned vs Misaligned, Archer 2014) | GEO |
| GSE39445 | Human blood sleep restriction (Sufficient vs Restricted, Moller-Levet 2013) | GEO |
| GSE122541 | Shift work nurses PBMC (Day vs Night shift, Gamble 2019) | GEO |
| GSE205155 | Human skin dermis vs epidermis (del Olmo 2022) | GEO |
| GSE112660 | Human epidermal circadian time-series | GEO |
| GSE118668 | Human circadian expression | GEO |
| GSE262627 | Human PDA organoids (pancreatic ductal adenocarcinoma) | GEO |
| GSE261698 | Human circadian expression | GEO |
| GSE201207 | Human circadian expression | GEO |

#### Papio anubis (Baboon)
| Dataset | Description | Source |
|---------|-------------|--------|
| GSE98965 | Baboon multi-tissue circadian atlas (Mure 2018) | GEO |

#### Arabidopsis thaliana
| Dataset | Description | Source |
|---------|-------------|--------|
| GSE242964 | Arabidopsis leaf circadian, 3 developmental days (Redmond 2024) | GEO |

## Citation

If using this framework or data, please cite:

```
[Authors]. Phase-Amplitude-Relationship (PAR2) Analysis Reveals Emergent 
Temporal Dynamics in Circadian-Cancer Gene Networks. [Journal]. [Year].
```

## License

- **Academic/Research**: Free to use with citation
- **Commercial (Pharma/Biotech)**: Contact for licensing terms
- **Patent**: UK patent pending

## Contact

[Corresponding author email]

---

Generated by PAR(2) Discovery Engine
Version: 2.0.0
Date: February 2026
