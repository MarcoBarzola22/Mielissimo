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
    total += 1000; // Costo fijo de envío
  }

  const totalSpan = document.getElementById("total-compra");
  if (totalSpan) {
    totalSpan.textContent = `ARS $${total.toFixed(2)}`;
  }
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

  const tipoEnvio = document.querySelector('input[name="tipo-envio"]:checked')?.value || "retiro";

  try {
    const res = await fetch("/api/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario, carrito, tipoEnvio }) // Enviamos tipoEnvio también
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

  const radiosEnvio = document.querySelectorAll('input[name="tipo-envio"]');
  radiosEnvio.forEach(radio => {
    radio.addEventListener("change", calcularTotal);
  });

  document.getElementById("confirmar-compra").addEventListener("click", confirmarCompra);
});

window.calcularTotal = calcularTotal;
