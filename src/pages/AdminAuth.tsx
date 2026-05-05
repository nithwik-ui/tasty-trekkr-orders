import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, UtensilsCrossed } from "lucide-react";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: data.session.user.id, _role: "admin",
      });
      if (isAdmin) navigate("/admin", { replace: true });
      else await supabase.auth.signOut();
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }

    const { data: isAdmin, error: rerr } = await supabase.rpc("has_role", {
      _user_id: data.user.id, _role: "admin",
    });
    if (rerr || !isAdmin) {
      await supabase.auth.signOut();
      toast.error("Access denied. Admins only.");
      setLoading(false);
      return;
    }
    toast.success("Welcome back, admin!");
    navigate("/admin", { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-warm grid place-items-center p-4">
      <div className="w-full max-w-md gradient-card rounded-3xl shadow-warm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-hero grid place-items-center shadow-warm mb-3">
            <UtensilsCrossed className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">Tasty Trekkrs Dashboard</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full h-11 gradient-hero font-semibold">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>
        </form>
        <Link to="/" className="block mt-4">
          <Button variant="ghost" className="w-full rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminAuth;
