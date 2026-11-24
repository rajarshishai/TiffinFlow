const { pool } = require('../config/db');

const priceMap = { weekly: 120, monthly: 105, yearly: 85 };

function cycleDays(cycle) {
  return cycle === 'weekly' ? 7 : cycle === 'monthly' ? 30 : 365;
}

async function createSubscription(req, res) {
  const {
    addressId, billingCycle = 'monthly', frequency = 1,
    mealType = 'lunch', dietType = 'veg', packaging = 'eco'
  } = req.body;

  if (!addressId || !priceMap[billingCycle]) {
    return res.status(400).json({ success: false, message: 'addressId and valid billingCycle are required' });
  }
  if (![1, 2].includes(Number(frequency))) {
    return res.status(400).json({ success: false, message: 'frequency must be 1 or 2' });
  }
  if (!['lunch','dinner','both'].includes(mealType) ||
      !['veg','non-veg','fitness','jain'].includes(dietType) ||
      !['eco','disposable'].includes(packaging)) {
    return res.status(400).json({ success: false, message: 'Invalid subscription options' });
  }

  const [address] = await pool.query(
    'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
    [addressId, req.user.id]
  );
  if (!address.length) return res.status(400).json({ success: false, message: 'Invalid address' });

  const multiplier = dietType === 'non-veg' ? 1.2 : dietType === 'fitness' ? 1.25 : 1;
  const packagingFee = packaging === 'disposable' ? 5 : 0;
  const meals = (billingCycle === 'weekly' ? 6 : billingCycle === 'monthly' ? 26 : 312) * Number(frequency);
  const pricePerMeal = priceMap[billingCycle] * multiplier + packagingFee;
  const totalPrice = Math.round(pricePerMeal * meals);

  const [result] = await pool.query(
    `INSERT INTO subscriptions
     (user_id, address_id, billing_cycle, frequency, meal_type, diet_type, packaging,
      price_per_meal, total_price, start_date, next_billing_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))`,
    [req.user.id, addressId, billingCycle, Number(frequency), mealType, dietType, packaging,
     Math.round(pricePerMeal * 100) / 100, totalPrice, cycleDays(billingCycle)]
  );

  res.status(201).json({
    success: true,
    message: 'Subscription created',
    subscriptionId: result.insertId,
    totalPrice,
    pricePerMeal: Math.round(pricePerMeal * 100) / 100
  });
}

async function listMySubscriptions(req, res) {
  const [rows] = await pool.query(
    `SELECT id, address_id AS addressId, billing_cycle AS billingCycle, frequency,
            meal_type AS mealType, diet_type AS dietType, packaging,
            price_per_meal AS pricePerMeal, total_price AS totalPrice,
            status, start_date AS startDate, end_date AS endDate,
            next_billing_date AS nextBillingDate
     FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, subscriptions: rows });
}

async function pauseSubscription(req, res) {
  const { pauseStart, pauseEnd, reason } = req.body;
  if (!pauseStart || !pauseEnd) {
    return res.status(400).json({ success: false, message: 'pauseStart and pauseEnd are required' });
  }

  const [owned] = await pool.query(
    'SELECT id FROM subscriptions WHERE id = ? AND user_id = ? AND status = "active"',
    [req.params.id, req.user.id]
  );
  if (!owned.length) return res.status(404).json({ success: false, message: 'Active subscription not found' });

  await pool.query(
    `INSERT INTO subscription_pauses (subscription_id, pause_start, pause_end, reason)
     VALUES (?, ?, ?, ?)`,
    [req.params.id, pauseStart, pauseEnd, reason || null]
  );
  await pool.query(
    'UPDATE subscriptions SET status = "paused" WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  res.json({ success: true, message: 'Subscription paused' });
}

async function cancelSubscription(req, res) {
  const [result] = await pool.query(
    'UPDATE subscriptions SET status = "cancelled", end_date = CURDATE() WHERE id = ? AND user_id = ? AND status <> "cancelled"',
    [req.params.id, req.user.id]
  );
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Subscription not found' });
  res.json({ success: true, message: 'Subscription cancelled' });
}

module.exports = { createSubscription, listMySubscriptions, pauseSubscription, cancelSubscription };