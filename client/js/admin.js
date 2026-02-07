
// VERIFICACIÓN DE TOKEN
const tokenAdmin = localStorage.getItem("tokenAdmin");
if (!tokenAdmin) {
  window.location.href = "login-admin.html";
}

// === DOM ELEMENTS ===
// Sections
const sections = document.querySelectorAll('.dashboard-section');
const navBtns = document.querySelectorAll('.nav-btn');

// Forms & Inputs
const formProducto = document.getElementById("formulario-producto");
const formCategoria = document.getElementById("formulario-categoria");
const formBanner = document.getElementById("formulario-banner");
const buscadorProductos = document.getElementById("buscador-productos");
const categoriasContainer = document.getElementById("categorias-container");

// Lists
const listaProductos = document.getElementById("lista-productos");
const listaCategorias = document.getElementById("lista-categorias");
const listaBanners = document.getElementById("lista-banners");

// State
let productoEnEdicion = null;
let productosCache = [];
let categoriasCache = [];

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  cargarCategorias(); // First load categories so checkboxes are ready
  cargarProductos();
  cargarProductos();
  cargarProductosCarrusel(); // NEW: Load Carousel Toggle List
  cargarEstadoLocal();
  cargarEstadoLocal();

  // Sidebar Navigation
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      // Add active to current
      btn.classList.add('active');
      const sectionId = btn.getAttribute('data-section');
      document.getElementById(sectionId).classList.add('active');
    });
  });

  // Event Listeners
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("tokenAdmin");
    window.location.href = "login-admin.html";
  });

  buscadorProductos.addEventListener("input", (e) => {
    filtrarProductos(e.target.value);
  });

  // Forms
  formProducto.addEventListener("submit", guardarProducto);
  formCategoria.addEventListener("submit", agregarCategoria);
  formProducto.addEventListener("submit", guardarProducto);
  formCategoria.addEventListener("submit", agregarCategoria);
  // formBanner removed

  // Cancel Edit
  document.getElementById("cancelar-edicion-producto").addEventListener("click", resetFormProducto);

  // Variants
  const formVariante = document.getElementById("formulario-variante");
  if (formVariante) {
    formVariante.addEventListener("submit", agregarVariante);
    document.getElementById("btnCancelarEdicionVariante").addEventListener("click", () => {
      formVariante.reset();
      productoEnEdicionVariante = null;
    });
  }

  // Store Status
  document.getElementById("btn-toggle-estado").addEventListener("click", toggleEstadoLocal);
});


// === PRODUCT MANAGEMENT ===

async function cargarProductos() {
  try {
    // Authenticated fetch just in case, though usually public, but admin view might need it if logic changes
    const res = await fetch("/api/productos?mostrarInactivos=true", {
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    productosCache = await res.json();
    renderProductos(productosCache);
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

function renderProductos(productos) {
  listaProductos.innerHTML = "";
  productos.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto-admin";
    // Soft delete visualization
    div.style.opacity = prod.activo ? 1 : 0.6;
    if (!prod.activo) div.style.backgroundColor = "#fff0f5"; // Slight pink tint for inactive

    div.innerHTML = `
            <img src="${prod.imagen || 'assets/placeholder.png'}" />
            <div>
                <strong>${prod.nombre}</strong>
                <em>$${prod.precio}</em>
                ${prod.es_oferta ? '<span style="color:var(--color-primario); font-weight:bold;">¡OFERTA!</span>' : ''}
                ${!prod.activo ? '<span style="color:red; font-size:0.8rem; display:block;">(Paustado)</span>' : ''}
            </div>
            <div class="producto-actions">
                <button class="btn-var" onclick="editarVariantes(${prod.id}, '${prod.nombre}')"><i class="fa-solid fa-list"></i></button>
                <button class="btn-edit" onclick="editarProducto(${prod.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-del" onclick="eliminarProducto(${prod.id}, ${prod.activo})">
                    <i class="fa-solid ${prod.activo ? 'fa-trash' : 'fa-trash-arrow-up'}"></i>
                </button>
            </div>
            ${!prod.activo ? `<button class="btn-reactivar" style="width:100%; margin-top:5px; background:#4CAF50; color:white; border:none; padding:5px; cursor:pointer;" onclick="activarProducto(${prod.id})">Reactivar</button>` : ''}
        `;
    listaProductos.appendChild(div);
  });
}

function filtrarProductos(busqueda) {
  const filtrados = productosCache.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  renderProductos(filtrados);
}

async function guardarProducto(e) {
  e.preventDefault();
  const formData = new FormData(formProducto);

  // Get Categories Checkboxes
  const checkboxes = document.querySelectorAll('input[name="categorias"]:checked');
  const selectedCats = Array.from(checkboxes).map(cb => Number(cb.value));
  formData.append("categorias", JSON.stringify(selectedCats));

  // Checkbox es_oferta
  // Checkboxes
  const esOferta = formProducto.querySelector('input[name="es_oferta"]').checked;
  const esNuevo = formProducto.querySelector('input[name="es_nuevo"]').checked;
  const enCarrusel = formProducto.querySelector('input[name="en_carrusel"]').checked;

  formData.set("es_oferta", esOferta);
  formData.set("es_nuevo", esNuevo);
  formData.set("en_carrusel", enCarrusel);

  // If ID exists, it's Update
  const id = document.getElementById("producto-id").value;
  const url = id ? `/api/productos/${id}` : "/api/productos";
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Authorization": `Bearer ${tokenAdmin}` }, // FormData does NOT need Content-Type header (browser sets it)
      body: formData
    });

    if (res.ok) {
      Swal.fire({ icon: 'success', title: 'Guardado', text: 'Producto guardado correctamente' });
      resetFormProducto();
      cargarProductos();
    } else {
      const err = await res.json();
      Swal.fire({ icon: 'error', title: 'Error', text: err.error });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión' });
  }
}

function editarProducto(id) {
  const prod = productosCache.find(p => p.id === id);
  if (!prod) return;

  productoEnEdicion = prod;

  document.getElementById("producto-id").value = prod.id;
  document.getElementById("prod-nombre").value = prod.nombre;
  document.getElementById("prod-precio").value = prod.precio;
  document.querySelector('input[name="precio_oferta"]').value = prod.precio_oferta || '';
  document.querySelector('input[name="precio_oferta"]').value = prod.precio_oferta || '';
  document.querySelector('input[name="es_oferta"]').checked = prod.es_oferta === 1 || prod.es_oferta === true;
  document.querySelector('input[name="es_nuevo"]').checked = prod.es_nuevo === 1 || prod.es_nuevo === true;
  document.querySelector('input[name="en_carrusel"]').checked = prod.en_carrusel === 1 || prod.en_carrusel === true;

  const preview = document.getElementById("preview-imagen");
  preview.src = prod.imagen;
  preview.style.display = "block";

  // Uncheck all first
  document.querySelectorAll('input[name="categorias"]').forEach(cb => cb.checked = false);

  // Check associated
  if (prod.categorias) {
    prod.categorias.forEach(c => {
      const cb = document.querySelector(`input[name="categorias"][value="${c.id}"]`);
      if (cb) cb.checked = true;
    });
  }

  document.getElementById("btn-guardar-producto").textContent = "Actualizar Producto";
  document.getElementById("cancelar-edicion-producto").style.display = "inline-block";

  // Scroll to top FORCE
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Also try scrolling the content area if it has its own scrollbar
  const contentArea = document.querySelector('.content-area');
  if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFormProducto() {
  formProducto.reset();
  document.getElementById("producto-id").value = "";
  document.getElementById("btn-guardar-producto").textContent = "Guardar Producto";
  document.getElementById("cancelar-edicion-producto").style.display = "none";
  document.getElementById("preview-imagen").style.display = "none";
  productoEnEdicion = null;

  // Hide variants section
  const sectionVariantes = document.getElementById("seccionVariantes");
  if (sectionVariantes) sectionVariantes.style.display = "none";
}

// SOFT DELETE
async function eliminarProducto(id, activoActual) {
  // If active, we deactivate (Soft Delete)
  // If inactive, we could offer Hard Delete or nothing. User prefers Soft Delete.
  // Let's implement toggle logic: Delete = Desactivar.

  if (!activoActual) {
    // Already inactive, ask if want to delete permanently or just leave it
    // For now, let's assume "Eliminar" on inactive means Hard Delete or just warn.
    // But user said "Delete vs Deactivate: The user prefers 'Soft Delete'".
    // So the main button should do Soft Delete.
    // If it's already inactive, maybe we hard delete?
    // Let's stick to Desactivar for the main flow as requested.
    const confirm = await Swal.fire({
      title: '¿Eliminar permanentemente?',
      text: "Este producto ya está desactivado. ¿Deseas eliminarlo por completo de la base de datos?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar permanentemente'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`/api/productos/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${tokenAdmin}` }
        });
        if (res.ok) {
          Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
          cargarProductos();
        } else {
          Swal.fire('Error', 'No se pudo eliminar', 'error');
        }
      } catch (e) { console.error(e); }
    }
    return;
  }

  const confirm = await Swal.fire({
    title: '¿Desactivar producto?',
    text: "El producto dejará de ser visible en la tienda, pero no se borrará.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef5579',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, ocultar'
  });

  if (confirm.isConfirmed) {
    try {
      const res = await fetch(`/api/productos/desactivar/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${tokenAdmin}` }
      });
      if (res.ok) {
        Swal.fire('Desactivado!', 'El producto ha sido ocultado.', 'success');
        cargarProductos();
      } else {
        Swal.fire('Error', 'No se pudo desactivar', 'error');
      }
    } catch (e) { console.error(e); }
  }
}

async function activarProducto(id) {
  try {
    const res = await fetch(`/api/productos/activar/${id}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    if (res.ok) {
      cargarProductos();
      Swal.fire({ icon: 'success', title: 'Reactivado', timer: 1500, showConfirmButton: false });
    }
  } catch (e) { console.error(e); }
}

// === CATEGORIES MANAGEMENT ===

async function cargarCategorias() {
  try {
    const res = await fetch("/api/categorias", {
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    categoriasCache = await res.json();

    renderCategoriasList(categoriasCache);
    renderCategoriasCheckboxes(categoriasCache);
  } catch (e) { console.error(e); }
}

function renderCategoriasList(categorias) {
  listaCategorias.innerHTML = "";
  categorias.forEach(cat => {
    const div = document.createElement("div");
    div.className = "categoria-item";
    div.innerHTML = `
            <span>${cat.nombre}</span>
            <div class="botones">
                <button class="btn-var" onclick="editarCategoria(${cat.id}, '${cat.nombre}')"><i class="fa-solid fa-pen"></i></button>
                <button class="eliminar" onclick="eliminarCategoria(${cat.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    listaCategorias.appendChild(div);
  });
}

function renderCategoriasCheckboxes(categorias) {
  categoriasContainer.innerHTML = "";
  categorias.forEach(cat => {
    const label = document.createElement("label");
    label.innerHTML = `
            <input type="checkbox" name="categorias" value="${cat.id}">
            ${cat.nombre}
        `;
    categoriasContainer.appendChild(label);
  });
}

async function agregarCategoria(e) {
  e.preventDefault();
  const nombre = formCategoria.querySelector('input[name="nombre"]').value;

  try {
    const res = await fetch("/api/categorias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ nombre })
    });

    if (res.ok) {
      formCategoria.reset();
      cargarCategorias(); // Refresh both list and checkboxes
      Swal.fire({ icon: 'success', title: 'Categoría Agregada', timer: 1500, showConfirmButton: false });
    }
  } catch (e) { console.error(e); }
}

async function editarCategoria(id, nombreActual) {
  const { value: nuevoNombre } = await Swal.fire({
    title: 'Editar Categoría',
    input: 'text',
    inputValue: nombreActual,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    confirmButtonColor: '#ef5579'
  });

  if (nuevoNombre && nuevoNombre !== nombreActual) {
    try {
      const res = await fetch(`/api/categorias/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenAdmin}`
        },
        body: JSON.stringify({ nombre: nuevoNombre })
      });

      if (res.ok) {
        Swal.fire('Actualizado', 'Categoría renombrada', 'success');
        cargarCategorias();
      } else {
        Swal.fire('Error', 'No se pudo actualizar', 'error');
      }
    } catch (e) { console.error(e); }
  }
}

async function eliminarCategoria(id) {
  const confirm = await Swal.fire({
    title: '¿Eliminar categoría?',
    text: "No podrás eliminarla si tiene productos activos.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef5579',
    confirmButtonText: 'Sí, eliminar'
  });

  if (confirm.isConfirmed) {
    const res = await fetch(`/api/categorias/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    const data = await res.json();
    if (res.ok) {
      cargarCategorias();
      Swal.fire('Eliminada', 'Categoría eliminada', 'success');
    } else {
      Swal.fire('Error', data.error, 'error');
    }
  }
}

// === BANNERS MANAGEMENT ===

// === CARRUSEL (PRODUCT TOGGLE) ===

async function cargarProductosCarrusel() {
  const container = document.getElementById("lista-carrusel-toggle");
  if (!container) return;

  container.innerHTML = "<p>Cargando...</p>";

  try {
    const res = await fetch("/api/productos?mostrarInactivos=true", {
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    const productos = await res.json();

    container.innerHTML = "";

    if (productos.length === 0) {
      container.innerHTML = "<p>No hay productos.</p>";
      return;
    }

    productos.forEach(p => {
      const card = document.createElement("div");
      card.className = "producto-card";
      card.style.display = "flex";
      card.style.alignItems = "center";
      card.style.gap = "10px";
      card.style.padding = "10px";
      card.style.borderBottom = "1px solid #eee";

      const isChecked = p.en_carrusel === 1 || p.en_carrusel === true;

      card.innerHTML = `
        <img src="${p.imagen || 'assets/placeholder.png'}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
        <div style="flex:1;">
          <strong style="font-size: 0.9rem;">${p.nombre}</strong>
        </div>
        <label class="switch" style="position: relative; display: inline-block; width: 40px; height: 24px;">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCarrusel(${p.id}, this.checked)" style="opacity: 0; width: 0; height: 0;">
          <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px;"></span>
        </label>
        <style>
          .switch input:checked + .slider { background-color: #ef5579; }
          .slider:before { position: absolute; content: ''; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
          .switch input:checked + .slider:before { transform: translateX(16px); }
        </style>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Error al cargar productos.</p>";
  }
}

window.toggleCarrusel = async (id, checked) => {
  try {
    const res = await fetch(`/api/productos/toggle-carrusel/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ en_carrusel: checked })
    });

    if (!res.ok) throw new Error("Error updating");

    // Toast notification
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

    Toast.fire({
      icon: 'success',
      title: checked ? 'Añadido al Carrusel' : 'Removido del Carrusel'
    });

  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudo actualizar el estado", "error");
    cargarProductosCarrusel(); // Revert
  }
};


// === VARIANTS MANAGEMENT ===

let productoParaVariantes = null;

function editarVariantes(id, nombre) {
  productoParaVariantes = id;
  const nombreLabel = document.getElementById("nombre-producto-variante");
  if (nombreLabel) nombreLabel.textContent = nombre;

  const seccionVar = document.getElementById("seccionVariantes");
  if (seccionVar) seccionVar.style.display = "block";

  // Reset Input Form
  const formVar = document.getElementById("formulario-variante");
  if (formVar) formVar.reset();

  cargarVariantes(id);

  if (seccionVar) seccionVar.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function cargarVariantes(productoId) {
  try {
    const res = await fetch(`/api/variantes/${productoId}`, {
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    const variantes = await res.json();

    const tbody = document.querySelector("#tabla-variantes tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    variantes.forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${v.tipo}</td>
                <td>${v.nombre}</td>
                <td>$${v.precio_extra || 0}</td>
                <td>
                    <button class="btn-del" onclick="eliminarVariante(${v.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } catch (e) { console.error(e); }
}

async function agregarVariante(e) {
  e.preventDefault();
  if (!productoParaVariantes) return;

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  data.id_producto = productoParaVariantes;

  const res = await fetch("/api/variantes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    e.target.reset();
    cargarVariantes(productoParaVariantes);
  }
}

async function eliminarVariante(id) {
  if (confirm("¿Eliminar variante?")) {
    await fetch(`/api/variantes/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    cargarVariantes(productoParaVariantes);
  }
}


// === STORE STATUS ===

// === STORE STATUS ===

async function cargarEstadoLocal() {
  try {
    const res = await fetch("/api/configuracion", {
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    const config = await res.json();
    const estado = config.estado_local || "ABIERTO"; // Default

    const texto = document.getElementById("estado-local-texto");
    if (texto) {
      texto.textContent = estado;
      texto.style.color = estado === "ABIERTO" ? "green" : "red";
    }
  } catch (e) { console.error(e); }
}

async function toggleEstadoLocal() {
  const texto = document.getElementById("estado-local-texto");
  const estadoActual = texto.textContent;
  const nuevoEstado = estadoActual === "ABIERTO" ? "CERRADO" : "ABIERTO";

  // 1. Optimistic UI Update
  texto.textContent = nuevoEstado;
  texto.style.color = nuevoEstado === "ABIERTO" ? "green" : "red";

  try {
    // 2. Network Request
    const res = await fetch("/api/configuracion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ clave: "estado_local", valor: nuevoEstado })
    });

    if (!res.ok) throw new Error("Failed to update");

    Swal.fire({
      icon: 'info',
      title: `Local ${nuevoEstado}`,
      timer: 1000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });

  } catch (e) {
    // Revert on error
    console.error(e);
    texto.textContent = estadoActual;
    texto.style.color = estadoActual === "ABIERTO" ? "green" : "red";
    Swal.fire({ icon: 'error', title: 'Error al actualizar estado' });
  }
}
