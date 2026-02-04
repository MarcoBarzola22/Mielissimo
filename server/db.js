const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'mielissimo.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

// Initialize tables
db.serialize(() => {
  // Categories Table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    emoji TEXT
  )`);

  // Products Table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    featured INTEGER DEFAULT 0, -- 0: false, 1: true
    is_offer INTEGER DEFAULT 0, -- 0: false, 1: true
    old_price REAL
  )`);
  
  // Product Categories (Many-to-Many)
  db.run(`CREATE TABLE IF NOT EXISTS product_categories (
    product_id INTEGER,
    category_id INTEGER,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
  )`);

  // Variants Table
  db.run(`CREATE TABLE IF NOT EXISTS variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
  )`);

  // Orders Table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- WhatsApp-friendly ID
    customer_name TEXT,
    customer_contact TEXT,
    total REAL NOT NULL,
    delivery_method TEXT NOT NULL, -- 'pickup' or 'delivery'
    delivery_zone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    items_json TEXT NOT NULL -- Store items snapshot as JSON
  )`);
  
   // Users (Admins) Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  // Banners Table
  db.run(`CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    subtitle TEXT,
    image TEXT NOT NULL,
    bgColor TEXT DEFAULT 'from-amber-500 to-orange-600',
    discount TEXT
  )`);

  console.log('✅ Tables initialized.');
});

module.exports = db;
