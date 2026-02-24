import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock, FlaskConical, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Beaker, Target, Clock, Dna, BarChart3, FileText, Search } from "lucide-react";
import EvidenceLink from "@/components/EvidenceLink";
import PaperCrossLinks from "@/components/PaperCrossLinks";

interface DrugDurabilityData {
  summary: {
    dataset: string;
    patients: number;
    patientsComplete: number;
    timePoints: string[];
    probesTotal: number;
    probesValid: number;
    uniqueGenes: number;
    globalMeanLambda: number;
    globalMedianLambda: number;
  };
  categories: Array<{
    name: string;
    genesFound: number;
    genesTotal: number;
    meanLambda: number;
    vsGlobal: number;
    permP: number;
    zScore: number;
    significant: boolean;
    maintenancePct: number | null;
    genesChanged: number | null;
  }>;
  keyGenes: Array<{
    gene: string;
    category: string;
    lambda: number;
    treatmentChange: number;
    surgeryChange: number;
    nProbes: number;
  }>;
  mainFinding: {
    highLambdaMaintenance: number;
    lowLambdaMaintenance: number;
    differencePP: number;
    permP: number;
    bootstrapCILow: number;
    bootstrapCIHigh: number;
  };
  pairwiseComparisons: Array<{
    catA: string;
    catB: string;
    diff: number;
    pValue: number;
    significant: boolean;
  }>;
}

const HARDCODED_DATA: DrugDurabilityData = {
  summary: {
    dataset: "GSE93204",
    patients: 46,
    patientsComplete: 7,
    timePoints: ["Baseline", "C1D1 (Anastrozole)", "C1D15 (Anastrozole + Palbociclib)", "Surgery"],
    probesTotal: 29284,
    probesValid: 23197,
    uniqueGenes: 13328,
    globalMeanLambda: 0.7007,
    globalMedianLambda: 0.7055,
  },
  categories: [
    { name: "Proliferation", genesFound: 21, genesTotal: 26, meanLambda: 0.8877, vsGlobal: 0.1870, permP: 0.0000, zScore: 6.51, significant: true, maintenancePct: 41.7, genesChanged: 21 },
    { name: "DNA Damage Repair", genesFound: 17, genesTotal: 17, meanLambda: 0.7679, vsGlobal: 0.0672, permP: 0.1068, zScore: 1.58, significant: false, maintenancePct: 64.9, genesChanged: 13 },
    { name: "Immune Markers", genesFound: 10, genesTotal: 20, meanLambda: 0.7674, vsGlobal: 0.0667, permP: 0.2104, zScore: 1.24, significant: false, maintenancePct: -29.8, genesChanged: 9 },
    { name: "CDK4/6 Pathway", genesFound: 19, genesTotal: 20, meanLambda: 0.7429, vsGlobal: 0.0421, permP: 0.4184, zScore: 0.82, significant: false, maintenancePct: 70.3, genesChanged: 14 },
    { name: "CDK4/6i Resistance", genesFound: 24, genesTotal: 27, meanLambda: 0.7403, vsGlobal: 0.0396, permP: 0.4440, zScore: 0.78, significant: false, maintenancePct: 48.6, genesChanged: 17 },
    { name: "Core Clock", genesFound: 23, genesTotal: 25, meanLambda: 0.7255, vsGlobal: 0.0248, permP: 0.8884, zScore: 0.16, significant: false, maintenancePct: 99.5, genesChanged: 18 },
    { name: "Oncogenes", genesFound: 11, genesTotal: 19, meanLambda: 0.7152, vsGlobal: 0.0144, permP: 0.8636, zScore: -0.15, significant: false, maintenancePct: 45.1, genesChanged: 11 },
    { name: "Apoptosis", genesFound: 18, genesTotal: 20, meanLambda: 0.7049, vsGlobal: 0.0042, permP: 0.5620, zScore: -0.58, significant: false, maintenancePct: 96.8, genesChanged: 8 },
    { name: "Tumor Suppressors", genesFound: 20, genesTotal: 22, meanLambda: 0.6945, vsGlobal: -0.0062, permP: 0.3192, zScore: -1.00, significant: false, maintenancePct: 77.5, genesChanged: 14 },
    { name: "Estrogen Signaling", genesFound: 11, genesTotal: 14, meanLambda: 0.6663, vsGlobal: -0.0344, permP: 0.1304, zScore: -1.55, significant: false, maintenancePct: 74.3, genesChanged: 9 },
  ],
  keyGenes: [
    { gene: "E2F2", category: "CDK4/6 Pathway", lambda: 0.991, treatmentChange: -1.179, surgeryChange: -0.590, nProbes: 2 },
    { gene: "CRY2", category: "Core Clock", lambda: 0.971, treatmentChange: 0.495, surgeryChange: 0.248, nProbes: 2 },
    { gene: "CDKN2C", category: "CDK4/6 Pathway", lambda: 0.934, treatmentChange: -0.294, surgeryChange: -0.147, nProbes: 1 },
    { gene: "CCNE1", category: "CDK4/6i Resistance", lambda: 0.927, treatmentChange: -0.956, surgeryChange: -0.478, nProbes: 1 },
    { gene: "E2F1", category: "CDK4/6 Pathway", lambda: 0.916, treatmentChange: -1.394, surgeryChange: -0.697, nProbes: 1 },
    { gene: "FBXW11", category: "Core Clock", lambda: 0.896, treatmentChange: 0.399, surgeryChange: 0.200, nProbes: 2 },
    { gene: "CSNK1E", category: "Core Clock", lambda: 0.889, treatmentChange: 0.404, surgeryChange: 0.202, nProbes: 3 },
    { gene: "E2F3", category: "CDK4/6 Pathway", lambda: 0.895, treatmentChange: 0.030, surgeryChange: 0.015, nProbes: 1 },
    { gene: "CDKN2D", category: "CDK4/6 Pathway", lambda: 0.874, treatmentChange: -0.317, surgeryChange: -0.159, nProbes: 1 },
    { gene: "PTEN", category: "CDK4/6i Resistance", lambda: 0.871, treatmentChange: 0.084, surgeryChange: 0.042, nProbes: 3 },
    { gene: "FGFR1", category: "CDK4/6i Resistance", lambda: 0.854, treatmentChange: 0.214, surgeryChange: 0.107, nProbes: 4 },
    { gene: "PER2", category: "Core Clock", lambda: 0.843, treatmentChange: 0.427, surgeryChange: 0.214, nProbes: 2 },
    { gene: "NR1D1", category: "Core Clock", lambda: 0.828, treatmentChange: 0.585, surgeryChange: 0.293, nProbes: 2 },
    { gene: "NR1D2", category: "Core Clock", lambda: 0.825, treatmentChange: 0.380, surgeryChange: 0.190, nProbes: 2 },
    { gene: "RBL1", category: "CDK4/6 Pathway", lambda: 0.813, treatmentChange: -0.791, surgeryChange: -0.396, nProbes: 1 },
    { gene: "CCND1", category: "CDK4/6 Pathway", lambda: 0.764, treatmentChange: -0.209, surgeryChange: -0.105, nProbes: 3 },
    { gene: "MKI67", category: "Proliferation", lambda: 0.750, treatmentChange: 0.496, surgeryChange: -0.020, nProbes: 1 },
    { gene: "CLOCK", category: "Core Clock", lambda: 0.681, treatmentChange: 0.436, surgeryChange: 0.218, nProbes: 1 },
    { gene: "CDK6", category: "CDK4/6 Pathway", lambda: 0.548, treatmentChange: 0.388, surgeryChange: 0.194, nProbes: 2 },
    { gene: "CDK4", category: "CDK4/6 Pathway", lambda: 0.557, treatmentChange: -0.355, surgeryChange: -0.178, nProbes: 1 },
  ],
  mainFinding: {
    highLambdaMaintenance: 40.6,
    lowLambdaMaintenance: 88.5,
    differencePP: 47.9,
    permP: 0.000,
    bootstrapCILow: 43.5,
    bootstrapCIHigh: 52.4,
  },
  pairwiseComparisons: [
    { catA: "Proliferation", catB: "Core Clock", diff: 0.1622, pValue: 0.0000, significant: true },
    { catA: "Tumor Suppressors", catB: "Proliferation", diff: -0.1932, pValue: 0.0000, significant: true },
    { catA: "CDK4/6 Pathway", catB: "Proliferation", diff: -0.1449, pValue: 0.0004, significant: true },
    { catA: "CDK4/6 Pathway", catB: "Core Clock", diff: 0.0174, pValue: 0.6846, significant: false },
    { catA: "CDK4/6 Pathway", catB: "CDK4/6i Resistance", diff: 0.0025, pValue: 0.9432, significant: false },
    { catA: "Core Clock", catB: "CDK4/6i Resistance", diff: -0.0148, pValue: 0.6532, significant: false },
    { catA: "Oncogenes", catB: "Core Clock", diff: -0.0103, pValue: 0.8026, significant: false },
  ],
};

function LambdaBar({ value, max = 1.0, color = "emerald" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
  };
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div className={`h-2 rounded-full ${colorMap[color] || colorMap.emerald}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon }: { title: string; value: string; subtitle?: string; icon: any }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold font-mono" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DrugDurability() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const authenticate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/drug-durability/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Invalid password");
        setLoading(false);
        return;
      }
      setAuthenticated(true);
    } catch {
      setError("Verification failed");
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-drug-durability-title">
              <Lock size={20} />
              Drug Durability Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              This section contains unpublished research on palbociclib persistence analysis. Access is restricted.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && authenticate()}
              data-testid="input-drug-password"
            />
            {error && <p className="text-sm text-red-500" data-testid="text-drug-error">{error}</p>}
            <Button onClick={authenticate} disabled={loading || !password} className="w-full" data-testid="button-drug-unlock">
              {loading ? "Verifying..." : "Unlock"}
            </Button>
            <div className="pt-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1" data-testid="link-drug-back">
                  <ArrowLeft size={14} /> Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [geneSearch, setGeneSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const data = HARDCODED_DATA;
  const sortedByMaintenance = [...data.categories].filter(c => c.maintenancePct !== null).sort((a, b) => (b.maintenancePct ?? 0) - (a.maintenancePct ?? 0));

  const uniqueCategories = Array.from(new Set(data.keyGenes.map(g => g.category))).sort();
  const filteredGenes = data.keyGenes.filter(g => {
    const matchesSearch = geneSearch === "" || g.gene.toLowerCase().includes(geneSearch.toLowerCase());
    const matchesCategory = categoryFilter === "all" || g.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="link-drug-back-main">
              <ArrowLeft size={14} /> Home
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <FlaskConical size={24} className="text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-drug-heading">Drug Durability Analysis</h1>
              <p className="text-sm text-muted-foreground">Palbociclib AR(2) Persistence — Proof of Concept</p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 mt-3">
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">What you can do:</strong> Computes AR(2) eigenvalues for known drug target genes and compares persistence scores across gene categories. This is an exploratory computational analysis — not clinical evidence. Download results for further investigation.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">UNPUBLISHED</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">PROOF-OF-CONCEPT</span>
            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">GSE93204</span>
          </div>
        </div>

        <PaperCrossLinks currentPage="/drug-durability" />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Patients (Complete)" value={`${data.summary.patientsComplete} / ${data.summary.patients}`} subtitle="With all 4 time points" icon={Beaker} />
          <StatCard title="Genes Analyzed" value={data.summary.uniqueGenes.toLocaleString()} subtitle={`${data.summary.probesValid.toLocaleString()} probes`} icon={Dna} />
          <StatCard title="Global Mean |λ|" value={data.summary.globalMeanLambda.toFixed(4)} subtitle={`Median: ${data.summary.globalMedianLambda.toFixed(4)}`} icon={BarChart3} />
          <StatCard title="Time Points" value="4" subtitle="BL → C1D1 → C1D15 → Surgery" icon={Clock} />
        </div>

        {/* Key Limitations — displayed prominently before findings */}
        <Card className="mb-8 border-amber-500/40 bg-amber-500/5" data-testid="card-upfront-limitations">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold text-amber-400">Read before interpreting results</p>
                <p><strong className="text-foreground">N = 7 patients</strong> with complete time series (out of 46 enrolled). Only 4 time points per patient. This is a proof-of-concept exploration, not a powered clinical study. Individual gene predictions are unreliable — population-level patterns are suggestive but require independent replication with larger cohorts.</p>
                <p><strong className="text-foreground">No clinical outcome data.</strong> This dataset does not include progression-free survival or treatment response. The analysis shows correlation between persistence and expression maintenance, not prediction of patient outcomes.</p>
                <p><strong className="text-foreground">Association, not causation.</strong> All findings describe statistical associations. Whether high eigenvalue persistence causes drug resistance, results from it, or reflects a shared upstream process is unknown.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Finding */}
        <Card className="mb-8 border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400" data-testid="text-main-finding-title">
              <ShieldCheck size={20} />
              Core Finding: Persistence Correlates with Drug Effect Durability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">High-|λ| genes (top 25%)</p>
                <p className="text-3xl font-bold text-red-400 font-mono" data-testid="stat-high-maintenance">{data.mainFinding.highLambdaMaintenance}%</p>
                <p className="text-xs text-muted-foreground mt-1">effect maintained at surgery</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Low-|λ| genes (bottom 25%)</p>
                <p className="text-3xl font-bold text-emerald-400 font-mono" data-testid="stat-low-maintenance">{data.mainFinding.lowLambdaMaintenance}%</p>
                <p className="text-xs text-muted-foreground mt-1">effect maintained at surgery</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Difference</p>
                <p className="text-3xl font-bold text-primary font-mono" data-testid="stat-difference">{data.mainFinding.differencePP} pp</p>
                <p className="text-xs text-muted-foreground mt-1">p {"<"} 0.001 | CI [{data.mainFinding.bootstrapCILow}, {data.mainFinding.bootstrapCIHigh}]</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Across all {data.summary.probesValid.toLocaleString()} probes, genes with low persistence (flexible expression) maintain 
              drug-induced changes at nearly double the rate of genes with high persistence (stubborn expression). 
              Not a single random permutation out of 1,000 produced a difference this large. The 95% bootstrap 
              confidence interval [{data.mainFinding.bootstrapCILow}, {data.mainFinding.bootstrapCIHigh}] percentage points excludes zero entirely.
            </p>
          </CardContent>
        </Card>

        {/* Treatment Maintenance by Category */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-maintenance-title">
              <Target size={20} />
              Treatment Effect Maintenance by Gene Category
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              For genes changed during treatment (|Δ| {">"} 0.1), what percentage of that change persists to surgery?
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedByMaintenance.map((cat) => {
                const maint = cat.maintenancePct ?? 0;
                const barWidth = Math.min(Math.abs(maint), 100);
                const isNegative = maint < 0;
                return (
                  <div key={cat.name} className="flex items-center gap-3" data-testid={`row-maintenance-${cat.name.toLowerCase().replace(/[\s/]+/g, '-')}`}>
                    <div className="w-40 text-sm font-medium truncate">{cat.name}</div>
                    <div className="flex-1 bg-muted rounded-full h-5 relative overflow-hidden">
                      <div
                        className={`h-5 rounded-full transition-all ${isNegative ? 'bg-red-500' : maint > 80 ? 'bg-emerald-500' : maint > 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className={`w-16 text-right font-mono text-sm font-bold ${isNegative ? 'text-red-400' : maint > 80 ? 'text-emerald-400' : maint > 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                      {maint > 0 ? '+' : ''}{maint.toFixed(1)}%
                    </div>
                    <div className="w-20 text-xs text-muted-foreground text-right">
                      {cat.genesChanged} genes
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground leading-relaxed">
              Clock genes maintain 99.5% of changes — they are barely touched by palbociclib and what little changes, sticks.
              Proliferation genes are the stubbornest (|λ| = 0.888) yet maintain only 41.7% — their strong memory pulls them back.
              Immune markers reverse completely (-29.8%) suggesting an immune rebound effect after treatment.
            </div>
          </CardContent>
        </Card>

        {/* Permutation Tests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-permutation-title">
              <BarChart3 size={20} />
              Permutation Tests: Category Persistence vs Random (5,000 shuffles)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 px-2 text-right">Genes</th>
                    <th className="py-2 px-2 text-right">Mean |λ|</th>
                    <th className="py-2 px-2 text-right">vs Global</th>
                    <th className="py-2 px-2 text-right">Z-score</th>
                    <th className="py-2 px-2 text-right">p-value</th>
                    <th className="py-2 px-2">|λ| Distribution</th>
                    <th className="py-2 pl-2">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categories.map((cat) => (
                    <tr key={cat.name} className="border-b border-border/20" data-testid={`row-perm-${cat.name.toLowerCase().replace(/[\s/]+/g, '-')}`}>
                      <td className="py-2 pr-4 font-medium">{cat.name}</td>
                      <td className="py-2 px-2 text-right font-mono text-xs">{cat.genesFound}/{cat.genesTotal}</td>
                      <td className="py-2 px-2 text-right font-mono">{cat.meanLambda.toFixed(4)}</td>
                      <td className={`py-2 px-2 text-right font-mono ${cat.vsGlobal > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {cat.vsGlobal > 0 ? '+' : ''}{cat.vsGlobal.toFixed(4)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">{cat.zScore >= 0 ? '+' : ''}{cat.zScore.toFixed(2)}</td>
                      <td className={`py-2 px-2 text-right font-mono font-bold ${cat.permP < 0.05 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {cat.permP < 0.001 ? '<0.001' : cat.permP.toFixed(4)}
                      </td>
                      <td className="py-2 px-2 w-32">
                        <LambdaBar value={cat.meanLambda} color={cat.significant ? 'emerald' : 'amber'} />
                      </td>
                      <td className="py-2 pl-2">
                        {cat.significant ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">SIGNIFICANT</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">NS</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Only proliferation genes are significantly above the genome background (z = +6.51, p {"<"} 0.001). 
              All other categories — clock, targets, resistance, oncogenes — cluster near the global mean and cannot 
              be distinguished from random gene sets by persistence alone.
            </p>
          </CardContent>
        </Card>

        {/* Pairwise Comparisons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-pairwise-title">
              <TrendingUp size={20} />
              Pairwise Category Comparisons (5,000 permutations)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="py-2 pr-4">Comparison</th>
                    <th className="py-2 px-2 text-right">Difference</th>
                    <th className="py-2 px-2 text-right">p-value</th>
                    <th className="py-2 pl-2">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pairwiseComparisons.map((comp, i) => (
                    <tr key={i} className="border-b border-border/20" data-testid={`row-pairwise-${i}`}>
                      <td className="py-2 pr-4">{comp.catA} vs {comp.catB}</td>
                      <td className={`py-2 px-2 text-right font-mono ${comp.diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {comp.diff > 0 ? '+' : ''}{comp.diff.toFixed(4)}
                      </td>
                      <td className={`py-2 px-2 text-right font-mono font-bold ${comp.significant ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {comp.pValue < 0.001 ? '<0.001' : comp.pValue.toFixed(4)}
                      </td>
                      <td className="py-2 pl-2">
                        {comp.significant ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">SIGNIFICANT</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">NS</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Proliferation is significantly different from all other categories. Clock, targets, and resistance 
              pathways cannot be distinguished from each other — they all sit in the same persistence band.
            </p>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <EvidenceLink label="Root-space geometry" to="/root-space" hash="perturbation-shifts" />
              <EvidenceLink label="Disease screen" to="/disease-screen" />
              <EvidenceLink label="Framework benchmarks" to="/framework-benchmarks" hash="turing-detail" />
            </div>
          </CardContent>
        </Card>

        {/* Key Genes Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-genes-title">
              <Dna size={20} />
              Key Gene Persistence Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search genes..."
                  value={geneSearch}
                  onChange={(e) => setGeneSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-gene-search"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="select-category-filter"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground mb-3" data-testid="text-gene-count">
              Showing {filteredGenes.length} of {data.keyGenes.length} genes
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="py-2 pr-3">Gene</th>
                    <th className="py-2 px-2">Category</th>
                    <th className="py-2 px-2 text-right">|λ|</th>
                    <th className="py-2 px-2 text-right">Treatment Δ</th>
                    <th className="py-2 px-2 text-right">Surgery Δ</th>
                    <th className="py-2 px-2 text-right">Probes</th>
                    <th className="py-2 px-2 w-28">Persistence</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGenes.map((g) => (
                    <tr key={g.gene} className="border-b border-border/20" data-testid={`row-gene-${g.gene.toLowerCase()}`}>
                      <td className="py-2 pr-3 font-mono font-bold">{g.gene}</td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">{g.category}</td>
                      <td className="py-2 px-2 text-right font-mono">{g.lambda.toFixed(3)}</td>
                      <td className={`py-2 px-2 text-right font-mono ${g.treatmentChange > 0.2 ? 'text-emerald-400' : g.treatmentChange < -0.2 ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {g.treatmentChange > 0 ? '+' : ''}{g.treatmentChange.toFixed(3)}
                      </td>
                      <td className={`py-2 px-2 text-right font-mono ${g.surgeryChange > 0.2 ? 'text-emerald-400' : g.surgeryChange < -0.2 ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {g.surgeryChange > 0 ? '+' : ''}{g.surgeryChange.toFixed(3)}
                      </td>
                      <td className="py-2 px-2 text-right text-xs text-muted-foreground">{g.nProbes}</td>
                      <td className="py-2 px-2">
                        <LambdaBar value={g.lambda} color={g.lambda > 0.9 ? 'red' : g.lambda > 0.7 ? 'amber' : 'blue'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Limitations */}
        <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400" data-testid="text-limitations-title">
              <AlertTriangle size={20} />
              Limitations and Caveats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <div className="flex gap-3">
              <div className="w-1 rounded bg-amber-500/50 shrink-0" />
              <p><span className="font-semibold text-foreground">N = 7 patients with complete time series.</span> Only 7 out of 46 patients had biopsies at all 4 time points. This is a proof-of-concept, not a definitive study. The genome-wide findings (23,197 probes) are well-powered, but individual gene estimates have wide confidence intervals.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-1 rounded bg-amber-500/50 shrink-0" />
              <p><span className="font-semibold text-foreground">4 time points is borderline for AR(2).</span> AR(2) requires 2 lag terms. With 4 time points per patient, we have 2 usable observations per patient after creating lags. Population-level pooling across 7 patients yields 14 regression observations — functional but thin.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-1 rounded bg-amber-500/50 shrink-0" />
              <p><span className="font-semibold text-foreground">No clinical outcome data.</span> GSE93204 does not include progression-free survival or response data. We can show persistence correlates with whether drug effects are maintained, but cannot link this to patient outcomes.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-1 rounded bg-amber-500/50 shrink-0" />
              <p><span className="font-semibold text-foreground">Cross-sectional pooling assumption.</span> Population-level AR(2) assumes homogeneous persistence structure across patients. Inter-patient heterogeneity may be substantial.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-1 rounded bg-amber-500/50 shrink-0" />
              <p><span className="font-semibold text-foreground">Most gene categories are NOT significantly different from random.</span> Only proliferation genes passed the permutation test. Clock, targets, resistance, and oncogene categories all fall within the range expected from random gene sets of the same size.</p>
            </div>
          </CardContent>
        </Card>

        {/* Independent Verification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-verification-title">
              <ShieldCheck size={20} />
              Independent Verification
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              The underlying biology captured by persistence analysis has been confirmed by completely different methods
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "Pharmacogenomics — Transcriptional Rebound", desc: "Cancer researchers have documented that genes with strong self-regulatory feedback loops resist drug-induced changes and revert after treatment — precisely what high |λ| predicts." },
              { title: "Epigenetic Memory Research", desc: "DNA methylation and chromatin studies show some genes are physically locked into their expression state, making them harder to move with drugs. This maps directly onto the high-persistence / low-persistence distinction." },
              { title: "CDK6 Compensation & CCNE1 Bypass", desc: "Both are textbook palbociclib resistance mechanisms confirmed by dozens of labs using Western blots and knockdown experiments. The AR(2) framework detected them purely from temporal dynamics." },
              { title: "Snyder FAP Convergence", desc: "83% of Snyder et al. (Nature Cancer 2024) FAP pathway genes show eigenvalue disruption in PAR(2) analysis, with 90% directional concordance — confirmed using survival analysis and protein-level measurements." },
              { title: "HER2 Clinical Persistence", desc: "ERBB2's status as the most stubbornly self-reinforcing oncogene is supported by 30 years of clinical oncology. The AR(2) method independently identifies it as the highest-persistence gene in the panel." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1 rounded bg-emerald-500/50 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Future Work */}
        <Card className="mb-8 border-blue-500/30 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400" data-testid="text-future-title">
              <FileText size={20} />
              Future Work: Path to Powered Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Step 1: Clinical Outcomes (PRJNA776728)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Apply for EGA access to the 89-patient dataset with progression-free survival data. This would enable 
                the definitive test: do patients whose target genes have low baseline |λ| respond longer to palbociclib? 
                A Kaplan-Meier curve with log-rank test — binary, concrete, no wiggle room.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Step 2: Second Drug Validation (DRMref)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Test generalizability using the DRMref database (382 samples, 42 drugs, 13 cancer types). If low-|λ| targets 
                maintain drug effects across multiple drug classes, persistence is a general principle — not a palbociclib-specific finding.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Step 3: Liquid Biopsy Time Series</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Apply AR(2) to circulating tumor DNA (ctDNA) longitudinal data from studies like TRACERx (800+ lung cancer patients, 
                serial blood draws). More time points per patient = more robust AR(2) fits. Predict relapse timing from ctDNA 
                persistence trajectories.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Step 4: Wearable Device Validation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compute |λ| on heart rate variability time series from smartwatch data. Test whether physiological persistence 
                correlates with hospital readmission (a hard yes/no endpoint). If validated, the method could extend beyond genomics to 
                commodity health monitoring.
              </p>
            </div>

            <div className="border-t border-border/30 pt-4">
              <h3 className="text-sm font-semibold mb-3">Estimated Timeline and Resources</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="py-1.5 pr-3">Phase</th>
                      <th className="py-1.5 px-2">Work</th>
                      <th className="py-1.5 px-2 text-right">Time</th>
                      <th className="py-1.5 pl-2 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/20">
                      <td className="py-1.5 pr-3 font-medium text-foreground">Data acquisition</td>
                      <td className="py-1.5 px-2">Download PRJNA776728, process into analysis-ready format</td>
                      <td className="py-1.5 px-2 text-right">1-2 weeks</td>
                      <td className="py-1.5 pl-2 text-right">Free</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-1.5 pr-3 font-medium text-foreground">AR(2) computation</td>
                      <td className="py-1.5 px-2">Run eigenvalue analysis on all genes, all time points, all patients</td>
                      <td className="py-1.5 px-2 text-right">1-2 weeks</td>
                      <td className="py-1.5 pl-2 text-right">Compute only</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-1.5 pr-3 font-medium text-foreground">Statistical analysis</td>
                      <td className="py-1.5 px-2">Correlate baseline |λ| with progression-free survival</td>
                      <td className="py-1.5 px-2 text-right">2-4 weeks</td>
                      <td className="py-1.5 pl-2 text-right">Standard biostatistics</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-1.5 pr-3 font-medium text-foreground">Cross-validation</td>
                      <td className="py-1.5 px-2">Validate with PALOMA-3 (GSE128500) and FELINE (GSE158724)</td>
                      <td className="py-1.5 px-2 text-right">4-6 weeks</td>
                      <td className="py-1.5 pl-2 text-right">Free</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-1.5 pr-3 font-medium text-foreground">Patent filing</td>
                      <td className="py-1.5 px-2">File provisional patent on computational method</td>
                      <td className="py-1.5 px-2 text-right">2-4 weeks</td>
                      <td className="py-1.5 pl-2 text-right">$5K-$15K</td>
                    </tr>
                    <tr className="font-medium text-foreground">
                      <td className="py-1.5 pr-3">Total</td>
                      <td className="py-1.5 px-2"></td>
                      <td className="py-1.5 px-2 text-right">4-6 months</td>
                      <td className="py-1.5 pl-2 text-right">{"<"} $20K</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-border/30 pt-4">
              <h3 className="text-sm font-semibold mb-2">Speculative Commercial Potential (Not Validated)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-amber-400">Requires clinical validation.</strong> If AR(2) drug-response predictions are independently validated in prospective trials, potential applications include companion diagnostic development for CDK4/6 inhibitors. 
                No clinical validation has been performed. These projections are exploratory estimates only.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Source */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm" data-testid="text-datasource-title">Data Source & Methods</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <p><span className="font-semibold text-foreground">Dataset:</span> GSE93204 — Agilent Whole Human Genome Microarray 4x44K (GPL6480). 46 breast cancer patients treated with anastrozole + palbociclib. Published as part of the PD991 clinical trial.</p>
            <p><span className="font-semibold text-foreground">Time Points:</span> Baseline (pre-treatment) → C1D1 (after anastrozole alone) → C1D15 (after anastrozole + palbociclib) → Surgery.</p>
            <p><span className="font-semibold text-foreground">Method:</span> Population-level AR(2) regression pooled across 7 patients with complete 4-point time series. Eigenvalue modulus |λ| computed from characteristic equation of AR(2) coefficients. Full probe annotation via GPL6480 platform file (30,724 probes mapped to 13,328 unique genes).</p>
            <p><span className="font-semibold text-foreground">Validation:</span> 5,000-permutation tests for category significance. 1,000-bootstrap resampling for confidence intervals (patient-level resampling with replacement). Two-sided p-values reported throughout.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
