import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes: string | null;
  location: string | null;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: string;
  attempted_while_closed: boolean;
  created_at: string;
}

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
      setOrders((data || []) as Order[]);
      setLoading(false);
    };
    load();
    const channel = supabase.channel("orders_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return <Loader2 className="animate-spin" />;
  if (orders.length === 0) return <p className="text-muted-foreground text-center py-12">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map(o => (
        <div key={o.id} className={`gradient-card rounded-2xl p-5 shadow-soft border-l-4 ${o.attempted_while_closed ? "border-destructive" : "border-primary"}`}>
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold">{o.customer_name}</h4>
                <Badge variant="outline">{o.customer_phone}</Badge>
                {o.attempted_while_closed && (
                  <Badge className="bg-destructive text-destructive-foreground gap-1">
                    <AlertTriangle className="w-3 h-3" /> Tried while closed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{o.customer_address}</p>
              {o.location && <a className="text-xs text-primary underline" target="_blank" rel="noreferrer" href={`https://maps.google.com/?q=${o.location}`}>View on map</a>}
              {o.notes && <p className="text-sm mt-1"><span className="font-medium">Notes:</span> {o.notes}</p>}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">₹{Number(o.total).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
            {o.items.map((it, i) => (
              <span key={i} className="text-sm bg-muted rounded-full px-3 py-1">{it.name} × {it.qty}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
