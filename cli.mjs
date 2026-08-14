#!/usr/bin/env node

const BASE_URL = process.env.TEMPMAIL_URL || "http://localhost:3000"

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, options)
  return res.json()
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString()
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command) {
    console.log(`
╔═══════════════════════════════════╗
║     BigSummerDeal Temp Mail       ║
╠═══════════════════════════════════╣
║  new        Generate new email    ║
║  inbox      Show your inbox       ║
║  read <id>  Read a message        ║
║  help       Show this help        ║
╚═══════════════════════════════════╝
`)
    return
  }

  switch (command) {
    case "new":
    case "generate": {
      const { email } = await request("/api/generate", { method: "POST" })
      console.log(`\n  Email: ${email}\n`)
      const { writeFileSync } = await import("fs")
      const { homedir } = await import("os")
      const { join } = await import("path")
      const configPath = join(homedir(), ".tempmail")
      writeFileSync(configPath, email)
      console.log(`  Saved to ~/.tempmail\n`)
      break
    }

    case "inbox":
    case "list": {
      let email
      const emailArg = args[1]
      if (emailArg) {
        email = emailArg
      } else {
        try {
          const { readFileSync } = await import("fs")
          const { homedir } = await import("os")
          const { join } = await import("path")
          email = readFileSync(join(homedir(), ".tempmail"), "utf-8").trim()
        } catch {
          console.log("\n  No saved email. Run 'tempmail new' first or pass an email.\n")
          return
        }
      }

      const { inbox } = await request(`/api/inbox/${encodeURIComponent(email)}`)
      if (!inbox) {
        console.log("\n  Inbox not found.\n")
        return
      }

      console.log(`\n  Inbox: ${email}  (${inbox.messages.length} messages)\n`)
      if (inbox.messages.length === 0) {
        console.log("  No messages yet.\n")
        return
      }
      inbox.messages.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${formatDate(msg.date)}] ${msg.subject}`)
        console.log(`     From: ${msg.from}  ID: ${msg.id}`)
        console.log()
      })
      break
    }

    case "read":
    case "show": {
      const msgId = args[1]
      if (!msgId) {
        console.log("\n  Usage: tempmail read <message-id>\n")
        return
      }
      const { message } = await request(`/api/message/${msgId}`)
      if (!message) {
        console.log("\n  Message not found.\n")
        return
      }
      console.log(`\n  Subject: ${message.subject}`)
      console.log(`  From:    ${message.from}`)
      console.log(`  Date:    ${formatDate(message.date)}`)
      console.log(`  ─────────────────────────────────────────\n`)
      console.log(message.text || "(No text content)")
      console.log()
      break
    }

    default:
      console.log(`\n  Unknown command: ${command}\n`)
  }
}

main().catch(console.error)
