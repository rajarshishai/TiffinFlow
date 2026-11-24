const router = require('express').Router();
const controller = require('../controllers/subscription.controller');

router.post('/', controller.createSubscription);
router.get('/my', controller.listMySubscriptions);
router.patch('/:id/pause', controller.pauseSubscription);
router.patch('/:id/cancel', controller.cancelSubscription);

module.exports = router;