"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface Message {
  id: string
  from: string
  subject: string
  text: string
  html: string | null
  date: string
}

export default function Home() {
  const [email, setEmail] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null)
  const [polling, setPolling] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState("00:00")
  const [testSending, setTestSending] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [remaining, setRemaining] = useState("")
  const [openInput, setOpenInput] = useState("")
  const [opening, setOpening] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetInbox = (data: { email: string; expiresAt?: string | null; messages?: Message[] }) => {
    setEmail(data.email)
    setMessages(data.messages ?? [])
    setSelectedMsg(null)
    setExpiresAt(data.expiresAt ?? null)
    setStartTime(Date.now())
  }

  const generateEmail = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/generate", { method: "POST" })
      const data = await res.json()
      resetInbox(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openAddress = async () => {
    if (!openInput.trim()) return
    setOpening(true)
    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: openInput.trim() }),
      })
      const data = await res.json()
      if (data.inbox) {
        resetInbox({ email: data.inbox.email, expiresAt: data.inbox.expiresAt, messages: data.inbox.messages })
        setOpenInput("")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setOpening(false)
    }
  }

  const deleteInbox = async () => {
    if (!email) return
    setDeleting(true)
    try {
      await fetch(`/api/inbox/${encodeURIComponent(email)}`, { method: "DELETE" })
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
      setEmail(null)
      setMessages([])
      setSelectedMsg(null)
      setExpiresAt(null)
      setStartTime(null)
      setElapsed("00:00")
    }
  }

  const pollInbox = useCallback(async () => {
    if (!email) return
    setPolling(true)
    try {
      const res = await fetch(`/api/inbox/${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.inbox) {
        setMessages(data.inbox.messages)
        if (data.inbox.expiresAt) setExpiresAt(data.inbox.expiresAt)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPolling(false)
    }
  }, [email])

  // Auto-poll every 5 seconds
  useEffect(() => {
    if (!email) return

    const initial = setTimeout(() => pollInbox(), 0)
    const id = setInterval(pollInbox, 5000)
    return () => {
      clearTimeout(initial)
      clearInterval(id)
    }
  }, [email, pollInbox])

  // Session timer + expiry countdown
  useEffect(() => {
    if (!startTime) return

    const update = () => {
      const diff = Math.floor((Date.now() - startTime) / 1000)
      const mins = Math.floor(diff / 60).toString().padStart(2, "0")
      const secs = (diff % 60).toString().padStart(2, "0")
      setElapsed(`${mins}:${secs}`)

      if (expiresAt) {
        const remainMs = new Date(expiresAt).getTime() - Date.now()
        if (remainMs <= 0) {
          setRemaining("expired")
        } else {
          const totalSec = Math.floor(remainMs / 1000)
          const h = Math.floor(totalSec / 3600)
          const m = Math.floor((totalSec % 3600) / 60)
          const s = totalSec % 60
          setRemaining(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`)
        }
      }
    }

    update()
    timerRef.current = setInterval(update, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTime, expiresAt])

  const sendTestEmail = async () => {
    if (!email) return
    setTestSending(true)
    try {
      await fetch("/api/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          from: "test@bigsummerdeal.com",
          subject: "Test Email",
          text: "This is a test email to verify the inbox is working.\n\nIf you can read this, the receive pipeline works.",
          html: "<p>This is a <strong>test email</strong> to verify the inbox is working.</p><p>If you can read this, the receive pipeline works.</p>",
        }),
      })
      await pollInbox()
    } catch (err) {
      console.error(err)
    } finally {
      setTestSending(false)
    }
  }

  const copyEmail = async () => {
    if (!email) return
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col flex-1 relative" style={{ zIndex: 1 }}>
      {/* Header */}
      <header className="header px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--primary)",
              }}
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

          <div className="flex items-center gap-3">
            {email && (
              <>
                <div className="timer hidden sm:flex">
                  <span className="timer-dot" />
                  <span>{elapsed}</span>
                </div>
                <div className="status-badge status-active hidden sm:flex">
                  <span style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 6px var(--accent)",
                  }} />
                  Live
                </div>
                <button
                  onClick={pollInbox}
                  disabled={polling}
                  className="btn-secondary"
                >
                  {polling ? (
                    <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
                    </svg>
                  )}
                  Refresh
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {!email ? (
          /* ═══════ Hero / Landing ═══════ */
          <div className="hero">
            <div className="empty-icon" style={{ width: 64, height: 64, fontSize: "1.5rem", marginBottom: 20 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h2 className="hero-title">
              <span className="hero-title-gradient">Temporary</span> email,{" "}
              <br className="sm:hidden" />
              instantly
            </h2>
            <p className="hero-subtitle">
              Generate a disposable email address in one click. No signup, no
              password — a clean inbox for sign-ups and verifications.
            </p>
            <div className="hero-btn">
              <button
                onClick={generateEmail}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Generate Temp Mail
                  </>
                )}
              </button>
            </div>

            {/* Open existing address */}
            <form
              className="flex items-center gap-2 mt-6 w-full max-w-sm"
              onSubmit={(e) => {
                e.preventDefault()
                openAddress()
              }}
            >
              <div className="flex-1 flex items-center gap-2" style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "0 12px",
                height: 40,
              }}>
                <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>@</span>
                <input
                  value={openInput}
                  onChange={(e) => setOpenInput(e.target.value)}
                  placeholder="open existing address"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--foreground)",
                    fontSize: 14,
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={opening || !openInput.trim()}
                className="btn-secondary"
                style={{ height: 40 }}
              >
                {opening ? "..." : "Open"}
              </button>
            </form>

            {/* Feature chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-12" style={{ animation: "fadeIn 0.8s var(--ease-out) 0.45s both" }}>
              {["No Signup Required", "Instant Inbox", "Auto-Refresh"].map((feat) => (
                <span
                  key={feat}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 100,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* ═══════ Inbox View ═══════ */
          <div className="flex flex-col gap-6">
            {/* Email Address Card */}
            <div className="email-card">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    Your temporary email
                  </p>
                  <p className="email-address">{email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={sendTestEmail}
                    disabled={testSending}
                    className="btn-secondary"
                  >
                    {testSending ? "..." : "Send Test"}
                  </button>
                  <button
                    onClick={copyEmail}
                    className={`btn-accent ${copied ? "btn-copy-success" : ""}`}
                  >
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={generateEmail}
                    disabled={loading}
                    className="btn-secondary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 21h5v-5" />
                    </svg>
                    New
                  </button>
                  <button
                    onClick={deleteInbox}
                    disabled={deleting}
                    className="btn-secondary"
                    style={{ color: "var(--error)", borderColor: "rgba(255,180,171,0.3)" }}
                  >
                    {deleting ? (
                      "..."
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Auto-refresh indicator */}
              <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="timer">
                  <span className="timer-dot" />
                  <span>Session: {elapsed}</span>
                </div>
                {remaining && (
                  <div className="timer">
                    <span style={{ color: remaining === "expired" ? "var(--error)" : "var(--text-tertiary)" }}>
                      {remaining === "expired" ? "Expired" : `Expires in ${remaining}`}
                    </span>
                  </div>
                )}
                <div className="status-badge status-polling" style={{ fontSize: "0.65rem" }}>
                  Auto-refresh: 5s
                </div>
              </div>
            </div>

            {/* Inbox + Viewer Layout */}
            <div className="flex gap-6 flex-col lg:flex-row" style={{ minHeight: 400 }}>
              {/* Inbox List */}
              <div className="inbox-section" style={{ flex: selectedMsg ? "0 0 340px" : "1" }}>
                <div className="inbox-header">
                  <div className="flex items-center">
                    <span className="inbox-title">Inbox</span>
                    <span className="inbox-count">{messages.length}</span>
                  </div>
                  <button
                    onClick={sendTestEmail}
                    disabled={testSending}
                    className="btn-secondary"
                    style={{ fontSize: "0.7rem", padding: "4px 10px" }}
                  >
                    {testSending ? "Sending..." : "Send Test"}
                  </button>
                </div>

                {messages.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <p className="empty-title">No messages yet</p>
                  <p className="empty-text">
                    Waiting for incoming mail...
                    <br />
                    Auto-refreshing every 5 seconds
                  </p>

                  <button
                    onClick={sendTestEmail}
                    disabled={testSending}
                    className="btn-secondary mt-4"
                  >
                    {testSending ? (
                      <>
                        <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Send Test Email"
                    )}
                  </button>

                    {/* Skeleton preview */}
                    <div className="w-full mt-6" style={{ maxWidth: 280 }}>
                      <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "60%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "40%", marginTop: 20 }} />
                      <div className="skeleton skeleton-line" style={{ width: "70%" }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {messages.map((msg, idx) => (
                      <button
                        key={msg.id}
                        onClick={() => setSelectedMsg(msg)}
                        className={`message-item ${selectedMsg?.id === msg.id ? "active" : ""}`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="shrink-0 flex items-center justify-center"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              background: selectedMsg?.id === msg.id
                                ? "var(--accent-glow)"
                                : "var(--surface-2)",
                              border: "1px solid var(--border)",
                              fontSize: "0.9rem",
                              transition: "all 0.25s",
                            }}
                          >
                            {selectedMsg?.id === msg.id ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="message-subject">{msg.subject || "(No Subject)"}</p>
                            <p className="message-meta">
                              {msg.from} · {new Date(msg.date).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Email Viewer */}
              {selectedMsg && (
                <div className="viewer-panel flex-1 min-w-0">
                  <div className="viewer-card">
                    <div className="viewer-header">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="viewer-subject">{selectedMsg.subject || "(No Subject)"}</p>
                          <p className="viewer-meta">
                            From: {selectedMsg.from}
                          </p>
                          <p className="viewer-meta" style={{ marginTop: 2 }}>
                            {new Date(selectedMsg.date).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedMsg(null)}
                          className="btn-secondary shrink-0"
                          style={{ padding: "6px 10px" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="viewer-body">
                      {selectedMsg.html ? (
                        <iframe
                          srcDoc={selectedMsg.html}
                          sandbox=""
                          style={{
                            width: "100%",
                            minHeight: 300,
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            background: "#fff",
                          }}
                          title="Email content"
                        />
                      ) : (
                        selectedMsg.text || "(No content)"
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
            BigSummerDeal Mail — Disposable temporary email
          </p>
          <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
            Emails auto-delete on server restart
          </p>
        </div>
      </footer>
    </div>
  )
}
