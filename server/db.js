const mysql = require('mysql2');

// ⚠️ Cambiá estos valores según tu configuración local
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '44994334marco', // poné tu contraseña si tenés
  database: 'mielissimo'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err);
    return;
  }
  console.log('✅ Conexión exitosa a MySQL');
});

module.exports = connection;
