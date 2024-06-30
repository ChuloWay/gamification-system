// shared/AppError.ts

import { Response } from "express";

interface ErrorMetadata {
  [key: string]: any;
}

export class AppError extends Error {
  metadata?: ErrorMetadata;
  statusCode?: number;
  type?: string;
  error?: string | Error;

  constructor({
    message,
    metadata,
    type,
    statusCode,
    error,
  }: {
    message?: string;
    type?: string;
    metadata?: ErrorMetadata;
    statusCode?: number;
    error?: unknown; // Change type to unknown
  }) {
    super(message);
    this.type = type;
    this.metadata = metadata;
    this.statusCode = statusCode;
    this.error = error instanceof Error ? error : new Error(error as string); // Type assertion
  }

  addMetadata(metadata: ErrorMetadata) {
    this.metadata = this.metadata
      ? { ...this.metadata, ...metadata }
      : metadata;
  }

  toJSON() {
    return {
      message: this.message,
      type: this.type,
      metadata: this.metadata,
      statusCode: this.statusCode,
      stack: this.stack,
    };
  }
}

// Function to create AppError instances
export function createAppError({
  message,
  statusCode = 500,
  error,
}: {
  message: string;
  statusCode?: number;
  error?: unknown;
}): AppError {
  return new AppError({ message, statusCode, error });
}

// Moved handleAppError function here
export function handleAppError(err: any, res: Response): void {
  if (err instanceof AppError) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      stack: err.stack,
    });
  } else {
    const error = createAppError({
      message: "Internal Server Error",
      statusCode: 500,
      error: err,
    });
    res.status(error.statusCode || 500).json({
      error: error.message,
      stack: error.stack,
    });
  }
}
