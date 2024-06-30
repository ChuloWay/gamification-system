import { Request, Response } from "express";
import Achievement, { IAchievement } from "../models/achievementModel";
import { logger } from "../shared/logger";
import redisClient from "../redisClient";
import User, { IUser } from "../models/userModel";
import { checkAndAwardBadges } from "./badgeController";
import { broadcastLeaderboardUpdate } from "../shared/socket";

export const createAchievement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, points } = req.body;
    const newAchievement = new Achievement({ name, description, points });
    const savedAchievement = await newAchievement.save();
    logger.info("Achievement created successfully");
    res.status(201).json(savedAchievement);
  } catch (error) {
    logger.error("Error creating achievement:", error);
    res.status(500).json({ error: "Error creating achievement" });
  }
};

export const getAchievements = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const achievements = await Achievement.find();
    logger.info("Achievements retrieved successfully");
    res.status(200).json(achievements);
  } catch (error) {
    logger.error("Error retrieving achievements:", error);
    res.status(500).json({ error: "Error retrieving achievements" });
  }
};

export const getAchievementById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (achievement) {
      logger.info("Achievement retrieved successfully");
      res.status(200).json(achievement);
    } else {
      logger.warn("Achievement not found");
      res.status(404).json({ error: "Achievement not found" });
    }
  } catch (error) {
    logger.error("Error retrieving achievement:", error);
    res.status(500).json({ error: "Error retrieving achievement" });
  }
};

export const updateAchievement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updatedAchievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (updatedAchievement) {
      logger.info("Achievement updated successfully");
      res.status(200).json(updatedAchievement);
    } else {
      logger.warn("Achievement not found");
      res.status(404).json({ error: "Achievement not found" });
    }
  } catch (error) {
    logger.error("Error updating achievement:", error);
    res.status(500).json({ error: "Error updating achievement" });
  }
};

export const deleteAchievement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deletedAchievement = await Achievement.findByIdAndDelete(
      req.params.id,
    );
    if (deletedAchievement) {
      logger.info("Achievement deleted successfully");
      res.status(200).json({ message: "Achievement deleted successfully" });
    } else {
      logger.warn("Achievement not found");
      res.status(404).json({ error: "Achievement not found" });
    }
  } catch (error) {
    logger.error("Error deleting achievement:", error);
    res.status(500).json({ error: "Error deleting achievement" });
  }
};
/**
 * Adds an achievement to a user.
 *
 * @param {Request} req - The request object containing the userId and achievementId.
 * @param {Response} res - The response object.
 * @return {Promise<void>} A promise that resolves when the achievement is successfully added to the user.
 */
export const addAchievementToUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, achievementId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      logger.warn("User not found");
      res.status(404).json({ error: "User not found" });
      return;
    }

    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      logger.warn("Achievement not found");
      res.status(404).json({ error: "Achievement not found" });
      return;
    }

    if (user.achievements.includes(achievementId)) {
      logger.warn("User already has this achievement");
      res.status(400).json({ error: "User already has this achievement" });
      return;
    }

    user.achievements.push(achievement.id);

    user.points += achievement.points;

    await user.save();

    // Update the user's score in the Redis leaderboard
    await redisClient.zadd("leaderboard", user.points, userId);
    await broadcastLeaderboardUpdate();

    // Check and award badges based on accumulated points
    await checkAndAwardBadges(user);

    logger.info("Achievement added to user successfully");
    res
      .status(200)
      .json({ message: "Achievement added to user successfully", user });
  } catch (error) {
    logger.error("Error adding achievement to user:", error);
    res.status(500).json({ error: "Error adding achievement to user" });
  }
};
