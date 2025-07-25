import { mostrarUsuario, actualizarContadorCarrito, crearBotonCarritoFlotante } from "./navbar.js";

const infoProducto = document.getElementById("info-producto");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const token = localStorage.getItem("token_usuario");
const mensajeProducto = document.getElementById("mensaje-producto");

let esFavorito = false;
let variantesSeleccionadas = [];
let precioBase = 0;
let producto = null; // Guardamos el producto completo

// ==============================
// CARGAR PRODUCTO Y VARIANTES
// ==============================
async function cargarProducto() {
  try {
    const res = await fetch(`https://api.mielissimo.com.ar/api/productos/${id}`);
    if (!res.ok) {
      infoProducto.innerHTML = "<p>Producto no encontrado</p>";
      return;
    }

    producto = await res.json();
    precioBase = parseFloat(producto.precio);

    if (token) await verificarFavorito();

    renderProducto();
    renderVariantes(producto.variantes);
  } catch (err) {
    console.error("Error al cargar producto:", err);
  }
}

// ==============================
// RENDERIZAR PRODUCTO
// ==============================
function renderProducto() {
  infoProducto.innerHTML = `
    <div class="tarjeta-producto-detalle">
      <h1 class="nombre-producto">${producto.nombre}</h1>
      <div class="contenido-producto">
        <div class="producto-imagen">
          <img src="${producto.imagen}" alt="${producto.nombre}" class="img-estandarizada"/>
        </div>
        <div class="producto-info">
          <div id="seccion-variantes-dentro"></div>
          <p><strong>Precio:</strong> <span id="precio-dinamico">AR$ ${precioBase.toFixed(2)}</span></p>
          <p><strong>Categoría:</strong> ${producto.categoria_nombre || "Sin categoría"}</p>
          <div class="botones-producto">
            <button id="btn-agregar" class="btn">Agregar al carrito</button>
            ${token ? `<button id="btn-favorito" class="btn-favorito">${esFavorito ? "❤️" : "🤍"}</button>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn-agregar").addEventListener("click", () => agregarAlCarrito());
  if (token) {
    document.getElementById("btn-favorito").addEventListener("click", toggleFavorito);
  }
}

// ==============================
// RENDERIZAR VARIANTES
// ==============================
function renderVariantes(variantes) {
  if (!variantes || variantes.length === 0) return;

  const contenedor = document.getElementById("seccion-variantes-dentro");
  contenedor.innerHTML = "<h3>Variantes disponibles:</h3>";

  const tipos = {};
  variantes.forEach(v => {
    if (!tipos[v.tipo]) tipos[v.tipo] = [];
    tipos[v.tipo].push(v);
  });

  for (const tipo in tipos) {
    const grupo = document.createElement("div");
    grupo.className = "grupo-variantes";
    grupo.innerHTML = `<p><strong>${tipo}</strong></p>`;

    tipos[tipo].forEach(v => {
      const btn = document.createElement("button");
      btn.className = "btn-variante";
      btn.textContent = `${v.nombre} ${v.precio_extra ? `- $${parseFloat(v.precio_extra).toFixed(2)}` : ""}`;
      ["click", "pointerdown"].forEach(eventType => {
  btn.addEventListener(eventType, () => {
    const yaSeleccionada = variantesSeleccionadas.find(sel => sel.id === v.id);
    if (yaSeleccionada) {
      variantesSeleccionadas = variantesSeleccionadas.filter(sel => sel.id !== v.id);
      btn.classList.remove("activo");
    } else {
      variantesSeleccionadas = variantesSeleccionadas.filter(sel => sel.tipo !== v.tipo);
      variantesSeleccionadas.push({
        id: v.id,
        nombre: v.nombre,
        precio: parseFloat(v.precio_extra) || precioBase,
        tipo: v.tipo
      });
      grupo.querySelectorAll(".btn-variante").forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
    }
    actualizarPrecio();
  });
});

      grupo.appendChild(btn);
    });

    contenedor.appendChild(grupo);
  }
}

// ==============================
// FAVORITOS
// ==============================
async function verificarFavorito() {
  try {
    const res = await fetch("https://api.mielissimo.com.ar/api/favoritos", {
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
      await fetch(`https://api.mielissimo.com.ar/api/favoritos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      esFavorito = false;
    } else {
      await fetch("https://api.mielissimo.com.ar/api/favoritos", {
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

// ==============================
// PRECIO DINÁMICO
// ==============================
function actualizarPrecio() {
  const precioMostrado = document.getElementById("precio-dinamico");
  const varianteTamanio = variantesSeleccionadas.find(v => v.tipo === "Tamaño");
  if (varianteTamanio && !isNaN(varianteTamanio.precio)) {
    precioMostrado.textContent = `$${parseFloat(varianteTamanio.precio).toFixed(2)}`;
  } else {
    precioMostrado.textContent = `$${precioBase.toFixed(2)}`;
  }
}

// ==============================
// CARRITO
// ==============================
function agregarAlCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const igual = p =>
    p.id === producto.id &&
    JSON.stringify(p.variantes) === JSON.stringify(variantesSeleccionadas);

  const existente = carrito.find(igual);
  const varianteTamanio = variantesSeleccionadas.find(v => v.tipo === "Tamaño");
  const precioFinal = varianteTamanio?.precio ?? precioBase;

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: precioFinal,
      imagen: producto.imagen,
      cantidad: 1,
      variantes: variantesSeleccionadas
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();

  mensajeProducto.textContent = "✅ Producto agregado al carrito.";
  mensajeProducto.style.color = "green";
  mensajeProducto.style.display = "block";

  setTimeout(() => {
    mensajeProducto.textContent = "";
  }, 2000);
}

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuario();
  actualizarContadorCarrito();
  crearBotonCarritoFlotante();
  cargarProducto();
});
