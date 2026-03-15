import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, X, Dna } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface LoadedReportBannerProps {
  title: string;
  summary: string | null;
  geneCount: number | null;
  sourcePage: string;
  highlightedCount?: number;
  onDismiss?: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  "discovery-engine": "Discovery Engine",
  "root-space": "Root-Space Geometry",
  "health-score": "Circadian Health Score",
  "cross-metric-independence": "Cross-Metric Independence",
};

export default function LoadedReportBanner({ title, summary, geneCount, sourcePage, highlightedCount, onDismiss }: LoadedReportBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <Alert className="bg-cyan-950/40 border-cyan-800/60 mb-4" data-testid="loaded-report-banner">
      <FolderOpen className="h-4 w-4 text-cyan-400" />
      <AlertDescription className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-cyan-300 font-medium text-sm">Loaded Report:</span>
          <span className="text-slate-300 text-sm">{title}</span>
          {geneCount && (
            <Badge variant="outline" className="text-[10px] border-cyan-800 text-cyan-400">
              <Dna size={10} className="mr-1" />
              {geneCount} genes
            </Badge>
          )}
          {highlightedCount !== undefined && highlightedCount > 0 && (
            <Badge variant="outline" className="text-[10px] border-emerald-800 text-emerald-400">
              {highlightedCount} highlighted
            </Badge>
          )}
          <span className="text-slate-500 text-xs">from {SOURCE_LABELS[sourcePage] || sourcePage}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 h-7" data-testid="button-view-reports">
              View All Reports
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 h-7 w-7 p-0"
            onClick={() => { setDismissed(true); onDismiss?.(); }}
            data-testid="button-dismiss-banner"
          >
            <X size={14} />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
