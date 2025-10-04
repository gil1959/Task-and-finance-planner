export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth-helpers";
import path from "path";
import { readFile, stat } from "fs/promises";

const MODEL_CANDIDATES = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro",
];

async function generateSummary(base: string, apiKey: string, modelId: string, mimeType: string, base64: string) {
    const url = `${base}/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const prompt =
        "Ringkas materi kuliah ini menjadi poin rapi (judul, highlight, bullet, istilah penting) dalam bahasa Indonesia.";
    const body = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType, data: base64 } }, // camelCase aman di v1 & v1beta
                ],
            },
        ],
    };
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const text = await r.text();
    if (!r.ok) return { ok: false as const, status: r.status, modelId, base, error: text.slice(0, 1200) };
    const j = JSON.parse(text);
    const summary =
        j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ??
        j?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "";
    return { ok: true as const, summary };
}

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

        // baca file audio dari /public
        const rel = material.audioUrl.replace(/^\/+/, "");
        const audioPath = path.join(process.cwd(), "public", rel);
        await stat(audioPath).catch(() => { throw new Error(`Audio file not found: ${audioPath}`); });
        const buff = await readFile(audioPath);
        const base64 = buff.toString("base64");
        const mimeType =
            material.audioUrl.endsWith(".webm") ? "audio/webm" :
                material.audioUrl.endsWith(".wav") ? "audio/wav" :
                    material.audioUrl.endsWith(".mp3") ? "audio/mpeg" : "audio/webm";

        // coba v1 lalu v1beta, dan beberapa model
        const bases = [
            "https://generativelanguage.googleapis.com/v1",
            "https://generativelanguage.googleapis.com/v1beta",
        ];
        let lastErr: any = null;

        for (const base of bases) {
            for (const model of MODEL_CANDIDATES) {
                const res = await generateSummary(base, apiKey, model, mimeType, base64);
                if (res.ok) {
                    const updated = await prisma.material.update({
                        where: { id: material.id },
                        data: { summary: res.summary },
                    });
                    return NextResponse.json(updated);
                } else {
                    lastErr = res;
                }
            }
        }

        return NextResponse.json(
            { error: `All attempts failed`, detail: lastErr },
            { status: 500 }
        );
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}
