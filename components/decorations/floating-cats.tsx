"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function FloatingCats() {
  const pathname = usePathname();
  const [cats, setCats] = useState<{ id: string; image_url: string }[]>([]);
  
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const load = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("decorations").select("*");
      if (data) setCats(data);
    };
    load();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white">
      {cats.map((cat, i) => (
        <div
          key={cat.id}
          className="absolute opacity-100" // Максимальная заметность
          style={{
            top: `${(i * 30 + 10) % 85}%`,
            left: `${(i * 40 + 5) % 92}%`,
            width: i % 2 === 0 ? "140px" : "200px",
            height: i % 2 === 0 ? "140px" : "200px",
            animation: `catRotate ${25 + i * 5}s linear infinite`,
            animationDelay: `${i * -3}s`
          }}
        >
          {/* Котики с тенями и белой рамкой */}
          <div className="relative h-full w-full rounded-full border-8 border-white shadow-[0_15px_60px_rgba(0,0,0,0.2)] overflow-hidden">
            <Image src={cat.image_url} alt="" fill className="object-cover scale-110" unoptimized />
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes catRotate {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(50px, 100px) rotate(90deg); }
          50% { transform: translate(150px, 50px) rotate(180deg); }
          75% { transform: translate(100px, -100px) rotate(270deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}