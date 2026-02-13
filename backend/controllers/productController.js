const db = require('../db');

const getAllProducts = async (req, res) => {
    try {
        const { category, inStock, page = 1, limit = 20 } = req.query;
        
        let query = 'SELECT p.*, v.vendor_name, v.business_name FROM products p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE p.status = $1';
        const params = ['active'];
        let paramCount = 1;

        if (category) {
            paramCount++;
            query += ` AND p.category = $${paramCount}`;
            params.push(category);
        }

        if (inStock === 'true') {
            query += ' AND p.in_stock = true AND p.stock > 0';
        }

        query += ' ORDER BY p.created_at DESC';

        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        const countQuery = 'SELECT COUNT(*) FROM products WHERE status = $1';
        const countResult = await db.query(countQuery, ['active']);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            products: result.rows,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'SELECT p.*, v.vendor_name, v.business_name FROM products p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE p.id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, category, subcategory, price, stock, unit, description, imageUrl } = req.body;
        const vendorId = req.user.vendorId;

        if (!vendorId) {
            return res.status(403).json({ error: 'Only vendors can create products' });
        }

        const inStock = stock > 0;

        const result = await db.query(
            'INSERT INTO products (vendor_id, name, category, subcategory, price, stock, unit, description, image_url, in_stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [vendorId, name, category, subcategory, price, stock, unit, description, imageUrl, inStock]
        );

        res.status(201).json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct
};
