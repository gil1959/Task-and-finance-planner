import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/auth-helpers";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();
        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { email, password: hash, name } });

        const token = signToken({ id: user.id, email: user.email });
        await setAuthCookie(token);

        return NextResponse.json({ id: user.id, email: user.email, name: user.name });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
