const express = require('express');
const router = express.Router();
const { createOrder, getCustomerOrders, getOrderById } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getCustomerOrders);
router.get('/:id', authenticateToken, getOrderById);

module.exports = router;
