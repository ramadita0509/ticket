import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/db";

export async function generateEticketPdf(bookingId: string): Promise<string> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { passengers: true, segments: { orderBy: { sequence: "asc" } } },
  });
  if (!booking) throw new Error("Booking not found");

  const dir = path.join(process.cwd(), "data", "tickets");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${booking.id}.pdf`);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", async () => {
      try {
        await writeFile(filePath, Buffer.concat(chunks));
        resolve();
      } catch (e) {
        reject(e);
      }
    });
    doc.on("error", reject);

    doc
      .fontSize(22)
      .fillColor("#05325c")
      .text("Ticket", { continued: false });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#5a6b7c").text("E-Ticket Confirmation");
    doc.moveDown();

    doc
      .fontSize(12)
      .fillColor("#0c1b2a")
      .text(`PNR / Booking Reference: ${booking.bookingReference ?? "—"}`);
    doc.text(
      `Route: ${booking.origin} → ${booking.destination}`
    );
    doc.text(
      `Departure: ${booking.departureDate.toISOString().slice(0, 10)}`
    );
    doc.text(
      `Total: ${booking.currency} ${booking.totalAmount.toLocaleString("id-ID")}`
    );
    doc.moveDown();

    doc.fontSize(13).fillColor("#05325c").text("Passengers");
    for (const p of booking.passengers) {
      doc
        .fontSize(11)
        .fillColor("#0c1b2a")
        .text(
          `${p.title} ${p.firstName} ${p.lastName} — Ticket ${p.ticketNumber ?? "—"}`
        );
    }
    doc.moveDown();

    doc.fontSize(13).fillColor("#05325c").text("Itinerary");
    for (const s of booking.segments) {
      doc
        .fontSize(11)
        .fillColor("#0c1b2a")
        .text(
          `${s.flightNumber}  ${s.departureAirport} ${s.departureTime
            .toISOString()
            .slice(11, 16)} → ${s.arrivalAirport} ${s.arrivalTime
            .toISOString()
            .slice(11, 16)}`
        );
    }

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#5a6b7c")
      .text(
        "Dokumen ini dihasilkan otomatis. Tunjukkan bersama identitas resmi saat check-in."
      );

    doc.end();
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { ticketPdfPath: filePath },
  });

  return filePath;
}
