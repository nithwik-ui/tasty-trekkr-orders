import { Link, useLocation } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useShopSettings } from "@/hooks/useShopSettings";

export const Header = () => {
  const { settings } = useShopSettings();
  const open = settings.shop_status === "OPEN";
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-30 backdrop-blur-lg bg-background/80 border-b border-border/50">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-hero grid place-items-center shadow-warm">
            <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">Tasty Trekkrs</h1>
            <p className="text-xs text-muted-foreground">Fresh • Fast • Flavorful</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`gap-1.5 ${open ? "border-success text-success" : "border-destructive text-destructive"}`}>
            <span className={`w-2 h-2 rounded-full ${open ? "bg-success animate-pulse" : "bg-destructive"}`} />
            {open ? "Open" : "Closed"}
          </Badge>
          {loc.pathname !== "/admin" && (
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-smooth hidden sm:inline">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};
