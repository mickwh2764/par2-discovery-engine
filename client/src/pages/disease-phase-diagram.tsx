import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell, ScatterChart, Scatter, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const PHASE_DATA = [
  {
    state: "Healthy",
    ratio: 1.74,
    clockLambda: 0.647,
    targetLambda: 0.529,
    clockTau: 3.9,
    targetTau: 2.0,
    description: "Clock programme dominant",
    color: "#10b981",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500/10",
    zone: "Healthy",
    dataset: "GSE54650 (12-tissue mouse atlas)",
    clinical: "Normal circadian gating of proliferation"
  },
  {
    state: "DblKO rescue",
    ratio: 1.22,
    clockLambda: 0.565,
    targetLambda: 0.462,
    clockTau: 3.1,
    targetTau: 1.8,
    description: "Partial clock recovery",
    color: "#84cc16",
    textColor: "text-lime-400",
    borderColor: "border-lime-500",
    bgColor: "bg-lime-500/10",
    zone: "Intermediate",
    dataset: "GSE157357 (ApcKO+BmalKO organoids)",
    clinical: "Clock partially re-established despite Apc loss"
  },
  {
    state: "Bmal1-KO",
    ratio: 0.99,
    clockLambda: 0.427,
    targetLambda: 0.554,
    clockTau: 2.1,
    targetTau: 1.9,
    description: "Clock autonomy lost",
    color: "#f59e0b",
    textColor: "text-amber-400",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500/10",
    zone: "Disrupted",
    dataset: "GSE70499 (BmalKO mouse liver)",
    clinical: "Circadian gating of cell cycle eliminated"
  },
  {
    state: "APC-KO",
    ratio: 0.43,
    clockLambda: 0.663,
    targetLambda: 0.790,
    clockTau: 3.6,
    targetTau: 5.4,
    description: "E2F programme dominant",
    color: "#ef4444",
    textColor: "text-red-400",
    borderColor: "border-red-500",
    bgColor: "bg-red-500/10",
    zone: "Cancer",
    dataset: "GSE157357 (ApcKO organoids)",
    clinical: "Oncogenic programme self-sustaining, clock subordinated"
  }
];

const TAU_DATA = [
  { name: "Clock (healthy)", tau: 3.9, fill: "#10b981" },
  { name: "Target (healthy)", tau: 2.0, fill: "#6ee7b7" },
  { name: "SCN/Hypothalamus", tau: 3.1, fill: "#3b82f6" },
  { name: "Lung (peripheral)", tau: 5.5, fill: "#93c5fd" },
  { name: "APC-KO E2F", tau: 5.4, fill: "#ef4444" },
  { name: "Bmal1-KO clock", tau: 2.1, fill: "#f59e0b" },
];

const TRAJECTORY_DATA = [
  { x: 0, ratio: 1.74, label: "Healthy", color: "#10b981" },
  { x: 1, ratio: 1.22, label: "DblKO rescue", color: "#84cc16" },
  { x: 2, ratio: 0.99, label: "Bmal1-KO", color: "#f59e0b" },
  { x: 3, ratio: 0.43, label: "APC-KO", color: "#ef4444" },
];

const CustomBarLabel = (props: any) => {
  const { x, y, width, value, fill } = props;
  return (
    <text x={x + width / 2} y={y - 6} fill={fill} textAnchor="middle" fontSize={13} fontWeight={600}>
      {value}×
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm max-w-xs">
        <p className="font-bold text-white mb-1">{d.state}</p>
        <p className="text-gray-300">Clock/Target ratio: <span className="font-mono font-bold" style={{ color: d.color }}>{d.ratio}×</span></p>
        <p className="text-gray-300">Clock |λ|: <span className="font-mono">{d.clockLambda}</span></p>
        <p className="text-gray-300">Target |λ|: <span className="font-mono">{d.targetLambda}</span></p>
        <p className="text-gray-400 text-xs mt-1">{d.dataset}</p>
        <p className="text-gray-300 text-xs mt-1 italic">{d.clinical}</p>
      </div>
    );
  }
  return null;
};

export default function DiseasePhaseDiagram() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-emerald-500 rounded-full" />
            <h1 className="text-3xl font-bold text-white">Disease Phase Diagram</h1>
          </div>
          <p className="text-gray-400 ml-5 text-lg">
            Temporal correlation length ratio (clock τ<sub>c</sub> / target τ<sub>c</sub>) across biological states
          </p>
          <p className="text-gray-500 ml-5 text-sm mt-1">
            Paper P — AR(2) Temporal Correlation Length · G(τ) = |λ|<sup>τ</sup>·cos(πτ/T₀) · τ<sub>c</sub> = −2/ln|λ|
          </p>
        </div>

        {/* Main Phase Diagram */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Clock-to-Target Temporal Correlation Ratio</h2>
          <p className="text-gray-400 text-sm mb-5">
            A ratio above 1.0 means the clock programme has longer correlation length than the proliferative/target programme. Below 1.0: disease programme is dominant.
          </p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={PHASE_DATA} margin={{ top: 30, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="state" tick={{ fill: "#9ca3af", fontSize: 13 }} />
              <YAxis
                domain={[0, 2.2]}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                label={{ value: "Clock τc / Target τc", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={1.0}
                stroke="#ef4444"
                strokeDasharray="6 3"
                strokeWidth={2}
                label={{ value: "Parity — clock = target", position: "right", fill: "#ef4444", fontSize: 11 }}
              />
              <ReferenceLine
                y={1.74}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: "Healthy baseline 1.74×", position: "right", fill: "#10b981", fontSize: 11 }}
              />
              <Bar dataKey="ratio" radius={[6, 6, 0, 0]} label={<CustomBarLabel />}>
                {PHASE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* State Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {PHASE_DATA.map((d) => (
            <div key={d.state} className={`rounded-xl border ${d.borderColor} ${d.bgColor} p-4`}>
              <div className={`text-xs font-semibold uppercase tracking-wide ${d.textColor} mb-1`}>{d.zone}</div>
              <div className="text-xl font-bold text-white mb-1">{d.state}</div>
              <div className={`text-3xl font-mono font-black ${d.textColor} mb-2`}>{d.ratio}×</div>
              <div className="text-xs text-gray-400 mb-3">{d.description}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Clock |λ|</span>
                  <span className="font-mono">{d.clockLambda}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Target |λ|</span>
                  <span className="font-mono">{d.targetLambda}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Clock τ<sub>c</sub></span>
                  <span className="font-mono">{d.clockTau}h</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Target τ<sub>c</sub></span>
                  <span className="font-mono">{d.targetTau}h</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400 italic">{d.clinical}</div>
            </div>
          ))}
        </div>

        {/* Correlation Length Bar Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Temporal Correlation Lengths (τ<sub>c</sub>)</h2>
            <p className="text-gray-400 text-sm mb-4">τ<sub>c</sub> = −2/ln|λ| · Time to decay to 1/e of initial correlation</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={TAU_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} unit="h" />
                <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} width={130} />
                <Tooltip formatter={(v: any) => [`${v}h`, "τc"]} contentStyle={{ background: "#111827", border: "1px solid #374151" }} />
                <Bar dataKey="tau" radius={[0, 4, 4, 0]}>
                  {TAU_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Disease Trajectory</h2>
            <p className="text-gray-400 text-sm mb-4">
              Ratio collapses from 1.74× in healthy tissue to 0.43× in APC-KO cancer — a 4× change driven by E2F programme autonomy
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={TRAJECTORY_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 2.2]}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  label={{ value: "Ratio", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(v: any) => [`${v}×`, "Clock/Target ratio"]}
                  contentStyle={{ background: "#111827", border: "1px solid #374151" }}
                />
                <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="ratio"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={(props: any) => {
                    const d = TRAJECTORY_DATA[props.index];
                    return <circle key={props.index} cx={props.cx} cy={props.cy} r={7} fill={d?.color ?? "#8b5cf6"} stroke="#fff" strokeWidth={2} />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Red dashed line = parity (ratio = 1.0, clock = target autonomy)
            </p>
          </div>
        </div>

        {/* Clinical interpretation panel */}
        <div className="bg-gray-900 rounded-xl border border-purple-700/40 p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-300 mb-4">Clinical Interpretation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-emerald-400 font-semibold text-sm mb-2">🩺 Oncology</div>
              <p className="text-gray-300 text-sm">
                The APC-KO ratio (0.43×) means the E2F/proliferative programme has acquired longer temporal correlation length than the clock. A biopsy showing inverted ratio may signal pre-cancerous autonomous programme emergence before histological dysplasia is visible.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-blue-400 font-semibold text-sm mb-2">⏱️ Chronotherapy</div>
              <p className="text-gray-300 text-sm">
                Clock τ<sub>c</sub> = 3.9h in healthy tissue — the e-folding time of the clock's temporal autocorrelation. Drug scheduling timed to the descending phase of high-τ<sub>c</sub> target genes maximises the window between peak exposure and trough recovery.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-amber-400 font-semibold text-sm mb-2">🧠 Neurology / Psychiatry</div>
              <p className="text-gray-300 text-sm">
                Bmal1-KO ratio ≈ 1.0 means temporal gating is lost. APP/AD astrocytes show an analogous regime shift (real → complex eigenvalue roots). Patients with disrupted clock τ<sub>c</sub> may represent a distinct subtype responsive to chronobiotic interventions.
              </p>
            </div>
          </div>
        </div>

        {/* Formula panel */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-300 mb-3">Mathematical basis (Paper P)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs mb-1">Temporal correlation function</div>
              <div className="text-white">G(τ) = |λ|<sup>τ</sup> · cos(πτ/T₀)</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs mb-1">Correlation length (Convention A)</div>
              <div className="text-white">τ<sub>c</sub> = −2 / ln|λ|</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs mb-1">Tissue validation (13 tissues)</div>
              <div className="text-white">ρ = 0.794 (gap vs rhythmic genes)</div>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Source: Paper P (Temporal Correlation Length), 12 mouse tissues (GSE54650), baboon (GSE98965), organoid disease states (GSE157357).
            Clock τ<sub>c</sub> = 3.9h (12 tissues), target τ<sub>c</sub> = 2.0h, ratio 2.0× (95% CI [1.6, 2.4]), 13/13 tissues.
          </p>
        </div>

      </div>
    </div>
  );
}
