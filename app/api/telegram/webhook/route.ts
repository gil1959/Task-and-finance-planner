import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram"; // helper yang sudah kamu punya

export async function POST(req: Request) {
    try {
        const update = await req.json();

        const message = update.message;
        const text: string = message?.text ?? "";
        const chatId: number | undefined = message?.chat?.id;

        if (!chatId || !text) {
            return NextResponse.json({ ok: true });
        }

        let code: string | null = null;

        if (text.startsWith("/start")) {
            const parts = text.split(" ");
            if (parts[1]) code = parts[1].trim();
        } else if (text.startsWith("/link")) {
            const parts = text.split(" ");
            if (parts[1]) code = parts[1].trim();
        }

        if (!code) {
            return NextResponse.json({ ok: true });
        }

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

        await prisma.user.update({
            where: { id: user.id },
            data: {
                telegramChatId: String(chatId),
                telegramLinkCode: null,
            },
        });

        await sendTelegramMessage(
            "✅ Akun Telegram kamu berhasil terhubung dengan Task & Finance Planner.\n\n" +
            "Sekarang pengingat jadwal dan notifikasi lain akan dikirim ke chat ini.",
            String(chatId)
        );

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ ok: false, error: error?.message || String(error) }, { status: 500 });
    }
}
