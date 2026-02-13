const express = require('express');
const router = express.Router();
const { getDashboard, createVendor, getAllVendors, getAllOrders, updateOrderStatus, getAllProducts } = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/dashboard', getDashboard);
router.post('/vendors', createVendor);
router.get('/vendors', getAllVendors);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/products', getAllProducts);

module.exports = router;
