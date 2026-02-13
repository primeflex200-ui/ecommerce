const db = require('../db');

const createOrder = async (req, res) => {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');

        const { shippingAddress, paymentMethod } = req.body;
        const customerId = req.user.userId;

        const cartResult = await client.query(
            'SELECT c.*, p.vendor_id, p.price, p.name, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.customer_id = $1',
            [customerId]
        );

        if (cartResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cart is empty' });
        }

        for (const item of cartResult.rows) {
            if (item.quantity > item.stock) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
            }
        }

        const subtotal = cartResult.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05;
        const shipping = 50;
        const total = subtotal + tax + shipping;

        const orderId = 'CB' + Date.now().toString().slice(-8);

        const userResult = await client.query('SELECT first_name, last_name, email, phone FROM users WHERE id = $1', [customerId]);
        const user = userResult.rows[0];
        const customerName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

        await client.query(
            'INSERT INTO orders (id, customer_id, customer_name, customer_email, customer_phone, shipping_address, subtotal, tax, shipping, total, status, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [orderId, customerId, customerName, user.email, user.phone, shippingAddress, subtotal, tax, shipping, total, 'Pending', paymentMethod]
        );

        for (const item of cartResult.rows) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, vendor_id, product_name, quantity, unit_price, total_price, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [orderId, item.product_id, item.vendor_id, item.name, item.quantity, item.price, item.price * item.quantity, 'Pending']
            );

            await client.query(
                'UPDATE products SET stock = stock - $1, in_stock = CASE WHEN stock - $1 > 0 THEN true ELSE false END WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        await client.query('DELETE FROM cart WHERE customer_id = $1', [customerId]);

        await client.query('COMMIT');

        res.status(201).json({ success: true, orderId, total });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    } finally {
        client.release();
    }
};

const getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.user.userId;

        const result = await db.query(
            'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
            [customerId]
        );

        res.json({ success: true, orders: result.rows });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.userId;

        const orderResult = await db.query(
            'SELECT * FROM orders WHERE id = $1 AND customer_id = $2',
            [id, customerId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const itemsResult = await db.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [id]
        );

        res.json({
            success: true,
            order: orderResult.rows[0],
            items: itemsResult.rows
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

module.exports = {
    createOrder,
    getCustomerOrders,
    getOrderById
};
