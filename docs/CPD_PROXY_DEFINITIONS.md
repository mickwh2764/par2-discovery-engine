# C/P/D Compartment Proxy Definitions for Boman Model Bridge

## Overview

This document defines gene proxies for the three-compartment Boman model:
- **C (Cycling)**: Actively dividing stem/progenitor cells
- **P (Proliferative-poised)**: Quiescent/G0-like cells capable of re-entering cycle
- **D (Differentiated)**: Terminally differentiated cells with limited/no division capacity

## Rationale

Per Boman 2020/2026, the key prediction for APC mutation is:
- **P ↑ dramatically** (normal 17% → adenoma 54%)
- **D ↓ substantially** (normal 66% → adenoma 29%)
- **C changes modestly** (normal 22% → adenoma 16%)

If the AR(2) eigenvalue (|λ|) shift seen in ApcKO organoids reflects this kinetic distortion, we expect:
1. **P-proxy** shows the largest |λ| increase (greater persistence = slower turnover)
2. **D-proxy** shows altered damping/stability
3. **C-proxy** shows smaller changes

---

## Gene Set Definitions

### C-Compartment (Cycling/Active Division)

Markers of active cell cycle progression:

| Gene | Ensembl ID | Role |
|------|------------|------|
| MKI67 | ENSMUSG00000031004 | Proliferation marker, S-G2-M |
| PCNA | ENSMUSG00000027342 | DNA replication, S-phase |
| TOP2A | ENSMUSG00000020914 | G2/M topoisomerase |
| CCNB1 | ENSMUSG00000041431 | Cyclin B1, G2/M |
| CCNA2 | ENSMUSG00000027715 | Cyclin A2, S/G2 |
| CDK1 | ENSMUSG00000019942 | Master G2/M kinase |
| AURKA | ENSMUSG00000027496 | Mitotic kinase |
| MCM2 | ENSMUSG00000002870 | Replication licensing |
| CDC20 | ENSMUSG00000006398 | APC/C activator, M-phase |
| PLK1 | ENSMUSG00000030867 | Polo-like kinase 1, mitosis |

**Mouse symbols**: Mki67, Pcna, Top2a, Ccnb1, Ccna2, Cdk1, Aurka, Mcm2, Cdc20, Plk1

### P-Compartment (Proliferative-Poised/Quiescent)

Markers of G0/quiescence with retained proliferative potential:

| Gene | Ensembl ID | Role |
|------|------------|------|
| CDKN1A | ENSMUSG00000023067 | p21, G1 arrest/quiescence |
| CDKN1B | ENSMUSG00000049889 | p27, quiescence maintenance |
| CDKN1C | ENSMUSG00000037664 | p57, quiescence |
| RB1 | ENSMUSG00000022105 | G0/G1 checkpoint |
| FBXO32 | ENSMUSG00000022358 | Quiescence-associated |
| BTG1 | ENSMUSG00000024950 | Anti-proliferative, G0/G1 |
| GADD45A | ENSMUSG00000036390 | Growth arrest |
| CCND1 | ENSMUSG00000070348 | Cyclin D1, G1 (poised for entry) |
| E2F4 | ENSMUSG00000014349 | Repressive E2F, quiescence |
| DDIT3 | ENSMUSG00000025408 | CHOP, stress-induced arrest |

**Mouse symbols**: Cdkn1a, Cdkn1b, Cdkn1c, Rb1, Fbxo32, Btg1, Gadd45a, Ccnd1, E2f4, Ddit3

### D-Compartment (Differentiated)

Tissue-specific differentiation markers (intestinal epithelium focus):

| Gene | Ensembl ID | Role |
|------|------------|------|
| VIL1 | ENSMUSG00000050505 | Villin, enterocyte brush border |
| CDX2 | ENSMUSG00000029646 | Intestinal differentiation TF |
| MUC2 | ENSMUSG00000025515 | Goblet cell mucin |
| CHGA | ENSMUSG00000021194 | Chromogranin A, enteroendocrine |
| LYZ | ENSMUSG00000069516 | Lysozyme, Paneth cell |
| FABP2 | ENSMUSG00000023057 | Fatty acid binding, enterocyte |
| SI | ENSMUSG00000090531 | Sucrase-isomaltase, enterocyte |
| KRT20 | ENSMUSG00000044041 | Keratin 20, differentiated epithelium |
| AQP1 | ENSMUSG00000004655 | Water channel, epithelial |
| ALPI | ENSMUSG00000025534 | Intestinal alkaline phosphatase |

**Mouse symbols**: Vil1, Cdx2, Muc2, Chga, Lyz1/Lyz2, Fabp2, Sis, Krt20, Aqp1, Alpi

---

## Composite Score Calculation

For each compartment, the proxy time series is computed as:

```
Compartment_score(t) = geometric_mean(normalized_expression(gene_i, t))
```

Where normalization is z-score per gene across all timepoints.

Alternatively, for robustness:
```
Compartment_score(t) = first_principal_component(genes_in_compartment)
```

---

## Expected AR(2) Predictions (Boman Model)

| Compartment | Normal→APC Prediction | AR(2) |λ| Expectation |
|-------------|----------------------|------------------------|
| **P (Poised)** | Expansion, slower turnover | **|λ| ↑** (higher persistence) |
| **D (Diff)** | Reduction, altered damping | |λ| may ↑ or ↓ (less stable) |
| **C (Cycling)** | Modest change | Minimal |λ| shift |

---

## Implementation Notes

1. **Gene availability check**: Not all genes may be present in each dataset. Require ≥5/10 genes per compartment for valid proxy.

2. **Cross-species mapping**: For human datasets, use human symbols directly. For mouse, use symbols above.

3. **Expression threshold**: Exclude genes with >50% zero values (not reliably detected).

4. **Time series requirement**: Minimum 8 timepoints for AR(2) fitting.

---

## Falsification Criteria

The Boman bridge hypothesis is **falsified** if:
1. P-proxy shows no |λ| increase in ApcKO vs WT (fails primary prediction)
2. |λ| shift is not larger in P than in C (wrong compartment)
3. Effect does not survive permutation null (artifact)
4. Effect is sensitive to band width choice (arbitrary threshold)

---

## References

- Boman BM, et al. (2020) Cancers 12(3):537
- Boman BM, et al. (2026) Cancers [in review]
- Whitfield ML, et al. (2002) Mol Biol Cell - cell cycle gene sets
- Tirosh I, et al. (2016) Science - quiescence signatures
