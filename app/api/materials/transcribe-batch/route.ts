export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });
    }

    const me = await getUserFromCookie<{ id: number }>();
    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_SIZE = 18 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Audio file too large: ${(file.size / 1024 / 1024).toFixed(2)} MB` }, { status: 413 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    
    let mimeType = file.type || "audio/webm";
    if (mimeType.startsWith("video/webm")) mimeType = "audio/webm";
    if (mimeType === "application/octet-stream") mimeType = "audio/webm";

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = "Tolong dengarkan baik-baik rekaman audio bahasa Indonesia ini dan tuliskan seluruh isi pembicaraannya menjadi transkrip teks yang utuh, rapi, dan seakurat mungkin. Jangan membuat ringkasan, cukup transkrip kata demi kata. Jangan tambahkan komentar apapun di luar teks aslinya.";

    let lastErr: any = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          { text: prompt },
          { inlineData: { mimeType, data: base64 } },
        ]);

        const text = result?.response?.text?.() ?? "";
        if (text && text.trim()) {
          return NextResponse.json({ transcript: text.trim() });
        }
        
        lastErr = { model: modelName, error: "Empty response from AI" };
      } catch (e: any) {
        lastErr = { model: modelName, error: e?.message || String(e) };
      }
    }

    return NextResponse.json({ error: "Semua model AI gagal mentranskripsikan.", detail: lastErr }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Kesalahan internal server." }, { status: 500 });
  }
}
