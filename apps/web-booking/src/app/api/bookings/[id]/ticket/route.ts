import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateEticketPdf } from "@/lib/eticket";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "ISSUED") {
    return NextResponse.json(
      { error: "Ticket not ready yet" },
      { status: 409 }
    );
  }

  let pdfPath = booking.ticketPdfPath;
  if (!pdfPath) {
    pdfPath = await generateEticketPdf(id);
  }

  const buf = await readFile(pdfPath);
  const pnr = booking.bookingReference ?? id;
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="eticket-${pnr}.pdf"`,
    },
  });
}
