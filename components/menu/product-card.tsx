"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import type { ProductRow } from "@/lib/types/catalog";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/order-store";

type ProductCardProps = {
  product: ProductRow;
  index: number;
};

export function ProductCard({ product, index }: ProductCardProps) {
  const { locale, t } = useLocale();
  const openBuilder = useOrderStore((s) => s.openBuilder);

  const title = locale === "ua" ? product.name_ua : product.name_en;
  const desc =
    locale === "ua" ? product.description_ua : product.description_en;

  return (
    <motion.article
      layout
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={() => {
        if (product.is_available) openBuilder(product.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (product.is_available) openBuilder(product.id);
        }
      }}
      className={cn(
        "flex w-full cursor-pointer overflow-hidden rounded-2xl border border-green-200/80 bg-green-50 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#4A7344]/50",
        !product.is_available && "cursor-not-allowed opacity-50 grayscale",
      )}
    >
      <div className="relative w-[34%] min-h-[112px] shrink-0 bg-green-100/90">
        <Image
          src={product.image_url}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 34vw, 150px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3">
        <div>
          <h3 className="font-bold leading-tight text-[#2D2D2D]">{title}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-[#2D2D2D]/65">
            {desc}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold leading-tight text-[#4A7344]">
            {product.price_base_uah} / {product.price_large_uah} ₴
          </span>
          <Button
            type="button"
            size="sm"
            className="h-9 min-w-[72px] rounded-full bg-[#4A7344] px-3 font-semibold text-white hover:bg-[#3d6238]"
            disabled={!product.is_available}
            onClick={(e) => {
              e.stopPropagation();
              openBuilder(product.id);
            }}
          >
            {t.add}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
