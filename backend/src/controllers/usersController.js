import bcrypt from 'bcryptjs';
import { dbGet, dbAll, dbRun } from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    let sql = 'SELECT id, username, email, role, created_at FROM users WHERE deleted_at IS NULL';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      sql += ' AND (username LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offsetNum);

    const users = await dbAll(sql, params);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL';
    const countParams = [];
    if (role) {
      countSql += ' AND role = ?';
      countParams.push(role);
    }
    if (search) {
      countSql += ' AND (username LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }

    const countResult = await dbGet(countSql, countParams);
    const total = countResult.count;

    res.json({ 
      users,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
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
        id: result.lastID,
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
    const user = await dbGet('SELECT id, username, email, role, created_at FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
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
    
    // Soft delete - mark as deleted but keep data
    const result = await dbRun('UPDATE users SET deleted_at = datetime("now") WHERE id = ? AND deleted_at IS NULL', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found or already deleted' });
    }
    res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    await dbRun(sql, values);

    const updatedUser = await dbGet(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    const admins = await dbAll(
      'SELECT id, username, email, role, created_at FROM users WHERE role = "admin" AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limitNum, offsetNum]
    );

    const countResult = await dbGet('SELECT COUNT(*) as count FROM users WHERE role = "admin" AND deleted_at IS NULL');

    res.json({
      admins,
      pagination: {
        total: countResult.count,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(countResult.count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
