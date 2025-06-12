//valida el formulario del login
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validaciones básicas
    if (!email || !password) {
      alert('Por favor, completá todos los campos.');
      return;
    }

    if (!validarEmail(email)) {
      alert('Ingresá un correo electrónico válido.');
      return;
    }

    // Muestra mensaje de éxito (provisorio)
    alert('Inicio de sesión válido. En el siguiente paso se validará con el backend.');

    // Acá luego irá el fetch para validar contra la base de datos
  });
});

function validarEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
