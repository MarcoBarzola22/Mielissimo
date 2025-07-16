import { mostrarUsuario, actualizarContadorCarrito } from "./navbar.js";

const infoProducto = document.getElementById("info-producto");
const variantesSection = document.getElementById("variantes-producto");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const token = localStorage.getItem("token_usuario");

let esFavorito = false;
let variantesSeleccionadas = [];

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
      <div class="producto-imagen">
        <img src="${prod.imagen}" alt="${prod.nombre}" class="producto-imagen">
      </div>
      <div class="producto-info">
        <h1>${prod.nombre}</h1>
        <p><strong>Precio:</strong> $${parseFloat(prod.precio).toFixed(2)}</p>
        <p><strong>Stock:</strong> ${prod.stock}</p>
        <p><strong>Categoría:</strong> ${prod.categoria_nombre || "Sin categoría"}</p>
        <div class="botones-producto">
          <button id="btn-agregar" class="btn">Agregar al carrito</button>
          ${token ? `<button id="btn-favorito">${esFavorito ? "❤️" : "🤍"}</button>` : ""}
        </div>
      </div>
    `;

    document.getElementById("btn-agregar").addEventListener("click", () => agregarAlCarrito(prod));
    if (token) {
      document.getElementById("btn-favorito").addEventListener("click", toggleFavorito);
    }
  } catch (err) {
    console.error("Error al cargar producto:", err);
  }
}

async function verificarFavorito() {
  try {
    const res = await fetch("/api/favoritos", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const favoritos = await res.json();
    esFavorito = favoritos.some(f => f.producto_id == id);
  } catch (err) {
    console.error("Error al verificar favorito:", err);
  }
}

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
    btn.textContent = esFavorito ? "❤️" : "🤍";
  } catch (err) {
    console.error("Error al actualizar favorito:", err);
  }
}

function agregarAlCarrito(prod) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const igual = p =>
    p.id === prod.id &&
    JSON.stringify(p.variantes) === JSON.stringify(variantesSeleccionadas);

  const existente = carrito.find(igual);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: parseFloat(prod.precio),
      imagen: prod.imagen,
      cantidad: 1,
      variantes: variantesSeleccionadas
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
  alert("Producto agregado con éxito");
}

// 🧩 Cargar variantes
fetch(`/api/variantes/${id}`)
  .then(res => res.json())
  .then(variantes => {
    if (variantes.length === 0) return;

    variantesSection.innerHTML = "<h2>Variantes disponibles</h2>";
    const grid = document.createElement("div");
    grid.className = "variantes-grid";
    variantesSection.appendChild(grid);

    variantes.forEach(v => {
      const div = document.createElement("div");
      div.className = "variante-card";
      div.innerHTML = `
        <input type="checkbox" id="var-${v.id}" data-id="${v.id}" data-nombre="${v.nombre}" data-precio="${v.precio_extra}" />
        <label for="var-${v.id}">
          <p><strong>${v.nombre}</strong></p>
          <p>Tipo: ${v.tipo}</p>
          <p>Precio extra: $${parseFloat(v.precio_extra).toFixed(2)}</p>
          <p>Stock: ${v.stock}</p>
        </label>
      `;
      grid.appendChild(div);
    });

    document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const id = parseInt(checkbox.dataset.id);
        const nombre = checkbox.dataset.nombre;
        const precio = parseFloat(checkbox.dataset.precio);

        if (checkbox.checked) {
          variantesSeleccionadas.push({ id, nombre, precio });
        } else {
          variantesSeleccionadas = variantesSeleccionadas.filter(v => v.id !== id);
        }
      });
    });
  });

document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuario();
  actualizarContadorCarrito();
  cargarProducto();
});
