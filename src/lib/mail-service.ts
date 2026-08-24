import { createInbox, getInbox, addMessage, getMessage, deleteInbox, DEFAULT_TTL_MS } from "./mail-store"

const DOMAIN = process.env.MAIL_DOMAIN || "bigsummerdeal.com"

function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateEmail(): string {
  const local = randomString(10)
  const email = `${local}@${DOMAIN}`
  createInbox(email)
  return email
}

export function getMailbox(email: string) {
  return getInbox(email)
}

export function receiveMessage(
  email: string,
  data: { from: string; subject: string; text: string; html: string | null }
) {
  const msg = addMessage(email, {
    from: data.from,
    to: email,
    subject: data.subject,
    text: data.text,
    html: data.html,
    date: new Date().toISOString(),
  })
  return msg
}

export function readMessage(messageId: string) {
  return getMessage(messageId)
}

export function removeInbox(email: string) {
  return deleteInbox(email)
}

export function getTTLMs() {
  return DEFAULT_TTL_MS
}

export function normalizeEmail(input: string): string {
  const trimmed = input.trim().toLowerCase()
  if (trimmed.includes("@")) {
    return trimmed
  }
  return `${trimmed}@${DOMAIN}`
}
