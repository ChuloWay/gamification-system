import { Request, Response } from "express";

import User from "../models/userModel";
import redisClient from "../redisClient";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import * as userController from "../controllers/userController";
import { logger } from "../shared/logger";
import { broadcastLeaderboardUpdate } from "../shared/socket";
import { checkAndAwardBadges } from "../controllers/badgeController";

jest.mock("../models/userModel", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn().mockImplementation(() => ({
      _id: "1",
      name: "Test User",
      email: "test@example.com",
      comparePassword: jest.fn().mockResolvedValue(true),
    })),
    create: jest.fn(),
    save: jest.fn(),
  },
}));
jest.mock("../shared/socket", () => ({
  broadcastLeaderboardUpdate: jest.fn().mockResolvedValue(true),
}));

jest.mock("../controllers/badgeController", () => ({
  checkAndAwardBadges: jest.fn().mockResolvedValue(true),
}));
jest.mock("../models/userModel");
jest.mock("../redisClient");
const jwtSignMock = jest.fn().mockReturnValue("token");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("token"),
}));
jest.mock("../shared/logger.ts");

describe("User Controller", () => {
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

  describe("getAllUsers", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
      mockJson = jest.fn();
      mockStatus = jest.fn().mockReturnThis();
      mockRequest = {};
      mockResponse = {
        json: mockJson,
        status: mockStatus,
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return all users with 200 status code", async () => {
      const mockUsers = [
        { id: "1", name: "User 1" },
        { id: "2", name: "User 2" },
      ];
      (User.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUsers),
      });

      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUsers);
      expect(logger.info).toHaveBeenCalledWith("Users retrieved successfully", {
        count: mockUsers.length,
      });
    });

    it("should handle errors and return 500 status code", async () => {
      const mockError = new Error("Database error");
      (User.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError),
      });

      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Error retrieving users",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error retrieving users",
        mockError,
      );
    });
  });
  describe("getUser", () => {
    beforeEach(() => {
      req = { params: { id: "validId" } };
      res = {
        status: statusMock,
        json: jsonMock,
      };
    });

    it("should retrieve a user successfully", async () => {
      const mockUser = {
        id: "validId",
        name: "Test User",
        achievements: ["achievement1"],
        badges: ["badge1"],
      };
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      await userController.getUser(req as Request, res as Response);

      expect(User.findById).toHaveBeenCalledWith("validId");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUser);
      expect(mockUser).not.toHaveProperty("password");
    });

    it("should handle user not found", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      await userController.getUser(req as Request, res as Response);

      expect(User.findById).toHaveBeenCalledWith("validId");
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database error");
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(mockError),
      });

      await userController.getUser(req as Request, res as Response);

      expect(User.findById).toHaveBeenCalledWith("validId");
      expect(logger.error).toHaveBeenCalledWith(
        "Error retrieving user",
        mockError,
      );
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error retrieving user" });
    });
  });

  describe("createUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      req = {
        body: {
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        },
      };
      res = {
        status: statusMock,
        json: jsonMock,
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should create a user successfully", async () => {
      const mockUser = {
        id: "mockUserId",
        name: "Test User",
        email: "test@example.com",
      };
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("mockToken");
      (redisClient.hmset as jest.Mock).mockResolvedValue("OK");
      (redisClient.zadd as jest.Mock).mockResolvedValue(1);

      await userController.createUser(req as Request, res as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(User.create).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "mockUserId" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      expect(redisClient.hmset).toHaveBeenCalledWith("user:mockUserId", {
        name: "Test User",
        email: "test@example.com",
        userId: "mockUserId",
      });
      expect(redisClient.zadd).toHaveBeenCalledWith(
        "leaderboard",
        0,
        "mockUserId",
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock.mock.calls[0][0].user).not.toHaveProperty("password");
      expect(jsonMock).toHaveBeenCalledWith({
        message: "User created successfully",
        user: mockUser,
        token: "mockToken",
      });
    });

    it("should handle email already in use", async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ id: "existingUserId" });

      await userController.createUser(req as Request, res as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Email already in use",
      });
    });

    it("should handle validation errors", async () => {
      req.body = { name: "Te", email: "invalid-email", password: "short" };

      await userController.createUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Validation error",
        details: expect.any(Array),
      });
    });

    it("should use JWT_SECRET from environment variables", async () => {
      process.env.JWT_SECRET = "test-secret";
      const mockUser = {
        id: "mockUserId",
        name: "Test User",
        email: "test@example.com",
      };
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      await userController.createUser(req as Request, res as Response);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "mockUserId" },
        "test-secret",
        { expiresIn: "1h" },
      );
    });

    it("should handle Redis operation failures", async () => {
      const mockUser = {
        id: "mockUserId",
        name: "Test User",
        email: "test@example.com",
      };
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("mockToken");
      (redisClient.hmset as jest.Mock).mockRejectedValue(
        new Error("Redis error"),
      );

      await userController.createUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Error creating user" });
    });
    it("should handle general errors", async () => {
      const mockError = new Error("Database error");
      (User.findOne as jest.Mock).mockRejectedValue(mockError);

      await userController.createUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Error creating user" });
    });

    it("should convert email to lowercase", async () => {
      req.body.email = "Test@Example.com";
      const mockUser = {
        id: "mockUserId",
        name: "Test User",
        email: "test@example.com",
      };
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("mockToken");
      (redisClient.hmset as jest.Mock).mockResolvedValue("OK");
      (redisClient.zadd as jest.Mock).mockResolvedValue(1);

      await userController.createUser(req as Request, res as Response);

      expect(User.create).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });
  });
  describe("loginUser", () => {
    it("should log in a user successfully", async () => {
      const user = {
        _id: "1",
        name: "Test User",
        email: "test@example.com",
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      (User.findOne as jest.Mock).mockResolvedValue(user);
      req.body = { email: "test@example.com", password: "password" };

      await userController.loginUser(req as Request, res as Response);
      console.log("User _id:", user._id);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(user.comparePassword).toHaveBeenCalledWith("password");

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        user: { id: user._id, name: user.name, email: user.email },
        token: "mockToken",
      });
    });

    it("should handle invalid email or password", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      req.body = { email: "test@example.com", password: "password" };

      await userController.loginUser(req as Request, res as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Invalid email or password",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      (User.findOne as jest.Mock).mockRejectedValue(error);
      req.body = { email: "test@example.com", password: "password" };

      await userController.loginUser(req as Request, res as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user successfully", async () => {
      const userId = "1";
      req.params = { id: userId };

      (User.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: userId });
      (redisClient.zrem as jest.Mock).mockResolvedValue(1);

      await userController.deleteUser(req as Request, res as Response);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(redisClient.zrem).toHaveBeenCalledWith("leaderboard", userId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should handle user not found", async () => {
      const userId = "1";
      req.params = { id: userId };

      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await userController.deleteUser(req as Request, res as Response);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should handle errors", async () => {
      const error = new Error("Redis error");
      (redisClient.zrem as jest.Mock).mockRejectedValue(error);
      req.user = { id: "1" };

      await userController.deleteUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Error deleting user" });
    });
  });

  describe("updateUser", () => {
    beforeEach(() => {
      req = {
        params: { id: "1" },
        body: { points: 15 },
      } as unknown as Request;
    });

    test("should update a user successfully", async () => {
      const mockUser = {
        _id: "1",
        points: 10,
        save: jest.fn(),
        populate: jest.fn().mockReturnThis(),
      };
      (User.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      });

      await userController.updateUser(req as Request, res as Response);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.points).toBe(25); // 10 (initial) + 15 (added)
      expect(redisClient.zadd).toHaveBeenCalledWith("leaderboard", "25", "1");
      expect(broadcastLeaderboardUpdate).toHaveBeenCalled();
      expect(checkAndAwardBadges).toHaveBeenCalledWith(mockUser);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUser);
    });

    test("should handle user not found", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await userController.updateUser(req as Request, res as Response);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should handle errors", async () => {
      const mockError = new Error("Database error");
      (User.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError),
      });

      await userController.updateUser(req as Request, res as Response);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("getLeaderboard", () => {
    it("should retrieve the leaderboard successfully", async () => {
      const rawLeaderboard = ["1", "10", "2", "20"];
      (redisClient.zrevrange as jest.Mock).mockResolvedValue(rawLeaderboard);
      (redisClient.hgetall as jest.Mock)
        .mockResolvedValueOnce({
          name: "Test User 1",
          email: "test1@example.com",
        })
        .mockResolvedValueOnce({
          name: "Test User 2",
          email: "test2@example.com",
        });

      await userController.getLeaderboard(req as Request, res as Response);

      expect(redisClient.zrevrange).toHaveBeenCalledWith(
        "leaderboard",
        0,
        9,
        "WITHSCORES",
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith([
        {
          userId: "1",
          name: "Test User 1",
          email: "test1@example.com",
          score: 10,
        },
        {
          userId: "2",
          name: "Test User 2",
          email: "test2@example.com",
          score: 20,
        },
      ]);
    });

    it("should handle errors", async () => {
      const error = new Error("Redis error");
      (redisClient.zrevrange as jest.Mock).mockRejectedValue(error);

      await userController.getLeaderboard(req as Request, res as Response);

      expect(redisClient.zrevrange).toHaveBeenCalledWith(
        "leaderboard",
        0,
        9,
        "WITHSCORES",
      );
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error retrieving leaderboard",
      });
    });
  });
});
