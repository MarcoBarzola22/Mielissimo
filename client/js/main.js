// client/js/main.js
// 👉 Obtener y mostrar categorías en el selector
function cargarCategorias() {
  fetch("/api/categorias")
    .then(res => res.json())
    .then(categorias => {
      const select = document.getElementById("categoria");
      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        select.appendChild(option);
      });
    })
    .catch(err => console.error("Error al cargar categorías:", err));
}

// 👉 Escuchar cambios en el selector para filtrar
document.getElementById("categoria").addEventListener("change", () => {
  const categoriaId = document.getElementById("categoria").value;
  cargarProductos(categoriaId);
});

// Función para renderizar todos los productos
function cargarProductos(categoriaId = "todas") {
  let url = "/api/productos";
  if (categoriaId !== "todas") {
    url += `?categoria=${categoriaId}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(productos => {
      const contenedor = document.getElementById("productos");
      contenedor.innerHTML = "";

      productos.forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
          <img src="${prod.imagen}" alt="${prod.nombre}">
          <h3>${prod.nombre}</h3>
          <p>Precio: $${parseFloat(prod.precio).toFixed(2)}</p>
          <p>Stock: ${prod.stock}</p>
        `;
        contenedor.appendChild(div);
      });
    })
    .catch(err => console.error("Error al cargar productos:", err));
}



// Ejemplo placeholder para el carrito (podés dejarlo así o implementar más adelante)
function agregarAlCarrito(id) {
  console.log("Producto agregado al carrito con ID:", id);
}

// Ejecutamos al cargar la página
cargarCategorias();
cargarProductos();

const selectCategoria = document.getElementById("filtro-categoria");

// 🔃 Cargar categorías desde el backend
function cargarCategorias() {
  fetch("/api/categorias")
    .then(res => res.json())
    .then(categorias => {
      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        selectCategoria.appendChild(option);
      });
    })
    .catch(err => console.error("Error al cargar categorías:", err));
}

// 🎯 Evento al cambiar categoría
selectCategoria.addEventListener("change", () => {
  const idCategoria = selectCategoria.value;
  const url = idCategoria === "todas"
    ? "/api/productos"
    : `/api/productos?categoria=${idCategoria}`;

  fetch(url)
    .then(res => res.json())
    .then(productos => {
      renderizarProductos(productos); // ← esta función ya la tenés
    })
    .catch(err => console.error("Error al filtrar productos:", err));
});

cargarCategorias(); // 📥 Inicia todo al cargar
