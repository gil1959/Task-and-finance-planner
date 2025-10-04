"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type State = "loading" | "success" | "already" | "error";

export default function VerifyPage() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");
    const [state, setState] = useState<State>("loading");
    const [msg, setMsg] = useState("Memverifikasi email…");

    useEffect(() => {
        async function run() {
            if (!token) {
                setState("error");
                setMsg("Token tidak ditemukan pada URL.");
                return;
            }
            try {
                const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    if (data?.alreadyVerified) {
                        setState("already");
                        setMsg(data?.message || "Email sudah terverifikasi.");
                    } else {
                        setState("success");
                        setMsg(data?.message || "Email berhasil diverifikasi.");
                    }
                    // auto direct ke login
                    setTimeout(() => router.replace("/login?verified=1"), 1000);
                } else if (res.status === 409 || res.status === 208) {
                    setState("already");
                    setMsg(data?.message || "Email sudah terverifikasi.");
                    setTimeout(() => router.replace("/login?verified=1"), 1000);
                } else {
                    setState("error");
                    setMsg(data?.error || data?.message || "Verifikasi gagal. Token tidak valid/expired.");
                }
            } catch {
                setState("error");
                setMsg("Terjadi kesalahan jaringan saat memverifikasi.");
            }
        }
        run();
    }, [token, router]);

    const Title = () => {
        if (state === "success") return "Berhasil";
        if (state === "already") return "Sudah Terverifikasi";
        if (state === "error") return "Gagal";
        return "Memverifikasi…";
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900/50 dark:to-zinc-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 shadow-sm p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl
                          bg-gray-100 dark:bg-zinc-800">
                        {/* icon mail/check */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                            className="h-6 w-6 text-gray-900 dark:text-gray-100">
                            {state === "error" ? (
                                <path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20Zm1 5v6h-2V7h2Zm0 8v2h-2v-2h2Z" />
                            ) : (
                                <path fill="currentColor" d="M20 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8l8 5 8-5Zm-8 3L4 6h16l-8 5Z" />
                            )}
                        </svg>
                    </div>

                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{Title()}</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{msg}</p>

                    {/* ACTIONS */}
                    {state === "error" ? (
                        <div className="mt-5 flex items-center justify-center gap-3">
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm"
                            >
                                Ke Halaman Login
                            </Link>
                            <Link
                                href="/resend-verification"
                                className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90 text-sm"
                            >
                                Kirim Ulang Verifikasi
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-5">
                            <p className="text-xs text-gray-500 dark:text-gray-500">Mengalihkan ke halaman login…</p>
                            <Link
                                href="/login"
                                className="inline-block mt-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm"
                            >
                                Pergi Sekarang
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
