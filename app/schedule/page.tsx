"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { ScheduleItem } from "@/lib/types";
import { ScheduleList } from "@/components/schedule-list";
import { ScheduleModal } from "@/components/schedule-modal";

export default function SchedulePage() {
    const schedules = useAppStore((s) => s.schedules);
    const loadSchedules = useAppStore((s) => s.loadSchedules);
    const addSchedule = useAppStore((s) => s.addSchedule);
    const updateSchedule = useAppStore((s) => s.updateSchedule);
    const deleteSchedule = useAppStore((s) => s.deleteSchedule);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);

    const handleAddClick = () => {
        setEditingSchedule(null);
        setModalOpen(true);
    };

    const handleEditSchedule = (schedule: ScheduleItem) => {
        setEditingSchedule(schedule);
        setModalOpen(true);
    };

    const handleSaveSchedule = async (
        data: Omit<ScheduleItem, "id" | "createdAt">
    ) => {
        if (editingSchedule) {
            await updateSchedule(editingSchedule.id, data);
        } else {
            await addSchedule(data);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        await deleteSchedule(id);
    };

    return (
        <ProtectedRoute>
            <AppShell>
                {/* lebar dibikin mirip Finance, ga terlalu sempit di tengah */}
                <div className="max-w-5xl mx-auto space-y-5">
                    {/* header mirip style Finance: kiri teks, kanan tombol */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Jadwal Kuliah
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola jadwal kuliah per mata kuliah dan semester. Data ini
                                nanti jadi dasar fitur Smart Schedule AI.
                            </p>
                        </div>
                        <Button
                            onClick={handleAddClick}
                            size="sm"
                            className="w-full sm:w-auto"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Tambah Jadwal
                        </Button>
                    </div>

                    {/* konten utama dibungkus card biar rapi kayak Finance */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-4 sm:p-5">
                            <ScheduleList
                                schedules={schedules}
                                onEdit={handleEditSchedule}
                                onDelete={handleDeleteSchedule}
                            />
                        </div>
                    </div>

                    <ScheduleModal
                        open={modalOpen}
                        onOpenChange={setModalOpen}
                        schedule={editingSchedule}
                        onSave={handleSaveSchedule}
                    />
                </div>
            </AppShell>
        </ProtectedRoute>
    );
}
