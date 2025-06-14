const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '44994334marco',
  database: 'mielissimo'
});

const usuario = 'admin';
const clavePlano = '1234'; // Cambialo si querés

// Verificar si el usuario ya existe
const verificarSQL = 'SELECT * FROM admins WHERE usuario = ?';

db.query(verificarSQL, [usuario], (err, resultados) => {
  if (err) {
    console.error('Error al verificar usuario:', err);
    return db.end();
  }

  if (resultados.length > 0) {
    console.log('El usuario ya existe. No se realizó ninguna acción.');
    return db.end();
  }

  // Hashear la clave y crear el usuario
  bcrypt.hash(clavePlano, 10, (err, hash) => {
    if (err) {
      console.error('Error al hashear la clave:', err);
      return db.end();
    }

    const insertSQL = 'INSERT INTO admins (usuario, clave) VALUES (?, ?)';
    db.query(insertSQL, [usuario, hash], (err, resultado) => {
      if (err) {
        console.error('Error al insertar admin:', err);
      } else {
        console.log('Admin creado con éxito');
      }
      db.end();
    });
  });
});
