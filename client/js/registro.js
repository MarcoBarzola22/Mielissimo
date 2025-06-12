//Esta porcion de codigo valida el formulario de registro
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validaciones básicas
    if (!nombre || !email || !password || !confirmPassword) {
      alert('Por favor, completá todos los campos.');
      return;
    }

    if (!validarEmail(email)) {
      alert('Ingresá un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Si pasa todas las validaciones, mostramos mensaje temporal
    alert('Formulario válido. En el próximo paso se enviará al backend.');

    // Acá después haremos el fetch al backend
  });
});

function validarEmail(email) {
  // Expresión regular básica para validar emails
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
