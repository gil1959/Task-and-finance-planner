import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie<{ id: number }>();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const resolvedParams = await params;
    const categoryId = Number(resolvedParams.id);
    const { name, type } = await req.json();

    const updated = await prisma.category.updateMany({
      where: { id: categoryId, userId: user.id },
      data: { name, type: type?.toUpperCase() },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found or no permission" }, { status: 404 });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    return NextResponse.json(category);
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookie<{ id: number }>();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const resolvedParams = await params;
    const categoryId = Number(resolvedParams.id);

    // Check if category is used in transactions
    const transactions = await prisma.transaction.count({
      where: { categoryId, userId: user.id },
    });

    if (transactions > 0) {
      return NextResponse.json(
        { error: "Kategori tidak bisa dihapus karena masih digunakan pada transaksi." },
        { status: 400 }
      );
    }

    const deleted = await prisma.category.deleteMany({
      where: { id: categoryId, userId: user.id },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Not found or no permission" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
