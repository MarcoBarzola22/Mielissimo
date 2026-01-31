const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Configuración de entorno
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de subida de imágenes (Multer)
// Las guarda temporalmente en 'uploads/' antes de subirlas a Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Importar Cloudinary
const cloudinary = require("./config/cloudinary");

// Conexión a Base de Datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error conectando a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a la base de datos MySQL:", process.env.DB_NAME);
});

// --- RUTAS PÚBLICAS ---

// 1. OBTENER PRODUCTOS (GET)
// Ahora trae las múltiples categorías y variantes
app.get("/api/productos", (req, res) => {
  const { categoria_id } = req.query; 

  let sql = `
    SELECT 
      p.*, 
      GROUP_CONCAT(DISTINCT c.nombre SEPARATOR ', ') AS categorias_nombres,
      GROUP_CONCAT(DISTINCT c.id SEPARATOR ',') AS categorias_ids,
      (
        SELECT JSON_ARRAYAGG(JSON_OBJECT('id', v.id, 'nombre', v.nombre, 'precio_extra', v.precio_extra))
        FROM variantes v 
        WHERE v.id_producto = p.id
      ) as variantes_json
    FROM productos p
    LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
    LEFT JOIN categorias c ON pc.categoria_id = c.id
    WHERE p.activo = 1
  `;
  
  const valores = [];

  if (categoria_id) {
    // Nota: Para filtrar correctamente en N:M se requeriría un JOIN específico,
    // pero para mantenerlo simple filtramos sobre la unión general
    sql += " AND pc.categoria_id = ?";
    valores.push(categoria_id);
  }

  sql += " GROUP BY p.id ORDER BY p.created_at DESC";

  db.query(sql, valores, (err, resultados) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al obtener productos" });
    }
    
    // Formatear los resultados para el Frontend
    const productosFormateados = resultados.map(prod => ({
        ...prod,
        // Convertir strings de IDs a arrays reales
        categorias_ids: prod.categorias_ids ? prod.categorias_ids.split(',').map(Number) : [],
        categorias_nombres: prod.categorias_nombres ? prod.categorias_nombres.split(', ') : [],
        // Parsear el JSON de variantes (MySQL devuelve string a veces)
        variantes: prod.variantes_json ? (typeof prod.variantes_json === 'string' ? JSON.parse(prod.variantes_json) : prod.variantes_json) : [],
        // Lógica de "Nuevo": Si tiene menos de 7 días
        nuevo: (new Date() - new Date(prod.created_at)) < (7 * 24 * 60 * 60 * 1000)
    }));
    
    res.json(productosFormateados);
  });
});

// 2. OBTENER CATEGORÍAS
app.get("/api/categorias", (req, res) => {
  db.query("SELECT * FROM categorias", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// --- RUTAS ADMIN (PROTEGIDAS - Aquí iría tu middleware de auth) ---

// 3. CREAR PRODUCTO (POST)
app.post("/api/productos", upload.single("imagen"), async (req, res) => {
  try {
    const { nombre, precio, descripcion, categorias, variantes } = req.body; // 'categorias' llega como string JSON
    
    // Subir imagen a Cloudinary (si existe)
    let imagenUrl = null;
    if (req.file) {
      const resultado = await cloudinary.uploader.upload(req.file.path, {
        folder: "productos_mielissimo_v2",
      });
      imagenUrl = resultado.secure_url;
      // Borrar archivo temporal
      fs.unlinkSync(req.file.path);
    }

    // Insertar producto
    const sqlProd = "INSERT INTO productos (nombre, precio, descripcion, imagen) VALUES (?, ?, ?, ?)";
    db.query(sqlProd, [nombre, precio, descripcion, imagenUrl], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const productoId = result.insertId;

      // Procesar Categorías
      if (categorias) {
        const catsArray = JSON.parse(categorias); // El frontend envía "[1, 3]"
        if (Array.isArray(catsArray) && catsArray.length > 0) {
           const valoresCats = catsArray.map(cId => [productoId, cId]);
           db.query("INSERT INTO producto_categorias (producto_id, categoria_id) VALUES ?", [valoresCats]);
        }
      }

      // Procesar Variantes
      if (variantes) {
        const varsArray = JSON.parse(variantes); // El frontend envía '[{"nombre":"100g","precio_extra":500}, ...]'
        if (Array.isArray(varsArray) && varsArray.length > 0) {
           const valoresVars = varsArray.map(v => [productoId, v.nombre, v.precio_extra || 0]);
           db.query("INSERT INTO variantes (id_producto, nombre, precio_extra) VALUES ?", [valoresVars]);
        }
      }

      res.status(201).json({ message: "Producto creado con éxito", id: productoId });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});