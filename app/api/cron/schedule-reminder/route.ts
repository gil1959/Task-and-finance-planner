// app/api/cron/schedule-reminder/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";

const WEEKDAYS: Array<
    "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"
> = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];

const DAY_LABEL: Record<string, string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
};

const REMINDER_WINDOW_MINUTES = 5;

function getNowInWIB() {
    const now = new Date();
    const wibString = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    return new Date(wibString);
}

function timeStringToMinutes(t: string) {
    const [h, m] = t.split(":").map((x) => parseInt(x, 10));
    return h * 60 + (m || 0);
}

async function handle() {
    const now = getNowInWIB();
    const jsDay = now.getDay();
    const todayWeekday = WEEKDAYS[jsDay];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();


    const schedules = await prisma.schedule.findMany({
        where: {
            day: todayWeekday,
            reminderHoursBefore: {
                gt: 0,
            },

            user: {
                telegramChatId: {
                    not: null,
                },
            },
        },
        orderBy: [{ startTime: "asc" }],
        include: {

            user: {
                select: {
                    telegramChatId: true,
                },
            },
        },
    });

    const sent: Array<{ id: number; courseName: string }> = [];

    for (const s of schedules) {
        // 🔴 ambil chatId user dari relasi
        const chatId = s.user?.telegramChatId;
        if (!chatId) {
            // secara teori nggak kejadian, karena udah di-filter not null
            continue;
        }

        const startMinutes = timeStringToMinutes(s.startTime);
        const reminderMinutes = startMinutes - (s.reminderHoursBefore ?? 0) * 60;

        if (
            nowMinutes >= reminderMinutes &&
            nowMinutes < reminderMinutes + REMINDER_WINDOW_MINUTES
        ) {
            const textLines = [
                "🕒 <b>Pengingat Kuliah</b>",
                "",
                `Mata kuliah : <b>${s.courseName}</b>${s.courseCode ? ` (${s.courseCode})` : ""}`,
                `Hari        : ${DAY_LABEL[s.day] ?? s.day}`,
                `Jam         : ${s.startTime} - ${s.endTime}`,
                s.room ? `Ruangan     : ${s.room}` : "",
                s.lecturer ? `Dosen       : ${s.lecturer}` : "",
                `Semester    : ${s.semester}`,
                "",
                `⏰ Reminder ini dikirim ${s.reminderHoursBefore} jam sebelum kuliah dimulai.`,
            ].filter(Boolean);

            const text = textLines.join("\n");


            await sendTelegramMessage(text, chatId);

            sent.push({ id: s.id, courseName: s.courseName });
        }
    }

    return NextResponse.json({
        ok: true,
        now: now.toISOString(),
        today: todayWeekday,
        sent,
    });
}

export async function GET() {
    return handle();
}

export async function POST() {
    return handle();
}
