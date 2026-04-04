import { createSupabaseAnonServerClient } from "@/lib/supabase/anon-server";
import type { MenuCatalog } from "@/lib/types/catalog";

export async function fetchMenuCatalog(): Promise<MenuCatalog> {
  const sb = createSupabaseAnonServerClient();

  const [categoriesRes, productsRes, modifiersRes, settingsRes] = await Promise.all([
    sb.from("categories").select("*").order("order_index", { ascending: true }),
    sb.from("products").select("*").order("name_en", { ascending: true }),
    sb
      .from("modifiers")
      .select("*")
      .order("modifier_type", { ascending: true })
      .order("name_en", { ascending: true }),
    sb.from("app_settings").select("logo_url").limit(1),
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (productsRes.error) throw productsRes.error;
  if (modifiersRes.error) throw modifiersRes.error;
  if (settingsRes.error) throw settingsRes.error;

  const rawLogo = settingsRes.data?.[0]?.logo_url?.trim();
  const logoUrl = rawLogo ? rawLogo : null;

  return {
    categories: (categoriesRes.data ?? []) as MenuCatalog["categories"],
    products: (productsRes.data ?? []) as MenuCatalog["products"],
    modifiers: (modifiersRes.data ?? []) as MenuCatalog["modifiers"],
    logoUrl,
  };
}
