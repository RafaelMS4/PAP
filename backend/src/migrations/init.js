import { db, dbRun } from '../config/database.js';
import bcrypt from 'bcryptjs';

const createTables = async () => {
  try {
    console.log('🔄 Creating database tables...');

    // Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create equipment table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        serialNumber TEXT NOT NULL UNIQUE,
        assignedTo INTEGER,
        maintenance TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(assignedTo) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Equipment table created');

    // Create tickets table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
        category TEXT,
        user_id INTEGER NOT NULL,
        assigned_to INTEGER,
        primary_equipment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY(primary_equipment_id) REFERENCES equipment(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Tickets table created');

    // Create ticket_comments table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS ticket_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        comment_type TEXT DEFAULT 'comment' CHECK(comment_type IN ('comment', 'task', 'internal_note', 'solution')),
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Ticket comments table created');

    // Create ticket_history table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS ticket_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        field_changed TEXT,
        old_value TEXT,
        new_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Ticket history table created');

    // Create equipment_history table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS equipment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        field_changed TEXT,
        old_value TEXT,
        new_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Equipment history table created');

    // Create user_history table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_user_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        field_changed TEXT,
        old_value TEXT,
        new_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(target_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ User history table created');

    // Create ticket_time_logs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS ticket_time_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        time_spent INTEGER NOT NULL,
        description TEXT,
        log_date DATE DEFAULT (DATE('now')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Ticket time logs table created');

    // Create ticket_equipment table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS ticket_equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        equipment_id INTEGER NOT NULL,
        added_by INTEGER NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY(equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
        FOREIGN KEY(added_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Ticket equipment table created');

    // Create ticket_attachments table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS ticket_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        comment_id INTEGER,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY(comment_id) REFERENCES ticket_comments(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Ticket attachments table created');

    // Check if admin user exists
    const admin = new Promise((resolve) => {
      db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
        resolve(row);
      });
    });

    const adminExists = await admin;

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await dbRun(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'admin@helpdesk.local', 'admin']
      );
      console.log('✓ Admin user created (username: admin, password: admin)');
    } else {
      console.log('✓ Admin user already exists');
    }

    console.log('\n✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

createTables();
