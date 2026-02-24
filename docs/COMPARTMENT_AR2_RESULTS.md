# Compartment-Level AR(2) Analysis Results

## Overview

This analysis tests the Boman model prediction that APC mutation causes:
- **P (Proliferative-poised)**: Expansion → higher temporal persistence (|λ|↑)
- **C (Cycling)**: Minimal change
- **D (Differentiated)**: Reduction → altered stability

## Results Summary

| Dataset | Compartment | Genes Found | Mean |λ| | Stable | Oscillatory |
|---------|-------------|-------------|---------|--------|-------------|
| GSE157357 WT-WT | C | 10/10 | 0.4373 | true | true |
| GSE157357 WT-WT | P | 8/10 | 0.4362 | true | false |
| GSE157357 WT-WT | D | 8/10 | 0.3838 | true | true |
| GSE157357 ApcKO-WT | C | 10/10 | 0.6331 | true | false |
| GSE157357 ApcKO-WT | P | 8/10 | 0.4855 | true | false |
| GSE157357 ApcKO-WT | D | 7/10 | 0.6451 | true | false |
