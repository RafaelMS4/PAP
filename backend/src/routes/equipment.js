import express from 'express';
import { creatEquipment, getEquipment, getEquipmentById, deleteEquipment, getUserEquipment, updateEquipment, getEquipmentByType, assignEquipmentToUser, unassignEquipment, getEquipmentHistory } from '../controllers/equipmentController.js';
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
 * /equipment/getUserEquipment/{id}:
 *   get:
 *     summary: Get equipment assigned to a user
 *     description: Retrieves a list of equipment assigned to a specific user
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
 *           description: User ID
 *     responses:
 *       200:
 *         description: Equipment from user retrieved successfully
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
router.get('/getUserEquipment/:id', verifyToken, getUserEquipment);

/**
 * @swagger
 * /equipment/updateEquipment/{id}:
 *   put:
 *     summary: Update equipment by ID
 *     description: Updates equipment information by its ID (admin only)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEquipmentRequest'
 *     responses:
 *       200:
 *         description: Equipment updated successfully
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
router.put('/updateEquipment/:id', verifyToken, isAdmin, updateEquipment);

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

/**
 * @swagger
 * /equipment/type/{type}:
 *   get:
 *     summary: Get equipment by type
 *     description: Retrieves all equipment of a specific type with optional filtering
 *     tags:
 *       - Equipment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Equipment by type retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/type/:type', verifyToken, getEquipmentByType);

/**
 * @swagger
 * /equipment/{equipmentId}/assign:
 *   put:
 *     summary: Assign equipment to user
 *     description: Assigns equipment to a specific user (admin only)
 *     tags:
 *       - Equipment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equipmentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Equipment assigned successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Equipment or user not found
 */
router.put('/:equipmentId/assign', verifyToken, isAdmin, assignEquipmentToUser);

/**
 * @swagger
 * /equipment/{equipmentId}/unassign:
 *   put:
 *     summary: Unassign equipment from user
 *     description: Removes equipment assignment from user (admin only)
 *     tags:
 *       - Equipment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equipmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment unassigned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Equipment not found
 */
router.put('/:equipmentId/unassign', verifyToken, isAdmin, unassignEquipment);

/**
 * @swagger
 * /equipment/{id}/history:
 *   get:
 *     summary: Get equipment history
 *     description: Retrieves the history of changes for a specific equipment
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
 *         description: Equipment history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Equipment not found
 */
router.get('/:id/history', verifyToken, getEquipmentHistory);

export default router;
