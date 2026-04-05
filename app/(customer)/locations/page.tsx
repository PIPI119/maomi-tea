"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MapPin, ExternalLink, Loader2, Navigation } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

export default function LocationsPage() {
  const { locale } = useLocale();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      const supabase = createSupabaseBrowserClient();
      
      try {
        const { data, error } = await supabase
          .from("locations")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) {
          console.error("Помилка Supabase:", error.message);
          setDbError(error.message);
        } else if (data) {
          setLocations(data);
        }
      } catch (err) {
        console.error("Критична помилка:", err);
        setDbError("Не вдалося підключитися до бази");
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  // ФУНКЦІЯ ШВИДКОГО ВІДКРИТТЯ
  const handleMapClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    
    // Перевіряємо, чи це мобільний пристрій (Android/iOS)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Спроба примусово викликати універсальний лінк (зазвичай працює швидше)
      window.location.href = url;
    } else {
      // Для комп'ютера відкриваємо в новій вкладці
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#4A7344]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="px-2">
        <h1 className="text-2xl font-black text-[#2D2D2D]">
          {locale === "ua" ? "Наші локації" : "Our Locations"}
        </h1>
        <p className="text-sm text-gray-400 font-bold">
          {locale === "ua" ? "Заходь на бабл-ті! 🐾" : "Come for bubble tea! 🐾"}
        </p>
      </div>

      {dbError && (
        <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 mx-2">
          Помилка бази: {dbError}
        </div>
      )}

      <div className="grid gap-4 px-2">
        {locations.map((loc) => (
          <a
            key={loc.id}
            href={loc.map_url}
            onClick={(e) => handleMapClick(e, loc.map_url)}
            className="group block bg-white/60 backdrop-blur-md rounded-[2.5rem] p-5 shadow-sm border border-white/20 transition-all active:scale-95 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="bg-[#4A7344]/10 p-4 rounded-3xl text-[#4A7344] shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-800 leading-tight">
                    {locale === "ua" ? loc.name_ua : loc.name_en}
                  </h3>
                  <p className="text-[10px] text-[#4A7344] font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                    <Navigation size={10} /> Google Maps
                  </p>
                </div>
              </div>
              
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4A7344] text-white shadow-lg shadow-[#4A7344]/20 group-active:bg-[#3d5f37] transition-colors">
                <ExternalLink size={20} />
              </div>
              
            </div>
          </a>
        ))}

        {!dbError && locations.length === 0 && (
          <div className="p-12 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-sm">
              {locale === "ua" ? "Локації скоро з'являться... 🐾" : "Locations coming soon... 🐾"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
