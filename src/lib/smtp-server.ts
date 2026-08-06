import { SMTPServer, type SMTPServerDataStream } from "smtp-server"
import { simpleParser } from "mailparser"
import { receiveMessage } from "./mail-service"

const PORT = parseInt(process.env.SMTP_PORT || "2525", 10)
const DOMAIN = process.env.MAIL_DOMAIN || "bigsummerdeal.com"

let server: SMTPServer | null = null

export function startSMTPServer() {
  if (server) return server

  server = new SMTPServer({
    authOptional: true,
    onData(stream: SMTPServerDataStream, session, callback) {
      const chunks: Buffer[] = []
      stream.on("data", (chunk: Buffer) => chunks.push(chunk))
      stream.on("end", async () => {
        try {
          const raw = Buffer.concat(chunks)
          const parsed = await simpleParser(raw)

          const toAddresses = (Array.isArray(parsed.to) ? parsed.to : parsed.to ? [parsed.to] : [])
            .flatMap((addr) => addr.value.map((a) => a.address?.toLowerCase()))
            .filter((a): a is string => !!a)

          for (const to of toAddresses) {
            if (to.endsWith(`@${DOMAIN}`)) {
              receiveMessage(to, {
                from: parsed.from?.text || "unknown",
                subject: parsed.subject || "(No Subject)",
                text: parsed.text || "",
                html: parsed.html || null,
              })
            }
          }

          callback()
        } catch (err) {
          console.error("Failed to parse incoming email:", err)
          callback()
        }
      })
    },
  })

  server.listen(PORT, () => {
    console.log(`SMTP server listening on port ${PORT}`)
  })

  server.on("error", (err) => {
    console.error("SMTP server error:", err)
  })

  return server
}

export function stopSMTPServer() {
  if (server) {
    server.close(() => {
      console.log("SMTP server stopped")
    })
    server = null
  }
}
