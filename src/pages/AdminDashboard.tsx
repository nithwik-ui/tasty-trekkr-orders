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
  const [userId, setUserId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/admin/auth"); return; }
    setUserId(session.user.id);
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin/auth");
    });
    refresh();
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const claimAdmin = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) return toast.error(error.message);
    if (data) { toast.success("You are now admin!"); refresh(); }
    else toast.error("An admin already exists. Ask them to grant you access.");
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate("/admin/auth"); };

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen gradient-warm grid place-items-center p-4">
        <div className="max-w-md gradient-card rounded-3xl shadow-warm p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">No admin access</h2>
          <p className="text-muted-foreground mb-6">
            If you're the first user, claim admin now. Otherwise ask an existing admin to grant you access.
          </p>
          <div className="space-y-3">
            <Button onClick={claimAdmin} disabled={claiming} className="w-full rounded-full gradient-hero">
              {claiming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Claim Admin (first user only)
            </Button>
            <Button variant="outline" onClick={signOut} className="w-full rounded-full">Sign out</Button>
            <Link to="/" className="block">
              <Button variant="ghost" className="w-full rounded-full"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">User ID: {userId?.slice(0, 8)}...</p>
        </div>
      </div>
    );
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
