import winston from "winston";
import { TransformableInfo } from "logform";
import envs from "./envs";
import { AppError } from "./AppError";

enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogFields {
  [key: string]: unknown;
}

const appName = envs.appName || "gamification-system";
const appVersion = envs.appVersion || "1.0.0";

const devFormat = () =>
  winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((log) => {
      const messages = [
        log.timestamp,
        `[${log.level}]`,
        appName,
        appVersion,
        "-",
        log.message,
      ];

      if (log.data) {
        messages.push(JSON.stringify(log.data));
      }

      if (log.error) {
        messages.push(JSON.stringify(log.error));
      }

      return messages.join(" ");
    }),
    winston.format.colorize({ all: true }),
  );

const addAppNameAndVersion = () =>
  winston.format(
    (
      info: TransformableInfo,
      data: { appName: string; appVersion: string },
    ) => ({
      ...info,
      appName: data.appName,
      appVersion: data.appVersion,
    }),
  );

// Transports
const consoleTransport = () =>
  new winston.transports.Console({
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.timestamp(),
      addAppNameAndVersion()({ appName, appVersion }),
      winston.format.json(),
      devFormat(),
    ),
  });

const getTransports = () => {
  const transports = [];

  if (!envs.isProd && !envs.isTest) {
    transports.push(consoleTransport());
  }

  return transports;
};

// Logger instance
export const logger = winston.createLogger({
  level: LogLevel.INFO,
  format: winston.format.json(),
  transports: getTransports(),
});

// Logging functions
export const debug = (message: string, data?: LogFields) => {
  logger.log(LogLevel.DEBUG, message, { data });
};

export const info = (message: string, data?: LogFields) => {
  logger.log(LogLevel.INFO, message, { data });
};

export const warn = (message: string, data?: LogFields) => {
  logger.log(LogLevel.WARN, message, { data });
};

export const errorLog = (message: string, error?: AppError) => {
  logger.log(LogLevel.ERROR, message, {
    isAppError: error instanceof AppError,
    error: error?.message,
    type: error?.type,
    metadata: error?.metadata,
    stack: error?.stack,
    name: error?.name,
  });
};
