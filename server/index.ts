import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception (kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection (kept alive):', reason);
});

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Block direct access to draft paper static files — require password
const DRAFT_STATIC_FILES = new Set([
  '/PaperH_GlialClockInversion_Supplement.zip',
  '/PaperM_GigaScience.pdf',
  '/PaperO_Organoid_Circadian_Hierarchy.pdf',
]);
app.use("/downloads", (req, res, next) => {
  if (!DRAFT_STATIC_FILES.has(req.path)) return next();
  const envPassword = process.env.DRAFT_PAPER_PASSWORD;
  const provided = (req.query.password as string) || (req.headers['x-download-password'] as string);
  if (!envPassword || !provided || provided !== envPassword) {
    res.status(401).json({ error: 'Password required for draft manuscripts.' });
    return;
  }
  next();
});

// Serve static figures (SVG/PNG for papers, X posts, etc.)
app.use("/figures", express.static(path.resolve(process.cwd(), "public", "figures"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".svg")) res.setHeader("Content-Type", "image/svg+xml");
    if (filePath.endsWith(".png")) res.setHeader("Content-Type", "image/png");
  },
}));

// Serve downloadable files (PDFs etc.) from the workspace public/downloads directory
// Must be registered before Vite middleware, which uses client/ as its root
app.use("/downloads", express.static(path.resolve(process.cwd(), "public", "downloads"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    }
  },
}));

// Block common scanner/exploit probe paths
app.use((req, res, next) => {
  const blocked = /^\/\.git|^\/\.env|^\/\.htaccess|^\/wp-|^\/phpmyadmin|^\/admin\.php|^\/xmlrpc\.php/i;
  if (blocked.test(req.path)) {
    res.status(404).end();
    return;
  }
  next();
});

// Block internal/draft pages in production — only accessible in development preview
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const internalPages = [
      // Paper G draft review pages
      '/paper-g-original',
      '/paper-g-revision',
      // Private analytics dashboard
      '/analytics',
      // Internal manuscript cross-validation tool
      '/manuscript-validation',
      // Paper N correction detail (misreadable without paper context)
      '/myc-on-discrepancy',
      // GSE11923 post-hoc exclusion checkpoint (Paper N)
      '/gse11923-checkpoint',
      // Internal report library
      '/reports',
      // Exploratory analyses not yet tied to any submitted paper
      '/mnd-als',
      '/gbm-zman-seq',
      '/retinal-analysis',
      '/wearable-analysis',
      '/evolutionary-gene-age',
    ];
    if (internalPages.includes(req.path)) {
      res.status(404).end();
      return;
    }
  }
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

let serverReady = false;

app.use((req, res, next) => {
  if (!serverReady) {
    if (req.path === "/" || req.path === "/__health") {
      res.status(200).send("<!DOCTYPE html><html><body><p>Starting...</p></body></html>");
      return;
    }
    res.status(503).json({ message: "Server starting up..." });
    return;
  }
  next();
});

const port = parseInt(process.env.PORT || "5000", 10);
httpServer.listen(
  {
    port,
    host: "0.0.0.0",
    reusePort: true,
  },
  () => {
    log(`serving on port ${port}`);
  },
);

(async () => {
  const authPromise = (async () => {
    try {
      await setupAuth(app);
      registerAuthRoutes(app);
      log('auth setup complete');
    } catch (err: any) {
      console.warn('[express] Auth setup failed (will retry later):', err.message || err);
    }
  })();

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('[express] Error handler:', err.message || err);
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  serverReady = true;
  log("all routes registered, server fully ready");

  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      const mem = process.memoryUsage();
      console.log(`[keepalive] heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB, rss: ${Math.round(mem.rss / 1024 / 1024)}MB`);
    }, 30000);
  }
})();
