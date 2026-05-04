import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { CartItem, Product } from "@/types";
import { toast } from "sonner";

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("tt_cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("tt_cart", JSON.stringify(items));
  }, [items]);

  const add = (p: Product) => {
    setItems(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      if (ex) {
        if (ex.qty >= p.stock) {
          toast.warning(`Only ${p.stock} ${p.name} left`);
          return prev;
        }
        return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      if (p.stock < 1) { toast.error("Out of stock"); return prev; }
      toast.success(`${p.name} added`);
      return [...prev, { product: p, qty: 1 }];
    });
  };

  const remove = (id: string) => setItems(prev => prev.filter(i => i.product.id !== id));

  const setQty = (id: string, qty: number) => {
    setItems(prev => prev.flatMap(i => {
      if (i.product.id !== id) return [i];
      if (qty <= 0) return [];
      if (qty > i.product.stock) {
        toast.warning(`Only ${i.product.stock} left`);
        return [{ ...i, qty: i.product.stock }];
      }
      return [{ ...i, qty }];
    }));
  };

  const clear = () => setItems([]);

  const { count, total } = useMemo(() => ({
    count: items.reduce((a, i) => a + i.qty, 0),
    total: items.reduce((a, i) => a + i.qty * Number(i.product.price), 0),
  }), [items]);

  return <Ctx.Provider value={{ items, count, total, add, remove, setQty, clear }}>{children}</Ctx.Provider>;
};

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart outside provider");
  return v;
};
