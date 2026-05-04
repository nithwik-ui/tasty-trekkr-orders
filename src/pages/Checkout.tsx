import { useState } from "react";
import { z } from "zod";
import { useCart } from "@/context/CartContext";
import { useShopSettings } from "@/hooks/useShopSettings";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Invalid phone"),
  address: z.string().trim().min(5, "Address too short").max(300),
  notes: z.string().max(300).optional(),
});

const Checkout = () => {
  const { items, total, clear } = useCart();
  const { settings } = useShopSettings();
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [location, setLocation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [closedDialog, setClosedDialog] = useState(false);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen gradient-warm">
        <Header />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Cart is empty.</p>
          <Button onClick={() => navigate("/")} className="mt-4">Back to Menu</Button>
        </div>
      </div>
    );
  }

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`);
        toast.success("Location captured");
      },
      () => toast.error("Could not get location")
    );
  };

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const closed = settings.shop_status === "CLOSED";
    const orderItems = items.map(i => ({ id: i.product.id, name: i.product.name, qty: i.qty, price: Number(i.product.price) }));

    const { error } = await supabase.from("orders").insert({
      customer_name: parsed.data.name,
      customer_phone: parsed.data.phone,
      customer_address: parsed.data.address,
      notes: parsed.data.notes || null,
      location: location || null,
      items: orderItems,
      total,
      attempted_while_closed: closed,
      status: closed ? "blocked_shop_closed" : "pending",
    });

    setLoading(false);
    if (error) { toast.error(error.message); return; }

    if (closed) {
      setClosedDialog(true);
      return;
    }

    // Build WhatsApp deep link
    const lines = [
      `*New Order — Tasty Trekkrs*`,
      ``,
      `*Name:* ${parsed.data.name}`,
      `*Phone:* ${parsed.data.phone}`,
      `*Address:* ${parsed.data.address}`,
      location ? `*Location:* https://maps.google.com/?q=${location}` : null,
      parsed.data.notes ? `*Notes:* ${parsed.data.notes}` : null,
      ``,
      `*Items:*`,
      ...orderItems.map(i => `• ${i.name} × ${i.qty} = ₹${(i.price * i.qty).toFixed(0)}`),
      ``,
      `*Total: ₹${total.toFixed(0)}*`,
    ].filter(Boolean).join("\n");

    const num = (settings.whatsapp_number || "").replace(/\D/g, "");
    const url = `https://wa.me/${num}?text=${encodeURIComponent(lines)}`;

    clear();
    toast.success("Opening WhatsApp...");
    window.open(url, "_blank");
    setTimeout(() => navigate("/"), 800);
  };

  return (
    <div className="min-h-screen gradient-warm pb-12">
      <Header />
      <div className="container max-w-xl py-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Checkout</h2>
        <div className="gradient-card rounded-2xl p-5 shadow-soft space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea id="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1" rows={3} />
          </div>
          <Button type="button" variant="outline" onClick={getLocation} className="w-full rounded-full">
            <MapPin className="w-4 h-4 mr-2" />
            {location ? "Location captured ✓" : "Use my GPS location"}
          </Button>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} placeholder="Less spicy, no onions..." />
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-medium">Total</span>
            <span className="font-bold text-primary text-2xl">₹{total.toFixed(0)}</span>
          </div>
          <Button
            onClick={submit}
            disabled={loading || settings.shop_status === "CLOSED"}
            className="w-full rounded-full h-12 text-base font-semibold gradient-hero"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {settings.shop_status === "CLOSED" ? "🚫 Shop Closed" : "Place Order via WhatsApp"}
          </Button>
        </div>
      </div>

      <Dialog open={closedDialog} onOpenChange={(o) => { setClosedDialog(o); if (!o) navigate("/"); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🚫 Shop is currently closed</DialogTitle>
            <DialogDescription>
              Sorry, we can't accept orders right now. We've notified the admin that you tried to order — please come back during opening hours.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setClosedDialog(false); navigate("/"); }}>Back to Menu</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
