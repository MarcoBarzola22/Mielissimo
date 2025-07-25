const API_URL = "https://api.mielissimo.com.ar/api";

const contenedorCategorias = document.getElementById("categorias-horizontal");
const contenedorProductos = document.getElementById("productos");
const contadorCarrito = document.getElementById("contador-carrito");
const contadorCarritoFlotante = document.getElementById("contador-carrito-flotante");
const searchInput = document.getElementById("buscador");

let productosCache = [];
let favoritosCache = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [productos, favoritos] = await Promise.all([
      fetch(`${API_URL}/productos`).then(r => r.json()),
      obtenerFavoritos()
    ]);

    productosCache = productos;
    favoritosCache = favoritos.map(f => f.producto_id); // solo IDs

    renderizarCategorias(); // ahora después de cargar productos
    renderizarProductos(productosCache, favoritosCache);

    configurarBuscador();
    configurarNewsletter();
    mostrarUsuario();
    actualizarContadorCarrito();
    crearBotonCarritoFlotante();
  } catch (error) {
    console.error("Error inicial:", error);
  }
});

// =======================================
// FAVORITOS
// =======================================
async function obtenerFavoritos() {
  const token = localStorage.getItem("token_usuario");
  if (!token) return [];
  try {
    const res = await fetch(`${API_URL}/favoritos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function configurarBotonesFavoritos() {
  const botones = document.querySelectorAll(".btn-favorito");
  botones.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const idProducto = parseInt(btn.dataset.id);
      const esFavorito = favoritosCache.includes(idProducto);
      const token = localStorage.getItem("token_usuario");
      if (!token) return;

      try {
        if (esFavorito) {
          // Eliminar
          const res = await fetch(`${API_URL}/favoritos/${idProducto}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            favoritosCache = favoritosCache.filter(id => id !== idProducto);
            btn.textContent = "🤍";
            btn.style.color = "#999";
          }
        } else {
          // Agregar
          const res = await fetch(`${API_URL}/favoritos`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ producto_id: idProducto })
          });
          if (res.ok) {
            favoritosCache.push(idProducto);
            btn.textContent = "❤️";
            btn.style.color = "#ef5579";
          }
        }
      } catch (err) {
        console.error("Error al actualizar favorito:", err);
      }
    });
  });
}

// =======================================
// CATEGORÍAS
// =======================================
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

  fetch(`${API_URL}/categorias`)
    .then(r => r.json())
    .then(categorias => {
      categorias.forEach(cat => {
        const boton = document.createElement("button");
        boton.textContent = cat.nombre;
        boton.className = "boton-categoria";
        boton.addEventListener("click", () => {
          const filtrados = productosCache.filter(
            p => String(p.categoria_id) === String(cat.id)
          );
          renderizarProductos(filtrados, favoritosCache);
        });
        fragment.appendChild(boton);
      });
      contenedorCategorias.appendChild(fragment);
    });
}

// =======================================
// RENDERIZAR PRODUCTOS
// =======================================
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
    const icono = esFavorito ? "❤️" : "🤍";
    const color = esFavorito ? "#ef5579" : "#999";

    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p class="categoria-nombre">${prod.categoria_nombre || "Sin categoría"}</p>
      <p>Precio: AR$ ${parseFloat(prod.precio).toFixed(2)}</p>
      <button class="btn-carrito" data-id="${prod.id}">Agregar al carrito</button>
      ${tokenUsuario ? `<button class="btn-favorito" data-id="${prod.id}" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:${color};">${icono}</button>` : ""}
    `;

    div.addEventListener("click", (e) => {
      if (!e.target.classList.contains("btn-carrito") && !e.target.classList.contains("btn-favorito")) {
        window.location.href = `producto.html?id=${prod.id}`;
      }
    });

    fragment.appendChild(div);
  });

  contenedorProductos.appendChild(fragment);

  if (tokenUsuario) configurarBotonesFavoritos();
  configurarBotonesCarrito();
}

// =======================================
// BUSCADOR
// =======================================
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

// =======================================
// NEWSLETTER (sin alert y sin scroll)
// =======================================
function configurarNewsletter() {
  const form = document.querySelector("#newsletter form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const emailInput = form.querySelector("input[type='email']");
    const email = emailInput.value.trim();
    if (!email) return;

    try {
      const res = await fetch(`${API_URL}/suscriptores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        const msg = document.createElement("p");
        msg.textContent = "¡Gracias por suscribirte!";
        msg.style.color = "green";
        form.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
        emailInput.value = "";
      }
    } catch (err) {
      console.error("Error newsletter:", err);
    }
  });
}

// =======================================
// CARRITO
// =======================================
function configurarBotonesCarrito() {
  const botones = document.querySelectorAll(".btn-carrito");
  botones.forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      agregarAlCarrito(btn.dataset.id);
    });
  });
}

function agregarAlCarrito(idProducto) {
  const producto = productosCache.find(p => p.id == idProducto);
  const item = carrito.find(item => item.id == idProducto);

  if (item) {
    item.cantidad += 1;
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

// =======================================
// USUARIO Y BOTÓN CARRITO FLOTANTE
// =======================================
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
