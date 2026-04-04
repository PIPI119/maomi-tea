"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/components/providers/locale-provider";
import { BaristaModal } from "@/components/order/barista-modal";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/order-store";

export default function OrderPage() {
  const { locale, t } = useLocale();
  const { lines, removeLine, setBaristaOpen } = useOrderStore();
  
  // ЗАЩИТА ОТ ОШИБКИ: ждем долю секунды, пока стор загрузится из памяти
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // ЗАЩИТА: если lines еще undefined, делаем пустой массив
  const safeLines = lines || [];

  return (
    <>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-[#2D2D2D]">
            {t.orderViewTitle}
          </h1>
          <p className="text-sm text-[#2D2D2D]/70">{t.orderViewHint}</p>
        </div>

        {safeLines.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#4A7344]/25 bg-white/60 px-4 py-8 text-center text-sm text-[#2D2D2D]/70">
            {t.orderEmpty}
          </p>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-[#4A7344]">
              {t.orderYourDrinks}
            </h2>
            <ul className="space-y-3">
              {safeLines.map((line: any, i: number) => (
                <motion.li
                  key={line.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-[#4A7344]/15 bg-white/90 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#2D2D2D]">
                        {locale === "ua" ? line.nameUa : line.nameEn}
                      </p>
                      <p className="text-xs text-[#2D2D2D]/65">
                        {line.sizeMl} ml
                        {line.toppings?.length > 0 &&
                          ` · ${line.toppings.map((x: any) => (locale === "ua" ? x.name_ua : x.name_en)).join(", ")}`}
                        {line.extras?.length > 0 &&
                          ` · ${line.extras.map((x: any) => (locale === "ua" ? x.name_ua : x.name_en)).join(", ")}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#4A7344]">
                        {line.priceTotal} ₴
                      </p>
                      <button
                        type="button"
                        className="text-xs text-[#2D2D2D]/50 underline"
                        onClick={() => removeLine(line.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2"
            >
              <Button
                type="button"
                className="h-14 w-full rounded-2xl bg-[#4A7344] text-lg font-black uppercase tracking-wide text-white shadow-lg hover:bg-[#3d6238]"
                onClick={() => setBaristaOpen(true)}
              >
                {t.showBarista}
              </Button>
            </motion.div>
          </>
        )}
      </div>

      <BaristaModal />
    </>
  );
}