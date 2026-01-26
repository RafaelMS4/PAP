import express from 'express';
import authRoutes from './auth.js';
import usersRoutes from './users.js';
import equipmentRoutes from './equipment.js';
import ticketRoutes from './tickets.js';
import dashboardRoutes from './dashboard.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/tickets', ticketRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
