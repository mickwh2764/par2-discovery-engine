# Future Work — PAR(2) Discovery Engine

## Parked Features

### Wearable Circadian Analysis Page

**Status:** Parked (code complete, removed from frontend routing)  
**File:** `client/src/pages/wearable-analysis.tsx` (2,972 lines, fully functional)  
**Date parked:** February 2026  

#### What it does
- Uploads and parses Apple Health ZIP exports, Fitbit CSVs, Dexcom CGM, Oura Ring, FreeStyle Libre, and generic CSV formats
- Memory-efficient streaming XML parser with decompression progress tracking
- Runs AR(2) eigenvalue analysis on any detected physiological signal (heart rate, HRV, SpO2, steps, glucose, respiratory rate, temperature)
- Signal switcher bar with "Analyze All Signals" for batch processing
- CircadianFingerprint component: radar chart, signal hierarchy, automated interpretation text (adapts to data duration, circadian-relevance, and R² quality)
- BenchmarkComparison component: reference dataset registry with provenance tracking ("computed" vs "estimated"), visual range bars — **currently locked** pending population-scale reference data
- ResilienceMap component: eigenvalue positioning across signals
- Edge case diagnostics and data quality warnings
- Research Preview banner with appropriate caveats

#### Why it was parked
- Population reference benchmarks rely on single-participant samples and illustrative estimates — insufficient for meaningful comparison
- Risk of appearing "gimmicky" to peer reviewers evaluating the gene expression work
- Wearable eigenvalue interpretation requires population studies that don't exist yet
- Better to present as future work in the papers than as a live tool without proper backing data

#### What's needed to reactivate
1. Multi-participant reference datasets with demographic metadata (age, sex, activity level, schedule type)
2. Computed (not estimated) eigenvalue distributions per signal type per demographic group
3. Validation study linking wearable eigenvalues to an independent circadian health measure
4. To restore: re-add import and route in `client/src/App.tsx`, re-add nav button in `client/src/pages/dashboard.tsx`

#### AR(2) Results from Developer's Own Data (90-day window, Nov 2025–Feb 2026)
Profile: Male, age 55, 5am–3:30pm fixed work schedule, 10–15k steps/day, Apple Watch

| Signal | |λ| | R² | Root Type | Hourly Coverage |
|---|---|---|---|---|
| Heart Rate | 0.7475 | 0.503 | Real | 85.6% |
| Respiratory | 0.5614 | 0.271 | Real | — |
| SpO2 | 0.4114 | 0.110 | Real | 49.1% |
| Steps | 0.4005 | 0.051 | Real | 70.3% |
| HRV | 0.1852 | 0.049 | Real | 39.3% |

Key finding: Heart rate eigenvalue (0.75) lower than expected for a rigid schedule — likely due to 14% data gaps from device removal. Day-night HR difference of 22.1 bpm and weekday/weekend difference of only 0.5 bpm indicate strong circadian entrainment despite moderate eigenvalue.

---

## Future Applications

### 5. Personalised Chronotherapy Recommendations

**What's needed:** Cross-reference the resonance zone gene list with drug target databases (DrugBank, ChEMBL, TTD).

**What it would do:** For any drug, automatically tell you:
- Is the drug's target in the resonance zone? (If yes, timing matters)
- What's the target's natural period and damping? (Suggests optimal dosing window)
- Does the target's memory differ between healthy and disease tissue? (Therapeutic window)

The drug target overlay already partially exists — extending it to the resonance zone genes would create a practical chronopharmacology screening tool.

### 6. Real-Time Wearable Integration

**What's needed:** Connect to wearable device APIs (heart rate, temperature, activity data from Apple Watch, Oura Ring, Fitbit).

**What it would do:** Apply AR(2) analysis to continuous physiological data and compute:
- Personal circadian stability score in real time
- Detect when your circadian memory is weakening (e.g., after travel, shift changes)
- Alert you when key physiological oscillations leave the resonance zone

The Discovery Engine already handles CSV upload of wearable data. An API integration would make this continuous.

### 7. Cancer Chronotherapy Companion

**What's needed:** Paired tumor/normal tissue expression time series from clinical datasets.

**What it would do:**
- Run resonance scan on both tumor and normal tissue
- Identify genes that are in the resonance zone in normal tissue but NOT in tumor
- These are your chronotherapy targets: genes where the healthy tissue has circadian protection that the tumor lacks
- Recommend treatment timing windows based on the normal tissue's resonance gene phases

The platform already has cancer datasets (neuroblastoma, APC-mutant organoids). Expanding to more clinical cancer datasets is straightforward.

### 8. Aging Clock

**What's needed:** Longitudinal gene expression data from aging studies (several datasets already loaded — GSE93903 young vs old).

**What it would do:**
- Track which genes lose resonance zone membership with age
- Measure the rate of memory loss (eigenvalue decline over lifespan)
- Identify which genes' memory can be rescued by interventions (caloric restriction data already available)
- Compute a "biological age" based on how many genes have left the resonance zone compared to young baseline

This would be a dynamical aging clock — distinct from existing epigenetic clocks (Horvath clock measures methylation, this would measure temporal persistence).

### 9. Microbiome-Host Circadian Coupling

**What's needed:** Time-series expression data from gut microbiome + host tissue simultaneously.

**What it would do:** Run AR(2) on both host and microbial genes, then test which microbial genes show resonance zone membership. Published work (Thaiss et al., 2014, Cell) showed gut microbiome composition oscillates on a 24-hour cycle. PAR(2) could identify which specific microbial genes carry the strongest circadian memory and test whether they couple to host clock genes.

### 10. Plant Circadian Optimisation

**What's needed:** The platform already has Arabidopsis data.

**What it would do:**
- Identify crop genes in the resonance zone
- Predict optimal light schedules by matching artificial light cycles to plant resonance frequencies
- Screen crop varieties for circadian robustness (varieties with more genes in the resonance zone may be more resilient to irregular light conditions)

This has direct applications in controlled-environment agriculture, vertical farming, and space agriculture.

### 11. Psychiatric and Neurological Applications

**What's needed:** Time-series expression data from brain tissue or blood biomarkers in psychiatric conditions.

**What it would do:** Circadian disruption is implicated in depression, bipolar disorder, schizophrenia, and Alzheimer's. The platform could:
- Compare resonance zone gene lists between healthy brain and psychiatric conditions
- Identify which genes lose circadian memory in each condition
- Predict which patients might respond to chronotherapy (light therapy, sleep scheduling) based on which resonance genes are still intact vs. lost

Published evidence (Li et al., 2013, PNAS) showed widespread circadian gene disruption in major depression brain tissue. PAR(2) could quantify exactly which genes lost memory and by how much.

### 12. Evolutionary Dynamics

**What's needed:** Time-series expression data from more diverse species (already have mouse, human, baboon, Arabidopsis).

**What it would do:**
- Map how eigenvalue distributions evolved across the tree of life
- Test whether resonance zone size (proportion of genes tuned to the day length of their environment) correlates with ecological niche
- Compare circadian memory architecture between diurnal and nocturnal species
- Test whether cave-dwelling species (no light cycle) have fewer resonance zone genes

### 13. Single-Cell Temporal Memory

**What's needed:** Single-cell RNA-seq time series (these are becoming available from live-imaging + scRNA-seq experiments).

**What it would do:** Measure eigenvalue at the individual cell level, not just bulk tissue average. This would reveal:
- Do all cells in a tissue have the same memory, or is there cell-to-cell variation?
- Do stem cells have different eigenvalue distributions than differentiated cells?
- Does memory heterogeneity predict which cells will respond to perturbation?

This connects to Waddington's landscape directly — cells with higher memory occupy deeper valleys.

### 14. Clinical Trial Design Tool

**What's needed:** Integration with clinical trial databases.

**What it would do:**
- For any drug in development, query the resonance zone for its targets
- Recommend whether the trial should include time-of-day as a variable
- Estimate the potential effect size improvement from chronotherapy dosing
- Flag trials that may have failed due to circadian confounding (patients dosed at wrong times)

Published estimates suggest up to 50% of drugs target genes with circadian expression (Zhang et al., 2014). Many failed trials may have succeeded with proper timing.

### 15. Pandemic Preparedness

**What's needed:** Time-series immune gene expression data.

**What it would do:** Immune response genes have strong circadian components (Scheiermann et al., 2013). The platform could:
- Identify which immune genes are in the resonance zone
- Predict optimal vaccination timing (when immune memory genes are at peak persistence)
- Screen for immune genes that lose circadian memory under stress (sleep deprivation, ICU stays)

Published evidence (Long et al., 2016, Vaccine) showed morning vaccination produces stronger antibody responses than afternoon — consistent with circadian immune memory.

---

## Core Principle

All of these applications share a single principle: if biology has temporal memory, measuring that memory tells you something useful. The platform has demonstrated this principle works for circadian genes. Every application above is an extension of the same principle to a different domain.

The fundamental capability is: take any time-series biological measurement, reduce it to two numbers (phi_1, phi_2), extract a memory metric (|lambda|), and use that metric to discover hierarchy, predict disruption vulnerability, and identify therapeutic timing windows.

That capability doesn't expire or get outdated. As new time-series datasets become available — from new technologies, new organisms, new diseases — the same two-coefficient analysis can be applied. The platform is a lens, and it works on any data you point it at.

---

---

# Eigenvalue: Who Uses It and Are They Saying the Same Thing as PAR(2)?

## What "Eigenvalue" Actually Means

The word "eigenvalue" comes from German — "eigen" means "own" or "characteristic." An eigenvalue is, literally, the characteristic number of a system. It tells you the system's natural behavior when left alone.

The formal definition: given a matrix A, an eigenvalue lambda is a number such that A*v = lambda*v for some vector v. In plain terms: when you apply the system's transformation, some directions (eigenvectors) just get scaled by a number (the eigenvalue). That number tells you whether the system grows, shrinks, or oscillates along that direction.

## Fields That Use Eigenvalues

### 1. Physics — Quantum Mechanics

**Who:** Schrodinger, Dirac, Heisenberg, every modern physicist

**Their eigenvalue:** The energy levels of atoms and particles. When you solve the Schrodinger equation for a hydrogen atom, the eigenvalues ARE the allowed energy levels. Each eigenvalue corresponds to a stable state the electron can occupy.

**Same as PAR(2)?** The mathematical structure is identical. In quantum mechanics, eigenvalue = stable energy state. In PAR(2), eigenvalue = stable dynamical state of a gene. Both are asking: "what are the natural modes of this system?" The difference is the system — atoms vs genes — but the math is the same math.

### 2. Physics — Vibration Analysis

**Who:** Structural engineers, aerospace engineers, seismologists

**Their eigenvalue:** The natural frequencies of a vibrating structure. When you compute eigenvalues of a bridge or a building, you find the frequencies at which it resonates. If an earthquake hits that frequency, the building amplifies the vibration and can collapse.

**Same as PAR(2)?** Very closely related. PAR(2)'s resonance zone is doing the same thing — finding which genes have natural frequencies near 24 hours. The damping rate and natural period decomposition in PAR(2) are directly borrowed from vibration analysis. The math is identical. Replace "bridge" with "gene" and "earthquake" with "circadian signal."

### 3. Control Theory / Engineering

**Who:** Control systems engineers (autopilots, thermostats, industrial processes)

**Their eigenvalue:** Determines whether a feedback system is stable, oscillatory, or unstable. If all eigenvalues have modulus < 1, the system is stable. If any eigenvalue has modulus > 1, the system explodes. If eigenvalues are complex, the system oscillates.

**Same as PAR(2)?** This is the most direct match. PAR(2) uses eigenvalues in exactly the same way as control theory. The stationarity boundary (|lambda| = 1) in root space is the same stability boundary used in control engineering. The classification into oscillatory vs overdamped is the same classification control engineers use. PAR(2) is literally applying control theory to gene expression.

### 4. Google's PageRank Algorithm

**Who:** Larry Page, Sergey Brin (Google founders)

**Their eigenvalue:** The dominant eigenvalue of the web's link matrix determines how "important" each webpage is. PageRank works by finding the eigenvector (the direction) associated with the largest eigenvalue of the internet's connectivity matrix. Each page's eigenvector component is its importance score.

**Same as PAR(2)?** Structurally similar but measuring different things. PageRank eigenvalue measures network importance (how connected you are). PAR(2) eigenvalue measures temporal persistence (how much you remember). Both use eigenvalues to extract a single "importance" number from a complex system, but the systems are different. PageRank operates on a spatial network (links between pages). PAR(2) operates on a temporal sequence (expression over time).

### 5. Machine Learning — Principal Component Analysis (PCA)

**Who:** Every data scientist, genomics researcher, neuroscientist

**Their eigenvalue:** When you run PCA on gene expression data, the eigenvalues tell you how much variance each principal component explains. The largest eigenvalue corresponds to the direction of most variation in the data.

**Same as PAR(2)?** Related but different. PCA eigenvalues measure spatial variance (which direction in gene space has the most spread). PAR(2) eigenvalues measure temporal persistence (how much the past predicts the future). PCA asks "which genes vary together across samples?" PAR(2) asks "how does each gene's own past predict its future?" They operate on different dimensions of the same data.

### 6. Population Ecology

**Who:** Leslie (1945), Caswell, ecologists studying population dynamics

**Their eigenvalue:** The dominant eigenvalue of the Leslie matrix tells you the long-term growth rate of a population. If it's > 1, the population grows. If < 1, it shrinks. The eigenvalue modulus determines whether the population is stable, growing, or declining.

**Same as PAR(2)?** Very similar. The Leslie matrix is an autoregressive model for population age structure, and its eigenvalue measures persistence — how strongly the current population structure determines the future. PAR(2) does the same for gene expression. Both use eigenvalue modulus to measure "memory" of a biological system. The difference is scale: population vs molecular.

### 7. Neuroscience — Brain Dynamics

**Who:** Breakspear, Deco, Friston, computational neuroscientists

**Their eigenvalue:** Eigenvalues of neural connectivity matrices or dynamical models determine brain state stability. Epilepsy, for example, has been modeled as an eigenvalue crossing the stability boundary — neural circuits become unstable and oscillate uncontrollably.

**Same as PAR(2)?** Closely related. Both use eigenvalues to measure dynamical stability of a biological system. The difference is the system (neural circuits vs gene expression networks) and the timescale (milliseconds vs hours). But the mathematical framework is the same: eigenvalue near 1 = persistent, stable dynamics; eigenvalue crossing 1 = instability.

### 8. Economics — Macroeconomic Models

**Who:** Sims, Engle, Granger (all Nobel laureates in Economics)

**Their eigenvalue:** Vector autoregressive (VAR) models in economics use eigenvalues to determine whether economic variables (GDP, inflation, interest rates) are stationary. If all eigenvalues are inside the unit circle, the economy is stable. Christopher Sims won the 2011 Nobel Prize largely for this approach.

**Same as PAR(2)?** This is where PAR(2) borrowed from directly. AR(2) models were developed primarily in economics and time-series econometrics. The eigenvalue interpretation — modulus < 1 means stationary, complex eigenvalues mean oscillation — is identical. PAR(2) took econometric time-series methodology and applied it to gene expression. The math is not just similar, it is the same math.

### 9. Climate Science

**Who:** Hasselmann (2021 Nobel Prize in Physics), climate modelers

**Their eigenvalue:** Eigenvalues of climate models determine the timescales of climate response. Klaus Hasselmann's stochastic climate model uses eigenvalues to distinguish fast weather fluctuations from slow climate trends — essentially measuring the "memory" of the climate system.

**Same as PAR(2)?** Conceptually identical. Hasselmann's eigenvalues measure how long the climate "remembers" a perturbation (volcanic eruption, CO2 pulse). PAR(2)'s eigenvalues measure how long a gene "remembers" a perturbation. Both are asking: "what is the characteristic persistence timescale of this system?"

### 10. Markov Chains / Probability

**Who:** Markov, every probabilist, epidemiologists, geneticists

**Their eigenvalue:** The eigenvalues of a Markov transition matrix determine how quickly the system converges to its long-run behavior. The second-largest eigenvalue controls the "mixing time" — how quickly the system forgets its initial state.

**Same as PAR(2)?** Closely related. Markov eigenvalues measure how quickly a system loses memory of where it started. PAR(2) eigenvalues measure how strongly a gene retains memory of its recent past. They're measuring the same underlying property (temporal persistence) from opposite directions.

## Summary: Are They All Saying the Same Thing?

**YES — the mathematical object is identical.** Every field above is computing eigenvalues of a matrix or operator that describes a dynamical system. The eigenvalue tells you the system's characteristic response: how it grows, decays, oscillates, or persists. The stationarity boundary (|lambda| = 1) means the same thing everywhere: below it, perturbations die out; above it, they grow; at it, they persist indefinitely.

**NO — the interpretation is domain-specific.** In quantum mechanics, eigenvalues are energy levels. In vibration analysis, they're natural frequencies. In ecology, they're growth rates. In economics, they're persistence timescales. In PAR(2), they're gene expression memory. Each field maps the same mathematical property onto a different physical or biological meaning.

**PAR(2)'s specific contribution** is recognizing that the eigenvalue of an AR(2) model fitted to gene expression time series has a biologically meaningful interpretation as "memory" — and that this interpretation connects gene dynamics to the same stability/oscillation framework used in engineering, physics, ecology, and economics. The math was there all along. What's new is pointing it at genes and showing that the result is biologically meaningful.

## Why This Matters

The fact that eigenvalues mean the same thing across all these fields is not a coincidence. It reflects a deep mathematical truth: all dynamical systems — whether atoms, bridges, populations, economies, brains, or genes — share the same underlying structure. They all have characteristic modes, natural frequencies, and stability boundaries.

PAR(2) doesn't invent new math. It recognizes that gene expression is a dynamical system, applies the standard dynamical systems toolkit (which has been refined over 200+ years across multiple fields), and shows that the result is meaningful. The eigenvalue is the universal language of dynamical systems, and PAR(2) uses it to read gene expression as a dynamical system — just as engineers use it to read bridges, physicists use it to read atoms, and economists use it to read markets.

### Quick Reference Table

| Field | Who | Their Eigenvalue Measures | Same Math as PAR(2)? | Same Interpretation? |
|---|---|---|---|---|
| Quantum Mechanics | Schrodinger, Dirac | Energy levels of atoms | Yes | Different (energy vs memory) |
| Vibration Analysis | Structural engineers | Natural frequencies of structures | Yes | Very close (resonance zone is same concept) |
| Control Theory | Control engineers | System stability | Yes | Identical (same stability boundary) |
| Google PageRank | Page, Brin | Webpage importance | Yes | Different (connectivity vs persistence) |
| PCA / Machine Learning | Data scientists | Variance explained | Yes | Different (spatial variance vs temporal memory) |
| Population Ecology | Leslie, Caswell | Population growth rate | Yes | Very close (persistence of biological state) |
| Neuroscience | Friston, Breakspear | Brain state stability | Yes | Very close (biological stability at different timescale) |
| Economics | Sims, Granger (Nobel) | Economic stationarity | Yes | Identical (PAR(2) borrowed directly from this) |
| Climate Science | Hasselmann (Nobel) | Climate system memory | Yes | Identical (persistence timescale of system) |
| Markov Chains | Markov, probabilists | Convergence / mixing time | Yes | Very close (memory from opposite direction) |
| **PAR(2)** | **This platform** | **Gene expression memory** | **—** | **Novel application of universal math** |
