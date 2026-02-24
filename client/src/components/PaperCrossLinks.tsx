import { Link } from "wouter";
import { FileText, ArrowRight } from "lucide-react";

interface PaperLink {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const PAPER_REGISTRY: Record<string, PaperLink> = {
  "paper-a": { id: "paper-a", label: "Paper A: Core Methods", color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
  "paper-b": { id: "paper-b", label: "Paper B: Resonance Zone", color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/30" },
  "paper-c": { id: "paper-c", label: "Paper C: Coupling Atlas", color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
  "paper-d": { id: "paper-d", label: "Paper D: Perspective", color: "text-yellow-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" },
  "paper-e": { id: "paper-e", label: "Paper E: Phase-Gated PAR(2)", color: "text-pink-400", bgColor: "bg-pink-500/10", borderColor: "border-pink-500/30" },
};

export const PAGE_TO_PAPERS: Record<string, string[]> = {
  "/root-space": ["paper-a", "paper-b", "paper-d", "paper-e"],
  "/model-zoo": ["paper-a"],
  "/cross-context-validation": ["paper-a", "paper-c", "paper-e"],
  "/robustness-suite": ["paper-a"],
  "/genome-wide": ["paper-a", "paper-b"],
  "/validation-suite": ["paper-a"],
  "/cell-type-persistence": ["paper-a"],
  "/human-disruption": ["paper-a"],
  "/disease-screen": ["paper-a"],
  "/phase-portrait": ["paper-c", "paper-e"],
  "/genome-wide-coupling": ["paper-c"],
  "/literature-validation": ["paper-c"],
  "/cross-metric-independence": ["paper-d"],
  "/phase-gating": ["paper-e"],
  "/cancer-browser": ["paper-a", "paper-e"],
  "/rolling-window": ["paper-a"],
  "/framework-benchmarks": ["paper-a"],
  "/drug-durability": ["paper-b"],
  "/proteome-validation": ["paper-a", "paper-d"],
};

export const PAPER_TO_PAGES: Record<string, { path: string; label: string }[]> = {
  "paper-a": [
    { path: "/root-space", label: "Root-Space Geometry" },
    { path: "/model-zoo", label: "ODE Model Zoo" },
    { path: "/cross-context-validation", label: "Cross-Context Validation" },
    { path: "/robustness-suite", label: "Robustness Suite" },
    { path: "/genome-wide", label: "Genome-Wide AR(2)" },
    { path: "/validation-suite", label: "Validation Suite" },
    { path: "/cell-type-persistence", label: "Cell-Type Persistence" },
    { path: "/human-disruption", label: "Human Disruption" },
    { path: "/disease-screen", label: "Disease Screen" },
    { path: "/cancer-browser", label: "Cancer Browser" },
    { path: "/rolling-window", label: "Rolling Window" },
    { path: "/framework-benchmarks", label: "Framework Benchmarks" },
    { path: "/proteome-validation", label: "Proteome Validation" },
  ],
  "paper-b": [
    { path: "/root-space", label: "Root-Space Geometry" },
    { path: "/genome-wide", label: "Genome-Wide AR(2)" },
    { path: "/drug-durability", label: "Drug Target Overlay" },
  ],
  "paper-c": [
    { path: "/phase-portrait", label: "Phase Portrait Explorer" },
    { path: "/cross-context-validation", label: "Cross-Context Validation" },
    { path: "/genome-wide-coupling", label: "Genome-Wide Coupling" },
    { path: "/literature-validation", label: "Literature Validation" },
  ],
  "paper-d": [
    { path: "/cross-metric-independence", label: "Cross-Metric Independence" },
    { path: "/root-space", label: "Root-Space Mapping" },
    { path: "/proteome-validation", label: "Proteome Validation" },
  ],
  "paper-e": [
    { path: "/phase-gating", label: "Phase-Gating Analysis" },
    { path: "/phase-portrait", label: "Phase Portrait Explorer" },
    { path: "/cross-context-validation", label: "Cross-Context Validation" },
    { path: "/cancer-browser", label: "Cancer Browser" },
    { path: "/root-space", label: "Root-Space Geometry" },
  ],
};

export default function PaperCrossLinks({ currentPage }: { currentPage: string }) {
  const paperIds = PAGE_TO_PAPERS[currentPage];
  if (!paperIds || paperIds.length === 0) return null;

  const papers = paperIds.map(id => PAPER_REGISTRY[id]).filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4" data-testid="paper-crosslinks">
      <span className="text-xs text-slate-500 flex items-center gap-1">
        <FileText size={12} />
        Related papers:
      </span>
      {papers.map(paper => (
        <Link key={paper.id} href="/manuscript">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border cursor-pointer hover:brightness-125 transition ${paper.bgColor} ${paper.borderColor} ${paper.color}`}
            data-testid={`link-paper-${paper.id}`}
          >
            {paper.label}
            <ArrowRight size={10} />
          </span>
        </Link>
      ))}
    </div>
  );
}
