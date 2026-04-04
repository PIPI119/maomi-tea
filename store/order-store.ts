import { create } from "zustand";
import type { ModifierRow, ProductRow } from "@/lib/types/catalog";
import { useCatalogStore } from "@/store/catalog-store";

export type SizeId = "s500" | "s700";

export type CartLine = {
  id: string;
  productId: string;
  nameUa: string;
  nameEn: string;
  sizeMl: 500 | 700;
  toppings: Pick<ModifierRow, "id" | "name_ua" | "name_en">[];
  extras: Pick<ModifierRow, "id" | "name_ua" | "name_en">[];
  priceTotal: number;
};

function randomId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function calcLinePrice(
  product: ProductRow,
  sizeId: SizeId,
  toppingIds: string[],
  extraIds: string[],
): number {
  let total =
    sizeId === "s700" ? product.price_large_uah : product.price_base_uah;
  const mods = useCatalogStore.getState().modifiers;
  for (const id of [...toppingIds, ...extraIds]) {
    const m = mods.find((x) => x.id === id);
    total += m?.extra_price_uah ?? 0;
  }
  return total;
}

type OrderState = {
  builderOpen: boolean;
  selectedProductId: string | null;
  sizeId: SizeId;
  toppingIds: string[];
  extraIds: string[];
  lines: CartLine[];
  baristaOpen: boolean;

  openBuilder: (productId: string) => void;
  closeBuilder: () => void;
  setSize: (id: SizeId) => void;
  toggleTopping: (id: string) => void;
  toggleExtra: (id: string) => void;
  addToOrder: () => void;
  removeLine: (lineId: string) => void;
  clearOrder: () => void;
  setBaristaOpen: (open: boolean) => void;
};

export const useOrderStore = create<OrderState>((set, get) => ({
  builderOpen: false,
  selectedProductId: null,
  sizeId: "s500",
  toppingIds: [],
  extraIds: [],
  lines: [],
  baristaOpen: false,

  openBuilder: (productId) => {
    set({
      builderOpen: true,
      selectedProductId: productId,
      sizeId: "s500",
      toppingIds: [],
      extraIds: [],
    });
  },

  closeBuilder: () => {
    set({ builderOpen: false, selectedProductId: null });
  },

  setSize: (id) => set({ sizeId: id }),

  toggleTopping: (id) => {
    const cur = get().toppingIds;
    set({
      toppingIds: cur.includes(id)
        ? cur.filter((x) => x !== id)
        : [...cur, id],
    });
  },

  toggleExtra: (id) => {
    const cur = get().extraIds;
    set({
      extraIds: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    });
  },

  addToOrder: () => {
    const {
      selectedProductId,
      sizeId,
      toppingIds,
      extraIds,
      closeBuilder,
    } = get();
    if (!selectedProductId) return;
    const product = useCatalogStore.getState().getProduct(selectedProductId);
    if (!product) return;

    const mods = useCatalogStore.getState().modifiers;
    const sizeMl = sizeId === "s700" ? 700 : 500;
    const toppings = mods
      .filter((m) => m.modifier_type === "topping" && toppingIds.includes(m.id))
      .map(({ id, name_ua, name_en }) => ({ id, name_ua, name_en }));
    const extras = mods
      .filter((m) => m.modifier_type === "extra" && extraIds.includes(m.id))
      .map(({ id, name_ua, name_en }) => ({ id, name_ua, name_en }));

    const line: CartLine = {
      id: randomId(),
      productId: product.id,
      nameUa: product.name_ua,
      nameEn: product.name_en,
      sizeMl,
      toppings,
      extras,
      priceTotal: calcLinePrice(product, sizeId, toppingIds, extraIds),
    };

    set((s) => ({ lines: [...s.lines, line] }));
    closeBuilder();
  },

  removeLine: (lineId) => {
    set((s) => ({ lines: s.lines.filter((l) => l.id !== lineId) }));
  },

  clearOrder: () => set({ lines: [] }),

  setBaristaOpen: (open) => set({ baristaOpen: open }),
}));
