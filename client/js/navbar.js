// navbar.js
export function mostrarUsuario() {
  const nombreUsuario = localStorage.getItem("nombre_usuario");
  const loginLi = document.getElementById("login-li");
  const usuarioLogueadoLi = document.getElementById("usuario-logueado");
  const historialLi = document.getElementById("btn-historial");
  const favoritosLi = document.getElementById("btn-favoritos");

  if (nombreUsuario) {
    if (loginLi) loginLi.style.display = "none";
    if (usuarioLogueadoLi) {
      usuarioLogueadoLi.textContent = `👤 ${nombreUsuario}`;
      usuarioLogueadoLi.style.display = "inline";
      usuarioLogueadoLi.style.color = "white"; // Cambiar si el navbar es blanco
    }
    if (historialLi) historialLi.style.display = "inline";
    if (favoritosLi) favoritosLi.style.display = "inline";

    // Agregar botón de cerrar sesión
    if (!document.getElementById("btn-logout")) {
      const liCerrar = document.createElement("li");
      liCerrar.id = "btn-logout";
      liCerrar.innerHTML = `<a href="#">Cerrar sesión</a>`;
      liCerrar.addEventListener("click", () => {
        localStorage.removeItem("token_usuario");
        localStorage.removeItem("nombre_usuario");
        localStorage.removeItem("id_usuario");
        localStorage.removeItem("carrito");
        window.location.href = "index.html";
      });

      document.querySelector("nav ul").appendChild(liCerrar);
    }

  } else {
    if (loginLi) loginLi.style.display = "inline";
    if (usuarioLogueadoLi) usuarioLogueadoLi.style.display = "none";
    if (historialLi) historialLi.style.display = "none";
    if (favoritosLi) favoritosLi.style.display = "none";

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) btnLogout.remove();
  }
}

export function actualizarContadorCarrito() {
  const intentoActualizar = () => {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
      contador.textContent = `(${total})`;
    } else {
      setTimeout(intentoActualizar, 100); // vuelve a intentar si aún no existe
    }
  };

  intentoActualizar();
}


export function mostrarBotonCarritoFlotante() {
  const ruta = window.location.pathname;
  const estaEnCarrito = ruta.includes("carrito.html");
  const botonCarrito = document.getElementById("boton-carrito-flotante");

  if (botonCarrito) {
    botonCarrito.style.display = estaEnCarrito ? "none" : "block";
  }
}
