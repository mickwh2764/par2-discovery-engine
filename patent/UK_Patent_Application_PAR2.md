# UK PATENT APPLICATION

## FORM 1 - REQUEST FOR GRANT OF A PATENT

**To:** The Comptroller-General of Patents, Designs and Trade Marks
Intellectual Property Office
Concept House
Cardiff Road
Newport
South Wales NP10 8QQ

---

## PART A: APPLICANT DETAILS

**Full Name of Applicant:** [YOUR FULL NAME]

**Address for Service in the UK:**
[YOUR ADDRESS]
[CITY, POSTCODE]
[UNITED KINGDOM]

**Nationality:** [YOUR NATIONALITY]

**Email:** [YOUR EMAIL]

**Telephone:** [YOUR PHONE]

---

## PART B: TITLE OF INVENTION

**AUTOMATED SYSTEM AND METHOD FOR DETECTING PHASE-AMPLITUDE CIRCADIAN GATING RELATIONSHIPS IN GENE EXPRESSION DATA**

---

## PART C: DECLARATION

I/We request the grant of a patent for the invention described in the accompanying specification.

**Signature:** ________________________

**Date:** ________________________

---

# PATENT SPECIFICATION

## TITLE OF THE INVENTION

**AUTOMATED SYSTEM AND METHOD FOR DETECTING PHASE-AMPLITUDE CIRCADIAN GATING RELATIONSHIPS IN GENE EXPRESSION DATA**

---

## FIELD OF THE INVENTION

[0001] The present invention relates to computational systems and methods for analysing biological time-series data. More specifically, the invention relates to an automated computer-implemented method and system for detecting and quantifying phase-amplitude relationships between circadian clock genes and target genes in gene expression datasets, with particular application to identifying temporal regulatory mechanisms relevant to cancer biology and chronotherapy.

---

## BACKGROUND OF THE INVENTION

[0002] Circadian rhythms are approximately 24-hour cycles that regulate numerous physiological processes in living organisms. These rhythms are controlled by a molecular clock comprising transcription factors including Period genes (Per1, Per2), Cryptochrome genes (Cry1, Cry2), and the BMAL1/CLOCK heterodimer.

[0003] Growing evidence suggests that disruption of circadian rhythms is associated with increased cancer risk and tumour progression. Understanding how circadian clock genes regulate cancer-related genes could inform chronotherapy approaches where treatment timing is optimised based on circadian phase.

[0004] Existing computational methods for analysing circadian gene expression data, such as JTK_CYCLE, MetaCycle, and COSOPT, are limited to detecting rhythmicity—determining whether a gene's expression oscillates with a circadian period. These methods cannot determine directional regulatory relationships or identify whether a clock gene's phase influences a target gene's amplitude.

[0005] There exists a need in the art for automated computational systems capable of detecting and quantifying "gating" relationships wherein one gene (the gatekeeper) modulates the expression dynamics of another gene (the target) in a phase-dependent manner.

---

## SUMMARY OF THE INVENTION

[0006] The present invention provides a computer-implemented method and system for automatically detecting phase-amplitude-relationship (PAR) gating effects between pairs of genes in time-series expression data.

[0007] According to a first aspect of the invention, there is provided a computer-implemented method for detecting circadian gating relationships in gene expression data, the method comprising:

(a) receiving, at a processor, time-series gene expression data comprising expression values for a plurality of genes measured at a plurality of timepoints;

(b) extracting expression profiles for at least one clock gene and at least one target gene from said data;

(c) fitting a cosine phase model to the clock gene expression data to determine instantaneous phase values at each timepoint;

(d) constructing a Phase-Amplitude-Relationship regression model of order 2 (PAR(2)) wherein target gene expression at timepoint n is modelled as a function of:
   - autoregressive terms comprising target gene expression at timepoints n-1 and n-2;
   - phase interaction terms comprising the product of autoregressive terms and trigonometric functions of the clock gene phase;

(e) estimating regression coefficients for said PAR(2) model using least squares optimisation;

(f) calculating F-statistics for the phase interaction terms to determine whether clock gene phase significantly modulates target gene expression dynamics;

(g) applying a significance threshold to identify statistically significant gating relationships; and

(h) outputting results indicating which gene pairs exhibit significant phase-amplitude gating.

[0008] According to a second aspect of the invention, there is provided a computer system for detecting circadian gating relationships, the system comprising:

(a) a data input module configured to receive and parse gene expression datasets in standard formats;

(b) a phase estimation module configured to fit cosine models to clock gene expression profiles;

(c) a PAR(2) analysis engine configured to construct and solve phase-amplitude-relationship regression models;

(d) a statistical inference module configured to calculate F-statistics and p-values for phase interaction terms;

(e) a multiple testing correction module configured to apply false discovery rate (FDR) correction across multiple hypothesis tests; and

(f) a results generation module configured to output publication-ready reports, figures, and statistical summaries.

[0009] According to a third aspect of the invention, there is provided a computer program product comprising instructions which, when executed by a processor, cause the processor to perform the method of the first aspect.

---

## DETAILED DESCRIPTION OF THE INVENTION

### Technical Problem Solved

[0010] The invention solves the technical problem of automatically identifying directional regulatory relationships between genes in high-dimensional time-series data. Unlike prior art methods that merely detect oscillation, the present invention determines whether one gene's circadian phase causally influences another gene's expression amplitude—a fundamentally different and more informative analysis.

### System Architecture

[0011] The system comprises the following technical components operating in combination:

**Data Processing Module**

[0012] The data processing module receives gene expression matrices in comma-separated value (CSV) format, tab-separated value (TSV) format, or compressed formats (.gz). The module automatically detects whether genes are arranged in rows or columns and extracts timepoint information from column headers using pattern matching algorithms.

[0013] The module normalises expression values to enable comparison across datasets with different dynamic ranges. Quality control filters remove genes with insufficient variance or excessive missing values.

**Phase Estimation Module**

[0014] For each clock gene, the phase estimation module fits a cosine model of the form:

```
E(t) = A × cos(2π/T × t - φ) + B
```

Where:
- E(t) is expression at time t
- A is amplitude
- T is period (default 24 hours)
- φ is phase offset
- B is baseline expression

[0015] The phase offset φ is estimated by solving the normal equations:

```
[ΣcosSq    ΣcosSin] [a]   [ΣExprCos]
[ΣcosSin   ΣsinSq ] [b] = [ΣExprSin]
```

Where the sums are computed over all timepoints, and φ = atan2(b, a).

[0016] The instantaneous phase at each timepoint is then calculated as:
```
Φ(t) = (2π/T × t - φ) mod 2π
```

**PAR(2) Analysis Engine**

[0017] The PAR(2) analysis engine constructs a regression model wherein target gene expression R at timepoint n is modelled as:

```
R_n = β₀ + β₁R_{n-1} + β₂R_{n-1}cos(Φ_{n-1}) + β₃R_{n-1}sin(Φ_{n-1}) 
    + β₄R_{n-2} + β₅R_{n-2}cos(Φ_{n-2}) + β₆R_{n-2}sin(Φ_{n-2}) + ε
```

Where:
- R_n is target gene expression at timepoint n
- Φ_{n-1}, Φ_{n-2} are clock gene phases at previous timepoints
- β₂, β₃, β₅, β₆ are phase interaction coefficients
- ε is residual error

[0018] This formulation captures how the clock gene's phase modulates the autoregressive dynamics of target gene expression. Non-zero phase interaction coefficients indicate that the target gene's expression dynamics depend on where in the circadian cycle the clock gene currently resides.

[0019] The regression coefficients are estimated using ordinary least squares (OLS) via matrix inversion:

```
β = (X'X)⁻¹X'y
```

Where X is the design matrix of predictor variables and y is the vector of response values.

**Statistical Inference Module**

[0020] To test whether the phase interaction terms are jointly significant, the system calculates an F-statistic:

```
F = [(RSS_reduced - RSS_full) / q] / [RSS_full / (n - p)]
```

Where:
- RSS_reduced is residual sum of squares for the null model (no phase terms)
- RSS_full is residual sum of squares for the full PAR(2) model
- q is the number of phase interaction terms (4)
- n is the number of observations
- p is the number of parameters in the full model

[0021] The F-statistic is compared to an F-distribution with (q, n-p) degrees of freedom to obtain a p-value.

**Multiple Testing Correction Module**

[0022] When testing multiple gene pairs, the system applies Benjamini-Hochberg false discovery rate (FDR) correction to control the expected proportion of false positives:

```
p_adjusted = p_raw × (m / rank)
```

Where m is the total number of tests and rank is the p-value's rank when sorted ascending.

**Results Generation Module**

[0023] The results generation module produces:
- Structured data files (JSON, CSV) containing all statistical results
- Publication-ready figures in scalable vector graphics (SVG) format at resolutions up to 432 dots per inch (DPI)
- Formatted manuscripts in LaTeX format suitable for academic journal submission
- Summary reports with interpretation of significant findings

### Technical Advantages

[0024] The invention provides the following technical advantages over prior art:

(a) **Directional inference**: Unlike rhythmicity detection methods, the PAR(2) model determines whether clock gene phase influences target gene dynamics, establishing a directional relationship.

(b) **Autoregressive framework**: The inclusion of lagged target gene terms (n-1, n-2) accounts for temporal autocorrelation inherent in biological time-series data, improving statistical validity.

(c) **Computational efficiency**: The closed-form OLS solution enables analysis of large gene panels (>20,000 genes) in seconds rather than hours required by iterative methods.

(d) **Automated pipeline**: Integration of data parsing, phase estimation, regression analysis, multiple testing correction, and result generation into a single automated workflow reduces manual intervention and transcription errors.

(e) **Reproducibility**: Embedded datasets and deterministic algorithms ensure identical results across independent executions.

---

## CLAIMS

**Claim 1.** A computer-implemented method for detecting circadian gating relationships in gene expression data, the method comprising:

receiving, at a processor, time-series gene expression data comprising expression values for a plurality of genes measured at a plurality of timepoints spanning at least one circadian cycle;

for each clock gene of interest, fitting a cosine phase model to determine instantaneous phase values at each timepoint;

for each pairing of a clock gene and a target gene, constructing a Phase-Amplitude-Relationship regression model of order 2 (PAR(2)) comprising:
- a baseline term;
- autoregressive terms representing target gene expression at one and two timepoints prior;
- phase interaction terms representing products of the autoregressive terms and trigonometric functions of the clock gene phase;

estimating regression coefficients for the PAR(2) model using least squares optimisation;

calculating an F-statistic to test the joint significance of the phase interaction terms;

determining a p-value from the F-statistic; and

outputting an indication of whether the clock gene significantly gates the target gene based on whether the p-value falls below a predetermined significance threshold.

**Claim 2.** A method according to Claim 1, wherein the phase interaction terms comprise:

R_{n-1} × cos(Φ_{n-1});
R_{n-1} × sin(Φ_{n-1});
R_{n-2} × cos(Φ_{n-2}); and
R_{n-2} × sin(Φ_{n-2});

where R represents target gene expression, Φ represents clock gene phase, and subscripts indicate timepoint indices.

**Claim 3.** A method according to Claim 1 or Claim 2, further comprising applying false discovery rate (FDR) correction when testing multiple gene pairs.

**Claim 4.** A method according to any preceding claim, wherein fitting the cosine phase model comprises solving normal equations to estimate a phase offset φ, and calculating instantaneous phase as:

Φ(t) = (2π/T × t - φ) mod 2π

where T is the circadian period.

**Claim 5.** A method according to any preceding claim, wherein the circadian period T is 24 hours.

**Claim 6.** A method according to any preceding claim, further comprising automatically detecting whether the gene expression data is arranged with genes in rows or columns.

**Claim 7.** A method according to any preceding claim, further comprising extracting timepoint values from column or row headers using pattern recognition.

**Claim 8.** A method according to any preceding claim, further comprising generating publication-ready figures in scalable vector graphics (SVG) format.

**Claim 9.** A method according to any preceding claim, further comprising generating a formatted manuscript document containing statistical results and interpretations.

**Claim 10.** A method according to any preceding claim, wherein the gene expression data comprises data from one or more of: liver tissue, heart tissue, kidney tissue, intestinal organoids, or tumour samples.

**Claim 11.** A computer system for detecting circadian gating relationships in gene expression data, the system comprising:

a processor; and

a memory storing instructions which, when executed by the processor, cause the system to perform the method of any of Claims 1 to 10.

**Claim 12.** A system according to Claim 11, further comprising:

a web server module configured to receive gene expression data via HTTP requests;

a database module configured to store analysis results; and

a client interface module configured to display results to a user.

**Claim 13.** A system according to Claim 11 or Claim 12, wherein the system is configured to operate offline without network connectivity after initial deployment.

**Claim 14.** A computer program product comprising instructions which, when executed by a processor, cause the processor to perform the method of any of Claims 1 to 10.

**Claim 15.** A computer-readable storage medium storing the computer program product of Claim 14.

---

## ABSTRACT

A computer-implemented method and system for detecting circadian gating relationships in gene expression data. The system receives time-series expression data, fits cosine phase models to clock gene profiles, and constructs Phase-Amplitude-Relationship (PAR(2)) regression models that include autoregressive terms and phase interaction terms. By testing the joint significance of phase interaction terms using F-statistics, the system determines whether clock genes significantly modulate target gene expression dynamics in a phase-dependent manner. The system provides automated analysis pipelines, false discovery rate correction for multiple testing, and generation of publication-ready outputs including figures and formatted manuscripts. The invention finds particular application in identifying circadian regulation of cancer-related genes for chronotherapy research.

(147 words)

---

## DRAWINGS

**Figure 1:** System architecture block diagram showing data flow between modules

**Figure 2:** Flowchart of the PAR(2) analysis method

**Figure 3:** Example cosine phase fitting to clock gene expression data

**Figure 4:** Example PAR(2) regression output showing significant gating relationship

**Figure 5:** User interface screenshot showing analysis results dashboard

---

# FILING INSTRUCTIONS

## Fees Payable (2024 rates)

| Fee | Amount |
|-----|--------|
| Filing fee (online) | £60 |
| Search fee (within 12 months) | £150 |
| Examination fee (within 6 months of publication) | £100 |
| **Total initial fees** | **£210** |

## How to File

**Online (recommended - reduced fees):**
https://www.ipo.gov.uk/p-apply-online-uk-form.htm

**By email:**
forms@ipo.gov.uk

**By post:**
Intellectual Property Office
Concept House
Cardiff Road
Newport NP10 8QQ

## Document Requirements

- A4 paper size
- Minimum 2cm margins
- 12-point font (Times New Roman or Arial)
- 1.5 line spacing
- Pages numbered consecutively

## Key Deadlines

- **12 months from filing:** Request search, file claims
- **18 months from filing:** Application published
- **6 months from publication:** Request examination
- **4.5 years from filing:** Respond to all objections

---

# IMPORTANT NOTES

1. **This is a draft template.** Before filing, consult a registered UK patent attorney to review and refine the claims.

2. **Software patentability:** This application is framed to emphasise the technical contribution (solving a bioinformatics problem using novel regression methodology). The UKIPO may still raise objections under Section 1(2) regarding software exclusions.

3. **Prior art search:** Conduct a thorough search of existing patents and academic literature before filing.

4. **Priority claim:** If you have filed in another jurisdiction, you may claim priority within 12 months.

5. **Professional fees:** Budget £2,000-£5,000 for professional patent attorney assistance through to grant.

---

**Document prepared:** December 2025
**Application reference:** [TO BE ASSIGNED BY UKIPO]
