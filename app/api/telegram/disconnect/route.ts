import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function POST() {
    const session = await getUserFromCookie<{ id: number }>();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
        where: { id: session.id },
        data: {
            telegramChatId: null,
            telegramLinkCode: null,
        },
    });

    return NextResponse.json({ ok: true });
}
