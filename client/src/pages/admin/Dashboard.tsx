import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin.css";

// --- TIPOS DE DATOS ---
interface Variante {
  tipo: string;  // Ej: "Sabor", "Tamaño"
  valor: string; // Ej: "Frutilla", "Grande"
  precio_extra: number;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  stock: number;
  imagen: string;
  activo: boolean;
  oferta: boolean;
  categorias_nombres?: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("tokenAdmin");
  
  // Navegación interna
  const [seccionActiva, setSeccionActiva] = useState<"productos" | "categorias" | "pedidos">("productos");
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);

  // Datos Globales
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  // --- ESTADOS FORMULARIO PRODUCTO ---
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [oferta, setOferta] = useState(false);
  const [imagen, setImagen] = useState<File | null>(null);
  
  // Nuevos Estados Complejos
  const [catsSeleccionadas, setCatsSeleccionadas] = useState<number[]>([]);
  const [variantes, setVariantes] = useState<Variante[]>([]);

  // Estado para Nueva Categoría
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  // --- CARGA INICIAL ---
  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    cargarTodo();
  }, [navigate, token]);

  const cargarTodo = async () => {
    setLoading(true);
    await Promise.all([cargarProductos(), cargarCategorias()]);
    setLoading(false);
  };

  const cargarProductos = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/productos");
      const data = await res.json();
      setProductos(data);
    } catch (error) { console.error(error); }
  };

  const cargarCategorias = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/categorias");
      const data = await res.json();
      setCategorias(data);
    } catch (error) { console.error(error); }
  };

  // --- LÓGICA DE VARIANTES ---
  const agregarFilaVariante = () => {
    setVariantes([...variantes, { tipo: "Sabor", valor: "", precio_extra: 0 }]);
  };

  const quitarFilaVariante = (index: number) => {
    const nuevas = [...variantes];
    nuevas.splice(index, 1);
    setVariantes(nuevas);
  };

  const updateVariante = (index: number, campo: keyof Variante, valor: any) => {
    const nuevas = [...variantes];
    // @ts-ignore
    nuevas[index][campo] = valor;
    setVariantes(nuevas);
  };

  // --- LÓGICA DE CATEGORÍAS (Checkboxes) ---
  const toggleCategoria = (id: number) => {
    if (catsSeleccionadas.includes(id)) {
      setCatsSeleccionadas(catsSeleccionadas.filter(c => c !== id));
    } else {
      setCatsSeleccionadas([...catsSeleccionadas, id]);
    }
  };

  // --- GUARDAR PRODUCTO ---
  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("stock", stock);
    formData.append("oferta", oferta ? "true" : "false");
    if (imagen) formData.append("imagen", imagen);
    
    // Convertimos Arrays a JSON string para enviarlos
    formData.append("categorias", JSON.stringify(catsSeleccionadas));
    formData.append("variantes", JSON.stringify(variantes));

    try {
      const res = await fetch("http://localhost:3000/api/productos", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setMensaje({ tipo: 'exito', texto: "✅ Producto creado con éxito" });
        limpiarFormulario();
        cargarProductos();
      } else {
        const err = await res.json();
        setMensaje({ tipo: 'error', texto: "❌ Error: " + err.error });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: "❌ Error de conexión" });
    }
  };

  const limpiarFormulario = () => {
    setNombre(""); setDescripcion(""); setPrecio(""); setStock(""); 
    setOferta(false); setImagen(null);
    setCatsSeleccionadas([]);
    setVariantes([]);
  };

  // --- GESTIÓN DE CATEGORÍAS (Crear/Borrar) ---
  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!nuevaCategoria) return;

    try {
        const res = await fetch("http://localhost:3000/api/categorias", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nombre: nuevaCategoria })
        });
        if(res.ok) {
            setNuevaCategoria("");
            cargarCategorias(); // Recargar lista
            setMensaje({ tipo: 'exito', texto: "Categoría creada" });
        }
    } catch (error) { console.error(error); }
  };

  const handleBorrarCategoria = async (id: number) => {
      if(!confirm("¿Borrar categoría?")) return;
      try {
          await fetch(`http://localhost:3000/api/categorias/${id}`, { method: "DELETE" });
          cargarCategorias();
      } catch (error) { console.error(error); }
  };

  const handleBorrarProducto = async (id: number) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await fetch(`http://localhost:3000/api/productos/${id}`, { method: "DELETE" });
      cargarProductos();
      setMensaje({ tipo: 'exito', texto: "Producto eliminado" });
    } catch (error) { alert("Error al borrar"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("tokenAdmin");
    navigate("/admin/login");
  };

  return (
    <div className="admin-body">
      <header className="header-admin">
        <h1>Panel Mielissimo 🐝</h1>
        <button onClick={handleLogout} className="btn-logout">Salir</button>
      </header>

      <div className="admin-container">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <button className={`sidebar-btn ${seccionActiva === 'productos' ? 'active' : ''}`} onClick={() => setSeccionActiva('productos')}>📦 Productos</button>
          <button className={`sidebar-btn ${seccionActiva === 'categorias' ? 'active' : ''}`} onClick={() => setSeccionActiva('categorias')}>🏷️ Categorías</button>
          <button className={`sidebar-btn ${seccionActiva === 'pedidos' ? 'active' : ''}`} onClick={() => setSeccionActiva('pedidos')}>🛒 Pedidos</button>
        </aside>

        {/* CONTENIDO */}
        <main className="admin-content">
          {mensaje && <div className={mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>{mensaje.texto}</div>}

          {/* --- SECCIÓN PRODUCTOS --- */}
          {seccionActiva === "productos" && (
            <section className="admin-section">
              <h2>Nuevo Producto</h2>
              <form onSubmit={handleGuardarProducto} className="form-admin">
                
                {/* Datos Básicos */}
                <div className="form-group">
                    <label>Nombre:</label>
                    <input className="form-input" value={nombre} onChange={e=>setNombre(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Descripción:</label>
                    <textarea className="form-textarea" value={descripcion} onChange={e=>setDescripcion(e.target.value)} />
                </div>
                <div style={{display:'flex', gap:'1rem'}}>
                    <div className="form-group" style={{flex:1}}>
                        <label>Precio ($):</label>
                        <input type="number" className="form-input" value={precio} onChange={e=>setPrecio(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{flex:1}}>
                        <label>Stock Total:</label>
                        <input type="number" className="form-input" value={stock} onChange={e=>setStock(e.target.value)} required />
                    </div>
                </div>

                {/* Multicategoría */}
                <div className="form-group" style={{background:'#f9f9f9', padding:'1rem', borderRadius:'5px'}}>
                    <label>Seleccionar Categorías:</label>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'1rem'}}>
                        {categorias.map(cat => (
                            <label key={cat.id} style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer'}}>
                                <input 
                                    type="checkbox" 
                                    checked={catsSeleccionadas.includes(cat.id)} 
                                    onChange={() => toggleCategoria(cat.id)}
                                />
                                {cat.nombre}
                            </label>
                        ))}
                        {categorias.length === 0 && <small>No hay categorías creadas.</small>}
                    </div>
                </div>

                {/* Variantes Dinámicas */}
                <div className="form-group" style={{border: '1px dashed #ef5579', padding:'1rem', borderRadius:'5px'}}>
                    <label>Variantes (Opcional):</label>
                    <small style={{display:'block', marginBottom:'0.5rem'}}>Ej: Agrega "Sabor" -> "Frutilla" o "Peso" -> "1kg"</small>
                    
                    {variantes.map((v, i) => (
                        <div key={i} style={{display:'flex', gap:'0.5rem', marginBottom:'0.5rem'}}>
                            <input 
                                placeholder="Tipo (Ej: Sabor)" 
                                value={v.tipo} 
                                onChange={e => updateVariante(i, 'tipo', e.target.value)}
                                className="form-input" style={{width:'30%'}}
                            />
                            <input 
                                placeholder="Valor (Ej: Menta)" 
                                value={v.valor} 
                                onChange={e => updateVariante(i, 'valor', e.target.value)}
                                className="form-input" style={{width:'30%'}}
                            />
                             <input 
                                type="number"
                                placeholder="$ Extra" 
                                value={v.precio_extra} 
                                onChange={e => updateVariante(i, 'precio_extra', e.target.value)}
                                className="form-input" style={{width:'20%'}}
                            />
                            <button type="button" onClick={() => quitarFilaVariante(i)} className="btn-delete" style={{fontSize:'1rem'}}>❌</button>
                        </div>
                    ))}
                    <button type="button" onClick={agregarFilaVariante} style={{marginTop:'0.5rem', cursor:'pointer', color:'#ef5579', background:'none', border:'none', fontWeight:'bold'}}>+ Agregar Variante</button>
                </div>

                {/* Extras */}
                <div className="form-group checkbox-group">
                    <input type="checkbox" checked={oferta} onChange={e=>setOferta(e.target.checked)} id="oferta" />
                    <label htmlFor="oferta" style={{margin:0, cursor:'pointer'}}>⭐ Marcar como Oferta</label>
                </div>
                <div className="form-group">
                    <label>Imagen:</label>
                    <input type="file" onChange={e=>setImagen(e.target.files ? e.target.files[0] : null)} />
                </div>

                <button type="submit" className="btn-save">Guardar Producto</button>
              </form>

              {/* LISTA DE PRODUCTOS */}
              <h3>Inventario ({productos.length})</h3>
              <div className="tabla-responsive">
                <table className="tabla-admin">
                  <thead>
                    <tr>
                      <th>Img</th>
                      <th>Producto</th>
                      <th>Categorías</th>
                      <th>Precio</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id}>
                        <td>
                            <img src={`http://localhost:3000/uploads/${p.imagen}`} width="50" style={{borderRadius:'5px'}} 
                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/50')} />
                        </td>
                        <td>
                            {p.nombre}
                            {p.oferta && <span className="badge-oferta">OFERTA</span>}
                        </td>
                        <td><small>{p.categorias_nombres?.join(", ")}</small></td>
                        <td>${p.precio}</td>
                        <td><button className="btn-delete" onClick={() => handleBorrarProducto(p.id)}>🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* --- SECCIÓN CATEGORÍAS --- */}
          {seccionActiva === "categorias" && (
            <section className="admin-section">
              <h2>Gestión de Categorías</h2>
              <form onSubmit={handleCrearCategoria} style={{display:'flex', gap:'1rem', marginBottom:'2rem', maxWidth:'500px'}}>
                  <input 
                    className="form-input" 
                    placeholder="Nueva categoría..." 
                    value={nuevaCategoria}
                    onChange={e => setNuevaCategoria(e.target.value)}
                  />
                  <button type="submit" className="btn-save" style={{width:'auto'}}>Crear</button>
              </form>

              <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                  {categorias.map(cat => (
                      <div key={cat.id} style={{background:'white', padding:'1rem', borderRadius:'5px', boxShadow:'0 2px 5px rgba(0,0,0,0.1)', display:'flex', alignItems:'center', gap:'1rem'}}>
                          <span>{cat.nombre}</span>
                          <button onClick={() => handleBorrarCategoria(cat.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>🗑️</button>
                      </div>
                  ))}
              </div>
            </section>
          )}

          {seccionActiva === "pedidos" && <section className="admin-section"><h2>Pedidos (Próximamente)</h2></section>}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;