import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Добавляем импорт LocaleProvider, чтобы ошибка исчезла
import { LocaleProvider } from "@/components/providers/locale-provider";
// Добавляем импорт DecorationCats
import { DecorationCats } from "@/components/decorations/decoration-cats";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MAOMI Bubble Tea",
  description: "Bubble Tea & More",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ua">
      <body className={inter.className}>
        {/* Оборачиваем всё приложение в LocaleProvider, чтобы ошибка исчезла */}
        <LocaleProvider>
          <div className="relative min-h-screen">
            {/* Котики на фоне на самом нижнем слое z-index */}
            <DecorationCats />
            
            {/* Основной контент поверх котиков */}
            {children}
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}