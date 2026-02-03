require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Conectado para actualizar BD.");

  const sql = `
    -- Agregar precio_oferta a productos
    ALTER TABLE productos ADD COLUMN precio_oferta DECIMAL(10,2) DEFAULT NULL;
    
    -- Hacer descripción y stock opcionales
    ALTER TABLE productos MODIFY COLUMN descripcion TEXT NULL;
    ALTER TABLE productos MODIFY COLUMN stock INT DEFAULT 0;

    -- Asegurar que la tabla variantes tenga precio extra
    ALTER TABLE variantes MODIFY COLUMN precio_extra DECIMAL(10,2) DEFAULT 0;
  `;

  db.query(sql, (err, result) => {
    if (err) {
        // Ignoramos error si las columnas ya existen
        console.log("⚠️ Aviso BD (puede que ya existan las columnas):", err.message);
    } else {
        console.log("✅ Base de datos actualizada con Precio Oferta.");
    }
    process.exit();
  });
});