import type { CartLine } from "@/store/order-store";
import type { Locale } from "@/lib/dictionaries";

/**
 * Giant line for staff: "700ML • ТАРО • ТАПІОКА • СОЛОДКИЙ СИРОП"
 */
export function formatBaristaLine(line: CartLine, locale: Locale): string {
  const parts: string[] = [];
  parts.push(`${line.sizeMl}ML`);

  const drink =
    locale === "ua"
      ? line.nameUa.toUpperCase()
      : line.nameEn.toUpperCase();
  parts.push(drink);

  for (const t of line.toppings) {
    parts.push(
      locale === "ua" ? t.name_ua.toUpperCase() : t.name_en.toUpperCase(),
    );
  }
  for (const s of line.extras) {
    parts.push(
      locale === "ua" ? s.name_ua.toUpperCase() : s.name_en.toUpperCase(),
    );
  }

  return parts.join(" • ");
}

export function formatOrderSummaryForBarista(
  lines: CartLine[],
  locale: Locale,
): string {
  if (lines.length === 0) return "";
  if (lines.length === 1) return formatBaristaLine(lines[0], locale);
  return lines.map((l) => formatBaristaLine(l, locale)).join("\n");
}
