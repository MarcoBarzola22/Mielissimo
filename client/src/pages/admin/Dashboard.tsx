import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/services/api";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- COMPONENTS SECTIONS ---

// 1. CATEGORIES MANAGER
const CategoriesManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState({ nombre: "", emoji: "" });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);

  const fetchCats = async () => {
    try {
      const { data } = await api.get("/categorias");
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchCats(); }, []);

  const handleCreate = async () => {
    try {
      await api.post("/categorias", newCat);
      toast.success("Categoría creada");
      setNewCat({ nombre: "", emoji: "" });
      fetchCats();
    } catch (e) { toast.error("Error al crear"); }
  };

  const handleUpdate = async () => {
    if (!editCat) return;
    try {
      await api.put(`/categorias/${editCat.id}`, editCat);
      toast.success("Categoría actualizada");
      setIsEditOpen(false);
      setEditCat(null);
      fetchCats();
    } catch (e) { toast.error("Error al actualizar"); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categorias/${id}`);
      toast.success("Categoría eliminada");
      fetchCats();
    } catch (e: any) {
      if (e.response?.data?.products) {
        toast.error(`No se puede borrar. Productos asociados: ${e.response.data.products.join(", ")}`);
      } else {
        toast.error("Error al eliminar");
      }
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Categorías</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nombre"
            value={newCat.nombre}
            onChange={e => setNewCat({ ...newCat, nombre: e.target.value })}
          />
          <Input
            placeholder="Emoji"
            className="w-20"
            value={newCat.emoji}
            onChange={e => setNewCat({ ...newCat, emoji: e.target.value })}
          />
          <Button onClick={handleCreate}><Plus className="w-4 h-4" /></Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nombre</TableHead><TableHead>Emoji</TableHead><TableHead>Acciones</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.nombre}</TableCell>
                <TableCell>{c.emoji}</TableCell>
                <TableCell className="flex gap-2">
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditCat(c)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Categoría</DialogTitle>
                        <DialogDescription>Modifica el nombre y emoji de la categoría.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          value={editCat?.nombre || ''}
                          onChange={e => setEditCat({ ...editCat, nombre: e.target.value })}
                          placeholder="Nombre"
                        />
                        <Input
                          value={editCat?.emoji || ''}
                          onChange={e => setEditCat({ ...editCat, emoji: e.target.value })}
                          placeholder="Emoji"
                        />
                        <Button onClick={handleUpdate} className="w-full">Guardar Cambios</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// 2. PRODUCTS MANAGER
const ProductsManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    base_price: "",    // Input for regular price
    offer_price: "",   // Input for offer price
    is_offer: false,
    categories: [],
    variants: [],
    image: null
  });
  const [variantInput, setVariantInput] = useState({ name: "", price: "" });

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (e) { console.error(e) }
  };
  const fetchCats = async () => {
    try {
      const { data } = await api.get("/categorias");
      setCategories(data);
    } catch (e) { console.error(e) }
  };

  useEffect(() => { fetchProducts(); fetchCats(); }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addVariant = () => {
    if (!variantInput.name || !variantInput.price) return;
    setFormData((prev: any) => ({
      ...prev,
      variants: [...prev.variants, { name: variantInput.name, price: Number(variantInput.price) }]
    }));
    setVariantInput({ name: "", price: "" });
  };

  const removeVariant = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      variants: prev.variants.filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("is_offer", formData.is_offer ? "true" : "false");
    data.append("categories", JSON.stringify(formData.categories));
    data.append("variants", JSON.stringify(formData.variants));

    // --- Pricing Logic ---
    // If Offer is ON: Final Price = offer_price, Old Price = base_price
    // If Offer is OFF: Final Price = base_price, Old Price = null (or 0)
    let finalPrice = formData.base_price;
    let oldPrice = "";

    if (formData.is_offer) {
      finalPrice = formData.offer_price;
      oldPrice = formData.base_price;
    }

    data.append("price", finalPrice);
    data.append("old_price", oldPrice);

    if (formData.image) data.append("image", formData.image);

    try {
      await api.post("/products", data);
      toast.success("Producto creado");
      setIsDialogOpen(false);
      setFormData({
        name: "", description: "", base_price: "", offer_price: "",
        is_offer: false, categories: [], variants: [], image: null
      });
      fetchProducts();
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar producto");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Eliminado");
      fetchProducts();
    } catch (e) { toast.error("Error al eliminar"); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Productos</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nuevo Producto</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Producto</DialogTitle>
              <DialogDescription>Completa la información del producto.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input value={formData.name} onChange={e => handleChange("name", e.target.value)} required />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea value={formData.description} onChange={e => handleChange("description", e.target.value)} />
              </div>
              <div>
                <Label>Imagen</Label>
                <Input type="file" onChange={e => handleChange("image", e.target.files?.[0])} accept="image/*" />
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-gray-50">
                <div>
                  <Label>Precio Original (Base)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.base_price}
                    onChange={e => handleChange("base_price", e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center space-x-2 my-auto">
                    <Switch checked={formData.is_offer} onCheckedChange={c => handleChange("is_offer", c)} />
                    <Label>¿Es Oferta?</Label>
                  </div>
                </div>

                {formData.is_offer && (
                  <div className="col-span-2">
                    <Label className="text-red-600 font-bold">Precio de Oferta</Label>
                    <Input
                      type="number"
                      className="border-red-200 bg-red-50"
                      placeholder="0.00"
                      value={formData.offer_price}
                      onChange={e => handleChange("offer_price", e.target.value)}
                      required={formData.is_offer}
                    />
                    <p className="text-xs text-muted-foreground mt-1">El precio original aparecerá tachado.</p>
                  </div>
                )}
              </div>

              <div>
                <Label>Categorías</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        const current = formData.categories.includes(c.id);
                        const newCats = current
                          ? formData.categories.filter((id: number) => id !== c.id)
                          : [...formData.categories, c.id];
                        handleChange("categories", newCats);
                      }}
                      className={`cursor-pointer px-3 py-1 rounded-full border ${formData.categories.includes(c.id) ? "bg-primary text-white" : "bg-secondary"}`}
                    >
                      {c.emoji} {c.nombre}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border p-4 rounded bg-secondary/20">
                <Label>Variantes (Opcional)</Label>
                <div className="flex gap-2 my-2">
                  <Input placeholder="Ej: 100g / Unidad" value={variantInput.name} onChange={e => setVariantInput({ ...variantInput, name: e.target.value })} />
                  <Input type="number" placeholder="Precio ($)" value={variantInput.price} onChange={e => setVariantInput({ ...variantInput, price: e.target.value })} />
                  <Button type="button" onClick={addVariant} variant="outline">Agregar</Button>
                </div>
                <ul className="space-y-1">
                  {formData.variants.map((v: any, idx: number) => (
                    <li key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                      <span>{v.name} - ${v.price}</span>
                      <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => removeVariant(idx)}>X</Button>
                    </li>
                  ))}
                </ul>
              </div>

              <Button type="submit" className="w-full">Guardar Producto</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Imagen</TableHead><TableHead>Nombre</TableHead><TableHead>Precio</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <img src={`http://localhost:3000${p.image}`} className="w-10 h-10 object-cover rounded" onError={(e) => (e.currentTarget.src = '/placeholder.png')} />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.variants?.length > 0 ? `${p.variants.length} variantes` : 'Sin variantes'}</div>
                </TableCell>
                <TableCell>
                  <div>${p.price?.toLocaleString()}</div>
                  {p.is_offer && <span className="text-xs text-red-500 line-through">${p.old_price?.toLocaleString()}</span>}
                </TableCell>
                <TableCell>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// 3. ORDERS SEARCH
const OrdersSearch = () => {
  const [searchId, setSearchId] = useState("");
  const [order, setOrder] = useState<any>(null);

  const handleSearch = async () => {
    try {
      const { data } = await api.get(`/orders/${searchId}`);
      setOrder(data);
    } catch (e) {
      toast.error("Pedido no encontrado");
      setOrder(null);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Buscador de Pedidos</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-2 max-w-sm mb-6">
          <Input placeholder="ID de Pedido (ej: PED-12345)" value={searchId} onChange={e => setSearchId(e.target.value)} />
          <Button onClick={handleSearch}><Search className="w-4 h-4" /></Button>
        </div>

        {order && (
          <div className="border p-4 rounded-lg bg-secondary/10">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">Orden {order.id}</h3>
              <span className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Método</p>
                <p className="font-medium">
                  {order.delivery_method === 'delivery' ? `Envío (${order.delivery_zone})` : 'Retiro en Local'}
                </p>
              </div>
            </div>
            <Separator />
            <div className="py-2 space-y-2">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.cantidad}x {item.nombre} {item.varianteSeleccionada && `(${item.varianteSeleccionada.tipo}: ${item.varianteSeleccionada.valor})`}</span>
                  <span>${(item.cantidad * item.finalPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>${order.total.toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] w-full bg-border ${className}`} />
}

// MAIN DASHBOARD
const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("tokenAdmin")) {
      navigate("/admin/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <Button variant="outline" onClick={() => {
          localStorage.removeItem("tokenAdmin");
          navigate("/admin/login");
        }}>Cerrar Sesión</Button>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="products"><ProductsManager /></TabsContent>
          <TabsContent value="categories"><CategoriesManager /></TabsContent>
          <TabsContent value="orders"><OrdersSearch /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Dashboard;