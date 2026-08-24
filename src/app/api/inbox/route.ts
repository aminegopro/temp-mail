import { NextRequest, NextResponse } from "next/server"
import { getMailbox, normalizeEmail, getTTLMs } from "@/lib/mail-service"
import { createInbox } from "@/lib/mail-store"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const raw = body.address || ""
  if (!raw || typeof raw !== "string") {
    return NextResponse.json({ error: "address required" }, { status: 400 })
  }
  const email = normalizeEmail(raw)
  const existing = getMailbox(email)
  if (existing) {
    return NextResponse.json({ inbox: existing, ttl: getTTLMs() })
  }
  const inbox = createInbox(email)
  return NextResponse.json({ inbox, ttl: getTTLMs() })
}
