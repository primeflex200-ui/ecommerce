const express = require('express');
const router = express.Router();
const { 
    getDashboard, 
    createVendor, 
    getAllVendors, 
    getVendorById,
    updateVendor,
    deleteVendor,
    getAllOrders, 
    updateOrderStatus, 
    getAllProducts 
} = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/dashboard', getDashboard);

// Vendor Management Routes
router.post('/vendors', createVendor);
router.get('/vendors', getAllVendors);
router.get('/vendors/:id', getVendorById);
router.put('/vendors/:id', updateVendor);
router.delete('/vendors/:id', deleteVendor);

// Order Management Routes
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Product Management Routes
router.get('/products', getAllProducts);

module.exports = router;
