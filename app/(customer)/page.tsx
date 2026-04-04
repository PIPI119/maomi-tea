import { MenuView } from "@/components/menu/menu-view";

export default function CustomerPage() {
  return (
    <div className="space-y-6">
      <div className="px-6 pt-4">
        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
          Maomi <span className="text-[#4A7344]">Menu</span>
        </h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Твій ідеальний бабл-ті тут 🧋
        </p>
      </div>
      
      <MenuView /> 
    </div>
  );
}