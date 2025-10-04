import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: "Email & password wajib diisi" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });

        const passwordHash = await bcrypt.hash(password, 12);
        const finalName = (typeof name === "string" && name.trim()) || String(email).split("@")[0];

        const user = await prisma.user.create({
            data: { email, password: passwordHash, name: finalName, emailVerified: null },
            select: { id: true, email: true },
        });

        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma.verificationToken.create({ data: { token, userId: user.id, expiresAt: expires } });

        let mailSent = true;
        try {
            await sendVerificationEmail(user.email, token);
        } catch (e: any) {
            console.error("EMAIL SEND FAILED:", e?.response || e);
            mailSent = false;
        }

        // Penting: JANGAN login-in user di sini
        return NextResponse.json({
            message: mailSent
                ? "Registrasi berhasil. Cek email untuk verifikasi."
                : "Registrasi berhasil, tapi email verifikasi gagal dikirim. Klik 'Kirim Ulang Verifikasi' di halaman berikutnya.",
            mailSent,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
    }
}
