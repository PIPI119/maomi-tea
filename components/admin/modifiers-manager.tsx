"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModifiersManager() {
  const [modifiers, setModifiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function fetchModifiers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("modifiers")
        .select("*")
        .order("modifier_type", { ascending: true })
        .order("name_ua", { ascending: true });

      if (data && !error) {
        setModifiers(data);
      }
      setLoading(false);
    }
    fetchModifiers();
  }, []);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    setSavingId(id);
    const newStatus = !currentStatus;

    const { error } = await supabase
      .from("modifiers")
      .update({ is_available: newStatus })
      .eq("id", id);

    if (!error) {
      setModifiers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_available: newStatus } : m))
      );
    }
    setSavingId(null);
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#4A7344]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Управління додатками</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {modifiers.length} позицій
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-100">
          {modifiers.map((mod) => (
            <div key={mod.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              
              <div className="flex items-center gap-4">
                <div className={cn(
                  "px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider",
                  mod.modifier_type === "topping" ? "bg-[#4A7344]/10 text-[#4A7344]" : "bg-orange-100 text-orange-600"
                )}>
                  {mod.modifier_type === "topping" ? "Топінг" : "Додаток"}
                </div>
                
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {mod.name_ua} <span className="text-gray-400 font-normal">/ {mod.name_en}</span>
                  </p>
                  <p className="text-xs font-bold text-[#4A7344] mt-0.5">
                    {mod.extra_price_uah > 0 ? `+${mod.extra_price_uah} ₴` : "Безкоштовно"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleAvailability(mod.id, mod.is_available)}
                disabled={savingId === mod.id}
                className={cn(
                  "relative flex items-center justify-center w-12 h-8 rounded-full transition-all border-2",
                  savingId === mod.id && "opacity-50 cursor-wait",
                  mod.is_available 
                    ? "bg-[#4A7344]/10 border-[#4A7344] text-[#4A7344] hover:bg-[#4A7344]/20" 
                    : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                )}
              >
                {savingId === mod.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : mod.is_available ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <X size={16} strokeWidth={3} />
                )}
              </button>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}