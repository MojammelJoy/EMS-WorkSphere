import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { serve } from "inngest/express";

import { config } from "@/config";
import { logger } from "@/utils/logger";
import { errorHandler, notFoundHandler } from "@/middleware/error.middleware";
import routes from "@/routes";
import { inngest, inngestFunctions } from "@/jobs/inngest";

const app = express();

/* ── Security ── */
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGINS ?? config.clientUrl).split(",").map((o) => o.trim());
app.use(cors({
  origin:      (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

/* ── Rate Limiting ── */
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message: { success: false, message: "Too many requests, try again later" },
}));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  message: { success: false, message: "Too many requests" },
}));

/* ── Parsing & Middleware ── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());

/* ── Request Logging ── */
app.use(morgan(config.isDev ? "dev" : "combined", {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

/* ── Static Files (local uploads) ── */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ── Health ── */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: config.env, timestamp: new Date().toISOString() });
});

/* ── API Routes ── */
app.use("/api", routes);

/* ── Inngest (background jobs) ── */
app.use("/api/inngest", serve({ client: inngest, functions: inngestFunctions }));

/* ── 404 + Error Handlers ── */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
