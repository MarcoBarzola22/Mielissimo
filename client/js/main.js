const API_URL = "https://api.mielissimo.com.ar/api";

// Elementos del DOM
const contenedorCategorias = document.getElementById("categorias-horizontal");
const contenedorProductos = document.getElementById("productos");
const contadorCarrito = document.getElementById("contador-carrito");
const contadorCarritoFlotante = document.getElementById("contador-carrito-flotante");
const searchInput = document.getElementById("buscador");

let productosCache = [];
let favoritosCache = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ===============================
// Inicialización
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [productos, favoritos] = await Promise.all([
      fetch(`${API_URL}/productos`).then(r => r.json()),
      obtenerFavoritos()
    ]);

    productosCache = productos;
    favoritosCache = favoritos;

    renderizarCategorias();
    renderizarProductos(productosCache, favoritosCache);

    configurarNewsletter();

    configurarBuscador();
    mostrarUsuario();
    actualizarContadorCarrito();
    crearBotonCarritoFlotante();

  } catch (error) {
    console.error("Error inicial:", error);
  }
});

// ===============================
// Obtener favoritos del usuario
// ===============================
async function obtenerFavoritos() {
  const tokenUsuario = localStorage.getItem("token_usuario");
  if (!tokenUsuario) return [];

  try {
    const res = await fetch(`${API_URL}/favoritos`, {
      headers: { Authorization: `Bearer ${tokenUsuario}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ===============================
// Renderizar categorías con botón "Todos"
// ===============================
function renderizarCategorias() {
  if (!contenedorCategorias) return;
  contenedorCategorias.innerHTML = "";

  const fragment = document.createDocumentFragment();

  // Botón "Todos"
  const botonTodos = document.createElement("button");
  botonTodos.textContent = "Todos";
  botonTodos.className = "boton-categoria";
  botonTodos.addEventListener("click", () => renderizarProductos(productosCache, favoritosCache));
  fragment.appendChild(botonTodos);

  // Categorías dinámicas
  fetch(`${API_URL}/categorias`)
    .then(r => r.json())
    .then(categorias => {
      categorias.forEach(cat => {
        const boton = document.createElement("button");
        boton.textContent = cat.nombre;
        boton.className = "boton-categoria";
        boton.addEventListener("click", () => {
          const filtrados = productosCache.filter(
            p => String(p.id_categoria) === String(cat.id)
          );
          renderizarProductos(filtrados, favoritosCache);
        });
        fragment.appendChild(boton);
      });
      contenedorCategorias.appendChild(fragment);
    });
}

// ===============================
// Renderizar productos optimizado
// ===============================
function renderizarProductos(lista, favoritos) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = "";

  const fragment = document.createDocumentFragment();
  const tokenUsuario = localStorage.getItem("token_usuario");

  lista.forEach(prod => {
    if (!prod.activo) return;

    const div = document.createElement("div");
    div.classList.add("producto");

    const esFavorito = favoritos.includes(prod.id);
    const iconoCorazon = esFavorito ? "❤️" : "🤍";
    const colorCorazon = esFavorito ? "#ef5579" : "#999";

    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p class="categoria-nombre">${prod.categoria_nombre || "Sin categoría"}</p>
      <p>Precio: AR$ ${parseFloat(prod.precio).toFixed(2)}</p>
      <button class="btn-carrito" data-id="${prod.id}">Agregar al carrito</button>
      ${tokenUsuario ? `<button class="btn-favorito" data-id="${prod.id}" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: ${colorCorazon};">${iconoCorazon}</button>` : ""}
    `;

    // Redirección a detalle de producto
    div.addEventListener("click", (e) => {
      if (!e.target.classList.contains("btn-carrito") && !e.target.classList.contains("btn-favorito")) {
        window.location.href = `producto.html?id=${prod.id}`;
      }
    });

    fragment.appendChild(div);
  });

  contenedorProductos.appendChild(fragment);

  // Eventos favoritos y carrito
  if (tokenUsuario) configurarBotonesFavoritos(favoritos);
  configurarBotonesCarrito();
}

// ===============================
// Filtrar categorías usando cache
// ===============================
function filtrarPorCategoria(idCategoria) {
  const filtrados = productosCache.filter(p => String(p.id_categoria) === String(idCategoria));
  renderizarProductos(filtrados, favoritosCache);
}

// ===============================
// Buscador en tiempo real
// ===============================
function configurarBuscador() {
  if (!searchInput) return;

  searchInput.addEventListener("input", e => {
    const texto = e.target.value.toLowerCase();
    const filtrados = productosCache.filter(p =>
      p.nombre.toLowerCase().includes(texto)
    );
    renderizarProductos(filtrados, favoritosCache);
  });
}

// ===============================
// Favoritos
// ===============================
function configurarBotonesFavoritos(favoritos) {
  const botonesFavorito = document.querySelectorAll(".btn-favorito");
  botonesFavorito.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const idProducto = parseInt(btn.dataset.id);
      const esFavorito = favoritos.includes(idProducto);

      try {
        const metodo = esFavorito ? "DELETE" : "POST";
        const url = `${API_URL}/favoritos/${idProducto}`;
        const res = await fetch(url, {
          method: metodo,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token_usuario")}`
          }
        });

        if (res.ok) {
          if (esFavorito) {
            favoritosCache = favoritosCache.filter(id => id !== idProducto);
            btn.textContent = "🤍";
            btn.style.color = "#999";
          } else {
            favoritosCache.push(idProducto);
            btn.textContent = "❤️";
            btn.style.color = "#ef5579";
          }
        }
      } catch (error) {
        console.error("Error al actualizar favoritos:", error);
      }
    });
  });
}

// ===============================
// Carrito
// ===============================
function configurarBotonesCarrito() {
  const botonesCarrito = document.querySelectorAll(".btn-carrito");
  botonesCarrito.forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const idProducto = btn.dataset.id;
      agregarAlCarrito(idProducto);
    });
  });
}

function agregarAlCarrito(idProducto) {
  const producto = productosCache.find(p => p.id == idProducto);
  const itemExistente = carrito.find(item => item.id == idProducto);

  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  if (contadorCarrito) contadorCarrito.textContent = `(${total})`;
  if (contadorCarritoFlotante) contadorCarritoFlotante.textContent = `(${total})`;
}

// ===============================
// Usuario y botón flotante (igual que tu versión estable)
// ===============================
function mostrarUsuario() {
  const nombreUsuario = localStorage.getItem("nombre_usuario");
  const botonLogin = document.getElementById("boton-login");
  const nombreUsuarioElemento = document.getElementById("nombre-usuario");
  const botonLogout = document.getElementById("boton-logout");

  if (nombreUsuario) {
    if (botonLogin) botonLogin.style.display = "none";
    if (nombreUsuarioElemento) nombreUsuarioElemento.textContent = nombreUsuario;
    if (botonLogout) botonLogout.style.display = "inline-block";
  } else {
    if (botonLogin) botonLogin.style.display = "inline-block";
    if (nombreUsuarioElemento) nombreUsuarioElemento.textContent = "";
    if (botonLogout) botonLogout.style.display = "none";
  }
}

function crearBotonCarritoFlotante() {
  const botonFlotante = document.createElement("button");
  botonFlotante.id = "boton-carrito-flotante";
  botonFlotante.innerHTML = `🛒 <span id="contador-carrito-flotante">(0)</span>`;
  botonFlotante.style.position = "fixed";
  botonFlotante.style.bottom = "20px";
  botonFlotante.style.right = "20px";
  botonFlotante.style.zIndex = "1000";
  botonFlotante.addEventListener("click", () => {
    window.location.href = "carrito.html";
  });
  document.body.appendChild(botonFlotante);
}

function configurarNewsletter() {
  const formularioNewsletter = document.querySelector("#newsletter form");
  if (!formularioNewsletter) return;

  formularioNewsletter.addEventListener("submit", async e => {
    e.preventDefault();

    const emailInput = formularioNewsletter.querySelector("input[type='email']");
    const email = emailInput.value.trim();

    if (!email) {
      alert("Por favor ingresa un correo válido.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/suscriptores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error("Error al suscribirse");

      // Mostrar mensaje sin mover la pantalla
      const mensaje = document.createElement("p");
      mensaje.textContent = "¡Gracias por suscribirte!";
      mensaje.style.color = "green";
      formularioNewsletter.appendChild(mensaje);

      setTimeout(() => mensaje.remove(), 3000);
      emailInput.value = "";

    } catch (error) {
      console.error("Error en newsletter:", error);
      alert("Hubo un problema al suscribirte.");
    }
  });
}
