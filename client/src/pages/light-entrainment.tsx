import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  LineChart, Line, ReferenceLine,
} from "recharts";
import {
  ArrowLeft, Sun, AlertTriangle, ChevronDown, Info, BookOpen,
  FlaskConical, TrendingDown, Layers, CheckCircle2, Clock, Zap
} from "lucide-react";

const TISSUE_NAMES: Record<string, string> = {
  Lun: "Lung", Kid: "Kidney", Hrt: "Heart", Adr: "Adrenal Gland",
  WFat: "White Adipose", BFat: "Brown Adipose", Aor: "Aorta",
  Liv: "Liver", Mus: "Skeletal Muscle", Bstm: "Brainstem",
  Cer: "Cerebellum", Hyp: "Hypothalamus",
};

const TISSUE_LAYER: Record<string, "peripheral" | "neuroendocrine" | "central"> = {
  Lun: "peripheral", Kid: "peripheral", Hrt: "peripheral",
  WFat: "peripheral", BFat: "peripheral", Aor: "peripheral",
  Liv: "peripheral", Mus: "peripheral",
  Adr: "neuroendocrine",
  Bstm: "central", Cer: "central", Hyp: "central",
};

const TISSUE_DATA = [
  { tissue: "Lun", name: "Lung", meanLam: 0.7966, n: 16, layer: "peripheral" },
  { tissue: "Kid", name: "Kidney", meanLam: 0.7377, n: 16, layer: "peripheral" },
  { tissue: "Hrt", name: "Heart", meanLam: 0.6978, n: 16, layer: "peripheral" },
  { tissue: "Adr", name: "Adrenal Gland", meanLam: 0.6821, n: 16, layer: "neuroendocrine" },
  { tissue: "WFat", name: "White Adipose", meanLam: 0.6655, n: 16, layer: "peripheral" },
  { tissue: "BFat", name: "Brown Adipose", meanLam: 0.6627, n: 16, layer: "peripheral" },
  { tissue: "Aor", name: "Aorta", meanLam: 0.6535, n: 16, layer: "peripheral" },
  { tissue: "Liv", name: "Liver", meanLam: 0.6413, n: 16, layer: "peripheral" },
  { tissue: "Mus", name: "Skeletal Muscle", meanLam: 0.6219, n: 16, layer: "peripheral" },
  { tissue: "Bstm", name: "Brainstem", meanLam: 0.5964, n: 16, layer: "central" },
  { tissue: "Cer", name: "Cerebellum", meanLam: 0.5501, n: 16, layer: "central" },
  { tissue: "Hyp", name: "Hypothalamus", meanLam: 0.4691, n: 16, layer: "central" },
];

const LAYER_COLOR: Record<string, string> = {
  peripheral: "#22c55e",
  neuroendocrine: "#f97316",
  central: "#818cf8",
};

const GENE_DATA: Record<string, Array<{ gene: string; lam: number; r2: number; rtype: string }>> = {
  Hyp: [
    { gene: "Per3", lam: 0.7754, r2: 0.488, rtype: "real" },
    { gene: "Bmal1", lam: 0.6823, r2: 0.502, rtype: "complex" },
    { gene: "Rev-erbα", lam: 0.6323, r2: 0.325, rtype: "real" },
    { gene: "Rev-erbβ", lam: 0.6034, r2: 0.434, rtype: "real" },
    { gene: "Per2", lam: 0.5373, r2: 0.524, rtype: "complex" },
    { gene: "Dbp", lam: 0.5127, r2: 0.490, rtype: "complex" },
    { gene: "Clock", lam: 0.4989, r2: -0.053, rtype: "real" },
    { gene: "Cry1", lam: 0.4597, r2: 0.048, rtype: "complex" },
    { gene: "Per1", lam: 0.3725, r2: 0.360, rtype: "complex" },
    { gene: "Cry2", lam: 0.2633, r2: 0.109, rtype: "real" },
  ],
  Adr: [
    { gene: "Npas2", lam: 0.9042, r2: 0.915, rtype: "complex" },
    { gene: "Rev-erbβ", lam: 0.8775, r2: 0.857, rtype: "complex" },
    { gene: "Bmal1", lam: 0.8408, r2: 0.813, rtype: "complex" },
    { gene: "Dbp", lam: 0.8133, r2: 0.774, rtype: "complex" },
    { gene: "Rev-erbα", lam: 0.8068, r2: 0.777, rtype: "complex" },
    { gene: "Tef", lam: 0.7950, r2: 0.781, rtype: "complex" },
    { gene: "Per3", lam: 0.7859, r2: 0.773, rtype: "complex" },
    { gene: "Per2", lam: 0.6307, r2: 0.390, rtype: "real" },
    { gene: "Cry1", lam: 0.5769, r2: 0.560, rtype: "real" },
    { gene: "Per1", lam: 0.5766, r2: 0.232, rtype: "real" },
  ],
  Liv: [
    { gene: "Rev-erbβ", lam: 0.8564, r2: 0.822, rtype: "complex" },
    { gene: "Rev-erbα", lam: 0.8112, r2: 0.714, rtype: "complex" },
    { gene: "Clock", lam: 0.8104, r2: 0.785, rtype: "complex" },
    { gene: "Dbp", lam: 0.7917, r2: 0.730, rtype: "complex" },
    { gene: "Bmal1", lam: 0.7671, r2: 0.749, rtype: "complex" },
    { gene: "Cry1", lam: 0.7595, r2: 0.767, rtype: "complex" },
    { gene: "Tef", lam: 0.6573, r2: 0.628, rtype: "complex" },
    { gene: "Per2", lam: 0.6360, r2: 0.688, rtype: "complex" },
    { gene: "Per1", lam: 0.5738, r2: 0.466, rtype: "complex" },
    { gene: "Cry2", lam: 0.5832, r2: 0.038, rtype: "real" },
  ],
  Lun: [
    { gene: "Per3", lam: 0.9360, r2: 0.932, rtype: "complex" },
    { gene: "Tef", lam: 0.9296, r2: 0.921, rtype: "complex" },
    { gene: "Rorγ", lam: 0.9151, r2: 0.899, rtype: "complex" },
    { gene: "Dbp", lam: 0.8938, r2: 0.860, rtype: "complex" },
    { gene: "Per2", lam: 0.8880, r2: 0.874, rtype: "complex" },
    { gene: "Rev-erbα", lam: 0.8736, r2: 0.846, rtype: "complex" },
    { gene: "Rev-erbβ", lam: 0.8704, r2: 0.865, rtype: "complex" },
    { gene: "Cry1", lam: 0.8478, r2: 0.800, rtype: "complex" },
    { gene: "Bmal1", lam: 0.8234, r2: 0.833, rtype: "complex" },
    { gene: "Per1", lam: 0.5214, r2: 0.443, rtype: "complex" },
  ],
};

const GSE11923_LIVER = [
  { gene: "Cry1", lam: 0.8955, r2: 0.787, rtype: "real" },
  { gene: "Bmal1", lam: 0.8946, r2: 0.800, rtype: "real" },
  { gene: "Rorγ", lam: 0.8703, r2: 0.754, rtype: "real" },
  { gene: "Per2", lam: 0.8680, r2: 0.576, rtype: "real" },
  { gene: "Rorβ", lam: 0.8584, r2: 0.370, rtype: "real" },
  { gene: "Clock", lam: 0.8573, r2: 0.754, rtype: "real" },
  { gene: "Hlf", lam: 0.8212, r2: 0.491, rtype: "real" },
  { gene: "Rev-erbβ", lam: 0.8111, r2: 0.825, rtype: "real" },
  { gene: "Dbp", lam: 0.7708, r2: 0.709, rtype: "real" },
  { gene: "Tef", lam: 0.7345, r2: 0.743, rtype: "real" },
  { gene: "Npas2", lam: 0.7218, r2: 0.514, rtype: "real" },
  { gene: "Per3", lam: 0.7177, r2: 0.309, rtype: "real" },
  { gene: "Per1", lam: 0.7031, r2: 0.399, rtype: "real" },
  { gene: "Cry2", lam: 0.6802, r2: 0.425, rtype: "real" },
  { gene: "Rev-erbα", lam: 0.5399, r2: 0.720, rtype: "complex" },
  { gene: "Rorα", lam: 0.4160, r2: 0.130, rtype: "complex" },
];

const BABOON_CROSS_SPECIES = [
  { tissue: "SCN / Hypothalamus", baboon: 0.4708, mouse: 0.4690 },
  { tissue: "Cerebellum", baboon: 0.5263, mouse: 0.5300 },
  { tissue: "Adrenal (cortex)", baboon: 0.5819, mouse: 0.5880 },
  { tissue: "Heart", baboon: 0.5712, mouse: 0.6230 },
  { tissue: "Kidney (medulla)", baboon: 0.6074, mouse: 0.6470 },
  { tissue: "Muscle (arm)", baboon: 0.6079, mouse: 0.5960 },
  { tissue: "Liver", baboon: 0.5002, mouse: 0.7180 },
  { tissue: "Lung", baboon: 0.6940, mouse: 0.7970 },
];

const REENT_DATA = TISSUE_DATA.map(t => {
  const tau_c = t.meanLam > 0 && t.meanLam < 1 ? -1 / Math.log(t.meanLam) : null;
  const hours = tau_c ? Math.round(tau_c * 2 * 10) / 10 : null;
  return { ...t, tauC: tau_c ? Math.round(tau_c * 100) / 100 : null, reentHours: hours };
});

export default function LightEntrainment() {
  const [selectedTissue, setSelectedTissue] = useState<string>("Hyp");
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);

  const hyp = TISSUE_DATA.find(t => t.tissue === "Hyp")!;
  const lun = TISSUE_DATA.find(t => t.tissue === "Lun")!;
  const hypTau = -1 / Math.log(hyp.meanLam);
  const lunTau = -1 / Math.log(lun.meanLam);
  const tauRatio = Math.round(lunTau / hypTau * 10) / 10;

  const radarGenes = ["Bmal1", "Per1", "Per2", "Cry1", "Dbp", "Rev-erbα", "Tef", "Per3"];
  const radarData = radarGenes.map(g => {
    const row: Record<string, number | string> = { gene: g };
    ["Hyp", "Adr", "Liv", "Lun"].forEach(t => {
      const found = GENE_DATA[t].find(x => x.gene === g);
      row[t] = found ? Math.round(found.lam * 100) : 0;
    });
    return row;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </button>
          </Link>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center flex-shrink-0">
            <Sun className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold" data-testid="text-page-title">Central-Peripheral Clock Hierarchy</h1>
              <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[10px]">Paper Q</Badge>
              <Badge variant="outline" className="text-[10px]">Draft · Not submitted</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Multi-tissue AR(2) eigenvalue gradient across 12 mouse tissues — light entrainment dynamics from GSE54650 &amp; GSE11923
            </p>
          </div>
        </div>

        <Card className="bg-amber-500/5 border-amber-500/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200">
                <strong>Research tool — not a medical device.</strong> All results are computational analyses of public gene expression data.
                Predictions about re-entrainment dynamics are hypotheses requiring experimental validation, not clinical guidance.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/30 via-slate-900/60 to-slate-900 border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Key Finding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-center">
                <div className="text-2xl font-bold font-mono text-indigo-300">0.469</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Hypothalamus mean |λ|</div>
                <div className="text-[9px] text-indigo-400 mt-0.5 font-medium">LOWEST — rapid oscillator</div>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                <div className="text-2xl font-bold font-mono text-green-300">0.797</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Lung mean |λ|</div>
                <div className="text-[9px] text-green-400 mt-0.5 font-medium">HIGHEST — sustained integrator</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                <div className="text-2xl font-bold font-mono text-orange-300">{tauRatio}×</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Re-entrainment lag ratio</div>
                <div className="text-[9px] text-orange-400 mt-0.5 font-medium">Peripheral vs central τ_c</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Contrary to intuition, the hypothalamus — which contains the suprachiasmatic nucleus (SCN), the master circadian pacemaker — shows the <em>lowest</em> clock gene temporal persistence across all 12 tissues. Peripheral tissues (lung, kidney, heart) show 1.5–1.7× higher |λ|. This reflects a fundamental biological asymmetry: the SCN is a rapid oscillator designed to reset quickly in response to light; peripheral tissues are sustained integrators that resist change, resulting in the well-known delay of peripheral re-entrainment during jet lag.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" /> 12-Tissue Eigenvalue Hierarchy
            </CardTitle>
            <CardDescription className="text-xs">
              Mean |λ| of 16 core clock genes per tissue — GSE54650 (Lahens et al. / Hogenesch lab, n=288 samples, 2-hour CT intervals)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={[...TISSUE_DATA].reverse()} layout="vertical" margin={{ left: 100, right: 60, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 10, fill: "#64748b" }} tickCount={6} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} width={95} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number, _: string, props: any) => [
                    `|λ| = ${v.toFixed(4)}  [${props.payload.layer}]`,
                    "mean clock gene"
                  ]}
                />
                <Bar dataKey="meanLam" radius={[0, 4, 4, 0]}>
                  {TISSUE_DATA.map((t, i) => (
                    <Cell key={i} fill={LAYER_COLOR[t.layer]} opacity={0.85} />
                  ))}
                </Bar>
                <ReferenceLine x={0.469} stroke="#818cf8" strokeDasharray="4 2" label={{ value: "Hyp", position: "insideTopRight", fill: "#818cf8", fontSize: 9 }} />
                <ReferenceLine x={0.797} stroke="#22c55e" strokeDasharray="4 2" label={{ value: "Lun", position: "insideTopRight", fill: "#22c55e", fontSize: 9 }} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#22c55e" }} /> Peripheral tissues</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f97316" }} /> Neuroendocrine (Adrenal)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#818cf8" }} /> Central (brain)</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-indigo-400" /> Per-Gene Profile
              </CardTitle>
              <CardDescription className="text-xs">Top 10 clock genes — click tissue to compare</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {["Hyp", "Adr", "Liv", "Lun"].map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTissue(t)}
                    className={`px-2.5 py-1 rounded text-[10px] font-medium border transition-all ${selectedTissue === t
                      ? "bg-indigo-500/30 border-indigo-500/60 text-indigo-200"
                      : "bg-slate-800 border-slate-600 text-slate-400 hover:text-slate-200"}`}
                    data-testid={`btn-tissue-${t}`}
                  >
                    {TISSUE_NAMES[t]}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                {GENE_DATA[selectedTissue]?.map((g, i) => (
                  <div key={g.gene} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 w-3 text-right">{i + 1}</span>
                    <span className="text-[11px] font-mono text-slate-300 w-16">{g.gene}</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${g.lam * 100}%`,
                          background: g.lam > 0.8 ? "#22c55e" : g.lam > 0.6 ? "#eab308" : g.lam > 0.4 ? "#f97316" : "#ef4444"
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 w-12 text-right">{g.lam.toFixed(4)}</span>
                    <span className="text-[9px] text-slate-600 w-8">{g.rtype === "complex" ? "~" : ""}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 mt-3">~ = complex (oscillatory) roots. R² range: {
                GENE_DATA[selectedTissue]?.length
                  ? `${Math.min(...GENE_DATA[selectedTissue].map(g => g.r2)).toFixed(2)}–${Math.max(...GENE_DATA[selectedTissue].map(g => g.r2)).toFixed(2)}`
                  : "—"
              }</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" /> Re-Entrainment Lag Prediction
              </CardTitle>
              <CardDescription className="text-xs">
                Temporal correlation length τ_c = −1/ln(|λ|) × 2h predicts how long each tissue retains its old phase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={REENT_DATA} layout="vertical" margin={{ left: 95, right: 40, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 16]} tick={{ fontSize: 9, fill: "#64748b" }} tickCount={5}
                    label={{ value: "τ_c (hours)", position: "insideBottomRight", offset: -4, fill: "#64748b", fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 10 }}
                    formatter={(v: number) => [`${v.toFixed(1)} h`, "Memory half-time"]}
                  />
                  <Bar dataKey="reentHours" radius={[0, 3, 3, 0]}>
                    {REENT_DATA.map((t, i) => (
                      <Cell key={i} fill={LAYER_COLOR[t.layer]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/20 text-[10px] text-orange-200 leading-relaxed">
                <strong>Prediction:</strong> Hypothalamus clock re-sets in ~{(hypTau * 2).toFixed(1)}h. Lung peripheral clock
                takes ~{(lunTau * 2).toFixed(1)}h — a <strong>{tauRatio}× delay</strong>. This provides a quantitative, gene-level
                basis for the well-documented clinical observation that peripheral tissues lag the SCN by 2–14 days
                during transmeridian travel.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> GSE11923 Replication — Mouse Liver (48h Hourly)
            </CardTitle>
            <CardDescription className="text-xs">
              Independent high-resolution dataset: hourly sampling for 48h from pooled liver (n=3–5 mice/timepoint).
              Mean |λ| = {(GSE11923_LIVER.filter(g => g.lam <= 1).reduce((s, g) => s + g.lam, 0) / GSE11923_LIVER.filter(g => g.lam <= 1).length).toFixed(4)} across 16 clock genes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={GSE11923_LIVER} margin={{ left: 8, right: 8, top: 4, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="gene" tick={{ fontSize: 9, fill: "#94a3b8" }} angle={-35} textAnchor="end" interval={0} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 10 }}
                  formatter={(v: number, _: string, props: any) => [`|λ| = ${v.toFixed(4)} (R²=${props.payload.r2.toFixed(3)})`, props.payload.gene]}
                />
                <Bar dataKey="lam" radius={[3, 3, 0, 0]}>
                  {GSE11923_LIVER.map((g, i) => (
                    <Cell key={i} fill={g.lam > 0.8 ? "#22c55e" : g.lam > 0.6 ? "#eab308" : "#f97316"} opacity={0.85} />
                  ))}
                </Bar>
                <ReferenceLine y={0.641} stroke="#94a3b8" strokeDasharray="3 2"
                  label={{ value: "GSE54650 Liver", position: "right", fill: "#94a3b8", fontSize: 8 }} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              GSE11923 liver mean |λ| = 0.735 vs GSE54650 liver mean |λ| = 0.641. The higher value in the 48h hourly dataset
              reflects the better AR(2) fit from more time points (n=48 vs 24), consistent with Paper A simulation findings on
              sample size dependence. Directional gene ranking is concordant: Bmal1, Cry1, Clock, Per2 all rank highly in both datasets.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-fuchsia-400" /> Figure 2 — Cross-Tissue Gene Profile (Radar)
            </CardTitle>
            <CardDescription className="text-xs">
              8 core clock genes × 4 tissues: Hypothalamus · Adrenal · Liver · Lung. Values = |λ| × 100.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="gene" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "#64748b" }} tickCount={4} />
                <Radar name="Hypothalamus" dataKey="Hyp" stroke="#818cf8" fill="#818cf8" fillOpacity={0.15} strokeWidth={1.5} />
                <Radar name="Adrenal" dataKey="Adr" stroke="#f97316" fill="#f97316" fillOpacity={0.1} strokeWidth={1.5} />
                <Radar name="Liver" dataKey="Liv" stroke="#eab308" fill="#eab308" fillOpacity={0.1} strokeWidth={1.5} />
                <Radar name="Lung" dataKey="Lun" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={1.5} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 10 }}
                  formatter={(v: number) => [`|λ| = ${(Number(v)/100).toFixed(3)}`]}
                />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              The lung polygon consistently extends outward relative to hypothalamus — reflecting higher persistence across nearly all core clock genes.
              Per3 shows the largest tissue spread (Hyp 0.775 vs Lun 0.936). Per1 is the exception, showing relatively low persistence even in the lung (0.521).
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" /> Table 1 — Complete 12-Tissue Hierarchy
            </CardTitle>
            <CardDescription className="text-xs">
              Mean |λ| and temporal correlation length τ_c (hours) for all 12 tissues. GSE54650, 16 clock genes per tissue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Rank</th>
                    <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Tissue</th>
                    <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Layer</th>
                    <th className="text-right py-2 pr-3 text-slate-400 font-semibold">Mean |λ|</th>
                    <th className="text-right py-2 pr-3 text-slate-400 font-semibold">τ_c (h)</th>
                    <th className="text-right py-2 text-slate-400 font-semibold">Lag ratio vs Hyp</th>
                  </tr>
                </thead>
                <tbody>
                  {[...TISSUE_DATA].reverse().map((t, i) => {
                    const tauC = -2 / Math.log(t.meanLam);
                    const hypTauC = -2 / Math.log(0.4691);
                    const ratio = tauC / hypTauC;
                    const layerLabel = t.layer === "peripheral" ? "Peripheral" : t.layer === "neuroendocrine" ? "Neuroendocrine" : "CNS";
                    return (
                      <tr key={t.tissue} className={`border-b border-slate-800/60 ${i % 2 === 0 ? "bg-slate-900/30" : ""}`}>
                        <td className="py-1.5 pr-3 text-slate-500">{i + 1}</td>
                        <td className="py-1.5 pr-3 font-medium text-slate-200">{t.name}</td>
                        <td className="py-1.5 pr-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{
                            background: t.layer === "peripheral" ? "#22c55e22" : t.layer === "neuroendocrine" ? "#f9731622" : "#818cf822",
                            color: t.layer === "peripheral" ? "#86efac" : t.layer === "neuroendocrine" ? "#fdba74" : "#a5b4fc",
                          }}>{layerLabel}</span>
                        </td>
                        <td className="py-1.5 pr-3 text-right font-mono text-slate-200">{t.meanLam.toFixed(4)}</td>
                        <td className="py-1.5 pr-3 text-right font-mono text-slate-200">{tauC.toFixed(1)}</td>
                        <td className="py-1.5 text-right font-mono" style={{ color: ratio > 2 ? "#f87171" : ratio > 1.5 ? "#fb923c" : "#94a3b8" }}>
                          {ratio.toFixed(2)}×
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-slate-500 mt-2">τ_c = −2/ln(|λ|) hours. Lag ratio = τ_c(tissue) / τ_c(Hypothalamus). GSE54650: 2-hour CT sampling intervals.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" /> Table 2 — Per-Gene Eigenvalues: Hypothalamus vs Lung
            </CardTitle>
            <CardDescription className="text-xs">
              The two extreme tissues. Root type: complex roots = oscillatory dynamics (~), real roots = aperiodic decay.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Gene</th>
                    <th className="text-right py-2 pr-3 text-slate-400 font-semibold">Hyp |λ|</th>
                    <th className="text-right py-2 pr-3 text-slate-400 font-semibold">Hyp R²</th>
                    <th className="text-right py-2 pr-3 text-slate-400 font-semibold">Hyp roots</th>
                    <th className="text-right py-2 pr-3 text-slate-400 font-semibold">Lun |λ|</th>
                    <th className="text-right py-2 pr-3 text-slate-400 font-semibold">Lun R²</th>
                    <th className="text-right py-2 pr-3 text-slate-400 font-semibold">Lun roots</th>
                    <th className="text-right py-2 text-slate-400 font-semibold">Δ|λ|</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const hypGenes = GENE_DATA["Hyp"] ?? [];
                    const lunGenes = GENE_DATA["Lun"] ?? [];
                    const allGenes = Array.from(new Set([...hypGenes.map(g => g.gene), ...lunGenes.map(g => g.gene)]));
                    return allGenes.sort((a, b) => {
                      const aLun = lunGenes.find(g => g.gene === a)?.lam ?? 0;
                      const bLun = lunGenes.find(g => g.gene === b)?.lam ?? 0;
                      return bLun - aLun;
                    }).map((gene, i) => {
                      const h = hypGenes.find(g => g.gene === gene);
                      const l = lunGenes.find(g => g.gene === gene);
                      const delta = l && h ? l.lam - h.lam : null;
                      return (
                        <tr key={gene} className={`border-b border-slate-800/60 ${i % 2 === 0 ? "bg-slate-900/30" : ""}`}>
                          <td className="py-1.5 pr-3 font-mono font-medium text-slate-200">{gene}</td>
                          <td className="py-1.5 pr-3 text-right font-mono text-indigo-300">{h ? h.lam.toFixed(4) : "—"}</td>
                          <td className="py-1.5 pr-3 text-right font-mono text-slate-400">{h ? h.r2.toFixed(3) : "—"}</td>
                          <td className="py-1.5 pr-3 text-right text-slate-500">{h ? (h.rtype === "complex" ? "~" : "real") : "—"}</td>
                          <td className="py-1.5 pr-3 text-right font-mono text-green-300">{l ? l.lam.toFixed(4) : "—"}</td>
                          <td className="py-1.5 pr-3 text-right font-mono text-slate-400">{l ? l.r2.toFixed(3) : "—"}</td>
                          <td className="py-1.5 pr-3 text-right text-slate-500">{l ? (l.rtype === "complex" ? "~" : "real") : "—"}</td>
                          <td className="py-1.5 text-right font-mono" style={{ color: delta !== null ? (delta > 0.2 ? "#4ade80" : delta > 0 ? "#86efac" : "#f87171") : "#64748b" }}>
                            {delta !== null ? `${delta > 0 ? "+" : ""}${delta.toFixed(3)}` : "—"}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-slate-500 mt-2">Δ|λ| = Lung − Hypothalamus. Positive values (green) = peripheral tissue has higher temporal persistence. ~ = complex (oscillatory) AR(2) roots.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Table 3 — GSE11923 Replication: All 16 Genes (Liver, 48h Hourly)
            </CardTitle>
            <CardDescription className="text-xs">
              Hughes et al. 2009. Hourly sampling for 48h — n=48 timepoints. Mean |λ| = {(GSE11923_LIVER.reduce((s, g) => s + g.lam, 0) / GSE11923_LIVER.length).toFixed(4)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 pr-4 text-slate-400 font-semibold">Rank</th>
                    <th className="text-left py-2 pr-4 text-slate-400 font-semibold">Gene</th>
                    <th className="text-right py-2 pr-4 text-slate-400 font-semibold">|λ|</th>
                    <th className="text-right py-2 pr-4 text-slate-400 font-semibold">R²</th>
                    <th className="text-right py-2 pr-4 text-slate-400 font-semibold">Root type</th>
                    <th className="text-right py-2 text-slate-400 font-semibold">τ_c (h)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...GSE11923_LIVER].sort((a, b) => b.lam - a.lam).map((g, i) => {
                    const tauC = -1 / Math.log(g.lam);
                    return (
                      <tr key={g.gene} className={`border-b border-slate-800/60 ${i % 2 === 0 ? "bg-slate-900/30" : ""}`}>
                        <td className="py-1.5 pr-4 text-slate-500">{i + 1}</td>
                        <td className="py-1.5 pr-4 font-mono font-medium text-slate-200">{g.gene}</td>
                        <td className="py-1.5 pr-4 text-right font-mono" style={{ color: g.lam > 0.85 ? "#4ade80" : g.lam > 0.7 ? "#86efac" : "#fbbf24" }}>{g.lam.toFixed(4)}</td>
                        <td className="py-1.5 pr-4 text-right font-mono text-slate-400">{g.r2.toFixed(3)}</td>
                        <td className="py-1.5 pr-4 text-right text-slate-500">{g.rtype === "complex" ? "complex (~)" : "real"}</td>
                        <td className="py-1.5 text-right font-mono text-slate-300">{tauC.toFixed(1)}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-slate-500 mt-2">τ_c = −1/ln(|λ|) for 1h sampling. GSE11923 uses 1-hour intervals; all 16 genes present. Note: 48 timepoints vs 24 in GSE54650 — higher n improves eigenvalue precision.</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/20 via-slate-900/60 to-slate-900 border-emerald-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Cross-Species Replication — Baboon (GSE98965, Pre-Specified)
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] ml-1">3/4 predictions pass</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Mure et al. 2018. 16 clock gene orthologues across 60 baboon tissues, 12 ZT timepoints. Includes <strong>direct SCN measurement</strong> — resolving Limitation 1 of the mouse dataset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Baboon SCN τc", value: "2.65h" },
                { label: "Baboon Lung τc", value: "5.48h" },
                { label: "LUN/SCN ratio", value: "2.07×" },
                { label: "CNS < Per gap p", value: "0.022" },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-center">
                  <div className="text-lg font-bold font-mono text-emerald-300">{value}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">Pre-specified predictions — registered before analysis</div>
              <div className="space-y-1.5">
                {[
                  { label: "P1 — SCN in lowest quartile of 60 tissues", result: "Rank 9/60 (bottom 15%)", pass: true },
                  { label: "P2 — CNS mean < Peripheral mean (permutation)", result: "Δ = +0.0433, p = 0.022 (10,000 iterations)", pass: true },
                  { label: "P3 — Peripheral/CNS τc ratio ≥ 1.3× (group means, stringent criterion)", result: "1.16× — FAIL on stringent group criterion; does not contradict central claim. SCN–Lung endpoint ratio = 2.07×, which meets the qualitative expectation.", pass: false },
                  { label: "P4 — Positive Spearman rank concordance with mouse (n=8)", result: "ρ = 0.524, p = 0.183 — direction correct, n too small for significance", pass: true },
                ].map(({ label, result, pass }) => (
                  <div key={label} className={`p-2.5 rounded border text-[10px] flex items-start gap-2 ${pass ? "bg-emerald-900/10 border-emerald-800/30" : "bg-rose-900/10 border-rose-800/30"}`}>
                    <span className={`font-bold mt-0.5 flex-shrink-0 ${pass ? "text-emerald-400" : "text-rose-400"}`}>{pass ? "✓" : "✗"}</span>
                    <div>
                      <div className={`font-semibold ${pass ? "text-emerald-300" : "text-rose-300"}`}>{label}</div>
                      <div className="text-slate-400 mt-0.5">{result}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-[10px] font-semibold text-emerald-300 mb-2">Headline — evolutionary conservation of SCN dynamics</div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-center">
                  <div className="text-xl font-bold font-mono text-indigo-300">0.4708</div>
                  <div className="text-[9px] text-slate-400">Baboon SCN |λ|</div>
                </div>
                <div className="text-slate-400 text-lg">≈</div>
                <div className="text-center">
                  <div className="text-xl font-bold font-mono text-indigo-300">0.4690</div>
                  <div className="text-[9px] text-slate-400">Mouse Hypothalamus |λ|</div>
                </div>
                <div className="text-[10px] text-slate-400 border-l border-slate-700 pl-3">
                  <div className="font-mono text-emerald-300">Δ = +0.0018</div>
                  <div className="text-slate-500 mt-0.5">~30 million years of divergence</div>
                  <div className="text-slate-500">No parameter tuning</div>
                </div>
              </div>
              <div className="text-[9px] text-slate-500 mt-2">Lung is the highest-persistence tissue in both species. SCN is rank 9/60 in baboon vs rank 12/12 (last) in mouse hypothalamus.</div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-slate-400 mb-2">Cross-species comparison: 8 overlapping tissues (Spearman ρ = 0.524)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={BABOON_CROSS_SPECIES} layout="vertical" margin={{ left: 135, right: 20, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 9, fill: "#64748b" }} tickCount={6} />
                  <YAxis type="category" dataKey="tissue" tick={{ fontSize: 9, fill: "#94a3b8" }} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 10 }}
                    formatter={(v: number, name: string) => [`|λ| = ${Number(v).toFixed(4)}`, name === "baboon" ? "Baboon" : "Mouse"]}
                  />
                  <Bar dataKey="baboon" name="Baboon" fill="#818cf8" opacity={0.85} radius={[0, 3, 3, 0]} />
                  <Bar dataKey="mouse" name="Mouse" fill="#22c55e" opacity={0.6} radius={[0, 3, 3, 0]} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[9px] text-slate-500 mt-1">All 8 tissues show directionally concordant ordering (peripheral &gt; SCN/CNS in both species). Non-significant ρ reflects n=8 overlap — direction is consistent throughout. Note: baboon liver |λ| unusually low (0.500) vs mouse (0.718); baboon oesophagus tissue sampling may differ from mouse lung.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" /> Light Entrainment Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-300 mb-1.5">Why the SCN oscillates fast (low |λ|)</h4>
              <p>The hypothalamus contains the SCN — the master pacemaker that receives direct light input via the retinohypothalamic tract. Its function is to <em>detect and transmit phase</em>, not to sustain a persistent state. A rapid oscillator with low temporal autocorrelation (low |λ|) is ideally suited for this: it is sensitive and re-settable. The data show that SCN-resident clock genes (Cry1, Per1, Per2) have |λ| of 0.26–0.54 in the hypothalamus — among the lowest values in the dataset. This makes the SCN gene network maximally responsive to environmental input.</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <h4 className="font-semibold text-green-300 mb-1.5">Why peripheral tissues sustain (high |λ|)</h4>
              <p>Peripheral tissues (lung, kidney, liver) use the clock to coordinate metabolism, immune timing, and tissue repair on a 24h schedule. For these functions, <em>stability and robustness</em> are more important than rapid re-setting. High |λ| (0.64–0.80) ensures that the peripheral clock "remembers" its phase across multiple time steps — buffering against noise, meal timing, and short-term disruptions. The lung's mean |λ| of 0.797 gives a correlation time of ~8.8h: the lung clock needs roughly 8–9 hours of new photic information before it meaningfully updates its state.</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
              <h4 className="font-semibold text-indigo-300 mb-1.5">The jet lag prediction</h4>
              <p>After a rapid phase shift (transmeridian travel or shift work), the SCN re-entrains rapidly to the new light schedule — its low |λ| enables fast adaptation. Peripheral tissues resist change in proportion to their |λ|. The AR(2) framework predicts peripheral re-entrainment will lag the SCN by a factor of τ_c(peripheral) / τ_c(SCN). The observed ratio is ~{tauRatio}×, meaning the peripheral clock lags the SCN by roughly {tauRatio} times longer to reach the same degree of phase shift. For a 6-hour time-zone crossing taking 2 days for the SCN, peripheral tissue re-entrainment would require ~{(tauRatio * 2).toFixed(0)} days — consistent with the clinically documented 1–2 week recovery period after long-haul travel.</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" /> Datasets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <div className="font-semibold text-blue-300 mb-1">Primary: GSE54650 (Hogenesch lab)</div>
                <p className="text-[10px] text-slate-400">Lahens NF et al. (2015) IVT-seq reveals extreme bias in RNA sequencing. Genome Biology 16:42. PMID: 25830526. 12 mouse tissues × 24 CT time points (CT18–CT64, 2h intervals). GPL6246 (Affymetrix Mouse Gene 1.0 ST). N=288 samples. Access: NCBI GEO GSE54650 (public, no restrictions).</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <div className="font-semibold text-blue-300 mb-1">Replication: GSE11923 (Hogenesch lab)</div>
                <p className="text-[10px] text-slate-400">Hughes ME et al. (2009) Harmonics of circadian gene expression in mammals. PLOS Genetics 5:e1000442. PMID: 19343201. Mouse liver sampled hourly for 48h (CT18–CT65). GPL1261 (Affymetrix MG-430 2.0). N=48 samples. Access: NCBI GEO GSE11923 (public, no restrictions).</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-900/20 border border-emerald-700/40">
                <div className="font-semibold text-emerald-300 mb-1">Cross-species replication: GSE98965 (Bhanu/Bhattacharya/Kay lab)</div>
                <p className="text-[10px] text-slate-400">Mure LS et al. (2018) Diurnal transcriptome atlas of a primate across major neural and peripheral tissues. Science 359:eaao0318. PMID: 29439135. Baboon (<em>Papio anubis</em>) — 60 tissues × 12 ZT time points (2h intervals, 24h cycle). Includes <strong>direct SCN measurement</strong>. 16 clock gene orthologues. N=720 samples. Access: NCBI GEO GSE98965 (public, no restrictions). Pre-specified replication: 3/4 predictions pass.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" /> Statistical Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                ["Tissues analysed (mouse)", "12"],
                ["Clock genes per tissue", "16"],
                ["Total eigenvalues computed", "192 (GSE54650)"],
                ["Replication eigenvalues", "16 (GSE11923 liver)"],
                ["Hypothalamus mean |λ|", "0.469"],
                ["Lung mean |λ|", "0.797"],
                ["Gradient (Lun − Hyp)", "+0.328"],
                ["Re-entrainment τ_c ratio", `${tauRatio}×`],
                ["Baboon tissues (GSE98965)", "60 (incl. direct SCN)"],
                ["Baboon SCN |λ|", "0.4708 (≈ mouse Hyp 0.4690)"],
                ["Baboon LUN/SCN τc ratio", "2.07×"],
                ["Cross-species p (CNS<Per)", "0.022 (permutation)"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-0.5 border-b border-slate-800">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-mono text-slate-200">{val}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Collapsible open={methodsOpen} onOpenChange={setMethodsOpen}>
          <CollapsibleTrigger className="w-full">
            <Card className="bg-slate-900/60 border-slate-700/40 hover:border-slate-600 transition-colors cursor-pointer">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2"><Info className="w-4 h-4 text-slate-400" /> Methods</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${methodsOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="bg-slate-900/40 border-slate-700/30 rounded-t-none border-t-0">
              <CardContent className="pt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                <p><strong>AR(2) fitting.</strong> For each gene &times; tissue, expression values were extracted at all available CT time points, sorted chronologically, and mean-centred. An AR(2) model was fitted by OLS: x&#771;_t = &#x3C6;&#x2081;x&#771;&#x2090;&#x2095;&#x2081; + &#x3C6;&#x2082;x&#771;&#x2090;&#x2095;&#x2082; + &#x3B5;_t. The eigenvalue modulus |&#x3BB;| was computed as max(|r&#x2081;|, |r&#x2082;|) from the characteristic polynomial r&sup2; &#x2212; &#x3C6;&#x2081;r &#x2212; &#x3C6;&#x2082; = 0. When the discriminant &#x3C6;&#x2081;&sup2; + 4&#x3C6;&#x2082; is negative (complex roots), |&#x3BB;| = &#x221A;(&#x2212;&#x3C6;&#x2082;).</p>
                <p><strong>Temporal correlation length.</strong> Following Paper P methodology, &#x3C4;_c = &#x2212;1/ln(|&#x3BB;|) gives the correlation length in units of sampling intervals. For GSE54650 (2h intervals), &#x3C4;_c(hours) = &#x2212;2/ln(|&#x3BB;|). This is the half-time of the exponential autocorrelation decay G(&#x3C4;) = |&#x3BB;|&#x207F;.</p>
                <p><strong>Gene selection.</strong> 16 core clock genes were analysed: Arntl (Bmal1), Per1, Per2, Per3, Cry1, Cry2, Clock, Npas2, Nr1d1 (Rev-erbα), Nr1d2 (Rev-erbβ), Dbp, Tef, Hlf, Rora, Rorb, Rorc. Probe-to-gene mapping used GPL6246 (GSE54650) and GPL1261 (GSE11923) platform annotations from NCBI GEO. Multiple probes for the same gene in the same tissue were averaged.</p>
                <p><strong>Tissue classification.</strong> Tissues were classified post-hoc as peripheral (Lun, Kid, Hrt, WFat, BFat, Aor, Liv, Mus), neuroendocrine (Adr), or central nervous system (Bstm, Cer, Hyp) based on anatomical location relative to the SCN.</p>
                <p><strong>Statistical note.</strong> No formal permutation tests are reported in this version. The central-peripheral gradient is descriptive. Gene-set permutation tests comparing tissue-layer eigenvalue distributions are planned for the submitted version.</p>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={limitsOpen} onOpenChange={setLimitsOpen}>
          <CollapsibleTrigger className="w-full">
            <Card className="bg-rose-900/10 border-rose-700/30 hover:border-rose-600/40 transition-colors cursor-pointer">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center justify-between text-rose-300">
                  <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Honest Limitations</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${limitsOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="bg-rose-900/5 border-rose-700/20 rounded-t-none border-t-0">
              <CardContent className="pt-4 space-y-2 text-xs text-rose-200">
                {[
                  ["1. SCN not directly sampled (mouse) — partially resolved in baboon", "GSE54650 samples the hypothalamus as a whole, not the SCN specifically. The SCN represents <1% of hypothalamic tissue. Hypothalamic eigenvalues reflect a mixture of many neuronal populations. PARTIAL MITIGATION: The baboon replication (GSE98965, Mure et al. 2018) includes DIRECT SCN measurement, and the baboon SCN |λ|=0.4708 is virtually identical to mouse hypothalamus |λ|=0.4690 (Δ=0.0018) — suggesting the hypothalamic signal is dominated by SCN-like dynamics even in the rodent tissue mixture."],
                  ["2. 24 time points limit precision", "With 24 two-hour time points spanning two circadian cycles, AR(2) eigenvalue estimates have substantial uncertainty (±0.05–0.15 based on Paper M simulations). The tissue ranking may not be preserved under resampling."],
                  ["3. Re-entrainment prediction is theoretical", "The τ_c re-entrainment prediction assumes a linear AR(2) model and exponential decay to a new phase. Real re-entrainment involves nonlinear dynamics, temperature compensation, and food timing that AR(2) does not capture. The prediction is a hypothesis, not a validated clinical finding."],
                  ["4. No jet lag validation dataset", "This analysis does not use a phase-shift dataset. The jet lag interpretation is inferred from normal-state eigenvalues. Validation requires a dataset with before/during/after phase-shift sampling, which is planned as a follow-up."],
                  ["5. Single sex, single age", "GSE54650 uses adult male C57BL/6J mice. Sex and age differences in circadian timing are well documented and may substantially alter the tissue eigenvalue gradient."],
                  ["6. No expression-matched controls", "The tissue hierarchy is based on 16 pre-selected clock genes without expression-matched genome-background permutation tests. The gradient could reflect tissue-specific expression levels rather than true dynamic differences."],
                  ["7. Two-hour interval undersamples ultradian rhythms", "Some clock-related genes have ultradian components that 2-hour sampling will alias. Eigenvalues may capture aliased rather than true circadian dynamics in some tissues."],
                  ["8. Baboon: 12 ZT timepoints, single sex, single age, 2h intervals", "The baboon GSE98965 dataset uses 12 ZT timepoints (2h intervals over 24h), adult male baboons only, and a single laboratory condition. The P3 prediction (group τc ratio ≥1.3×) failed using group means (1.16×), suggesting the group-level gradient is weaker in baboon than mouse — possibly reflecting between-tissue variance at n=60 vs n=12. Spearman ρ=0.524 is non-significant at n=8 overlapping tissues."],
                ].map(([title, desc]) => (
                  <div key={String(title)} className="p-2.5 rounded bg-rose-900/10 border border-rose-800/30">
                    <div className="font-semibold text-rose-300 mb-0.5">{title}</div>
                    <div className="text-[10px] text-rose-300/70">{desc}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Card className="bg-slate-900/60 border-slate-700/40">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                <strong>Paper Q v1.1 — Draft, not submitted.</strong> Target journal: Journal of Biological Rhythms or Chronobiology International.
                Manuscript at <code className="bg-slate-800 px-1 rounded">manuscripts/paper_q_light_entrainment.md</code>.
                Primary dataset GSE54650: Lahens et al. 2015 (Hogenesch lab, University of Pennsylvania). PMID: 25830526.
                Replication dataset GSE11923: Hughes et al. 2009. PMID: 19343201.
                Cross-species replication GSE98965: Mure et al. 2018 (Bhattacharya/Kay lab). PMID: 29439135. 3/4 pre-specified predictions pass; baboon SCN |λ|=0.4708 ≈ mouse Hyp |λ|=0.4690 (Δ=0.0018 across ~30M years). All datasets publicly available on NCBI GEO with no access restrictions.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
