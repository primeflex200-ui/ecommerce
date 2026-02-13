const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');

router.get('/', getAllCategories);
router.post('/', authenticateToken, requireRoles(['admin', 'vendor']), createCategory);
router.delete('/:id', authenticateToken, requireRoles(['admin', 'vendor']), deleteCategory);

module.exports = router;
