import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import FeedbackWidget from "@/components/FeedbackWidget";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import GettingStarted from "@/pages/getting-started";
import ManuscriptDownload from "@/pages/manuscript-download";
import CancerBrowser from "@/pages/cancer-browser";
import DiscoveryEngine from "@/pages/discovery-engine";
import ValidationSuite from "@/pages/validation-suite";
import ModelZoo from "@/pages/model-zoo";
import GenomeWide from "@/pages/genome-wide";
import SharedAnalysis from "@/pages/shared-analysis";
import RootSpace from "@/pages/root-space";
import About from "@/pages/about";
import HumanDisruption from "@/pages/human-disruption";
import CellTypePersistence from "@/pages/cell-type-persistence";
import Analytics from "@/pages/analytics";
import RobustnessSuite from "@/pages/robustness-suite";
import CrossContextValidation from "@/pages/cross-context-validation";
import GeneExplorer from "@/pages/gene-explorer";
import DiseaseScreen from "@/pages/disease-screen";
import HealthScore from "@/pages/health-score";
import VolatileGenes from "@/pages/volatile-genes";
import GeneSetTester from "@/pages/gene-set-tester";
import BeforeAfter from "@/pages/before-after";
import CryptVillus from "@/pages/crypt-villus";
import YeastValidation from "@/pages/yeast-validation";
import DrugDurability from "@/pages/drug-durability";
import BacterialPersistence from "@/pages/bacterial-persistence";
import ConvergenceMap from "@/pages/convergence-map";
import PersistenceLandscape from "@/pages/persistence-landscape";
import GeneProteinMap from "@/pages/gene-protein-map";
import ManuscriptValidation from "@/pages/manuscript-validation";
import FrameworkBenchmarks from "@/pages/framework-benchmarks";
import TuringDeepDive from "@/pages/turing-deep-dive";
import PhaseGating from "@/pages/phase-gating";
import PhasePortrait from "@/pages/phase-portrait";
import GenomeWideCoupling from "@/pages/genome-wide-coupling";
import LiteratureValidation from "@/pages/literature-validation";

import AppNavbar from "@/components/AppNavbar";
import GeneSearchPalette from "@/components/GeneSearchPalette";

import CrossMetricIndependence from "@/pages/cross-metric-independence";
import ProteomeValidation from "@/pages/proteome-validation";

import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "./lib/analytics";

function usePageTracking() {
  const [location] = useLocation();
  useEffect(() => {
    trackPageView(location);
  }, [location]);
}

function Router() {
  usePageTracking();
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/about" component={About} />
      <Route path="/getting-started" component={GettingStarted} />
      <Route path="/manuscript" component={ManuscriptDownload} />
      <Route path="/cancer-browser" component={CancerBrowser} />
      <Route path="/discovery-engine" component={DiscoveryEngine} />
      <Route path="/validation-suite" component={ValidationSuite} />
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
      <Route path="/turing-deep-dive" component={TuringDeepDive} />
      <Route path="/phase-gating" component={PhaseGating} />
      <Route path="/phase-portrait" component={PhasePortrait} />
      <Route path="/genome-wide-coupling" component={GenomeWideCoupling} />
      <Route path="/literature-validation" component={LiteratureValidation} />
      <Route path="/cross-metric-independence" component={CrossMetricIndependence} />
      <Route path="/proteome-validation" component={ProteomeValidation} />

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
  );
}

const SUBMISSION_TIMESTAMP = "February 20, 2026 — 23:59 UTC";
const VERSION = "2.2.0";

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
            <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" className="text-[11px] underline text-muted-foreground hover:text-foreground">
              CC BY-NC 4.0
            </a>
          </div>
          <div className="text-[11px] text-muted-foreground font-mono" data-testid="text-submission-timestamp">
            v{VERSION} · {SUBMISSION_TIMESTAMP}
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
