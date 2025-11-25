const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(text: string, chatId?: string) {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error("TELEGRAM_BOT_TOKEN belum di-set di .env");
        throw new Error("Missing TELEGRAM_BOT_TOKEN");
    }

    const targetChatId = chatId || DEFAULT_CHAT_ID;
    if (!targetChatId) {
        console.error("TELEGRAM_CHAT_ID belum di-set dan chatId tidak diberikan");
        throw new Error("Missing chat_id");
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: targetChatId,
            text,
            parse_mode: "HTML",
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        console.error("Telegram error", res.status, body);
        throw new Error("Failed to send Telegram message");
    }

    return res.json();
}
