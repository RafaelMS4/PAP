import express from 'express';
import { creatEquipment, getEquipment, getEquipmentById } from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /equipment/equipment:
 *   post:
 *     summary: Create new equipment
 *     description: Creates a new equipment entry in the system
 *     tags:
 *       - Equipment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEquipmentRequest'
 *     responses:
 *       201:
 *         description: Equipment created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all equipment
 *     description: Retrieves a list of all equipment (admin only)
 *     tags:
 *       - Equipment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Equipment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/equipment', verifyToken, isAdmin, creatEquipment);
router.get('/equipment', verifyToken, isAdmin, getEquipment);

/**
 * @swagger
 * /equipment/equipment/{id}:
 *   get:
 *     summary: Get equipment by ID
 *     description: Retrieves equipment information by its ID (admin only)
 *     tags:
 *       - Equipment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment retrieved successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Equipment not found
 *       500:
 *         description: Server error
 */
router.get('/equipment/:id', verifyToken, isAdmin, getEquipmentById);

export default router;