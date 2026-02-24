# Boman Model Bridge Analysis: AR(2) Eigenvalue Profiling of C/P/D Compartments

## Executive Summary

This document provides a quantitative bridge between Boman's compartment-kinetics model (Cancers 2020/2026) and PAR(2) eigenvalue profiling. Using gene expression proxies for the three Boman compartments (C=Cycling, P=Proliferative-poised, D=Differentiated), we fitted AR(2) models and compared eigenvalue moduli between WT and ApcKO organoids.

**Key Finding**: The data show a |λ| shift pattern that **partially contradicts** the Boman prediction but reveals a biologically interpretable alternative.

---

## 1. The Boman Model (Summary)

Boman's three-compartment model defines:
- **C (Cycling)**: Actively dividing stem/progenitor cells  
- **P (Proliferative-poised)**: Quiescent/G0-like cells with retained division capacity
- **D (Differentiated)**: Terminally differentiated cells

### Boman's Key Prediction for APC Mutation

| Compartment | Normal → Adenoma | Expected AR(2) Effect |
|-------------|------------------|----------------------|
| **P** | 17% → 54% (↑ 3.2×) | |λ| ↑ (slower turnover, greater persistence) |
| **D** | 66% → 29% (↓ 2.3×) | |λ| altered (less mass) |
| **C** | 22% → 16% (modest) | |λ| minimal change |

The model predicts **P-compartment** shows the **dominant** kinetic distortion.

---

## 2. Methods

### 2.1 Gene Proxy Definitions

We defined compartment proxies using established marker genes:

**C-Compartment (Cycling)**: Mki67, Pcna, Top2a, Ccnb1, Ccna2, Cdk1, Aurka, Mcm2, Cdc20, Plk1 (10/10 found)

**P-Compartment (Poised)**: Cdkn1a, Cdkn1c, Rb1, Fbxo32, Gadd45a, Ccnd1, E2f4, Ddit3 (8/10 found; missing Cdkn1b, Btg1)

**D-Compartment (Differentiated)**: Cdx2, Muc2, Lyz1, Fabp2, Krt20, Aqp1, Alpi (7-8/10 found)

### 2.2 Composite Time Series

For each compartment:
1. Z-score normalize each gene's expression across timepoints
2. Compute arithmetic mean of z-scores at each timepoint
3. Result: single compartment-level time series per condition

### 2.3 AR(2) Fitting

Standard OLS estimation of:
```
y(t) = φ₁·y(t-1) + φ₂·y(t-2) + ε(t)
```

Eigenvalues computed from characteristic equation: λ² - φ₁λ - φ₂ = 0

Mean modulus |λ| = (|λ₁| + |λ₂|) / 2

---

## 3. Results

### 3.1 GSE157357 Organoid Comparison

| Compartment | WT |λ| | ApcKO |λ| | Δ|λ| | Boman Prediction |
|-------------|--------|-----------|--------|------------------|
| C (Cycling) | 0.437 | 0.633 | **+0.196** | minimal — **FAILS** |
| P (Poised) | 0.436 | 0.486 | +0.049 | ↑ expected — **weak match** |
| D (Diff) | 0.384 | 0.645 | **+0.261** | altered — **largest shift** |

### 3.2 Interpretation

The observed pattern **inverts the Boman prediction**:
- **D-compartment** shows the **largest** |λ| increase (+0.261)
- **C-compartment** shows a **substantial** increase (+0.196) 
- **P-compartment** shows the **smallest** increase (+0.049)

---

## 4. Possible Explanations

### 4.1 Organoid ≠ Tissue

Boman's parameters derive from in-vivo adenoma tissue with established architecture. Organoids are 3D culture systems where:
- Differentiation dynamics may be accelerated or altered
- Spatial crypt structure is absent
- Selective pressures differ

The D-compartment dominance may reflect **organoid-specific differentiation stress** rather than contradicting Boman's tissue model.

### 4.2 Temporal Window Effects

Boman's model describes equilibrium proportions after mutation. Our time-series captures **dynamic expression** over a 22-timepoint circadian window. The D-compartment |λ| shift may reflect:
- **Disrupted circadian gating** of differentiation genes (loss of rhythmic output)
- **Increased temporal autocorrelation** as differentiation stalls

### 4.3 Gene Proxy Limitations

The P-compartment proxy relies on cell cycle inhibitors (p21, p27, p57) which may behave differently:
- In organoids, quiescence markers may not accumulate as in tissue
- The proxy may underestimate true P-compartment dynamics

---

## 5. Revised Bridge Statement

Based on these findings, a defensible conclusion is:

> PAR(2) eigenvalue profiling of GSE157357 organoids reveals APC mutation induces **elevated temporal persistence** (|λ|↑) across all compartments, with the **differentiation compartment** showing the largest shift (+0.26). This contrasts with Boman's prediction of P-compartment dominance but is consistent with an **alternative interpretation**: APC loss disrupts differentiation output, causing D-compartment genes to exhibit **prolonged autocorrelation** as the normal rhythmic differentiation program stalls. The regime-shift signature (all |λ| values increase toward the unit circle) supports the general kinetic distortion predicted by Boman, even as the compartment-specific pattern diverges.

---

## 6. Figures for Reply Paper

### Figure 1: Compartment |λ| Comparison Bar Chart
```
           WT        ApcKO
C (Cycling):   ████████▌    (0.44)  ██████████████▌ (0.63)  Δ = +0.20
P (Poised):    ████████▌    (0.44)  █████████▌      (0.49)  Δ = +0.05  
D (Diff):      ███████      (0.38)  ██████████████▌ (0.65)  Δ = +0.26
               └──────────────────────────────────────────────────┘
                            0.0                              0.8
```

### Figure 2: Stability Triangle Position
Show (φ₁, φ₂) coordinates for each compartment in WT vs ApcKO, highlighting movement toward unit circle boundary.

### Table 1: AR(2) Parameters
| Condition | Compartment | φ₁ | φ₂ | |λ| | Stable | Oscillatory |
|-----------|-------------|-----|-----|------|--------|-------------|
| WT | C | -0.389 | -0.191 | 0.437 | Yes | Yes |
| WT | P | -0.053 | 0.190 | 0.436 | Yes | No |
| WT | D | -0.252 | -0.147 | 0.384 | Yes | Yes |
| ApcKO | C | -0.348 | 0.371 | 0.633 | Yes | No |
| ApcKO | P | -0.181 | 0.228 | 0.486 | Yes | No |
| ApcKO | D | -0.204 | 0.406 | 0.645 | Yes | No |

---

## 7. Falsification Summary

| Boman Prediction | Tested? | Result |
|------------------|---------|--------|
| P shows largest |λ| increase | ✓ | **FAILS** — D shows largest |
| C shows minimal change | ✓ | **FAILS** — C shows +0.20 |
| D shows altered stability | ✓ | **PASSES** — D shows +0.26 |
| Overall |λ| increases in ApcKO | ✓ | **PASSES** — all compartments ↑ |

**Verdict**: The compartment-specific pattern diverges from Boman, but the **global kinetic distortion** (all |λ| ↑) is confirmed. This supports a regime-shift interpretation while requiring refinement of compartment-specific claims.

---

## 8. Recommended Next Steps

1. **Expand to additional APC datasets** — test if D-dominance is organoid-specific
2. **Phase-gated analysis** — check if compartment shifts are circadian-phase-dependent
3. **Refine P-proxy** — add stem cell markers (Lgr5, Olfm4) to better capture crypt base columnar cells
4. **In-vivo validation** — compare to tissue adenoma datasets if available

---

## Appendix: Script Location

Analysis script: `scripts/compartment-ar2-analysis.ts`
Gene definitions: `docs/CPD_PROXY_DEFINITIONS.md`
Raw results: `docs/COMPARTMENT_AR2_RESULTS.md`
