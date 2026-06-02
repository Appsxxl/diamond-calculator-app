import nodemailer from "nodemailer";
import { ENV } from "./env";

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  if (ENV.gmailUser && ENV.gmailAppPassword) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: ENV.gmailUser, pass: ENV.gmailAppPassword },
    });
    await transporter.sendMail({ from: `Plan B <${ENV.gmailUser}>`, to, subject, html });
    return;
  }

  if (ENV.resendApiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${ENV.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: ENV.fromEmail, to, subject, html }),
    });
    if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
    return;
  }

  console.log(`\n[Mailer] Email to ${to} | Subject: ${subject}\n`);
}
