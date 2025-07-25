import { mostrarUsuario, actualizarContadorCarrito } from "./navbar.js";

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function renderizarCarrito() {
  const contenedor = document.querySelector(".carrito-contenedor");
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
  contenedor.innerHTML = "<p style='text-align: center;'>Tu carrito está vacío.</p>";
  document.getElementById("opciones-envio").style.display = "none";
  document.getElementById("confirmar-compra").style.display = "none";
  document.getElementById("mensaje-compra").style.display = "none";
  document.getElementById("total-compra").textContent = "ARS $0.00";
  return;
} else {
  document.getElementById("opciones-envio").style.display = "block";
  document.getElementById("confirmar-compra").style.display = "inline-block";
  document.getElementById("mensaje-compra").style.display = "block";
}


  carrito.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("item-carrito");

    let variantesHTML = "";
    if (item.variantes && item.variantes.length > 0) {
      variantesHTML = "<ul class='lista-variantes'>";
      item.variantes.forEach(v => {
        variantesHTML += `<li>${v.tipo}: ${v.nombre}</li>`;
      });
      variantesHTML += "</ul>";
    }

    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="info">
        <h3>${item.nombre}</h3>
        ${variantesHTML}
        <p>Cantidad: ${item.cantidad}</p>
        <p>Precio: ARS $${(item.precio * item.cantidad).toFixed(2)}</p>
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

  actualizarContadorCarrito();
  calcularTotal();
}

function calcularTotal() {
  const tipoEnvio = document.querySelector('input[name="tipo-envio"]:checked')?.value;
  let total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  if (tipoEnvio === "envio") {
  total += 1800; // Nuevo costo de envío
}


  const totalSpan = document.getElementById("total-compra");
  if (totalSpan) {
    totalSpan.textContent = `ARS $${total.toFixed(2)}`;
  }
}

function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (carrito.length === 0) {
    mensajeConfirmacion.textContent = "El carrito está vacío.";
    mensajeConfirmacion.style.color = "red";
    return;
  }

  // Armar mensaje para WhatsApp
  let mensaje = "Hola, quiero hacer un pedido en Mielíssimo\n\n";

  let total = 0;
  carrito.forEach(item => {
    const variantesTexto = item.variantes && item.variantes.length > 0
      ? ` (${item.variantes.map(v => v.nombre).join(", ")})`
      : "";
    mensaje += `- ${item.nombre}${variantesTexto} x${item.cantidad}: $${(item.precio * item.cantidad).toFixed(2)}\n`;
    total += item.precio * item.cantidad;
  });

  mensaje += `\nTotal: $${total.toFixed(2)}\n`;

  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  mensaje += `\nNombre: ${usuario.nombre || "No especificado"}\n`;

  // Forma de entrega (retiro/envío)
  const metodoEntrega = document.querySelector('input[name="entrega"]:checked');
  if (metodoEntrega) {
    mensaje += `${metodoEntrega.value}\n`;
  }

  // Obtener número de WhatsApp y generar enlace
  const numeroWhatsapp = "92657603387"; // SIN el +54 9 inicial
  const linkWhatsapp = `https://wa.me/54${numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`;

  // Mostrar mensaje de confirmación antes de redirigir
  mensajeConfirmacion.textContent = "Redirigiendo a WhatsApp...";
  mensajeConfirmacion.style.color = "green";

  // Abrir WhatsApp y limpiar carrito después de un pequeño delay
  setTimeout(() => {
    window.open(linkWhatsapp, "_blank");
    localStorage.removeItem("carrito");
    actualizarContadorCarrito();
    renderizarCarrito();
  }, 500);
}




document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuario();
  renderizarCarrito();
  actualizarContadorCarrito();

  const radiosEnvio = document.querySelectorAll('input[name="tipo-envio"]');
  radiosEnvio.forEach(radio => {
    radio.addEventListener("change", calcularTotal);
  });

  document.getElementById("confirmar-compra").addEventListener("click", confirmarCompra);
});

window.calcularTotal = calcularTotal;
