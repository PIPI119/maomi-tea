import { create } from "zustand";
import type { ModifierRow, ProductRow } from "@/lib/types/catalog";
import { useCatalogStore } from "@/store/catalog-store";

export type SizeId = "s500" | "s700";
export type TemperatureId = "cold" | "warm"; // Новий тип

export type CartLine = {
  id: string;
  productId: string;
  nameUa: string;
  nameEn: string;
  sizeMl: 500 | 700;
  temperature: TemperatureId; // Додали в кошик
  sweetness: number;          // Додали в кошик
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
  temperature: TemperatureId; // Стан температури
  sweetness: number;          // Стан солодкості
  toppingIds: string[];
  extraIds: string[];
  lines: CartLine[];
  baristaOpen: boolean;

  openBuilder: (productId: string) => void;
  closeBuilder: () => void;
  setSize: (id: SizeId) => void;
  setTemperature: (id: TemperatureId) => void; // Функція зміни
  setSweetness: (level: number) => void;       // Функція зміни
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
  temperature: "cold", // За замовчуванням
  sweetness: 4,        // За замовчуванням
  toppingIds: [],
  extraIds: [],
  lines: [],
  baristaOpen: false,

  openBuilder: (productId) => {
    set({
      builderOpen: true,
      selectedProductId: productId,
      sizeId: "s500",
      temperature: "cold", // Скидаємо при відкритті нового
      sweetness: 4,        // Скидаємо при відкритті нового
      toppingIds: [],
      extraIds: [],
    });
  },

  closeBuilder: () => {
    set({ builderOpen: false, selectedProductId: null });
  },

  setSize: (id) => set({ sizeId: id }),
  setTemperature: (id) => set({ temperature: id }),
  setSweetness: (level) => set({ sweetness: level }),

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
      temperature, // Беремо зі стейту
      sweetness,   // Беремо зі стейту
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
      temperature, // Зберігаємо в кошик
      sweetness,   // Зберігаємо в кошик
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