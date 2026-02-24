# PAR(2) Discovery Engine - Circadian Clock-Target Dynamics Dashboard

## Overview
The PAR(2) Discovery Engine is a statistical platform for analyzing gene expression time series data using AR(2) autoregressive modeling. Its main goal is to quantify temporal persistence in gene expression, specifically for circadian clock and target genes, using the eigenvalue modulus |λ|.

The project aims to discover and validate patterns in gene expression dynamics related to circadian rhythms, aging, and diseases like cancer. It analyzes differential gene persistence across various tissues and conditions. The engine facilitates the discovery of distinct biological trajectories, demonstrating how AR(2) modeling can reveal multi-generational cellular memory, and provides a robust analytical framework for understanding complex biological time-series data and identifying potential therapeutic targets.

## User Preferences
Preferred communication style: Simple, everyday language. Full transparency on data sources.

## System Architecture

### UI/UX Decisions
The frontend is a React/TypeScript Single Page Application (SPA) using Vite, Wouter for routing, Tailwind CSS for styling, and Recharts for data visualization. TanStack Query manages data fetching and state.

### Technical Implementations
The core algorithm uses AR(2) regression to fit models to gene expression time series and calculate the eigenvalue modulus `|λ|`. The backend is a Node.js/Express application utilizing Drizzle ORM for database interactions. Robust error handling is implemented for database operations and uncaught exceptions.

### Feature Specifications
-   **AR(2) Analysis**: Fits AR(2) models to gene expression time series and calculates eigenvalue moduli.
-   **Data Validation**: Integrates with NCBI GEO datasets.
-   **Discovery Engine**: Allows upload and analysis of CSV data from wearable devices for real-time AR(2) eigenvalue analysis.
-   **ODE Model Zoo**: Validates AR(2) eigenvalue predictions against five canonical ODE models from biology.
-   **Edge Case Diagnostics Framework**: Provides reliability screening for AR(2) results (trends, sample size, model order, nonlinearity, boundary proximity, ADF stationarity).
-   **Processed Per-Gene Eigenvalue Tables**: Offers downloadable CSV tables with per-gene AR(2) eigenvalue results.
-   **Multi-Species Validation Panel**: Confirms cross-species hierarchy preservation.
-   **Human Circadian Disruption Validation**: Analyzes human disruption datasets for clock > target hierarchy preservation.
-   **Genome-Wide AR(2) Validation**: Runs AR(2) on all genes in a dataset to demonstrate genome-wide hierarchy emergence.
-   **Rolling Window Stability Analysis**: Tests the stability of AR(2) eigenvalue signatures across sub-windows.
-   **Shareable Analysis Links**: Allows users to share Discovery Engine analysis results.
-   **Eigenvalue Independence & Downstream Prediction**: Analyzes independence of |λ| from other metrics and its predictive power.
-   **Cell-Type Persistence Map**: Conducts AR(2) eigenvalue analysis across cell-type markers.
-   **Cross-Context Validation**: Combines species comparison and cross-tissue analysis, including permutation tests and bootstrap CIs.
-   **Root-Space Geometry & φ-Enrichment Analysis**: Maps AR(2) coefficients to root space, visualizes stationarity, and performs enrichment tests with multiple interpretive overlays (Waddington landscape, phase portrait, functional geography, PCA comparison). Includes dynamic void annotation and genome-wide functional enrichment validation for GO Biological Process, KEGG pathways, and dynamical prediction types.
-   **Framework Benchmarks**: Comprehensive accuracy, model fit, FDR controls, and reliability report comparing PAR(2) against standard time-series methods (ARIMA, OU, State-Space) with simulation benchmarks, Ljung-Box residual diagnostics, model order selection, and external validation (Turing, Fisher, STRING, Ueda).
-   **Robustness Suite**: Framework for robustness testing, including sub-sampling recovery, bootstrap CIs, stationarity defenses, permutation tests, and population-level CV stability.
-   **Drug Target Overlay**: Maps FDA-approved and investigational drug targets onto root-space positions for chronotherapy identification.
-   **Usage Analytics Dashboard**: Private admin dashboard for tracking page views and analysis runs.
-   **AR(1) vs AR(2) vs AR(3) Model Comparison**: AIC/BIC information criteria across datasets to confirm AR(2) preference.
-   **Expression-Matched Null Control**: Tests drug target root-space enrichment against expression-level-matched random controls.
-   **Fibonacci Enrichment Analysis**: Tests enrichment of gene categories near golden-ratio root-space positions.
-   **Circadian Health Score**: 0-100 scoring with A-F grades across datasets.
-   **Most Volatile Genes**: Cross-dataset eigenvalue variance ranking with sparklines.
-   **Gene Set Hypothesis Tester**: Permutation testing for custom gene lists (5000 permutations, Cohen's d).
-   **Before/After Trajectory Comparison**: Two-CSV upload comparing AR(2) shifts with root-space trajectory map.
-   **Convergence Map**: Four interactive 3D visualizations mapping independent research convergence: (1) Boman Lab literature connections, (2) Five Biological Rules → PAR(2) translations with speculative flagging for indirect mappings, (3) Takahashi/Hogenesch Circadian Canon → PAR(2) convergence (6 convergence points with confidence scoring and scientific caveats), (4) Waddington Epigenetic Landscape → Root-Space Geometry (5 convergence points mapping valleys/attractors to clusters, ridges to voids, bifurcations to eigenvalue shifts).
-   **Export Report**: Reusable HTML report generator.
-   **Genome-Wide Coupling Scan**: Tests all ~21,000 genes for statistical clock coupling using AR(2)+exogenous models with BH-FDR correction and hypergeometric pathway enrichment.
-   **Literature Validation & Falsification**: Cross-references blind PAR(2) discoveries against 59 curated literature-validated circadian genes (Panda, Takahashi, Sancar et al.). Includes decisive falsification test comparing Arntl predictor (8.4% significant) against housekeeping/random gene controls (0.0-0.3% significant, 180x enrichment).
-   **Cross-Metric Independence**: Compares AR(2) eigenvalue |λ| against curated reference values for STRING network centrality, cosinor amplitude, ENCODE/Roadmap chromatin state, and functional category annotations. Includes Spearman correlations, partial correlations, cross-tissue conservation analysis, functional overlap identification, multi-gene selection with highlighting across all plots, and Root-Space Mapping tab plotting genes in AR(2) coefficient space (φ₁, φ₂) with switchable color overlays for gene type, network degree, amplitude, and chromatin state. Root-space correspondence correlations confirm partial independence (radius vs network: ρ = -0.29; radius vs amplitude: ρ = 0.69; angle vs all metrics: ρ ≈ 0).
-   **Multi-Tissue Phase Portrait Explorer**: Interactive animated 24-hour cycle visualization with BMAL1 coupling analysis across 12 GSE54650 mouse tissues (Adrenal, Aorta, Brainstem, Brown Fat, Cerebellum, Heart, Hypothalamus, Kidney, Liver, Lung, Muscle, White Fat). Tests AR(2)+BMAL1 exogenous predictor model comparison for 53 genes per tissue (636 total tests). Key results: 85 significant coupling events across 33 genes, 25 distinct findings (7 independently confirmed, 8 strongly supported, 10 novel predictions). Wee1 coupled in 10/12 tissues, Nampt in 8/12.

### System Design Choices
The system prioritizes robust statistical analysis and transparent handling of biological data, aiming to provide a flexible platform for hypothesis generation and validation in circadian biology. Emphasis is placed on using validated parameters and ensuring data integrity and scientific rigor.

## External Dependencies

-   **PostgreSQL**: Primary data store, deployed via Neon Serverless.
-   **NCBI GEO**: Source for public gene expression datasets.
-   **React**: Frontend JavaScript library.
-   **TypeScript**: Superset of JavaScript.
-   **Vite**: Frontend build tool.
-   **Wouter**: Routing library for React.
-   **TanStack Query**: Data-fetching library for React.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Recharts**: Charting library for React.
-   **Node.js**: Backend server runtime.
-   **Express**: Web framework for Node.js.
-   **Drizzle ORM**: TypeScript ORM.