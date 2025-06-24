// navbar.js

export function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (contador) {
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contador.textContent = `(${total})`;
  }
}

export function mostrarUsuario() {
  const nombreUsuario = localStorage.getItem("nombre_usuario");
  const contenedorUsuario = document.getElementById("usuario-logueado");
  const loginLi = document.getElementById("login-li");
  const btnHistorial = document.getElementById("btn-historial");

  if (nombreUsuario && contenedorUsuario) {
    contenedorUsuario.innerHTML = `
      <span style="color: #ef5579; font-weight: bold;">👤 ${nombreUsuario}</span>
      <button id="cerrar-sesion"
        style="margin-left: 12px; background:#ef5579; color:white; border:none; border-radius:5px; padding:3px 8px; cursor:pointer;">
        Cerrar sesión
      </button>
    `;
    contenedorUsuario.style.display = "inline-block";
    if (loginLi) loginLi.style.display = "none";
    if (btnHistorial) btnHistorial.style.display = "inline-block"; // ✅ Mostrar botón

    document.getElementById("cerrar-sesion").addEventListener("click", () => {
      localStorage.clear();
      location.href = "index.html";
    });
  }
}

