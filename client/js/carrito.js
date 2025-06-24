import { mostrarUsuario, actualizarContadorCarrito } from "./navbar.js";

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function renderizarCarrito() {
  const contenedor = document.querySelector(".carrito-contenedor");
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

  carrito.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("item-carrito");
    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="info">
        <h3>${item.nombre}</h3>
        <p>Cantidad: ${item.cantidad}</p>
        <p>Precio: $${(item.precio * item.cantidad).toFixed(2)}</p>
      </div>
      <button class="btn-eliminar" data-index="${index}">Eliminar</button>
    `;
    contenedor.appendChild(div);
  });

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderizarCarrito();
      actualizarContadorCarrito();
    });
  });
}

async function confirmarCompra() {
  const mensaje = document.getElementById("mensaje-compra");
  const id_usuario = Number(localStorage.getItem("id_usuario"));

  if (!id_usuario) {
    mensaje.textContent = "Necesitás iniciar sesión para comprar.";
    mensaje.style.color = "red";
    return;
  }

  if (carrito.length === 0) {
    mensaje.textContent = "Tu carrito está vacío.";
    mensaje.style.color = "red";
    return;
  }

  // 🔧 Transformamos carrito al formato esperado por el backend
  const productos = carrito.map(item => ({
    id_producto: item.id,
    cantidad: item.cantidad
  }));

  try {
    const res = await fetch("/api/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario, carrito }) // CAMBIADO de productos → carrito
    });

    const data = await res.json();

    if (res.ok) {
      mensaje.textContent = "¡Compra confirmada con éxito!";
      mensaje.style.color = "green";
      carrito = [];
      localStorage.setItem("carrito", JSON.stringify([]));
      renderizarCarrito();
      actualizarContadorCarrito();
    } else {
      mensaje.textContent = data.error || "Error al confirmar compra.";
      mensaje.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    mensaje.textContent = "Error de conexión con el servidor.";
    mensaje.style.color = "red";
  }
}


document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuario();
  renderizarCarrito();
  actualizarContadorCarrito();

  document.getElementById("confirmar-compra").addEventListener("click", confirmarCompra);
});
