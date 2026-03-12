"use client"

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"
import { adminDelete } from "@/lib/api"
import Pagination from "@/components/ui/pagination"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Trash2, Eye, ChevronDown, GraduationCap, Mail, Phone, MapPin, User, Sheet, Check, ExternalLink } from "lucide-react"

interface LangReg {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  age: number
  address: string
  city: string
  district: string
  postal_code: string
  class_type: string
  job_interest: string
  status: string
  created_at: string
}

interface LangResponse {
  data: LangReg[]
  meta: { total: number; total_pages: number; page: number }
}

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-600 border border-yellow-200",
  confirmed: "bg-green-50 text-green-600 border border-green-200",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
}
const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu", confirmed: "Dikonfirmasi", cancelled: "Dibatalkan",
}
const CLASS_LABEL: Record<string, string> = {
  regular: "Regular",
  super_intensive: "Super Intensif",
  conversation_interview: "Conversation & Interview",
}

export default function LanguageRegistrationsPage() {
  const [regs, setRegs] = useState<LangReg[]>([])
  const [meta, setMeta] = useState({ total: 0, total_pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [classType, setClassType] = useState("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [detail, setDetail] = useState<LangReg | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [sheetId, setSheetId] = useState("")
  const [sheetSaving, setSheetSaving] = useState(false)
  const [sheetSaved, setSheetSaved] = useState(false)

  useEffect(() => {
    const token = getToken(); if (!token) return
    fetch("/api/admin/site-settings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => { if (json.data?.google_sheet_id_language) setSheetId(json.data.google_sheet_id_language) })
      .catch(() => {})
  }, [])

  async function saveSheetId() {
    const token = getToken(); if (!token) return
    setSheetSaving(true)
    await fetch("/api/admin/site-settings/google_sheet_id_language", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: (() => { const fd = new FormData(); fd.append("value", sheetId); return fd })(),
    })
    setSheetSaving(false)
    setSheetSaved(true)
    setTimeout(() => setSheetSaved(false), 2000)
  }

  async function loadRegs(p = page, s = search, st = status, ct = classType) {
    const token = getToken(); if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(p), per_page: "15",
        ...(s && { search: s }),
        ...(st && { status: st }),
        ...(ct && { class_type: ct }),
      })
      const res = await fetch(`/api/admin/language-registrations?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const json: LangResponse = await res.json()
      setRegs(json.data ?? [])
      setMeta(json.meta ?? { total: 0, total_pages: 1, page: 1 })
    } finally { setLoading(false) }
  }

  useEffect(() => { loadRegs(page, search, status, classType) }, [page, search, status, classType])

  async function handleStatusChange(id: number, newStatus: string) {
    const token = getToken(); if (!token) return
    setUpdatingId(id)
    await fetch(`/api/admin/language-registrations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdatingId(null)
    setRegs(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    if (detail?.id === id) setDetail(prev => prev ? { ...prev, status: newStatus } : null)
  }

  async function handleDelete(id: number) {
    const token = getToken(); if (!token) return
    await adminDelete(`language-registrations/${id}`, token)
    setDeleteId(null)
    if (detail?.id === id) setDetail(null)
    loadRegs()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

      <div>
        <h1 className="text-xl font-bold text-[#1a3c6e]">Kelas Bahasa</h1>
        <p className="text-slate-400 text-sm mt-0.5">{meta.total} total pendaftar</p>
      </div>

      {/* Google Sheet Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sheet className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700">Google Sheet Pendaftar</p>
            <p className="text-xs text-slate-400 mt-0.5">Data pendaftar kelas bahasa akan otomatis masuk ke sheet ini</p>
            <div className="flex gap-2 mt-2.5">
              <input
                value={sheetId}
                onChange={e => { setSheetId(e.target.value); setSheetSaved(false) }}
                placeholder="Paste Sheet ID di sini..."
                className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition font-mono"
              />
              <button
                onClick={saveSheetId}
                disabled={sheetSaving}
                className="px-3 py-2 text-xs font-medium bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
              >
                {sheetSaved ? <><Check className="w-3.5 h-3.5" /> Tersimpan</> : sheetSaving ? "Menyimpan..." : "Simpan"}
              </button>
              {sheetId && (
                <a href={`https://docs.google.com/spreadsheets/d/${sheetId}`} target="_blank"
                  className="px-3 py-2 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5 flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" /> Buka
                </a>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-400 space-y-0.5">
              <p>1. Buat sheet baru → rename tab jadi <span className="font-mono bg-slate-100 px-1 rounded">Pendaftar</span></p>
              <p>2. Bagikan ke <span className="font-mono bg-slate-100 px-1 rounded select-all">tenhal-sheets@tenhal-bekerja.iam.gserviceaccount.com</span> sebagai Editor</p>
              <p>3. Copy ID dari URL dan paste di atas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Cari nama, email, telepon..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm">
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="confirmed">Dikonfirmasi</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        <select value={classType} onChange={e => { setClassType(e.target.value); setPage(1) }}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm">
          <option value="">Semua Kelas</option>
          <option value="regular">Regular</option>
          <option value="super_intensive">Super Intensif</option>
          <option value="conversation_interview">Conversation & Interview</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5"><div className="h-3.5 bg-slate-200 rounded w-1/3" /><div className="h-3 bg-slate-200 rounded w-1/4" /></div>
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : regs.length === 0 ? (
          <div className="py-20 text-center">
            <GraduationCap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Belum ada pendaftar</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {regs.map((reg, index) => (
              <motion.div key={reg.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition group"
              >
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-purple-600">{reg.first_name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{reg.first_name} {reg.last_name}</p>
                  <p className="text-xs text-slate-400 truncate">{CLASS_LABEL[reg.class_type] ?? reg.class_type}</p>
                </div>
                <p className="text-xs text-slate-400 hidden md:block truncate max-w-[160px]">{reg.email}</p>
                <div className="relative flex-shrink-0">
                  <select value={reg.status} onChange={e => handleStatusChange(reg.id, e.target.value)}
                    disabled={updatingId === reg.id}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium appearance-none pr-6 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 transition disabled:opacity-60 ${STATUS_STYLE[reg.status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    <option value="pending">Menunggu</option>
                    <option value="confirmed">Dikonfirmasi</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                </div>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setDetail(reg)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a3c6e]/10 text-slate-400 hover:text-[#1a3c6e] transition"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(reg.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
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
        itemLabel="pendaftar"
        onPageChange={setPage}
        variant="admin"
      />

      {/* Detail Panel */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetail(null)} />
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.25 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">{detail.first_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{detail.first_name} {detail.last_name}</p>
                    <p className="text-xs text-slate-400">{CLASS_LABEL[detail.class_type] ?? detail.class_type}</p>
                  </div>
                </div>
                <button onClick={() => setDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition text-lg font-light">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                  <select value={detail.status} onChange={e => handleStatusChange(detail.id, e.target.value)}
                    disabled={updatingId === detail.id}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium appearance-none cursor-pointer border focus:outline-none transition disabled:opacity-60 ${STATUS_STYLE[detail.status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    <option value="pending">Menunggu</option>
                    <option value="confirmed">Dikonfirmasi</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kontak</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-slate-700"><Mail className="w-4 h-4 text-slate-400 flex-shrink-0" /><a href={`mailto:${detail.email}`} className="hover:text-[#1a3c6e]">{detail.email}</a></div>
                    <div className="flex items-center gap-3 text-sm text-slate-700"><Phone className="w-4 h-4 text-slate-400 flex-shrink-0" /><span>{detail.phone}</span></div>
                    {detail.age > 0 && <div className="flex items-center gap-3 text-sm text-slate-700"><User className="w-4 h-4 text-slate-400 flex-shrink-0" /><span>{detail.age} tahun</span></div>}
                  </div>
                </div>

                {(detail.city || detail.address) && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat</p>
                    <div className="flex items-start gap-3 text-sm text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{[detail.address, detail.district, detail.city, detail.postal_code].filter(Boolean).join(", ")}</span>
                    </div>
                  </div>
                )}

                {detail.job_interest && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Minat Pekerjaan</p>
                    <p className="text-sm text-slate-700">{detail.job_interest}</p>
                  </div>
                )}

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                  Mendaftar: {new Date(detail.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
                <button onClick={() => setDeleteId(detail.id)} className="w-full py-2 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Hapus Pendaftar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm pointer-events-auto">
                <h3 className="text-base font-semibold text-slate-800">Hapus Pendaftar?</h3>
                <p className="text-sm text-slate-400 mt-1">Data pendaftar ini akan dihapus permanen.</p>
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