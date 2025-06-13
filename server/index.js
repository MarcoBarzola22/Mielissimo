const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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

// Ruta para obtener productos
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

// Ruta DELETE para eliminar un producto por ID
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


// Ruta para agregar un nuevo producto
app.post('/api/productos', (req, res) => {
  const { nombre, precio, imagen, stock } = req.body;

  // Validación básica
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


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
