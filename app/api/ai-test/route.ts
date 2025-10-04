export const runtime = "nodejs";

import { NextResponse } from "next/server";

const MODEL_CANDIDATES = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro",
];

async function tryGenerate(base: string, apiKey: string, modelId: string) {
    const url = `${base}/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const body = { contents: [{ role: "user", parts: [{ text: "Balas: OKE" }] }] };
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const text = await r.text();
    return { ok: r.ok, status: r.status, modelId, base, body: text.slice(0, 1200) };
}

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) return NextResponse.json({ ok: false, error: "Missing GOOGLE_API_KEY" }, { status: 500 });

        const bases = [
            "https://generativelanguage.googleapis.com/v1",
            "https://generativelanguage.googleapis.com/v1beta",
        ];

        for (const base of bases) {
            for (const model of MODEL_CANDIDATES) {
                const res = await tryGenerate(base, apiKey, model);
                if (res.ok) return NextResponse.json(res);
                // kumpulkan info kegagalan pertama yang paling informatif
                var last = res;
            }
        }
        return NextResponse.json(last || { ok: false, error: "All attempts failed" }, { status: 500 });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
    }
}
