"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { AdminMenuTab } from "@/components/admin/admin-menu-tab";
import { ModifiersManager } from "@/components/admin/modifiers-manager"; // <-- Додали імпорт
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/");
        return;
      }
      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <p className="text-center text-sm text-[#2D2D2D]/70">{t.adminLoading}</p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-10 sm:max-w-4xl pt-4 pb-20">
      <div className="px-4 space-y-1">
        <h1 className="text-2xl font-bold text-[#2D2D2D]">
          {t.adminDashboardTitle}
        </h1>
        <p className="text-sm text-[#2D2D2D]/65">
          {locale === "ua"
            ? "Управління меню, топінгами та логотипом закладу."
            : "Manage menu, modifiers and store logo."}
        </p>
      </div>

      <div className="space-y-12">
        {/* ЧАСТИНА 1: Твоя оригінальна панель управління товарами та категоріями */}
        <section>
          <AdminMenuTab />
        </section>

        {/* Розділювач */}
        <div className="px-4">
          <hr className="border-gray-200 border-2 rounded-full" />
        </div>

        {/* ЧАСТИНА 2: Нова панель управління топінгами (додатками) */}
        <section className="px-4">
          <ModifiersManager />
        </section>
      </div>
    </div>
  );
}