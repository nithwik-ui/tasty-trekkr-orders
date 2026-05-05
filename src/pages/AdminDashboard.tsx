import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, LogOut, Package, ShoppingBag, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminSettings } from "@/components/admin/AdminSettings";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const check = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/admin/auth", { replace: true }); return; }
    const { data, error } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
    if (error) toast.error(error.message);
    if (!data) {
      toast.error("Access denied. Admins only.");
      await supabase.auth.signOut();
      navigate("/admin/auth", { replace: true });
      return;
    }
    setIsAdmin(true);
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin/auth", { replace: true });
    });
    check();
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => { await supabase.auth.signOut(); navigate("/admin/auth"); };

  if (loading || !isAdmin) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen gradient-warm">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="container flex justify-between items-center py-4">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Tasty Trekkrs</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="ghost" size="sm" className="rounded-full"><ArrowLeft className="w-4 h-4 mr-2" />Home</Button></Link>
            <Button variant="outline" size="sm" onClick={signOut} className="rounded-full">
              <LogOut className="w-4 h-4 mr-2" />Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders"><ShoppingBag className="w-4 h-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="products"><Package className="w-4 h-4 mr-2" />Products</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4 mr-2" />Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="products"><AdminProducts /></TabsContent>
          <TabsContent value="settings"><AdminSettings /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
