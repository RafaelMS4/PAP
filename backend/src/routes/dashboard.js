import express from 'express';
import { getDashboardStats, getTicketStats, getAdminWorkload } from '../controllers/dashboardController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns dashboard stats for admin (system-wide) or user (personal)
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', verifyToken, getDashboardStats);

/**
 * @swagger
 * /dashboard/ticket-stats:
 *   get:
 *     summary: Get ticket statistics
 *     description: Returns ticket counts by priority and status
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/ticket-stats', verifyToken, getTicketStats);

/**
 * @swagger
 * /dashboard/admin-workload:
 *   get:
 *     summary: Get admin workload
 *     description: Returns workload statistics for each admin (admin only)
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin workload retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/admin-workload', verifyToken, isAdmin, getAdminWorkload);

export default router;
