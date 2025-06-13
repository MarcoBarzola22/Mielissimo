// client/js/main.js

// Función para renderizar todos los productos
function cargarProductos() {
  fetch('http://localhost:3000/api/productos')
    .then(res => res.json())
    .then(productos => {
      const contenedor = document.querySelector('.productos');
      contenedor.innerHTML = ''; // limpiamos antes de renderizar
      productos.forEach(producto => {
        contenedor.innerHTML += `
          <div class="producto">
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h2>${producto.nombre}</h2>
            <p>$${parseFloat(producto.precio).toFixed(2)}</p>
            <button class="agregar" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
            <button class="eliminar" onclick="eliminarProducto(${producto.id})">🗑 Eliminar</button>
          </div>
        `;
      });
    })
    .catch(error => {
      console.error('Error al cargar productos:', error);
    });
}

// Permite eliminar el producto
function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
    fetch(`http://localhost:3000/api/productos/${id}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      cargarProductos(); // vuelve a cargar los productos actualizados
    })
    .catch(err => {
      console.error("Error al eliminar:", err);
    });
  }
}

// Ejemplo placeholder para el carrito (podés dejarlo así o implementar más adelante)
function agregarAlCarrito(id) {
  console.log("Producto agregado al carrito con ID:", id);
}

// Ejecutamos al cargar la página
cargarProductos();
