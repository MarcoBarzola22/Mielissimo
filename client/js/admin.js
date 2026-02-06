
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
  cargarBanners();
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
  formBanner.addEventListener("submit", subirBanner);

  // Cancel Edit
  document.getElementById("cancelar-edicion-producto").addEventListener("click", resetFormProducto);

  // Variants
  document.getElementById("formulario-variante").addEventListener("submit", agregarVariante);
  document.getElementById("btnCancelarEdicionVariante").addEventListener("click", () => {
    document.getElementById("formulario-variante").reset();
    productoEnEdicionVariante = null;
  });

  // Store Status
  document.getElementById("btn-toggle-estado").addEventListener("click", toggleEstadoLocal);
});


// === PRODUCT MANAGEMENT ===

async function cargarProductos() {
  try {
    const res = await fetch("/api/productos?mostrarInactivos=true"); // Get all for admin
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
    div.style.opacity = prod.activo ? 1 : 0.6;

    div.innerHTML = `
            <img src="${prod.imagen || 'assets/placeholder.png'}" />
            <div>
                <strong>${prod.nombre}</strong>
                <em>$${prod.precio}</em>
                ${prod.es_oferta ? '<span style="color:var(--color-primario); font-weight:bold;">¡OFERTA!</span>' : ''}
            </div>
            <div class="producto-actions">
                <button class="btn-var" onclick="editarVariantes(${prod.id}, '${prod.nombre}')"><i class="fa-solid fa-list"></i></button>
                <button class="btn-edit" onclick="editarProducto(${prod.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-del" onclick="eliminarProducto(${prod.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
            ${!prod.activo ? `<button class="btn-reactivar" style="width:100%; margin-top:5px;" onclick="activarProducto(${prod.id})">Reactivar</button>` : ''}
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
  const esOferta = formProducto.querySelector('input[name="es_oferta"]').checked;
  formData.set("es_oferta", esOferta);

  // If ID exists, it's Update
  const id = document.getElementById("producto-id").value;
  const url = id ? `/api/productos/${id}` : "/api/productos";
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Authorization": `Bearer ${tokenAdmin}` },
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
  document.querySelector('input[name="es_oferta"]').checked = !!prod.es_oferta;

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

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFormProducto() {
  formProducto.reset();
  document.getElementById("producto-id").value = "";
  document.getElementById("btn-guardar-producto").textContent = "Guardar Producto";
  document.getElementById("cancelar-edicion-producto").style.display = "none";
  document.getElementById("preview-imagen").style.display = "none";
  productoEnEdicion = null;

  // Hide variants section
  document.getElementById("seccionVariantes").style.display = "none";
}

async function eliminarProducto(id) {
  const confirm = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Se eliminará el producto (o se desactivará).",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef5579',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar'
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
}

async function activarProducto(id) {
  try {
    await fetch(`/api/productos/activar/${id}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    cargarProductos();
    Swal.fire({ icon: 'success', title: 'Reactivado', timer: 1500, showConfirmButton: false });
  } catch (e) { console.error(e); }
}

// === CATEGORIES MANAGEMENT ===

async function cargarCategorias() {
  try {
    const res = await fetch("/api/categorias");
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
    // Assuming API supports PUT /api/categorias/:id or similar
    // If not, we might need to add it to backend. But for now, let's assume standard REST or we implement it.
    // Wait, the backend notes didn't explicitly mention PUT categories.
    // Safest bet: Attempt PUT. If 404, we'll know. 
    // Actually, let's implement the FE part.
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

async function cargarBanners() {
  try {
    const res = await fetch("/api/banners");
    const banners = await res.json();
    renderBanners(banners);
  } catch (e) { console.error(e); }
}

function renderBanners(banners) {
  listaBanners.innerHTML = "";
  if (banners.length === 0) {
    listaBanners.innerHTML = "<p>No hay banners cargados.</p>";
    return;
  }

  banners.forEach(b => {
    const div = document.createElement("div");
    div.className = "banner-item";
    div.innerHTML = `
            <img src="${b.imagen_url}" />
            <div class="banner-actions">
                <button class="btn-sm" style="background:red;" onclick="eliminarBanner(${b.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    listaBanners.appendChild(div);
  });
}

async function subirBanner(e) {
  e.preventDefault();
  const formData = new FormData(formBanner);

  try {
    const res = await fetch("/api/banners", {
      method: "POST",
      headers: { "Authorization": `Bearer ${tokenAdmin}` },
      body: formData
    });

    if (res.ok) {
      formBanner.reset();
      cargarBanners();
      Swal.fire({ icon: 'success', title: 'Banner Subido', timer: 1500 });
    }
  } catch (e) { console.error(e); }
}

async function eliminarBanner(id) {
  const confirm = await Swal.fire({
    title: '¿Eliminar Banner?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí'
  });

  if (confirm.isConfirmed) {
    await fetch(`/api/banners/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${tokenAdmin}` }
    });
    cargarBanners();
    Swal.fire('Eliminado', '', 'success');
  }
}


// === VARIANTS MANAGEMENT ===

let productoParaVariantes = null;

function editarVariantes(id, nombre) {
  productoParaVariantes = id;
  document.getElementById("nombre-producto-variante").textContent = nombre;
  document.getElementById("seccionVariantes").style.display = "block";

  cargarVariantes(id);

  // Switch to section if not already (should be usually)
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function cargarVariantes(productoId) {
  const res = await fetch(`/api/variantes/${productoId}`);
  const variantes = await res.json();

  const tbody = document.querySelector("#tabla-variantes tbody");
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
    await fetch(`/api/variantes/${id}`, { method: "DELETE" });
    cargarVariantes(productoParaVariantes);
  }
}


// === STORE STATUS ===

async function cargarEstadoLocal() {
  try {
    const res = await fetch("/api/configuracion");
    const config = await res.json();
    const estado = config.estado_local || "ABIERTO"; // Default

    const texto = document.getElementById("estado-local-texto");
    texto.textContent = estado;
    texto.style.color = estado === "ABIERTO" ? "green" : "red";
  } catch (e) { console.error(e); }
}

async function toggleEstadoLocal() {
  const texto = document.getElementById("estado-local-texto");
  const nuevoEstado = texto.textContent === "ABIERTO" ? "CERRADO" : "ABIERTO";

  await fetch("/api/configuracion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({ clave: "estado_local", valor: nuevoEstado })
  });

  cargarEstadoLocal();
  Swal.fire({
    icon: 'info',
    title: `Local ${nuevoEstado}`,
    timer: 1500,
    showConfirmButton: false
  });
}
