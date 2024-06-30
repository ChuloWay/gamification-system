import { config } from "dotenv";
import { AppError } from "./AppError";
config();

const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === "test") {
    return (
      process.env.TEST_DATABASE_URL ||
      "mongodb://localhost:27017/gamification-system-test"
    );
  }

  return (
    process.env.DATABASE_URL || "mongodb://localhost:27017/gamification-system"
  );
};

const envs = {
  appName: process.env.APP_NAME || "gamification-system",
  appVersion: process.env.APP_VERSION || "1.0.0",
  port: process.env.PORT || "3001",
  host: process.env.HOST || "localhost:3001",

  database: {
    url: getDatabaseUrl(),
  },

  env: process.env.NODE_ENV || "development",
  secrets: {
    jwt: process.env.JWT_SECRET || "secret",
  },
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

const verifyEnv = () => {
  if (!envs.database.url) {
    throw new AppError({
      message: "DATABASE_URL is not set",
      type: "environment_variables_check",
    });
  }

  if (!envs.secrets.jwt) {
    throw new AppError({
      message: "JWT_SECRET is not set",
      type: "environment_variables_check",
    });
  }

  if (!envs.port) {
    throw new AppError({
      message: "PORT is not set",
      type: "environment_variables_check",
    });
  }

  if (!envs.host) {
    throw new AppError({
      message: "HOST URL is not set",
      type: "environment_variables_check",
    });
  }

  if (!envs.env) {
    throw new AppError({
      message: "NODE_ENV is not set",
      type: "environment_variables_check",
    });
  }

  return true;
};

verifyEnv();

export default envs;
