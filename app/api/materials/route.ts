// app/api/materials/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-helpers";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

// GET: list materi
export async function GET() {
  const me = await getUserFromCookie<{ id: number }>();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.material.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

// POST: terima form-data (file, title, date, durationSec) dan simpan ke filesystem lokal
export async function POST(req: Request) {
  const me = await getUserFromCookie<{ id: number }>();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const title = (form.get("title") as string) || "Materi tanpa judul";
  const dateStr = (form.get("date") as string) || new Date().toISOString();
  const durationSec = parseInt((form.get("durationSec") as string) || "0", 10);

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.type?.includes("webm")
    ? "webm"
    : file.type?.includes("wav")
      ? "wav"
      : file.type?.includes("mpeg")
        ? "mp3"
        : "webm";

  // Simpan ke filesystem lokal (self-host). File ditaruh di: public/uploads/materials
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "materials");
  await fs.mkdir(uploadDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);

  // URL publiknya otomatis bisa diakses via Next.js static public/
  const publicUrl = `/uploads/materials/${filename}`;

  const material = await prisma.material.create({
    data: {
      title,
      date: new Date(dateStr),
      audioUrl: publicUrl,
      durationSec: Number.isNaN(durationSec) ? 0 : durationSec,
      userId: me.id,
    },
  });

  return NextResponse.json(material, { status: 201 });
}
