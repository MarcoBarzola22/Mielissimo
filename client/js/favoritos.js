import { mostrarUsuario, actualizarContadorCarrito } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
  mostrarUsuario();
  actualizarContadorCarrito();

  const contenedor = document.getElementById("lista-favoritos");
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  if (favoritos.length === 0) {
    contenedor.innerHTML = "<p>No tenés productos favoritos aún.</p>";
    return;
  }

  try {
    const res = await fetch("/api/productos");
    const productos = await res.json();

    const productosFavoritos = productos.filter(p => favoritos.includes(p.id));

    productosFavoritos.forEach(prod => {
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
        <button onclick="quitarFavorito(${prod.id})" style="background: #eee; border: 1px solid #ef5579; color: #ef5579; margin-top: 8px;">❌ Quitar de favoritos</button>
      `;
      contenedor.appendChild(div);
    });

    // Accesible globalmente
    window.agregarAlCarrito = function (id) {
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      const existe = carrito.find(p => p.id === id);
      if (existe) {
        existe.cantidad++;
      } else {
        const producto = productos.find(p => p.id === id);
        if (producto) {
          carrito.push({ ...producto, cantidad: 1 });
        }
      }
      localStorage.setItem("carrito", JSON.stringify(carrito));
      actualizarContadorCarrito();
    };

    window.quitarFavorito = function (id) {
      favoritos = favoritos.filter(favId => favId !== id);
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
      location.reload(); // recarga para actualizar la vista
    };

  } catch (err) {
    contenedor.innerHTML = "<p>Error al cargar productos favoritos.</p>";
    console.error(err);
  }
});
