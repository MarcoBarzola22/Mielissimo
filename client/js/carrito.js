// Este archivo se encargará de mostrar los productos guardados en localStorage

//lee el carrito desde localStorage y mostrarlo dinámicamente en la página carrito.html.

document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.querySelector('.carrito-contenedor');
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p>🛒 El carrito está vacío.</p>';
    return;
  }

  let total = 0;

 carrito.forEach((producto, index) => {
  const item = document.createElement('div');
  item.classList.add('producto');

  const subtotal = producto.precio * producto.cantidad;
  total += subtotal;

  item.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}">
    <h2>${producto.nombre}</h2>
    <p>Precio unitario: $${producto.precio}</p>
    <p>Cantidad: ${producto.cantidad}</p>
    <p>Subtotal: $${subtotal}</p>
    <button class="eliminar-btn" data-index="${index}">❌ Eliminar</button>
  `;

  contenedor.appendChild(item);
});

// 🔄 Agregar eventos a los botones "Eliminar"
document.querySelectorAll('.eliminar-btn').forEach(boton => {
  boton.addEventListener('click', (e) => {
    const index = e.target.dataset.index;
    eliminarProducto(index);
  });
});


  const totalHTML = document.createElement('div');
  totalHTML.classList.add('producto');
  totalHTML.innerHTML = `<h3>Total: $${total}</h3>`;
  contenedor.appendChild(totalHTML);
});

function eliminarProducto(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  carrito.splice(index, 1); // Elimina el producto en esa posición

  localStorage.setItem('carrito', JSON.stringify(carrito));

  location.reload(); // Recarga la página para actualizar la vista
}

// 🔚 Finalizar compra
const finalizarBtn = document.getElementById('finalizarCompra');

if (finalizarBtn) {
  finalizarBtn.addEventListener('click', () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
      alert('❌ El carrito está vacío.');
      return;
    }

    // Armar resumen simple
    let resumen = '🧾 Resumen de compra:\n\n';

    carrito.forEach(p => {
      resumen += `${p.nombre} x${p.cantidad} = $${p.precio * p.cantidad}\n`;
    });

    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    resumen += `\n💵 Total: $${total}\n\n`;

    resumen += 'Gracias por tu compra ❤️';

    alert(resumen);

    // Limpiar carrito
    localStorage.removeItem('carrito');
    location.reload();
  });
}
