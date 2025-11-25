import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram"; // helper yang sudah kamu punya

export async function POST(req: Request) {
    const update = await req.json();

    const message = update.message;
    const text: string = message?.text ?? "";
    const chatId: number | undefined = message?.chat?.id;

    if (!chatId || !text) {
        // ga ada yang bisa diproses
        return NextResponse.json({ ok: true });
    }

    // ============================
    // 1. Ambil kode dari /start KODE atau /link KODE
    // ============================
    let code: string | null = null;

    if (text.startsWith("/start")) {
        const parts = text.split(" ");
        if (parts[1]) code = parts[1].trim();
    } else if (text.startsWith("/link")) {
        const parts = text.split(" ");
        if (parts[1]) code = parts[1].trim();
    }

    // kalau bukan /start atau /link → abaikan aja (atau nanti bisa buat command lain)
    if (!code) {
        return NextResponse.json({ ok: true });
    }

    // ============================
    // 2. Cari user yang punya telegramLinkCode = code
    // ============================
    const user = await prisma.user.findFirst({
        where: { telegramLinkCode: code },
    });

    if (!user) {
        await sendTelegramMessage(
            "Kode tidak ditemukan atau sudah kadaluarsa. Coba generate ulang dari menu Settings di aplikasi.",
            String(chatId)
        );

        return NextResponse.json({ ok: true });
    }

    // ============================
    // 3. Simpan chatId ke user + hapus telegramLinkCode
    // ============================
    await prisma.user.update({
        where: { id: user.id },
        data: {
            telegramChatId: String(chatId),
            telegramLinkCode: null,
        },
    });

    // ============================
    // 4. Kirim pesan konfirmasi ke user
    // ============================
    await sendTelegramMessage(
        "✅ Akun Telegram kamu berhasil terhubung dengan Task & Finance Planner.\n\n" +
        "Sekarang pengingat jadwal dan notifikasi lain akan dikirim ke chat ini.",
        String(chatId)
    );

    return NextResponse.json({ ok: true });
}
