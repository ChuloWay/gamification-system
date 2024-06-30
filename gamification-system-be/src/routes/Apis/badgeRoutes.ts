import { Router } from "express";
import {
  createBadge,
  getBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
} from "../../controllers/badgeController";
import isAuthenticated from "../../middlewares/isAuthenticated";

/**
 * Router for badge-related endpoints.
 * Routes:
 *   POST /badge: Create a new badge.
 *   GET /badge: Get all badges.
 *   GET /badge/:id: Get a badge by ID.
 *   PUT /badge/:id: Update a badge by ID.
 *   DELETE /badge/:id: Delete a badge by ID.
 */
const router = Router();

/**
 * Create a new badge.
 * @route POST /badge
 * @group Badge
 * @param {CreateBadgeRequest} request.body.required - The badge data.
 * @returns {Badge} 201 - The created badge.
 * @returns {Error} 400 - Bad request.
 * @returns {Error} 500 - Internal server error.
 */
router.post("/", createBadge);

/**
 * Get all badges.
 * @route GET /badge
 * @group Badge
 * @returns {Array.<Badge>} 200 - The badges.
 * @returns {Error} 500 - Internal server error.
 */
router.get("/", getBadges);

/**
 * Get a badge by ID.
 * @route GET /badge/{id}
 * @group Badge
 * @param {string} id.path.required - The badge ID.
 * @returns {Badge} 200 - The badge.
 * @returns {Error} 404 - Badge not found.
 * @returns {Error} 500 - Internal server error.
 */
router.get("/:id", getBadgeById);

/**
 * Update a badge by ID.
 * @route PUT /badge/{id}
 * @group Badge
 * @param {string} id.path.required - The badge ID.
 * @param {UpdateBadgeRequest} request.body.required - The updated badge data.
 * @returns {Badge} 200 - The updated badge.
 * @returns {Error} 400 - Bad request.
 * @returns {Error} 404 - Badge not found.
 * @returns {Error} 500 - Internal server error.
 */
router.put("/:id", updateBadge);

/**
 * Delete a badge by ID.
 * @route DELETE /badge/{id}
 * @group Badge
 * @param {string} id.path.required - The badge ID.
 * @returns {string} 200 - The badge ID.
 * @returns {Error} 404 - Badge not found.
 * @returns {Error} 500 - Internal server error.
 */
router.delete("/:id", deleteBadge);

export default router;
