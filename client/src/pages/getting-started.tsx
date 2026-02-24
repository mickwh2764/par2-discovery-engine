import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  BookOpen, 
  Upload, 
  BarChart3, 
  Download, 
  Beaker,
  Code,
  FileJson,
  Zap,
  Target,
  Activity,
  ArrowRight,
  CheckCircle,
  Clock,
  Database,
  Shield
} from "lucide-react";
import HowTo from "@/components/HowTo";
import { GlossaryPanel } from "@/components/Glossary";

const TOUR_STEPS = [
  { step: 1, title: "Start at the Home Page", description: "Browse 38 pre-loaded datasets from mouse, human, baboon, and plant tissues. Pick one to see a quick overview.", route: "/", icon: BarChart3, color: "emerald" },
  { step: 2, title: "Run Your First Analysis", description: "Select a dataset and click 'Run Analysis'. The platform calculates persistence scores for all gene pairs — results appear in seconds.", route: "/", icon: Zap, color: "cyan" },
  { step: 3, title: "Explore the Dynamics Map", description: "See where genes land on a 2D map based on their behaviour. Each gene gets a unique position that reveals whether it oscillates, decays, or persists.", route: "/root-space", icon: Activity, color: "purple" },
  { step: 4, title: "Check the Evidence", description: "Review validation across multiple species, model comparisons, and independence checks. This confirms the persistence scores capture something real and unique.", route: "/validation-suite", icon: CheckCircle, color: "amber" },
  { step: 5, title: "Screen for Disease Effects", description: "Compare healthy vs disease patterns across 10 matched pairs. See which genes shift the most and whether the normal clock hierarchy breaks down.", route: "/disease-screen", icon: Target, color: "red" },
  { step: 6, title: "Test Robustness", description: "Run reliability checks: re-sample the data, shuffle labels, and test stability to make sure findings hold up and aren't just noise.", route: "/robustness-suite", icon: Shield, color: "blue" },
  { step: 7, title: "Upload Your Own Data", description: "Drop in your own CSV — gene expression, wearable device data, or any time series. Get persistence scores with quality checks and diagnostics.", route: "/discovery-engine", icon: Upload, color: "emerald" },
];

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  emerald: { border: "border-emerald-500", bg: "bg-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-500/30" },
  cyan: { border: "border-cyan-500", bg: "bg-cyan-500/20", text: "text-cyan-400", ring: "ring-cyan-500/30" },
  purple: { border: "border-purple-500", bg: "bg-purple-500/20", text: "text-purple-400", ring: "ring-purple-500/30" },
  amber: { border: "border-amber-500", bg: "bg-amber-500/20", text: "text-amber-400", ring: "ring-amber-500/30" },
  red: { border: "border-red-500", bg: "bg-red-500/20", text: "text-red-400", ring: "ring-red-500/30" },
  blue: { border: "border-blue-500", bg: "bg-blue-500/20", text: "text-blue-400", ring: "ring-blue-500/30" },
};

export default function GettingStarted() {
  const [currentStep, setCurrentStep] = useState<number>(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4 py-8">
          <Badge variant="outline" className="text-emerald-400 border-emerald-400/50">
            Getting Started Guide
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            PAR(2) Discovery Engine
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Go beyond "is there a rhythm?" to "how strong and stable is it?" — 
            using persistence scores that work across genes, species, and conditions.
          </p>
        </div>

        <HowTo
          title="Getting Started Guide"
          summary="A step-by-step introduction to the PAR(2) Discovery Engine for new users. Walks you through the key concepts, the navigation structure, and the recommended order for exploring the platform."
          steps={[
            { label: "Follow the guide", detail: "Read through each section in order for a structured introduction to the platform." },
            { label: "Try the links", detail: "Click the embedded links to jump directly to the relevant analysis pages as you learn about them." }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-white">Fast</CardTitle>
              <CardDescription className="text-slate-400">
                Analyse 1000+ gene pairs in seconds — no coding needed
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">Predictive</CardTitle>
              <CardDescription className="text-slate-400">
                See which genes might respond to drugs or disease
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Validated</CardTitle>
              <CardDescription className="text-slate-400">
                Tested across 721 analyses in 72 biological contexts
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Guided Discovery Path</h2>
                <p className="text-sm text-slate-400">Follow these 7 steps to understand the full platform</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {TOUR_STEPS.map((tourStep) => {
                const isActive = currentStep === tourStep.step;
                const isCompleted = currentStep > 0 && tourStep.step < currentStep;
                const colors = COLOR_MAP[tourStep.color] || COLOR_MAP.emerald;
                const IconComponent = tourStep.icon;

                return (
                  <div
                    key={tourStep.step}
                    data-testid={`tour-step-${tourStep.step}`}
                    className={`rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? `${colors.border} bg-slate-900/80 ring-2 ${colors.ring}`
                        : "border-slate-700 bg-slate-900/40 hover:bg-slate-900/60"
                    }`}
                    onClick={() => setCurrentStep(isActive ? 0 : tourStep.step)}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500/20"
                          : isActive
                            ? colors.bg
                            : "bg-slate-800"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className={`text-sm font-bold ${isActive ? colors.text : "text-slate-400"}`}>
                            {tourStep.step}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? colors.text : "text-slate-400"}`} />
                        <span className={`font-medium ${isActive ? "text-white" : "text-slate-300"}`}>
                          {tourStep.title}
                        </span>
                      </div>
                      <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                        isActive ? `${colors.text} rotate-90` : "text-slate-400"
                      }`} />
                    </div>
                    {isActive && (
                      <div className="px-3 pb-3 pl-14 space-y-3">
                        <p className="text-sm text-slate-400">{tourStep.description}</p>
                        <Link href={tourStep.route}>
                          <Button
                            size="sm"
                            className="bg-slate-700 hover:bg-slate-600 text-white"
                            data-testid={`tour-goto-${tourStep.step}`}
                          >
                            Go to Page <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={currentStep <= 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                data-testid="tour-prev"
              >
                Previous
              </Button>
              <span className="text-xs text-slate-400">
                {currentStep === 0
                  ? "Click a step to begin"
                  : `Step ${currentStep} of ${TOUR_STEPS.length}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={currentStep === 0 || currentStep >= TOUR_STEPS.length}
                onClick={() => setCurrentStep((prev) => Math.min(TOUR_STEPS.length, prev + 1))}
                data-testid="tour-next"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="researchers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="researchers" data-testid="tab-researchers">For Researchers</TabsTrigger>
            <TabsTrigger value="programmers" data-testid="tab-programmers">For Programmers</TabsTrigger>
            <TabsTrigger value="clinicians" data-testid="tab-clinicians">For Clinicians</TabsTrigger>
          </TabsList>
          
          <TabsContent value="researchers" className="space-y-6 mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  Quick Start (5 minutes)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-400 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Start at the Home Page</h3>
                      <p className="text-slate-400">Click "Home" in the navigation to visit the home page.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-400 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Select a Pre-loaded Dataset</h3>
                      <p className="text-slate-400">Choose from 39 embedded datasets (mouse tissues, human blood, Arabidopsis, organoids).</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-400 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Click "Run Analysis"</h3>
                      <p className="text-slate-400">The engine analyzes all clock-target gene pairs and computes eigenvalues.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-400 font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Read the Results</h3>
                      <p className="text-slate-400">
                        <strong>Below 0.60</strong> — Signal fades quickly (healthy, resilient)<br/>
                        <strong>0.60–0.80</strong> — Signal lingers (sustained memory)<br/>
                        <strong>Above 0.80</strong> — Signal persists strongly (slow to recover)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <Link href="/">
                    <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-go-home">
                      Go to Home <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  Upload Your Own Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">Your CSV should have this format:</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-300">
{`Gene,ZT0,ZT4,ZT8,ZT12,ZT16,ZT20
Per2,5.2,8.1,6.3,4.1,7.9,5.8
Cry1,4.8,6.2,7.1,5.3,4.9,6.5
Lgr5,3.1,3.4,3.2,3.5,3.3,3.1`}
                  </pre>
                </div>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    First column: Gene names (symbols or Ensembl IDs)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Remaining columns: Expression values at timepoints
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Minimum 6 timepoints recommended (more = better CIs)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="programmers" className="space-y-6 mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-cyan-400" />
                  API Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">All endpoints return JSON. Base URL: <code className="text-emerald-400">/api</code></p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Run Analysis</h4>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                      <pre className="text-slate-300">
{`POST /api/analyze
Content-Type: application/json

{
  "datasetName": "GSE157357_WT",
  "clockGene": "Per2",
  "targetGene": "Lgr5"
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Get Eigenvalue Results</h4>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                      <pre className="text-slate-300">
{`GET /api/analyses

Response:
{
  "analyses": [...],
  "eigenvalue": 0.537,
  "phi1": 1.0,
  "phi2": -0.27
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Download Reports</h4>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                      <pre className="text-slate-300">
{`GET /api/download/verification-report
GET /api/download/report`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-purple-400" />
                  CLI Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-slate-300">
{`# Run verification suite
npx tsx server/verification-suite.ts

# Run drug perturbation simulator
npx tsx server/drug-perturbation.ts

# Run recovery threshold calculator
npx tsx server/recovery-threshold.ts

# Run sleep deprivation analysis
npx tsx server/sleep-phase-gating-test.ts`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="clinicians" className="space-y-6 mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-purple-400" />
                  Clinical Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 rounded-lg">
                    <h4 className="font-semibold text-white flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Recovery Time Estimates
                    </h4>
                    <p className="text-slate-400 text-sm mb-2">How long to bounce back from disruption?</p>
                    <ul className="text-sm space-y-1">
                      <li className="text-emerald-400">Low persistence (0.54) → ~7 days</li>
                      <li className="text-yellow-400">Medium persistence (0.70) → ~13 days</li>
                      <li className="text-red-400">High persistence (0.95) → 90+ days</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-slate-900 rounded-lg">
                    <h4 className="font-semibold text-white flex items-center gap-2 mb-2">
                      <Beaker className="w-4 h-4 text-cyan-400" />
                      Drug Simulator
                    </h4>
                    <p className="text-slate-400 text-sm mb-2">Predict treatment effects:</p>
                    <ul className="text-sm space-y-1">
                      <li className="text-slate-300">Wnt Inhibitor → -0.01 |λ|</li>
                      <li className="text-slate-300">Wnt+Notch → REMISSION</li>
                      <li className="text-red-400">Circadian Disruptor → +0.21 |λ|</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h4 className="font-semibold text-amber-400 mb-2">Important Note</h4>
                  <p className="text-slate-400 text-sm">
                    This tool is for research purposes only. Clinical decisions should be made 
                    in consultation with qualified healthcare professionals. The drug simulator 
                    provides theoretical predictions that require experimental validation.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  Reading the Persistence Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded"></div>
                    <span className="text-slate-300">Below 0.60 — Signal fades quickly (healthy, resilient)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded"></div>
                    <span className="text-slate-300">0.60–0.80 — Signal lingers moderately (worth monitoring)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
                    <span className="text-slate-300">Above 0.80 — Signal persists strongly (slow to recover)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              Download Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="/api/download/verification-report" 
                className="p-4 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                data-testid="link-download-verification"
              >
                <h4 className="font-semibold text-white mb-1">Verification Report</h4>
                <p className="text-slate-400 text-sm">3-part validation suite results</p>
              </a>
              
              <a 
                href="/api/download/report" 
                className="p-4 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                data-testid="link-download-report"
              >
                <h4 className="font-semibold text-white mb-1">Findings Report</h4>
                <p className="text-slate-400 text-sm">Full analysis results</p>
              </a>

              <a 
                href="/api/download/user-guide" 
                download
                className="p-4 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors border border-teal-500/20"
                data-testid="link-download-user-guide"
              >
                <h4 className="font-semibold text-teal-400 mb-1">User Guide & Handbook</h4>
                <p className="text-slate-400 text-sm">Complete guide to every feature (save as PDF)</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Key Terms Explained</CardTitle>
            <CardDescription className="text-slate-400">
              Hover over dotted-underlined terms throughout the platform for quick definitions, or browse the full list here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GlossaryPanel />
          </CardContent>
        </Card>

        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">
            PAR(2) Discovery Engine v1.0.0 | 721 analyses | 72 biological contexts | 129 consensus gene pairs
          </p>
        </div>
      </div>
    </div>
  );
}
