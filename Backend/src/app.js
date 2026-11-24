const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const addressRoutes = require('./routes/address.routes');
const orderRoutes = require('./routes/order.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const couponRoutes = require('./routes/coupon.routes');
const adminRoutes = require('./routes/admin.routes');

const { authenticate, requireAdmin } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200'
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TIFFIN FLOW API is running', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/addresses', authenticate, addressRoutes);
app.use('/api/orders', authenticate, orderRoutes);
app.use('/api/subscriptions', authenticate, subscriptionRoutes);
app.use('/api/coupons', authenticate, couponRoutes);
app.use('/api/admin', authenticate, requireAdmin, adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;