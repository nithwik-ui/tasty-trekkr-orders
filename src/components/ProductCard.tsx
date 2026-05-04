import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Flame } from "lucide-react";

const VegDot = ({ veg }: { veg: boolean }) => (
  <span className={`inline-flex items-center justify-center w-4 h-4 border-2 ${veg ? "border-veg" : "border-nonveg"} rounded-sm`}>
    <span className={`w-2 h-2 rounded-full ${veg ? "bg-veg" : "bg-nonveg"}`} />
  </span>
);

export const ProductCard = ({ product }: { product: Product }) => {
  const { items, add, setQty } = useCart();
  const inCart = items.find(i => i.product.id === product.id);
  const out = product.stock < 1;
  const low = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group gradient-card rounded-2xl overflow-hidden shadow-soft hover:shadow-warm transition-smooth border border-border/50 flex flex-col">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-smooth" />
        ) : (
          <div className="w-full h-full gradient-hero opacity-20 flex items-center justify-center text-6xl">🍴</div>
        )}
        {product.bestseller && !out && (
          <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground border-0 gap-1">
            <Flame className="w-3 h-3" /> Bestseller
          </Badge>
        )}
        {out && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <Badge className="bg-destructive text-destructive-foreground text-sm px-3 py-1">Out of Stock</Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start gap-2">
          <VegDot veg={product.is_veg} />
          <h3 className="font-semibold leading-tight flex-1">{product.name}</h3>
        </div>
        {product.description && <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>}
        {low && <p className="text-xs text-destructive font-medium">Only {product.stock} left!</p>}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xl font-bold text-primary">₹{Number(product.price).toFixed(0)}</span>
          {inCart ? (
            <div className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full p-1">
              <button onClick={() => setQty(product.id, inCart.qty - 1)} className="w-7 h-7 rounded-full hover:bg-primary-foreground/20 grid place-items-center transition-smooth"><Minus className="w-4 h-4" /></button>
              <span className="font-semibold w-5 text-center">{inCart.qty}</span>
              <button onClick={() => setQty(product.id, inCart.qty + 1)} disabled={inCart.qty >= product.stock} className="w-7 h-7 rounded-full hover:bg-primary-foreground/20 grid place-items-center transition-smooth disabled:opacity-50"><Plus className="w-4 h-4" /></button>
            </div>
          ) : (
            <Button size="sm" disabled={out} onClick={() => add(product)} className="rounded-full font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
