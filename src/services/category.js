const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM platform.category');
        categories = [];
        for (const row of result.rows) {
            if (row.parent === null) {
                subcategories = result.rows.filter(r => r.parent === row.id);
                row.subcategories = subcategories;
                categories.push(row);
                console.log(row.name, subcategories.length);
            }
        }
        for (const category of categories) {
            for (const subcategory of category.subcategories) {
                subsubcategories = result.rows.filter(r => r.parent === subcategory.id);
                subcategory.subcategories = subsubcategories;
            }
        }
        console.log(categories.length, "categories loaded");
        res.json(categories);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;