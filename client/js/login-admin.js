document.getElementById("form-login-admin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = e.target.usuario.value;
  const clave = e.target.clave.value;

  try {
    const res = await fetch("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, clave })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("tokenAdmin", data.token);
      window.location.href = "admin.html";
    } else {
      document.getElementById("mensaje-login").textContent = data.error || "Credenciales incorrectas";
    }
  } catch (err) {
    console.error("Error al intentar login:", err);
    document.getElementById("mensaje-login").textContent = "Error de conexión con el servidor";
  }
});
