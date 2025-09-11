"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppStore } from "@/lib/store";
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAppStore((s) => s.register);
  const isLoading = useAppStore((s) => s.auth.isLoading);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    const result = await register(formData.name, formData.email, formData.password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Terjadi kesalahan saat mendaftar");
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const passwordRequirements = [
    { text: "Minimal 6 karakter", met: formData.password.length >= 6 },
    { text: "Password dan konfirmasi sama", met: formData.password === formData.confirmPassword && formData.confirmPassword !== "" },
  ];

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
            <CardTitle className="text-2xl font-bold">Buat Akun Baru</CardTitle>
            <CardDescription className="text-base">Daftar untuk mulai mengelola tugas dan keuangan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" name="name" type="text" placeholder="Masukkan nama lengkap" value={formData.name} onChange={onChange} disabled={isLoading} className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="nama@email.com" value={formData.email} onChange={onChange} disabled={isLoading} className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Buat password" value={formData.password} onChange={onChange} disabled={isLoading} className="h-11 pr-10" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Ulangi password" value={formData.confirmPassword} onChange={onChange} disabled={isLoading} className="h-11 pr-10" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent" onClick={() => setShowConfirmPassword((v) => !v)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              {(formData.password || formData.confirmPassword) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Persyaratan Password:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`h-4 w-4 ${req.met ? "text-green-500" : "text-muted-foreground"}`} />
                        <span className={req.met ? "text-green-600" : "text-muted-foreground"}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                {isLoading ? "Memproses..." : (<><UserPlus className="mr-2 h-4 w-4" />Daftar Sekarang</>)}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <p className="font-medium text-primary">Keuntungan Bergabung</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✓ Prioritas tugas otomatis</p>
                <p>✓ Pelacakan keuangan lengkap</p>
                <p>✓ Dashboard analitik</p>
                <p>✓ Gratis selamanya</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
