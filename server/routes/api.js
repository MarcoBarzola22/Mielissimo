const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../utils/upload');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ---
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, username: user.username });
    });
});

router.post('/register', async (req, res) => { // Initial setup only
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Usuario creado' });
    });
});

// --- CATEGORIES ---
router.get('/categorias', (req, res) => {
    db.all('SELECT * FROM categories', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/categorias', authenticateToken, (req, res) => {
    const { nombre, emoji } = req.body;
    db.run('INSERT INTO categories (nombre, emoji) VALUES (?, ?)', [nombre, emoji], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, nombre, emoji });
    });
});

router.put('/categorias/:id', authenticateToken, (req, res) => {
    const { nombre, emoji } = req.body;
    db.run('UPDATE categories SET nombre = ?, emoji = ? WHERE id = ?', [nombre, emoji, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Categoría actualizada' });
    });
});

router.delete('/categorias/:id', authenticateToken, (req, res) => {
    const catId = req.params.id;
    // Check for dependent products
    db.all('SELECT p.name FROM products p JOIN product_categories pc ON p.id = pc.product_id WHERE pc.category_id = ?', [catId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar la categoría porque tiene productos asociados.',
                products: rows.map(r => r.name)
            });
        }
        db.run('DELETE FROM categories WHERE id = ?', [catId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Categoría eliminada' });
        });
    });
});

// --- PRODUCTS ---
router.get('/products', (req, res) => {
    const query = `
    SELECT p.*, 
    GROUP_CONCAT(c.id) as category_ids, 
    GROUP_CONCAT(c.nombre) as category_names 
    FROM products p 
    LEFT JOIN product_categories pc ON p.id = pc.product_id 
    LEFT JOIN categories c ON pc.category_id = c.id 
    GROUP BY p.id
  `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Fetch variants for each product - simpler to do N+1 for small scale or join all.
        // For simplicity, let's fetch all variants and map them in JS, or doing a separate query per product is too slow.
        // Better: Fetch all products, then fetch all variants, then merge.
        db.all('SELECT * FROM variants', [], (err, variants) => {
            if (err) return res.status(500).json({ error: err.message });

            const productsWithVariants = rows.map(p => ({
                ...p,
                variants: variants.filter(v => v.product_id === p.id),
                category: p.category_names ? p.category_names.split(',') : [], // Legacy support
                categoryIds: p.category_ids ? p.category_ids.split(',').map(Number) : []
            }));
            res.json(productsWithVariants);
        });
    });
});

router.get('/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        db.all('SELECT * FROM variants WHERE product_id = ?', [req.params.id], (err, variants) => {
            if (err) return res.status(500).json({ error: err.message });
            product.variants = variants;
            res.json(product);
        });
    });
});

router.post('/products', authenticateToken, upload.single('image'), (req, res) => {
    const { name, description, categories, variants, featured, old_price, is_offer } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    db.run('INSERT INTO products (name, description, image, featured, is_offer, old_price) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, image, featured ? 1 : 0, is_offer ? 1 : 0, old_price],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const productId = this.lastID;

            // Handle Categories
            if (categories) {
                const catIds = JSON.parse(categories); // Expecting JSON array string
                const stmt = db.prepare('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)');
                catIds.forEach(catId => stmt.run(productId, catId));
                stmt.finalize();
            }

            // Handle Variants
            if (variants) {
                const parsedVariants = JSON.parse(variants);
                const stmt = db.prepare('INSERT INTO variants (product_id, name, price) VALUES (?, ?, ?)');
                parsedVariants.forEach(v => stmt.run(productId, v.name, v.price));
                stmt.finalize();
            }

            res.json({ id: productId, message: 'Producto creado' });
        }
    );
});

router.put('/products/:id', authenticateToken, upload.single('image'), (req, res) => {
    const productId = req.params.id;
    const { name, description, categories, variants, featured, old_price, is_offer } = req.body;
    let imageUpdate = '';
    const params = [name, description, featured ? 1 : 0, is_offer ? 1 : 0, old_price, productId]; // Initial params

    if (req.file) {
        imageUpdate = ', image = ?';
        params.splice(2, 0, `/uploads/${req.file.filename}`); // Insert image param
    }

    // Need dynamic SQL for image update or handle it properly.
    // Simplest: if (req.file) UPDATE ... SET image=?, ... else UPDATE ...

    let sql = `UPDATE products SET name = ?, description = ?, featured = ?, is_offer = ?, old_price = ? ${req.file ? ', image = ?' : ''} WHERE id = ?`;
    // Rebuild params based on sql
    const finalParams = [name, description, featured ? 1 : 0, is_offer ? 1 : 0, old_price];
    if (req.file) finalParams.push(`/uploads/${req.file.filename}`);
    finalParams.push(productId);

    db.run(sql, finalParams, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Update Categories (wipe and recreate for simplicity)
        if (categories) {
            db.run('DELETE FROM product_categories WHERE product_id = ?', [productId], (err) => {
                if (!err) {
                    const catIds = JSON.parse(categories);
                    const stmt = db.prepare('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)');
                    catIds.forEach(catId => stmt.run(productId, catId));
                    stmt.finalize();
                }
            });
        }

        // Update Variants (wipe and recreate)
        if (variants) {
            db.run('DELETE FROM variants WHERE product_id = ?', [productId], (err) => {
                if (!err) {
                    const parsedVariants = JSON.parse(variants);
                    const stmt = db.prepare('INSERT INTO variants (product_id, name, price) VALUES (?, ?, ?)');
                    parsedVariants.forEach(v => stmt.run(productId, v.name, v.price));
                    stmt.finalize();
                }
            });
        }
        res.json({ message: 'Producto actualizado' });
    });
});

router.delete('/products/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto eliminado' });
    });
});

// --- ORDERS ---
router.post('/orders', (req, res) => {
    const { id, customer_name, customer_contact, total, delivery_method, delivery_zone, items } = req.body;
    const itemsJson = JSON.stringify(items);

    db.run(`INSERT INTO orders (id, customer_name, customer_contact, total, delivery_method, delivery_zone, items_json) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, customer_name, customer_contact, total, delivery_method, delivery_zone, itemsJson],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Pedido registrado' });
        }
    );
});

router.get('/orders/:id', (req, res) => {
    db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Pedido no encontrado' });
        row.items = JSON.parse(row.items_json);
        res.json(row);
    });
});

// --- BANNERS ---
router.get('/banners', (req, res) => {
    db.all('SELECT * FROM banners', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/banners', authenticateToken, upload.single('image'), (req, res) => {
    const { title, subtitle, bgColor, discount } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    db.run('INSERT INTO banners (title, subtitle, image, bgColor, discount) VALUES (?, ?, ?, ?, ?)',
        [title, subtitle, image, bgColor, discount],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Banner creado' });
        }
    );
});


module.exports = router;
