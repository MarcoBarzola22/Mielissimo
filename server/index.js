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

// Configuración de Multer
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + "-" + file.originalname;
    cb(null, nombreUnico);
  }
});
const upload = multer({ storage });

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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

// 🔹 CATEGORÍAS
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

  db.query("UPDATE categorias SET nombre = ? WHERE id = ?", [nombre, id], (err) => {
    if (err) return res.status(500).json({ error: "Error al actualizar categoría" });
    res.json({ mensaje: "Categoría actualizada correctamente" });
  });
});

app.delete("/api/categorias/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM categorias WHERE id = ?", [id], (err, resultado) => {
    if (err) return res.status(500).json({ error: "Error al eliminar categoría" });
    res.json({ mensaje: "Categoría eliminada correctamente" });
  });
});

// 🔹 PRODUCTOS
app.get('/api/productos', (req, res) => {
  const { categoria, id } = req.query;
  let sql = `SELECT productos.*, categorias.nombre AS categoria_nombre 
             FROM productos LEFT JOIN categorias ON productos.categoria_id = categorias.id`;
  const valores = [];

  if (id) {
    sql += " WHERE productos.id = ?";
    valores.push(id);
  } else if (categoria) {
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
    if (err) return res.status(500).json({ error: 'Error al consultar' });
    if (resultados.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const productoActual = resultados[0];
    let sql, valores;

    if (req.file) {
      const imagenAnterior = productoActual.imagen;
      const nuevaImagen = "/uploads/" + req.file.filename;
      const rutaImagenAnterior = path.join(__dirname, imagenAnterior);
      fs.unlink(rutaImagenAnterior, () => {});
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
    if (err || resultados.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const imagen = resultados[0].imagen;
    const rutaImagen = path.join(__dirname, imagen);
    db.query("DELETE FROM productos WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Error al eliminar producto" });
      fs.unlink(rutaImagen, () => {});
      res.json({ mensaje: "Producto eliminado correctamente" });
    });
  });
});

// 🔐 LOGIN ADMIN
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

// 📬 Newsletter
app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email inválido" });
  }

  const sql = "INSERT INTO suscriptores (email) VALUES (?)";
  db.query(sql, [email], (err) => {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Este correo ya está suscripto" });
    }
    if (err) return res.status(500).json({ error: "Error al suscribir" });
    res.status(201).json({ mensaje: "¡Gracias por suscribirte!" });
  });
});

// 🧾 REGISTRO DE USUARIOS (CON DEBUG)
app.post("/api/usuarios/registro", (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  console.log("🟡 DATOS RECIBIDOS:", { nombre, email, password }); // Debug

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("❌ Error al encriptar:", err);
      return res.status(500).json({ error: "Error al encriptar contraseña" });
    }

    const sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    db.query(sql, [nombre, email, hash], (err, resultado) => {
      if (err) {
        console.error("❌ Error en INSERT:", err); // Debug de errores SQL
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "El correo ya está registrado" });
        }
        return res.status(500).json({ error: "Error al registrar usuario" });
      }
      console.log("✅ Usuario registrado correctamente:", resultado); // Debug OK
      res.status(201).json({ mensaje: "Usuario registrado correctamente" });
    });
  });
});

// 🔐 LOGIN DE USUARIOS COMUNES
app.post("/api/usuarios/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan campos" });
  }

  const sql = "SELECT * FROM usuarios WHERE email = ?";
  db.query(sql, [email], (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (resultados.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

    const usuario = resultados[0];

    bcrypt.compare(password, usuario.password, (err, esValida) => {
      if (err || !esValida) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      res.status(200).json({
        mensaje: "Login exitoso",
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email
        }
      });
    });
  });
});

// 📦 Registrar compras
app.post("/api/compras", (req, res) => {
  const { id_usuario, carrito } = req.body;

  if (!id_usuario || !Array.isArray(carrito) || carrito.length === 0) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const sql = "INSERT INTO compras (id_usuario, id_producto, cantidad) VALUES ?";
  const valores = carrito.map(item => [id_usuario, item.id, item.cantidad]);

  db.query(sql, [valores], (err, resultado) => {
    if (err) return res.status(500).json({ error: "Error al registrar compra" });
    res.status(201).json({ mensaje: "Compra registrada correctamente" });
  });
});

app.get("/api/compras/:id_usuario", async (req, res) => {
  const id = req.params.id_usuario;
  try {
    const [compras] = await db.promise().query(`
      SELECT c.*, p.nombre, p.imagen
      FROM compras c
      JOIN productos p ON c.id_producto = p.id
      WHERE c.id_usuario = ?
      ORDER BY c.fecha_compra DESC
    `, [id]);

    res.json(compras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener compras" });
  }
});


// 🔊 INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
