const formulario = document.getElementById("formulario-producto");
const mensaje = document.getElementById("mensaje");
const productosContainer = document.getElementById("lista-productos");
const selectCategoria = document.getElementById("categoria-producto");
const formularioCategoria = document.getElementById("formulario-categoria");
const listaCategorias = document.getElementById("lista-categorias");
const botonLogout = document.getElementById("logout");

let productoEnEdicion = null;
const token = localStorage.getItem("tokenAdmin");

function cargarProductos() {
  fetch("/api/productos", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(productos => {
      productosContainer.innerHTML = "";
      productos.forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("producto-admin");
        div.innerHTML = `
          <p><strong>${prod.nombre}</strong> – $${parseFloat(prod.precio).toFixed(2)} – Stock: ${prod.stock}</p>
          <p><img src="${prod.imagen}" alt="${prod.nombre}" width="100"></p>
          <button onclick="editarProducto(${prod.id}, '${prod.nombre}', ${prod.precio}, '${prod.imagen}', ${prod.stock}, ${prod.categoria_id})">✏ Editar</button>
          <button onclick="eliminarProducto(${prod.id})">🗑 Eliminar</button>
        `;
        productosContainer.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error al cargar productos:", err);
      mensaje.textContent = "Error al cargar productos";
      mensaje.style.color = "red";
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
        div.innerHTML = `
          <strong>${cat.nombre}</strong>
          <button onclick="editarCategoriaPrompt(${cat.id}, '${cat.nombre}')">✏</button>
          <button onclick="eliminarCategoria(${cat.id})">🗑</button>
        `;
        listaCategorias.appendChild(div);
      });
    })
    .catch(err => console.error("Error al cargar categorías:", err));
}

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = new FormData(formulario);

  const url = productoEnEdicion
    ? `/api/productos/${productoEnEdicion}`
    : "/api/productos";
  const metodo = productoEnEdicion ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { Authorization: `Bearer ${token}` },
      body: datos
    });

    const resultado = await res.json();
    if (res.ok) {
      mensaje.textContent = productoEnEdicion
        ? "Producto actualizado correctamente."
        : "Producto agregado correctamente.";
      mensaje.style.color = "green";
      formulario.reset();
      productoEnEdicion = null;
      setTimeout(() => cargarProductos(), 300);
    } else {
      mensaje.textContent = resultado.error || "Error en la operación.";
      mensaje.style.color = "red";
    }
  } catch (err) {
    console.error("Error al enviar producto:", err);
    mensaje.textContent = "Error de conexión.";
    mensaje.style.color = "red";
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
}

function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
    fetch(`/api/productos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.mensaje || data.error);
        cargarProductos();
      })
      .catch(err => {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar producto.");
      });
  }
}

formularioCategoria.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = formularioCategoria.nombre.value;

  try {
    const res = await fetch("/api/categorias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nombre })
    });

    const resultado = await res.json();
    if (res.ok) {
      alert("Categoría agregada correctamente");
      formularioCategoria.reset();
      cargarCategorias();
    } else {
      alert(resultado.error || "Error al agregar categoría");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error de conexión");
  }
});

function editarCategoriaPrompt(id, nombreActual) {
  const nuevoNombre = prompt("Editar nombre de categoría:", nombreActual);
  if (nuevoNombre && nuevoNombre !== nombreActual) {
    fetch(`/api/categorias/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nombre: nuevoNombre })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.mensaje || data.error);
        cargarCategorias();
      })
      .catch(err => alert("Error al editar categoría"));
  }
}

function eliminarCategoria(id) {
  if (confirm("¿Eliminar esta categoría? (Debe estar vacía)")) {
    fetch(`/api/categorias/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.mensaje || data.error);
        cargarCategorias();
      })
      .catch(err => alert("Error al eliminar categoría"));
  }
}

botonLogout.addEventListener("click", () => {
  localStorage.removeItem("tokenAdmin");
  window.location.href = "login-admin.html";
});

cargarProductos();
cargarCategorias();
