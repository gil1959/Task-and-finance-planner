import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getUserFromCookie } from "@/lib/auth-helpers";

const toEnum = (t: string | undefined) => (t ?? "EXPENSE").toUpperCase();

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: idStr } = await params;
    const id = Number(idStr);
    const item = await prisma.transaction.findFirst({
        where: { id, userId: user.id },
        include: { category: true },
    });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id: idStr } = await params;
        const id = Number(idStr);
        const body = await req.json();

        const data: any = {};
        let currentType = "EXPENSE";

        if (body?.type) {
            const type = toEnum(body.type);
            if (!["INCOME", "EXPENSE", "INVESTMENT"].includes(type)) {
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
            }
            data.type = type as any;
            currentType = type;
        }

        if (body.category) {
            let cat = await prisma.category.findFirst({
                where: { userId: user.id, name: body.category, type: currentType as any },
            });
            if (!cat) {
                cat = await prisma.category.create({
                    data: { userId: user.id, name: body.category, type: currentType as any },
                });
            }
            data.categoryId = cat.id;
        }

        if (body?.amount !== undefined) {
            data.amount = new Prisma.Decimal(String(body.amount));
        }
        if (body?.date) data.date = new Date(body.date);
        if (body?.note !== undefined) data.note = body.note ?? null;

        const updated = await prisma.transaction.update({
            where: { id },
            data,
            include: { category: true },
        });

        return NextResponse.json(updated);
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Failed to update transaction" },
            { status: 500 }
        );
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: idStr } = await params;
    const id = Number(idStr);
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
