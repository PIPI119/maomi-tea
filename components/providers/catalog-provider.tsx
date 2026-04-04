"use client";

import { useLayoutEffect, type ReactNode } from "react";
import type { MenuCatalog } from "@/lib/types/catalog";
import { useCatalogStore } from "@/store/catalog-store";

export function CatalogProvider({
  children,
  catalog,
}: {
  children: ReactNode;
  catalog: MenuCatalog;
}) {
  const hydrate = useCatalogStore((s) => s.hydrate);

  useLayoutEffect(() => {
    hydrate(catalog);
  }, [catalog, hydrate]);

  return children;
}
