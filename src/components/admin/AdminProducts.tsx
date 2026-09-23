import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const empty = {
  name: "", description: "", price: 0, category: "Fries", is_veg: true,
  image_url: "", stock: 0, bestseller: false, is_active: true, size: "",
};

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const { categories, addCategory } = useCategories();
  const [newCat, setNewCat] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [addingCat, setAddingCat] = useState(false);

  const createCategory = async () => {
    setAddingCat(true);
    const { error } = await addCategory(newCat);
    setAddingCat(false);
    if (error) return toast.error(error);
    setForm((f: any) => ({ ...f, category: newCat.trim() }));
    toast.success(`Category "${newCat.trim()}" added`);
    setNewCat("");
    setShowNewCat(false);
  };

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("category").order("name");
    setProducts((data || []) as Product[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setImgFile(null); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ ...p, description: p.description || "", image_url: p.image_url || "", size: p.size || "" }); setImgFile(null); setOpen(true); };

  const save = async () => {
    if (!form.name?.trim()) return toast.error("Name required");
    if (form.price < 0) return toast.error("Invalid price");
    setSaving(true);

    let image_url = form.image_url;
    if (imgFile) {
      const path = `${Date.now()}-${imgFile.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, imgFile);
      if (upErr) { setSaving(false); return toast.error(upErr.message); }
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      image_url = pub.publicUrl;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      price: Number(form.price),
      category: form.category,
      is_veg: form.is_veg,
      image_url: image_url || null,
      stock: Number(form.stock),
      bestseller: form.bestseller,
      is_active: form.is_active,
      size: form.size?.trim() || null,
    };

    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Product updated" : "Product added");
    setOpen(false);
    load();
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground">{products.length} products</p>
        <Button onClick={openNew} className="rounded-full"><Plus className="w-4 h-4 mr-2" />Add Product</Button>
      </div>
      <div className="grid gap-3">
        {products.map(p => (
          <div key={p.id} className="gradient-card rounded-xl p-4 shadow-soft flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden grid place-items-center text-2xl shrink-0">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : "🍴"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-3 h-3 border ${p.is_veg ? "border-veg" : "border-nonveg"} rounded-sm grid place-items-center`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.is_veg ? "bg-veg" : "bg-nonveg"}`} />
                </span>
                <span className="font-semibold truncate">{p.name}</span>
                {p.bestseller && <Badge variant="secondary" className="gap-1"><Flame className="w-3 h-3" />Best</Badge>}
                {!p.is_active && <Badge variant="outline">Hidden</Badge>}
                {p.stock === 0 && <Badge className="bg-destructive text-destructive-foreground">Out</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{p.category} • ₹{Number(p.price).toFixed(0)} • Stock: {p.stock}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => del(p)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Size (optional)</Label><Input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="500ml, Large..." /></div>
            </div>
            <div>
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={e => setImgFile(e.target.files?.[0] || null)} />
              {form.image_url && !imgFile && <img src={form.image_url} alt="" className="w-20 h-20 mt-2 rounded object-cover" />}
            </div>
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2"><Switch checked={form.is_veg} onCheckedChange={v => setForm({ ...form, is_veg: v })} />Veg</label>
              <label className="flex items-center gap-2"><Switch checked={form.bestseller} onCheckedChange={v => setForm({ ...form, bestseller: v })} />Bestseller</label>
              <label className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
