import nodemailer from "nodemailer";
import { readFile } from "node:fs/promises";

export async function sendEticketEmail(input: {
  to: string;
  pnr: string;
  pdfPath: string;
}): Promise<{ sent: boolean; preview?: string }> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    console.info(
      `[email:mock] E-ticket for PNR ${input.pnr} → ${input.to} (file: ${input.pdfPath})`
    );
    return { sent: false, preview: "logged-only" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  const pdf = await readFile(input.pdfPath);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "Ticket <noreply@ticket.local>",
    to: input.to,
    subject: `E-Ticket Ticket — PNR ${input.pnr}`,
    text: `Terima kasih. Tiket Anda sudah diterbitkan.\nPNR: ${input.pnr}\nLampiran PDF terlampir.`,
    attachments: [
      {
        filename: `eticket-${input.pnr}.pdf`,
        content: pdf,
      },
    ],
  });

  return { sent: true };
}
