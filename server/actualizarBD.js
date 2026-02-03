require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true // Para ejecutar varias queries a la vez
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Conectado a la BD.");

  const sql = `
    -- 1. Tabla de Categorías
    CREATE TABLE IF NOT EXISTS categorias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL UNIQUE
    );

    -- 2. Tabla Intermedia (Muchos Productos <-> Muchas Categorías)
    CREATE TABLE IF NOT EXISTS producto_categorias (
      producto_id INT,
      categoria_id INT,
      PRIMARY KEY (producto_id, categoria_id),
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
    );

    -- 3. Tabla de Variantes (Ej: Sabor=Menta, Tamaño=1kg)
    CREATE TABLE IF NOT EXISTS variantes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      producto_id INT,
      tipo VARCHAR(50) NOT NULL, -- Ej: "Sabor", "Peso", "Color"
      valor VARCHAR(100) NOT NULL, -- Ej: "Frutilla", "1kg", "Rojo"
      precio_extra DECIMAL(10,2) DEFAULT 0, -- Si esa variante es más cara
      stock_variante INT DEFAULT NULL, -- Opcional, si quieres controlar stock por variante
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    );
    
    -- 4. Actualizar tabla productos para soportar Oferta (Si no existe)
    -- Intentamos agregar la columna, si falla es que ya existe (MySQL chapucero pero efectivo)
    ALTER TABLE productos ADD COLUMN oferta BOOLEAN DEFAULT FALSE;
    ALTER TABLE productos ADD COLUMN activo BOOLEAN DEFAULT TRUE;
  `;

  db.query(sql, (err, result) => {
    if (err) {
        // Ignoramos error de "Duplicate column" si ya corriste esto antes
        if(err.code === 'ER_DUP_FIELDNAME') {
            console.log("⚠️ Las columnas ya existían, continuamos...");
        } else {
            console.error("❌ Error actualizando BD:", err);
        }
    } else {
      console.log("✅ ¡Tablas Categorías y Variantes creadas!");
    }
    
    // Insertamos categorías base si está vacío
    db.query("INSERT IGNORE INTO categorias (nombre) VALUES ('Gomitas'), ('Chocolates'), ('Ofertas'), ('Sin TACC')", () => {
        console.log("✅ Categorías base agregadas.");
        db.end();
    });
  });
});