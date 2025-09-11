// lib/auth-helpers.ts
"use server";

import { cookies } from "next/headers";
import { COOKIE_NAME, verifyToken } from "./auth";

/**
 * Set cookie auth (httpOnly) — Next 15: cookies() adalah Promise
 */
export async function setAuthCookie(token: string) {
    (await cookies()).set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 hari
    });
}

/**
 * Ambil user dari cookie (kalau ada)
 */
export async function getUserFromCookie<T = any>() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    try {
        return verifyToken<T>(token);
    } catch {
        return null;
    }
}

/**
 * Hapus cookie auth (logout)
 */
export async function clearAuthCookie() {
    (await cookies()).set(COOKIE_NAME, "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });
}
