"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Plus, PlayCircle } from "lucide-react";

type Material = {
    id: number;
    title: string;
    date: string;
    audioUrl: string;
    durationSec: number;
    summary?: string | null;
};

export default function MaterialsPage() {
    const [data, setData] = useState<Material[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const r = await fetch("/api/materials", { cache: "no-store" });
                const j = await r.json();
                if (!alive) return;
                setData(j);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    async function summarize(id: number) {
        setBusyId(id);
        try {
            const r = await fetch(`/api/materials/${id}/summarize`, { method: "POST" });
            if (!r.ok) throw new Error("Gagal merangkum");
            // refresh list
            const rr = await fetch("/api/materials", { cache: "no-store" });
            setData(await rr.json());
        } catch (e: any) {
            alert(e.message || "Summarize gagal.");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Materi</h1>
                            <p className="text-muted-foreground">Rekaman kuliah & ringkasan otomatis</p>
                        </div>
                        <Button asChild>
                            <Link href="/materials/new">
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Materi
                            </Link>
                        </Button>
                    </div>

                    {loading ? (
                        <p className="text-sm text-muted-foreground">Memuat…</p>
                    ) : !data?.length ? (
                        <Card>
                            <CardContent className="py-10 text-center space-y-2">
                                <PlayCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Belum ada materi tersimpan.</p>
                                <Button asChild>
                                    <Link href="/materials/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Rekam Materi
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {data.map((m) => (
                                <Card key={m.id} className="overflow-hidden">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-semibold">{m.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(m.date).toLocaleDateString()} · {formatSec(m.durationSec)}
                                                </div>
                                            </div>
                                            <audio controls src={m.audioUrl} className="max-w-[240px] w-full" />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => summarize(m.id)}
                                                disabled={busyId === m.id}
                                            >
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                {busyId === m.id ? "Merangkum…" : "Ringkas dengan AI"}
                                            </Button>
                                        </div>

                                        {m.summary && (
                                            <div className="text-sm border-t pt-3">
                                                <div className="font-medium mb-1">Ringkasan</div>
                                                <div className="whitespace-pre-wrap text-muted-foreground">{m.summary}</div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}

function formatSec(s: number) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")} menit`;
}
