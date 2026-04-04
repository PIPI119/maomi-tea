"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, Check, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModifiersManager() {
  const [modifiers, setModifiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  // Состояния для новой формы
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMod, setNewMod] = useState({
    name_ua: "",
    name_en: "",
    extra_price_uah: 0,
    modifier_type: "topping",
  });

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

  // Функция добавления нового топинга в базу
  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("modifiers")
      .insert([
        {
          name_ua: newMod.name_ua,
          name_en: newMod.name_en,
          extra_price_uah: Number(newMod.extra_price_uah),
          modifier_type: newMod.modifier_type,
          is_available: true, // По умолчанию сразу доступен
        },
      ])
      .select()
      .single();

    if (data && !error) {
      // Добавляем в локальный список и сортируем, чтобы было красиво
      setModifiers((prev) =>
        [...prev, data].sort((a, b) => a.name_ua.localeCompare(b.name_ua))
      );
      setIsAdding(false); // Закрываем форму
      setNewMod({ name_ua: "", name_en: "", extra_price_uah: 0, modifier_type: "topping" }); // Очищаем
    } else {
      alert("Помилка при збереженні. Перевір консоль.");
      console.error(error);
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#4A7344]" /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ШАПКА И КНОПКА ДОБАВЛЕНИЯ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Управління додатками</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            {modifiers.length} позицій
          </p>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-[#4A7344] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#3d5f37] transition-all active:scale-95"
        >
          {isAdding ? <X size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
          {isAdding ? "Скасувати" : "Додати нову"}
        </button>
      </div>

      {/* ФОРМА СОЗДАНИЯ (Показывается только если нажали "Додати") */}
      {isAdding && (
        <form onSubmit={handleAddNew} className="bg-white rounded-2xl shadow-sm border-2 border-[#4A7344]/20 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Назва (UA)</label>
              <input
                required
                type="text"
                placeholder="напр. Тапіока"
                value={newMod.name_ua}
                onChange={(e) => setNewMod({ ...newMod, name_ua: e.target.value })}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7344]/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Назва (EN)</label>
              <input
                required
                type="text"
                placeholder="напр. Tapioca"
                value={newMod.name_en}
                onChange={(e) => setNewMod({ ...newMod, name_en: e.target.value })}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7344]/50 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ціна (₴)</label>
              <input
                required
                type="number"
                min="0"
                value={newMod.extra_price_uah}
                onChange={(e) => setNewMod({ ...newMod, extra_price_uah: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7344]/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Тип</label>
              <select
                value={newMod.modifier_type}
                onChange={(e) => setNewMod({ ...newMod, modifier_type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7344]/50 outline-none bg-white"
              >
                <option value="topping">Топінг (Topping)</option>
                <option value="milk">Молоко (Milk)</option>
                <option value="syrup">Сироп (Syrup)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#4A7344] text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 mt-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Зберегти в базу"}
          </button>
        </form>
      )}

      {/* СПИСОК СУЩЕСТВУЮЩИХ ДОБАВОК */}
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