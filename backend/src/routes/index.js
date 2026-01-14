import express from 'express';
import authRoutes from './auth.js';
import usersRoutes from './users.js';
import equipmentRoutes from './equipment.js';
import ticketRoutes from './tickets.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/tickets', ticketRoutes);

export default router;
