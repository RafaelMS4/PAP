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
