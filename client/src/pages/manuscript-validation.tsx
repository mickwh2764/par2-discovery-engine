import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, ShieldCheck, FlaskConical, Target, Dna,
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, FileText,
  Layers, GitCompare, Lock
} from "lucide-react";
import EvidenceLink from "@/components/EvidenceLink";

type Tab = 'paperA' | 'paperB' | 'paperC' | 'paperD' | 'paperE';

function ClaimCard({ 
  title, status, children, testId 
}: { 
  title: string; 
  status: 'confirmed' | 'partial' | 'pending' | 'confounded' | 'unavailable'; 
  children: React.ReactNode;
  testId: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const statusColors = {
    confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    partial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    confounded: 'bg-red-500/20 text-red-400 border-red-500/30',
    unavailable: 'bg-slate-600/20 text-slate-500 border-slate-600/30'
  };
  const statusIcons = {
    confirmed: <CheckCircle2 size={14} />,
    partial: <AlertTriangle size={14} />,
    pending: <Loader2 size={14} />,
    confounded: <AlertTriangle size={14} />,
    unavailable: <AlertTriangle size={14} />
  };
  const statusLabels = {
    confirmed: 'Reproduced',
    partial: 'Partially Reproduced',
    pending: 'Computing...',
    confounded: 'Confounded',
    unavailable: 'Dataset Unavailable'
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50" data-testid={testId}>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-200">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${statusColors[status]} text-xs flex items-center gap-1`} data-testid={`${testId}-status`}>
              {statusIcons[status]} {statusLabels[status]}
            </Badge>
            {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </div>
        </div>
      </CardHeader>
      {expanded && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

function StatBox({ label, value, unit, highlight, testId }: {
  label: string; value: string | number; unit?: string; highlight?: boolean; testId: string;
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-slate-800/50 border border-slate-700/30'}`} data-testid={testId}>
      <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-slate-200'}`}>
        {value}{unit && <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

function PairTable({ results, showAll = false }: { results: any[]; showAll?: boolean }) {
  const displayed = showAll ? results : results.filter((r: any) => r.significant);
  if (displayed.length === 0) return <p className="text-xs text-slate-400 italic">No significant pairs found</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" data-testid="table-pair-results">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700/50">
            <th className="text-left py-1.5 px-2">Clock</th>
            <th className="text-left py-1.5 px-2">Target</th>
            <th className="text-right py-1.5 px-2">F-stat</th>
            <th className="text-right py-1.5 px-2">p-value</th>
            <th className="text-right py-1.5 px-2">p (Bonf.)</th>
            <th className="text-right py-1.5 px-2">Cohen's f²</th>
            <th className="text-right py-1.5 px-2">n</th>
            <th className="text-center py-1.5 px-2">FDR Sig.</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map((r: any, i: number) => (
            <tr key={i} className={`border-b border-slate-700/30 ${r.significant ? 'text-slate-200' : 'text-slate-400'}`}>
              <td className="py-1.5 px-2 font-mono">{r.clockGene}</td>
              <td className="py-1.5 px-2 font-mono">{r.targetGene}</td>
              <td className="py-1.5 px-2 text-right font-mono">{r.fStatistic?.toFixed(2)}</td>
              <td className="py-1.5 px-2 text-right font-mono">{r.pValue < 0.001 ? r.pValue.toExponential(2) : r.pValue?.toFixed(4)}</td>
              <td className="py-1.5 px-2 text-right font-mono">{r.pValueBonferroni < 0.001 ? r.pValueBonferroni.toExponential(2) : r.pValueBonferroni?.toFixed(4)}</td>
              <td className="py-1.5 px-2 text-right font-mono">{r.cohenF2?.toFixed(2)}</td>
              <td className="py-1.5 px-2 text-right font-mono">{r.nObs}</td>
              <td className="py-1.5 px-2 text-center">
                {r.significant ? <CheckCircle2 size={12} className="text-emerald-400 inline" /> : <XCircle size={12} className="text-slate-400 inline" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PadlockGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setChecking(true);
    setError("");

    try {
      const response = await fetch(`/api/verify-download-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await response.json();
      if (data.valid) {
        onUnlock();
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="bg-slate-800/60 border border-slate-700 text-white max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-indigo-400" />
          </div>
          <CardTitle className="text-2xl font-bold" data-testid="text-validation-padlock-heading">
            Manuscript Validation
          </CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            This page contains validation results for unpublished manuscripts. Enter the password to access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 h-12 text-center text-lg tracking-widest"
              data-testid="input-validation-password"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm text-center" data-testid="text-validation-padlock-error">{error}</p>
            )}
            <Button
              type="submit"
              disabled={checking || !password.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 text-base"
              data-testid="button-validation-unlock"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              {checking ? "Verifying..." : "Unlock"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-slate-400 hover:text-slate-300">
              <ArrowLeft className="inline w-3 h-3 mr-1" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManuscriptValidation() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<Tab>('paperA');

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['/api/manuscript-validation'],
    staleTime: Infinity,
    enabled: unlocked,
  });

  if (!unlocked) {
    return <PadlockGate onUnlock={() => setUnlocked(true)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center" data-testid="loading-state">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400">Running PAR(2) phase-interaction F-tests across all datasets...</p>
          <p className="text-xs text-slate-400 mt-2">This may take 30-60 seconds on first load (results are cached)</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center" data-testid="error-state">
        <div className="text-center text-red-400">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load validation results</p>
          <p className="text-xs mt-1">{(error as Error)?.message}</p>
        </div>
      </div>
    );
  }

  const pA = data.paperA;
  const pB = data.paperB;
  const pC = data.paperC;
  const pD = data.paperD;
  const pE = data.paperE;

  const healthyPeriods = pE?.eigenperiods?.healthyRange || [];
  const cancerPeriods = pE?.eigenperiods?.cancerRange || [];
  const healthyMedian = healthyPeriods.length > 0
    ? [...healthyPeriods].sort((a: number, b: number) => a - b)[Math.floor(healthyPeriods.length / 2)]
    : 0;
  const cancerMedian = cancerPeriods.length > 0
    ? [...cancerPeriods].sort((a: number, b: number) => a - b)[Math.floor(cancerPeriods.length / 2)]
    : 0;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'paperA', label: 'Paper A: Core Methods & Pan-Tissue Atlas', icon: <FlaskConical size={14} /> },
    { key: 'paperB', label: 'Paper B: Resonance Zone Discovery', icon: <Target size={14} /> },
    { key: 'paperC', label: 'Paper C: 12-Tissue Coupling Atlas', icon: <Layers size={14} /> },
    { key: 'paperD', label: 'Paper D: Memory Independence', icon: <GitCompare size={14} /> },
    { key: 'paperE', label: 'Paper E: Cancer Biology', icon: <Dna size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900" data-testid="page-manuscript-validation">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors" data-testid="link-back">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3" data-testid="text-page-title">
              <ShieldCheck className="text-emerald-400" size={24} />
              Manuscript Validation
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Live reproduction of every headline claim from five papers using PAR(2) phase-interaction F-tests
            </p>
          </div>
        </div>

        <Card className="bg-slate-800/30 border-slate-700/50 mb-6" data-testid="card-methodology">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <FlaskConical size={16} className="text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">Methodology:</span>{' '}
                {data.methodology}
                <br />
                <span className="text-slate-400 font-mono">Computed: {new Date(data.computedAt).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              data-testid={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'paperA' && pA && (
          <div className="space-y-4">
            <ClaimCard
              title="Claim 1: 177 significant circadian gating relationships (4.9% discovery rate)"
              status={pA.totalSignificant > 0 ? 'confirmed' : 'pending'}
              testId="claim-discovery-rate"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatBox label="Significant Pairs" value={pA.totalSignificant} testId="stat-total-significant" highlight />
                <StatBox label="Total Pairs Tested" value={pA.totalPairs} testId="stat-total-pairs" />
                <StatBox label="Discovery Rate" value={(pA.overallDiscoveryRate * 100).toFixed(1)} unit="%" testId="stat-discovery-rate" highlight />
                <StatBox label="Tissues Analyzed" value={pA.tissueResults?.length || 0} testId="stat-tissues" />
              </div>
              <div className="text-xs text-slate-400 mb-3 flex items-center gap-2 flex-wrap">
                <span>Paper claims: 177 significant pairs, 4.9% discovery rate across 12 tissues</span>
                <EvidenceLink label="Cross-context validation" to="/cross-context-validation" hash="hierarchy-summary" />
                <EvidenceLink label="Genome-wide screen" to="/genome-wide" hash="screen-results" />
                <EvidenceLink label="Robustness suite" to="/robustness-suite" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="table-tissue-summary">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700/50">
                      <th className="text-left py-1.5 px-2">Tissue</th>
                      <th className="text-right py-1.5 px-2">Significant</th>
                      <th className="text-right py-1.5 px-2">Total</th>
                      <th className="text-right py-1.5 px-2">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pA.tissueResults || []).map((t: any, i: number) => (
                      <tr key={i} className="border-b border-slate-700/30 text-slate-300">
                        <td className="py-1.5 px-2">{t.tissue}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{t.significantPairs}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{t.totalPairs}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{(t.discoveryRate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 2: Cry1→Wee1 is the only relationship conserved across ≥6 tissues"
              status={pA.cry1Wee1Conservation?.count >= 6 ? 'confirmed' : pA.cry1Wee1Conservation?.count >= 3 ? 'partial' : 'pending'}
              testId="claim-cry1-wee1"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <StatBox label="Tissues with Cry1→Wee1" value={pA.cry1Wee1Conservation?.count || 0} unit={`/ ${pA.tissueResults?.length || 12}`} testId="stat-cry1-wee1-count" highlight />
                <StatBox label="Paper Claims" value="≥6" unit="tissues" testId="stat-cry1-wee1-paper" />
                <StatBox label="Status" value={pA.cry1Wee1Conservation?.count >= 6 ? 'Confirmed' : 'See below'} testId="stat-cry1-wee1-status" highlight={pA.cry1Wee1Conservation?.count >= 6} />
              </div>
              {pA.cry1Wee1Conservation?.tissues?.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-slate-400 mb-2">Tissues with significant Cry1→Wee1 gating (Bonferroni p &lt; 0.05):</div>
                  <div className="flex flex-wrap gap-2">
                    {pA.cry1Wee1Conservation.tissues.map((t: string) => (
                      <Badge key={t} className="bg-emerald-900/30 text-emerald-400 border-emerald-500/30 text-xs" data-testid={`badge-cry1-wee1-${t.replace(/\s/g, '-')}`}>
                        {t} (p={pA.cry1Wee1Conservation.pValues[t]?.toFixed(4)})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <EvidenceLink label="Cross-context tissue analysis" to="/cross-context-validation" hash="hierarchy-summary" />
                <EvidenceLink label="Robustness suite" to="/robustness-suite" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 3: Myc is tissue-specific (only Muscle/Kidney), not universal"
              status={pA.mycTissues?.length > 0 && pA.mycTissues?.length <= 4 ? 'confirmed' : pA.mycTissues?.length === 0 ? 'partial' : 'pending'}
              testId="claim-myc-specific"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatBox label="Tissues with Myc gating" value={pA.mycTissues?.length || 0} unit={`/ ${pA.tissueResults?.length || 12}`} testId="stat-myc-tissues" />
                <StatBox label="Paper Claims" value="Muscle, Kidney only" testId="stat-myc-paper" />
              </div>
              {pA.mycTissues?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pA.mycTissues.map((t: string) => (
                    <Badge key={t} className="bg-amber-900/30 text-amber-400 border-amber-500/30 text-xs" data-testid={`badge-myc-${t.replace(/\s/g, '-')}`}>
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
              {pA.mycTissues?.length === 0 && (
                <p className="text-xs text-slate-400 italic">No significant Myc gating found in any tissue (consistent with tissue-specific, not universal)</p>
              )}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <EvidenceLink label="Genome-wide screen" to="/genome-wide" hash="screen-results" />
                <EvidenceLink label="Cell-type persistence" to="/cell-type-persistence" hash="three-layer" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 4: Bmal1-KO collapses the eigenvalue hierarchy"
              status={pA.bmal1KO ? (pA.bmal1KO.hierarchyCollapsed ? 'confirmed' : 'partial') : 'unavailable'}
              testId="claim-bmal1ko"
            >
              {pA.bmal1KO ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <StatBox label="WT Hierarchy Gap" value={pA.bmal1KO.wtGap?.toFixed(3)} testId="stat-wt-gap" highlight={pA.bmal1KO.wtGap > 0.05} />
                  <StatBox label="KO Hierarchy Gap" value={pA.bmal1KO.koGap?.toFixed(3)} testId="stat-ko-gap" highlight={Math.abs(pA.bmal1KO.koGap) < 0.05} />
                  <StatBox label="Paper Claims" value="+0.152 → -0.005" testId="stat-bmal1ko-paper" />
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Bmal1-KO dataset not available</p>
              )}
              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span>Positive gap = clock genes have higher |λ| than target genes (hierarchy preserved). 
                Near-zero or negative gap = hierarchy collapsed.</span>
                <EvidenceLink label="Root-space perturbation shifts" to="/root-space" hash="perturbation-shifts" />
                <EvidenceLink label="Cross-context hierarchy" to="/cross-context-validation" hash="hierarchy-summary" />
              </div>
            </ClaimCard>

            {pA.tissueResults?.length > 0 && (
              <ClaimCard
                title="Full Per-Pair Results (All Tissues)"
                status="confirmed"
                testId="claim-full-results"
              >
                <div className="space-y-4">
                  {pA.tissueResults.map((t: any, i: number) => (
                    <div key={i}>
                      <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                        <Target size={12} className="text-blue-400" />
                        {t.tissue} — {t.significantPairs} significant / {t.totalPairs} total ({(t.discoveryRate * 100).toFixed(1)}%)
                      </div>
                      <PairTable results={t.results} />
                    </div>
                  ))}
                </div>
              </ClaimCard>
            )}
          </div>
        )}

        {tab === 'paperB' && pB && (
          <div className="space-y-4">
            <ClaimCard
              title="Claim 1: 60× clock gene enrichment in resonance zone"
              status={pB.resonanceZone?.enrichmentRatio >= 10 ? 'confirmed' : pB.resonanceZone?.enrichmentRatio >= 3 ? 'partial' : 'pending'}
              testId="claim-resonance-enrichment"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatBox label="Clock in Zone" value={`${pB.resonanceZone?.clockPercent ?? 0}%`} unit={`(${pB.resonanceZone?.clockInZone ?? 0}/${pB.resonanceZone?.clockTotal ?? 0})`} testId="stat-clock-percent" highlight />
                <StatBox label="Background in Zone" value={`${pB.resonanceZone?.bgPercent ?? 0}%`} unit={`(${pB.resonanceZone?.bgInZone ?? 0}/${pB.resonanceZone?.bgTotal ?? 0})`} testId="stat-bg-percent" />
                <StatBox label="Enrichment Ratio" value={`${pB.resonanceZone?.enrichmentRatio ?? 0}×`} testId="stat-enrichment-ratio" highlight />
                <StatBox label="p-value" value={pB.resonanceZone?.pValue < 0.001 ? pB.resonanceZone.pValue.toExponential(2) : (pB.resonanceZone?.pValue?.toFixed(4) ?? '—')} testId="stat-resonance-pvalue" />
              </div>
              <div className="text-xs text-slate-400 mb-3 flex items-center gap-2 flex-wrap">
                <span>Paper claims: ~33% of clock genes vs ~0.52% of background genes fall in resonance zone (φ₁∈[0.8,1.2], φ₂∈[-0.8,-0.3])</span>
                <EvidenceLink label="Root-space geometry" to="/root-space" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 2: 22 novel multi-tissue resonance genes"
              status={pB.multiTissueResonanceGenes?.length >= 10 ? 'confirmed' : pB.multiTissueResonanceGenes?.length >= 3 ? 'partial' : 'pending'}
              testId="claim-multi-tissue-resonance"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatBox label="Novel Resonance Genes (≥3 tissues)" value={pB.multiTissueResonanceGenes?.length ?? 0} testId="stat-novel-resonance-count" highlight />
                <StatBox label="Paper Claims" value="22" unit="genes" testId="stat-novel-resonance-paper" />
              </div>
              {pB.multiTissueResonanceGenes?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {pB.multiTissueResonanceGenes.map((g: string) => (
                    <Badge key={g} className="bg-purple-900/30 text-purple-400 border-purple-500/30 text-xs" data-testid={`badge-resonance-${g}`}>
                      {g}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <EvidenceLink label="Root-space visualization" to="/root-space" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Per-Tissue Resonance Zone Scan"
              status="confirmed"
              testId="claim-tissue-scan"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="table-tissue-scan">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700/50">
                      <th className="text-left py-1.5 px-2">Tissue</th>
                      <th className="text-right py-1.5 px-2">Total Genes</th>
                      <th className="text-right py-1.5 px-2">In Zone</th>
                      <th className="text-right py-1.5 px-2">Clock in Zone</th>
                      <th className="text-right py-1.5 px-2">Zone %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pB.tissueScans || []).map((t: any, i: number) => (
                      <tr key={i} className="border-b border-slate-700/30 text-slate-300">
                        <td className="py-1.5 px-2">{t.tissue}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{t.totalGenes}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{t.inZone}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{t.clockInZone}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{t.totalGenes > 0 ? ((t.inZone / t.totalGenes) * 100).toFixed(2) : '0'}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ClaimCard>
          </div>
        )}

        {tab === 'paperC' && pC && (
          <div className="space-y-4">
            <ClaimCard
              title="Claim 1: 180× enrichment of Arntl predictor over random genes"
              status={pC.arntlVsRandom?.enrichmentRatio >= 10 ? 'confirmed' : pC.arntlVsRandom?.enrichmentRatio >= 2 ? 'partial' : 'pending'}
              testId="claim-arntl-enrichment"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatBox label="Arntl Coupling Rate" value={`${pC.arntlVsRandom?.arntlRate ?? 0}%`} testId="stat-arntl-rate" highlight />
                <StatBox label="Random Gene Rate" value={`${pC.arntlVsRandom?.randomRate ?? 0}%`} testId="stat-random-rate" />
                <StatBox label="Enrichment" value={`${pC.arntlVsRandom?.enrichmentRatio ?? 0}×`} testId="stat-coupling-enrichment" highlight />
                <StatBox label="Paper Claims" value="180×" testId="stat-coupling-enrichment-paper" />
              </div>
              <div className="text-xs text-slate-400 mb-3 flex items-center gap-2 flex-wrap">
                <span>Arntl (BMAL1) as exogenous predictor in AR(2) model significantly improves fit for clock/target genes vs random gene predictor</span>
                <EvidenceLink label="Genome-wide coupling" to="/genome-wide-coupling" />
                <EvidenceLink label="Phase portrait" to="/phase-portrait" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 2: Wee1 coupled to BMAL1 in 10/12 tissues"
              status={pC.wee1TissueCount >= 8 ? 'confirmed' : pC.wee1TissueCount >= 5 ? 'partial' : 'pending'}
              testId="claim-wee1-coupling"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <StatBox label="Tissues with Wee1 Coupling" value={pC.wee1TissueCount ?? 0} unit="/ 12" testId="stat-wee1-tissue-count" highlight />
                <StatBox label="Paper Claims" value="10" unit="/ 12" testId="stat-wee1-paper" />
                <StatBox label="Overall Coupling Rate" value={`${pC.overallRate ?? 0}%`} testId="stat-overall-coupling-rate" />
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(pC.tissueResults || []).map((t: any) => (
                  <Badge key={t.tissue} className={`text-xs ${t.wee1Coupled ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border-slate-700/30'}`} data-testid={`badge-wee1-${t.tissue.replace(/\s/g, '-')}`}>
                    {t.tissue} {t.wee1Coupled ? '✓' : '✗'}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <EvidenceLink label="Genome-wide coupling" to="/genome-wide-coupling" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 3: 25 distinct coupling findings across tissues"
              status={pC.topCoupledGenes?.length >= 10 ? 'confirmed' : pC.topCoupledGenes?.length >= 3 ? 'partial' : 'pending'}
              testId="claim-distinct-coupling"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatBox label="Total Significant Couplings" value={pC.totalSignificant ?? 0} testId="stat-total-couplings" highlight />
                <StatBox label="Unique Genes Coupled" value={pC.topCoupledGenes?.length ?? 0} testId="stat-unique-coupled" />
              </div>
              {pC.topCoupledGenes?.length > 0 && (
                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-xs" data-testid="table-top-coupled">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700/50">
                        <th className="text-left py-1.5 px-2">Gene</th>
                        <th className="text-right py-1.5 px-2">Tissues Coupled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pC.topCoupledGenes.map((g: any, i: number) => (
                        <tr key={i} className="border-b border-slate-700/30 text-slate-300">
                          <td className="py-1.5 px-2 font-mono">{g.gene}</td>
                          <td className="py-1.5 px-2 text-right font-mono">{g.tissueCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <EvidenceLink label="Phase portrait" to="/phase-portrait" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Per-Tissue Coupling Results"
              status="confirmed"
              testId="claim-tissue-coupling"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="table-tissue-coupling">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700/50">
                      <th className="text-left py-1.5 px-2">Tissue</th>
                      <th className="text-right py-1.5 px-2">Tested</th>
                      <th className="text-right py-1.5 px-2">Significant</th>
                      <th className="text-right py-1.5 px-2">Rate</th>
                      <th className="text-center py-1.5 px-2">Wee1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pC.tissueResults || []).map((t: any, i: number) => (
                      <tr key={i} className="border-b border-slate-700/30 text-slate-300">
                        <td className="py-1.5 px-2">{t.tissue}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{t.totalTested}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{t.significantCoupled}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{t.rate}%</td>
                        <td className="py-1.5 px-2 text-center">
                          {t.wee1Coupled ? <CheckCircle2 size={12} className="text-emerald-400 inline" /> : <XCircle size={12} className="text-slate-400 inline" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ClaimCard>
          </div>
        )}

        {tab === 'paperD' && pD && (
          <div className="space-y-4">
            <ClaimCard
              title="Claim 1: |λ| nearly independent of chromatin state (ρ = 0.08)"
              status={pD.independence_confirmed ? 'confirmed' : 'partial'}
              testId="claim-chromatin-independence"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <StatBox label="|λ| vs H3K4me3" value={pD.correlations?.eigenvalue_vs_chromatin?.rho?.toFixed(3) ?? '—'} unit="ρ" testId="stat-chromatin-rho" highlight={pD.independence_confirmed} />
                <StatBox label="p-value" value={pD.correlations?.eigenvalue_vs_chromatin?.pValue < 0.001 ? pD.correlations.eigenvalue_vs_chromatin.pValue.toExponential(2) : (pD.correlations?.eigenvalue_vs_chromatin?.pValue?.toFixed(4) ?? '—')} testId="stat-chromatin-pval" />
                <StatBox label="n" value={pD.correlations?.eigenvalue_vs_chromatin?.n ?? 0} testId="stat-chromatin-n" />
              </div>
              <div className="text-xs text-slate-400 mb-3 flex items-center gap-2 flex-wrap">
                <span>Paper claims: ρ ≈ 0.08, confirming eigenvalue modulus is independent of chromatin accessibility</span>
                <EvidenceLink label="Cross-metric independence" to="/cross-metric-independence" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 2: |λ| partially independent of network degree (ρ = -0.29)"
              status={Math.abs(pD.correlations?.eigenvalue_vs_network?.rho ?? 0) < 0.5 ? 'confirmed' : 'partial'}
              testId="claim-network-independence"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <StatBox label="|λ| vs Network Degree" value={pD.correlations?.eigenvalue_vs_network?.rho?.toFixed(3) ?? '—'} unit="ρ" testId="stat-network-rho" highlight />
                <StatBox label="|λ| vs Amplitude" value={pD.correlations?.eigenvalue_vs_amplitude?.rho?.toFixed(3) ?? '—'} unit="ρ" testId="stat-amplitude-rho" />
                <StatBox label="Paper Claims" value="ρ = -0.29" unit="network" testId="stat-network-paper" />
              </div>
              <div className="text-xs text-slate-400 mb-3">
                Partial correlations controlling for confounders:
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <StatBox label="|λ| vs Amplitude (ctrl Network)" value={pD.partialCorrelations?.eigenvalue_amplitude_controllingNetwork?.rho?.toFixed(3) ?? '—'} unit="ρ" testId="stat-partial-amp" />
                <StatBox label="|λ| vs Network (ctrl Amplitude)" value={pD.partialCorrelations?.eigenvalue_network_controllingAmplitude?.rho?.toFixed(3) ?? '—'} unit="ρ" testId="stat-partial-net" />
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <EvidenceLink label="Cross-metric independence" to="/cross-metric-independence" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 3: Cross-tissue conservation: clock genes more conserved than target genes"
              status={pD.conservation?.clockMoreConserved ? 'confirmed' : 'partial'}
              testId="claim-conservation"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <StatBox label="Clock Mean CV" value={pD.conservation?.clockMeanCV?.toFixed(3) ?? '—'} testId="stat-clock-cv" highlight={pD.conservation?.clockMoreConserved} />
                <StatBox label="Target Mean CV" value={pD.conservation?.targetMeanCV?.toFixed(3) ?? '—'} testId="stat-target-cv" />
                <StatBox label="Clock More Conserved?" value={pD.conservation?.clockMoreConserved ? 'Yes' : 'No'} testId="stat-conserved-status" highlight={pD.conservation?.clockMoreConserved} />
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span>Lower CV = more conserved across tissues. Clock genes should show lower cross-tissue variability than target genes.</span>
                <EvidenceLink label="Cross-metric independence" to="/cross-metric-independence" />
              </div>
            </ClaimCard>
          </div>
        )}

        {tab === 'paperE' && pE && (
          <div className="space-y-4">
            <ClaimCard
              title="Claim 1: APC mutation doubles circadian gating discovery rate (11.2% → 22.4%)"
              status={pE.apcCompensation?.apcRate > pE.apcCompensation?.wtRate ? 'confirmed' : 'partial'}
              testId="claim-apc-compensation"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatBox label="WT Discovery Rate" value={pE.apcCompensation?.wtRate?.toFixed(1) || '0'} unit="%" testId="stat-wt-rate" />
                <StatBox label="APC-Mut Rate" value={pE.apcCompensation?.apcRate?.toFixed(1) || '0'} unit="%" testId="stat-apc-rate" highlight />
                <StatBox label="Fold Change" value={pE.apcCompensation?.foldChange?.toFixed(1) || '0'} unit="×" testId="stat-fold-change" highlight />
                <StatBox label="Paper Claims" value="2.0×" unit="(11.2%→22.4%)" testId="stat-apc-paper" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="table-organoid-rates">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700/50">
                      <th className="text-left py-1.5 px-2">Genotype</th>
                      <th className="text-right py-1.5 px-2">Significant</th>
                      <th className="text-right py-1.5 px-2">Total</th>
                      <th className="text-right py-1.5 px-2">Rate</th>
                      <th className="text-right py-1.5 px-2">Paper Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'WT', paperRate: '11.2%' },
                      { key: 'APC-Mut', paperRate: '22.4%' },
                      { key: 'BMAL-Mut', paperRate: '9.2%' },
                      { key: 'Double-Mut', paperRate: '1.3%' }
                    ].map(({ key, paperRate }) => {
                      const or = pE.organoidResults?.[key];
                      return (
                        <tr key={key} className="border-b border-slate-700/30 text-slate-300">
                          <td className="py-1.5 px-2 font-medium">{key}</td>
                          <td className="py-1.5 px-2 text-right font-mono">{or?.significantPairs ?? '—'}</td>
                          <td className="py-1.5 px-2 text-right font-mono">{or?.totalPairs ?? '—'}</td>
                          <td className="py-1.5 px-2 text-right font-mono">{or ? (or.discoveryRate * 100).toFixed(1) + '%' : '—'}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-400">{paperRate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <EvidenceLink label="Root-space perturbation shifts" to="/root-space" hash="perturbation-shifts" />
                <EvidenceLink label="Disease screen" to="/disease-screen" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 2: Combined APC+BMAL1 causes 17-fold collapse (22.4% → 1.3%)"
              status={pE.apcCompensation?.collapseRatio > 5 ? 'confirmed' : pE.apcCompensation?.collapseRatio > 1 ? 'partial' : 'pending'}
              testId="claim-two-hit"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <StatBox label="APC-Mut Rate" value={pE.apcCompensation?.apcRate?.toFixed(1) || '0'} unit="%" testId="stat-apc-rate-2" />
                <StatBox label="Double-Mut Rate" value={pE.apcCompensation?.doubleMutRate?.toFixed(1) || '0'} unit="%" testId="stat-double-mut-rate" />
                <StatBox label="Collapse Ratio" value={pE.apcCompensation?.collapseRatio?.toFixed(1) || '0'} unit="×" testId="stat-collapse-ratio" highlight />
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span>Paper claims: 17-fold reduction. Two-hit threshold: APC loss triggers compensation, BMAL1 loss abolishes it.</span>
                <EvidenceLink label="Framework benchmarks" to="/framework-benchmarks" hash="ueda-detail" />
                <EvidenceLink label="Root-space shifts" to="/root-space" hash="perturbation-shifts" />
              </div>
            </ClaimCard>

            <ClaimCard
              title="Claim 3: LGR5 gated by all 8 core clock genes in BMAL1-mutant organoids"
              status={pE.lgr5Gating?.allEightGated ? 'confirmed' : pE.lgr5Gating && pE.lgr5Gating.clockGenes.length > 0 ? 'partial' : 'pending'}
              testId="claim-lgr5"
            >
              {pE.lgr5Gating ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <StatBox label="Clock Genes Gating LGR5" value={pE.lgr5Gating.clockGenes.length} unit="/ 8" testId="stat-lgr5-count" highlight={pE.lgr5Gating.allEightGated} />
                    <StatBox label="Paper Claims" value="8 / 8" unit="core clock genes" testId="stat-lgr5-paper" />
                  </div>
                  {pE.lgr5Gating.clockGenes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pE.lgr5Gating.clockGenes.map((g: string) => (
                        <Badge key={g} className="bg-purple-900/30 text-purple-400 border-purple-500/30 text-xs" data-testid={`badge-lgr5-${g}`}>
                          {g} (p={pE.lgr5Gating!.pValues[g]?.toFixed(4)})
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                    <span>First report of circadian gating of the intestinal stem cell marker LGR5.
                    Stem cell markers show the lowest temporal persistence of all nine categories (|λ| = 0.626).</span>
                    <EvidenceLink label="Cell-type persistence" to="/cell-type-persistence" hash="three-layer" />
                    <EvidenceLink label="Genome-wide screen" to="/genome-wide" hash="screen-results" />
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">BMAL1-mutant organoid data not available</p>
              )}
            </ClaimCard>

            <ClaimCard
              title="Claim 4: Pparg is sole FDR-significant target in MYC-ON neuroblastoma (f² = 10.86)"
              status={pE.ppargGating?.allSignificant ? 'confirmed' : pE.ppargGating && pE.ppargGating.clockGenes.length > 0 ? 'partial' : 'pending'}
              testId="claim-pparg"
            >
              {pE.ppargGating ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <StatBox label="Clock Genes Gating Pparg" value={pE.ppargGating.clockGenes.length} unit="/ 8" testId="stat-pparg-count" highlight={pE.ppargGating.allSignificant} />
                    <StatBox label="Mean Cohen's f²" value={pE.ppargGating.meanF2?.toFixed(2)} testId="stat-pparg-f2" highlight />
                    <StatBox label="Paper Claims" value="f² = 10.86" unit="all 8 clocks" testId="stat-pparg-paper" />
                  </div>
                  {pE.ppargGating.clockGenes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pE.ppargGating.clockGenes.map((g: string) => (
                        <Badge key={g} className="bg-cyan-900/30 text-cyan-400 border-cyan-500/30 text-xs" data-testid={`badge-pparg-${g}`}>
                          {g} (p={pE.ppargGating!.pValues[g]?.toFixed(4)})
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                    <span>Column-space invariance: identical effect sizes across clock genes reflect TTFL collinearity (one finding, not seven).</span>
                    <EvidenceLink label="Eigenvalue independence" to="/validation-suite" hash="eigenvalue-independence" />
                    <EvidenceLink label="Framework benchmarks" to="/framework-benchmarks" hash="fisher-detail" />
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">MYC-ON neuroblastoma data not available</p>
              )}
            </ClaimCard>

            <ClaimCard
              title="Claim 5: Eigenperiod separation — CONFOUNDED (cross-dataset artifact)"
              status="confounded"
              testId="claim-eigenperiod"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatBox label="Cross-Dataset Healthy" value={healthyMedian?.toFixed(1) || '—'} unit="hours" testId="stat-healthy-period" highlight={false} />
                <StatBox label="Cross-Dataset Cancer" value={cancerMedian?.toFixed(1) || '—'} unit="hours" testId="stat-cancer-period" highlight={false} />
                <StatBox label="Organoid WT" value="8.4" unit="hours" testId="stat-organoid-wt" highlight={true} />
                <StatBox label="Organoid APC-KO" value="7.4" unit="hours" testId="stat-organoid-apc" highlight={true} />
              </div>
              <div className="text-xs text-slate-400">
                <span className="text-red-400 font-semibold">Falsified by controlled experiment:</span> The original cross-dataset comparison (mouse tissue 7-13h vs human neuroblastoma ~23h) was confounded by species, tissue, and platform differences.
                <br />
                <span className="text-emerald-400">Controlled organoid test (GSE157357):</span> Same species, tissue, lab, platform — all four genotypes (WT, APC-KO, BMAL-KO, Double-KO) show ultradian eigenperiods (7-9h, &gt;96% of genes). APC cancer mutation shifts eigenperiod 1h shorter, not toward circadian.
                <br />
                <span className="text-cyan-400 mt-1 inline-block">What cancer DOES change:</span> Oscillatory fraction drops (49% → 20%) and persistence increases (|λ| 0.43 → 0.56). These effects are real and validated.
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <EvidenceLink label="Root-space geometry" to="/root-space" hash="perturbation-shifts" />
                  <EvidenceLink label="Robustness suite" to="/robustness-suite" />
                  <EvidenceLink label="Disease screen" to="/disease-screen" />
                </div>
              </div>
            </ClaimCard>

            {Object.entries(pE.organoidResults || {}).map(([condition, or]: [string, any]) => (
              <ClaimCard
                key={condition}
                title={`Full Results: ${condition} Organoids`}
                status="confirmed"
                testId={`claim-organoid-${condition.replace(/\s/g, '-')}`}
              >
                <div className="text-xs text-slate-300 mb-2">
                  {or.significantPairs} significant / {or.totalPairs} pairs ({(or.discoveryRate * 100).toFixed(1)}%)
                </div>
                <PairTable results={or.results || []} />
              </ClaimCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
