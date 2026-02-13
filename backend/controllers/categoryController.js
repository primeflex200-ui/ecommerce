const db = require('../db');

const getAllCategories = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM categories WHERE status = 'active' ORDER BY name");
        res.json({ success: true, categories: result.rows });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingResult = await db.query('SELECT * FROM categories WHERE name = $1', [name]);
        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const result = await db.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );

        res.status(201).json({ success: true, category: result.rows[0] });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("UPDATE categories SET status = 'inactive' WHERE id = $1", [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    deleteCategory
};
