const { Router } = require("express");
const recordsController = require("../controllers/records.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/rbac");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Financial Records
 *   description: Create, read, update, delete records
 */

router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List financial records
 *     description: Viewers see only their own. Analysts & Admins see all. Supports filter/pagination.
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of records
 */
router.get("/", recordsController.listRecords);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get single record by ID
 *     tags: [Financial Records]
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
 *         description: Single record
 *       403:
 *         description: Viewer attempting to access someone else's record
 *       404:
 *         description: Record not found
 */
router.get("/:id", recordsController.getRecord);

// ── Admin Only ────────────────────────────────────────────────────────────────

router.use(authorize("ADMIN"));

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a new financial record
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created
 */
router.post("/", recordsController.createRecord);

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     summary: Update an existing record
 *     tags: [Financial Records]
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
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 */
router.patch("/:id", recordsController.updateRecord);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a record
 *     tags: [Financial Records]
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
 *         description: Record deleted
 */
router.delete("/:id", recordsController.deleteRecord);

module.exports = router;
