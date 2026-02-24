# PAR(2) Discovery Engine - User Operational Manual

**Document ID:** PAR(2)-UM-2026-V1.0  
**Version:** 1.0.6 | Regulatory Compliance Edition  
**Date of Issue:** February 2026  
**Division of Computational Oncology**

---

## Table of Contents

1. [System Introduction](#1-system-introduction)
2. [Data Management & Quality Standards](#2-data-management--quality-standards)
3. [Operational Workflow](#3-operational-workflow)
4. [Analysis Types](#4-analysis-types)
5. [Multi-Omics Integration](#5-multi-omics-integration)
6. [Visualization Tools](#6-visualization-tools)
7. [Embedded Reference Datasets](#7-embedded-reference-datasets)
8. [Mathematical Framework](#8-mathematical-framework)
9. [Results Interpretation Guide](#9-results-interpretation-guide)
10. [Troubleshooting & Diagnostics](#10-troubleshooting--diagnostics)
11. [Glossary of Terms](#11-glossary-of-terms)
12. [Appendix: Quick Reference](#12-appendix-quick-reference)

---

## 1. System Introduction

### 1.1 Executive Summary

The **PAR(2) Discovery Engine** is a statistical validation platform for analyzing circadian clock-target gene dynamics using AR(2) eigenvalue profiling. The eigenvalue modulus |λ| quantifies temporal persistence. Real data from the January 2026 audit of 33 datasets shows: Target genes mean=0.537±0.232, Clock genes mean=0.689±0.203. The 15.2% gearbox gap between clock and target genes is validated. Drift toward |λ| → 1.0 signals instability (observed in cancer models).

**Key Capabilities (January 2026):**
- **721 completed analyses** across 72 unique biological contexts
- **129 consensus gene pairs** validated as significant in 3+ independent datasets
- **Cross-kingdom validation**: Mouse tissues, human blood/organoids, Arabidopsis
- **Granger causality** confirmed in darkness (ruling out light artifacts)
- **FFT phase-randomized surrogates** prove findings reflect specific temporal relationships, not spectral artifacts

**Clinical Relevance:**
In APC-knockout colorectal cancer models, stem cell markers (Lgr5, Myc) show eigenvalue drift from stable (~0.3) toward instability (~0.95), suggesting circadian decoherence as an early disease marker.

### 1.2 Scientific Foundation

The PAR(2) Discovery Engine is a biostatistical platform for detecting **circadian-gated genetic interactions**. It implements Phase-Amplitude-Relationship analysis with second-order autoregressive modeling to identify how the body's internal biological clock regulates gene expression—and how oncogenic mutations (e.g., MYC, APC, CTNNB1) can disrupt this regulation.

The platform addresses the critical observation that circadian disruption (shift work, jet lag, irregular sleep) is epidemiologically linked to increased cancer risk. By characterizing the temporal dynamics of clock-target gene pairs, researchers can identify:

- **Target-intrinsic dynamics**: Eigenvalue modulus |λ| reflecting temporal persistence
- **Condition-specific patterns**: Differential stability in disease vs. healthy states
- **Chronotherapeutic windows**: Optimal timing for drug administration

### 1.3 Core Mathematical Model

The engine implements the Phase-Gated ARX (Autoregressive with eXogenous input) model:

```
Y(t) = β₀ + φ₁(θt)·Y(t-1) + φ₂(θt)·Y(t-2) + γ₀·C(t) + γ₁·C(t-1) + εt
```

Where:
- **Y(t)** = Target gene expression at time t
- **φ₁, φ₂** = Autoregressive coefficients (phase-dependent)
- **C(t)** = Clock gene expression (exogenous regulator)
- **γ₀, γ₁** = Clock-gene coupling coefficients
- **θt** = Circadian phase at time t
- **εt** = Residual error term

### 1.4 The Eight Core Clock Genes

The system tests target genes against all eight core circadian oscillator components:

| Gene Symbol | Full Name | Role in Circadian System |
|-------------|-----------|--------------------------|
| **Per1** | Period Circadian Regulator 1 | Negative feedback loop |
| **Per2** | Period Circadian Regulator 2 | Negative feedback loop |
| **Cry1** | Cryptochrome Circadian Regulator 1 | Negative feedback loop |
| **Cry2** | Cryptochrome Circadian Regulator 2 | Negative feedback loop |
| **Arntl** | BMAL1 (Brain and Muscle ARNT-Like 1) | Positive feedback loop |
| **Clock** | Clock Circadian Regulator | Positive feedback loop |
| **Nr1d1** | Rev-erbα | Stabilizing loop |
| **Nr1d2** | Rev-erbβ | Stabilizing loop |

---

## 2. Data Management & Quality Standards

### 2.1 Dataset Requirements

To ensure statistical power and reliable results, datasets should meet these quality standards:

| Criterion | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| **Timepoints** | 6 | 12-48 | More timepoints improve phase estimation |
| **Temporal resolution** | 4-hour intervals | 2-hour intervals | Captures circadian dynamics |
| **Duration** | 24 hours | 48 hours | Full circadian cycle(s) |
| **Replicates** | 1 | 2-3 biological | Averaged in preprocessing |

### 2.2 Supported Data Formats

The platform accepts CSV files with the following structure:

```
Gene_ID,ZT0,ZT2,ZT4,ZT6,ZT8,ZT10,ZT12,ZT14,ZT16,ZT18,ZT20,ZT22
Arntl,8.2,9.1,10.3,11.2,10.8,9.4,7.1,5.8,4.9,5.2,6.1,7.4
Per2,4.1,5.3,7.2,9.8,11.4,10.2,8.1,6.3,5.1,4.8,4.2,3.9
TP53,6.5,6.8,7.1,7.4,7.2,6.9,6.4,6.2,6.5,6.9,7.0,6.7
```

- **First column**: Gene identifiers (Ensembl IDs or gene symbols)
- **Subsequent columns**: Expression values at each timepoint
- **Column headers**: Zeitgeber time (ZT) or hours

### 2.3 Data Preparation Notes

**Important**: The engine expects pre-normalized data. Before upload:

1. **Normalization**: Apply log₂ transformation if working with raw counts
2. **Missing values**: Remove or impute missing data points beforehand
3. **Gene identifiers**: Use standard gene symbols (e.g., TP53, MYC, ARNTL)
4. **Quality check**: The system validates gene availability against clock gene list

### 2.4 Data Upload Procedure

1. Navigate to the dashboard
2. Drag and drop your CSV file onto the upload zone, OR
3. Click "New" button and select your file
4. Wait for preprocessing and gene availability check
5. Proceed to analysis selection

---

## 3. Operational Workflow

### 3.1 Dashboard Overview

The main interface is organized into functional zones:

| Zone | Location | Purpose |
|------|----------|---------|
| **Header** | Top | Quick Start, Manual, Help, Settings, Run |
| **Dataset Panel** | Left sidebar | Dataset selection and embedded data browser |
| **Analysis Controls** | Left sidebar | Stability Band and Genome-Wide analysis launchers |
| **Results Tabs** | Center | Results, Network, Charts, Confident, Compare, Omics |
| **Downloads** | Right panel | Export reports and data |

### 3.2 Standard Analysis Workflow

```
┌─────────────────┐
│  Select Dataset │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Choose Analysis │
│ Type (Stability/│
│ Genome-Wide/    │
│ Standard)       │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Run Analysis   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Review Results  │
│ in Tabs         │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Export Reports  │
└─────────────────┘
```

### 3.3 Driver Selection: Arntl vs. Per2

When running targeted analyses, consider which clock gene to use as the primary driver:

| Clock Gene | Peak Phase | Best For |
|------------|------------|----------|
| **Arntl (BMAL1)** | ~ZT6-8 (mid-day) | Metabolic genes, positive regulation |
| **Per2** | ~ZT12-16 (evening) | Cell cycle genes, negative regulation |
| **Nr1d1 (Rev-erbα)** | ~ZT8-10 | Metabolic/inflammatory genes |

The stability band analysis automatically tests against all 13 clock genes and identifies the strongest coupling.

---

## 4. Analysis Types

### 4.1 Optimal Stability Band Analysis

#### Purpose
Identifies gene pairs with eigenvalue modulus in the **stable eigenvalue band** [0.518, 0.718]. This represents moderate damping dynamics that appear to cluster naturally in AR(2) models.

> **Validation Note:** Testing across 31 datasets shows only 3/15 exceed null expectations. Notably, APC-knockout cancer organoids show significant enrichment (z=4.4) while wild-type do not. This suggests the band may function as a **pathological attractor** under oncogenic mutation rather than a healthy baseline.

#### Scientific Significance
- Empirical clustering around ~0.5 and ~0.7 regimes observed across datasets
- Moderate damping in this range reflects target-intrinsic temporal persistence
- Useful for comparing disease vs healthy conditions

#### Running the Analysis
1. Select an embedded dataset or upload your own
2. Locate the "Optimal Stability Band Analysis" panel
3. Click "Run Stability Check"
4. Wait for completion (10-60 seconds depending on dataset size)

#### Output Metrics

| Metric | Description | Interpretation |
|--------|-------------|----------------|
| **Band Proximity** | Proximity to mid-stability band | Higher = closer to band center |
| **In Stability Band** | Boolean classification | Yes if |λ| ∈ [0.518, 0.718] AND stable |
| **Eigenperiod** | Natural oscillation period | Hours; ~24h suggests circadian entrainment |
| **Stability** | System stability | Stable (|λ| < 1) or Explosive (|λ| ≥ 1) |
| **R²** | Model fit quality | 0-100%; higher is better |
| **Coupling Significant** | Clock influence detected | p < 0.05 in nested F-test |
| **Phase-Gating** | Day/night differential | Detected if coefficient difference > 0.1 |

### 4.2 Genome-Wide PAR(2) Screening

#### Purpose
Systematically tests **every gene in the dataset** against all 13 clock genes to discover circadian-gated targets without prior hypotheses.

#### Running the Analysis
1. Select your dataset
2. Click "Run Genome-Wide Screen"
3. Wait for completion (1-3 minutes for ~15,000 genes)

#### Output
- **Total genes tested**: Number of genes in dataset
- **Total hypotheses**: Genes × 13 clock genes
- **FDR significant hits**: Discoveries passing Benjamini-Hochberg correction
- **Ranked hit list**: Sorted by statistical significance

### 4.3 Standard PAR(2) Analysis

#### Purpose
Runs the full PAR(2) pipeline on user-selected gene pairs with comprehensive statistical output.

#### Gene Pair Categories

The engine includes predefined gene pairs organized by biological function:

| Category | Example Pairs | Relevance |
|----------|---------------|-----------|
| **Cell Cycle** | MYC, TP53, CCND1 | Proliferation control |
| **Wnt/Stem Cell** | CTNNB1, APC, LGR5 | Stem cell maintenance |
| **Metabolism** | HIF1A, LDHA, PKM | Metabolic reprogramming |
| **DNA Repair** | BRCA1, ATM, CHEK2 | Genome stability |
| **Apoptosis** | BCL2, BAX, CASP3 | Cell death regulation |

---

## 5. Multi-Omics Integration (Experimental)

> **Important Caveat:** AR(2) eigenvalue profiling shows different behavior at the protein level compared to mRNA. Proteins have longer half-lives, resulting in higher eigenvalue modulus values (mean ~0.86 vs ~0.45 for mRNA) and very low stability band occupancy (~3.6% vs ~25-30%). **The core PAR(2) model is validated at the transcriptome level.** Proteomics results should be interpreted as exploratory/experimental.

### 5.1 Why Proteomics Results Differ

| Metric | mRNA | Protein | Implication |
|--------|------|---------|-------------|
| Mean eigenvalue | 0.42-0.55 | ~0.86 | Proteins more persistent |
| Stability band % | 25-35% | ~3.6% | Proteins NOT in optimal band |
| Half-life | Minutes-hours | Hours-days | Different timescales |

**Biological Interpretation:** Protein dynamics are slower than mRNA dynamics. The AR(2) framework captures this as higher persistence (eigenvalue modulus closer to 1). This is a valid observation but means the stability band claims do not transfer directly to proteomics.

### 5.2 mRNA vs. Protein Concordance Analysis

#### Rationale
Gene expression (mRNA) does not always correlate with protein levels due to post-transcriptional regulation, translation efficiency, and protein stability. Comparing circadian control at both levels can reveal:

- **Concordant genes**: Clock-gated at mRNA AND protein levels
- **mRNA-only**: Transcriptionally controlled, post-transcriptionally buffered
- **Protein-only**: Post-transcriptional circadian mechanism
- **Discordant**: Different regulatory mechanisms at each level

#### Running Concordance Analysis
1. Navigate to the **"Omics (Beta)"** tab
2. Select a completed transcriptomics analysis run
3. Select a matching proteomics analysis run
4. Click "Run Concordance Analysis"

### 5.3 Proteomics Data Upload

#### File Requirements
- CSV format with protein/gene identifiers in first column
- Timepoint measurements in subsequent columns
- Same temporal resolution as transcriptomic data preferred
- **Note:** Proteomics studies typically have fewer timepoints (6-8), which may affect AR(2) estimation stability

#### Embedded Proteomics Datasets

| Dataset | Source | Description | Caveat |
|---------|--------|-------------|--------|
| **Human Plasma Proteome** | Jóhannsson et al. 2025 | 138 diurnal human plasma proteins | 8 timepoints, high eigenvalues |
| **Mouse Liver Proteome** | Wang et al. 2018 | Nuclear circadian proteome | Limited coverage |

---

## 6. Visualization Tools

### 6.1 Interactive Network Graph

Displays gene-gene regulatory relationships as a force-directed graph:

- **Clock gene nodes**: Colored by gene (Per2=cyan, Arntl=purple, etc.)
- **Target gene nodes**: Sized by significance
- **Edges**: Connect clock genes to their targets
- **Interactions**: Drag nodes, zoom, click for details

### 6.2 Time-Series Charts

Available visualizations:

| Chart Type | Purpose |
|------------|---------|
| **Expression Profile** | 24-hour expression pattern |
| **Phase Comparison** | Clock vs. target timing overlay |
| **Residual Plot** | Model fit diagnostics |
| **Eigenvalue Trajectory** | Stability over time |

#### Exporting Charts
1. Locate the menu icon (⋮) on the chart panel
2. Select "Export as PNG" or "Export as SVG"
3. Choose resolution:
   - **1x**: Screen display (72 DPI)
   - **2x**: Presentations (144 DPI)
   - **4x**: Publication quality (288 DPI)
4. File downloads automatically

### 6.3 Chronotherapeutic Clock Visualization

A 24-hour clock face showing optimal drug timing:

| Element | Appearance | Meaning |
|---------|------------|---------|
| **Green wedge** | 2-hour arc | Optimal treatment window |
| **Amber dot** | Circle on clock rim | Clock gene peak time |
| **Hour markers** | 0h, 6h, 12h, 18h | Zeitgeber time reference |

#### Interpretation
- **Green window**: Target gene maximally responsive to clock regulation
- **Opposite phase (12h later)**: Minimal responsiveness
- **Clinical implication**: Schedule drug administration within green window for enhanced efficacy

#### Access
1. Run stability band analysis
2. Expand any gene pair result (click to expand)
3. Scroll to "Chronotherapeutic Window" section
4. Also included in downloadable HTML reports

**Note**: Clock visualization appears when the Phase-Gated ARX model successfully extracts phase information from the data.

---

## 7. Embedded Reference Datasets

The application includes 12 pre-loaded datasets for immediate analysis:

### 7.1 Mouse Tissue Atlas (GSE54650 - Hughes et al.)

Eight tissue-specific circadian transcriptomes:

| Dataset Name | Tissue | Description |
|--------------|--------|-------------|
| **Liver (GSE54650)** | Liver | Strongest circadian rhythms; primary metabolic organ |
| **Kidney (GSE54650)** | Kidney | Renal circadian patterns |
| **Heart (GSE54650)** | Heart | Cardiac clock genes |
| **Lung (GSE54650)** | Lung | Respiratory rhythms |
| **Muscle (GSE54650)** | Skeletal Muscle | Metabolic rhythms |
| **Adrenal (GSE54650)** | Adrenal Gland | Stress hormone rhythms |
| **Brown Fat (GSE54650)** | Brown Adipose | Thermogenic rhythms |
| **White Fat (GSE54650)** | White Adipose | Lipid metabolism |

### 7.2 Intestinal Organoids (GSE157357 - Karpowicz et al.)

Two organoid conditions for comparing clock-intact vs. mutant states:

| Dataset Name | Condition | Application |
|--------------|-----------|-------------|
| **Wild-Type Organoid** | APC-WT/BMAL-WT | Normal intestinal rhythms |
| **APC-Mut/BMAL-WT Organoid** | APC-Mutant | Cancer-related clock disruption |

### 7.3 Human Neuroblastoma (GSE221103)

Oncogene-activated vs. controlled states:

| Dataset Name | Condition | Key Finding |
|--------------|-----------|-------------|
| **Neuroblastoma MYC-ON (Cancer)** | MYC activated | Explosive dynamics (|λ| > 1.0) |
| **Neuroblastoma MYC-OFF (Control)** | MYC repressed | Stable dynamics (|λ| < 1.0) |

These datasets enable direct comparison of stability metrics between oncogenic and normal states.

---

## 8. Mathematical Framework

### 8.1 Phase Extraction via Cosine Regression

Clock gene phase is extracted using 3-parameter least-squares fit:

```
C(t) = M + A·cos(ωt) + B·sin(ωt)
```

Where:
- **M** = Mean expression level (mesor)
- **A, B** = Amplitude components
- **ω** = Angular frequency (2π/period)
- **Phase offset**: φ = atan2(B, A)

The model optimizes across period candidates (23h, 24h, 25h) selecting the best fit by R².

### 8.2 Nested F-Test for Coupling Significance

Tests whether the clock gene significantly improves model fit:

**Full model (ARX):**
```
Y(t) = β₀ + β₁·Y(t-1) + β₂·Y(t-2) + γ₀·C(t) + γ₁·C(t-1) + ε
```

**Reduced model (AR(2)):**
```
Y(t) = β₀ + β₁·Y(t-1) + β₂·Y(t-2) + ε
```

**F-statistic:**
```
F = [(RSS_reduced - RSS_full) / df₁] / [RSS_full / df₂]
```

Where df₁ = 2 (clock gene parameters), df₂ = n - 5 (residual degrees of freedom)

The p-value is computed using the regularized incomplete beta function (Numerical Recipes algorithm).

### 8.3 Eigenvalue Stability Analysis

The characteristic equation of the AR(2) process:
```
λ² - φ₁·λ - φ₂ = 0
```

**Stability criterion**: |λ| < 1 (all eigenvalues inside unit circle)

### 8.4 Stability Band Classification

The stability band represents natural eigenvalue clustering observed empirically:

```
Band: [0.518, 0.718]
Clusters: ~0.5 (fast-damping) and ~0.7 (slow-damping) regimes
```

**Classification rule:**
- |λ| ∈ [0.518, 0.718] AND |λ| < 1.0 → **In stability band**
- This band was defined heuristically; sensitivity analyses for ±0.05 and ±0.15 widths are recommended

> **Validation Note:** Testing across 31 datasets shows only 3/15 exceed null expectations. APC-knockout cancer organoids show significant enrichment (z=4.4) while wild-type do not—suggesting a **condition-specific pathological attractor** rather than universal baseline.

### 8.5 Multiple Testing Correction

Two-stage correction procedure:

1. **Bonferroni correction** within each gene pair (13 clock genes tested)
2. **Benjamini-Hochberg FDR** across all gene pairs

### 8.6 Cross-Study Validation Caveats

**Critical limitation:** Most embedded datasets derive from a single atlas (Zhang et al. 2014). To claim biological generality:

1. **Treat study as random effect**: Findings replicated across 2+ independent studies are stronger
2. **Validate key claims outside Zhang atlas**: Use GSE157357 (organoids), GSE221103 (neuroblastoma), or GSE261698 (cortical glia)
3. **Watch for batch effects**: High significance in one study but not others may reflect technical artifacts

> **Current validation status:** Cross-tissue consensus (3+ tissues) has been stress-tested. Cross-study independence (multiple atlases) requires user validation.

### 8.7 Time Interval (Δt) Normalization

**Before using "biomarker" language**, ensure datasets are comparable:

| Dataset | Sampling Interval | Eigenperiod Units |
|---------|-------------------|-------------------|
| Zhang Mouse | 2 hours | Multiply by 2 for real hours |
| GSE157357 | 4 hours | Multiply by 4 for real hours |
| Custom upload | Varies | Check your metadata |

**Eigenperiod formula**: `T = 2π / arg(λ)` gives period in **timepoint units**, not hours.

> **Harmonization required**: To compare eigenperiods across studies with different Δt, convert all to hours before interpretation. Unstandardized comparisons may produce spurious "disease signatures."

---

## 9. Results Interpretation Guide

### 9.1 Eigenvalue Modulus Classification

| Range | Classification | Biological Interpretation |
|-------|----------------|---------------------------|
| < 0.518 | **Over-damped** | Tissue-specific suppression (safety brake) |
| 0.518 - 0.718 | **Optimal Band** | Moderate damping (exploratory) |
| 0.718 - 0.99 | **Transitional** | Weakening regulation; aging/pre-pathology |
| 1.00 - 1.19 | **Marginally Explosive** | Potential early dysregulation |
| ≥ 1.20 | **Highly Explosive** | Strong cancer signature |

### 9.2 Identifying Physiological Suppression (Over-Damped States)

**Critical Finding:** In comprehensive analysis, nearly **47% of gene pairs** show over-damped dynamics (|λ| < 0.518). This is not a failure—it represents intentional **tissue-specific silencing**.

#### What Over-Damping Means

Over-damped genes return to baseline **too quickly** after perturbation, effectively eliminating rhythmic oscillation. The clock uses this mechanism to ensure certain genes **do not** fluctuate in sensitive tissues.

#### Key Examples from Analysis

| Tissue | Gene Pair | |λ| | Biological Significance |
|--------|-----------|-----|-------------------------|
| **Heart** | All Clock → MYC | 0.08 | Prevents proliferation in non-dividing cardiomyocytes |
| **Hypothalamus** | All Clock → BCL2 | 0.25 | Stabilizes cell death pathways in neurons |
| **Aorta** | All Clock → TEAD1 | 0.32 | Prevents rhythmic vascular remodeling |

#### The Heart-MYC Example

The most extreme over-damping (|λ| = 0.08) occurs for **MYC in cardiac tissue**:
- Adult cardiomyocytes do not readily divide
- Rhythmic MYC expression would be dangerous (drives proliferation)
- The clock acts as a **safety brake**, keeping MYC expression flat

#### Clinical Implications

1. **Chronotherapy Relevance**: Over-damped genes are **poor targets** for time-based drug delivery. If |λ| < 0.518, dosing at 9:00 AM vs 9:00 PM makes no difference.

2. **Cancer Detection**: In **MYC-ON neuroblastoma**, over-damped signatures disappear—oncogenes "pull" genes out of suppression into transitional or explosive states.

3. **Research Guidance**: Do not discard |λ| < 0.518 results as failures. Log them as evidence of **Tissue-Specific Dampening**, confirming where the clock intentionally mutes expression.

#### Distribution Summary (All Datasets)

| Classification | Frequency | Role |
|----------------|-----------|------|
| Over-damped | ~47% | Physiological suppression |
| Optimal band | ~27% | Moderate damping (exploratory) |
| Transitional | ~13% | Aging/pre-pathology markers |
| Explosive | ~13% | Cancer/disease signatures |

### 9.3 P-Value Thresholds

| Threshold | Meaning | Application |
|-----------|---------|-------------|
| p < 0.05 | Nominally significant | Exploratory analysis |
| q < 0.05 | FDR-corrected significant | Confirmatory analysis |
| q < 0.01 | Highly significant | High-confidence discoveries |
| q < 0.001 | Very highly significant | Publication-ready findings |

### 9.3 Model Fit Quality (R²)

| R² Value | Quality | Action |
|----------|---------|--------|
| > 80% | Excellent | High confidence in results |
| 60-80% | Good | Reliable for interpretation |
| 40-60% | Moderate | Consider with caution |
| < 40% | Poor | May indicate model mismatch |

### 9.4 Enrichment Analysis Interpretation

When stability band analysis completes:

| Metric | Calculation | Significance |
|--------|-------------|--------------|
| **Observed rate** | Pairs in band / Total pairs | Your data's rate |
| **Null expectation** | From shuffled data (~25-35%) | Baseline |
| **Enrichment ratio** | Observed / Expected | >1 suggests enrichment |

> **Note:** Most datasets do NOT show significant enrichment above null. Use this metric for condition comparisons (e.g., disease vs healthy), not as proof of a biological attractor.

---

## 10. Troubleshooting & Diagnostics

### 10.1 Common Issues

#### "No data found for gene"

**Causes:**
- Gene symbol spelling error
- Gene not expressed in tissue type
- Using wrong identifier format

**Solutions:**
- Check spelling (case-insensitive)
- Note: ARNTL = BMAL1, NR1D1 = REV-ERBα
- Try Ensembl ID if symbol fails

#### Analysis runs indefinitely

**Cause:** Large dataset or complex analysis

**Solutions:**
- Genome-wide screens can take 1-3 minutes
- Refresh page if stuck >5 minutes
- Check browser console for errors

#### All results non-significant

**Possible causes:**
- Tissue has weak circadian regulation
- Insufficient temporal resolution
- Technical noise overwhelming signal

**Solutions:**
- Try liver dataset (strongest rhythms)
- Verify clock genes are rhythmic first
- Check data preprocessing

### 10.2 Diagnostic Outputs

Available diagnostic downloads:
- **Eigenvalue Survey**: Complete stability analysis across all pairs
- **Diagnostic JSON**: Full computational trace
- **Summary CSV**: Tabular results for external analysis

---

## 11. Ethical Guidelines for Clinical Researchers

This section provides essential ethical considerations for translating PAR(2) Discovery Engine findings from research to clinical application.

### 11.1 Scope of Claims

The PAR(2) Discovery Engine is a **discovery tool**, not a diagnostic device.

| Appropriate Use | Inappropriate Use |
|-----------------|-------------------|
| Generating hypotheses for clinical trials | Direct patient diagnosis |
| Identifying candidate genes for chrono-studies | Prescribing treatment timing |
| Comparing healthy vs. disease dynamics | Making survival forecasts |
| Prioritizing targets for validation | Replacing established oncology protocols |

**Key Principle:** All chronotherapy recommendations require prospective clinical validation before patient application.

### 11.2 Terminology Translation for Clinical Settings

Mathematical terms may cause patient distress if used without translation:

| Mathematical Term | Clinical Translation | Patient-Facing Language |
|-------------------|---------------------|------------------------|
| **Explosive** (|λ| ≥ 1.0) | Decreased Regulatory Stability | "Your gene timing patterns show some irregularity" |
| **Over-damped** (|λ| < 0.518) | Suppressed Rhythmic Activity | "This gene has very stable, flat expression" |
| **In Stability Band** | Moderate Regulatory Control | "Moderate damping patterns" |
| **Phase hijacking** | Altered Circadian Coupling | "Changes in when your genes are most active" |

### 11.3 Individual Chronotype Calibration

**Critical Requirement:** The analysis assumes standardized Zeitgeber Time (ZT0 = lights-on). However, individual patients have different:

- **Chronotypes**: Morning larks vs. night owls (±2-4 hours)
- **Work schedules**: Shift workers may have inverted rhythms
- **Geographic factors**: Latitude affects light exposure
- **Age**: Elderly patients often have advanced phase

**Before Clinical Application:**
1. Assess patient chronotype (e.g., Munich Chronotype Questionnaire)
2. Measure dim-light melatonin onset (DLMO) if possible
3. Apply phase correction to any timing recommendations
4. Build in a ±2 hour "safety buffer" for logistical variability

### 11.4 Safety Buffer Protocol

When translating optimal treatment windows to clinical practice:

```
Calculated optimal window:    ZT8-12 (e.g., 2:00 PM - 6:00 PM)
Individual chronotype offset: +1 hour (morning chronotype)
Adjusted window:              ZT9-13 (e.g., 3:00 PM - 7:00 PM)
Safety buffer applied:        ±2 hours
Final recommended range:      1:00 PM - 9:00 PM
```

This buffer accounts for:
- Patient scheduling constraints
- Drug preparation and administration time
- Hospital workflow limitations
- Individual pharmacokinetic variation

### 11.5 Limitations and Disclaimers

Researchers must acknowledge these limitations in any publication or clinical protocol:

1. **Dataset Specificity**: Results are derived from specific experimental systems (mouse tissues, organoids, neuroblastoma cell lines). Cross-species and tissue extrapolation requires validation.

2. **Temporal Resolution**: Accuracy depends on sampling density. Results from 12-point datasets have wider confidence intervals than 48-point datasets.

3. **Single-Subject Analysis**: While mathematically robust for individual time-series, population-level variation is not captured.

4. **No Causal Claims**: Phase-gating relationships are correlational. Intervention studies are required to establish causality.

5. **Dynamic Disease States**: Circadian parameters may change during disease progression, treatment, or recovery.

### 11.6 Responsible Reporting

When publishing or presenting PAR(2) findings:

**DO:**
- Report confidence intervals and FDR-corrected p-values
- Specify dataset source, temporal resolution, and preprocessing
- Acknowledge the stability band analysis as exploratory
- Cite the theoretical basis (AR(2) eigenvalue methodology)
- Include over-damped results as biologically meaningful

**DON'T:**
- Claim diagnostic capability without clinical validation
- Extrapolate to untested tissues or species without caveats
- Present individual case findings as population-level evidence
- Omit negative or null findings from publications

### 11.7 Ethical Review Checklist

Before clinical translation:

- [ ] Findings replicated in independent dataset(s)
- [ ] Statistical methodology peer-reviewed
- [ ] IRB/Ethics committee approval obtained
- [ ] Patient chronotype assessment protocol in place
- [ ] Safety buffer calculations documented
- [ ] Clinical terminology translation approved
- [ ] Informed consent includes circadian study elements
- [ ] Adverse event monitoring plan includes timing deviations

---

## 12. Glossary of Terms

| Term | Definition |
|------|------------|
| **AR(2)** | Autoregressive model of order 2; characterizes temporal dynamics using two previous timepoints |
| **ARX** | Autoregressive model with eXogenous input; includes external regulator (clock gene) |
| **Chronotype** | Individual's natural sleep-wake timing preference (morning lark vs. night owl) |
| **Circadian** | Relating to ~24-hour biological rhythms |
| **Clock gene** | Gene comprising the core circadian oscillator (Per1/2, Cry1/2, Arntl, Clock, Nr1d1/2) |
| **DLMO** | Dim-Light Melatonin Onset; gold-standard measure of individual circadian phase |
| **Eigenvalue (λ)** | Complex number characterizing system dynamics; modulus determines stability |
| **FDR** | False Discovery Rate; adjusted p-value controlling expected proportion of false positives |
| **Golden ratio (φ)** | ≈ 1.618; historical reference point (no special biological significance confirmed) |
| **Stability band** | [0.518, 0.718]; empirically observed eigenvalue clustering range |
| **Mesor** | Circadian rhythm midline; mean expression level |
| **Modulus** | Absolute value of complex number; \|a + bi\| = √(a² + b²) |
| **Over-damped** | System returns to baseline too quickly; |λ| < 0.518; intentional suppression |
| **PAR(2)** | Phase-Amplitude-Relationship with 2 autoregressive lags |
| **Phase** | Position within circadian cycle (0-2π radians or 0-24 hours) |
| **Phase-gating** | Regulation strength varies with circadian phase (day vs. night) |
| **Proteomics** | Study of protein expression and function |
| **Safety buffer** | ±2 hour margin around calculated optimal treatment windows |
| **Transcriptomics** | Study of mRNA expression |
| **Zeitgeber Time (ZT)** | Hours since lights-on; ZT0 = dawn, ZT12 = dusk |

---

## 13. Appendix: Quick Reference

### Running an Analysis

```
1. Select dataset → 2. Choose analysis type → 3. Click Run → 4. View results → 5. Export
```

### Key Numbers

| Value | Meaning |
|-------|---------|
| **0.618** | Mid-point of stability band (empirical reference) |
| **1.0** | Stability boundary |
| **0.05** | Standard significance threshold |
| **24h** | Normal circadian period |
| **8** | Number of core clock genes tested |

### Core Clock Genes (Quick List)

Per1, Per2, Cry1, Cry2, Arntl (BMAL1), Clock, Nr1d1 (Rev-erbα), Nr1d2 (Rev-erbβ)

### Stability Quick Guide

```
|λ| < 0.518 → Over-damped (rapid return to baseline)
|λ| ∈ [0.518, 0.718] → In stability band (moderate damping)
|λ| < 1.00  → Stable/Transitional
|λ| ≥ 1.00  → Explosive (often seen in oncogenic contexts)
```

### Over-Damping Key Insight

- ~47% of gene pairs are over-damped (|λ| < 0.518)
- This is NOT a failure—it's intentional suppression
- Example: Heart→MYC (|λ| = 0.08) = clock prevents proliferation
- Poor chronotherapy targets (no timing advantage)

---

### ODE Validation Quick Reference

| Validation | Result | Endpoint |
|------------|--------|----------|
| ODE Model Zoo | 12/12 PASS | `GET /api/model-zoo/models` |
| ODE Round-Trip | 5/5 PASS | `GET /api/model-zoo/ode-roundtrip-validation` |

**ODE Round-Trip Validation**: Five independent ODE models (FitzHugh-Nagumo, Goodwin, Van der Pol, Lotka-Volterra, Tyson-Novak) are simulated, sampled, and AR(2)-fitted to confirm eigenvalue recovery within physically plausible ranges. All 5 pass.

**Model Clarifications**: Kim-Forger implementation is a simplified 3-variable reduction (not the full published model). Leloup-Goldbeter is a heuristic 5-variable reduction with ad hoc PER-CRY complex formation.

---

**Document Control:**
- Version 1.0.6 | February 2026
- Clinical Research Ethics Edition
- For research use only. Not intended for clinical diagnosis.

*PAR(2) Discovery Engine - Advancing Circadian Medicine Through Computational Biology*
