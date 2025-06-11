document.addEventListener('DOMContentLoaded', () => {
  fetch('data/productos.json')
    .then(response => response.json())
    .then(productos => {
      const contenedor = document.querySelector('.productos');
      contenedor.innerHTML = ''; // Limpiar contenido estático

      productos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('producto');
        tarjeta.innerHTML = `
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <h2>${producto.nombre}</h2>
          <p>$${producto.precio}</p>
          <button>Agregar al carrito</button>
        `;
        contenedor.appendChild(tarjeta);
      });
    })
    .catch(error => console.error('Error al cargar productos:', error));
});
