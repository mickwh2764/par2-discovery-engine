# Revised Sections for Fibonacci Quarterly Reply Paper

**Document:** "A Time-Domain Analogue to Fibonacci Structure via Phase-Gated AR(2) Dynamics: Reply to Boman"

**Date:** January 4, 2026

**Purpose:** Incorporate validation findings into manuscript

---

## REVISED SECTION 3.3: Fibonacci-consistent constraints in time

### Original Text:
> "In a crypt-level stochastic setting, it is neither necessary nor realistic to demand exact Fibonacci coefficients. Instead, we require that... the cloud of coefficients falls near a golden-ratio-consistent manifold associated with Boman-like asymmetric division rules."

### Revised Text:

In a crypt-level stochastic setting, it is neither necessary nor realistic to demand exact Fibonacci coefficients. Instead, we propose that:

1. The AR(2) coefficients (φ₁, φ₂) for a phase-aligned observable xₜ lie within a compact, stable region of the parameter plane.

2. The associated roots r₁,₂ are complex with |r₁,₂| < 1 and arg(r) within a narrow range, encoding a dominant temporal scale.

3. Under projection onto a reduced parameter space, the distribution of coefficients may cluster near stability regions, though genome-wide enrichment in a specific "Fibonacci band" (|λ| ∈ [0.518, 0.718]) is not universally observed.

**Empirical validation across 31 circadian datasets (533,005 gene-series fits) reveals that only 3 of 15 tested conditions show statistically significant enrichment above null expectations (permutation z > 2).** Notably, one condition—APC-knockout intestinal organoids—does show significant enrichment (z = 4.4, p < 0.05), while wild-type organoids do not (z = −0.6). This suggests that the Fibonacci-consistent region may function as a **pathological attractor** under oncogenic mutation rather than a universal healthy-tissue property.

In other words, Boman's Fibonacci structure is treated as a potential attractor in coefficient space rather than an exact equality, with the caveat that attractor behavior may be condition-specific. Deviations in |λ| still map naturally to perturbations of the underlying tissue code, as disease states consistently show elevated mean eigenvalues (+0.1 to +0.2 shift) across three independent models: Alzheimer's (GSE261698), MYC-driven cancer (GSE221103), and APC mutation (GSE157357).

---

## REVISED SECTION 4: Application to Rhythmic Organoid Data (GSE157357)

### Additional Paragraph After Table 1:

**Null Model Validation**

To assess whether the observed AR(2) eigenvalue distributions reflect genuine temporal structure rather than statistical artifacts, we performed permutation testing. For each gene, the time-order of expression values was shuffled 100 times, destroying autocorrelation while preserving marginal distributions. The proportion of eigenvalues falling within the Fibonacci range (|λ| ∈ [0.518, 0.718]) was computed for both observed and null distributions.

Results for GSE157357 organoid conditions:

| Condition | Observed Fib% | Null Fib% (mean ± SD) | z-score | Significant? |
|-----------|---------------|----------------------|---------|--------------|
| WT-WT | 27.9% | 28.9% ± 1.2% | −0.56 | No |
| ApcKO-WT | 34.8% | 28.5% ± 1.1% | **4.41** | **Yes** |
| WT-BmalKO | 30.1% | 29.0% ± 1.1% | 1.85 | No |
| ApcKO-BmalKO | 24.9% | 25.4% ± 0.9% | −1.50 | No |

Contrary to initial expectations, wild-type organoids do not show statistically significant enrichment in the Fibonacci stability band. However, APC-knockout organoids (a colorectal cancer model) show robust enrichment (z = 4.4), suggesting that loss of the APC tumor suppressor creates an aberrant stability regime rather than disrupting a pre-existing healthy attractor.

This finding reframes the PAR(2) hypothesis: rather than healthy tissue maintaining Fibonacci homeostasis that disease disrupts, the data suggest that **certain oncogenic mutations may impose a pathological stability constraint** detectable via AR(2) eigenvalue profiling.

### Revised Interpretation Paragraph:

A natural next step would be to:

- Move from univariate AR(2) to multivariate VAR(2) models for panels of genes.
- Fit phase-dependent coefficients, yielding explicit (φ₁(θ), φ₂(θ)) functions.
- Test whether the inferred coefficients for renewal-relevant composites show condition-specific enrichment, with particular attention to datasets with ≥12 timepoints where estimator stability is ensured.
- **Include the GSE261698 mouse cortical glia dataset**, which shows the strongest Fibonacci enrichment observed (z = 23.1 in wild-type), representing a potential positive control for the attractor hypothesis.

---

## NEW SECTION: Limitations and Caveats

### Suggested Addition (Section 6 or within Discussion):

**Methodological Limitations**

Several caveats apply to the PAR(2) framework as presented:

1. **Timepoint sensitivity:** AR(2) coefficient estimates become unstable for time series with fewer than 10 samples. Datasets with ≤6 timepoints show elevated "explosive" rates (|λ| > 1) that collapse under alternative estimators (Yule-Walker), indicating estimation noise rather than biological instability.

2. **Period distribution:** Analysis of complex-root genes reveals that only ~10% have periods in the circadian range (20–28 hours when converted from timepoint units). The majority (47%) show ultradian periods (<12 hours), suggesting that AR(2) captures diverse oscillatory dynamics, not exclusively circadian rhythms.

3. **Null model calibration:** The Fibonacci range [0.518, 0.718] accumulates ~25–28% of genes under permutation null models, indicating that this proportion is partly determined by the shape of the eigenvalue distribution rather than by a biological attractor. Enrichment claims require comparison to null expectations.

4. **Clock gene enrichment:** Known circadian clock genes (Per1/2, Cry1/2, Bmal1, etc.) do not preferentially fall within the Fibonacci band in most tissues; some datasets show 0.2–0.4× depletion rather than enrichment.

These limitations do not invalidate the theoretical connection between AR(2) dynamics and Boman's asymmetric division model, but they constrain the empirical claims that can be made about Fibonacci-specific biology.

---

## SUMMARY OF CHANGES

| Section | Change Type | Rationale |
|---------|-------------|-----------|
| 3.3 | Soften claims | Null model shows most datasets not enriched |
| 4 | Add validation table | Transparency about statistical significance |
| 4 | Reframe interpretation | ApcKO signal suggests pathological attractor |
| New | Add limitations section | Address reviewer concerns preemptively |
| Throughout | Reference GSE261698 | Strongest positive evidence (z=23) |

---

*Revisions prepared by PAR(2) Discovery Engine validation analysis*
*January 4, 2026*
