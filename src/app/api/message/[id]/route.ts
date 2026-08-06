import { NextResponse } from "next/server"
import { readMessage } from "@/lib/mail-service"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const message = readMessage(id)
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 })
  }
  return NextResponse.json({ message })
}
