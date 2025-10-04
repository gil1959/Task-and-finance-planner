// app/api/materials/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-helpers";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

// GET: list materi (biarkan seperti semula)
export async function GET() {
    const me = await getUserFromCookie<{ id: number }>();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.material.findMany({
        where: { userId: me.id },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
}

// POST: terima form-data (file, title, date, durationSec) dan simpan ke Vercel Blob
export async function POST(req: Request) {
    const me = await getUserFromCookie<{ id: number }>();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string) || "Materi tanpa judul";
    const dateStr = (form.get("date") as string) || new Date().toISOString();
    const durationSec = parseInt((form.get("durationSec") as string) || "0", 10);

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Tentukan ekstensi dari MIME (MediaRecorder umumnya "audio/webm")
    const ext =
        file.type?.includes("webm") ? "webm" :
            file.type?.includes("wav") ? "wav" :
                file.type?.includes("mpeg") ? "mp3" : "webm";

    // Simpan ke Vercel Blob (public). Token dibaca dari ENV: BLOB_READ_WRITE_TOKEN
    const key = `materials/${randomUUID()}.${ext}`;
    const blob = await put(key, file.stream(), { access: "public" });

    // Simpan URL blob ke DB
    const material = await prisma.material.create({
        data: {
            title,
            date: new Date(dateStr),
            audioUrl: blob.url, // URL publik (ex: https://blob.vercel-storage.com/...)
            durationSec: Number.isNaN(durationSec) ? 0 : durationSec,
            userId: me.id,
        },
    });

    return NextResponse.json(material, { status: 201 });
}
