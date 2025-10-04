import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Token tidak ada" }, { status: 400 });

    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record) return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });

    if (record.expiresAt < new Date()) {
        await prisma.verificationToken.delete({ where: { id: record.id } });
        return NextResponse.json({ error: "Token kedaluwarsa" }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { id: record.id } });

    return NextResponse.json({ message: "Email berhasil diverifikasi. Silakan login." });
}
