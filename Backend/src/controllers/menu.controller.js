const { pool } = require('../config/db');

async function listMenu(req, res) {
  const { category, available } = req.query;
  let sql = `
    SELECT id, name, description, category, regular_price AS regularPrice,
           subscription_price AS subscriptionPrice, mini_price AS miniPrice,
           is_veg AS isVeg, image_url AS image, calories, protein, carbs, fat, fiber,
           spice_level AS spiceLevel, is_available AS isAvailable
    FROM menu_items
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (available !== 'false') {
    sql += ' AND is_available = 1';
  }

  sql += ' ORDER BY category, name';
  const [rows] = await pool.query(sql, params);
  res.json({ success: true, items: rows });
}

async function getMenuItem(req, res) {
  const [rows] = await pool.query(
    `SELECT id, name, description, category, regular_price AS regularPrice,
            subscription_price AS subscriptionPrice, mini_price AS miniPrice,
            is_veg AS isVeg, image_url AS image, calories, protein, carbs, fat, fiber,
            spice_level AS spiceLevel, is_available AS isAvailable
     FROM menu_items WHERE id = ?`,
    [req.params.id]
  );

  if (!rows.length) return res.status(404).json({ success: false, message: 'Menu item not found' });
  res.json({ success: true, item: rows[0] });
}

module.exports = { listMenu, getMenuItem };