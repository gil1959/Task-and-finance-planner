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
import { Mic, Monitor, Pause, Play, Square, Info, Loader2, Save } from "lucide-react";

type RecState = "idle" | "recording";
type RecMode = "mic" | "system";

export default function NewMaterialPage() {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [mode, setMode] = useState<RecMode>("mic");
    const [recState, setRecState] = useState<RecState>("idle");
    const [error, setError] = useState<string>("");
    
    const [transcript, setTranscript] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Common refs
    const startedAtRef = useRef<number>(0);
    const totalDurationRef = useRef<number>(0); // ms

    // Mic refs
    const recognitionRef = useRef<any>(null);
    const micTranscriptRef = useRef<string>("");

    // System refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const systemStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        // Init SpeechRecognition
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'id-ID';
                
                recognition.onresult = (event: any) => {
                    let currentTranscript = "";
                    for (let i = 0; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript + " ";
                    }
                    setTranscript(currentTranscript);
                    micTranscriptRef.current = currentTranscript;
                };
                
                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    if (event.error !== 'aborted') {
                        setError(`Terjadi kesalahan mic: ${event.error}`);
                    }
                };
                
                recognitionRef.current = recognition;
            }
        }
        
        return () => {
            stopAll();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function stopAll() {
        try { recognitionRef.current?.stop(); } catch (e) {}
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
        } catch(e) {}
        systemStreamRef.current?.getTracks().forEach(t => t.stop());
    }

    async function startRecording() {
        setError("");
        setTranscript("");
        micTranscriptRef.current = "";
        
        if (mode === "mic") {
            if (!recognitionRef.current) {
                setError("Browser Anda tidak mendukung fitur Mic Live. Gunakan Google Chrome.");
                return;
            }
            try {
                recognitionRef.current.start();
                startedAtRef.current = Date.now();
                setRecState("recording");
            } catch (e: any) {
                setError(e?.message || "Gagal memulai perekaman suara.");
            }
        } else {
            // System mode
            try {
                const system = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
                system.getVideoTracks().forEach(track => {
                    track.stop();
                    system.removeTrack(track);
                });

                systemStreamRef.current = system;
                
                // Cek apakah ada audio track
                if (system.getAudioTracks().length === 0) {
                    throw new Error("Tidak ada suara yang dibagikan. Pastikan kamu mencentang 'Share tab audio' saat memilih layar.");
                }

                const mr = new MediaRecorder(system);
                audioChunksRef.current = [];
                mr.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                };
                
                mr.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    await processBatchTranscription(audioBlob);
                };

                mediaRecorderRef.current = mr;
                mr.start();
                startedAtRef.current = Date.now();
                setRecState("recording");
                setTranscript("Sedang merekam suara tab secara tersembunyi... Teks akan muncul otomatis dari AI saat kamu klik Stop.");
                
            } catch (err: any) {
                setError(err?.message || "Gagal merekam sistem.");
            }
        }
    }

    function stopRecording() {
        if (recState === "recording") {
            totalDurationRef.current += Date.now() - startedAtRef.current;
        }
        
        if (mode === "mic") {
            try { recognitionRef.current?.stop(); } catch (e) {}
            setRecState("idle");
        } else {
            // mode system, trigger onstop -> upload ke API -> processing
            try { mediaRecorderRef.current?.stop(); } catch (e) {}
            systemStreamRef.current?.getTracks().forEach(t => t.stop());
            setRecState("idle");
        }
    }

    async function processBatchTranscription(blob: Blob) {
        setIsProcessing(true);
        setTranscript("Menganalisa audio menggunakan Gemini AI (Sangat Akurat)... Mohon tunggu sesaat...");
        
        try {
            const fd = new FormData();
            fd.append("file", blob);
            
            const res = await fetch("/api/materials/transcribe-batch", {
                method: "POST",
                body: fd
            });
            
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Gagal mentranskripsikan audio.");
                setTranscript("Gagal diproses.");
            } else {
                setTranscript(data.transcript);
                micTranscriptRef.current = data.transcript;
            }
        } catch (err: any) {
            setError(err?.message || "Kesalahan jaringan saat transkripsi.");
            setTranscript("Gagal diproses.");
        } finally {
            setIsProcessing(false);
        }
    }

    async function saveMaterial() {
        setIsSaving(true);
        const durationSec = Math.max(1, Math.round(totalDurationRef.current / 1000));
        totalDurationRef.current = 0;
        
        const finalTranscript = mode === "mic" ? micTranscriptRef.current : transcript;

        const fd = new FormData();
        fd.append("title", title || "Materi tanpa judul");
        fd.append("date", date);
        fd.append("durationSec", String(durationSec));
        fd.append("transcript", finalTranscript.trim());

        try {
            const res = await fetch("/api/materials", {
                method: "POST",
                body: fd,
            });

            if (!res.ok) {
                setError("Gagal menyimpan materi.");
                setIsSaving(false);
            } else {
                window.location.href = "/materials";
            }
        } catch (err) {
            setError("Terjadi kesalahan jaringan.");
            setIsSaving(false);
        }
    }

    return (
        <ProtectedRoute>
            <AppShell>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Tambah Materi</h1>
                            <p className="text-muted-foreground">Pilih mode perekaman untuk membuat transkrip teks</p>
                        </div>
                        <Button asChild variant="outline" disabled={isSaving || isProcessing}>
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
                            <CardTitle>Perekaman Ganda (Mic / Sistem)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Judul Materi</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="mis. Algoritma Greedy - Pertemuan 5"
                                        disabled={isSaving || isProcessing || recState !== "idle"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal</Label>
                                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSaving || isProcessing || recState !== "idle"} />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label>Pilih Mode Perekaman</Label>
                                <div className="flex flex-wrap gap-3">
                                    <Button 
                                        variant={mode === "mic" ? "default" : "outline"} 
                                        onClick={() => setMode("mic")}
                                        disabled={recState !== "idle" || isProcessing}
                                    >
                                        <Mic className="h-4 w-4 mr-2" />
                                        Mode Suara Luar (Mic Live)
                                    </Button>
                                    <Button 
                                        variant={mode === "system" ? "default" : "outline"} 
                                        onClick={() => setMode("system")}
                                        disabled={recState !== "idle" || isProcessing}
                                    >
                                        <Monitor className="h-4 w-4 mr-2" />
                                        Mode Suara Dalam (Tab Video/Zoom)
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                                {recState === "idle" && !isSaving && !isProcessing && (
                                    <Button onClick={startRecording} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Play className="h-4 w-4 mr-2" />
                                        Mulai Rekam ({mode === "mic" ? "Mic" : "Sistem"})
                                    </Button>
                                )}

                                {recState === "recording" && (
                                    <Button onClick={stopRecording} variant="destructive">
                                        <Square className="h-4 w-4 mr-2" />
                                        Stop Rekaman
                                    </Button>
                                )}

                                {recState === "idle" && transcript && !isSaving && !isProcessing && !transcript.includes("Sedang") && !transcript.includes("Gagal") && (
                                    <Button onClick={saveMaterial} className="bg-green-600 hover:bg-green-700 text-white">
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan Materi
                                    </Button>
                                )}

                                {(isSaving || isProcessing) && (
                                    <Button disabled>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {isProcessing ? "Gemini AI Bekerja..." : "Menyimpan..."}
                                    </Button>
                                )}
                            </div>
                            
                            <div className="mt-4 p-4 min-h-[150px] border rounded-md bg-muted/30">
                                <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Hasil Transkrip:</h3>
                                {transcript ? (
                                    <p className={`text-sm leading-relaxed ${isProcessing || (recState === 'recording' && mode === 'system') ? 'text-blue-600 animate-pulse font-medium' : ''}`}>
                                        {transcript}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        {recState === "idle" ? "Pilih mode dan klik Mulai Rekam..." : mode === "mic" ? "Mendengarkan mic (Live)..." : "Mendengarkan sistem..."}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-start gap-2 text-xs text-muted-foreground mt-4">
                                <Info className="h-4 w-4 mt-0.5" />
                                <div className="space-y-1">
                                    <p><b>Mode Mic:</b> Gratis, langsung muncul (Live), sangat akurat untuk bicara sendiri. 0% Token.</p>
                                    <p><b>Mode Sistem:</b> Untuk merekam YouTube/Zoom. Suara direkam utuh, lalu dikirim 1x ke Gemini AI (Sangat Akurat) setelah tombol Stop ditekan. Storage dijamin aman karena audio langsung dihapus dari memori server!</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}
