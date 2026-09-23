import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/types";

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>(CATEGORIES as string[]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("categories")
      .select("name, sort_order")
      .order("sort_order")
      .order("name");
    if (data && data.length) setCategories(data.map((c) => c.name));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addCategory = useCallback(async (raw: string) => {
    const name = raw.trim();
    if (!name) return { error: "Category name required" };
    const { error } = await supabase
      .from("categories")
      .insert({ name, sort_order: 999 });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      return { error: error.message };
    }
    await load();
    return { error: null as string | null };
  }, [load]);

  return { categories, loading, addCategory, reload: load };
};
