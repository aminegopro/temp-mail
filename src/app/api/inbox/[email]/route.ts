import { NextResponse } from "next/server"
import { getMailbox, removeInbox } from "@/lib/mail-service"

export async function GET(_req: Request, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params
  const inbox = getMailbox(decodeURIComponent(email))
  if (!inbox) {
    return NextResponse.json({ error: "Inbox not found" }, { status: 404 })
  }
  return NextResponse.json({ inbox })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params
  const removed = removeInbox(decodeURIComponent(email))
  if (!removed) {
    return NextResponse.json({ error: "Inbox not found" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
