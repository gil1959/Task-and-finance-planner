import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

export async function POST(req: Request) {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email wajib" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    // balasan generik agar tidak bocorkan apakah email terdaftar
    if (!user) return NextResponse.json({ message: "Jika email terdaftar, tautan telah dikirim." });
    if (user.emailVerified) return NextResponse.json({ message: "Email sudah diverifikasi." });

    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.verificationToken.create({ data: { token, userId: user.id, expiresAt: expires } });

    try {
        await sendVerificationEmail(user.email, token);
    } catch (e: any) {
        console.error("RESEND FAILED:", e?.response || e);
    }
    return NextResponse.json({ message: "Tautan verifikasi telah dikirim (cek spam juga)." });
}
