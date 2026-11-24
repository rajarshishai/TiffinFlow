const router = require('express').Router();
const controller = require('../controllers/admin.controller');

router.get('/dashboard', controller.dashboard);
router.get('/orders', controller.listOrders);
router.patch('/orders/:id/status', controller.updateOrderStatus);
router.post('/menu', controller.createMenuItem);
router.put('/menu/:id', controller.updateMenuItem);
router.patch('/menu/:id/stock', controller.updateStock);

module.exports = router;