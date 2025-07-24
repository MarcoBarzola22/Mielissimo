const formulario = document.getElementById("formulario-producto");
const mensaje = document.getElementById("mensaje");
const productosContainer = document.getElementById("lista-productos");
const selectCategoria = document.getElementById("categoria-producto");
const formularioCategoria = document.getElementById("formulario-categoria");
const listaCategorias = document.getElementById("lista-categorias");
const botonLogout = document.getElementById("logout");
const buscador = document.getElementById("buscador-productos");
const checkboxInactivos = document.getElementById("mostrarInactivos");
const mensajeCategoria = document.getElementById("mensaje-categoria");


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

// 🔄 Precio según tipo de variante
const tipoVarianteInput = document.getElementById("tipoVariante");
const precioVarianteInput = document.getElementById("precioExtra");

tipoVarianteInput.addEventListener("change", () => {
  if (tipoVarianteInput.value === "Sabor") {
    precioVarianteInput.disabled = true;
    precioVarianteInput.value = "";
  } else {
    precioVarianteInput.disabled = false;
  }
});



function cargarProductos(filtro = "") {
  const mostrarInactivos = checkboxInactivos.checked;

  fetch(`https://mielissimo.onrender.com/api/productos?mostrarInactivos=${mostrarInactivos}`, {
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
            <p><strong>Activo:</strong> ${estaActivo ? "Sí" : "No"}</p>
            <div class="btns" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
              ${estaActivo
                ? `
                  <button class="btn-editar" data-id="${prod.id}" 
                          data-nombre="${prod.nombre}"
                          data-precio="${prod.precio}"
                          data-imagen="${prod.imagen}"
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
  fetch("https://mielissimo.onrender.com/api/categorias")
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
  const url = productoEnEdicion ? `https://mielissimo.onrender.com/api/productos/${productoEnEdicion}` : "https://mielissimo.onrender.com/api/productos";
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

function editarProducto(id, nombre, precio, imagen, categoria_id) {
  formulario.nombre.value = nombre;
  formulario.precio.value = precio;
  
  selectCategoria.value = categoria_id;
  productoEnEdicion = id;

  mensaje.textContent = "Editando producto...";
  mensaje.style.color = "blue";
  btnCancelarProducto.style.display = "inline";
  seccionFormulario.scrollIntoView({ behavior: "smooth", block: "start" });
}

function desactivarProducto(id) {
  fetch(`https://mielissimo.onrender.com/api/productos/desactivar/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((res) => res.json())
    .then((data) => {
      mensaje.textContent = data.mensaje || "Producto desactivado";
      mensaje.style.color = "green";
      cargarProductos();
    })
    .catch(() => {
      mensaje.textContent = "Error al desactivar producto";
      mensaje.style.color = "red";
    });
}


function reactivarProducto(id) {
  fetch(`https://mielissimo.onrender.com/api/productos/activar/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((res) => res.json())
    .then((data) => {
      mensaje.textContent = data.mensaje || "Producto reactivado";
      mensaje.style.color = "green";
      cargarProductos();
    })
    .catch(() => {
      mensaje.textContent = "Error al reactivar producto";
      mensaje.style.color = "red";
    });
}


formularioCategoria.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = formularioCategoria.nombre.value;

  const url = categoriaEnEdicion ? `https://mielissimo.onrender.com/api/categorias/${categoriaEnEdicion}` : "https://mielissimo.onrender.com/api/categorias";
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
  fetch(`https://mielissimo.onrender.com/api/categorias/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
  mensajeCategoria.textContent = data.error;
  mensajeCategoria.style.color = "red";
} else {
  mensajeCategoria.textContent = "✅ Categoría eliminada correctamente";
  mensajeCategoria.style.color = "green";
  cargarCategorias();
  setTimeout(() => {
    mensajeCategoria.textContent = "";
  }, 3000);
}

    })
    .catch(() => {
      mensaje.textContent = "Error al eliminar categoría";
      mensaje.style.color = "red";
    });
}


document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-editar")) {
    const btn = e.target;
    editarProducto(
      btn.dataset.id,
      btn.dataset.nombre,
      btn.dataset.precio,
      btn.dataset.imagen,
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
  fetch(`https://mielissimo.onrender.com/api/variantes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      mensajeVariante.textContent = "✅ Variante eliminada";
      mensajeVariante.style.color = "green";
      cargarVariantes(productoParaVariantes);
    })
    .catch(() => {
      mensajeVariante.textContent = "Error al eliminar variante";
      mensajeVariante.style.color = "red";
    });
}


  if (e.target.classList.contains("editar-variante")) {
    const id = e.target.dataset.id;
    varianteEditandoId = id;
    document.getElementById("tipoVariante").value = e.target.dataset.tipo;
    document.getElementById("nombreVariante").value = e.target.dataset.nombre;
    document.getElementById("precioExtra").value =  e.target.dataset.precio && e.target.dataset.precio !== "null"
    ? e.target.dataset.precio
    : "";
    btnAgregarVariante.textContent = "Guardar cambios";
    btnCancelarVariante.style.display = "inline";

    // Actualización precio activo/inactivo al editar
   if (e.target.dataset.tipo === "Sabor") {
  document.getElementById("precioExtra").disabled = true;
  document.getElementById("precioExtra").value = "";
} else {
  document.getElementById("precioExtra").disabled = false;
}

  }
});

function cargarVariantes(idProducto) {
  tablaVariantes.innerHTML = `
    <tr>
      <th>Tipo</th>
      <th>Nombre de variante</th>
      <th>Precio</th>
      <th>Acciones</th>
    </tr>
  `;
  fetch(`https://mielissimo.onrender.com/api/variantes/${idProducto}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(variantes => {
     variantes.forEach(v => {
  const fila = document.createElement("tr");

  const precioTexto =
    v.tipo === "Tamaño"
      ? (v.precio_extra !== null && v.precio_extra !== "" && !isNaN(v.precio_extra)
          ? `$${parseFloat(v.precio_extra).toFixed(2)}`
          : "$0.00")
      : "-";

  fila.innerHTML = `
    <td>${v.tipo}</td>
    <td>${v.nombre}</td>
    <td>${precioTexto}</td>
    <td>
      <button class="editar-variante" data-id="${v.id}" data-tipo="${v.tipo}" data-nombre="${v.nombre}" data-precio="${v.precio_extra}">✏</button>
      <button class="eliminar-variante" data-id="${v.id}">🗑</button>
    </td>
  `;
  tablaVariantes.appendChild(fila);
});


    });
}

formularioVariante.addEventListener("submit", async (e) => {
  e.preventDefault();

  const tipo = document.getElementById("tipoVariante").value;
  const nombre = document.getElementById("nombreVariante").value;
  const inputPrecio = document.getElementById("precioExtra");

 const precioAdicional = inputPrecio.disabled || inputPrecio.value.trim() === "" ? null : parseFloat(inputPrecio.value);



  const body = {
    id_producto: parseInt(productoParaVariantes),
    tipo,
    nombre,
    precio: precioAdicional,
    
  };

  const metodo = varianteEditandoId ? "PUT" : "POST";
  const url = varianteEditandoId ? `https://mielissimo.onrender.com/api/variantes/${varianteEditandoId}` : "https://mielissimo.onrender.com/api/variantes";

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (res.ok) {
      mensajeVariante.textContent = varianteEditandoId ? "✅ Variante actualizada" : "✅ Variante agregada";
      mensajeVariante.style.color = "green";
      formularioVariante.reset();
      btnAgregarVariante.textContent = "Agregar variante";
      btnCancelarVariante.style.display = "none";
      varianteEditandoId = null;
      tipoVarianteInput.value = "Tamaño";
precioVarianteInput.disabled = false;

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

// 🔄 Precio según tipo de variante

tipoVarianteInput.addEventListener("change", () => {
  if (tipoVarianteInput.value === "Sabor") {
    precioVarianteInput.disabled = true;
    precioVarianteInput.value = "";
  } else {
    precioVarianteInput.disabled = false;
  }
});

if (tipoVarianteInput.value === "Sabor") {
  precioVarianteInput.disabled = true;
}

botonLogout.addEventListener("click", () => {
  localStorage.removeItem("tokenAdmin");
  window.location.href = "login-admin.html";
});

buscador.addEventListener("input", () => cargarProductos(buscador.value));
checkboxInactivos.addEventListener("change", () => cargarProductos());

cargarProductos();
cargarCategorias();


