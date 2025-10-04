import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-helpers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
    const me = await getUserFromCookie<{ id: number }>();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.material.findMany({
        where: { userId: me.id },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
}

// Expect form-data: file(audio/webm), title, date(optional), durationSec
export async function POST(req: Request) {
    const me = await getUserFromCookie<{ id: number }>();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string) || "Materi tanpa judul";
    const dateStr = (form.get("date") as string) || new Date().toISOString();
    const durationSec = parseInt((form.get("durationSec") as string) || "0", 10);

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "materials");
    await mkdir(uploadsDir, { recursive: true });

    const ext = (file.type.includes("webm") ? "webm" : "wav"); // default webm
    const filename = `${randomUUID()}.${ext}`;
    const fullpath = path.join(uploadsDir, filename);
    await writeFile(fullpath, bytes);

    const audioUrl = `/uploads/materials/${filename}`;

    const material = await prisma.material.create({
        data: {
            title,
            date: new Date(dateStr),
            audioUrl,
            durationSec: isNaN(durationSec) ? 0 : durationSec,
            userId: me.id,
        },
    });

    return NextResponse.json(material, { status: 201 });
}
