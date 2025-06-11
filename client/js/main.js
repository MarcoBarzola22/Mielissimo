//Bloque para generar las tarjetas
document.addEventListener('DOMContentLoaded', () => {
  fetch('data/productos.json')
    .then(response => response.json())
    .then(productos => {
      const contenedor = document.querySelector('.productos');
      contenedor.innerHTML = '';

      productos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('producto');
        tarjeta.innerHTML = `
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <h2>${producto.nombre}</h2>
          <p>$${producto.precio}</p>
          <button data-id="${producto.id}">Agregar al carrito</button>
        `;

        // 📌 Escuchar clic en el botón
        const boton = tarjeta.querySelector('button');
        boton.addEventListener('click', () => {
          agregarAlCarrito(producto);
        });

        contenedor.appendChild(tarjeta);
      });
    })
    .catch(error => console.error('Error al cargar productos:', error));
});

//funcion de Agregar al carrito
function agregarAlCarrito(producto) {
  // 1. Obtener el carrito actual (o array vacío)
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  // 2. Buscar si ya existe el producto en el carrito
  const existe = carrito.find(item => item.id === producto.id);

  if (existe) {
    existe.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  // 3. Guardar el carrito actualizado
  localStorage.setItem('carrito', JSON.stringify(carrito));

  // 4. Aviso
  alert(`🛒 ${producto.nombre} agregado al carrito`);
}
