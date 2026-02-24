import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WebGLErrorBoundary } from "@/components/ErrorBoundary";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowLeft, GitMerge, Microscope, Dna, Activity, Zap, ChevronDown
} from "lucide-react";
import {
  type DiscoveryNode,
  type TissueRule,
  type CircadianConvergence,
  type WaddingtonConvergence,
  DISCOVERIES,
  SOURCE_COLORS,
  TISSUE_CODE_RULES,
  CIRCADIAN_CONVERGENCES,
  WADDINGTON_CONVERGENCES,
} from "./convergence-map-data";

function PulsingNode({ node, onClick, isSelected }: { node: DiscoveryNode; onClick: () => void; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const baseColor = SOURCE_COLORS[node.source];
  const color = new THREE.Color(baseColor);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 2 + node.position[1]) * 0.15;
      glowRef.current.scale.setScalar(scale);
    }
    if (meshRef.current && isSelected) {
      const s = 1 + Math.sin(clock.elapsedTime * 4) * 0.1;
      meshRef.current.scale.setScalar(s);
    }
  });

  const size = node.source === "convergence" ? 0.35 : 0.25;

  return (
    <group position={node.position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      <mesh ref={meshRef}>
        {node.source === "convergence" ? (
          <octahedronGeometry args={[size, 0]} />
        ) : (
          <sphereGeometry args={[size, 24, 24]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.2 : 0.6}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <Text
        position={[0, size + 0.35, 0]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="bottom"
        maxWidth={3}
        textAlign="center"
        outlineWidth={0.015}
        outlineColor="black"
      >
        {node.label}
      </Text>
      <Text
        position={[0, size + 0.15, 0]}
        fontSize={0.13}
        color={baseColor}
        anchorX="center"
        anchorY="bottom"
      >
        {node.year}
      </Text>
    </group>
  );
}

function AnimatedConnectionLine({ start, end, color, progress }: { start: [number, number, number]; end: [number, number, number]; color: string; progress: number }) {
  const points = useMemo(() => {
    const mid: [number, number, number] = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.5,
      (start[2] + end[2]) / 2,
    ];
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end)
    );
    const total = 40;
    const visibleCount = Math.floor(total * Math.min(progress, 1));
    return curve.getPoints(total).slice(0, Math.max(visibleCount, 2)).map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [start, end, progress]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.5}
    />
  );
}

function ConnectionLines({ selected, animProgress }: { selected: string | null; animProgress: number }) {
  const nodeMap = useMemo(() => {
    const m = new Map<string, DiscoveryNode>();
    DISCOVERIES.forEach(d => m.set(d.id, d));
    return m;
  }, []);

  const lines = useMemo(() => {
    const result: { start: [number, number, number]; end: [number, number, number]; color: string; highlight: boolean }[] = [];
    DISCOVERIES.forEach(node => {
      node.connections.forEach(targetId => {
        const target = nodeMap.get(targetId);
        if (target) {
          const isConvergence = node.source !== "convergence" && target.source === "convergence";
          const color = isConvergence ? SOURCE_COLORS.convergence : SOURCE_COLORS[node.source];
          const highlight = selected ? (node.id === selected || targetId === selected) : false;
          result.push({ start: node.position, end: target.position, color, highlight });
        }
      });
    });
    return result;
  }, [nodeMap, selected]);

  return (
    <>
      {lines.map((line, i) => (
        <AnimatedConnectionLine
          key={i}
          start={line.start}
          end={line.end}
          color={line.highlight ? "#ffffff" : line.color}
          progress={animProgress}
        />
      ))}
    </>
  );
}

function StreamLabel({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  return (
    <Text
      position={position}
      fontSize={0.35}
      color={color}
      anchorX="center"
      anchorY="bottom"
      fontWeight="bold"
      outlineWidth={0.02}
      outlineColor="black"
    >
      {label}
    </Text>
  );
}

function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 2]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#0f172a" transparent opacity={0.5} />
    </mesh>
  );
}

function Scene({ selected, onSelect, animProgress }: { selected: string | null; onSelect: (id: string | null) => void; animProgress: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 15, 10]} intensity={1.5} />
      <pointLight position={[-10, 15, -10]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[10, 15, -10]} intensity={0.8} color="#06b6d4" />

      <StreamLabel position={[-5, -0.6, -3]} label="Boman Lab" color="#3b82f6" />
      <StreamLabel position={[5, -0.6, -3]} label="PAR(2) Engine" color="#06b6d4" />
      <StreamLabel position={[0, -0.6, -1]} label="Convergence" color="#f59e0b" />

      <ConnectionLines selected={selected} animProgress={animProgress} />

      {DISCOVERIES.map(node => (
        <PulsingNode
          key={node.id}
          node={node}
          isSelected={selected === node.id}
          onClick={() => onSelect(selected === node.id ? null : node.id)}
        />
      ))}

      <GridFloor />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.4}
        minDistance={5}
        maxDistance={25}
        target={[0, 3.5, 2]}
      />
    </>
  );
}


function RuleNode({ position, label, color, ruleNum, isSelected, onClick }: {
  position: [number, number, number]; label: string; color: string; ruleNum?: number; isSelected: boolean; onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const col = new THREE.Color(color);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = isSelected ? 1 + Math.sin(clock.elapsedTime * 4) * 0.12 : 1;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={isSelected ? 1 : 0.4} metalness={0.2} roughness={0.5} />
      </mesh>
      {ruleNum !== undefined && (
        <Text position={[0, 0, 0.3]} fontSize={0.25} color="white" anchorX="center" anchorY="middle" fontWeight="bold">
          {String(ruleNum)}
        </Text>
      )}
      <Text position={[0, 0.55, 0]} fontSize={0.18} color="white" anchorX="center" anchorY="bottom" maxWidth={3} textAlign="center" outlineWidth={0.01} outlineColor="black">
        {label}
      </Text>
    </group>
  );
}

function RuleConnectionLines({ selectedRule, animProgress }: { selectedRule: number | null; animProgress: number }) {
  const lines = useMemo(() => {
    return TISSUE_CODE_RULES.map(r => ({
      start: r.bomanPos,
      end: r.par2Pos,
      highlight: selectedRule === r.rule,
    }));
  }, [selectedRule]);

  return (
    <>
      {lines.map((line, i) => (
        <AnimatedConnectionLine
          key={i}
          start={line.start}
          end={line.end}
          color={line.highlight ? "#f59e0b" : "#475569"}
          progress={animProgress}
        />
      ))}
    </>
  );
}

function RulesScene({ selectedRule, onSelectRule, animProgress }: {
  selectedRule: number | null; onSelectRule: (r: number | null) => void; animProgress: number;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[8, 12, 8]} intensity={1.2} />
      <pointLight position={[-8, 12, -8]} intensity={0.6} color="#3b82f6" />
      <pointLight position={[8, 12, -8]} intensity={0.6} color="#06b6d4" />

      <StreamLabel position={[-4, -1.2, 0]} label="Tissue Code (Boman 2025)" color="#3b82f6" />
      <StreamLabel position={[4, -1.2, 0]} label="PAR(2) Translation" color="#06b6d4" />

      <RuleConnectionLines selectedRule={selectedRule} animProgress={animProgress} />

      {TISSUE_CODE_RULES.map(r => (
        <group key={r.id}>
          <RuleNode
            position={r.bomanPos}
            label={r.bomanLabel}
            color="#3b82f6"
            ruleNum={r.rule}
            isSelected={selectedRule === r.rule}
            onClick={() => onSelectRule(selectedRule === r.rule ? null : r.rule)}
          />
          <RuleNode
            position={r.par2Pos}
            label={r.par2Label}
            color="#06b6d4"
            isSelected={selectedRule === r.rule}
            onClick={() => onSelectRule(selectedRule === r.rule ? null : r.rule)}
          />
        </group>
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={5}
        maxDistance={20}
        target={[0, 3.2, 0]}
      />
    </>
  );
}

function FiveRulesSection() {
  const [selectedRule, setSelectedRule] = useState<number | null>(null);
  const [rulesAnimProgress, setRulesAnimProgress] = useState(0);
  const rulesAnimRef = useRef<number | null>(null);

  const startRulesAnim = useCallback(() => {
    setRulesAnimProgress(0);
    let start: number | null = null;
    const duration = 2500;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setRulesAnimProgress(Math.min(elapsed / duration, 1));
      if (elapsed < duration) rulesAnimRef.current = requestAnimationFrame(step);
    };
    if (rulesAnimRef.current) cancelAnimationFrame(rulesAnimRef.current);
    rulesAnimRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const timer = setTimeout(startRulesAnim, 500);
    return () => { clearTimeout(timer); if (rulesAnimRef.current) cancelAnimationFrame(rulesAnimRef.current); };
  }, [startRulesAnim]);

  const activeRule = selectedRule ? TISSUE_CODE_RULES.find(r => r.rule === selectedRule) : null;

  return (
    <>
      <div className="mb-6 mt-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Zap size={24} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white" data-testid="text-five-rules-heading">
              The Five Biological Rules → PAR(2) Translation
            </h2>
            <p className="text-sm text-muted-foreground">
              From Boman et al., <em>Biology of the Cell</em> (Wiley, July 2025) — DOI: 10.1111/boc.70017
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Boman's team identified five mathematical laws — a "tissue code" — that encode how colonic epithelium maintains precise cellular organization during continuous renewal. Each rule maps onto an independent AR(2) observation. The PAR(2) translations below are associative — they show where the equation's outputs are consistent with Boman's rules, not that the equation proves them.
        </p>
      </div>

      <Card className="bg-slate-900/80 border-purple-500/30 mb-6" data-testid="card-five-rules-3d">
        <CardContent className="p-0">
          <div className="h-[500px] w-full rounded-lg overflow-hidden" data-testid="canvas-rules-3d">
            <WebGLErrorBoundary>
            <Canvas camera={{ position: [0, 4, 14], fov: 45 }} onPointerMissed={() => setSelectedRule(null)}>
              <RulesScene selectedRule={selectedRule} onSelectRule={setSelectedRule} animProgress={rulesAnimProgress} />
            </Canvas>
            </WebGLErrorBoundary>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-xs text-slate-400">Tissue Code Rule (Boman)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-cyan-500" />
          <span className="text-xs text-slate-400">PAR(2) Translation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          <span className="text-xs text-slate-400">Selected Connection</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs ml-auto gap-1" onClick={startRulesAnim} data-testid="button-replay-rules">
          <Zap size={12} /> Replay
        </Button>
      </div>

      {activeRule && (
        <Card className="bg-slate-900/80 border-purple-500/30 mb-6" data-testid={`rule-detail-${activeRule.rule}`}>
          <CardContent className="p-0">
            <div className="bg-slate-800/50 px-5 py-3 flex items-center gap-3 border-b border-slate-700/50">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
                {activeRule.rule}
              </div>
              <p className="text-sm font-semibold text-white flex-1">Rule {activeRule.rule}: {activeRule.bomanLabel}</p>
              {activeRule.speculative && (
                <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 text-[10px] mr-1">SPECULATIVE TRANSLATION</Badge>
              )}
              <Badge className={`${activeRule.confidence >= 80 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : activeRule.confidence >= 70 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-orange-500/15 text-orange-400 border-orange-500/30"} text-xs`}>
                {activeRule.confidence}% translation confidence
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
              <div className="p-5 bg-blue-500/[0.03]">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Microscope size={12} /> Boman — Tissue Code
                </p>
                <p className="text-sm font-medium text-white mb-1.5">{activeRule.bomanLabel}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{activeRule.bomanDetail}</p>
                <p className="text-[10px] text-slate-400 italic mt-2">Boman et al., Biology of the Cell (Wiley), July 2025</p>
              </div>
              <div className="p-5 bg-cyan-500/[0.03]">
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Dna size={12} /> PAR(2) Translation
                </p>
                <p className="text-sm font-medium text-white mb-1.5">{activeRule.par2Label}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{activeRule.par2Detail}</p>
                <p className="text-[10px] text-emerald-400/70 font-mono">{activeRule.par2Evidence}</p>
                <Link href={activeRule.link} className="text-[10px] text-cyan-500 hover:underline mt-1 inline-block">View full analysis →</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!activeRule && (
        <div className="grid sm:grid-cols-5 gap-3 mb-6">
          {TISSUE_CODE_RULES.map(r => (
            <button
              key={r.id}
              className="text-left p-3 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:border-purple-500/40 transition-colors"
              onClick={() => setSelectedRule(r.rule)}
              data-testid={`button-rule-${r.rule}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
                  {r.rule}
                </div>
                <Badge className={`${r.confidence >= 80 ? "bg-emerald-500/10 text-emerald-400" : r.confidence >= 70 ? "bg-amber-500/10 text-amber-400" : "bg-orange-500/10 text-orange-400"} text-[9px]`}>
                  {r.confidence}%
                </Badge>
              </div>
              <p className="text-xs font-medium text-white">{r.bomanLabel}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">→ {r.par2Label}</p>
              {r.speculative && <p className="text-[9px] text-orange-400/70 mt-1 uppercase tracking-wider">Speculative Translation</p>}
            </button>
          ))}
        </div>
      )}

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-8">
        <p className="text-xs text-amber-400 font-semibold mb-1">Important Context</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Boman's five rules were discovered through mathematical modeling of crypt renewal dynamics using discrete and continuous ODE models, validated against immunohistochemistry and lineage-tracing data. The PAR(2) translations are independent observations from fitting a two-coefficient regression to publicly available time-series data. The mappings above show where AR(2) outputs are <em>consistent with</em> each tissue code rule — they do not constitute independent proof. Both approaches could share biases (e.g., focus on colonic tissue, similar gene panels). Prospective experimental testing is needed to confirm these associations.
        </p>
      </div>
    </>
  );
}


function CircadianNode({ position, label, color, num, isSelected, onClick }: {
  position: [number, number, number]; label: string; color: string; num?: number; isSelected: boolean; onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const col = new THREE.Color(color);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = isSelected ? 1 + Math.sin(clock.elapsedTime * 4) * 0.12 : 1;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={isSelected ? 1 : 0.4} metalness={0.3} roughness={0.4} />
      </mesh>
      {num !== undefined && (
        <Text position={[0, 0, 0.4]} fontSize={0.22} color="white" anchorX="center" anchorY="middle" fontWeight="bold">
          {String(num)}
        </Text>
      )}
      <Text position={[0, 0.55, 0]} fontSize={0.16} color="white" anchorX="center" anchorY="bottom" maxWidth={3} textAlign="center" outlineWidth={0.01} outlineColor="black">
        {label}
      </Text>
    </group>
  );
}

function CircadianConnectionLines({ selectedNum, animProgress }: { selectedNum: number | null; animProgress: number }) {
  return (
    <>
      {CIRCADIAN_CONVERGENCES.map((cc) => {
        const isActive = selectedNum === cc.num;
        const idx = cc.num - 1;
        const reveal = Math.max(0, Math.min(1, (animProgress - idx * 0.12) / 0.25));
        if (reveal <= 0) return null;

        const midX = 0;
        const midY = (cc.canonPos[1] + cc.par2Pos[1]) / 2;
        const points: [number, number, number][] = [
          cc.canonPos,
          [midX, midY, reveal < 1 ? cc.canonPos[2] : 0],
          [cc.par2Pos[0] * reveal, cc.par2Pos[1], cc.par2Pos[2]],
        ];

        return (
          <Line
            key={cc.id}
            points={points}
            color={isActive ? "#f59e0b" : cc.confidence >= 85 ? "#10b981" : cc.confidence >= 75 ? "#eab308" : "#f97316"}
            lineWidth={isActive ? 3 : 1.5}
            opacity={isActive ? 1 : 0.5}
            transparent
          />
        );
      })}
    </>
  );
}

function CircadianScene({ selectedNum, onSelectNum, animProgress }: { selectedNum: number | null; onSelectNum: (n: number | null) => void; animProgress: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 12, 8]} intensity={1.2} />
      <pointLight position={[-8, 8, -5]} intensity={0.5} color="#f59e0b" />

      <Text position={[-4, -1.2, 0]} fontSize={0.3} color="#f59e0b" anchorX="center" fontWeight="bold" outlineWidth={0.015} outlineColor="black">
        Circadian Canon
      </Text>
      <Text position={[-4, -1.7, 0]} fontSize={0.16} color="#94a3b8" anchorX="center" outlineWidth={0.01} outlineColor="black">
        Takahashi / Hogenesch
      </Text>
      <Text position={[4, -1.2, 0]} fontSize={0.3} color="#06b6d4" anchorX="center" fontWeight="bold" outlineWidth={0.015} outlineColor="black">
        PAR(2) Engine
      </Text>
      <Text position={[4, -1.7, 0]} fontSize={0.16} color="#94a3b8" anchorX="center" outlineWidth={0.01} outlineColor="black">
        Independent Discovery
      </Text>

      <CircadianConnectionLines selectedNum={selectedNum} animProgress={animProgress} />

      {CIRCADIAN_CONVERGENCES.map((cc) => (
        <group key={cc.id}>
          <CircadianNode
            position={cc.canonPos}
            label={cc.canonLabel}
            color="#f59e0b"
            num={cc.num}
            isSelected={selectedNum === cc.num}
            onClick={() => onSelectNum(selectedNum === cc.num ? null : cc.num)}
          />
          <CircadianNode
            position={cc.par2Pos}
            label={cc.par2Label}
            color="#06b6d4"
            isSelected={selectedNum === cc.num}
            onClick={() => onSelectNum(selectedNum === cc.num ? null : cc.num)}
          />
        </group>
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={5}
        maxDistance={25}
        target={[0, 4, 0]}
      />
    </>
  );
}

function CircadianCanonSection() {
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [circAnimProgress, setCircAnimProgress] = useState(0);
  const circAnimRef = useRef<number | null>(null);

  const startCircAnim = useCallback(() => {
    setCircAnimProgress(0);
    let start: number | null = null;
    const duration = 3000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setCircAnimProgress(Math.min(elapsed / duration, 1));
      if (elapsed < duration) circAnimRef.current = requestAnimationFrame(step);
    };
    if (circAnimRef.current) cancelAnimationFrame(circAnimRef.current);
    circAnimRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const timer = setTimeout(startCircAnim, 800);
    return () => { clearTimeout(timer); if (circAnimRef.current) cancelAnimationFrame(circAnimRef.current); };
  }, [startCircAnim]);

  const activeCC = selectedNum ? CIRCADIAN_CONVERGENCES.find(cc => cc.num === selectedNum) : null;

  return (
    <>
      <div className="mb-6 mt-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Activity size={24} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white" data-testid="text-circadian-canon-heading">
              Circadian Canon → PAR(2) Convergence
            </h2>
            <p className="text-sm text-muted-foreground">
              Takahashi & Hogenesch — two decades of circadian biology independently rediscovered by one equation
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Joseph Takahashi (UT Southwestern) defined the molecular architecture of mammalian circadian clocks. John Hogenesch (Cincinnati) mapped genome-wide circadian expression across tissues and species. Together their work established the circadian canon — the foundational principles of how biological clocks organize gene expression. The six convergence points below show where AR(2) eigenvalue analysis independently recovers the same principles from time-series data alone.
        </p>
      </div>

      <Card className="bg-slate-900/80 border-amber-500/30 mb-6" data-testid="card-circadian-3d">
        <CardContent className="p-0">
          <div className="h-[550px] w-full rounded-lg overflow-hidden" data-testid="canvas-circadian-3d">
            <WebGLErrorBoundary>
            <Canvas camera={{ position: [0, 5, 16], fov: 45 }} onPointerMissed={() => setSelectedNum(null)}>
              <CircadianScene selectedNum={selectedNum} onSelectNum={setSelectedNum} animProgress={circAnimProgress} />
            </Canvas>
            </WebGLErrorBoundary>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-400">Circadian Canon (Published)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <span className="text-xs text-slate-400">PAR(2) Independent Discovery</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-400">≥85% confidence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-xs text-slate-400">75–84%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-xs text-slate-400">&lt;75%</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs ml-auto gap-1" onClick={startCircAnim} data-testid="button-replay-circadian">
          <Zap size={12} /> Replay
        </Button>
      </div>

      {activeCC && (
        <Card className="bg-slate-900/80 border-amber-500/30 mb-6" data-testid={`circadian-detail-${activeCC.num}`}>
          <CardContent className="p-0">
            <div className="bg-slate-800/50 px-5 py-3 flex items-center gap-3 border-b border-slate-700/50">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                {activeCC.num}
              </div>
              <p className="text-sm font-semibold text-white flex-1">{activeCC.canonLabel}</p>
              <Badge className={`${activeCC.confidence >= 85 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : activeCC.confidence >= 75 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-orange-500/15 text-orange-400 border-orange-500/30"} text-xs`}>
                {activeCC.confidence}% convergence confidence
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
              <div className="p-5 bg-amber-500/[0.03]">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity size={12} /> Circadian Canon
                </p>
                <p className="text-sm font-medium text-white mb-1.5">{activeCC.canonLabel}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{activeCC.canonDetail}</p>
                <p className="text-[10px] text-slate-400 italic mt-2">{activeCC.canonSource}</p>
              </div>
              <div className="p-5 bg-cyan-500/[0.03]">
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Dna size={12} /> PAR(2) Discovery
                </p>
                <p className="text-sm font-medium text-white mb-1.5">{activeCC.par2Label}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{activeCC.par2Detail}</p>
                <p className="text-[10px] text-emerald-400/70 font-mono">{activeCC.par2Evidence}</p>
                <Link href={activeCC.link} className="text-[10px] text-cyan-500 hover:underline mt-1 inline-block">View full analysis →</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!activeCC && (
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {CIRCADIAN_CONVERGENCES.map(cc => (
            <button
              key={cc.id}
              className="text-left p-3 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:border-amber-500/40 transition-colors"
              onClick={() => setSelectedNum(cc.num)}
              data-testid={`button-circadian-${cc.num}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                  {cc.num}
                </div>
                <Badge className={`${cc.confidence >= 85 ? "bg-emerald-500/10 text-emerald-400" : cc.confidence >= 75 ? "bg-amber-500/10 text-amber-400" : "bg-orange-500/10 text-orange-400"} text-[9px]`}>
                  {cc.confidence}%
                </Badge>
              </div>
              <p className="text-xs font-medium text-white">{cc.canonLabel}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">→ {cc.par2Label}</p>
            </button>
          ))}
        </div>
      )}

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-8">
        <p className="text-xs text-amber-400 font-semibold mb-1">Scientific Context</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Takahashi's TTFL architecture and Hogenesch's genome-wide circadian atlas represent the foundational canon of circadian biology, established through decades of mutagenesis screens, ChIP-seq, RNA-seq time courses, and cross-species comparisons. The PAR(2) convergence points above show where a single autoregressive equation, applied to publicly available data, recovers principles consistent with this canon. However, consistency is not proof — AR(2) is a statistical tool that measures temporal autocorrelation. It cannot distinguish whether high persistence reflects circadian regulation specifically vs. other slow-changing processes. The convergences are strongest where PAR(2) predictions align with specific published values (e.g., clock gene rankings) and weakest where the mapping is conceptual rather than quantitative.
        </p>
      </div>
    </>
  );
}


function WaddingtonSection() {
  const [expandedNum, setExpandedNum] = useState<number | null>(null);

  return (
    <>
      <div className="mb-6 mt-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Zap size={24} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white" data-testid="text-waddington-heading">
              Waddington's Epigenetic Landscape → Root-Space Geometry
            </h2>
            <p className="text-sm text-muted-foreground">
              A 1957 metaphor made quantitative — independently recovered by AR(2) parameter mapping
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Conrad Waddington proposed that cell fates are valleys in a landscape shaped by gene regulatory networks. Modern formalizations (Huang 2012, Wang 2011, Ferrell 2012) made this metaphor mathematically rigorous — valleys are attractors, ridges are barriers, and bifurcations are fate decisions. The AR(2) root-space independently produces a structured parameter landscape with clusters, voids, and boundaries that parallel Waddington's framework — from time-series regression alone, without knowledge of underlying regulatory networks. The key insight isn't that these parallels exist (both frameworks describe dynamics, so structural similarities are expected), but that AR(2) recovers landscape-like structure from regression coefficients alone.
        </p>
      </div>

      <Card className="bg-slate-900/80 border-purple-500/30 mb-6" data-testid="card-waddington-linear">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
            <div className="px-5 py-3 bg-purple-500/[0.04] border-b border-slate-700/50">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Waddington Landscape</p>
              <p className="text-[10px] text-slate-400">Cell Fate Framework (1957–2025)</p>
            </div>
            <div className="flex items-center justify-center px-4 border-b border-slate-700/50 bg-slate-800/30">
              <p className="text-[10px] text-slate-400 font-medium">Confidence</p>
            </div>
            <div className="px-5 py-3 bg-cyan-500/[0.04] border-b border-slate-700/50">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">PAR(2) Root-Space</p>
              <p className="text-[10px] text-slate-400">Independent Discovery</p>
            </div>
          </div>

          {WADDINGTON_CONVERGENCES.map((wc, i) => {
            const isExpanded = expandedNum === wc.num;
            const isLast = i === WADDINGTON_CONVERGENCES.length - 1;

            return (
              <div key={wc.id}>
                <button
                  className={`w-full grid grid-cols-[1fr_auto_1fr] items-center transition-colors hover:bg-slate-800/40 ${!isLast || isExpanded ? "border-b border-slate-700/30" : ""}`}
                  onClick={() => setExpandedNum(isExpanded ? null : wc.num)}
                  data-testid={`button-waddington-${wc.num}`}
                >
                  <div className="px-5 py-3.5 text-left flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0 border border-purple-500/20">
                      {wc.num}
                    </div>
                    <p className="text-sm text-white font-medium leading-tight">{wc.wadLabel}</p>
                  </div>

                  <div className="px-4 flex flex-col items-center gap-1">
                    <div className="w-16 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${wc.confidence >= 80 ? "bg-emerald-500" : wc.confidence >= 75 ? "bg-amber-500" : "bg-orange-500"}`}
                        style={{ width: `${wc.confidence}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${wc.confidence >= 80 ? "text-emerald-400" : wc.confidence >= 75 ? "text-amber-400" : "text-orange-400"}`}>
                      {wc.confidence}%
                    </span>
                  </div>

                  <div className="px-5 py-3.5 text-left flex items-center gap-3">
                    <p className="text-sm text-white font-medium leading-tight">{wc.par2Label}</p>
                    <ChevronDown size={14} className={`text-slate-400 shrink-0 ml-auto transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className={`grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700/30 ${!isLast ? "border-b border-slate-700/30" : ""}`}>
                    <div className="p-5 bg-purple-500/[0.03]">
                      <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Zap size={12} /> Waddington Framework
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">{wc.wadDetail}</p>
                      <p className="text-[10px] text-slate-400 italic mt-2">{wc.wadSource}</p>
                    </div>
                    <div className="p-5 bg-cyan-500/[0.03]">
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Dna size={12} /> PAR(2) Root-Space
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">{wc.par2Detail}</p>
                      <p className="text-[10px] text-emerald-400/70 font-mono">{wc.par2Evidence}</p>
                      <Link href={wc.link} className="text-[10px] text-cyan-500 hover:underline mt-1 inline-block">View full analysis →</Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4 mb-8">
        <p className="text-xs text-purple-400 font-semibold mb-1">Important Caveat — Conceptual Analogy, Not Causal Proof</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Waddington's landscape describes <span className="text-purple-300">cell-level</span> fate decisions through gene regulatory network dynamics. AR(2) root-space describes <span className="text-cyan-300">gene-level</span> temporal dynamics from time-series regression. The structural parallels — clusters/valleys, voids/ridges, boundaries/barriers — are conceptually striking, but the two frameworks operate at different levels of biological organization. A dynamical systems researcher would expect some parallels since both describe dynamics — the non-obvious contribution is that AR(2) recovers these structures from regression alone, without network knowledge. Formal mathematical proof connecting the two frameworks remains an open problem. These mappings are associative, not causal.
        </p>
      </div>
    </>
  );
}

function DetailPanel({ node }: { node: DiscoveryNode }) {
  const sourceLabel = node.source === "boman" ? "Boman Lab (Published)" : node.source === "par2" ? "PAR(2) Engine (Independent)" : "Convergence Point";
  const sourceColor = node.source === "boman" ? "text-blue-400" : node.source === "par2" ? "text-cyan-400" : "text-amber-400";
  const sourceBg = node.source === "boman" ? "bg-blue-500/10 border-blue-500/30" : node.source === "par2" ? "bg-cyan-500/10 border-cyan-500/30" : "bg-amber-500/10 border-amber-500/30";

  return (
    <div className={`border rounded-lg p-4 ${sourceBg}`} data-testid={`detail-${node.id}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-white text-lg">{node.label}</h3>
          <p className={`text-xs font-medium ${sourceColor}`}>{sourceLabel} — {node.year}</p>
        </div>
        {node.confidence && (
          <Badge className={`${node.confidence >= 80 ? "bg-emerald-500/20 text-emerald-400" : node.confidence >= 60 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
            {node.confidence}% confidence
          </Badge>
        )}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{node.detail}</p>
      {node.citation && (
        <p className="text-xs text-slate-400 mt-2 italic">{node.citation}</p>
      )}
    </div>
  );
}

export default function ConvergenceMap() {
  const [selected, setSelected] = useState<string | null>(null);
  const [animProgress, setAnimProgress] = useState(0);
  const animRef = useRef<number | null>(null);

  const selectedNode = useMemo(() => DISCOVERIES.find(d => d.id === selected) ?? null, [selected]);

  const connectedNodes = useMemo(() => {
    if (!selected) return [];
    const node = DISCOVERIES.find(d => d.id === selected);
    if (!node) return [];
    const connectedIds = new Set(node.connections);
    DISCOVERIES.forEach(d => {
      if (d.connections.includes(selected)) connectedIds.add(d.id);
    });
    return DISCOVERIES.filter(d => connectedIds.has(d.id));
  }, [selected]);

  const startAnimation = useCallback(() => {
    setAnimProgress(0);
    let start: number | null = null;
    const duration = 3000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setAnimProgress(Math.min(elapsed / duration, 1));
      if (elapsed < duration) {
        animRef.current = requestAnimationFrame(step);
      }
    };
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    startAnimation();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [startAnimation]);

  const bomanNodes = DISCOVERIES.filter(d => d.source === "boman");
  const par2Nodes = DISCOVERIES.filter(d => d.source === "par2");
  const convergenceNodes = DISCOVERIES.filter(d => d.source === "convergence");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" data-testid="convergence-map-page">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="link-back">
              <ArrowLeft size={14} /> Home
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <GitMerge size={24} className="text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="text-heading">
                Convergence Map
              </h1>
              <p className="text-sm text-muted-foreground">
                Two independent research programs — same biological truth
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">Boman Lab: 5 rules</Badge>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">Circadian Canon: 6 points</Badge>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">Waddington: 5 points</Badge>
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">PAR(2): independent rediscovery</Badge>
          </div>
        </div>

        <Card className="bg-slate-900/80 border-slate-700 mb-6">
          <CardContent className="p-0">
            <div className="h-[550px] w-full rounded-lg overflow-hidden" data-testid="canvas-3d">
              <WebGLErrorBoundary>
              <Canvas
                camera={{ position: [12, 8, 12], fov: 50 }}
                onPointerMissed={() => setSelected(null)}
              >
                <Scene selected={selected} onSelect={setSelected} animProgress={animProgress} />
              </Canvas>
              </WebGLErrorBoundary>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-400">Boman Lab (Published)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span className="text-xs text-slate-400">PAR(2) Engine (Independent)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500 rotate-45" style={{ width: 10, height: 10 }} />
            <span className="text-xs text-slate-400">Convergence Points</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs ml-auto gap-1" onClick={startAnimation} data-testid="button-replay">
            <Zap size={12} /> Replay Animation
          </Button>
        </div>

        {selectedNode && (
          <div className="mb-6 space-y-3" data-testid="detail-panel">
            <DetailPanel node={selectedNode} />
            {connectedNodes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Connected Discoveries</p>
                {connectedNodes.map(n => (
                  <DetailPanel key={n.id} node={n} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                <Microscope size={16} /> Boman Lab Stream
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Published research (2001–2025)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bomanNodes.map(n => (
                <button
                  key={n.id}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selected === n.id ? "bg-blue-500/15 border-blue-500/40" : "bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30"}`}
                  onClick={() => setSelected(selected === n.id ? null : n.id)}
                  data-testid={`button-node-${n.id}`}
                >
                  <p className="text-sm font-medium text-white">{n.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.year}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                <GitMerge size={16} /> Convergence Points
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Where independent paths reach the same conclusion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {convergenceNodes.map(n => (
                <button
                  key={n.id}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selected === n.id ? "bg-amber-500/15 border-amber-500/40" : "bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30"}`}
                  onClick={() => setSelected(selected === n.id ? null : n.id)}
                  data-testid={`button-node-${n.id}`}
                >
                  <p className="text-sm font-medium text-white">{n.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.detail.slice(0, 80)}...</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-cyan-500/5 border-cyan-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
                <Dna size={16} /> PAR(2) Engine Stream
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Independent discoveries (2024–2025)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {par2Nodes.map(n => (
                <button
                  key={n.id}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selected === n.id ? "bg-cyan-500/15 border-cyan-500/40" : "bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30"}`}
                  onClick={() => setSelected(selected === n.id ? null : n.id)}
                  data-testid={`button-node-${n.id}`}
                >
                  <p className="text-sm font-medium text-white">{n.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.year}{n.confidence ? ` — ${n.confidence}% confidence` : ""}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <FiveRulesSection />

        <CircadianCanonSection />

        <WaddingtonSection />

        <Card className="bg-slate-900/80 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity size={18} className="text-amber-400" />
              Why Convergence Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong className="text-white">Independent convergence is the strongest form of scientific validation.</strong> When multiple research programs — using completely different methodologies, data types, and theoretical frameworks — arrive at structurally similar conclusions, the probability that all are wrong drops dramatically. This page documents convergence across four independent frameworks.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                <p className="font-semibold text-blue-400 mb-2 flex items-center gap-2"><Microscope size={14} /> Boman Lab — Tissue Renewal</p>
                <p className="text-xs text-slate-400">Population dynamics modeling, immunohistochemistry, stem cell counting, lineage tracing, Western blots, mouse models. Decades of wet-lab evidence establishing five rules of tissue renewal.</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                <p className="font-semibold text-amber-400 mb-2 flex items-center gap-2"><Activity size={14} /> Takahashi / Hogenesch — Circadian Canon</p>
                <p className="text-xs text-slate-400">TTFL mutagenesis screens, ChIP-seq, RNA-seq time courses, cross-species comparisons. The foundational architecture of circadian biology — 43% genome-wide rhythmicity, tissue-specific programs, chronotherapy targets.</p>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                <p className="font-semibold text-purple-400 mb-2 flex items-center gap-2"><Zap size={14} /> Waddington — Epigenetic Landscape</p>
                <p className="text-xs text-slate-400">Cell fate as valleys in a potential landscape. Formalized mathematically (Huang 2012, Ferrell 2012) through dynamical systems theory — attractors, barriers, bifurcations. A framework spanning developmental biology for 70 years.</p>
              </div>
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
                <p className="font-semibold text-cyan-400 mb-2 flex items-center gap-2"><Dna size={14} /> PAR(2) — Time-Series Regression</p>
                <p className="text-xs text-slate-400">One equation applied to publicly available time-series data. No wet lab, no antibodies, no microscopes. Pure mathematical extraction of temporal dynamics from existing datasets — producing clusters, voids, hierarchies, and boundaries.</p>
              </div>
            </div>
            <p>
              The convergence points documented above show where these four approaches agree — not because any copied the others, but because all are measuring aspects of the same underlying biological reality through different lenses. Some parallels are direct and quantitative (e.g., clock gene hierarchy rankings). Others are structural and conceptual (e.g., root-space voids resembling Waddington ridges). The confidence scores on each convergence point reflect this distinction.
            </p>
            <p className="text-amber-400 text-xs">
              Caveat: convergence increases confidence in shared conclusions but does not prove them. All approaches could share systematic biases (e.g., gene panel selection, tissue choice, temporal sampling). The Waddington and Five Rules mappings involve conceptual analogies across different organizational levels, not direct measurements of the same quantity. True validation requires prospective prediction and independent experimental confirmation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
