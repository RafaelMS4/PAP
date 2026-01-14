import { dbGet, dbAll, dbRun } from '../config/database.js';

export const createTicket = async (req, res) => {
  try {
    const { description, priority = 'medium' } = req.body;
    const user_id = req.userId;

    const result = await dbRun(
      `INSERT INTO tickets (title, description, priority, user_id, status) 
       VALUES (?, ?, ?, ?, 'open')`,
      [`Ticket #${Date.now()}`, description, priority, user_id]
    );

    const ticketNumber = result.lastID.toString().padStart(4, '0');

    await dbRun(
      'UPDATE tickets SET title = ? WHERE id = ?',
      [`Ticket #${ticketNumber}`, result.lastID]
    );

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [result.lastID]);
    res.json({ ticket });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    res.status(500).json({ error: 'Erro ao criar ticket' });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { status, priority, assigned_to, user_id } = req.query;
    
    let query = `
      SELECT t.*, 
             u.username as creator_name,
             a.username as assigned_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }
    if (assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }
    if (user_id) {
      query += ' AND t.user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY t.created_at DESC';

    const tickets = await dbAll(query, params);
    res.json({ tickets });
  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    res.status(500).json({ error: 'Erro ao listar tickets' });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await dbGet(
      `SELECT t.*, 
              u.username as creator_name, 
              u.email as creator_email,
              a.username as assigned_name,
              e.name as equipment_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       LEFT JOIN equipment e ON t.primary_equipment_id = e.id
       WHERE t.id = ?`,
      [id]
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Erro ao obter ticket:', error);
    res.status(500).json({ error: 'Erro ao obter ticket' });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, status, priority, category, assigned_to, primary_equipment_id } = req.body;

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const updates = [];
    const values = [];

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      values.push(assigned_to);
    }
    if (primary_equipment_id !== undefined) {
      updates.push('primary_equipment_id = ?');
      values.push(primary_equipment_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(id);
    const sql = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
    
    await dbRun(sql, values);

    const userId = req.userId;
    
    if (status !== undefined && status !== ticket.status) {
      await dbRun(
        'INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, 'status_changed', 'status', ticket.status, status]
      );
    }
    
    if (priority !== undefined && priority !== ticket.priority) {
      await dbRun(
        'INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, 'priority_changed', 'priority', ticket.priority, priority]
      );
    }

    const updatedTicket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    
    res.json({
      message: 'Ticket atualizado com sucesso',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    res.status(500).json({ error: 'Erro ao atualizar ticket' });
  }
};


export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    await dbRun('DELETE FROM tickets WHERE id = ?', [id]);
    
    res.json({ message: 'Ticket eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar ticket:', error);
    res.status(500).json({ error: 'Erro ao eliminar ticket' });
  }
};

export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, category } = req.body;
    const technicianId = req.user.id; // Técnico que está a atribuir

    await dbRun(
      `UPDATE tickets 
       SET assigned_to = ?, category = ?, status = 'in_progress' 
       WHERE id = ?`,
      [assigned_to || technicianId, category, id]
    );

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Ticket atribuído com sucesso',
      ticket 
    });
  } catch (error) {
    console.error('Erro ao atribuir ticket:', error);
    res.status(500).json({ error: 'Erro ao atribuir ticket' });
  }
};
