import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getUserFromCookie<{ id: number }>();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { initialBalance: true },
  });

  return NextResponse.json({ balance: dbUser?.initialBalance || 0 });
}

export async function PUT(req: Request) {
  const user = await getUserFromCookie<{ id: number }>();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const balanceVal = Number(body.balance || 0);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { initialBalance: balanceVal },
      select: { initialBalance: true },
    });
    return NextResponse.json({ balance: Number(updated.initialBalance) });
  } catch (e: any) {
    console.error("Balance Update Error:", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
