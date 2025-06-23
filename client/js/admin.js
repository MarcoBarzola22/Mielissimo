const formulario = document.getElementById("formulario-producto");
const mensaje = document.getElementById("mensaje");
const productosContainer = document.getElementById("lista-productos");
const selectCategoria = document.getElementById("categoria-producto");
const formularioCategoria = document.getElementById("formulario-categoria");
const listaCategorias = document.getElementById("lista-categorias");
const botonLogout = document.getElementById("logout");
const buscador = document.getElementById("buscador-productos");
const seccionFormulario = document.getElementById("seccion-formulario");

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
            <button class="btn-editar" data-id="${prod.id}" 
              data-nombre="${prod.nombre}"
              data-precio="${prod.precio}"
              data-imagen="${prod.imagen}"
              data-stock="${prod.stock}"
              data-categoria="${prod.categoria_id}">
              ✏ Editar
            </button>
            <button class="btn-eliminar" data-id="${prod.id}">🗑 Eliminar</button>
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
          <div class="botones-vertical">
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
  mensaje.textContent = "Editando producto...";
  mensaje.style.color = "blue";
  seccionFormulario.scrollIntoView({ behavior: "smooth" });
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
  if (confirm("¿Eliminar esta categoría?")) {
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
  // Editar producto
  if (e.target.classList.contains("btn-editar")) {
    const btn = e.target;
    const id = btn.dataset.id;
    const nombre = btn.dataset.nombre;
    const precio = btn.dataset.precio;
    const imagen = btn.dataset.imagen;
    const stock = btn.dataset.stock;
    const categoria_id = btn.dataset.categoria;

    editarProducto(id, nombre, precio, imagen, stock, categoria_id);
  }

  // Eliminar producto
  if (e.target.classList.contains("btn-eliminar")) {
    const id = e.target.dataset.id;
    eliminarProducto(id);
  }
});

// Delegación de eventos para botones de categorías
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-editar-categoria")) {
    const id = e.target.dataset.id;
    const nombre = e.target.dataset.nombre;
    editarCategoriaPrompt(id, nombre);
  }

  if (e.target.classList.contains("btn-eliminar-categoria")) {
    const id = e.target.dataset.id;
    eliminarCategoria(id);
  }
});


buscador.addEventListener("input", () => cargarProductos(buscador.value));

cargarProductos();
cargarCategorias();
