import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "wouter";
import { WebGLErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Info, Play, Pause, Columns2, Scissors, RotateCcw, FlaskConical, Stethoscope, Microscope, Lightbulb, ShieldAlert } from "lucide-react";
import HowTo from "@/components/HowTo";

interface CellData {
  id: number;
  baseAngle: number;
  layerIndex: number;
  layerT: number;
  compartment: "stem" | "ta" | "diff";
  compartmentLabel: string;
  bomanPhase: string;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const CRYPT_HEIGHT = 7.0;
const BASE_RADIUS = 0.3;
const MID_RADIUS = 0.45;
const TOP_RADIUS = 0.65;
const TOTAL_LAYERS = 25;

const STEM_LAYER_COUNT = 1;
const NORMAL_TA_TOP_LAYER = 17;

function getCryptRadius(t: number): number {
  if (t < 0.08) {
    return BASE_RADIUS;
  } else if (t < 0.85) {
    return BASE_RADIUS + (MID_RADIUS - BASE_RADIUS) * ((t - 0.08) / 0.77);
  } else {
    const flare = (t - 0.85) / 0.15;
    return MID_RADIUS + (TOP_RADIUS - MID_RADIUS) * flare;
  }
}

function getCellsPerLayer(layerIndex: number): number {
  if (layerIndex === 0) return 5;
  if (layerIndex <= 3) return 9;
  if (layerIndex <= 16) return 10;
  return 11;
}

function getCompartmentBoundary(gapFraction: number): number {
  const normalBoundary = NORMAL_TA_TOP_LAYER;
  const expansion = Math.round((1 - gapFraction) * 6);
  return Math.min(TOTAL_LAYERS - 1, normalBoundary + expansion);
}

function getStemExpansion(gapFraction: number): number {
  return STEM_LAYER_COUNT + Math.round((1 - gapFraction) * 2);
}

function computeCellPosition(
  cell: CellData,
  gapFraction: number,
  time: number,
  sliceAngle: number | null
): { pos: [number, number, number]; color: string; scale: number; opacity: number; visible: boolean } {
  const t = cell.layerT;
  const y = -CRYPT_HEIGHT / 2 + t * CRYPT_HEIGHT;
  const radius = getCryptRadius(t);

  if (sliceAngle !== null) {
    const na = ((cell.baseAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (na > sliceAngle && na < sliceAngle + Math.PI) {
      return { pos: [0, 0, 0], color: "#000", scale: 0, opacity: 0, visible: false };
    }
  }

  const stemBoundary = getStemExpansion(gapFraction);
  const taBoundary = getCompartmentBoundary(gapFraction);

  let compartment: "stem" | "ta" | "diff";
  if (cell.layerIndex < stemBoundary) compartment = "stem";
  else if (cell.layerIndex < taBoundary) compartment = "ta";
  else compartment = "diff";

  const jitter = seededRandom(cell.id * 17 + cell.layerIndex * 31) * 0.03;
  const x = Math.cos(cell.baseAngle) * (radius + jitter);
  const z = Math.sin(cell.baseAngle) * (radius + jitter);

  let color: string;
  let scale = 1.0;
  let opacity = 0.9;

  if (compartment === "stem") {
    color = gapFraction > 0.3 ? "#22c55e" : "#ef4444";
    scale = 1.3;
    opacity = 0.95;
  } else if (compartment === "ta") {
    const taOvergrowth = (1 - gapFraction) * 0.25;
    if (cell.bomanPhase === "G1 phase") color = "#3b82f6";
    else if (cell.bomanPhase === "S phase") color = "#8b5cf6";
    else if (cell.bomanPhase === "G2 phase") color = "#06b6d4";
    else color = "#f59e0b";
    if (gapFraction <= 0.5) {
      color = gapFraction > 0.2 ? color : "#ef4444";
    }
    scale = 1.0 + taOvergrowth;
    opacity = 0.85;
  } else {
    const shrink = (1 - gapFraction) * 0.3;
    color = "#94a3b8";
    scale = 0.85 - shrink;
    opacity = 0.7 + gapFraction * 0.2;
  }

  return { pos: [x, y, z], color, scale, opacity, visible: true };
}

function AnimatedCell({
  cell,
  gapFraction,
  sliceAngle,
  isHovered,
  isTracked,
  interactive,
  onHover,
  onUnhover,
  onClick,
}: {
  cell: CellData;
  gapFraction: number;
  sliceAngle: number | null;
  isHovered: boolean;
  isTracked: boolean;
  interactive: boolean;
  onHover: () => void;
  onUnhover: () => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const computed = computeCellPosition(cell, gapFraction, time, sliceAngle);
    if (!meshRef.current) return;

    if (!computed.visible) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    meshRef.current.position.set(computed.pos[0], computed.pos[1], computed.pos[2]);

    const glowScale = isHovered ? 1.5 : isTracked ? 1.3 : 1.0;
    const baseSize = 0.07 * computed.scale * glowScale;
    meshRef.current.scale.setScalar(baseSize / 0.07);

    if (matRef.current) {
      matRef.current.color.set(isTracked ? "#ffffff" : computed.color);
      matRef.current.opacity = computed.opacity;
      if (isHovered || isTracked) {
        matRef.current.emissive.set(computed.color);
        matRef.current.emissiveIntensity = isHovered ? 0.8 : 0.5;
      } else {
        matRef.current.emissive.set("#000000");
        matRef.current.emissiveIntensity = 0;
      }
    }
  });

  const stemBoundary = getStemExpansion(gapFraction);
  const taBoundary = getCompartmentBoundary(gapFraction);
  let currentCompartment: string;
  if (cell.layerIndex < stemBoundary) currentCompartment = "Stem Cell (LGR5+/CBC)";
  else if (cell.layerIndex < taBoundary) currentCompartment = "Transit-Amplifying";
  else currentCompartment = "Differentiated";

  return (
    <mesh
      ref={meshRef}
      onPointerOver={interactive ? (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(); } : undefined}
      onPointerOut={interactive ? onUnhover : undefined}
      onClick={interactive ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); } : undefined}
    >
      <sphereGeometry args={[0.07, 10, 10]} />
      <meshStandardMaterial ref={matRef} transparent roughness={0.4} metalness={0.1} />
      {isHovered && interactive && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="bg-slate-900/95 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap shadow-xl backdrop-blur-sm">
            <div className="font-semibold text-sm mb-1">{currentCompartment}</div>
            <div className="text-muted-foreground">Layer: {cell.layerIndex + 1}/{TOTAL_LAYERS}</div>
            <div className="text-muted-foreground">Boman phase: {cell.bomanPhase}</div>
            <div className="text-muted-foreground text-[10px] mt-1 text-purple-300">Click to track</div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

const HELIX_POINTS = 101;

function AnimatedClockHelix({ gapFraction }: { gapFraction: number }) {
  const lineRef = useRef<THREE.Line>(null);
  const positionsRef = useRef(new Float32Array(HELIX_POINTS * 3));
  const geomRef = useRef<THREE.BufferGeometry>(null);

  useFrame(({ clock }) => {
    if (!geomRef.current) return;
    const time = clock.getElapsedTime();
    const positions = positionsRef.current;
    const helixRadius = TOP_RADIUS + 0.6;

    for (let i = 0; i < HELIX_POINTS; i++) {
      const t = i / (HELIX_POINTS - 1);
      const y = -CRYPT_HEIGHT / 2 + t * CRYPT_HEIGHT;
      const amplitude = gapFraction * 0.25;
      positions[i * 3] = Math.cos(t * Math.PI * 6 + time) * amplitude + helixRadius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(t * Math.PI * 6 + time) * amplitude;
    }

    const attr = geomRef.current.getAttribute("position") as THREE.BufferAttribute;
    attr.needsUpdate = true;

    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      const col = gapFraction > 0.5 ? "#a855f7" : "#ef4444";
      mat.color.set(col);
      mat.opacity = 0.3 + gapFraction * 0.6;
    }
  });

  const initialPositions = useMemo(() => {
    const arr = new Float32Array(HELIX_POINTS * 3);
    const helixRadius = TOP_RADIUS + 0.6;
    for (let i = 0; i < HELIX_POINTS; i++) {
      const t = i / (HELIX_POINTS - 1);
      arr[i * 3] = helixRadius;
      arr[i * 3 + 1] = -CRYPT_HEIGHT / 2 + t * CRYPT_HEIGHT;
      arr[i * 3 + 2] = 0;
    }
    positionsRef.current = arr;
    return arr;
  }, []);

  return (
    <line ref={lineRef as any}>
      <bufferGeometry ref={geomRef as any}>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
          count={HELIX_POINTS}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial transparent opacity={0.7} linewidth={2} color="#a855f7" />
    </line>
  );
}

function CompartmentBars({ gapFraction }: { gapFraction: number }) {
  const stemBoundary = getStemExpansion(gapFraction);
  const taBoundary = getCompartmentBoundary(gapFraction);
  const stemFrac = stemBoundary / TOTAL_LAYERS;
  const taFrac = (taBoundary - stemBoundary) / TOTAL_LAYERS;
  const diffFrac = (TOTAL_LAYERS - taBoundary) / TOTAL_LAYERS;

  const barHeight = 0.12;
  const barWidth = 1.5;
  const stemW = Math.max(0.05, stemFrac * barWidth);
  const taW = Math.max(0.05, taFrac * barWidth);
  const diffW = Math.max(0.05, diffFrac * barWidth);

  return (
    <group position={[-TOP_RADIUS - 1.5, 0, 0]}>
      {[0, 1, 2].map(i => {
        const y = -CRYPT_HEIGHT / 2 + (i / 2) * CRYPT_HEIGHT;
        return (
          <group key={`bar-${i}`} position={[0, y, 0]}>
            <mesh position={[stemW / 2, 0, 0]}>
              <boxGeometry args={[stemW, barHeight, barHeight]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
            <mesh position={[stemW + taW / 2, 0, 0]}>
              <boxGeometry args={[taW, barHeight, barHeight]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            <mesh position={[stemW + taW + diffW / 2, 0, 0]}>
              <boxGeometry args={[diffW, barHeight, barHeight]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>
        );
      })}
      <Text position={[barWidth / 2, CRYPT_HEIGHT / 2 + 0.3, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        {`SC:${(stemFrac * 100).toFixed(0)}% TA:${(taFrac * 100).toFixed(0)}% D:${(diffFrac * 100).toFixed(0)}%`}
      </Text>
    </group>
  );
}

function CryptWall({ gapFraction }: { gapFraction: number }) {
  const wallRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const segments = 60;
    const radialSegments = 24;
    const points: THREE.Vector2[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = -CRYPT_HEIGHT / 2 + t * CRYPT_HEIGHT;
      const r = getCryptRadius(t);
      points.push(new THREE.Vector2(r + 0.02, y));
    }

    return new THREE.LatheGeometry(points, radialSegments);
  }, [gapFraction]);

  return (
    <mesh ref={wallRef} geometry={geometry}>
      <meshStandardMaterial
        color="#1e293b"
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  );
}

function CryptStructure({
  gapFraction,
  animationSpeed,
  sliceAngle,
  hoveredCell,
  trackedCell,
  onCellHover,
  onCellUnhover,
  onCellClick,
  offsetX,
  label,
  interactive,
}: {
  gapFraction: number;
  animationSpeed: number;
  sliceAngle: number | null;
  hoveredCell: number | null;
  trackedCell: number | null;
  onCellHover: (id: number) => void;
  onCellUnhover: () => void;
  onCellClick: (id: number) => void;
  offsetX?: number;
  label?: string;
  interactive?: boolean;
}) {
  const rotatingRef = useRef<THREE.Group>(null);
  const isInteractive = interactive !== false;

  useFrame((_, delta) => {
    if (rotatingRef.current) {
      rotatingRef.current.rotation.y += delta * animationSpeed * 0.15;
    }
  });

  const cellDefs = useMemo(() => {
    const result: CellData[] = [];
    let id = 0;
    for (let layer = 0; layer < TOTAL_LAYERS; layer++) {
      const t = layer / (TOTAL_LAYERS - 1);
      const cellsInLayer = getCellsPerLayer(layer);
      for (let c = 0; c < cellsInLayer; c++) {
        const angle = (c / cellsInLayer) * Math.PI * 2 + (layer % 2) * (Math.PI / cellsInLayer);
        let compartment: "stem" | "ta" | "diff";
        let compartmentLabel: string;
        let bomanPhase: string;

        if (layer < STEM_LAYER_COUNT) {
          compartment = "stem";
          compartmentLabel = "Stem Cell (LGR5+/CBC)";
          bomanPhase = "N_S — Self-renewing";
        } else if (layer < NORMAL_TA_TOP_LAYER) {
          compartment = "ta";
          compartmentLabel = "Transit-Amplifying";
          if (layer < 8) bomanPhase = "G1 phase";
          else if (layer < 13) bomanPhase = "S phase";
          else if (layer < 16) bomanPhase = "G2 phase";
          else bomanPhase = "M phase / early diff";
        } else {
          compartment = "diff";
          compartmentLabel = "Differentiated";
          bomanPhase = "Terminally differentiated";
        }

        result.push({ id, baseAngle: angle, layerIndex: layer, layerT: t, compartment, compartmentLabel, bomanPhase });
        id++;
      }
    }
    return result;
  }, []);

  const gapPercent = (gapFraction * 20).toFixed(1);
  const statusColor = gapFraction > 0.5 ? "#22c55e" : gapFraction > 0.2 ? "#f59e0b" : "#ef4444";

  return (
    <group position={[offsetX || 0, 0, 0]}>
      <group ref={rotatingRef}>
        {cellDefs.map((cell) => (
          <AnimatedCell
            key={cell.id}
            cell={cell}
            gapFraction={gapFraction}
            sliceAngle={sliceAngle}
            isHovered={hoveredCell === cell.id}
            isTracked={trackedCell === cell.id}
            interactive={isInteractive}
            onHover={() => onCellHover(cell.id)}
            onUnhover={onCellUnhover}
            onClick={() => onCellClick(cell.id)}
          />
        ))}
        <CryptWall gapFraction={gapFraction} />
        <AnimatedClockHelix gapFraction={gapFraction} />
      </group>

      {sliceAngle !== null && (
        <CompartmentBars gapFraction={gapFraction} />
      )}

      <Text
        position={[0, CRYPT_HEIGHT / 2 + 0.4, 0]}
        fontSize={0.15}
        color={statusColor}
        anchorX="center"
        anchorY="middle"
      >
        {label ? `${label}: ${gapPercent}%` : `Gap: ${gapPercent}%`}
      </Text>

      <Text position={[-(TOP_RADIUS + 0.3), -CRYPT_HEIGHT / 2 + 0.3, 0]} fontSize={0.08} color="#22c55e" anchorX="right">
        SC (LGR5+)
      </Text>
      <Text position={[-(TOP_RADIUS + 0.3), -1.8, 0]} fontSize={0.07} color="#3b82f6" anchorX="right">
        G1 (43%)
      </Text>
      <Text position={[-(TOP_RADIUS + 0.3), -0.3, 0]} fontSize={0.07} color="#8b5cf6" anchorX="right">
        S (32%)
      </Text>
      <Text position={[-(TOP_RADIUS + 0.3), 0.8, 0]} fontSize={0.07} color="#06b6d4" anchorX="right">
        G2 (19%)
      </Text>
      <Text position={[-(TOP_RADIUS + 0.3), 1.6, 0]} fontSize={0.07} color="#f59e0b" anchorX="right">
        M (6%)
      </Text>
      <Text position={[-(TOP_RADIUS + 0.3), CRYPT_HEIGHT / 2 - 0.8, 0]} fontSize={0.08} color="#94a3b8" anchorX="right">
        Differentiated
      </Text>
    </group>
  );
}

type AnimMode = "idle" | "transition" | "timelapse";

export default function CryptBuckling() {
  const [targetGap, setTargetGap] = useState(15);
  const [displayGap, setDisplayGap] = useState(15);
  const [animMode, setAnimMode] = useState<AnimMode>("idle");
  const rafRef = useRef<number | null>(null);
  const [splitScreen, setSplitScreen] = useState(false);
  const [splitGapPercent, setSplitGapPercent] = useState(0);
  const [crossSection, setCrossSection] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [trackedCell, setTrackedCell] = useState<number | null>(null);

  const gapFraction = Math.max(0, Math.min(1, displayGap / 20));
  const splitGapFraction = Math.max(0, Math.min(1, splitGapPercent / 20));

  const cancelAnim = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startTransition = useCallback((from: number, to: number) => {
    cancelAnim();
    if (Math.abs(from - to) < 0.1) {
      setDisplayGap(to);
      setAnimMode("idle");
      return;
    }
    setAnimMode("transition");
    const duration = 800;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplayGap(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayGap(to);
        setAnimMode("idle");
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [cancelAnim]);

  const handleSetGap = useCallback((value: number) => {
    if (animMode === "timelapse") return;
    setTargetGap(value);
    startTransition(displayGap, value);
  }, [animMode, displayGap, startTransition]);

  const toggleTimelapse = useCallback(() => {
    if (animMode === "timelapse") {
      cancelAnim();
      setAnimMode("idle");
      return;
    }
    cancelAnim();
    setAnimMode("timelapse");
    setTargetGap(25);
    setDisplayGap(25);
    let current = 25;
    const step = () => {
      current -= 0.12;
      if (current <= 0) {
        setTargetGap(0);
        setDisplayGap(0);
        setAnimMode("idle");
        rafRef.current = null;
        return;
      }
      setTargetGap(current);
      setDisplayGap(current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [animMode, cancelAnim]);

  useEffect(() => {
    return cancelAnim;
  }, [cancelAnim]);

  const getStatusColor = () => {
    if (displayGap >= 12) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (displayGap >= 5) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/10 text-red-400 border-red-500/30";
  };

  const getStatusText = () => {
    if (displayGap >= 12) return "Normal — Compartment proportions preserved";
    if (displayGap >= 5) return "Dysregulated — TA zone expanding, SC overproduction";
    if (displayGap >= 2) return "Critical — Near-adenoma compartment ratios";
    return "Adenoma-like — SC overpopulation, D compartment collapsed";
  };

  const presets = [
    { label: "Healthy Crypt (15%)", value: 15, desc: "Normal: 5 SC, balanced TA, full differentiation" },
    { label: "APC+/- FAP (22%)", value: 22, desc: "Compensatory: k2 ↓1.6x, k5 ↓2.6x (Boman 2025)" },
    { label: "Aging (~8%)", value: 8, desc: "Weakened hierarchy, TA zone beginning to expand" },
    { label: "Dysplastic (2%)", value: 2, desc: "Near two-hit: k2 ↓3.8x, k5 ↓5.3x" },
    { label: "Adenoma (0%)", value: 0, desc: "SC overpopulation, D compartment collapsed" },
  ];

  const splitPresets = [
    { label: "Adenoma (0%)", value: 0 },
    { label: "Dysplastic (2%)", value: 2 },
    { label: "Aging (8%)", value: 8 },
    { label: "Healthy (15%)", value: 15 },
    { label: "FAP (22%)", value: 22 },
  ];

  const cameraPosition: [number, number, number] = splitScreen ? [0, 1, 6] : [2.5, 1, 3];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" /> Home
            </Button>
          </Link>
          <Badge variant="outline" className="text-purple-400 border-purple-500/30">Boman Model Visualization</Badge>
        </div>

        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Colonic Crypt Compartment Dynamics</h1>
        <p className="text-muted-foreground mb-4 max-w-3xl">
          3D model of colonic crypt architecture based on the Boman et al. autocatalytic compartment model
          (Cancer Res 2001, 2008; Cancers 2025). Shows how APC mutation drives stem cell overpopulation and
          transit-amplifying zone expansion through altered rate constants k1-k5.
        </p>

        <HowTo
          title="3D Colonic Crypt Visualization"
          summary="Interactive 3D visualization of a colonic crypt structure showing how AR(2) eigenvalue signatures vary along the crypt axis. Stem cells at the base and differentiated cells at the top have distinct temporal persistence profiles."
          steps={[
            { label: "Rotate the 3D view", detail: "Click and drag to rotate the crypt. Scroll to zoom. Colors represent eigenvalue magnitude along the crypt axis." },
            { label: "Read the gradient", detail: "The color gradient from base to top shows how temporal persistence changes with cell differentiation state." },
            { label: "Check the profile", detail: "The side chart shows eigenvalue vs. position along the crypt axis." }
          ]}
        />

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={animMode === "timelapse" ? "destructive" : "outline"}
            size="sm"
            onClick={toggleTimelapse}
            data-testid="button-timelapse"
          >
            {animMode === "timelapse" ? <><Pause className="w-3 h-3 mr-1.5" /> Stop Time-lapse</> : <><Play className="w-3 h-3 mr-1.5" /> APC Progression</>}
          </Button>
          <Button
            variant={splitScreen ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSplitScreen(!splitScreen)}
            data-testid="button-split-screen"
          >
            <Columns2 className="w-3 h-3 mr-1.5" /> {splitScreen ? "Single View" : "Compare Crypts"}
          </Button>
          <Button
            variant={crossSection ? "secondary" : "outline"}
            size="sm"
            onClick={() => setCrossSection(!crossSection)}
            data-testid="button-cross-section"
          >
            <Scissors className="w-3 h-3 mr-1.5" /> {crossSection ? "Full Crypt" : "Cross Section"}
          </Button>
          {trackedCell !== null && (
            <Button variant="outline" size="sm" onClick={() => setTrackedCell(null)} data-testid="button-untrack">
              <RotateCcw className="w-3 h-3 mr-1.5" /> Untrack Cell
            </Button>
          )}
        </div>

        <div className="flex items-start gap-2 mb-6 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 max-w-3xl">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-300/80 space-y-1.5">
            <p>
              <strong>Transparency notice:</strong> This visualization is a <em>conceptual model</em> illustrating
              a hypothesis — that circadian hierarchy strength (measured by PAR(2) Δ|λ|) is linked to crypt
              compartment homeostasis. The crypt anatomy (250 cells, Boman C/P/D proportions) is based on
              published biology, but the connection between Δ|λ| values and compartment changes is theoretical.
            </p>
            <p>
              No one has yet measured |λ| from actual crypt tissue biopsies to confirm this link. The eigenvalue
              values shown are illustrative/normalized — not derived from crypt-specific gene expression data.
              Independent verification by another lab is the critical next step.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-700/50" data-testid="card-3d-viewport">
              <CardContent className="p-0">
                <div className="h-[650px] rounded-lg overflow-hidden">
                  <WebGLErrorBoundary>
                  <Canvas camera={{ position: cameraPosition, fov: splitScreen ? 55 : 50 }} gl={{ antialias: true, alpha: true }}>
                    <color attach="background" args={["#0a0f1e"]} />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={0.8} />
                    <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#a855f7" />
                    <pointLight position={[0, -4, 0]} intensity={0.4} color="#22c55e" />

                    {splitScreen ? (
                      <>
                        <CryptStructure
                          gapFraction={gapFraction}
                          animationSpeed={0.8}
                          sliceAngle={crossSection ? Math.PI * 0.5 : null}
                          hoveredCell={hoveredCell}
                          trackedCell={trackedCell}
                          onCellHover={setHoveredCell}
                          onCellUnhover={() => setHoveredCell(null)}
                          onCellClick={setTrackedCell}
                          offsetX={-1.5}
                          label="Left"
                          interactive={true}
                        />
                        <CryptStructure
                          gapFraction={splitGapFraction}
                          animationSpeed={0.8}
                          sliceAngle={crossSection ? Math.PI * 0.5 : null}
                          hoveredCell={null}
                          trackedCell={null}
                          onCellHover={() => {}}
                          onCellUnhover={() => {}}
                          onCellClick={() => {}}
                          offsetX={1.5}
                          label="Right"
                          interactive={false}
                        />
                      </>
                    ) : (
                      <CryptStructure
                        gapFraction={gapFraction}
                        animationSpeed={0.8}
                        sliceAngle={crossSection ? Math.PI * 0.5 : null}
                        hoveredCell={hoveredCell}
                        trackedCell={trackedCell}
                        onCellHover={setHoveredCell}
                        onCellUnhover={() => setHoveredCell(null)}
                        onCellClick={setTrackedCell}
                        interactive={true}
                      />
                    )}

                    <OrbitControls enablePan enableZoom enableRotate autoRotate={false} minDistance={1.5} maxDistance={12} />
                    <Environment preset="night" />
                  </Canvas>
                  </WebGLErrorBoundary>
                </div>
              </CardContent>
            </Card>

            {animMode === "timelapse" && (
              <div className="mt-2">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-100"
                    style={{ width: `${((25 - displayGap) / 25) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Normal crypt</span>
                  <span>Gap: {displayGap.toFixed(1)}%</span>
                  <span>Adenoma</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700/50" data-testid="card-gap-control">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{splitScreen ? "Left Crypt — Gap" : "Eigenvalue Gap Control"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">Clock-Target |lambda| Gap</span>
                    <span className="text-lg font-mono font-bold" data-testid="text-gap-value">{displayGap.toFixed(1)}%</span>
                  </div>
                  <Slider
                    value={[targetGap]}
                    onValueChange={(v) => handleSetGap(v[0])}
                    min={0} max={25} step={0.5}
                    className="w-full"
                    disabled={animMode === "timelapse"}
                    data-testid="slider-gap"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0% (Adenoma)</span>
                    <span>25% (Strong hierarchy)</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${getStatusColor()}`} data-testid="status-indicator">
                  <p className="text-sm font-medium">{getStatusText()}</p>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20" data-testid="par2-readout">
                  <h4 className="text-xs font-semibold text-purple-300 mb-2">PAR(2) Eigenvalue Readout</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-muted-foreground">|λ_clock|</div>
                      <div className="text-sm font-mono font-bold text-purple-400">
                        {(0.85 + gapFraction * 0.10).toFixed(3)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">|λ_target|</div>
                      <div className="text-sm font-mono font-bold text-blue-400">
                        {(0.85 + gapFraction * 0.10 - gapFraction * 0.20).toFixed(3)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Δ|λ|</div>
                      <div className={`text-sm font-mono font-bold ${gapFraction > 0.5 ? "text-emerald-400" : gapFraction > 0.2 ? "text-amber-400" : "text-red-400"}`}>
                        {(gapFraction * 0.20).toFixed(3)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, gapFraction * 100)}%`,
                        background: `linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    |λ| measures how strongly a gene's expression persists across time points (from AR(2) fitting
                    to time-series data). These values are <strong>illustrative</strong> — not measured from crypt
                    tissue. The hypothesis: when this gap collapses, circadian gating of cell division weakens,
                    contributing to stem cell overproduction. This link is <strong>unverified</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {splitScreen && (
              <Card className="bg-slate-900/50 border-slate-700/50" data-testid="card-split-control">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Right Crypt — Gap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground">Gap</span>
                      <span className="text-lg font-mono font-bold">{splitGapPercent.toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[splitGapPercent]}
                      onValueChange={(v) => setSplitGapPercent(v[0])}
                      min={0} max={25} step={0.5}
                      className="w-full"
                      data-testid="slider-split-gap"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {splitPresets.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setSplitGapPercent(p.value)}
                        className={`text-[10px] px-2 py-1 rounded border ${
                          Math.abs(splitGapPercent - p.value) < 0.5
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                            : "border-slate-700/50 text-muted-foreground hover:bg-slate-800/60"
                        }`}
                        data-testid={`button-split-preset-${p.value}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-900/50 border-slate-700/50" data-testid="card-presets">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Condition Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleSetGap(preset.value)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-sm ${
                      Math.abs(targetGap - preset.value) < 0.5
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60"
                    }`}
                    data-testid={`button-preset-${preset.value}`}
                  >
                    <div className="font-medium text-xs">{preset.label}</div>
                    <div className="text-[10px] text-muted-foreground">{preset.desc}</div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50" data-testid="card-legend">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Crypt Compartments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs">Stem cells (LGR5+/CBC) — crypt base (5 cells)</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 mb-0.5">Transit-amplifying (~157 cells):</div>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                  <span className="text-xs">G1 phase — 67 cells (~43%)</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#8b5cf6" }} />
                  <span className="text-xs">S phase — 50 cells (~32%)</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#06b6d4" }} />
                  <span className="text-xs">G2 phase — 30 cells (~19%)</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                  <span className="text-xs">M phase — 10 cells (~6%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <span className="text-xs">Differentiated — surface epithelium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs">Circadian clock signal (PAR(2) helix)</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex items-start gap-2">
                    <Info className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      As the gap collapses: stem cell count increases (Boman overproduction),
                      TA zone expands (altered k2/k5), differentiated compartment shrinks.
                      This reflects the Boman finding that APC mutation drives cancer through
                      stem cell number changes, not cell cycle rate changes.
                      <strong> Note:</strong> Whether circadian hierarchy collapse (Δ|λ|) is a cause,
                      consequence, or parallel effect of APC mutation is unknown — this visualization
                      illustrates one hypothesized causal direction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-slate-900/50 border-slate-700/50 mt-6" data-testid="card-biological-context">
          <CardHeader>
            <CardTitle className="text-sm">Boman Autocatalytic Crypt Model: C/P/D Compartments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground/80 mb-1">Boman C/P/D Autocatalytic Model</h4>
                <p>
                  Boman et al. model the crypt as three interacting populations: Cycling (C),
                  Proliferative non-cycling (P), and Differentiated (D). These are governed by
                  five rate constants: k1 (symmetric stem cell division), k2 (cell polymerization
                  into epithelial layer), k3 (asymmetric division producing a differentiated cell),
                  k4 (crypt cell extrusion), and k5 (apoptosis). This visualization renders
                  250 cells in a narrow finger-like crypt: 5 stem cells at the base,
                  157 transit-amplifying cells in the middle zone, and 88 differentiated cells
                  at the surface, consistent with published crypt anatomy.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground/80 mb-1">APC Mutation Effects</h4>
                <p>
                  In FAP crypts (APC+/-): k2 decreases 1.6-fold, k5 decreases 2.6-fold,
                  and k3/k4 ratio decreases 1.6-fold. In adenomas: k2 drops 3.8-fold,
                  k5 drops 5.3-fold, k3/k4 drops 8.8-fold (Boman 2025). The key finding:
                  cancer initiation is driven by stem cell overproduction (increased N_S),
                  not by changes in cell cycle rate or apoptosis of non-stem cells. In this
                  visualization, reducing the gap expands the stem and TA compartments while
                  shrinking the differentiated zone, matching the Boman-predicted progression.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground/80 mb-1">PAR(2) Connection — What It Shows vs. What's Hypothesized</h4>
                <p>
                  <strong>What PAR(2) actually measures:</strong> The AR(2) eigenvalue modulus |λ| quantifies
                  temporal persistence — how strongly a gene's expression at one time point predicts the next.
                  Clock genes (<em>Bmal1</em>, <em>Per2</em>) consistently show higher |λ| than downstream
                  targets across tissues and species. This hierarchy (Δ|λ| = |λ_clock| − |λ_target|) is
                  a reproducible empirical finding from bulk tissue microarray datasets.
                </p>
                <p className="mt-2">
                  <strong>What this visualization hypothesizes:</strong> The gap slider maps Δ|λ| to crypt
                  compartment changes. This implies a causal link: circadian hierarchy collapse → loss of
                  cell-division gating → Boman-predicted stem cell overproduction. However, this causal chain
                  is a hypothesis. Nobody has measured |λ| from FAP patient crypt biopsies. APC mutation causes
                  adenoma formation through Wnt pathway hyperactivation (β-catenin accumulation) — circadian
                  disruption may be a parallel consequence of losing APC, not the driving mechanism.
                </p>
                <p className="mt-2">
                  <strong>Crypt anatomy:</strong> Johnston et al. (PNAS 2007) provided stable ODE populations of
                  N_0=4 stem, N_1=85 transit, N_2=200 differentiated cells. Our rendering uses anatomically
                  calibrated counts (250 cells total) with cell-cycle phase proportions matching published
                  durations: G1 ~43%, S ~32%, G2 ~19%, M ~6%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 mt-4" data-testid="card-references">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">References</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-[10px] text-muted-foreground space-y-1.5">
              <li>Boman BM, Fields JZ, Bonham-Carter O, Runquist OA. Computer modeling implicates stem cell overproduction in colon cancer initiation. <em>Cancer Res</em> 2001;61:8408-8411.</li>
              <li>Boman BM, Fields JZ, Cavanaugh KL, et al. How dysregulated colonic crypt dynamics cause stem cell overpopulation and initiate colon cancer. <em>Cancer Res</em> 2008;68:3304-3313.</li>
              <li>Boman BM, et al. A tissue renewal-based mechanism drives colon tumorigenesis. <em>Cancers</em> 2025;18:44.</li>
              <li>Johnston MD, Edwards CM, Bodmer WF, et al. Mathematical modeling of cell population dynamics in the colonic crypt and in colorectal cancer. <em>PNAS</em> 2007;104:4008-4013.</li>
              <li>Barker N, et al. Identification of stem cells in small intestine and colon by marker gene Lgr5. <em>Nature</em> 2007;449:1003-1007.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-emerald-700/30 mt-6" data-testid="card-capabilities">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              What PAR(2) Can Actually Do — Current Capabilities & Future Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 text-xs text-muted-foreground">

              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5" /> What PAR(2) Does Right Now (Verified)
                </h4>
                <ul className="space-y-1.5 ml-5 list-disc">
                  <li>
                    <strong>Quantifies temporal persistence from short time series.</strong> Unlike Fourier
                    analysis or JTK_CYCLE (which need long, evenly-sampled data and assume periodicity),
                    AR(2) works with ~12 time points and captures persistence without assuming sinusoidal waveforms.
                  </li>
                  <li>
                    <strong>Produces a single, rankable metric (|λ|).</strong> The eigenvalue modulus
                    allows direct numerical comparison between any two genes, tissues, or conditions.
                    Not a binary "rhythmic/non-rhythmic" call.
                  </li>
                  <li>
                    <strong>Reproduces the clock &gt; target hierarchy consistently.</strong> Tested
                    across multiple tissues, species (mouse, baboon, human, zebrafish, <em>Arabidopsis</em>),
                    and datasets. This finding is robust and reproducible.
                  </li>
                  <li>
                    <strong>Includes quality diagnostics.</strong> Edge case detection for trends,
                    stationarity, sample size, nonlinearity, and boundary effects — useful for any
                    short biological time series, not just circadian.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" /> Potential Patient Impact (If Verified)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium text-foreground/70 mb-1">Near-term (1–3 years)</p>
                    <ul className="space-y-1 ml-5 list-disc">
                      <li>
                        <strong>Circadian health biomarker from minimal blood draws.</strong> If |λ| from
                        ~12 blood samples over 24hrs correlates with gold-standard circadian measures (melatonin
                        onset, core body temperature), it replaces expensive 48hr constant routine protocols.
                      </li>
                      <li>
                        <strong>Standard metric for reporting circadian disruption.</strong> Labs running
                        perturbation experiments (knockouts, drug treatments) could report |λ| as a
                        standardized measure of circadian robustness, replacing ad-hoc amplitude estimates.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground/70 mb-1">Medium-term (3–5 years)</p>
                    <ul className="space-y-1 ml-5 list-disc">
                      <li>
                        <strong>Cancer risk stratification.</strong> If Δ|λ| collapse precedes adenoma
                        formation (not just correlates), monitoring IBD/FAP patients over time could flag
                        increased risk before morphological changes appear on colonoscopy.
                      </li>
                      <li>
                        <strong>Chronotherapy optimization.</strong> If |λ| predicts how phase-locked a drug
                        target gene is, it could personalize drug timing — e.g., when to administer 5-FU
                        based on the target gene's temporal persistence.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground/70 mb-1">Longer-term (5+ years)</p>
                    <ul className="space-y-1 ml-5 list-disc">
                      <li>
                        <strong>Treatment response monitoring.</strong> If circadian-restoring therapies
                        (REV-ERB agonists, CRY stabilizers) increase Δ|λ|, it becomes a quantitative
                        endpoint for clinical trials.
                      </li>
                      <li>
                        <strong>Wearable integration.</strong> If CGM or heart-rate-variability-derived
                        |λ| correlates with tissue-level circadian health, non-invasive monitoring
                        becomes possible (most speculative).
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground/70 mb-1">Basic Science</p>
                    <ul className="space-y-1 ml-5 list-disc">
                      <li>
                        <strong>Cross-species evolution.</strong> Do long-lived species have higher Δ|λ|?
                        Does |λ| correlate with cancer incidence (Peto's paradox)?
                      </li>
                      <li>
                        <strong>Single-cell genomics.</strong> AR(2) applied to pseudo-time trajectories
                        could quantify cell-fate commitment strength at single-cell resolution.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <h4 className="font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> What PAR(2) Cannot Do Yet
                </h4>
                <ul className="space-y-1.5 ml-5 list-disc">
                  <li>
                    <strong>Diagnose any patient.</strong> There are no validated clinical thresholds
                    ("if Δ|λ| &lt; X, increase screening frequency"). This requires clinical validation
                    studies that have not been conducted.
                  </li>
                  <li>
                    <strong>Prove causation.</strong> PAR(2) shows correlation between hierarchy strength
                    and tissue states. Whether circadian disruption causes, results from, or runs parallel
                    to disease progression is an open question.
                  </li>
                  <li>
                    <strong>Replace existing diagnostics.</strong> FAP patients already receive prophylactic
                    colectomy; sporadic CRC screening is based on age/history. |λ| does not yet change
                    clinical management.
                  </li>
                  <li>
                    <strong>Claim superiority over existing metrics.</strong> Whether |λ| adds predictive
                    power beyond amplitude, phase coherence, or period stability has not been externally tested.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-1.5">
                  <Microscope className="w-3.5 h-3.5" /> The Critical Next Steps
                </h4>
                <div className="space-y-2">
                  <p>
                    Everything above depends on <strong>independent replication</strong>: another lab reproducing
                    the |λ_clock| &gt; |λ_target| hierarchy using different datasets, different implementations,
                    and ideally different tissue types. Without this, PAR(2) remains a promising analytical tool
                    with interesting internal consistency but not a verified framework.
                  </p>
                  <p>
                    <strong>Why not TCGA?</strong> TCGA has hundreds of paired normal/tumor colorectal samples,
                    but each is a single snapshot — not a time series. AR(2) requires sequential measurements
                    from the same tissue over time (e.g., every 2–4 hours over 24–48 hours). You cannot fit
                    AR(2) to one time point. TCGA could be used to cross-validate <em>which</em> genes are
                    disrupted in tumors, but not to directly compute |λ|.
                  </p>
                  <p>
                    <strong>What's actually needed:</strong> A human colon tissue time-series dataset — normal
                    mucosa and adenoma/carcinoma tissue sampled at regular intervals over 24–48 hours.
                    This dataset may not yet exist publicly. Generating it would require a prospective study
                    (e.g., serial biopsies during colonoscopy or from surgical resection specimens sampled
                    at timed intervals). This is the real bottleneck — not computational, but experimental.
                  </p>
                  <p>
                    <strong>What we can do now:</strong> Apply PAR(2) to existing circadian time-series
                    datasets from other human tissues (e.g., blood, skin, adipose) where paired
                    healthy/disease comparisons exist, to test whether Δ|λ| consistently decreases in
                    disease states. This would strengthen the framework's generalizability even without
                    colon-specific data.
                  </p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
