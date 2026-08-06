import { NextResponse } from "next/server"
import { generateEmail } from "@/lib/mail-service"

export async function POST() {
  const email = generateEmail()
  return NextResponse.json({ email })
}
