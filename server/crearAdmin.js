require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Conexión a la Base de Datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const usuario = 'admin';
const clave = 'mielissimo2026'; // Esta será tu contraseña nueva

// 1. Generamos el Hash de la contraseña
bcrypt.hash(clave, 10, (err, hash) => {
  if (err) {
    console.error("Error encriptando:", err);
    process.exit(1);
  }

  // 2. Verificamos si la tabla se llama 'administradores' o 'admins'
  // Intentamos primero con 'administradores' que es lo más probable
  const checkTable = "SHOW TABLES LIKE 'administradores'";
  
  db.query(checkTable, (err, results) => {
    let tableName = 'administradores';
    if (results.length === 0) {
       // Si no existe, probamos 'usuarios' por si acaso
       tableName = 'usuarios'; 
       console.log("⚠️ No encontré la tabla 'administradores', intentaré con 'usuarios'...");
    }

    console.log(`Usando tabla: ${tableName}`);

    // 3. Insertamos o Actualizamos el usuario
    const sql = `INSERT INTO ${tableName} (usuario, password) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = ?`;
    
    // NOTA: Si tu columna de contraseña se llama 'clave' en vez de 'password', cambia la línea de arriba.
    
    db.query(sql, [usuario, hash, hash], (err, result) => {
      if (err) {
        console.error(`❌ Error en la base de datos (${tableName}):`, err.message);
        console.log("POSIBLE SOLUCIÓN: Verifica si la columna de contraseña se llama 'password' o 'clave' en tu base de datos.");
      } else {
        console.log("✅ ¡Éxito! Usuario Admin creado/actualizado.");
        console.log(`👤 Usuario: ${usuario}`);
        console.log(`🔑 Clave: ${clave}`);
      }
      db.end();
    });
  });
});