"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [linkCode, setLinkCode] = useState<string | null>(null);

  // 1) Cek status awal telegram
  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/telegram/status");
      if (!res.ok) return;
      const data = await res.json();
      setConnected(!!data.connected);
    };
    fetchStatus();
  }, []);

  // 2) Generate kode pairing
  const handleStartLink = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/start-link", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal generate kode.");
        return;
      }

      setLinkCode(data.code);
      setConnected(false);

      // 🔗 deep-link ke Telegram
      const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
      if (botUsername) {
        const deepLink = `https://t.me/${botUsername}?start=${data.code}`;

        // buka Telegram di tab baru (atau app)
        if (typeof window !== "undefined") {
          window.open(deepLink, "_blank");
        }

        alert(
          [
            "Telegram akan terbuka otomatis.",
            "",
            "Kalau belum terbuka, klik link ini secara manual:",
            deepLink,
            "",
            "Setelah Telegram terbuka, cukup tekan tombol START.",
          ].join("\n")
        );
      } else {
        // fallback kalau lupa set env
        alert(
          [
            "Kode pairing kamu:",
            "",
            `   ${data.code}`,
            "",
            "Tolong kirim ke bot dengan format:",
            `   /link ${data.code}`,
          ].join("\n")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // 3) PUTUSKAN KONEKSI
  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/disconnect", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // KELIATAN kalau ada masalah
        alert(data.error || "Gagal memutuskan koneksi Telegram.");
        return;
      }

      setConnected(false);
      setLinkCode(null);
      alert("Koneksi Telegram diputus.");
    } catch (err) {
      console.error(err);
      alert("Terjadi error saat memutuskan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  // 4) KIRIM TEST NOTIF (ini yang tadi belum ada)
  const handleTestNotif = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/test", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Gagal mengirim test notif");
        return;
      }

      alert("Test notif sudah dikirim ke Telegram kamu. Cek bot-nya ya 🚀");
    } catch (err) {
      console.error(err);
      alert("Terjadi error saat mengirim test notif");
    } finally {
      setLoading(false);
    }
  };

  // ⛔ JANGAN ADA <Button ...> DI SINI LAGI
  // Hapus blok <Button variant="outline" onClick={handleTestNotif}> ... </Button> yang tadi nyasar

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Pengaturan profil dan preferensi aplikasi
            </p>
          </div>

          {/* Telegram integration card */}
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <h2 className="text-lg font-semibold">Telegram Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Hubungkan akun Telegram kamu untuk menerima pengingat jadwal kuliah
              dan notifikasi lain langsung di Telegram.
            </p>

            <div className="flex flex-wrap gap-2 items-center">
              <Button
                disabled={loading}
                onClick={handleStartLink}
                variant={connected ? "outline" : "default"}
              >
                {connected ? "Generate Ulang Kode" : "Connect Telegram"}
              </Button>

              {connected && (
                <>
                  <Button
                    disabled={loading}
                    variant="outline"
                    onClick={handleTestNotif}
                  >
                    Kirim Test Notif
                  </Button>

                  <Button
                    disabled={loading}
                    variant="destructive"
                    onClick={handleDisconnect}
                  >
                    Putuskan Koneksi
                  </Button>
                </>
              )}
            </div>

            {linkCode && !connected && (
              <p className="text-xs text-muted-foreground">
                Kode pairing kamu: <span className="font-mono">{linkCode}</span> — kirim
                ke bot dengan format: <span className="font-mono">/link {linkCode}</span>.
              </p>
            )}

            {connected && (
              <p className="text-xs text-emerald-600">
                ✅ Telegram sudah terhubung. Pengingat jadwal akan dikirim ke chat bot ini.
              </p>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
