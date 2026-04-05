"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { AdminMenuTab } from "@/components/admin/admin-menu-tab";
import { ModifiersManager } from "@/components/admin/modifiers-manager";

export default function AdminDashboardPage() {
  const { locale, t } = useLocale();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Middleware вже перевірив наш Basic Auth, тому просто вмикаємо сторінку
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-sm text-gray-500">{t.adminLoading || "Завантаження..."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-10 sm:max-w-4xl pt-4 pb-20 px-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#2D2D2D]">
          {t.adminDashboardTitle || "Адмін-панель"}
        </h1>
        <p className="text-sm text-[#2D2D2D]/65">
          {locale === "ua"
            ? "Управління меню, топінгами та логотипом."
            : "Manage menu, modifiers and store logo."}
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <AdminMenuTab />
        </section>

        <div className="py-2">
          <hr className="border-gray-200 border-2 rounded-full" />
        </div>

        <section>
          <ModifiersManager />
        </section>
      </div>
    </div>
  );
}