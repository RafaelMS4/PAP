import express from 'express';
import { creatEquipment, getEquipment, getEquipmentById, deleteEquipment } from '../controllers/equipmentController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /equipment/createEquipment:
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
 */
router.post('/createEquipment', verifyToken, isAdmin, creatEquipment);

/**
 * @swagger
 * /equipment/getEquipment:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/getEquipment', verifyToken, isAdmin, getEquipment);

/**
 * @swagger
 * /equipment/getEquipmentID/{id}:
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Equipment not found
 *       500:
 *         description: Server error
 */
router.get('/getEquipmentID/:id', verifyToken, isAdmin, getEquipmentById);

/**
 * @swagger
 * /equipment/deleteEquipment/{id}:
 *   delete:
 *     summary: Delete equipment by ID
 *     description: Deletes equipment from the system by its ID (admin only)
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
 *           description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Equipment not found
 *       500:
 *         description: Server error
 */
router.delete('/deleteEquipment/:id', verifyToken, isAdmin, deleteEquipment);

export default router;
