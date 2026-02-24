# Pre-Registered Validation Plan: External Replication + Orthogonal Validation

**Date frozen**: January 2026
**Status**: Pre-registered before validation attempted

---

## A. External Replication: Baboon Multi-Tissue Atlas

### Dataset
- **Accession**: GSE98965
- **Species**: *Papio anubis* (baboon)
- **Tissues**: 64 (22 brain regions + 42 peripheral)
- **Timepoints**: 12 (every 2h over 24h)
- **Samples**: 768
- **Publication**: Mure et al., *Science* 2018

### Why This Dataset?
- **Independent species** (primate vs mouse)
- **Independent lab** (Panda lab, Salk Institute)
- **Matched cadence** (Δt = 2h, same as GSE54650)
- **Massive tissue coverage** (64 tissues for directional test)

### Pre-Specified Gene Lists (Human/Primate Orthologs)

#### Oncofetal Markers
| Mouse Gene | Human/Primate Ortholog | Selection Rationale |
|------------|------------------------|---------------------|
| Clu | CLU | Revival stem cell marker |
| Tacstd2 | TACSTD2 | Trop2/fetal progenitor |
| Ly6a | LY6E (closest) | Stem cell antigen |
| Anxa1 | ANXA1 | Regenerative CSC marker |
| Sox2 | SOX2 | Pluripotency factor |
| Sox9 | SOX9 | Progenitor/metastasis |
| Yap1 | YAP1 | Hippo pathway effector |
| Wwtr1 | WWTR1 | TAZ/YAP paralog |
| Fosl1 | FOSL1 | Fra-1/AP-1 component |
| Igf2bp1 | IGF2BP1 | IMP1/mRNA stabilizer |

#### Clock Genes
| Mouse Gene | Human/Primate Ortholog | Role |
|------------|------------------------|------|
| Per1 | PER1 | Negative limb |
| Per2 | PER2 | Negative limb |
| Cry1 | CRY1 | Cryptochrome |
| Arntl | ARNTL | BMAL1/positive limb |
| Clock | CLOCK | Core activator |
| Nr1d1 | NR1D1 | REV-ERB alpha |

### Preprocessing Rules (Locked)
1. **Scale detection**: Apply scale guardrail
2. **Transform**: log2(x + 1) if not already log-scale
3. **Filtering**: Require gene detected in ≥80% of samples
4. **Δt normalization**: Report both λ and ρ = −ln(λ)/Δt

### Primary Endpoint
**Δρ = ρ_oncofetal − ρ_clock** (cadence-normalized persistence difference)

Or equivalently: **Δλ = λ_oncofetal − λ_clock**

### Statistical Tests (Pre-Specified)
1. **Primary**: Binomial sign test across tissues
   - H0: P(Δλ > 0) = 0.5
   - Success: p < 0.05 (one-tailed)
   
2. **Secondary**: Bootstrap 95% CI for mean Δλ
   - Success: CI excludes 0

3. **Robustness**: Welch t-test on pooled gene-tissue pairs
   - Descriptive only (not primary inference)

### Success Criteria
| Criterion | Threshold | Status |
|-----------|-----------|--------|
| Sign test p-value | < 0.05 | ◯ Pending |
| Bootstrap CI excludes 0 | Yes | ◯ Pending |
| Tissues with Δλ > 0 | ≥ 80% (≥51/64) | ◯ Pending |

### Failure Interpretation
- **Full failure**: Claim is mouse-specific or dataset-specific
- **Partial failure** (e.g., only metabolic tissues): Claim becomes tissue-restricted
- **Magnitude difference**: If effect is smaller, claim is "species-attenuated"

---

## B. Orthogonal Validation: Circadian Proteome Atlas

### Dataset
- **Portal**: https://prot-rhythm.prottalks.com/
- **Species**: Mouse (C57BL/6J)
- **Tissues**: 8 (SCN, thalamus, liver, gallbladder, BAT, kidney, heart, muscle)
- **Timepoints**: 23 (every 2h for 46h)
- **Proteins**: 11,651 quantified
- **Publication**: Mol Cell Proteomics 2023, PMID 37940002

### Why This Dataset?
- **Different modality** (protein vs mRNA)
- **Same species** as primary finding (mouse)
- **Matched cadence** (Δt = 2h)
- **Independent processing** (TMT proteomics vs RNA-seq)

### Pre-Specified Protein Lists

#### Oncofetal Markers (Protein Detection Expected)
| Gene | Protein | UniProt | Detection Expected |
|------|---------|---------|-------------------|
| Clu | Clusterin | Q06890 | High (abundant) |
| Sox9 | SOX9 | Q04887 | Medium |
| Yap1 | YAP1 | P46937 | High |
| Wwtr1 | TAZ | Q9EPK5 | Medium |
| Fosl1 | FRA-1 | P48755 | Medium |
| Igf2bp1 | IMP1 | O88477 | High |
| Anxa1 | Annexin A1 | P10107 | High (abundant) |

#### Clock Genes (Protein Detection Expected)
| Gene | Protein | UniProt | Detection Expected |
|------|---------|---------|-------------------|
| Per1 | PER1 | O35973 | Medium |
| Per2 | PER2 | O54943 | Medium |
| Cry1 | CRY1 | P97784 | Medium |
| Arntl | BMAL1 | Q9WTL8 | Medium |
| Nr1d1 | REV-ERB-α | Q3UV55 | High |

### Preprocessing Rules (Locked)
1. **Use provided abundance values** (already normalized by authors)
2. **Log2 transform** if linear scale
3. **Filter**: Require protein detected in ≥6 tissues
4. **Compute λ**: Same AR(2) fitting as transcriptomic data

### Primary Endpoint
**Δλ_protein = λ_oncofetal_protein − λ_clock_protein**

### Statistical Tests (Pre-Specified)
1. **Primary**: Sign test across 8 tissues
   - H0: P(Δλ > 0) = 0.5
   - For n=8, need ≥7/8 for p<0.05 (exact binomial)

2. **Secondary**: Bootstrap CI for Δλ
   - Success: CI excludes 0

3. **Cross-modality**: Compare protein Δλ to mRNA Δλ
   - Do they have same sign?

### Success Criteria
| Criterion | Threshold | Status |
|-----------|-----------|--------|
| Sign test (≥7/8 tissues) | p < 0.05 | ◯ Pending |
| Same direction as mRNA | Yes | ◯ Pending |
| Bootstrap CI excludes 0 | Yes | ◯ Pending |

### Failure Interpretation
- **Full failure**: Effect is transcription-specific, not translated to protein
- **Partial failure**: Effect is tissue-dependent at protein level
- **Magnitude difference**: Post-transcriptional regulation modifies persistence

---

## C. Combined Validation Matrix

| Validation Type | Dataset | Species | Modality | Status |
|-----------------|---------|---------|----------|--------|
| Primary finding | GSE54650 | Mouse | mRNA | ✓ Complete |
| External replication | GSE98965 | Baboon | mRNA | ◯ Pending |
| Orthogonal validation | ProtRhythm | Mouse | Protein | ◯ Pending |
| Cross-species orthogonal | (Future) | Baboon | Protein | ◯ Not available |

---

## D. Pre-Registration Commitment

### What We Will NOT Do (Anti-p-hacking)
1. **No gene list changes** after seeing results
2. **No preprocessing changes** to improve p-values
3. **No tissue subsetting** to find positive results (unless pre-specified)
4. **No switching primary endpoint** (sign test is primary)

### What We WILL Report
1. **All results**, including failures
2. **Effect sizes** regardless of significance
3. **Exploratory analyses** clearly labeled as such

### Amendments
Any changes to this plan after validation begins will be:
1. Documented with date and rationale
2. Clearly distinguished from pre-specified analyses
3. Labeled as "exploratory" in any publication

---

## E. Implementation Timeline

| Step | Task | Status |
|------|------|--------|
| 1 | Download GSE98965 baboon data | ◯ Pending |
| 2 | Map gene orthologs | ◯ Pending |
| 3 | Run AR(2) analysis on baboon | ◯ Pending |
| 4 | Fetch proteome data from ProtRhythm | ◯ Pending |
| 5 | Map proteins to gene lists | ◯ Pending |
| 6 | Run AR(2) analysis on protein | ◯ Pending |
| 7 | Compile validation report | ◯ Pending |

---

## F. Git Tag for Pre-Registration

This plan should be committed with tag: `preregistration-v1`

Command: `git tag -a preregistration-v1 -m "Pre-registered validation plan frozen"`

---

**Document frozen**: January 2026
**Primary author**: PAR(2) Discovery Engine
**Review status**: Ready for external validation
