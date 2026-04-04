"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function DecorationCats() {
  const pathname = usePathname();
  const [cats, setCats] = useState<any[]>([]);
  const supabase = createSupabaseBrowserClient();
  
  if (pathname?.startsWith("/admin")) return null;

  const load = useCallback(async () => {
    const { data } = await supabase.from("decorations").select("*");
    if (data) setCats(data.slice(0, 10));
  }, [supabase]);

  useEffect(() => {
    load();

    // Создаем канал с уникальным ID для сессии
    const channelId = `cats_global_${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelId);

    // СНАЧАЛА вешаем обработчик события .on()
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'decorations' },
      () => { load(); }
    );

    // И ТОЛЬКО ПОТОМ вызываем .subscribe()
    channel.subscribe();

    return () => {
      // Обязательно удаляем канал при размонтировании
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white">
      {cats.map((cat, i) => (
        <div
          key={cat.id}
          className="absolute transition-all duration-700 ease-in-out"
          style={{
            top: `${cat.pos_y}%`,
            left: `${cat.pos_x}%`,
            width: "50px", // Чуть-чуть увеличил
            height: "50px",
            transform: 'translate(-50%, -50%)',
            opacity: 0.85, // Теперь их точно видно!
          }}
        >
          <div className="relative h-full w-full rounded-full border-2 border-white shadow-lg overflow-hidden bg-white">
            <Image src={cat.image_url} alt="" fill className="object-cover" unoptimized />
          </div>
        </div>
      ))}
    </div>
  );
}