const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM platform.category');
        res.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;