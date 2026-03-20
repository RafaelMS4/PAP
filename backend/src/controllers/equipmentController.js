import { dbGet, dbAll, dbRun } from '../config/database.js';

export const creatEquipment = async (req, res) => {
  try {
    const { name, type, model, location, status = 'available' } = req.body;

    if (!name || !type || !location) {
      return res.status(400).json({ error: 'Name, type, and location are required' });
    }

    const result = await dbRun(
      'INSERT INTO equipment (name, type, model, location, status) VALUES (?, ?, ?, ?, ?)',
      [name, type, model || null, location, status]
    );

    res.status(201).json({
      message: 'Equipment created successfully',
      equipment: {
        id: result.lastID,
        name,
        type,
        model: model || null,
        location,
        status
      }
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEquipment = async (req, res) => {
  try {
    const { type, status, search, name, limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    let sql = 'SELECT equipment.*, users.name as assigned_user_name FROM equipment LEFT JOIN users ON users.id = equipment.assigned_to WHERE equipment.deleted_at IS NULL';
    const params = [];

    if (type) {
      sql += ' AND equipment.type = ?';
      params.push(type);
    }

    if (status) {
      sql += ' AND equipment.status = ?';
      params.push(status);
    }

    const searchValue = search || name;
    if (searchValue) {
      sql += ' AND (equipment.name LIKE ? OR equipment.location LIKE ?)';
      const searchPattern = `%${searchValue}%`;
      params.push(searchPattern, searchPattern);
    }

    sql += ' ORDER BY equipment.type ASC, equipment.name ASC LIMIT ? OFFSET ?';
    params.push(limitNum, offsetNum);

    const equipmentList = await dbAll(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as count FROM equipment WHERE deleted_at IS NULL';
    const countParams = [];
    if (type) {
      countSql += ' AND type = ?';
      countParams.push(type);
    }
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    if (searchValue) {
      countSql += ' AND (name LIKE ? OR location LIKE ?)';
      const searchPattern = `%${searchValue}%`;
      countParams.push(searchPattern, searchPattern);
    }

    const countResult = await dbGet(countSql, countParams);
    const total = countResult.count;

    res.json({
      equipment: equipmentList,
      total,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await dbGet(
      'SELECT equipment.*, users.name as assigned_user_name FROM equipment LEFT JOIN users ON users.id = equipment.assigned_to WHERE equipment.id = ? AND equipment.deleted_at IS NULL',
      [id]
    );
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ equipment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Soft delete - mark as deleted but keep data
    await dbRun('UPDATE equipment SET deleted_at = datetime("now") WHERE id = ?', [id]);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;
    
    // Verificar se o utilizador é admin ou se está a ver os seus próprios equipamentos
    if (req.userRole !== 'admin' && parseInt(id) !== req.userId) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    let sql = 'SELECT equipment.*, users.name as assigned_user_name FROM equipment LEFT JOIN users ON users.id = equipment.assigned_to WHERE equipment.assigned_to = ? AND equipment.deleted_at IS NULL';
    const params = [id];

    if (status) {
      sql += ' AND equipment.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY equipment.type ASC, equipment.name ASC LIMIT ? OFFSET ?';
    params.push(limitNum, offsetNum);

    const equipmentList = await dbAll(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as count FROM equipment WHERE assigned_to = ? AND deleted_at IS NULL';
    const countParams = [id];
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    const countResult = await dbGet(countSql, countParams);

    res.json({ 
      equipment: equipmentList,
      pagination: {
        total: countResult.count,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(countResult.count / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEquipmentByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    let sql = 'SELECT equipment.*, users.username FROM equipment LEFT JOIN users ON users.id = equipment.assignedTo WHERE equipment.type = ?';
    const params = [type];

    if (status) {
      sql += ' AND equipment.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY equipment.name ASC LIMIT ? OFFSET ?';
    params.push(limitNum, offsetNum);

    const equipmentList = await dbAll(sql, params);

    let countSql = 'SELECT COUNT(*) as count FROM equipment WHERE type = ?';
    const countParams = [type];
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    const countResult = await dbGet(countSql, countParams);

    res.json({
      equipment: equipmentList,
      pagination: {
        total: countResult.count,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(countResult.count / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, model, location, status, assigned_to, assignedTo } = req.body;
    const userId = req.userId;

    const equipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const updates = [];
    const values = [];
    const historyLogs = [];

    if (name !== undefined && name !== equipment.name) {
      updates.push('name = ?');
      values.push(name);
      historyLogs.push({
        field: 'name',
        oldValue: equipment.name,
        newValue: name
      });
    }
    if (type !== undefined && type !== equipment.type) {
      updates.push('type = ?');
      values.push(type);
      historyLogs.push({
        field: 'type',
        oldValue: equipment.type,
        newValue: type
      });
    }
    if (model !== undefined && model !== equipment.model) {
      updates.push('model = ?');
      values.push(model);
      historyLogs.push({
        field: 'model',
        oldValue: equipment.model,
        newValue: model
      });
    }
    if (location !== undefined && location !== equipment.location) {
      updates.push('location = ?');
      values.push(location);
      historyLogs.push({
        field: 'location',
        oldValue: equipment.location,
        newValue: location
      });
    }
    if (status !== undefined && status !== equipment.status) {
      updates.push('status = ?');
      values.push(status);
      historyLogs.push({
        field: 'status',
        oldValue: equipment.status,
        newValue: status
      });
    }
    // Accept both camelCase and snake_case
    const assignedToValue = assignedTo !== undefined ? assignedTo : assigned_to;
    if (assignedToValue !== undefined && assignedToValue !== equipment.assigned_to) {
      updates.push('assigned_to = ?');
      values.push(assignedToValue);
      
      // Get user names for history
      let oldUserName = null;
      let newUserName = null;
      
      if (equipment.assigned_to) {
        const oldUser = await dbGet('SELECT name FROM users WHERE id = ?', [equipment.assigned_to]);
        oldUserName = oldUser ? oldUser.name : 'Desconhecido';
      }
      
      if (assignedToValue) {
        const newUser = await dbGet('SELECT name FROM users WHERE id = ?', [assignedToValue]);
        newUserName = newUser ? newUser.name : 'Desconhecido';
      }
      
      historyLogs.push({
        field: 'assigned_to',
        oldValue: oldUserName,
        newValue: newUserName
      });
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await dbRun(
      `UPDATE equipment SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Log history
    for (const log of historyLogs) {
      await dbRun(
        'INSERT INTO equipment_history (equipment_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, 'updated', log.field, log.oldValue, log.newValue]
      );
    }

    const updatedEquipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [id]);
    res.json({ message: 'Equipment updated successfully', equipment: updatedEquipment });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const assignEquipmentToUser = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if equipment exists
    const equipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [equipmentId]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Check if user exists
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Assign equipment
    await dbRun(
      'UPDATE equipment SET assigned_to = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId, 'in_use', equipmentId]
    );

    const updatedEquipment = await dbGet(
      'SELECT equipment.*, users.name as assigned_user_name FROM equipment LEFT JOIN users ON users.id = equipment.assigned_to WHERE equipment.id = ?',
      [equipmentId]
    );

    res.json({ 
      message: 'Equipment assigned successfully',
      equipment: updatedEquipment 
    });
  } catch (error) {
    console.error('Assign equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unassignEquipment = async (req, res) => {
  try {
    const { equipmentId } = req.params;

    // Check if equipment exists
    const equipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [equipmentId]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Unassign equipment
    await dbRun(
      'UPDATE equipment SET assigned_to = NULL, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['available', equipmentId]
    );

    const updatedEquipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [equipmentId]);

    res.json({ 
      message: 'Equipment unassigned successfully',
      equipment: updatedEquipment 
    });
  } catch (error) {
    console.error('Unassign equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEquipmentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const history = await dbAll(
      `SELECT eh.*, u.username FROM equipment_history eh
       LEFT JOIN users u ON eh.user_id = u.id
       WHERE eh.equipment_id = ?
       ORDER BY eh.created_at DESC`,
      [id]
    );

    res.json({ history });
  } catch (error) {
    console.error('Get equipment history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
