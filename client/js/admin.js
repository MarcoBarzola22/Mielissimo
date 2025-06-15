// admin.js

const formulario = document.getElementById("formulario-producto");
const mensaje = document.getElementById("mensaje");
const productosContainer = document.getElementById("lista-productos");

let productoEnEdicion = null;

// ✅ Token de autenticación
const token = localStorage.getItem("tokenAdmin");

// Mostrar productos actuales
function cargarProductos() {
  fetch("/api/productos", {
    headers: {
      Authorization: `Bearer ${token}` // ✅ si tenés rutas protegidas en el futuro
    }
  })
    .then(res => res.json())
    .then(productos => {
      console.log("Productos desde el servidor:", productos);
      productosContainer.innerHTML = "";
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
    .catch(err => {
      console.error("Error al cargar productos:", err);
      mensaje.textContent = "Error al cargar productos";
      mensaje.style.color = "red";
    });
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
    ? `/api/productos/${productoEnEdicion}`
    : "/api/productos";

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

      // 🕒 Esperar un poquito para evitar glitch visual
      setTimeout(() => {
        cargarProductos();
      }, 300);
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

function editarProducto(id, nombre, precio, imagen, stock) {
  formulario.nombre.value = nombre;
  formulario.precio.value = precio;
  formulario.imagen.value = imagen;
  formulario.stock.value = stock;
  productoEnEdicion = id;
  mensaje.textContent = "Editando producto...";
  mensaje.style.color = "blue";
}

function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
    fetch(`/api/productos/${id}`, {
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

// Al cargar
cargarProductos();
