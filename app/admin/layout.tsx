import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f0e0] text-[#2D2D2D]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6">
        {children}
      </div>
    </div>
  );
}
