// admin.js COMPLETO con mejoras solicitadas

const formulario = document.getElementById("formulario-producto");
const mensaje = document.getElementById("mensaje");
const productosContainer = document.getElementById("lista-productos");
const selectCategoria = document.getElementById("categoria-producto");
const formularioCategoria = document.getElementById("formulario-categoria");
const listaCategorias = document.getElementById("lista-categorias");
const botonLogout = document.getElementById("logout");
const buscador = document.getElementById("buscador-productos");
const checkboxInactivos = document.getElementById("mostrarInactivos");

const seccionFormulario = document.getElementById("seccion-formulario");
const seccionVariantes = document.getElementById("seccion-variantes");
const tablaVariantes = document.getElementById("tabla-variantes");
const formularioVariante = document.getElementById("formulario-variante");
const mensajeVariante = document.getElementById("mensaje-variante");

const btnAgregarVariante = document.getElementById("btnAgregarVariante");
const btnCancelarVariante = document.getElementById("btnCancelarEdicionVariante");
const btnCancelarProducto = document.getElementById("cancelar-edicion-producto");
const btnCancelarCategoria = document.getElementById("cancelar-edicion-categoria");


let varianteEditandoId = null;
let productoEnEdicion = null;
let categoriaEnEdicion = null;
let productoParaVariantes = null;

const token = localStorage.getItem("tokenAdmin");

function cargarProductos(filtro = "") {
  const mostrarInactivos = checkboxInactivos.checked;

  fetch(`/api/productos?mostrarInactivos=${mostrarInactivos}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(productos => {
      productosContainer.innerHTML = "";
      productos
        .filter(p => {
          const nombreCoincide = p.nombre.toLowerCase().includes(filtro.toLowerCase());
          return mostrarInactivos ? nombreCoincide : nombreCoincide && p.activo;
        })
        .forEach(prod => {
          const estaActivo = prod.activo === 1 || prod.activo === true;

          const div = document.createElement("div");
          div.classList.add("producto-admin");

          div.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}" />
            <p><strong>${prod.nombre}</strong></p>
            <p><em>Categoría: ${prod.categoria_nombre || "Sin categoría"}</em></p>
            <p>Precio: $${parseFloat(prod.precio).toFixed(2)}</p>
            <p>Stock: ${prod.stock}</p>
            <p><strong>Activo:</strong> ${estaActivo ? "Sí" : "No"}</p>
            <div class="btns" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
              ${estaActivo
                ? `
                  <button class="btn-editar" data-id="${prod.id}" 
                          data-nombre="${prod.nombre}"
                          data-precio="${prod.precio}"
                          data-imagen="${prod.imagen}"
                          data-stock="${prod.stock}"
                          data-categoria="${prod.categoria_id}">✏ Editar</button>
                  <button class="btn-eliminar" data-id="${prod.id}">🗑 Desactivar</button>
                  <button class="btn-variante" data-id="${prod.id}" data-nombre="${prod.nombre}">➕ Variantes</button>
                `
                : `<button class="btn-reactivar" data-id="${prod.id}">✅ Reactivar</button>`
              }
            </div>
          `;
          productosContainer.appendChild(div);
        });
    })
    .catch(err => {
      console.error("Error al cargar productos:", err);
      mensaje.textContent = "Error al cargar productos";
    });
}

function cargarCategorias() {
  fetch("/api/categorias")
    .then(res => res.json())
    .then(categorias => {
      selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
      listaCategorias.innerHTML = "";
      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        selectCategoria.appendChild(option);

        const div = document.createElement("div");
        div.classList.add("categoria-item");
        div.innerHTML = `
          <span>${cat.nombre}</span>
          <div class="botones">
            <button class="btn-editar-categoria" data-id="${cat.id}" data-nombre="${cat.nombre}">✏</button>
            <button class="btn-eliminar-categoria eliminar" data-id="${cat.id}">🗑</button>
          </div>
        `;
        listaCategorias.appendChild(div);
      });
    });
}

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = new FormData(formulario);
  const url = productoEnEdicion ? `/api/productos/${productoEnEdicion}` : "/api/productos";
  const metodo = productoEnEdicion ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { Authorization: `Bearer ${token}` },
      body: datos
    });

    const resultado = await res.json();
    if (res.ok) {
      mensaje.textContent = productoEnEdicion ? "Producto actualizado" : "Producto agregado";
      mensaje.style.color = "green";
      formulario.reset();
      productoEnEdicion = null;
      btnCancelarProducto.style.display = "none";
      setTimeout(() => cargarProductos(), 300);
    } else {
      mensaje.textContent = resultado.error || "Error en la operación";
      mensaje.style.color = "red";
    }
  } catch (err) {
    mensaje.textContent = "Error de conexión.";
    mensaje.style.color = "red";
  }
});

btnCancelarProducto.addEventListener("click", () => {
  formulario.reset();
  productoEnEdicion = null;
  mensaje.textContent = "";
  btnCancelarProducto.style.display = "none";
});

btnCancelarCategoria.addEventListener("click", () => {
  formularioCategoria.reset();
  categoriaEnEdicion = null;
  btnCancelarCategoria.style.display = "none";
});

btnCancelarVariante.addEventListener("click", () => {
  formularioVariante.reset();
  varianteEditandoId = null;
  btnAgregarVariante.textContent = "Agregar variante";
  btnCancelarVariante.style.display = "none";
  mensajeVariante.textContent = "";
});

function editarProducto(id, nombre, precio, imagen, stock, categoria_id) {
  formulario.nombre.value = nombre;
  formulario.precio.value = precio;
  formulario.stock.value = stock;
  selectCategoria.value = categoria_id;
  productoEnEdicion = id;

  mensaje.textContent = "Editando producto...";
  mensaje.style.color = "blue";
  btnCancelarProducto.style.display = "inline";
  seccionFormulario.scrollIntoView({ behavior: "smooth", block: "start" });
}

function desactivarProducto(id) {
  if (!confirm("¿Estás seguro de que querés desactivar este producto?")) return;

  fetch(`/api/productos/desactivar/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.mensaje);
      cargarProductos();
    });
}

function reactivarProducto(id) {
  if (!confirm("¿Reactivar este producto?")) return;

  fetch(`/api/productos/activar/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.mensaje);
      cargarProductos();
    });
}

formularioCategoria.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = formularioCategoria.nombre.value;

  const url = categoriaEnEdicion ? `/api/categorias/${categoriaEnEdicion}` : "/api/categorias";
  const metodo = categoriaEnEdicion ? "PUT" : "POST";

  const res = await fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ nombre })
  });
  const data = await res.json();
  if (res.ok) {
    formularioCategoria.reset();
    categoriaEnEdicion = null;
    btnCancelarCategoria.style.display = "none";
    cargarCategorias();
    cargarProductos();
  } else {
    alert(data.error || "Error al guardar categoría");
  }
});

function eliminarCategoria(id) {
  if (confirm("¿Eliminar esta categoría?")) {
    fetch(`/api/categorias/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert("✅ Categoría eliminada correctamente");
          cargarCategorias();
        }
      });
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const btn = e.target;
    editarProducto(
      btn.dataset.id,
      btn.dataset.nombre,
      btn.dataset.precio,
      btn.dataset.imagen,
      btn.dataset.stock,
      btn.dataset.categoria
    );
  }

  if (e.target.classList.contains("btn-eliminar")) desactivarProducto(e.target.dataset.id);
  if (e.target.classList.contains("btn-reactivar")) reactivarProducto(e.target.dataset.id);

  if (e.target.classList.contains("btn-editar-categoria")) {
    categoriaEnEdicion = e.target.dataset.id;
    formularioCategoria.nombre.value = e.target.dataset.nombre;
    btnCancelarCategoria.style.display = "inline";
  }

  if (e.target.classList.contains("btn-eliminar-categoria")) eliminarCategoria(e.target.dataset.id);

  if (e.target.classList.contains("btn-variante")) {
    const id = e.target.dataset.id;
    const nombre = e.target.dataset.nombre;
    productoParaVariantes = id;
    document.getElementById("nombre-producto-seleccionado").textContent = `Variantes de ${nombre}`;
    cargarVariantes(id);
    seccionVariantes.style.display = "block";
    seccionVariantes.scrollIntoView({ behavior: "smooth" });
  }

  if (e.target.classList.contains("eliminar-variante")) {
    const id = e.target.dataset.id;
    if (confirm("¿Eliminar variante?")) {
      fetch(`/api/variantes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => cargarVariantes(productoParaVariantes));
    }
  }

  if (e.target.classList.contains("editar-variante")) {
    const id = e.target.dataset.id;
    varianteEditandoId = id;
    document.getElementById("tipoVariante").value = e.target.dataset.tipo;
    document.getElementById("nombreVariante").value = e.target.dataset.nombre;
    document.getElementById("precioExtra").value = e.target.dataset.precio;
    document.getElementById("stockVariante").value = e.target.dataset.stock;
    btnAgregarVariante.textContent = "Guardar cambios";
    btnCancelarVariante.style.display = "inline";
  }
});

function cargarVariantes(idProducto) {
  tablaVariantes.innerHTML = `
    <tr>
      <th>Tipo</th>
      <th>Nombre de variante</th>
      <th>Precio adicional</th>
      <th>Stock</th>
      <th>Acciones</th>
    </tr>
  `;
  fetch(`/api/variantes/${idProducto}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(variantes => {
      variantes.forEach(v => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${v.tipo}</td>
          <td>${v.nombre}</td>
          <td>$${v.precio_extra}</td>
          <td>${v.stock}</td>
          <td>
            <button class="editar-variante" data-id="${v.id}" data-tipo="${v.tipo}" data-nombre="${v.nombre}" data-precio="${v.precio_extra}" data-stock="${v.stock}">✏</button>
            <button class="eliminar-variante" data-id="${v.id}">🗑</button>
          </td>
        `;
        tablaVariantes.appendChild(fila);
      });
    });
}

formularioVariante.addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = new FormData(formularioVariante);
  datos.append("id_producto", productoParaVariantes);

  const metodo = varianteEditandoId ? "PUT" : "POST";
  const url = varianteEditandoId ? `/api/variantes/${varianteEditandoId}` : "/api/variantes";

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { Authorization: `Bearer ${token}` },
      body: datos
    });
    const data = await res.json();
    if (res.ok) {
      mensajeVariante.textContent = varianteEditandoId ? "✅ Variante actualizada" : "✅ Variante agregada";
      mensajeVariante.style.color = "green";
      formularioVariante.reset();
      btnAgregarVariante.textContent = "Agregar variante";
      btnCancelarVariante.style.display = "none";
      varianteEditandoId = null;
      cargarVariantes(productoParaVariantes);
    } else {
      mensajeVariante.textContent = data.error || "Error";
      mensajeVariante.style.color = "red";
    }
  } catch (err) {
    mensajeVariante.textContent = "Error de conexión";
    mensajeVariante.style.color = "red";
  }
});

botonLogout.addEventListener("click", () => {
  localStorage.removeItem("tokenAdmin");
  window.location.href = "login-admin.html";
});

buscador.addEventListener("input", () => cargarProductos(buscador.value));
checkboxInactivos.addEventListener("change", () => cargarProductos());

cargarProductos();
cargarCategorias();
