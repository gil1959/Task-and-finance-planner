// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // halaman yang diproteksi
    const isProtected = pathname.startsWith("/dashboard");
    const isLogin = pathname === "/login";

    // cookie JWT yang kamu pakai
    const token = req.cookies.get("fp_token")?.value;

    // belum login tapi masuk area proteksi -> lempar ke login
    if (!token && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    // sudah login tapi ke /login -> lempar ke dashboard
    if (token && isLogin) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/dashboard/:path*", "/materials/:path*"],
};
