const router = require('express').Router();
const controller = require('../controllers/address.controller');

router.get('/', controller.listAddresses);
router.post('/', controller.createAddress);
router.put('/:id', controller.updateAddress);
router.delete('/:id', controller.deleteAddress);

module.exports = router;