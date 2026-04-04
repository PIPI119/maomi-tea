import { create } from "zustand";
import type { MenuCatalog } from "@/lib/types/catalog";
import type { ProductRow } from "@/lib/types/catalog";

type CatalogState = Pick<MenuCatalog, "categories" | "products" | "modifiers"> & {
  hydrated: boolean;
  hydrate: (data: MenuCatalog) => void;
  getProduct: (id: string) => ProductRow | undefined;
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: [],
  products: [],
  modifiers: [],
  hydrated: false,

  hydrate: (data) =>
    set({
      categories: data.categories,
      products: data.products,
      modifiers: data.modifiers,
      hydrated: true,
    }),

  getProduct: (id) => get().products.find((p) => p.id === id),
}));
