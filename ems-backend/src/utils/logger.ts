import winston from "winston";
import { config } from "@/config";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) =>
    `[${ts}] ${level}: ${stack ?? message}`)
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: config.isDev ? "debug" : "info",
  format: config.isDev ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
    ...(config.isDev ? [] : [
      new winston.transports.File({ filename: "logs/error.log", level: "error" }),
      new winston.transports.File({ filename: "logs/combined.log" }),
    ]),
  ],
});
