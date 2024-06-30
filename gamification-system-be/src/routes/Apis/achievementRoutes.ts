import { Router } from "express";
import {
  createAchievement,
  getAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  addAchievementToUser,
} from "../../controllers/achievementController";
import isAuthenticated from "../../middlewares/isAuthenticated";

/**
 * Routes for achievement-related endpoints.
 */
const router = Router();

/**
 * Apply the `isAuthenticated` middleware to all routes.
 */
router.use(isAuthenticated);

/**
 * POST /achievement
 * Create a new achievement.
 *
 * @param {Request} request - The request object.
 * @param {Response} response - The response object.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */
router.post("/", createAchievement);

/**
 * GET /achievement
 * Get all achievements.
 *
 * @param {Request} request - The request object.
 * @param {Response} response - The response object.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */
router.get("/", getAchievements);

/**
 * GET /achievement/:id
 * Get a single achievement by ID.
 *
 * @param {Request} request - The request object.
 * @param {Response} response - The response object.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */
router.get("/:id", getAchievementById);

/**
 * PUT /achievement/:id
 * Update a single achievement by ID.
 *
 * @param {Request} request - The request object.
 * @param {Response} response - The response object.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */
router.put("/:id", updateAchievement);

/**
 * DELETE /achievement/:id
 * Delete a single achievement by ID.
 *
 * @param {Request} request - The request object.
 * @param {Response} response - The response object.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */
router.delete("/:id", deleteAchievement);

/**
 * POST /achievement/achievementToUser
 * Add an achievement to a user's achievements list.
 *
 * @param {Request} request - The request object.
 * @param {Response} response - The response object.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */
router.post("/achievementToUser", addAchievementToUser);

export default router;
