"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, Pause, Play, Square, Info } from "lucide-react";

type RecState = "idle" | "recording" | "paused";

export default function NewMaterialPage() {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [recState, setRecState] = useState<RecState>("idle");
    const [error, setError] = useState<string>("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const combinedStreamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const startedAtRef = useRef<number>(0);
    const totalDurationRef = useRef<number>(0); // ms

    useEffect(() => {
        return () => stopAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function stopAll() {
        try {
            mediaRecorderRef.current?.stop();
        } catch { }
        combinedStreamRef.current?.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
        combinedStreamRef.current = null;
    }

    async function startRecording() {
        setError("");
        try {
            // mic selalu ada
            const mic = await navigator.mediaDevices.getUserMedia({ audio: true });

            // coba minta tab audio (share tab audio). Jika gagal, tetap lanjut mic-only
            let system: MediaStream | null = null;
            try {
                system = (await navigator.mediaDevices.getDisplayMedia({ audio: true, video: false })) as MediaStream;
            } catch {
                // abaikan, fallback ke mic-only
            }

            // mix ke satu stream
            const ctx = new AudioContext();
            const dest = ctx.createMediaStreamDestination();

            const micSource = ctx.createMediaStreamSource(mic);
            micSource.connect(dest);

            if (system) {
                const sysSource = ctx.createMediaStreamSource(system);
                sysSource.connect(dest);
            }

            const combined = dest.stream;
            combinedStreamRef.current = combined;

            const mr = new MediaRecorder(combined, { mimeType: "audio/webm" });
            chunksRef.current = [];
            mr.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };
            mr.onstop = () => {
                mic.getTracks().forEach((t) => t.stop());
                system?.getTracks().forEach((t) => t.stop());
            };

            mr.start(1000);
            mediaRecorderRef.current = mr;
            startedAtRef.current = Date.now();
            setRecState("recording");
        } catch (e: any) {
            setError(e?.message || "Gagal memulai perekaman. Izin mic/tab audio ditolak.");
        }
    }

    function pauseRecording() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.pause();
            totalDurationRef.current += Date.now() - startedAtRef.current;
            setRecState("paused");
        }
    }

    function resumeRecording() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
            mediaRecorderRef.current.resume();
            startedAtRef.current = Date.now();
            setRecState("recording");
        }
    }

    async function stopRecordingAndSave() {
        if (!mediaRecorderRef.current) return;

        await new Promise<void>((resolve) => {
            mediaRecorderRef.current!.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                chunksRef.current = [];

                if (recState === "recording") {
                    totalDurationRef.current += Date.now() - startedAtRef.current;
                }
                const durationSec = Math.max(1, Math.round(totalDurationRef.current / 1000));
                totalDurationRef.current = 0;

                const fd = new FormData();
                fd.append("file", blob, "materi.webm");
                fd.append("title", title || "Materi tanpa judul");
                fd.append("date", date);
                fd.append("durationSec", String(durationSec));

                const res = await fetch("/api/materials", {
                    method: "POST",
                    body: fd,
                });

                if (!res.ok) {
                    setError("Gagal menyimpan materi.");
                } else {
                    window.location.href = "/materials";
                }
                resolve();
            };

            mediaRecorderRef.current!.stop();
            combinedStreamRef.current?.getTracks().forEach((t) => t.stop());
            setRecState("idle");
        });
    }

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Tambah Materi</h1>
                            <p className="text-muted-foreground">Rekam penjelasan dosen / audio tab dan simpan sebagai materi</p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/materials">Kembali ke Daftar</Link>
                        </Button>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Perekaman</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Judul Materi</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="mis. Algoritma Greedy - Pertemuan 5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal</Label>
                                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {recState === "idle" && (
                                    <Button onClick={startRecording}>
                                        <Mic className="h-4 w-4 mr-2" />
                                        Mulai
                                    </Button>
                                )}
                                {recState === "recording" && (
                                    <>
                                        <Button variant="outline" onClick={pauseRecording}>
                                            <Pause className="h-4 w-4 mr-2" />
                                            Jeda
                                        </Button>
                                        <Button onClick={stopRecordingAndSave}>
                                            <Square className="h-4 w-4 mr-2" />
                                            Stop & Simpan
                                        </Button>
                                    </>
                                )}
                                {recState === "paused" && (
                                    <>
                                        <Button onClick={resumeRecording}>
                                            <Play className="h-4 w-4 mr-2" />
                                            Lanjut
                                        </Button>
                                        <Button variant="outline" onClick={stopRecordingAndSave}>
                                            <Square className="h-4 w-4 mr-2" />
                                            Stop & Simpan
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Info className="h-4 w-4 mt-0.5" />
                                <p>
                                    Untuk merekam <b>audio internal</b>, saat diminta izin pilih <b>Share Tab</b> lalu centang{" "}
                                    <b>Share tab audio</b>. Jika izin ditolak, aplikasi tetap merekam mic (fallback).
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}
