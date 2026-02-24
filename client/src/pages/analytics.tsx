import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { ArrowLeft, Globe, BarChart3, Users, Activity, MapPin, Clock, Eye, Download, Trash2, CalendarDays, X, Upload } from "lucide-react";

interface AnalyticsSummary {
  totalVisits: number;
  totalAnalyses: number;
  uniqueCountries: string[];
  visitsByCountry: Record<string, number>;
  visitsByPage: Record<string, number>;
  recentVisits: Array<{
    id: string;
    eventType: string;
    page: string | null;
    country: string | null;
    city: string | null;
    region: string | null;
    referrer: string | null;
    createdAt: string;
  }>;
  visitsByDay: Record<string, number>;
}

const DATE_RANGES = [
  { label: "Today", days: 1 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 14 Days", days: 14 },
  { label: "Last 30 Days", days: 30 },
  { label: "All Time", days: 9999 },
];

const PIE_COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#64748b", "#14b8a6"];

interface AnalysisResult {
  channel: string;
  eigenvalue: number;
  phi1: number;
  phi2: number;
  r2: number;
  stability: string;
  overallConfidence: string;
  sampleCount: number;
}

interface AnalysisEntry {
  id: string;
  fileName: string;
  detectedFormat: string;
  createdAt: string;
  autoSaved: boolean;
  channelsAnalyzed: number;
  totalRecords: number;
  results: AnalysisResult[];
  gearboxAnalysis: {
    clockChannel: string;
    clockEigenvalue: number;
    targetChannel: string;
    targetEigenvalue: number;
    gap: number;
    hierarchyStatus: string;
  } | null;
}

function AnalysisHistory({ password }: { password: string }) {
  const [analyses, setAnalyses] = useState<AnalysisEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!password) return;
    setLoading(true);
    fetch("/api/analytics/analysis-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then(r => r.ok ? r.json() : { analyses: [] })
      .then(d => { setAnalyses(d.analyses || []); setLoading(false); setLoaded(true); })
      .catch(() => { setLoading(false); setLoaded(true); });
  }, [password]);

  if (loading) return (
    <Card data-testid="card-analysis-history">
      <CardContent className="py-6">
        <p className="text-sm text-muted-foreground text-center">Loading analysis history...</p>
      </CardContent>
    </Card>
  );

  if (!loaded || analyses.length === 0) return null;

  return (
    <Card data-testid="card-analysis-history">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity size={16} />
          Analysis Results History
          <span className="text-xs font-normal text-muted-foreground ml-1">
            ({analyses.length} saved)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {analyses.map((a) => (
            <div key={a.id} className="border border-border/30 rounded-lg p-3">
              <div
                className="flex items-center gap-3 text-xs cursor-pointer"
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              >
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  a.autoSaved ? 'bg-cyan-500/10 text-cyan-500' : 'bg-purple-500/10 text-purple-500'
                }`}>
                  {a.autoSaved ? 'AUTO' : 'SHARED'}
                </span>
                <span className="font-mono text-slate-300 truncate max-w-48">{a.fileName}</span>
                <span className="text-muted-foreground">{a.channelsAnalyzed} ch</span>
                <span className="text-muted-foreground">{a.totalRecords.toLocaleString()} rec</span>
                <span className="text-muted-foreground">{a.detectedFormat}</span>
                <span className="ml-auto text-muted-foreground whitespace-nowrap">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
                <span className="text-muted-foreground">{expanded === a.id ? '▲' : '▼'}</span>
              </div>
              {expanded === a.id && (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {a.results.map((r, i) => (
                      <div key={i} className="bg-slate-800/50 rounded p-2 text-xs">
                        <div className="font-medium text-slate-200 mb-1">{r.channel}</div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                          <span>|λ|:</span><span className="text-slate-300 font-mono">{r.eigenvalue?.toFixed(4)}</span>
                          <span>φ₁:</span><span className="text-slate-300 font-mono">{r.phi1?.toFixed(4)}</span>
                          <span>φ₂:</span><span className="text-slate-300 font-mono">{r.phi2?.toFixed(4)}</span>
                          <span>R²:</span><span className="text-slate-300 font-mono">{r.r2?.toFixed(4)}</span>
                          <span>N:</span><span className="text-slate-300">{r.sampleCount}</span>
                          <span>Status:</span><span className="text-slate-300">{r.stability}</span>
                          <span>Conf:</span><span className="text-slate-300">{r.overallConfidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {a.gearboxAnalysis && (
                    <div className="bg-slate-800/30 rounded p-2 text-xs border border-slate-700/50">
                      <span className="text-muted-foreground">Hierarchy: </span>
                      <span className="text-slate-200">{a.gearboxAnalysis.hierarchyStatus}</span>
                      <span className="text-muted-foreground ml-3">
                        {a.gearboxAnalysis.clockChannel} ({a.gearboxAnalysis.clockEigenvalue?.toFixed(3)})
                        → {a.gearboxAnalysis.targetChannel} ({a.gearboxAnalysis.targetEigenvalue?.toFixed(3)})
                        = gap {a.gearboxAnalysis.gap?.toFixed(3)}
                      </span>
                    </div>
                  )}
                  {!a.autoSaved && (
                    <div className="text-xs text-muted-foreground">
                      Shareable link: <a href={`/shared/${a.id}`} className="text-cyan-400 underline">/shared/{a.id}</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayEvents, setDayEvents] = useState<AnalyticsSummary['recentVisits']>([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analytics/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Invalid password");
        setLoading(false);
        return;
      }
      const summary = await res.json();
      setData(summary);
      setAuthenticated(true);
    } catch {
      setError("Failed to load analytics");
    }
    setLoading(false);
  };

  const clearAnalytics = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/analytics/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setData({
          totalVisits: 0,
          totalAnalyses: 0,
          uniqueCountries: [],
          visitsByCountry: {},
          visitsByPage: {},
          recentVisits: [],
          visitsByDay: {},
        });
        setSelectedDay(null);
        setConfirmClear(false);
      }
    } catch {
      setError("Failed to clear analytics");
    }
    setClearing(false);
  };

  const sortedCountries = data
    ? Object.entries(data.visitsByCountry).sort((a, b) => b[1] - a[1])
    : [];

  const sortedPages = data
    ? Object.entries(data.visitsByPage).sort((a, b) => b[1] - a[1])
    : [];

  const rangeDays = parseInt(dateRange);

  const filteredDays = useMemo(() => {
    if (!data) return [];
    const entries = Object.entries(data.visitsByDay).sort((a, b) => a[0].localeCompare(b[0]));
    if (rangeDays === 1) {
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find(([d]) => d === today);
      return todayEntry ? [{ day: todayEntry[0].slice(5), fullDay: todayEntry[0], visits: todayEntry[1] }] : [];
    }
    return entries.slice(-rangeDays).map(([day, count]) => ({
      day: day.slice(5),
      fullDay: day,
      visits: count,
    }));
  }, [data, rangeDays]);

  const countryChartData = useMemo(() => {
    return sortedCountries.slice(0, 10).map(([country, count]) => ({ country, visits: count }));
  }, [sortedCountries]);

  const pageChartData = useMemo(() => {
    return sortedPages.slice(0, 10).map(([page, count]) => ({
      page: page.length > 20 ? page.slice(0, 20) + "…" : page,
      fullPage: page,
      visits: count,
    }));
  }, [sortedPages]);

  const loadDayEvents = useCallback(async (day: string) => {
    setSelectedDay(day);
    setDayLoading(true);
    try {
      const res = await fetch("/api/analytics/day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, day }),
      });
      if (res.ok) {
        const result = await res.json();
        setDayEvents(result.events || []);
      }
    } catch {
      setDayEvents([]);
    }
    setDayLoading(false);
  }, [password]);

  const handleBarClick = useCallback((barData: any) => {
    if (barData?.activePayload?.[0]?.payload?.fullDay) {
      loadDayEvents(barData.activePayload[0].payload.fullDay);
    }
  }, [loadDayEvents]);

  const exportCSV = () => {
    if (!data) return;
    const rows = ["Date,Visits"];
    Object.entries(data.visitsByDay).sort((a, b) => a[0].localeCompare(b[0])).forEach(([d, c]) => rows.push(`${d},${c}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "par2_analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-analytics-title">
              <BarChart3 size={20} />
              Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your admin password to view usage analytics.
            </p>
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadAnalytics()}
              data-testid="input-analytics-password"
            />
            {error && <p className="text-sm text-red-500" data-testid="text-analytics-error">{error}</p>}
            <Button onClick={loadAnalytics} disabled={loading} className="w-full" data-testid="button-analytics-login">
              {loading ? "Loading..." : "View Analytics"}
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full gap-2" data-testid="button-analytics-back">
                <ArrowLeft size={14} />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-analytics-heading">
              <BarChart3 size={24} />
              PAR(2) Discovery — Usage Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Private dashboard showing how your tool is being used worldwide.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV} data-testid="button-export-csv">
              <Download size={14} />
              Export CSV
            </Button>
            {!confirmClear ? (
              <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-400 hover:border-red-500/50" onClick={() => setConfirmClear(true)} data-testid="button-clear-analytics">
                <Trash2 size={14} />
                Clear All
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button variant="destructive" size="sm" className="gap-1" onClick={clearAnalytics} disabled={clearing} data-testid="button-confirm-clear">
                  {clearing ? "Clearing..." : "Confirm Clear"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)} data-testid="button-cancel-clear">
                  <X size={14} />
                </Button>
              </div>
            )}
            <Link href="/">
              <Button variant="outline" className="gap-2" data-testid="button-back-home">
                <ArrowLeft size={14} />
                Home
              </Button>
            </Link>
          </div>
        </div>

        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card data-testid="card-total-visits">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Eye size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{data.totalVisits.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Page Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="card-total-analyses">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Activity size={20} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{data.totalAnalyses.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Analyses Run</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="card-countries">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Globe size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{data.uniqueCountries.length}</p>
                      <p className="text-xs text-muted-foreground">Countries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card data-testid="card-unique-sessions">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Users size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {new Set(data.recentVisits.map(v => v.createdAt.split('T')[0])).size}
                      </p>
                      <p className="text-xs text-muted-foreground">Active Days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-daily-chart">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock size={16} />
                    Daily Visits
                    <span className="text-xs font-normal text-muted-foreground ml-1">(click a bar to see details)</span>
                  </CardTitle>
                  <Select value={dateRange} onValueChange={setDateRange} data-testid="select-date-range">
                    <SelectTrigger className="w-[150px]" data-testid="select-date-range-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_RANGES.map((r) => (
                        <SelectItem key={r.days} value={String(r.days)} data-testid={`select-range-${r.days}`}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredDays.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250} minWidth={1} minHeight={1}>
                    <BarChart data={filteredDays} margin={{ top: 5, right: 10, bottom: 20, left: 10 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDay || ""}
                      />
                      <Bar dataKey="visits" radius={[3, 3, 0, 0]} name="Visits">
                        {filteredDays.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fullDay === selectedDay ? "#f59e0b" : "#3b82f6"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No visit data available</p>
                )}
              </CardContent>
            </Card>

            {selectedDay && (
              <Card data-testid="card-daily-detail">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarDays size={16} />
                      Activity for {selectedDay}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        ({dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''})
                      </span>
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)} data-testid="button-close-daily">
                      <X size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {dayLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading events...</p>
                  ) : dayEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No events recorded for this day.
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {dayEvents.map((event) => (
                        <div key={event.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-border/30 last:border-0">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            event.eventType === 'page_view' ? 'bg-blue-500/10 text-blue-500' :
                            event.eventType === 'analysis_run' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>
                            {event.eventType === 'page_view' ? 'VIEW' : event.eventType === 'analysis_run' ? 'ANALYSIS' : event.eventType.toUpperCase()}
                          </span>
                          <span className="font-mono text-muted-foreground truncate max-w-40">{event.page || '/'}</span>
                          {event.country && (
                            <span className="text-muted-foreground">
                              {event.city ? `${event.city}, ` : ''}{event.country}
                            </span>
                          )}
                          <span className="ml-auto text-muted-foreground whitespace-nowrap">
                            {new Date(event.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card data-testid="card-visits-by-country">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin size={16} />
                    Visits by Country (Top 10)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {countryChartData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No location data yet</p>
                  ) : (
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height={220} minWidth={1} minHeight={1}>
                          <BarChart data={countryChartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                            <YAxis type="category" dataKey="country" tick={{ fill: "#94a3b8", fontSize: 11 }} width={55} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }} />
                            <Bar dataKey="visits" fill="#8b5cf6" radius={[0, 3, 3, 0]} name="Visits" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-32 flex-shrink-0">
                        <ResponsiveContainer width="100%" height={180} minWidth={1} minHeight={1}>
                          <PieChart>
                            <Pie data={countryChartData} dataKey="visits" nameKey="country" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                              {countryChartData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-visits-by-page">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 size={16} />
                    Most Visited Pages (Top 10)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pageChartData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No page data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250} minWidth={1} minHeight={1}>
                      <BarChart data={pageChartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="page" tick={{ fill: "#94a3b8", fontSize: 10 }} width={75} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullPage || ""}
                        />
                        <Bar dataKey="visits" fill="#10b981" radius={[0, 3, 3, 0]} name="Visits" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity size={16} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {data.recentVisits.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-border/30 last:border-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        event.eventType === 'page_view' ? 'bg-blue-500/10 text-blue-500' :
                        event.eventType === 'analysis_run' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {event.eventType === 'page_view' ? 'VIEW' : event.eventType === 'analysis_run' ? 'ANALYSIS' : event.eventType.toUpperCase()}
                      </span>
                      <span className="font-mono text-muted-foreground truncate max-w-32">{event.page || '/'}</span>
                      {event.country && (
                        <span className="text-muted-foreground">
                          {event.city ? `${event.city}, ` : ''}{event.country}
                        </span>
                      )}
                      <span className="ml-auto text-muted-foreground whitespace-nowrap">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {data.recentVisits.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">No activity recorded yet. Visits will appear here once users start accessing your tool.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <AnalysisHistory password={password} />

            {/* Upload Activity */}
            {(() => {
              const uploads = data.recentVisits
                .filter(e => e.eventType === 'file_upload')
                .map(e => {
                  let meta: any = {};
                  try { meta = e.referrer ? JSON.parse(e.referrer) : {}; } catch {}
                  return { ...e, meta };
                });
              return uploads.length > 0 ? (
                <Card data-testid="card-upload-activity">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Upload size={16} />
                      File Upload Activity
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        ({uploads.length} upload{uploads.length !== 1 ? 's' : ''})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {uploads.map((event) => (
                        <div key={event.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-border/30 last:border-0">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-500">
                            UPLOAD
                          </span>
                          <span className="font-mono text-slate-300 truncate max-w-48">
                            {event.meta.fileName || 'Unknown file'}
                          </span>
                          {event.meta.fileSize && (
                            <span className="text-muted-foreground">
                              {(event.meta.fileSize / 1024).toFixed(1)} KB
                            </span>
                          )}
                          {event.meta.geneCount && (
                            <span className="text-muted-foreground">
                              {event.meta.geneCount.toLocaleString()} genes
                            </span>
                          )}
                          {event.meta.channelCount && (
                            <span className="text-muted-foreground">
                              {event.meta.channelCount} channels
                            </span>
                          )}
                          {event.meta.totalRecords && (
                            <span className="text-muted-foreground">
                              {event.meta.totalRecords.toLocaleString()} records
                            </span>
                          )}
                          {event.meta.timepointCount && (
                            <span className="text-muted-foreground">
                              {event.meta.timepointCount} timepoints
                            </span>
                          )}
                          {event.country && (
                            <span className="text-muted-foreground">
                              {event.city ? `${event.city}, ` : ''}{event.country}
                            </span>
                          )}
                          <span className="ml-auto text-muted-foreground whitespace-nowrap">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })()}
          </>
        )}
      </div>
    </div>
  );
}
