import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function GET() {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tasks = await prisma.task.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
}

export async function POST(req: Request) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body?.title) {
        return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const created = await prisma.task.create({
        data: {
            userId: user.id,
            title: String(body.title),
            description: body.description ?? null,            // FE: desc → description (mapper sudah handle)
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
            priority: typeof body.priority === "number" ? body.priority : 0, // FE: weight → priority
            status: body.status ?? "todo",                    // "todo" | "in-progress" | "done"
        },
    });

    return NextResponse.json(created, { status: 201 });
}
