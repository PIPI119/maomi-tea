"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, UploadCloud, X, MapPin, MousePointer2 } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { compressProductImage } from "@/lib/image-compression";
import { publicUrlToStoragePath } from "@/lib/supabase/storage-path";
import type { CategoryRow, ProductRow } from "@/lib/types/catalog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// === ІМПОРТУЄМО НАШІ НОВІ КОМПОНЕНТИ ===
import { CategoriesManager } from "@/components/admin/categories-manager";
import { ModifiersManager } from "@/components/admin/modifiers-manager";

type ProductJoined = ProductRow & {
  categories: { name_ua: string; name_en: string } | null;
};

function coerceIsAvailable(value: unknown): boolean {
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "t" || v === "1" || v === "yes") return true;
    return false;
  }
  if (typeof value === "number" && value === 1) return true;
  return false;
}

function normalizeAdminProduct(row: ProductJoined): ProductJoined {
  return { ...row, is_available: coerceIsAvailable(row.is_available) };
}

export function AdminMenuTab() {
  const { locale, t } = useLocale();
  const router = useRouter();
  
  const [products, setProducts] = useState<ProductJoined[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Котики и Локации
  const [cats, setCats] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [loc1, setLoc1] = useState("");
  const [loc2, setLoc2] = useState("");
  const [locBusy, setLocBusy] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [catBusy, setCatBusy] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [formNameUa, setFormNameUa] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formDescUa, setFormDescUa] = useState("");
  const [formDescEn, setFormDescEn] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPriceBase, setFormPriceBase] = useState("140");
  const [formPriceLarge, setFormPriceLarge] = useState("160");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [addImageBusy, setAddImageBusy] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ProductJoined | null>(null);
  const [editNameUa, setEditNameUa] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editDescUa, setEditDescUa] = useState("");
  const [editDescEn, setEditDescEn] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editPriceBase, setEditPriceBase] = useState("");
  const [editPriceLarge, setEditPriceLarge] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editImageBusy, setEditImageBusy] = useState(false);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [togglingIds, setTogglingIds] = useState<string[]>([]);
  const [banner, setBanner] = useState<{ tone: "info" | "success" | "error"; text: string } | null>(null);

 const load = useCallback(async () => {
  const supabase = createSupabaseBrowserClient();
  setLoading(true);
  
  try {
    // Грузим товары (это самое важное!)
    const { data: pData, error: pErr } = await supabase
      .from("products")
      .select("*, categories(name_ua, name_en)")
      .order("name_en", { ascending: true });
    
    if (pErr) console.error("Ошибка в товарах:", pErr);
    if (pData) setProducts(pData.map(normalizeAdminProduct));

    // Остальное грузим "по желанию" — если упадет, меню не пропадет
    const { data: cData } = await supabase.from("categories").select("*").order("order_index", { ascending: true });
    if (cData) setCategories(cData);

    const { data: aData } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
    if (aData) {
      setLogoUrl(aData.logo_url);
      setLoc1(aData.location_1_url || "");
      setLoc2(aData.location_2_url || "");
    }

    const { data: dData } = await supabase.from("decorations").select("*");
    if (dData) setCats(dData);

  } catch (err) {
    console.error("Глобальная ошибка загрузки:", err);
  } finally {
    setLoading(false); 
  }
}, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!banner || banner.tone !== "success") return;
    const id = window.setTimeout(() => setBanner(null), 3200);
    return () => window.clearTimeout(id);
  }, [banner]);

  // --- ИНТЕРАКТИВНАЯ РАССТАНОВКА ---
  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedCatId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const supabase = createSupabaseBrowserClient();
    await supabase.from("decorations").update({ pos_x: x, pos_y: y }).eq("id", selectedCatId);
    setCats(prev => prev.map(c => c.id === selectedCatId ? { ...c, pos_x: x, pos_y: y } : c));
  };

  // --- СОХРАНЕНИЕ ЛОКАЦИЙ ---
  async function onSaveLocations() {
    setLocBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: existing } = await supabase.from("app_settings").select("id").limit(1).maybeSingle();
      const payload = { location_1_url: loc1, location_2_url: loc2 };
      
      if (existing?.id) {
        await supabase.from("app_settings").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("app_settings").insert(payload);
      }
      setBanner({ tone: "success", text: "Локації збережено!" });
    } catch (err) {
      setBanner({ tone: "error", text: "Помилка збереження" });
    } finally { setLocBusy(false); }
  }

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    e.target.value = "";
    if (!raw) return;
    
    setLogoBusy(true);
    setBanner({ tone: "info", text: "Оновлення лого..." });
    
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = raw.name.split('.').pop() || "png";
      const path = `logo-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from("product-images").upload(path, raw, { cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      const { data: existing } = await supabase.from("app_settings").select("id").limit(1).maybeSingle();
      
      if (existing?.id) {
        await supabase.from("app_settings").update({ logo_url: publicUrl }).eq("id", existing.id);
      } else {
        await supabase.from("app_settings").insert({ logo_url: publicUrl });
      }

      setLogoUrl(publicUrl);
      setBanner({ tone: "success", text: "Логотип оновлено!" });
      router.refresh();
    } catch (err) {
      setBanner({ tone: "error", text: "Помилка лого" });
    } finally { setLogoBusy(false); }
  }

  async function onAddCat(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    if (!raw || cats.length >= 10) return;
    setCatBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const path = `cats/cat-${Date.now()}.png`;
      await supabase.storage.from("product-images").upload(path, raw);
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      await supabase.from("decorations").insert({ image_url: publicUrl, pos_x: 50, pos_y: 50 });
      await load();
      setBanner({ tone: "success", text: "Котика додано!" });
    } catch (err) { setBanner({ tone: "error", text: "Помилка" }); }
    finally { setCatBusy(false); }
  }

  async function onDeleteCat(id: string, url: string) {
    if (!confirm("Видалити цього котика?")) return;
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("decorations").delete().eq("id", id);
      const path = publicUrlToStoragePath(url, "product-images");
      if (path) await supabase.storage.from("product-images").remove([path]);
      await load();
    } catch (err) { console.error(err); }
  }

  function openEditor(p: ProductJoined) {
    setEditing(p);
    setEditNameUa(p.name_ua); setEditNameEn(p.name_en);
    setEditDescUa(p.description_ua); setEditDescEn(p.description_en);
    setEditCategoryId(p.category_id);
    setEditPriceBase(String(p.price_base_uah)); setEditPriceLarge(String(p.price_large_uah));
    setEditFile(null); setEditorOpen(true);
  }

  function closeEditor() { setEditorOpen(false); setEditing(null); setEditFile(null); setEditPreviewUrl(null); }
  function closeAdd() { setAddOpen(false); setFormFile(null); }

  useEffect(() => {
    if (!editFile) { setEditPreviewUrl(null); return; }
    const u = URL.createObjectURL(editFile);
    setEditPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [editFile]);

  async function onToggleStock(id: string, checked: boolean) {
    const row = products.find((p) => p.id === id);
    const previous = row ? coerceIsAvailable(row.is_available) : false;
    setTogglingIds((prev) => [...prev, id]);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_available: checked } : p)));

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("products").update({ is_available: checked }).eq("id", id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_available: previous } : p));
    } finally { setTogglingIds((prev) => prev.filter((x) => x !== id)); }
  }

  async function confirmDeleteProduct() {
    if (!editing) return;
    setDeleting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: delErr } = await supabase.from("products").delete().eq("id", editing.id);
      if (delErr) throw delErr;
      const path = publicUrlToStoragePath(editing.image_url, "product-images");
      if (path) await supabase.storage.from("product-images").remove([path]);
      closeEditor(); await load(); router.refresh();
      setBanner({ tone: "success", text: "Видалено" });
    } catch (err) { setBanner({ tone: "error", text: "Помилка" }); } 
    finally { setDeleting(false); }
  }

  async function onAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!formCategoryId || !formFile || addImageBusy) return;
    setSaving(true);
    setBanner({ tone: "info", text: "Збереження..." });
    try {
      const supabase = createSupabaseBrowserClient();
      const path = `products/${crypto.randomUUID()}.webp`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, formFile, { cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      const { error: insErr } = await supabase.from("products").insert({
        category_id: formCategoryId, name_ua: formNameUa.trim(), name_en: formNameEn.trim(),
        description_ua: formDescUa.trim(), description_en: formDescEn.trim(),
        price_base_uah: Number(formPriceBase), price_large_uah: Number(formPriceLarge),
        image_url: publicUrl, is_available: true,
      });
      if (insErr) throw insErr;
      setFormNameUa(""); setFormNameEn(""); setFormFile(null);
      setBanner({ tone: "success", text: "Додано" });
      closeAdd(); await load(); router.refresh();
    } catch (err) { setBanner({ tone: "error", text: "Помилка" }); } 
    finally { setSaving(false); }
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || editImageBusy) return;
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      let image_url = editing.image_url;
      if (editFile) {
        const path = `products/${crypto.randomUUID()}.webp`;
        await supabase.storage.from("product-images").upload(path, editFile, { cacheControl: "3600" });
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
        image_url = publicUrl;
      }
      await supabase.from("products").update({
        category_id: editCategoryId, name_ua: editNameUa.trim(), name_en: editNameEn.trim(),
        description_ua: editDescUa.trim(), description_en: editDescEn.trim(),
        price_base_uah: Number(editPriceBase), price_large_uah: Number(editPriceLarge), image_url,
      }).eq("id", editing.id);
      setBanner({ tone: "success", text: "Збережено" });
      closeEditor(); await load(); router.refresh();
    } catch (err) { setBanner({ tone: "error", text: "Помилка" }); } 
    finally { setSaving(false); }
  }

  async function onAddPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0]; if (!raw) return;
    setAddImageBusy(true);
    try { setFormFile(await compressProductImage(raw)); } catch (err) { setFormFile(null); } finally { setAddImageBusy(false); }
  }

  async function onEditPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0]; if (!raw) return;
    setEditImageBusy(true);
    try { setEditFile(await compressProductImage(raw)); } catch (err) { setEditFile(null); } finally { setEditImageBusy(false); }
  }

  if (loading) return <p className="p-4 text-sm">Завантаження...</p>;

  return (
    <div className="relative pb-24 bg-gray-50/30">
      {banner && (
        <div className={`fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg ${banner.tone === "error" ? "bg-red-500 text-white" : banner.tone === "success" ? "bg-green-500 text-white" : "bg-white text-green-900 ring-1 ring-green-200"}`}>
          {banner.tone === "info" && <Loader2 className="size-4 animate-spin" />}
          {banner.text}
        </div>
      )}

      {/* ОФОРМЛЕННЯ (ЛОГО, КАРТА КОТИКІВ, КАРТА GOOGLE) */}
      <section className="p-4 space-y-4">
        <div className="flex flex-col items-center rounded-[2.5rem] border border-[#4A7344]/10 bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-black text-gray-800 uppercase tracking-widest text-xs">Бренд та Оформлення</h2>
          
          {/* ЛОГОТИП */}
          <div className="relative mb-4 size-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
            {logoUrl ? <Image src={logoUrl} alt="Logo" fill className="object-cover" unoptimized /> : <span className="text-gray-300">Empty</span>}
            {logoBusy && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Loader2 className="size-6 animate-spin text-white" /></div>}
          </div>
          <label className="mb-10 flex cursor-pointer items-center gap-2 rounded-xl bg-gray-50 px-5 py-2.5 text-[10px] font-black text-[#4A7344] uppercase tracking-tighter shadow-sm border border-gray-100">
            <UploadCloud className="size-3.5" /> Оновити лого
            <input type="file" accept="image/*" className="hidden" onChange={onLogoChange} disabled={logoBusy} />
          </label>

          {/* МАПА КОТИКІВ (ИНТЕРАКТИВНАЯ) */}
          <div className="w-full border-t border-gray-50 pt-8 mb-8">
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Мапа розстановки декору</p>
            
            <div 
              onClick={handleMapClick}
              className="relative mx-auto w-full max-w-[240px] aspect-[9/16] bg-gray-50 rounded-[2rem] border-4 border-gray-100 overflow-hidden cursor-crosshair shadow-inner"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <p className="text-[8px] font-black text-gray-400 text-center uppercase">Клікни сюди,<br/>щоб змінити позицію</p>
              </div>

              {cats.slice(0, 10).map(cat => (
                <div 
                  key={cat.id}
                  className={`absolute size-10 rounded-full border-2 transition-all ${selectedCatId === cat.id ? 'border-green-500 scale-110 z-20 shadow-md' : 'border-white z-10 opacity-70'}`}
                  style={{ top: `${cat.pos_y}%`, left: `${cat.pos_x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <Image src={cat.image_url} alt="" fill className="object-cover rounded-full" unoptimized />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {cats.slice(0, 10).map((cat) => (
                <div key={cat.id} className="relative group">
                  <button 
                    onClick={() => setSelectedCatId(cat.id === selectedCatId ? null : cat.id)}
                    className={`relative size-12 rounded-full overflow-hidden border-4 transition-all ${selectedCatId === cat.id ? 'border-green-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={cat.image_url} alt="" fill className="object-cover" unoptimized />
                  </button>
                  <button 
                    onClick={() => onDeleteCat(cat.id, cat.image_url)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-sm"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {cats.length < 10 && (
                <label className="flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-white text-gray-300">
                  {catBusy ? <Loader2 className="animate-spin size-4" /> : <Plus size={20} />}
                  <input type="file" accept="image/*" className="hidden" onChange={onAddCat} disabled={catBusy} />
                </label>
              )}
            </div>
            <p className="text-center text-[9px] text-gray-400 mt-4 font-bold italic">Виберіть котика, а потім клікніть на мапу вище 🐾</p>
          </div>

          {/* ЛОКАЦИИ GOOGLE MAPS */}
          <div className="w-full border-t border-gray-50 pt-8">
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Google Мітки (Локації)</p>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[9px] font-black text-gray-400 uppercase ml-2">Maomi Point #1</Label>
                <Input 
                  value={loc1} 
                  onChange={(e) => setLoc1(e.target.value)} 
                  placeholder="Посилання на Google Maps..." 
                  className="bg-gray-50 rounded-2xl border-none text-xs h-11"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-black text-gray-400 uppercase ml-2">Maomi Point #2</Label>
                <Input 
                  value={loc2} 
                  onChange={(e) => setLoc2(e.target.value)} 
                  placeholder="Посилання на Google Maps..." 
                  className="bg-gray-50 rounded-2xl border-none text-xs h-11"
                />
              </div>
              <Button 
                onClick={onSaveLocations} 
                className="w-full h-12 rounded-2xl bg-[#4A7344] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#4A7344]/20 mt-2"
                disabled={locBusy}
              >
                {locBusy ? <Loader2 className="animate-spin size-4" /> : "Зберегти локації"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* === НОВІ РОЗДІЛИ АДМІНКИ (КАТЕГОРІЇ ТА ТОПІНГИ) === */}
      
      <section className="px-4 mt-6">
        <CategoriesManager />
      </section>

      <section className="px-4 mt-6">
        <ModifiersManager />
      </section>

      {/* МЕНЮ (ТВОИ ТОВАРЫ) */}
      <section className="space-y-4 px-4 mt-6">
        <h2 className="text-xl font-black text-gray-800 ml-2">Меню</h2>
        <ul className="flex flex-col gap-4">
          {products.map((p) => (
            <li key={p.id} className="rounded-[2.5rem] border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex gap-5">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-3xl bg-gray-50 shadow-inner">
                  <Image src={p.image_url} alt="" fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex flex-1 flex-col justify-between py-0.5">
                  <div>
                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{locale === "ua" ? p.name_ua : p.name_en}</p>
                    <p className="text-xs font-black text-[#4A7344] mt-1">{p.price_base_uah} ₴ <span className="text-gray-300 font-medium">/</span> {p.price_large_uah} ₴</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={coerceIsAvailable(p.is_available)} onChange={(e) => onToggleStock(p.id, e.target.checked)} disabled={togglingIds.includes(p.id)} className="size-4 rounded-md border-gray-300 accent-[#4A7344]" />
                      <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-600 transition-colors uppercase">Stock</span>
                    </label>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full bg-green-50/50 text-[#4A7344] px-4 text-[10px] font-black uppercase" onClick={() => openEditor(p)}>
                      <Pencil className="size-3 mr-1.5" /> Редаг.
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <button onClick={() => setAddOpen(true)} className="fixed bottom-8 right-8 z-40 flex size-16 items-center justify-center rounded-full bg-[#4A7344] text-white shadow-2xl active:scale-90 transition-transform">
        <Plus className="size-8" />
      </button>

      {/* ШТОРКА ДОБАВЛЕНИЯ */}
      <Drawer open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) closeAdd(); }} direction="bottom">
        <DrawerContent className="mx-auto max-h-[90vh] w-full max-w-md bg-[#FAFAFA]">
          <DrawerHeader className="bg-white border-b border-gray-100">
            <DrawerTitle>Новий товар</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto p-4 space-y-4">
            <form id="add-form" onSubmit={onAddProduct} className="flex flex-col space-y-4">
              <div className="space-y-1"><Label>Категорія</Label>
                <select className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4" value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} required>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{locale === "ua" ? c.name_ua : c.name_en}</option>))}
                </select>
              </div>
              <div className="space-y-1"><Label>Назва (UA)</Label><Input value={formNameUa} onChange={(e) => setFormNameUa(e.target.value)} required className="h-12 rounded-xl" /></div>
              <div className="space-y-1"><Label>Назва (EN)</Label><Input value={formNameEn} onChange={(e) => setFormNameEn(e.target.value)} required className="h-12 rounded-xl" /></div>
              <div className="space-y-1"><Label>Склад (UA)</Label><Textarea value={formDescUa} onChange={(e) => setFormDescUa(e.target.value)} rows={2} className="rounded-xl" /></div>
              <div className="space-y-1"><Label>Склад (EN)</Label><Textarea value={formDescEn} onChange={(e) => setFormDescEn(e.target.value)} rows={2} className="rounded-xl" /></div>
              <div className="space-y-1"><Label>Ціна 500мл</Label><Input type="number" value={formPriceBase} onChange={(e) => setFormPriceBase(e.target.value)} required className="h-12 rounded-xl" /></div>
              <div className="space-y-1"><Label>Ціна 700мл</Label><Input type="number" value={formPriceLarge} onChange={(e) => setFormPriceLarge(e.target.value)} required className="h-12 rounded-xl" /></div>
              <div className="p-4 rounded-xl border-2 border-dashed border-green-200 bg-green-50">
                <Label>Фото товару</Label>
                <input type="file" accept="image/*" onChange={onAddPhotoChange} className="mt-2 text-sm" />
              </div>
            </form>
          </div>
          <DrawerFooter className="bg-white border-t border-gray-100 p-4">
            <div className="flex gap-3">
              <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={closeAdd}>Скасувати</Button>
              <Button type="submit" form="add-form" className="h-12 flex-1 rounded-xl bg-[#4A7344] text-white font-bold" disabled={saving || !formFile}>Зберегти</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ШТОРКА РЕДАКТИРОВАНИЯ */}
      <Drawer open={editorOpen} onOpenChange={(o) => { setEditorOpen(o); if (!o) closeEditor(); }} direction="bottom">
        <DrawerContent className="mx-auto max-h-[90vh] w-full max-w-md bg-[#FAFAFA]">
          <DrawerHeader className="bg-white border-b border-gray-100">
            <DrawerTitle>Редагування</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto p-4 space-y-4">
            <form id="edit-form" onSubmit={onSaveEdit} className="flex flex-col space-y-4">
              {editing && <div className="relative mx-auto size-32 overflow-hidden rounded-2xl shadow-sm"><Image src={editPreviewUrl ?? editing.image_url} alt="" fill className="object-cover" unoptimized={!!editPreviewUrl} /></div>}
              <div className="space-y-1"><Label>Назва (UA)</Label><Input value={editNameUa} onChange={(e) => setEditNameUa(e.target.value)} required className="h-12 rounded-xl" /></div>
              <div className="space-y-1"><Label>Назва (EN)</Label><Input value={editNameEn} onChange={(e) => setEditNameEn(e.target.value)} required className="h-12 rounded-xl" /></div>
              <div className="space-y-1"><Label>Ціна 500мл</Label><Input type="number" value={editPriceBase} onChange={(e) => setEditPriceBase(e.target.value)} required className="h-12 rounded-xl" /></div>
              <div className="space-y-1"><Label>Ціна 700мл</Label><Input type="number" value={editPriceLarge} onChange={(e) => setEditPriceLarge(e.target.value)} required className="h-12 rounded-xl" /></div>
              <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                <Label>Замінити фото</Label>
                <input type="file" accept="image/*" onChange={onEditPhotoChange} className="mt-2 text-sm" />
              </div>
              <button type="button" className="py-4 font-bold text-red-500 bg-red-50 rounded-xl shadow-sm" onClick={() => { if(window.confirm("Удалити?")) confirmDeleteProduct(); }}>Видалити товар</button>
            </form>
          </div>
          <DrawerFooter className="bg-white border-t border-gray-100 p-4">
            <div className="flex gap-3">
              <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={closeEditor}>Скасувати</Button>
              <Button type="submit" form="edit-form" className="h-12 flex-1 rounded-xl bg-[#4A7344] text-white font-bold" disabled={saving}>Зберегти</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}