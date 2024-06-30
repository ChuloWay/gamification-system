import { Request, Response } from "express";
import Badge from "../models/badgeModel";
import User from "../models/userModel";
import * as badgeController from "../controllers/badgeController";
import { logger } from "../shared/logger";

jest.mock("../models/badgeModel", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock("../models/userModel", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock("../shared/logger.ts");

describe("Badge Controller", () => {
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
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createBadge", () => {
    beforeEach(() => {
      req = {
        body: {
          name: "New Badge",
          description: "Badge Description",
          minPoints: 10,
          maxPoints: 20,
        },
      };
    });

    it("should create a new badge successfully", async () => {
      const mockBadge = {
        _id: "1",
        name: "New Badge",
        description: "Badge Description",
        minPoints: 10,
        maxPoints: 20,
      };

      (Badge.create as jest.Mock).mockResolvedValue(mockBadge);

      await badgeController.createBadge(req as Request, res as Response);

      expect(Badge.create).toHaveBeenCalledWith({
        name: "New Badge",
        description: "Badge Description",
        minPoints: 10,
        maxPoints: 20,
      });
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockBadge);
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database error");
      (Badge.create as jest.Mock).mockRejectedValue(mockError);

      await badgeController.createBadge(req as Request, res as Response);

      expect(Badge.create).toHaveBeenCalledWith({
        name: "New Badge",
        description: "Badge Description",
        minPoints: 10,
        maxPoints: 20,
      });
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error creating badge" });
      expect(logger.error).toHaveBeenCalledWith(
        "Error creating badge:",
        mockError,
      );
    });
  });

  describe("getBadges", () => {
    it("should return all badges successfully", async () => {
      const mockBadges = [
        { id: "1", name: "Badge 1" },
        { id: "2", name: "Badge 2" },
      ];

      (Badge.find as jest.Mock).mockResolvedValue(mockBadges);

      await badgeController.getBadges(req as Request, res as Response);

      expect(Badge.find).toHaveBeenCalledWith();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockBadges);
      expect(logger.info).toHaveBeenCalledWith("Badges retrieved successfully");
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database error");
      (Badge.find as jest.Mock).mockRejectedValue(mockError);

      await badgeController.getBadges(req as Request, res as Response);

      expect(Badge.find).toHaveBeenCalledWith();
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error retrieving badges",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error retrieving badges:",
        mockError,
      );
    });
  });

  describe("updateBadge", () => {
    beforeEach(() => {
      req = {
        params: { id: "1" },
        body: {
          name: "Updated Badge",
          description: "Updated Description",
          minPoints: 15,
          maxPoints: 25,
        },
      };
    });

    it("should update a badge successfully", async () => {
      const mockBadge = {
        id: "1",
        name: "Updated Badge",
        description: "Updated Description",
        minPoints: 15,
        maxPoints: 25,
      };

      (Badge.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockBadge);

      await badgeController.updateBadge(req as Request, res as Response);

      expect(Badge.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        {
          name: "Updated Badge",
          description: "Updated Description",
          minPoints: 15,
          maxPoints: 25,
        },
        { new: true, runValidators: true },
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockBadge);
    });

    it("should handle badge not found", async () => {
      (Badge.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await badgeController.updateBadge(req as Request, res as Response);

      expect(Badge.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        {
          name: "Updated Badge",
          description: "Updated Description",
          minPoints: 15,
          maxPoints: 25,
        },
        { new: true, runValidators: true },
      );
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Badge not found" });
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database error");
      (Badge.findByIdAndUpdate as jest.Mock).mockRejectedValue(mockError);

      await badgeController.updateBadge(req as Request, res as Response);

      expect(Badge.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        {
          name: "Updated Badge",
          description: "Updated Description",
          minPoints: 15,
          maxPoints: 25,
        },
        { new: true, runValidators: true },
      );
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error updating badge" });
      expect(logger.error).toHaveBeenCalledWith(
        "Error updating badge:",
        mockError,
      );
    });
  });

  describe("deleteBadge", () => {
    beforeEach(() => {
      req = {
        params: { id: "1" },
      };
    });

    it("should delete a badge successfully", async () => {
      (Badge.findByIdAndDelete as jest.Mock).mockResolvedValue({ id: "1" });

      await badgeController.deleteBadge(req as Request, res as Response);

      expect(Badge.findByIdAndDelete).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Badge deleted successfully",
      });
    });

    it("should handle badge not found", async () => {
      (Badge.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await badgeController.deleteBadge(req as Request, res as Response);

      expect(Badge.findByIdAndDelete).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Badge not found" });
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database error");
      (Badge.findByIdAndDelete as jest.Mock).mockRejectedValue(mockError);

      await badgeController.deleteBadge(req as Request, res as Response);

      expect(Badge.findByIdAndDelete).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error deleting badge" });
      expect(logger.error).toHaveBeenCalledWith(
        "Error deleting badge:",
        mockError,
      );
    });
  });

  describe("checkAndAwardBadges", () => {
    it("should check and award badges to the user", async () => {
      const mockUser = {
        id: "1",
        points: 15,
        badges: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockBadges = [
        {
          id: "badge1",
          name: "Badge 1",
          description: "Description 1",
          minPoints: 10,
          maxPoints: 20,
        },
        {
          id: "badge2",
          name: "Badge 2",
          description: "Description 2",
          minPoints: 20,
          maxPoints: 30,
        },
      ];

      (Badge.find as jest.Mock).mockResolvedValue(mockBadges);

      console.log("Before:", JSON.stringify(mockUser));
      await badgeController.checkAndAwardBadges(mockUser as any);
      console.log("After:", JSON.stringify(mockUser));

      expect(mockUser.badges).toEqual(["badge1"]);
      expect(mockUser.save).toHaveBeenCalled();
    });
    it("should handle errors", async () => {
      const mockError = new Error("Database error");

      const mockUser = {
        _id: "1",
        points: 15,
        badges: [],
        save: jest.fn().mockRejectedValue(mockError),
      };

      (Badge.find as jest.Mock).mockRejectedValue(mockError);

      console.error = jest.fn(); // Mock console.error

      await badgeController.checkAndAwardBadges(mockUser as any);

      expect(mockUser.badges).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Error checking and awarding badges:",
        mockError,
      );
    });
  });
});
