const { pool } = require('../config/db');

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

async function createOrder(req, res) {
  const { addressId, paymentMethod = 'cod', couponCode, notes, items } = req.body;

  if (!addressId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'addressId and at least one item are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [addressRows] = await connection.query(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, req.user.id]
    );
    if (!addressRows.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invalid delivery address' });
    }

    const ids = [...new Set(items.map(x => Number(x.menuItemId)).filter(Number.isInteger))];
    if (!ids.length || ids.length !== items.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invalid menu items' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const [menuRows] = await connection.query(
      `SELECT id, name, regular_price, subscription_price, mini_price, is_available
       FROM menu_items WHERE id IN (${placeholders})`,
      ids
    );

    const menuMap = new Map(menuRows.map(row => [Number(row.id), row]));
    let subtotal = 0;
    const normalizedItems = [];

    for (const item of items) {
      const menu = menuMap.get(Number(item.menuItemId));
      if (!menu || !menu.is_available) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Menu item ${item.menuItemId} is unavailable` });
      }

      const quantity = Math.max(1, Math.min(50, Number(item.quantity || 1)));
      const portion = item.portion === 'mini' ? 'mini' : 'regular';
      const planType = item.planType === 'subscription' ? 'subscription' : 'single';

      let unitPrice;
      if (portion === 'mini') {
        unitPrice = Number(menu.mini_price ?? menu.regular_price);
      } else {
        unitPrice = planType === 'subscription'
          ? Number(menu.subscription_price)
          : Number(menu.regular_price);
      }

      subtotal += unitPrice * quantity;
      normalizedItems.push({
        menuItemId: Number(menu.id),
        itemName: menu.name,
        portion,
        planType,
        unitPrice,
        quantity,
        customizations: JSON.stringify(item.customizations || []),
        instructions: item.instructions || null
      });
    }

    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const [couponRows] = await connection.query(
        `SELECT * FROM coupons
         WHERE code = ? AND is_active = 1
           AND (expires_at IS NULL OR expires_at > NOW())
           AND (usage_limit IS NULL OR used_count < usage_limit)
         LIMIT 1`,
        [String(couponCode).trim().toUpperCase()]
      );

      if (couponRows.length) {
        const coupon = couponRows[0];
        if (subtotal >= Number(coupon.min_order_value)) {
          discount = coupon.discount_type === 'percentage'
            ? subtotal * Number(coupon.discount_value) / 100
            : Number(coupon.discount_value);

          if (coupon.max_discount != null) {
            discount = Math.min(discount, Number(coupon.max_discount));
          }
          discount = Math.min(round2(discount), subtotal);
          couponId = coupon.id;
        }
      }
    }

    const deliveryFee = subtotal - discount >= 500 ? 0 : 40;
    const tax = round2((subtotal - discount) * 0.05);
    const total = round2(subtotal - discount + deliveryFee + tax);

    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (user_id, address_id, coupon_id, payment_method, subtotal, discount, delivery_fee, tax, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, addressId, couponId, paymentMethod, round2(subtotal), discount, deliveryFee, tax, total, notes || null]
    );

    for (const item of normalizedItems) {
      await connection.query(
        `INSERT INTO order_items
         (order_id, menu_item_id, item_name, portion, plan_type, unit_price, quantity, customizations, instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderResult.insertId, item.menuItemId, item.itemName, item.portion, item.planType,
         item.unitPrice, item.quantity, item.customizations, item.instructions]
      );
    }

    if (couponId) {
      await connection.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponId]);
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: { id: orderResult.insertId, subtotal: round2(subtotal), discount, deliveryFee, tax, total, status: 'pending' }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listMyOrders(req, res) {
  const [rows] = await pool.query(
    `SELECT id, status, payment_method AS paymentMethod, payment_status AS paymentStatus,
            subtotal, discount, delivery_fee AS deliveryFee, tax, total, placed_at AS placedAt
     FROM orders WHERE user_id = ? ORDER BY placed_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, orders: rows });
}

async function getMyOrder(req, res) {
  const [orders] = await pool.query(
    `SELECT id, status, payment_method AS paymentMethod, payment_status AS paymentStatus,
            subtotal, discount, delivery_fee AS deliveryFee, tax, total, notes, placed_at AS placedAt
     FROM orders WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id]
  );
  if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });

  const [items] = await pool.query(
    `SELECT menu_item_id AS menuItemId, item_name AS itemName, portion,
            plan_type AS planType, unit_price AS unitPrice, quantity,
            customizations, instructions
     FROM order_items WHERE order_id = ?`,
    [req.params.id]
  );

  res.json({ success: true, order: { ...orders[0], items } });
}

module.exports = { createOrder, listMyOrders, getMyOrder };