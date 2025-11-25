import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function POST(req: Request) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        if (!body.chatId) {
            return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                telegramChatId: String(body.chatId),
            },
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message ?? "Unknown error" },
            { status: 500 }
        );
    }
}
