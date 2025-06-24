import { mostrarUsuario } from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
  mostrarUsuario();

  const id_usuario = localStorage.getItem("id_usuario");
  const contenedor = document.getElementById("historial-compras");

  if (!id_usuario) {
    contenedor.innerHTML = "<p>Debes iniciar sesión para ver tu historial.</p>";
    return;
  }

  try {
    const res = await fetch(`/api/compras/${id_usuario}`);
    const compras = await res.json();

    if (compras.length === 0) {
      contenedor.innerHTML = "<p>No tenés compras registradas.</p>";
      return;
    }

    compras.forEach(compra => {
      const div = document.createElement("div");
      div.classList.add("item-compra");
      div.innerHTML = `
        <img src="${compra.imagen}" alt="${compra.nombre}">
        <div>
          <h3>${compra.nombre}</h3>
          <p>Cantidad: ${compra.cantidad}</p>
          <p>Precio unitario: $${parseFloat(compra.precio).toFixed(2)}</p>
          <p>Fecha: ${new Date(compra.fecha_compra).toLocaleString()}</p>
        </div>
      `;
      contenedor.appendChild(div);
    });
  } catch (err) {
    contenedor.innerHTML = "<p>Error al cargar historial.</p>";
  }
});
