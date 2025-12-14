import bcrypt from 'bcryptjs';
import { dbGet, dbAll, dbRun } from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const users = await dbAll('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email required' });
    }

    const existingUser = await dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await dbRun(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, role || 'user']
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.id,
        username,
        email,
        role: role || 'user'
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbRun('DELETE FROM users WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};