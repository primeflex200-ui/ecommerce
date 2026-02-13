const express = require('express');
const router = express.Router();
const { getDashboard, getProducts, createProduct, updateProduct, updateStock, deleteProduct, getOrders, updateOrderItemStatus } = require('../controllers/vendorController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('vendor'));

router.get('/dashboard', getDashboard);
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.put('/products/:id/stock', updateStock);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getOrders);
router.put('/orders/:orderId/items/:itemId/status', updateOrderItemStatus);

module.exports = router;
