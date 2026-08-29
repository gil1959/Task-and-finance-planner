import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getUserFromCookie<{ id: number }>();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    await prisma.category.createMany({
      data: [
        { userId: user.id, name: "Gaji", type: "INCOME" },
        { userId: user.id, name: "Investasi", type: "INCOME" },
        { userId: user.id, name: "Makan", type: "EXPENSE" },
        { userId: user.id, name: "Transport", type: "EXPENSE" },
        { userId: user.id, name: "Belanja", type: "EXPENSE" },
        { userId: user.id, name: "Saham", type: "INVESTMENT" },
        { userId: user.id, name: "Reksa Dana", type: "INVESTMENT" },
      ],
      skipDuplicates: true,
    });
    categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });
  }

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const user = await getUserFromCookie<{ id: number }>();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, type } = await req.json();
    if (!name || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const created = await prisma.category.create({
      data: {
        userId: user.id,
        name,
        type: type.toUpperCase(),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
