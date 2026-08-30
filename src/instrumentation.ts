import { startSMTPServer } from "./lib/smtp-server"
import { purgeExpired } from "./lib/mail-store"

export function register() {
  // Only start SMTP on the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    startSMTPServer()

    // Periodically purge expired inboxes so in-memory state doesn't grow
    // unbounded (prevents Node heap exhaustion / OOM crashes).
    setInterval(() => {
      try {
        const removed = purgeExpired()
        if (removed > 0) console.log(`🧹 Purged ${removed} expired inbox(es)`)
      } catch (err) {
        console.error("Purge failed:", err)
      }
    }, 5 * 60 * 1000)
  }
}
