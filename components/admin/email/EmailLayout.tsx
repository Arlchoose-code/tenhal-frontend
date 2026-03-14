"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getToken } from "@/lib/auth"
import {
  Pencil, X, Send, Trash2, RefreshCw, ChevronLeft,
  Inbox, SendHorizonal, AlertCircle, Search, Paperclip,
  CornerUpLeft, CornerUpRight, XCircle
} from "lucide-react"

export interface EmailLog {
  id: number
  direction: string
  status: string
  from: string
  to: string
  subject: string
  body: string
  error: string
  created_at: string
  read?: boolean
}

interface Props {
  direction?: "in" | "out"
  status?: string
  title: string
  emptyText: string
  emptyIcon: React.ReactNode
}

interface Attachment {
  file: File
  name: string
  size: string
}

function formatDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 86400000) return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  if (diff < 604800000) return date.toLocaleDateString("id-ID", { weekday: "short" })
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1048576).toFixed(1) + " MB"
}

export default function EmailLayout({ direction, status, title, emptyText, emptyIcon }: Props) {
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<EmailLog | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, total_pages: 1 })
  const [composing, setComposing] = useState(false)
  const [replying, setReplying] = useState(false)

  // Compose state
  const [composeTo, setComposeTo] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async (p = 1) => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), per_page: "20" })
      if (direction) params.set("direction", direction)
      if (status) params.set("status", status)
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/email/logs?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setEmails(json.data ?? [])
      setMeta(json.meta ?? { total: 0, total_pages: 1 })
    } finally { setLoading(false) }
  }, [direction, status, search])

  useEffect(() => { load(page) }, [page, load])

  async function handleDelete(id: number) {
    const token = getToken()
    if (!token) return
    await fetch(`/api/admin/email/logs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    if (selected?.id === id) setSelected(null)
    load(page)
  }

  async function handleSend(to: string, subject: string, body: string) {
    const token = getToken()
    if (!token) return
    setSending(true)
    setSendResult(null)
    try {
      // Kalau ada attachment pakai FormData, kalau tidak pakai JSON
      let res: Response
      if (attachments.length > 0) {
        const fd = new FormData()
        fd.append("to", to)
        fd.append("subject", subject)
        fd.append("body", body)
        attachments.forEach(a => fd.append("attachments", a.file))
        res = await fetch("/api/admin/email/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
      } else {
        res = await fetch("/api/admin/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ to, subject, body }),
        })
      }
      const json = await res.json()
      setSendResult({ ok: json.success, msg: json.message || (json.success ? "Terkirim!" : "Gagal") })
      if (json.success) {
        setTimeout(() => { setComposing(false); setReplying(false); resetCompose(); load(page) }, 1200)
      }
    } catch { setSendResult({ ok: false, msg: "Terjadi kesalahan" }) }
    finally { setSending(false) }
  }

  function resetCompose() {
    setComposeTo(""); setComposeSubject(""); setComposeBody("")
    setAttachments([]); setSendResult(null); setReplying(false)
  }

  function openReply(email: EmailLog) {
    setComposeTo(email.from || email.to)
    setComposeSubject(`Re: ${email.subject}`)
    setComposeBody(`\n\n─────────────────\nDari: ${email.from || email.to}\n${email.body.replace(/<[^>]+>/g, "").substring(0, 500)}`)
    setReplying(true)
    setComposing(true)
  }

  function openForward(email: EmailLog) {
    setComposeTo("")
    setComposeSubject(`Fwd: ${email.subject}`)
    setComposeBody(`\n\n─────────────────\nDiteruskan dari: ${email.from || email.to}\n${email.body.replace(/<[^>]+>/g, "").substring(0, 500)}`)
    setComposing(true)
  }

  function handleAddAttachment(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newAttachments = files.map(f => ({ file: f, name: f.name, size: formatBytes(f.size) }))
    setAttachments(prev => [...prev, ...newAttachments])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeAttachment(index: number) {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const filtered = emails.filter(e =>
    !search || e.subject?.toLowerCase().includes(search.toLowerCase()) ||
    e.to?.toLowerCase().includes(search.toLowerCase()) ||
    e.from?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
        <h1 className="text-base font-bold text-[#1a3c6e] flex-shrink-0">{title}</h1>
        <div className="flex-1 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari email..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
        </div>
        <button onClick={() => load(page)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition flex-shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { resetCompose(); setComposing(true) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a3c6e] hover:bg-[#15336b] text-white text-xs font-bold rounded-lg transition flex-shrink-0 shadow-sm">
          <Pencil className="w-3.5 h-3.5" /> Tulis
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">

        {/* Email List */}
        <div className={`flex flex-col border-r border-slate-200 bg-white min-h-0 transition-all duration-200 ${selected ? "hidden sm:flex sm:w-72 lg:w-80 xl:w-96" : "w-full sm:w-72 lg:w-80 xl:w-96"}`}>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center px-6 py-20">
                <div className="text-slate-200 mb-3">{emptyIcon}</div>
                <p className="text-sm text-slate-400">{emptyText}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map(email => (
                  <button key={email.id} onClick={() => setSelected(email)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition group ${selected?.id === email.id ? "bg-blue-50 border-r-2 border-[#1a3c6e]" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a3c6e] to-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">
                          {(email.direction === "in" ? email.from : email.to)?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-xs truncate ${!email.read ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}>
                            {email.direction === "in" ? email.from : email.to}
                          </span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{formatDate(email.created_at)}</span>
                        </div>
                        <p className={`text-xs truncate mb-0.5 ${!email.read ? "font-semibold text-slate-700" : "text-slate-600"}`}>
                          {email.subject}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{email.body?.replace(/<[^>]+>/g, "").substring(0, 60)}...</p>
                      </div>
                      {!email.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                    </div>
                    {email.status === "failed" && (
                      <div className="mt-1.5 ml-11 text-[10px] text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {email.error?.substring(0, 50)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta.total_pages > 1 && (
            <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-400">{meta.total} email</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition text-xs">‹</button>
                <span className="w-6 h-6 flex items-center justify-center text-xs text-slate-600">{page}</span>
                <button onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))} disabled={page === meta.total_pages}
                  className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition text-xs">›</button>
              </div>
            </div>
          )}
        </div>

        {/* Email Detail */}
        <div className={`flex-1 flex flex-col min-h-0 bg-white ${!selected ? "hidden sm:flex" : "flex"}`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <Inbox className="w-16 h-16 text-slate-100 mb-4" />
              <p className="text-sm text-slate-400">Pilih email untuk membacanya</p>
            </div>
          ) : (
            <>
              {/* Detail Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setSelected(null)} className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition flex-shrink-0">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-800 leading-tight truncate">{selected.subject}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        selected.status === "sent" ? "bg-green-50 text-green-600 border border-green-200" :
                        selected.status === "failed" ? "bg-red-50 text-red-500 border border-red-200" :
                        "bg-blue-50 text-blue-600 border border-blue-200"
                      }`}>
                        {selected.status === "sent" ? "Terkirim" : selected.status === "failed" ? "Gagal" : "Masuk"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(selected.created_at).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openReply(selected)} title="Balas"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#1a3c6e] hover:bg-slate-100 transition">
                    <CornerUpLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => openForward(selected)} title="Teruskan"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#1a3c6e] hover:bg-slate-100 transition">
                    <CornerUpRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(selected.id)} title="Hapus"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* From/To */}
              <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a3c6e] to-blue-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {(selected.direction === "in" ? selected.from : selected.to)?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {selected.direction === "in" ? selected.from : `Ke: ${selected.to}`}
                    </p>
                    {selected.from && selected.direction === "out" && (
                      <p className="text-xs text-slate-400">Dari: {selected.from}</p>
                    )}
                  </div>
                </div>
                {selected.error && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {selected.error}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
                <div className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: selected.body || "<p style='color:#94a3b8'>Tidak ada isi email.</p>" }} />
              </div>

              {/* Quick Reply */}
              <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
                <button onClick={() => openReply(selected)}
                  className="w-full flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-400 hover:border-[#1a3c6e]/30 hover:bg-slate-50 transition text-left">
                  <CornerUpLeft className="w-4 h-4 flex-shrink-0" />
                  Balas email ini...
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Compose Modal (centered, large) ── */}
      <AnimatePresence>
        {composing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => { setComposing(false); resetCompose() }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <div
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto border border-slate-200"
                style={{ height: "min(700px, 90vh)" }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#1a3c6e] flex-shrink-0 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-white/70" />
                    <span className="text-sm font-semibold text-white">
                      {replying ? "Balas Email" : "Tulis Email Baru"}
                    </span>
                  </div>
                  <button onClick={() => { setComposing(false); resetCompose() }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* To */}
                <div className="border-b border-slate-100 px-6 py-3 flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-400 w-12 flex-shrink-0">Ke</span>
                  <input value={composeTo} onChange={e => setComposeTo(e.target.value)}
                    placeholder="email@contoh.com"
                    className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent" />
                </div>

                {/* Subject */}
                <div className="border-b border-slate-100 px-6 py-3 flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-400 w-12 flex-shrink-0">Subjek</span>
                  <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)}
                    placeholder="Subjek email"
                    className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent" />
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                  <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)}
                    placeholder="Tulis pesan di sini..."
                    className="w-full h-full min-h-[180px] text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none resize-none leading-relaxed" />
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="px-6 py-2 border-t border-slate-100 flex flex-wrap gap-2 flex-shrink-0">
                    {attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-700">
                        <Paperclip className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{a.name}</span>
                        <span className="text-slate-400">{a.size}</span>
                        <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500 transition flex-shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Send Result */}
                {sendResult && (
                  <div className={`mx-6 mb-2 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 flex-shrink-0 ${
                    sendResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-500 border border-red-200"}`}>
                    {sendResult.ok ? "✅" : "❌"} {sendResult.msg}
                  </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex gap-1">
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleAddAttachment} />
                    <button onClick={() => fileInputRef.current?.click()}
                      title="Tambah Lampiran"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1a3c6e] transition">
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setComposing(false); resetCompose() }}
                      className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                      Batal
                    </button>
                    <button onClick={() => handleSend(composeTo, composeSubject, composeBody)}
                      disabled={sending || !composeTo || !composeSubject}
                      className="px-5 py-2 text-sm font-bold bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2 shadow-sm">
                      {sending
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <SendHorizonal className="w-4 h-4" />}
                      {sending ? "Mengirim..." : "Kirim"}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}