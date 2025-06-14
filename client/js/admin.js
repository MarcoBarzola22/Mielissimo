const formulario = document.getElementById("formulario-producto");
const mensaje = document.getElementById("mensaje");
const productosContainer = document.getElementById("lista-productos");

// Si estamos editando, guardamos el ID acá
let productoEnEdicion = null;

// Obtener el token
const token = localStorage.getItem("tokenAdmin");

// Mostrar productos actuales
function cargarProductos() {
  fetch("http://localhost:3000/api/productos")
    .then(res => res.json())
    .then(productos => {
      productosContainer.innerHTML = ""; // limpiar
      productos.forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("producto-admin");
        div.innerHTML = `
          <p><strong>${prod.nombre}</strong> – $${parseFloat(prod.precio).toFixed(2)} – Stock: ${prod.stock}</p>
          <p><img src="${prod.imagen}" alt="${prod.nombre}" width="100"></p>
          <button onclick="editarProducto(${prod.id}, '${prod.nombre}', ${prod.precio}, '${prod.imagen}', ${prod.stock})">✏ Editar</button>
          <button onclick="eliminarProducto(${prod.id})">🗑 Eliminar</button>
        `;
        productosContainer.appendChild(div);
      });
    })
    .catch(err => console.error("Error al cargar productos:", err));
}

// Enviar producto nuevo o editado
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    nombre: formulario.nombre.value,
    precio: parseFloat(formulario.precio.value),
    imagen: formulario.imagen.value,
    stock: parseInt(formulario.stock.value)
  };

  const url = productoEnEdicion
    ? `http://localhost:3000/api/productos/${productoEnEdicion}`
    : "http://localhost:3000/api/productos";

  const metodo = productoEnEdicion ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datos)
    });

    const resultado = await res.json();

    if (res.ok) {
      mensaje.textContent = productoEnEdicion
        ? "Producto actualizado correctamente."
        : "Producto agregado correctamente.";
      mensaje.style.color = "green";
      formulario.reset();
      productoEnEdicion = null;
      cargarProductos();
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

// Cargar producto al formulario para editar
function editarProducto(id, nombre, precio, imagen, stock) {
  formulario.nombre.value = nombre;
  formulario.precio.value = precio;
  formulario.imagen.value = imagen;
  formulario.stock.value = stock;
  productoEnEdicion = id;
  mensaje.textContent = "Editando producto...";
  mensaje.style.color = "blue";
}

// Eliminar producto
function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
    fetch(`http://localhost:3000/api/productos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.mensaje);
        cargarProductos();
      })
      .catch(err => {
        console.error("Error al eliminar:", err);
      });
  }
}

// Al cargar la página
cargarProductos();
