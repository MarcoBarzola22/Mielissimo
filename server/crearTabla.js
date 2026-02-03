require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error("❌ Error de conexión:", err);
    return;
  }
  console.log("✅ Conectado a la base de datos.");

  const sql = `
    CREATE TABLE IF NOT EXISTS administradores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error creando la tabla:", err);
    } else {
      console.log("✅ ¡Tabla 'administradores' creada correctamente!");
    }
    db.end();
  });
});