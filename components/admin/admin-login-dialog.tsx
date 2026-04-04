"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AdminLoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminLoginDialog({
  open,
  onOpenChange,
}: AdminLoginDialogProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("admin@maomi.cafe");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signError) {
      setError(t.adminSignInError);
      return;
    }
    onOpenChange(false);
    setPassword("");
    router.push("/admin");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-[#4A7344]/20">
        <DialogHeader>
          <DialogTitle>{t.adminLoginTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">{t.adminEmail}</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">{t.adminPassword}</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full bg-[#4A7344] font-semibold text-white hover:bg-[#3d6238]"
            disabled={loading}
          >
            {loading ? "…" : t.adminSignIn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
