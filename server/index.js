const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + "-" + file.originalname;
    cb(null, nombreUnico);
  }
});

const upload = multer({ storage });
const app = express();
const PORT = 3000;
const JWT_SECRET = "claveultrasecreta123";

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '..', 'client')));

// Conexión MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '44994334marco',
  database: 'mielissimo'
});

db.connect((err) => {
  if (err) console.error('Error DB:', err);
  else console.log('MySQL conectado');
});

// Middleware para proteger rutas
function verificarToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });

  const token = auth.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.usuario = decoded.usuario;
    next();
  });
}

// 🔄 Obtener productos (con filtro opcional por categoría)
app.get('/api/productos', (req, res) => {
  const { categoria } = req.query;

  let sql = 'SELECT id, nombre, precio, imagen, stock FROM productos';
  let valores = [];

  if (categoria) {
    sql += ' WHERE categoria_id = ?';
    valores.push(categoria);
  }

  db.query(sql, valores, (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los productos' });
    console.log("Productos enviados al cliente:", resultados);
    res.json(resultados);
  });
});

// ✅ Obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  const sql = 'SELECT id, nombre FROM categorias';

  db.query(sql, (err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }

    res.json(resultados);
  });
});

// ➕ Agregar producto
app.post('/api/productos', verificarToken, upload.single("imagen"), (req, res) => {
  const { nombre, precio, stock, categoria_id } = req.body;
  const imagen = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nombre || !precio || !imagen || stock === undefined || !categoria_id) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const sql = 'INSERT INTO productos (nombre, precio, imagen, stock, categoria_id) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nombre, precio, imagen, stock, categoria_id], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al insertar' });
    res.status(201).json({ mensaje: 'Producto agregado', id: resultado.insertId });
  });
});

// 📝 Editar producto
app.put('/api/productos/:id', verificarToken, upload.single("imagen"), (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, categoria_id } = req.body;

  if (!nombre || !precio || stock === undefined || !categoria_id) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  let sql, valores;

  if (req.file) {
    const imagen = "/uploads/" + req.file.filename;
    sql = 'UPDATE productos SET nombre = ?, precio = ?, imagen = ?, stock = ?, categoria_id = ? WHERE id = ?';
    valores = [nombre, precio, imagen, stock, categoria_id, id];
  } else {
    sql = 'UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria_id = ? WHERE id = ?';
    valores = [nombre, precio, stock, categoria_id, id];
  }

  db.query(sql, valores, (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar' });
    res.json({ mensaje: 'Producto actualizado correctamente' });
  });
});

// 🗑️ Eliminar producto y su imagen
app.delete('/api/productos/:id', verificarToken, (req, res) => {
  const { id } = req.params;

  // Primero obtenemos la imagen
  const sqlSelect = 'SELECT imagen FROM productos WHERE id = ?';
  db.query(sqlSelect, [id], (err, resultados) => {
    if (err || resultados.length === 0) {
      return res.status(500).json({ error: 'Error al buscar producto' });
    }

    const imagen = resultados[0].imagen;
    const rutaImagen = path.join(__dirname, '..', imagen);

    // Luego eliminamos el producto
    const sqlDelete = 'DELETE FROM productos WHERE id = ?';
    db.query(sqlDelete, [id], (err, resultado) => {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar producto' });
      }

      if (fs.existsSync(rutaImagen)) {
        fs.unlink(rutaImagen, (err) => {
          if (err) console.error("No se pudo borrar imagen:", err);
        });
      }

      res.json({ mensaje: 'Producto eliminado correctamente' });
    });
  });
});

// 🔐 Login seguro
app.post('/api/admin/login', (req, res) => {
  const { usuario, clave } = req.body;
  const sql = 'SELECT * FROM admins WHERE usuario = ?';
  db.query(sql, [usuario], (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error en DB' });
    if (resultados.length === 0) return res.status(401).json({ error: 'Usuario no existe' });

    const admin = resultados[0];
    bcrypt.compare(clave, admin.clave, (err, esValida) => {
      if (err || !esValida) return res.status(401).json({ error: 'Clave incorrecta' });

      const token = jwt.sign({ usuario: admin.usuario }, JWT_SECRET, { expiresIn: '2h' });
      res.status(200).json({ mensaje: 'Login exitoso', token });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
