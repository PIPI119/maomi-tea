"use client";

import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-center"
      toastOptions={{
        classNames: {
          error:
            "!bg-red-50 !text-red-900 !border !border-red-200 shadow-lg",
        },
      }}
    />
  );
}
