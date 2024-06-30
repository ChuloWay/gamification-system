import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { Request, Response, NextFunction } from "express";
import { logger } from "../shared/logger";

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers["authorization"]
      ? req.headers["authorization"].split(" ")[1]
      : null;

    if (!token) {
      logger.info("Unauthorized access attempt: No token provided");
      return res.status(401).json({ error: "You need to login first." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      logger.warn(`User not found for id: ${decoded.userId}`);
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    res.locals.user = user;

    logger.info(`User authenticated successfully: ${user.name}`);
    next();
  } catch (error) {
    console.error(error);
    logger.error("Error in authentication middleware:", error);
    return res.status(500).json({ error: "Invalid token" });
  }
};

export default isAuthenticated;
