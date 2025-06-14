console.log("¿Estoy en el login?");


document.getElementById("form-login-admin").addEventListener("submit", async (e) => {
  e.preventDefault();

console.log("Enviando formulario de login...");

  const usuario = e.target.usuario.value;
  const clave = e.target.clave.value;

  try {
    const res = await fetch("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ usuario, clave })
    });

    const data = await res.json();
     console.log("Respuesta del servidor:", data);

   if (res.ok) {
      localStorage.setItem("usuarioAdmin", data.usuario);
      window.location.href = "admin.html";
    } else {
      document.getElementById("mensaje-login").textContent = data.error || "Credenciales inválidas";
    }
  } catch (error) {
    console.error("Error al hacer login:", error);
    document.getElementById("mensaje-login").textContent = "Error en el servidor";
  }
});
