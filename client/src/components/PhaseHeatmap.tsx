import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Grid3X3, ExternalLink, Download, SortAsc } from "lucide-react";

interface GenePhaseData {
  gene: string;
  phase: number;
  peakTime: number;
  amplitude: number;
  expression: number[];
  normalizedExpression: number[];
  isClockGene: boolean;
  pValue?: number;
  eigenvalue?: number;
}

interface PhaseHeatmapProps {
  data: {
    genes: GenePhaseData[];
    timepoints: number[];
    period: number;
    datasetName: string;
    analysisName: string;
  } | null;
  isLoading?: boolean;
}

const getHeatmapColor = (value: number): string => {
  const clampedValue = Math.max(0, Math.min(1, value));
  if (clampedValue < 0.25) {
    const t = clampedValue / 0.25;
    const r = Math.round(15 + t * (59 - 15));
    const g = Math.round(23 + t * (130 - 23));
    const b = Math.round(42 + t * (246 - 42));
    return `rgb(${r}, ${g}, ${b})`;
  } else if (clampedValue < 0.5) {
    const t = (clampedValue - 0.25) / 0.25;
    const r = Math.round(59 + t * (16 - 59));
    const g = Math.round(130 + t * (185 - 130));
    const b = Math.round(246 + t * (129 - 246));
    return `rgb(${r}, ${g}, ${b})`;
  } else if (clampedValue < 0.75) {
    const t = (clampedValue - 0.5) / 0.25;
    const r = Math.round(16 + t * (250 - 16));
    const g = Math.round(185 + t * (204 - 185));
    const b = Math.round(129 + t * (21 - 129));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (clampedValue - 0.75) / 0.25;
    const r = Math.round(250 + t * (239 - 250));
    const g = Math.round(204 + t * (68 - 204));
    const b = Math.round(21 + t * (68 - 21));
    return `rgb(${r}, ${g}, ${b})`;
  }
};

const formatZT = (hours: number): string => {
  const h = Math.round(hours) % 24;
  return `ZT${h}`;
};

export function PhaseHeatmap({ data, isLoading }: PhaseHeatmapProps) {
  const [selectedGenes, setSelectedGenes] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'phase' | 'amplitude' | 'eigenvalue'>('phase');
  const heatmapRef = useRef<HTMLDivElement>(null);
  
  const sortedGenes = useMemo(() => {
    if (!data?.genes) return [];
    const genes = [...data.genes];
    
    switch (sortBy) {
      case 'amplitude':
        return genes.sort((a, b) => b.amplitude - a.amplitude);
      case 'eigenvalue':
        return genes.sort((a, b) => (b.eigenvalue || 0) - (a.eigenvalue || 0));
      case 'phase':
      default:
        return genes.sort((a, b) => a.peakTime - b.peakTime);
    }
  }, [data?.genes, sortBy]);
  
  const unstableGenes = useMemo(() => {
    if (!data?.genes) return [];
    return data.genes.filter(g => g.eigenvalue && g.eigenvalue > 0.80 && !g.isClockGene);
  }, [data?.genes]);
  
  const toggleGeneSelection = (gene: string) => {
    const newSelection = new Set(selectedGenes);
    if (newSelection.has(gene)) {
      newSelection.delete(gene);
    } else {
      newSelection.add(gene);
    }
    setSelectedGenes(newSelection);
  };
  
  const selectUnstableGenes = () => {
    setSelectedGenes(new Set(unstableGenes.map(g => g.gene)));
  };
  
  const openEnrichr = async () => {
    const geneList = Array.from(selectedGenes);
    if (geneList.length === 0) return;
    
    try {
      const response = await fetch('/api/enrichr/addList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genes: geneList,
          description: 'PAR2 Phase-Sorted Genes'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit to Enrichr');
      }
      
      const data = await response.json();
      window.open(data.enrichrUrl, '_blank');
    } catch (error) {
      console.error('Enrichr submission error:', error);
      const fallbackUrl = `https://maayanlab.cloud/Enrichr/#find!gene=${encodeURIComponent(geneList.join('\n'))}`;
      window.open(fallbackUrl, '_blank');
    }
  };
  
  const exportHeatmapData = () => {
    if (!data) return;
    
    const header = ['Gene', 'PeakTime_ZT', 'Amplitude', 'IsClockGene', 'Eigenvalue', 'PValue', ...data.timepoints.map(t => `ZT${t}`)];
    const rows = sortedGenes.map(g => [
      g.gene,
      g.peakTime.toFixed(1),
      g.amplitude.toFixed(3),
      g.isClockGene ? 'Yes' : 'No',
      g.eigenvalue?.toFixed(3) || 'N/A',
      g.pValue?.toExponential(2) || 'N/A',
      ...g.expression.map(e => e.toFixed(2))
    ]);
    
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phase_heatmap_${data.datasetName.replace(/\.[^.]+$/, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Grid3X3 size={18} className="text-primary" />
            Phase-Sorted Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading heatmap data...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data || !data.genes || data.genes.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Grid3X3 size={18} className="text-primary" />
            Phase-Sorted Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            No heatmap data available. Run an analysis first.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const clockGenes = sortedGenes.filter(g => g.isClockGene);
  const targetGenes = sortedGenes.filter(g => !g.isClockGene);
  const cellWidth = Math.max(20, Math.min(40, 600 / data.timepoints.length));
  const cellHeight = 24;
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-xl" data-testid="phase-heatmap-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Grid3X3 size={18} className="text-primary" />
              Phase-Sorted Heatmap
            </CardTitle>
            <CardDescription className="mt-1">
              {sortedGenes.length} genes sorted by peak expression time (ZT)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortBy(sortBy === 'phase' ? 'amplitude' : sortBy === 'amplitude' ? 'eigenvalue' : 'phase')}
              className="text-xs"
              data-testid="btn-sort-heatmap"
            >
              <SortAsc size={14} className="mr-1" />
              {sortBy === 'phase' ? 'By Phase' : sortBy === 'amplitude' ? 'By Amplitude' : 'By |λ|'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportHeatmapData}
              className="text-xs"
              data-testid="btn-export-heatmap"
            >
              <Download size={14} className="mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Expression:</span>
            <div className="flex items-center gap-0.5">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(0) }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(0.25) }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(0.5) }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(0.75) }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatmapColor(1) }}></div>
            </div>
            <span className="text-muted-foreground">Low → High</span>
          </div>
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
            Clock genes
          </Badge>
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
            |λ| &gt; 0.80 (unstable)
          </Badge>
        </div>
        
        <div className="overflow-x-auto" ref={heatmapRef}>
          <div className="inline-block min-w-full">
            <div className="flex items-end mb-1 ml-24">
              {data.timepoints.map((tp, i) => (
                <div 
                  key={i} 
                  className="text-[10px] text-muted-foreground font-mono"
                  style={{ width: cellWidth, textAlign: 'center' }}
                >
                  {formatZT(tp)}
                </div>
              ))}
              <div className="w-16 text-[10px] text-muted-foreground text-center ml-2">Peak</div>
              <div className="w-12 text-[10px] text-muted-foreground text-center">|λ|</div>
            </div>
            
            {clockGenes.length > 0 && (
              <>
                <div className="text-[10px] text-blue-400 font-semibold mb-1 mt-2">Clock Genes</div>
                {clockGenes.map((gene, geneIdx) => (
                  <div key={gene.gene} className="flex items-center gap-1 mb-0.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => toggleGeneSelection(gene.gene)}
                            className={`w-24 text-left text-xs font-mono truncate px-1 py-0.5 rounded transition-colors ${
                              selectedGenes.has(gene.gene) 
                                ? 'bg-primary/20 text-primary' 
                                : 'text-blue-400 hover:bg-secondary/50'
                            }`}
                          >
                            {gene.gene}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Peak: ZT{gene.peakTime.toFixed(1)}</p>
                          <p>Amplitude: {(gene.amplitude * 100).toFixed(1)}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <div className="flex">
                      {gene.normalizedExpression.map((val, i) => (
                        <div
                          key={i}
                          className="border border-background/20"
                          style={{
                            width: cellWidth,
                            height: cellHeight,
                            backgroundColor: getHeatmapColor(val)
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="w-16 text-[10px] text-muted-foreground text-center font-mono">
                      {formatZT(gene.peakTime)}
                    </div>
                    <div className="w-12 text-[10px] text-muted-foreground text-center font-mono">
                      -
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {targetGenes.length > 0 && (
              <>
                <div className="text-[10px] text-emerald-400 font-semibold mb-1 mt-3">Target Genes</div>
                {targetGenes.map((gene, geneIdx) => (
                  <div key={gene.gene} className="flex items-center gap-1 mb-0.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => toggleGeneSelection(gene.gene)}
                            className={`w-24 text-left text-xs font-mono truncate px-1 py-0.5 rounded transition-colors ${
                              selectedGenes.has(gene.gene) 
                                ? 'bg-primary/20 text-primary' 
                                : gene.eigenvalue && gene.eigenvalue > 0.80
                                  ? 'text-amber-400 hover:bg-amber-500/10'
                                  : 'text-foreground/80 hover:bg-secondary/50'
                            }`}
                          >
                            {gene.gene}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Peak: ZT{gene.peakTime.toFixed(1)}</p>
                          <p>Amplitude: {(gene.amplitude * 100).toFixed(1)}%</p>
                          {gene.eigenvalue && <p>|λ|: {gene.eigenvalue.toFixed(3)}</p>}
                          {gene.pValue && <p>p-value: {gene.pValue.toExponential(2)}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <div className="flex">
                      {gene.normalizedExpression.map((val, i) => (
                        <div
                          key={i}
                          className="border border-background/20"
                          style={{
                            width: cellWidth,
                            height: cellHeight,
                            backgroundColor: getHeatmapColor(val)
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="w-16 text-[10px] text-muted-foreground text-center font-mono">
                      {formatZT(gene.peakTime)}
                    </div>
                    <div className={`w-12 text-[10px] text-center font-mono ${
                      gene.eigenvalue && gene.eigenvalue > 0.80 ? 'text-amber-400' : 'text-muted-foreground'
                    }`}>
                      {gene.eigenvalue?.toFixed(2) || '-'}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {selectedGenes.size} gene{selectedGenes.size !== 1 ? 's' : ''} selected
            </span>
            {unstableGenes.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={selectUnstableGenes}
                className="text-xs h-7"
                data-testid="btn-select-unstable"
              >
                Select {unstableGenes.length} unstable genes
              </Button>
            )}
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={openEnrichr}
            disabled={selectedGenes.size === 0}
            className="text-xs"
            data-testid="btn-enrichr"
          >
            <ExternalLink size={14} className="mr-1" />
            Analyze in Enrichr ({selectedGenes.size})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
