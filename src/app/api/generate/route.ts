import { NextResponse } from "next/server"
import { generateEmail, getMailbox, getTTLMs } from "@/lib/mail-service"

export async function POST() {
  const email = generateEmail()
  const inbox = getMailbox(email)
  return NextResponse.json({ email, expiresAt: inbox?.expiresAt ?? null, ttl: getTTLMs() })
}
