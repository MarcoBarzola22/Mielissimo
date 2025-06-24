// login.js (frontend)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      alert("Por favor completá ambos campos.");
      return;
    }

    try {
      const res = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // 🔐 Guardamos token y datos del usuario
        localStorage.setItem("token_usuario", data.token);
        localStorage.setItem("id_usuario", data.usuario.id);
        localStorage.setItem("nombre_usuario", data.usuario.nombre);

        alert("¡Bienvenido!");
        window.location.href = "index.html";
      } else {
        alert(data.error || "Credenciales incorrectas.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor.");
    }
  });
});
