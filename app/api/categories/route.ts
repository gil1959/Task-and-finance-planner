import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromCookie } from "@/lib/auth-helpers";

export async function GET() {
    const user = getUserFromCookie()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const cats = await prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } })
    return NextResponse.json(cats)
}

export async function POST(req: Request) {
    const user = getUserFromCookie()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const created = await prisma.category.create({ data: { userId: user.id, ...body } })
    return NextResponse.json(created, { status: 201 })
}
