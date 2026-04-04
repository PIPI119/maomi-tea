"use client";

import { toast as sonnerToast } from "sonner";

/** Shadcn-style helper backed by Sonner (visible errors for admin Supabase actions). */
export function toast(opts: {
  variant?: "default" | "destructive";
  title?: string;
  description?: string;
}) {
  const text = opts.description ?? opts.title ?? "";
  if (opts.variant === "destructive") {
    sonnerToast.error(text || "Something went wrong");
    return;
  }
  if (text) sonnerToast.message(text);
}
