"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocationsPage() {
  const [locations, setLocations] = useState<{ loc1: string; loc2: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      const supabase = createSupabaseBrowserClient();
      
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("location_1_url, location_2_url")
          .maybeSingle();

        if (error) {
          console.error("Помилка Supabase:", error.message);
          setDbError(error.message);
        } else if (data) {
          setLocations({
            loc1: data.location_1_url || "",
            loc2: data.location_2_url || ""
          });
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
        <h1 className="text-2xl font-black text-[#2D2D2D]">Наші локації</h1>
        <p className="text-sm text-gray-400 font-bold">Заходь на бабл-ті! 🐾</p>
      </div>

      {/* Если база выдала ошибку, мы её увидим */}
      {dbError && (
        <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100">
          Помилка бази: {dbError}. <br/>
          Перевір, чи ти створив колонки в таблиці app_settings!
        </div>
      )}

      <div className="grid gap-4">
        {/* КАРТОЧКА ПЕРВОЙ ЛОКАЦИИ */}
        {locations?.loc1 ? (
          <div className="group bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 shadow-sm border border-white/20 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#4A7344]/10 p-4 rounded-3xl text-[#4A7344]">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="font-black text-lg text-gray-800">Maomi Point #1</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Головна точка</p>
              </div>
            </div>
            
            <Button asChild className="w-full h-14 rounded-2xl bg-[#4A7344] text-white font-black text-base shadow-lg shadow-[#4A7344]/20">
              <a href={locations.loc1} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Відкрити Google Maps <ExternalLink size={18} />
              </a>
            </Button>
          </div>
        ) : null}

        {/* КАРТОЧКА ВТОРОЙ ЛОКАЦИИ */}
        {locations?.loc2 ? (
          <div className="group bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 shadow-sm border border-white/20 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#4A7344]/10 p-4 rounded-3xl text-[#4A7344]">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="font-black text-lg text-gray-800">Maomi Point #2</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Додаткова локація</p>
              </div>
            </div>
            
            <Button asChild className="w-full h-14 rounded-2xl bg-[#4A7344] text-white font-black text-base shadow-lg shadow-[#4A7344]/20">
              <a href={locations.loc2} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Відкрити Google Maps <ExternalLink size={18} />
              </a>
            </Button>
          </div>
        ) : null}

        {/* Если локаций нет, но и ошибок нет */}
        {!dbError && !locations?.loc1 && !locations?.loc2 && (
          <div className="p-12 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 mx-2">
            <p className="text-gray-400 font-bold text-sm">Локації скоро з&apos;являться... 🐾</p>
          </div>
        )}
      </div>
    </div>
  );
}