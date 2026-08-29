import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth-helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

  const user = await getUserFromCookie<{ id: number; name: string }>();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Ambil insight terakhir
    const lastInsight = await prisma.financeInsight.findFirst({
      where: { userId: user.id },
      orderBy: { endDate: 'desc' },
    });

    // 2. Ambil transaksi pertama
    const firstTx = await prisma.transaction.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'asc' },
    });

    if (!firstTx) {
      return NextResponse.json({ insight: "Belum ada transaksi sama sekali untuk dianalisis." });
    }

    const now = new Date();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    let periodStart: Date;
    let periodEnd: Date;

    if (!lastInsight) {
      // Belum pernah ada insight
      const daysSinceFirstTx = (now.getTime() - firstTx.date.getTime()) / MS_PER_DAY;
      
      // Jika belum mencapai 30 hari sejak transaksi pertama, jangan hasilkan insight dulu
      if (daysSinceFirstTx < 30) {
        return NextResponse.json({ insight: `Data transaksi belum mencapai 30 hari untuk dianalisis oleh AI. (Kurang ${Math.ceil(30 - daysSinceFirstTx)} hari lagi)` });
      }

      // Hitung berapa blok 30 hari yang sudah komplit
      const completedBlocks = Math.floor(daysSinceFirstTx / 30);
      
      // Insight perdana akan mencakup blok waktu yang paling baru komplit
      periodStart = new Date(firstTx.date.getTime() + (completedBlocks - 1) * 30 * MS_PER_DAY);
      periodEnd = new Date(firstTx.date.getTime() + completedBlocks * 30 * MS_PER_DAY);
    } else {
      // Sudah ada insight sebelumnya
      const daysSinceLastEnd = (now.getTime() - lastInsight.endDate.getTime()) / MS_PER_DAY;

      // Jika belum lewat 30 hari dari batas akhir insight sebelumnya, kembalikan insight yang sudah ada
      if (daysSinceLastEnd < 30) {
        return NextResponse.json(lastInsight);
      }

      // Sudah lewat 30 hari, kita buat insight untuk blok 30 hari berikutnya
      const completedBlocksSinceLastEnd = Math.floor(daysSinceLastEnd / 30);
      
      periodStart = new Date(lastInsight.endDate.getTime() + (completedBlocksSinceLastEnd - 1) * 30 * MS_PER_DAY);
      periodEnd = new Date(lastInsight.endDate.getTime() + completedBlocksSinceLastEnd * 30 * MS_PER_DAY);
    }

    // Ambil transaksi pada blok 30 hari (periodStart - periodEnd)
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: periodStart, lte: periodEnd },
      },
      include: { category: true },
    });

    if (transactions.length === 0) {
      // Jika kosong, simpan insight kosong agar loop 30 harinya maju
      const emptyInsight = await prisma.financeInsight.create({
        data: {
          userId: user.id,
          startDate: periodStart,
          endDate: periodEnd,
          insight: `Tidak ada transaksi yang tercatat pada periode ${periodStart.toLocaleDateString("id-ID")} hingga ${periodEnd.toLocaleDateString("id-ID")}. Pertahankan semangat menabung Anda!`,
        },
      });
      return NextResponse.json(emptyInsight);
    }

    const txData = transactions.map(t => 
      `${t.date.toISOString().split("T")[0]} - ${t.type} - Rp${t.amount} - Kategori: ${t.category?.name || "N/A"} - Catatan: ${t.note || "-"}`
    ).join("\n");

    const prompt = `Analisis ringkasan transaksi keuangan berikut untuk pengguna bernama ${user.name || "User"} selama periode 30 hari (${periodStart.toLocaleDateString("id-ID")} s.d ${periodEnd.toLocaleDateString("id-ID")}). Berikan insight bulanan dan saran yang membangun tentang pengeluarannya (misal: pengeluaran terlalu besar di kategori X, atau bagus sudah menabung, dll) secara ringkas, ramah, dan memotivasi dalam Bahasa Indonesia. Buat maksimal 3 paragraf.

Data transaksi periode ini:
${txData}`;

    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const insightText = result.response.text();

    const createdInsight = await prisma.financeInsight.create({
      data: {
        userId: user.id,
        startDate: periodStart,
        endDate: periodEnd,
        insight: insightText,
      },
    });

    return NextResponse.json(createdInsight);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
