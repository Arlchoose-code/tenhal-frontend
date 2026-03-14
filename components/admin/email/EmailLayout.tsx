"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import {
  Pencil, X, Send, Trash2, RefreshCw, ChevronLeft,
  Inbox, SendHorizonal, AlertCircle, Search, Paperclip,
  CornerUpLeft, CornerUpRight, XCircle, ChevronDown, ChevronUp
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

function formatDateFull(d: string) {
  return new Date(d).toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
    year: "numeric", hour: "2-digit", minute: "2-digit"
  })
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1048576).toFixed(1) + " MB"
}

function getInitial(email: string) {
  return email?.charAt(0)?.toUpperCase() || "?"
}

function getAvatarColor(email: string) {
  const colors = [
    "from-blue-500 to-blue-700",
    "from-emerald-500 to-emerald-700",
    "from-violet-500 to-violet-700",
    "from-rose-500 to-rose-700",
    "from-amber-500 to-amber-700",
    "from-cyan-500 to-cyan-700",
  ]
  const idx = (email?.charCodeAt(0) || 0) % colors.length
  return colors[idx]
}

function stripHtmlForPreview(html: string) {
  return html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 80) || ""
}

// Strip quoted reply from body for display in compose
function stripQuotedReply(body: string) {
  // Remove everything after common reply markers
  const markers = [
    /\n\n─{5,}[\s\S]*/,
    /\n\nOn .* wrote:[\s\S]*/,
    /\n\n-{5,} Original Message -{5,}[\s\S]*/,
  ]
  let stripped = body
  for (const marker of markers) {
    stripped = stripped.replace(marker, "")
  }
  return stripped.trim()
}

export default function EmailLayout({ direction, status, title, emptyText, emptyIcon }: Props) {
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<EmailLog | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, total_pages: 1 })
  const searchParams = useSearchParams()
  const router = useRouter()
  const [composing, setComposing] = useState(false)
  const [replying, setReplying] = useState(false)
  const [showQuoted, setShowQuoted] = useState(false)

  // Compose state
  const [composeTo, setComposeTo] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [quotedBody, setQuotedBody] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

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

  // Auto-open compose dari URL params (dari halaman applicants/contacts)
  useEffect(() => {
    const compose = searchParams.get("compose")
    const to = searchParams.get("to")
    const subject = searchParams.get("subject")
    if (compose === "1" && to) {
      setComposeTo(decodeURIComponent(to))
      setComposeSubject(subject ? decodeURIComponent(subject) : "")
      setComposeBody("")
      setQuotedBody("")
      setReplying(false)
      setComposing(true)
      // Hapus params dari URL supaya ga re-trigger
      router.replace("/admin/email/inbox", { scroll: false })
    }
  }, [searchParams])

  async function handleSelect(email: EmailLog) {
    setSelected(email)
    if (!email.read) {
      const token = getToken()
      if (token) {
        fetch(`/api/admin/email/logs/${email.id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }).then(() => {
          setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e))
          // Trigger sidebar refresh counts
          window.dispatchEvent(new Event("email:read"))
        })
      }
    }
  }

  async function handleDelete(id: number) {
    const token = getToken()
    if (!token) return
    await fetch(`/api/admin/email/logs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    if (selected?.id === id) setSelected(null)
    load(page)
  }

  async function handleSend() {
    const token = getToken()
    if (!token) return
    setSending(true)
    setSendResult(null)

    // Gabungkan body + quoted
    const fullBody = quotedBody
      ? `${composeBody}\n\n<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/><blockquote style="border-left:3px solid #cbd5e1;padding-left:12px;color:#64748b;margin:0">${quotedBody}</blockquote>`
      : composeBody

    try {
      let res: Response
      if (attachments.length > 0) {
        const fd = new FormData()
        fd.append("to", composeTo)
        fd.append("subject", composeSubject)
        fd.append("body", fullBody)
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
          body: JSON.stringify({ to: composeTo, subject: composeSubject, body: fullBody }),
        })
      }
      const json = await res.json()
      setSendResult({ ok: json.success, msg: json.message || (json.success ? "Email berhasil dikirim!" : "Gagal mengirim") })
      if (json.success) {
        setTimeout(() => { setComposing(false); resetCompose(); load(page) }, 1500)
      }
    } catch { setSendResult({ ok: false, msg: "Terjadi kesalahan koneksi" }) }
    finally { setSending(false) }
  }

  function resetCompose() {
    setComposeTo(""); setComposeSubject(""); setComposeBody("")
    setQuotedBody(""); setAttachments([]); setSendResult(null)
    setReplying(false); setShowQuoted(false)
  }

  function openReply(email: EmailLog) {
    setComposeTo(email.from || email.to)
    setComposeSubject(email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`)
    setComposeBody("")
    setQuotedBody(email.body || "")
    setShowQuoted(false)
    setReplying(true)
    setComposing(true)
    setTimeout(() => bodyRef.current?.focus(), 100)
  }

  function openForward(email: EmailLog) {
    setComposeTo("")
    setComposeSubject(email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`)
    setComposeBody("")
    setQuotedBody(email.body || "")
    setShowQuoted(false)
    setReplying(false)
    setComposing(true)
    setTimeout(() => bodyRef.current?.focus(), 100)
  }

  function handleAddAttachment(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setAttachments(prev => [...prev, ...files.map(f => ({ file: f, name: f.name, size: formatBytes(f.size) }))])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const filtered = emails.filter(e =>
    !search || e.subject?.toLowerCase().includes(search.toLowerCase()) ||
    e.to?.toLowerCase().includes(search.toLowerCase()) ||
    e.from?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f6f8fc]">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-white flex-shrink-0 shadow-sm">
        <h1 className="text-sm font-bold text-[#1a3c6e] flex-shrink-0">{title}</h1>
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari di email..."
            className="w-full pl-8 pr-3 py-2 bg-[#eaf1fb] border-0 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
        </div>
        <button onClick={() => load(page)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition flex-shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { resetCompose(); setComposing(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:shadow-md text-slate-700 text-xs font-semibold rounded-2xl transition border border-slate-200 shadow-sm flex-shrink-0">
          <Pencil className="w-3.5 h-3.5 text-[#1a3c6e]" /> Tulis
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">

        {/* Email List */}
        <div className={`flex flex-col bg-white border-r border-slate-200 min-h-0 transition-all duration-200
          ${selected ? "hidden sm:flex sm:w-72 lg:w-80 xl:w-[340px]" : "w-full sm:w-72 lg:w-80 xl:w-[340px]"}`}>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="px-4 py-3.5 flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-0.5">
                      <div className="h-3 bg-slate-200 rounded-full w-2/3" />
                      <div className="h-3 bg-slate-200 rounded-full w-1/2" />
                      <div className="h-2.5 bg-slate-100 rounded-full w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center px-6 py-20 gap-3">
                <div className="text-slate-200">{emptyIcon}</div>
                <p className="text-sm text-slate-400">{emptyText}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map(email => {
                  const contactEmail = email.direction === "in" ? email.from : email.to
                  const isSelected = selected?.id === email.id
                  const isUnread = !email.read
                  return (
                    <button key={email.id} onClick={() => handleSelect(email)}
                      className={`w-full text-left px-4 py-3.5 hover:bg-[#f0f4ff] transition-colors group relative
                        ${isSelected ? "bg-[#e8eefa]" : ""}`}>
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(contactEmail)} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">{getInitial(contactEmail)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className={`text-xs truncate ${isUnread ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                              {contactEmail}
                            </span>
                            <span className={`text-[10px] flex-shrink-0 ${isUnread ? "font-semibold text-[#1a3c6e]" : "text-slate-400"}`}>
                              {formatDate(email.created_at)}
                            </span>
                          </div>
                          <p className={`text-xs truncate mb-0.5 ${isUnread ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                            {email.subject}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate leading-relaxed">
                            {stripHtmlForPreview(email.body)}
                          </p>
                        </div>
                      </div>
                      {isUnread && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      {email.status === "failed" && (
                        <div className="mt-1.5 ml-12 text-[10px] text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {email.error?.substring(0, 50)}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta.total_pages > 1 && (
            <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
              <span className="text-xs text-slate-400">{meta.total} email</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition text-xs">‹</button>
                <span className="text-xs text-slate-600 px-1">{page} / {meta.total_pages}</span>
                <button onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))} disabled={page === meta.total_pages}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition text-xs">›</button>
              </div>
            </div>
          )}
        </div>

        {/* Email Detail */}
        <div className={`flex-1 flex flex-col min-h-0 bg-[#f6f8fc] ${!selected ? "hidden sm:flex" : "flex"}`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
              <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center">
                <Inbox className="w-9 h-9 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Tidak ada email dipilih</p>
                <p className="text-xs text-slate-400 mt-1">Pilih email dari daftar untuk membacanya</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <div className="flex-1 px-4 sm:px-8 py-6 max-w-3xl w-full mx-auto">

                {/* Back button mobile */}
                <button onClick={() => setSelected(null)}
                  className="sm:hidden flex items-center gap-1 text-sm text-[#1a3c6e] font-medium mb-4 hover:underline">
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </button>

                {/* Subject */}
                <h2 className="text-xl font-bold text-slate-800 leading-tight mb-4">{selected.subject}</h2>

                {/* Email meta card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                  {/* Sender info */}
                  <div className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selected.direction === "in" ? selected.from : selected.to)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-bold">
                          {getInitial(selected.direction === "in" ? selected.from : selected.to)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800">
                            {selected.direction === "in" ? selected.from : `Ke: ${selected.to}`}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            selected.status === "sent" ? "bg-green-50 text-green-600" :
                            selected.status === "failed" ? "bg-red-50 text-red-500" :
                            "bg-blue-50 text-blue-600"
                          }`}>
                            {selected.status === "sent" ? "Terkirim" : selected.status === "failed" ? "Gagal" : "Masuk"}
                          </span>
                        </div>
                        {selected.direction === "out" && selected.from && (
                          <p className="text-xs text-slate-400 mt-0.5">dari: {selected.from}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">{formatDateFull(selected.created_at)}</p>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => openReply(selected)} title="Balas"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-[#1a3c6e] hover:bg-slate-100 transition">
                        <CornerUpLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => openForward(selected)} title="Teruskan"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-[#1a3c6e] hover:bg-slate-100 transition">
                        <CornerUpRight className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(selected.id)} title="Hapus"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {selected.error && (
                    <div className="mx-5 mb-4 flex items-center gap-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {selected.error}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Body */}
                  <div className="px-5 py-5">
                    <div
                      className="prose prose-sm max-w-none text-slate-700 leading-relaxed
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-slate-300 prose-blockquote:text-slate-500
                        prose-pre:bg-slate-50 prose-pre:text-slate-700"
                      dangerouslySetInnerHTML={{
                        __html: selected.body || "<p style='color:#94a3b8;font-style:italic'>Tidak ada isi email.</p>"
                      }}
                    />
                  </div>
                </div>

                {/* Quick Reply bar */}
                <button onClick={() => openReply(selected)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-400 hover:border-blue-300 hover:shadow-sm transition text-left group shadow-sm">
                  <CornerUpLeft className="w-4 h-4 flex-shrink-0 group-hover:text-[#1a3c6e] transition" />
                  <span className="group-hover:text-slate-600 transition">Balas email ini...</span>
                </button>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Compose Modal ── */}
      <AnimatePresence>
        {composing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => { setComposing(false); resetCompose() }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
              <div
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto border border-slate-200/80"
                style={{ height: "min(680px, 90vh)" }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a3c6e] flex-shrink-0">
                  <span className="text-sm font-semibold text-white">
                    {replying ? "Balas Email" : "Tulis Email Baru"}
                  </span>
                  <button onClick={() => { setComposing(false); resetCompose() }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* To */}
                <div className="border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-400 w-14 flex-shrink-0">Ke</span>
                  <input value={composeTo} onChange={e => setComposeTo(e.target.value)}
                    placeholder="Alamat email tujuan"
                    className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent py-1" />
                </div>

                {/* Subject */}
                <div className="border-b border-slate-100 px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-400 w-14 flex-shrink-0">Subjek</span>
                  <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)}
                    placeholder="Subjek email"
                    className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent py-1" />
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 flex flex-col gap-3">
                  <textarea
                    ref={bodyRef}
                    value={composeBody}
                    onChange={e => setComposeBody(e.target.value)}
                    placeholder="Tulis pesan di sini..."
                    className="w-full flex-1 min-h-[120px] text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none resize-none leading-relaxed"
                  />

                  {/* Quoted body (reply/forward) */}
                  {quotedBody && (
                    <div className="border-t border-slate-100 pt-3">
                      <button
                        onClick={() => setShowQuoted(v => !v)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition mb-2">
                        {showQuoted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {showQuoted ? "Sembunyikan" : "Tampilkan"} pesan sebelumnya
                      </button>
                      {showQuoted && (
                        <div
                          className="border-l-4 border-slate-200 pl-4 text-xs text-slate-500 leading-relaxed prose prose-xs max-w-none"
                          dangerouslySetInnerHTML={{ __html: quotedBody }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="px-5 py-2 border-t border-slate-100 flex flex-wrap gap-2 flex-shrink-0">
                    {attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                        <Paperclip className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{a.name}</span>
                        <span className="text-slate-400">{a.size}</span>
                        <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                          className="text-slate-400 hover:text-red-500 transition flex-shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Send Result */}
                {sendResult && (
                  <div className={`mx-5 mb-2 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 flex-shrink-0 ${
                    sendResult.ok
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-500 border border-red-200"
                  }`}>
                    {sendResult.ok ? "✅" : "❌"} {sendResult.msg}
                  </div>
                )}

                {/* Footer */}
                <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
                  <div className="flex gap-1">
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleAddAttachment} />
                    <button onClick={() => fileInputRef.current?.click()} title="Tambah Lampiran"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-[#1a3c6e] transition">
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setComposing(false); resetCompose() }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition">
                      Batal
                    </button>
                    <button onClick={handleSend}
                      disabled={sending || !composeTo || !composeSubject}
                      className="px-5 py-2 text-xs font-bold bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2 shadow-sm">
                      {sending
                        ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <SendHorizonal className="w-3.5 h-3.5" />}
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