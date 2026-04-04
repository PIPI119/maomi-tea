"use client";

import { Leaf } from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/dictionaries";

const locales: { code: Locale; label: string }[] = [
  { code: "ua", label: "UA" },
  { code: "en", label: "EN" },
];

export function AppHeader({ logoUrl = null }: { logoUrl?: string | null }) {
  const { locale, setLocale, t } = useLocale();
  const showLogo = Boolean(logoUrl?.trim());

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#4A7344] backdrop-blur-md">
      <div className="relative mx-auto flex w-full max-w-md flex-col items-center px-4 pb-3 pt-4">
        <div className="absolute right-3 top-3 flex gap-1">
          {locales.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={cn(
                "min-h-[36px] min-w-[40px] rounded-full px-2 text-sm font-bold transition-all",
                locale === code
                  ? "bg-white text-[#4A7344] shadow-sm" // Теперь тут чистый белый
                  : "text-white/80 hover:bg-white/10",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex w-full flex-col items-center gap-1 pr-14">
          <div className="flex items-center justify-center gap-2.5">
            {showLogo ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/40 bg-white/10 shadow-lg">
                <Image
                  src={logoUrl!.trim()}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                  priority
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/35 bg-white/15 text-white">
                <Leaf className="h-6 w-6" />
              </div>
            )}
            <span className="text-2xl font-black leading-none tracking-tighter text-white">
              MAOMI
            </span>
          </div>
          <p className="text-center text-[10px] uppercase font-bold tracking-[0.2em] text-white/70">
            {t.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}