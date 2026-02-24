# Appendix: Dataset Admissibility for AR(2)/PAR(2) Analysis

## Admissibility Criteria

Following standard AR(2) requirements and Popper-style falsification principles, datasets are classified into three tiers based on their suitability for AR(2) inference:

### Timepoint Requirements

| Tier | Timepoints | Status | Use Case |
|------|------------|--------|----------|
| **Tier 1** | ≥24 | Gold Standard | Hard falsification, definitive claims |
| **Tier 2** | 12-23 | Adequate | Reliable inference with wider confidence intervals |
| **Tier 3** | <12 | Exploratory | Hypothesis generation, not for definitive claims |

**Rationale**: 
- **Computational minimum**: 6 timepoints (yields 4 observations for 3 parameters, but only 1 df—unreliable)
- **Scientific minimum**: ≥12 timepoints for any interpretable claims (10 observations, 7 df)
- **Hard falsification**: ≥24 timepoints for definitive claims (22 observations, 19 df; sufficient for permutation tests, LOTO validation, and bootstrap CIs)

---

## Dataset Admissibility Table

### Tier 1: Gold Standard (≥24 timepoints)

| Dataset | Organism | Tissue | Timepoints | Interval | Coverage | Admissible |
|---------|----------|--------|------------|----------|----------|------------|
| GSE11923 | Mouse | Liver | 48 | 1h | 2 cycles | **YES** |
| GSE54650 (×12 tissues) | Mouse | Multi-tissue | 24 | 2h | 2 cycles | **YES** |
| GSE30411 | Mouse | Liver | 24 | 2h | 2 cycles | **YES*** |
| GSE261698 APP/WT | Mouse | Brain | 24 | 2h | 2 cycles | **YES** |

*Note: GSE30411 requires GPL6096 annotation for gene-level analysis (currently unavailable).

### Tier 2: Adequate (12-23 timepoints)

| Dataset | Organism | Tissue | Timepoints | Interval | Coverage | Admissible |
|---------|----------|--------|------------|----------|----------|------------|
| GSE157357 (×6 conditions) | Mouse | Organoid | 22 | 2h | ~2 cycles | **YES** |
| GSE242964 (by day) | Arabidopsis | Seedling | 18-21 | 4h | 1 cycle | **YES** |
| GSE221103 | Human | Neuroblastoma | 14 | 4h | 1 cycle | **YES** |
| GSE201207 | Mouse | Kidney | 12 | 4h | 1 cycle | **MARGINAL** |
| GSE59396 | Mouse | Lung | 12 | 4h | 1 cycle | **MARGINAL** |

### Tier 3: Exploratory (<12 timepoints)

| Dataset | Organism | Tissue | Timepoints | Interval | Coverage | Admissible |
|---------|----------|--------|------------|----------|----------|------------|
| GSE48113 | Human | Blood | 7/subject | 4h | 28h | **NO** |
| GSE17739 | Mouse | Kidney | 6 | 4h | 1 cycle | **NO** |
| GSE148794 | Mouse | Colon | 6 | varies | recovery | **NO** |

---

## Detailed Dataset Notes

### GSE11923 (Gold Standard)
- **Source**: Hughes, Hogenesch et al. (PNAS 2009)
- **Design**: Pooled liver samples every hour for 48h
- **Platform**: Affymetrix Mouse Genome 430 2.0
- **Verdict**: **PASS** - Highest resolution circadian dataset available

### GSE54650 (Gold Standard)
- **Source**: Zhang et al. (PNAS 2014)
- **Design**: 12 tissues, 24 timepoints each (2h cadence spanning 48h)
- **Platform**: Affymetrix MoGene 1.0 ST
- **Verdict**: **PASS** - Multi-tissue atlas, primary validation set

### GSE48113 (Exploratory Only)
- **Source**: Archer et al. (PNAS 2014)
- **Design**: Forced desynchrony protocol, 7 timepoints per subject
- **Platform**: Illumina HumanHT-12 V4
- **Limitation**: Short time series limits AR(2) precision
- **Verdict**: **USE WITH CAUTION** - Good for detecting any temporal structure, not for manifold/band claims

### GSE157357 (Adequate)
- **Source**: Stokes et al. (Nat Commun 2021)
- **Design**: 6 organoid conditions, 22 timepoints each
- **Platform**: RNA-seq
- **Verdict**: **PASS** - Good for crypt-specific dynamics, condition comparisons

### GSE242964 (Adequate)
- **Source**: Redmond et al. (2024)
- **Design**: Arabidopsis seedlings, 3 developmental stages
- **Platform**: RNA-seq (Salmon TPM)
- **Verdict**: **PASS** - Cross-kingdom validation, adequate timepoints

### GSE17739 (Exploratory Only)
- **Source**: Zuber et al.
- **Design**: Kidney collecting duct, 6 timepoints
- **Verdict**: **USE WITH CAUTION** - Below AR(2) reliability floor

---

## Admissibility Checklist for New Datasets

Before including a dataset in PAR(2) analysis, verify:

- [ ] **Timepoints**: ≥12 for adequate inference, ≥24 for gold standard
- [ ] **Equal intervals**: Consistent sampling (e.g., every 2h, 4h)
- [ ] **Multi-cycle**: Ideally ≥2 circadian periods (48h)
- [ ] **Replicates**: Pooled or averaged across biological replicates
- [ ] **Normalization**: Log-transformed, quantile-normalized
- [ ] **Gene annotation**: Probe IDs mapped to gene symbols

---

## Summary Statistics

| Tier | Datasets | Total Conditions | Falsification Power |
|------|----------|------------------|---------------------|
| Tier 1 | 4 | 16+ | **High** |
| Tier 2 | 5 | 12+ | **Medium** |
| Tier 3 | 3 | 5+ | **Low** |

**Conclusion**: The PAR(2) Discovery Engine has sufficient Tier 1 datasets (GSE11923, GSE54650) for rigorous Popper-style falsification. Tier 2 datasets provide adequate replication across organisms and tissues. Tier 3 datasets are flagged as exploratory and should not be used for definitive claims.
