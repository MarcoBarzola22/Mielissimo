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
      renderizarProductos(productos);
    })
    .catch(err => console.error("Error al filtrar productos:", err));
});

// 🖼 Renderizar productos en la vista
function renderizarProductos(productos) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }

  productos.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${parseFloat(prod.precio).toFixed(2)}</p>
      <p>Stock: ${prod.stock}</p>
      <p><strong>Categoría:</strong> ${prod.categoria_nombre || "Sin asignar"}</p>
    `;
    contenedor.appendChild(div);
  });
}

// 🚀 Ejecutamos al cargar la página
cargarCategorias();
renderizarProductos([]);
