import { prisma } from "@/lib/db";
import { issueTickets } from "@/lib/travelport/booking";
import { generateEticketPdf } from "@/lib/eticket";
import { sendEticketEmail } from "@/lib/email";

async function processTicketing(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { passengers: true },
  });
  if (!booking) return;
  if (booking.status === "ISSUED") return;
  if (booking.status !== "PAID" && booking.status !== "TICKET_FAILED") {
    return;
  }

  try {
    const result = await issueTickets({
      pnr: booking.bookingReference ?? booking.id.slice(0, 6).toUpperCase(),
      passengerCount: booking.passengers.length,
    });

    await prisma.$transaction(
      booking.passengers.map((p, i) =>
        prisma.passenger.update({
          where: { id: p.id },
          data: { ticketNumber: result.ticketNumbers[i] ?? result.ticketNumbers[0] },
        })
      )
    );

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "ISSUED" },
    });

    const pdfPath = await generateEticketPdf(bookingId);
    if (booking.contactEmail) {
      await sendEticketEmail({
        to: booking.contactEmail,
        pnr: booking.bookingReference ?? bookingId,
        pdfPath,
      });
    }
  } catch (err) {
    console.error("Ticketing failed:", err);
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "TICKET_FAILED" },
    });
  }
}

/** Enqueue ticketing — BullMQ if Redis set, else in-process */
export async function enqueueTicketing(bookingId: string): Promise<void> {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    try {
      const { Queue } = await import("bullmq");
      const { default: IORedis } = await import("ioredis");
      const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
      const queue = new Queue("ticketing", { connection });
      await queue.add(
        "issue",
        { bookingId },
        {
          jobId: `ticket-${bookingId}`,
          attempts: 5,
          backoff: { type: "exponential", delay: 2000 },
          removeOnComplete: true,
        }
      );
      // Ensure a worker is listening in this process (dev-friendly)
      void ensureWorker(connection);
      return;
    } catch (err) {
      console.warn("BullMQ unavailable, falling back to in-process:", err);
    }
  }

  // In-process async (mock-friendly)
  setTimeout(() => {
    void processTicketing(bookingId);
  }, 50);
}

let workerStarted = false;
function ensureWorker(connection: import("ioredis").default) {
  if (workerStarted) return;
  workerStarted = true;
  void import("bullmq").then(({ Worker }) => {
    new Worker(
      "ticketing",
      async (job) => {
        await processTicketing(String(job.data.bookingId));
      },
      { connection }
    );
  });
}

export { processTicketing };
