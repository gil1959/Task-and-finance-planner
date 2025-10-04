import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (!user.emailVerified) {
            return NextResponse.json(
                { error: "Email belum diverifikasi. Cek inbox/spam atau kirim ulang tautan verifikasi." },
                { status: 403 }
            );
        }

        const token = signToken({ id: user.id, email: user.email });

        // ⬇️ Set cookie pada response yang dikembalikan (ini kuncinya)
        const res = NextResponse.json(
            { id: user.id, email: user.email, name: user.name },
            { status: 200 }
        );

        res.cookies.set("fp_token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 hari
        });

        return res;
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Terjadi kesalahan" }, { status: 500 });
    }
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("fp_token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
    return res;
}
