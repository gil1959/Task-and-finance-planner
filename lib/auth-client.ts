"use client";

// Bentuk user yang dipakai di FE (samakan dengan /api/me)
export type SessionUser = { id: number; email: string; name: string | null } | null;

// --- GET /api/me (cek sesi dari cookie httpOnly via server) ---
export async function getCurrentSession(): Promise<SessionUser> {
    try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) return null;
        return (await res.json()) as SessionUser;
    } catch {
        return null;
    }
}

// --- POST /api/auth/login ---
export async function login({ email, password }: { email: string; password: string }) {
    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const { error } = await res.json().catch(() => ({ error: "Login failed" }));
            return { success: false, error };
        }
        const user = (await res.json()) as { id: number; email: string; name: string | null };
        return { success: true, user };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// --- POST /api/auth/register ---
export async function register({ name, email, password }: { name: string; email: string; password: string }) {
    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
            const { error } = await res.json().catch(() => ({ error: "Register failed" }));
            return { success: false, error };
        }
        const user = (await res.json()) as { id: number; email: string; name: string | null };
        return { success: true, user };
    } catch {
        return { success: false, error: "Network error" };
    }
}

// --- DELETE /api/auth/login (logout & clear cookie) ---
export async function logout() {
    try {
        await fetch("/api/auth/login", { method: "DELETE" });
    } catch {
        // ignore
    }
}
