import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbAll, dbRun } from '../config/database.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    let user;

    // First try exact username match
    user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);

    // If no exact username match, try email match (full email or prefix)
    if (!user) {
      // Check if input contains @ - if so, treat as full email
      if (username.includes('@')) {
        user = await dbGet('SELECT * FROM users WHERE email = ?', [username]);
      } else {
        // Treat as email prefix and try to match @helpdesk.pt emails
        user = await dbGet('SELECT * FROM users WHERE email = ?', [`${username}@helpdesk.pt`]);
        
        // If still no match, try other common domains or just search by username again
        if (!user) {
          user = await dbGet('SELECT * FROM users WHERE username = ? OR email LIKE ?', [username, `${username}@%`]);
        }
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, username, email, role FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};