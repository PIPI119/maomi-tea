"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useEffect, TouchEvent } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { ProductCard } from "@/components/menu/product-card";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog-store";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function MenuView() {
  const { locale, t } = useLocale();
  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);
  const hydrated = useCatalogStore((s) => s.hydrated);
  const hydrate = useCatalogStore((s) => s.hydrate);

  useEffect(() => {
    if (hydrated) return;

    async function loadData() {
      const supabase = createSupabaseBrowserClient();
      
      const [catRes, prodRes, modRes] = await Promise.all([
        supabase.from("categories").select("*").order("order_index", { ascending: true }),
        supabase.from("products").select("*"), 
        supabase.from("modifiers").select("*") 
      ]);

      hydrate({
        categories: catRes.data || [],
        products: prodRes.data || [],
        modifiers: modRes.data || [],
      });
    }
    
    loadData();
  }, [hydrated, hydrate]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order_index - b.order_index),
    [categories],
  );

  const [activeCategory, setActiveCategory] = useState("");
  const effectiveCategory = activeCategory || sortedCategories[0]?.id || "";

  const filtered = useMemo(
    () => products.filter((p) => p.category_id === effectiveCategory),
    [products, effectiveCategory],
  );

  // === ЛОГИКА СВАЙПОВ ===
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const swipeThreshold = 50; 
    
    const currentIndex = sortedCategories.findIndex(c => c.id === effectiveCategory);

    // Свайп влево
    if (distance > swipeThreshold && currentIndex < sortedCategories.length - 1) {
      setActiveCategory(sortedCategories[currentIndex + 1].id);
    } 
    // Свайп вправо
    else if (distance < -swipeThreshold && currentIndex > 0) {
      setActiveCategory(sortedCategories[currentIndex - 1].id);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-[#2D2D2D]">{t?.menuViewTitle || "Меню"}</h1>
          <p className="text-sm text-[#2D2D2D]/70">{t?.menuViewHint || "Завантаження..."}</p>
        </div>
        <div className="h-32 animate-pulse rounded-2xl bg-[#4A7344]/10" />
      </div>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-[#2D2D2D]">{t?.menuViewTitle || "Меню"}</h1>
        <p className="text-sm text-[#2D2D2D]/70">
          {locale === "ua" ? "Меню порожнє. Запустіть SQL-міграцію." : "Menu is empty."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-32">
      <div>
        <h1 className="text-xl font-bold text-[#2D2D2D]">{t?.menuViewTitle || "Меню"}</h1>
        <p className="text-sm text-[#2D2D2D]/70">{t?.menuViewHint || "Обери напій"}</p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {sortedCategories.map((cat) => {
          const label = locale === "ua" ? cat.name_ua : cat.name_en;
          const active = effectiveCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-[#4A7344] text-white shadow-sm"
                  : "bg-white/90 text-[#2D2D2D]/80 ring-1 ring-[#4A7344]/20 hover:bg-[#4A7344]/10",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Обертка для считывания свайпов растянута вниз (min-h-[75vh]) */}
      <div 
        className="min-h-[75vh] w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          key={effectiveCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-3"
        >
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}