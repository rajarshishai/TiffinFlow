const router = require('express').Router();
const controller = require('../controllers/coupon.controller');

router.post('/validate', controller.validateCoupon);

module.exports = router;