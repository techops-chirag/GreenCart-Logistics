const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken, requireManagerRole } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and manager role
router.use(authenticateToken, requireManagerRole);

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
