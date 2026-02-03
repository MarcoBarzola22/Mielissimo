const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname); },
});
const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use("/api/admin", require("./routes/login"));

// --- PRODUCTOS ---

// GET TODOS
app.get("/api/productos", (req, res) => {
  const sql = `
    SELECT p.*, 
           GROUP_CONCAT(DISTINCT c.id) as categorias_ids,
           GROUP_CONCAT(DISTINCT c.nombre) as categorias_nombres,
           (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', v.id, 'tipo', v.tipo, 'valor', v.valor, 'precio_extra', v.precio_extra)) 
            FROM variantes v WHERE v.producto_id = p.id) as variantes_json
    FROM productos p
    LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
    LEFT JOIN categorias c ON pc.categoria_id = c.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const productos = result.map(prod => ({
        ...prod,
        variantes: prod.variantes_json ? JSON.parse(prod.variantes_json) : [],
        categorias_ids: prod.categorias_ids ? prod.categorias_ids.split(',').map(Number) : [],
        categorias_nombres: prod.categorias_nombres ? prod.categorias_nombres.split(',') : [],
        oferta: !!prod.oferta,
        activo: !!prod.activo
    }));
    res.json(productos);
  });
});

// CREAR
app.post("/api/productos", upload.single("imagen"), (req, res) => {
  const { nombre, descripcion, precio, precio_oferta, oferta, categorias, variantes } = req.body;
  const imagen = req.file ? req.file.filename : null;
  const esOferta = oferta === 'true' || oferta === '1';

  const sql = "INSERT INTO productos (nombre, descripcion, precio, precio_oferta, oferta, imagen, activo) VALUES (?, ?, ?, ?, ?, ?, 1)";
  db.query(sql, [nombre, descripcion, precio, esOferta ? precio_oferta : null, esOferta, imagen], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const prodId = result.insertId;
    
    // Insertar Categorías
    if (categorias) {
        const catIds = JSON.parse(categorias);
        if (catIds.length > 0) {
            const values = catIds.map(cId => [prodId, cId]);
            db.query("INSERT INTO producto_categorias (producto_id, categoria_id) VALUES ?", [values]);
        }
    }
    // Insertar Variantes
    if (variantes) {
        const vars = JSON.parse(variantes);
        if (vars.length > 0) {
            const values = vars.map(v => [prodId, v.tipo, v.valor, v.precio_extra || 0]);
            db.query("INSERT INTO variantes (producto_id, tipo, valor, precio_extra) VALUES ?", [values]);
        }
    }
    res.json({ message: "Producto creado", id: prodId });
  });
});

// EDITAR (PUT)
app.put("/api/productos/:id", upload.single("imagen"), (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, precio, precio_oferta, oferta, categorias, variantes } = req.body;
    const imagen = req.file ? req.file.filename : undefined; // Undefined si no se sube nueva imagen
    const esOferta = oferta === 'true' || oferta === '1';

    // 1. Actualizar Datos Básicos
    let sql = "UPDATE productos SET nombre=?, descripcion=?, precio=?, precio_oferta=?, oferta=? WHERE id=?";
    let params = [nombre, descripcion, precio, esOferta ? precio_oferta : null, esOferta, id];
    
    if (imagen) {
        sql = "UPDATE productos SET nombre=?, descripcion=?, precio=?, precio_oferta=?, oferta=?, imagen=? WHERE id=?";
        params = [nombre, descripcion, precio, esOferta ? precio_oferta : null, esOferta, imagen, id];
    }

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. Actualizar Categorías (Borrar y re-insertar es lo más fácil)
        db.query("DELETE FROM producto_categorias WHERE producto_id = ?", [id], () => {
            if (categorias) {
                const catIds = JSON.parse(categorias);
                if (catIds.length > 0) {
                    const values = catIds.map(cId => [id, cId]);
                    db.query("INSERT INTO producto_categorias (producto_id, categoria_id) VALUES ?", [values]);
                }
            }
        });

        // 3. Actualizar Variantes (Borrar y re-insertar)
        db.query("DELETE FROM variantes WHERE producto_id = ?", [id], () => {
            if (variantes) {
                const vars = JSON.parse(variantes);
                if (vars.length > 0) {
                    const values = vars.map(v => [id, v.tipo, v.valor, v.precio_extra || 0]);
                    db.query("INSERT INTO variantes (producto_id, tipo, valor, precio_extra) VALUES ?", [values]);
                }
            }
            res.json({ message: "Producto actualizado" });
        });
    });
});

// ELIMINAR
app.delete("/api/productos/:id", (req, res) => {
    db.query("DELETE FROM productos WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Eliminado" });
    });
});

// --- CATEGORÍAS ---

app.get("/api/categorias", (req, res) => {
    // Traemos también el conteo de productos para saber si se pueden borrar
    const sql = `
        SELECT c.*, COUNT(pc.producto_id) as cantidad_productos 
        FROM categorias c 
        LEFT JOIN producto_categorias pc ON c.id = pc.categoria_id 
        GROUP BY c.id
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.post("/api/categorias", (req, res) => {
    db.query("INSERT INTO categorias (nombre) VALUES (?)", [req.body.nombre], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId });
    });
});

app.put("/api/categorias/:id", (req, res) => {
    db.query("UPDATE categorias SET nombre = ? WHERE id = ?", [req.body.nombre, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Actualizada" });
    });
});

app.delete("/api/categorias/:id", (req, res) => {
    // Primero verificamos si tiene productos
    db.query("SELECT COUNT(*) as count FROM producto_categorias WHERE categoria_id = ?", [req.params.id], (err, result) => {
        if (result[0].count > 0) {
            return res.status(400).json({ error: "No se puede eliminar: Esta categoría tiene productos." });
        }
        db.query("DELETE FROM categorias WHERE id = ?", [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Eliminada" });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});