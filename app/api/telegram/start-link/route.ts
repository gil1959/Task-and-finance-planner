import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

function generateLinkCode() {
    // kode 6 karakter alfanumerik
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST() {
    const session = await getUserFromCookie<{ id: number }>();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const code = generateLinkCode();

    await prisma.user.update({
        where: { id: session.id },
        data: {
            telegramLinkCode: code,
        },
    });

    return NextResponse.json({ code });
}
