"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ScheduleItem, Weekday } from "@/lib/types";

interface ScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule?: ScheduleItem | null;
    onSave: (data: Omit<ScheduleItem, "id" | "createdAt">) => Promise<void> | void;
}

const dayOptions: { value: Weekday; label: string }[] = [
    { value: "monday", label: "Senin" },
    { value: "tuesday", label: "Selasa" },
    { value: "wednesday", label: "Rabu" },
    { value: "thursday", label: "Kamis" },
    { value: "friday", label: "Jumat" },
    { value: "saturday", label: "Sabtu" },
    { value: "sunday", label: "Minggu" },
];

export function ScheduleModal({ open, onOpenChange, schedule, onSave }: ScheduleModalProps) {
    const [formData, setFormData] = useState<Omit<ScheduleItem, "id" | "createdAt">>({
        courseName: "",
        courseCode: "",
        day: "monday",
        startTime: "08:00",
        endTime: "09:40",
        room: "",
        lecturer: "",
        semester: "",
        reminderHoursBefore: 1,
    });

    const [errors, setErrors] = useState<{ courseName?: string; semester?: string }>({});

    useEffect(() => {
        if (schedule) {
            const { id, createdAt, ...rest } = schedule;
            setFormData({
                ...rest,
                reminderHoursBefore: rest.reminderHoursBefore ?? 0,
            });
        } else {
            setFormData({
                courseName: "",
                courseCode: "",
                day: "monday",
                startTime: "08:00",
                endTime: "09:40",
                room: "",
                lecturer: "",
                semester: "",
                reminderHoursBefore: 1,
            });
        }
        setErrors({});
    }, [schedule, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: typeof errors = {};
        if (!formData.courseName.trim()) newErrors.courseName = "Nama mata kuliah wajib diisi";
        if (!formData.semester.trim()) newErrors.semester = "Semester wajib diisi";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        await onSave({
            ...formData,
            reminderHoursBefore: Number(formData.reminderHoursBefore ?? 0),
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{schedule ? "Edit Jadwal Kuliah" : "Tambah Jadwal Kuliah"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="courseName">Nama Mata Kuliah *</Label>
                        <Input
                            id="courseName"
                            value={formData.courseName}
                            onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                            className={errors.courseName ? "border-red-500" : ""}
                            placeholder="Contoh: Struktur Data"
                        />
                        {errors.courseName && <p className="text-xs text-red-500">{errors.courseName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="courseCode">Kode MK</Label>
                        <Input
                            id="courseCode"
                            value={formData.courseCode ?? ""}
                            onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                            placeholder="Contoh: IF2043"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Hari</Label>
                            <Select
                                value={formData.day}
                                onValueChange={(value) => setFormData({ ...formData, day: value as Weekday })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih hari" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dayOptions.map((d) => (
                                        <SelectItem key={d.value} value={d.value}>
                                            {d.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Semester *</Label>
                            <Input
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                className={errors.semester ? "border-red-500" : ""}
                                placeholder="Contoh: Ganjil 2024/2025"
                            />
                            {errors.semester && <p className="text-xs text-red-500">{errors.semester}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Jam Mulai</Label>
                            <Input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jam Selesai</Label>
                            <Input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ruangan</Label>
                            <Input
                                value={formData.room ?? ""}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                placeholder="Contoh: Gd. C Lt.2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Dosen</Label>
                            <Input
                                value={formData.lecturer ?? ""}
                                onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                                placeholder="Nama dosen"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Pengingat sebelum kuliah</Label>
                        <Select
                            value={String(formData.reminderHoursBefore ?? 0)}
                            onValueChange={(value) => setFormData({ ...formData, reminderHoursBefore: Number(value) })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih pengingat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Tidak usah</SelectItem>
                                <SelectItem value="1">1 jam sebelum</SelectItem>
                                <SelectItem value="2">2 jam sebelum</SelectItem>
                                <SelectItem value="3">3 jam sebelum</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit">{schedule ? "Simpan Perubahan" : "Tambah Jadwal"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
