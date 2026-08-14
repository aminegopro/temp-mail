import { NextRequest, NextResponse } from "next/server"
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

  if (!to) {
    return NextResponse.json({ error: "Invalid payload: recipient required" }, { status: 400 })
  }

  const msg = receiveMessage(to, { from, subject, text, html })
  return NextResponse.json({ success: true, messageId: msg.id })
}