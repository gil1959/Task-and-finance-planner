import { mailer } from "./mailer";

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.APP_URL}/verify?token=${encodeURIComponent(token)}`;
  const text = `Verifikasi email kamu: ${url} (berlaku 24 jam).`;
  const html = `
    <p>Halo,</p>
    <p>Silakan verifikasi email kamu dengan mengklik tautan berikut:</p>
    <p><a href="${url}">${url}</a></p>
    <p>Tautan berlaku 24 jam.</p>
  `;
  await mailer.sendMail({
    from: process.env.MAIL_FROM!, // contoh: "TaskFinance <ragilkurniawan174@gmail.com>"
    to,
    subject: "Verifikasi Email — TaskFinance",
    text,
    html,
  });
}
