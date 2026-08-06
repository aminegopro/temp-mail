# BigSummerDeal Mail — Temp Mail

Disposable email service for `bigsummerdeal.com`. Web UI, REST API, and CLI.

## Setup

```bash
cp .env.local.example .env.local   # or edit .env.local directly
npm install
```

**Environment variables:**

| Variable      | Default              | Description                    |
|---------------|----------------------|--------------------------------|
| `MAIL_DOMAIN` | `bigsummerdeal.com` | Domain for generated emails    |
| `SMTP_PORT`   | `2525`               | Port for the inbound SMTP server |

## Run

```bash
npm run dev          # Web app + API (port 3000)
npm run dev:smtp     # SMTP server only (port 2525)
npm run dev:all      # Both web app and SMTP server
```

Open [http://localhost:3000](http://localhost:3000) — click **Generate Temp Mail** to create an inbox.

## API Reference

Base URL: `http://localhost:3000`

### POST `/api/generate`

Generates a new disposable email address.

```
curl -X POST http://localhost:3000/api/generate
```

Response:
```json
{
  "email": "a1b2c3d4e5@bigsummerdeal.com"
}
```

---

### GET `/api/inbox/:email`

Returns all messages for an inbox.

```
curl http://localhost:3000/api/inbox/a1b2c3d4e5@bigsummerdeal.com
```

Response:
```json
{
  "inbox": {
    "email": "a1b2c3d4e5@bigsummerdeal.com",
    "createdAt": "2026-08-06T12:00:00.000Z",
    "messages": [
      {
        "id": "msg-uuid-here",
        "from": "sender@example.com",
        "to": "a1b2c3d4e5@bigsummerdeal.com",
        "subject": "Welcome!",
        "text": "This is the plain-text body...",
        "html": "<p>This is the HTML body...</p>",
        "date": "2026-08-06T12:05:00.000Z",
        "createdAt": "2026-08-06T12:05:00.000Z"
      }
    ]
  }
}
```

---

### GET `/api/message/:id`

Fetches a single message by ID.

```
curl http://localhost:3000/api/message/msg-uuid-here
```

Response:
```json
{
  "message": {
    "id": "msg-uuid-here",
    "from": "sender@example.com",
    "to": "a1b2c3d4e5@bigsummerdeal.com",
    "subject": "Welcome!",
    "text": "Plain-text body...",
    "html": "<p>HTML body...</p>",
    "date": "2026-08-06T12:05:00.000Z",
    "createdAt": "2026-08-06T12:05:00.000Z"
  }
}
```

---

## CLI

```bash
node cli.mjs new              # Generate an email
node cli.mjs inbox            # Show inbox for last-saved email
node cli.mjs inbox you@x.com  # Show inbox for a specific email
node cli.mjs read <msg-id>    # Read a message by ID
```

The CLI saves your latest generated email to `~/.tempmail`. Set `TEMPMAIL_URL` if the server isn't at `localhost:3000`:

```bash
TEMPMAIL_URL=https://bigsummerdeal.com node cli.mjs inbox
```

## Receiving Real Emails

The SMTP server listens on port 2525. To receive actual emails:

1. Point your domain's MX records to a server running the SMTP server
2. Or forward port 25 to 2525 (requires root on Linux/Mac)
3. Send a test email to your generated address

For production, you'll want an actual SMTP-to-API relay (Mailgun inbound, SendGrid, etc.).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      POST /api/generate
│   │   ├── inbox/[email]/route.ts GET /api/inbox/:email
│   │   └── message/[id]/route.ts  GET /api/message/:id
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    Web UI
├── lib/
│   ├── mail-store.ts               In-memory inbox store
│   ├── mail-service.ts             Core mail logic
│   └── smtp-server.ts              SMTP inbound server
cli.mjs                             CLI tool
smtp.mjs                            SMTP server entrypoint
```
