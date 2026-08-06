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
  messages: Message[]
}

const inboxes = new Map<string, Inbox>()

export function createInbox(email: string): Inbox {
  if (inboxes.has(email)) {
    return inboxes.get(email)!
  }
  const inbox: Inbox = {
    email,
    createdAt: new Date().toISOString(),
    messages: [],
  }
  inboxes.set(email, inbox)
  return inbox
}

export function getInbox(email: string): Inbox | undefined {
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
  for (const inbox of inboxes.values()) {
    const msg = inbox.messages.find((m) => m.id === messageId)
    if (msg) return msg
  }
  return undefined
}

export function getAllInboxes(): Inbox[] {
  return Array.from(inboxes.values())
}

export function deleteInbox(email: string): boolean {
  return inboxes.delete(email)
}
