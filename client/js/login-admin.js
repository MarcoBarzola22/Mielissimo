console.log("JS de login-admin cargado");

document.getElementById("form-login-admin").addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Formulario detectado");

  const usuario = e.target.usuario.value;
  const clave = e.target.clave.value;

  try {
    const res = await fetch("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, clave }) // nombre de campos correcto
    });

    const resultado = await res.json();

    if (res.ok) {
      // Guardar token para control de acceso
      localStorage.setItem("tokenAdmin", "ok");
      window.location.href = "admin.html";
    } else {
      document.getElementById("mensaje-login").textContent = resultado.error || "Credenciales incorrectas";
    }
  } catch (err) {
    console.error("Error al loguear:", err);
    document.getElementById("mensaje-login").textContent = "Error de conexión con el servidor";
  }
});
