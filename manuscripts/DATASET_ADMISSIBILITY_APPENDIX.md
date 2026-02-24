# Dataset Admissibility Appendix v2

## Tier Classification System

| Tier | Timepoints | Confidence Level | Supported Tests |
|------|------------|------------------|-----------------|
| **Tier 1** | ≥24 | High | All (AR(2), bootstrap, forecasting CV, null surveys) |
| **Tier 2** | 12-23 | Medium | AR(2), bootstrap, sign tests, permutation |
| **Tier 3** | 6-11 | Low | Limited (AR(2) with wide CIs, exploratory only) |
| **Excluded** | <6 | Inadmissible | None |

---

## Currently Loaded Datasets

### Mouse Multi-Tissue Atlas (Primary)
| Dataset | Tissues | Timepoints | Tier | Scale | Status |
|---------|---------|------------|------|-------|--------|
| **GSE54650** | 12 | 24 (2h × 48h) | **Tier 1** | RPKM | ✓ Complete |

### Primate (External Replication)
| Dataset | Tissues | Timepoints | Tier | Scale | Status |
|---------|---------|------------|------|-------|--------|
| **GSE98965** (Baboon) | 64 | 12 (2h × 24h) | **Tier 2** | FPKM | ✓ Complete |

### Human (Cross-Species)
| Dataset | System | Timepoints | Tier | Scale | Status |
|---------|--------|------------|------|-------|--------|
| **GSE48113** (Blood) | Peripheral blood | 7 | Tier 3 | Microarray | ✓ Complete |
| **GSE13949** (U2OS) | Human osteosarcoma | 48 | **Tier 1** | Microarray | ✓ Downloaded |
| **GSE56931** (Blood) | Human blood | 20 | Tier 2 | Microarray | Pending |

### Mouse Cell Line (Cell-Autonomous)
| Dataset | System | Timepoints | Tier | Scale | Status |
|---------|--------|------------|------|-------|--------|
| **GSE31049** (Hepatocyte) | MMH-D3 line | 24 | **Tier 1** | Microarray | ✓ Downloaded |

### Plant (Cross-Kingdom)
| Dataset | System | Timepoints | Tier | Scale | Status |
|---------|--------|------------|------|-------|--------|
| **GSE242964** (Arabidopsis) | 3 stages | 7 | Tier 3 | TPM | ✓ Complete |

### Cancer/Perturbation
| Dataset | System | Timepoints | Tier | Scale | Status |
|---------|--------|------------|------|-------|--------|
| **GSE157357** (Organoid) | WT/ApcKO/BmalKO | 24 | **Tier 1** | TPM | ✓ Complete |
| **GSE221103** (Neuroblastoma) | MYC ON/OFF | 12 | Tier 2 | TPM | ✓ Complete |
| **GSE56445** (TAZ/YAP) | siRNA perturbation | 3 | Excluded | Microarray | ✓ Complete |

---

## Test Battery Applicability by Dataset

### Test Categories

| Category | Description | Min Tier |
|----------|-------------|----------|
| A. QC/Admissibility | Scale detection, Δt verification, range checks | Any |
| B. Reality Checks | Time-scramble falsifier, phase randomization | Tier 2+ |
| C. Model Adequacy | AR order comparison, cosine competition | Tier 1+ |
| D. Core Inference | Welch t-test, permutation, sign test, bootstrap CI | Tier 2+ |
| E. Replication | Distribution overlap, LOOCV, tier-split | Tier 2+ |
| F. Sensitivity | Preprocessing sensitivity, tissue stratification | Any |

### Dataset × Test Matrix

| Dataset | A | B | C | D | E | F | Total Tests |
|---------|---|---|---|---|---|---|-------------|
| GSE54650 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24+ |
| GSE98965 | ✓ | ✓ | ◐ | ✓ | ✓ | ✓ | 20+ |
| GSE13949 | ✓ | ✓ | ✓ | ✓ | ◐ | ✓ | 22+ |
| GSE31049 | ✓ | ✓ | ✓ | ✓ | ◐ | ✓ | 22+ |
| GSE157357 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24+ |
| GSE48113 | ✓ | ◐ | ✗ | ◐ | ◐ | ✓ | 12+ |
| GSE242964 | ✓ | ◐ | ✗ | ◐ | ◐ | ✓ | 12+ |

---

## Recommended Validation Stack

### Priority 1: Resolve Mouse vs Primate Reversal

1. **GSE13949 (Human U2OS, 48 timepoints)**
   - Question: Does human behave like mouse or baboon?
   - Tests: Full AR(2) + category comparison
   - Expected: Tier-1 precision on human clock dynamics

2. **GSE31049 (Mouse Hepatocyte, 24 timepoints)**
   - Question: Is mouse effect cell-autonomous or systemic?
   - Tests: Full AR(2) + oncofetal vs clock
   - Expected: Confirms/refutes tissue-autonomous persistence

### Priority 2: Human Blood Extension

3. **GSE56931 (Human Blood, 20 timepoints)**
   - Question: Does "fast dynamics in blood" hold with more power?
   - Tests: AR(2) + comparison to tissue λ
   - Expected: Tier-2 precision, tighter CIs than GSE48113

### Priority 3: Orthogonal Modality

4. **Proteomics (PXD047352 or prot-rhythm.prottalks.com)**
   - Question: Does persistence translate to protein level?
   - Tests: AR(2) on protein abundance time series
   - Expected: Cross-modality validation (strongest upgrade)

---

## Species Coverage Summary

| Species | Datasets | Tier-1 | Tier-2 | Tier-3 |
|---------|----------|--------|--------|--------|
| Mouse | 5 | 3 | 1 | 1 |
| Human | 3 | 1 | 1 | 1 |
| Baboon | 1 | 0 | 1 | 0 |
| Arabidopsis | 1 | 0 | 0 | 1 |
| **Total** | **10** | **4** | **3** | **3** |

---

## Key Findings by Species

| Species | Clock λ | Oncofetal λ | Δλ | Direction |
|---------|---------|-------------|-----|-----------|
| Mouse (GSE54650) | 0.944 | 0.995 | +0.051 | Oncofetal > Clock |
| Baboon (GSE98965) | 0.946 | 0.804 | -0.142 | Clock > Oncofetal |
| Human (GSE48113) | 0.28* | - | - | Fast dynamics (blood) |

*Note: Human blood uses different tissue type (peripheral blood vs solid tissue)

---

## Preprocessing Harmonization Rules

| Rule | Implementation |
|------|----------------|
| Scale detection | Auto-detect via scaleGuardrail.ts |
| Log2 transform | log2(x + 1) for FPKM/TPM/counts |
| Offset handling | +1 for zeros before log |
| Normalization | None (use native scale per dataset) |
| Δt matching | Report ρ = −ln(λ)/Δt for cross-cadence |

---

## Falsifier Checklist by Dataset

| Falsifier | GSE54650 | GSE98965 | GSE13949 | GSE31049 |
|-----------|----------|----------|----------|----------|
| Time-scramble | ✓ | ✓ | ✓ | ✓ |
| AR order competition | ✓ | ◐ | ✓ | ✓ |
| Cosine comparison | ✓ | ◐ | ✓ | ✓ |
| Bootstrap CI | ✓ | ✓ | ✓ | ✓ |
| Permutation test | ✓ | ✓ | ✓ | ✓ |
| LOOCV | ✓ | ✓ | ◐ | ◐ |
| Forecasting CV | ✓ | ✗ | ✓ | ✓ |

---

## Document Status

- **Version**: 2.0
- **Last updated**: January 2026
- **Total datasets cataloged**: 10
- **Total tests defined**: 24+
- **Species covered**: 4 (Mouse, Human, Baboon, Arabidopsis)
