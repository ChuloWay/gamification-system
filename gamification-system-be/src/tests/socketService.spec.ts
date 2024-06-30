import redisClient from "../redisClient";
import { io } from "../server";
import { logger } from "../shared/logger";
import {
  sendLeaderboardUpdate,
  broadcastLeaderboardUpdate,
} from "../shared/socket";

jest.mock("../redisClient");
jest.mock("../server", () => ({
  io: {
    emit: jest.fn(),
  },
}));
jest.mock("../shared/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("Leaderboard Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendLeaderboardUpdate", () => {
    it("should send leaderboard update to a socket", async () => {
      const mockSocket = {
        emit: jest.fn(),
      };

      const mockLeaderboardData = ["user1", "100", "user2", "90"];
      const mockUserData: {
        [key: string]: { name: string; email: string };
      } = {
        user1: { name: "User One", email: "user1@example.com" },
        user2: { name: "User Two", email: "user2@example.com" },
      };
      (redisClient.zrevrange as jest.Mock).mockResolvedValue(
        mockLeaderboardData,
      );
      (redisClient.hgetall as jest.Mock).mockImplementation((key) => {
        const userId = key.split(":")[1];
        return Promise.resolve(
          mockUserData[userId as keyof typeof mockUserData],
        );
      });

      await sendLeaderboardUpdate(mockSocket);

      expect(redisClient.zrevrange).toHaveBeenCalledWith(
        "leaderboard",
        0,
        9,
        "WITHSCORES",
      );
      expect(redisClient.hgetall).toHaveBeenCalledTimes(2);
      expect(mockSocket.emit).toHaveBeenCalledWith("leaderboardUpdate", [
        {
          userId: "user1",
          name: "User One",
          email: "user1@example.com",
          score: 100,
        },
        {
          userId: "user2",
          name: "User Two",
          email: "user2@example.com",
          score: 90,
        },
      ]);
    });

    it("should handle errors when retrieving leaderboard", async () => {
      const mockSocket = {
        emit: jest.fn(),
      };

      (redisClient.zrevrange as jest.Mock).mockRejectedValue(
        new Error("Redis error"),
      );

      await sendLeaderboardUpdate(mockSocket);

      expect(logger.error).toHaveBeenCalledWith(
        "Error retrieving leaderboard:",
        expect.any(Error),
      );
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe("broadcastLeaderboardUpdate", () => {
    it("should broadcast leaderboard update to all clients", async () => {
      const mockLeaderboardData = ["user1", "100", "user2", "90"];
      const mockUserData: {
        [key: string]: { name: string; email: string };
      } = {
        user1: { name: "User One", email: "user1@example.com" },
        user2: { name: "User Two", email: "user2@example.com" },
      };
      (redisClient.zrevrange as jest.Mock).mockResolvedValue(
        mockLeaderboardData,
      );
      (redisClient.hgetall as jest.Mock).mockImplementation((key) => {
        const userId = key.split(":")[1];
        return Promise.resolve(
          mockUserData[userId as keyof typeof mockUserData],
        );
      });

      await broadcastLeaderboardUpdate();

      expect(redisClient.zrevrange).toHaveBeenCalledWith(
        "leaderboard",
        0,
        9,
        "WITHSCORES",
      );
      expect(redisClient.hgetall).toHaveBeenCalledTimes(2);
      expect(io.emit).toHaveBeenCalledWith("leaderboardUpdate", [
        {
          userId: "user1",
          name: "User One",
          email: "user1@example.com",
          score: 100,
        },
        {
          userId: "user2",
          name: "User Two",
          email: "user2@example.com",
          score: 90,
        },
      ]);
    });

    it("should handle missing user data", async () => {
      const mockLeaderboardData = ["user1", "100", "user2", "90"];

      (redisClient.zrevrange as jest.Mock).mockResolvedValue(
        mockLeaderboardData,
      );
      (redisClient.hgetall as jest.Mock).mockResolvedValue(null);

      await broadcastLeaderboardUpdate();

      expect(redisClient.zrevrange).toHaveBeenCalledWith(
        "leaderboard",
        0,
        9,
        "WITHSCORES",
      );
      expect(redisClient.hgetall).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(io.emit).toHaveBeenCalledWith("leaderboardUpdate", [
        { userId: "user1", name: "Unknown", email: "Unknown", score: 100 },
        { userId: "user2", name: "Unknown", email: "Unknown", score: 90 },
      ]);
    });

    it("should handle errors when retrieving leaderboard", async () => {
      (redisClient.zrevrange as jest.Mock).mockRejectedValue(
        new Error("Redis error"),
      );

      await broadcastLeaderboardUpdate();

      expect(logger.error).toHaveBeenCalledWith(
        "Error retrieving leaderboard:",
        expect.any(Error),
      );
      expect(io.emit).not.toHaveBeenCalled();
    });
  });
});
