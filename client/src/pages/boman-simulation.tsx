import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, Loader2, Package, Beaker, Grid3x3, Target, Dna } from "lucide-react";

interface FileInfo {
  name: string;
  size: number;
  description: string;
}

export default function BomanSimulation() {
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState<FileInfo[] | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/boman-simulation/generate");
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setFiles(data.files);
    } catch (err) {
      setError(String(err));
    }
    setGenerating(false);
  };

  const downloadFile = async (fileType: string, filename: string) => {
    setDownloading(fileType);
    try {
      const res = await fetch(`/api/boman-simulation/download/${fileType}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(String(err));
    }
    setDownloading(null);
  };

  const fileConfigs = [
    { type: "timeseries", icon: Beaker, color: "text-emerald-400", borderColor: "border-emerald-500/30", bgColor: "bg-emerald-500/5" },
    { type: "sweep", icon: Grid3x3, color: "text-blue-400", borderColor: "border-blue-500/30", bgColor: "bg-blue-500/5" },
    { type: "fibonacci-region", icon: Target, color: "text-amber-400", borderColor: "border-amber-500/30", bgColor: "bg-amber-500/5" },
    { type: "coefficient-space", icon: Dna, color: "text-purple-400", borderColor: "border-purple-500/30", bgColor: "bg-purple-500/5" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="link-boman-back">
              <ArrowLeft size={14} /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold" data-testid="text-boman-title">Boman-Style Crypt Simulation</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-boman-subtitle">
              <Package size={20} />
              Spatial–Temporal Bridge Files
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generates 4 machine-readable files that link Boman-style intestinal crypt division rules to AR(2) temporal coefficients. 
              The simulation models stem cell niche dynamics with configurable parameters (niche size, maturation delay, division limit, 
              Wnt signaling, circadian gating) across 648 parameter combinations and 6 biological conditions.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Model:</strong> Discrete-time 3-compartment crypt (Stem → Proliferating → Differentiated) with Fibonacci-like recursion via maturation delay. Division rates modulated by Wnt signaling and optional circadian gating.</p>
                <p><strong className="text-foreground">AR(2) bridge:</strong> Each simulation output is fitted with AR(2), yielding (φ₁, φ₂) coefficients. The Fibonacci-consistent region is defined as |φ₁/φ₂| ≈ φ (golden ratio), which emerges when maturation delay creates x(t) ≈ a·x(t-1) + b·x(t-2) with a/b ≈ 1.618.</p>
                <p><strong className="text-foreground">Conditions:</strong> normal, normal (no circadian), FAP-like, adenoma-like, high Wnt, low Wnt.</p>
              </div>

              {!files && (
                <Button
                  onClick={generate}
                  disabled={generating}
                  className="w-full"
                  size="lg"
                  data-testid="button-generate-simulation"
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Running 648 simulations...
                    </>
                  ) : (
                    <>
                      <Beaker size={16} className="mr-2" />
                      Generate Simulation Files
                    </>
                  )}
                </Button>
              )}

              {error && <p className="text-sm text-red-500" data-testid="text-boman-error">{error}</p>}

              {files && (
                <div className="space-y-3">
                  <p className="text-sm text-emerald-400 font-medium" data-testid="text-generation-complete">Generation complete. Download individual files or the full package:</p>

                  {files.map((file, i) => {
                    const config = fileConfigs[i];
                    const Icon = config?.icon || FileText;
                    return (
                      <Card key={file.name} className={`${config?.borderColor || ''} ${config?.bgColor || ''}`}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <Icon size={20} className={`${config?.color || 'text-foreground'} mt-0.5 shrink-0`} />
                              <div>
                                <p className="font-mono text-sm font-bold" data-testid={`text-file-name-${i}`}>{file.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{file.description}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const types = ['timeseries', 'sweep', 'fibonacci-region', 'coefficient-space'];
                                downloadFile(types[i], file.name);
                              }}
                              disabled={downloading !== null}
                              data-testid={`button-download-${i}`}
                            >
                              {downloading === ['timeseries', 'sweep', 'fibonacci-region', 'coefficient-space'][i] ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Download size={14} />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <Button
                    onClick={() => downloadFile('all', 'boman_ar2_simulation_package.zip')}
                    disabled={downloading !== null}
                    className="w-full mt-4"
                    variant="default"
                    size="lg"
                    data-testid="button-download-all"
                  >
                    {downloading === 'all' ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Packaging...
                      </>
                    ) : (
                      <>
                        <Package size={16} className="mr-2" />
                        Download All (ZIP with README)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-5 text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-amber-400">File Descriptions</p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-foreground">1. boman_simulation_timeseries.csv</p>
                <p>Raw time-series from 20 representative Boman-rule simulations (200 timesteps × 3 replicates each). Columns: simulation_id, time, C_cells, P_cells, D_cells, Lgr5_like, Wnt_like, Bmal1_like, mutation_load, condition. Fit AR(2) to any column to verify that Boman-rule dynamics project into the expected coefficient space.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">2. boman_parameter_sweep.csv</p>
                <p>648 parameter combinations (3 niche sizes × 3 maturation delays × 3 division limits × 4 k₃ values × 6 conditions). Each row contains fitted AR(2) coefficients (φ₁, φ₂) and eigenvalue modulus for all 3 compartments, plus pattern classification and Fibonacci distance.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">3. fibonacci_consistent_region.csv</p>
                <p>Parameterized table of (φ₁, φ₂) values with region labels: fib_core (|ratio−φ| {"<"} 0.05), fib_consistent ({"<"} 0.15), fib_adjacent ({"<"} 0.30). Includes eigenvalue modulus, root type, eigenperiod, and stability flag. This formally defines the "Fibonacci-consistent region" in coefficient space.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">4. ar2_coefficient_space.csv</p>
                <p>Per-compartment eigenvalue decomposition: gene/compartment, dataset, φ₁, φ₂, root₁ (real+imag), root₂ (real+imag), |λ|, root type, category, Fibonacci distance, pattern class. Direct comparison with empirical gene AR(2) results.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
