import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-warm pb-12">
      <Header />
      <div className="container max-w-2xl py-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Cart</h2>
        {items.length === 0 ? (
          <div className="text-center py-20 gradient-card rounded-3xl shadow-soft">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-muted-foreground mb-6">Add some tasty items to get started.</p>
            <Button asChild className="rounded-full"><Link to="/">Browse Menu</Link></Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="gradient-card rounded-2xl p-4 shadow-soft flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 grid place-items-center text-2xl">
                    {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : "🍴"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-primary font-bold">₹{Number(product.price).toFixed(0)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                    <button onClick={() => setQty(product.id, qty - 1)} className="w-7 h-7 rounded-full bg-background grid place-items-center"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-6 text-center font-semibold">{qty}</span>
                    <button onClick={() => setQty(product.id, qty + 1)} disabled={qty >= product.stock} className="w-7 h-7 rounded-full bg-background grid place-items-center disabled:opacity-50"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <button onClick={() => remove(product.id)} className="text-muted-foreground hover:text-destructive transition-smooth">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 gradient-card rounded-2xl p-5 shadow-soft">
              <div className="flex justify-between text-lg mb-4">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary text-2xl">₹{total.toFixed(0)}</span>
              </div>
              <Button onClick={() => navigate("/checkout")} className="w-full rounded-full h-12 text-base font-semibold gradient-hero">
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
