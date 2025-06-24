document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!nombre || !email || !password) {
      alert("Por favor completá todos los campos.");
      return;
    }

    if (!validarEmail(email)) {
      alert("Ingresá un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const res = await fetch("/api/usuarios/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.mensaje);
        window.location.href = "login.html";
      } else {
        alert(data.error || "Ocurrió un error");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor.");
    }
  });
});

function validarEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
