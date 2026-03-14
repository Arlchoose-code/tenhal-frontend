"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import { adminDelete } from "@/lib/api"
import Pagination from "@/components/ui/pagination"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Trash2, Mail, MessageSquare, Eye } from "lucide-react"

interface ContactMessage {
  id: number
  first_name: string
  last_name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

interface ContactsResponse {
  data: ContactMessage[]
  meta: { total: number; total_pages: number; page: number }
}

export default function ContactsPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [meta, setMeta] = useState({ total: 0, total_pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"" | "unread" | "read">("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [detail, setDetail] = useState<ContactMessage | null>(null)

  const loadMessages = useCallback(async (p: number, s: string, f: "" | "unread" | "read") => {
    const token = getToken(); if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), per_page: "20" })
      if (s) params.set("search", s)
      if (f === "unread") params.set("is_read", "0")
      if (f === "read") params.set("is_read", "1")
      const res = await fetch(`/api/admin/contacts?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) { setMessages([]); return }
      const json: ContactsResponse = await res.json()
      setMessages(json.data ?? [])
      setMeta(json.meta ?? { total: 0, total_pages: 1, page: 1 })
    } catch { setMessages([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadMessages(page, search, filter) }, [page, search, filter, loadMessages])

  async function openDetail(msg: ContactMessage) {
    const token = getToken(); if (!token) return
    if (!msg.is_read) {
      await fetch(`/api/admin/contacts/${msg.id}`, { headers: { Authorization: `Bearer ${token}` } })
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
    }
    setDetail({ ...msg, is_read: true })
  }

  async function handleDelete(id: number) {
    const token = getToken(); if (!token) return
    await adminDelete(`contacts/${id}`, token)
    setDeleteId(null)
    if (detail?.id === id) setDetail(null)
    loadMessages(page, search, filter)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

      <div>
        <h1 className="text-xl font-bold text-[#1a3c6e]">Pesan Masuk</h1>
        <p className="text-slate-400 text-sm mt-0.5">{meta.total} total pesan</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Cari nama, email, subjek..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm" />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(["", "unread", "read"] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${filter === f ? "bg-white text-[#1a3c6e] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {f === "" ? "Semua" : f === "unread" ? "Belum Dibaca" : "Sudah Dibaca"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" /><div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Tidak ada pesan</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((msg, index) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}
                className={`px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition cursor-pointer group ${!msg.is_read ? "bg-[#1a3c6e]/[0.02]" : ""}`}
                onClick={() => openDetail(msg)}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${!msg.is_read ? "bg-[#1a3c6e]" : "bg-transparent"}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!msg.is_read ? "bg-[#1a3c6e]/10" : "bg-slate-100"}`}>
                  <span className={`text-xs font-bold ${!msg.is_read ? "text-[#1a3c6e]" : "text-slate-400"}`}>
                    {msg.first_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!msg.is_read ? "font-semibold text-slate-800" : "font-medium text-slate-700"}`}>
                    {msg.first_name} {msg.last_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{msg.subject || msg.message}</p>
                </div>
                <p className="text-xs text-slate-400 flex-shrink-0 hidden sm:block">
                  {new Date(msg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </p>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openDetail(msg)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a3c6e]/10 text-slate-400 hover:text-[#1a3c6e] transition"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(msg.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={meta.total_pages}
        total={meta.total}
        itemLabel="pesan"
        onPageChange={setPage}
        variant="admin"
      />

      {/* Detail Slide Panel */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetail(null)} />
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.25 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{detail.first_name} {detail.last_name}</p>
                  <p className="text-xs text-slate-400">{new Date(detail.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <button onClick={() => setDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition text-lg font-light">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {detail.subject && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subjek</p>
                    <p className="text-sm font-medium text-slate-800">{detail.subject}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kontak</p>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${detail.email}`} className="hover:text-[#1a3c6e] transition">{detail.email}</a>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pesan</p>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{detail.message}</div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    const subject = encodeURIComponent(`Re: ${detail.subject}`)
                    const to = encodeURIComponent(detail.email)
                    router.push(`/admin/email/inbox?compose=1&to=${to}&subject=${subject}`)
                  }}
                  className="flex-1 py-2 text-sm font-medium bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-xl transition text-center flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" /> Balas Email
                </button>
                <button onClick={() => setDeleteId(detail.id)} className="py-2 px-4 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm pointer-events-auto">
                <h3 className="text-base font-semibold text-slate-800">Hapus Pesan?</h3>
                <p className="text-sm text-slate-400 mt-1">Pesan ini akan dihapus permanen.</p>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">Batal</button>
                  <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition">Hapus</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}