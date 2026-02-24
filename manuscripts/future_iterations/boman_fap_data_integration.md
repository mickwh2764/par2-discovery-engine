# Boman FAP Patient Data — Future Integration Plan

## Status: STORED FOR FUTURE USE (not yet integrated into visualization)
## Date: 2026-02-15

---

## Source Paper
Boman RM, Schleiniger G, Raymond C, Palazzo J, Shehab A, Boman BM.
"A Tissue Renewal-Based Mechanism Drives Colon Tumorigenesis."
*Cancers* 2026;18:44. DOI: https://doi.org/10.3390/cancers18010044

## Boman's C/P/D Model

Three cell types in the colonic crypt:
- **C** = Cycling (actively dividing) cells
- **P** = Proliferative non-cycling (G0-like, quiescent) cells
- **D** = Differentiated cells (unable to divide)

### Five governing equations (autocatalytic polymerization):
```
(1) Symmetric Division:        C → 2C           (rate k1)
(2) Autocatalytic Polymerization: C + P → 2P     (rate k2)
(3) Asymmetric Division:       P → P + D         (rate k3)
(4) Extrusion:                 D → out           (rate k4)
(5) Apoptosis:                 P → out           (rate k5)
```

### ODEs:
```
dC/dt = (k1 - k2·P)·C
dP/dt = (k2·C - k5)·P
dD/dt = k3·P - k4·D
```

### Equilibrium:
```
C* = k5/k2
P* = k1/k2
D* = k1·k3 / (k2·k4)
```

## Actual FAP Patient Data (Table 1)

| | C cells | P cells | D cells |
|---|---|---|---|
| Normal | 22% | 17% | 66% |
| FAP (APC+/-) | 14% | 24% | 62% |
| Adenoma | 16% | 54% | 29% |

### Rate constant changes (Figure 3):
| | k2 change | k5 change | k3/k4 change |
|---|---|---|---|
| FAP vs Normal | ↓1.6x | ↓2.6x | ↓1.6x |
| Adenoma vs Normal | ↓3.8x | ↓5.3x | ↓8.8x |

### Population fold-changes:
| | C fold-change | P fold-change | D fold-change |
|---|---|---|---|
| FAP/Normal | 0.82 | 1.4 | 0.94 (1.1x decrease) |
| Adenoma/Normal | 0.94 | 3.2 | 0.44 (2.3x decrease) |

## Mapping Issues: Boman C/P/D vs Our Stem/TA/Diff

### What maps:
- Boman's D → Our Differentiated: reasonably equivalent
- Boman's P expansion → Our TA zone expansion: directionally correct
- Population shift trends match our slider behavior

### What DOESN'T map:
1. **Boman's C ≠ Our Stem cells.** His C cells are ALL cycling cells throughout
   the crypt (lower 2/3), not just the 5 LGR5+ cells at the base.
2. **Our model is spatial, Boman's is population-based.** C and P cells can coexist
   at the same crypt level — distinguished by cell cycle state, not position.
3. **Numbers don't match.** Our 250-cell crypt: 2% stem / 63% TA / 35% diff.
   Boman's normal: 22% C / 17% P / 66% D. Different measurement bases.
4. **Boman's equilibrium is oscillatory.** Our slider shows static snapshots.

## Proposed Implementation Options

### Option A: Reference Panel (RECOMMENDED)
Add measured Boman percentages alongside visualization with clear labelling
showing how spatial model relates to but differs from population model.

### Option B: Boman Data Mode Toggle
Switch visualization from anatomical model to Boman's C/P/D percentages.
Color scheme changes to C/P/D classification. Clearly labelled as population
fractions, not spatial positions.

### Option C: Dual View
Side-by-side showing our spatial model AND Boman's population fractions,
with annotations showing the relationship.

## Key Boman Insight for Crypt Visualization
Cancer is NOT driven by faster cell cycling (C cells stay ~stable at 14-22%).
It IS driven by accumulation of non-cycling proliferative cells (P: 17% → 54%)
that fail to differentiate. The rate of polymerization (k2) slows, creating a
bottleneck where cells pile up in the proliferative state.
