import { dbGet, dbAll, dbRun } from '../config/database.js';

export const creatEquipment = async (req, res) => {
  try {
    const { name, type, serialNumber, assignedTo, maintenance } = req.body;

    if (!name || !type || !serialNumber || !assignedTo || !maintenance) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const ExistingPC = await dbGet('SELECT id FROM equipment WHERE serialNumber = ?', [serialNumber]);
    if (ExistingPC) {
      return res.status(400).json({ error: 'Equipment with this serial number already exists' });
    }

    const result = await dbRun(
      'INSERT INTO equipment (name, type, serialNumber, assignedTo, maintenance) VALUES (?, ?, ?, ?, ?)',
      [name, type, serialNumber, assignedTo, maintenance]
    );

    res.status(201).json({
      message: 'Equipment created successfully',
      equipment: {
        id: result.id,
        name,
        type,
        serialNumber,
        assignedTo,
        maintenance
      }
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEquipment = async (req, res) => {
  try {
    const equipmentList = await dbAll('SELECT equipment.*, users.username FROM equipment LEFT JOIN users ON users.id = equipment.assignedTo');
    res.json({ equipment: equipmentList });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await dbGet('SELECT equipment.*, users.username FROM equipment LEFT JOIN users ON users.id = equipment.assignedTo and equipment.id = ?', [id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ equipment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    await dbRun('DELETE FROM equipment WHERE id = ?', [id]);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipmentList = await dbAll('SELECT equipment.* FROM equipment LEFT JOIN users ON users.id = equipment.assignedTo WHERE assignedTo = ?', [id]);
    res.json({ equipment: equipmentList });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, serialNumber, assignedTo, maintenance } = req.body;
    const equipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    await dbRun(
      'UPDATE equipment SET name = ?, type = ?, serialNumber = ?, assignedTo = ?, maintenance = ? WHERE id = ?',
      [name || equipment.name, type || equipment.type, serialNumber || equipment.serialNumber, assignedTo || equipment.assignedTo, maintenance || equipment.maintenance, id]
    );
    res.json({ message: 'Equipment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};