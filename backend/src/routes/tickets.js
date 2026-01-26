import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  assignTicket,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  closeTicket,
  getTicketHistory,
  addTimeLog,
  getTimeLogs,
  updateTimeLog,
  deleteTimeLog,
  getAdminHours,
  addAttachment,
  getAttachments,
  deleteAttachment,
  addEquipmentToTicket,
  getTicketEquipment,
  removeEquipmentFromTicket,
  getMyTickets,
  getAdminQueue,
  updateTicketPriority,
  updateTicketStatus,
  downloadAttachment,
} from '../controllers/ticketsController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const router = express.Router();

// Middleware to check ticket access
const checkTicketAccess = async (req, res, next) => {
  const { id } = req.params;
  const { dbGet } = await import('../config/database.js');
  const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
  
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket não encontrado' });
  }
  
  // Admin can access all, users can only access their own
  if (req.userRole !== 'admin' && ticket.user_id !== req.userId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  next();
};

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create new ticket
 *     description: Creates a new ticket entry in the system
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketRequest'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', verifyToken, createTicket);

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get all tickets
 *     description: Gets tickets - all for admins, only own for users
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, waiting, resolved, closed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', verifyToken, getAllTickets);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     description: Gets ticket information by its ID
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', verifyToken, checkTicketAccess, getTicketById);

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update ticket
 *     description: Updates ticket information (admins only)
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTicketRequest'
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admins only
 *       500:
 *         description: Internal server error
 */
router.put('/:id', verifyToken, isAdmin, updateTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete ticket
 *     description: Deletes a ticket (admins only)
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admins only
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', verifyToken, isAdmin, deleteTicket);

/**
 * @swagger
 * /tickets/{id}/assign:
 *   put:
 *     summary: Assign ticket to technician
 *     description: Assigns a ticket to a technician (admins only)
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               assigned_to:
 *                 type: integer
 *                 description: User ID to assign to (optional, defaults to current admin)
 *               category:
 *                 type: string
 *             required:
 *               - assigned_to
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admins only
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/assign', verifyToken, isAdmin, assignTicket);

/**
 * @swagger
 * /tickets/{id}/comments:
 *   post:
 *     summary: Add comment to ticket
 *     description: Adds a comment or message to a ticket
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               message:
 *                 type: string
 *               comment_type:
 *                 type: string
 *                 enum: [comment, task, internal_note, solution]
 *                 description: Type of comment (task and solution for admins only)
 *               is_internal:
 *                 type: boolean
 *             required:
 *               - message
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/comments', verifyToken, checkTicketAccess, addComment);

/**
 * @swagger
 * /tickets/{id}/comments:
 *   get:
 *     summary: Get all comments for a ticket
 *     description: Gets all comments and messages for a ticket
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/comments', verifyToken, checkTicketAccess, getComments);

/**
 * @swagger
 * /tickets/{id}/comments/{commentId}:
 *   put:
 *     summary: Update comment
 *     description: Updates a comment (own comments only)
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: commentId
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
 *               message:
 *                 type: string
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Can only edit own comments
 *       404:
 *         description: Comment or ticket not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/comments/:commentId', verifyToken, checkTicketAccess, updateComment);

/**
 * @swagger
 * /tickets/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete comment
 *     description: Deletes a comment (owner or admins only)
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Comment or ticket not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/comments/:commentId', verifyToken, checkTicketAccess, deleteComment);

/**
 * @swagger
 * /tickets/{id}/close:
 *   post:
 *     summary: Close ticket with solution
 *     description: Closes a ticket and marks it as resolved (admins only)
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               solution_message:
 *                 type: string
 *             required:
 *               - solution_message
 *     responses:
 *       200:
 *         description: Ticket closed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admins only
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/close', verifyToken, isAdmin, closeTicket);

/**
 * @swagger
 * /tickets/{id}/history:
 *   get:
 *     summary: Get ticket history
 *     description: Gets the change history for a ticket
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: History retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/history', verifyToken, checkTicketAccess, getTicketHistory);

/**
 * @swagger
 * /tickets/{id}/time-logs:
 *   post:
 *     summary: Add time log to ticket
 *     description: Logs time spent on a ticket
 *     tags:
 *       - TimeLogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               time_spent:
 *                 type: integer
 *                 description: Time spent in minutes
 *               description:
 *                 type: string
 *             required:
 *               - time_spent
 *     responses:
 *       201:
 *         description: Time log added successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admins only
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/time-logs', verifyToken, isAdmin, addTimeLog);

/**
 * @swagger
 * /tickets/{id}/time-logs:
 *   get:
 *     summary: Get all time logs for a ticket
 *     description: Gets all time logs for a ticket
 *     tags:
 *       - TimeLogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Time logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/time-logs', verifyToken, checkTicketAccess, getTimeLogs);

/**
 * @swagger
 * /tickets/{id}/time-logs/{logId}:
 *   put:
 *     summary: Update time log
 *     description: Updates a time log entry
 *     tags:
 *       - TimeLogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: logId
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
 *               time_spent:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Time log updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admins only
 *       404:
 *         description: Time log or ticket not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/time-logs/:logId', verifyToken, isAdmin, updateTimeLog);

/**
 * @swagger
 * /tickets/{id}/time-logs/{logId}:
 *   delete:
 *     summary: Delete time log
 *     description: Deletes a time log entry
 *     tags:
 *       - TimeLogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Time log deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admins only
 *       404:
 *         description: Time log or ticket not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/time-logs/:logId', verifyToken, isAdmin, deleteTimeLog);

/**
 * @swagger
 * /tickets/stats/admin-hours:
 *   get:
 *     summary: Get admin hours statistics
 *     description: Gets total hours logged by each admin
 *     tags:
 *       - Statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admins only
 *       500:
 *         description: Internal server error
 */
router.get('/stats/admin-hours', verifyToken, isAdmin, getAdminHours);

/**
 * @swagger
 * /tickets/{id}/attachments:
 *   post:
 *     summary: Add attachment to ticket
 *     description: Adds a file attachment to a ticket
 *     tags:
 *       - Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - file
 *     responses:
 *       201:
 *         description: Attachment added successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/attachments', verifyToken, checkTicketAccess, upload.single('file'), addAttachment);

/**
 * @swagger
 * /tickets/{id}/attachments:
 *   get:
 *     summary: Get all attachments for a ticket
 *     description: Gets all file attachments for a ticket
 *     tags:
 *       - Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attachments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/attachments', verifyToken, checkTicketAccess, getAttachments);

/**
 * @swagger
 * /tickets/{id}/attachments/{attachmentId}:
 *   delete:
 *     summary: Delete attachment
 *     description: Deletes a file attachment (owner or admins only)
 *     tags:
 *       - Attachments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Attachment or ticket not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/attachments/:attachmentId', verifyToken, checkTicketAccess, deleteAttachment);

// ============ EQUIPMENT ASSOCIATION ENDPOINTS ============

/**
 * @swagger
 * /tickets/{id}/equipment:
 *   post:
 *     summary: Associate equipment to a ticket
 *     description: Links an equipment item to a ticket for tracking purposes
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equipment_id
 *             properties:
 *               equipment_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Equipment associated successfully
 *       400:
 *         description: Equipment already associated or invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket or equipment not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/equipment', verifyToken, checkTicketAccess, addEquipmentToTicket);

/**
 * @swagger
 * /tickets/{id}/equipment:
 *   get:
 *     summary: Get all equipment for a ticket
 *     description: Retrieves all equipment items associated with a ticket
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
 *     responses:
 *       200:
 *         description: Equipment list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/equipment', verifyToken, checkTicketAccess, getTicketEquipment);

/**
 * @swagger
 * /tickets/{id}/equipment/{equipmentId}:
 *   delete:
 *     summary: Remove equipment from a ticket
 *     description: Unlinks an equipment item from a ticket
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
 *       - in: path
 *         name: equipmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Association not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/equipment/:equipmentId', verifyToken, checkTicketAccess, removeEquipmentFromTicket);

// My Tickets - Get tickets created by the current user
router.get('/my/tickets', verifyToken, getMyTickets);

// Admin Queue - Get unassigned tickets (admin only)
router.get('/admin/queue', verifyToken, isAdmin, getAdminQueue);

// Update ticket priority
router.put('/:id/priority', verifyToken, isAdmin, updateTicketPriority);

// Update ticket status
router.put('/:id/status', verifyToken, isAdmin, updateTicketStatus);

// Download attachment
router.get('/attachments/:attachmentId/download', verifyToken, downloadAttachment);

export default router;