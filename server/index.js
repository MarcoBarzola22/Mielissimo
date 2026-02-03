const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Configuración básica
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Base de Datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Rutas Importadas
app.use("/api/admin", require("./routes/login")); 

// --- RUTAS DE PRODUCTOS (Backend Nuevo) ---

// 1. OBTENER PRODUCTOS (Con Categorías y Variantes)
app.get("/api/productos", (req, res) => {
  // Esta consulta es compleja: trae el producto y junta sus categorías en un string
  const sql = `
    SELECT p.*, 
           GROUP_CONCAT(DISTINCT c.nombre) as categorias_nombres,
           GROUP_CONCAT(DISTINCT c.id) as categorias_ids,
           (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', v.id, 'tipo', v.tipo, 'valor', v.valor, 'precio_extra', v.precio_extra)) 
            FROM variantes v WHERE v.producto_id = p.id) as variantes_json
    FROM productos p
    LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
    LEFT JOIN categorias c ON pc.categoria_id = c.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    
    // Convertir el JSON stringificado de variantes a objeto real
    const productos = result.map(prod => ({
        ...prod,
        variantes: prod.variantes_json ? JSON.parse(prod.variantes_json) : [],
        categorias_nombres: prod.categorias_nombres ? prod.categorias_nombres.split(',') : [],
        categorias_ids: prod.categorias_ids ? prod.categorias_ids.split(',').map(Number) : [],
        oferta: !!prod.oferta, // Convertir a boolean
        activo: !!prod.activo  // Convertir a boolean
    }));
    res.json(productos);
  });
});

// 2. CREAR PRODUCTO (Con Categorías y Variantes)
app.post("/api/productos", upload.single("imagen"), (req, res) => {
  const { nombre, descripcion, precio, stock, oferta, categorias, variantes } = req.body;
  const imagen = req.file ? req.file.filename : null;

  // Insertar Producto Base
  const sqlProd = "INSERT INTO productos (nombre, descripcion, precio, stock, imagen, oferta, activo) VALUES (?, ?, ?, ?, ?, ?, 1)";
  
  db.query(sqlProd, [nombre, descripcion, precio, stock, imagen, oferta === 'true' || oferta === '1'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const productoId = result.insertId;

    // A) Insertar Categorías (Si hay)
    if (categorias) {
        const catIds = JSON.parse(categorias); // Vienen como string "[1, 2]"
        if (catIds.length > 0) {
            const values = catIds.map(cId => [productoId, cId]);
            db.query("INSERT INTO producto_categorias (producto_id, categoria_id) VALUES ?", [values]);
        }
    }

    // B) Insertar Variantes (Si hay)
    if (variantes) {
        const vars = JSON.parse(variantes); // Vienen como string '[{"tipo":"Sabor","valor":"Frutilla"}]'
        if (vars.length > 0) {
            const values = vars.map(v => [productoId, v.tipo, v.valor, v.precio_extra || 0]);
            db.query("INSERT INTO variantes (producto_id, tipo, valor, precio_extra) VALUES ?", [values]);
        }
    }

    res.json({ message: "Producto creado con éxito", id: productoId });
  });
});

// 3. ELIMINAR PRODUCTO (Cascada borrará variantes y relaciones)
app.delete("/api/productos/:id", (req, res) => {
    db.query("DELETE FROM productos WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Eliminado" });
    });
});

// 4. OBTENER CATEGORÍAS
app.get("/api/categorias", (req, res) => {
    db.query("SELECT * FROM categorias", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// --- RUTAS EXTRA PARA CATEGORÍAS (Agrégalas al final de server/index.js) ---

// 5. CREAR CATEGORÍA
app.post("/api/categorias", (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });
    
    db.query("INSERT INTO categorias (nombre) VALUES (?)", [nombre], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, nombre });
    });
});

// 6. BORRAR CATEGORÍA
app.delete("/api/categorias/:id", (req, res) => {
    db.query("DELETE FROM categorias WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Categoría eliminada" });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});