"use client";

import { useRef, useCallback, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Coffee, MapPin, ShoppingBag } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { AdminLoginDialog } from "@/components/admin/admin-login-dialog";
import { cn } from "@/lib/utils";

const TAP_WINDOW_MS = 3000;
const REQUIRED_TAPS = 10;
const SINGLE_NAV_DELAY_MS = 500;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const [adminOpen, setAdminOpen] = useState(false);

  const locTapCountRef = useRef(0);
  const locWindowStartRef = useRef(0);
  const locNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onLocationsClick = useCallback(() => {
    const now = Date.now();
    if (locNavTimerRef.current) {
      clearTimeout(locNavTimerRef.current);
      locNavTimerRef.current = null;
    }

    if (now - locWindowStartRef.current > TAP_WINDOW_MS) {
      locTapCountRef.current = 0;
      locWindowStartRef.current = now;
    }

    locTapCountRef.current += 1;

    if (locTapCountRef.current >= REQUIRED_TAPS) {
      locTapCountRef.current = 0;
      locWindowStartRef.current = 0;
      setAdminOpen(true);
      return;
    }

    locNavTimerRef.current = setTimeout(() => {
      if (locTapCountRef.current === 1) {
        router.push("/locations");
      }
      locTapCountRef.current = 0;
      locWindowStartRef.current = 0;
      locNavTimerRef.current = null;
    }, SINGLE_NAV_DELAY_MS);
  }, [router]);

  const menuActive = pathname === "/" || pathname === "";
  const orderActive = pathname.startsWith("/order");
  const locationsActive = pathname.startsWith("/locations");

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#4A7344]/20 bg-[#FFFDD0]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm"
        aria-label="Primary"
      >
        <div className="mx-auto flex w-full max-w-md items-stretch justify-around px-2 pt-1">
          <Link
            href="/"
            className={cn(
              "flex min-h-[48px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-t-lg py-2 text-[11px] font-semibold transition-colors",
              menuActive
                ? "text-[#4A7344]"
                : "text-[#2D2D2D]/55 hover:text-[#4A7344]/80",
            )}
            aria-current={menuActive ? "page" : undefined}
          >
            <Coffee
              className={cn(
                "h-6 w-6",
                menuActive ? "stroke-[2.5px]" : "stroke-[2px]",
              )}
              aria-hidden
            />
            <span>{t.navMenu}</span>
          </Link>

          <Link
            href="/order"
            className={cn(
              "flex min-h-[48px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-t-lg py-2 text-[11px] font-semibold transition-colors",
              orderActive
                ? "text-[#4A7344]"
                : "text-[#2D2D2D]/55 hover:text-[#4A7344]/80",
            )}
            aria-current={orderActive ? "page" : undefined}
          >
            <ShoppingBag
              className={cn(
                "h-6 w-6",
                orderActive ? "stroke-[2.5px]" : "stroke-[2px]",
              )}
              aria-hidden
            />
            <span>{t.navOrder}</span>
          </Link>

          <button
            type="button"
            onClick={onLocationsClick}
            className={cn(
              "flex min-h-[48px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-t-lg py-2 text-[11px] font-semibold transition-colors",
              locationsActive
                ? "text-[#4A7344]"
                : "text-[#2D2D2D]/55 hover:text-[#4A7344]/80",
            )}
            aria-current={locationsActive ? "page" : undefined}
          >
            <MapPin
              className={cn(
                "h-6 w-6",
                locationsActive ? "stroke-[2.5px]" : "stroke-[2px]",
              )}
              aria-hidden
            />
            <span>{t.navLocations}</span>
          </button>
        </div>
      </nav>

      <AdminLoginDialog open={adminOpen} onOpenChange={setAdminOpen} />
    </>
  );
}
