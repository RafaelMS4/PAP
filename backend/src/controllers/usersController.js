import bcrypt from 'bcryptjs';
import { dbGet, dbAll, dbRun } from '../config/database.js';

const EMAIL_DOMAIN = 'helpdesk.pt';

const normalizeHelpdeskEmail = (emailValue) => {
  if (typeof emailValue !== 'string') {
    return null;
  }

  const cleanedEmail = emailValue.trim().toLowerCase();
  if (!cleanedEmail) {
    return null;
  }

  const emailParts = cleanedEmail.split('@');

  if (emailParts.length === 1) {
    const localPart = emailParts[0];
    if (!localPart) {
      return null;
    }
    return `${localPart}@${EMAIL_DOMAIN}`;
  }

  if (emailParts.length !== 2) {
    return null;
  }

  const [localPart, domainPart] = emailParts;

  if (!localPart || domainPart !== EMAIL_DOMAIN) {
    return null;
  }

  return `${localPart}@${EMAIL_DOMAIN}`;
};

export const getUsers = async (req, res) => {
  try {
    const { role, search, name, limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    let sql = 'SELECT id, name, email, role, created_at FROM users WHERE deleted_at IS NULL';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    const searchValue = search || name;
    if (searchValue) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      const searchPattern = `%${searchValue}%`;
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
    if (searchValue) {
      countSql += ' AND (name LIKE ? OR email LIKE ?)';
      const searchPattern = `%${searchValue}%`;
      countParams.push(searchPattern, searchPattern);
    }

    const countResult = await dbGet(countSql, countParams);
    const total = countResult.count;

    res.json({
      users,
      total,
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
    const { name, username, password, email, role } = req.body;
    const userName = username || name;
    const normalizedEmail = normalizeHelpdeskEmail(email);

    if (!name || !password || !email) {
      return res.status(400).json({ error: 'Name, password, and email required' });
    }

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email inválido. Usa apenas @helpdesk.pt' });
    }

    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await dbRun(
      'INSERT INTO users (name, username, password, email, role) VALUES (?, ?, ?, ?, ?)',
      [name, userName, hashedPassword, normalizedEmail, role || 'user']
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.lastID,
        name,
        email: normalizedEmail,
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
    const user = await dbGet('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
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
    const { name, username, email, role } = req.body;

    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      const normalizedEmail = normalizeHelpdeskEmail(email);
      if (!normalizedEmail) {
        return res.status(400).json({ error: 'Email inválido. Usa apenas @helpdesk.pt' });
      }

      const duplicateEmailUser = await dbGet(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [normalizedEmail, id]
      );

      if (duplicateEmailUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      updates.push('email = ?');
      values.push(normalizedEmail);
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
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
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
      'SELECT id, name, email, role, created_at FROM users WHERE role = "admin" ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limitNum, offsetNum]
    );

    const countResult = await dbGet('SELECT COUNT(*) as count FROM users WHERE role = "admin"');

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
