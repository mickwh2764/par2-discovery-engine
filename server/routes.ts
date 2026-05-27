import type { Express } from "express";
import { createServer, type Server } from "http";
import { requestLogger } from "./logger";
import { upload } from "./routes/shared";
import { registerAnalyticsRoutes } from "./routes/analytics";
import { registerBomanRoutes } from "./routes/boman";
import { registerAnalysesRoutes } from "./routes/analyses";
import { registerDownloadRoutes } from "./routes/downloads";
import { registerFibonacciRoutes } from "./routes/fibonacci";
import { registerDiscoveryRoutes } from "./routes/discovery";
import { registerValidationRoutes } from "./routes/validation";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use(requestLogger());

  registerAnalyticsRoutes(app);
  registerBomanRoutes(app, upload);
  registerAnalysesRoutes(app, upload);
  registerDownloadRoutes(app, upload);
  registerFibonacciRoutes(app, upload);
  registerDiscoveryRoutes(app, upload);
  await registerValidationRoutes(app, upload);

  return httpServer;
}
