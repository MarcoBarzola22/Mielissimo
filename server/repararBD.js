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
  if (err) {
      console.error("❌ Error conectando:", err);
      return;
  }
  console.log("✅ Conectado. Reparando estructura...");

  const sql = `
    -- 1. Crear Tablas Faltantes
    CREATE TABLE IF NOT EXISTS categorias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS producto_categorias (
      producto_id INT,
      categoria_id INT,
      PRIMARY KEY (producto_id, categoria_id),
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS variantes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      producto_id INT,
      tipo VARCHAR(50) NOT NULL,
      valor VARCHAR(100) NOT NULL,
      precio_extra DECIMAL(10,2) DEFAULT 0,
      stock_variante INT DEFAULT NULL,
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    );

    -- 2. Actualizar Tabla Productos (Columnas nuevas)
    -- Usamos un procedimiento seguro para agregar columnas si no existen
    SET @dbname = DATABASE();
    SET @tablename = "productos";
    SET @columnname = "precio_oferta";
    SET @preparedStatement = (SELECT IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)) > 0,
      "SELECT 1",
      "ALTER TABLE productos ADD COLUMN precio_oferta DECIMAL(10,2) DEFAULT NULL;"
    ));
    PREPARE alterIfNotExists FROM @preparedStatement;
    EXECUTE alterIfNotExists;
    DEALLOCATE PREPARE alterIfNotExists;

    SET @columnname = "oferta";
    SET @preparedStatement = (SELECT IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE (table_name = @tablename) AND (table_schema = @dbname) AND (column_name = @columnname)) > 0, "SELECT 1", "ALTER TABLE productos ADD COLUMN oferta BOOLEAN DEFAULT FALSE;"
    ));
    PREPARE alterIfNotExists FROM @preparedStatement;
    EXECUTE alterIfNotExists; 
    DEALLOCATE PREPARE alterIfNotExists;

    -- Hacer descripción opcional
    ALTER TABLE productos MODIFY COLUMN descripcion TEXT NULL;
    ALTER TABLE productos MODIFY COLUMN stock INT DEFAULT 0;
  `;

  db.query(sql, (err, result) => {
    if (err) {
        console.error("❌ Error en SQL:", err.message);
    } else {
        console.log("✅ ¡Base de Datos Reparada! Tablas y columnas listas.");
        
        // Insertar categorías base si no existen
        db.query("INSERT IGNORE INTO categorias (nombre) VALUES ('Gomitas'), ('Chocolates'), ('Ofertas'), ('Sin TACC')", () => {
            console.log("✅ Categorías de ejemplo creadas.");
            process.exit();
        });
    }
  });
});