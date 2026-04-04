/** Rows from Supabase (snake_case) */
export type CategoryRow = {
  id: string;
  name_ua: string;
  name_en: string;
  order_index: number;
};

export type ProductRow = {
  id: string;
  category_id: string;
  name_ua: string;
  name_en: string;
  description_ua: string;
  description_en: string;
  price_base_uah: number;
  price_large_uah: number;
  image_url: string;
  is_available: boolean;
  created_at?: string;
};

export type ModifierRow = {
  id: string;
  modifier_type: "topping" | "extra";
  name_ua: string;
  name_en: string;
  extra_price_uah: number;
  is_available: boolean;
};

export type MenuCatalog = {
  categories: CategoryRow[];
  products: ProductRow[];
  modifiers: ModifierRow[];
  /** Public logo URL from `app_settings`; null/empty → storefront uses default icon. */
  logoUrl: string | null;
};
