import { mostrarUsuario, actualizarContadorCarrito } from "./navbar.js";

const infoProducto = document.getElementById("info-producto");
const variantesSection = document.getElementById("variantes-producto");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const token = localStorage.getItem("token_usuario");
let esFavorito = false;

// 🔃 Cargar datos del producto
async function cargarProducto() {
  try {
    const res = await fetch("/api/productos");
    const productos = await res.json();
    const prod = productos.find(p => p.id == id);

    if (!prod) {
      infoProducto.innerHTML = "<p>Producto no encontrado</p>";
      return;
    }

    if (token) await verificarFavorito();

    infoProducto.innerHTML = `
      <div class="producto-detalle-card">
        <img src="${prod.imagen}" alt="${prod.nombre}">
        <div class="producto-info">
          <h1>${prod.nombre}</h1>
          <p><strong>Precio:</strong> $${parseFloat(prod.precio).toFixed(2)}</p>
          <p><strong>Stock:</strong> ${prod.stock}</p>
          <p><strong>Categoría:</strong> ${prod.categoria_nombre || "Sin categoría"}</p>
          <button id="btn-agregar" class="btn">Agregar al carrito</button>
          ${token ? `<button id="btn-favorito" style="background: none; border: none; font-size: 2rem; cursor: pointer;">
            ${esFavorito ? "❤️" : "🤍"}
          </button>` : ""}
        </div>
      </div>
    `;

    document.getElementById("btn-agregar").addEventListener("click", () => agregarAlCarrito(prod.id));
    if (token) {
      document.getElementById("btn-favorito").addEventListener("click", toggleFavorito);
    }
  } catch (err) {
    console.error("Error al cargar producto:", err);
  }
}

// ✅ Verifica si el producto está en favoritos
async function verificarFavorito() {
  try {
    const res = await fetch("/api/favoritos", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const favoritos = await res.json();
    esFavorito = favoritos.some(f => f.producto_id == id);
  } catch (err) {
    console.error("Error al verificar favorito:", err);
  }
}

// ❤️ Alternar estado favorito
async function toggleFavorito() {
  try {
    const btn = document.getElementById("btn-favorito");
    if (esFavorito) {
      await fetch(`/api/favoritos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      esFavorito = false;
    } else {
      await fetch("/api/favoritos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ producto_id: parseInt(id) })
      });
      esFavorito = true;
    }
    btn.innerHTML = esFavorito ? "❤️" : "🤍";
  } catch (err) {
    console.error("Error al actualizar favorito:", err);
  }
}

// 🧩 Cargar variantes del producto
fetch(`/api/variantes/${id}`)
  .then(res => res.json())
  .then(variantes => {
    if (variantes.length > 0) {
      variantesSection.innerHTML = "<h2>Variantes disponibles</h2>";
      variantes.forEach(v => {
        const div = document.createElement("div");
        div.classList.add("variante-detalle");
        div.innerHTML = `
          <img src="${v.imagen}" alt="${v.nombre}">
          <div>
            <p><strong>${v.nombre}</strong></p>
            <p>Precio extra: $${parseFloat(v.precio_extra).toFixed(2)}</p>
            <p>Stock: ${v.stock}</p>
          </div>
        `;
        variantesSection.appendChild(div);
      });
    }
  });

function agregarAlCarrito(id) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const productoExistente = carrito.find(p => p.id === id);

  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    fetch("/api/productos")
      .then(res => res.json())
      .then(productos => {
        const prod = productos.find(p => p.id == id);
        if (prod) {
          carrito.push({
            id: prod.id,
            nombre: prod.nombre,
            precio: parseFloat(prod.precio),
            cantidad: 1,
            imagen: prod.imagen
          });
          localStorage.setItem("carrito", JSON.stringify(carrito));
          actualizarContadorCarrito();
        }
      });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
}

// 🚀 Inicio
document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuario();
  actualizarContadorCarrito();
  cargarProducto();
});
