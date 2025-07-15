import { mostrarUsuario, actualizarContadorCarrito } from "./navbar.js";

const contenedor = document.getElementById("productos");
const token = localStorage.getItem("token_usuario");

async function cargarFavoritos() {
  try {
    const res = await fetch("/api/favoritos", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener favoritos");

    const favoritos = await res.json();
    const productos = await fetch("/api/productos").then(r => r.json());

    const favoritosCompletos = productos.filter(p =>
      favoritos.some(fav => fav.producto_id === p.id)
    );

    renderizarFavoritos(favoritosCompletos);
  } catch (err) {
    console.error("Error al cargar favoritos:", err);
  }
}

function renderizarFavoritos(productos) {
  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const div = document.createElement("div");
    div.classList.add("producto");

    div.innerHTML = `
  <img src="${producto.imagen}" alt="${producto.nombre}">
  <h3>${producto.nombre}</h3>
  <p class="categoria-nombre">${producto.categoria_nombre || "Sin categoría"}</p>
  <p class="precio">$${parseFloat(producto.precio).toFixed(2)}</p>
  <p class="stock">Stock: ${producto.stock}</p>
  <div class="acciones-producto">
    <button class="btn-carrito" data-id="${producto.id}">Agregar al carrito</button>
    <button class="btn-favorito favorito-activo" data-id="${producto.id}" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #ef5579;">❤️</button>
  </div>
`;


    div.addEventListener("click", (e) => {
      if (!e.target.classList.contains("btn-carrito") && !e.target.classList.contains("btn-favorito")) {
        window.location.href = `producto.html?id=${producto.id}`;
      }
    });

    contenedor.appendChild(div);
  });

  document.querySelectorAll(".btn-carrito").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      agregarAlCarrito(id);
    });
  });

  document.querySelectorAll(".btn-favorito").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      try {
        const res = await fetch(`/api/favoritos/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          btn.closest(".producto").remove(); // Elimina la tarjeta del DOM
        }
      } catch (err) {
        console.error("Error al quitar favorito:", err);
      }
    });
  });
}

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
  cargarFavoritos();
});
