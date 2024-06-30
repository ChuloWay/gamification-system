import redisClient from "../redisClient";
import { io } from "../server";
import { logger } from "./logger";

export const sendLeaderboardUpdate = async (socket: any) => {
  try {
    const leaderboardData = await redisClient.zrevrange(
      "leaderboard",
      0,
      9,
      "WITHSCORES",
    );

    const leaderboard: Array<{
      userId: string;
      name: string;
      email: string;
      score: number;
    }> = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const userId = leaderboardData[i] as string;
      const score = parseInt(leaderboardData[i + 1] as string, 10);
      const userDetails = await redisClient.hgetall(`user:${userId}`);

      if (userDetails) {
        const { name, email } = userDetails;
        leaderboard.push({ userId, name, email, score });
      } else {
        leaderboard.push({ userId, name: "Unknown", email: "Unknown", score });
      }
    }

    socket.emit("leaderboardUpdate", leaderboard);
  } catch (error) {
    logger.error("Error retrieving leaderboard:", error);
  }
};

// Function to broadcast leaderboard updates to all connected clients
export const broadcastLeaderboardUpdate = async () => {
  try {
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

    io.emit("leaderboardUpdate", leaderboard);
  } catch (error) {
    logger.error("Error retrieving leaderboard:", error);
  }
};
