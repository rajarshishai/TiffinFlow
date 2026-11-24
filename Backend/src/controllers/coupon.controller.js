const { pool } = require('../config/db');

async function validateCoupon(req, res) {
  const code = String(req.body.code || '').trim().toUpperCase();
  const subtotal = Number(req.body.subtotal || 0);

  if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

  const [rows] = await pool.query(
    `SELECT id, code, discount_type AS discountType, discount_value AS discountValue,
            min_order_value AS minOrderValue, max_discount AS maxDiscount
     FROM coupons
     WHERE code = ? AND is_active = 1
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (usage_limit IS NULL OR used_count < usage_limit)
     LIMIT 1`,
    [code]
  );

  if (!rows.length) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });

  const coupon = rows[0];
  if (subtotal < Number(coupon.minOrderValue)) {
    return res.status(400).json({
      success: false,
      message: `Minimum order value is ₹${coupon.minOrderValue}`
    });
  }

  let discount = coupon.discountType === 'percentage'
    ? subtotal * Number(coupon.discountValue) / 100
    : Number(coupon.discountValue);

  if (coupon.maxDiscount != null) discount = Math.min(discount, Number(coupon.maxDiscount));
  discount = Math.min(discount, subtotal);

  res.json({ success: true, coupon: { ...coupon, discount: Math.round(discount * 100) / 100 } });
}

module.exports = { validateCoupon };