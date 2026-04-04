
import { MobileAppShell } from "@/components/layout/mobile-app-shell";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileAppShell>
      {children}
    </MobileAppShell>
  );
}
