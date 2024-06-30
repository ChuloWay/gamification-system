import { Request, Response, NextFunction } from "express";
import { info } from "../shared/logger";

const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const userAgent = req.headers["user-agent"] || "unknown";
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  info("Request received", {
    path: req.originalUrl,
    method: req.method,
    ip,
    userAgent,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  next();
};

export default requestLogger;
