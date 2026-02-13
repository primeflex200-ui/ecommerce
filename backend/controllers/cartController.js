const db = require('../db');

const getCart = async (req, res) => {
    try {
        const customerId = req.user.userId;

        const result = await db.query(
            'SELECT c.*, p.name, p.price, p.image_url, p.stock, p.in_stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.customer_id = $1',
            [customerId]
        );

        const total = result.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({ success: true, cart: result.rows, total });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const customerId = req.user.userId;

        const productResult = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = productResult.rows[0];
        if (!product.in_stock || product.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        const existingResult = await db.query(
            'SELECT * FROM cart WHERE customer_id = $1 AND product_id = $2',
            [customerId, productId]
        );

        if (existingResult.rows.length > 0) {
            await db.query(
                'UPDATE cart SET quantity = quantity + $1, updated_at = NOW() WHERE customer_id = $2 AND product_id = $3',
                [quantity, customerId, productId]
            );
        } else {
            await db.query(
                'INSERT INTO cart (customer_id, product_id, quantity) VALUES ($1, $2, $3)',
                [customerId, productId, quantity]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const customerId = req.user.userId;

        if (quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' });
        }

        await db.query(
            'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE id = $2 AND customer_id = $3',
            [quantity, itemId, customerId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ error: 'Failed to update cart item' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const customerId = req.user.userId;

        await db.query(
            'DELETE FROM cart WHERE id = $1 AND customer_id = $2',
            [itemId, customerId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
};

const clearCart = async (req, res) => {
    try {
        const customerId = req.user.userId;

        await db.query('DELETE FROM cart WHERE customer_id = $1', [customerId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
