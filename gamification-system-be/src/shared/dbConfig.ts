import { Db } from "mongodb";
import mongoose, { Connection } from "mongoose";
import { AppError } from "./AppError";
import { logger } from "./logger";

interface AppDBConnection {
  client: Connection;
  db: Db;
  url: string;
  options?: mongoose.ConnectOptions;
}

export const createConnection = async (
  url: string,
  options?: mongoose.ConnectOptions,
): Promise<{ data?: Connection; error?: AppError }> => {
  try {
    const connect = await mongoose.connect(url, options);
    const client = connect.connection;
    const db = client.db;
    logger.info("Connected to database");
    return { data: client };
  } catch (err) {
    const error = new AppError({ error: err as Error, type: "DATABASE_ERROR" });
    logger.error("Error connecting to database", error);
    return { error };
  }
};

export const disconnect = async (
  connection: Connection,
): Promise<{ data?: boolean; error?: AppError }> => {
  try {
    await connection.close();
    logger.info("Disconnected from database");
    return { data: true };
  } catch (err) {
    const error = new AppError({ error: err as Error, type: "DATABASE_ERROR" });
    logger.error("Error disconnecting from database", error);
    return { error };
  }
};

export const dropDatabase = async (
  connection: Connection,
): Promise<{ data?: boolean; error?: AppError }> => {
  try {
    await connection.db.dropDatabase();
    logger.info("Dropped database");
    return { data: true };
  } catch (err) {
    const error = new AppError({ error: err as Error, type: "DATABASE_ERROR" });
    logger.error("Error dropping database", error);
    return { error };
  }
};
