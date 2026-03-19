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

    let sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        (SELECT COUNT(*) FROM tickets t WHERE t.user_id = u.id) AS ticket_count
      FROM users u
      WHERE u.deleted_at IS NULL
    `;
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

    if (!name || !password) {
      return res.status(400).json({ error: 'Nome e palavra-passe são obrigatórios' });
    }

    if (!email && !username) {
      return res.status(400).json({ error: 'Email ou username são obrigatórios' });
    }

    // Check username uniqueness if provided
    if (username) {
      const existingUsername = await dbGet('SELECT id FROM users WHERE username = ?', [username]);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username já existe. Escolha um username diferente.' });
      }
    }

    // Handle email normalization
    let finalEmail = null;
    if (email) {
      const normalizedEmail = normalizeHelpdeskEmail(email);
      if (!normalizedEmail) {
        return res.status(400).json({ error: 'Email inválido. Use apenas emails @helpdesk.pt ou forneça apenas o username.' });
      }
      
      const existingEmail = await dbGet('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email já está registado. Use um email diferente.' });
      }
      
      finalEmail = normalizedEmail;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await dbRun(
      'INSERT INTO users (name, username, password, email, role) VALUES (?, ?, ?, ?, ?)',
      [name, userName, hashedPassword, finalEmail, role || 'user']
    );

    res.status(201).json({
      message: 'Utilizador criado com sucesso',
      user: {
        id: result.lastID,
        name,
        email: finalEmail,
        username: userName,
        role: role || 'user'
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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
    const userId = req.userId;

    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];
    const historyLogs = [];

    if (name !== undefined && name !== user.name) {
      updates.push('name = ?');
      values.push(name);
      historyLogs.push({
        field: 'name',
        oldValue: user.name,
        newValue: name
      });
    }
    if (username !== undefined && username !== user.username) {
      updates.push('username = ?');
      values.push(username);
      historyLogs.push({
        field: 'username',
        oldValue: user.username,
        newValue: username
      });
    }
    if (email !== undefined) {
      const normalizedEmail = normalizeHelpdeskEmail(email);
      if (!normalizedEmail) {
        return res.status(400).json({ error: 'Email inválido. Usa apenas @helpdesk.pt' });
      }

      if (normalizedEmail !== user.email) {
        const duplicateEmailUser = await dbGet(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [normalizedEmail, id]
        );

        if (duplicateEmailUser) {
          return res.status(400).json({ error: 'Email já está registado' });
        }

        updates.push('email = ?');
        values.push(normalizedEmail);
        historyLogs.push({
          field: 'email',
          oldValue: user.email,
          newValue: normalizedEmail
        });
      }
    }
    if (role !== undefined && role !== user.role) {
      updates.push('role = ?');
      values.push(role);
      historyLogs.push({
        field: 'role',
        oldValue: user.role,
        newValue: role
      });
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    await dbRun(sql, values);

    // Log history
    for (const log of historyLogs) {
      await dbRun(
        'INSERT INTO user_history (target_user_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, 'updated', log.field, log.oldValue, log.newValue]
      );
    }

    const updatedUser = await dbGet(
      'SELECT id, name, username, email, role, created_at FROM users WHERE id = ?',
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

export const getUserHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const history = await dbAll(
      `SELECT uh.*, u.username FROM user_history uh
       LEFT JOIN users u ON uh.user_id = u.id
       WHERE uh.target_user_id = ?
       ORDER BY uh.created_at DESC`,
      [id]
    );

    res.json({ history });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
