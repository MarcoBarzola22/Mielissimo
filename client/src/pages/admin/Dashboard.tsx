import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin.css";

interface Variante {
  tipo: string;
  valor: string;
  precio_extra: number;
}

interface Categoria {
  id: number;
  nombre: string;
  cantidad_productos?: number;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  precio_oferta?: string; // Nuevo
  stock: number;
  imagen: string;
  activo: boolean;
  oferta: boolean;
  categorias_ids?: number[]; // Para saber cuáles marcar
  categorias_nombres?: string[];
  variantes?: Variante[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("tokenAdmin");
  
  // --- ESTADOS DE NAVEGACIÓN ---
  const [seccionActiva, setSeccionActiva] = useState<"productos" | "categorias" | "pedidos">("productos");
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // --- DATOS ---
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // --- ESTADOS FORMULARIO PRODUCTO ---
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoIdEditar, setProductoIdEditar] = useState<number | null>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioOferta, setPrecioOferta] = useState(""); // Nuevo
  const [oferta, setOferta] = useState(false);
  const [imagen, setImagen] = useState<File | null>(null);
  const [catsSeleccionadas, setCatsSeleccionadas] = useState<number[]>([]);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  
  // Buscador de Categorías (UX)
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // --- ESTADOS CATEGORÍAS ---
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [catIdEditar, setCatIdEditar] = useState<number | null>(null); // ID de cat que se está editando

  // --- INICIO ---
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
      if(Array.isArray(data)) setProductos(data);
    } catch (error) { console.error(error); }
  };

  const cargarCategorias = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/categorias");
      const data = await res.json();
      if(Array.isArray(data)) setCategorias(data);
    } catch (error) { console.error(error); }
  };

  // --- FUNCIONES FORMULARIO PRODUCTO ---
  
  const iniciarEdicion = (prod: Producto) => {
    setModoEdicion(true);
    setProductoIdEditar(prod.id);
    setNombre(prod.nombre);
    setDescripcion(prod.descripcion || "");
    setPrecio(prod.precio);
    setPrecioOferta(prod.precio_oferta || "");
    setOferta(prod.oferta);
    setCatsSeleccionadas(prod.categorias_ids || []);
    setVariantes(prod.variantes || []);
    setImagen(null); // Reset input file
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir para ver formulario
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setProductoIdEditar(null);
  };

  const limpiarFormulario = () => {
    setNombre(""); setDescripcion(""); setPrecio(""); setPrecioOferta(""); 
    setOferta(false); setImagen(null); setCatsSeleccionadas([]); setVariantes([]);
  };

  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    // Solo enviamos precio oferta si está marcado como oferta
    if(oferta) formData.append("precio_oferta", precioOferta);
    formData.append("oferta", oferta ? "true" : "false");
    
    if (imagen) formData.append("imagen", imagen);
    formData.append("categorias", JSON.stringify(catsSeleccionadas));
    formData.append("variantes", JSON.stringify(variantes));

    const url = modoEdicion 
        ? `http://localhost:3000/api/productos/${productoIdEditar}`
        : "http://localhost:3000/api/productos";
    
    const method = modoEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setMensaje({ tipo: 'exito', texto: modoEdicion ? "✅ Producto Actualizado" : "✅ Producto Creado" });
        cancelarEdicion(); // Limpia y sale del modo edición
        cargarProductos();
      } else {
        const err = await res.json();
        setMensaje({ tipo: 'error', texto: "❌ Error: " + err.error });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: "❌ Error de conexión" });
    }
  };

  // --- VARIANTES ---
  const agregarFilaVariante = () => setVariantes([...variantes, { tipo: "Sabor", valor: "", precio_extra: 0 }]);
  const quitarFilaVariante = (index: number) => {
    const n = [...variantes]; n.splice(index, 1); setVariantes(n);
  };
  const updateVariante = (index: number, field: keyof Variante, val: any) => {
    const n = [...variantes]; 
    // @ts-ignore
    n[index][field] = val; 
    setVariantes(n);
  };

  // --- CATEGORÍAS (CRUD) ---
  const handleGuardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!nuevaCategoria) return;

    // Si hay un ID en edición, hacemos UPDATE, si no, CREATE
    const url = catIdEditar 
        ? `http://localhost:3000/api/categorias/${catIdEditar}`
        : "http://localhost:3000/api/categorias";
    const method = catIdEditar ? "PUT" : "POST";

    try {
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ nombre: nuevaCategoria })
        });
        setNuevaCategoria("");
        setCatIdEditar(null);
        cargarCategorias();
    } catch (error) { console.error(error); }
  };

  const iniciarEdicionCategoria = (cat: Categoria) => {
      setNuevaCategoria(cat.nombre);
      setCatIdEditar(cat.id);
  };

  const cancelarEdicionCategoria = () => {
      setNuevaCategoria("");
      setCatIdEditar(null);
  };

  const handleBorrarCategoria = async (id: number) => {
      if(!confirm("¿Borrar categoría?")) return;
      const res = await fetch(`http://localhost:3000/api/categorias/${id}`, { method: "DELETE" });
      if(!res.ok) {
          const err = await res.json();
          alert(err.error); // Muestra mensaje si tiene productos
      } else {
          cargarCategorias();
      }
  };

  // --- BORRAR PRODUCTO ---
  const handleBorrarProducto = async (id: number) => {
    if (!confirm("¿Eliminar producto definitivamente?")) return;
    await fetch(`http://localhost:3000/api/productos/${id}`, { method: "DELETE" });
    cargarProductos();
  };

  const handleLogout = () => { localStorage.removeItem("tokenAdmin"); navigate("/admin/login"); };

  return (
    <div className="admin-body">
      <header className="header-admin">
        <h1>Panel Mielissimo 🐝</h1>
        <button onClick={handleLogout} className="btn-logout">Salir</button>
      </header>

      <div className="admin-container">
        <aside className="admin-sidebar">
          <button className={`sidebar-btn ${seccionActiva === 'productos' ? 'active' : ''}`} onClick={() => setSeccionActiva('productos')}>📦 Productos</button>
          <button className={`sidebar-btn ${seccionActiva === 'categorias' ? 'active' : ''}`} onClick={() => setSeccionActiva('categorias')}>🏷️ Categorías</button>
          <button className={`sidebar-btn ${seccionActiva === 'pedidos' ? 'active' : ''}`} onClick={() => setSeccionActiva('pedidos')}>🛒 Pedidos</button>
        </aside>

        <main className="admin-content">
          {mensaje && <div className={mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>{mensaje.texto}</div>}

          {/* --- VISTA PRODUCTOS --- */}
          {seccionActiva === "productos" && (
            <section className="admin-section">
              <h2>{modoEdicion ? "✏️ Editando Producto" : "➕ Nuevo Producto"}</h2>
              
              <form onSubmit={handleGuardarProducto} className="form-admin">
                <div className="form-group">
                    <label>Nombre:</label>
                    <input className="form-input" value={nombre} onChange={e=>setNombre(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Descripción (Opcional):</label>
                    <textarea className="form-textarea" value={descripcion} onChange={e=>setDescripcion(e.target.value)} />
                </div>
                
                <div style={{display:'flex', gap:'1rem'}}>
                    <div className="form-group" style={{flex:1}}>
                        <label>Precio Normal ($):</label>
                        <input type="number" className="form-input" value={precio} onChange={e=>setPrecio(e.target.value)} required />
                    </div>
                    {/* INPUT PRECIO OFERTA (Solo si es oferta) */}
                    {oferta && (
                        <div className="form-group" style={{flex:1}}>
                            <label style={{color:'#ef5579'}}>🔥 Precio Oferta ($):</label>
                            <input type="number" className="form-input" value={precioOferta} onChange={e=>setPrecioOferta(e.target.value)} required={oferta} />
                        </div>
                    )}
                </div>

                {/* SELECTOR CATEGORÍAS MEJORADO (Scroll + Buscador) */}
                <div className="form-group" style={{background:'#f9f9f9', padding:'1rem', borderRadius:'5px'}}>
                    <label>Categorías:</label>
                    <input 
                        placeholder="Buscar categoría..." 
                        className="form-input" 
                        style={{marginBottom:'0.5rem', fontSize:'0.9rem', padding:'0.4rem'}}
                        value={filtroCategoria}
                        onChange={e => setFiltroCategoria(e.target.value.toLowerCase())}
                    />
                    <div style={{maxHeight:'150px', overflowY:'auto', display:'flex', flexWrap:'wrap', gap:'10px', border:'1px solid #ddd', padding:'10px', background:'white'}}>
                        {categorias
                            .filter(c => c.nombre.toLowerCase().includes(filtroCategoria))
                            .map(cat => (
                            <label key={cat.id} style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', background:'#eee', padding:'2px 8px', borderRadius:'15px', fontSize:'0.9rem'}}>
                                <input 
                                    type="checkbox" 
                                    checked={catsSeleccionadas.includes(cat.id)} 
                                    onChange={() => {
                                        if(catsSeleccionadas.includes(cat.id)) setCatsSeleccionadas(catsSeleccionadas.filter(id => id !== cat.id));
                                        else setCatsSeleccionadas([...catsSeleccionadas, cat.id]);
                                    }}
                                />
                                {cat.nombre}
                            </label>
                        ))}
                    </div>
                </div>

                {/* VARIANTES */}
                <div className="form-group" style={{border: '1px dashed #ef5579', padding:'1rem', borderRadius:'5px'}}>
                    <label>Variantes (Opcional):</label>
                    <small style={{display:'block', marginBottom:'0.5rem'}}>Ej: Sabor - Frutilla / Tamaño - Grande</small>
                    {variantes.map((v, i) => (
                        <div key={i} style={{display:'flex', gap:'0.5rem', marginBottom:'0.5rem'}}>
                            <input placeholder="Tipo" value={v.tipo} onChange={e => updateVariante(i, 'tipo', e.target.value)} className="form-input" style={{width:'30%'}} />
                            <input placeholder="Valor" value={v.valor} onChange={e => updateVariante(i, 'valor', e.target.value)} className="form-input" style={{width:'30%'}} />
                            <input type="number" placeholder="$ Extra" value={v.precio_extra} onChange={e => updateVariante(i, 'precio_extra', e.target.value)} className="form-input" style={{width:'20%'}} />
                            <button type="button" onClick={() => quitarFilaVariante(i)} className="btn-delete">❌</button>
                        </div>
                    ))}
                    <button type="button" onClick={agregarFilaVariante} style={{marginTop:'0.5rem', cursor:'pointer', color:'#ef5579', background:'none', border:'none', fontWeight:'bold'}}>+ Agregar Variante</button>
                </div>

                <div className="form-group checkbox-group">
                    <input type="checkbox" checked={oferta} onChange={e=>setOferta(e.target.checked)} id="oferta" />
                    <label htmlFor="oferta" style={{margin:0, cursor:'pointer'}}>⭐ ¿Es una Oferta?</label>
                </div>

                <div className="form-group">
                    <label>Imagen:</label>
                    <input type="file" onChange={e=>setImagen(e.target.files ? e.target.files[0] : null)} />
                </div>

                <div style={{display:'flex', gap:'10px'}}>
                    <button type="submit" className="btn-save">{modoEdicion ? "Actualizar Producto" : "Guardar Producto"}</button>
                    {modoEdicion && <button type="button" onClick={cancelarEdicion} style={{padding:'1rem', background:'#666', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Cancelar</button>}
                </div>
              </form>

              <h3>Inventario</h3>
              <div className="tabla-responsive">
                <table className="tabla-admin">
                  <thead><tr><th>Img</th><th>Producto</th><th>$ Real</th><th>Cat</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id}>
                        <td><img src={`http://localhost:3000/uploads/${p.imagen}`} width="50" onError={(e)=>(e.currentTarget.src='https://placehold.co/50')} /></td>
                        <td>
                            {p.nombre} {p.oferta && <span className="badge-oferta">OFERTA</span>}
                            <br/><small style={{color:'#888'}}>{p.variantes?.length ? `${p.variantes.length} variantes` : ''}</small>
                        </td>
                        <td>
                            {p.oferta ? (
                                <>
                                    <span style={{textDecoration:'line-through', color:'#999'}}>${p.precio}</span> 
                                    <br/> 
                                    <strong style={{color:'#ef5579'}}>${p.precio_oferta}</strong>
                                </>
                            ) : `$${p.precio}`}
                        </td>
                        <td><small>{p.categorias_nombres?.join(", ")}</small></td>
                        <td>
                            <div className="acciones-btn">
                                <button className="btn-edit" onClick={() => iniciarEdicion(p)}>✏️</button>
                                <button className="btn-delete" onClick={() => handleBorrarProducto(p.id)}>🗑️</button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* --- VISTA CATEGORÍAS --- */}
          {seccionActiva === "categorias" && (
            <section className="admin-section">
              <h2>Gestión de Categorías</h2>
              <form onSubmit={handleGuardarCategoria} style={{display:'flex', gap:'1rem', marginBottom:'2rem', maxWidth:'500px'}}>
                  <input className="form-input" placeholder="Nombre categoría..." value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} required />
                  <button type="submit" className="btn-save" style={{width:'auto'}}>{catIdEditar ? "Actualizar" : "Crear"}</button>
                  {catIdEditar && <button type="button" onClick={cancelarEdicionCategoria} style={{background:'#666', color:'white', border:'none', borderRadius:'5px', padding:'0 1rem', cursor:'pointer'}}>X</button>}
              </form>

              <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                  {categorias.map(cat => (
                      <div key={cat.id} style={{background:'white', padding:'10px 20px', borderRadius:'8px', boxShadow:'0 2px 5px rgba(0,0,0,0.1)', display:'flex', alignItems:'center', gap:'15px'}}>
                          <div>
                              <strong>{cat.nombre}</strong>
                              <br/><small style={{color:'#888'}}>{cat.cantidad_productos} prods</small>
                          </div>
                          <div>
                              <button onClick={() => iniciarEdicionCategoria(cat)} style={{color:'#333', marginRight:'10px', background:'none', border:'none', cursor:'pointer'}}>✏️</button>
                              <button onClick={() => handleBorrarCategoria(cat.id)} style={{color:'red', background:'none', border:'none', cursor:'pointer'}}>🗑️</button>
                          </div>
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