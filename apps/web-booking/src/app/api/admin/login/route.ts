import { NextResponse } from "next/server";
import {
  adminPasswordConfigured,
  checkPassword,
  setAdminSession,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!adminPasswordConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD belum diset di .env" },
      { status: 500 }
    );
  }
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !checkPassword(body.password)) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
