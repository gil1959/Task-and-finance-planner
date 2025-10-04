"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResendVerificationPage() {
    const [state, setState] = useState<"idle" | "sending" | "sent" | "already" | "error">("idle");
    const [msg, setMsg] = useState("");
    const router = useRouter();

    async function resend() {
        setState("sending");
        setMsg("Mengirim email verifikasi…");
        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // tanpa body — server ambil dari session
            });
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                if (data?.alreadyVerified) {
                    setState("already");
                    setMsg(data?.message || "Email sudah terverifikasi.");
                    setTimeout(() => router.replace("/login?verified=1"), 800);
                } else {
                    setState("sent");
                    setMsg(data?.message || "Email verifikasi terkirim. Cek inbox/spam.");
                }
            } else if (res.status === 409 || res.status === 208) {
                setState("already");
                setMsg(data?.message || "Email sudah terverifikasi.");
                setTimeout(() => router.replace("/login?verified=1"), 800);
            } else {
                setState("error");
                setMsg(data?.error || data?.message || "Gagal mengirim email verifikasi.");
            }
        } catch {
            setState("error");
            setMsg("Terjadi kesalahan jaringan.");
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900/50 dark:to-zinc-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl
                          bg-gray-100 dark:bg-zinc-800">
                        {/* icon paper-plane */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900 dark:text-gray-100" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.4 20.6 22 12 3.4 3.4 3 10l12 2-12 2z" />
                        </svg>
                    </div>

                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Kirim Ulang Verifikasi</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Tekan tombol di bawah untuk mengirim ulang email verifikasi ke akun kamu.
                    </p>

                    <div className="mt-5 flex items-center justify-center gap-3">
                        <button
                            onClick={resend}
                            disabled={state === "sending"}
                            className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90 disabled:opacity-60 text-sm"
                        >
                            {state === "sending" ? "Mengirim…" : "Kirim Ulang"}
                        </button>

                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm"
                        >
                            Ke Halaman Login
                        </Link>
                    </div>

                    {msg && <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">{msg}</p>}

                    {state === "sent" && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            Jika sudah verifikasi, kamu akan diarahkan ke login.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
