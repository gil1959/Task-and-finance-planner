"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clock, MapPin, User as UserIcon } from "lucide-react";
import type { ScheduleItem, Weekday } from "@/lib/types";

interface ScheduleListProps {
    schedules: ScheduleItem[];
    onEdit: (schedule: ScheduleItem) => void;
    onDelete: (id: string) => Promise<void> | void;
}

const dayOrder: Weekday[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

const dayLabel: Record<Weekday, string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
};

export function ScheduleList({ schedules, onEdit, onDelete }: ScheduleListProps) {
    if (!schedules.length) {
        return <p className="text-sm text-muted-foreground">Belum ada jadwal kuliah yang tersimpan.</p>;
    }

    const sorted = [...schedules].sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
    });

    const grouped: Record<Weekday, ScheduleItem[]> = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
    };

    sorted.forEach((s) => {
        grouped[s.day].push(s);
    });

    return (
        <div className="space-y-4">
            {dayOrder.map((day) => {
                const items = grouped[day];
                if (!items.length) return null;

                return (
                    <Card key={day}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{dayLabel[day]}</CardTitle>
                            <Badge variant="outline">{items.length} kelas</Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b last:border-0 pb-2 last:pb-0"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">
                                                {item.courseName}
                                                {item.courseCode ? ` (${item.courseCode})` : ""}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px]">
                                                {item.semester}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {item.startTime} – {item.endTime}
                                            </span>
                                            {item.room && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {item.room}
                                                </span>
                                            )}
                                            {item.lecturer && (
                                                <span className="inline-flex items-center gap-1">
                                                    <UserIcon className="h-3 w-3" />
                                                    {item.lecturer}
                                                </span>
                                            )}
                                            {item.reminderHoursBefore > 0 && (
                                                <Badge variant="outline" className="text-[10px]">
                                                    Rem. {item.reminderHoursBefore} jam sebelum
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 justify-end">
                                        <Button variant="outline" size="icon" onClick={() => onEdit(item)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => onDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
