import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { flightsRouter } from "./routes/flights.js";

loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });


const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "ticket-api",
    amadeusConfigured: Boolean(
      process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET
    ),
  })
);

app.route("/", flightsRouter);

const port = Number(process.env.PORT ?? 8787);

console.log(`ticket-api listening on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export default app;
