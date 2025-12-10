import express from 'express';
import { login, getCurrentUser, getUsers, createUser } from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', verifyToken, getCurrentUser);
router.get('/users', verifyToken, isAdmin, getUsers);
router.post('/users', verifyToken, isAdmin, createUser);

export default router;
