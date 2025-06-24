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

// 🖼 Renderizar productos
function renderizarProductos(productos) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = "";

  productos.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <a href="producto.html?id=${prod.id}">
        <img src="${prod.imagen}" alt="${prod.nombre}">
      </a>
      <h3>${prod.nombre}</h3>
      <p class="categoria-nombre">${prod.categoria_nombre || "Sin categoría"}</p>
      <p>Precio: $${parseFloat(prod.precio).toFixed(2)}</p>
      <p>Stock: ${prod.stock}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
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
document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuario();
  actualizarContadorCarrito();
  cargarCategorias();

  fetch("/api/productos")
    .then(res => res.json())
    .then(productos => renderizarProductos(productos));
});
