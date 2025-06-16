const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = "claveultrasecreta123";

// Configuración de Multer para imágenes
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + "-" + file.originalname;
    cb(null, nombreUnico);
  }
});
const upload = multer({ storage });

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '..', 'client')));

// Conexión a MySQL
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

// Middleware de autenticación
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

// 🔶 CATEGORÍAS
app.get("/api/categorias", (req, res) => {
  db.query("SELECT * FROM categorias", (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error al obtener categorías" });
    res.json(resultados);
  });
});

app.post("/api/categorias", verificarToken, (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "Nombre requerido" });
  db.query("INSERT INTO categorias (nombre) VALUES (?)", [nombre], (err, resultado) => {
    if (err) return res.status(500).json({ error: "Error al agregar categoría" });
    res.status(201).json({ mensaje: "Categoría creada", id: resultado.insertId });
  });
});

app.put("/api/categorias/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "Nombre requerido" });

  db.query("UPDATE categorias SET nombre = ? WHERE id = ?", [nombre, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al actualizar categoría" });
    res.json({ mensaje: "Categoría actualizada correctamente" });
  });
});

app.delete("/api/categorias/:id", verificarToken, (req, res) => {
  const { id } = req.params;

  db.query("SELECT COUNT(*) AS cantidad FROM productos WHERE categoria_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al verificar productos" });

    if (result[0].cantidad > 0) {
      return res.status(400).json({ error: "No se puede eliminar la categoría porque tiene productos asociados" });
    }

    db.query("DELETE FROM categorias WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Error al eliminar categoría" });
      res.json({ mensaje: "Categoría eliminada correctamente" });
    });
  });
});

// 🔶 PRODUCTOS
app.get('/api/productos', (req, res) => {
  const { categoria } = req.query;
  let sql = `SELECT productos.*, categorias.nombre AS categoria_nombre 
             FROM productos LEFT JOIN categorias ON productos.categoria_id = categorias.id`;
  const valores = [];

  if (categoria) {
    sql += " WHERE productos.categoria_id = ?";
    valores.push(categoria);
  }

  db.query(sql, valores, (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos' });
    res.json(resultados);
  });
});

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

app.put('/api/productos/:id', verificarToken, upload.single("imagen"), (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, categoria_id } = req.body;

  if (!nombre || !precio || stock === undefined || !categoria_id) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  db.query('SELECT imagen FROM productos WHERE id = ?', [id], (err, resultados) => {
    if (err || resultados.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const productoActual = resultados[0];
    let sql, valores;

    if (req.file) {
      const imagenAnterior = productoActual.imagen;
      const nuevaImagen = "/uploads/" + req.file.filename;
      const rutaImagenAnterior = path.join(__dirname, '..', imagenAnterior);

      fs.unlink(rutaImagenAnterior, (err) => {
        if (err) console.warn("No se pudo eliminar imagen anterior:", err);
      });

      sql = 'UPDATE productos SET nombre = ?, precio = ?, imagen = ?, stock = ?, categoria_id = ? WHERE id = ?';
      valores = [nombre, precio, nuevaImagen, stock, categoria_id, id];
    } else {
      sql = 'UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria_id = ? WHERE id = ?';
      valores = [nombre, precio, stock, categoria_id, id];
    }

    db.query(sql, valores, (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar' });
      res.json({ mensaje: 'Producto actualizado correctamente' });
    });
  });
});

app.delete('/api/productos/:id', verificarToken, (req, res) => {
  const { id } = req.params;

  db.query("SELECT imagen FROM productos WHERE id = ?", [id], (err, resultados) => {
    if (err || resultados.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const imagen = resultados[0].imagen;
    const rutaImagen = path.join(__dirname, '..', imagen);

    db.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar producto' });

      fs.unlink(rutaImagen, (err) => {
        if (err) console.warn("No se pudo borrar la imagen:", err);
      });

      res.json({ mensaje: 'Producto eliminado correctamente' });
    });
  });
});

// 🔐 Login seguro
app.post('/api/admin/login', (req, res) => {
  const { usuario, clave } = req.body;
  db.query('SELECT * FROM admins WHERE usuario = ?', [usuario], (err, resultados) => {
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

// 🟢 Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
