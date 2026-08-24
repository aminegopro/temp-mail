import { NextRequest, NextResponse } from "next/server"
import { simpleParser } from "mailparser"
import { receiveMessage } from "@/lib/mail-service"
import { createInbox } from "@/lib/mail-store"

interface AddressObject {
  address?: string
  name?: string
}

function extractAddress(input: unknown): string {
  if (typeof input === "string") return input
  if (input && typeof input === "object") {
    const obj = input as { value?: AddressObject[]; text?: string; address?: string }
    if (Array.isArray(obj.value) && obj.value.length > 0) {
      return obj.value[0].address || obj.text || "unknown"
    }
    if (obj.address) return obj.address
    if (obj.text) return obj.text
  }
  return "unknown"
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  let to = ""
  let from = "unknown"
  let subject = "(No Subject)"
  let text = ""
  let html: string | null = null

  // 1) Mailgun inbound format
  if (body.event === "inbound" && body.payload) {
    const p = body.payload as Record<string, unknown>
    to = String(p.to ?? "")
    from = String(p.from ?? "unknown")
    subject = String(p.subject ?? "(No Subject)")
    text = String(p.textBody ?? p.text ?? "")
    html = (p.htmlBody ?? p.html ?? null) as string | null
  }
  // 2) ForwardEmail / generic flat format
  else {
    const session = (body.session || {}) as { recipient?: string }
    const recipients = (body.recipients || []) as string[]

    to = extractAddress(body.to) || session.recipient || recipients[0] || ""
    from = extractAddress(body.from) || "unknown"
    subject = (body.subject as string) || "(No Subject)"
    text = (body.text as string) || (body as { textBody?: string }).textBody || ""
    html = (body.html as string) || (body as { htmlBody?: string }).htmlBody || null
  }

  // 3) Raw email (Cloudflare Worker) — parse MIME with mailparser
  const raw = (body.raw as string) || ""
  if (raw) {
    try {
      const parsed = await simpleParser(raw)
      const parsedTo = Array.isArray(parsed.to) ? parsed.to[0]?.text : parsed.to?.text
      const finalTo = (to || parsedTo || "").toLowerCase().trim()
      createInbox(finalTo)
      const msg = receiveMessage(finalTo, {
        from: parsed.from?.text || from,
        subject: parsed.subject || subject,
        text: parsed.text || "",
        html: parsed.html || null,
      })
      return NextResponse.json({ success: true, messageId: msg.id })
    } catch {
      return NextResponse.json({ error: "Failed to parse raw email" }, { status: 400 })
    }
  }

  to = to.toLowerCase().trim()
  if (!to) {
    return NextResponse.json({ error: "Invalid payload: recipient required" }, { status: 400 })
  }

  createInbox(to)
  const msg = receiveMessage(to, { from, subject, text, html })
  return NextResponse.json({ success: true, messageId: msg.id })
}
