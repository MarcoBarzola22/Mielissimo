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

// 🔸 Multer configuración para subir imágenes
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + '-' + file.originalname;
    cb(null, nombreUnico);
  }
});
const upload = multer({ storage });

// 🔸 Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'client')));

// 🔸 Conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '44994334marco',
  database: 'mielissimo'
});
db.connect(err => {
  if (err) console.error("Error en la DB:", err);
  else console.log("MySQL conectado correctamente");
});

// 🔐 Middleware para validar token
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

// ==============================
// 📂 RUTAS CATEGORÍAS
// ==============================
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

  db.query("UPDATE categorias SET nombre = ? WHERE id = ?", [nombre, id], err => {
    if (err) return res.status(500).json({ error: "Error al actualizar categoría" });
    res.json({ mensaje: "Categoría actualizada correctamente" });
  });
});

app.delete("/api/categorias/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM categorias WHERE id = ?", [id], err => {
    if (err) return res.status(500).json({ error: "Error al eliminar categoría" });
    res.json({ mensaje: "Categoría eliminada correctamente" });
  });
});

// ==============================
// 📂 RUTAS PRODUCTOS
// ==============================
app.get("/api/productos", (req, res) => {
  const { categoria, id } = req.query;
  let sql = `
    SELECT productos.*, categorias.nombre AS categoria_nombre
    FROM productos
    LEFT JOIN categorias ON productos.categoria_id = categorias.id
  `;
  const valores = [];

  if (id) {
    sql += " WHERE productos.id = ?";
    valores.push(id);
  } else if (categoria) {
    sql += " WHERE productos.categoria_id = ?";
    valores.push(categoria);
  }

  db.query(sql, valores, (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error al obtener productos" });
    res.json(resultados);
  });
});

app.post("/api/productos", verificarToken, upload.single("imagen"), (req, res) => {
  const { nombre, precio, stock, categoria_id } = req.body;
  const imagen = req.file ? "/uploads/" + req.file.filename : null;

  if (!nombre || !precio || stock === undefined || !categoria_id || !imagen) {
    return res.status(400).json({ error: "Faltan datos del producto" });
  }

  db.query(
    "INSERT INTO productos (nombre, precio, imagen, stock, categoria_id) VALUES (?, ?, ?, ?, ?)",
    [nombre, precio, imagen, stock, categoria_id],
    (err, resultado) => {
      if (err) return res.status(500).json({ error: "Error al insertar producto" });
      res.status(201).json({ mensaje: "Producto agregado", id: resultado.insertId });
    }
  );
});

app.put("/api/productos/:id", verificarToken, upload.single("imagen"), (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, categoria_id } = req.body;

  if (!nombre || !precio || stock === undefined || !categoria_id) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  db.query("SELECT imagen FROM productos WHERE id = ?", [id], (err, resultado) => {
    if (err || resultado.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const producto = resultado[0];
    let sql, valores;

    if (req.file) {
      const nuevaImagen = "/uploads/" + req.file.filename;
      fs.unlink(path.join(__dirname, producto.imagen), () => {});
      sql = "UPDATE productos SET nombre = ?, precio = ?, imagen = ?, stock = ?, categoria_id = ? WHERE id = ?";
      valores = [nombre, precio, nuevaImagen, stock, categoria_id, id];
    } else {
      sql = "UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria_id = ? WHERE id = ?";
      valores = [nombre, precio, stock, categoria_id, id];
    }

    db.query(sql, valores, err => {
      if (err) return res.status(500).json({ error: "Error al actualizar producto" });
      res.json({ mensaje: "Producto actualizado correctamente" });
    });
  });
});

app.delete("/api/productos/:id", verificarToken, (req, res) => {
  const { id } = req.params;
  db.query("SELECT imagen FROM productos WHERE id = ?", [id], (err, resultado) => {
    if (err || resultado.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const imagen = resultado[0].imagen;
    db.query("DELETE FROM productos WHERE id = ?", [id], err => {
      if (err) return res.status(500).json({ error: "Error al eliminar producto" });
      fs.unlink(path.join(__dirname, imagen), () => {});
      res.json({ mensaje: "Producto eliminado correctamente" });
    });
  });
});

// ==============================
// 🔐 LOGIN ADMIN
// ==============================
app.post("/api/admin/login", (req, res) => {
  const { usuario, clave } = req.body;

  db.query("SELECT * FROM admins WHERE usuario = ?", [usuario], (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error en DB" });
    if (resultados.length === 0) return res.status(401).json({ error: "Usuario no existe" });

    const admin = resultados[0];
    bcrypt.compare(clave, admin.clave, (err, esValida) => {
      if (err || !esValida) return res.status(401).json({ error: "Clave incorrecta" });

      const token = jwt.sign({ usuario: admin.usuario }, JWT_SECRET, { expiresIn: "2h" });
      res.json({ mensaje: "Login exitoso", token });
    });
  });
});

// ==============================
// 📬 NEWSLETTER
// ==============================
app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) return res.status(400).json({ error: "Email inválido" });

  db.query("INSERT INTO suscriptores (email) VALUES (?)", [email], (err) => {
    if (err && err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Correo ya registrado" });
    if (err) return res.status(500).json({ error: "Error al suscribir" });
    res.status(201).json({ mensaje: "¡Gracias por suscribirte!" });
  });
});

// ==============================
// 👥 USUARIOS
// ==============================
app.post("/api/usuarios/registro", (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: "Faltan campos" });

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: "Error al encriptar" });

    db.query("INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)", [nombre, email, hash], (err) => {
      if (err && err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Correo ya registrado" });
      if (err) return res.status(500).json({ error: "Error al registrar usuario" });
      res.status(201).json({ mensaje: "Usuario registrado correctamente" });
    });
  });
});

app.post("/api/usuarios/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Faltan campos" });

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (resultados.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

    const usuario = resultados[0];
    bcrypt.compare(password, usuario.password, (err, esValida) => {
      if (err || !esValida) return res.status(401).json({ error: "Contraseña incorrecta" });

      res.json({
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

// ==============================
// 🧾 COMPRAS
// ==============================
app.post("/api/compras", (req, res) => {
  const { id_usuario, carrito } = req.body;
  if (!id_usuario || !Array.isArray(carrito) || carrito.length === 0) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const sql = "INSERT INTO compras (id_usuario, id_producto, cantidad) VALUES ?";
  const valores = carrito.map(item => [id_usuario, item.id, item.cantidad]);

  db.query(sql, [valores], err => {
    if (err) return res.status(500).json({ error: "Error al registrar compra" });
    res.status(201).json({ mensaje: "Compra registrada correctamente" });
  });
});

app.get("/api/compras/:id_usuario", (req, res) => {
  const id = req.params.id_usuario;
  db.query(`
    SELECT c.*, p.nombre, p.imagen
    FROM compras c
    JOIN productos p ON c.id_producto = p.id
    WHERE c.id_usuario = ?
    ORDER BY c.fecha_compra DESC
  `, [id], (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error al obtener compras" });
    res.json(resultados);
  });
});

// ==============================
// 🧩 VARIANTES
// ==============================
app.get("/api/variantes/:id_producto", (req, res) => {
  const { id_producto } = req.params;

  db.query("SELECT * FROM variantes WHERE id_producto = ?", [id_producto], (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error al obtener variantes" });
    res.json(resultados);
  });
});

app.post("/api/variantes", upload.single("imagen"), (req, res) => {
  const { id_producto, nombre, precio_extra, stock } = req.body;
  const imagen = req.file ? "/uploads/" + req.file.filename : null;

  if (!id_producto || !nombre || stock === undefined) {
    return res.status(400).json({ error: "Faltan campos" });
  }

  db.query(`
    INSERT INTO variantes (id_producto, nombre, precio_extra, stock, imagen)
    VALUES (?, ?, ?, ?, ?)`,
    [id_producto, nombre, precio_extra || 0, stock, imagen],
    (err, resultado) => {
      if (err) return res.status(500).json({ error: "Error al crear variante" });
      res.status(201).json({ mensaje: "Variante creada correctamente", id: resultado.insertId });
    });
});

app.delete("/api/variantes/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM variantes WHERE id = ?", [id], err => {
    if (err) return res.status(500).json({ error: "Error al eliminar variante" });
    res.json({ mensaje: "Variante eliminada correctamente" });
  });
});

// 🛠 Editar variante
app.put("/api/variantes/:id", upload.single("imagen"), (req, res) => {
  const { id } = req.params;
  const { nombre, precio_extra, stock } = req.body;
  const nuevaImagen = req.file ? "/uploads/" + req.file.filename : null;

  db.query("SELECT imagen FROM variantes WHERE id = ?", [id], (err, resultados) => {
    if (err || resultados.length === 0) {
      return res.status(404).json({ error: "Variante no encontrada" });
    }

    const varianteActual = resultados[0];
    const imagenAnterior = varianteActual.imagen;

    let sql, valores;

    if (nuevaImagen) {
      const rutaVieja = path.join(__dirname, imagenAnterior);
      fs.unlink(rutaVieja, () => {});
      sql = "UPDATE variantes SET nombre=?, precio_extra=?, stock=?, imagen=? WHERE id=?";
      valores = [nombre, precio_extra || 0, stock, nuevaImagen, id];
    } else {
      sql = "UPDATE variantes SET nombre=?, precio_extra=?, stock=? WHERE id=?";
      valores = [nombre, precio_extra || 0, stock, id];
    }

    db.query(sql, valores, (err) => {
      if (err) return res.status(500).json({ error: "Error al actualizar variante" });
      res.json({ mensaje: "Variante actualizada correctamente" });
    });
  });
});


// ==============================
// 🚀 INICIAR SERVIDOR
// ==============================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
