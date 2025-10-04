export const revalidate = 0;
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function GET() {
    const session = await getUserFromCookie<{ id: number; email: string }>();

    if (!session) {
        const res = NextResponse.json(null);
        res.headers.set("Cache-Control", "no-store");
        return res;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { id: true, email: true, name: true, createdAt: true },
    });

    const res = NextResponse.json(user);
    res.headers.set("Cache-Control", "no-store");
    return res;
}
