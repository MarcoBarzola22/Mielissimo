const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');

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

// Productos
app.get('/api/productos', (req, res) => {
  db.query('SELECT id, nombre, precio, imagen, stock FROM productos', (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los productos' });
    console.log("Productos enviados al cliente:", resultados);
    res.json(resultados);

  });
});

app.post('/api/productos', verificarToken, (req, res) => {
  const { nombre, precio, imagen, stock } = req.body;
  if (!nombre || !precio || !imagen || stock === undefined) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const sql = 'INSERT INTO productos (nombre, precio, imagen, stock) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, precio, imagen, stock], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al insertar' });
    res.status(201).json({ mensaje: 'Producto agregado', id: resultado.insertId });
  });
});

app.put('/api/productos/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  const { nombre, precio, imagen, stock } = req.body;
  if (!nombre || !precio || !imagen || stock === undefined) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const sql = 'UPDATE productos SET nombre = ?, precio = ?, imagen = ?, stock = ? WHERE id = ?';
  db.query(sql, [nombre, precio, imagen, stock, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar' });
    res.json({ mensaje: 'Producto actualizado' });
  });
});

app.delete('/api/productos/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar' });
    res.json({ mensaje: 'Producto eliminado' });
  });
});

// Login seguro
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
