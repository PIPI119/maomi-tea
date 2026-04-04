"use client";

import { useState, useEffect, type ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { OrderBuilderDrawer } from "@/components/order/order-builder-drawer";
import { DecorationCats } from "@/components/decorations/decoration-cats";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function MobileAppShell({
  children,
  logoUrl: initialLogoUrl = null, // Переименовали, чтобы не конфликтовать со стейтом
}: {
  children: ReactNode;
  logoUrl?: string | null;
}) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);

  // ФИКС: Если логотип не передали сверху, шелл сам идет в базу и берет его
  useEffect(() => {
    if (logoUrl) return; // Если уже есть, ничего не делаем

    async function fetchLogo() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("app_settings")
        .select("logo_url")
        .single();

      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    }
    fetchLogo();
  }, [logoUrl]);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white text-[#2D2D2D]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col shadow-sm">
        {/* Теперь передаем актуальный logoUrl из стейта */}
        <AppHeader logoUrl={logoUrl} />
        
        <main className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <DecorationCats />
          </div>

          <div className="relative z-10 min-h-full px-4 pb-28 pt-4 bg-white/20">
            {children} 
          </div>
        </main>
        
        <OrderBuilderDrawer />
        <BottomNav />
      </div>
    </div>
  );
}