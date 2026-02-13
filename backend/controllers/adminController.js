const bcrypt = require('bcrypt');
const db = require('../db');

const getDashboard = async (req, res) => {
    try {
        const ordersResult = await db.query('SELECT COUNT(*) as count FROM orders');
        const totalOrders = parseInt(ordersResult.rows[0].count);

        const revenueResult = await db.query("SELECT SUM(total) as revenue FROM orders WHERE status != 'Cancelled'");
        const totalRevenue = parseFloat(revenueResult.rows[0].revenue) || 0;

        const productsResult = await db.query("SELECT COUNT(*) as count FROM products WHERE status = 'active'");
        const totalProducts = parseInt(productsResult.rows[0].count);

        const vendorsResult = await db.query("SELECT COUNT(*) as count FROM vendors WHERE status = 'active'");
        const totalVendors = parseInt(vendorsResult.rows[0].count);

        const recentOrders = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10');

        res.json({
            success: true,
            totalOrders,
            totalRevenue,
            totalProducts,
            totalVendors,
            recentOrders: recentOrders.rows
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

const createVendor = async (req, res) => {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');

        const { vendorName, businessName, email, password, phone } = req.body;

        const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResult = await client.query(
            'INSERT INTO users (email, password, role, first_name) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, hashedPassword, 'vendor', vendorName]
        );

        const userId = userResult.rows[0].id;

        const vendorResult = await client.query(
            'INSERT INTO vendors (user_id, vendor_name, business_name, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, vendorName, businessName, email, phone]
        );

        await client.query('COMMIT');

        res.status(201).json({ success: true, vendor: vendorResult.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create vendor error:', error);
        res.status(500).json({ error: 'Failed to create vendor' });
    } finally {
        client.release();
    }
};

const getAllVendors = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM vendors ORDER BY created_at DESC');
        res.json({ success: true, vendors: result.rows });
    } catch (error) {
        console.error('Get vendors error:', error);
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        let query = 'SELECT * FROM orders';
        const params = [];
        
        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const offset = (page - 1) * limit;
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        const countQuery = status ? 'SELECT COUNT(*) FROM orders WHERE status = $1' : 'SELECT COUNT(*) FROM orders';
        const countParams = status ? [status] : [];
        const countResult = await db.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            orders: result.rows,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await db.query(
            'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
            [status, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT p.*, v.vendor_name, v.business_name FROM products p LEFT JOIN vendors v ON p.vendor_id = v.id ORDER BY p.created_at DESC'
        );
        res.json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

module.exports = {
    getDashboard,
    createVendor,
    getAllVendors,
    getAllOrders,
    updateOrderStatus,
    getAllProducts
};
