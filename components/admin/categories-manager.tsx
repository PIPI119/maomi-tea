"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, Trash2, Plus } from "lucide-react";

export function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  // Состояния для формы
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCat, setNewCat] = useState({
    id: "", // Техническое имя (например: fruit_tea)
    name_ua: "",
    name_en: "",
    order_index: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("order_index", { ascending: true });

    if (data && !error) {
      setCategories(data);
    }
    setLoading(false);
  }

  // ДОБАВЛЕНИЕ КАТЕГОРИИ
  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Убираем пробелы и делаем маленькие буквы для ID (например "Fruit Tea" -> "fruit_tea")
    const safeId = newCat.id.trim().toLowerCase().replace(/\s+/g, '_');

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          id: safeId,
          name_ua: newCat.name_ua,
          name_en: newCat.name_en,
          order_index: Number(newCat.order_index),
        },
      ])
      .select()
      .single();

    if (data && !error) {
      setCategories((prev) => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      setIsAdding(false);
      setNewCat({ id: "", name_ua: "", name_en: "", order_index: 0 });
    } else {
      alert("Помилка! Можливо, категорія з таким ID вже існує.");
      console.error(error);
    }
    setIsSubmitting(false);
  };

  // УДАЛЕНИЕ КАТЕГОРИИ
  const handleDelete = async (id: string, nameUa: string) => {
    const confirmDelete = window.confirm(`Ти впевнений, що хочеш видалити категорію "${nameUa}"? Переконайся, що в ній немає напоїв!`);
    if (!confirmDelete) return;

    setDeletingId(id);
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert("Не вдалося видалити. Можливо, до цієї категорії ще прив'язані напої.");
      console.error(error);
    }
    setDeletingId(null);
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#4A7344]" /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ШАПКА */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Управління категоріями</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            {categories.length} розділів меню
          </p>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-[#4A7344] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#3d5f37] transition-all active:scale-95"
        >
          {isAdding ? "Скасувати" : <><Plus size={16} strokeWidth={3} /> Додати</>}
        </button>
      </div>

      {/* ФОРМА СОЗДАНИЯ */}
      {isAdding && (
        <form onSubmit={handleAddNew} className="bg-white rounded-2xl shadow-sm border-2 border-[#4A7344]/20 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Назва (UA)</label>
              <input required type="text" placeholder="напр. Фруктові чаї" value={newCat.name_ua} onChange={(e) => setNewCat({ ...newCat, name_ua: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7344]/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Назва (EN)</label>
              <input required type="text" placeholder="напр. Fruit Tea" value={newCat.name_en} onChange={(e) => setNewCat({ ...newCat, name_en: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7344]/50 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Системний ID (англ. без пробілів)
              </label>
              <input required type="text" placeholder="напр. fruit_tea" value={newCat.id} onChange={(e) => setNewCat({ ...newCat, id: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7344]/50 outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Порядок сортування (1 - перша)
              </label>
              <input required type="number" value={newCat.order_index} onChange={(e) => setNewCat({ ...newCat, order_index: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#4A7344]/50 outline-none" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#4A7344] text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 mt-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Створити категорію"}
          </button>
        </form>
      )}

      {/* СПИСОК КАТЕГОРИЙ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
                  {cat.order_index}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {cat.name_ua} <span className="text-gray-400 font-normal">/ {cat.name_en}</span>
                  </p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">ID: {cat.id}</p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(cat.id, cat.name_ua)}
                disabled={deletingId === cat.id}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                {deletingId === cat.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}