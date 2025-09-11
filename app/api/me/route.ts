// app/api/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

// Balikin info user berdasarkan cookie JWT httpOnly
export async function GET() {
    const session = await getUserFromCookie<{ id: number; email: string }>();
    if (!session) return NextResponse.json(null); // belum login

    // Ambil data user yang dibutuhin FE
    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { id: true, email: true, name: true, createdAt: true }, // createdAt ikut biar cocok tipe
    });

    return NextResponse.json(user);
}
