const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/rbac");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics and summary metrics
 */

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get high-level totals (income, expenses, balance)
 *     description: Viewers get summary of their own data, Analysts/Admins get system-wide summary.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary totals
 */
router.get("/summary", dashboardController.getSummary);

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get latest recent activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent records
 */
router.get("/recent", dashboardController.getRecentActivity);

// ── Analyst+ Insights ─────────────────────────────────────────────────────────

router.use(authorize("ANALYST"));

/**
 * @swagger
 * /api/dashboard/categories:
 *   get:
 *     summary: Category-wise breakdown (Analyst+)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category aggregations
 */
router.get("/categories", dashboardController.getCategoryBreakdown);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Monthly/Weekly rolling trends (Analyst+)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, weekly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Trends data over time
 */
router.get("/trends", dashboardController.getTrends);

/**
 * @swagger
 * /api/dashboard/ratio:
 *   get:
 *     summary: Get overarching expense to income ratio (Analyst+)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ratio metrics
 */
router.get("/ratio", dashboardController.getExpenseRatio);

module.exports = router;
