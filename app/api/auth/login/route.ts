import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { setAuthCookie, clearAuthCookie } from "@/lib/auth-helpers";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const token = signToken({ id: user.id, email: user.email });
        await setAuthCookie(token);

        return NextResponse.json({ id: user.id, email: user.email, name: user.name });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE() {
    await clearAuthCookie();
    return NextResponse.json({ ok: true });
}
