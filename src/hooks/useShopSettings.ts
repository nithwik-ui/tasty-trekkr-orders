import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ShopSettings {
  shop_status: "OPEN" | "CLOSED";
  whatsapp_number: string;
}

export const useShopSettings = () => {
  const [settings, setSettings] = useState<ShopSettings>({ shop_status: "OPEN", whatsapp_number: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("settings").select("shop_status, whatsapp_number").eq("id", 1).maybeSingle();
      if (data) setSettings(data as ShopSettings);
      setLoading(false);
    };
    fetch();

    const channel = supabase.channel("settings_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, (payload) => {
        if (payload.new) setSettings(payload.new as ShopSettings);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { settings, loading };
};
