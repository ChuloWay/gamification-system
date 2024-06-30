import { Request, Response } from "express";
import * as achievementController from "../controllers/achievementController";
import Achievement from "../models/achievementModel";
import User from "../models/userModel";
import redisClient from "../redisClient";
import { broadcastLeaderboardUpdate } from "../shared/socket";
import { checkAndAwardBadges } from "../controllers/badgeController";
import { logger } from "../shared/logger";

jest.mock("../models/achievementModel");
jest.mock("../models/userModel");
jest.mock("../redisClient");
jest.mock("../shared/socket");
jest.mock("../controllers/badgeController");
jest.mock("../shared/logger");

describe("Achievement Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAchievement", () => {
    it("should create an achievement successfully", async () => {
      const mockAchievement = {
        name: "Test Achievement",
        description: "Test Description",
        points: 10,
      };
      req.body = mockAchievement;
      const savedAchievement = { ...mockAchievement, _id: "123" };

      (Achievement.prototype.save as jest.Mock).mockResolvedValue(
        savedAchievement,
      );

      await achievementController.createAchievement(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(savedAchievement);
      expect(logger.info).toHaveBeenCalledWith(
        "Achievement created successfully",
      );
    });

    it("should handle errors when creating an achievement", async () => {
      req.body = {
        name: "Test Achievement",
        description: "Test Description",
        points: 10,
      };
      const error = new Error("Database error");
      (Achievement.prototype.save as jest.Mock).mockRejectedValue(error);

      await achievementController.createAchievement(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error creating achievement",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error creating achievement:",
        error,
      );
    });
  });

  describe("getAchievements", () => {
    it("should retrieve all achievements successfully", async () => {
      const mockAchievements = [
        {
          _id: "1",
          name: "Achievement 1",
          description: "Description 1",
          points: 10,
        },
        {
          _id: "2",
          name: "Achievement 2",
          description: "Description 2",
          points: 20,
        },
      ];
      (Achievement.find as jest.Mock).mockResolvedValue(mockAchievements);

      await achievementController.getAchievements(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockAchievements);
      expect(logger.info).toHaveBeenCalledWith(
        "Achievements retrieved successfully",
      );
    });

    it("should handle errors when retrieving achievements", async () => {
      const error = new Error("Database error");
      (Achievement.find as jest.Mock).mockRejectedValue(error);

      await achievementController.getAchievements(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error retrieving achievements",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error retrieving achievements:",
        error,
      );
    });
  });

  describe("getAchievementById", () => {
    it("should retrieve an achievement by ID successfully", async () => {
      const mockAchievement = {
        _id: "123",
        name: "Test Achievement",
        description: "Test Description",
        points: 10,
      };
      req.params = { id: "123" };
      (Achievement.findById as jest.Mock).mockResolvedValue(mockAchievement);

      await achievementController.getAchievementById(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockAchievement);
      expect(logger.info).toHaveBeenCalledWith(
        "Achievement retrieved successfully",
      );
    });

    it("should handle achievement not found", async () => {
      req.params = { id: "123" };
      (Achievement.findById as jest.Mock).mockResolvedValue(null);

      await achievementController.getAchievementById(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Achievement not found" });
      expect(logger.warn).toHaveBeenCalledWith("Achievement not found");
    });

    it("should handle errors when retrieving an achievement", async () => {
      req.params = { id: "123" };
      const error = new Error("Database error");
      (Achievement.findById as jest.Mock).mockRejectedValue(error);

      await achievementController.getAchievementById(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error retrieving achievement",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error retrieving achievement:",
        error,
      );
    });
  });

  describe("updateAchievement", () => {
    it("should update an achievement successfully", async () => {
      const mockAchievement = {
        _id: "123",
        name: "Updated Achievement",
        description: "Updated Description",
        points: 20,
      };
      req.params = { id: "123" };
      req.body = {
        name: "Updated Achievement",
        description: "Updated Description",
        points: 20,
      };
      (Achievement.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockAchievement,
      );

      await achievementController.updateAchievement(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockAchievement);
      expect(logger.info).toHaveBeenCalledWith(
        "Achievement updated successfully",
      );
    });

    it("should handle achievement not found", async () => {
      req.params = { id: "123" };
      req.body = {
        name: "Updated Achievement",
        description: "Updated Description",
        points: 20,
      };
      (Achievement.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await achievementController.updateAchievement(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Achievement not found" });
      expect(logger.warn).toHaveBeenCalledWith("Achievement not found");
    });

    it("should handle errors when updating an achievement", async () => {
      req.params = { id: "123" };
      req.body = {
        name: "Updated Achievement",
        description: "Updated Description",
        points: 20,
      };
      const error = new Error("Database error");
      (Achievement.findByIdAndUpdate as jest.Mock).mockRejectedValue(error);

      await achievementController.updateAchievement(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error updating achievement",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error updating achievement:",
        error,
      );
    });
  });

  describe("deleteAchievement", () => {
    it("should delete an achievement successfully", async () => {
      req.params = { id: "123" };
      (Achievement.findByIdAndDelete as jest.Mock).mockResolvedValue({
        _id: "123",
      });

      await achievementController.deleteAchievement(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Achievement deleted successfully",
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Achievement deleted successfully",
      );
    });

    it("should handle achievement not found", async () => {
      req.params = { id: "123" };
      (Achievement.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await achievementController.deleteAchievement(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Achievement not found" });
      expect(logger.warn).toHaveBeenCalledWith("Achievement not found");
    });

    it("should handle errors when deleting an achievement", async () => {
      req.params = { id: "123" };
      const error = new Error("Database error");
      (Achievement.findByIdAndDelete as jest.Mock).mockRejectedValue(error);

      await achievementController.deleteAchievement(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error deleting achievement",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error deleting achievement:",
        error,
      );
    });
  });

  describe("addAchievementToUser", () => {
    it("should add an achievement to a user successfully", async () => {
      const mockUser = {
        _id: "user123",
        achievements: [],
        points: 0,
        save: jest.fn(),
      };
      const mockAchievement = {
        _id: "ach123",
        id: "ach123", // Add this line
        points: 10,
      };
      req.body = { userId: "user123", achievementId: "ach123" };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Achievement.findById as jest.Mock).mockResolvedValue(mockAchievement);

      await achievementController.addAchievementToUser(
        req as Request,
        res as Response,
      );

      expect(mockUser.achievements).toContain("ach123");
      expect(mockUser.points).toBe(10);
      expect(mockUser.save).toHaveBeenCalled();
      expect(redisClient.zadd).toHaveBeenCalledWith(
        "leaderboard",
        10,
        "user123",
      );
      expect(broadcastLeaderboardUpdate).toHaveBeenCalled();
      expect(checkAndAwardBadges).toHaveBeenCalledWith(mockUser);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Achievement added to user successfully",
        user: mockUser,
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Achievement added to user successfully",
      );
    });

    it("should handle user not found", async () => {
      req.body = { userId: "user123", achievementId: "ach123" };
      (User.findById as jest.Mock).mockResolvedValue(null);

      await achievementController.addAchievementToUser(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "User not found" });
      expect(logger.warn).toHaveBeenCalledWith("User not found");
    });

    it("should handle achievement not found", async () => {
      const mockUser = {
        _id: "user123",
        achievements: [],
        points: 0,
      };
      req.body = { userId: "user123", achievementId: "ach123" };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Achievement.findById as jest.Mock).mockResolvedValue(null);

      await achievementController.addAchievementToUser(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Achievement not found" });
      expect(logger.warn).toHaveBeenCalledWith("Achievement not found");
    });

    it("should handle user already having the achievement", async () => {
      const mockUser = {
        _id: "user123",
        achievements: ["ach123"],
        points: 10,
      };
      const mockAchievement = {
        _id: "ach123",
        points: 10,
      };
      req.body = { userId: "user123", achievementId: "ach123" };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Achievement.findById as jest.Mock).mockResolvedValue(mockAchievement);

      await achievementController.addAchievementToUser(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "User already has this achievement",
      });
      expect(logger.warn).toHaveBeenCalledWith(
        "User already has this achievement",
      );
    });

    it("should handle errors when adding achievement to user", async () => {
      req.body = { userId: "user123", achievementId: "ach123" };
      const error = new Error("Database error");
      (User.findById as jest.Mock).mockRejectedValue(error);

      await achievementController.addAchievementToUser(
        req as Request,
        res as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error adding achievement to user",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error adding achievement to user:",
        error,
      );
    });
  });
});
