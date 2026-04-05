"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, Plus, Trash2, MapPin } from "lucide-react";

export function LocationsManager() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const supabase = createSupabaseBrowserClient();

  const [newLoc, setNewLoc] = useState({
    name_ua: "",
    name_en: "",
    map_url: "",
    order_index: 0,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    setLoading(true);
    const { data } = await supabase.from("locations").select("*").order("order_index", { ascending: true });
    if (data) setLocations(data);
    setLoading(false);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data, error } = await supabase.from("locations").insert([newLoc]).select().single();
    
    if (data && !error) {
      setLocations((prev) => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      setIsAdding(false);
      setNewLoc({ name_ua: "", name_en: "", map_url: "", order_index: 0 });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Видалити цю локацію?")) return;
    setDeletingId(id);
    await supabase.from("locations").delete().eq("id", id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#4A7344]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Локації (Мапи)</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Точки продажу</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-[#4A7344] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#3d5f37] transition-all">
          <Plus size={16} strokeWidth={3} /> {isAdding ? "Скасувати" : "Додати"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm border-2 border-[#4A7344]/20 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="Місто / Вулиця (UA)" value={newLoc.name_ua} onChange={(e) => setNewLoc({ ...newLoc, name_ua: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7344]/50" />
            <input required type="text" placeholder="City / Street (EN)" value={newLoc.name_en} onChange={(e) => setNewLoc({ ...newLoc, name_en: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7344]/50" />
          </div>
          <input required type="url" placeholder="https://maps.google.com/..." value={newLoc.map_url} onChange={(e) => setNewLoc({ ...newLoc, map_url: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7344]/50" />
          <button type="submit" disabled={isSubmitting} className="w-full bg-[#4A7344] text-white font-bold py-3 rounded-xl flex justify-center items-center">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Зберегти локацію"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3">
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><MapPin size={20} /></div>
              <div>
                <p className="text-sm font-bold text-gray-800">{loc.name_ua}</p>
                <a href={loc.map_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline line-clamp-1 mt-0.5">Відкрити мапу</a>
              </div>
            </div>
            <button onClick={() => handleDelete(loc.id)} disabled={deletingId === loc.id} className="text-gray-300 hover:text-red-500 p-2">
              {deletingId === loc.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          </div>
        ))}
        {locations.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">Локацій поки немає.</p>}
      </div>
    </div>
  );
}