// === VERIFICACIÓN SEGURA DE TOKEN ===
let tokenAdmin = null;
try {
    tokenAdmin = localStorage.getItem("tokenAdmin");
} catch (e) {
    console.error("Error accediendo a localStorage:", e);
}

if (!tokenAdmin) {
    console.warn("No hay token, redirigiendo...");
    window.location.href = "login-admin.html";
}

// === INICIALIZACIÓN CUANDO EL DOM ESTÉ LISTO ===
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Iniciando Admin Panel...");

    // 1. NAVEGACIÓN (SIDEBAR)
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.dashboard-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar clase active de todos
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Activar el actual
            btn.classList.add('active');
            const sectionId = btn.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
            } else {
                console.error("Sección no encontrada:", sectionId);
            }
        });
    });

    // 2. ELEMENTOS GLOBALES (Con chequeo de existencia)
    const btnLogout = document.getElementById("logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            try { localStorage.removeItem("tokenAdmin"); } catch (e) { }
            window.location.href = "login-admin.html";
        });
    }

    // Toggle Estado Local
    const btnEstado = document.getElementById("btn-toggle-estado");
    if (btnEstado) btnEstado.addEventListener("click", toggleEstadoLocal);

    // 3. FORMULARIOS
    const formProducto = document.getElementById("formulario-producto");
    if (formProducto) formProducto.addEventListener("submit", guardarProducto);

    const buscador = document.getElementById("buscador-productos");
    if (buscador) buscador.addEventListener("input", filtrarProductos);

    const filtroCat = document.getElementById("filtro-categoria-productos");
    if (filtroCat) filtroCat.addEventListener("change", filtrarProductos);

    const btnCancelProd = document.getElementById("cancelar-edicion-producto");
    if (btnCancelProd) btnCancelProd.addEventListener("click", resetFormProducto);

    // Categorías
    const formCategoria = document.getElementById("formulario-categoria");
    if (formCategoria) formCategoria.addEventListener("submit", agregarCategoria);

    // Variantes
    const formVariante = document.getElementById("formulario-variante");
    if (formVariante) formVariante.addEventListener("submit", agregarVariante);

    const btnCancelVar = document.getElementById("btnCancelarEdicionVariante");
    if (btnCancelVar) btnCancelVar.addEventListener("click", () => {
        if (formVariante) formVariante.reset();
        const secVar = document.getElementById("seccionVariantes");
        if (secVar) secVar.style.display = "none";
    });

    // Pedidos
    const btnBuscarPedido = document.getElementById("btn-buscar-compra");
    if (btnBuscarPedido) btnBuscarPedido.addEventListener("click", buscarPedidoPorId);

    // 4. CARGA INICIAL DE DATOS
    cargarCategorias();
    cargarProductos();
    cargarProductosCarrusel();
    cargarEstadoLocal();
});


// =========================================================
// 1. GESTIÓN DE PRODUCTOS
// =========================================================
let productosCache = [];
let productoEnEdicion = null;

async function cargarProductos() {
    try {
        const res = await fetch("/api/productos?mostrarInactivos=true", {
            headers: { "Authorization": `Bearer ${tokenAdmin}` }
        });
        if (!res.ok) throw new Error("Error fetching productos");
        productosCache = await res.json();

        // Initial render limited to first 50 to avoid lag
        renderProductos(productosCache.slice(0, 50));
    } catch (e) { console.error("Error cargando productos:", e); }
}

function renderProductos(lista) {
    const container = document.getElementById("lista-productos");
    if (!container) return; // Si no existe el contenedor, salimos sin error
    container.innerHTML = "";

    lista.forEach(prod => {
        const div = document.createElement("div");
        div.className = "producto-admin";
        div.style = `display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; align-items: center; ${!prod.activo ? 'opacity:0.6; background:#fff0f5;' : ''}`;

        div.innerHTML = `
            <img src="${prod.imagen || 'assets/placeholder.png'}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
            <div style="flex:1;">
                <strong>${prod.nombre}</strong> - $${prod.precio}
                ${!prod.activo ? '<span style="color:red; font-size:0.8em;">(Pausado)</span>' : ''}
                <div style="font-size:0.8em; color:#666;">
                    ${prod.categorias && prod.categorias.length > 0 ? prod.categorias.map(c => c.nombre).join(', ') : 'Sin categoría'}
                </div>
            </div>
            <div style="display:flex; gap:5px;">
                <button class="btn-var" onclick="editarVariantes(${prod.id}, '${prod.nombre}')" title="Variantes"><i class="fa-solid fa-list"></i></button>
                <button class="btn-edit" onclick="editarProducto(${prod.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-del" onclick="eliminarProducto(${prod.id}, ${prod.activo})" title="Borrar/Pausar">
                    <i class="fa-solid ${prod.activo ? 'fa-trash' : 'fa-trash-arrow-up'}"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

function filtrarProductos() {
    const texto = document.getElementById("buscador-productos").value.toLowerCase();
    const catId = document.getElementById("filtro-categoria-productos").value;

    let filtrados = productosCache;

    if (texto) {
        filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(texto));
    }

    if (catId) {
        filtrados = filtrados.filter(p => {
            // Check against array of categories
            return p.categorias.some(c => c.id == catId);
        });
    }

    // Since user is searching, show all matches (or limit if too many, but usually search narrows it down)
    renderProductos(filtrados.slice(0, 100));
}

async function guardarProducto(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // Checkboxes manuales
    formData.set("es_oferta", form.querySelector('input[name="es_oferta"]').checked);
    formData.set("es_nuevo", form.querySelector('input[name="es_nuevo"]').checked);
    formData.set("en_carrusel", form.querySelector('input[name="en_carrusel"]').checked);

    // Categorías
    const catsChecked = Array.from(document.querySelectorAll('input[name="categorias"]:checked')).map(c => c.value);
    formData.append("categorias", JSON.stringify(catsChecked));

    const id = document.getElementById("producto-id").value;
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/productos/${id}` : "/api/productos";

    try {
        const res = await fetch(url, {
            method: method,
            headers: { "Authorization": `Bearer ${tokenAdmin}` },
            body: formData
        });
        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false });
            resetFormProducto();
            cargarProductos();
            cargarProductosCarrusel();
        } else {
            const err = await res.json();
            Swal.fire({ icon: 'error', title: 'Error', text: err.error || 'No se pudo guardar' });
        }
    } catch (e) { console.error(e); }
}

window.editarProducto = function (id) {
    const p = productosCache.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById("producto-id").value = p.id;
    document.getElementById("prod-nombre").value = p.nombre;
    document.getElementById("prod-precio").value = p.precio;

    // Inputs opcionales
    const inputOferta = document.querySelector('input[name="precio_oferta"]');
    if (inputOferta) inputOferta.value = p.precio_oferta || '';

    const checkOferta = document.querySelector('input[name="es_oferta"]');
    if (checkOferta) checkOferta.checked = !!p.es_oferta;

    const checkNuevo = document.querySelector('input[name="es_nuevo"]');
    if (checkNuevo) checkNuevo.checked = !!p.es_nuevo;

    const checkCarrusel = document.querySelector('input[name="en_carrusel"]');
    if (checkCarrusel) checkCarrusel.checked = !!p.en_carrusel;

    // Imagen preview
    const imgPreview = document.getElementById("preview-imagen");
    if (imgPreview) {
        imgPreview.src = p.imagen || '';
        imgPreview.style.display = p.imagen ? "block" : "none";
    }

    // Categorías - Robust check
    document.querySelectorAll('input[name="categorias"]').forEach(cb => cb.checked = false);
    if (p.categorias) {
        p.categorias.forEach(cat => {
            // Ensure ID comparison matches types
            const cb = document.querySelector(`input[name="categorias"][value="${cat.id}"]`);
            if (cb) cb.checked = true;
        });
    }

    const btnGuardar = document.getElementById("btn-guardar-producto");
    if (btnGuardar) btnGuardar.textContent = "Actualizar";

    const btnCancel = document.getElementById("cancelar-edicion-producto");
    if (btnCancel) btnCancel.style.display = "inline-block";

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function resetFormProducto() {
    const form = document.getElementById("formulario-producto");
    if (form) form.reset();

    document.getElementById("producto-id").value = "";

    const btnGuardar = document.getElementById("btn-guardar-producto");
    if (btnGuardar) btnGuardar.textContent = "Guardar";

    const btnCancel = document.getElementById("cancelar-edicion-producto");
    if (btnCancel) btnCancel.style.display = "none";

    const imgPreview = document.getElementById("preview-imagen");
    if (imgPreview) imgPreview.style.display = "none";
}

window.eliminarProducto = async function (id, activoActual) {
    if (!confirm(activoActual ? "¿Pausar producto?" : "¿Reactivar producto?")) return;
    const endpoint = activoActual ? 'desactivar' : 'activar';
    try {
        await fetch(`/api/productos/${endpoint}/${id}`, {
            method: "PUT", headers: { "Authorization": `Bearer ${tokenAdmin}` }
        });
        cargarProductos();
    } catch (e) { console.error(e); }
};

// =========================================================
// 2. GESTIÓN DEL CARRUSEL (ESTILOS FORZADOS)
// =========================================================
async function cargarProductosCarrusel() {
    const container = document.getElementById("lista-carrusel-toggle");
    if (!container) return;
    container.innerHTML = "Cargando...";

    try {
        const res = await fetch("/api/productos?mostrarInactivos=true", {
            headers: { "Authorization": `Bearer ${tokenAdmin}` }
        });
        let lista = await res.json();

        // ORDENAR: Activos primero
        lista.sort((a, b) => (b.en_carrusel - a.en_carrusel));

        container.innerHTML = "";
        lista.forEach(p => {
            const isChecked = !!p.en_carrusel;
            const div = document.createElement("div");

            // ESTILOS EN LINEA PARA QUE SE VEA BIEN SI O SI
            div.style = `
                display:flex; flex-direction:column; gap:10px; padding:15px; margin-bottom:10px; 
                border:1px solid #eee; background:${isChecked ? '#f0fdf4' : '#fff'};
                border-left: 5px solid ${isChecked ? '#4CAF50' : '#ccc'};
                border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            `;

            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${p.imagen || 'assets/placeholder.png'}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                        <strong style="color:${isChecked ? '#2e7d32' : '#333'}">${p.nombre}</strong>
                    </div>
                    
                    <label class="switch" style="position:relative; display:inline-block; width:46px; height:24px;">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCarrusel(${p.id}, this.checked)" style="opacity:0; width:0; height:0;">
                        <span class="slider" style="
                            position:absolute; inset:0; background-color:${isChecked ? '#4CAF50' : '#ccc'}; 
                            border-radius:24px; transition:.3s; cursor:pointer;
                        "></span>
                        <span class="knob" style="
                            position:absolute; content:''; height:18px; width:18px; left:3px; bottom:3px; 
                            background-color:white; transition:.3s; border-radius:50%;
                            transform: ${isChecked ? 'translateX(22px)' : 'translateX(0)'};
                        "></span>
                    </label>
                </div>

                <div style="display:flex; gap:5px; flex-wrap:wrap; align-items:center; margin-top:5px; padding-top:10px; border-top:1px solid #eee;">
                    <textarea id="desc-${p.id}" placeholder="Frase promocional..." style="flex:1; border:1px solid #ddd; padding:8px; height:38px; resize:none; border-radius:4px; font-size:13px;">${p.descripcion_carrusel || ''}</textarea>
                    
                    <select id="tag-${p.id}" style="border:1px solid #ddd; padding:0 8px; height:38px; border-radius:4px; font-size:13px;">
                        <option value="NINGUNO" ${p.carrusel_etiqueta === 'NINGUNO' ? 'selected' : ''}>Sin Etiqueta</option>
                        <option value="NUEVO" ${p.carrusel_etiqueta === 'NUEVO' ? 'selected' : ''}>NUEVO</option>
                        <option value="OFERTA" ${p.carrusel_etiqueta === 'OFERTA' ? 'selected' : ''}>OFERTA</option>
                        <option value="DESTACADO" ${p.carrusel_etiqueta === 'DESTACADO' ? 'selected' : ''}>DESTACADO</option>
                    </select>

                    <button onclick="guardarInfoCarrusel(${p.id})" style="background:#333; color:white; border:none; padding:0 15px; height:38px; border-radius:4px; cursor:pointer; display:flex; align-items:center; gap:5px;">
                        <i class="fa-solid fa-save"></i> Guardar
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (e) { console.error(e); }
}

window.toggleCarrusel = async function (id, val) {
    try {
        const res = await fetch(`/api/productos/toggle-carrusel/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenAdmin}` },
            body: JSON.stringify({ en_carrusel: val })
        });
        if (res.ok) {
            cargarProductosCarrusel(); // Recargar para reordenar y actualizar estilos
        }
    } catch (e) { Swal.fire("Error", "No se pudo cambiar estado", "error"); }
};

window.guardarInfoCarrusel = async function (id) {
    const desc = document.getElementById(`desc-${id}`).value;
    const tag = document.getElementById(`tag-${id}`).value;
    try {
        const res = await fetch(`/api/productos/${id}/carrusel`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenAdmin}` },
            body: JSON.stringify({ descripcion_carrusel: desc, carrusel_etiqueta: tag })
        });
        if (res.ok) {
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            Toast.fire({ icon: 'success', title: 'Información actualizada' });
        }
    } catch (e) { Swal.fire("Error", "No se pudo guardar", "error"); }
};

// =========================================================
// 3. GESTIÓN DE CATEGORÍAS
// =========================================================
async function cargarCategorias() {
    try {
        const res = await fetch("/api/categorias", { headers: { "Authorization": `Bearer ${tokenAdmin}` } });
        const cats = await res.json();

        // Renderizar lista para eliminar
        const listContainer = document.getElementById("lista-categorias");
        if (listContainer) {
            listContainer.innerHTML = cats.map(c => `
                <div class="categoria-item" style="display:flex; justify-content:space-between; padding:15px; border:1px solid #e0e0e0; border-radius: 8px; background: white; align-items:center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="font-weight: 500;">${c.nombre}</div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="editarCategoria(${c.id}, '${c.nombre}')" style="color:#007bff; border:none; background:none; cursor:pointer;" title="Editar">
                           <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="eliminarCategoria(${c.id})" style="color:#dc3545; border:none; background:none; cursor:pointer;" title="Borrar">
                           <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Renderizar filter dropdown
        const filtro = document.getElementById("filtro-categoria-productos");
        if (filtro) {
            const currentVal = filtro.value;
            filtro.innerHTML = '<option value="">Todas las categorías</option>' +
                cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
            filtro.value = currentVal;
        }

        // Renderizar checkboxes en formulario producto
        const checkContainer = document.getElementById("categorias-container");
        if (checkContainer) {
            checkContainer.innerHTML = cats.map(c => `
                <label style="display:inline-flex; gap:5px; align-items:center; margin-right:10px; cursor:pointer;">
                    <input type="checkbox" name="categorias" value="${c.id}"> ${c.nombre}
                </label>
            `).join('');
        }
    } catch (e) { console.error(e); }
}

async function agregarCategoria(e) {
    e.preventDefault();
    const input = e.target.querySelector('input[name="nombre"]');
    if (!input) return;
    const nombre = input.value;

    await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenAdmin}` },
        body: JSON.stringify({ nombre })
    });
    e.target.reset();
    cargarCategorias();
}

window.editarCategoria = async function (id, nombreActual) {
    const { value: nuevoNombre } = await Swal.fire({
        title: 'Editar Categoría',
        input: 'text',
        inputValue: nombreActual,
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) { return 'Debes escribir un nombre!' }
        }
    });

    if (nuevoNombre && nuevoNombre !== nombreActual) {
        try {
            const res = await fetch(`/api/categorias/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenAdmin}` },
                body: JSON.stringify({ nombre: nuevoNombre })
            });
            if (res.ok) {
                Swal.fire("Actualizado", "", "success");
                cargarCategorias();
                // Si el filtro estaba en esta categoria, podriamos necesitar resetearlo o no, pero mejor dejarlo
            } else {
                Swal.fire("Error", "No se pudo actualizar", "error");
            }
        } catch (e) { console.error(e); }
    }
}

window.eliminarCategoria = async function (id) {
    // Check product count in cache first to give instance feedback
    const productosEnCategoria = productosCache.filter(p => p.categorias && p.categorias.some(c => c.id == id));

    if (productosEnCategoria.length > 0) {
        const confirmResult = await Swal.fire({
            title: 'Categoría en uso',
            text: `Hay ${productosEnCategoria.length} productos usando esta categoría. Si la eliminas, esos productos quedarán sin ella. ¿Seguro?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmResult.isConfirmed) return;
    } else {
        if (!confirm("¿Eliminar categoría vacía?")) return;
    }

    try {
        const res = await fetch(`/api/categorias/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${tokenAdmin}` } });
        const data = await res.json();

        if (!res.ok) {
            Swal.fire("Error", data.error || "No se pudo eliminar", "error");
        } else {
            Swal.fire("Eliminado", "Categoría eliminada.", "success");
            cargarCategorias();
        }
    } catch (e) { console.error(e); }
};

// =========================================================
// 4. GESTIÓN DE VARIANTES
// =========================================================
let prodVarianteId = null;

window.editarVariantes = function (id, nombre) {
    prodVarianteId = id;
    const nombreEl = document.getElementById("nombre-producto-variante");
    if (nombreEl) nombreEl.textContent = nombre;

    const secVar = document.getElementById("seccionVariantes");
    if (secVar) {
        secVar.style.display = "block";
        secVar.scrollIntoView({ behavior: 'smooth' });
    }
    cargarVariantes(id);
};

async function cargarVariantes(id) {
    const res = await fetch(`/api/variantes/${id}`, { headers: { "Authorization": `Bearer ${tokenAdmin}` } });
    const variantes = await res.json();
    const tbody = document.querySelector("#tabla-variantes tbody");
    if (tbody) {
        tbody.innerHTML = variantes.map(v => `
            <tr>
                <td>${v.tipo}</td>
                <td>${v.nombre}</td>
                <td>$${v.precio_extra}</td>
                <td><button onclick="eliminarVariante(${v.id})" class="btn-del"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('');
    }
}

async function agregarVariante(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.id_producto = prodVarianteId;
    await fetch("/api/variantes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenAdmin}` },
        body: JSON.stringify(data)
    });
    e.target.reset();
    cargarVariantes(prodVarianteId);
}

window.eliminarVariante = async function (id) {
    if (!confirm("¿Borrar variante?")) return;
    await fetch(`/api/variantes/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${tokenAdmin}` } });
    cargarVariantes(prodVarianteId);
};

// =========================================================
// 5. ESTADO DEL LOCAL
// =========================================================
async function cargarEstadoLocal() {
    try {
        const res = await fetch("/api/configuracion");
        if (!res.ok) return;
        const config = await res.json();

        const texto = document.getElementById("estado-local-texto");
        // Manejar mayúsculas/minúsculas o falta de dato
        const estado = config.estado_local || config.ESTADO_LOCAL || "ABIERTO";

        if (texto) {
            texto.textContent = estado.toUpperCase();
            texto.style.color = estado.toUpperCase() === "ABIERTO" ? "green" : "red";
        }
    } catch (e) { console.error(e); }
}

async function toggleEstadoLocal() {
    const texto = document.getElementById("estado-local-texto");
    if (!texto) return;

    const nuevo = texto.textContent === "ABIERTO" ? "CERRADO" : "ABIERTO";
    await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenAdmin}` },
        body: JSON.stringify({ clave: "estado_local", valor: nuevo })
    });
    cargarEstadoLocal();
}

// =========================================================
// 6. PEDIDOS (HISTORIAL)
// =========================================================
async function buscarPedidoPorId() {
    const input = document.getElementById("buscar-compra-id");
    if (!input) return;
    const id = input.value;
    const contenedor = document.getElementById("resultado-busqueda");
    if (!contenedor) return;

    contenedor.innerHTML = "Buscando...";

    try {
        // Updated to use the new route that joins users
        const res = await fetch(`/api/pedidos/${id}`, { headers: { "Authorization": `Bearer ${tokenAdmin}` } });
        if (!res.ok) {
            contenedor.innerHTML = "<p style='color:red;'>Pedido no encontrado.</p>";
            return;
        }
        const pedido = await res.json();

        // Parsear detalles de manera segura
        let detalles = [];
        try { detalles = typeof pedido.detalles === 'string' ? JSON.parse(pedido.detalles) : pedido.detalles; } catch (e) { }

        // Fallback if details are empty but products array exists (from new endpoint structure)
        if ((!detalles || detalles.length === 0) && pedido.productos) {
            detalles = pedido.productos;
        }

        const usuarioInfo = pedido.usuario
            ? `<p><strong>Usuario:</strong> ${pedido.usuario.nombre} (${pedido.usuario.email})</p>`
            : '<p><strong>Usuario:</strong> Invitado / No registrado</p>';

        contenedor.innerHTML = `
            <div style="background:#f9f9f9; padding:15px; border:1px solid #ddd; margin-top:10px; border-radius:8px;">
                <h4 style="margin-top:0;">Pedido #${pedido.pedido_id || pedido.id}</h4>
                <p><strong>Total:</strong> $${pedido.total}</p>
                <p><strong>Fecha:</strong> ${new Date(pedido.fecha_compra).toLocaleString()}</p>
                <p><strong>Pago/Envio:</strong> ${pedido.tipo_envio} - ${pedido.zona || 'N/A'}</p>
                ${usuarioInfo}
                <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
                <h5>Items:</h5>
                <ul style="padding-left:20px;">
                    ${detalles.map(d => `
                        <li>
                            ${d.cantidad}x ${d.nombre} ($${d.precio || d.precio_unitario})
                            ${d.variantes && d.variantes !== "Sin variantes" ? `<br><small style="color:gray;">${d.variantes}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    } catch (e) {
        console.error(e);
        contenedor.innerHTML = "<p>Error al buscar.</p>";
    }
}