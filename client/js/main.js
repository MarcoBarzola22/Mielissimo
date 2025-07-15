import { mostrarUsuario, actualizarContadorCarrito } from "./navbar.js";

const contenedorCategorias = document.getElementById("categorias-horizontal");
const contenedorProductos = document.getElementById("productos");

// 🔃 Cargar categorías como botones pill
function cargarCategorias() {
  fetch("/api/categorias")
    .then(res => res.json())
    .then(categorias => {
      if (!contenedorCategorias) return;

      contenedorCategorias.innerHTML = "";

      const btnTodas = document.createElement("button");
      btnTodas.textContent = "Todas";
      btnTodas.classList.add("btn-categoria", "activa");
      btnTodas.dataset.id = "todas";
      contenedorCategorias.appendChild(btnTodas);

      categorias.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat.nombre;
        btn.dataset.id = cat.id;
        btn.classList.add("btn-categoria");
        contenedorCategorias.appendChild(btn);
      });
    })
    .catch(err => console.error("Error al cargar categorías:", err));
}

// 🖱️ Filtro por categoría
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-categoria")) {
    const idCategoria = e.target.dataset.id;

    document.querySelectorAll(".btn-categoria").forEach(btn =>
      btn.classList.remove("activa")
    );
    e.target.classList.add("activa");

    const url = idCategoria === "todas"
      ? "/api/productos"
      : `/api/productos?categoria=${idCategoria}`;

    fetch(url)
      .then(res => res.json())
      .then(productos => renderizarProductos(productos))
      .catch(err => console.error("Error al filtrar productos:", err));
  }
});

// 🔄 Obtener favoritos del usuario si está logueado
async function obtenerFavoritos() {
  const tokenUsuario = localStorage.getItem("token_usuario");
  if (!tokenUsuario) return [];

  try {
    const res = await fetch("/api/favoritos", {
      headers: { Authorization: `Bearer ${tokenUsuario}` }
    });

    if (!res.ok) throw new Error("No autorizado");

    const data = await res.json();
    return data.map(f => f.producto_id);
  } catch (err) {
    console.error("Error al obtener favoritos:", err);
    return [];
  }
}

// 🖼 Renderizar productos
async function renderizarProductos(productos) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = "";

  const favoritos = await obtenerFavoritos();
  const tokenUsuario = localStorage.getItem("token_usuario");

  productos.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto");

    const esFavorito = favoritos.includes(prod.id);
    const iconoCorazon = esFavorito ? "❤️" : "🤍"; // Relleno vs vacío
    const colorCorazon = esFavorito ? "#ef5579" : "#999";

    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p class="categoria-nombre">${prod.categoria_nombre || "Sin categoría"}</p>
      <p>Precio: $${parseFloat(prod.precio).toFixed(2)}</p>
      <p>Stock: ${prod.stock}</p>
      <button class="btn-carrito" data-id="${prod.id}">Agregar al carrito</button>
      ${tokenUsuario ? `<button class="btn-favorito" data-id="${prod.id}" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: ${colorCorazon};">
        ${iconoCorazon}
      </button>` : ""}
    `;

    // Redirigir al hacer clic en la tarjeta (excepto en botones)
    div.addEventListener("click", (e) => {
      if (
        !e.target.classList.contains("btn-carrito") &&
        !e.target.classList.contains("btn-favorito")
      ) {
        window.location.href = `producto.html?id=${prod.id}`;
      }
    });

    contenedorProductos.appendChild(div);
  });

  // Evento para agregar/quitar favorito
  if (tokenUsuario) {
    document.querySelectorAll(".btn-favorito").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
const id = parseInt(e.target.dataset.id);
const icono = e.target;

try {
  if (favoritos.includes(id)) {
    await fetch(`/api/favoritos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenUsuario}` }
    });
    icono.textContent = "🤍";
    icono.style.color = "#999";
    favoritos.splice(favoritos.indexOf(id), 1);
  } else {
    await fetch("/api/favoritos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenUsuario}`
      },
      body: JSON.stringify({ producto_id: id })
    });
    icono.textContent = "❤️";
    icono.style.color = "#ef5579";
    favoritos.push(id);
  }
} catch (err) {
  console.error("Error al actualizar favoritos:", err);
}

      });
    });
  }

  // Eventos para agregar al carrito
  document.querySelectorAll(".btn-carrito").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      agregarAlCarrito(id);
    });
  });
}

// 🛒 Carrito con LocalStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function agregarAlCarrito(id) {
  const productoExistente = carrito.find(p => p.id === id);
  if (productoExistente) {
    productoExistente.cantidad++;
    guardarCarrito();
  } else {
    fetch(`/api/productos`)
      .then(res => res.json())
      .then(productos => {
        const prod = productos.find(p => p.id === id);
        if (prod) {
          carrito.push({
            id: prod.id,
            nombre: prod.nombre,
            precio: parseFloat(prod.precio),
            cantidad: 1,
            imagen: prod.imagen
          });
          guardarCarrito();
        }
      });
  }
}
window.agregarAlCarrito = agregarAlCarrito;

// 📧 Newsletter
const formNewsletter = document.getElementById("form-newsletter");
const inputEmail = document.getElementById("email-newsletter");
const mensajeNewsletter = document.getElementById("mensaje-newsletter");

if (formNewsletter) {
  formNewsletter.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = inputEmail.value.trim();

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        mensajeNewsletter.textContent = data.mensaje;
        mensajeNewsletter.style.color = "green";
        formNewsletter.reset();
      } else {
        mensajeNewsletter.textContent = data.error;
        mensajeNewsletter.style.color = "red";
      }
    } catch (err) {
      mensajeNewsletter.textContent = "Error de conexión";
      mensajeNewsletter.style.color = "red";
    }
  });
}

// 🚀 Inicio
document.addEventListener("DOMContentLoaded", async () => {
  mostrarUsuario();
  actualizarContadorCarrito();
  cargarCategorias();

  const productos = await fetch("/api/productos").then(r => r.json());
  renderizarProductos(productos);
});
