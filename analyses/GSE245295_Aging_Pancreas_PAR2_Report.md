# PAR(2) Eigenvalue Analysis: GSE245295 Aging Pancreas

## Dataset Information
- **Source**: Sharma et al., 2023, Aging
- **GEO Accession**: GSE245295
- **Title**: "Reorganization of pancreas circadian transcriptome with aging"
- **Organism**: Mouse (C57BL/6J male)
- **Samples**: Young (4mo) and Old (24mo), 6 timepoints each (ZT4-ZT24)
- **Analysis Date**: January 31, 2026

## Key Finding

**UNEXPECTED**: Aged pancreas shows STRONGER gearbox pattern than young pancreas!

| Age | Clock |λ| | Target |λ| | Gap | Pattern |
|-----|---------|-----------|-------|---------|
| **Young (4mo)** | 0.704 | 0.763 | **-0.059** | No gearbox |
| **Old (24mo)** | 0.846 | 0.511 | **+0.334** | Strong gearbox |

## Individual Gene Changes with Aging

### Clock Genes (INCREASE with age)
| Gene | Young |λ| | Old |λ| | Change |
|------|---------|--------|--------|
| Per1 | 0.598 | 0.811 | +0.212 |
| Per2 | 0.547 | 0.787 | +0.241 |
| Cry1 | 0.381 | 1.030 | +0.649 |
| Arntl | 0.536 | 0.818 | +0.282 |
| Nr1d2 | 0.658 | 0.897 | +0.239 |

### Target Genes (DECREASE with age)
| Gene | Young |λ| | Old |λ| | Change |
|------|---------|--------|--------|
| Wee1 | 1.062 | 0.251 | **-0.811** |
| Axin2 | 1.116 | 0.495 | -0.621 |
| Ccnd1 | 0.887 | 0.326 | -0.561 |
| Lgr5 | 1.000 | 0.707 | -0.293 |
| Cdkn1a | 0.654 | 0.370 | -0.284 |

## Interpretation

1. **Aging ENHANCES circadian persistence**: Clock genes show higher eigenvalues in old tissue, indicating stronger temporal stability

2. **Aging DAMPENS target gene dynamics**: Proliferative and Wnt signaling genes (Wee1, Axin2, Ccnd1, Lgr5) show reduced temporal persistence

3. **Not a simple degradation story**: The aging → cancer trajectory is NOT linear. Instead:
   - Young: Clock and target roughly equal (flexible, responsive)
   - Old: Clock dominates, targets dampened (rigid, less proliferative)
   - Cancer: Both converge (disrupted hierarchy)

## Biological Implications

This pattern suggests:
- **Young tissue**: Balanced circadian-proliferative coupling allows adaptive response
- **Aged tissue**: Circadian machinery strengthens while proliferative capacity wanes (may explain reduced regeneration with age)
- **Cancer**: Escapes circadian control entirely, allowing unregulated proliferation

## Full Trajectory Comparison

| Context | Clock |λ| | Target |λ| | Gap | Interpretation |
|---------|---------|-----------|-------|-------------|
| Healthy in-vivo (33 datasets) | 0.689 | 0.537 | **+0.152** | Normal hierarchy |
| Healthy organoid (GSE157357) | 0.723 | 0.331 | **+0.392** | Strong hierarchy |
| Young pancreas (4mo) | 0.704 | 0.763 | **-0.059** | Flexible/responsive |
| Old pancreas (24mo) | 0.846 | 0.511 | **+0.334** | Rigid/dampened |
| PDA cancer organoids | 0.611 | 0.616 | **-0.006** | Disrupted |
| APC-mutant organoid | 0.530 | 0.652 | **-0.122** | Reversed |

## Conclusion

The aging pancreas data reveals that the gearbox hypothesis is more nuanced than a simple degradation model:
1. **Normal tissue**: Moderate gearbox (Clock > Target by ~15%)
2. **Aged tissue**: Enhanced gearbox (Clock >> Target by ~33%)
3. **Cancer**: Collapsed gearbox (Clock ≈ Target)

This suggests cancer is not simply "accelerated aging" but a distinct disruption of circadian-proliferative hierarchy.
