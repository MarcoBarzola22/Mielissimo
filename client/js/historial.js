document.addEventListener("DOMContentLoaded", () => {
  cargarHistorial();
});

async function cargarHistorial() {
  const token = localStorage.getItem("token_usuario");
  if (!token) return;

  try {
    const res = await fetch("https://api.mielissimo.com.ar/api/historial", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const compras = await res.json();
    mostrarHistorial(compras);
  } catch (error) {
    console.error("Error al cargar historial:", error);
  }
}

function mostrarHistorial(compras) {
  const contenedor = document.getElementById("historial-container");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (compras.length === 0) {
    contenedor.innerHTML = "<p>No hay compras registradas.</p>";
    return;
  }

  compras.forEach(compra => {
    const card = document.createElement("div");
    card.className = "historial-card";

    const variantesHTML = compra.variantes.length > 0
      ? `<div class="variantes-historial"><strong>Variantes:</strong><ul>` +
        compra.variantes.map(v => `<li>${v.tipo}: ${v.nombre} (${v.precio ? `$${v.precio}` : "sin precio"})</li>`).join("") +
        `</ul></div>`
      : "";

    card.innerHTML = `
      <img src="${compra.imagen}" alt="${compra.nombre_producto}" />
      <h3>${compra.nombre_producto}</h3>
      <p>Precio base: AR$ ${compra.precio}</p>
      <p>Cantidad: ${compra.cantidad}</p>
      <p>Fecha: ${new Date(compra.fecha_compra).toLocaleDateString()}</p>
      <p>Tipo de envío: ${compra.tipo_envio}</p>
      ${variantesHTML}
    `;

    contenedor.appendChild(card);
  });
}
