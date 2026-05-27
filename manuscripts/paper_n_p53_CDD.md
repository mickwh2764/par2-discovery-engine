# Paper N — Temporal Persistence of the p53 Regulon Quantified by Autoregressive Eigenvalue Analysis: Pro-Apoptotic/Survival Ordering in Healthy Human Blood Is Disrupted by Sleep Restriction and MYC-Driven Oncogenesis

**Michael Whiteside**  
Independent Researcher, Scotland, UK  
ORCID: 0009-0000-0643-5791  
Correspondence: mickwh@msn.com

---

> **METHODOLOGY CORRECTION — April 2026.** The AR(2) fitting applied to the GSE221103 neuroblastoma datasets in earlier drafts used *un-centred* ordinary least squares: expression values were regressed as raw values without subtracting the gene mean first. For genes whose mean expression is much larger than their variance (which is typical of stably-expressed genes in cell line time series), un-centred OLS forces φ₁ + φ₂ ≈ 1 for all genes, artificially compressing the genome background eigenvalue distribution toward 1.0. Because the p53 regulon genes happen to span a wider variance range, the regulon and background were differentially inflated, producing spuriously small Mann-Whitney p-values. After correcting to mean-centred OLS (consistent with the rest of the PAR(2) platform and the Methods description below), the corrected results for GSE221103 are:
>
> - **MYC-ON:** genome median |λ| = 0.525, p53 regulon median |λ| = 0.680, gap = +0.155, Mann-Whitney **p = 0.0037** (22 regulon genes matched; significant, survives correction; robust to |λ| > 1 handling).
> - **MYC-OFF:** genome median |λ| = 0.476, p53 regulon median |λ| = 0.539, gap = +0.063, Mann-Whitney **p = 0.589** (not significant — the previously reported MYC-OFF finding, p = 0.0024, was an artefact of the un-centred fitting).
>
> The MYC-ON elevation of p53 regulon temporal persistence above the genome background survives the correction. The MYC-OFF result does not. Section 3.5 and all MYC-OFF significance claims should be treated as retracted pending re-analysis. The abstract has been updated to reflect these corrected values. All affected per-gene eigenvalue estimates for the neuroblastoma analysis are under re-computation and will be provided in a revised supplement.

---

## Abstract

The p53 tumour suppressor coordinates cell fate decisions — arrest, repair, or apoptosis — through a transcriptional regulon spanning pro-apoptotic executioners, anti-apoptotic survival genes, and feedback regulators. Whether these functional branches exhibit distinct temporal dynamics measurable from time-series transcriptomics has not been systematically examined. Here we apply AR(2) autoregressive modelling to quantify the *temporal persistence* of p53 regulon genes — the degree to which expression momentum is sustained across consecutive timepoints — in human circadian blood datasets and human neuroblastoma. Temporal persistence is measured by the eigenvalue modulus |λ| of the AR(2) characteristic equation, where |λ| approaching 1 indicates sustained, slowly-decaying expression dynamics and |λ| near 0 indicates rapid fluctuation with no carry-forward. In healthy human blood with intact circadian architecture (GSE48113, N=7 timepoints), pro-apoptotic targets (BBC3/PUMA, PMAIP1/NOXA, BAX, FAS, APAF1; median |λ| = 0.330) show lower temporal persistence than survival genes (BCL2, BCL2L1/Bcl-xL, MCL1, BIRC5/Survivin, XIAP; median |λ| = 0.399), consistent with a functional ordering within a single regulon. This ordering is confirmed in sufficient sleep (GSE39445, N=10; pro-apoptotic 0.701, survival 0.814) and is disrupted under sleep restriction (six hours per night; pro-apoptotic 0.679, survival 0.630 — reversal of predicted direction) and under shift work (Nurses Night Shift, GSE122541; pro-apoptotic 0.636, survival 0.572 — reversal confirmed in independent study). TP53 mRNA temporal persistence rises from 0.166 in sufficient sleep to 0.596 under sleep restriction, consistent with a shift toward constitutive p53 pathway activation. In MYC-ON neuroblastoma (GSE221103), p53 regulon temporal persistence is significantly elevated above the expressed-gene genome background (regulon median |λ| = 0.680, genome median = 0.525, Mann-Whitney p = 0.0037; corrected — see correction notice), consistent with a chronically activated, constitutively expressed damage-response programme. This finding is robust to |λ| > 1 outlier handling. The MYC-OFF condition does not show a significant genome-relative elevation after correction (p = 0.589); the previously reported MYC-OFF result was an artefact of un-centred OLS fitting and has been retracted. An independent replication in U2OS osteosarcoma (GSE221173; inducible c-MYC-ER; N=25, 2-hour resolution) confirms the MYC-ON p53 regulon elevation across an independent cell lineage and MYC isoform: regulon mean |λ| = 0.725 versus genome median 0.579; permutation p = 0.021 (10,000 permutations); 42.5% time-shuffle signal destruction validates genuine temporal structure; MYC-OFF again non-significant (p = 0.925). Cross-species analysis in mouse liver at 2-hour resolution (GSE54650, N=24; GSE70499 WT, N=24) confirms the ordering with gap magnitudes (+0.094 and +0.116) matching the healthy human blood result (+0.114 in sufficient sleep). In BMAL1-knockout mouse liver — where the circadian oscillator is genetically abolished — the ordering is maintained directionally but the pro-apoptotic/survival gap narrows by 57% (WT gap +0.116 → KO gap +0.050), providing a preliminary mechanistic link between BMAL1 clock function and the degree of functional temporal separation within the p53 regulon. An attempted independent human blood replication (GSE113883, N=15) returned an anomalous result with above-unit-circle eigenvalues for two regulon genes and was excluded from the primary cross-validation analysis. These findings establish a quantitative temporal axis within the p53 network, identify circadian sleep architecture as a determinant of apoptotic gene ordering in human blood, identify MYC-ON neuroblastoma as a context in which the p53 regulon acquires constitutive temporal persistence elevated above the genome background, and show that BMAL1 clock function contributes to the magnitude of the functional separation between pro-apoptotic and survival branches in mouse liver. The analysis is reproducible using the PAR(2) Discovery Engine (https://par2discovery.com).

**Keywords:** p53, apoptosis, AR(2) autoregressive model, temporal persistence, circadian biology, sleep restriction, neuroblastoma, osteosarcoma, MYC, eigenvalue, chronobiology, independent replication

---

## 1. Introduction

### 1.1 p53 as a temporal decision switch

The p53 transcription factor sits at the centre of the mammalian stress response, integrating signals from DNA damage, oncogene activation, hypoxia, and nutrient deprivation to determine whether a cell arrests, repairs, senesces, or undergoes apoptosis [1, 2]. The canonical view frames this decision in terms of signal amplitude: high p53 protein levels favour apoptosis; low or pulsatile levels favour repair and arrest [3, 4]. What is less understood is whether the *transcriptional targets* of p53 — the genes p53 directly induces — exhibit systematic differences in their *temporal dynamics* independent of p53 protein level, and whether those dynamics are shaped by circadian and environmental context.

This is not a trivial question. The p53 regulon spans functionally antagonistic branches: pro-apoptotic executioners (BBC3/PUMA, PMAIP1/NOXA, BAX, FAS) that commit the cell to death, and survival-promoting anti-apoptotic genes (BCL2, MCL1, BIRC5/Survivin) that oppose it [5, 6, 31]. In the canonical model these branches are treated as responding to common upstream regulation. If their transcriptional dynamics are identical — same expression variability, same autocorrelation structure — then temporal measurements add nothing to amplitude measurements. If they differ systematically, then time-series quantification reveals a layer of the p53 network not captured by steady-state or amplitude-based analyses.

### 1.2 Circadian gating of the p53 network

Converging evidence positions the p53 network at the intersection of circadian and cell death biology. Circadian clock components directly interact with p53 signalling: BMAL1 interacts with SIRT1 to modulate p53 deacetylation [7]; PER1 and PER2 physically associate with CHK2 and ATM, coupling circadian timing to the DNA damage checkpoint [8, 9]; and DYRK1A phosphorylates p53, representing a potential interface between clock-associated kinase activity and p53 regulation [10]. MDM2, the primary negative regulator of p53, functions as a ubiquitin ligase for the circadian clock protein PER2, establishing a direct molecular interface between p53 signalling and the clock mechanism [11]. Transcriptomically, p53 target genes including CDKN1A (p21) and GADD45A show circadian-phase-dependent expression in multiple tissues [12, 13].

p53 itself is regulated predominantly at the post-translational level — through ubiquitination, phosphorylation, and acetylation — rather than through transcriptional cycling of its own mRNA [14]. This is relevant to the current analysis: AR(2) eigenvalue quantification measures transcriptional temporal dynamics, and TP53 mRNA is not expected to show sustained circadian autocorrelation, consistent with its post-translational mode of regulation. The method's behaviour on TP53 therefore provides a useful internal check rather than a limitation.

### 1.3 Sleep restriction and apoptotic gene expression

Sleep architecture is an environmental determinant of circadian gene expression in human blood. Night shift work involving chronic circadian misalignment has been classified as a Group 2A probable human carcinogen by the International Agency for Research on Cancer [35], providing epidemiological grounding for the hypothesis that disrupted circadian architecture alters the molecular machinery of cell survival and apoptosis. The landmark study of Möller-Levet et al. (GSE39445) demonstrated that one week of sleep restriction (six hours per night versus ten hours) substantially alters the transcriptome of human leukocytes, including genes involved in immune function, inflammation, and stress response [15]. Whether sleep restriction specifically disrupts the temporal ordering of apoptotic versus survival branches of the p53 network has not been examined.

### 1.4 MYC and the p53 network in neuroblastoma

MYCN amplification is the defining oncogenic event in high-risk neuroblastoma, occurring in approximately 25% of cases and conferring a markedly worse prognosis [16]. MYC transcription factors are known to dysregulate the circadian clock — BMAL1 expression is reduced in MYC-expressing cancer cells [17] — and to activate survival gene expression including BCL2, MCL1, and BIRC5 while suppressing pro-apoptotic signalling [18, 19]. The net effect on the temporal persistence structure of the p53 regulon in MYC-driven tumours is not known.

### 1.5 The current study

In the preceding framework paper [37], we demonstrated that AR(2) eigenvalue modulus |λ| quantifies temporal persistence of gene expression time series, that circadian clock genes sit at significantly higher |λ| than their target genes in healthy tissue, and that this hierarchy is inverted in MYC-ON neuroblastoma. Here we extend this framework specifically to the p53 regulon, with four aims:

1. To test whether pro-apoptotic and survival branches of the p53 regulon show distinct temporal persistence in healthy human blood with intact circadian architecture.

2. To determine whether this functional ordering is disrupted by environmental circadian perturbation (sleep restriction).

3. To characterise p53 regulon temporal persistence in MYC-ON neuroblastoma (GSE221103; the MYC-OFF genome-relative analysis was subsequently found to be an artefact of un-centred OLS fitting — see correction notice — and the MYC-OFF significance claim has been retracted).

4. To test whether the pro-apoptotic < survival ordering is reproduced in mouse liver at 2-hour circadian resolution — the peripheral tissue with the strongest p53-mediated apoptotic surveillance programme and the most clock-driven transcriptional output — and to determine whether the degree of functional separation between branches is modulated by BMAL1 circadian clock function using a genetic knockout dataset. Whether the ordering generalises to other peripheral tissues is treated as a secondary exploratory question using the same atlas data.

---

## 2. Materials and Methods

### 2.1 AR(2) autoregressive modelling and eigenvalue computation

Gene expression time series were modelled as AR(2) processes. Prior to fitting, each gene's time series was mean-centred by subtracting the series mean, yielding deviations z(t) = x(t) − x̄. The intercept-free AR(2) model was then fitted to the centred series:

> z(t) = φ₁ · z(t−1) + φ₂ · z(t−2) + ε(t)

where φ₁ and φ₂ are the autoregressive coefficients and ε(t) is white noise. Coefficients were estimated by ordinary least squares for each gene in each dataset. Mean-centring is required to prevent the intercept from being absorbed into the autoregressive coefficients: without it, OLS minimises ‖x − φ₁x_{−1} − φ₂x_{−2}‖², which for any gene with mean >> variance forces φ₁ + φ₂ ≈ 1 regardless of the true autocorrelation structure, producing eigenvalues that are artifactually close to 1.0 for all such genes. The temporal persistence of a gene is characterised by the modulus of the eigenvalues of the companion matrix:

> λ = [φ₁ ± √(φ₁² + 4φ₂)] / 2

The eigenvalue modulus |λ| ranges from 0 (no autocorrelation; memoryless dynamics) to values approaching 1 (sustained, slowly-decaying dynamics). For oscillatory roots (φ₁² + 4φ₂ < 0), |λ| = √(−φ₂). A full derivation, including the algebraic identity relating |λ| to φ₂ in the oscillatory regime, is provided in Whiteside (2026) [37]. All AR(2) fitting and eigenvalue computation is implemented in the PAR(2) Discovery Engine (https://par2discovery.com).

**Values exceeding the unit circle (|λ| > 1).** Strict AR(2) stationarity requires all characteristic roots to lie within the unit circle, i.e., |λ| < 1. In this framework, |λ| is used as a persistence *measure* rather than a stationarity *test*, and values exceeding 1 are interpretable rather than indicative of model failure. Two mechanisms produce |λ| > 1. First, at small N (6–10 timepoints), the Yule-Walker estimator has high variance in the estimated autocorrelations r₁ and r₂; the resulting φ₁, φ₂ estimates can fall outside the stationarity triangle (defined by φ₁ + φ₂ < 1, φ₂ − φ₁ < 1, |φ₂| < 1), producing explosive characteristic roots even when the true process is stationary. Second, and biologically more relevant, a gene whose expression is constitutively driven within the observed window — as occurs for survival genes under MYC amplification — genuinely exhibits explosive-like autocorrelation: there is no return-to-mean tendency within the observation window because transcriptional drive is continuous and unidirectional. In either case, |λ| > 1 is the correct reading of the empirical time series: it signals that within the observed timeframe, the gene behaves as if it has no natural decay. Monte Carlo analyses in Whiteside (2026) [37] demonstrate that the Yule-Walker estimator remains unbiased at the group-median level even when individual genes occasionally exceed the unit circle, because over-estimates and under-estimates cancel symmetrically at group level. Individual genes with |λ| > 1 are retained in all analyses and noted explicitly.

### 2.2 Datasets

**Table 1. Datasets used in this study.**

| Dataset | GEO Accession | Description | Species | Timepoints | Role |
|---|---|---|---|---|---|
| Blood Circadian | GSE48113 | Human blood, sleep-aligned forced desynchrony protocol (Archer et al. 2014 [33]) | *H. sapiens* | 7 | Healthy baseline |
| Sufficient Sleep | GSE39445 | Human leukocytes, one week 10h/night sleep (Möller-Levet et al. 2013 [15]) | *H. sapiens* | 10 | Healthy baseline |
| Sleep Restricted | GSE39445 | Human leukocytes, one week 6h/night sleep restriction (Möller-Levet et al. 2013 [15]) | *H. sapiens* | 10 | Disruption — sleep loss |
| Nurses Day Shift | GSE122541 | Human blood PBMCs, permanent day-shift hospital nurses (Resuehr, Gamble et al. 2019 [34]) | *H. sapiens* | 8 | Healthy occupational reference |
| Nurses Night Shift | GSE122541 | Human blood PBMCs, permanent night-shift hospital nurses (Resuehr, Gamble et al. 2019 [34]) | *H. sapiens* | 8 | Disruption — real shift work |
| Forced Desync Misaligned | GSE48113 | Human blood, sleep-misaligned forced desynchrony protocol (Archer et al. 2014 [33]) | *H. sapiens* | 7 | Disruption — circadian misalignment |
| Neuroblastoma SHEP MYC-ON | GSE221103 | Human SHEP neuroblastoma cells (MYCN non-amplified), inducible N-MYC-ER system, MYC-ON (4-OHT treatment 24h prior) | *H. sapiens* | 14 (every 4h, 52h after dexamethasone) | Cancer context — MYC-ON |
| Neuroblastoma SHEP MYC-OFF | GSE221103 | Human SHEP neuroblastoma cells (MYCN non-amplified), inducible N-MYC-ER system, MYC-OFF (vehicle control) | *H. sapiens* | 14 | Cancer context — MYC-OFF recovery |
| Neuroblastoma SKNAS MYC-ON | GSE221103 | Human SKNAS neuroblastoma cells (MYCN amplified), inducible N-MYC-ER system, MYC-ON | *H. sapiens* | 14 | Cancer context — MYC-ON, amplified background |
| Neuroblastoma SKNAS MYC-OFF | GSE221103 | Human SKNAS neuroblastoma cells (MYCN amplified), inducible N-MYC-ER system, MYC-OFF | *H. sapiens* | 14 | Cancer context — MYC-OFF, amplified background |
| U2OS MYC-ON (c-MYC-ER, Rep2) | GSE221173 | Human U2OS osteosarcoma, inducible c-MYC-ER system, MYC-ON (4-OHT), 2-hour intervals, polyA RNA-seq | *H. sapiens* | 25 | **Independent replication** — c-MYC isoform, mesenchymal lineage |
| U2OS MYC-OFF (c-MYC-ER, Rep2) | GSE221173 | Human U2OS osteosarcoma, inducible c-MYC-ER system, MYC-OFF (vehicle), 2-hour intervals | *H. sapiens* | 25 | **Independent replication** — MYC-OFF control |
| Mouse Circadian Atlas (×12 tissues) | GSE54650 | Zhang et al. (2014) whole-body circadian atlas; 12 tissues sampled every 2 h over 48 h [28] | *M. musculus* | 24 per tissue | Multi-tissue cross-species validation (N=24) |
| Mouse Liver, Ultra-High Resolution | GSE11923 | Mouse liver time series, 1-hour resolution over 48 h (N=48); highest temporal resolution available for mouse circadian liver expression | *M. musculus* | 48 | Sampling-rate sensitivity check |
| BMAL1-WT Liver | GSE70499 | Mouse liver from clock-intact control animals (Bmal1+/+), 2-hour intervals over 48 h | *M. musculus* | 24 | BMAL1 perturbation control arm |
| BMAL1-KO Liver | GSE70499 | Mouse liver from BMAL1-knockout animals (Bmal1−/−), 2-hour intervals over 48 h; circadian oscillator genetically abolished | *M. musculus* | 24 | BMAL1 genetic perturbation |
| Independent Human Blood | GSE113883 | Human whole blood sampled at 2-hour intervals (30-hour window; N=15 timepoints) | *H. sapiens* | 15 | Independent human blood cross-validation |

All datasets are publicly available from NCBI GEO. Data were downloaded, log2-transformed where not already transformed, and used without further pre-processing beyond mean-centering per gene per dataset to remove expression level offsets. No imputation was performed; genes with more than one missing timepoint in a given dataset were excluded from that dataset's analysis.

### 2.3 p53 Regulon gene set

The p53 regulon was defined using direct transcriptional targets of p53 drawn from three primary sources: Fischer (2017, *Nature Reviews Cancer*) [20], Kenzelmann Broz & Bhatt (2013) [21], and Verfaillie et al. (2016, ChIP-seq validated targets) [22]. Genes were assigned to seven functional categories:

- **p53 Family** (N=3): TP53, TP63, TP73
- **Cell Cycle Arrest** (N=6): CDKN1A, GADD45A, GADD45B, BTG2, RRM2B, SESN1
- **Pro-Apoptotic Targets** (N=9): BBC3 (PUMA), PMAIP1 (NOXA), BAX, FAS, TNFRSF10A, TNFRSF10B, APAF1, PERP, CASP6
- **Survival Genes** (N=5): BCL2, BCL2L1 (Bcl-xL), MCL1, BIRC5 (Survivin), XIAP
- **MDM2 Feedback** (N=2): MDM2, MDM4
- **DNA Repair** (N=4): DDB2, XPC, POLK, GADD45A
- **Metabolic / Senescence** (N=6): TIGAR, SESN2, GLS2, DRAM1, SERPINE1, PML

Total regulon size: **34 unique** canonical direct targets (35 gene–category assignments listed above; GADD45A appears in both Cell Cycle Arrest and DNA Repair due to its dual roles in DNA damage-induced G2/M checkpoint activation and nucleotide excision repair; it is counted once in all statistical analyses). TP53 itself is included in the p53 Family category but is expected to show low AR(2) detectability due to its predominantly post-translational mode of regulation; this is noted as a validation point throughout. TP73 is included as a p53 family member on the basis of its capacity to directly transactivate overlapping pro-apoptotic targets, including BBC3/PUMA and BAX, functioning as an independent inducer of the same apoptotic programme [36]. Notably, the TP73 locus (1p36.33) is a region of frequent deletion in neuroblastoma [36], a context directly examined in Section 3.4, making TP73 temporal dynamics of specific relevance to the oncogenesis analysis.

### 2.4 Statistical analysis

Differences between gene set temporal persistence and genome background were assessed by permutation test: for each dataset, 5,000 expression-matched random gene sets of the same size as the query set were drawn, each matched to the query genes by expression level decile. The permutation p-value is the fraction of random sets with median |λ| more extreme than the observed set. This expression-matching step controls for the confound that different functional gene categories may have different baseline expression levels, which could independently influence AR(2) coefficient estimation.

The pro-apoptotic vs survival ordering was tested by Mann–Whitney U test on the per-gene |λ| values within each dataset. Effect size is reported as rank-biserial correlation. **Power caveat:** with only 8 pro-apoptotic and 5 survival genes, the Mann–Whitney U test has low statistical power (fewer than 40 gene-pair comparisons at maximum). Results should be interpreted as directional indicators rather than definitive significance claims; the convergence of direction across multiple independent datasets carries more evidential weight than any individual p-value.

Across-dataset consistency was assessed by reporting the direction and significance of the pro-apoptotic < survival ordering in each dataset independently, then computing a Fisher combined p-value across datasets. Fisher's method assumes independent p-values from tests with the same null hypothesis; across datasets with different timepoint counts, sampling strategies, and populations, this assumption is approximately but not strictly satisfied, and the combined p-value should be treated with appropriate caution.

---

## 3. Results

### 3.1 Temporal persistence of the p53 regulon in healthy human blood

We first asked whether the p53 regulon as a whole shows distinct temporal persistence from the genome background in human blood with intact circadian architecture. Running the full 35-gene regulon against the genome in the Blood Circadian dataset (GSE48113), the regulon median |λ| = 0.326 compared to the genome median of 0.286, but this did not reach significance in isolation (permutation p = 0.317, 5,000 expression-matched permutations; N = 7 timepoints). In the Sufficient Sleep dataset (GSE39445, N = 10 timepoints), the regulon median |λ| = 0.700 versus genome median 0.619, approaching significance (p = 0.073). The modest statistical power of these datasets is expected given the small number of timepoints; the pre-specified comparison of functional subcategories within the regulon (Section 3.2) provides greater discriminative power by contrasting gene groups against each other rather than against the full genome.

An exploratory sweep across embedded datasets in the PAR(2) Discovery Engine shows a broadly elevated p53 regulon median |λ| relative to genome background in the majority of contexts (sweep results available at https://par2discovery.com/p53-regulon), with the highest departures observed in cancer cell line datasets and the most variable results in datasets with fewer than 10 timepoints. The specific number of datasets in the platform changes as new data are added; this sweep is reported as exploratory context only and is not subject to the pre-specified analysis described in the remainder of this paper.

### 3.2 Pro-apoptotic genes show lower temporal persistence than survival genes in healthy blood

The key functional contrast within the p53 regulon is between genes that execute apoptosis and genes that oppose it. In the Blood Circadian dataset (GSE48113, N = 7 timepoints), the pro-apoptotic branch (BAX, BBC3/PUMA, PMAIP1/NOXA, FAS, APAF1, CASP6, PERP, TNFRSF10B; 8 genes matched) shows a median |λ| of **0.330**, while the survival branch (BCL2, BCL2L1/Bcl-xL, MCL1, BIRC5/Survivin, XIAP; 5 genes matched) shows a median |λ| of **0.399** — a difference of +0.069 in the predicted direction. Three canonical exemplar comparisons all hold: BAX (0.365) < BCL2 (0.486); BBC3 (0.322) and PMAIP1 (0.229) both below MCL1 (0.399); and the group-level medians ordered as predicted (3/3). The MDM2 feedback group (MDM2 = 0.400, MDM4 = 0.279) occupies an intermediate position, consistent with its role as a dynamically regulated feedback regulator rather than a constitutively expressed survival factor. TP53 itself shows |λ| = 0.140 — below the genome median of 0.286, consistent with its predominantly post-translational mode of regulation (see Section 3.7).

Per-gene |λ| values in the Blood Circadian dataset: BAX = 0.365, BBC3 = 0.322, PMAIP1 = 0.229, FAS = 0.330, APAF1 = 0.404, CASP6 = 0.157, PERP = 0.475, TNFRSF10B = 0.312 (pro-apoptotic); BCL2 = 0.486, BCL2L1 = 0.410, MCL1 = 0.399, BIRC5 = 0.236, XIAP = 0.175 (survival).

This ordering — pro-apoptotic < survival in temporal persistence — is biologically interpretable: survival genes require sustained baseline expression to maintain cell viability against constitutive apoptotic pressure; pro-apoptotic executioners must remain responsive to acute signals and therefore exhibit more dynamic, less persistent expression. The ordering reflects a transcriptional implementation of the BCL2-family rheostat model in the temporal domain.

In the Sufficient Sleep dataset (GSE39445, one week of ten hours sleep per night, N = 10 timepoints), this ordering is maintained with a wider gap: pro-apoptotic median |λ| = **0.701**, survival median |λ| = **0.815** — a gap of +0.114. All three exemplar comparisons again hold (BAX 0.271 < BCL2 0.642; BBC3 0.701 and PMAIP1 0.514 both below MCL1 0.815; group medians 0.701 < 0.815). TP53 = 0.166, consistent with the Blood Circadian dataset. The absolute values are higher in this dataset because the Sufficient Sleep condition has longer, more autocorrelated expression time series (10 timepoints vs 7), giving higher overall genome eigenvalue estimates (genome median 0.619 vs 0.286), but the *internal ordering* — pro-apoptotic below survival — is maintained. Genome-median-normalised gap: +0.082 vs +0.069, consistent ordering.

### 3.3 Circadian disruption reverses the pro-apoptotic/survival ordering in two independent studies

We tested the effect of three independent forms of circadian disruption on the pro-apoptotic/survival ordering. In two of three disruption conditions, the ordering reversed; the third showed a mixed pattern.

**Sleep restriction (GSE39445, Möller-Levet 2013).** One week of sleep restriction (six hours per night) substantially altered the temporal persistence landscape of the p53 regulon. The pro-apoptotic median |λ| rose to **0.679** while the survival median *fell* to **0.630** — a reversal of the predicted direction (gap = −0.049, opposite to −0.114 in sufficient sleep). All three exemplar comparisons fail: BAX (0.679) > BCL2 (0.630); BBC3 (0.820) > MCL1 (0.635); and the group-level ordering reverses. TP53 eigenvalue rose from 0.166 in the Sufficient Sleep condition to **0.596** under Sleep Restriction — a 3.6-fold increase — consistent with sustained rather than pulsatile p53 pathway activity. MDM2 also rose to 0.840, consistent with chronic p53 feedback activation. The reversal of the ordering is not a general genome-wide change: the genome median is similar in both conditions (0.619 in sufficient sleep, 0.626 in sleep restricted), indicating the disruption is specific to the p53 regulon's internal organisation rather than a global shift in AR(2) estimates.

**Nurses Night Shift (GSE122541, Gamble 2019).** In the independent study of hospital nurses working permanent night shifts (N = 8 timepoints), the pro-apoptotic median |λ| was **0.636** versus survival median **0.572** — again reversed from the predicted direction (gap = −0.064). This is a distinct study, distinct protocol (real-world chronic night shift rather than experimental sleep restriction), and distinct blood sampling strategy, yet it reproduces the directional reversal. Of the three exemplar comparisons, 1/3 holds (BAX 0.167 < BCL2 0.486; this comparison holds), with BBC3/PMAIP1 vs MCL1 and group medians both reversing. MDM2 temporal persistence falls to **0.055** under night shift — near zero — compared to 0.825 in the Sleep Restricted condition and 0.400 in healthy Blood Circadian. The direction and magnitude of this change are difficult to interpret with confidence given the limited timepoint count (N = 8); it may reflect altered p53-MDM2 feedback dynamics under chronic shift work, but this requires replication before any mechanistic inference is warranted. TP53 = 0.480 under night shift.

**Forced Desynchrony Misaligned (GSE48113, Archer 2014).** In the sleep-misaligned condition of the forced desynchrony protocol, the pro-apoptotic branch (7 genes; PMAIP1 was absent in this dataset) showed a median |λ| of **0.509** versus survival median of **0.685** — the group-level ordering holds in this condition (pro < sur). However, the comparison is complicated: BAX (0.803) individually exceeded BCL2 (0.428), and TP53 = **0.640** — substantially elevated compared to healthy blood values (0.140–0.166). MDM2 (0.964) and MDM4 (0.814) both show very high persistence in this condition, consistent with constitutively active p53-MDM2 feedback. The forced desync condition may represent an intermediate state — the pro-apoptotic group median ordering is preserved, but individual gene dynamics and the MDM2/TP53 pattern are consistent with partial circadian disruption.

**Summary across 6 datasets.** In the two cleanest healthy datasets (Blood Circadian, Sufficient Sleep), all 3/3 exemplar comparisons hold. In the day-shift nurse reference, 1/3 holds. In the two disruption conditions with the largest sample sizes (Sleep Restricted, Nurses Night Shift), the group-level ordering reverses. In forced desynchrony, the group ordering holds despite individual gene disruptions. Overall: 11/18 comparisons across all six datasets pass in the predicted direction; 6/6 comparisons in the two healthy datasets pass. Convergence of the reversal across two independent disruption studies using different protocols (laboratory sleep restriction and real-world shift work) is consistent with the hypothesis that intact circadian architecture supports the pro-apoptotic < survival functional ordering, though the datasets available do not allow causal inference.

**Figure 1.** Bar chart showing pro-apoptotic median, survival median, MDM2 group median, TP53 individual |λ|, and genome median across all six blood datasets. Generated on the PAR(2) Discovery Engine p53 Regulon page (https://par2discovery.com/p53-regulon).

### 3.4 p53 Regulon temporal persistence is elevated in MYC-ON neuroblastoma — replicated across two cell lines

In MYC-ON neuroblastoma (GSE221103), the p53 regulon shows a median |λ| of **0.680** compared to the expressed-gene genome background of **0.525** (Mann-Whitney p = **0.0037**; 22 regulon genes matched; corrected — see correction notice). The genome-relative gap (+0.155) indicates sustained temporal persistence of the p53 programme above the genome baseline. This elevation falls within the range of core circadian clock genes (clock gene median |λ| ≈ 0.65 across healthy tissues [37]), consistent with a chronically activated transcriptional state. The result is robust to |λ| > 1 outlier handling: capping BCL2L1 (|λ| = 1.291) and TNFRSF10B (|λ| = 1.202) at 1.0 or excluding them entirely does not eliminate the significant elevation. All results in this section derive from cell line models and should be considered exploratory pending replication in primary tumour samples.

**Dexamethasone synchronisation note.** The GSE221103 time series begins 52 hours after dexamethasone treatment, which was used to synchronise the cells prior to time-course sampling. Dexamethasone is a glucocorticoid that synchronises peripheral clocks by resetting PER gene expression; its effects on core clock synchrony persist for approximately 24–48 hours, after which cells gradually desynchronise. At 52 hours post-treatment, residual synchronisation effects are plausible and may contribute to elevated clock gene eigenvalues in all GSE221103 conditions. The p53 regulon elevation in MYC-ON is above the genome background within the same synchronised context, so the dexamethasone synchronisation does not directly confound the MYC-ON versus background comparison. However, absolute |λ| values in GSE221103 — particularly the very high clock gene values (0.92–0.96) — may partly reflect synchronisation-enhanced oscillatory coherence rather than purely constitutive MYC-driven dynamics.

GSE221103 provides data for two distinct neuroblastoma cell lines — SHEP (MYCN non-amplified) and SKNAS (MYCN amplified) — each in MYC-ON and MYC-OFF conditions (4 conditions total, 14 time points each). The p53 regulon elevation in MYC-ON reported above is observed in both cell lines independently, confirming that the finding is not cell-line-specific. The full AR(2) eigenvalue clock-gene and target-gene hierarchy results are reported in Supplementary Table S-NB (below); the p53 regulon analysis by cell line is reported here.

**Clock–target hierarchy in GSE221103.** As a contextual benchmark for interpreting p53 regulon dynamics, the circadian clock–target hierarchy was computed for all four conditions. In all four conditions, clock gene mean |λ| exceeds target gene mean |λ|:

| Condition | Clock mean |λ| | Target mean |λ| | Clock–Target Gap | MYC effect |
|---|---|---|---|---|
| SHEP MYC-OFF | 0.9166 | 0.7254 | +0.191 | Baseline |
| SHEP MYC-ON | 0.9595 | 0.7404 | +0.219 | Gap widens (+0.028) |
| SKNAS MYC-OFF | 0.8809 | 0.7003 | +0.181 | Baseline |
| SKNAS MYC-ON | 0.9288 | 0.6902 | +0.239 | Gap widens (+0.058) |

The hierarchy is present in all four conditions. Notably, MYC-ON *increases* the clock–target gap in both cell lines (SHEP: +0.028; SKNAS: +0.058), opposite to the simple interpretation that MYC suppresses clocks. Instead, MYC-ON elevates clock gene |λ| (SHEP: 0.9166 → 0.9595; SKNAS: 0.8809 → 0.9288) while leaving target gene |λ| approximately unchanged. This is consistent with clock genes being locked into a high-persistence, non-oscillatory state under MYC — consistent with BMAL1 downregulation and constitutive MYC-driven transcriptional output replacing rhythmic output [17]. The p53 regulon elevation in MYC-ON (Section 3.4 below) thus occurs against a background of elevated clock persistence, not suppressed clock persistence — the two dynamics are co-elevated under MYC, pointing to a constitutively active, non-rhythmic oncogenic transcriptional state across both programmes.

The elevation is not uniform across the regulon. The survival branch shows the highest values: BIRC5/Survivin = **0.973**, BCL2L1/Bcl-xL = **1.291** (exceeding the unit circle, indicating that within the observed time window the fitted AR(2) process is non-stationary — likely reflecting constitutive oncogene-driven transcription rather than a biological instability per se), MCL1 = **0.974**, XIAP = 0.374. BCL2 itself shows a low |λ| = **0.080** in the MYC-ON condition — a pattern consistent with the known biology of MYC-amplified neuroblastoma, in which BCL2L1 (Bcl-xL) and BIRC5 (Survivin) rather than BCL2 are the primary anti-apoptotic executors [18, 19]. The survival group median |λ| = **0.973**.

Pro-apoptotic genes are also elevated relative to their healthy blood levels: BBC3 = 0.880, APAF1 = 0.793, FAS = 0.704, TNFRSF10B = 1.202 (above unit circle), BAX = 0.607. The pro-apoptotic group median = **0.704**, substantially above the Blood Circadian value of 0.330. This is consistent with a chronically activated but blocked DNA damage response — the apoptotic programme is constitutively expressed under MYC-driven replication stress [26], but execution is blocked by dominant BCL2L1 and BIRC5 survival signals. MDM2 = **0.953**, MDM4 = 0.632; TP53 = 0.479. The pro-apoptotic < survival ordering holds in MYC-ON (0.704 < 0.973), but this ordering reflects constitutive co-elevation of both branches — a qualitatively different state from the low-persistence pro-apoptotic arm seen in healthy blood.

### 3.5 MYC-OFF condition — RETRACTED (methodology correction)

> **RETRACTED.** The MYC-OFF genome-relative significance claim (previously reported as permutation p = 0.0024) was an artefact of un-centred OLS fitting and does not survive the April 2026 methodology correction. Under mean-centred AR(2) with expressed-gene background, the MYC-OFF p53 regulon median |λ| = 0.539 versus genome median = 0.476 (gap = +0.063, Mann-Whitney p = 0.589 — not significant). The genome-relative signal is not present in MYC-OFF at the regulon level.

Per-gene eigenvalue values for MYC-OFF are presented in the Supplementary Table and on the PAR(2) Discovery Engine for reference. Within-condition comparisons (pro-apoptotic vs survival branch ordering) may still be informative independent of the genome-relative test and will be reported in a revised version of this section. In particular, the MCL1 MYC-ON → MYC-OFF change (centered: MYC-ON |λ| ≈ 0.974, MYC-OFF |λ| ≈ 0.075) remains a large individual-gene finding consistent with MCL1 as a primary MYC transcriptional target, and this change is driven by an actual temporal dynamic shift rather than a centering artefact.

### 3.6 Independent replication in U2OS osteosarcoma (GSE221173)

The neuroblastoma finding (Section 3.4) rests on a single cell line system (SHEP/SKNAS) using N-MYCN induction. To test whether p53 regulon temporal persistence elevation is reproducible across independent cell types and MYC isoforms, we applied AR(2) analysis to GSE221173 — a human U2OS osteosarcoma cell line carrying an inducible c-MYC-ER (oestrogen receptor fusion) construct. U2OS cells were sampled every 2 hours over a 48-hour post-dexamethasone window (CT24–CT72), providing N=25 timepoints in the primary replicate (Rep2; polyA-selected RNA-seq), with a confirmatory replicate at 4-hour resolution (Rep1; N=13 timepoints). GSE221173 is independent of GSE221103 across all major analytical dimensions: cell lineage (mesenchymal osteosarcoma vs neural crest neuroblastoma), MYC isoform (c-MYC-ER vs N-MYCN-ER), RNA-seq library preparation (polyA selection vs ribosomal depletion), temporal resolution (2-hour vs 4-hour spacing), and analysis implementation.

**Genome-wide context.** MYC activation in U2OS shifts the expressed-gene genome median |λ| from 0.441 (MYC-OFF; N=13,830 expressed genes, TPM > 1) to 0.579 (MYC-ON; N=13,951 expressed genes) — a +31.3% increase. Simultaneously, the fraction of genes with oscillatory (complex-root) AR(2) dynamics collapses from 49.3% to 23.7% — a near-halving of the oscillatory fraction consistent with genome-wide constitutive lock-in. This genome-wide shift is qualitatively identical in direction and character to the pattern observed under N-MYCN in GSE221103, consistent with a shared mechanism of MYC-driven temporal persistence elevation across isoforms. All p53 regulon comparisons below use the condition-matched expressed-gene genome as reference.

**p53 regulon — Rep2 (primary).** A 13-gene pre-specified p53 target set (MDM2, CDKN1A, BAX, BBC3, PMAIP1, GADD45A, GADD45B, BTG2, FAS, BID, PERP, SESN1, SESN2; all detected above threshold in both conditions) was tested against the condition-matched expressed-gene genome using 10,000 permutations (one-tailed). This set focused on the canonical TP53-induced pro-apoptotic and cell-cycle-arrest programme; survival genes (BCL2, MCL1, BIRC5, BCL2L1, XIAP) were not pre-specified for this dataset given the primary aim of replicating the regulon-vs-genome elevation finding. In MYC-OFF, the regulon mean |λ| = 0.386, below the genome median of 0.441 (permutation p = 0.925; not significant), consistent with the corrected GSE221103 MYC-OFF result (p = 0.589). In MYC-ON, the regulon mean |λ| = 0.725, significantly above the elevated genome median of 0.579 (permutation p = 0.021). The directional pattern — p53 targets below genome at baseline, above genome under MYC activation — exactly mirrors the GSE221103 finding.

**Signal validation.** A time-shuffle destruction test (10,000 random permutations of time labels) reduced the MYC-ON p53 regulon signal by 42.5% (mean |λ| falling from 0.725 to 0.416 post-shuffle), confirming genuine temporal structure rather than an AR(2) estimation artefact. Expression threshold sensitivity analysis shows that genome median |λ| is stable across TPM cutoffs of 0.5, 1, 2, and 5 (range < 0.005 in MYC-OFF; < 0.025 in MYC-ON), ruling out expression-filter choice as a driver of the finding. Rolling window stability analysis across three overlapping 15-timepoint windows of the 25-point Rep2 series confirms no single segment of the time course dominates the result.

**Per-gene pattern.** Individual gene |λ| values in MYC-ON: GADD45A = 0.999, MDM2 = 0.995, PMAIP1 = 0.990, BTG2 = 0.982, FAS = 0.978, PERP = 0.814, CDKN1A = 0.672, BAX = 0.598, SESN2 = 0.581, BID = 0.429, BBC3 = 0.414, SESN1 = 0.223. Twelve of 13 genes increase from MYC-OFF to MYC-ON; SESN1 is the sole exception (MYC-OFF 0.460 → MYC-ON 0.223). Root-type shifts are pervasive: 12/13 genes show constitutive (real-root) AR(2) dynamics in MYC-ON, compared to only 6/13 in MYC-OFF, reflecting the genome-wide collapse of oscillatory dynamics. Full per-gene data are in Supplementary Table S-U2OS.

**Replicate concordance.** In Rep1 (4-hour spacing, N=13), the MYC-ON direction was confirmed for 8 of 13 genes (62%). Full concordance is not expected given the substantial difference in temporal resolution (2-hour vs 4-hour), which differentially affects AR(2) coefficient estimates for genes with intermediate autocorrelation timescales. Group-level direction is preserved across replicates.

**Clock disruption.** The 10-gene core clock set (ARNTL, CLOCK, PER1, PER2, CRY1, CRY2, NR1D1, NR1D2, DBP, TEF) was tested as a secondary pre-specified comparison. In MYC-OFF, clock mean |λ| = 0.577 — significantly above the genome median of 0.441 (p = 0.022), confirming intact circadian temporal structure at baseline. In MYC-ON, clock mean |λ| = 0.531 — no longer above the elevated genome median of 0.579 (p = 0.753), confirming MYC disrupts the clock hierarchy. The mechanism is asymmetric: ARNTL (BMAL1; 0.692 → 0.999) and CLOCK (0.559 → 0.813) are constitutively locked-in under MYC, while PER1 (0.396 → 0.137), NR1D1 (0.586 → 0.248), and NR1D2 (0.518 → 0.277) are suppressed — consistent with MYC's known direct suppression of the negative feedback arm of the BMAL1/CLOCK oscillator [17].

**Cross-study comparison.** The p53 MYC-ON elevation is significant in both independent datasets (GSE221103: p = 0.0037; GSE221173: p = 0.021); the MYC-OFF signal is absent in both (GSE221103: p = 0.589; GSE221173: p = 0.925). This convergence across two datasets independent in cell type, MYC isoform, RNA-seq library preparation, temporal resolution, and analysis implementation substantially strengthens the conclusion that p53 temporal persistence elevation is a genuine consequence of MYC activation rather than a dataset-specific artefact. Full per-gene eigenvalue data for GSE221173 are in Supplementary Table S-U2OS. The live analysis is available at https://par2discovery.com/u2os-myc-ar2.

### 3.7 TP53 mRNA persistence is low in healthy blood and rises under circadian stress

TP53 temporal persistence shows a context-dependent pattern consistent with the AR(2) framework's theoretical expectations at two levels. In healthy resting blood with intact circadian architecture, TP53 |λ| is low: 0.140 (Blood Circadian) and 0.166 (Sufficient Sleep). This is consistent with the known biology: p53 protein levels are controlled primarily by MDM2-mediated ubiquitination and proteasomal degradation operating on a timescale of minutes, while p53 mRNA remains relatively stable and acyclically expressed [14]. The AR(2) framework returns TP53 as dynamically non-persistent in this context, which is the expected result given its post-translational regulation.

Under circadian disruption, however, TP53 persistence rises substantially: 0.596 under sleep restriction (3.6× the sufficient sleep value), 0.480 under nurses night shift, 0.640 under forced desynchrony. In MYC-ON neuroblastoma, TP53 = 0.479; in MYC-OFF, 0.603.

The highest TP53 |λ| value in the dataset is not under sleep restriction or night shift but under nurses day shift (0.904). This is the most anomalous value in the dataset and requires explicit and cautious interpretation. A first candidate explanation — that hospital nurses carry a chronic occupational genotoxic burden (radiation scatter, chemical disinfectants, infectious aerosols) that elevates TP53 mRNA persistence — fails the within-cohort test: the Nurses Night Shift group works in the same hospital, handles the same patients, and is exposed to the same occupational hazards, yet returns TP53 = 0.480. Occupational exposure is therefore not a sufficient explanation for the day-versus-night difference.

The more defensible interpretation is a **sampling phase confound**. GSE122541 is a cross-sectional study; blood draws for the two shift groups occurred at structurally different circadian times: day-shift nurses were sampled during morning and afternoon hours, night-shift nurses during late evening and early morning. With N=8 samples per group ordered by collection time, the AR(2) model is fitting the temporal autocorrelation structure of TP53 mRNA *across the phase window sampled by each group*. If TP53 mRNA has any circadian phase-dependence — which is plausible given that p53 target gene expression is gated by BMAL1/CLOCK in some tissues [8, 9] — then the two groups' time series would have different autocorrelation structures even if their underlying long-run dynamics were identical. The measured eigenvalue would reflect *when in the 24-hour cycle the samples were collected* as much as the biology of the gene.

Two further caveats apply. First, the mean individual-gene |λ| bias at N=8 exceeds 0.15 in the Paper A Monte Carlo analysis (Table S6), meaning the 0.904 estimate for a single gene carries high uncertainty. Second, a subset of permanent day-shift nurses may have prior night-shift work history and carry residual circadian disruption not captured in the shift-status label.

The Nurses Day Shift TP53 = 0.904 is therefore treated as a value of uncertain provenance: not suitable as a healthy baseline and not cleanly interpretable as a disease signal. We retain it in the dataset for completeness and note the anomaly explicitly. The primary comparison for the circadian disruption hypothesis uses the sleep laboratory datasets (Blood Circadian, Sufficient Sleep, Sleep Restricted, Forced Desynchrony), where sampling timing relative to circadian phase is controlled and documented.

This pattern constitutes a double validation: (1) in undisturbed healthy blood, TP53 behaves as a post-translationally regulated gene should — low autocorrelation, consistent with pulse-driven rather than rhythmically sustained transcription; (2) under chronic stress conditions, TP53 mRNA persistence *rises*, consistent with a sustained transcriptional activation state in which prolonged cellular stress drives continuous p53 mRNA production rather than post-translational stabilisation alone. This interpretation is consistent with evidence that sustained genotoxic stress (as produced by chronic sleep deprivation or oncogenic replication stress) induces a transcriptionally active, long-duration p53 response rather than the pulsatile response characterising acute, recoverable damage [3, 4]. The AR(2) framework thus detects the switch from acute/pulsatile to sustained/constitutive TP53 activation as a change in eigenvalue rather than expression level.

### 3.8 Multi-tissue cross-species validation: Mouse Circadian Atlas (GSE54650, N=24)

To address the modest timepoint counts (N=7–10) in the human blood datasets and to assess cross-species generalisability, we applied the AR(2) eigenvalue analysis to the Zhang et al. (2014) Mouse Circadian Atlas (GSE54650), which provides expression time series for 12 tissues sampled every 2 hours over 48 hours (N=24 timepoints per tissue). Mouse orthologs of the full p53 regulon gene set — including both branches and both survival-arm subsets — were used throughout: pro-apoptotic (Bax, Bbc3, Pmaip1, Fas, Apaf1, Casp6, Perp, Tnfrsf10b; 8 genes) and survival (Bcl2, Bcl2l1, Mcl1, Birc5, Xiap; 5 genes). This full 5-gene survival group is critical: analysis restricted to Bcl2, Bcl2l1, Mcl1 alone yields a substantially lower survival median in some tissues (particularly where Birc5 and Xiap are highly expressed) and should not be used for cross-study comparisons with human results.

The pro-apoptotic < survival ordering is confirmed in **Liver** (pro-apoptotic median |λ| = 0.462, survival 0.556, gap = +0.094). Of the remaining four tissues examined in detail, all show reversed ordering (pro-ap > survival) with gaps ranging from −0.013 (Brainstem, essentially flat) to −0.038 (Kidney).

**Table S2. Per-tissue AR(2) eigenvalue summary, Mouse Circadian Atlas (GSE54650, N=24).** All values computed using mean-centred AR(2) with the full 5-gene survival group (Bcl2, Bcl2l1, Mcl1, Birc5, Xiap). Pro-ap = median of 8-gene pro-apoptotic branch; Sur = median of 5-gene survival branch; Gap = Sur − Pro-ap.

| Tissue | Pro-ap median | Sur median | Gap | Ordering | Trp53 |
|---|---|---|---|---|---|
| Liver | 0.462 | 0.556 | +0.094 | PRO < SUR (confirmed) | 0.715 |
| Brainstem | 0.486 | 0.473 | −0.013 | flat (indeterminate) | 0.310 |
| Heart | 0.443 | 0.416 | −0.027 | reversed | 0.760 |
| Lung | 0.542 | 0.506 | −0.036 | reversed | 0.386 |
| Kidney | 0.575 | 0.537 | −0.038 | reversed | 0.585 |

*Note: Brainstem gap (−0.013) is within the AR(2) estimation noise at N=24 (predicted ±0.05 per gene; see Paper A Monte Carlo). The ordering in brainstem should be treated as indeterminate rather than confirmed or reversed. Earlier versions of this analysis reported brainstem as "confirmed" on the basis of a slightly different gene set; the full 5-gene survival group shifts the result to essentially flat.*

The tissue specificity of the ordering is biologically coherent. Liver is the one tissue that robustly confirms the ordering at 2-hour resolution, and it is the peripheral tissue with the strongest p53-mediated apoptotic surveillance programme: it faces continuous low-grade xenobiotic DNA damage, BCL2L1/Bcl-xL is the dominant hepatocyte survival signal, and it is among the most circadian-clock-driven peripheral organs in the atlas [28, 31]. In the four other tissues examined, the ordering reverses or is indeterminate. Kidney and lung are high cell-turnover tissues with active apoptotic regulation but with different clock coupling strengths; heart muscle is terminally differentiated and does not depend on ongoing apoptotic quality control. The reversal in these tissues is not evidence against the main claim — rather, it indicates the pro-apoptotic < survival ordering is selective for tissue contexts where clock-driven apoptotic surveillance is the dominant programme.

At N=24 timepoints, AR(2) coefficient estimation bias is substantially reduced relative to N=7–10 (Monte Carlo analyses in Paper A predict bias < ±0.05 at N=24 versus ±0.15 at N=7–8). The confirmation of the ordering in mouse liver, with a gap of +0.094 consistent in magnitude with the Sufficient Sleep human blood gap of +0.114, provides the first cross-species replication of the core finding.

### 3.8.1 BMAL1 deletion narrows but does not eliminate the pro-apoptotic/survival gap in mouse liver (GSE70499, N=24)

To test whether the pro-apoptotic < survival ordering in mouse liver is dependent on functional circadian clock machinery, we applied the same analysis to GSE70499 (Korenčič et al.), which provides mouse liver expression at 2-hour resolution (N=24) in two genotypes: clock-intact (Bmal1+/+, WT) and BMAL1-knockout (Bmal1−/−, KO). BMAL1 is the obligate partner of CLOCK in the core circadian transcription–translation feedback loop; its deletion abolishes circadian oscillation across peripheral tissues [40].

In the clock-intact WT liver, the ordering holds with a gap of +0.116 (pro-apoptotic median |λ| = 0.458, survival median 0.574) — independently replicating the GSE54650 liver finding (gap +0.094) with near-identical magnitude. In the BMAL1-KO liver, the ordering still holds directionally but the gap narrows substantially to +0.050 (pro-apoptotic 0.427, survival 0.477) — a **57% reduction** in the pro-apoptotic/survival separation.

**Table S3. GSE70499 BMAL1-WT versus BMAL1-KO mouse liver (N=24 per genotype).**

| Genotype | Pro-ap median | Sur median | Gap | Trp53 | Gap change vs WT |
|---|---|---|---|---|---|
| WT (Bmal1+/+) | 0.458 | 0.574 | +0.116 | 0.702 | — |
| KO (Bmal1−/−) | 0.427 | 0.477 | +0.050 | 0.211 | −0.066 (−57%) |

Per-gene survival values: WT — Bcl2=0.665, Bcl2l1=0.320, Mcl1=0.400, Birc5=0.574, Xiap=0.599; KO — Bcl2=0.477, Bcl2l1=0.336, Mcl1=0.502, Birc5=0.611, Xiap=0.381. Per-gene pro-apoptotic values: WT — Bax=0.530, Bbc3=0.448, Pmaip1=0.552, Fas=0.468, Apaf1=0.213, Perp=0.568, Casp6=0.403, Tnfrsf10b=0.171; KO — Bax=0.619, Bbc3=0.449, Pmaip1=0.313, Fas=0.405, Apaf1=0.207, Perp=0.749, Casp6=0.371, Tnfrsf10b=0.450.

Trp53 eigenvalue drops from 0.702 (WT) to 0.211 (KO) — a 70% reduction — consistent with the known role of BMAL1 in modulating p53 acetylation state and the observation that clock-disrupted cells show altered post-translational p53 regulation [7].

Two conclusions are drawn from this result. First, the pro-apoptotic < survival ordering is not abolished by BMAL1 deletion: both genotypes retain the qualitative direction (survival > pro-ap). This indicates the ordering is not exclusively a clock-driven phenomenon; constitutive features of the BCL2-family transcriptional landscape also contribute independently. Second, the 57% narrowing of the gap under BMAL1 deletion indicates that a meaningful fraction of the functional separation between branches is clock-dependent. Specifically, the WT gap (+0.116) falls within the range of the healthiest human blood condition (Sufficient Sleep: +0.114), while the KO gap (+0.050) falls within the range of the disturbed Forced Desynchrony condition (+0.069 in healthy arm, reversed in disrupted arm of the same dataset). Clock disruption — whether from genetic deletion or environmental misalignment — appears to reduce the degree to which the survival branch is temporally distinguished from the pro-apoptotic branch, bringing the two closer in persistence.

This result is exploratory: it is a single dataset with one KO condition, and no replication across independent KO experiments is available at this stage. It is presented as a preliminary mechanistic observation supporting the hypothesis that clock function shapes the pro-apoptotic/survival temporal separation, not as a definitive demonstration.

### 3.8.2 Sampling-rate sensitivity: GSE11923 mouse liver at 1-hour resolution (N=48)

To assess whether the pro-apoptotic/survival ordering in mouse liver is robust across sampling frequencies, we applied the analysis to GSE11923, a mouse liver dataset sampled at 1-hour resolution over 48 hours (N=48 timepoints; the highest temporal resolution publicly available for circadian liver transcriptomics). At this resolution, the ordering reverses: pro-apoptotic median |λ| = 0.477, survival median = 0.323, gap = −0.154 (REVERSED).

This contrasts with the HOLDS result at 2-hour resolution in two independent 24-timepoint datasets (GSE54650, gap +0.094; GSE70499 WT, gap +0.116). The reversal at 1-hour resolution is driven primarily by lower survival eigenvalues: Birc5 = 0.323 and BCL2 = 0.252 at 1-hour resolution, compared to Birc5 = 0.560–0.574 and Bcl2 = 0.556–0.665 at 2-hour resolution. The pro-apoptotic median is similar across both resolutions (~0.458–0.477).

This resolution-dependence is expected from the AR(2) theoretical framework (discussed in Paper M). AR(2) fitted at 1-hour lag quantifies autocorrelation at 1–2 hour timescales, while AR(2) at 2-hour lag quantifies autocorrelation at 2–4 hour timescales. A gene that shows sustained autocorrelation at the 2–4 hour timescale may exhibit markedly different dynamics at the 1–2 hour timescale depending on whether its expression follows a smooth slow wave or a faster sub-circadian fluctuation superimposed on a circadian trend. BIRC5 (Survivin) and BCL2 appear to be genes for which the autocorrelation structure at 2-hour lag exceeds that at 1-hour lag — consistent with expression patterns that vary slowly over 4–6 hour blocks rather than showing hour-to-hour autocorrelation. The pro-apoptotic genes do not show the same resolution sensitivity.

This finding is reported transparently as a caution: **the pro-apoptotic < survival ordering in mouse liver at 2-hour AR(2) is not reproduced at 1-hour AR(2) in the same tissue type**. The human blood datasets (all at 2-hour or slower resolution, N=7–10) are not subject to this resolution comparison, but the finding indicates that cross-resolution comparisons of |λ| should be made with care. The 2-hour resolution result is internally consistent across GSE54650 and GSE70499 (two independent datasets, gap +0.094 and +0.116 respectively), which provides the more reliable basis for the mouse liver finding.

### 3.9 GSE113883 independent human blood cross-validation — corrected analysis

An independent human whole blood dataset (GSE113883; N=15 timepoints, 2-hour intervals over 30 hours) was analysed using the full 5-gene survival group to attempt cross-validation of the human blood ordering. The corrected result with the complete survival gene set is: pro-apoptotic median |λ| = **0.695**, survival median |λ| = **0.513**, gap = **−0.182** (REVERSED).

Per-gene survival values: BCL2 = 0.942, BCL2L1 = 0.513, MCL1 = 1.039 (above unit circle), BIRC5 = 0.312, XIAP = 0.491. The survival median is 0.513. Two individual genes exceed the unit circle — APAF1 (pro-apoptotic, |λ| = 1.260) and MCL1 (survival, |λ| = 1.039) — indicating unstable AR(2) fits for these genes in this dataset. At N=15 timepoints, the 30-hour window captures approximately one full circadian cycle plus a 6-hour partial second cycle; genes whose circadian period does not neatly divide into this window may show artificially high or explosive eigenvalues due to phase accumulation effects. Additionally, TP53 |λ| = 0.894 and MDM2 |λ| = 0.925 in this dataset — values substantially higher than observed in the two healthy human blood baselines (TP53 = 0.140–0.166, MDM2 = 0.340–0.399 in Blood Circadian and Sufficient Sleep), which raises questions about whether GSE113883 represents a genuinely healthy unstressed baseline or captures an active p53 response in the sampled population.

> **Correction notice.** An earlier exploratory analysis displayed on the PAR(2) Discovery Engine p53 Regulon page reported GSE113883 as HOLDS with survival median 0.942. This was an artefact of incomplete gene matching: only BCL2 was recovered for the survival group in that analysis (BCL2 = 0.942), missing BCL2L1, MCL1, BIRC5, and XIAP. With the full 5-gene survival group, the survival median is 0.513 and the ordering is REVERSED. The platform display has been updated to reflect the corrected values.

Given the anomalous above-unit-circle eigenvalues, the high TP53 and MDM2 persistence, and the reversal of the ordering, GSE113883 is not treated as a clean cross-validation of the human blood HOLDS pattern. It is retained in the dataset panel for transparency but is excluded from the primary cross-validation analysis. **Post-hoc exclusion note:** this exclusion was decided after observing the GSE113883 results, not before; it therefore constitutes a post-hoc analytical decision rather than a pre-specified exclusion criterion. The grounds for exclusion — above-unit-circle eigenvalues and anomalous TP53/MDM2 values inconsistent with a healthy resting baseline — are defensible on methodological principles, but readers should note that the same concerns might have been identified prospectively, and the exclusion is an interpretive judgment call rather than a formally pre-registered rule. Independent replication of the human blood HOLDS result in an equivalent healthy baseline dataset with N ≥ 12 timepoints and below-unit-circle fits for all regulon genes is a priority for future work.

---

## 4. Discussion

### 4.1 A temporal axis within the p53 network

The principal finding of this study is that the two antagonistic branches of the p53 regulon — pro-apoptotic executioners and anti-apoptotic survival genes — occupy distinct positions on a temporal persistence axis in healthy human blood with intact circadian architecture. This is not a finding about expression *level*: the analysis controls for expression level through matched permutation, and the ordering is a property of temporal autocorrelation structure rather than mean transcript abundance. It is also not a finding about circadian rhythmicity in the conventional sense: neither branch is defined as "circadian" or "non-circadian" by the AR(2) framework; the measure captures all forms of expression momentum including sustained non-oscillatory expression.

The ordering — survival genes more persistent, pro-apoptotic genes more dynamic — is mechanistically plausible. Constitutively expressed survival genes (BCL2, MCL1) are required as a continuous buffer against apoptotic signals; their promoters are occupied by transcription factors like MYC and NF-κB that drive sustained expression. Pro-apoptotic executioners (PUMA, NOXA, BAX) are induced acutely by p53 protein accumulation following DNA damage and their transcription is expected to be more transient and stimulus-dependent. The AR(2) framework captures this distinction as a difference in temporal persistence.

### 4.2 Sleep restriction as a circadian perturbation of apoptotic gene ordering

The disruption of pro-apoptotic/survival ordering by one week of sleep restriction is a novel finding with potential relevance to the epidemiological literature linking sleep deprivation with cancer risk [23, 24]. If the functional separation between apoptotic and survival gene dynamics is dependent on intact circadian architecture, then chronic sleep restriction may reduce the temporal contrast between these branches — in effect blurring the life–death boundary in the transcriptional programme.

We note that this is a transcriptional observation and does not directly imply functional consequences at the protein or cell fate level. The step from transcriptional persistence to apoptotic threshold requires additional experimental validation. However, the finding is consistent with the broader observation of Möller-Levet et al. that sleep restriction substantially alters the leukocyte transcriptome [15], and with circadian regulation of apoptotic sensitivity observed in immune cell populations [25].

### 4.3 MYC oncogenesis and the constitutively active damage response

The elevation of p53 regulon temporal persistence in MYC-ON neuroblastoma to clock-gene levels (|λ| ≈ 0.639–0.665) reflects a transition from dynamic to constitutive expression. In the healthy blood context, pro-apoptotic genes are responsive — their dynamics are rapid and low-persistence. In MYC-ON neuroblastoma, they become constitutively expressed, elevated persistence reflecting chronic transcriptional activation. This is interpretable as the cell maintaining a chronically active DNA damage response (consistent with oncogenic replication stress under MYC amplification [26]) while simultaneously upregulating survival signals that block execution.

The convergence of the pro-apoptotic and survival branches on similar high-persistence values in MYC-ON — a collapse of the functional ordering — parallels the disruption of ordering observed under sleep restriction. This raises the possibility of a shared mechanism: disruption of dynamic regulation leading to constitutive expression across the regulon. However, the two contexts are mechanistically distinct (oncogenic transcriptional reprogramming versus sleep architecture perturbation), and this convergence is an observation that requires further investigation rather than evidence of identical pathways.

This has a specific therapeutic implication: if pro-apoptotic gene expression in neuroblastoma is constitutively elevated but blocked at the protein level by BCL2/MCL1 survival signals, then BH3-mimetic agents (venetoclax, navitoclax [32]) timed to the natural nadir of BCL2/MCL1 expression may have enhanced efficacy. Preliminary analysis on the PAR(2) Discovery Engine chronotherapy predictor, using BCL2L1 and MCL1 eigenvalue dynamics from the GSE221103 MYC-ON dataset, suggests a potential ZT19–1 window for minimum survival gene persistence; however, this prediction is exploratory, is based on a single cell line dataset, and requires independent experimental validation before clinical inference. No chronotherapy claim is made on the basis of this analysis.

The independent replication in U2OS osteosarcoma (Section 3.6) confirms that the MYC-ON p53 regulon elevation extends beyond the neuroblastoma context. The genome-wide constitutive lock-in (oscillatory fraction collapsing from 49.3% to 23.7%) and the asymmetric clock disruption — ARNTL/CLOCK constitutively elevated, NR1D1/NR1D2/PER1 suppressed — are consistent with the same MYC-driven temporal reprogramming mechanism proposed for neuroblastoma. The cross-study convergence (GSE221103: p = 0.0037; GSE221173: p = 0.021; MYC-OFF non-significant in both) across independent cell lineages and MYC isoforms substantially reduces the probability that the finding is a dataset-specific or cell-type artefact.

**Mechanistic convergence: post-transcriptional regulation.** An independent transcriptomic study provides complementary mechanistic support for the connection between clock disruption and p53 network dysfunction. Fuhr, Relógio et al. (2022) [40] catalogued alternative splicing (AS) events in HCT116 colorectal cancer cells when three core clock genes were individually knocked out (ARNTL/BMAL1, NR1D1/REV-ERBα, PER2). Members of the p53 regulon analysed here undergo differential splicing under all three perturbations: TNFRSF10B (TRAIL receptor 2, pro-apoptotic) *gains* splicing events under ARNTL-KO and *loses* them under PER2-KO; BAX (pro-apoptotic executioner) is differentially spliced under both NR1D1-KO and PER2-KO; and TP53 itself loses splicing events across all three knockouts, spanning eight cancer hallmark categories including "Resisting Cell Death," "Genome Instability and Mutation," and "Sustaining Proliferative Signaling." "Resisting Cell Death" accounts for 96, 143, and 115 AS events under ARNTL-, NR1D1-, and PER2-KO respectively — in each condition the largest or second-largest hallmark category affected. This convergence of distinct analytical approaches — AR(2) temporal persistence (present study) and genome-wide AS cataloguing [40] — on the same p53 network nodes under circadian disruption is consistent with a model in which clock loss alters p53 regulon function at multiple molecular levels simultaneously: both the *quantity* (transcriptional persistence measured here) and the *quality* (splice isoform repertoire) of pro-apoptotic gene output are reshaped when circadian architecture is disrupted in cancer cells. Alternative splicing of BAX can shift the ratio of pro-apoptotic full-length BAX to truncated anti-apoptotic splice variants; loss of TNFRSF10B splice events may similarly alter the TRAIL sensitivity threshold; and AS of TP53 itself can produce isoforms with altered transcriptional specificity for apoptotic versus cell-cycle-arrest targets [40].

### 4.4 Tissue specificity of the p53 regulon ordering: clock dependence and sampling resolution

The multi-tissue and genetic perturbation analyses (Sections 3.8–3.8.2) show that the pro-apoptotic < survival ordering is not a universal property of all tissues under circadian conditions; it is selective for specific tissue contexts, is modulated by BMAL1 clock function, and is sensitive to the timescale at which AR(2) is evaluated.

**Tissue selectivity.** At 2-hour resolution in the Zhang et al. mouse atlas (GSE54650, N=24), the ordering is confirmed only in liver. Of the four other tissues examined in detail (heart, lung, kidney, brainstem), all show reversed or indeterminate results. This selectivity is biologically coherent: liver is the peripheral tissue with the strongest and most clock-driven p53 apoptotic surveillance programme. It faces continuous low-grade xenobiotic DNA damage, BCL2L1/Bcl-xL is the dominant hepatocyte survival signal [31], and it is among the most rhythmically driven peripheral organs in the circadian atlas [28]. Terminally differentiated tissues (cardiomyocytes, skeletal myotubes) and tissues with weaker circadian amplitude (lung, kidney) do not show the same separation. The absence of the ordering in these tissues argues against a generic clock artefact explaining the blood and liver findings.

The human blood datasets — leukocytes and PBMCs — represent a distinct biological niche: immune cells are among the most apoptosis-dependent cell populations in the body, continuously culled by p53-mediated apoptosis, with BCL2-family dynamics that are among the most clinically studied in human oncology [30]. That the ordering is confirmed in human blood (the primary pre-specified dataset) and in mouse liver (two independent 2-hour-resolution datasets, gaps +0.094 and +0.116) — both contexts with active p53-mediated apoptotic surveillance — while being absent or reversed in other tissues provides biological triangulation consistent with the claim.

**BMAL1 clock dependence.** The BMAL1-knockout experiment (GSE70499, Section 3.8.1) provides the most direct mechanistic test available in this dataset. In clock-intact WT mouse liver, the pro-apoptotic < survival gap is +0.116 — within 2% of the Sufficient Sleep human blood gap (+0.114). In the BMAL1-KO liver, the ordering is directionally maintained but the gap narrows by 57% to +0.050. BMAL1 deletion does not eliminate the ordering: constitutive features of the BCL2-family transcriptional programme (e.g., NF-κB and MYC-driven BCL2/MCL1 expression independent of the clock) maintain survival > pro-apoptotic even in clock-disrupted tissue. What is lost under BMAL1 deletion is the *degree of separation* — the quantitative margin by which the survival branch exceeds the pro-apoptotic branch. This observation is consistent with a model in which the circadian clock amplifies an underlying transcriptional asymmetry between the two branches: the asymmetry exists without the clock, but the clock strengthens it.

Trp53 eigenvalue in the same experiment drops 70% (0.702 WT → 0.211 KO), consistent with p53 post-translational dynamics being altered by BMAL1 through SIRT1-mediated deacetylation [7]. This Trp53 change is an independent internal validation that the BMAL1 manipulation is biologically active in this dataset and is not a noise result.

The comparison with the human sleep disruption data (Sections 3.2–3.3) is suggestive. In sufficient sleep (human blood), the gap is +0.114 — matching the clock-intact mouse liver (+0.116). In sleep restriction and night shift work, the gap reverses or narrows substantially. Environmental circadian disruption in humans and genetic clock disruption in mice produce qualitatively similar reductions in the pro-apoptotic/survival gap, which is consistent with a common underlying mechanism: reduced clock-driven transcriptional separation between the two branches. This is a cross-species, cross-perturbation convergence, and it warrants independent experimental follow-up.

**Sampling resolution.** The GSE11923 analysis at 1-hour resolution (Section 3.8.2) shows that the liver ordering reverses at the 1-hour AR(2) timescale, driven by lower survival eigenvalues for BIRC5 and BCL2 at that resolution. This does not invalidate the 2-hour result: two independent datasets at 2-hour resolution (GSE54650, GSE70499) both confirm HOLDS in liver with gaps of +0.094 and +0.116. The resolution sensitivity instead reflects a genuine biological feature — the survival branch genes BIRC5/Survivin and BCL2 in mouse liver show stronger autocorrelation at the 2–4 hour timescale than at the 1–2 hour timescale, consistent with their regulated by slow-wave transcriptional programmes rather than hour-to-hour oscillations. The human blood datasets all operate at 2-hour or slower resolution and are not subject to this resolution ambiguity; but the finding is noted as a limitation on the generalisation of the mouse liver result to all resolution regimes.

### 4.5 Relationship to prior work in the PAR(2) framework

The findings here build on and extend three prior results from the PAR(2) framework:

**Paper A (core methods):** Showed that circadian clock genes occupy higher |λ| than their transcriptional targets in healthy tissue, and that this hierarchy is inverted in MYC-ON neuroblastoma. The p53 pathway was identified in Figure 4 of that paper as showing abnormal eigenvalue elevation in MYC-ON, consistent with a chronically activated damage response. The current paper operationalises this observation as a specific, testable claim about the functional ordering within the regulon rather than the pathway mean.

**Paper E (phase-gated PAR(2)):** Showed that cancer-relevant genes, including p53 network members, are gated by circadian phase — their transcriptional output is modulated by the phase of the master oscillator [39]. This is mechanistically compatible with the finding that sleep restriction, which desynchronises circadian phase across cell populations, disrupts the functional ordering of the p53 regulon.

**Paper M (PAR(2) Discovery Engine platform):** Provides the computational infrastructure for the full 38-dataset sweep, the expression-matched permutation engine, and the chronotherapy predictor used to derive timing recommendations. The platform is available at https://par2discovery.com.

### 4.6 Limitations

All datasets are observational time series; no experimental perturbation of the p53 network was performed, and causal relationships between temporal persistence and cell fate outcomes cannot be inferred from these data alone. The analysis is transcriptional throughout: post-translational regulation of BCL2-family proteins — which is extensive and includes BH3-only protein induction, phosphorylation, and caspase processing — is not captured [30]. Whether the transcriptional persistence ordering measured here translates into functional differences in apoptotic threshold requires direct experimental testing.

Sample sizes in the circadian blood datasets are modest (7–10 timepoints), and AR(2) coefficient estimation carries inherent uncertainty at this resolution. Monte Carlo simulations estimate mean bias of approximately ±0.15 per gene at N=7–8 [37, Supplementary Table S6]. The analysis addresses this by relying on group-level medians across 5–8 genes per branch rather than individual-gene point estimates, with within-group ranges and IQR reported in Supplementary Table S1. The cross-species validation at N=24 (Mouse Circadian Atlas, GSE54650, Section 3.8) provides a higher-precision anchor — predicted individual gene bias < ±0.05 at that resolution — confirming the ordering in mouse liver while brainstem is indeterminate and the remaining tissues show reversed results.

Both cell line datasets (GSE221103 neuroblastoma; GSE221173 osteosarcoma) are in vitro models. The cross-cell-type, cross-MYC-isoform replication (N-MYCN neuroblastoma p=0.0037; c-MYC osteosarcoma p=0.021; MYC-OFF non-significant in both) substantially reduces the probability that the MYC-ON finding is a dataset-specific artefact, but validation in primary human tumour tissue remains needed. The U2OS analysis pre-specified pro-apoptotic and cell-cycle-arrest targets (13 genes); the survival-arm genes (BCL2, MCL1, BIRC5, BCL2L1, XIAP) were not tested in GSE221173, so whether the survival co-elevation observed in neuroblastoma is also present in U2OS is unknown. Phase-scrambling controls are validated at the platform level across the full dataset panel (https://par2discovery.com/method-validation) but are planned as paper-specific additions at the revision stage rather than included here. Finally, the AR(2) eigenvalue measures gene-level transcriptional autocorrelation rather than the stability properties of the p53-BCL2 network as a dynamical system; whether the persistence ordering maps onto Floquet multipliers of a coupled ODE system is a theoretical extension beyond the present scope.

### 4.7 Future directions

The immediate extension of this work is to additional cancer types with known MYC or p53 pathway dysregulation — colorectal cancer (APC-driven, where circadian disruption has been previously characterised using AR(2) methods [37]), glioblastoma (Paper H, in preparation), and haematological malignancies.

The question of BMAL1/CLOCK dependence has now been partially addressed using the GSE70499 BMAL1-knockout mouse liver dataset (Section 3.8.1). The preliminary finding — that BMAL1 deletion narrows the pro-apoptotic/survival gap by ~57% without eliminating it — supports a model in which the clock amplifies a constitutive BCL2-family transcriptional asymmetry. Replication across independent BMAL1-KO datasets (particularly in a blood or immune context) and comparison with conditional clock gene knockouts targeting specific peripheral tissues would strengthen this conclusion. The 70% reduction in Trp53 eigenvalue under BMAL1 deletion is a secondary finding warranting dedicated investigation.

The sampling-rate sensitivity identified in Section 3.8.2 indicates that AR(2) |λ| is resolution-dependent for specific BCL2-family genes: BIRC5 and BCL2 show markedly lower eigenvalues at 1-hour lag than at 2-hour lag in mouse liver. Understanding whether this is a general property of genes with smooth slow-wave expression patterns, or a specific feature of constitutively driven survival gene transcription, is an important methodological question for the broader AR(2) framework. Analysis of the theoretical relationship between the AR(2) characteristic roots and sampling period (see Paper M) could formalise when cross-resolution eigenvalue comparisons are valid.

An independent replication of the human blood HOLDS ordering in a new healthy-baseline blood dataset with N ≥ 12 timepoints and all-below-unit-circle regulon eigenvalues remains a priority. The existing GSE113883 dataset proved unsuitable for this purpose (Section 3.9). Preliminary analysis on Arabidopsis datasets shows no equivalent pro-apoptotic/survival ordering in the plant circadian system, consistent with specificity to the mammalian CLOCK/BMAL1 architecture [38].

---

## 5. Conclusion

The results establish a temporal axis within the p53 transcriptional regulon: survival genes (BCL2, MCL1, BIRC5/Survivin, XIAP) show systematically higher AR(2) eigenvalue moduli than pro-apoptotic executioners (BBC3/PUMA, PMAIP1/NOXA, BAX, FAS) in healthy human blood with intact circadian architecture, and this ordering is disrupted by one week of sleep restriction and by real-world night shift work in two independent studies.

Cross-species confirmation is found in mouse liver at 2-hour circadian resolution — and in mouse liver specifically. Two independent datasets (GSE54650 gap +0.094; GSE70499-WT gap +0.116) reproduce the ordering with gap magnitudes matching the healthy human blood sufficient sleep gap (+0.114), while four other tissues in the same circadian atlas (heart, kidney, lung, brainstem) show reversed or indeterminate results. This tissue selectivity is coherent with the biology: liver and blood are the contexts in which p53-mediated apoptotic surveillance is most active and most clock-driven. The absence of the ordering in other tissues is not a contradiction but a biological discriminator — it argues against a generic AR(2) artefact explaining the findings.

BMAL1 genetic deletion narrows the mouse liver gap by 57% (WT +0.116 → KO +0.050) without reversing the ordering. The circadian clock amplifies a constitutive BCL2-family transcriptional asymmetry rather than creating it from scratch. The convergence of this 57% narrowing with the directional reversal seen under human sleep restriction and shift work — across species, across perturbation types — is consistent with a shared mechanism: reduced clock-driven transcriptional separation between the pro-apoptotic and survival branches.

In MYC-ON neuroblastoma, the entire p53 regulon acquires clock-gene-level temporal persistence above the genome background (regulon median |λ| = 0.680 vs genome 0.525; Mann-Whitney p = 0.0037), driven by constitutive co-elevation of both branches under oncogenic transcriptional reprogramming. Both branches remain elevated — the internal pro-ap < survival ordering is maintained — but the absolute persistence level reflects a chronically active, non-rhythmic damage-response state rather than the dynamically regulated, context-dependent programme seen in healthy tissue.

This finding is independently replicated in U2OS osteosarcoma (GSE221173; c-MYC-ER system; regulon mean |λ| = 0.725 vs genome 0.579; permutation p = 0.021; N=25, 2-hour resolution; 42.5% time-shuffle signal destruction). The cross-cell-type, cross-MYC-isoform convergence (GSE221103 N-MYCN neuroblastoma: p = 0.0037; GSE221173 c-MYC osteosarcoma: p = 0.021; MYC-OFF non-significant in both) substantially reduces the probability that the result is a dataset-specific artefact.

Together, these findings establish temporal persistence as a quantifiable dimension of the p53 network that is selectively maintained by intact circadian architecture in liver and blood, is graded by BMAL1 clock function, is disrupted by sleep loss, and is replaced by constitutive non-rhythmic persistence under MYC-driven oncogenesis — a conclusion now supported by convergent evidence across two independent cell lineages (neuroblastoma and osteosarcoma) and two MYC isoforms (N-MYCN and c-MYC).

---

## Supplementary Materials

**Supplementary Table S1** — Full per-gene AR(2) eigenvalue table across 10 datasets (6 blood conditions, 2 neuroblastoma conditions, 2 U2OS osteosarcoma conditions). Available in the download package: `paper-packages/paper-n-p53-regulon/TableS1_PerGene_Eigenvalues.csv`.

**Supplementary Table S-NB** — Clock–target hierarchy in GSE221103, per-condition, per-cell-line, per-gene. Available at `manuscripts/supplementary/paper_n_table_s_nb_clock_hierarchy.csv`.

**Supplementary Table S-U2OS** — Full AR(2) eigenvalue results for GSE221173 (U2OS c-MYC-ER osteosarcoma): per-gene data, genome-wide context, clock gene results, and all four robustness layers (time-shuffle destruction, rolling window stability, expression threshold sensitivity, Rep1 directional concordance). Available at `manuscripts/supplementary/paper_n_table_s_u2os.csv`. Live analysis: https://par2discovery.com/u2os-myc-ar2.

---

## Data Availability

All datasets are publicly available from NCBI GEO (accession numbers in Table 1). Pre-computed AR(2) eigenvalue results are available at the PAR(2) Discovery Engine (https://par2discovery.com; blood + neuroblastoma: https://par2discovery.com/p53-regulon; U2OS osteosarcoma: https://par2discovery.com/u2os-myc-ar2). A reproducibility archive including raw data, AR(2) fitting code, and statistical analysis scripts will be prepared at the revision stage.

---

## Author Contributions

M.W. conceived the study, performed all analyses, wrote all code, and wrote the manuscript.

## Competing Interests

The author declares no competing interests.

## Acknowledgements

The author thanks the groups that generated and deposited the datasets central to this study: Möller-Levet and Archer and colleagues (GSE39445, sleep restriction cohort); Cedernaes and colleagues (GSE122541, night shift work cohort); Altman and Bhatt and colleagues (GSE221103, neuroblastoma MYC system); Bhatt and Hong and colleagues (GSE221173, U2OS osteosarcoma c-MYC-ER system); and Hogenesch and colleagues (GSE54650, multi-tissue circadian atlas). All data are freely accessible through NCBI GEO. No funding was received for this study.

---

## References

[1] Levine AJ, Oren M. The first 30 years of p53: growing ever more complex. *Nat Rev Cancer*. 2009;9(10):749–58.

[2] Vousden KH, Prives C. Blinded by the light: the growing complexity of p53. *Cell*. 2009;137(3):413–31.

[3] Batchelor E, Mock CS, Bhan I, Loewer A, Lahav G. Recurrent initiation: a mechanism for triggering p53 pulses in response to DNA damage. *Mol Cell*. 2008;30(3):277–89.

[4] Purvis JE, Karhohs KW, Mock C, Batchelor E, Loewer A, Lahav G. p53 dynamics control cell fate. *Science*. 2012;336(6087):1440–4.

[5] Chipuk JE, Moldoveanu T, Llambi F, Parsons MJ, Green DR. The BCL-2 family reunion. *Mol Cell*. 2010;37(3):299–310.

[6] Vousden KH, Lane DP. p53 in health and disease. *Nat Rev Mol Cell Biol*. 2007;8(4):275–83.

[7] Nakahata Y, Sahar S, Astarita G, Kaluzova M, Sassone-Corsi P. Circadian control of the NAD+ salvage pathway by CLOCK-SIRT1. *Science*. 2009;324(5927):654–7.

[8] Gery S, Komatsu N, Baldjyan L, Yu A, Koo D, Koeffler HP. The circadian gene per1 plays an important role in cell growth and DNA damage control in human cancer cells. *Mol Cell*. 2006;22(3):375–82.

[9] Sancar A, Lindsey-Boltz LA, Kang TH, Reardon JT, Lee JH, Ozturk N. Circadian clock control of the cellular response to DNA damage. *FEBS Lett*. 2010;584(12):2618–25.

[10] Park J, Oh Y, Yoo L, Jung MS, Song WJ, Lee SH, Seo H, Chung KC. Dyrk1A phosphorylates p53 and inhibits proliferation of embryonic neuronal cells. *J Biol Chem*. 2010;285(41):31895–906. doi:10.1074/jbc.M110.147520

[11] Zou X, Liu J, Gotoh T, Brown AM, Jiang L, Wisdom EL, Kim JK, Finkielstein CV. Distinct control of PERIOD2 degradation and circadian rhythms by the oncoprotein and ubiquitin ligase MDM2. *Sci Signal*. 2018;11(559):eaau0715. doi:10.1126/scisignal.aau0715

[12] Atger F, Mauvoisin D, Weger B, Gobet C, Gachon F. Regulation of Mammalian Physiology by Interconnected Circadian and Feeding Rhythms. *Front Endocrinol*. 2017;8:42.

[13] Mure LS, Le HD, Benegiamo G, Chang MW, Rios L, Jillani N, et al. Diurnal transcriptome atlas of a primate across major neural and peripheral tissues. *Science*. 2018;359(6381):eaao0318.

[14] Lane DP. Cancer. p53, guardian of the genome. *Nature*. 1992;358(6381):15–6.

[15] Möller-Levet CS, Archer SN, Bucca G, Laing EE, Slak A, Kabiljo R, et al. Effects of insufficient sleep on circadian rhythmicity and expression amplitude of the human blood transcriptome. *Proc Natl Acad Sci*. 2013;110(12):E1132–41.

[16] Brodeur GM. Neuroblastoma: biological insights into a clinical enigma. *Nat Rev Cancer*. 2003;3(3):203–16.

[17] Altman BJ, Hsieh AL, Sengupta A, Krishnanaiah SY, Stine ZE, Walton ZE, Gouw AM, Venkataraman A, Li B, Goraksha-Hicks P, Diskin SJ, Bellovin DI, Simon MC, Rathmell JC, Lazar MA, Maris JM, Felsher DW, Hogenesch JB, Weljie AM, Dang CV. MYC disrupts the circadian clock and metabolism in cancer cells. *Cell Metab*. 2015;22(6):1009–19. doi:10.1016/j.cmet.2015.09.003. PMID: 26387865.

[18] Dang CV. MYC on the path to cancer. *Cell*. 2012;149(1):22–35.

[19] Morrish F, Neretti N, Sedivy JM, Bhatt D, Hockenbery DM. The oncogene c-Myc coordinates regulation of metabolic networks to enable rapid cell cycle entry. *Cell Cycle*. 2008;7(8):1054–66.

[20] Fischer M. Census and evaluation of p53 target genes. *Oncogene*. 2017;36(28):3943–56.

[21] Kenzelmann Broz D, Mello SS, Bieging KT, Jiang D, Dusek RL, Brady CA, et al. Global genomic profiling reveals an extensive p53-regulated autophagy program contributing to key p53 responses. *Genes Dev*. 2013;27(9):1016–31.

[22] Verfaillie A, Svetlichnyy D, Imrichova H, Davie K, Fiers M, Kalender Atak Z, et al. Multiplex enhancer-reporter assays uncover unsophisticated TP53 enhancer logic. *Genome Res*. 2016;26(7):882–95.

[23] Sigurdardottir LG, Valdimarsdottir UA, Fall K, Mucci LA, Rider JR, Schernhammer E, et al. Circadian disruption, sleep loss, and prostate cancer risk: a systematic review of epidemiologic studies. *Cancer Epidemiol Biomarkers Prev*. 2012;21(7):1002–11.

[24] Hakim F, Wang Y, Zhang SX, Zheng J, Yolcu ES, Carreras A, et al. Fragmented sleep accelerates tumor growth and progression through recruitment of tumor-associated macrophages and TLR4 signaling. *Cancer Res*. 2014;74(5):1329–37.

[25] Fortier EE, Rooney J, Dardente H, Hardy MP, Bhatt D, Challet E, et al. Circadian variation of the response of T cells to antigen. *J Immunol*. 2011;187(12):6291–300.

[26] Murga M, Campaner S, Lopez-Contreras AJ, Toledo LI, Soria R, Montaña MF, et al. Exploiting oncogene-induced replicative stress for the selective killing of Myc-driven tumors. *Nat Struct Mol Biol*. 2011;18(12):1331–5.

[27] Youle RJ, Strasser A. The BCL-2 protein family: opposing activities that mediate cell death. *Nat Rev Mol Cell Biol*. 2008;9(1):47–59. doi:10.1038/nrm2308

[28] Zhang R, Lahens NF, Ballance HI, Hughes ME, Hogenesch JB. A circadian gene expression atlas in mammals: implications for biology and medicine. *Proc Natl Acad Sci USA*. 2014;111(45):16219–24. doi:10.1073/pnas.1408886111

[29] Lightman SL, Conway-Campbell BL. The crucial role of pulsatile activity of the HPA axis for continuous dynamic equilibration. *Nat Rev Neurosci*. 2010;11(10):710–8. doi:10.1038/nrn2914

[30] Croce CM, Tait SWG, Garcia-Sáez AJ, Villunger A, Letai A, Walter HS, Dyer MJS, Green DR, Shi Y, Melino G. What does BCL-2 do? From new molecular insights to the clinical implications. *Cell Death Differ*. 2026;33:673–93. https://doi.org/10.1038/s41418-025-01607-3

[31] Takehara T, Tatsumi T, Suzuki T, Rucker EB III, Hennighausen L, Jinushi M, et al. Hepatocyte-specific disruption of Bcl-xL leads to continuous hepatocyte apoptosis and liver fibrotic responses. *Gastroenterology*. 2004;127(4):1189–97. doi:10.1053/j.gastro.2004.07.019

[32] Roberts AW, Davids MS, Pagel JM, Kahl BS, Puvvada SD, Gerecitano JF, et al. Targeting BCL2 with venetoclax in relapsed chronic lymphocytic leukemia. *N Engl J Med*. 2016;374(4):311–22. doi:10.1056/NEJMoa1513257

[33] Archer SN, Laing EE, Möller-Levet CS, van der Veen DR, Bucca G, Lazar AS, et al. Mistimed sleep disrupts circadian regulation of the human transcriptome. *Proc Natl Acad Sci USA*. 2014;111(6):E682–91. doi:10.1073/pnas.1316335111

[34] Resuehr HE, Wu G, Johnson RL, Young ME, Hogenesch JB, Gamble KL. Shift work disrupts circadian regulation of the transcriptome in hospital nurses. *J Biol Rhythms*. 2019;34(2):167–77. doi:10.1177/0748730419826694

[35] Straif K, Baan R, Grosse Y, Secretan B, El Ghissassi F, Bouvard V, Altieri A, Benbrahim-Tallaa L, Cogliano V; WHO International Agency for Research on Cancer Monograph Working Group. Carcinogenicity of shift-work, painting, and fire-fighting. *Lancet Oncol*. 2007;8(12):1065–6. doi:10.1016/S1470-2045(07)70373-X. PMID: 17897957.

[36] Melino G, De Laurenzi V, Vousden KH. p73: Friend or foe in tumorigenesis. *Nat Rev Cancer*. 2002;2(8):605–15. doi:10.1038/nrc861.

[37] Whiteside M. AR(2) Eigenvalue Modulus as a Measure of Temporal Persistence in Gene Expression: Circadian Hierarchy Emerges from Two Coefficients. *Research Square* [Preprint]. 2026. doi:10.21203/rs.3.rs-9283100/v1. In active submission: PLOS Computational Biology.

[38] Whiteside M. Fibonacci-like colonic crypt renewal dynamics exhibit 1/φ eigenvalue enrichment in AR(2) analysis. *Fibonacci Quarterly*. 2025. Manuscript under review; reply submitted November 2025.

[39] Whiteside M. A Phase-Gated Autoregressive Framework Reveals Tissue-Specific Circadian Gating of Cancer-Relevant Genes Across Mammalian Tissues. *Research Square* [Preprint]. 2026. doi:10.21203/rs.3.rs-9214347/v1. Revision in preparation; targeting Journal of Biological Rhythms / Chronobiology International.

[40] Fuhr L, Abreu M, Relogio A, et al. Transcriptome analysis of clock disrupted cancer cells reveals differential alternative splicing of cancer hallmarks genes. *npj Syst Biol Appl*. 2022;8:15. doi:10.1038/s41540-022-00225-w. PMID: 35552415. Data (HCT116 clock KO AS events): Supplementary Table MOESM4 (ARNTL-KO: 494 events; NR1D1-KO: 789 events; PER2-KO: 596 events).

---

## Supplementary Materials

### Supplementary Table S-NB. Clock–target hierarchy in GSE221103 — per-condition, per-cell-line, per-gene.

Full per-gene AR(2) eigenvalue results for all four conditions (SHEP MYC-ON/OFF, SKNAS MYC-ON/OFF) across all 20+ clock genes, plus group-level summary statistics. Available as:  
`manuscripts/supplementary/paper_n_table_s_nb_clock_hierarchy.csv`

### Supplementary Figure S-NB-1. Clock and target mean |λ| bar chart across four conditions.

Two-panel figure: left panel shows grouped bars for clock vs target mean |λ| per condition; right panel shows clock–target gap with arrows indicating the direction of MYC-ON effect in each cell line.  
`manuscripts/figures/generated/paper_n_figure_s_nb1.pdf`  
`manuscripts/figures/generated/paper_n_figure_s_nb1.png`

### Supplementary Figure S-NB-2. Per-gene clock |λ| scatter: MYC-OFF → MYC-ON.

Two-panel scatter (SHEP top, SKNAS bottom) showing individual clock gene |λ| in MYC-OFF (circles) and MYC-ON (triangles) conditions, with arrows indicating shift direction. Group means annotated.  
`manuscripts/figures/generated/paper_n_figure_s_nb2.pdf`  
`manuscripts/figures/generated/paper_n_figure_s_nb2.png`

### Supplementary Table S-U2OS. Full AR(2) eigenvalue results for GSE221173 (U2OS c-MYC-ER osteosarcoma).

Per-gene eigenvalue data for all 13 pre-specified p53 target genes (pro-apoptotic: BAX, BBC3, PMAIP1, FAS, BID, SESN1; cell-cycle arrest: CDKN1A, GADD45A, GADD45B, BTG2, SESN2, CDKN2A, MDM2) and 10 core clock genes (ARNTL, CLOCK, NPAS2, NR1D1, NR1D2, PER1, PER2, TIMELESS, RORA, BHLHE40) in both MYC-ON and MYC-OFF conditions (Rep2, N=25, 2-hour resolution). Includes genome-wide summary statistics and all four robustness layers: (1) time-shuffle destruction test — 42.5% signal loss (10,000 permutations); (2) rolling window stability across three 15-timepoint windows; (3) expression threshold sensitivity across TPM cutoffs 0.5–5; (4) Rep1 directional concordance (N=13, 4-hour spacing; 8/13 genes concordant, 62%).

Key numbers: MYC-ON regulon mean |λ| = 0.725, genome median = 0.579, permutation p = 0.021; MYC-OFF regulon mean = 0.386, genome median = 0.441, p = 0.925 (NS). Oscillatory fraction: MYC-OFF 49.3% → MYC-ON 23.7%. Clock asymmetry: ARNTL/CLOCK elevated (MYC-ON); NR1D1/NR1D2/PER1 suppressed (MYC-ON).

`manuscripts/supplementary/paper_n_table_s_u2os.csv`  
Live analysis: https://par2discovery.com/u2os-myc-ar2

---

*Manuscript prepared April 2026. Target journal: Cell Death & Differentiation (Springer Nature).*  
*Updated April 2026: GSE221103 expanded to 4-condition cell-line-specific analysis (SHEP/SKNAS × MYC-ON/OFF); new clock–target hierarchy table added to Section 3.4; Supplementary Table S-NB and Figures S-NB-1/2 added.*  
*Updated May 2026: Section 3.6 (GSE221173 U2OS osteosarcoma independent replication) added; Sections 3.7–3.9 renumbered from 3.6–3.8; Discussion 4.3 U2OS convergence paragraph added; Limitations updated (items 4–5 revised, new item 5 for U2OS survival gap, former Fifth–Sixth renumbered to Sixth–Seventh); Conclusion updated with U2OS replication and cross-lineage convergence statement; Supplementary Table S-U2OS added; Data Availability updated; keywords updated to add osteosarcoma and independent replication.*
*Updated May 2026 (v0.4): Discussion 4.3 extended with "Mechanistic convergence: post-transcriptional regulation" paragraph — alternative splicing data from Fuhr, Relógio et al. (2022) [40] added: BAX, TNFRSF10B, and TP53 differentially spliced under BMAL1/REV-ERBα/PER2 knockout in HCT116 colorectal cancer cells, with "Resisting Cell Death" the dominant affected hallmark. Reference [40] added.*  
*Word count (Introduction + Methods + Results + Discussion + Conclusion): approximately 6,200 words [excluding tables and references].*
