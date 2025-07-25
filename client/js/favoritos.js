import { mostrarUsuario, actualizarContadorCarrito, crearBotonCarritoFlotante } from "./navbar.js";


const contenedor = document.getElementById("productos");
const token = localStorage.getItem("token_usuario");

async function cargarFavoritos() {
  const token = localStorage.getItem("token_usuario");

  if (!token) {
    console.error("No hay token, no se pueden cargar favoritos");
    return;
  }

  try {
    const res = await fetch("https://api.mielissimo.com.ar/api/favoritos", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 403) {
      // Token vencido o inválido
      localStorage.removeItem("token_usuario");
      alert("Tu sesión expiró. Inicia sesión nuevamente.");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok) {
      throw new Error("Error al obtener favoritos");
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Formato inesperado de favoritos");
    }

    renderizarFavoritos(data); // tu función de renderizado existente
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
  <p class="precio">AR$ ${parseFloat(producto.precio).toFixed(2)}</p>
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
        const res = await fetch(`https://api.mielissimo.com.ar/api/favoritos/${id}`, {
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
    fetch("https://api.mielissimo.com.ar/api/productos")
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
  crearBotonCarritoFlotante();
  cargarFavoritos();
  
});