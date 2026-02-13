const db = require('../db');

const getDashboard = async (req, res) => {
    try {
        const vendorId = req.user.vendorId;

        const vendorResult = await db.query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
        const vendorInfo = vendorResult.rows[0];

        const productsResult = await db.query('SELECT COUNT(*) as count FROM products WHERE vendor_id = $1', [vendorId]);
        const totalProducts = parseInt(productsResult.rows[0].count);

        const ordersResult = await db.query('SELECT COUNT(DISTINCT order_id) as count FROM order_items WHERE vendor_id = $1', [vendorId]);
        const totalOrders = parseInt(ordersResult.rows[0].count);

        const revenueResult = await db.query('SELECT SUM(total_price) as revenue FROM order_items WHERE vendor_id = $1', [vendorId]);
        const revenue = parseFloat(revenueResult.rows[0].revenue) || 0;

        res.json({
            success: true,
            vendorInfo,
            totalProducts,
            totalOrders,
            revenue
        });
    } catch (error) {
        console.error('Vendor dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

const getProducts = async (req, res) => {
    try {
        const vendorId = req.user.vendorId;

        const result = await db.query(
            'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
            [vendorId]
        );

        res.json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Get vendor products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, category, subcategory, price, stock, unit, description, imageUrl } = req.body;
        const vendorId = req.user.vendorId;

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

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, subcategory, price, stock, unit, description } = req.body;
        const vendorId = req.user.vendorId;

        const checkResult = await db.query('SELECT * FROM products WHERE id = $1 AND vendor_id = $2', [id, vendorId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or unauthorized' });
        }

        const inStock = stock > 0;

        await db.query(
            'UPDATE products SET name = $1, category = $2, subcategory = $3, price = $4, stock = $5, unit = $6, description = $7, in_stock = $8, updated_at = NOW() WHERE id = $9',
            [name, category, subcategory, price, stock, unit, description, inStock, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        const vendorId = req.user.vendorId;

        const checkResult = await db.query('SELECT * FROM products WHERE id = $1 AND vendor_id = $2', [id, vendorId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or unauthorized' });
        }

        const inStock = stock > 0;

        await db.query(
            'UPDATE products SET stock = $1, in_stock = $2, updated_at = NOW() WHERE id = $3',
            [stock, inStock, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: 'Failed to update stock' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.vendorId;

        const checkResult = await db.query('SELECT * FROM products WHERE id = $1 AND vendor_id = $2', [id, vendorId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or unauthorized' });
        }

        await db.query("UPDATE products SET status = 'inactive' WHERE id = $1", [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

const getOrders = async (req, res) => {
    try {
        const vendorId = req.user.vendorId;

        const result = await db.query(
            'SELECT oi.*, o.customer_name, o.customer_email, o.customer_phone, o.shipping_address, o.created_at as order_date FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.vendor_id = $1 ORDER BY oi.created_at DESC',
            [vendorId]
        );

        res.json({ success: true, orders: result.rows });
    } catch (error) {
        console.error('Get vendor orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

const updateOrderItemStatus = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { status, deliveryDate } = req.body;
        const vendorId = req.user.vendorId;

        const checkResult = await db.query(
            'SELECT * FROM order_items WHERE id = $1 AND order_id = $2 AND vendor_id = $3',
            [itemId, orderId, vendorId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order item not found or unauthorized' });
        }

        await db.query(
            'UPDATE order_items SET status = $1, delivery_date = $2, updated_at = NOW() WHERE id = $3',
            [status, deliveryDate, itemId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update order item status error:', error);
        res.status(500).json({ error: 'Failed to update order item status' });
    }
};

module.exports = {
    getDashboard,
    getProducts,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    getOrders,
    updateOrderItemStatus
};
