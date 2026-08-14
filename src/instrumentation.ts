import { startSMTPServer } from "./lib/smtp-server"

export function register() {
  // Only start SMTP on the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    startSMTPServer()
  }
}
