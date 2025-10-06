"use client";

import useSWR from "swr";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Wand2 } from "lucide-react";

type Material = {
    id: number;
    title: string;
    date: string;
    audioUrl: string;
    durationSec: number;
    summary: string | null;
    createdAt: string;
};

const fetcher = (u: string) => fetch(u, { cache: "no-store" }).then(r => r.json());

export default function MaterialsPage() {
    const router = useRouter();
    const { data, isLoading, mutate } = useSWR<Material[]>("/api/materials", fetcher);
    const [busyId, setBusyId] = useState<number | null>(null);

    const ringkas = async (id: number) => {
        try {
            setBusyId(id);
            const r = await fetch(`/api/materials/${id}/summarize`, { method: "POST" });
            if (!r.ok) {
                const j = await r.json().catch(() => ({}));
                alert(`Gagal merangkum: ${j.error || r.statusText}`);
            } else {
                await mutate(); // refresh list supaya summary ter-update
            }
        } finally {
            setBusyId(null);
        }
    };

    const hapus = async (id: number) => {
        if (!confirm("Yakin mau hapus materi ini?")) return;
        setBusyId(id);
        try {
            const r = await fetch(`/api/materials/${id}`, { method: "DELETE" });
            if (!r.ok) {
                const j = await r.json().catch(() => ({}));
                alert(`Gagal menghapus: ${j.error || r.statusText}`);
            } else {
                await mutate();
            }
        } finally {
            setBusyId(null);
        }
    };

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Materials</h1>
                        <p className="text-muted-foreground">Rekaman materi & ringkasan</p>
                    </div>
                    <Button asChild>
                        <Link href="/materials/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Materi
                        </Link>
                    </Button>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
                    </div>
                )}

                {!isLoading && (!data || data.length === 0) && (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Belum ada materi. Klik <strong>Tambah Materi</strong> untuk menyimpan rekaman.
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {data?.map((m) => (
                        <Card key={m.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{m.title}</CardTitle>
                                    <Badge variant="secondary">
                                        {new Date(m.date ?? m.createdAt).toLocaleDateString()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <audio controls className="w-full" src={m.audioUrl} preload="metadata" />

                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={busyId === m.id}
                                        onClick={() => ringkas(m.id)}
                                    >
                                        {busyId === m.id ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-2 h-4 w-4" />
                                                Ringkas dengan AI
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={busyId === m.id}
                                        onClick={() => hapus(m.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Hapus
                                    </Button>
                                </div>

                                <div className="pt-2">
                                    <div className="text-sm font-medium mb-1">Ringkasan</div>
                                    <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                                        {m.summary?.trim() || "Belum ada ringkasan."}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}
