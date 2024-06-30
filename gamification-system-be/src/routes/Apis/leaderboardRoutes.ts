import { Router } from "express";
import * as userController from "../../controllers/userController";
import isAuthenticated from "../../middlewares/isAuthenticated";
import { Request, Response } from "express";

/**
 * Leaderboard API routes.
 */
const router = Router();

/**
 * Apply the `isAuthenticated` middleware to all routes.
 */
// router.use(isAuthenticated);

/**
 * GET /users/leaderboard
 * Retrieves the leaderboard.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */

router.get("/", (req: Request, res: Response) => {
  userController.getLeaderboard(req, res);
});

export default router;
