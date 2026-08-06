"use client"

import { useState } from "react"

interface Message {
  id: string
  from: string
  subject: string
  text: string
  date: string
}

export default function Home() {
  const [email, setEmail] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null)
  const [polling, setPolling] = useState(false)

  const generateEmail = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/generate", { method: "POST" })
      const data = await res.json()
      setEmail(data.email)
      setMessages([])
      setSelectedMsg(null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const pollInbox = async () => {
    if (!email) return
    setPolling(true)
    try {
      const res = await fetch(`/api/inbox/${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.inbox) {
        setMessages(data.inbox.messages)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPolling(false)
    }
  }

  const copyEmail = async () => {
    if (!email) return
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">
            BigSummerDeal <span className="text-zinc-500 font-normal">Mail</span>
          </h1>
          {email && (
            <button
              onClick={pollInbox}
              disabled={polling}
              className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors disabled:opacity-50"
            >
              {polling ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {!email ? (
          <div className="flex flex-col items-center justify-center mt-32 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Temporary Email Address
            </h2>
            <p className="text-zinc-400 max-w-md mb-8">
              Generate a disposable email address. No signup, no password — just
              instant inbox for sign-ups and verifications.
            </p>
            <button
              onClick={generateEmail}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 text-lg"
            >
              {loading ? "Generating..." : "Generate Temp Mail"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500 mb-1">Your temp email</p>
                <p className="text-xl font-mono text-white truncate">{email}</p>
              </div>
              <button
                onClick={copyEmail}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={generateEmail}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors shrink-0"
              >
                New
              </button>
            </div>

            <div className="flex gap-6 flex-col lg:flex-row">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Inbox ({messages.length})
                </h3>
                {messages.length === 0 ? (
                  <p className="text-zinc-600 text-sm py-8 text-center">
                    No messages yet. Waiting for incoming mail...
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {messages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => setSelectedMsg(msg)}
                        className={`text-left p-3 rounded-lg transition-colors ${
                          selectedMsg?.id === msg.id
                            ? "bg-zinc-800 border border-zinc-700"
                            : "hover:bg-zinc-900 border border-transparent"
                        }`}
                      >
                        <p className="text-sm font-medium text-white truncate">
                          {msg.subject}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">
                          {msg.from} · {new Date(msg.date).toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedMsg && (
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Message
                  </h3>
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <p className="text-lg font-semibold text-white mb-1">
                      {selectedMsg.subject}
                    </p>
                    <p className="text-sm text-zinc-500 mb-4">
                      From: {selectedMsg.from} ·{" "}
                      {new Date(selectedMsg.date).toLocaleString()}
                    </p>
                    <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {selectedMsg.text}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
