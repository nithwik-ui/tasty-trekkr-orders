import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FloatingCart = () => {
  const { count, total } = useCart();
  const navigate = useNavigate();
  if (count === 0) return null;
  return (
    <button
      onClick={() => navigate("/cart")}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 gradient-hero text-primary-foreground rounded-full shadow-warm px-6 py-4 flex items-center gap-3 animate-pop hover:scale-105 transition-bounce"
    >
      <div className="relative">
        <ShoppingBag className="w-5 h-5" />
        <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-full w-5 h-5 grid place-items-center">{count}</span>
      </div>
      <span className="font-semibold">View Cart</span>
      <span className="font-bold">₹{total.toFixed(0)}</span>
    </button>
  );
};
