import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

interface Params {
    params: { id: string };
}

export async function PUT(req: Request, { params }: Params) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    const body = await req.json();

    const updated = await prisma.schedule.update({
        where: { id },
        data: {
            courseName: String(body.courseName),
            courseCode: body.courseCode ?? null,
            day: String(body.day),
            startTime: String(body.startTime),
            endTime: String(body.endTime),
            room: body.room ?? null,
            lecturer: body.lecturer ?? null,
            semester: String(body.semester),
            reminderHoursBefore: Number(body.reminderHoursBefore ?? 0),
        },
    });

    return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);

    await prisma.schedule.delete({
        where: { id },
    });

    return NextResponse.json({ ok: true });
}
