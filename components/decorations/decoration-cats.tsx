"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export function DecorationCats() {
  const pathname = usePathname();
  const [cats, setCats] = useState<any[]>([]);
  const supabase = createSupabaseBrowserClient();

  const load = useCallback(async () => {
    const { data } = await supabase.from("decorations").select("*");
    if (data) setCats(data.slice(0, 10));
  }, [supabase]);

  useEffect(() => {
    load();

    const channelId = `cats_global_${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelId);

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'decorations' },
      () => { load(); }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  // ВАЖНО: Эта проверка теперь стоит ПОСЛЕ хуков. 
  // Это исправляет красную ошибку при сборке проекта (Rule of Hooks).
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-transparent">
      {cats.map((cat, i) => {
        // Генерируем уникальную анимацию для каждого котика, чтобы они двигались вразнобой
        const randomDuration = 5 + (i % 5); // Скорость левитации от 5 до 9 секунд
        const randomY = -15 - (i % 3) * 5;  // Высота полета
        const randomX = 10 + (i % 2) * 5;   // Смещение в стороны

        return (
          // Внешний div фиксирует котика на тех координатах, которые ты задал в админке
          <div
            key={cat.id}
            className="absolute"
            style={{
              top: `${cat.pos_y}%`,
              left: `${cat.pos_x}%`,
            }}
          >
            {/* Внутренний motion.div отвечает за плавную левитацию вокруг этой точки */}
            <motion.div
              // w-16 h-16 это 64px. -ml-8 -mt-8 оттягивает его ровно на половину, чтобы центр был в координатах
              className="relative w-16 h-16 -ml-8 -mt-8 rounded-full border-4 border-white shadow-[0_5px_15px_rgba(0,0,0,0.15)] overflow-hidden bg-white"
              animate={{
                y: [0, randomY, 0], // Плавно вверх и вниз
                x: [0, randomX, -randomX, 0], // Плавно влево и вправо
                rotate: [0, 5, -5, 0] // Легкое покачивание
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3 // Задержка, чтобы они не взлетали все одновременно
              }}
            >
              <Image src={cat.image_url} alt="" fill className="object-cover scale-110" unoptimized />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}