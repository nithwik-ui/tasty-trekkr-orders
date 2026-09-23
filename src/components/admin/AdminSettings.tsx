import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const AdminSettings = () => {
  const [shopOpen, setShopOpen] = useState(true);
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) {
        setShopOpen(data.shop_status === "OPEN");
        setWhatsapp(data.whatsapp_number || "");
      }
      setLoading(false);
    });
  }, []);

  const toggleShop = async (v: boolean) => {
    setShopOpen(v);
    const { error } = await supabase.from("settings").update({ shop_status: v ? "OPEN" : "CLOSED" }).eq("id", 1);
    if (error) { toast.error(error.message); setShopOpen(!v); }
    else toast.success(`Shop is now ${v ? "OPEN" : "CLOSED"}`);
  };

  const saveWhatsapp = async () => {
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      toast.error("Enter the number with country code, e.g. 919876543210");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("settings")
      .update({ whatsapp_number: digits })
      .eq("id", 1)
      .select("whatsapp_number")
      .maybeSingle();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    if (!data) { toast.error("Could not save — please sign in again as admin."); return; }
    setWhatsapp(data.whatsapp_number);
    toast.success("WhatsApp number saved");
  };

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-6 max-w-xl">
      <div className="gradient-card rounded-2xl p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Shop Status</h3>
            <p className="text-sm text-muted-foreground">When closed, orders are blocked and admin gets notified.</p>
          </div>
          <Switch checked={shopOpen} onCheckedChange={toggleShop} />
        </div>
        <div className={`mt-4 px-4 py-2 rounded-full inline-flex items-center gap-2 font-medium ${shopOpen ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          <span className={`w-2 h-2 rounded-full ${shopOpen ? "bg-success animate-pulse" : "bg-destructive"}`} />
          {shopOpen ? "Shop is OPEN" : "Shop is CLOSED"}
        </div>
      </div>

      <div className="gradient-card rounded-2xl p-6 shadow-soft">
        <h3 className="font-bold text-lg mb-1">WhatsApp Number</h3>
        <p className="text-sm text-muted-foreground mb-4">Orders will be sent to this number. Use international format: 919876543210</p>
        <div className="flex gap-2">
          <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="919876543210" />
          <Button onClick={saveWhatsapp} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button>
        </div>
      </div>
    </div>
  );
};
