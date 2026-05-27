# Paper G: A Time-Domain Analogue to Fibonacci Structure via Phase-Gated AR(2) Dynamics

**Full title:** A Time-Domain Analogue to Fibonacci Structure via Phase-Gated AR(2) Dynamics: Reply to Boman on Tissue Fibonacci Patterns and Colonic Crypt Renewal

## Journal: The Fibonacci Quarterly (Reply Article)

## Version History
- **Original submission:** November 16, 2025 (canonical version — under review, DO NOT alter)
- **Platform version:** March–April 2026 (anticipated revision, incorporating post-submission corrections)
- **Key corrections in platform version:**
  1. Nguyen 2025 citation added
  2. BMAL1-KO prediction corrected — hierarchy collapses (not preserved)
  3. Tuft cell readout qualified as "delayed and accumulative"
  4. Bidirectional tuft CRC pattern incorporated
  5. φ-enrichment reporting clarified (see p-value note below)
  6. M-cell terminology clarified
  7. Floquet monodromy analysis completed and incorporated (April 2026)
  8. Boman p-number extension added — p-number families mapped to PAR(2) stable band (April 2026)

The LaTeX source in this package is the **anticipated post-review revision** based on the corrections above. The version submitted to The Fibonacci Quarterly (November 2025) is the canonical record and remains with the journal.

## Important Note on p-Values (Three Separate Tests)

Three different permutation tests have been reported in different contexts — these are **not** inconsistent, they test different gene sets:

| Test | Gene set | Result | Source |
|---|---|---|---|
| Genome-wide φ-zone enrichment | ~12,000–21,000 genes | p = 0.154, not significant | Main manuscript abstract |
| 212-gene circadian atlas permutation | 212 annotated clock/target genes | p = 1.0, not significant | Submitted reply manuscript (Fibonacci_Reply_Revised.md) |
| 14-gene E-box target set (expression-matched, 5,000 permutations) | 14 direct BMAL1/CLOCK E-box targets | p = 0.041 (mouse multi-tissue), p = 0.029 (human enteroid) | Platform cross-validation; supplementary Table (tissue-specificity section) |

The signal is specific to the **functional core clock gene set** (14 genes), not the genome-wide distribution. A reviewer who sees all three numbers will ask why: the honest answer is that the 14-gene set is pre-specified direct E-box targets in the tissue directly relevant to Boman's model (gut/intestinal), and the genome-wide/atlas tests use heterogeneous gene sets with diluted signal. The algebraic twinning (Proposition 1, Theorem 1) holds regardless of where the empirical data lands.

## Package Contents

### Manuscript
- `Paper_G_Fibonacci_Reply.tex` — LaTeX source (anticipated April 2026 revision)
- `Paper_G_Fibonacci_Reply.pdf` — Compiled PDF of main manuscript
- `cover_letter.tex` — Cover letter for Fibonacci Quarterly (as submitted November 2025)

### Supplementary Material
- `supplementary_extended_twinning.tex` — LaTeX source: five additional twinning arguments (April 2026; includes Floquet computed results + p-number extension)
- `supplementary_extended_twinning.pdf` — Compiled PDF of supplementary note

### Supplementary Data (CSV)
- `Supplementary_Table_S1_Crypt_Gene_Eigenvalues.csv` — Per-gene eigenvalue data across tissues, with PAR(2) layer assignments and Nguyen classifications
- `Supplementary_Table_S2_Platform_Validation.csv` — Claim-by-claim cross-validation status (13 claims, 22 datasets, 5 species)
- `Supplementary_Table_S3_BMAL1_Coupling_Crypt.csv` — BMAL1 coupling results for crypt-relevant genes across 12 tissues
- `Supplementary_Table_S4_Organoid_Perturbation.csv` — GSE157357 four-genotype perturbation results (WT, APC-KO, BMAL1-KO, double)
- `Supplementary_Table_S5_Nguyen_Integration.csv` — Cell-type-by-cell-type integration of Nguyen 2025 review with PAR(2) framework

### Supporting Data (JSON)
- `fibonacci_reply_validation.json` — Complete platform cross-validation results, amendment log, Nguyen 2025 integration details
- `crypt_gene_eigenvalues.json` — Structured eigenvalue data for crypt genes, organoid perturbation, tuft cell analysis, kernel architecture evidence

## Formal Mathematical Content

### Main Paper (Paper_G_Fibonacci_Reply.tex)
- **Definition 1** — AR(2) companion matrix and stationarity triangle
- **Remark** — Cyclostationarity caveat for circadian data
- **Proposition 1** — Companion matrix identity: Boman's M = C(1,1) (algebraic certainty; proved)
- **Remark** — Clarifies what is exact vs empirical
- **Theorem 1** — Non-stationarity of the Fibonacci point: (1,1) ∉ S, |λ| = φ > 1 (proved)
- **Corollary 1** — Fibonacci dynamics as biological boundary landmark
- **Proposition 2** — Equal-coefficient boundary and factor-of-two gap (proved)
- **Remark** — DCLK1 near-critical persistence explained

### Supplementary Note (supplementary_extended_twinning.tex) — Five Additional Arguments
- **Proposition S1** — Conservation identity (φ × 1/φ = 1; φ − 1 = 1/φ) (proved)
- **Theorem S1** — Hurwitz 1891: φ is the most irrational number
- **Corollary S1** — Non-resonance of φ-based oscillators
- **Proposition S2** — Integrated memory sum = φ² (proved)
- **Corollary S2** — φ² = φ + 1 closes the hierarchy
- **Table S-Replication** — 1/φ enrichment across 5 datasets (tissue-specificity of empirical signal)
- **Floquet monodromy results** — 251/252 globally stable; 98/252 (38.9%) transiently approach Fibonacci boundary; mean ρ(M) = 0.441
- **Proposition S3** — PAR(2) stable band brackets Boman's p-number families p=0/1,2 (proved; April 2026)
- **Table S-pNumber** — Boman Table 6 q values vs PAR(2) stable band [0.52, 0.72]

## Key Findings

### Confirmed by Platform
- AR(2) as minimum sufficient model (70–80% AIC preference)
- Clock > target eigenvalue hierarchy (22 datasets, 5 species)
- BMAL1 as circadian phase source (85 coupling events, ~180× enrichment)
- WNT/AXIN2 as slow kernel α₂ (APC-KO inverts eigenvalue hierarchy)

### Corrected Post-Submission
- BMAL1-KO: hierarchy collapses (originally stated "eigenvalues preserved" — incorrect)
- Tuft readout: delayed and accumulative; DCLK1 |λ| ≈ 1.0 (near-critical, consistent with ≥28-day tuft lifespan)
- Tuft CRC pattern: bidirectional (reduced in primary tumours; dramatically upregulated post-FOLFIRI)
- φ-enrichment: genome-wide p = 0.154, not significant; focused 14-gene set p = 0.041 (mouse multi-tissue), p = 0.029 (human enteroid)

### New Since Submission (April 2026)
- Floquet monodromy analysis completed: 251/252 globally stable; transient Fibonacci proximity confirmed in 38.9% of gene–tissue cases
- Boman p-number extension: PAR(2) stable band [0.52, 0.72] brackets exactly p=0/1 (q=0.618) and p=2 (q=0.682); p≥3 exceeds the band

### Untested Predictions (Require Future Data)
- AXIN2-KO → AR(1) collapse (no suitable dataset available)
- Chronotherapy prediction (no trial data)

## Platform Demonstration
- **Discovery Engine** (`/`) — Upload and AR(2) analysis of gene expression data
- **Phase Portrait Explorer** (`/phase-portrait`) — BMAL1 coupling across 12 tissues
- **Root-Space Geometry** (`/root-space`) — AR(2) stability triangle, φ-zone, gene clustering
- **Before/After Trajectories** (`/before-after`) — Cancer initiation (WT vs APC-KO) comparison
- **Cross-Context Validation** (`/cross-context-validation`) — Multi-species hierarchy preservation
- **Boman ODE Validation** (`/boman-ode`) — Sampling-rate sensitivity and AR(2) integrity self-test
- **Paper G Overview** (`/paper-g-overview`) — Explicit reply framing with p-number extension
- **Boman PAR(2) Mapping** (`/boman-par2-mapping`) — Spatial-temporal twinning detail

## Data Sources
- GSE157357 (intestinal organoids: WT, APC-KO, BMAL1-KO, double mutant)
- GSE54650 (12 mouse tissues, Hughes circadian atlas)
- GSE11923 (mouse liver high-resolution)
- GSE48113 (human blood)
- GSE98965 (baboon multi-tissue)
- GSE161566 (human intestinal enteroid — independent replication)
- Cross-validation across 22 datasets total

## Relationship to Other Papers
- **Paper A** (Core Methods): Provides the 22-dataset, 5-species cross-validation base
- **Paper C** (Coupling Atlas): BMAL1 coupling data across 12 tissues
- **Paper E** (PLOS ONE): Phase-gated architecture, organoid perturbation data
- **Paper F** (Genome Biology target): Independence from mRNA half-life

## Author
Michael Whiteside, Independent Researcher, United Kingdom
ORCID: 0009-0000-0643-5791
mickwh@msn.com
