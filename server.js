require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Admin protection key (Loaded from .env)
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

app.use(express.json());
app.use(express.static('public'));

// Paths to our JSON data files
const CONFIG_PATH = path.join(__dirname, 'public', 'config.json');
const MENU_PATH = path.join(__dirname, 'public', 'menu.json');

// --- API Endpoints ---

// GET Config
app.get('/api/config', (req, res) => {
    try {
        const data = fs.readFileSync(CONFIG_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read config' });
    }
});

// POST Config (Save changes)
app.post('/api/config', (req, res) => {
    const adminKey = req.headers['x-admin-token'];
    if (!ADMIN_SECRET_KEY || adminKey !== ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const newData = req.body;
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(newData, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save config' });
    }
});

// GET Menu
app.get('/api/menu', (req, res) => {
    try {
        const data = fs.readFileSync(MENU_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read menu' });
    }
});

// POST Menu (Save changes)
app.post('/api/menu', (req, res) => {
    const adminKey = req.headers['x-admin-token'];
    if (!ADMIN_SECRET_KEY || adminKey !== ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const newData = req.body;
        // The menu.json has a "menu" property that contains the array
        const fullData = { promo: { enabled: false }, menu: newData };
        fs.writeFileSync(MENU_PATH, JSON.stringify(fullData, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save menu' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
