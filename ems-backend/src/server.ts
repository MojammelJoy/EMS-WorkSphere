import "dotenv/config";
import http from "http";
import app from "./app";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import { redis } from "@/lib/redis";
import prisma from "@/lib/prisma";
import { initSocket } from "@/sockets";

const server = http.createServer(app);

/* ── Socket.IO ── */
initSocket(server);

/* ── Graceful Shutdown ── */
async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    await redis.quit();
    logger.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err);
  process.exit(1);
});

/* ── Start ── */
async function start() {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    try {
      await redis.connect();
    } catch {
      logger.warn("Redis unavailable — running without cache");
    }

    server.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port} [${config.env}]`);
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
