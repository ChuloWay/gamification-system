import express, { Application } from "express";
import { createServer, Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import redisClient from "./redisClient";
import { createConnection } from "./shared/dbConfig";
import registerRoutes from "./routes";
import envs from "./shared/envs";
import requestLogger from "./middlewares/requestLogger";
import Achievement from "./models/achievementModel";
import Badge from "./models/badgeModel";
import { logger } from "./shared/logger";
import { sendLeaderboardUpdate } from "./shared/socket";

// Initialize the express application
const app: Application = express();
const server: HTTPServer = createServer(app);
const io: SocketIOServer = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Emit initial leaderboard data
  sendLeaderboardUpdate(socket);

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(express.json());
app.use(requestLogger);

// Configure CORS
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  optionsSuccessStatus: 200,
  methods: "GET, PUT, POST, DELETE",
};
app.use(cors(corsOptions));

// Register Routes
registerRoutes(app);

// Register models with Mongoose
mongoose.model("Achievement", Achievement.schema);
mongoose.model("Badge", Badge.schema);

// Establish MongoDB connection
createConnection(envs.database.url)
  .then(() => {
    console.log("Connected to MongoDB");
    console.log("Registered models:", mongoose.modelNames());
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Connect to Redis
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});
redisClient.on("error", (err: any) => {
  console.error("Redis error:", err);
});

// Socket.io setup
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
const PORT: number = parseInt(envs.port || "5000", 10);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { server, io };
export default app;
