"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ProductRow } from "@/lib/types/catalog";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog-store";
import { useOrderStore, type SizeId } from "@/store/order-store";

function calcPreview(
  product: ProductRow,
  sizeId: SizeId,
  toppingIds: string[],
  extraIds: string[],
  modifiers: { id: string; extra_price_uah: number; is_available: boolean }[],
): number {
  let total = sizeId === "s700" ? product.price_large_uah : product.price_base_uah;
  for (const id of [...toppingIds, ...extraIds]) {
    total += modifiers.find((m) => m.id === id)?.extra_price_uah ?? 0;
  }
  return total;
}

export function OrderBuilderDrawer() {
  const { t, locale } = useLocale();
  const modifiers = useCatalogStore((s) => s.modifiers);
  const getProduct = useCatalogStore((s) => s.getProduct);

  const {
    builderOpen,
    closeBuilder,
    selectedProductId,
    sizeId,
    toppingIds,
    extraIds,
    setSize,
    toggleTopping,
    toggleExtra,
    addToOrder,
  } = useOrderStore();

  const product = selectedProductId ? getProduct(selectedProductId) : undefined;

  // Берем все топинги, даже недоступные
  const toppings = modifiers.filter((m) => m.modifier_type?.toLowerCase().includes("topping") || m.modifier_type?.toLowerCase().includes("топінг"));
  const extras = modifiers.filter((m) => m.modifier_type?.toLowerCase().includes("extra") || m.modifier_type?.toLowerCase().includes("додаток"));

  const total = useMemo(() => {
    if (!product) return 0;
    return calcPreview(product, sizeId, toppingIds, extraIds, modifiers);
  }, [product, sizeId, toppingIds, extraIds, modifiers]);

  const name = product ? (locale === "ua" ? product.name_ua : product.name_en) : "";
  const label500 = locale === "ua" ? "500 мл" : "500ml";
  const label700 = locale === "ua" ? "700 мл" : "700ml";

  return (
    <Drawer open={builderOpen} onOpenChange={(o) => { if (!o) closeBuilder(); }} direction="bottom">
      <DrawerContent className="mx-auto max-h-[85vh] w-full max-w-md border-[#4A7344]/20 bg-[#fffef5]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg font-bold text-[#2D2D2D]">{name || "—"}</DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="max-h-[50vh] px-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5 pb-4">
            
            <section>
              <h3 className="mb-2 text-sm font-semibold text-[#4A7344]">{t.builderSize}</h3>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setSize("s500")} className={cn("rounded-full border px-3 py-2 text-sm font-medium transition-colors", sizeId === "s500" ? "border-[#4A7344] bg-[#4A7344] text-white" : "border-[#4A7344]/30 bg-white text-[#2D2D2D]")}>
                  {label500} {product ? `· ${product.price_base_uah} ₴` : ""}
                </button>
                <button type="button" onClick={() => setSize("s700")} className={cn("rounded-full border px-3 py-2 text-sm font-medium transition-colors", sizeId === "s700" ? "border-[#4A7344] bg-[#4A7344] text-white" : "border-[#4A7344]/30 bg-white text-[#2D2D2D]")}>
                  {label700} {product ? `· ${product.price_large_uah} ₴` : ""}
                </button>
              </div>
            </section>

            <Separator className="bg-[#4A7344]/15" />

            <section>
              <h3 className="mb-2 text-sm font-semibold text-[#4A7344]">{t.builderToppings}</h3>
              <div className="flex flex-wrap gap-2">
                {toppings.map((s) => {
                  const active = toppingIds.includes(s.id);
                  const label = locale === "ua" ? s.name_ua : s.name_en;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!s.is_available}
                      onClick={() => toggleTopping(s.id)}
                      className={cn(
                        "relative rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                        active ? "border-[#4A7344] bg-[#4A7344] text-white" : "border-[#4A7344]/30 bg-white text-[#2D2D2D]",
                        !s.is_available && "opacity-50 grayscale cursor-not-allowed"
                      )}
                    >
                      {!s.is_available && <span className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-xl rotate-12">✕</span>}
                      <span className={cn(!s.is_available && "opacity-30")}>{label} {s.extra_price_uah > 0 ? ` +${s.extra_price_uah} ₴` : ""}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <Separator className="bg-[#4A7344]/15" />

            <section>
              <h3 className="mb-2 text-sm font-semibold text-[#4A7344]">{t.builderExtras}</h3>
              <div className="flex flex-wrap gap-2">
                {extras.map((s) => {
                  const active = extraIds.includes(s.id);
                  const label = locale === "ua" ? s.name_ua : s.name_en;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!s.is_available}
                      onClick={() => toggleExtra(s.id)}
                      className={cn(
                        "relative rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                        active ? "border-[#4A7344] bg-[#4A7344] text-white" : "border-[#4A7344]/30 bg-white text-[#2D2D2D]",
                        !s.is_available && "opacity-50 grayscale cursor-not-allowed"
                      )}
                    >
                      {!s.is_available && <span className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-xl rotate-12">✕</span>}
                      <span className={cn(!s.is_available && "opacity-30")}>{label} {s.extra_price_uah > 0 ? ` +${s.extra_price_uah} ₴` : ""}</span>
                    </button>
                  );
                })}
              </div>
            </section>
            
          </motion.div>
        </ScrollArea>

        <DrawerFooter className="border-t border-[#4A7344]/15 bg-[#fffef5]">
          <div className="flex items-center justify-between text-sm text-[#2D2D2D]">
            <span>{t.builderTotal}</span>
            <span className="font-bold">{total} ₴</span>
          </div>
          <Button type="button" className="h-11 w-full rounded-xl bg-[#4A7344] text-base font-semibold text-white" onClick={() => addToOrder()} disabled={!product}>
            {t.addToOrder}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}