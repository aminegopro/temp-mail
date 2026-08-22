import { NextRequest, NextResponse } from "next/server"
import { receiveMessage } from "@/lib/mail-service"
import { createInbox } from "@/lib/mail-store"

export async function POST(req: NextRequest) {
  const body = await req.json()

  let to: string
  let from: string
  let subject: string
  let text: string
  let html: string | null

  if (body.event === "inbound" && body.payload) {
    const p = body.payload
    to = p.to
    from = p.from
    subject = p.subject
    text = p.textBody || p.text || ""
    html = p.htmlBody || p.html || null
  } else if (body.to && body.from) {
    to = body.to
    from = body.from
    subject = body.subject || "(No Subject)"
    text = body.text || body.textBody || ""
    html = body.html || body.htmlBody || null
  } else {
    return NextResponse.json({ error: "Invalid payload: to and from required" }, { status: 400 })
  }

  // Normalize the recipient email
  to = to.toLowerCase().trim()

  // Auto-create inbox if it doesn't exist (in case email was sent before inbox was generated)
  createInbox(to)

  const msg = receiveMessage(to, { from, subject, text, html })
  return NextResponse.json({ success: true, messageId: msg.id })
}
