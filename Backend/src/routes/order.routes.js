const router = require('express').Router();
const controller = require('../controllers/order.controller');

router.post('/', controller.createOrder);
router.get('/my', controller.listMyOrders);
router.get('/:id', controller.getMyOrder);

module.exports = router;