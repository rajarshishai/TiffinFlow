const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res) {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, message: 'fullName, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existing.length) {
    return res.status(409).json({ success: false, message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
    [String(fullName).trim(), normalizedEmail, passwordHash, phone || null]
  );

  const user = {
    id: result.insertId,
    full_name: String(fullName).trim(),
    email: normalizedEmail,
    phone: phone || null,
    role: 'customer'
  };

  res.status(201).json({ success: true, message: 'Registration successful', token: signToken(user), user });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const [rows] = await pool.query(
    'SELECT id, full_name, email, phone, role, is_active, password_hash FROM users WHERE email = ? LIMIT 1',
    [String(email).trim().toLowerCase()]
  );

  if (!rows.length || !rows[0].is_active) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  delete user.password_hash;
  res.json({ success: true, token: signToken(user), user });
}

async function me(req, res) {
  res.json({ success: true, user: req.user });
}

module.exports = { register, login, me };