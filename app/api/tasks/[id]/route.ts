import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(task);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    const body = await req.json().catch(() => ({} as any));

    const updated = await prisma.task.update({
        where: { id },
        data: {
            // hanya update field yang dikirim
            title: body.title ?? undefined,
            description: body.description ?? undefined,
            dueDate: body.dueDate ? new Date(body.dueDate) : body.dueDate === null ? null : undefined,
            priority: typeof body.priority === "number" ? body.priority : undefined,
            status: body.status ?? undefined,
        },
    });

    return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
