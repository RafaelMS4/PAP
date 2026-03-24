import { dbGet, dbAll } from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole === 'admin') {
      // Admin dashboard stats
      const openTickets = await dbGet('SELECT COUNT(*) as count FROM tickets WHERE status = "open"');
      const inProgressTickets = await dbGet('SELECT COUNT(*) as count FROM tickets WHERE status = "in_progress"');
      const closedTickets = await dbGet('SELECT COUNT(*) as count FROM tickets WHERE status = "closed"');
      const unassignedTickets = await dbGet('SELECT COUNT(*) as count FROM tickets WHERE assigned_to IS NULL AND status != "closed"');
      const totalUsers = await dbGet('SELECT COUNT(*) as count FROM users');
      const totalEquipment = await dbGet('SELECT COUNT(*) as count FROM equipment WHERE status != "retired"');

      // High priority tickets
      const urgentTickets = await dbGet('SELECT COUNT(*) as count FROM tickets WHERE priority = "urgent" AND status != "closed"');

      // This month's tickets
      const thisMonthTickets = await dbGet(
        'SELECT COUNT(*) as count FROM tickets WHERE strftime("%Y-%m", created_at) = strftime("%Y-%m", "now")'
      );

      // Average resolution time (in hours)
      const avgResolutionTime = await dbGet(
        `SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24) as hours
         FROM tickets WHERE status = "closed" AND resolved_at IS NOT NULL AND created_at >= datetime('now', '-30 days')`
      );

      // Tickets by priority (active only)
      const ticketsByPriority = await dbAll(
        'SELECT priority, COUNT(*) as count FROM tickets WHERE status IN ("open", "in_progress") GROUP BY priority'
      );

      // Most active admins (by time logs) - CORRIGIDO
      const topAdmins = await dbAll(
        `SELECT users.id, users.username, ROUND(SUM(ticket_time_logs.time_spent) / 60.0, 2) as total_hours
         FROM users
         LEFT JOIN ticket_time_logs ON ticket_time_logs.user_id = users.id
         WHERE users.role = 'admin' AND ticket_time_logs.log_date >= date('now', '-30 days')
         GROUP BY users.id
         HAVING SUM(ticket_time_logs.time_spent) > 0
         ORDER BY SUM(ticket_time_logs.time_spent) DESC
         LIMIT 5`
      );

      // Total admin hours this month
      const totalAdminHours = await dbGet(
        `SELECT ROUND(SUM(ticket_time_logs.time_spent) / 60.0, 2) as total_hours
         FROM ticket_time_logs
         WHERE ticket_time_logs.log_date >= date('now', '-30 days')`
      );

      res.json({
        stats: {
          tickets: {
            open: openTickets.count || 0,
            in_progress: inProgressTickets.count || 0,
            closed: closedTickets.count || 0,
            unassigned: unassignedTickets.count || 0,
            urgent: urgentTickets.count || 0,
            this_month: thisMonthTickets.count || 0,
            by_priority: ticketsByPriority || []
          },
          system: {
            total_users: totalUsers.count || 0,
            total_equipment: totalEquipment.count || 0
          },
          metrics: {
            avg_resolution_hours: avgResolutionTime?.hours ? parseFloat(avgResolutionTime.hours).toFixed(2) : '0.00',
            total_admin_hours: totalAdminHours?.total_hours || 0
          },
          top_admins: topAdmins || []
        }
      });
    } else {
      // User dashboard stats
      const myOpen = await dbGet('SELECT COUNT(*) as count FROM tickets WHERE user_id = ? AND status = "open"', [userId]);
      const myInProgress = await dbGet('SELECT COUNT(*) as count FROM tickets WHERE user_id = ? AND status = "in_progress"', [userId]);
      const myClosed = await dbGet('SELECT COUNT(*) as count FROM tickets WHERE user_id = ? AND status = "closed"', [userId]);

      // Recent tickets
      const recentTickets = await dbAll(
        'SELECT id, title, status, priority, created_at FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
        [userId]
      );

      // Urgent tickets
      const urgentTickets = await dbGet(
        'SELECT COUNT(*) as count FROM tickets WHERE user_id = ? AND priority = "urgent" AND status != "closed"',
        [userId]
      );

      res.json({
        stats: {
          tickets: {
            open: myOpen.count || 0,
            in_progress: myInProgress.count || 0,
            closed: myClosed.count || 0,
            urgent: urgentTickets.count || 0
          },
          recent_tickets: recentTickets || []
        }
      });
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};

export const getTicketStats = async (req, res) => {
  try {
    const stats = await dbAll(
      `SELECT
        priority,
        status,
        COUNT(*) as count
       FROM tickets
       GROUP BY priority, status`
    );

    res.json({ stats });
  } catch (error) {
    console.error('Ticket stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de tickets' });
  }
};

export const getAdminWorkload = async (req, res) => {
  try {
    const admins = await dbAll(
      `SELECT
        users.id,
        users.username,
        COUNT(DISTINCT tickets.id) as assigned_tickets,
        SUM(CASE WHEN tickets.status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
        COALESCE(SUM(ticket_time_logs.time_spent), 0) as total_hours
       FROM users
       LEFT JOIN tickets ON tickets.assigned_to = users.id
       LEFT JOIN ticket_time_logs ON ticket_time_logs.user_id = users.id
       WHERE users.role = 'admin'
       GROUP BY users.id
       ORDER BY assigned_tickets DESC`
    );

    res.json({ workload: admins });
  } catch (error) {
    console.error('Admin workload error:', error);
    res.status(500).json({ error: 'Erro ao buscar carga de trabalho' });
  }
};

export const getTicketTrend = async (req, res) => {
  try {
    // Get tickets created in last 7 days
    const ticketsCreated = await dbAll(`
      SELECT 
        DATE(created_at, 'localtime') as date,
        COUNT(*) as total
      FROM tickets 
      WHERE DATE(created_at, 'localtime') BETWEEN DATE('now','localtime','-6 days') AND DATE('now','localtime')
      GROUP BY DATE(created_at, 'localtime')
      ORDER BY date ASC
    `, []);

    // Get tickets closed in last 7 days
    const ticketsClosed = await dbAll(`
      SELECT 
        DATE(updated_at, 'localtime') as date,
        COUNT(*) as total
      FROM tickets 
      WHERE status = 'closed'
        AND DATE(updated_at, 'localtime') BETWEEN DATE('now','localtime','-6 days') AND DATE('now','localtime')
      GROUP BY DATE(updated_at, 'localtime')
      ORDER BY date ASC
    `, []);

    // Build 7-day trend
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayDisplay = `${dd}/${mm}`;

      const created = (ticketsCreated || []).find(t => t?.date === dateStr);
      const closed = (ticketsClosed || []).find(t => t?.date === dateStr);

      result.push({
        day: dayDisplay,
        abertos: created ? Number(created.total) : 0,
        fechados: closed ? Number(closed.total) : 0
      });
    }

    res.json({ trend: result });
  } catch (error) {
    console.error('Erro ao obter tendência:', error);
    res.status(500).json({ error: 'Erro ao obter tendência' });
  }
};