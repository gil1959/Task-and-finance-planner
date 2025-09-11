import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getUserFromCookie } from "@/lib/auth-helpers";

const toEnum = (t: string | undefined) => (t ?? "EXPENSE").toUpperCase();

export async function GET() {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.transaction.findMany({
        where: { userId: user.id },
        include: { category: true },
        orderBy: { date: "desc" },
    });
    return NextResponse.json(items);
}

export async function POST(req: Request) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const type = toEnum(body?.type);
        if (!["INCOME", "EXPENSE", "INVESTMENT"].includes(type)) {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        const amountStr =
            body?.amount === undefined || body?.amount === null
                ? "0"
                : String(body.amount);

        const created = await prisma.transaction.create({
            data: {
                userId: user.id,
                type: type as any,
                amount: new Prisma.Decimal(Number(body.amount ?? 0)),      // ✅ aman untuk Decimal
                date: body?.date ? new Date(body.date) : new Date(),
                note: body?.note ?? null,
                // categoryId: body?.categoryId ?? null,
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Failed to create transaction" },
            { status: 500 }
        );
    }
}
