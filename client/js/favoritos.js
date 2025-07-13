import { mostrarUsuario, actualizarContadorCarrito } from "./navbar.js";

const contenedor = document.getElementById("favoritos-lista");
const token = localStorage.getItem("tokenUsuario");
const usuario = JSON.parse(localStorage.getItem("usuario"));

async function obtenerFavoritos() {
  if (!usuario) {
    contenedor.innerHTML = "<p>Iniciá sesión para ver tus favoritos.</p>";
    return;
  }

  try {
    const res = await fetch(`/api/favoritos/${usuario.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const favoritos = await res.json();

    if (!favoritos.length) {
      contenedor.innerHTML = "<p>📭 No tenés productos en tu lista de favoritos.</p>";
      return;
    }

    const resProd = await fetch("/api/productos");
    const todos = await resProd.json();

    const productosFav = todos.filter(p =>
      favoritos.some(f => f.producto_id === p.id)
    );

    renderizar(productosFav);
  } catch (error) {
    contenedor.innerHTML = "<p>Error al cargar favoritos.</p>";
  }
}

function renderizar(productos) {
  contenedor.innerHTML = "";

  productos.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto");

    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <h3>${prod.nombre}</h3>
      <p>${prod.categoria_nombre || "Sin categoría"}</p>
      <p>Precio: $${parseFloat(prod.precio).toFixed(2)}</p>
      <p>Stock: ${prod.stock}</p>
      <button onclick="location.href='producto.html?id=${prod.id}'">Ver producto</button>
    `;

    contenedor.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuario();
  actualizarContadorCarrito();
  obtenerFavoritos();
});
