import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, Product } from "@/types";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { FloatingCart } from "@/components/FloatingCart";
import { useShopSettings } from "@/hooks/useShopSettings";
import heroImg from "@/assets/hero-food.jpg";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState<string>("All");
  const [q, setQ] = useState("");
  const { settings } = useShopSettings();

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).order("category").then(({ data }) => {
      if (data) setProducts(data as Product[]);
    });
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p =>
      (active === "All" || p.category === active) &&
      (!q || p.name.toLowerCase().includes(q.toLowerCase()))
    );
  }, [products, active, q]);

  const grouped = useMemo(() => {
    if (active !== "All") return { [active]: filtered };
    return filtered.reduce<Record<string, Product[]>>((acc, p) => {
      (acc[p.category] ||= []).push(p); return acc;
    }, {});
  }, [filtered, active]);

  return (
    <div className="min-h-screen gradient-warm pb-32">
      <Header />

      {/* HERO */}
      <section className="container py-8 md:py-14">
        <div className="relative rounded-3xl overflow-hidden shadow-warm">
          <img src={heroImg} alt="Delicious food spread" width={1536} height={1024} className="w-full h-[280px] md:h-[420px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-14 max-w-2xl">
            <span className="text-secondary font-semibold tracking-wider uppercase text-sm mb-3 animate-float-up">Tasty Trekkrs</span>
            <h2 className="text-4xl md:text-6xl font-bold text-background leading-tight animate-float-up" style={{animationDelay: "0.1s"}}>
              Crave it.<br />Order it.<br /><span className="text-secondary">Devour it.</span>
            </h2>
            <p className="text-background/80 mt-4 text-lg max-w-md animate-float-up" style={{animationDelay: "0.2s"}}>
              From sizzling burgers to bubbling pizzas — handcrafted right in your neighborhood.
            </p>
            {settings.shop_status === "CLOSED" && (
              <div className="mt-6 inline-flex items-center gap-2 bg-destructive/95 text-destructive-foreground px-4 py-2 rounded-full font-semibold w-fit animate-float-up">
                🚫 Shop is currently closed
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEARCH + CATEGORIES */}
      <section className="container">
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the menu..." className="pl-11 h-12 rounded-full bg-card border-border" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
          {(["All", ...CATEGORIES] as string[]).map(c => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-bounce ${
                active === c
                  ? "gradient-hero text-primary-foreground shadow-warm scale-105"
                  : "bg-card border border-border hover:border-primary text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* MENU */}
      <section className="container py-8 space-y-12">
        {Object.entries(grouped).length === 0 && (
          <p className="text-center text-muted-foreground py-12">No items match.</p>
        )}
        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat}>
            <h3 className="text-2xl md:text-3xl font-bold mb-5 flex items-center gap-3">
              {cat}
              <span className="text-sm text-muted-foreground font-normal">{list.length} items</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {list.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        ))}
      </section>

      <FloatingCart />
    </div>
  );
};

export default Index;
