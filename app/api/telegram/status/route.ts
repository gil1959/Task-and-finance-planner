import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function GET() {
    const session = await getUserFromCookie<{ id: number }>();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
            telegramChatId: true,
        },
    });

    return NextResponse.json({
        connected: !!user?.telegramChatId,
    });
}
