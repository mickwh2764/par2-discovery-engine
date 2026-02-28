# PAR(2) Discovery Engine - Circadian Clock-Target Dynamics Dashboard

## Overview
The PAR(2) Discovery Engine is a statistical platform that uses AR(2) autoregressive modeling to analyze gene expression time series data, quantifying temporal persistence for circadian clock and target genes via the eigenvalue modulus `|λ|`. Its primary goal is to discover and validate patterns in gene expression dynamics related to circadian rhythms, aging, and diseases like cancer, enabling the identification of distinct biological trajectories and potential therapeutic targets. The project provides a robust analytical framework for understanding complex biological time-series data.

## User Preferences
Preferred communication style: Simple, everyday language. Full transparency on data sources.

## System Architecture

### UI/UX Decisions
The frontend is a React/TypeScript Single Page Application (SPA) built with Vite, utilizing Wouter for routing, Tailwind CSS for styling, and Recharts for data visualization. TanStack Query is used for data fetching and state management.

### Technical Implementations
The core algorithm performs AR(2) regression to fit models to gene expression time series and calculate `|λ|`. The backend is a Node.js/Express application, using Drizzle ORM for database interactions and robust error handling.

### Feature Specifications
-   **AR(2) Analysis**: Fits AR(2) models and calculates eigenvalue moduli.
-   **Data Validation**: Integrates with NCBI GEO datasets and includes a Data Domain Classifier for uploaded CSVs.
-   **Discovery Engine**: Allows upload and real-time analysis of CSV data, including half-life metrics and unit circle plots.
-   **ODE Model Zoo**: Validates AR(2) predictions against canonical ODE models.
-   **Edge Case Diagnostics Framework**: Provides reliability screening for AR(2) results.
-   **Processed Per-Gene Eigenvalue Tables**: Offers downloadable CSV tables of AR(2) eigenvalue results.
-   **Validation & Benchmarking**: Includes multi-species validation, human circadian disruption validation, genome-wide AR(2) validation, rolling window stability analysis, and comprehensive framework benchmarks against standard time-series methods.
-   **Shareable Analysis Links**: Enables sharing of Discovery Engine analysis results.
-   **Advanced Analysis**: Features Eigenvalue Independence & Downstream Prediction, Cell-Type Persistence Maps, Cross-Context Validation, Root-Space Geometry & φ-Enrichment Analysis (with multiple interpretive overlays), Decomposition Stability Analysis, and Drug Target Overlay for chronotherapy.
-   **Bias Auditing**: Three automated bias tests (Time-Shuffle Destruction, Irrelevant Metric Correlation, Expression-Matched Null Hierarchy) run on every gene matrix analysis.
-   **Specialized Enrichment & Scoring**: Includes Expression-Matched Null Control, Fibonacci Enrichment Analysis, and a Circadian Health Score.
-   **Comparative & Longitudinal Analysis**: Offers Gene Set Hypothesis Tester, Before/After Trajectory Comparison with pre-loaded comparison pairs, and Most Volatile Genes ranking.
-   **Literature & Convergence Mapping**: Features Multi-Dataset Literature Validation, Literature Validation & Falsification, and an interactive Convergence Map visualizing independent research connections.
-   **Reporting**: Provides an Export Report function and a Cross-Page Report Pipeline for saving and loading analysis results.
-   **Genome-Wide Coupling Scan**: Identifies statistical clock coupling for ~21,000 genes using AR(2)+exogenous models.
-   **Cross-Metric Independence**: Compares `|λ|` against various biological metrics (e.g., STRING network centrality, cosinor amplitude, chromatin state) with detailed correlation and functional overlap analysis.
-   **Non-Circadian Validation**: Tests AR(2) persistence hierarchy using non-circadian datasets (e.g., immune response).
-   **Multi-Tissue Phase Portrait Explorer**: Interactive 24-hour cycle visualization with BMAL1 coupling analysis across multiple tissues.
-   **Gene Annotation Tooltips**: Provides detailed information on gene function and classification upon hover.
-   **Half-Life Independence Replication**: Rigorously tests `|λ|`'s independence from mRNA half-life across multiple non-circadian datasets.
-   **DRMref Multi-Drug Cross-Validation**: Cross-references DRMref scRNA-seq resistance/sensitivity gene lists (19 drugs, 12 cancer types) against GSE11923 AR(2) eigenvalues with per-drug permutation tests, cancer type summary, and meta-analysis. Server module: `server/drmref-validation.ts`. Data: `datasets/drmref_resistance_genes.json`.

### System Design Choices
The system prioritizes robust statistical analysis and transparent handling of biological data, focusing on hypothesis generation and validation in circadian biology. It emphasizes validated parameters, data integrity, and scientific rigor.

## External Dependencies

-   **PostgreSQL**: Primary data store.
-   **NCBI GEO**: Source for public gene expression datasets.
-   **React**: Frontend library.
-   **TypeScript**: Programming language.
-   **Vite**: Frontend build tool.
-   **Wouter**: React routing library.
-   **TanStack Query**: Data fetching library.
-   **Tailwind CSS**: CSS framework.
-   **Recharts**: Charting library.
-   **Node.js**: Backend runtime.
-   **Express**: Backend web framework.
-   **Drizzle ORM**: TypeScript ORM.