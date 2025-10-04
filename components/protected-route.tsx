// components/protected-route.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await fetch("/api/me", { cache: "no-store", credentials: "include" });
        const me = await r.json();
        if (!alive) return;

        if (me) {
          setStatus("authed");
        } else {
          setStatus("guest");
          router.replace("/login");
        }
      } catch {
        if (!alive) return;
        setStatus("guest");
        router.replace("/login");
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  if (status === "loading") {
    // Loader ringan (hindari redirect saat loading supaya tak kedip/loop)
    return <div className="p-6 text-sm text-muted-foreground">Memuat…</div>;
  }

  if (status === "guest") return null;

  return <>{children}</>;
}
