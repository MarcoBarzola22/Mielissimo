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

async function confirmarCompra() {
  const mensaje = document.getElementById("mensaje-compra");
  const id_usuario = Number(localStorage.getItem("id_usuario"));
  const nombreUsuario = localStorage.getItem("nombre_usuario") || "Anónimo";

  if (carrito.length === 0) {
    mensaje.textContent = "🛒 Tu carrito está vacío.";
    mensaje.style.color = "red";
    mensaje.style.display = "block";
    return;
  }

  // COPIAR CARRITO ANTES DE VACIARLO
  const carritoCopia = [...carrito];

  // Mostrar mensaje instantáneo
  mensaje.innerHTML = "✅ <strong>¡Compra confirmada! Redirigiendo a WhatsApp...</strong>";
  mensaje.style.color = "green";
  mensaje.style.display = "block";

  const tipoEnvio = document.querySelector('input[name="tipo-envio"]:checked')?.value || "retiro";
  const totalTexto = document.getElementById("total-compra").textContent.replace(/[^\d.-]/g, "").trim();
  const total = parseFloat(totalTexto);

  // Guardar en DB si hay usuario logueado
  if (id_usuario) {
    try {
      await fetch("https://api.mielissimo.com.ar/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, carrito: carritoCopia, tipoEnvio, total })
      });
    } catch (err) {
      console.error("Error guardando en historial:", err);
    }
  }

  // Generar mensaje WhatsApp usando carritoCopia
  const tipo = tipoEnvio === "envio" ? "🚚 Envío a domicilio" : "🏠 Retiro en local";

  const detallesProductos = carritoCopia.map(item => {
    const variantesTexto = item.variantes?.length
      ? ` (${item.variantes.map(v => v.nombre).join(", ")})`
      : "";

    return `❤️ ${item.cantidad} x ${item.nombre}${variantesTexto} = $${(item.precio * item.cantidad).toFixed(2)}`;
  }).join("\n");

  const mensajeTexto = 
`Hola, quiero hacer un pedido en Mielíssimo 🍬❤️
✨ ¡Más golosinas, más contento! 😋

Detalles del Pedido:
${detallesProductos}

💲 Total: $${total.toFixed(2)}

👤 Nombre: ${nombreUsuario}
${tipo}`;

  const textoCodificado = encodeURIComponent(mensajeTexto);
 const numeroWhatsapp = "2657603387"; // sin espacios ni guiones
const linkWhatsapp = `https://wa.me/549${numeroWhatsapp}?text=${mensaje}`;

  // Redirigir a WhatsApp y luego vaciar carrito
  setTimeout(() => {
    window.location.href = linkWhatsapp;

    // Vaciar carrito después
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify([]));
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
