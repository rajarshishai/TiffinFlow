const { pool } = require('../config/db');

async function dashboard(req, res) {
  const [[users]] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = "customer"');
  const [[orders]] = await pool.query('SELECT COUNT(*) AS count FROM orders');
  const [[pending]] = await pool.query('SELECT COUNT(*) AS count FROM orders WHERE status IN ("pending","confirmed","preparing")');
  const [[revenue]] = await pool.query('SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE payment_status = "paid" OR status = "delivered"');

  res.json({
    success: true,
    dashboard: {
      customers: Number(users.count),
      orders: Number(orders.count),
      activeOrders: Number(pending.count),
      revenue: Number(revenue.total)
    }
  });
}

async function listOrders(req, res) {
  const [rows] = await pool.query(
    `SELECT o.id, o.status, o.payment_status AS paymentStatus, o.payment_method AS paymentMethod,
            o.subtotal, o.discount, o.delivery_fee AS deliveryFee, o.tax, o.total,
            o.placed_at AS placedAt, u.full_name AS customerName, u.phone
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.placed_at DESC`
  );
  res.json({ success: true, orders: rows });
}

async function updateOrderStatus(req, res) {
  const allowed = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status' });
  }

  const [result] = await pool.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [req.body.status, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Order not found' });

  res.json({ success: true, message: 'Order status updated' });
}

async function createMenuItem(req, res) {
  const {
    name, description, category, regularPrice, subscriptionPrice, miniPrice,
    isVeg = true, imageUrl, calories, protein, carbs, fat, fiber, spiceLevel = 1
  } = req.body;

  if (!name || !category || regularPrice == null || subscriptionPrice == null) {
    return res.status(400).json({ success: false, message: 'name, category, regularPrice and subscriptionPrice are required' });
  }

  const [result] = await pool.query(
    `INSERT INTO menu_items
     (name, description, category, regular_price, subscription_price, mini_price,
      is_veg, image_url, calories, protein, carbs, fat, fiber, spice_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, description || null, category, regularPrice, subscriptionPrice, miniPrice ?? null,
     !!isVeg, imageUrl || null, calories ?? null, protein ?? null, carbs ?? null,
     fat ?? null, fiber ?? null, spiceLevel]
  );

  res.status(201).json({ success: true, menuItemId: result.insertId });
}

async function updateMenuItem(req, res) {
  const allowed = ['name','description','category','regularPrice','subscriptionPrice','miniPrice','isVeg','imageUrl','calories','protein','carbs','fat','fiber','spiceLevel'];
  const fields = [];
  const values = [];

  const map = {
    regularPrice: 'regular_price',
    subscriptionPrice: 'subscription_price',
    miniPrice: 'mini_price',
    isVeg: 'is_veg',
    imageUrl: 'image_url',
    spiceLevel: 'spice_level'
  };

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      fields.push(`${map[key] || key} = ?`);
      values.push(req.body[key]);
    }
  }

  if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });

  values.push(req.params.id);
  const [result] = await pool.query(`UPDATE menu_items SET ${fields.join(', ')} WHERE id = ?`, values);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Menu item not found' });

  res.json({ success: true, message: 'Menu item updated' });
}

async function updateStock(req, res) {
  const [result] = await pool.query(
    'UPDATE menu_items SET is_available = ? WHERE id = ?',
    [!!req.body.isAvailable, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Menu item not found' });
  res.json({ success: true, message: 'Stock status updated' });
}

module.exports = { dashboard, listOrders, updateOrderStatus, createMenuItem, updateMenuItem, updateStock };