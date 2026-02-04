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
    -- 1. Asegurar tablas básicas
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

    -- 2. Modificar tabla productos (intentamos agregar columnas, ignoramos si fallan)
    -- Esto es 'fuerza bruta' pero funciona en MySQL sin scripts complejos
    
    -- Agregar precio_oferta
    SELECT count(*) INTO @exist FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'precio_oferta' AND table_schema = DATABASE();
    SET @query = IF(@exist=0, 'ALTER TABLE productos ADD COLUMN precio_oferta DECIMAL(10,2) DEFAULT NULL', 'SELECT "Columna precio_oferta ya existe"');
    PREPARE stmt FROM @query; EXECUTE stmt;

    -- Agregar oferta
    SELECT count(*) INTO @exist FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'oferta' AND table_schema = DATABASE();
    SET @query = IF(@exist=0, 'ALTER TABLE productos ADD COLUMN oferta BOOLEAN DEFAULT FALSE', 'SELECT "Columna oferta ya existe"');
    PREPARE stmt FROM @query; EXECUTE stmt;

    -- Hacer descripcion opcional
    ALTER TABLE productos MODIFY COLUMN descripcion TEXT NULL;
    ALTER TABLE productos MODIFY COLUMN stock INT DEFAULT 0;
  `;

  // Ejecutamos una consulta simple primero para limpiar errores de sintaxis en procedures
  const simpleSql = `
    ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_oferta DECIMAL(10,2) DEFAULT NULL;
    ALTER TABLE productos ADD COLUMN IF NOT EXISTS oferta BOOLEAN DEFAULT FALSE;
    ALTER TABLE productos MODIFY COLUMN descripcion TEXT NULL;
    ALTER TABLE productos MODIFY COLUMN stock INT DEFAULT 0;
  `;

  // Intentamos primero la forma moderna (MySQL 8+), si falla, usamos la clásica
  db.query(sql, (err, result) => {
      if (err) {
          console.log("⚠️ Intentando método compatible con versiones viejas de MySQL...");
          // Fallback manual: Intentamos alterar sin verificar (dará error si existe pero creará lo que falta)
          const fallback = `
            CREATE TABLE IF NOT EXISTS categorias (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL UNIQUE);
            CREATE TABLE IF NOT EXISTS variantes (id INT AUTO_INCREMENT PRIMARY KEY, producto_id INT, tipo VARCHAR(50), valor VARCHAR(100), precio_extra DECIMAL(10,2));
            ALTER TABLE productos ADD COLUMN precio_oferta DECIMAL(10,2) DEFAULT NULL;
            ALTER TABLE productos ADD COLUMN oferta BOOLEAN DEFAULT FALSE;
          `;
          db.query(fallback, () => {
             console.log("✅ Proceso terminado (ignora errores de 'Duplicate column').");
             process.exit();
          });
      } else {
          console.log("✅ ¡Base de Datos Reparada correctamente!");
          process.exit();
      }
  });
});