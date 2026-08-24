export interface Message {
  id: string
  from: string
  to: string
  subject: string
  text: string
  html: string | null
  date: string
  createdAt: string
}

export interface Inbox {
  email: string
  createdAt: string
  expiresAt: string
  messages: Message[]
}

const inboxes = new Map<string, Inbox>()

export const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000

function makeExpiry(): string {
  return new Date(Date.now() + DEFAULT_TTL_MS).toISOString()
}

export function createInbox(email: string): Inbox {
  const existing = inboxes.get(email)
  if (existing) {
    return existing
  }
  const inbox: Inbox = {
    email,
    createdAt: new Date().toISOString(),
    expiresAt: makeExpiry(),
    messages: [],
  }
  inboxes.set(email, inbox)
  return inbox
}

function isExpired(inbox: Inbox): boolean {
  return new Date(inbox.expiresAt).getTime() <= Date.now()
}

export function purgeExpired(): number {
  let removed = 0
  for (const [email, inbox] of inboxes) {
    if (isExpired(inbox)) {
      inboxes.delete(email)
      removed++
    }
  }
  return removed
}

export function getInbox(email: string): Inbox | undefined {
  purgeExpired()
  return inboxes.get(email)
}

export function addMessage(email: string, msg: Omit<Message, "id" | "createdAt">): Message {
  const inbox = inboxes.get(email)
  if (!inbox) {
    throw new Error(`Inbox not found for ${email}`)
  }
  const message: Message = {
    ...msg,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  inbox.messages.unshift(message)
  return message
}

export function getMessage(messageId: string): Message | undefined {
  purgeExpired()
  for (const inbox of inboxes.values()) {
    const msg = inbox.messages.find((m) => m.id === messageId)
    if (msg) return msg
  }
  return undefined
}

export function getAllInboxes(): Inbox[] {
  purgeExpired()
  return Array.from(inboxes.values())
}

export function deleteInbox(email: string): boolean {
  return inboxes.delete(email)
}
