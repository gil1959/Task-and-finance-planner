"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.status === 403) {
        setError(data.error || "Email belum diverifikasi.");
        setUnverifiedEmail(email);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Email atau password salah");
        return;
      }


      router.replace("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async () => {
    if (!unverifiedEmail) return;
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      alert("Tautan verifikasi dikirim ulang. Cek inbox/spam.");
    } catch {
      alert("Gagal mengirim ulang tautan. Coba lagi nanti.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
            <CardDescription className="text-base">Akses dashboard tugas & keuangan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} className="h-11" />
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : (<><LogIn className="mr-2 h-4 w-4" />Masuk</>)}
              </Button>

              {unverifiedEmail && (
                <Button type="button" variant="outline" className="w-full h-11 text-base mt-2" onClick={resend} disabled={isSubmitting}>
                  Kirim Ulang Email Verifikasi
                </Button>
              )}

              <div className="mt-2 text-center text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Daftar
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
