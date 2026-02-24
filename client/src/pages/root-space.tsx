import { useQuery } from "@tanstack/react-query";
import { useScrollToHash } from "@/hooks/useScrollToHash";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend, ReferenceLine, Line, ComposedChart
} from "recharts";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, Loader2, AlertCircle, Copy, Check,
  ChevronDown, ChevronUp, Atom, Triangle, Crosshair, FlaskConical, Box,
  Search, X, Filter, Eye, EyeOff, Download, Camera, BarChart3, Layers, MapPin, Pill, Target
} from "lucide-react";
import { exportChartAsImage } from "@/lib/export-chart";
import { Link } from "wouter";
import HowTo from "@/components/HowTo";
import PaperCrossLinks from "@/components/PaperCrossLinks";
import { WebGLErrorBoundary } from "@/components/ErrorBoundary";
import { useState, useCallback, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface GeneRootPoint {
  gene: string;
  geneType: string;
  beta1: number;
  beta2: number;
  r: number;
  theta: number;
  eigenvalue: number;
  r2: number;
  isComplex: boolean;
  dPhi: number;
  x: number;
  y: number;
}

interface DatasetRootSpace {
  datasetId: string;
  datasetName: string;
  species: string;
  condition: string;
  genes: GeneRootPoint[];
  clockMeanR: number;
  targetMeanR: number;
  clockMeanTheta: number;
  targetMeanTheta: number;
  clockMeanDPhi: number;
  targetMeanDPhi: number;
  categoryStats?: { category: string; label: string; color: string; count: number; meanR: number; meanTheta: number; meanDPhi: number; meanEigenvalue: number }[];
}

interface EnrichmentTestResult {
  testName: string;
  description: string;
  observedStatistic: number;
  nullMean: number;
  nullStd: number;
  pValue: number;
  nPermutations: number;
  significant: boolean;
  effectSize: number;
}

interface PerturbationShift {
  datasetPair: string;
  wtLabel: string;
  perturbedLabel: string;
  wtMeanR: number;
  perturbedMeanR: number;
  rShift: number;
  wtMeanTheta?: number;
  perturbedMeanTheta?: number;
  thetaShift?: number;
  wtMeanDPhi: number;
  perturbedMeanDPhi: number;
  dPhiShift: number;
  mannWhitneyP: number;
  significant: boolean;
}

interface NullDistribution {
  nullType: string;
  dPhiValues: number[];
  rValues: number[];
  thetaValues: number[];
}

interface ThresholdSweepPoint {
  threshold: number;
  observedFraction: number;
  nullFraction: number;
  enrichmentRatio: number;
}

interface ThetaBin {
  binCenter: number;
  binLabel: string;
  observedCount: number;
  observedDensity: number;
  nullCount: number;
  nullDensity: number;
}

interface RootSpaceData {
  triangle: {
    vertices: { x: number; y: number }[];
    oscillatoryParabola: { x: number; y: number }[];
    fibonacciPoint: { x: number; y: number };
  };
  datasets: DatasetRootSpace[];
  nullDistributions: NullDistribution[];
  enrichmentTests: EnrichmentTestResult[];
  perturbationShifts: PerturbationShift[];
  thresholdSweep?: ThresholdSweepPoint[];
  thetaDistribution?: ThetaBin[];
  thetaPhiRef?: number;
  methodology?: {
    rngSeed: number;
    rootHandling: string;
    nullHierarchy: string;
    excludedDatasets: string;
    multipleTestingNote: string;
    mappingSensitivity?: string;
  };
  summary: {
    totalGenes: number;
    totalDatasets: number;
    meanDPhi: number;
    phiEnrichedFraction: number;
    perturbationShiftDetected: boolean;
    overallVerdict: string;
  };
  categoryHierarchy?: {
    hierarchy: { category: string; label: string; color: string; pooledCount: number; pooledMeanEigenvalue: number; pooledMeanR: number; pooledMeanDPhi: number; rank: number }[];
    kruskalWallisP: number;
    kruskalWallisSignificant: boolean;
    pairwiseTests: { categoryA: string; categoryB: string; labelA: string; labelB: string; meanEigenvalueA: number; meanEigenvalueB: number; mannWhitneyP: number; significant: boolean; direction: string }[];
    categoryMeta: Record<string, { label: string; color: string; description: string }>;
  };
  pcaComparison?: {
    datasetId: string;
    datasetName: string;
    genes: { gene: string; geneType: string; pc1: number; pc2: number; eigenvalue: number }[];
    varianceExplained: [number, number];
  }[];
}

interface FilterState {
  hiddenDatasets: Set<string>;
  hiddenGenes: Set<string>;
  visibleCategories: Set<string>;
  highlightedGenes: Set<string>;
}

type GeneCategory = 'clock' | 'target' | 'housekeeping' | 'immune' | 'metabolic' | 'chromatin' | 'signaling' | 'dna_repair' | 'stem' | 'other';

interface GenomeSearchGene {
  gene: string;
  geneType: 'clock' | 'target' | 'other';
  geneCategory: GeneCategory;
  beta1: number;
  beta2: number;
  eigenvalue: number;
  r: number;
  theta: number;
  isComplex: boolean;
  dPhi: number;
  x: number;
  y: number;
  r2: number;
  stable: boolean;
  confidence: string;
  isFibonacci?: boolean;
}

const GENE_CATEGORY_CONFIG: Record<GeneCategory, { color: string; label: string; bgClass: string; textClass: string }> = {
  clock:        { color: '#22d3ee', label: 'Clock',        bgClass: 'bg-cyan-900/50',    textClass: 'text-cyan-300' },
  target:       { color: '#f472b6', label: 'Target',       bgClass: 'bg-pink-900/50',    textClass: 'text-pink-300' },
  housekeeping: { color: '#a3e635', label: 'Housekeeping', bgClass: 'bg-lime-900/50',    textClass: 'text-lime-300' },
  immune:       { color: '#fb923c', label: 'Immune',       bgClass: 'bg-orange-900/50',  textClass: 'text-orange-300' },
  metabolic:    { color: '#34d399', label: 'Metabolic',    bgClass: 'bg-emerald-900/50', textClass: 'text-emerald-300' },
  chromatin:    { color: '#c084fc', label: 'Chromatin',    bgClass: 'bg-purple-900/50',  textClass: 'text-purple-300' },
  signaling:    { color: '#60a5fa', label: 'Signaling',    bgClass: 'bg-blue-900/50',    textClass: 'text-blue-300' },
  dna_repair:   { color: '#fbbf24', label: 'DNA Repair',   bgClass: 'bg-amber-900/50',   textClass: 'text-amber-300' },
  stem:         { color: '#f87171', label: 'Stem',         bgClass: 'bg-red-900/50',     textClass: 'text-red-300' },
  other:        { color: '#94a3b8', label: 'Other',        bgClass: 'bg-slate-700',      textClass: 'text-slate-300' },
};

function getCategoryColor(gene: GenomeSearchGene): string {
  return GENE_CATEGORY_CONFIG[gene.geneCategory || 'other']?.color || '#94a3b8';
}

const DATASET_COLORS: Record<string, string> = {
  'GSE11923_48h': '#22d3ee',
  'GSE54650_Liver': '#06b6d4',
  'GSE113883_Blood': '#f59e0b',
  'GSE157357_WT': '#22c55e',
  'GSE157357_ApcKO': '#ef4444',
  'GSE48113_Aligned': '#8b5cf6',
  'GSE48113_Misaligned': '#ec4899',
};

const DATASET_COLORS_3D: Record<string, THREE.Color> = {
  'GSE11923_48h': new THREE.Color('#22d3ee'),
  'GSE54650_Liver': new THREE.Color('#06b6d4'),
  'GSE113883_Blood': new THREE.Color('#f59e0b'),
  'GSE157357_WT': new THREE.Color('#22c55e'),
  'GSE157357_ApcKO': new THREE.Color('#ef4444'),
  'GSE48113_Aligned': new THREE.Color('#8b5cf6'),
  'GSE48113_Misaligned': new THREE.Color('#ec4899'),
};


const GENOME_SEARCH_COLOR = '#94a3b8';
const GENOME_SEARCH_COLOR_3D = new THREE.Color('#94a3b8');

interface Gene3DPoint {
  beta1: number;
  beta2: number;
  eigenvalue: number;
  gene: string;
  geneType: string;
  datasetId: string;
  datasetName: string;
  r2: number;
}

function StationarityTriangleWireframe() {
  const vertices = useMemo(() => {
    const v1 = new THREE.Vector3(-2, 0, -1);
    const v2 = new THREE.Vector3(0, 0, 1);
    const v3 = new THREE.Vector3(2, 0, -1);
    const points = [v1, v2, v3, v1];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const parabolaPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const b1 = -2 + (i / 100) * 4;
      const b2 = -b1 * b1 / 4;
      if (b2 >= -1 && b2 <= 1) {
        pts.push(new THREE.Vector3(b1, 0, b2));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[] = [];
    for (let x = -2; x <= 2; x += 0.5) {
      lines.push(new THREE.Vector3(x, 0, -1.2), new THREE.Vector3(x, 0, 1.2));
    }
    for (let z = -1; z <= 1; z += 0.5) {
      lines.push(new THREE.Vector3(-2.2, 0, z), new THREE.Vector3(2.2, 0, z));
    }
    return new THREE.BufferGeometry().setFromPoints(lines);
  }, []);

  const triangleLine = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#475569', linewidth: 2 });
    return new THREE.Line(vertices, mat);
  }, [vertices]);

  const parabolaLine = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#eab308', transparent: true, opacity: 0.5 });
    return new THREE.Line(parabolaPoints, mat);
  }, [parabolaPoints]);

  const gridObj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#1e293b', transparent: true, opacity: 0.4 });
    return new THREE.LineSegments(gridLines, mat);
  }, [gridLines]);

  return (
    <>
      <primitive object={gridObj} />
      <primitive object={triangleLine} />
      <primitive object={parabolaLine} />
    </>
  );
}

function GenePoint({ point, scale }: { point: Gene3DPoint; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = useMemo(() => {
    const catColor = GENE_CATEGORY_CONFIG[point.geneType as GeneCategory]?.color;
    return new THREE.Color(catColor || '#94a3b8');
  }, [point.geneType]);

  const radius = point.geneType === 'clock' ? 0.045 * scale : 0.028 * scale;
  const pos: [number, number, number] = [point.beta1, point.eigenvalue * 2, point.beta2];

  return (
    <mesh
      ref={meshRef}
      position={pos}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[hovered ? radius * 1.5 : radius, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : point.geneType === 'clock' ? 0.4 : 0.15}
        transparent
        opacity={point.geneType === 'clock' ? 0.85 : 0.45}
        roughness={0.3}
        metalness={0.2}
      />
      {hovered && (
        <Html distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div className="bg-gray-900/95 border border-gray-600 rounded-lg px-3 py-2 text-xs shadow-xl whitespace-nowrap">
            <div className="font-bold text-white">{point.gene}</div>
            <div className="text-gray-300">{point.datasetName}</div>
            <div className="text-gray-300">{point.geneType} gene</div>
            <div className="text-cyan-300">|λ| = {point.eigenvalue.toFixed(4)}</div>
            <div className="text-blue-300">β₁ = {point.beta1.toFixed(3)}, β₂ = {point.beta2.toFixed(3)}</div>
            <div className="text-slate-400">R² = {point.r2.toFixed(3)}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

function DropLine({ point }: { point: Gene3DPoint }) {
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(point.beta1, 0, point.beta2),
      new THREE.Vector3(point.beta1, point.eigenvalue * 2, point.beta2),
    ]);
    const mat = new THREE.LineBasicMaterial({
      color: GENE_CATEGORY_CONFIG[point.geneType as GeneCategory]?.color || '#64748b',
      transparent: true,
      opacity: point.geneType === 'clock' ? 0.15 : 0.06,
    });
    return new THREE.Line(geo, mat);
  }, [point]);

  return <primitive object={lineObj} />;
}

function EigenvaluePlane({ height, label, color }: { height: number; label: string; color: string }) {
  return (
    <group position={[0, height * 2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.4, 2.4]} />
        <meshStandardMaterial color={color} transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
      <Text
        position={[2.3, 0, 0]}
        fontSize={0.12}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function AxisLabels() {
  return (
    <>
      <Text position={[0, -0.15, -1.5]} fontSize={0.14} color="#94a3b8" anchorX="center">
        β₁ (AR coefficient 1)
      </Text>
      <Text position={[-2.5, -0.15, 0]} fontSize={0.14} color="#94a3b8" rotation={[0, Math.PI / 2, 0]} anchorX="center">
        β₂ (AR coefficient 2)
      </Text>
      <Text position={[-2.5, 1.0, -1.2]} fontSize={0.14} color="#94a3b8" rotation={[0, Math.PI / 4, 0]} anchorX="center">
        |λ| (eigenvalue modulus)
      </Text>
      <Text position={[0, 0, 1.25]} fontSize={0.1} color="#eab308" anchorX="center">
        oscillatory boundary
      </Text>
      <Text position={[-1.5, 0, -1.05]} fontSize={0.1} color="#475569" anchorX="center">
        stationarity triangle
      </Text>
    </>
  );
}

function TickMarks() {
  const ticks = useMemo(() => {
    const marks: { pos: [number, number, number]; label: string; axis: 'x' | 'y' | 'z' }[] = [];
    for (let x = -2; x <= 2; x += 1) {
      marks.push({ pos: [x, 0, -1.3], label: x.toString(), axis: 'x' });
    }
    for (let z = -1; z <= 1; z += 0.5) {
      marks.push({ pos: [-2.3, 0, z], label: z.toFixed(1), axis: 'z' });
    }
    for (let y = 0; y <= 1; y += 0.2) {
      marks.push({ pos: [-2.3, y * 2, -1.3], label: y.toFixed(1), axis: 'y' });
    }
    return marks;
  }, []);

  return (
    <>
      {ticks.map((t, i) => (
        <Text
          key={i}
          position={t.pos}
          fontSize={0.08}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {t.label}
        </Text>
      ))}
    </>
  );
}

const ALL_CATEGORIES = new Set(['clock', 'target', 'housekeeping', 'immune', 'metabolic', 'chromatin', 'signaling', 'dna_repair', 'stem']);

function useFilterState() {
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<string>>(new Set());
  const [hiddenGenes, setHiddenGenes] = useState<Set<string>>(new Set());
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set(ALL_CATEGORIES));
  const [highlightedGenes, setHighlightedGenes] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [geneSearch, setGeneSearch] = useState('');

  const toggleDataset = useCallback((dsId: string) => {
    setHiddenDatasets(prev => {
      const next = new Set(prev);
      if (next.has(dsId)) next.delete(dsId); else next.add(dsId);
      return next;
    });
  }, []);

  const toggleGeneVisibility = useCallback((gene: string) => {
    setHiddenGenes(prev => {
      const next = new Set(prev);
      if (next.has(gene)) next.delete(gene); else next.add(gene);
      return next;
    });
  }, []);

  const toggleHighlight = useCallback((gene: string) => {
    setHighlightedGenes(prev => {
      const next = new Set(prev);
      if (next.has(gene)) next.delete(gene); else next.add(gene);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setVisibleCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setHiddenDatasets(new Set());
    setHiddenGenes(new Set());
    setVisibleCategories(new Set(ALL_CATEGORIES));
    setHighlightedGenes(new Set());
    setGeneSearch('');
  }, []);

  const hasActiveFilters = hiddenDatasets.size > 0 || hiddenGenes.size > 0 || visibleCategories.size < ALL_CATEGORIES.size || highlightedGenes.size > 0;

  return {
    filters: { hiddenDatasets, hiddenGenes, visibleCategories, highlightedGenes } as FilterState,
    showFilters, setShowFilters,
    geneSearch, setGeneSearch,
    visibleCategories, setVisibleCategories, toggleCategory,
    toggleDataset, toggleGeneVisibility, toggleHighlight,
    resetFilters, hasActiveFilters,
  };
}

function applyFilters(genes: GeneRootPoint[], datasetId: string, filters: FilterState): GeneRootPoint[] {
  return genes.filter(g => {
    if (filters.highlightedGenes.has(g.gene)) return true;
    if (filters.hiddenDatasets.has(datasetId)) return false;
    if (filters.hiddenGenes.has(g.gene)) return false;
    if (!filters.visibleCategories.has(g.geneType)) return false;
    return true;
  });
}

function FilterPanel({ data, filterHook }: { data: RootSpaceData; filterHook: ReturnType<typeof useFilterState> }) {
  const {
    filters, showFilters, setShowFilters,
    geneSearch, setGeneSearch,
    toggleCategory,
    toggleDataset, toggleGeneVisibility, toggleHighlight,
    resetFilters, hasActiveFilters,
  } = filterHook;

  const allGeneNames = useMemo(() => {
    const names = new Set<string>();
    data.datasets.forEach(ds => ds.genes.forEach(g => names.add(g.gene)));
    return Array.from(names).sort();
  }, [data]);

  const allPoints = useMemo(() => {
    return data.datasets.flatMap(ds => ds.genes.map(g => ({ ...g, datasetId: ds.datasetId })));
  }, [data]);

  const totalVisible = useMemo(() => {
    return data.datasets.reduce((sum, ds) => sum + applyFilters(ds.genes, ds.datasetId, filters).length, 0);
  }, [data, filters]);

  const totalGenes = data.datasets.reduce((sum, ds) => sum + ds.genes.length, 0);

  const searchResults = useMemo(() => {
    if (!geneSearch.trim()) return [];
    const q = geneSearch.toLowerCase();
    return allGeneNames.filter(g => g.toLowerCase().includes(q)).slice(0, 10);
  }, [geneSearch, allGeneNames]);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="text-xs h-7"
          onClick={() => setShowFilters(!showFilters)}
          data-testid="button-toggle-filters"
        >
          <Filter size={12} className="mr-1" />
          Filters {hasActiveFilters && <span className="ml-1 bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{filters.hiddenDatasets.size + filters.hiddenGenes.size + (ALL_CATEGORIES.size - filters.visibleCategories.size)}</span>}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 text-amber-400 hover:text-amber-300"
            onClick={resetFilters}
            data-testid="button-reset-filters"
          >
            <X size={12} className="mr-1" /> Reset All
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span>{totalVisible}/{totalGenes} genes visible</span>
          <span className="text-slate-500">|</span>
          <span>Filters apply to all scatter plots below</span>
        </div>
      </div>

      {showFilters && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Eye size={12} /> Datasets / Tissues
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.datasets.map(ds => {
                const isHidden = filters.hiddenDatasets.has(ds.datasetId);
                return (
                  <button
                    key={ds.datasetId}
                    onClick={() => toggleDataset(ds.datasetId)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all border ${
                      isHidden
                        ? 'border-slate-700 bg-slate-900/50 text-slate-400 opacity-50'
                        : 'border-slate-600 bg-slate-800 text-white'
                    }`}
                    data-testid={`button-toggle-dataset-${ds.datasetId}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isHidden ? '#475569' : (DATASET_COLORS[ds.datasetId] || '#94a3b8') }}
                    />
                    <span>{ds.datasetName.split('(')[0].trim()}</span>
                    <span className="text-slate-400">({ds.species.split(' ')[0]})</span>
                    <span className="text-slate-400">{ds.genes.length}g</span>
                    {isHidden ? <EyeOff size={10} className="text-slate-400" /> : <Eye size={10} className="text-slate-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Gene Categories</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(GENE_CATEGORY_CONFIG).filter(([k]) => k !== 'other').map(([cat, config]) => {
                const isVisible = filters.visibleCategories.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all border ${
                      isVisible
                        ? 'border-slate-600 bg-slate-800 text-white'
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 opacity-50'
                    }`}
                    data-testid={`button-toggle-category-${cat}`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isVisible ? config.color : '#475569' }} />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Search size={12} /> Find & Toggle Genes
            </h4>
            <div className="relative">
              <Input
                value={geneSearch}
                onChange={(e) => setGeneSearch(e.target.value)}
                placeholder="Search genes (e.g. Per2, CLOCK, Bax)..."
                className="bg-slate-900/50 border-slate-600 text-white text-xs h-8 pl-8"
                data-testid="input-gene-search"
              />
              <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
              {geneSearch && (
                <button onClick={() => setGeneSearch('')} className="absolute right-2 top-1.5 text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {searchResults.map(gene => {
                  const isHidden = filters.hiddenGenes.has(gene);
                  const isHighlighted = filters.highlightedGenes.has(gene);
                  const genePoints = allPoints.filter(p => p.gene === gene);
                  const geneType = genePoints[0]?.geneType || 'target';
                  const meanEv = genePoints.length > 0 ? (genePoints.reduce((s, p) => s + p.eigenvalue, 0) / genePoints.length) : 0;
                  return (
                    <div key={gene} className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${
                      isHidden ? 'bg-slate-900 border-slate-700 text-slate-400' :
                      isHighlighted ? 'bg-cyan-900/40 border-cyan-600 text-cyan-300' :
                      'bg-slate-800 border-slate-600 text-white'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GENE_CATEGORY_CONFIG[geneType as GeneCategory]?.color || '#64748b' }} />
                      <span className="font-mono">{gene}</span>
                      <span className="text-slate-400 text-[10px]">|λ|={meanEv.toFixed(3)}</span>
                      <button
                        onClick={() => toggleGeneVisibility(gene)}
                        className="ml-1 hover:text-white"
                        title={isHidden ? 'Show gene' : 'Hide gene'}
                        data-testid={`button-toggle-gene-${gene}`}
                      >
                        {isHidden ? <Eye size={10} /> : <EyeOff size={10} />}
                      </button>
                      <button
                        onClick={() => toggleHighlight(gene)}
                        className={`hover:text-cyan-300 ${isHighlighted ? 'text-cyan-400' : ''}`}
                        title={isHighlighted ? 'Remove highlight' : 'Highlight gene'}
                        data-testid={`button-highlight-gene-${gene}`}
                      >
                        ★
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {(filters.hiddenGenes.size > 0 || filters.highlightedGenes.size > 0) && (
            <div className="flex flex-wrap gap-2">
              {filters.hiddenGenes.size > 0 && (
                <div className="text-xs">
                  <span className="text-slate-400">Hidden: </span>
                  {Array.from(filters.hiddenGenes).map(gene => (
                    <button
                      key={gene}
                      onClick={() => toggleGeneVisibility(gene)}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-900/30 text-red-300 text-[10px] mr-1 hover:bg-red-900/50 border border-red-800/50"
                      data-testid={`button-unhide-gene-${gene}`}
                    >
                      {gene} <X size={8} />
                    </button>
                  ))}
                </div>
              )}
              {filters.highlightedGenes.size > 0 && (
                <div className="text-xs">
                  <span className="text-slate-400">Highlighted: </span>
                  {Array.from(filters.highlightedGenes).map(gene => (
                    <button
                      key={gene}
                      onClick={() => toggleHighlight(gene)}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-300 text-[10px] mr-1 hover:bg-cyan-900/50 border border-cyan-800/50"
                      data-testid={`button-unhighlight-gene-${gene}`}
                    >
                      ★ {gene} <X size={8} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RootSpace3DVisualization({ data, filters, toggleDataset, overlayGenes }: { data: RootSpaceData; filters: FilterState; toggleDataset: (id: string) => void; overlayGenes?: GenomeSearchGene[] }) {
  const [showDropLines, setShowDropLines] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const allPoints = useMemo(() => {
    const pts: Gene3DPoint[] = [];
    for (const ds of data.datasets) {
      for (const g of ds.genes) {
        pts.push({
          beta1: g.beta1,
          beta2: g.beta2,
          eigenvalue: g.eigenvalue,
          gene: g.gene,
          geneType: g.geneType,
          datasetId: ds.datasetId,
          datasetName: ds.datasetName,
          r2: g.r2,
        });
      }
    }
    return pts;
  }, [data]);

  const filteredPoints = useMemo(() => {
    return allPoints.filter(p => {
      if (filters.highlightedGenes.has(p.gene)) return true;
      if (filters.hiddenDatasets.has(p.datasetId)) return false;
      if (filters.hiddenGenes.has(p.gene)) return false;
      if (!filters.visibleCategories.has(p.geneType)) return false;
      return true;
    });
  }, [allPoints, filters]);

  const clockMeanEv = useMemo(() => {
    const clockPts = filteredPoints.filter(p => p.geneType === 'clock');
    return clockPts.length > 0 ? clockPts.reduce((s, p) => s + p.eigenvalue, 0) / clockPts.length : 0;
  }, [filteredPoints]);

  const targetMeanEv = useMemo(() => {
    const targetPts = filteredPoints.filter(p => p.geneType === 'target');
    return targetPts.length > 0 ? targetPts.reduce((s, p) => s + p.eigenvalue, 0) / targetPts.length : 0;
  }, [filteredPoints]);

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Box size={18} className="text-cyan-400" />
          3D Root-Space Landscape (β₁ × β₂ × |λ|)
        </CardTitle>
        <CardDescription className="text-slate-400">
          AR(2) coefficients on the ground plane (stationarity triangle), eigenvalue modulus as height.
          Clock genes (bright, large) cluster at higher altitudes than targets — visualizing the persistence hierarchy.
          Drag to rotate, scroll to zoom.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <Button
            variant={showDropLines ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setShowDropLines(!showDropLines)}
            data-testid="button-toggle-droplines"
          >
            {showDropLines ? 'Hide' : 'Show'} Drop Lines
          </Button>
          <Button
            variant={autoRotate ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setAutoRotate(!autoRotate)}
            data-testid="button-toggle-rotate"
          >
            {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
          </Button>
          <div className="ml-auto flex items-center gap-4 text-xs text-slate-400">
            {filters.visibleCategories.has('clock') && <span>Clock mean |λ|: <span className="text-cyan-300 font-mono">{clockMeanEv.toFixed(4)}</span></span>}
            {filters.visibleCategories.has('target') && <span>Target mean |λ|: <span className="text-slate-300 font-mono">{targetMeanEv.toFixed(4)}</span></span>}
          </div>
        </div>

        <div className="w-full h-[500px] rounded-lg overflow-hidden bg-slate-950 border border-slate-700" data-testid="container-3d-rootspace">
          <WebGLErrorBoundary fallbackMessage="WebGL is not available in this browser. Open the page in Chrome, Firefox, or Safari to see the interactive 3D root-space scatter plot. The 2D overlay views below work without WebGL.">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          }>
            <Canvas
              camera={{ position: [4, 3, 4], fov: 50 }}
              gl={{ antialias: true, alpha: false }}
              onCreated={({ gl }) => { gl.setClearColor('#020617'); }}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 8, 5]} intensity={0.8} />
              <pointLight position={[-3, 4, -2]} intensity={0.3} color="#22d3ee" />

              <OrbitControls
                enableDamping
                dampingFactor={0.1}
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
                minDistance={2}
                maxDistance={15}
                target={[0, 0.8, 0]}
              />

              <StationarityTriangleWireframe />
              <AxisLabels />
              <TickMarks />

              {filters.visibleCategories.has('clock') && <EigenvaluePlane height={clockMeanEv} label={`Clock mean: ${clockMeanEv.toFixed(3)}`} color="#22d3ee" />}
              {filters.visibleCategories.has('target') && <EigenvaluePlane height={targetMeanEv} label={`Target mean: ${targetMeanEv.toFixed(3)}`} color="#94a3b8" />}

              {filteredPoints.map((p, i) => (
                <GenePoint
                  key={`${p.datasetId}-${p.gene}-${i}`}
                  point={p}
                  scale={filters.highlightedGenes.has(p.gene) ? 1.8 : 1}
                />
              ))}

              {showDropLines && filteredPoints.filter(p => p.geneType === 'clock' || filters.highlightedGenes.has(p.gene)).map((p, i) => (
                <DropLine key={`drop-${p.datasetId}-${p.gene}-${i}`} point={p} />
              ))}

              {overlayGenes?.map((g, i) => {
                const catColor = new THREE.Color(getCategoryColor(g));
                return g.isFibonacci ? (
                  <group key={`overlay-${g.gene}-${i}`} position={[g.beta1, g.eigenvalue * 2, g.beta2]}>
                    <mesh rotation={[0, Math.PI / 4, 0]}>
                      <octahedronGeometry args={[0.1, 0]} />
                      <meshStandardMaterial
                        color={catColor}
                        emissive={catColor}
                        emissiveIntensity={0.8}
                        transparent
                        opacity={0.95}
                        roughness={0.1}
                        metalness={0.5}
                      />
                    </mesh>
                    <mesh>
                      <ringGeometry args={[0.12, 0.15, 32]} />
                      <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                  </group>
                ) : (
                  <mesh key={`overlay-${g.gene}-${i}`} position={[g.beta1, g.eigenvalue * 2, g.beta2]}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial
                      color={catColor}
                      emissive={catColor}
                      emissiveIntensity={0.6}
                      transparent
                      opacity={0.95}
                      roughness={0.2}
                      metalness={0.3}
                    />
                  </mesh>
                );
              })}
            </Canvas>
          </Suspense>
          </WebGLErrorBoundary>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs">
          {data.datasets.map(ds => (
            <button
              key={ds.datasetId}
              onClick={() => toggleDataset(ds.datasetId)}
              className={`flex items-center gap-1 transition-opacity ${filters.hiddenDatasets.has(ds.datasetId) ? 'opacity-30 line-through' : ''}`}
              data-testid={`legend-dataset-${ds.datasetId}`}
            >
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: DATASET_COLORS[ds.datasetId] || '#94a3b8' }} />
              {ds.datasetName.split('(')[0].trim()}
            </button>
          ))}
          <span className="flex items-center gap-2 ml-3 border-l border-slate-700 pl-3">
            {Object.entries(GENE_CATEGORY_CONFIG).filter(([k]) => k !== 'other').map(([cat, cfg]) => (
              <span key={cat} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cfg.color }} />{cfg.label}</span>
            ))}
          </span>
        </div>
        <div className="mt-3 text-xs text-slate-400 space-y-1">
          <p>The ground plane shows the stationarity triangle (β₂ boundaries in gray) and oscillatory parabola (gold). Height encodes eigenvalue magnitude |λ| — how persistent a gene's expression is across time points. Clock genes consistently "float" higher than targets, confirming the temporal persistence hierarchy in 3D coefficient space.</p>
          <p>Horizontal reference planes mark the mean |λ| for clock (cyan) and target (gray) gene categories. The visible separation between these planes is the Gearbox Hypothesis in three dimensions.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function GridDensityHeatmap({ genes, xKey, yKey, xDomain, yDomain, gridSize = 25 }: {
  genes: { [k: string]: number }[];
  xKey: string;
  yKey: string;
  xDomain: [number, number];
  yDomain: [number, number];
  gridSize?: number;
}) {
  const densityData = useMemo(() => {
    const [xMin, xMax] = xDomain;
    const [yMin, yMax] = yDomain;
    const cellW = (xMax - xMin) / gridSize;
    const cellH = (yMax - yMin) / gridSize;
    const counts: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    let maxCount = 0;

    for (const g of genes) {
      const xi = Math.floor((g[xKey] - xMin) / cellW);
      const yi = Math.floor((g[yKey] - yMin) / cellH);
      if (xi >= 0 && xi < gridSize && yi >= 0 && yi < gridSize) {
        counts[xi][yi]++;
        if (counts[xi][yi] > maxCount) maxCount = counts[xi][yi];
      }
    }

    const cells: { x: number; y: number; w: number; h: number; intensity: number; count: number }[] = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (counts[i][j] === 0) continue;
        const intensity = counts[i][j] / maxCount;
        cells.push({
          x: xMin + i * cellW,
          y: yMin + j * cellH,
          w: cellW,
          h: cellH,
          intensity,
          count: counts[i][j],
        });
      }
    }
    return { cells, maxCount };
  }, [genes, xKey, yKey, xDomain, yDomain, gridSize]);

  const svgW = 560;
  const svgH = 400;
  const margin = { top: 10, right: 30, bottom: 40, left: 50 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;

  const toSvgX = (v: number) => margin.left + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotW;
  const toSvgY = (v: number) => margin.top + plotH - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotH;
  const cellSvgW = (densityData.cells[0]?.w || 0.1) / (xDomain[1] - xDomain[0]) * plotW;
  const cellSvgH = (densityData.cells[0]?.h || 0.1) / (yDomain[1] - yDomain[0]) * plotH;

  const getHeatColor = (intensity: number) => {
    if (intensity < 0.2) return `rgba(30,58,138,${0.3 + intensity * 2})`;
    if (intensity < 0.4) return `rgba(37,99,235,${0.4 + intensity})`;
    if (intensity < 0.6) return `rgba(6,182,212,${0.5 + intensity * 0.5})`;
    if (intensity < 0.8) return `rgba(250,204,21,${0.6 + intensity * 0.3})`;
    return `rgba(239,68,68,${0.7 + intensity * 0.3})`;
  };

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
      <rect width={svgW} height={svgH} fill="#0f172a" />
      {densityData.cells.map((cell, i) => (
        <rect
          key={i}
          x={toSvgX(cell.x)}
          y={toSvgY(cell.y + cell.h)}
          width={Math.max(cellSvgW, 1)}
          height={Math.max(cellSvgH, 1)}
          fill={getHeatColor(cell.intensity)}
          rx={2}
        >
          <title>{cell.count} genes</title>
        </rect>
      ))}
      <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH} stroke="#475569" />
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH} stroke="#475569" />
      <text x={svgW / 2} y={svgH - 4} fill="#94a3b8" fontSize="11" textAnchor="middle">{xKey === 'beta1' ? 'β₁' : xKey}</text>
      <text x={14} y={svgH / 2} fill="#94a3b8" fontSize="11" textAnchor="middle" transform={`rotate(-90, 14, ${svgH / 2})`}>{yKey === 'beta2' ? 'β₂' : yKey}</text>
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const v = xDomain[0] + f * (xDomain[1] - xDomain[0]);
        return <text key={`x${f}`} x={toSvgX(v)} y={margin.top + plotH + 16} fill="#94a3b8" fontSize="9" textAnchor="middle">{v.toFixed(1)}</text>;
      })}
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const v = yDomain[0] + f * (yDomain[1] - yDomain[0]);
        return <text key={`y${f}`} x={margin.left - 8} y={toSvgY(v) + 3} fill="#94a3b8" fontSize="9" textAnchor="end">{v.toFixed(1)}</text>;
      })}
      <g transform={`translate(${margin.left + plotW - 120}, ${margin.top + 8})`}>
        <text x={0} y={0} fill="#94a3b8" fontSize="9" fontWeight="bold">Gene Density</text>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <rect key={i} x={i * 22} y={6} width={20} height={8} fill={getHeatColor(v)} rx={1} />
        ))}
        <text x={0} y={24} fill="#94a3b8" fontSize="8">Low</text>
        <text x={88} y={24} fill="#94a3b8" fontSize="8">High</text>
      </g>
      <text x={margin.left + plotW - 6} y={margin.top + plotH - 6} fill="#475569" fontSize="9" textAnchor="end">{genes.length} genes</text>
    </svg>
  );
}

function StationarityTrianglePlot({ data, filters, toggleDataset, overlayGenes }: { data: RootSpaceData; filters: FilterState; toggleDataset: (id: string) => void; overlayGenes?: GenomeSearchGene[] }) {
  const [viewMode, setViewMode] = useState<'dots' | 'density'>('dots');

  const triangleLines = [
    ...Array.from({ length: 50 }, (_, i) => {
      const b1 = -2 + (i / 49) * 4;
      return { b1, edge1: -1, edge2: 1 - b1, edge3: 1 + b1 };
    })
  ];

  const allVisibleGenes = useMemo(() => {
    const genes: { beta1: number; beta2: number }[] = [];
    for (const ds of data.datasets) {
      const filtered = applyFilters(ds.genes, ds.datasetId, filters);
      for (const g of filtered) genes.push({ beta1: g.beta1, beta2: g.beta2 });
    }
    return genes;
  }, [data, filters]);

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Triangle size={18} className="text-cyan-400" />
              Stationarity Triangle (β₁, β₂)
            </CardTitle>
            <CardDescription className="text-slate-400">
              AR(2) coefficient space. Triangle = stationary region. Parabola = oscillatory boundary. Star = Fibonacci reference (1,1) — outside stability. Note: Fibonacci positioning is exploratory and may reflect mathematical properties rather than biological mechanism.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5" data-testid="view-mode-toggle-triangle">
            <button
              onClick={() => setViewMode('dots')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewMode === 'dots' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              data-testid="button-view-dots-triangle"
            >
              Dots
            </button>
            <button
              onClick={() => setViewMode('density')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewMode === 'density' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              data-testid="button-view-density-triangle"
            >
              Density
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'density' ? (
          <GridDensityHeatmap
            genes={allVisibleGenes}
            xKey="beta1"
            yKey="beta2"
            xDomain={[-2.5, 2.5]}
            yDomain={[-1.5, 1.5]}
            gridSize={30}
          />
        ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[-2.5, 2.5]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: 'β₁', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
              name="β₁"
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[-1.5, 1.5]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: 'β₂', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
              name="β₂"
            />
            <Tooltip
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                if (d.lineType) return null;
                return (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs shadow-xl">
                    <div className="font-bold text-white">{d.gene || 'Fibonacci (1,1)'}</div>
                    {d.dataset && <div className="text-gray-300">{d.dataset}</div>}
                    {d.type && <div className="text-gray-300">{d.type} gene</div>}
                    <div className="text-blue-300">β₁={d.x?.toFixed(3)}, β₂={d.y?.toFixed(3)}</div>
                  </div>
                );
              }}
            />
            <Scatter data={triangleLines.map(t => ({ x: t.b1, y: t.edge1, lineType: true }))} fill="none" line={{ stroke: '#475569', strokeWidth: 2, strokeDasharray: '8 4' }} shape={(() => <circle r={0} />) as any} name="β₂ > -1" legendType="none" />
            <Scatter data={triangleLines.map(t => ({ x: t.b1, y: t.edge2, lineType: true }))} fill="none" line={{ stroke: '#475569', strokeWidth: 2, strokeDasharray: '8 4' }} shape={(() => <circle r={0} />) as any} name="β₂ < 1-β₁" legendType="none" />
            <Scatter data={triangleLines.map(t => ({ x: t.b1, y: t.edge3, lineType: true }))} fill="none" line={{ stroke: '#475569', strokeWidth: 2, strokeDasharray: '8 4' }} shape={(() => <circle r={0} />) as any} name="β₂ < 1+β₁" legendType="none" />
            <Scatter data={data.triangle.oscillatoryParabola.map((p: any) => ({ x: p.x, y: p.y, lineType: true }))} fill="none" line={{ stroke: '#eab308', strokeWidth: 1.5, strokeDasharray: '4 2' }} shape={(() => <circle r={0} />) as any} name="Oscillatory" legendType="none" />
            {data.datasets.map(ds => {
              const filtered = applyFilters(ds.genes, ds.datasetId, filters);
              if (filtered.length === 0) return null;
              return (
                <Scatter
                  key={ds.datasetId}
                  data={filtered.map(g => ({ x: g.beta1, y: g.beta2, gene: g.gene, type: g.geneType, dataset: ds.datasetName, highlighted: filters.highlightedGenes.has(g.gene) }))}
                  fill={DATASET_COLORS[ds.datasetId] || '#94a3b8'}
                  name={ds.datasetName}
                >
                  {filtered.map((g, i) => (
                    <Cell
                      key={i}
                      fill={filters.highlightedGenes.has(g.gene) ? '#facc15' : (GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8')}
                      opacity={filters.highlightedGenes.has(g.gene) ? 1 : (g.geneType === 'clock' ? 0.8 : 0.4)}
                      r={filters.highlightedGenes.has(g.gene) ? 6 : (g.geneType === 'clock' ? 3.5 : 2.5)}
                      stroke={filters.highlightedGenes.has(g.gene) ? '#facc15' : (GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8')}
                      strokeWidth={0.5}
                      strokeOpacity={filters.highlightedGenes.has(g.gene) ? 1 : 0.6}
                    />
                  ))}
                </Scatter>
              );
            })}
            {overlayGenes && overlayGenes.filter(g => !g.isFibonacci).length > 0 && (
              <Scatter
                data={overlayGenes.filter(g => !g.isFibonacci).map(g => ({ x: g.beta1, y: g.beta2, gene: g.gene, type: g.geneCategory || g.geneType }))}
                fill="#94a3b8"
                name="Search Results"
              >
                {overlayGenes.filter(g => !g.isFibonacci).map((g, i) => (
                  <Cell key={i} fill={getCategoryColor(g)} opacity={0.9} r={5} stroke={getCategoryColor(g)} strokeWidth={1} />
                ))}
              </Scatter>
            )}
            {overlayGenes && overlayGenes.filter(g => g.isFibonacci).length > 0 && (
              <Scatter
                data={overlayGenes.filter(g => g.isFibonacci).map(g => ({ x: g.beta1, y: g.beta2, gene: g.gene, type: g.geneCategory || g.geneType }))}
                fill="#f59e0b"
                shape="diamond"
                name="Fibonacci Cluster"
              >
                {overlayGenes.filter(g => g.isFibonacci).map((g, i) => (
                  <Cell key={i} fill={getCategoryColor(g)} stroke="#f59e0b" strokeWidth={2} opacity={0.95} r={7} />
                ))}
              </Scatter>
            )}
            <Scatter
              data={[{ x: 1, y: 1 }]}
              fill="#f97316"
              shape="star"
              name="Fibonacci (1,1)"
            />
            <Scatter
              data={[{ x: -1, y: 1 }]}
              fill="#3b82f6"
              shape="triangle"
              name="Anti-Fibonacci (-1,1)"
            />
          </ScatterChart>
        </ResponsiveContainer>
        )}
        <div className="flex flex-wrap gap-3 mt-2 justify-center text-xs">
          {data.datasets.map(ds => (
            <button
              key={ds.datasetId}
              onClick={() => toggleDataset(ds.datasetId)}
              className={`flex items-center gap-1 transition-opacity ${filters.hiddenDatasets.has(ds.datasetId) ? 'opacity-30 line-through' : ''}`}
              data-testid={`legend-triangle-${ds.datasetId}`}
            >
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: DATASET_COLORS[ds.datasetId] || '#94a3b8' }} />
              {ds.datasetName.split('(')[0].trim()}
            </button>
          ))}
          <span className="flex items-center gap-1">
            <span className="text-orange-400">★</span> Fibonacci (1,1)
          </span>
          <span className="flex items-center gap-2 ml-3 border-l border-slate-700 pl-3">
            {Object.entries(GENE_CATEGORY_CONFIG).filter(([k]) => k !== 'other').map(([cat, cfg]) => (
              <span key={cat} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cfg.color }} />{cfg.label}</span>
            ))}
          </span>
          {overlayGenes && overlayGenes.some(g => g.isFibonacci) && (
            <span className="flex items-center gap-1 ml-3 border-l border-slate-700 pl-3">
              <span className="w-3 h-3 inline-block rotate-45 border-2 border-amber-500" style={{ backgroundColor: 'transparent' }} />
              <span className="text-amber-400">Fibonacci Cluster</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RootSpaceScatterPlot({ data, filters, toggleDataset, overlayGenes }: { data: RootSpaceData; filters: FilterState; toggleDataset: (id: string) => void; overlayGenes?: GenomeSearchGene[] }) {
  const [viewMode, setViewMode] = useState<'dots' | 'density'>('dots');

  const allVisibleGenes = useMemo(() => {
    const genes: { x: number; y: number }[] = [];
    for (const ds of data.datasets) {
      const filtered = applyFilters(ds.genes, ds.datasetId, filters);
      for (const g of filtered) genes.push({ x: g.x, y: g.y });
    }
    return genes;
  }, [data, filters]);

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Crosshair size={18} className="text-violet-400" />
              Root-Space Scatter (r·cos θ, r·sin θ)
            </CardTitle>
            <CardDescription className="text-slate-400">
              Eigenvalue roots in Cartesian coordinates. Each point = one gene. Distance from origin = damping rate (r). Angle = oscillation phase advance (θ).
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5" data-testid="view-mode-toggle-scatter">
            <button
              onClick={() => setViewMode('dots')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewMode === 'dots' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              data-testid="button-view-dots-scatter"
            >
              Dots
            </button>
            <button
              onClick={() => setViewMode('density')}
              className={`px-2 py-1 text-xs rounded transition-colors ${viewMode === 'density' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              data-testid="button-view-density-scatter"
            >
              Density
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'density' ? (
          <GridDensityHeatmap
            genes={allVisibleGenes}
            xKey="x"
            yKey="y"
            xDomain={[-1.1, 1.1]}
            yDomain={[-0.2, 1.1]}
            gridSize={30}
          />
        ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[-1.1, 1.1]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: 'r·cos(θ)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[-0.2, 1.1]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: 'r·sin(θ)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
              formatter={(value: any, name: string) => [typeof value === 'number' ? value.toFixed(4) : value, name]}
              labelFormatter={() => ''}
            />
            {data.datasets.map(ds => {
              const filtered = applyFilters(ds.genes, ds.datasetId, filters);
              if (filtered.length === 0) return null;
              return (
                <Scatter
                  key={ds.datasetId}
                  data={filtered.map(g => ({
                    x: g.x,
                    y: g.y,
                    gene: g.gene,
                    r: g.r,
                    theta: g.theta,
                    type: g.geneType,
                    dPhi: g.dPhi,
                  }))}
                  fill={DATASET_COLORS[ds.datasetId] || '#94a3b8'}
                  name={ds.condition}
                >
                  {filtered.map((g, i) => (
                    <Cell
                      key={i}
                      fill={filters.highlightedGenes.has(g.gene) ? '#facc15' : (GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8')}
                      opacity={filters.highlightedGenes.has(g.gene) ? 1 : (g.geneType === 'clock' ? 0.8 : 0.4)}
                      r={filters.highlightedGenes.has(g.gene) ? 6 : (g.geneType === 'clock' ? 3.5 : 2.5)}
                      stroke={filters.highlightedGenes.has(g.gene) ? '#facc15' : (GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8')}
                      strokeWidth={0.5}
                      strokeOpacity={filters.highlightedGenes.has(g.gene) ? 1 : 0.6}
                    />
                  ))}
                </Scatter>
              );
            })}
            {overlayGenes && overlayGenes.filter(g => !g.isFibonacci).length > 0 && (
              <Scatter
                data={overlayGenes.filter(g => !g.isFibonacci).map(g => ({ x: g.x, y: g.y, gene: g.gene, r: g.r, theta: g.theta, type: g.geneCategory || g.geneType, dPhi: g.dPhi }))}
                fill="#94a3b8"
                name="Search Results"
              >
                {overlayGenes.filter(g => !g.isFibonacci).map((g, i) => (
                  <Cell key={i} fill={getCategoryColor(g)} opacity={0.9} r={5} stroke={getCategoryColor(g)} strokeWidth={1} />
                ))}
              </Scatter>
            )}
            {overlayGenes && overlayGenes.filter(g => g.isFibonacci).length > 0 && (
              <Scatter
                data={overlayGenes.filter(g => g.isFibonacci).map(g => ({ x: g.x, y: g.y, gene: g.gene, r: g.r, theta: g.theta, type: g.geneCategory || g.geneType, dPhi: g.dPhi }))}
                fill="#f59e0b"
                shape="diamond"
                name="Fibonacci Cluster"
              >
                {overlayGenes.filter(g => g.isFibonacci).map((g, i) => (
                  <Cell key={i} fill={getCategoryColor(g)} stroke="#f59e0b" strokeWidth={2} opacity={0.95} r={7} />
                ))}
              </Scatter>
            )}
          </ScatterChart>
        </ResponsiveContainer>
        )}
        <div className="flex flex-wrap gap-3 mt-2 justify-center text-xs">
          {data.datasets.map(ds => {
            const visCount = applyFilters(ds.genes, ds.datasetId, filters).length;
            return (
              <button
                key={ds.datasetId}
                onClick={() => toggleDataset(ds.datasetId)}
                className={`flex items-center gap-1 transition-opacity ${filters.hiddenDatasets.has(ds.datasetId) ? 'opacity-30 line-through' : ''}`}
                data-testid={`legend-scatter-${ds.datasetId}`}
              >
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: DATASET_COLORS[ds.datasetId] || '#94a3b8' }} />
                {ds.condition} ({visCount} genes)
              </button>
            );
          })}
          <span className="flex items-center gap-2 ml-3 border-l border-slate-700 pl-3">
            {Object.entries(GENE_CATEGORY_CONFIG).filter(([k]) => k !== 'other').map(([cat, cfg]) => (
              <span key={cat} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cfg.color }} />{cfg.label}</span>
            ))}
          </span>
          {overlayGenes && overlayGenes.some(g => g.isFibonacci) && (
            <span className="flex items-center gap-1 ml-3 border-l border-slate-700 pl-3">
              <span className="w-3 h-3 inline-block rotate-45 border-2 border-amber-500" style={{ backgroundColor: 'transparent' }} />
              <span className="text-amber-400">Fibonacci Cluster</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DPhiHistogram({ data }: { data: RootSpaceData }) {
  const allObs = data.datasets.flatMap(ds => ds.genes.map(g => g.dPhi));
  const phaseNull = data.nullDistributions.find(n => n.nullType.includes('Phase'));
  const uniformNull = data.nullDistributions.find(n => n.nullType.includes('Uniform'));

  const bins = 20;
  const maxVal = Math.max(...allObs, ...(phaseNull?.dPhiValues || []), ...(uniformNull?.dPhiValues || []));
  const binWidth = (maxVal + 0.1) / bins;

  function histogram(vals: number[]): { bin: string; count: number; mid: number }[] {
    const counts = new Array(bins).fill(0);
    for (const v of vals) {
      const idx = Math.min(Math.floor(v / binWidth), bins - 1);
      counts[idx]++;
    }
    return counts.map((c, i) => ({
      bin: (i * binWidth).toFixed(1),
      count: vals.length > 0 ? +(c / vals.length).toFixed(4) : 0,
      mid: (i + 0.5) * binWidth,
    }));
  }

  const obsHist = histogram(allObs);
  const phaseHist = phaseNull ? histogram(phaseNull.dPhiValues) : [];
  const uniformHist = uniformNull ? histogram(uniformNull.dPhiValues) : [];

  const merged = obsHist.map((o, i) => ({
    bin: o.bin,
    observed: o.count,
    phaseNull: phaseHist[i]?.count || 0,
    uniformNull: uniformHist[i]?.count || 0,
  }));

  return (
    <Card id="phi-enrichment" className="bg-slate-900/50 border-slate-700 scroll-mt-20 transition-all duration-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <FlaskConical size={18} className="text-amber-400" />
          D_φ Distribution: Observed vs Null
        </CardTitle>
        <CardDescription className="text-slate-400">
          Golden-mean proximity distance (D_φ). Lower = closer to φ-reference geometry. Observed biological data vs phase-randomized and uniform-triangle nulls. Reference parameters: θ_φ = 2π/φ ≈ 222.5° (golden angle) and r_ref = 0.7 are imposed geometric choices, not data-derived.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="bin" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'D_φ', position: 'bottom', fill: '#94a3b8' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Density', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="observed" name="Observed (biological)" fill="#22d3ee" opacity={0.9} />
            <Bar dataKey="phaseNull" name="Phase-Randomized Null" fill="#94a3b8" opacity={0.6} />
            <Bar dataKey="uniformNull" name="Uniform Triangle Null" fill="#475569" opacity={0.4} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ThresholdSweepChart({ sweep }: { sweep: ThresholdSweepPoint[] }) {
  const enrichmentData = sweep.map(s => ({
    threshold: s.threshold,
    observed: +(s.observedFraction * 100).toFixed(1),
    null: +(s.nullFraction * 100).toFixed(1),
    enrichment: s.enrichmentRatio,
  }));

  const maxEnrichment = Math.max(...sweep.map(s => s.enrichmentRatio));
  const peakThreshold = sweep.find(s => s.enrichmentRatio === maxEnrichment);

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Crosshair size={18} className="text-emerald-400" />
          φ-Band Occupancy vs Threshold Curve
        </CardTitle>
        <CardDescription className="text-slate-400">
          Fraction of genes within D_φ {'<'} threshold, swept from 0.2 to 4.0. Solid line = observed biological data, dashed = analytical null (10K uniform AR(2) draws). 
          {peakThreshold && (
            <span className="text-emerald-300"> Peak enrichment: {maxEnrichment.toFixed(2)}× at D_φ {'<'} {peakThreshold.threshold}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={enrichmentData} margin={{ top: 10, right: 50, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="threshold" 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              label={{ value: 'D_φ Threshold', position: 'bottom', offset: 10, fill: '#94a3b8', fontSize: 12 }} 
            />
            <YAxis 
              yAxisId="left" 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              label={{ value: 'Cumulative %', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: '#fbbf24', fontSize: 11 }} 
              label={{ value: 'Enrichment Ratio', angle: 90, position: 'insideRight', fill: '#fbbf24', fontSize: 11 }}
              domain={[0, 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} 
              formatter={(value: number, name: string) => {
                if (name === 'enrichment') return [`${value.toFixed(2)}×`, 'Enrichment'];
                return [`${value.toFixed(1)}%`, name === 'observed' ? 'Observed (biological)' : 'Null (uniform triangle)'];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <ReferenceLine yAxisId="right" y={1} stroke="#fbbf24" strokeDasharray="6 3" strokeOpacity={0.5} />
            <ReferenceLine x={1.0} stroke="#22d3ee" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'D_φ=1.0', position: 'top', fill: '#22d3ee', fontSize: 10 }} yAxisId="left" />
            <Line yAxisId="left" type="monotone" dataKey="observed" name="Observed (biological)" stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: '#22d3ee', r: 3 }} />
            <Line yAxisId="left" type="monotone" dataKey="null" name="Null (uniform triangle)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: '#94a3b8', r: 2 }} />
            <Line yAxisId="right" type="monotone" dataKey="enrichment" name="Enrichment ratio" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-3 text-xs text-slate-400 space-y-1">
          <p>If enrichment were a threshold artifact, the ratio (amber line) would spike at one cutoff and collapse elsewhere. A sustained enrichment above 1.0× across a range of thresholds indicates genuine structure.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ThetaDistributionChart({ bins, thetaPhiRef }: { bins: ThetaBin[]; thetaPhiRef: number }) {
  const chartData = bins.map(b => ({
    label: b.binLabel,
    observed: +(b.observedDensity * 100).toFixed(1),
    null: +(b.nullDensity * 100).toFixed(1),
    center: b.binCenter,
  }));

  const phiRefDeg = (thetaPhiRef * 180 / Math.PI).toFixed(0);
  const phiRefBinLabel = bins.find(b => {
    const lo = b.binCenter - Math.PI / 36;
    const hi = b.binCenter + Math.PI / 36;
    return thetaPhiRef >= lo && thetaPhiRef < hi;
  })?.binLabel;

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Atom size={18} className="text-purple-400" />
          Angular (θ) Distribution: Biology vs Null
        </CardTitle>
        <CardDescription className="text-slate-400">
          Distribution of dominant eigenvalue phase angles across 10° bins (0° to 180°). 
          The golden-angle reference θ_φ = 2π/φ falls at {phiRefDeg}° (outside [0,π] — wraps to {((360 - parseFloat(phiRefDeg)) || phiRefDeg)}°).
          Deviations from the null reveal where biological genes preferentially cluster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="label" 
              tick={{ fill: '#94a3b8', fontSize: 9 }} 
              angle={-45}
              textAnchor="end"
              height={60}
              label={{ value: 'θ (phase angle)', position: 'bottom', offset: 45, fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              label={{ value: 'Density (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} 
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name === 'observed' ? 'Observed (biological)' : 'Null (uniform triangle)']}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="observed" name="Observed (biological)" fill="#a78bfa" opacity={0.9} />
            <Bar dataKey="null" name="Null (uniform triangle)" fill="#475569" opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 text-xs text-slate-400 space-y-1">
          <p>θ = 0° corresponds to monotonic decay (real positive roots). θ = 180° corresponds to sign-alternating dynamics (real negative roots). Angles between 0° and 180° correspond to damped oscillatory dynamics with complex roots. Bins where biology exceeds null indicate preferred oscillatory frequencies.</p>
          <p className="text-slate-400">Note: θ_φ = 2π/φ ≈ {phiRefDeg}° is {'>'} π (180°), so it does not directly appear as a peak in this [0,π] range. The D_φ metric uses circular distance, making it sensitive to proximity from either side.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TestResultsPanel({ tests, shifts }: { tests: EnrichmentTestResult[]; shifts: PerturbationShift[] }) {
  return (
    <div className="space-y-4">
      <Card id="enrichment-tests" className="bg-slate-900/50 border-slate-700 scroll-mt-20 transition-all duration-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Enrichment Tests</CardTitle>
          <CardDescription className="text-slate-400">
            Formal hypothesis tests for golden-mean proximity enrichment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tests.map((t, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white text-sm font-semibold">{t.testName}</h4>
                <Badge className={t.significant ? 'bg-emerald-900/30 text-emerald-300' : 'bg-slate-700 text-slate-300'} data-testid={`badge-test-${i}`}>
                  {t.significant ? 'Significant' : 'Not Significant'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mb-2">{t.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Observed: </span>
                  <span className="text-white font-mono">{t.observedStatistic}</span>
                </div>
                <div>
                  <span className="text-slate-400">Null mean: </span>
                  <span className="text-white font-mono">{t.nullMean}</span>
                </div>
                <div>
                  <span className="text-slate-400">p-value: </span>
                  <span className={`font-mono ${t.pValue < 0.05 ? 'text-emerald-400' : 'text-slate-300'}`}>{t.pValue}</span>
                </div>
                <div>
                  <span className="text-slate-400">Effect size: </span>
                  <span className="text-white font-mono">{t.effectSize}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="perturbation-shifts" className="bg-slate-900/50 border-slate-700 scroll-mt-20 transition-all duration-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Perturbation Shift Analysis</CardTitle>
          <CardDescription className="text-slate-400">
            WT vs disease/disruption: does perturbation shift root-space geometry?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {shifts.map((s, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white text-sm font-semibold">{s.datasetPair}</h4>
                <Badge className={s.significant ? 'bg-red-900/30 text-red-300' : 'bg-slate-700 text-slate-300'} data-testid={`badge-shift-${i}`}>
                  {s.significant ? 'Significant Shift' : 'No Significant Shift'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900/50 rounded p-2">
                  <p className="text-slate-400 mb-1">Damping (r)</p>
                  <p className="text-slate-300">{s.wtLabel}: <span className="text-white font-mono">{s.wtMeanR}</span></p>
                  <p className="text-slate-300">{s.perturbedLabel}: <span className="text-white font-mono">{s.perturbedMeanR}</span></p>
                  <p className="text-slate-400">Shift: <span className={`font-mono ${Math.abs(s.rShift) > 0.05 ? 'text-amber-400' : 'text-slate-300'}`}>{s.rShift > 0 ? '+' : ''}{s.rShift}</span></p>
                </div>
                {s.thetaShift !== undefined && (
                  <div className="bg-slate-900/50 rounded p-2">
                    <p className="text-slate-400 mb-1">Angle (θ, rad)</p>
                    <p className="text-slate-300">{s.wtLabel}: <span className="text-white font-mono">{s.wtMeanTheta?.toFixed(4)}</span></p>
                    <p className="text-slate-300">{s.perturbedLabel}: <span className="text-white font-mono">{s.perturbedMeanTheta?.toFixed(4)}</span></p>
                    <p className="text-slate-400">Δθ: <span className={`font-mono ${Math.abs(s.thetaShift) > 0.1 ? 'text-violet-400' : 'text-slate-300'}`}>{s.thetaShift > 0 ? '+' : ''}{s.thetaShift.toFixed(4)}</span></p>
                  </div>
                )}
                <div className="bg-slate-900/50 rounded p-2">
                  <p className="text-slate-400 mb-1">D_φ (φ-proximity)</p>
                  <p className="text-slate-300">{s.wtLabel}: <span className="text-white font-mono">{s.wtMeanDPhi}</span></p>
                  <p className="text-slate-300">{s.perturbedLabel}: <span className="text-white font-mono">{s.perturbedMeanDPhi}</span></p>
                  <p className="text-slate-400">Shift: <span className={`font-mono ${Math.abs(s.dPhiShift) > 0.1 ? 'text-amber-400' : 'text-slate-300'}`}>{s.dPhiShift > 0 ? '+' : ''}{s.dPhiShift}</span></p>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <p className="text-slate-400 mb-1">Mann-Whitney U Test</p>
                  <p className="text-slate-300">p-value: <span className={`font-mono ${s.mannWhitneyP < 0.05 ? 'text-emerald-400' : 'text-slate-300'}`}>{s.mannWhitneyP}</span></p>
                </div>
              </div>
            </div>
          ))}
          {shifts.length === 0 && (
            <p className="text-slate-400 text-sm">No paired WT/perturbation datasets available for shift analysis.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function generateFullResultsText(data: RootSpaceData): string {
  const lines: string[] = [];
  const { summary } = data;

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  AR(2) ROOT-SPACE GEOMETRY & φ-ENRICHMENT — FULL RESULTS');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push('SUMMARY');
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push(`  Total genes analyzed:      ${summary.totalGenes}`);
  lines.push(`  Total datasets:            ${summary.totalDatasets}`);
  lines.push(`  Mean D_φ:                  ${summary.meanDPhi}`);
  lines.push(`  φ-enriched fraction:       ${(summary.phiEnrichedFraction * 100).toFixed(1)}%`);
  lines.push(`  Perturbation shift:        ${summary.perturbationShiftDetected ? 'DETECTED' : 'Not detected'}`);
  lines.push(`  Overall verdict:           ${summary.overallVerdict}`);
  lines.push('');

  lines.push('ENRICHMENT TESTS');
  lines.push('───────────────────────────────────────────────────────────────');
  for (const t of data.enrichmentTests) {
    lines.push(`  ${t.testName}`);
    lines.push(`    ${t.description}`);
    lines.push(`    Observed: ${t.observedStatistic}  |  Null mean: ${t.nullMean} ± ${t.nullStd}`);
    lines.push(`    p-value: ${t.pValue}  |  Effect size: ${t.effectSize}  |  ${t.significant ? 'SIGNIFICANT' : 'Not significant'}`);
    lines.push('');
  }

  lines.push('PERTURBATION SHIFTS');
  lines.push('───────────────────────────────────────────────────────────────');
  for (const s of data.perturbationShifts) {
    lines.push(`  ${s.datasetPair}`);
    lines.push(`    ${s.wtLabel} → ${s.perturbedLabel}`);
    lines.push(`    r shift:     ${s.wtMeanR} → ${s.perturbedMeanR} (Δ = ${s.rShift})`);
    lines.push(`    D_φ shift:   ${s.wtMeanDPhi} → ${s.perturbedMeanDPhi} (Δ = ${s.dPhiShift})`);
    lines.push(`    Mann-Whitney p = ${s.mannWhitneyP}  |  ${s.significant ? 'SIGNIFICANT' : 'Not significant'}`);
    lines.push('');
  }

  lines.push('PER-DATASET ROOT-SPACE COORDINATES');
  lines.push('═══════════════════════════════════════════════════════════════');
  for (const ds of data.datasets) {
    lines.push(`\n  ${ds.datasetName} (${ds.condition})`);
    lines.push(`  ${ds.species} | ${ds.genes.length} genes`);
    lines.push(`  Clock: mean r=${ds.clockMeanR}, mean θ=${ds.clockMeanTheta}, mean D_φ=${ds.clockMeanDPhi}`);
    lines.push(`  Target: mean r=${ds.targetMeanR}, mean θ=${ds.targetMeanTheta}, mean D_φ=${ds.targetMeanDPhi}`);
    lines.push('');
    lines.push('  Gene            Type     β₁        β₂        r       θ       |λ|     D_φ     R²     Complex');
    lines.push('  ─────────────────────────────────────────────────────────────────────────────────────────────');
    for (const g of ds.genes) {
      const name = g.gene.padEnd(16);
      const type = g.geneType.padEnd(8);
      const b1 = g.beta1.toFixed(4).padStart(9);
      const b2 = g.beta2.toFixed(4).padStart(9);
      const r = g.r.toFixed(4).padStart(7);
      const th = g.theta.toFixed(4).padStart(7);
      const ev = g.eigenvalue.toFixed(4).padStart(7);
      const dp = g.dPhi.toFixed(4).padStart(7);
      const r2 = g.r2.toFixed(3).padStart(6);
      const cx = g.isComplex ? '  Yes' : '  No';
      lines.push(`  ${name}${type}${b1}${b2}${r}${th}${ev}${dp}${r2}${cx}`);
    }
  }

  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  METHODOLOGY');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  AR(2): x_t = β₁·x_{t-1} + β₂·x_{t-2} + ε_t');
  lines.push('  Characteristic polynomial: λ² - β₁λ - β₂ = 0');
  lines.push('  Complex roots: λ = r·e^{±iθ}');
  lines.push('  D_φ = w_r·|ln(r) - ln(r₀)| + w_θ·min(|θ - θ_φ|, 2π - |θ - θ_φ|)');
  lines.push('    where θ_φ = 2π/φ ≈ 3.883 rad, r₀ = 0.7, w_r = w_θ = 1.0');
  lines.push('  Stationarity: β₂ > -1, β₂ < 1-β₁, β₂ < 1+β₁');
  lines.push('  Oscillatory: β₁² + 4β₂ < 0 (discriminant negative)');
  lines.push('  Fibonacci reference: (β₁,β₂) = (1,1) → λ = φ ≈ 1.618 (UNSTABLE)');
  lines.push('  Null 1 (PRIMARY): Phase-randomized surrogates (preserves power spectrum)');
  lines.push('  Null 2 (SECONDARY): Uniform random draws from stationarity triangle');
  lines.push('  Tests: Permutation p-values (N=1000), Mann-Whitney U for shifts');
  lines.push('');
  if (data.methodology) {
    lines.push('  REPRODUCIBILITY & TRANSPARENCY');
    lines.push('  ───────────────────────────────────────────────────────────────');
    lines.push(`  RNG Seed: ${data.methodology.rngSeed} (deterministic)`);
    lines.push(`  Root handling: ${data.methodology.rootHandling}`);
    lines.push(`  Null hierarchy: ${data.methodology.nullHierarchy}`);
    lines.push(`  Multiple testing: ${data.methodology.multipleTestingNote}`);
    lines.push(`  Excluded datasets: ${data.methodology.excludedDatasets}`);
    lines.push('');
  }

  return lines.join('\n');
}

function FullResultsText({ data }: { data: RootSpaceData }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const text = generateFullResultsText(data);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white">Full Results (Copyable Text)</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setExpanded(!expanded)} data-testid="button-toggle-full-results">
            {expanded ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button variant="outline" size="sm" className="border-cyan-700 text-cyan-400 hover:bg-cyan-900/30" onClick={handleCopy} data-testid="button-copy-full-results">
            {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
            {copied ? 'Copied!' : 'Copy All'}
          </Button>
        </div>
      </div>
      {expanded && (
        <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre select-all" data-testid="text-full-results">
          {text}
        </pre>
      )}
    </div>
  );
}

function GenomeWideSearchPanel({ onOverlayChange }: { onOverlayChange: (genes: GenomeSearchGene[]) => void }) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [overlaySet, setOverlaySet] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams = new URLSearchParams();
  if (debouncedQuery) queryParams.set('q', debouncedQuery);
  if (selectedDataset) queryParams.set('dataset', selectedDataset);

  const { data, isLoading } = useQuery<{
    dataset: { id: string; name: string; species: string };
    totalGenes: number;
    query: string;
    searchResults: GenomeSearchGene[];
    fibonacciNearest: GenomeSearchGene[];
    availableDatasets: { id: string; name: string; species: string }[];
  }>({
    queryKey: [`/api/analysis/genome-wide-search?${queryParams.toString()}`],
    staleTime: 1000 * 60 * 5,
  });

  const toggleOverlay = useCallback((gene: GenomeSearchGene) => {
    setOverlaySet(prev => {
      const next = new Set(prev);
      if (next.has(gene.gene)) {
        next.delete(gene.gene);
      } else {
        next.add(gene.gene);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!data) {
      onOverlayChange([]);
      return;
    }
    const fibSet = new Set((data.fibonacciNearest || []).map(g => g.gene));
    const allGenes = [...(data.searchResults || []), ...(data.fibonacciNearest || [])];
    const uniqueMap = new Map<string, GenomeSearchGene>();
    for (const g of allGenes) {
      if (overlaySet.has(g.gene)) {
        uniqueMap.set(g.gene, { ...g, isFibonacci: fibSet.has(g.gene) });
      }
    }
    onOverlayChange(Array.from(uniqueMap.values()));
  }, [overlaySet, data, onOverlayChange]);

  const renderGeneRow = (gene: GenomeSearchGene) => {
    const isOverlaid = overlaySet.has(gene.gene);
    return (
      <div
        key={gene.gene}
        className={`flex items-center justify-between px-3 py-1.5 rounded text-xs border ${
          isOverlaid ? 'bg-amber-900/30 border-amber-600/50' : 'bg-slate-800/50 border-slate-700/50'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(gene) }} />
          <span className="font-mono font-semibold text-white truncate">{gene.gene}</span>
          <Badge className={`text-[10px] px-1 py-0 ${
            GENE_CATEGORY_CONFIG[gene.geneCategory || 'other']?.bgClass || 'bg-slate-700'
          } ${
            GENE_CATEGORY_CONFIG[gene.geneCategory || 'other']?.textClass || 'text-slate-300'
          }`}>
            {GENE_CATEGORY_CONFIG[gene.geneCategory || 'other']?.label || gene.geneType}
          </Badge>
          <span className="text-slate-400">|λ|={gene.eigenvalue.toFixed(3)}</span>
          <span className="text-slate-400">Dφ={gene.dPhi.toFixed(2)}</span>
          {gene.stable && <span className="text-emerald-500 text-[10px]">stable</span>}
        </div>
        <Button
          variant={isOverlaid ? "default" : "outline"}
          size="sm"
          className={`text-[10px] h-5 px-2 ${isOverlaid ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
          onClick={() => toggleOverlay(gene)}
          data-testid={`button-overlay-${gene.gene}`}
        >
          {isOverlaid ? 'Remove' : 'Overlay'}
        </Button>
      </div>
    );
  };

  return (
    <Card className="mb-6 bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Search size={18} className="text-amber-400" />
            Genome-Wide Gene Search
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white text-xs h-7"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-toggle-genome-search"
          >
            {expanded ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        <CardDescription className="text-slate-400">
          Search any gene across genome-wide AR(2) results. Overlay matches onto the visualizations above.
        </CardDescription>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search gene name (e.g. TP53, MYC, BRCA1)..."
                className="bg-slate-900/50 border-slate-600 text-white text-xs h-8 pl-8"
                data-testid="input-genome-search"
              />
              <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-2 top-1.5 text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            {data?.availableDatasets && (
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="bg-slate-900/50 border border-slate-600 text-white text-xs h-8 rounded px-2 min-w-[200px]"
                data-testid="select-genome-dataset"
              >
                <option value="">Mouse Liver (default)</option>
                {data.availableDatasets.map(ds => (
                  <option key={ds.id} value={ds.id}>{ds.name} ({ds.species})</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]" data-testid="legend-gene-categories">
            {(Object.entries(GENE_CATEGORY_CONFIG) as [GeneCategory, typeof GENE_CATEGORY_CONFIG[GeneCategory]][]).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-slate-400">{cfg.label}</span>
              </span>
            ))}
          </div>

          {isLoading && debouncedQuery.length >= 2 && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={12} className="animate-spin" />
              Searching {debouncedQuery}...
            </div>
          )}

          {data && (
            <div className="space-y-4">
              {data.searchResults && data.searchResults.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Search Results ({data.searchResults.length} / {data.totalGenes} genes)
                  </h4>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1" data-testid="container-search-results">
                    {data.searchResults.map(renderGeneRow)}
                  </div>
                </div>
              )}

              {data.searchResults && data.searchResults.length === 0 && debouncedQuery.length >= 2 && (
                <p className="text-xs text-slate-400">No genes found matching "{debouncedQuery}"</p>
              )}

              {data.fibonacciNearest && data.fibonacciNearest.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                      Fibonacci Nearest (Top {data.fibonacciNearest.length})
                    </h4>
                    <div className="flex gap-1.5">
                      {data.fibonacciNearest.every(g => overlaySet.has(g.gene)) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-5 px-2 border-red-600 text-red-400 hover:bg-red-900/30"
                          onClick={() => {
                            const newSet = new Set(overlaySet);
                            data.fibonacciNearest!.forEach(g => newSet.delete(g.gene));
                            setOverlaySet(newSet);
                            onOverlayChange([...(data.searchResults || []), ...(data.fibonacciNearest || [])].filter(g => newSet.has(g.gene)));
                          }}
                          data-testid="button-remove-all-fibonacci"
                        >
                          Remove All
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-5 px-2 border-amber-600 text-amber-400 hover:bg-amber-900/30"
                          onClick={() => {
                            const newSet = new Set(overlaySet);
                            data.fibonacciNearest!.forEach(g => newSet.add(g.gene));
                            setOverlaySet(newSet);
                            onOverlayChange([...(data.searchResults || []), ...(data.fibonacciNearest || [])].filter(g => newSet.has(g.gene)));
                          }}
                          data-testid="button-overlay-all-fibonacci"
                        >
                          Overlay All
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1" data-testid="container-fibonacci-nearest">
                    {data.fibonacciNearest.map(renderGeneRow)}
                  </div>
                </div>
              )}

              {overlaySet.size > 0 && (() => {
                const overlaidGenes = [...(data.searchResults || []), ...(data.fibonacciNearest || [])].filter(g => overlaySet.has(g.gene));
                const catCounts: Record<string, number> = {};
                for (const g of overlaidGenes) {
                  const cat = g.geneCategory || 'other';
                  catCounts[cat] = (catCounts[cat] || 0) + 1;
                }
                return (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300">
                      {overlaySet.size} gene{overlaySet.size > 1 ? 's' : ''} overlaid on visualizations
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {Object.entries(catCounts).map(([cat, count]) => (
                        <span key={cat} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GENE_CATEGORY_CONFIG[cat as GeneCategory]?.color || '#94a3b8' }} />
                          <span className="text-slate-400">{GENE_CATEGORY_CONFIG[cat as GeneCategory]?.label || cat}: {count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function isInTriangle(b1: number, b2: number): boolean {
  return b2 > -1 && b2 < 1 - b1 && b2 < 1 + b1;
}

function computeKDE(genes: GeneRootPoint[], gs: number, bw: number) {
  const xMin = -2.3, xMax = 2.3, yMin = -1.3, yMax = 1.3;
  const dx = (xMax - xMin) / gs;
  const dy = (yMax - yMin) / gs;
  const grid: number[][] = [];
  for (let j = 0; j < gs; j++) {
    grid[j] = [];
    for (let i = 0; i < gs; i++) {
      const cx = xMin + (i + 0.5) * dx;
      const cy = yMin + (j + 0.5) * dy;
      let sum = 0;
      for (const g of genes) {
        const d2 = ((g.beta1 - cx) / bw) ** 2 + ((g.beta2 - cy) / bw) ** 2;
        sum += Math.exp(-d2 / 2);
      }
      grid[j][i] = sum;
    }
  }
  const maxVal = Math.max(...grid.flat()) || 1;
  return { grid, xMin, xMax, yMin, yMax, dx, dy, maxVal };
}

function WaddingtonCombinedView({ genes, categoryFilters }: { genes: GeneRootPoint[]; categoryFilters: Record<string, boolean> }) {
  const [selectedGene, setSelectedGene] = useState<GeneRootPoint | null>(null);
  const [hoveredGene, setHoveredGene] = useState<GeneRootPoint | null>(null);
  const [sliceY, setSliceY] = useState(0.15);
  const [isDragging, setIsDragging] = useState(false);
  const [bandwidth, setBandwidth] = useState(0.35);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const GS = 50;

  const filteredGenes = useMemo(() => {
    return genes.filter(g => categoryFilters[g.geneType] !== false);
  }, [genes, categoryFilters]);

  const kde = useMemo(() => computeKDE(filteredGenes, GS, bandwidth), [filteredGenes, bandwidth]);
  const { grid, xMin, xMax, yMin, yMax, dx, dy, maxVal } = kde;

  const HM_W = 640, HM_H = 440, HM_PAD_L = 50, HM_PAD_R = 20, HM_PAD_T = 15, HM_PAD_B = 35;
  const plotW = HM_W - HM_PAD_L - HM_PAD_R;
  const plotH = HM_H - HM_PAD_T - HM_PAD_B;
  const toSvgXH = (b1: number) => HM_PAD_L + ((b1 - xMin) / (xMax - xMin)) * plotW;
  const toSvgYH = (b2: number) => HM_PAD_T + ((yMax - b2) / (yMax - yMin)) * plotH;
  const fromSvgYH = (sy: number) => yMax - ((sy - HM_PAD_T) / plotH) * (yMax - yMin);

  const heatCells = useMemo(() => {
    const result: { x: number; y: number; w: number; h: number; fill: string }[] = [];
    for (let j = 0; j < GS; j++) {
      for (let i = 0; i < GS; i++) {
        const cx = xMin + (i + 0.5) * dx;
        const cy = yMin + (j + 0.5) * dy;
        if (!isInTriangle(cx, cy)) continue;
        const norm = grid[j][i] / maxVal;
        let fill: string;
        if (norm > 0.6) {
          const t = (norm - 0.6) / 0.4;
          fill = `rgb(${Math.round(250 - t * 20)},${Math.round(220 - t * 180)},${Math.round(50 + t * 20)})`;
        } else if (norm > 0.3) {
          const t = (norm - 0.3) / 0.3;
          fill = `rgb(${Math.round(30 + t * 220)},${Math.round(120 + t * 100)},${Math.round(80 - t * 30)})`;
        } else if (norm > 0.05) {
          const t = (norm - 0.05) / 0.25;
          fill = `rgb(${Math.round(15 + t * 15)},${Math.round(40 + t * 80)},${Math.round(90 - t * 10)})`;
        } else {
          fill = 'rgb(8,12,30)';
        }
        const sx = toSvgXH(cx - dx / 2);
        const sy = toSvgYH(cy + dy / 2);
        const sw = toSvgXH(cx + dx / 2) - sx;
        const sh = toSvgYH(cy - dy / 2) - sy;
        result.push({ x: sx, y: sy, w: Math.max(sw, 1), h: Math.max(sh, 1), fill });
      }
    }
    return result;
  }, [grid, xMin, yMin, xMax, yMax, dx, dy, maxVal, bandwidth]);

  const contourPaths = useMemo(() => {
    const levels = [0.08, 0.2, 0.35, 0.5, 0.7, 0.85];
    const paths: { d: string; level: number }[] = [];
    for (const level of levels) {
      const thresh = level * maxVal;
      const segs: string[] = [];
      for (let j = 0; j < GS - 1; j++) {
        for (let i = 0; i < GS - 1; i++) {
          const corners = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]];
          const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];
          const crossings: [number, number][] = [];
          const pts = [
            [xMin + (i + 0.5) * dx, yMin + (j + 0.5) * dy],
            [xMin + (i + 1.5) * dx, yMin + (j + 0.5) * dy],
            [xMin + (i + 1.5) * dx, yMin + (j + 1.5) * dy],
            [xMin + (i + 0.5) * dx, yMin + (j + 1.5) * dy],
          ];
          for (const [a, b] of edges) {
            if ((corners[a] - thresh) * (corners[b] - thresh) < 0) {
              const t = (thresh - corners[a]) / (corners[b] - corners[a]);
              const px = pts[a][0] + t * (pts[b][0] - pts[a][0]);
              const py = pts[a][1] + t * (pts[b][1] - pts[a][1]);
              if (isInTriangle(px, py)) crossings.push([px, py]);
            }
          }
          if (crossings.length === 2) {
            segs.push(`M${toSvgXH(crossings[0][0])},${toSvgYH(crossings[0][1])} L${toSvgXH(crossings[1][0])},${toSvgYH(crossings[1][1])}`);
          }
        }
      }
      if (segs.length > 0) paths.push({ d: segs.join(' '), level });
    }
    return paths;
  }, [grid, maxVal, xMin, yMin, dx, dy, bandwidth]);

  const trianglePath = useMemo(() => {
    return `M${toSvgXH(-2)},${toSvgYH(-1)} L${toSvgXH(0)},${toSvgYH(1)} L${toSvgXH(2)},${toSvgYH(-1)} Z`;
  }, []);

  const CS_W = 640, CS_H = 180, CS_PAD_L = 50, CS_PAD_R = 20, CS_PAD_T = 15, CS_PAD_B = 30;
  const csPlotW = CS_W - CS_PAD_L - CS_PAD_R;
  const csPlotH = CS_H - CS_PAD_T - CS_PAD_B;

  const crossSection = useMemo(() => {
    const numSamples = 120;
    const profile: { b1: number; density: number }[] = [];
    let maxD = 0;
    for (let s = 0; s < numSamples; s++) {
      const b1 = xMin + (s / (numSamples - 1)) * (xMax - xMin);
      if (!isInTriangle(b1, sliceY)) {
        profile.push({ b1, density: 0 });
        continue;
      }
      let sum = 0;
      for (const g of filteredGenes) {
        const d2 = ((g.beta1 - b1) / bandwidth) ** 2 + ((g.beta2 - sliceY) / bandwidth) ** 2;
        sum += Math.exp(-d2 / 2);
      }
      profile.push({ b1, density: sum });
      if (sum > maxD) maxD = sum;
    }
    return { profile, maxD: maxD || 1 };
  }, [filteredGenes, sliceY, bandwidth, xMin, xMax]);

  const nearbyGenes = useMemo(() => {
    const tolerance = 0.15;
    return filteredGenes.filter(g =>
      Math.abs(g.beta2 - sliceY) < tolerance && isInTriangle(g.beta1, g.beta2)
    );
  }, [filteredGenes, sliceY]);

  const csAreaPath = useMemo(() => {
    const pts = crossSection.profile.filter(p => p.density > 0 || isInTriangle(p.b1, sliceY));
    if (pts.length === 0) return '';
    const toX = (b1: number) => CS_PAD_L + ((b1 - xMin) / (xMax - xMin)) * csPlotW;
    const toY = (d: number) => CS_PAD_T + csPlotH - (d / crossSection.maxD) * csPlotH * 0.9;
    const baseline = CS_PAD_T + csPlotH;
    let path = `M${toX(pts[0].b1)},${baseline}`;
    for (const p of pts) {
      path += ` L${toX(p.b1)},${toY(p.density)}`;
    }
    path += ` L${toX(pts[pts.length - 1].b1)},${baseline} Z`;
    return path;
  }, [crossSection, xMin, xMax, csPlotW, csPlotH]);

  const csLinePath = useMemo(() => {
    const pts = crossSection.profile.filter(p => p.density > 0 || isInTriangle(p.b1, sliceY));
    if (pts.length === 0) return '';
    const toX = (b1: number) => CS_PAD_L + ((b1 - xMin) / (xMax - xMin)) * csPlotW;
    const toY = (d: number) => CS_PAD_T + csPlotH - (d / crossSection.maxD) * csPlotH * 0.9;
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.b1)},${toY(p.density)}`).join(' ');
  }, [crossSection, xMin, xMax, csPlotW, csPlotH]);

  const handleSvgMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgY = ((e.clientY - rect.top) / rect.height) * HM_H;
    if (svgY >= HM_PAD_T && svgY <= HM_H - HM_PAD_B) {
      setSliceY(fromSvgYH(svgY));
      setIsDragging(true);
    }
  }, []);

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgYPos = ((e.clientY - rect.top) / rect.height) * HM_H;
    const b2 = fromSvgYH(Math.max(HM_PAD_T, Math.min(HM_H - HM_PAD_B, svgYPos)));
    setSliceY(Math.max(yMin + 0.1, Math.min(yMax - 0.1, b2)));
  }, [isDragging, yMin, yMax]);

  const handleSvgMouseUp = useCallback(() => setIsDragging(false), []);

  const csToX = useCallback((b1: number) => CS_PAD_L + ((b1 - xMin) / (xMax - xMin)) * csPlotW, [xMin, xMax, csPlotW]);
  const csToY = useCallback((d: number) => CS_PAD_T + csPlotH - (d / crossSection.maxD) * csPlotH * 0.9, [crossSection.maxD, csPlotH]);

  return (
    <div id="waddington" data-testid="container-waddington-landscape">
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-center">
          <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }} />
          <p className="text-[11px] font-semibold text-yellow-400">High Density</p>
          <p className="text-[10px] text-slate-400">Gene valleys</p>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
          <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} />
          <p className="text-[11px] font-semibold text-emerald-400">Medium Density</p>
          <p className="text-[10px] text-slate-400">Slope regions</p>
        </div>
        <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-center">
          <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }} />
          <p className="text-[11px] font-semibold text-indigo-400">Low / Void</p>
          <p className="text-[10px] text-slate-400">Ridge regions</p>
        </div>
      </div>

      {selectedGene && (
        <div className="mb-3 p-3 bg-slate-800/80 rounded-lg border border-cyan-500/30 flex items-start gap-3" data-testid="panel-selected-gene">
          <MapPin size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{selectedGene.gene}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: GENE_CATEGORY_CONFIG[selectedGene.geneType as GeneCategory]?.color + '30', color: GENE_CATEGORY_CONFIG[selectedGene.geneType as GeneCategory]?.color }}>
                {GENE_CATEGORY_CONFIG[selectedGene.geneType as GeneCategory]?.label || selectedGene.geneType}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4">
              <span>|λ| = <span className="text-cyan-300">{selectedGene.eigenvalue.toFixed(4)}</span></span>
              <span>β₁ = <span className="text-blue-300">{selectedGene.beta1.toFixed(4)}</span></span>
              <span>β₂ = <span className="text-blue-300">{selectedGene.beta2.toFixed(4)}</span></span>
            </div>
          </div>
          <button onClick={() => setSelectedGene(null)} className="text-slate-400 hover:text-white"><X size={14} /></button>
        </div>
      )}

      <div className="rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
        <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Top-Down Contour Heatmap</span>
          <span className="text-[10px] text-slate-400">Click or drag to move the slice line</span>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${HM_W} ${HM_H}`}
          className="w-full h-auto select-none"
          data-testid="svg-waddington-heatmap"
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseUp}
        >
          <rect width={HM_W} height={HM_H} fill="#020617" />
          {heatCells.map((c, i) => (
            <rect key={`hc-${i}`} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
          ))}
          <path d={trianglePath} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 3" />
          {contourPaths.map((cp, i) => (
            <path key={`ct-${i}`} d={cp.d} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={cp.level > 0.6 ? 1.2 : 0.7} />
          ))}

          <line
            x1={HM_PAD_L}
            y1={toSvgYH(sliceY)}
            x2={HM_W - HM_PAD_R}
            y2={toSvgYH(sliceY)}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="6 3"
            style={{ cursor: 'ns-resize' }}
          />
          <rect x={HM_PAD_L - 6} y={toSvgYH(sliceY) - 8} width={12} height={16} rx={3} fill="#f59e0b" opacity={0.9} style={{ cursor: 'ns-resize' }} />
          <rect x={HM_W - HM_PAD_R - 6} y={toSvgYH(sliceY) - 8} width={12} height={16} rx={3} fill="#f59e0b" opacity={0.9} style={{ cursor: 'ns-resize' }} />
          <text x={HM_W - HM_PAD_R + 2} y={toSvgYH(sliceY) + 3} fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="start">β₂={sliceY.toFixed(2)}</text>

          {filteredGenes.filter(g => isInTriangle(g.beta1, g.beta2)).map((g, i) => (
            <circle
              key={`gd-${i}`}
              cx={toSvgXH(g.beta1)}
              cy={toSvgYH(g.beta2)}
              r={g.geneType === 'clock' ? 3.5 : 2.5}
              fill={GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8'}
              opacity={hoveredGene?.gene === g.gene ? 1 : selectedGene?.gene === g.gene ? 0.95 : 0.6}
              stroke={selectedGene?.gene === g.gene ? '#fff' : hoveredGene?.gene === g.gene ? '#fff' : 'none'}
              strokeWidth={selectedGene?.gene === g.gene ? 2 : 1}
              onMouseEnter={() => setHoveredGene(g)}
              onMouseLeave={() => setHoveredGene(null)}
              onClick={(e) => { e.stopPropagation(); setSelectedGene(prev => prev?.gene === g.gene ? null : g); }}
              className="cursor-pointer"
            >
              <title>{g.gene} ({g.geneType}) |λ|={g.eigenvalue.toFixed(3)}</title>
            </circle>
          ))}

          <text x={toSvgXH(1.6)} y={toSvgYH(0.4)} fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle" opacity={0.7}>Self-Reinforcing</text>
          <text x={toSvgXH(-1.6)} y={toSvgYH(0.4)} fill="#60a5fa" fontSize="11" fontWeight="bold" textAnchor="middle" opacity={0.7}>Alternating</text>
          <text x={toSvgXH(0)} y={toSvgYH(-0.7)} fill="#22d3ee" fontSize="11" fontWeight="bold" textAnchor="middle" opacity={0.7}>Oscillatory</text>

          {[-2, -1, 0, 1, 2].map(v => (
            <g key={`xa-${v}`}>
              <line x1={toSvgXH(v)} y1={HM_H - HM_PAD_B} x2={toSvgXH(v)} y2={HM_H - HM_PAD_B + 4} stroke="#475569" strokeWidth={1} />
              <text x={toSvgXH(v)} y={HM_H - HM_PAD_B + 15} fill="#94a3b8" fontSize="10" textAnchor="middle">{v}</text>
            </g>
          ))}
          <text x={HM_PAD_L + plotW / 2} y={HM_H - 3} fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">β₁</text>
          {[-1, -0.5, 0, 0.5, 1].map(v => (
            <g key={`ya-${v}`}>
              <line x1={HM_PAD_L - 4} y1={toSvgYH(v)} x2={HM_PAD_L} y2={toSvgYH(v)} stroke="#475569" strokeWidth={1} />
              <text x={HM_PAD_L - 7} y={toSvgYH(v) + 3} fill="#94a3b8" fontSize="10" textAnchor="end">{v}</text>
            </g>
          ))}
          <text x={12} y={HM_PAD_T + plotH / 2} fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle" transform={`rotate(-90, 12, ${HM_PAD_T + plotH / 2})`}>β₂</text>
        </svg>
      </div>

      <div className="mt-3 rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
        <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Cross-Section at β₂ = {sliceY.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400">{nearbyGenes.length} genes near slice</span>
        </div>
        <svg viewBox={`0 0 ${CS_W} ${CS_H}`} className="w-full h-auto" data-testid="svg-waddington-cross-section">
          <rect width={CS_W} height={CS_H} fill="#020617" />
          <defs>
            <linearGradient id="csGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {csAreaPath && <path d={csAreaPath} fill="url(#csGrad)" />}
          {csLinePath && <path d={csLinePath} fill="none" stroke="#22d3ee" strokeWidth="2" />}

          {nearbyGenes.map((g, i) => {
            const gx = csToX(g.beta1);
            let sum = 0;
            for (const fg of filteredGenes) {
              const d2 = ((fg.beta1 - g.beta1) / bandwidth) ** 2 + ((fg.beta2 - sliceY) / bandwidth) ** 2;
              sum += Math.exp(-d2 / 2);
            }
            const gy = csToY(sum);
            return (
              <g key={`csg-${i}`}>
                <line x1={gx} y1={gy} x2={gx} y2={CS_PAD_T + csPlotH} stroke={GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8'} strokeWidth={1} opacity={0.3} />
                <circle
                  cx={gx}
                  cy={gy}
                  r={g.geneType === 'clock' ? 5 : 3.5}
                  fill={GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8'}
                  stroke="#fff"
                  strokeWidth={0.8}
                  opacity={0.9}
                  onMouseEnter={() => setHoveredGene(g)}
                  onMouseLeave={() => setHoveredGene(null)}
                  onClick={() => setSelectedGene(prev => prev?.gene === g.gene ? null : g)}
                  className="cursor-pointer"
                >
                  <title>{g.gene} ({g.geneType}) |λ|={g.eigenvalue.toFixed(3)}</title>
                </circle>
                {g.geneType === 'clock' && (
                  <text x={gx} y={gy - 8} fill={GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color} fontSize="8" textAnchor="middle" fontWeight="bold">{g.gene}</text>
                )}
              </g>
            );
          })}

          {[-2, -1, 0, 1, 2].map(v => (
            <g key={`cxa-${v}`}>
              <line x1={csToX(v)} y1={CS_PAD_T + csPlotH} x2={csToX(v)} y2={CS_PAD_T + csPlotH + 4} stroke="#475569" strokeWidth={1} />
              <text x={csToX(v)} y={CS_PAD_T + csPlotH + 15} fill="#94a3b8" fontSize="10" textAnchor="middle">{v}</text>
            </g>
          ))}
          <text x={CS_PAD_L + csPlotW / 2} y={CS_H - 3} fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">β₁</text>
          <text x={12} y={CS_PAD_T + csPlotH / 2} fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle" transform={`rotate(-90, 12, ${CS_PAD_T + csPlotH / 2})`}>Gene Density</text>

          <line x1={CS_PAD_L} y1={CS_PAD_T + csPlotH} x2={CS_PAD_L + csPlotW} y2={CS_PAD_T + csPlotH} stroke="#334155" strokeWidth={1} />
          <line x1={CS_PAD_L} y1={CS_PAD_T} x2={CS_PAD_L} y2={CS_PAD_T + csPlotH} stroke="#334155" strokeWidth={1} />
        </svg>
      </div>

      {hoveredGene && (
        <div className="mt-2 p-2.5 bg-gray-900/95 border border-gray-600 rounded-lg text-xs shadow-xl" data-testid="tooltip-waddington">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{hoveredGene.gene}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: GENE_CATEGORY_CONFIG[hoveredGene.geneType as GeneCategory]?.color + '30', color: GENE_CATEGORY_CONFIG[hoveredGene.geneType as GeneCategory]?.color }}>
              {GENE_CATEGORY_CONFIG[hoveredGene.geneType as GeneCategory]?.label || hoveredGene.geneType}
            </span>
          </div>
          <div className="text-slate-400 mt-1 flex gap-3">
            <span>|λ| = <span className="text-cyan-300">{hoveredGene.eigenvalue.toFixed(4)}</span></span>
            <span>β₁ = <span className="text-blue-300">{hoveredGene.beta1.toFixed(3)}</span></span>
            <span>β₂ = <span className="text-blue-300">{hoveredGene.beta2.toFixed(3)}</span></span>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Click or drag the yellow line to slice through the landscape</span>
        <button
          onClick={() => setShowAdvanced(v => !v)}
          className="text-[11px] text-slate-400 hover:text-slate-300 transition-colors"
          data-testid="button-toggle-advanced"
        >
          {showAdvanced ? 'Hide' : 'Show'} advanced controls
        </button>
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap gap-x-6 gap-y-3 mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="text-xs text-slate-400 whitespace-nowrap">Bandwidth</label>
            <input type="range" min="0.15" max="0.8" step="0.05" value={bandwidth} onChange={e => setBandwidth(parseFloat(e.target.value))}
              className="w-24 h-1.5 accent-cyan-500" data-testid="slider-bandwidth" />
            <span className="text-xs text-cyan-400 w-8">{bandwidth.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="text-xs text-slate-400 whitespace-nowrap">Slice β₂</label>
            <input type="range" min="-0.9" max="0.9" step="0.05" value={sliceY} onChange={e => setSliceY(parseFloat(e.target.value))}
              className="w-24 h-1.5 accent-yellow-500" data-testid="slider-slice-y" />
            <span className="text-xs text-yellow-400 w-8">{sliceY.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const SVG_W = 640, SVG_H = 500;
const svgX = (b1: number) => 50 + (b1 + 2.5) / 5.0 * 540;
const svgY = (b2: number) => 450 - (b2 + 1.3) / 2.6 * 400;

function PhasePortraitSVG({ genes, categoryFilters }: { genes: GeneRootPoint[]; categoryFilters?: Record<string, boolean> }) {
  const [hoveredGene, setHoveredGene] = useState<GeneRootPoint | null>(null);

  const filteredGenes = useMemo(() => {
    if (!categoryFilters) return genes;
    return genes.filter(g => categoryFilters[g.geneType] !== false);
  }, [genes, categoryFilters]);

  const { parabolaPts, selfPath, altPath, oscPath, trianglePath } = useMemo(() => {
    const pts: { b1: number; b2: number }[] = [];
    for (let n = 0; n <= 80; n++) {
      const b1 = -2 + (n / 80) * 4;
      pts.push({ b1, b2: -(b1 * b1) / 4 });
    }
    const rightHalf = pts.filter(p => p.b1 >= 0);
    const leftHalf = pts.filter(p => p.b1 <= 0);
    const rightRev = [...rightHalf].reverse();
    const leftFwd = leftHalf;

    const sp = `M ${svgX(0)} ${svgY(1)} L ${svgX(2)} ${svgY(-1)} ${rightRev.map(p => `L ${svgX(p.b1)} ${svgY(p.b2)}`).join(' ')} Z`;
    const ap = `M ${svgX(0)} ${svgY(1)} L ${svgX(-2)} ${svgY(-1)} ${leftFwd.map(p => `L ${svgX(p.b1)} ${svgY(p.b2)}`).join(' ')} Z`;
    const op = `M ${svgX(-2)} ${svgY(-1)} L ${svgX(2)} ${svgY(-1)} ${[...pts].reverse().map(p => `L ${svgX(p.b1)} ${svgY(p.b2)}`).join(' ')} Z`;
    const tp = `M ${svgX(-2)} ${svgY(-1)} L ${svgX(0)} ${svgY(1)} L ${svgX(2)} ${svgY(-1)} Z`;
    return { parabolaPts: pts, selfPath: sp, altPath: ap, oscPath: op, trianglePath: tp };
  }, []);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto" data-testid="svg-phase-portrait">
        <rect width={SVG_W} height={SVG_H} fill="#0f172a" />
        <path d={selfPath} fill="rgba(239,68,68,0.12)" stroke="none" />
        <path d={altPath} fill="rgba(96,165,250,0.12)" stroke="none" />
        <path d={oscPath} fill="rgba(34,197,94,0.10)" stroke="none" />
        <path d={trianglePath} fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="8 4" />
        <path d={`M ${parabolaPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${svgX(p.b1)} ${svgY(p.b2)}`).join(' ')}`} fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1={svgX(0)} y1={svgY(-1)} x2={svgX(0)} y2={svgY(1)} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

        <text x={svgX(1.3)} y={svgY(0.35)} fill="#0f172a" fontSize="16" fontWeight="bold" textAnchor="middle" stroke="#ef4444" strokeWidth="0.3">Self-Reinforcing</text>
        <rect x={svgX(1.3) - 72} y={svgY(0.35) + 4} width="144" height="16" fill="#0f172a" opacity="0.7" rx="2" />
        <text x={svgX(1.3)} y={svgY(0.35) + 16} fill="#fca5a5" fontSize="12" textAnchor="middle">Monotonic persistence</text>
        <rect x={svgX(1.3) - 42} y={svgY(0.35) + 20} width="84" height="14" fill="#0f172a" opacity="0.7" rx="2" />
        <text x={svgX(1.3)} y={svgY(0.35) + 32} fill="#fca5a5" fontSize="11" textAnchor="middle" fontStyle="italic">MAPK1, MYC</text>

        <text x={svgX(-1.3)} y={svgY(0.35)} fill="#0f172a" fontSize="16" fontWeight="bold" textAnchor="middle" stroke="#60a5fa" strokeWidth="0.3">Alternating</text>
        <rect x={svgX(-1.3) - 62} y={svgY(0.35) + 4} width="124" height="16" fill="#0f172a" opacity="0.7" rx="2" />
        <text x={svgX(-1.3)} y={svgY(0.35) + 16} fill="#93c5fd" fontSize="12" textAnchor="middle">Bistable switching</text>
        <rect x={svgX(-1.3) - 42} y={svgY(0.35) + 20} width="84" height="14" fill="#0f172a" opacity="0.7" rx="2" />
        <text x={svgX(-1.3)} y={svgY(0.35) + 32} fill="#93c5fd" fontSize="11" textAnchor="middle" fontStyle="italic">APC, PTCH1</text>

        <text x={svgX(0)} y={svgY(-0.75)} fill="#0f172a" fontSize="16" fontWeight="bold" textAnchor="middle" stroke="#22c55e" strokeWidth="0.3">Oscillatory</text>
        <rect x={svgX(0) - 50} y={svgY(-0.75) + 4} width="100" height="16" fill="#0f172a" opacity="0.7" rx="2" />
        <text x={svgX(0)} y={svgY(-0.75) + 16} fill="#86efac" fontSize="12" textAnchor="middle">Complex roots</text>

        <rect x={svgX(0) - 58} y={svgY(0.88) - 14} width="116" height="16" fill="#0f172a" opacity="0.8" rx="2" />
        <text x={svgX(0)} y={svgY(0.88)} fill="#f59e0b" fontSize="14" fontWeight="bold" textAnchor="middle">Oscillatory Vertex</text>
        <rect x={svgX(0) - 42} y={svgY(0.88) + 2} width="84" height="14" fill="#0f172a" opacity="0.7" rx="2" />
        <text x={svgX(0)} y={svgY(0.88) + 14} fill="#fbbf24" fontSize="11" textAnchor="middle" fontStyle="italic">PTEN, BMAL1</text>

        <rect x={svgX(0) - 42} y={svgY(0.15) - 12} width="84" height="16" fill="#0f172a" opacity="0.8" rx="2" />
        <text x={svgX(0)} y={svgY(0.15)} fill="#cbd5e1" fontSize="13" fontWeight="bold" textAnchor="middle">Memoryless</text>
        <rect x={svgX(0) - 18} y={svgY(0.15) + 2} width="36" height="14" fill="#0f172a" opacity="0.7" rx="2" />
        <text x={svgX(0)} y={svgY(0.15) + 14} fill="#cbd5e1" fontSize="11" textAnchor="middle" fontStyle="italic">TP53</text>

        {filteredGenes.map((g, i) => (
          <circle
            key={`pp-${i}`}
            cx={svgX(g.beta1)}
            cy={svgY(g.beta2)}
            r={g.geneType === 'clock' ? 3 : 2}
            fill={GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8'}
            opacity={0.55}
            stroke={GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8'}
            strokeWidth={0.4}
            strokeOpacity={0.5}
            onMouseEnter={() => setHoveredGene(g)}
            onMouseLeave={() => setHoveredGene(null)}
            className="cursor-pointer"
          >
            <title>{g.gene} ({g.geneType}) |λ|={g.eigenvalue.toFixed(3)}</title>
          </circle>
        ))}

        <text x={svgX(0)} y={svgY(-1.15)} fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="middle">β₁</text>
        <text x={30} y={svgY(0)} fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="middle" transform={`rotate(-90, 25, ${svgY(0)})`}>β₂</text>

        <rect x={svgX(0) + 5} y={svgY(0) - 7} width="110" height="14" fill="#0f172a" opacity="0.8" rx="2" />
        <text x={svgX(0) + 8} y={svgY(0) + 4} fill="#eab308" fontSize="10" textAnchor="start">parabola: β₂ = -β₁²/4</text>
      </svg>
      {hoveredGene && (
        <div className="absolute top-2 right-2 bg-gray-900/95 border border-gray-600 rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none" data-testid="tooltip-phase-portrait">
          <div className="font-bold text-white">{hoveredGene.gene}</div>
          <div className="text-gray-300">{hoveredGene.geneType}</div>
          <div className="text-cyan-300">|λ| = {hoveredGene.eigenvalue.toFixed(4)}</div>
          <div className="text-blue-300">β₁={hoveredGene.beta1.toFixed(3)}, β₂={hoveredGene.beta2.toFixed(3)}</div>
        </div>
      )}
    </div>
  );
}

function FunctionalGeographySVG({ genes, hierarchy }: { genes: GeneRootPoint[]; hierarchy?: { category: string; label: string; color: string; pooledMeanEigenvalue: number; rank: number }[] }) {
  const [hoveredGene, setHoveredGene] = useState<GeneRootPoint | null>(null);
  const [layerDepth, setLayerDepth] = useState<number>(0);

  const trianglePath = `M ${svgX(-2)} ${svgY(-1)} L ${svgX(0)} ${svgY(1)} L ${svgX(2)} ${svgY(-1)} Z`;

  const parabolaPath = useMemo(() => {
    const pts: string[] = [];
    for (let n = 0; n <= 80; n++) {
      const b1 = -2 + (n / 80) * 4;
      pts.push(`${n === 0 ? 'M' : 'L'} ${svgX(b1)} ${svgY(-(b1 * b1) / 4)}`);
    }
    return pts.join(' ');
  }, []);

  const poleAnnotations = [
    { b1: 1.6, b2: -0.5, label: 'Self-Reinforcing Pole', sub: 'Growth genes, positive feedback', genes: 'MAPK1, MYC, KRAS', color: '#ef4444', anchor: 'start' as const },
    { b1: -1.6, b2: -0.5, label: 'Alternating Pole', sub: 'Toggle switches, bistable', genes: 'APC, PTCH1, SOX2', color: '#60a5fa', anchor: 'end' as const },
    { b1: 0, b2: 0.92, label: 'Oscillatory Vertex', sub: 'Maximal persistence (±1 roots)', genes: 'PTEN, BMAL1', color: '#22d3ee', anchor: 'middle' as const },
    { b1: 0, b2: 0.0, label: 'Memoryless Hub', sub: 'Rapid response, no memory', genes: 'TP53', color: '#a78bfa', anchor: 'middle' as const },
  ];

  const categoryZones = useMemo(() => {
    const zones: { cx: number; cy: number; cat: string; color: string; radius: number }[] = [];
    const catPositions: Record<string, { sumB1: number; sumB2: number; count: number }> = {};
    for (const g of genes) {
      const cat = g.geneType;
      if (!catPositions[cat]) catPositions[cat] = { sumB1: 0, sumB2: 0, count: 0 };
      catPositions[cat].sumB1 += g.beta1;
      catPositions[cat].sumB2 += g.beta2;
      catPositions[cat].count++;
    }
    for (const [cat, pos] of Object.entries(catPositions)) {
      if (pos.count < 2) continue;
      zones.push({
        cx: svgX(pos.sumB1 / pos.count),
        cy: svgY(pos.sumB2 / pos.count),
        cat,
        color: GENE_CATEGORY_CONFIG[cat as GeneCategory]?.color || '#94a3b8',
        radius: Math.min(60, 20 + pos.count * 3),
      });
    }
    return zones;
  }, [genes]);

  const sortedLayers = useMemo(() => {
    if (!hierarchy || hierarchy.length === 0) {
      const catStats: Record<string, { sum: number; count: number; color: string; label: string }> = {};
      for (const g of genes) {
        const cat = g.geneType;
        if (!catStats[cat]) catStats[cat] = { sum: 0, count: 0, color: GENE_CATEGORY_CONFIG[cat as GeneCategory]?.color || '#94a3b8', label: GENE_CATEGORY_CONFIG[cat as GeneCategory]?.label || cat };
        catStats[cat].sum += g.eigenvalue;
        catStats[cat].count++;
      }
      return Object.entries(catStats)
        .filter(([, s]) => s.count >= 2)
        .map(([cat, s], i) => ({ category: cat, label: s.label, color: s.color, pooledMeanEigenvalue: s.sum / s.count, rank: i + 1 }))
        .sort((a, b) => b.pooledMeanEigenvalue - a.pooledMeanEigenvalue)
        .map((l, i) => ({ ...l, rank: i + 1 }));
    }
    return [...hierarchy].sort((a, b) => a.rank - b.rank);
  }, [hierarchy, genes]);

  const visibleCategories = useMemo(() => {
    if (layerDepth === 0) return new Set(sortedLayers.map(l => l.category));
    return new Set(sortedLayers.slice(0, layerDepth).map(l => l.category));
  }, [sortedLayers, layerDepth]);

  const filteredGenes = useMemo(() => {
    return genes.filter(g => visibleCategories.has(g.geneType));
  }, [genes, visibleCategories]);

  const voidRegion = useMemo(() => {
    if (filteredGenes.length < 5) return null;
    const GRID = 20;
    const b1Min = -2, b1Max = 2, b2Min = -1, b2Max = 1;
    const cellW = (b1Max - b1Min) / GRID;
    const cellH = (b2Max - b2Min) / GRID;
    const counts: number[][] = Array.from({ length: GRID }, () => Array(GRID).fill(0));

    for (const g of filteredGenes) {
      const ci = Math.floor((g.beta1 - b1Min) / cellW);
      const cj = Math.floor((g.beta2 - b2Min) / cellH);
      if (ci >= 0 && ci < GRID && cj >= 0 && cj < GRID) counts[ci][cj]++;
    }

    const isInsideTriangle = (b1: number, b2: number) =>
      b2 > -1 && b2 < 1 - b1 && b2 < 1 + b1;

    let bestI = -1, bestJ = -1, bestScore = Infinity;
    const R = 2;
    for (let i = R; i < GRID - R; i++) {
      for (let j = R; j < GRID - R; j++) {
        const cb1 = b1Min + (i + 0.5) * cellW;
        const cb2 = b2Min + (j + 0.5) * cellH;
        if (!isInsideTriangle(cb1, cb2)) continue;
        let total = 0;
        for (let di = -R; di <= R; di++) {
          for (let dj = -R; dj <= R; dj++) {
            const ni = i + di, nj = j + dj;
            if (ni >= 0 && ni < GRID && nj >= 0 && nj < GRID) total += counts[ni][nj];
          }
        }
        if (total < bestScore) { bestScore = total; bestI = i; bestJ = j; }
      }
    }

    if (bestI < 0) return null;

    const voidB1 = b1Min + (bestI + 0.5) * cellW;
    const voidB2 = b2Min + (bestJ + 0.5) * cellH;

    let spanB1 = 1, spanB2 = 1;
    for (let expand = 1; expand <= 4; expand++) {
      let edgeCount = 0;
      for (let di = -expand; di <= expand; di++) {
        for (let dj = -expand; dj <= expand; dj++) {
          if (Math.abs(di) !== expand && Math.abs(dj) !== expand) continue;
          const ni = bestI + di, nj = bestJ + dj;
          if (ni >= 0 && ni < GRID && nj >= 0 && nj < GRID) edgeCount += counts[ni][nj];
        }
      }
      if (edgeCount > filteredGenes.length * 0.02) break;
      spanB1 = expand; spanB2 = expand;
    }

    const rx = Math.max(25, Math.min(70, spanB1 * cellW * (540 / 5.0)));
    const ry = Math.max(20, Math.min(55, spanB2 * cellH * (400 / 2.0)));

    const nearParabola = Math.abs(voidB2 - (-(voidB1 * voidB1) / 4)) < 0.3;

    return { cx: svgX(voidB1), cy: svgY(voidB2), rx, ry, nearParabola, b1: voidB1, b2: voidB2, density: bestScore };
  }, [filteredGenes]);

  return (
    <div className="relative">
      {sortedLayers.length > 1 && (
        <div className="mb-3 bg-slate-800/80 border border-slate-700 rounded-lg p-3" data-testid="hierarchy-layer-toggle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hierarchy Layers ({layerDepth === 0 ? 'All' : `Top ${layerDepth} of ${sortedLayers.length}`})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLayerDepth(Math.max(0, layerDepth - 1))}
                className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded disabled:opacity-30"
                disabled={layerDepth === 0}
                data-testid="button-layer-fewer"
              >
                -
              </button>
              <input
                type="range"
                min={0}
                max={sortedLayers.length}
                value={layerDepth}
                onChange={e => setLayerDepth(parseInt(e.target.value))}
                className="w-32 h-1.5 accent-amber-500"
                data-testid="slider-layer-depth"
              />
              <button
                onClick={() => setLayerDepth(Math.min(sortedLayers.length, layerDepth + 1))}
                className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded disabled:opacity-30"
                disabled={layerDepth >= sortedLayers.length}
                data-testid="button-layer-more"
              >
                +
              </button>
              <button
                onClick={() => setLayerDepth(0)}
                className="px-2 py-0.5 text-xs bg-amber-700/50 hover:bg-amber-700 text-amber-200 rounded"
                data-testid="button-layer-all"
              >
                All
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {sortedLayers.map((layer, i) => {
              const active = layerDepth === 0 || i < layerDepth;
              return (
                <button
                  key={layer.category}
                  onClick={() => setLayerDepth(i + 1)}
                  className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all ${active ? 'border-opacity-60' : 'border-slate-700 opacity-30'}`}
                  style={{
                    borderColor: active ? layer.color : undefined,
                    backgroundColor: active ? layer.color + '20' : undefined,
                  }}
                  data-testid={`button-layer-${layer.category}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? layer.color : '#475569' }} />
                  <span style={{ color: active ? layer.color : '#64748b' }}>#{layer.rank} {layer.label}</span>
                  <span className="text-slate-400 ml-0.5">|λ|={layer.pooledMeanEigenvalue.toFixed(3)}</span>
                </button>
              );
            })}
          </div>
          {layerDepth > 0 && layerDepth < sortedLayers.length && (
            <div className="mt-2 text-[10px] text-amber-400/70">
              Showing {filteredGenes.length} genes from the top {layerDepth} persistence layer{layerDepth > 1 ? 's' : ''}.
              {layerDepth < sortedLayers.length && ` Next: ${sortedLayers[layerDepth].label} (|λ|=${sortedLayers[layerDepth].pooledMeanEigenvalue.toFixed(3)})`}
            </div>
          )}
        </div>
      )}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto" data-testid="svg-functional-geography">
        <rect width={SVG_W} height={SVG_H} fill="#0f172a" />
        <path d={trianglePath} fill="rgba(51,65,85,0.15)" stroke="#475569" strokeWidth="2" strokeDasharray="8 4" />
        <path d={parabolaPath} fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />

        {categoryZones.map((z, i) => {
          const active = visibleCategories.has(z.cat);
          return (
            <g key={`zone-${i}`} opacity={active ? 1 : 0.15}>
              <circle cx={z.cx} cy={z.cy} r={z.radius} fill={z.color} opacity={0.06} stroke={z.color} strokeWidth="1" strokeDasharray="4 2" strokeOpacity={0.3} />
              <text x={z.cx} y={z.cy + z.radius + 14} fill={z.color} fontSize="9" textAnchor="middle" opacity="0.6">
                {GENE_CATEGORY_CONFIG[z.cat as GeneCategory]?.label || z.cat}
              </text>
            </g>
          );
        })}

        {filteredGenes.map((g, i) => (
          <circle
            key={`fg-${i}`}
            cx={svgX(g.beta1)}
            cy={svgY(g.beta2)}
            r={g.geneType === 'clock' ? 3 : 2}
            fill={GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8'}
            opacity={0.55}
            stroke={GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8'}
            strokeWidth={0.4}
            strokeOpacity={0.5}
            onMouseEnter={() => setHoveredGene(g)}
            onMouseLeave={() => setHoveredGene(null)}
            className="cursor-pointer"
          >
            <title>{g.gene} ({g.geneType}) |λ|={g.eigenvalue.toFixed(3)}</title>
          </circle>
        ))}

        {poleAnnotations.map((p, i) => (
          <g key={`pole-${i}`}>
            <line x1={svgX(p.b1)} y1={svgY(p.b2) - 8} x2={svgX(p.b1)} y2={svgY(p.b2) - 25} stroke={p.color} strokeWidth="1" opacity="0.5" />
            <circle cx={svgX(p.b1)} cy={svgY(p.b2) - 8} r="5" fill={p.color} opacity="0.2" stroke={p.color} strokeWidth="1" />
            <text x={svgX(p.b1)} y={svgY(p.b2) - 32} fill={p.color} fontSize="12" fontWeight="bold" textAnchor={p.anchor}>{p.label}</text>
            <text x={svgX(p.b1)} y={svgY(p.b2) - 18} fill={p.color} fontSize="9" textAnchor={p.anchor} opacity="0.6">{p.sub}</text>
            <text x={svgX(p.b1)} y={svgY(p.b2) - 6} fill={p.color} fontSize="9" textAnchor={p.anchor} opacity="0.4" fontStyle="italic">{p.genes}</text>
          </g>
        ))}

        {voidRegion && (
          <g>
            <ellipse cx={voidRegion.cx} cy={voidRegion.cy} rx={voidRegion.rx} ry={voidRegion.ry} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.4" />
            <text x={voidRegion.cx + voidRegion.rx + 6} y={voidRegion.cy} fill="#f59e0b" fontSize="10" fontWeight="bold" opacity="0.6">Void</text>
            <text x={voidRegion.cx + voidRegion.rx + 6} y={voidRegion.cy + 12} fill="#f59e0b" fontSize="8" opacity="0.4">
              {voidRegion.nearParabola ? '(near Hopf boundary)' : `(β₁≈${voidRegion.b1.toFixed(1)}, β₂≈${voidRegion.b2.toFixed(1)})`}
            </text>
          </g>
        )}

        <text x={svgX(0)} y={svgY(-1.15)} fill="#94a3b8" fontSize="11" textAnchor="middle">β₁</text>
        <text x={30} y={svgY(0)} fill="#94a3b8" fontSize="11" textAnchor="middle" transform={`rotate(-90, 25, ${svgY(0)})`}>β₂</text>
      </svg>
      {hoveredGene && (
        <div className="absolute top-2 right-2 bg-gray-900/95 border border-gray-600 rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none" data-testid="tooltip-functional-geography">
          <div className="font-bold text-white">{hoveredGene.gene}</div>
          <div className="text-gray-300">{hoveredGene.geneType}</div>
          <div className="text-cyan-300">|λ| = {hoveredGene.eigenvalue.toFixed(4)}</div>
          <div className="text-blue-300">β₁={hoveredGene.beta1.toFixed(3)}, β₂={hoveredGene.beta2.toFixed(3)}</div>
        </div>
      )}
    </div>
  );
}

type OverlayTab = 'waddington' | 'phase' | 'geography' | 'pca' | 'comparison';

const OVERLAY_TAB_CONFIG: Record<OverlayTab, { label: string; description: string }> = {
  waddington: {
    label: 'Waddington Landscape',
    description: 'Gene density rendered as terrain: valleys (green) where genes cluster, ridges (brown) where the void sits. Analogous to Waddington\'s epigenetic landscape — forbidden states emerge as ridges between populated valleys.',
  },
  phase: {
    label: 'Phase Portrait',
    description: 'The stationarity triangle IS a phase portrait — the standard tool in dynamical systems theory. Three regimes: self-reinforcing (red, real positive roots), alternating (blue, real negative roots), oscillatory (green, complex roots). The parabola separates overdamped from underdamped dynamics.',
  },
  geography: {
    label: 'Functional Geography',
    description: 'Gene categories plotted in coefficient space, annotated with dynamical poles. Each pole represents a distinct regulatory strategy. Dashed circles show category centroids — if function maps to dynamics, categories should cluster at distinct poles.',
  },
  pca: {
    label: 'PCA Comparison',
    description: 'Side-by-side comparison of the same genes in PCA space (expression variance) versus AR(2) root space (temporal dynamics). PCA axes capture overall variance but have no dynamical interpretation — root-space axes have precise mathematical meaning. Notice how PCA clusters differ from dynamical clusters.',
  },
  comparison: {
    label: 'Landscape Comparison',
    description: 'Side-by-side comparison of two datasets showing how gene positions shift between conditions. Select two datasets to compare their Waddington landscapes. Use orthology matching for cross-species comparisons.',
  },
};

const ROC_OPTIMAL_THRESHOLD = 0.089;

function getDatasetEigenvalueStats(ds: DatasetRootSpace) {
  const clockGenes = ds.genes.filter(g => g.geneType === 'clock');
  const targetGenes = ds.genes.filter(g => g.geneType === 'target');
  const clockMeanEigenvalue = clockGenes.length > 0 ? clockGenes.reduce((s, g) => s + g.eigenvalue, 0) / clockGenes.length : 0;
  const targetMeanEigenvalue = targetGenes.length > 0 ? targetGenes.reduce((s, g) => s + g.eigenvalue, 0) / targetGenes.length : 0;
  return { clockMeanEigenvalue, targetMeanEigenvalue, gap: clockMeanEigenvalue - targetMeanEigenvalue };
}

function DensityHeatmapSVG({ genes, title, species }: { genes: GeneRootPoint[]; title: string; species: string }) {
  const kde = useMemo(() => computeKDE(genes, 40, 0.35), [genes]);
  const { grid, xMin, yMin, dx, dy, maxVal } = kde;

  const parabolaPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const b1 = -2 + (i / 100) * 4;
      const b2 = -(b1 * b1) / 4;
      if (b2 >= -1.3 && b2 <= 1.3) {
        pts.push(`${svgX(b1)},${svgY(b2)}`);
      }
    }
    return `M${pts.join(' L')}`;
  }, []);

  const trianglePath = useMemo(() => {
    return `M${svgX(-2)},${svgY(-1)} L${svgX(0)},${svgY(1)} L${svgX(2)},${svgY(-1)} Z`;
  }, []);

  const cells = useMemo(() => {
    const result: { x: number; y: number; w: number; h: number; fill: string }[] = [];
    for (let j = 0; j < 40; j++) {
      for (let i = 0; i < 40; i++) {
        const cx = xMin + (i + 0.5) * dx;
        const cy = yMin + (j + 0.5) * dy;
        if (!isInTriangle(cx, cy)) continue;
        const norm = grid[j][i] / maxVal;
        let fill: string;
        if (norm > 0.5) {
          const t = (norm - 0.5) / 0.5;
          const r = Math.round(30 + (1 - t) * 100);
          const g = Math.round(140 + t * 80);
          const b = Math.round(15 + (1 - t) * 30);
          fill = `rgb(${r},${g},${b})`;
        } else if (norm > 0.03) {
          const t = (norm - 0.03) / 0.47;
          const r = Math.round(130 - t * 30);
          const g = Math.round(80 + t * 20);
          const b = Math.round(30 + t * 10);
          fill = `rgb(${r},${g},${b})`;
        } else {
          fill = 'rgb(15,15,25)';
        }
        const sx = svgX(cx - dx / 2);
        const sy2 = svgY(cy + dy / 2);
        const sw = svgX(cx + dx / 2) - sx;
        const sh = svgY(cy - dy / 2) - sy2;
        result.push({ x: sx, y: sy2, w: sw, h: sh, fill });
      }
    }
    return result;
  }, [grid, xMin, yMin, dx, dy, maxVal]);

  return (
    <div className="flex-1 min-w-0">
      <div className="text-center mb-2">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-xs text-slate-400 ml-2">({species})</span>
      </div>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full bg-slate-950 rounded-lg border border-slate-700">
        {cells.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
        ))}
        <path d={trianglePath} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 3" />
        <path d={parabolaPath} fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
        {genes.map((g, i) => (
          <circle
            key={i}
            cx={svgX(g.beta1)}
            cy={svgY(g.beta2)}
            r={g.geneType === 'clock' ? 4 : 3}
            fill={GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8'}
            opacity={0.85}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="0.5"
          />
        ))}
        <text x={svgX(0)} y={svgY(-1.15)} fill="#94a3b8" fontSize="11" textAnchor="middle">β₁</text>
        <text x={30} y={svgY(0)} fill="#94a3b8" fontSize="11" textAnchor="middle" transform={`rotate(-90, 25, ${svgY(0)})`}>β₂</text>
      </svg>
    </div>
  );
}

function LandscapeComparison({ data }: { data: RootSpaceData }) {
  const [datasetAId, setDatasetAId] = useState(data.datasets[0]?.datasetId || '');
  const [datasetBId, setDatasetBId] = useState(data.datasets[1]?.datasetId || data.datasets[0]?.datasetId || '');
  const [orthologyOnly, setOrthologyOnly] = useState(false);

  const datasetA = useMemo(() => data.datasets.find(d => d.datasetId === datasetAId), [data, datasetAId]);
  const datasetB = useMemo(() => data.datasets.find(d => d.datasetId === datasetBId), [data, datasetBId]);

  const isCrossSpecies = useMemo(() => {
    if (!datasetA || !datasetB) return false;
    return datasetA.species !== datasetB.species;
  }, [datasetA, datasetB]);

  const statsA = useMemo(() => datasetA ? getDatasetEigenvalueStats(datasetA) : null, [datasetA]);
  const statsB = useMemo(() => datasetB ? getDatasetEigenvalueStats(datasetB) : null, [datasetB]);

  const genesA = useMemo(() => {
    if (!datasetA) return [];
    if (orthologyOnly && isCrossSpecies) return datasetA.genes.filter(g => g.geneType === 'clock' || g.geneType === 'target');
    return datasetA.genes;
  }, [datasetA, orthologyOnly, isCrossSpecies]);

  const genesB = useMemo(() => {
    if (!datasetB) return [];
    if (orthologyOnly && isCrossSpecies) return datasetB.genes.filter(g => g.geneType === 'clock' || g.geneType === 'target');
    return datasetB.genes;
  }, [datasetB, orthologyOnly, isCrossSpecies]);

  const intactA = statsA ? statsA.gap > ROC_OPTIMAL_THRESHOLD : false;
  const intactB = statsB ? statsB.gap > ROC_OPTIMAL_THRESHOLD : false;

  const bothIntact = intactA && intactB;
  const neitherIntact = !intactA && !intactB;
  const hierarchyStatus = bothIntact ? 'Both landscapes show intact hierarchy' : neitherIntact ? 'Neither landscape shows intact hierarchy' : 'One landscape shows intact hierarchy';

  return (
    <div data-testid="container-landscape-comparison">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium">Dataset A</label>
          <select
            value={datasetAId}
            onChange={e => setDatasetAId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white"
            data-testid="select-dataset-a"
          >
            {data.datasets.map(ds => (
              <option key={ds.datasetId} value={ds.datasetId}>{ds.datasetName} ({ds.species})</option>
            ))}
          </select>
          {statsA && (
            <Badge
              className={`text-xs ${intactA ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-red-900/50 text-red-300 border-red-700'}`}
              data-testid="badge-hierarchy-a"
            >
              {intactA ? 'Hierarchy Intact' : 'Hierarchy Disrupted'} (gap: {statsA.gap.toFixed(4)})
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium">Dataset B</label>
          <select
            value={datasetBId}
            onChange={e => setDatasetBId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white"
            data-testid="select-dataset-b"
          >
            {data.datasets.map(ds => (
              <option key={ds.datasetId} value={ds.datasetId}>{ds.datasetName} ({ds.species})</option>
            ))}
          </select>
          {statsB && (
            <Badge
              className={`text-xs ${intactB ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-red-900/50 text-red-300 border-red-700'}`}
              data-testid="badge-hierarchy-b"
            >
              {intactB ? 'Hierarchy Intact' : 'Hierarchy Disrupted'} (gap: {statsB.gap.toFixed(4)})
            </Badge>
          )}
        </div>
      </div>

      {isCrossSpecies && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer" data-testid="toggle-orthology">
              <input
                type="checkbox"
                checked={orthologyOnly}
                onChange={e => setOrthologyOnly(e.target.checked)}
                className="accent-cyan-500"
              />
              <span className="text-sm text-slate-300">Show only orthology-matched genes</span>
            </label>
          </div>
          {orthologyOnly && (
            <p className="text-xs text-amber-400 mt-2">Filtering to orthology-matched clock/target genes for fair cross-species comparison</p>
          )}
        </div>
      )}

      <div className="flex gap-4 mb-4" data-testid="comparison-heatmaps">
        {datasetA && <DensityHeatmapSVG genes={genesA} title={datasetA.datasetName} species={datasetA.species} />}
        {datasetB && <DensityHeatmapSVG genes={genesB} title={datasetB.datasetName} species={datasetB.species} />}
      </div>

      {statsA && statsB && (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4" data-testid="panel-shift-summary">
          <h4 className="text-sm font-semibold text-white mb-3">Shift Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Δ Clock |λ|</div>
              <div className="text-sm font-mono text-cyan-300" data-testid="text-delta-clock">
                {(statsB.clockMeanEigenvalue - statsA.clockMeanEigenvalue).toFixed(4)}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Δ Target |λ|</div>
              <div className="text-sm font-mono text-pink-300" data-testid="text-delta-target">
                {(statsB.targetMeanEigenvalue - statsA.targetMeanEigenvalue).toFixed(4)}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Δ Gap (Gearbox)</div>
              <div className="text-sm font-mono text-amber-300" data-testid="text-delta-gap">
                {(statsB.gap - statsA.gap).toFixed(4)}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Genes (A / B)</div>
              <div className="text-sm font-mono text-white" data-testid="text-gene-counts">
                {genesA.length} / {genesB.length}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Hierarchy Status</div>
              <div className={`text-xs font-medium ${bothIntact ? 'text-green-300' : neitherIntact ? 'text-red-300' : 'text-amber-300'}`} data-testid="text-hierarchy-status">
                {hierarchyStatus}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PCAComparisonSVG({ data, filters }: { data: RootSpaceData; filters: FilterState }) {
  const [selectedDataset, setSelectedDataset] = useState(0);
  const [hoveredGene, setHoveredGene] = useState<string | null>(null);

  const pcaDatasets = data.pcaComparison || [];
  if (pcaDatasets.length === 0) {
    return <div className="text-slate-400 text-sm text-center py-8">PCA data not available for this analysis.</div>;
  }

  const pcaDs = pcaDatasets[selectedDataset];
  const rootDs = data.datasets.find(d => d.datasetId === pcaDs.datasetId);
  if (!pcaDs || !rootDs) return null;

  const rootGeneMap = new Map(rootDs.genes.map(g => [g.gene, g]));

  const filteredPcaGenes = pcaDs.genes.filter(g => {
    if (filters.hiddenGenes.has(g.gene)) return false;
    if (!filters.visibleCategories.has(g.geneType)) return false;
    return true;
  });

  const W = 320, H = 280, PAD = 35;

  const pcaXRange = filteredPcaGenes.length > 0 ? [Math.min(...filteredPcaGenes.map(g => g.pc1)), Math.max(...filteredPcaGenes.map(g => g.pc1))] : [-1, 1];
  const pcaYRange = filteredPcaGenes.length > 0 ? [Math.min(...filteredPcaGenes.map(g => g.pc2)), Math.max(...filteredPcaGenes.map(g => g.pc2))] : [-1, 1];
  const pcaXSpan = (pcaXRange[1] - pcaXRange[0]) || 1;
  const pcaYSpan = (pcaYRange[1] - pcaYRange[0]) || 1;
  const pcaX = (v: number) => PAD + ((v - pcaXRange[0]) / pcaXSpan) * (W - 2 * PAD);
  const pcaY = (v: number) => H - PAD - ((v - pcaYRange[0]) / pcaYSpan) * (H - 2 * PAD);

  const rsX = (b1: number) => PAD + ((b1 + 2) / 4) * (W - 2 * PAD);
  const rsY = (b2: number) => H - PAD - ((b2 + 1) / 2) * (H - 2 * PAD);

  const rsTriangle = `M ${rsX(-2)} ${rsY(-1)} L ${rsX(0)} ${rsY(1)} L ${rsX(2)} ${rsY(-1)} Z`;
  const rsParabola = Array.from({ length: 40 }, (_, i) => {
    const b1 = -2 + (i / 39) * 4;
    return `${i === 0 ? 'M' : 'L'} ${rsX(b1)} ${rsY(-(b1 * b1) / 4)}`;
  }).join(' ');

  const matchedGenes = filteredPcaGenes.filter(g => rootGeneMap.has(g.gene));

  return (
    <div>
      {pcaDatasets.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {pcaDatasets.map((ds, i) => (
            <button
              key={ds.datasetId}
              onClick={() => setSelectedDataset(i)}
              className={`text-xs px-2.5 py-1 rounded border transition-all ${i === selectedDataset ? 'bg-amber-600/30 border-amber-500 text-amber-200' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
              data-testid={`button-pca-dataset-${ds.datasetId}`}
            >
              {ds.datasetName.split('(')[0].trim()}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 text-center">
            PCA Projection <span className="text-slate-400 font-normal">(expression variance)</span>
          </h4>
          <div className="text-[10px] text-slate-400 text-center mb-1">
            PC1: {pcaDs.varianceExplained[0]}% var. | PC2: {pcaDs.varianceExplained[1]}% var.
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-slate-950 rounded border border-slate-700" data-testid="svg-pca-projection">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#334155" strokeWidth="1" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#334155" strokeWidth="1" />
            <text x={W / 2} y={H - 8} fill="#94a3b8" fontSize="9" textAnchor="middle">PC1 ({pcaDs.varianceExplained[0]}%)</text>
            <text x={10} y={H / 2} fill="#94a3b8" fontSize="9" textAnchor="middle" transform={`rotate(-90, 10, ${H / 2})`}>PC2 ({pcaDs.varianceExplained[1]}%)</text>
            <text x={W / 2} y={H - 18} fill="#475569" fontSize="7" textAnchor="middle">Axes = statistical variance (no dynamical meaning)</text>
            {filteredPcaGenes.map((g, i) => {
              const col = GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8';
              const isHovered = hoveredGene === g.gene;
              return (
                <circle
                  key={`pca-${i}`}
                  cx={pcaX(g.pc1)}
                  cy={pcaY(g.pc2)}
                  r={isHovered ? 5 : 3}
                  fill={col}
                  opacity={isHovered ? 1 : 0.7}
                  onMouseEnter={() => setHoveredGene(g.gene)}
                  onMouseLeave={() => setHoveredGene(null)}
                  className="cursor-pointer"
                >
                  <title>{g.gene} ({g.geneType}) |λ|={g.eigenvalue.toFixed(3)}</title>
                </circle>
              );
            })}
          </svg>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 text-center">
            AR(2) Root Space <span className="text-slate-400 font-normal">(temporal dynamics)</span>
          </h4>
          <div className="text-[10px] text-slate-400 text-center mb-1">
            β₁ = AR(2) coefficient 1 | β₂ = AR(2) coefficient 2
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-slate-950 rounded border border-slate-700" data-testid="svg-rootspace-comparison">
            <path d={rsTriangle} fill="rgba(51,65,85,0.1)" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" />
            <path d={rsParabola} fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3 2" opacity="0.3" />
            <text x={W / 2} y={H - 8} fill="#94a3b8" fontSize="9" textAnchor="middle">β₁</text>
            <text x={10} y={H / 2} fill="#94a3b8" fontSize="9" textAnchor="middle" transform={`rotate(-90, 10, ${H / 2})`}>β₂</text>
            <text x={W / 2} y={H - 18} fill="#475569" fontSize="7" textAnchor="middle">Axes = AR(2) coefficients (precise dynamical meaning)</text>
            {matchedGenes.map((g, i) => {
              const rg = rootGeneMap.get(g.gene)!;
              const col = GENE_CATEGORY_CONFIG[g.geneType as GeneCategory]?.color || '#94a3b8';
              const isHovered = hoveredGene === g.gene;
              return (
                <circle
                  key={`rs-${i}`}
                  cx={rsX(rg.beta1)}
                  cy={rsY(rg.beta2)}
                  r={isHovered ? 5 : 3}
                  fill={col}
                  opacity={isHovered ? 1 : 0.7}
                  onMouseEnter={() => setHoveredGene(g.gene)}
                  onMouseLeave={() => setHoveredGene(null)}
                  className="cursor-pointer"
                >
                  <title>{g.gene} ({g.geneType}) |λ|={rg.eigenvalue.toFixed(3)}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </div>

      {hoveredGene && (() => {
        const pcaG = filteredPcaGenes.find(g => g.gene === hoveredGene);
        const rsG = rootGeneMap.get(hoveredGene);
        if (!pcaG || !rsG) return null;
        return (
          <div className="mt-2 bg-slate-800/80 border border-slate-700 rounded px-3 py-2 text-xs" data-testid="tooltip-pca-comparison">
            <span className="text-white font-bold">{hoveredGene}</span>
            <span className="mx-2 text-slate-400">|</span>
            <span style={{ color: GENE_CATEGORY_CONFIG[pcaG.geneType as GeneCategory]?.color }}>
              {GENE_CATEGORY_CONFIG[pcaG.geneType as GeneCategory]?.label || pcaG.geneType}
            </span>
            <span className="mx-2 text-slate-400">|</span>
            <span className="text-cyan-300">|λ|={rsG.eigenvalue.toFixed(4)}</span>
            <span className="mx-2 text-slate-400">|</span>
            <span className="text-slate-400">PCA: ({pcaG.pc1.toFixed(2)}, {pcaG.pc2.toFixed(2)})</span>
            <span className="mx-2 text-slate-400">|</span>
            <span className="text-slate-400">Root: (β₁={rsG.beta1.toFixed(3)}, β₂={rsG.beta2.toFixed(3)})</span>
          </div>
        );
      })()}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-red-900/30">
          <h5 className="text-xs font-semibold text-red-400 mb-1">PCA Limitations</h5>
          <ul className="text-[10px] text-slate-400 space-y-0.5">
            <li>Axes are abstract (rotational freedom)</li>
            <li>Captures variance, not temporal structure</li>
            <li>No stationarity boundary or void</li>
            <li>Cannot distinguish oscillatory from monotonic</li>
          </ul>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-green-900/30">
          <h5 className="text-xs font-semibold text-green-400 mb-1">Root-Space Advantages</h5>
          <ul className="text-[10px] text-slate-400 space-y-0.5">
            <li>Axes have precise dynamical meaning</li>
            <li>Captures temporal persistence (memory)</li>
            <li>Stationarity triangle defines boundaries</li>
            <li>Distinguishes oscillatory / self-reinforcing / alternating</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FrameworkOverlays({ data, filters }: { data: RootSpaceData; filters: FilterState }) {
  const [activeTab, setActiveTab] = useState<OverlayTab>('waddington');
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Object.keys(GENE_CATEGORY_CONFIG).forEach(k => { init[k] = true; });
    return init;
  });

  const toggleCategory = useCallback((cat: string) => {
    setCategoryFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const allGenes = useMemo(() => {
    return data.datasets.flatMap(ds => applyFilters(ds.genes, ds.datasetId, filters));
  }, [data, filters]);

  const visibleCount = useMemo(() => allGenes.filter(g => categoryFilters[g.geneType] !== false).length, [allGenes, categoryFilters]);

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Layers size={18} className="text-amber-400" />
          Comparative Framework Overlays
        </CardTitle>
        <CardDescription className="text-slate-400">
          The root-space map viewed through three complementary lenses — each revealing different aspects of the same underlying structure.
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-3">
          {(Object.entries(OVERLAY_TAB_CONFIG) as [OverlayTab, typeof OVERLAY_TAB_CONFIG[OverlayTab]][]).map(([key, cfg]) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-7 ${activeTab === key ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'border-slate-600 text-slate-300'}`}
              onClick={() => setActiveTab(key)}
              data-testid={`button-overlay-tab-${key}`}
            >
              {cfg.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-slate-400 mb-4">{OVERLAY_TAB_CONFIG[activeTab].description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(GENE_CATEGORY_CONFIG).filter(([k]) => k !== 'other').map(([cat, cfg]) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border transition-all ${categoryFilters[cat] !== false ? 'border-opacity-60' : 'border-slate-700 opacity-40'}`}
              style={{ borderColor: categoryFilters[cat] !== false ? cfg.color : undefined, backgroundColor: categoryFilters[cat] !== false ? cfg.color + '15' : undefined }}
              data-testid={`button-category-filter-${cat}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryFilters[cat] !== false ? cfg.color : '#475569' }} />
              <span style={{ color: categoryFilters[cat] !== false ? cfg.color : '#64748b' }}>{cfg.label}</span>
            </button>
          ))}
          <span className="text-xs text-slate-400 self-center ml-2">{visibleCount} genes visible</span>
        </div>

        {activeTab === 'waddington' && <WaddingtonCombinedView genes={allGenes} categoryFilters={categoryFilters} />}
        {activeTab === 'phase' && <PhasePortraitSVG genes={allGenes} categoryFilters={categoryFilters} />}
        {activeTab === 'geography' && <FunctionalGeographySVG genes={allGenes} hierarchy={data.categoryHierarchy?.hierarchy} />}
        {activeTab === 'pca' && <PCAComparisonSVG data={data} filters={filters} />}
        {activeTab === 'comparison' && <LandscapeComparison data={data} />}
        <div className="mt-3 text-xs text-slate-400 space-y-1">
          <p>These overlays demonstrate how the AR(2) root-space map relates to established frameworks in biology and dynamical systems theory. The Waddington landscape shows gene density as terrain; the phase portrait shows the classical dynamical regime classification; the functional geography shows where gene categories cluster relative to dynamical poles.</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface EnrichmentCategoryResult {
  category: string;
  annotationSource: string;
  nGenesMatched: number;
  meanBeta1: number;
  meanBeta2: number;
  meanEigenvalue: number;
  withinCategoryDistance: number;
  expectedDistance: number;
  clusteringRatio: number;
  permutationP: number;
  significant: boolean;
  dominantPole: string;
  genes: string[];
}

interface PoleEnrichmentData {
  pole: string;
  poleDescription: string;
  totalGenesInRegion: number;
  topCategories: { category: string; count: number; enrichment: number; pValue: number }[];
}

interface VoidData {
  totalGenes: number;
  voidGenes: number;
  voidFraction: number;
  strongOscillationGenes: number;
  strongOscillationFraction: number;
  realRootGenes: number;
  realRootFraction: number;
  bimodalityIndex: number;
  voidPersistsGenomeWide: boolean;
}

interface FullEnrichmentResult {
  datasetId: string;
  totalGenesAnalyzed: number;
  annotationSource: string;
  categoriesTestedTotal: number;
  categoriesWithData: number;
  significantCategories: number;
  categoryResults: EnrichmentCategoryResult[];
  voidAnalysis: VoidData;
  topClusteredCategories: EnrichmentCategoryResult[];
  poleEnrichment: PoleEnrichmentData[];
  summary: string;
  timestamp: string;
}

const POLE_COLORS: Record<string, string> = {
  'self-reinforcing': '#22c55e',
  'alternating': '#f59e0b',
  'oscillatory': '#3b82f6',
  'center': '#a855f7',
  'intermediate': '#94a3b8',
};

interface DrugTargetOverlayData {
  dataset: { id: string; name: string; species: string };
  totalGenesInDataset: number;
  totalDrugTargetsMatched: number;
  totalDrugTargetsInDB: number;
  filters: { drugClass: string; fdaOnly: boolean };
  drugTargets: DrugTargetGene[];
  classSummary: Record<string, { count: number; meanEigenvalue: number; meanBeta1: number; meanBeta2: number; dominantPoles: Record<string, number> }>;
  poleSummary: Record<string, number>;
  topByEigenvalue: DrugTargetGene[];
  clockGatedTargets: number;
  clockGatedList: DrugTargetGene[];
  drugClassConfig: Record<string, { label: string; color: string; description: string }>;
  availableDatasets: { id: string; name: string; species: string }[];
}

interface DrugTargetGene {
  gene: string;
  beta1: number;
  beta2: number;
  eigenvalue: number;
  r: number;
  theta: number;
  x: number;
  y: number;
  r2: number;
  stable: boolean;
  drugs: { drugName: string; drugClass: string; interactionType: string; fdaApproved: boolean; indication: string }[];
  primaryDrugClass: string;
  dominantPole: string;
  drugCount: number;
  fdaApprovedCount: number;
}

function DrugTargetOverlayPanel() {
  const [expanded, setExpanded] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('GSE54650_Liver_circadian');
  const [drugClassFilter, setDrugClassFilter] = useState('all');
  const [fdaOnly, setFdaOnly] = useState(false);
  const [activated, setActivated] = useState(false);
  const [selectedGene, setSelectedGene] = useState<DrugTargetGene | null>(null);

  const queryParams = new URLSearchParams();
  queryParams.set('dataset', selectedDataset);
  queryParams.set('drugClass', drugClassFilter);
  if (fdaOnly) queryParams.set('fdaOnly', 'true');

  const { data, isLoading, error } = useQuery<DrugTargetOverlayData>({
    queryKey: [`/api/analysis/drug-target-overlay?${queryParams.toString()}`],
    staleTime: 1000 * 60 * 30,
    enabled: activated,
  });

  const datasetOptions = [
    { id: 'GSE54650_Liver_circadian', label: 'Mouse Liver (GSE54650)' },
    { id: 'GSE54650_Kidney_circadian', label: 'Mouse Kidney (GSE54650)' },
    { id: 'GSE54650_Heart_circadian', label: 'Mouse Heart (GSE54650)' },
    { id: 'GSE54650_Lung_circadian', label: 'Mouse Lung (GSE54650)' },
    { id: 'GSE113883_Human_WholeBlood', label: 'Human Blood (GSE113883)' },
    { id: 'GSE157357_Organoid_WT-WT', label: 'Organoid WT (GSE157357)' },
    { id: 'GSE157357_Organoid_ApcKO-WT', label: 'Organoid APC-KO (GSE157357)' },
    { id: 'GSE221103_Neuroblastoma_MYC_ON', label: 'Neuroblastoma MYC-ON' },
    { id: 'GSE221103_Neuroblastoma_MYC_OFF', label: 'Neuroblastoma MYC-OFF' },
    { id: 'GSE98965_baboon_FPKM', label: 'Baboon Multi-tissue (GSE98965)' },
  ];

  const dynamicDrugClassOptions = useMemo(() => {
    const opts = [{ id: 'all', label: 'All Drug Classes' }];
    if (data?.drugClassConfig) {
      Object.entries(data.drugClassConfig).forEach(([id, cfg]) => {
        opts.push({ id, label: cfg.label });
      });
    }
    return opts;
  }, [data]);

  const scatterData = useMemo(() => {
    if (!data) return [];
    return data.drugTargets.map(g => ({
      x: g.beta1,
      y: g.beta2,
      gene: g.gene,
      eigenvalue: g.eigenvalue,
      drugClass: g.primaryDrugClass,
      drugCount: g.drugCount,
      dominantPole: g.dominantPole,
      color: data.drugClassConfig[g.primaryDrugClass]?.color || '#666',
      selected: selectedGene?.gene === g.gene,
    }));
  }, [data, selectedGene]);

  const classSummaryArr = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.classSummary)
      .map(([cls, stats]) => ({
        drugClass: cls,
        label: data.drugClassConfig[cls]?.label || cls,
        color: data.drugClassConfig[cls]?.color || '#666',
        ...stats,
      }))
      .sort((a, b) => b.meanEigenvalue - a.meanEigenvalue);
  }, [data]);

  return (
    <Card className="mb-6 bg-slate-900/50 border-slate-700" data-testid="card-drug-target-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Pill size={18} className="text-rose-400" />
            Drug Target Overlay
            <Badge className="bg-rose-900/50 text-rose-300 border-rose-700 text-[10px]">NEW</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white text-xs h-7"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-toggle-drug-targets"
          >
            {expanded ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        <CardDescription className="text-slate-400">
          Maps FDA-approved and investigational drug targets onto root-space. Shows where each drug target sits
          in dynamical space — which are clock-gated, which are oscillatory, which are memoryless.
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Dataset</label>
              <select
                value={selectedDataset}
                onChange={e => setSelectedDataset(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white min-w-[200px]"
                data-testid="select-drug-dataset"
              >
                {datasetOptions.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Drug Class</label>
              <select
                value={drugClassFilter}
                onChange={e => setDrugClassFilter(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white min-w-[160px]"
                data-testid="select-drug-class"
              >
                {dynamicDrugClassOptions.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="fda-only"
                checked={fdaOnly}
                onCheckedChange={(v) => setFdaOnly(!!v)}
                data-testid="checkbox-fda-only"
              />
              <label htmlFor="fda-only" className="text-xs text-slate-400 cursor-pointer">FDA Approved Only</label>
            </div>
            {!activated && (
              <Button
                onClick={() => setActivated(true)}
                disabled={isLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8"
                data-testid="button-run-drug-overlay"
              >
                {isLoading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Target size={14} className="mr-1" />}
                {isLoading ? 'Loading...' : 'Map Drug Targets'}
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="text-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-rose-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Mapping drug targets onto root-space...</p>
            </div>
          )}

          {error && (
            <Alert className="bg-red-900/30 border-red-700/50">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200/70 text-xs">
                {(error as Error)?.message || 'Failed to load drug target overlay'}
              </AlertDescription>
            </Alert>
          )}

          {data && !isLoading && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white" data-testid="text-drug-total-genes">{data.totalGenesInDataset.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">Genes in Dataset</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-rose-400" data-testid="text-drug-targets-matched">{data.totalDrugTargetsMatched}</div>
                  <div className="text-xs text-slate-400">Drug Targets Found</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{data.totalDrugTargetsInDB}</div>
                  <div className="text-xs text-slate-400">In Database</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400" data-testid="text-clock-gated">{data.clockGatedTargets}</div>
                  <div className="text-xs text-slate-400">Clock-Gated</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {data.totalDrugTargetsMatched > 0 ? ((data.clockGatedTargets / data.totalDrugTargetsMatched) * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-xs text-slate-400">Chronotherapy Amenable</div>
                </div>
              </div>

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Target size={14} className="text-rose-400" />
                    Drug Targets in Root-Space (β₁, β₂)
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Each dot is a drug target gene. Color = drug class. Click a point to see drugs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={450}>
                    <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        domain={[-2.5, 2.5]}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        label={{ value: 'β₁', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
                        name="β₁"
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        domain={[-1.5, 1.5]}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        label={{ value: 'β₂', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
                        name="β₂"
                      />
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (!active || !payload?.[0]) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs shadow-xl max-w-xs">
                              <div className="font-bold text-white text-sm">{d.gene}</div>
                              <div className="text-slate-400 mt-1">β₁={d.x?.toFixed(3)}, β₂={d.y?.toFixed(3)}</div>
                              <div className="text-slate-400">|λ|={d.eigenvalue?.toFixed(3)}</div>
                              <div className="text-slate-400">Pole: <span className="text-white">{d.dominantPole}</span></div>
                              <div className="text-slate-400 mt-1">{d.drugCount} drug(s): <span className="text-rose-300">{d.drugClass?.replace(/_/g, ' ')}</span></div>
                            </div>
                          );
                        }}
                      />
                      <Scatter
                        data={scatterData}
                        name="Drug Targets"
                        onClick={(entry: any) => {
                          if (entry && data) {
                            const gene = data.drugTargets.find(g => g.gene === entry.gene);
                            setSelectedGene(gene || null);
                          }
                        }}
                        cursor="pointer"
                      >
                        {scatterData.map((g, i) => (
                          <Cell
                            key={i}
                            fill={g.color}
                            opacity={g.selected ? 1 : 0.85}
                            r={g.selected ? 8 : 5}
                            stroke={g.selected ? '#ffffff' : 'none'}
                            strokeWidth={g.selected ? 2 : 0}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>

                  {data.drugClassConfig && (
                    <div className="flex flex-wrap gap-2 mt-3 justify-center">
                      {classSummaryArr.map(cls => (
                        <div key={cls.drugClass} className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cls.color }} />
                          {cls.label} ({cls.count})
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedGene && (
                <Card className="bg-rose-950/20 border-rose-800/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Pill size={14} className="text-rose-400" />
                        {selectedGene.gene} — Drug Details
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-slate-400 h-6 w-6 p-0" onClick={() => setSelectedGene(null)}>
                        <X size={12} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
                      <div>
                        <span className="text-slate-400">β₁:</span> <span className="text-white font-mono">{selectedGene.beta1.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">β₂:</span> <span className="text-white font-mono">{selectedGene.beta2.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">|λ|:</span> <span className="text-white font-mono">{selectedGene.eigenvalue.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Pole:</span>
                        <span className="ml-1 text-white font-semibold" style={{ color: POLE_COLORS[selectedGene.dominantPole] || '#fff' }}>
                          {selectedGene.dominantPole}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {selectedGene.drugs.map((d, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-900/60 rounded px-3 py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.drugClassConfig[d.drugClass]?.color || '#666' }} />
                            <span className="text-white font-semibold">{d.drugName}</span>
                            <span className="text-slate-400">{d.interactionType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{d.indication}</span>
                            {d.fdaApproved ? (
                              <Badge className="bg-green-900/50 text-green-300 border-green-700 text-[9px] px-1.5 py-0">FDA</Badge>
                            ) : (
                              <Badge className="bg-slate-700 text-slate-400 text-[9px] px-1.5 py-0">Investigational</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Crosshair size={14} className="text-amber-400" />
                    Pole Distribution of Drug Targets
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Where do drug targets cluster in dynamical space? Clock-gated = self-reinforcing + oscillatory poles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(data.poleSummary).sort((a, b) => b[1] - a[1]).map(([pole, count]) => (
                      <div key={pole} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-center">
                        <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: POLE_COLORS[pole] || '#666' }} />
                        <div className="text-lg font-bold text-white">{count}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{pole.replace(/-/g, ' ')}</div>
                        <div className="text-[10px] text-slate-400">
                          {data.totalDrugTargetsMatched > 0 ? ((count / data.totalDrugTargetsMatched) * 100).toFixed(0) : 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <BarChart3 size={14} className="text-cyan-400" />
                    Drug Class Eigenvalue Ranking
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Mean eigenvalue modulus by drug class. Higher |λ| = stronger temporal persistence = more clock-gated.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {classSummaryArr.map((cls, i) => {
                      const maxEv = Math.max(...classSummaryArr.map(c => c.meanEigenvalue), 0.01);
                      const pct = (cls.meanEigenvalue / maxEv) * 100;
                      return (
                        <div key={cls.drugClass} className="flex items-center gap-2" data-testid={`drug-class-row-${cls.drugClass}`}>
                          <span className="text-xs text-slate-400 w-5 text-right">#{i + 1}</span>
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                          <span className="text-xs text-white w-32 truncate">{cls.label}</span>
                          <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden">
                            <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: cls.color, opacity: 0.7 }} />
                          </div>
                          <span className="text-xs font-mono text-slate-300 w-16 text-right">|λ|={cls.meanEigenvalue.toFixed(3)}</span>
                          <span className="text-[10px] text-slate-400 w-10 text-right">n={cls.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {data.clockGatedList && data.clockGatedList.length > 0 && (
                <Card className="bg-emerald-950/20 border-emerald-800/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Atom size={14} className="text-emerald-400" />
                      Chronotherapy Candidates (Clock-Gated Drug Targets)
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Drug targets at the self-reinforcing or oscillatory pole — timing of administration may affect efficacy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-700">
                            <th className="text-left py-1 px-2">Gene</th>
                            <th className="text-left py-1 px-1">Drug(s)</th>
                            <th className="text-right py-1 px-1">|λ|</th>
                            <th className="text-left py-1 px-1">Pole</th>
                            <th className="text-left py-1 px-2">Indication</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.clockGatedList.slice(0, 15).map((g, i) => (
                            <tr
                              key={i}
                              className="border-b border-slate-700/50 hover:bg-slate-800/30 cursor-pointer"
                              onClick={() => setSelectedGene(g)}
                            >
                              <td className="py-1.5 px-2 text-white font-semibold">{g.gene}</td>
                              <td className="py-1.5 px-1 text-rose-300">
                                {g.drugs.slice(0, 2).map(d => d.drugName).join(', ')}
                                {g.drugs.length > 2 ? ` +${g.drugs.length - 2}` : ''}
                              </td>
                              <td className="py-1.5 px-1 text-right font-mono text-emerald-400">{g.eigenvalue.toFixed(3)}</td>
                              <td className="py-1.5 px-1">
                                <span style={{ color: POLE_COLORS[g.dominantPole] || '#fff' }}>{g.dominantPole}</span>
                              </td>
                              <td className="py-1.5 px-2 text-slate-400 truncate max-w-[200px]">
                                {g.drugs[0]?.indication || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.topByEigenvalue && data.topByEigenvalue.length > 0 && (
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <BarChart3 size={14} className="text-amber-400" />
                      Top 10 Drug Targets by Temporal Persistence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data.topByEigenvalue.slice(0, 10)} margin={{ top: 5, right: 10, bottom: 40, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="gene"
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          label={{ value: '|λ|', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                        />
                        <Tooltip
                          content={({ active, payload }: any) => {
                            if (!active || !payload?.[0]) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-gray-900 border border-gray-700 rounded p-2 text-xs">
                                <div className="text-white font-bold">{d.gene}</div>
                                <div className="text-slate-400">|λ|={d.eigenvalue.toFixed(4)}</div>
                                <div className="text-slate-400">Pole: {d.dominantPole}</div>
                                <div className="text-rose-300">{d.drugs?.map((dr: any) => dr.drugName).join(', ')}</div>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="eigenvalue" name="|λ|">
                          {data.topByEigenvalue.slice(0, 10).map((g, i) => (
                            <Cell key={i} fill={data.drugClassConfig[g.primaryDrugClass]?.color || '#666'} opacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              <CrossTissueComparison />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface CrossTissueData {
  tissues: string[];
  tissueSummaries: Record<string, { totalMatched: number; clockGated: number; overallMeanEigenvalue: number }>;
  heatmapData: { drugClass: string; label: string; color: string; tissues: Record<string, { mean: number; std: number; n: number; clockGatedPct: number }> }[];
  tissueVariableGenes: { gene: string; tissues: Record<string, { eigenvalue: number; pole: string }>; meanEigenvalue: number; cv: number; uniquePoles: number; poleSwitcher: boolean }[];
  poleSwitchers: { gene: string; tissues: Record<string, { eigenvalue: number; pole: string }>; meanEigenvalue: number; cv: number; uniquePoles: number; poleSwitcher: boolean }[];
  withinClassSpread: { drugClass: string; label: string; color: string; meanEigenvalue: number; stdDev: number; cv: number; range: number; min: number; max: number; n: number; eigenvalues: number[]; poleDistribution: Record<string, number> }[];
  drugClassConfig: Record<string, { label: string; color: string; description: string }>;
}

function CrossTissueComparison() {
  const [showCrossTissue, setShowCrossTissue] = useState(false);
  const { data, isLoading, error } = useQuery<CrossTissueData>({
    queryKey: ['/api/analysis/drug-target-cross-tissue'],
    staleTime: 1000 * 60 * 60,
    enabled: showCrossTissue,
  });

  return (
    <>
      {!showCrossTissue && (
        <Button
          onClick={() => setShowCrossTissue(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 w-full"
          data-testid="button-run-cross-tissue"
        >
          <Layers size={14} className="mr-1" />
          Run Cross-Tissue Comparison & Within-Class Spread Analysis
        </Button>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Running drug target analysis across 6 tissues...</p>
          <p className="text-slate-400 text-xs">This may take 30-60 seconds</p>
        </div>
      )}

      {error && (
        <Alert className="bg-red-900/30 border-red-700/50">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200/70 text-xs">
            {(error as Error)?.message || 'Cross-tissue analysis failed'}
          </AlertDescription>
        </Alert>
      )}

      {data && !isLoading && (
        <div className="space-y-6">
          <Card className="bg-indigo-950/20 border-indigo-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Layers size={14} className="text-indigo-400" />
                Cross-Tissue Drug Target Summary
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Same drug targets, different tissues. Which organs have the most clock-gated targets?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {data.tissues.filter(t => data.tissueSummaries[t]?.totalMatched > 0).map(tissue => {
                  const s = data.tissueSummaries[tissue];
                  return (
                    <div key={tissue} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                      <div className="text-xs font-semibold text-white mb-1">{tissue}</div>
                      <div className="text-lg font-bold text-indigo-400">{s.clockGated}</div>
                      <div className="text-[10px] text-slate-400">clock-gated</div>
                      <div className="text-xs text-slate-400 mt-1">
                        mean |λ|={s.overallMeanEigenvalue.toFixed(3)}
                      </div>
                      <div className="text-[10px] text-slate-400">{s.totalMatched} matched</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 size={14} className="text-indigo-400" />
                Drug Class Eigenvalue Heatmap (Across Tissues)
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Mean |λ| for each drug class in each tissue. Brighter = higher persistence = more clock-gated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-1.5 px-2 sticky left-0 bg-slate-900">Drug Class</th>
                      {data.tissues.filter(t => data.tissueSummaries[t]?.totalMatched > 0).map(t => (
                        <th key={t} className="text-center py-1.5 px-2 min-w-[80px]">{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.heatmapData
                      .filter(row => Object.keys(row.tissues).length > 0)
                      .sort((a, b) => {
                        const aMax = Math.max(...Object.values(a.tissues).map(t => t.mean));
                        const bMax = Math.max(...Object.values(b.tissues).map(t => t.mean));
                        return bMax - aMax;
                      })
                      .map(row => (
                      <tr key={row.drugClass} className="border-b border-slate-700/30 hover:bg-slate-800/20">
                        <td className="py-1.5 px-2 sticky left-0 bg-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                            <span className="text-white">{row.label}</span>
                          </div>
                        </td>
                        {data.tissues.filter(t => data.tissueSummaries[t]?.totalMatched > 0).map(tissue => {
                          const val = row.tissues[tissue];
                          if (!val) return <td key={tissue} className="text-center text-slate-400 py-1.5">—</td>;
                          const intensity = Math.min(1, val.mean / 0.8);
                          const bgColor = val.clockGatedPct > 0
                            ? `rgba(34, 197, 94, ${intensity * 0.4})`
                            : `rgba(99, 102, 241, ${intensity * 0.3})`;
                          return (
                            <td key={tissue} className="text-center py-1.5 px-1" style={{ backgroundColor: bgColor }}>
                              <div className="font-mono text-white">{val.mean.toFixed(3)}</div>
                              {val.clockGatedPct > 0 && (
                                <div className="text-[9px] text-emerald-400">{val.clockGatedPct}% gated</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {data.poleSwitchers && data.poleSwitchers.length > 0 && (
            <Card className="bg-amber-950/20 border-amber-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target size={14} className="text-amber-400" />
                  Pole Switchers — Drug Targets That Change Dynamics Across Tissues
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Genes that sit at different dynamical poles in different tissues. These are the strongest
                  candidates for tissue-specific chronotherapy: the drug works differently depending on which organ you're treating.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="text-left py-1.5 px-2">Gene</th>
                        <th className="text-right py-1.5 px-1">CV</th>
                        {data.tissues.filter(t => data.tissueSummaries[t]?.totalMatched > 0).map(t => (
                          <th key={t} className="text-center py-1.5 px-1 min-w-[70px]">{t}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.poleSwitchers.slice(0, 15).map(g => (
                        <tr key={g.gene} className="border-b border-slate-700/30 hover:bg-slate-800/20">
                          <td className="py-1.5 px-2 text-white font-semibold">{g.gene}</td>
                          <td className="py-1.5 px-1 text-right font-mono text-amber-400">{g.cv.toFixed(3)}</td>
                          {data.tissues.filter(t => data.tissueSummaries[t]?.totalMatched > 0).map(tissue => {
                            const val = g.tissues[tissue];
                            if (!val) return <td key={tissue} className="text-center text-slate-400 py-1.5">—</td>;
                            return (
                              <td key={tissue} className="text-center py-1.5 px-1">
                                <div className="font-mono text-white text-[11px]">{val.eigenvalue.toFixed(3)}</div>
                                <div className="text-[9px]" style={{ color: POLE_COLORS[val.pole] || '#94a3b8' }}>
                                  {val.pole}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {data.withinClassSpread && data.withinClassSpread.length > 0 && (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 size={14} className="text-cyan-400" />
                  Within-Class Eigenvalue Spread
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  How tightly clustered are targets within each drug class? High CV = targets behave differently,
                  need per-gene analysis. Low CV = class-wide chronotherapy recommendation possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.withinClassSpread.map(cls => {
                    const poleEntries = Object.entries(cls.poleDistribution || {}).sort((a, b) => b[1] - a[1]);
                    return (
                      <div key={cls.drugClass} className="bg-slate-900/40 rounded-lg p-3" data-testid={`spread-class-${cls.drugClass}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cls.color }} />
                            <span className="text-white text-xs font-semibold">{cls.label}</span>
                            <span className="text-slate-400 text-[10px]">n={cls.n}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px]">
                            <span className="text-slate-400">CV=<span className={`font-mono ${cls.cv > 0.3 ? 'text-amber-400' : 'text-emerald-400'}`}>{cls.cv.toFixed(3)}</span></span>
                            <span className="text-slate-400">mean=<span className="text-white font-mono">{cls.meanEigenvalue.toFixed(3)}</span></span>
                            <span className="text-slate-400">range=<span className="text-white font-mono">[{cls.min.toFixed(2)}-{cls.max.toFixed(2)}]</span></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 h-4 mb-1.5">
                          {cls.eigenvalues.map((ev, i) => (
                            <div
                              key={i}
                              className="h-full rounded-sm"
                              style={{
                                width: `${Math.max(2, 100 / cls.eigenvalues.length)}%`,
                                backgroundColor: cls.color,
                                opacity: 0.3 + (ev / Math.max(...cls.eigenvalues)) * 0.7,
                              }}
                              title={`|λ|=${ev.toFixed(4)}`}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2 text-[9px]">
                          {poleEntries.map(([pole, count]) => (
                            <span key={pole} className="flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: POLE_COLORS[pole] || '#666' }} />
                              <span className="text-slate-400">{pole}: {count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 p-2 bg-slate-900/60 rounded text-[10px] text-slate-400">
                  <strong className="text-slate-300">Interpretation:</strong> Drug classes with CV {'>'} 0.3 (amber) have heterogeneous temporal dynamics —
                  chronotherapy recommendations must be made per-gene, not per-class. Classes with CV {'<'} 0.3 (green) are coherent — a single
                  timing protocol may apply to all targets in the class.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function GenomeWideEnrichmentPanel() {
  const [expanded, setExpanded] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('GSE54650_Liver_circadian');
  const [annotationSource, setAnnotationSource] = useState<'ALL' | 'GO' | 'KEGG' | 'DYNAMICAL'>('ALL');
  const [shouldFetch, setShouldFetch] = useState(false);

  const queryParams = new URLSearchParams();
  queryParams.set('dataset', selectedDataset);
  queryParams.set('annotation', annotationSource);
  queryParams.set('nPermutations', '1000');

  const { data, isLoading, error } = useQuery<FullEnrichmentResult>({
    queryKey: [`/api/analysis/root-space-enrichment?${queryParams.toString()}`],
    staleTime: 1000 * 60 * 60,
    enabled: shouldFetch,
  });

  const significantResults = useMemo(() =>
    data?.categoryResults?.filter(r => r.significant) || [], [data]);
  const topClustered = useMemo(() =>
    data?.topClusteredCategories || [], [data]);

  const datasetOptions = [
    { id: 'GSE54650_Liver_circadian', label: 'Mouse Liver (GSE54650)' },
    { id: 'GSE54650_Kidney_circadian', label: 'Mouse Kidney (GSE54650)' },
    { id: 'GSE54650_Heart_circadian', label: 'Mouse Heart (GSE54650)' },
    { id: 'GSE54650_Lung_circadian', label: 'Mouse Lung (GSE54650)' },
    { id: 'GSE113883_Human_WholeBlood', label: 'Human Whole Blood (GSE113883)' },
    { id: 'GSE98965_baboon_FPKM', label: 'Baboon (GSE98965)' },
  ];

  return (
    <Card className="mb-6 bg-slate-900/50 border-slate-700" data-testid="card-enrichment-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Layers size={18} className="text-violet-400" />
            Genome-Wide Functional Enrichment
            <Badge className="bg-violet-900/50 text-violet-300 border-violet-700 text-[10px]">NEW</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white text-xs h-7"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-toggle-enrichment"
          >
            {expanded ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        <CardDescription className="text-slate-400">
          Tests whether Gene Ontology and KEGG pathway categories cluster at specific root-space positions.
          Validates functional geography as a systematic biological principle across ~20,000+ genes.
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Dataset</label>
              <select
                value={selectedDataset}
                onChange={e => setSelectedDataset(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white min-w-[200px]"
                data-testid="select-enrichment-dataset"
              >
                {datasetOptions.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Annotation Source</label>
              <select
                value={annotationSource}
                onChange={e => setAnnotationSource(e.target.value as any)}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white"
                data-testid="select-annotation-source"
              >
                <option value="ALL">All (GO + KEGG + Dynamical)</option>
                <option value="GO">GO Biological Process</option>
                <option value="KEGG">KEGG Pathways</option>
                <option value="DYNAMICAL">Dynamical Predictions</option>
              </select>
            </div>
            <Button
              onClick={() => setShouldFetch(true)}
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
              data-testid="button-run-enrichment"
            >
              {isLoading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <FlaskConical size={14} className="mr-1" />}
              {isLoading ? 'Running Analysis...' : 'Run Enrichment Analysis'}
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Running permutation tests on ~20,000 genes...</p>
              <p className="text-slate-400 text-xs">This may take 30-60 seconds</p>
            </div>
          )}

          {error && (
            <Alert className="bg-red-900/30 border-red-700/50">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200/70 text-xs">
                {(error as Error)?.message || 'Failed to run enrichment analysis'}
              </AlertDescription>
            </Alert>
          )}

          {data && !isLoading && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white" data-testid="text-total-genes">{data.totalGenesAnalyzed.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">Genes Analyzed</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{data.categoriesWithData}</div>
                  <div className="text-xs text-slate-400">Categories Tested</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${data.significantCategories > 0 ? 'text-emerald-400' : 'text-slate-400'}`} data-testid="text-sig-categories">
                    {data.significantCategories}
                  </div>
                  <div className="text-xs text-slate-400">Significant (p{'<'}0.05)</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${data.voidAnalysis.voidPersistsGenomeWide ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {data.voidAnalysis.voidPersistsGenomeWide ? 'YES' : 'NO'}
                  </div>
                  <div className="text-xs text-slate-400">Void Persists</div>
                </div>
              </div>

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-400" />
                    Void Analysis (Genome-Wide)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Real-root genes:</span>
                      <span className="text-white ml-1 font-mono">{(data.voidAnalysis.realRootFraction * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Oscillatory genes:</span>
                      <span className="text-white ml-1 font-mono">{(data.voidAnalysis.strongOscillationFraction * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Transition zone:</span>
                      <span className="text-white ml-1 font-mono">{(data.voidAnalysis.voidFraction * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Bimodality index:</span>
                      <span className="text-white ml-1 font-mono">{data.voidAnalysis.bimodalityIndex}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {data.voidAnalysis.voidPersistsGenomeWide
                      ? 'The dynamical exclusion zone (void) persists genome-wide: fewer than 10% of genes fall in the transition zone between real-root and oscillatory regimes.'
                      : 'The void is less distinct at genome-wide scale. Transition zone contains a notable fraction of genes.'}
                  </p>
                </CardContent>
              </Card>

              {data.poleEnrichment && data.poleEnrichment.length > 0 && (
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Crosshair size={14} className="text-amber-400" />
                      Pole Enrichment Analysis
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Which biological functions are enriched at each dynamical pole?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.poleEnrichment.map(pole => (
                        <div key={pole.pole} className="border border-slate-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: POLE_COLORS[pole.pole] || '#666' }} />
                            <span className="text-white text-sm font-semibold capitalize">{pole.pole}</span>
                            <span className="text-slate-400 text-xs">({pole.totalGenesInRegion} genes)</span>
                          </div>
                          <p className="text-slate-400 text-xs mb-2">{pole.poleDescription}</p>
                          {pole.topCategories.length > 0 ? (
                            <div className="space-y-1">
                              {pole.topCategories.slice(0, 5).map((cat, i) => (
                                <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-slate-900/50">
                                  <span className="text-white truncate mr-2">{cat.category}</span>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-slate-400">n={cat.count}</span>
                                    <span className={`font-mono ${cat.enrichment > 1.5 ? 'text-emerald-400' : 'text-slate-300'}`}>
                                      {cat.enrichment}×
                                    </span>
                                    <span className={`font-mono ${cat.pValue < 0.05 ? 'text-green-400' : 'text-slate-400'}`}>
                                      p={cat.pValue.toFixed(3)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-xs italic">No enriched categories in this region</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {significantResults.length > 0 && (
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Filter size={14} className="text-cyan-400" />
                      Significant Clustering Categories (p{'<'}0.05)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-700">
                            <th className="text-left py-1 px-2">Category</th>
                            <th className="text-left py-1 px-1">Source</th>
                            <th className="text-right py-1 px-1">n</th>
                            <th className="text-right py-1 px-1">Mean |λ|</th>
                            <th className="text-right py-1 px-1">Cluster Ratio</th>
                            <th className="text-right py-1 px-1">p-value</th>
                            <th className="text-left py-1 px-2">Dominant Pole</th>
                          </tr>
                        </thead>
                        <tbody>
                          {significantResults.slice(0, 20).map((r, i) => (
                            <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                              <td className="py-1 px-2 text-white font-medium">{r.category}</td>
                              <td className="py-1 px-1">
                                <Badge className={`text-[9px] px-1 py-0 ${
                                  r.annotationSource === 'GO_BP' ? 'bg-blue-900/50 text-blue-300' :
                                  r.annotationSource === 'KEGG' ? 'bg-green-900/50 text-green-300' :
                                  'bg-purple-900/50 text-purple-300'
                                }`}>{r.annotationSource}</Badge>
                              </td>
                              <td className="py-1 px-1 text-right text-slate-300 font-mono">{r.nGenesMatched}</td>
                              <td className="py-1 px-1 text-right text-slate-300 font-mono">{r.meanEigenvalue.toFixed(3)}</td>
                              <td className="py-1 px-1 text-right font-mono">
                                <span className={r.clusteringRatio < 0.9 ? 'text-emerald-400' : 'text-slate-400'}>
                                  {r.clusteringRatio.toFixed(3)}
                                </span>
                              </td>
                              <td className="py-1 px-1 text-right font-mono text-green-400">{r.permutationP.toFixed(4)}</td>
                              <td className="py-1 px-2 text-slate-400">{r.dominantPole}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {topClustered.length > 0 && (
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">Category Clustering Visualization</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Mean root-space position of each category. Tighter clustering = lower ratio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          type="number"
                          dataKey="meanBeta1"
                          name="Mean β₁"
                          domain={[-1.5, 2]}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          label={{ value: 'Mean β₁', position: 'bottom', fill: '#94a3b8', fontSize: 11 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="meanBeta2"
                          name="Mean β₂"
                          domain={[-1.2, 1.2]}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          label={{ value: 'Mean β₂', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.[0]) return null;
                            const d = payload[0].payload as EnrichmentCategoryResult;
                            return (
                              <div className="bg-slate-900 border border-slate-600 rounded p-2 text-xs max-w-xs">
                                <p className="text-white font-semibold">{d.category}</p>
                                <p className="text-slate-400">n={d.nGenesMatched} | |λ|={d.meanEigenvalue.toFixed(3)}</p>
                                <p className="text-slate-400">Cluster ratio: {d.clusteringRatio.toFixed(3)} | p={d.permutationP.toFixed(4)}</p>
                                <p className="text-slate-400">Pole: {d.dominantPole}</p>
                              </div>
                            );
                          }}
                        />
                        <Scatter data={topClustered} name="Categories">
                          {topClustered.map((entry, i) => (
                            <Cell
                              key={i}
                              fill={entry.significant ? '#22c55e' : '#64748b'}
                              opacity={0.8}
                              r={Math.max(4, Math.min(12, entry.nGenesMatched / 3))}
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-3 rounded" data-testid="text-enrichment-summary">
                    {data.summary}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function RootSpace() {
  useScrollToHash();
  const { data, isLoading, error } = useQuery<RootSpaceData>({
    queryKey: ['/api/analysis/root-space-geometry'],
    staleTime: 1000 * 60 * 30,
  });

  const filterHook = useFilterState();
  const { filters, toggleDataset } = filterHook;
  const [genomeOverlayGenes, setGenomeOverlayGenes] = useState<GenomeSearchGene[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      await exportChartAsImage(exportRef.current, {
        filename: 'root-space-geometry-analysis',
        scale: 3,
        backgroundColor: '#0a0a1a',
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-3" />
          <p className="text-slate-400">Running root-space geometry analysis...</p>
          <p className="text-xs text-slate-400 mt-1">Computing AR(2) roots, null distributions, and enrichment tests</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <Alert className="bg-red-900/30 border-red-700/50">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-300">Analysis Failed</AlertTitle>
            <AlertDescription className="text-red-200/70">
              {(error as Error)?.message || 'Failed to run root-space analysis.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { summary } = data;
  const verdictStrength = summary.overallVerdict.startsWith('STRONG') ? 'emerald' : summary.overallVerdict.startsWith('MODERATE') ? 'amber' : 'red';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" data-testid="link-back-home">
              <ArrowLeft size={16} className="mr-1" />
              Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="text-slate-300 border-slate-600"
            data-testid="button-export-figure"
          >
            {isExporting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Camera size={14} className="mr-2" />}
            Export Figure (PNG)
          </Button>
        </div>

        <div className="mb-6" ref={exportRef}>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">
              AR(2) Root-Space Geometry & φ-Enrichment
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">EXPLORATORY</span>
          </div>
          <p className="text-slate-400 max-w-3xl">
            Maps AR(2) coefficients (β₁, β₂) to root space (r, θ), visualizes the stationarity triangle, 
            tests for golden-mean proximity enrichment against null distributions, and analyzes perturbation shifts 
            between WT and disease/disruption conditions. Golden-mean proximity is borderline (p=0.105) and should be treated as hypothesis-generating. The dedicated Fibonacci analysis is in the separate Fibonacci Reply package.
          </p>
          <Link href="/crypt-villus">
            <Button variant="outline" size="sm" className="mt-2 text-amber-400 border-amber-700 hover:bg-amber-900/30" data-testid="link-crypt-villus">
              Spatial-Temporal φ Hypothesis Test →
            </Button>
          </Link>
        </div>

        <PaperCrossLinks currentPage="/root-space" />

        <HowTo
          title="Root-Space Geometry"
          summary="Maps AR(2) model coefficients into root space, where each gene becomes a point defined by its radial distance (eigenvalue modulus) and angle (oscillation frequency). Three interpretive overlays — Waddington Landscape, Phase Portrait, and Functional Geography — give different biological perspectives on the same geometry."
          steps={[
            { label: "Explore the scatter plot", detail: "Each dot is a gene plotted by its AR(2) root coordinates. Clock genes (blue) and target genes (orange) should separate radially." },
            { label: "Switch overlays", detail: "Use the tabs to view the same data through Waddington, Phase Portrait, or Functional Geography frameworks." },
            { label: "Search genes", detail: "Type a gene name to highlight it in the plot and see its exact coordinates and eigenvalue." },
            { label: "Compare datasets", detail: "Use the Landscape Comparison tab to see side-by-side density maps across conditions." }
          ]}
        />

        <Card className={`mb-6 bg-${verdictStrength}-900/20 border-${verdictStrength}-700/50`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Atom size={20} className={`text-${verdictStrength}-400`} />
              Overall Verdict
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-${verdictStrength}-300 text-sm`} data-testid="text-overall-verdict">{summary.overallVerdict}</p>
            <div className="flex flex-wrap gap-6 mt-3 text-xs text-slate-400">
              <span>Genes: <span className="text-white font-mono">{summary.totalGenes}</span></span>
              <span>Datasets: <span className="text-white font-mono">{summary.totalDatasets}</span></span>
              <span>Mean D_φ: <span className="text-white font-mono">{summary.meanDPhi}</span></span>
              <span>φ-enriched: <span className="text-white font-mono">{(summary.phiEnrichedFraction * 100).toFixed(1)}%</span></span>
            </div>
          </CardContent>
        </Card>

        <FilterPanel data={data} filterHook={filterHook} />

        <GenomeWideSearchPanel onOverlayChange={setGenomeOverlayGenes} />

        <DrugTargetOverlayPanel />

        <GenomeWideEnrichmentPanel />

        <div className="mb-6">
          <RootSpace3DVisualization data={data} filters={filters} toggleDataset={toggleDataset} overlayGenes={genomeOverlayGenes} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <StationarityTrianglePlot data={data} filters={filters} toggleDataset={toggleDataset} overlayGenes={genomeOverlayGenes} />
          <RootSpaceScatterPlot data={data} filters={filters} toggleDataset={toggleDataset} overlayGenes={genomeOverlayGenes} />
        </div>

        <div className="mb-6">
          <FrameworkOverlays data={data} filters={filters} />
        </div>

        <div className="mb-6">
          <DPhiHistogram data={data} />
        </div>

        {data.thresholdSweep && data.thetaDistribution && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <ThresholdSweepChart sweep={data.thresholdSweep} />
            <ThetaDistributionChart bins={data.thetaDistribution} thetaPhiRef={data.thetaPhiRef || 3.8832} />
          </div>
        )}

        <TestResultsPanel tests={data.enrichmentTests} shifts={data.perturbationShifts} />

        {data.categoryHierarchy && (
          <Card className="mt-6 bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 size={18} /> Multi-Category Eigenvalue Hierarchy
              </CardTitle>
              <CardDescription className="text-slate-400">
                Kruskal-Wallis test across {data.categoryHierarchy.hierarchy.length} gene categories
                {' '}(p = {data.categoryHierarchy.kruskalWallisP.toFixed(4)})
                {data.categoryHierarchy.kruskalWallisSignificant ?
                  <Badge className="ml-2 bg-green-900/50 text-green-300 border-green-700">Significant</Badge> :
                  <Badge className="ml-2 bg-slate-700 text-slate-400">Not Significant</Badge>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  {data.categoryHierarchy.hierarchy.map(h => {
                    const maxEv = Math.max(...data.categoryHierarchy!.hierarchy.map(x => x.pooledMeanEigenvalue));
                    const pct = (h.pooledMeanEigenvalue / maxEv) * 100;
                    return (
                      <div key={h.category} className="flex items-center gap-2" data-testid={`hierarchy-row-${h.category}`}>
                        <span className="text-xs text-slate-400 w-5 text-right">#{h.rank}</span>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                        <span className="text-xs text-white w-24 truncate">{h.label}</span>
                        <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden">
                          <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: h.color, opacity: 0.7 }} />
                        </div>
                        <span className="text-xs font-mono text-slate-300 w-16 text-right">|λ|={h.pooledMeanEigenvalue.toFixed(3)}</span>
                        <span className="text-[10px] text-slate-400 w-12 text-right">n={h.pooledCount}</span>
                      </div>
                    );
                  })}
                </div>

                {data.categoryHierarchy.pairwiseTests.filter(t => t.significant).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Significant Pairwise Comparisons</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {data.categoryHierarchy.pairwiseTests.filter(t => t.significant).slice(0, 12).map((t, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-slate-400 px-2 py-1 bg-slate-800/50 rounded">
                          <span className="text-white">{t.direction}</span>
                          <span className="ml-auto font-mono text-green-400">p={t.mannWhitneyP.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {data.methodology && (
          <Card className="mt-6 bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <FlaskConical size={18} className="text-cyan-400" />
                Methodology & Reproducibility
              </CardTitle>
              <CardDescription className="text-slate-400">
                Transparency notes for peer review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-slate-300 font-medium">RNG Seed:</span>
                <span className="text-white font-mono ml-2" data-testid="text-rng-seed">{data.methodology.rngSeed}</span>
                <span className="text-slate-400 ml-2">(deterministic — all surrogate generation and permutation tests are reproducible)</span>
              </div>
              <div>
                <span className="text-slate-300 font-medium">Root Handling:</span>
                <p className="text-slate-400 mt-1">{data.methodology.rootHandling}</p>
              </div>
              <div>
                <span className="text-slate-300 font-medium">Null Model Hierarchy:</span>
                <p className="text-slate-400 mt-1">{data.methodology.nullHierarchy}</p>
              </div>
              <div>
                <span className="text-slate-300 font-medium">Multiple Testing:</span>
                <p className="text-slate-400 mt-1">{data.methodology.multipleTestingNote}</p>
              </div>
              <div>
                <span className="text-slate-300 font-medium">Excluded Datasets:</span>
                <p className="text-slate-400 mt-1">{data.methodology.excludedDatasets}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <FullResultsText data={data} />

        <div className="mt-8 bg-slate-900/80 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-bold mb-3">Mathematical Framework</h3>
          <div className="text-sm text-slate-400 space-y-2">
            <p><span className="text-slate-300">AR(2) Model:</span> x_t = β₁·x_(t-1) + β₂·x_(t-2) + ε_t</p>
            <p><span className="text-slate-300">Characteristic Polynomial:</span> λ² - β₁λ - β₂ = 0. Roots λ₁,₂ determine dynamics.</p>
            <p><span className="text-slate-300">Stationarity Triangle:</span> β₂ {'>'} -1, β₂ {'<'} 1-β₁, β₂ {'<'} 1+β₁. All stationary AR(2) coefficients lie inside this triangle.</p>
            <p><span className="text-slate-300">Oscillatory Region:</span> Below parabola β₂ = -β₁²/4 (complex roots, damped oscillations).</p>
            <p><span className="text-slate-300">Fibonacci Reference:</span> (β₁,β₂) = (1,1) yields λ = φ ≈ 1.618. This is <em>outside</em> the stationarity triangle — exponentially unstable. Biology must damp Fibonacci-like dynamics to remain stable.</p>
            <p><span className="text-slate-300">D_φ Metric:</span> Weighted distance in root space to a φ-reference geometry. Combines log-damping distance and angular distance to θ_φ = 2π/φ.</p>
            <p><span className="text-slate-300">Mapping Sensitivity:</span> θ_φ = 2π/φ stress-tested against 2π/φ² (137.5°) and π/φ (111.2°). Band occupancy significant in 2/3 mappings. Production mapping is the only one showing genuine enrichment (1.86×) over analytical null (100K random AR(2) draws).</p>
            <p><span className="text-slate-300">Null Model 1:</span> Phase-randomized surrogates (preserves power spectrum, destroys temporal phase structure).</p>
            <p><span className="text-slate-300">Null Model 2:</span> Uniform random draws from the stationarity triangle (theoretical comparator).</p>
            <p className="text-slate-400 mt-3 italic">
              Validation hierarchy: (1) AR(2) sufficiency confirmed, (2) root-space structure tested against nulls, 
              (3) perturbation shifts quantified, (4) φ as interpretive axis only if supported by data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
