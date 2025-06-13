const formulario = document.getElementById("formulario-producto");
const mensaje = document.getElementById("mensaje");

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(formulario); // Recoge todos los campos, incluyendo el archivo

  try {
    const res = await fetch("http://localhost:3000/api/productos", {
      method: "POST",
      body: formData, // Enviamos el FormData sin headers
    });

    const resultado = await res.json();

    if (res.ok) {
      mensaje.textContent = resultado.mensaje || "Producto agregado correctamente.";
      mensaje.style.color = "green";
      formulario.reset();
    } else {
      mensaje.textContent = resultado.error || "Ocurrió un error al agregar el producto.";
      mensaje.style.color = "red";
    }
  } catch (err) {
    console.error("Error al enviar producto:", err);
    mensaje.textContent = "Error de conexión con el servidor.";
    mensaje.style.color = "red";
  }
});
