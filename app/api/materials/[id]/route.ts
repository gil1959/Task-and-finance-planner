// app/api/materials/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-helpers";
import { del } from "@vercel/blob";

// GET detail (opsional buat tes route)
export async function GET(
    _req: Request,
    ctx: { params: Promise<{ id: string }> } // Next 15: WAJIB await
) {
    const me = await getUserFromCookie<{ id: number }>();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;                 // ← penting: await
    const numericId = Number(id);
    if (!numericId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const material = await prisma.material.findFirst({
        where: { id: numericId, userId: me.id },
    });

    if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(material);
}

// DELETE: hapus DB + file Blob (idempotent)
export async function DELETE(
    _req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const me = await getUserFromCookie<{ id: number }>();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;                 // ← penting: await
    const numericId = Number(id);
    if (!numericId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const material = await prisma.material.findFirst({
        where: { id: numericId, userId: me.id },
    });

    // Idempotent: kalau sudah hilang, tetap balikin 200
    if (!material) return NextResponse.json({ ok: true });

    // Coba hapus file di Blob; kalau gagal, lanjutkan hapus row
    try {
        if (material.audioUrl?.includes("vercel-storage.com")) {
            await del(material.audioUrl); // butuh BLOB_READ_WRITE_TOKEN
        }
    } catch (e) {
        console.warn("[materials:delete] blob delete warn:", e);
    }

    await prisma.material.delete({ where: { id: numericId } });
    return NextResponse.json({ ok: true });
}
