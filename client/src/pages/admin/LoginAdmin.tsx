import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";      // Tus estilos generales viejos
import "../../styles/tienda.css";      // Tus estilos de tienda viejos
import "../../styles/login-admin.css"; // Tus estilos específicos del login

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState("");
  const [cargando, setCargando] = useState(false);

  // Lógica de Login (Reemplaza a login-admin.js)
 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setCargando(true);
  setMensaje("");

  try {
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usuario, password: clave }),
    });

    const resultado = await res.json();

    if (res.ok) {
      // AQUÍ SE GUARDA EL TOKEN:
      localStorage.setItem("tokenAdmin", resultado.token);
      navigate("/admin/dashboard");
    } else {
      setMensaje(resultado.error || "Credenciales incorrectas");
    }
  } catch (err) {
    console.error("Error en login:", err);
    setMensaje("Error de conexión con el servidor");
  } finally {
    setCargando(false);
  }
};

  // Lógica de Recuperar Contraseña (Inline script del html original)
  const handleRecuperar = async (e: React.MouseEvent) => {
    e.preventDefault();
    setMensajeRecuperacion("Procesando solicitud...");

    try {
      const res = await fetch("http://localhost:3000/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // El backend ya sabe a qué correo enviar
      });

      const data = await res.json();
      setMensajeRecuperacion(data.mensaje || data.error || "Revisa tu correo");
    } catch (error) {
      setMensajeRecuperacion("Error al intentar recuperar contraseña");
    }
  };

  return (
    <div className="admin-login-body">
      {/* Encabezado */}
      <header className="header-login-admin">
        <div className="logo">
          {/* Usamos una ruta relativa a public/assets */}
          <img src="/assets/logoCanva.png" alt="Logo de Mielissimo" />
        </div>
      </header>

      {/* Formulario */}
      <main className="form-container">
        <div className="card-login-admin">
          <h1>Acceso Administración</h1>
          <form id="form-login-admin" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Usuario"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
            />
            <button type="submit" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* Mensajes de error/estado */}
          {mensaje && <p id="mensaje-login" style={{ color: "red" }}>{mensaje}</p>}

          <p style={{ marginTop: "10px", textAlign: "center" }}>
            <a href="#" id="recuperar-link" onClick={handleRecuperar}>
              ¿Olvidaste tu contraseña?
            </a>
          </p>

          {mensajeRecuperacion && (
            <p
              id="mensaje-recuperacion"
              style={{
                marginTop: "10px",
                textAlign: "center",
                color: mensajeRecuperacion.includes("Error") ? "red" : "green",
              }}
            >
              {mensajeRecuperacion}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2025 Mielissimo – Villa Mercedes</p>
        <p>
          WhatsApp:{" "}
          <a href="https://wa.me/5492657603387" target="_blank" rel="noreferrer">
            2657-603387
          </a>{" "}
          | Instagram:{" "}
          <a
            href="https://www.instagram.com/mielissimo__/"
            target="_blank"
            rel="noreferrer"
          >
            @mielissimo_
          </a>
        </p>
        <p style={{ fontSize: "0.9em" }}>
          Todos los derechos reservados. Sitio desarrollado por Marco Barzola.
        </p>
      </footer>
    </div>
  );
};

export default LoginAdmin;