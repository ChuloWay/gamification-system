import { Request, Response } from "express";
import Badge, { IBadge } from "../models/badgeModel";
import { logger } from "../shared/logger";
import User, { IUser } from "../models/userModel";

// Create a new badge
export const createBadge = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, minPoints, maxPoints } = req.body;
    const newBadge = await Badge.create({
      name,
      description,
      minPoints,
      maxPoints,
    });
    logger.info("Badge created successfully");
    res.status(201).json(newBadge);
  } catch (error) {
    logger.error("Error creating badge:", error);
    res.status(500).json({ error: "Error creating badge" });
  }
};

// Retrieve all badges
export const getBadges = async (req: Request, res: Response): Promise<void> => {
  try {
    const badges = await Badge.find();
    logger.info("Badges retrieved successfully");
    res.status(200).json(badges);
  } catch (error) {
    logger.error("Error retrieving badges:", error);
    res.status(500).json({ error: "Error retrieving badges" });
  }
};

// Retrieve a single badge by ID
export const getBadgeById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (badge) {
      logger.info("Badge retrieved successfully");
      res.status(200).json(badge);
    } else {
      logger.warn("Badge not found");
      res.status(404).json({ error: "Badge not found" });
    }
  } catch (error) {
    logger.error("Error retrieving badge:", error);
    res.status(500).json({ error: "Error retrieving badge" });
  }
};

// Update a badge by ID
export const updateBadge = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, minPoints, maxPoints } = req.body;
    const updatedBadge = await Badge.findByIdAndUpdate(
      req.params.id,
      { name, description, minPoints, maxPoints },
      { new: true, runValidators: true },
    );
    if (updatedBadge) {
      logger.info("Badge updated successfully");
      res.status(200).json(updatedBadge);
    } else {
      logger.warn("Badge not found");
      res.status(404).json({ error: "Badge not found" });
    }
  } catch (error) {
    logger.error("Error updating badge:", error);
    res.status(500).json({ error: "Error updating badge" });
  }
};

// Delete a badge by ID
export const deleteBadge = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const deletedBadge = await Badge.findByIdAndDelete(req.params.id);
    if (deletedBadge) {
      logger.info("Badge deleted successfully");
      res.status(200).json({ message: "Badge deleted successfully" });
    } else {
      logger.warn("Badge not found");
      res.status(404).json({ error: "Badge not found" });
    }
  } catch (error) {
    logger.error("Error deleting badge:", error);
    res.status(500).json({ error: "Error deleting badge" });
  }
};

export const checkAndAwardBadges = async (user: IUser): Promise<void> => {
  try {
    const allBadges = await Badge.find();

    console.log("All badges:", JSON.stringify(allBadges));
    console.log("User before:", JSON.stringify(user));

    allBadges.forEach((badge) => {
      if (
        user.points >= badge.minPoints &&
        user.points <= badge.maxPoints &&
        !user.badges.includes(badge.id)
      ) {
        user.badges.push(badge.id);
        console.log(`Added badge: ${badge.id}`);
      }
    });

    console.log("User after:", JSON.stringify(user));

    await user.save();
  } catch (error) {
    console.error("Error checking and awarding badges:", error);
  }
};
