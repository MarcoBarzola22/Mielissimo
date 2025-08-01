const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");
const db = require('./db');
const cloudinary = require('./config/cloudinary');


require('dotenv').config();

const app = express();
const PORT = 3000;
const JWT_SECRET = "claveultrasecreta123";
const mailchimp = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
}); 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



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
// Proteger admin.html para acceso directo
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'admin.html'));
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'client')));

// 🔸 Conexión a la base de datos
/* 
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
*/
// 🔐 Middleware para validar token
function verificarToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });

  const token = auth.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token inválido" });
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

  db.query("SELECT COUNT(*) AS total FROM productos WHERE categoria_id = ? AND activo = TRUE", [id], (err, resultado) => {
    if (err) return res.status(500).json({ error: "Error al verificar productos activos asociados" });

    const total = resultado[0].total;
    if (total > 0) {
      return res.status(400).json({ error: "No se puede eliminar una categoría que tiene productos activos." });
    }

    db.query("UPDATE productos SET categoria_id = NULL WHERE categoria_id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Error al desasociar productos inactivos" });

      db.query("DELETE FROM categorias WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: "Error al eliminar categoría" });
        res.json({ mensaje: "Categoría eliminada correctamente" });
      });
    });
  });
});
 
// ==============================
// 📂 RUTAS PRODUCTOS
// ==============================
app.get("/api/productos", (req, res) => {
  const { categoria, id, mostrarInactivos } = req.query;

  let sql = `
    SELECT productos.*, categorias.nombre AS categoria_nombre
    FROM productos
    LEFT JOIN categorias ON productos.categoria_id = categorias.id
    WHERE 1
  `;
  const valores = [];

  if (id) {
    sql += " AND productos.id = ?";
    valores.push(id);
  } else if (categoria) {
    sql += " AND productos.categoria_id = ?";
    valores.push(categoria);
  }

  if (mostrarInactivos !== "true") {
    sql += " AND productos.activo = TRUE";
  }

  db.query(sql, valores, (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error al obtener productos" });
    res.json(resultados);
  });
});

app.post("/api/productos", verificarToken, upload.single("imagen"), async (req, res) => {
  const { nombre, precio, categoria_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Imagen requerida" });
  }

  try {
    // Subir a Cloudinary
    const resultado = await cloudinary.uploader.upload(req.file.path, {
  folder: "productos_mielissimo",
  quality: "auto",
  fetch_format: "auto"
});


    const imagenUrl = resultado.secure_url;

    db.query(
      "INSERT INTO productos (nombre, precio, imagen, categoria_id, activo) VALUES (?, ?, ?, ?, 1)",
      [nombre, precio, imagenUrl, categoria_id],
      (err, resultadoDb) => {
        if (err) return res.status(500).json({ error: "Error al insertar producto" });
        res.status(201).json({ mensaje: "Producto agregado", id: resultadoDb.insertId });
      }
    );
  } catch (error) {
    console.error("Error subiendo a Cloudinary:", error);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
});



app.put("/api/productos/:id", verificarToken, upload.single("imagen"), async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, categoria_id } = req.body;

  if (!nombre || !precio || !categoria_id) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    let nuevaImagenUrl = null;

    if (req.file) {
      const resultado = await cloudinary.uploader.upload(req.file.path, {
  folder: "productos_mielissimo",
  quality: "auto",
  fetch_format: "auto"
});

      nuevaImagenUrl = resultado.secure_url;
    }

    const sql = nuevaImagenUrl
      ? "UPDATE productos SET nombre=?, precio=?, imagen=?, categoria_id=? WHERE id=?"
      : "UPDATE productos SET nombre=?, precio=?, categoria_id=? WHERE id=?";

    const valores = nuevaImagenUrl
      ? [nombre, precio, nuevaImagenUrl, categoria_id, id]
      : [nombre, precio, categoria_id, id];

    db.query(sql, valores, err => {
      if (err) return res.status(500).json({ error: "Error al actualizar producto" });
      res.json({ mensaje: "Producto actualizado correctamente" });
    });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
});



app.delete("/api/productos/:id", verificarToken, (req, res) => {
  const { id } = req.params;

  console.log(`🗑️ Intentando eliminar producto ID: ${id}`);

  db.query("SELECT imagen FROM productos WHERE id = ?", [id], (err, resultado) => {
    if (err) {
      console.error("❌ Error al buscar producto:", err);
      return res.status(500).json({ error: "Error al buscar el producto" });
    }

    if (resultado.length === 0) {
      console.warn("⚠️ Producto no encontrado");
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const imagen = resultado[0].imagen;
    const nombreArchivo = imagen && imagen.includes("/uploads/")
      ? imagen.replace("/uploads/", "")
      : null;

    const rutaImagen = nombreArchivo ? path.join(__dirname, "uploads", nombreArchivo) : null;

    db.query("DELETE FROM productos WHERE id = ?", [id], (err) => {
      if (err) {
        console.error("❌ Error al eliminar producto:", err);
        return res.status(500).json({ error: "Error al eliminar producto" });
      }

      if (rutaImagen) {
        fs.unlink(rutaImagen, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("🧨 Error al eliminar imagen:", err);
          } else {
            console.log("🧹 Imagen eliminada correctamente o no existía");
          }
        });
      }

      res.json({ mensaje: "Producto eliminado correctamente" });
    });
  });
});

app.put("/api/productos/desactivar/:id", verificarToken, (req, res) => {
  const { id } = req.params;

  db.query("UPDATE productos SET activo = FALSE WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("❌ Error al desactivar producto:", err);
      return res.status(500).json({ error: "Error al desactivar producto" });
    }
    res.json({ mensaje: "Producto desactivado correctamente" });
  });
});

app.put("/api/productos/activar/:id", verificarToken, (req, res) => {
  const { id } = req.params;

  db.query("UPDATE productos SET activo = TRUE WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("❌ Error al activar producto:", err);
      return res.status(500).json({ error: "Error al activar producto" });
    }
    res.json({ mensaje: "Producto activado correctamente" });
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
app.post("/api/newsletter", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email inválido" });
  }

  // Primero, guardar en tu base de datos local (como ya lo hacías)
  db.query("INSERT INTO suscriptores (email) VALUES (?)", [email], async (err) => {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Correo ya registrado" });
    }
    if (err) {
      return res.status(500).json({ error: "Error al suscribir" });
    }

    // Luego, enviar a Mailchimp
    try {
      await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
        email_address: email,
        status: "subscribed"
      });

      return res.status(201).json({ mensaje: "¡Suscripción exitosa!" });
    } catch (mcError) {
      console.error("Error al enviar a Mailchimp:", mcError.response?.body || mcError.message);
      return res.status(500).json({ error: "Suscripto localmente, pero error en Mailchimp" });
    }
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

      const token = jwt.sign({ usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } }, JWT_SECRET, { expiresIn: "2h" });

      res.json({
        mensaje: "Login exitoso",
        token,
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
// 🧾 COMPRAS (con y sin sesión)
// ==============================
app.post("/api/compras", (req, res) => {
  const { id_usuario, carrito, tipoEnvio, zona, total } = req.body;

  if (!Array.isArray(carrito) || carrito.length === 0) {
    return res.status(400).json({ error: "Datos inválidos para la compra." });
  }

  const fecha_compra = new Date().toISOString().slice(0, 19).replace("T", " ");
  const tipo = tipoEnvio || "retiro";
  const usuarioId = id_usuario && !isNaN(id_usuario) ? id_usuario : null;

  // Usamos el primer item para obtener pedido_id
  const primerItem = carrito[0];

  // Función para calcular precio final (producto + variante Tamaño si aplica)
  const calcularPrecioFinal = (productoPrecio, variantes) => {
    if (!variantes || variantes.length === 0) return productoPrecio;

    const varianteTamaño = variantes.find(v => v.tipo === "Tamaño" && v.precio_extra);
    const extra = varianteTamaño ? parseFloat(varianteTamaño.precio_extra) : 0;

    return parseFloat(productoPrecio) + extra;
  };

  // Guardar variantes como texto legible
  const variantesTexto = primerItem.variantes && primerItem.variantes.length > 0
    ? primerItem.variantes.map(v => `${v.tipo}: ${v.nombre}`).join(", ")
    : "Sin variantes";

  const precioUnitarioPrimer = calcularPrecioFinal(primerItem.precio, primerItem.variantes);

  // Insertar el primer producto
  db.query(
    `INSERT INTO compras (id_usuario, id_producto, cantidad, precio_unitario, fecha_compra, tipo_envio, zona, variantes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [usuarioId, primerItem.id, primerItem.cantidad, precioUnitarioPrimer, fecha_compra, tipo, zona, variantesTexto],
    (err, result) => {
      if (err) {
        console.error("Error al insertar producto:", err);
        return res.status(500).json({ error: "Error al registrar la compra." });
      }

      const pedidoId = result.insertId;

      // Actualizamos pedido_id para el primer registro
      db.query(`UPDATE compras SET pedido_id = ? WHERE id = ?`, [pedidoId, pedidoId]);

      // Insertar los demás productos
      let insertados = 1;
      for (let i = 1; i < carrito.length; i++) {
        const item = carrito[i];

        const variantesTextoItem = item.variantes && item.variantes.length > 0
          ? item.variantes.map(v => `${v.tipo}: ${v.nombre}`).join(", ")
          : "Sin variantes";

        const precioUnitario = calcularPrecioFinal(item.precio, item.variantes);

        db.query(
          `INSERT INTO compras (id_usuario, id_producto, cantidad, precio_unitario, fecha_compra, tipo_envio, zona, variantes, pedido_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [usuarioId, item.id, item.cantidad, precioUnitario, fecha_compra, tipo, zona, variantesTextoItem, pedidoId],
          (err2) => {
            if (err2) {
              console.error("Error al insertar producto:", err2);
              return res.status(500).json({ error: "Error al registrar la compra." });
            }

            insertados++;
            if (insertados === carrito.length) {
              res.json({ mensaje: "Compra registrada correctamente", id: pedidoId });
            }
          }
        );
      }

      // Si solo había un producto
      if (carrito.length === 1) {
        res.json({ mensaje: "Compra registrada correctamente", id: pedidoId });
      }
    }
  );
});




app.get("/api/compras/:id_usuario", (req, res) => {
  const id = req.params.id_usuario;
  db.query(
    `SELECT c.*, p.nombre, p.imagen
     FROM compras c
     JOIN productos p ON c.id_producto = p.id
     WHERE c.id_usuario = ?
     ORDER BY c.fecha_compra DESC`,
    [id], (err, resultados) => {
      if (err) return res.status(500).json({ error: "Error al obtener compras" });
      res.json(resultados);
    }
  );
});

app.get("/api/historial", verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;

  const query = `
    SELECT 
      c.id,
      p.nombre AS nombre_producto,
      p.imagen,
      c.cantidad,
      c.fecha_compra,
      c.tipo_envio,
      p.precio,
      c.variantes
    FROM compras c
    JOIN productos p ON c.id_producto = p.id
    WHERE c.id_usuario = ?
    ORDER BY c.fecha_compra DESC
  `;

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error("Error al obtener historial:", err);
      return res.status(500).json({ error: "Error al obtener historial" });
    }

    // Convertir JSON string de variantes a objeto (si existe)
    const historialConVariantes = results.map(compra => {
      try {
        compra.variantes = compra.variantes ? JSON.parse(compra.variantes) : [];
      } catch (e) {
        compra.variantes = [];
      }
      return compra;
    });

    res.json(historialConVariantes);
  });
});

// Buscar compra por ID individual (para panel admin)
app.get("/api/compras/detalle/:id", verificarToken, (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT c.pedido_id, c.fecha_compra, c.tipo_envio, c.zona, c.variantes,
           p.nombre AS producto, c.cantidad, c.precio_unitario
    FROM compras c
    JOIN productos p ON c.id_producto = p.id
    WHERE c.pedido_id = ?
  `;

  db.query(query, [id], (err, resultados) => {
    if (err) return res.status(500).json({ error: "Error al obtener detalle de compra" });
    if (resultados.length === 0) return res.status(404).json({ error: "Compra no encontrada" });

    // Calcular total de los productos
    let total = resultados.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

    // Sumar costo de zona si es envío
    if (resultados[0].tipo_envio === "envio" && resultados[0].zona) {
      const preciosZonas = {
        "Zona centro": 1500,
        "Jds": 2000,
        "Ribera": 2000,
        "Barrio unión": 2500
      };
      total += preciosZonas[resultados[0].zona] || 0;
    }

    // Responder con los datos completos
    res.json({
      pedido_id: id,
      fecha_compra: resultados[0].fecha_compra,
      tipo_envio: resultados[0].tipo_envio,
      zona: resultados[0].zona,
      productos: resultados.map(item => ({
        nombre: item.producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        variantes: item.variantes
      })),
      total
    });
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

app.post("/api/variantes", (req, res) => {
  const { id_producto, tipo, nombre, precio_extra } = req.body;

  const precioFinal = precio_extra === "" || precio_extra === undefined || precio_extra === null
    ? null
    : parseFloat(precio_extra);

  db.query(
    "INSERT INTO variantes (id_producto, tipo, nombre, precio_extra) VALUES (?, ?, ?, ?)",
    [id_producto, tipo, nombre, precioFinal],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al crear variante" });
      res.json({ mensaje: "Variante creada correctamente", id: result.insertId });
    }
  );
});



app.put("/api/variantes/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, precio_extra } = req.body;

  // Convertimos precio_extra a null o número
  const precioFinal = precio_extra === "" || precio_extra === undefined || precio_extra === null
    ? null
    : parseFloat(precio_extra);

  // Query para actualizar (sin imágenes porque ya no usamos)
  const sql = "UPDATE variantes SET nombre=?, precio_extra=? WHERE id=?";

  db.query(sql, [nombre, precioFinal, id], (err) => {
    if (err) {
      console.error("Error al actualizar variante:", err);
      return res.status(500).json({ error: "Error al actualizar variante" });
    }
    res.json({ mensaje: "Variante actualizada correctamente" });
  });
});


app.delete("/api/variantes/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM variantes WHERE id = ?", [id], err => {
    if (err) return res.status(500).json({ error: "Error al eliminar variante" });
    res.json({ mensaje: "Variante eliminada correctamente" });
  });
});


// ==============================
// ❤️ FAVORITOS
// ==============================
app.get('/api/favoritos', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;

  db.query(
    `SELECT f.producto_id, p.nombre, p.precio, p.imagen, p.stock, c.nombre AS categoria_nombre
     FROM favoritos f
     JOIN productos p ON f.producto_id = p.id
     LEFT JOIN categorias c ON p.categoria_id = c.id
     WHERE f.usuario_id = ?`,
    [usuarioId], (err, resultados) => {
      if (err) return res.status(500).json({ error: 'Error al obtener favoritos' });
      res.json(resultados);
    }
  );
});

app.post('/api/favoritos', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const { producto_id } = req.body;

  if (!producto_id) return res.status(400).json({ error: 'Falta producto_id' });

  db.query(
    'INSERT IGNORE INTO favoritos (usuario_id, producto_id) VALUES (?, ?)',
    [usuarioId, producto_id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al agregar favorito' });
      res.json({ mensaje: 'Agregado a favoritos' });
    }
  );
});

app.delete('/api/favoritos/:producto_id', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const { producto_id } = req.params;

  db.query(
    'DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
    [usuarioId, producto_id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar favorito' });
      res.json({ mensaje: 'Eliminado de favoritos' });
    }
  );
}); 

// ==============================
// 🔑 RECUPERACIÓN DE CONTRASEÑA USUARIOS
// ==============================
app.post("/api/usuarios/recuperar", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email requerido" });
  }

  // Buscar si el email existe
  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    // Generar token
    const token = require("crypto").randomBytes(32).toString("hex");

    // Guardar token en la base
    db.query("UPDATE usuarios SET reset_token = ? WHERE email = ?", [token, email], (err) => {
      if (err) return res.status(500).json({ error: "Error al guardar token" });

      // URL para resetear contraseña (ajustá la carpeta si es distinta)
     const resetUrl = `https://api.mielissimo.com.ar/reset-password.html?token=${token}`;


      // Responder rápido al frontend
      res.json({ mensaje: "Correo de recuperación enviado. Revisá tu bandeja de entrada." });

      // Enviar el correo en segundo plano
      const mailOptions = {
        from: `"Mielissimo" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Recuperación de contraseña",
        html: `
          <h2>Recuperación de contraseña</h2>
          <p>Hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Si no solicitaste este cambio, ignorá este correo.</p>
        `
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error al enviar correo:", error);
        }
      });
    });
  });
});


// ==============================
// 🔑 RESET DE CONTRASEÑA USUARIOS
// ==============================

app.post("/api/usuarios/reset-password", async (req, res) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
  }

  // Validar longitud mínima
  if (nuevaPassword.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  // Buscar usuario con ese token
  db.query("SELECT * FROM usuarios WHERE reset_token = ?", [token], async (err, results) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length === 0) return res.status(400).json({ error: "Token inválido o expirado" });

    const userId = results[0].id;
    const emailUsuario = results[0].email;

    try {
      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

      // Actualizar contraseña y borrar token
      db.query(
        "UPDATE usuarios SET password = ?, reset_token = NULL WHERE id = ?",
        [hashedPassword, userId],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Error al actualizar contraseña" });

          // Enviar correo de confirmación
          const mailOptions = {
            from: `"Mielissimo" <${process.env.EMAIL_USER}>`,
            to: emailUsuario,
            subject: "Contraseña cambiada correctamente",
            html: `
              <h2>Tu contraseña fue cambiada con éxito</h2>
              <p>Si vos no realizaste este cambio, contactá con nuestro soporte inmediatamente.</p>
            `
          };

          transporter.sendMail(mailOptions, (error) => {
            if (error) {
              console.error("Error al enviar correo de confirmación:", error);
            }
          });

          res.json({ mensaje: "Contraseña actualizada correctamente" });
        }
      );
    } catch (e) {
      res.status(500).json({ error: "Error al procesar la contraseña" });
    }
  });
});

// ==============================
// 🔑 RECUPERACION Y RESETEO DE CONTRASEÑA ADMIN
// ==============================
app.post("/api/admin/recuperar", (req, res) => {
  const email = process.env.ADMIN_EMAIL; // correo fijo de tu cliente

  // Validamos que exista al menos un admin
  db.query("SELECT * FROM admins LIMIT 1", (err, results) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length === 0) return res.status(404).json({ error: "Administrador no configurado" });

    const token = require("crypto").randomBytes(32).toString("hex");

    db.query("UPDATE admins SET reset_token = ? WHERE id = ?", [token, results[0].id], (err) => {
      if (err) return res.status(500).json({ error: "Error al guardar token" });

      const resetUrl = `https://api.mielissimo.com.ar/reset-password-admin.html?token=${token}`;

      res.json({ mensaje: "Correo de recuperación enviado. Revisá tu bandeja de entrada." });

      const mailOptions = {
        from: `"Mielissimo" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Recuperación de contraseña - Administrador",
        html: `
          <h2>Recuperación de contraseña</h2>
          <p>Hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Si no solicitaste este cambio, ignorá este correo.</p>
        `
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error al enviar correo de recuperación admin:", error);
        }
      });
    });
  });
});

app.post("/api/admin/reset-password", async (req, res) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
  }

  if (nuevaPassword.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  db.query("SELECT * FROM admins WHERE reset_token = ?", [token], async (err, results) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length === 0) return res.status(400).json({ error: "Token inválido o expirado" });

    const adminId = results[0].id;
    const emailAdmin = process.env.ADMIN_EMAIL; // mismo correo fijo

    try {
      const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

      db.query(
        "UPDATE admins SET clave = ?, reset_token = NULL WHERE id = ?",
        [hashedPassword, adminId],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Error al actualizar contraseña" });

          const mailOptions = {
            from: `"Mielissimo" <${process.env.EMAIL_USER}>`,
            to: emailAdmin,
            subject: "Contraseña de administrador cambiada correctamente",
            html: `
              <h2>Tu contraseña de administrador fue cambiada con éxito</h2>
              <p>Si no realizaste este cambio, contactá con soporte.</p>
            `
          };

          transporter.sendMail(mailOptions, (error) => {
            if (error) {
              console.error("Error al enviar correo de confirmación admin:", error);
            }
          });

          res.json({ mensaje: "Contraseña de administrador actualizada correctamente" });
        }
      );
    } catch (e) {
      res.status(500).json({ error: "Error al procesar la contraseña" });
    }
  });
});

app.get("/api/productos/:id", (req, res) => {
  const { id } = req.params;

  const sqlProducto = `
    SELECT p.*, c.nombre AS categoria_nombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ? AND p.activo = 1
  `;

  db.query(sqlProducto, [id], (err, productoRes) => {
    if (err) return res.status(500).json({ error: "Error al obtener producto" });
    if (productoRes.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const producto = productoRes[0];

    // CORREGIDO: usamos la columna correcta `id_producto`
    const sqlVariantes = `
      SELECT id, nombre, tipo, precio_extra
      FROM variantes
      WHERE id_producto = ?
    `;

    db.query(sqlVariantes, [id], (err, variantesRes) => {
      if (err) return res.status(500).json({ error: "Error al obtener variantes" });

      res.json({
        ...producto,
        variantes: variantesRes || []
      });
    });
  });
});



// ==============================
// 🚀 INICIAR SERVIDOR
// ==============================
app.listen(PORT, () => {
 console.log(`Servidor corriendo en http://localhost:${PORT}`);

});