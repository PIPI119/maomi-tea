"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatOrderSummaryForBarista } from "@/lib/format-barista";
import { useOrderStore } from "@/store/order-store";

export function BaristaModal() {
  const { locale, t } = useLocale();
  const { lines, baristaOpen, setBaristaOpen } = useOrderStore();

  const text = formatOrderSummaryForBarista(lines, locale);

  return (
    <Dialog open={baristaOpen} onOpenChange={setBaristaOpen}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 flex h-full max-h-none w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-white p-0 shadow-none ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{t.showBarista}</DialogTitle>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
          <AnimatePresence mode="wait">
            {baristaOpen && (
              <motion.div
                key="barista-text"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="w-full max-w-md text-center"
              >
                {/* ЗМЕНШЕНО ШРИФТ: text-3xl замість text-4xl */}
                <p className="whitespace-pre-wrap break-words text-3xl font-black uppercase leading-tight tracking-tight text-black sm:text-4xl md:text-5xl">
                  {text || "—"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="border-t border-black/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            className="h-12 w-full rounded-xl bg-[#4A7344] text-base font-semibold text-white"
            onClick={() => setBaristaOpen(false)}
          >
            {t.baristaClose}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}