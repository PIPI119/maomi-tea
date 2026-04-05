import type { CartLine } from "@/store/order-store";
import type { Locale } from "@/lib/dictionaries";

/**
 * Завжди українською: "700ML • ТАРО • 🧊 ХОЛОДНИЙ • 🍭 СОЛОДКІСТЬ: 3 • ТАПІОКА"
 */
export function formatBaristaLine(line: CartLine, locale: Locale): string {
  const parts: string[] = [];
  
  // 1. Об'єм
  parts.push(`${line.sizeMl}ML`);

  // 2. Назва напою (ЗАВЖДИ УКРАЇНСЬКОЮ)
  parts.push(line.nameUa.toUpperCase());

  // 3. Температура (ЗАВЖДИ УКРАЇНСЬКОЮ)
  if (line.temperature === "warm") {
    parts.push("♨️ ТЕПЛИЙ");
  } else {
    parts.push("🧊 ХОЛОДНИЙ");
  }

  // 4. Солодкість (ЗАВЖДИ УКРАЇНСЬКОЮ)
  parts.push(`🍭 СОЛОДКІСТЬ: ${line.sweetness ?? 4}`);

  // 5. Топінги (ЗАВЖДИ УКРАЇНСЬКОЮ)
  for (const t of line.toppings) {
    parts.push(t.name_ua.toUpperCase());
  }
  
  // 6. Додатки (Екстра) (ЗАВЖДИ УКРАЇНСЬКОЮ)
  for (const s of line.extras) {
    parts.push(s.name_ua.toUpperCase());
  }

  return parts.join(" • ");
}

export function formatOrderSummaryForBarista(
  lines: CartLine[],
  locale: Locale,
): string {
  if (lines.length === 0) return "";
  if (lines.length === 1) return formatBaristaLine(lines[0], locale);
  return lines.map((l) => formatBaristaLine(l, locale)).join("\n\n"); // Додав подвійний перенос для зручності читання
}