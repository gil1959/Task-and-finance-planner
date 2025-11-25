// app/api/schedules/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function GET() {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schedules = await prisma.schedule.findMany({
        where: { userId: user.id },
        orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(schedules);
}

export async function POST(req: Request) {
    const user = await getUserFromCookie<{ id: number }>();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const created = await prisma.schedule.create({
        data: {
            userId: user.id,
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

    return NextResponse.json(created, { status: 201 });
}
