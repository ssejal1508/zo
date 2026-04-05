const { Router } = require("express");
const usersController = require("../controllers/users.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/rbac");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */

router.use(authenticate);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile info
 */
router.get("/me", usersController.getMe);

// ── Admin Only Routes ────────────────────────────────────────────────────────

router.use(authorize("ADMIN"));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/", usersController.listUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user details by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get("/:id", usersController.getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user role/status (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [VIEWER, ANALYST, ADMIN]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch("/:id", usersController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.delete("/:id", usersController.deactivateUser);

module.exports = router;
