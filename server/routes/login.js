const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcrypt"); // O bcryptjs si instalaste ese
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Creamos conexión propia para este módulo (o impórtala de db.js si lo tienes configurado)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// RUTA: POST /api/admin/login
router.post("/login", (req, res) => {
  const { usuario, clave } = req.body;

  // 1. Validar datos
  if (!usuario || !clave) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // 2. Buscar usuario en la base de datos
  // IMPORTANTE: Asegúrate que la tabla se llama 'administradores' (lo definimos en el paso anterior)
  const sql = "SELECT * FROM administradores WHERE usuario = ?";
  
  db.query(sql, [usuario], async (err, results) => {
    if (err) {
      console.error("Error SQL:", err);
      return res.status(500).json({ error: "Error de servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const admin = results[0];

    // 3. Comparar contraseña (Hash vs Texto plano)
    const passwordMatch = await bcrypt.compare(clave, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 4. Generar Token (Tu llave de acceso)
    const token = jwt.sign(
      { id: admin.id, usuario: admin.usuario },
      process.env.JWT_SECRET || "secreto_super_seguro", // Usa una variable de entorno en producción
      { expiresIn: "8h" }
    );

    // 5. Responder con éxito
    res.json({ 
      mensaje: "Login exitoso",
      token: token,
      usuario: admin.usuario
    });
  });
});

module.exports = router;