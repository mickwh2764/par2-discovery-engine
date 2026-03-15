# Paper F: Context-Dependent Expression Persistence

**Title:** Context-Dependent Expression Persistence: AR(2) Eigenvalue |λ| Is Independent of Intrinsic mRNA Half-Life

**Target journal:** Genome Biology

**Author:** Michael Whiteside

## Summary

This paper addresses a critical question for interpreting AR(2) eigenvalue-based gene expression analyses: does the eigenvalue modulus |λ| simply recapitulate intrinsic mRNA stability (half-life), or does it capture something distinct?

**Core finding:** The correlation between |λ| and experimentally measured mRNA half-life is near zero (ρ = 0.006, n = 5,945 genes), demonstrating that temporal persistence is independent of intrinsic transcript stability.

**Key results:**
- Near-zero correlation between |λ| and mRNA half-life (Sharova et al. 2009, mouse ESC data)
- IFIT1 case study: 31-minute mRNA half-life but |λ| = 0.72 (sustained interferon-driven retranscription)
- Cross-validation across 4 non-circadian datasets (Amit 2009, Tu 2005, Arbeitman 2002, Zaas 2009) spanning 3 species
- Three-part bias audit: time-shuffle destruction, irrelevant metric correlation, expression-matched null

**Biological interpretation:** |λ| measures context-dependent expression persistence—a systems-level property of the regulatory circuit (transcription factor dynamics, feedback loops, signaling cascades), not a molecular property of the transcript (decay rate).

## Files

- `Paper_F_Expression_Persistence.tex` — Complete manuscript
- `cover_letter.tex` — Cover letter for Genome Biology
- `expression_persistence_results.json` — Structured results data (correlations, cross-species validation, bias audit, exemplar genes)
- `Supplementary_Table_S1_HalfLife_Eigenvalue.csv` — Gene-level half-life vs eigenvalue data (50 representative genes across functional classes)
- `Supplementary_Table_S4_NonCircadian_Replication.csv` — Non-circadian replication results across 7 datasets (4 original + 3 new)
- `Supplementary_Table_S5_Robustness_DeepDive.csv` — 11-test robustness deep dive for non-circadian replication datasets
- `README.md` — This file

## Companion papers

This is Paper F in a series. Paper A (Core Methods, targeting PLOS Computational Biology) establishes the AR(2) eigenvalue modulus as a measure of circadian hierarchy. Paper F demonstrates that this metric is independent of mRNA half-life, confirming it captures genuinely novel biological information.

## Data availability

All source datasets are publicly available from NCBI GEO and published databases. Interactive results are available at https://par2-discovery-engine.replit.app.
