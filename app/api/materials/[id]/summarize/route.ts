// app/api/materials/[id]/summarize/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-helpers";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
];

// beberapa model tidak suka webm; kalau ketemu webm kita tetap coba,
// tapi kalau ditolak, kita kasih pesan jelas.
const SUPPORTED_MIMES = new Set([
    "audio/mpeg", // mp3
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm", // kita coba juga; jika ditolak, akan dapat error 400
]);



export async function POST(
    _req: Request,
    ctx: { params: Promise<{ id: string }> } // Next 15: params harus di-await
) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });

        const me = await getUserFromCookie<{ id: number }>();
        if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: idStr } = await ctx.params;
        const id = Number(idStr);
        if (!id || Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

        const material = await prisma.material.findFirst({ where: { id, userId: me.id } });
        if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // --- fetch audio dari Blob URL ---
        const fileRes = await fetch(material.audioUrl);
        if (!fileRes.ok) {
            return NextResponse.json(
                { error: `Cannot fetch audio (${fileRes.status})`, url: material.audioUrl },
                { status: 400 }
            );
        }
        const arr = await fileRes.arrayBuffer();
        const bytes = Buffer.from(arr);

        // batasi ukuran ±18MB untuk aman
        const MAX = 18 * 1024 * 1024;
        if (bytes.byteLength > MAX) {
            return NextResponse.json(
                { error: `File audio terlalu besar: ${(bytes.byteLength / 1024 / 1024).toFixed(2)} MB (maks ~18 MB)` },
                { status: 413 }
            );
        }

        const headerMime = fileRes.headers.get("content-type") || "";
        let mimeType =
            headerMime ||
            (material.audioUrl.endsWith(".mp3")
                ? "audio/mpeg"
                : material.audioUrl.endsWith(".wav")
                    ? "audio/wav"
                    : material.audioUrl.endsWith(".ogg")
                        ? "audio/ogg"
                        : material.audioUrl.endsWith(".webm")
                            ? "audio/webm"
                            : "application/octet-stream");

        // 🔽 PATCH: normalisasi kalau Blob balikin "video/webm" (umum terjadi utk rekaman audio WebM/Opus)
        if (mimeType.startsWith("video/webm")) {
            mimeType = "audio/webm";
        }

        // 🔽 PATCH tambahan: kalau mimetype nggak jelas, coba sniff signature WebM (1A 45 DF A3)
        if (mimeType === "application/octet-stream") {
            const isWebm =
                bytes.length > 4 &&
                bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
            if (isWebm) mimeType = "audio/webm";
        }

        const base64 = bytes.toString("base64");

        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt =
            "Ringkas materi kuliah ini menjadi poin rapi (judul, highlight, bullet, istilah penting) dalam bahasa Indonesia dan jangan ada kalimat yang bold serta tanda **, -- dan sebagai nya yang brlebihan.";

        let lastErr: any = null;

        for (const m of MODELS) {
            try {
                const model = genAI.getGenerativeModel({ model: m });

                // SDK format: array of parts, gunakan inlineData (SDK yang urus detail JSON)
                const result = await model.generateContent([
                    { text: prompt },
                    { inlineData: { mimeType, data: base64 } },
                ]);

                const text = result?.response?.text?.() ?? "";
                if (text && text.trim()) {
                    const updated = await prisma.material.update({
                        where: { id: material.id },
                        data: { summary: text },
                    });
                    return NextResponse.json(updated);
                }

                lastErr = { model: m, error: "Empty text()" };
            } catch (e: any) {
                // tangkap pesan error dari SDK/REST
                lastErr = { model: m, error: e?.message || String(e) };

                // jika jelas-jelas karena mime webm ditolak, balikin pesan actionable
                if (/mime/i.test(String(e)) || /unsupported/i.test(String(e))) {
                    return NextResponse.json(
                        {
                            error:
                                "Format audio tidak didukung model. Coba unggah MP3/WAV/OGG (webm/opus sering ditolak oleh Gemini).",
                            detail: lastErr,
                        },
                        { status: 400 }
                    );
                }
            }
        }

        return NextResponse.json(
            {
                error: "Gagal merangkum (semua model gagal).",
                detail: lastErr,
            },
            { status: 500 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
    }
}
