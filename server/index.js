const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // ✅ necesario para validar claves cifradas
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // permite servir imágenes cargadas
app.use(express.static(path.join(__dirname, '..', 'client')));



// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '44994334marco',
  database: 'mielissimo'
});

db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

// Obtener productos
app.get('/api/productos', (req, res) => {
  const sql = 'SELECT id, nombre, precio, imagen, stock FROM productos';
  db.query(sql, (err, resultados) => {
    if (err) {
      console.error('Error al obtener los productos:', err);
      res.status(500).json({ error: 'Error al obtener los productos' });
    } else {
      res.json(resultados);
    }
  });
});

// Agregar producto
app.post('/api/productos', (req, res) => {
  const { nombre, precio, imagen, stock } = req.body;

  if (!nombre || !precio || !imagen || stock === undefined) {
    return res.status(400).json({ error: 'Faltan datos del producto' });
  }

  const sql = 'INSERT INTO productos (nombre, precio, imagen, stock) VALUES (?, ?, ?, ?)';
  const valores = [nombre, precio, imagen, stock];

  db.query(sql, valores, (err, resultado) => {
    if (err) {
      console.error('Error al insertar producto:', err);
      res.status(500).json({ error: 'Error al insertar el producto' });
    } else {
      res.status(201).json({ mensaje: 'Producto agregado con éxito', id: resultado.insertId });
    }
  });
});

// Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
  const productoId = req.params.id;
  const sql = 'DELETE FROM productos WHERE id = ?';

  db.query(sql, [productoId], (err, resultado) => {
    if (err) {
      console.error('Error al eliminar el producto:', err);
      res.status(500).json({ error: 'Error al eliminar el producto' });
    } else {
      res.json({ mensaje: 'Producto eliminado correctamente' });
    }
  });
});

// Editar producto
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, imagen, stock } = req.body;

  if (!nombre || !precio || !imagen || stock === undefined) {
    return res.status(400).json({ error: 'Faltan datos del producto' });
  }

  const sql = 'UPDATE productos SET nombre = ?, precio = ?, imagen = ?, stock = ? WHERE id = ?';
  const valores = [nombre, precio, imagen, stock, id];

  db.query(sql, valores, (err, resultado) => {
    if (err) {
      console.error('Error al actualizar el producto:', err);
      res.status(500).json({ error: 'Error al actualizar el producto' });
    } else {
      res.json({ mensaje: 'Producto actualizado correctamente' });
    }
  });
});

// 🔐 Ruta de login con validación segura desde base de datos
// Ruta de login protegida
app.post('/api/admin/login', (req, res) => {
  const { usuario, clave } = req.body;

  const sql = 'SELECT * FROM admins WHERE usuario = ?';
  db.query(sql, [usuario], (err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (resultados.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const admin = resultados[0];

    bcrypt.compare(clave, admin.clave, (err, esValida) => {
      if (err || !esValida) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      res.status(200).json({ mensaje: 'Login exitoso' });
    });
  });
});;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});