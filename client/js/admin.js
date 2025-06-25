
const formulario = document.getElementById("formulario-producto");
const mensaje = document.getElementById("mensaje");
const productosContainer = document.getElementById("lista-productos");
const selectCategoria = document.getElementById("categoria-producto");
const formularioCategoria = document.getElementById("formulario-categoria");
const listaCategorias = document.getElementById("lista-categorias");
const botonLogout = document.getElementById("logout");
const buscador = document.getElementById("buscador-productos");
const seccionFormulario = document.getElementById("seccion-formulario");
const listaVariantes = document.getElementById("lista-variantes");
const formularioVariante = document.getElementById("formulario-variante");
const mensajeVariante = document.getElementById("mensaje-variante");
let productoEnEdicion = null;
const token = localStorage.getItem("tokenAdmin");

function cargarProductos(filtro = "") {
  fetch("/api/productos", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(productos => {
      productosContainer.innerHTML = "";
      productos
        .filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()))
        .forEach(prod => {
          const div = document.createElement("div");
          div.classList.add("producto-admin");
          div.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}" />
            <p><strong>${prod.nombre}</strong></p>
            <p>Precio: $${parseFloat(prod.precio).toFixed(2)}</p>
            <p>Stock: ${prod.stock}</p>
            <div class="btns" style="display: flex; flex-direction: column; gap: 0.3rem;">
              <button class="btn-editar" data-id="${prod.id}" 
                data-nombre="${prod.nombre}"
                data-precio="${prod.precio}"
                data-imagen="${prod.imagen}"
                data-stock="${prod.stock}"
                data-categoria="${prod.categoria_id}">✏ Editar</button>
              <button class="btn-eliminar" data-id="${prod.id}">🗑 Eliminar</button>
              <button class="btn-variante" data-id="${prod.id}" data-nombre="${prod.nombre}">➕ Agregar Variante</button>
              <button class="btn-ver-variantes" data-id="${prod.id}" data-nombre="${prod.nombre}">👁 Ver Variantes</button>
              <span id="contador-variantes-${prod.id}" class="contador-variantes"></span>
            </div>
          `;
          productosContainer.appendChild(div);
          actualizarContadorVariantes(prod.id);
        });
    })
    .catch(err => {
      console.error("Error al cargar productos:", err);
      mensaje.textContent = "Error al cargar productos";
    });
}

function actualizarContadorVariantes(idProducto) {
  fetch(`/api/variantes/${idProducto}`)
    .then(res => res.json())
    .then(variantes => {
      const span = document.getElementById(`contador-variantes-${idProducto}`);
      if (span) {
        span.textContent = `🧩 Variantes: ${variantes.length}`;
      }
    })
    .catch(err => console.error("Error al contar variantes:", err));
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
      setTimeout(() => cargarProductos(), 300);
    } else {
      mensaje.textContent = resultado.error || "Error en la operación";
      mensaje.style.color = "red";
    }
  } catch (err) {
    mensaje.textContent = "Error de conexión.";
  }
});

function editarProducto(id, nombre, precio, imagen, stock, categoria_id) {
  formulario.nombre.value = nombre;
  formulario.precio.value = precio;
  formulario.stock.value = stock;
  selectCategoria.value = categoria_id;
  productoEnEdicion = id;

  if (mensaje) {
    mensaje.textContent = "Editando producto...";
    mensaje.style.color = "blue";
  }

  if (seccionFormulario) {
    seccionFormulario.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}


function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
    fetch(`/api/productos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(() => cargarProductos());
  }
}

formularioCategoria.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = formularioCategoria.nombre.value;
  const res = await fetch("/api/categorias", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ nombre })
  });
  const data = await res.json();
  if (res.ok) {
    formularioCategoria.reset();
    cargarCategorias();
  } else {
    alert(data.error || "Error al agregar categoría");
  }
});

function editarCategoriaPrompt(id, nombreActual) {
  const nuevoNombre = prompt("Editar nombre:", nombreActual);
  if (nuevoNombre && nuevoNombre !== nombreActual) {
    fetch(`/api/categorias/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nombre: nuevoNombre })
    }).then(() => cargarCategorias());
  }
}

function eliminarCategoria(id) {
  if (confirm("Eliminar esta categoría?")) {
    fetch(`/api/categorias/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => cargarCategorias());
  }
}

botonLogout.addEventListener("click", () => {
  localStorage.removeItem("tokenAdmin");
  window.location.href = "login-admin.html";
});

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

  if (e.target.classList.contains("btn-eliminar")) {
    eliminarProducto(e.target.dataset.id);
  }

  if (e.target.classList.contains("btn-editar-categoria")) {
    const id = e.target.dataset.id;
    const nombre = e.target.dataset.nombre;
    editarCategoriaPrompt(id, nombre);
  }

  if (e.target.classList.contains("btn-eliminar-categoria")) {
    const id = e.target.dataset.id;
    eliminarCategoria(id);
  }

  if (e.target.classList.contains("btn-variante")) {
    const id = e.target.dataset.id;
    const nombre = e.target.dataset.nombre;
    document.getElementById("id_producto_variante").value = id;
    document.getElementById("nombre-producto-seleccionado").textContent = `Agregar variantes a: ${nombre}`;
    document.getElementById("seccion-formulario-variante").style.display = "block";
    mensajeVariante.textContent = "";
    document.getElementById("seccion-formulario-variante").scrollIntoView({ behavior: "smooth" });
  }

  if (e.target.classList.contains("btn-ver-variantes")) {
    const id = e.target.dataset.id;
    document.getElementById("seccion-formulario-variante").style.display = "block";
    document.getElementById("id_producto_variante").value = id;
    document.getElementById("nombre-producto-seleccionado").textContent = `Variantes de producto ID: ${id}`;
    cargarVariantes(id);
    document.getElementById("seccion-formulario-variante").scrollIntoView({ behavior: "smooth" });
  }

  if (e.target.classList.contains("eliminar-variante")) {
    const id = e.target.dataset.id;
    if (confirm("¿Eliminar variante?")) {
      fetch(`/api/variantes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        cargarVariantes(document.getElementById("id_producto_variante").value);
        actualizarContadorVariantes(document.getElementById("id_producto_variante").value);
      });
    }
  }
});


function cargarVariantes(productoId) {
  listaVariantes.innerHTML = "";
  fetch(`/api/variantes/${productoId}`)
    .then(res => res.json())
    .then(variantes => {
      variantes.forEach(v => {
        const div = document.createElement("div");
        div.classList.add("variante-item");
        div.innerHTML = `
          <img src="${v.imagen}" alt="${v.nombre}" />
          <p><strong>${v.nombre}</strong></p>
          <p>Precio extra: $${v.precio_extra}</p>
          <p>Stock: ${v.stock}</p>
          <button class="eliminar-variante" data-id="${v.id}">🗑 Eliminar</button>
        `;
        listaVariantes.appendChild(div);
      });
    });
}

formularioVariante.addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = new FormData(formularioVariante);
  try {
    const res = await fetch("/api/variantes", {
      method: "POST",
      body: datos
    });
    const data = await res.json();
    if (res.ok) {
      mensajeVariante.textContent = "✅ Variante creada correctamente";
      mensajeVariante.style.color = "green";
      formularioVariante.reset();
      cargarVariantes(document.getElementById("id_producto_variante").value);
      actualizarContadorVariantes(document.getElementById("id_producto_variante").value);
    } else {
      mensajeVariante.textContent = data.error || "Error al crear variante";
      mensajeVariante.style.color = "red";
    }
  } catch (err) {
    mensajeVariante.textContent = "Error de conexión";
    mensajeVariante.style.color = "red";
  }
});

buscador.addEventListener("input", () => cargarProductos(buscador.value));

cargarProductos();
cargarCategorias();
