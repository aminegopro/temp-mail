import Link from "next/link"

const endpoints = [
  {
    method: "POST",
    path: "/api/generate",
    desc: "Generate a new disposable email address.",
    req: "No body required.",
    res: `{
  "email": "a1b2c3d4e5@bigsummerdeal.com",
  "expiresAt": "2026-08-25T09:48:29.378Z"
}`,
    example: `curl -X POST https://bigsummerdeal.com/api/generate`,
  },
  {
    method: "POST",
    path: "/api/inbox",
    desc: "Open (or create) an inbox for any address under your domain.",
    req: `{ "address": "myusername" } // or full: "myusername@bigsummerdeal.com"`,
    res: `{
  "inbox": { "email": "myusername@bigsummerdeal.com", "messages": [] }
}`,
    example: `curl -X POST https://bigsummerdeal.com/api/inbox \\
  -H "Content-Type: application/json" \\
  -d '{ "address": "myusername" }'`,
  },
  {
    method: "GET",
    path: "/api/inbox/:email",
    desc: "Fetch all messages for an inbox (with sender, subject, body).",
    req: "Path param: full email address (URL-encoded).",
    res: `{
  "inbox": {
    "email": "a1b2c3d4e5@bigsummerdeal.com",
    "expiresAt": "2026-08-25T09:48:29.378Z",
    "messages": [
      {
        "id": "63a2438d-...",
        "from": "sender@example.com",
        "to": "a1b2c3d4e5@bigsummerdeal.com",
        "subject": "Your code is 123456",
        "text": "Plain text body...",
        "html": "<p>HTML body...</p>",
        "date": "2026-08-24T09:45:49.859Z"
      }
    ]
  }
}`,
    example: `curl https://bigsummerdeal.com/api/inbox/a1b2c3d4e5@bigsummerdeal.com`,
  },
  {
    method: "DELETE",
    path: "/api/inbox/:email",
    desc: "Delete an inbox and all its messages immediately.",
    req: "Path param: full email address.",
    res: `{ "success": true }`,
    example: `curl -X DELETE https://bigsummerdeal.com/api/inbox/a1b2c3d4e5@bigsummerdeal.com`,
  },
  {
    method: "GET",
    path: "/api/message/:id",
    desc: "Fetch a single message by its ID.",
    req: "Path param: message ID from the inbox response.",
    res: `{
  "message": {
    "id": "63a2438d-...",
    "from": "sender@example.com",
    "subject": "Your code is 123456",
    "text": "Plain text body...",
    "html": "<p>HTML body...</p>",
    "date": "2026-08-24T09:45:49.859Z"
  }
}`,
    example: `curl https://bigsummerdeal.com/api/message/63a2438d-...`,
  },
]

function Code({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: "#0a1120",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "12px 16px",
        overflowX: "auto",
        fontSize: 13,
        lineHeight: 1.6,
        color: "#c9d6f5",
      }}
    >
      {children}
    </pre>
  )
}

export default function DocsPage() {
  return (
    <div className="flex flex-col flex-1 relative" style={{ zIndex: 1 }}>
      <header className="header px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="logo-text">BigSummerDeal</span>
              <span className="logo-sub ml-1.5">Mail</span>
            </h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="btn-secondary"
              style={{ padding: "6px 14px", fontSize: 13 }}
            >
              Back to inbox
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--primary)",
              marginBottom: 8,
            }}
          >
            API Reference
          </p>
          <h1 className="hero-title" style={{ fontSize: 28, marginBottom: 8 }}>
            Temporary Mail API
          </h1>
          <p className="hero-subtitle" style={{ fontSize: 15, marginBottom: 0, maxWidth: 560 }}>
            Programmatic disposable email. Generate addresses, poll inboxes, and
            read messages — no auth required. Base URL:{" "}
            <span style={{ color: "var(--foreground)", fontFamily: "monospace" }}>
              https://bigsummerdeal.com
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {endpoints.map((ep) => (
            <div key={ep.method + ep.path} className="viewer-card">
              <div className="viewer-header" style={{ padding: "14px 20px" }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      background: ep.method === "GET"
                        ? "rgba(52,211,153,0.12)"
                        : ep.method === "POST"
                          ? "rgba(38,101,253,0.14)"
                          : "rgba(255,180,171,0.14)",
                      color: ep.method === "GET"
                        ? "#34d399"
                        : ep.method === "POST"
                          ? "#7ca3ff"
                          : "#ffb4ab",
                      border: `1px solid ${
                        ep.method === "GET"
                          ? "rgba(52,211,153,0.3)"
                          : ep.method === "POST"
                            ? "rgba(38,101,253,0.35)"
                            : "rgba(255,180,171,0.3)"
                      }`,
                    }}
                  >
                    {ep.method}
                  </span>
                  <code
                    style={{
                      fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
                      fontSize: 14,
                      color: "var(--foreground)",
                    }}
                  >
                    {ep.path}
                  </code>
                </div>
              </div>
              <div className="viewer-body" style={{ padding: "16px 20px" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {ep.desc}
                </p>

                {ep.req && (
                  <>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: "var(--text-tertiary)",
                        marginBottom: 6,
                      }}
                    >
                      Request
                    </p>
                    <Code>{ep.req}</Code>
                  </>
                )}

                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "var(--text-tertiary)",
                    margin: "12px 0 6px",
                  }}
                >
                  Response
                </p>
                <Code>{ep.res}</Code>

                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "var(--text-tertiary)",
                    margin: "12px 0 6px",
                  }}
                >
                  Example
                </p>
                <Code>{ep.example}</Code>
              </div>
            </div>
          ))}
        </div>

        <div className="viewer-card mt-8">
          <div className="viewer-body" style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>
              Notes
            </p>
            <ul
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.8,
                paddingLeft: 16,
                margin: 0,
              }}
            >
              <li>Inboxes auto-expire after 24 hours. Expired inboxes are deleted automatically.</li>
              <li>Messages are stored in memory — they are cleared on server restart.</li>
              <li>Each inbox keeps at most the 50 most recent messages.</li>
              <li>
                Incoming email is received via{" "}
                <span style={{ fontFamily: "monospace" }}>@bigsummerdeal.com</span> and
                forwarded to your inbox automatically.
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
            BigSummerDeal Mail — Disposable temporary email
          </p>
          <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
            Emails auto-delete after 24 hours
          </p>
        </div>
      </footer>
    </div>
  )
}
