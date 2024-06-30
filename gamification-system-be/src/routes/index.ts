import { Application } from "express";
import userRoutes from "./Apis/userRoutes";
import leaderboardRoutes from "./Apis/leaderboardRoutes";
import achievementRoutes from "./Apis/achievementRoutes";
import badgeRoutes from "./Apis/badgeRoutes";

const registerRoutes = (app: Application): void => {
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/leaderboard", leaderboardRoutes);
  app.use("/api/v1/achievement", achievementRoutes);
  app.use("/api/v1/badge", badgeRoutes);
};

export default registerRoutes;
