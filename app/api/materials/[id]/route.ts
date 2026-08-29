// app/api/materials/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";
import { promises as fs } from "fs";
import path from "path";

/**
 * DELETE /api/materials/[id]
 * - Hapus record material
 * - Hapus file audio lokal kalau ada (/public/uploads/...)
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const me = await getUserFromCookie<{ id: number }>();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const materialId = Number(resolvedParams.id);
  if (Number.isNaN(materialId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const material = await prisma.material.findUnique({
    where: { id: materialId },
  });

  if (!material || material.userId !== me.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Hapus file audio lokal (kalau ada)
  if (material.audioUrl && material.audioUrl.startsWith("/uploads/")) {
    try {
      // audioUrl contoh: /uploads/materials/uuid.webm
      const relPath = material.audioUrl.replace(/^\//, "");
      const absPath = path.join(process.cwd(), "public", relPath);
      await fs.unlink(absPath);
    } catch (err) {
      // Jangan bikin DELETE gagal cuma karena file udah gak ada
      console.warn("[materials:delete] failed to delete file:", err);
    }
  }

  await prisma.material.delete({
    where: { id: materialId },
  });

  return NextResponse.json({ ok: true });
}
