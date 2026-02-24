import { 
  type AnalysisRun, 
  type InsertAnalysisRun,
  type Hypothesis,
  type InsertHypothesis,
  type User,
  type UpsertUser,
  type ProteomicsRun,
  type InsertProteomicsRun,
  type ProteomicsResult,
  type InsertProteomicsResult,
  type ConcordanceAnalysis,
  type InsertConcordance,
  type SharedAnalysis,
  type InsertSharedAnalysis,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type Feedback,
  type InsertFeedback,
  analysisRuns,
  hypotheses,
  users,
  proteomicsRuns,
  proteomicsResults,
  concordanceAnalysis,
  sharedAnalyses,
  analyticsEvents,
  feedbackSubmissions
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, desc, sql, gte, lt } from "drizzle-orm";
import ws from "ws";
import { randomUUID } from "crypto";

neonConfig.webSocketConstructor = ws;

const storageMode = process.env.STORAGE_MODE || (process.env.DATABASE_URL ? 'postgres' : 'memory');
const hasDatabase = storageMode === 'postgres' && !!process.env.DATABASE_URL;
let db: any = null;

if (hasDatabase) {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    pool.on('error', (err: Error) => {
      console.error('[storage] Database pool error (non-fatal):', err.message);
    });
    db = drizzle(pool);
  } catch (error) {
    console.warn('[storage] Failed to connect to database, falling back to in-memory storage');
  }
}

export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Analysis operations (Transcriptomics)
  createAnalysisRun(run: InsertAnalysisRun): Promise<AnalysisRun>;
  getAnalysisRun(id: string): Promise<AnalysisRun | undefined>;
  getAllAnalysisRuns(): Promise<AnalysisRun[]>;
  updateAnalysisRunStatus(id: string, status: string, completedAt?: Date): Promise<AnalysisRun | undefined>;
  updateAnalysisRunHash(id: string, hash: string, shortHash: string, hashTimestamp: Date, hashVersion: string): Promise<void>;
  getAnalysisRunWithHypotheses(id: string): Promise<{ run: AnalysisRun; hypotheses: Hypothesis[] } | undefined>;
  
  createHypothesis(hypothesis: InsertHypothesis): Promise<Hypothesis>;
  getHypothesesByRunId(runId: string): Promise<Hypothesis[]>;
  bulkCreateHypotheses(hypotheses: InsertHypothesis[]): Promise<Hypothesis[]>;
  
  // FDR correction - update q-values for all hypotheses in a run
  updateHypothesisFDR(id: string, qValue: number, significantAfterFDR: boolean): Promise<void>;
  
  // Cross-tissue consensus - get all hypotheses across all runs
  getAllHypotheses(): Promise<Hypothesis[]>;
  getAllHypothesesWithRuns(): Promise<{ hypothesis: Hypothesis; run: AnalysisRun }[]>;
  
  // Proteomics operations
  createProteomicsRun(run: InsertProteomicsRun): Promise<ProteomicsRun>;
  getProteomicsRun(id: string): Promise<ProteomicsRun | undefined>;
  getAllProteomicsRuns(): Promise<ProteomicsRun[]>;
  updateProteomicsRunStatus(id: string, status: string, completedAt?: Date): Promise<ProteomicsRun | undefined>;
  getProteomicsRunWithResults(id: string): Promise<{ run: ProteomicsRun; results: ProteomicsResult[] } | undefined>;
  
  createProteomicsResult(result: InsertProteomicsResult): Promise<ProteomicsResult>;
  getProteomicsResultsByRunId(runId: string): Promise<ProteomicsResult[]>;
  bulkCreateProteomicsResults(results: InsertProteomicsResult[]): Promise<ProteomicsResult[]>;
  updateProteomicsResultFDR(id: string, qValue: number, significantAfterFDR: boolean): Promise<void>;
  
  // Concordance analysis (mRNA vs protein comparison)
  createConcordanceAnalysis(concordance: InsertConcordance): Promise<ConcordanceAnalysis>;
  getConcordanceByRuns(transcriptomicsRunId: string, proteomicsRunId: string): Promise<ConcordanceAnalysis[]>;
  bulkCreateConcordance(concordances: InsertConcordance[]): Promise<ConcordanceAnalysis[]>;
  
  // Shared analyses
  createSharedAnalysis(analysis: InsertSharedAnalysis): Promise<SharedAnalysis>;
  getSharedAnalysis(id: string): Promise<SharedAnalysis | undefined>;
  listSharedAnalyses(limit?: number): Promise<SharedAnalysis[]>;
  
  // Analytics
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEvents(limit?: number): Promise<AnalyticsEvent[]>;
  getAnalyticsSummary(): Promise<{
    totalVisits: number;
    totalAnalyses: number;
    uniqueCountries: string[];
    visitsByCountry: Record<string, number>;
    visitsByPage: Record<string, number>;
    recentVisits: AnalyticsEvent[];
    visitsByDay: Record<string, number>;
  }>;
  
  clearAnalytics(): Promise<void>;
  getAnalyticsForDay(day: string): Promise<AnalyticsEvent[]>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  listFeedback(limit?: number): Promise<Feedback[]>;
  
  // Health check
  healthCheck(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createAnalysisRun(run: InsertAnalysisRun): Promise<AnalysisRun> {
    const [result] = await db.insert(analysisRuns).values(run).returning();
    return result;
  }

  async getAnalysisRun(id: string): Promise<AnalysisRun | undefined> {
    const [result] = await db.select().from(analysisRuns).where(eq(analysisRuns.id, id));
    return result;
  }

  async getAllAnalysisRuns(): Promise<AnalysisRun[]> {
    return db.select().from(analysisRuns).orderBy(desc(analysisRuns.createdAt));
  }

  async updateAnalysisRunStatus(id: string, status: string, completedAt?: Date): Promise<AnalysisRun | undefined> {
    const [result] = await db
      .update(analysisRuns)
      .set({ status, completedAt: completedAt || null })
      .where(eq(analysisRuns.id, id))
      .returning();
    return result;
  }

  async updateAnalysisRunHash(id: string, hash: string, shortHash: string, hashTimestamp: Date, hashVersion: string): Promise<void> {
    await db
      .update(analysisRuns)
      .set({ 
        integrityHash: hash, 
        integrityHashShort: shortHash, 
        hashTimestamp, 
        hashVersion 
      })
      .where(eq(analysisRuns.id, id));
  }

  async getAnalysisRunWithHypotheses(id: string): Promise<{ run: AnalysisRun; hypotheses: Hypothesis[] } | undefined> {
    const run = await this.getAnalysisRun(id);
    if (!run) return undefined;
    const hyps = await this.getHypothesesByRunId(id);
    return { run, hypotheses: hyps };
  }

  async createHypothesis(hypothesis: InsertHypothesis): Promise<Hypothesis> {
    const [result] = await db.insert(hypotheses).values(hypothesis).returning();
    return result;
  }

  async getHypothesesByRunId(runId: string): Promise<Hypothesis[]> {
    return db.select().from(hypotheses).where(eq(hypotheses.runId, runId));
  }

  async bulkCreateHypotheses(hypothesesToInsert: InsertHypothesis[]): Promise<Hypothesis[]> {
    if (hypothesesToInsert.length === 0) return [];
    return db.insert(hypotheses).values(hypothesesToInsert).returning();
  }

  async updateHypothesisFDR(id: string, qValue: number, significantAfterFDR: boolean): Promise<void> {
    await db
      .update(hypotheses)
      .set({ qValue, significantAfterFDR })
      .where(eq(hypotheses.id, id));
  }

  async getAllHypotheses(): Promise<Hypothesis[]> {
    return db.select().from(hypotheses);
  }

  async getAllHypothesesWithRuns(): Promise<{ hypothesis: Hypothesis; run: AnalysisRun }[]> {
    const allRuns = await this.getAllAnalysisRuns();
    const results: { hypothesis: Hypothesis; run: AnalysisRun }[] = [];
    
    for (const run of allRuns) {
      if (run.status !== 'completed') continue;
      const hyps = await this.getHypothesesByRunId(run.id);
      for (const hyp of hyps) {
        results.push({ hypothesis: hyp, run });
      }
    }
    
    return results;
  }

  // Proteomics operations
  async createProteomicsRun(run: InsertProteomicsRun): Promise<ProteomicsRun> {
    const [result] = await db.insert(proteomicsRuns).values(run).returning();
    return result;
  }

  async getProteomicsRun(id: string): Promise<ProteomicsRun | undefined> {
    const [result] = await db.select().from(proteomicsRuns).where(eq(proteomicsRuns.id, id));
    return result;
  }

  async getAllProteomicsRuns(): Promise<ProteomicsRun[]> {
    return db.select().from(proteomicsRuns).orderBy(desc(proteomicsRuns.createdAt));
  }

  async updateProteomicsRunStatus(id: string, status: string, completedAt?: Date): Promise<ProteomicsRun | undefined> {
    const [result] = await db
      .update(proteomicsRuns)
      .set({ status, completedAt: completedAt || null })
      .where(eq(proteomicsRuns.id, id))
      .returning();
    return result;
  }

  async getProteomicsRunWithResults(id: string): Promise<{ run: ProteomicsRun; results: ProteomicsResult[] } | undefined> {
    const run = await this.getProteomicsRun(id);
    if (!run) return undefined;
    const results = await this.getProteomicsResultsByRunId(id);
    return { run, results };
  }

  async createProteomicsResult(result: InsertProteomicsResult): Promise<ProteomicsResult> {
    const [res] = await db.insert(proteomicsResults).values(result).returning();
    return res;
  }

  async getProteomicsResultsByRunId(runId: string): Promise<ProteomicsResult[]> {
    return db.select().from(proteomicsResults).where(eq(proteomicsResults.runId, runId));
  }

  async bulkCreateProteomicsResults(results: InsertProteomicsResult[]): Promise<ProteomicsResult[]> {
    if (results.length === 0) return [];
    return db.insert(proteomicsResults).values(results).returning();
  }

  async updateProteomicsResultFDR(id: string, qValue: number, significantAfterFDR: boolean): Promise<void> {
    await db
      .update(proteomicsResults)
      .set({ qValue, significantAfterFDR })
      .where(eq(proteomicsResults.id, id));
  }

  // Concordance analysis
  async createConcordanceAnalysis(concordance: InsertConcordance): Promise<ConcordanceAnalysis> {
    const [result] = await db.insert(concordanceAnalysis).values(concordance).returning();
    return result;
  }

  async getConcordanceByRuns(transcriptomicsRunId: string, proteomicsRunId: string): Promise<ConcordanceAnalysis[]> {
    return db.select().from(concordanceAnalysis)
      .where(eq(concordanceAnalysis.transcriptomicsRunId, transcriptomicsRunId))
      .where(eq(concordanceAnalysis.proteomicsRunId, proteomicsRunId));
  }

  async bulkCreateConcordance(concordances: InsertConcordance[]): Promise<ConcordanceAnalysis[]> {
    if (concordances.length === 0) return [];
    return db.insert(concordanceAnalysis).values(concordances).returning();
  }
  
  async createSharedAnalysis(analysis: InsertSharedAnalysis): Promise<SharedAnalysis> {
    const [result] = await db.insert(sharedAnalyses).values(analysis).returning();
    return result;
  }

  async getSharedAnalysis(id: string): Promise<SharedAnalysis | undefined> {
    const [result] = await db.select().from(sharedAnalyses).where(eq(sharedAnalyses.id, id));
    return result;
  }

  async listSharedAnalyses(limit = 50): Promise<SharedAnalysis[]> {
    return db.select().from(sharedAnalyses).orderBy(desc(sharedAnalyses.createdAt)).limit(limit);
  }

  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [result] = await db.insert(analyticsEvents).values(event).returning();
    return result;
  }

  async getAnalyticsEvents(limit = 100): Promise<AnalyticsEvent[]> {
    return db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(limit);
  }

  async getAnalyticsSummary() {
    const allEvents = await db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt));
    return this.buildSummary(allEvents);
  }

  private buildSummary(allEvents: AnalyticsEvent[]) {
    const visits = allEvents.filter(e => e.eventType === 'page_view');
    const analyses = allEvents.filter(e => e.eventType === 'analysis_run');
    const visitsByCountry: Record<string, number> = {};
    const visitsByPage: Record<string, number> = {};
    const visitsByDay: Record<string, number> = {};
    const countries = new Set<string>();

    for (const e of visits) {
      if (e.country) {
        countries.add(e.country);
        visitsByCountry[e.country] = (visitsByCountry[e.country] || 0) + 1;
      }
      if (e.page) {
        visitsByPage[e.page] = (visitsByPage[e.page] || 0) + 1;
      }
      const day = e.createdAt.toISOString().split('T')[0];
      visitsByDay[day] = (visitsByDay[day] || 0) + 1;
    }

    return {
      totalVisits: visits.length,
      totalAnalyses: analyses.length,
      uniqueCountries: Array.from(countries),
      visitsByCountry,
      visitsByPage,
      recentVisits: allEvents.slice(0, 50),
      visitsByDay,
    };
  }

  async clearAnalytics(): Promise<void> {
    await db.execute(sql`DELETE FROM analytics_events`);
  }

  async getAnalyticsForDay(day: string): Promise<AnalyticsEvent[]> {
    const startDate = new Date(day + 'T00:00:00.000Z');
    const endDate = new Date(day + 'T23:59:59.999Z');
    return db.select().from(analyticsEvents)
      .where(sql`${analyticsEvents.createdAt} >= ${startDate} AND ${analyticsEvents.createdAt} <= ${endDate}`)
      .orderBy(desc(analyticsEvents.createdAt));
  }

  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const [result] = await db.insert(feedbackSubmissions).values(feedback).returning();
    return result;
  }

  async listFeedback(limit = 100): Promise<Feedback[]> {
    return db.select().from(feedbackSubmissions).orderBy(desc(feedbackSubmissions.createdAt)).limit(limit);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await db.select().from(analysisRuns).limit(1);
      return true;
    } catch (error) {
      console.error('[storage] Database health check failed:', error);
      return false;
    }
  }
}

// In-memory storage for offline/standalone mode (no database required)
export class InMemoryStorage implements IStorage {
  private analysisRunsMap: Map<string, AnalysisRun> = new Map();
  private hypothesesMap: Map<string, Hypothesis[]> = new Map();
  private usersMap: Map<string, User> = new Map();
  private proteomicsRunsMap: Map<string, ProteomicsRun> = new Map();
  private proteomicsResultsMap: Map<string, ProteomicsResult[]> = new Map();
  private concordanceMap: Map<string, ConcordanceAnalysis[]> = new Map();

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.usersMap.get(userData.id!);
    const user: User = {
      id: userData.id!,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    this.usersMap.set(user.id, user);
    return user;
  }

  async createAnalysisRun(run: InsertAnalysisRun): Promise<AnalysisRun> {
    const id = randomUUID();
    const analysisRun: AnalysisRun = {
      id,
      name: run.name,
      datasetName: run.datasetName,
      status: run.status || 'pending',
      createdAt: new Date(),
      completedAt: null,
      integrityHash: null,
      integrityHashShort: null,
      hashTimestamp: null,
      hashVersion: null
    };
    this.analysisRunsMap.set(id, analysisRun);
    return analysisRun;
  }

  async getAnalysisRun(id: string): Promise<AnalysisRun | undefined> {
    return this.analysisRunsMap.get(id);
  }

  async getAllAnalysisRuns(): Promise<AnalysisRun[]> {
    return Array.from(this.analysisRunsMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateAnalysisRunStatus(id: string, status: string, completedAt?: Date): Promise<AnalysisRun | undefined> {
    const run = this.analysisRunsMap.get(id);
    if (!run) return undefined;
    run.status = status;
    run.completedAt = completedAt || null;
    this.analysisRunsMap.set(id, run);
    return run;
  }

  async updateAnalysisRunHash(id: string, hash: string, shortHash: string, hashTimestamp: Date, hashVersion: string): Promise<void> {
    const run = this.analysisRunsMap.get(id);
    if (run) {
      (run as any).integrityHash = hash;
      (run as any).integrityHashShort = shortHash;
      (run as any).hashTimestamp = hashTimestamp;
      (run as any).hashVersion = hashVersion;
      this.analysisRunsMap.set(id, run);
    }
  }

  async getAnalysisRunWithHypotheses(id: string): Promise<{ run: AnalysisRun; hypotheses: Hypothesis[] } | undefined> {
    const run = await this.getAnalysisRun(id);
    if (!run) return undefined;
    const hyps = await this.getHypothesesByRunId(id);
    return { run, hypotheses: hyps };
  }

  async createHypothesis(hypothesis: InsertHypothesis): Promise<Hypothesis> {
    const id = randomUUID();
    const hyp: Hypothesis = {
      id,
      runId: hypothesis.runId,
      targetGene: hypothesis.targetGene,
      targetRole: hypothesis.targetRole,
      clockGene: hypothesis.clockGene,
      clockRole: hypothesis.clockRole,
      significant: hypothesis.significant ?? false,
      pValue: hypothesis.pValue ?? null,
      qValue: hypothesis.qValue ?? null,
      significantAfterFDR: hypothesis.significantAfterFDR ?? false,
      significantTerms: hypothesis.significantTerms || [],
      description: hypothesis.description ?? null,
      effectSizeCohensF2: hypothesis.effectSizeCohensF2 ?? null,
      effectSizeInterpretation: hypothesis.effectSizeInterpretation ?? null,
      rSquaredChange: hypothesis.rSquaredChange ?? null,
      confidenceIntervals: hypothesis.confidenceIntervals ?? null,
      createdAt: new Date()
    };
    const existing = this.hypothesesMap.get(hypothesis.runId) || [];
    existing.push(hyp);
    this.hypothesesMap.set(hypothesis.runId, existing);
    return hyp;
  }

  async getHypothesesByRunId(runId: string): Promise<Hypothesis[]> {
    return this.hypothesesMap.get(runId) || [];
  }

  async bulkCreateHypotheses(hypothesesToInsert: InsertHypothesis[]): Promise<Hypothesis[]> {
    const results: Hypothesis[] = [];
    for (const hyp of hypothesesToInsert) {
      results.push(await this.createHypothesis(hyp));
    }
    return results;
  }

  async updateHypothesisFDR(id: string, qValue: number, significantAfterFDR: boolean): Promise<void> {
    const entries = Array.from(this.hypothesesMap.entries());
    for (const [runId, hyps] of entries) {
      const hyp = hyps.find((h: Hypothesis) => h.id === id);
      if (hyp) {
        hyp.qValue = qValue;
        hyp.significantAfterFDR = significantAfterFDR;
        return;
      }
    }
  }

  async getAllHypotheses(): Promise<Hypothesis[]> {
    const all: Hypothesis[] = [];
    const values = Array.from(this.hypothesesMap.values());
    for (const hyps of values) {
      all.push(...hyps);
    }
    return all;
  }

  async getAllHypothesesWithRuns(): Promise<{ hypothesis: Hypothesis; run: AnalysisRun }[]> {
    const results: { hypothesis: Hypothesis; run: AnalysisRun }[] = [];
    const entries = Array.from(this.hypothesesMap.entries());
    for (const [runId, hyps] of entries) {
      const run = this.analysisRunsMap.get(runId);
      if (!run || run.status !== 'completed') continue;
      for (const hyp of hyps) {
        results.push({ hypothesis: hyp, run });
      }
    }
    return results;
  }

  // Proteomics operations
  async createProteomicsRun(run: InsertProteomicsRun): Promise<ProteomicsRun> {
    const id = randomUUID();
    const proteomicsRun: ProteomicsRun = {
      id,
      name: run.name,
      datasetName: run.datasetName,
      dataType: run.dataType || 'protein',
      status: run.status || 'pending',
      linkedTranscriptomicsRunId: run.linkedTranscriptomicsRunId ?? null,
      createdAt: new Date(),
      completedAt: null
    };
    this.proteomicsRunsMap.set(id, proteomicsRun);
    return proteomicsRun;
  }

  async getProteomicsRun(id: string): Promise<ProteomicsRun | undefined> {
    return this.proteomicsRunsMap.get(id);
  }

  async getAllProteomicsRuns(): Promise<ProteomicsRun[]> {
    return Array.from(this.proteomicsRunsMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateProteomicsRunStatus(id: string, status: string, completedAt?: Date): Promise<ProteomicsRun | undefined> {
    const run = this.proteomicsRunsMap.get(id);
    if (!run) return undefined;
    run.status = status;
    run.completedAt = completedAt || null;
    this.proteomicsRunsMap.set(id, run);
    return run;
  }

  async getProteomicsRunWithResults(id: string): Promise<{ run: ProteomicsRun; results: ProteomicsResult[] } | undefined> {
    const run = await this.getProteomicsRun(id);
    if (!run) return undefined;
    const results = await this.getProteomicsResultsByRunId(id);
    return { run, results };
  }

  async createProteomicsResult(result: InsertProteomicsResult): Promise<ProteomicsResult> {
    const id = randomUUID();
    const res: ProteomicsResult = {
      id,
      runId: result.runId,
      targetProtein: result.targetProtein,
      targetGeneSymbol: result.targetGeneSymbol,
      clockProtein: result.clockProtein,
      clockGeneSymbol: result.clockGeneSymbol,
      significant: result.significant ?? false,
      pValue: result.pValue ?? null,
      qValue: result.qValue ?? null,
      significantAfterFDR: result.significantAfterFDR ?? false,
      significantTerms: result.significantTerms || [],
      effectSizeCohensF2: result.effectSizeCohensF2 ?? null,
      effectSizeInterpretation: result.effectSizeInterpretation ?? null,
      rSquaredChange: result.rSquaredChange ?? null,
      confidenceIntervals: result.confidenceIntervals ?? null,
      createdAt: new Date()
    };
    const existing = this.proteomicsResultsMap.get(result.runId) || [];
    existing.push(res);
    this.proteomicsResultsMap.set(result.runId, existing);
    return res;
  }

  async getProteomicsResultsByRunId(runId: string): Promise<ProteomicsResult[]> {
    return this.proteomicsResultsMap.get(runId) || [];
  }

  async bulkCreateProteomicsResults(results: InsertProteomicsResult[]): Promise<ProteomicsResult[]> {
    const created: ProteomicsResult[] = [];
    for (const r of results) {
      created.push(await this.createProteomicsResult(r));
    }
    return created;
  }

  async updateProteomicsResultFDR(id: string, qValue: number, significantAfterFDR: boolean): Promise<void> {
    const entries = Array.from(this.proteomicsResultsMap.entries());
    for (const [runId, results] of entries) {
      const result = results.find((r: ProteomicsResult) => r.id === id);
      if (result) {
        result.qValue = qValue;
        result.significantAfterFDR = significantAfterFDR;
        return;
      }
    }
  }

  // Concordance analysis
  async createConcordanceAnalysis(concordance: InsertConcordance): Promise<ConcordanceAnalysis> {
    const id = randomUUID();
    const result: ConcordanceAnalysis = {
      id,
      transcriptomicsRunId: concordance.transcriptomicsRunId,
      proteomicsRunId: concordance.proteomicsRunId,
      targetGene: concordance.targetGene,
      clockGene: concordance.clockGene,
      mrnaPValue: concordance.mrnaPValue ?? null,
      mrnaSignificant: concordance.mrnaSignificant ?? null,
      proteinPValue: concordance.proteinPValue ?? null,
      proteinSignificant: concordance.proteinSignificant ?? null,
      concordanceStatus: concordance.concordanceStatus,
      interpretation: concordance.interpretation ?? null,
      createdAt: new Date()
    };
    const key = `${concordance.transcriptomicsRunId}-${concordance.proteomicsRunId}`;
    const existing = this.concordanceMap.get(key) || [];
    existing.push(result);
    this.concordanceMap.set(key, existing);
    return result;
  }

  async getConcordanceByRuns(transcriptomicsRunId: string, proteomicsRunId: string): Promise<ConcordanceAnalysis[]> {
    const key = `${transcriptomicsRunId}-${proteomicsRunId}`;
    return this.concordanceMap.get(key) || [];
  }

  async bulkCreateConcordance(concordances: InsertConcordance[]): Promise<ConcordanceAnalysis[]> {
    const created: ConcordanceAnalysis[] = [];
    for (const c of concordances) {
      created.push(await this.createConcordanceAnalysis(c));
    }
    return created;
  }
  
  private sharedAnalyses: Map<string, SharedAnalysis> = new Map();

  async createSharedAnalysis(analysis: InsertSharedAnalysis): Promise<SharedAnalysis> {
    const shared: SharedAnalysis = {
      ...analysis,
      analysisData: analysis.analysisData,
      createdAt: new Date(),
    };
    this.sharedAnalyses.set(analysis.id, shared);
    return shared;
  }

  async getSharedAnalysis(id: string): Promise<SharedAnalysis | undefined> {
    return this.sharedAnalyses.get(id);
  }

  async listSharedAnalyses(limit = 50): Promise<SharedAnalysis[]> {
    return Array.from(this.sharedAnalyses.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  private analyticsEventsArr: AnalyticsEvent[] = [];

  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const id = randomUUID();
    const result: AnalyticsEvent = {
      id,
      eventType: event.eventType,
      page: event.page ?? null,
      country: event.country ?? null,
      city: event.city ?? null,
      region: event.region ?? null,
      userAgent: event.userAgent ?? null,
      referrer: event.referrer ?? null,
      sessionId: event.sessionId ?? null,
      createdAt: new Date(),
    };
    this.analyticsEventsArr.push(result);
    return result;
  }

  async getAnalyticsEvents(limit = 100): Promise<AnalyticsEvent[]> {
    return this.analyticsEventsArr
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getAnalyticsSummary() {
    const allEvents = this.analyticsEventsArr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const visits = allEvents.filter(e => e.eventType === 'page_view');
    const analyses = allEvents.filter(e => e.eventType === 'analysis_run');
    const visitsByCountry: Record<string, number> = {};
    const visitsByPage: Record<string, number> = {};
    const visitsByDay: Record<string, number> = {};
    const countries = new Set<string>();

    for (const e of visits) {
      if (e.country) {
        countries.add(e.country);
        visitsByCountry[e.country] = (visitsByCountry[e.country] || 0) + 1;
      }
      if (e.page) {
        visitsByPage[e.page] = (visitsByPage[e.page] || 0) + 1;
      }
      const day = e.createdAt.toISOString().split('T')[0];
      visitsByDay[day] = (visitsByDay[day] || 0) + 1;
    }

    return {
      totalVisits: visits.length,
      totalAnalyses: analyses.length,
      uniqueCountries: Array.from(countries),
      visitsByCountry,
      visitsByPage,
      recentVisits: allEvents.slice(0, 50),
      visitsByDay,
    };
  }

  async clearAnalytics(): Promise<void> {
    this.analyticsEventsArr = [];
  }

  async getAnalyticsForDay(day: string): Promise<AnalyticsEvent[]> {
    return this.analyticsEventsArr
      .filter(e => e.createdAt.toISOString().startsWith(day))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private feedbackArr: Feedback[] = [];

  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const entry: Feedback = { id: randomUUID(), ...feedback, email: feedback.email ?? null, page: feedback.page ?? null, createdAt: new Date() };
    this.feedbackArr.push(entry);
    return entry;
  }

  async listFeedback(limit = 100): Promise<Feedback[]> {
    return [...this.feedbackArr].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

// Auto-detect storage mode: use database if available, otherwise in-memory
const useDatabase = hasDatabase && db !== null;
export const storage: IStorage = useDatabase
  ? new DatabaseStorage() 
  : new InMemoryStorage();

console.log(`[storage] Mode: ${storageMode}, Using: ${useDatabase ? 'PostgreSQL database' : 'in-memory'} storage`);
