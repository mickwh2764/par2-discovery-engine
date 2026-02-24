# PAR(2) Circadian Gating Paper - Cell Format

## Files

- `manuscript.tex` - Main LaTeX document formatted for Cell journal
- `references.bib` - Complete BibTeX bibliography
- `cell.bst` - Cell journal bibliography style

## Compiling

To compile the PDF:

```bash
pdflatex manuscript
bibtex manuscript
pdflatex manuscript
pdflatex manuscript
```

Or use latexmk:
```bash
latexmk -pdf manuscript
```

## Requirements

- LaTeX distribution (TeX Live, MiKTeX, or MacTeX)
- Required packages: geometry, times, graphicx, amsmath, booktabs, natbib, hyperref, etc.

## Contents

This manuscript presents the PAR(2) Discovery Engine findings:

1. **Gatekeeper Switching Phenomenon** - Circadian system reprioritizes targets during disease
2. **Wild-Type**: Tead1/Pparg (developmental gating)
3. **BMAL1-Mutant**: Lgr5/Mdm2 (stem cell protection)
4. **APC-Mutant**: 34-hit hypervigilance (cell cycle control)
5. **Double-Mutant**: Sirt1 only (last remaining gatekeeper)

## Data Source

All analyses use GSE157357 from NCBI GEO (PMID: 34534703).
