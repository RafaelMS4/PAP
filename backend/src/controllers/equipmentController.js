import { dbGet, dbAll, dbRun } from '../config/database.js';

export const creatEquipment = async (req, res) => {
  try {
    const { name, type, serialNumber, assignedTo, maintenance, status = 'active' } = req.body;

    if (!name || !type || !serialNumber || !assignedTo || !maintenance) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const ExistingPC = await dbGet('SELECT id FROM equipment WHERE serialNumber = ?', [serialNumber]);
    if (ExistingPC) {
      return res.status(400).json({ error: 'Equipment with this serial number already exists' });
    }

    const result = await dbRun(
      'INSERT INTO equipment (name, type, serialNumber, assignedTo, maintenance, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type, serialNumber, assignedTo, maintenance, status]
    );

    res.status(201).json({
      message: 'Equipment created successfully',
      equipment: {
        id: result.lastID,
        name,
        type,
        serialNumber,
        assignedTo,
        maintenance,
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
    const { type, status, assignedTo, search, limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    let sql = 'SELECT equipment.*, users.username FROM equipment LEFT JOIN users ON users.id = equipment.assignedTo WHERE equipment.deleted_at IS NULL';
    const params = [];

    if (type) {
      sql += ' AND equipment.type = ?';
      params.push(type);
    }

    if (status) {
      sql += ' AND equipment.status = ?';
      params.push(status);
    }

    if (assignedTo) {
      sql += ' AND equipment.assignedTo = ?';
      params.push(assignedTo);
    }

    if (search) {
      sql += ' AND (equipment.name LIKE ? OR equipment.serialNumber LIKE ?)';
      const searchPattern = `%${search}%`;
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
    if (assignedTo) {
      countSql += ' AND assignedTo = ?';
      countParams.push(assignedTo);
    }
    if (search) {
      countSql += ' AND (name LIKE ? OR serialNumber LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }

    const countResult = await dbGet(countSql, countParams);
    const total = countResult.count;

    res.json({ 
      equipment: equipmentList,
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
      'SELECT equipment.*, users.username FROM equipment LEFT JOIN users ON users.id = equipment.assignedTo WHERE equipment.id = ?',
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
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    let sql = 'SELECT equipment.* FROM equipment WHERE assignedTo = ? AND deleted_at IS NULL';
    const params = [id];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY type ASC, name ASC LIMIT ? OFFSET ?';
    params.push(limitNum, offsetNum);

    const equipmentList = await dbAll(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as count FROM equipment WHERE assignedTo = ? AND deleted_at IS NULL';
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

    let sql = 'SELECT equipment.*, users.username FROM equipment LEFT JOIN users ON users.id = equipment.assignedTo WHERE equipment.type = ? AND equipment.deleted_at IS NULL';
    const params = [type];

    if (status) {
      sql += ' AND equipment.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY equipment.name ASC LIMIT ? OFFSET ?';
    params.push(limitNum, offsetNum);

    const equipmentList = await dbAll(sql, params);

    let countSql = 'SELECT COUNT(*) as count FROM equipment WHERE type = ? AND deleted_at IS NULL';
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
    const { name, type, serialNumber, assignedTo, maintenance, status } = req.body;

    const equipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (serialNumber !== undefined) {
      updates.push('serialNumber = ?');
      values.push(serialNumber);
    }
    if (assignedTo !== undefined) {
      updates.push('assignedTo = ?');
      values.push(assignedTo);
    }
    if (maintenance !== undefined) {
      updates.push('maintenance = ?');
      values.push(maintenance);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await dbRun(
      `UPDATE equipment SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedEquipment = await dbGet(
      'SELECT equipment.*, users.username FROM equipment LEFT JOIN users ON users.id = equipment.assignedTo WHERE equipment.id = ?',
      [id]
    );

    res.json({ 
      message: 'Equipment updated successfully',
      equipment: updatedEquipment 
    });

  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
