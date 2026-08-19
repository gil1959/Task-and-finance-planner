import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST() {
    try {
        // Ambil user dari cookie session
        const session = await getUserFromCookie<{ id: number }>();
        if (!session) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        // Ambil telegramChatId user
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { telegramChatId: true, name: true },
        });

        if (!user?.telegramChatId) {
            return NextResponse.json(
                { ok: false, error: "Telegram belum terhubung" },
                { status: 400 }
            );
        }

        // Pesan test
        const text = `🔔 *Test Notifikasi*\n\nHalo ${user.name ?? "teman"}, ini pesan percobaan dari Task & Finance Planner.`;

        await sendTelegramMessage(text, user.telegramChatId);

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Test Notif Error:", error);
        return NextResponse.json(
            { ok: false, error: error?.message || String(error) }, 
            { status: 500 }
        );
    }
}
