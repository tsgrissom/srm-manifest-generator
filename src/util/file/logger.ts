/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// steam-rom-manifester
// logger.ts
//

import * as winston from "winston";

const { combine, timestamp, printf, errors, colorize } = winston.format;

/**
 * 1) Define your custom levels (debug included)
 */
export const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

/**
 * 2) (Optional) Console colors for dev output
 */
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
});

/**
 * 3) Formats
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

/**
 * 4) Create logger (untyped) then cast it to include typed helpers
 *
 * Note: the cast is the key trick that tells TS "this logger also has methods
 * for each key in customLevels" so `logger.debug(...)` is recognized.
 */
const baseLogger = winston.createLogger({
  levels: customLevels,
  level: (process.env.LOG_LEVEL as keyof typeof customLevels) || "info",
  format:
    process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" })
  ]
});

// This cast is the important part. It preserves the winston.Logger
// shape and tells TypeScript there are methods for each custom level.
export const logger = baseLogger as winston.Logger &
  Record<keyof typeof customLevels, winston.LeveledLogMethod>;

export default logger;
