import { Request, Response } from "express";
import { Document } from "mongoose";
import User, { IUser } from "../models/userModel";
import redisClient from "../redisClient";
import { handleAppError, createAppError } from "../shared/AppError";
import {
  createUserSchema,
  updatePointsSchema,
} from "../validations/userValidation";
import { CreateUserResponse } from "./interface/userResponse.interface";
import { logger, errorLog, info } from "../shared/logger";
import { UpdateUserRequest } from "./interface/updateUser.interface";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { broadcastLeaderboardUpdate } from "../shared/socket";
import { checkAndAwardBadges } from "./badgeController";

/**
 * Retrieves all users from the database and populates their achievements and badges.
 *
 * @param {Request} req - The request object containing user information.
 * @param {Response} res - The response object to send the retrieved users in JSON format.
 * @return {Promise<void>} A promise that resolves when users are successfully retrieved and sent as a JSON response.
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.find().populate("achievements badges");
    logger.info("Users retrieved successfully", { count: users.length });
    res.status(200).json(users);
  } catch (err: any) {
    logger.error("Error retrieving users", err);
    res.status(500).json({ error: "Error retrieving users" });
  }
};

/**
 * Retrieves a user from the database and populates their achievements and badges.
 *
 * @param {Request} request - The request object containing the user's ID.
 * @param {Response} response - The response object to send the retrieved user data in.
 * @return {Promise<void>} A promise that resolves when the user is successfully retrieved and sent as a JSON response.
 */
export const getUser = async (request: Request, response: Response) => {
  try {
    const userId = request.params.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("achievements badges")
      .lean();

    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    response.status(200).json(user);
  } catch (error) {
    logger.error("Error retrieving user", error);
    response.status(500).json({ error: "Error retrieving user" });
  }
};

/**
 * Creates a new user in the database and adds them to the leaderboard.
 *
 * @param {Request} req - The request object containing the user's name and email.
 * @param {Response} res - The response object to send the created user data in.
 * @return {Promise<void>} A promise that resolves when the user is successfully created and added to the leaderboard.
 */
export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = createUserSchema.parse(req.body);

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // Store user details in Redis
    await redisClient.hmset(`user:${user.id}`, {
      name,
      email,
      userId: user.id,
    });

    // Add user to leaderboard (if applicable)
    await redisClient.zadd("leaderboard", 0, user.id.toString());

    // Return success response with token
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.errors });
    }

    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Error creating user" });
  }
};

/**
 * Authenticates a user and returns a JWT token if successful.
 *
 * @param {Request} req - The request object containing the user's email and password.
 * @param {Response} res - The response object to send the JWT token in.
 * @return {Promise<void>} A promise that resolves when the user is successfully authenticated and a JWT token is sent as a JSON response.
 */ export const loginUser = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("User _id in loginUser:", user._id);

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    logger.info("User logged in successfully", { userId: user._id });

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    logger.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Deletes a user from the database and removes them from the leaderboard.
 *
 * @param {Request} req - The request object containing the user's ID.
 * @param {Response} res - The response object to send the deletion confirmation message in.
 * @return {Promise<void>} A promise that resolves when the user is successfully deleted and removed from the leaderboard.
 */
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await redisClient.zrem("leaderboard", userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    logger.error("Error deleting user", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

/**
 * Updates a user's points and updates the user points in the leaderboard.
 *
 * @param {UpdateUserRequest} request - The request object.
 * @param {Response} response - The response object.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */
export const updateUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { points } = req.body;
    const userid = req.params.id;
    const user = await User.findById(userid).populate("achievements badges");

    if (!user) {
      logger.warn("User not found", { userid });
      return res.status(404).json({ message: "User not found" });
    }

    const updatedPoints = user.points + points;
    user.points = updatedPoints;
    await user.save();

    await redisClient.zadd("leaderboard", updatedPoints.toString(), userid);
    await broadcastLeaderboardUpdate();
    await checkAndAwardBadges(user);

    logger.info("User updated successfully", { userid });
    return res.status(200).json(user);
  } catch (error) {
    logger.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Retrieves the leaderboard from Redis and returns it as a JSON response.
 * The leaderboard is an array of objects with the following structure:
 * { userId: string, name: string, email: string, score: number }
 *
 * @param req - The req object containing the user's session information.
 * @param res - The response object to send the leaderboard data in.
 * @returns A Promise that resolves when the leaderboard is successfully retrieved and sent as a JSON response.
 */
export const getLeaderboard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info("Trying to get leaderboard");
    const rawLeaderboard = await redisClient.zrevrange(
      "leaderboard",
      0,
      9,
      "WITHSCORES",
    );

    const leaderboard: {
      userId: string;
      name: string;
      email: string;
      score: number;
    }[] = [];
    for (let i = 0; i < rawLeaderboard.length; i += 2) {
      const userId = rawLeaderboard[i] as string;
      const score = parseInt(rawLeaderboard[i + 1] as string, 10);

      const userData = await redisClient.hgetall(`user:${userId}`);
      if (userData) {
        const { name, email } = userData;
        leaderboard.push({ userId, name, email, score });
      } else {
        logger.warn(`User data not found in Redis for userId: ${userId}`);
        leaderboard.push({ userId, name: "Unknown", email: "Unknown", score });
      }
    }

    logger.info("Leaderboard retrieved successfully");
    res.status(200).json(leaderboard);
  } catch (error) {
    logger.error("Error retrieving leaderboard:", error);
    res.status(500).json({ error: "Error retrieving leaderboard" });
  }
};
