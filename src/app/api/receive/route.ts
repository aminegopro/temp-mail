import { NextRequest, NextResponse } from "next/server"
import { simpleParser } from "mailparser"
import { receiveMessage } from "@/lib/mail-service"

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

  const session = (body.session || {}) as { recipient?: string }
  const recipients = (body.recipients || []) as string[]

  const to = extractAddress(body.to) || session.recipient || recipients[0] || ""
  const from = extractAddress(body.from) || "unknown"
  const subject = (body.subject as string) || "(No Subject)"
  const text = (body.text as string) || (body as { textBody?: string }).textBody || ""
  const html = (body.html as string) || (body as { htmlBody?: string }).htmlBody || null

  const raw = (body.raw as string) || ""
  if (raw) {
    try {
      const parsed = await simpleParser(raw)
      const parsedTo = Array.isArray(parsed.to) ? parsed.to[0]?.text : parsed.to?.text
      const msg = receiveMessage(to || parsedTo || "", {
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

  if (!to) {
    return NextResponse.json({ error: "Invalid payload: recipient required" }, { status: 400 })
  }

  const msg = receiveMessage(to, { from, subject, text, html })
  return NextResponse.json({ success: true, messageId: msg.id })
}