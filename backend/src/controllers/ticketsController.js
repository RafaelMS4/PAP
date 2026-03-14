import { dbGet, dbAll, dbRun } from '../config/database.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const createTicket = async (req, res) => {
  try {
    const { title, description, priority = 'medium', category, primary_equipment_id } = req.body;
    const user_id = req.userId;

    if (!description) {
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }

    const result = await dbRun(
      `INSERT INTO tickets (title, description, priority, category, user_id, status, primary_equipment_id) 
       VALUES (?, ?, ?, ?, ?, 'open', ?)`,
      [title || `Ticket #${Date.now()}`, description, priority, category || null, user_id, primary_equipment_id || null]
    );

    const ticketNumber = result.lastID.toString().padStart(4, '0');

    if (!title) {
      await dbRun(
        'UPDATE tickets SET title = ? WHERE id = ?',
        [`Ticket #${ticketNumber}`, result.lastID]
      );
    }

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [result.lastID]);
    res.status(201).json({ ticket });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    res.status(500).json({ error: 'Erro ao criar ticket' });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { status, priority, assigned_to } = req.query;
    const userId = req.userId;
    const userRole = req.userRole;

    const { user_id } = req.query;

    let query = `
      SELECT t.*, 
             u.username as creator_name,
             u.name as creator_display_name,
             a.username as assigned_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE 1=1
    `;
    const params = [];

    // If user is not admin, only show their own tickets
    if (userRole !== 'admin') {
      query += ' AND t.user_id = ?';
      params.push(userId);
    }

    // Allow filtering by user_id (for admin viewing a specific user's tickets)
    if (user_id && userRole === 'admin') {
      query += ' AND t.user_id = ?';
      params.push(user_id);
    }

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

    query += ' ORDER BY t.created_at DESC LIMIT 100';

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
              u.name as creator_display_name,
              u.email as creator_email,
              a.username as assigned_name,
              a.name as assigned_display_name,
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
    const userId = req.userId;

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

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const sql = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
    
    await dbRun(sql, values);

    // Record history for important changes
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

    if (assigned_to !== undefined && assigned_to !== ticket.assigned_to) {
      await dbRun(
        'INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, 'assignment_changed', 'assigned_to', ticket.assigned_to || 'unassigned', assigned_to]
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

    // Delete related attachments from filesystem
    const attachments = await dbAll('SELECT filepath FROM ticket_attachments WHERE ticket_id = ?', [id]);
    for (const attachment of attachments) {
      if (fs.existsSync(attachment.filepath)) {
        fs.unlinkSync(attachment.filepath);
      }
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
    const { assigned_to, admin_id } = req.body;
    const userId = req.userId;
    const assigneeId = assigned_to || admin_id || userId;

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    if (!assigneeId) {
      return res.status(400).json({ error: 'assigned_to é obrigatório' });
    }

    await dbRun(
      `UPDATE tickets 
       SET assigned_to = ?, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [assigneeId, id]
    );

    await dbRun(
      'INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, 'assignment_changed', 'assigned_to', ticket.assigned_to || 'unassigned', assigneeId]
    );

    const updatedTicket = await dbGet(
      `SELECT t.*, u.username as creator_name, u.name as creator_display_name,
              a.username as assigned_name, a.name as assigned_display_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = ?`, [id]
    );
    
    res.json({ 
      message: 'Ticket atribuído com sucesso',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Erro ao atribuir ticket:', error);
    res.status(500).json({ error: 'Erro ao atribuir ticket' });
  }
};

// Comments functions
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, comment_type = 'comment', is_internal = false, time_spent } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Only admins can add tasks and solutions
    if ((comment_type === 'task' || comment_type === 'solution') && userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem adicionar tarefas e soluções' });
    }

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const result = await dbRun(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment_type, message, is_internal)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, comment_type, message, is_internal ? 1 : 0]
    );

    // If it's a solution, close the ticket
    if (comment_type === 'solution') {
      await dbRun(
        'UPDATE tickets SET status = ?, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['closed', id]
      );
    }

    // If task has time_spent, create a time log entry
    if (comment_type === 'task' && time_spent && parseInt(time_spent) > 0) {
      await dbRun(
        `INSERT INTO ticket_time_logs (ticket_id, user_id, time_spent, description)
         VALUES (?, ?, ?, ?)`,
        [id, userId, parseInt(time_spent), message]
      );
    }

    const comment = await dbGet(
      `SELECT tc.*, u.username FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.id = ?`,
      [result.lastID]
    );

    // Attach time_spent to the response if provided
    if (comment && time_spent) {
      comment.time_spent = parseInt(time_spent);
    }

    res.status(201).json({ 
      message: 'Comentário adicionado com sucesso',
      comment 
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const comments = await dbAll(
      `SELECT tc.*, u.username, u.email,
       (SELECT ttl.time_spent FROM ticket_time_logs ttl 
        WHERE ttl.ticket_id = tc.ticket_id AND ttl.user_id = tc.user_id 
        AND ttl.description = tc.message
        ORDER BY ttl.created_at DESC LIMIT 1) as time_spent
       FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.ticket_id = ?
       ORDER BY tc.created_at ASC`,
      [id]
    );

    res.json({ comments });
  } catch (error) {
    console.error('Erro ao obter comentários:', error);
    res.status(500).json({ error: 'Erro ao obter comentários' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    const comment = await dbGet('SELECT * FROM ticket_comments WHERE id = ? AND ticket_id = ?', [commentId, id]);
    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    // Users can only edit their own comments
    if (comment.user_id !== userId) {
      return res.status(403).json({ error: 'Pode apenas editar seus próprios comentários' });
    }

    await dbRun(
      'UPDATE ticket_comments SET message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [message, commentId]
    );

    const updatedComment = await dbGet(
      `SELECT tc.*, u.username FROM ticket_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.id = ?`,
      [commentId]
    );

    res.json({ 
      message: 'Comentário atualizado com sucesso',
      comment: updatedComment 
    });
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    res.status(500).json({ error: 'Erro ao atualizar comentário' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const comment = await dbGet('SELECT * FROM ticket_comments WHERE id = ? AND ticket_id = ?', [commentId, id]);
    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    // Only comment owner or admins can delete
    if (comment.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await dbRun('DELETE FROM ticket_comments WHERE id = ?', [commentId]);

    res.json({ message: 'Comentário eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar comentário:', error);
    res.status(500).json({ error: 'Erro ao eliminar comentário' });
  }
};

// Close ticket with solution
export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { solution_message } = req.body;
    const userId = req.userId;

    if (!solution_message) {
      return res.status(400).json({ error: 'Mensagem de solução é obrigatória' });
    }

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Add solution comment
    await dbRun(
      `INSERT INTO ticket_comments (ticket_id, user_id, comment_type, message, is_internal)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, 'solution', solution_message, 0]
    );

    // Update ticket status and resolved_at
    await dbRun(
      `UPDATE tickets SET status = ?, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      ['closed', id]
    );

    // Record history
    await dbRun(
      'INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, 'status_changed', 'status', ticket.status, 'closed']
    );

    const updatedTicket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);

    res.json({ 
      message: 'Ticket fechado com sucesso',
      ticket: updatedTicket 
    });
  } catch (error) {
    console.error('Erro ao fechar ticket:', error);
    res.status(500).json({ error: 'Erro ao fechar ticket' });
  }
};

// History functions
export const getTicketHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const history = await dbAll(
      `SELECT th.*, u.username FROM ticket_history th
       LEFT JOIN users u ON th.user_id = u.id
       WHERE th.ticket_id = ?
       ORDER BY th.created_at DESC`,
      [id]
    );

    res.json({ history });
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ error: 'Erro ao obter histórico' });
  }
};

// Time log functions
export const addTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { time_spent, description } = req.body;
    const userId = req.userId;

    if (!time_spent || time_spent <= 0) {
      return res.status(400).json({ error: 'Tempo gasto deve ser maior que 0' });
    }

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const result = await dbRun(
      `INSERT INTO ticket_time_logs (ticket_id, user_id, time_spent, description)
       VALUES (?, ?, ?, ?)`,
      [id, userId, time_spent, description || null]
    );

    const timeLog = await dbGet(
      `SELECT ttl.*, u.username FROM ticket_time_logs ttl
       LEFT JOIN users u ON ttl.user_id = u.id
       WHERE ttl.id = ?`,
      [result.lastID]
    );

    res.status(201).json({ 
      message: 'Tempo registrado com sucesso',
      timeLog 
    });
  } catch (error) {
    console.error('Erro ao registrar tempo:', error);
    res.status(500).json({ error: 'Erro ao registrar tempo' });
  }
};

export const getTimeLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const timeLogs = await dbAll(
      `SELECT ttl.*, u.username FROM ticket_time_logs ttl
       LEFT JOIN users u ON ttl.user_id = u.id
       WHERE ttl.ticket_id = ?
       ORDER BY ttl.created_at DESC`,
      [id]
    );

    res.json({ timeLogs });
  } catch (error) {
    console.error('Erro ao obter registros de tempo:', error);
    res.status(500).json({ error: 'Erro ao obter registros de tempo' });
  }
};

export const updateTimeLog = async (req, res) => {
  try {
    const { id, logId } = req.params;
    const { time_spent, description } = req.body;
    const userId = req.userId;

    if (time_spent && time_spent <= 0) {
      return res.status(400).json({ error: 'Tempo gasto deve ser maior que 0' });
    }

    const timeLog = await dbGet(
      'SELECT * FROM ticket_time_logs WHERE id = ? AND ticket_id = ?',
      [logId, id]
    );
    if (!timeLog) {
      return res.status(404).json({ error: 'Registro de tempo não encontrado' });
    }

    const updates = [];
    const values = [];

    if (time_spent !== undefined) {
      updates.push('time_spent = ?');
      values.push(time_spent);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(logId);
    const sql = `UPDATE ticket_time_logs SET ${updates.join(', ')} WHERE id = ?`;
    await dbRun(sql, values);

    const updatedLog = await dbGet(
      `SELECT ttl.*, u.username FROM ticket_time_logs ttl
       LEFT JOIN users u ON ttl.user_id = u.id
       WHERE ttl.id = ?`,
      [logId]
    );

    res.json({ 
      message: 'Registro de tempo atualizado com sucesso',
      timeLog: updatedLog 
    });
  } catch (error) {
    console.error('Erro ao atualizar registro de tempo:', error);
    res.status(500).json({ error: 'Erro ao atualizar registro de tempo' });
  }
};

export const deleteTimeLog = async (req, res) => {
  try {
    const { id, logId } = req.params;

    const timeLog = await dbGet(
      'SELECT * FROM ticket_time_logs WHERE id = ? AND ticket_id = ?',
      [logId, id]
    );
    if (!timeLog) {
      return res.status(404).json({ error: 'Registro de tempo não encontrado' });
    }

    await dbRun('DELETE FROM ticket_time_logs WHERE id = ?', [logId]);

    res.json({ message: 'Registro de tempo eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar registro de tempo:', error);
    res.status(500).json({ error: 'Erro ao eliminar registro de tempo' });
  }
};

// Get admin hours statistics
export const getAdminHours = async (req, res) => {
  try {
    const hours = await dbAll(
      `SELECT u.id, u.username, SUM(ttl.time_spent) as total_minutes, 
              ROUND(SUM(ttl.time_spent) / 60.0, 2) as total_hours
       FROM users u
       LEFT JOIN ticket_time_logs ttl ON u.id = ttl.user_id
       WHERE u.role = 'admin'
       GROUP BY u.id, u.username
       ORDER BY total_minutes DESC`,
      []
    );

    res.json({ adminHours: hours });
  } catch (error) {
    console.error('Erro ao obter horas dos admins:', error);
    res.status(500).json({ error: 'Erro ao obter horas dos admins' });
  }
};

// Attachment functions
export const addAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo é obrigatório' });
    }

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const filepath = req.file.path;
    const filename = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;

    const result = await dbRun(
      `INSERT INTO ticket_attachments (ticket_id, user_id, filename, filepath, file_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, filename, filepath, fileType, fileSize]
    );

    const attachment = await dbGet(
      `SELECT ta.*, u.username FROM ticket_attachments ta
       LEFT JOIN users u ON ta.user_id = u.id
       WHERE ta.id = ?`,
      [result.lastID]
    );

    res.status(201).json({ 
      message: 'Arquivo anexado com sucesso',
      attachment 
    });
  } catch (error) {
    console.error('Erro ao anexar arquivo:', error);
    res.status(500).json({ error: 'Erro ao anexar arquivo' });
  }
};

export const getAttachments = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const attachments = await dbAll(
      `SELECT ta.*, u.username FROM ticket_attachments ta
       LEFT JOIN users u ON ta.user_id = u.id
       WHERE ta.ticket_id = ?
       ORDER BY ta.created_at DESC`,
      [id]
    );

    res.json({ attachments });
  } catch (error) {
    console.error('Erro ao obter anexos:', error);
    res.status(500).json({ error: 'Erro ao obter anexos' });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const attachment = await dbGet(
      'SELECT * FROM ticket_attachments WHERE id = ? AND ticket_id = ?',
      [attachmentId, id]
    );
    if (!attachment) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    // Only attachment owner or admins can delete
    if (attachment.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.filepath)) {
      fs.unlinkSync(attachment.filepath);
    }

    await dbRun('DELETE FROM ticket_attachments WHERE id = ?', [attachmentId]);

    res.json({ message: 'Anexo eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar anexo:', error);
    res.status(500).json({ error: 'Erro ao eliminar anexo' });
  }
};

// ============ TICKET-EQUIPMENT ASSOCIATION ============

export const addEquipmentToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipment_id, notes } = req.body;
    const userId = req.userId;

    if (!equipment_id) {
      return res.status(400).json({ error: 'equipment_id é obrigatório' });
    }

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const equipment = await dbGet('SELECT * FROM equipment WHERE id = ?', [equipment_id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    // Check if already associated
    const existing = await dbGet(
      'SELECT id FROM ticket_equipment WHERE ticket_id = ? AND equipment_id = ?',
      [id, equipment_id]
    );
    if (existing) {
      return res.status(400).json({ error: 'Este equipamento já está associado ao ticket' });
    }

    const result = await dbRun(
      `INSERT INTO ticket_equipment (ticket_id, equipment_id, added_by, notes)
       VALUES (?, ?, ?, ?)`,
      [id, equipment_id, userId, notes || null]
    );

    const association = await dbGet(
      `SELECT te.*, e.name as equipment_name, e.type as equipment_type, u.username
       FROM ticket_equipment te
       LEFT JOIN equipment e ON te.equipment_id = e.id
       LEFT JOIN users u ON te.added_by = u.id
       WHERE te.id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      message: 'Equipamento associado com sucesso',
      ticketEquipment: association
    });
  } catch (error) {
    console.error('Erro ao associar equipamento:', error);
    res.status(500).json({ error: 'Erro ao associar equipamento' });
  }
};

export const getTicketEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const equipment = await dbAll(
      `SELECT te.*, e.name as equipment_name, e.type as equipment_type, 
              e.serialNumber, e.assignedTo, u.username
       FROM ticket_equipment te
       LEFT JOIN equipment e ON te.equipment_id = e.id
       LEFT JOIN users u ON te.added_by = u.id
       WHERE te.ticket_id = ?
       ORDER BY te.created_at DESC`,
      [id]
    );

    res.json({ ticketEquipment: equipment });
  } catch (error) {
    console.error('Erro ao obter equipamento do ticket:', error);
    res.status(500).json({ error: 'Erro ao obter equipamento do ticket' });
  }
};

export const removeEquipmentFromTicket = async (req, res) => {
  try {
    const { id, equipmentId } = req.params;

    const association = await dbGet(
      'SELECT * FROM ticket_equipment WHERE id = ? AND ticket_id = ?',
      [equipmentId, id]
    );
    if (!association) {
      return res.status(404).json({ error: 'Associação não encontrada' });
    }

    await dbRun('DELETE FROM ticket_equipment WHERE id = ?', [equipmentId]);

    res.json({ message: 'Equipamento removido do ticket com sucesso' });
  } catch (error) {
    console.error('Erro ao remover equipamento do ticket:', error);
    res.status(500).json({ error: 'Erro ao remover equipamento do ticket' });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const { status, priority, limit = 50, offset = 0 } = req.query;
    const userId = req.userId;
    const userRole = req.userRole;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    // For admins, show tickets assigned to them; for users, show tickets they created
    let sql;
    const params = [];
    if (userRole === 'admin') {
      sql = `SELECT t.*, u.username as creator_name, u.name as creator_display_name
             FROM tickets t LEFT JOIN users u ON t.user_id = u.id
             WHERE t.assigned_to = ?`;
      params.push(userId);
    } else {
      sql = `SELECT t.*, u.username as creator_name, u.name as creator_display_name
             FROM tickets t LEFT JOIN users u ON t.user_id = u.id
             WHERE t.user_id = ?`;
      params.push(userId);
    }

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }

    sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offsetNum);

    const tickets = await dbAll(sql, params);

    // Get total count
    let countSql;
    const countParams = [];
    if (userRole === 'admin') {
      countSql = 'SELECT COUNT(*) as count FROM tickets WHERE assigned_to = ?';
      countParams.push(userId);
    } else {
      countSql = 'SELECT COUNT(*) as count FROM tickets WHERE user_id = ?';
      countParams.push(userId);
    }
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    if (priority) {
      countSql += ' AND priority = ?';
      countParams.push(priority);
    }

    const countResult = await dbGet(countSql, countParams);

    res.json({
      tickets,
      pagination: {
        total: countResult.count,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(countResult.count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ error: 'Erro ao buscar seus tickets' });
  }
};

export const getAdminQueue = async (req, res) => {
  try {
    const { priority, category, limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    let sql = `SELECT tickets.*, users.username as creator_name, users.name as creator_display_name 
               FROM tickets LEFT JOIN users ON users.id = tickets.user_id 
               WHERE tickets.assigned_to IS NULL AND tickets.status != 'closed'`;
    const params = [];

    if (priority) {
      sql += ' AND tickets.priority = ?';
      params.push(priority);
    }

    if (category) {
      sql += ' AND tickets.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY tickets.priority DESC, tickets.created_at ASC LIMIT ? OFFSET ?';
    params.push(limitNum, offsetNum);

    const tickets = await dbAll(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as count FROM tickets WHERE assigned_to IS NULL AND status != "closed"';
    const countParams = [];
    if (priority) {
      countSql += ' AND priority = ?';
      countParams.push(priority);
    }
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }

    const countResult = await dbGet(countSql, countParams);

    res.json({
      tickets,
      pagination: {
        total: countResult.count,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(countResult.count / limitNum)
      }
    });
  } catch (error) {
    console.error('Get admin queue error:', error);
    res.status(500).json({ error: 'Erro ao buscar fila de admin' });
  }
};

export const updateTicketPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ error: 'Prioridade inválida' });
    }

    const result = await dbRun(
      'UPDATE tickets SET priority = ? WHERE id = ?',
      [priority, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Log action in history
    await dbRun(
      'INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.userId, 'priority_changed', 'priority', req.body.old_priority || '', priority]
    );

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    res.json({ message: 'Prioridade atualizada', ticket });
  } catch (error) {
    console.error('Update ticket priority error:', error);
    res.status(500).json({ error: 'Erro ao atualizar prioridade' });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'waiting', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const result = await dbRun(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Log action in history
    await dbRun(
      'INSERT INTO ticket_history (ticket_id, user_id, action, field_changed, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.userId, 'status_changed', 'status', req.body.old_status || '', status]
    );

    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [id]);
    res.json({ message: 'Status atualizado', ticket });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

export const downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const attachment = await dbGet('SELECT * FROM attachments WHERE id = ?', [attachmentId]);

    if (!attachment) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    // Check access - user can download if they created the ticket or are admin
    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [attachment.ticket_id]);
    
    if (req.userRole !== 'admin' && ticket.user_id !== req.userId && ticket.assigned_to !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const filePath = path.join(UPLOAD_DIR, attachment.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Ficheiro não encontrado no servidor' });
    }

    // Send file
    res.download(filePath, attachment.file_name);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ error: 'Erro ao descarregar anexo' });
  }
};
