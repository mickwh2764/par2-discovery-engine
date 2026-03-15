import { Switch, Route, Redirect, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import FeedbackWidget from "@/components/FeedbackWidget";
import AppNavbar from "@/components/AppNavbar";
import GeneSearchPalette from "@/components/GeneSearchPalette";

import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "./lib/analytics";

const Landing = lazy(() => import("@/pages/landing"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const GettingStarted = lazy(() => import("@/pages/getting-started"));
const ManuscriptDownload = lazy(() => import("@/pages/manuscript-download"));
const CancerBrowser = lazy(() => import("@/pages/cancer-browser"));
const DiscoveryEngine = lazy(() => import("@/pages/discovery-engine"));
const ValidationSuite = lazy(() => import("@/pages/validation-suite"));
const ValidationSummary = lazy(() => import("@/pages/validation-summary"));
const ModelZoo = lazy(() => import("@/pages/model-zoo"));
const GenomeWide = lazy(() => import("@/pages/genome-wide"));
const SharedAnalysis = lazy(() => import("@/pages/shared-analysis"));
const RootSpace = lazy(() => import("@/pages/root-space"));
const About = lazy(() => import("@/pages/about"));
const HumanDisruption = lazy(() => import("@/pages/human-disruption"));
const CellTypePersistence = lazy(() => import("@/pages/cell-type-persistence"));
const Analytics = lazy(() => import("@/pages/analytics"));
const RobustnessSuite = lazy(() => import("@/pages/robustness-suite"));
const CrossContextValidation = lazy(() => import("@/pages/cross-context-validation"));
const GeneExplorer = lazy(() => import("@/pages/gene-explorer"));
const DiseaseScreen = lazy(() => import("@/pages/disease-screen"));
const HealthScore = lazy(() => import("@/pages/health-score"));
const VolatileGenes = lazy(() => import("@/pages/volatile-genes"));
const GeneSetTester = lazy(() => import("@/pages/gene-set-tester"));
const BeforeAfter = lazy(() => import("@/pages/before-after"));
const CryptVillus = lazy(() => import("@/pages/crypt-villus"));
const YeastValidation = lazy(() => import("@/pages/yeast-validation"));
const DrugDurability = lazy(() => import("@/pages/drug-durability"));
const BacterialPersistence = lazy(() => import("@/pages/bacterial-persistence"));
const ConvergenceMap = lazy(() => import("@/pages/convergence-map"));
const PersistenceLandscape = lazy(() => import("@/pages/persistence-landscape"));
const GeneProteinMap = lazy(() => import("@/pages/gene-protein-map"));
const ManuscriptValidation = lazy(() => import("@/pages/manuscript-validation"));
const FrameworkBenchmarks = lazy(() => import("@/pages/framework-benchmarks"));
const PhaseGating = lazy(() => import("@/pages/phase-gating"));
const PhasePortrait = lazy(() => import("@/pages/phase-portrait"));
const GenomeWideCoupling = lazy(() => import("@/pages/genome-wide-coupling"));
const LiteratureValidation = lazy(() => import("@/pages/literature-validation"));
const CrossMetricIndependence = lazy(() => import("@/pages/cross-metric-independence"));
const ProteomeValidation = lazy(() => import("@/pages/proteome-validation"));
const ReportLibrary = lazy(() => import("@/pages/report-library"));
const HalfLifeReplication = lazy(() => import("@/pages/halflife-replication"));
const DecompositionStability = lazy(() => import("@/pages/decomposition-stability"));
const StateSpaceComparison = lazy(() => import("@/pages/state-space-comparison"));
const CategoryTests = lazy(() => import("@/pages/category-tests"));
const RegulatoryDiscovery = lazy(() => import("@/pages/regulatory-discovery"));
const ABMDemo = lazy(() => import("@/pages/abm-demo"));
const OscillatorTaxonomy = lazy(() => import("@/pages/oscillator-taxonomy"));
const BomanSimulation = lazy(() => import("@/pages/boman-simulation"));
const MethodValidation = lazy(() => import("@/pages/method-validation"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

function usePageTracking() {
  const [location] = useLocation();
  useEffect(() => {
    trackPageView(location);
  }, [location]);
}

function Router() {
  usePageTracking();
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/about" component={About} />
        <Route path="/getting-started" component={GettingStarted} />
        <Route path="/manuscript" component={ManuscriptDownload} />
        <Route path="/cancer-browser" component={CancerBrowser} />
        <Route path="/discovery-engine" component={DiscoveryEngine} />
        <Route path="/validation-suite" component={ValidationSuite} />
        <Route path="/validation-summary" component={ValidationSummary} />
        <Route path="/model-zoo" component={ModelZoo} />
        <Route path="/genome-wide" component={GenomeWide} />
        <Route path="/root-space" component={RootSpace} />
        <Route path="/human-disruption" component={HumanDisruption} />
        <Route path="/cell-type-persistence" component={CellTypePersistence} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/robustness-suite" component={RobustnessSuite} />
        <Route path="/cross-context-validation" component={CrossContextValidation} />
        <Route path="/gene-explorer" component={GeneExplorer} />
        <Route path="/disease-screen" component={DiseaseScreen} />
        <Route path="/health-score" component={HealthScore} />
        <Route path="/volatile-genes" component={VolatileGenes} />
        <Route path="/gene-set-tester" component={GeneSetTester} />
        <Route path="/before-after" component={BeforeAfter} />
        <Route path="/crypt-villus" component={CryptVillus} />
        <Route path="/yeast-validation" component={YeastValidation} />
        <Route path="/drug-durability" component={DrugDurability} />
        <Route path="/bacterial-persistence" component={BacterialPersistence} />
        <Route path="/convergence-map" component={ConvergenceMap} />
        <Route path="/persistence-landscape" component={PersistenceLandscape} />
        <Route path="/gene-protein-map" component={GeneProteinMap} />
        <Route path="/manuscript-validation" component={ManuscriptValidation} />
        <Route path="/framework-benchmarks" component={FrameworkBenchmarks} />
        <Route path="/turing-deep-dive">{() => <Redirect to="/dashboard" />}</Route>
        <Route path="/phase-gating" component={PhaseGating} />
        <Route path="/phase-portrait" component={PhasePortrait} />
        <Route path="/genome-wide-coupling" component={GenomeWideCoupling} />
        <Route path="/literature-validation" component={LiteratureValidation} />
        <Route path="/cross-metric-independence" component={CrossMetricIndependence} />
        <Route path="/proteome-validation" component={ProteomeValidation} />
        <Route path="/reports" component={ReportLibrary} />
        <Route path="/halflife-replication" component={HalfLifeReplication} />
        <Route path="/decomposition-stability" component={DecompositionStability} />
        <Route path="/state-space-comparison" component={StateSpaceComparison} />
        <Route path="/category-tests" component={CategoryTests} />
        <Route path="/regulatory-discovery" component={RegulatoryDiscovery} />
        <Route path="/abm-minimal" component={ABMDemo} />
        <Route path="/oscillator-taxonomy" component={OscillatorTaxonomy} />
        <Route path="/boman-simulation" component={BomanSimulation} />
        <Route path="/method-validation" component={MethodValidation} />

        <Route path="/shared/:id" component={SharedAnalysis} />

        {/* Redirects for old/merged URLs */}
        <Route path="/species-comparison">{() => <Redirect to="/cross-context-validation" />}</Route>
        <Route path="/cross-tissue-three-layer">{() => <Redirect to="/cross-context-validation" />}</Route>
        <Route path="/stationarity-validation">{() => <Redirect to="/robustness-suite" />}</Route>
        <Route path="/rolling-window">{() => <Redirect to="/robustness-suite" />}</Route>
        <Route path="/eigenvalue-independence">{() => <Redirect to="/validation-suite" />}</Route>
        <Route path="/figure2">{() => <Redirect to="/dashboard" />}</Route>
        <Route path="/granger">{() => <Redirect to="/dashboard" />}</Route>
        <Route path="/gap-classifier">{() => <Redirect to="/dashboard" />}</Route>
        <Route path="/high-res-validation">{() => <Redirect to="/dashboard" />}</Route>
        <Route path="/crypt-buckling">{() => <Redirect to="/dashboard" />}</Route>
        <Route path="/skin-stress-tests">{() => <Redirect to="/genome-wide" />}</Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

const SUBMISSION_TIMESTAMP = "February 27, 2026 — 20:30 UTC";
const VERSION = "2.3.0";

function SubmissionFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/95 backdrop-blur-xl mt-auto" data-testid="submission-footer">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Locked</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Michael Whiteside · <a href="https://orcid.org/0009-0000-0643-5791" target="_blank" rel="noopener noreferrer" className="underline text-foreground/70 hover:text-foreground font-mono">ORCID</a>
            </span>
            <span className="text-[11px] text-muted-foreground">·</span>
            <a href="https://x.com/Michael94211007" target="_blank" rel="noopener noreferrer" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors" aria-label="X (Twitter)">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current inline-block" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <span className="text-[11px] text-muted-foreground">·</span>
            <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" className="text-[11px] underline text-muted-foreground hover:text-foreground">
              CC BY-NC 4.0
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/analytics" className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors" data-testid="link-admin-analytics">
              Admin
            </Link>
            <span className="text-[11px] text-muted-foreground font-mono" data-testid="text-submission-timestamp">
              v{VERSION} · {SUBMISSION_TIMESTAMP}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <AppNavbar />
            <div className="flex-1">
              <Router />
            </div>
            <SubmissionFooter />
            <GeneSearchPalette />
            <FeedbackWidget />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
