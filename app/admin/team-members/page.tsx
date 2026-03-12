"use client"

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"
import { adminDelete, adminPostForm, adminPutForm } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Pencil, Upload, X, Users, GripVertical } from "lucide-react"

interface TeamMember {
  id: number
  name: string
  position: string
  photo_url: string
  sort_order: number
  is_active: boolean
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function imgUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}

interface MemberForm {
  name: string
  position: string
  sort_order: string
  is_active: boolean
  photo: File | null
  photoPreview: string | null
}

const blankForm = (): MemberForm => ({ name: "", position: "", sort_order: "0", is_active: true, photo: null, photoPreview: null })

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<MemberForm>(blankForm())
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  async function loadMembers() {
    const token = getToken(); if (!token) return
    setLoading(true)
    const res = await fetch("/api/admin/team-members", { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    setMembers(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadMembers() }, [])

  function openCreate() { setEditId(null); setForm(blankForm()); setShowForm(true) }

  function openEdit(m: TeamMember) {
    setEditId(m.id)
    setForm({ name: m.name, position: m.position, sort_order: String(m.sort_order), is_active: m.is_active, photo: null, photoPreview: imgUrl(m.photo_url) })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.position.trim()) return
    const token = getToken(); if (!token) return
    setSaving(true)
    const fd = new FormData()
    fd.append("name", form.name)
    fd.append("position", form.position)
    fd.append("sort_order", form.sort_order)
    fd.append("is_active", form.is_active ? "true" : "false")
    if (form.photo) fd.append("photo", form.photo)

    if (editId) {
      await adminPutForm(`team-members/${editId}`, fd, token)
    } else {
      await adminPostForm("team-members", fd, token)
    }
    setSaving(false)
    setShowForm(false)
    loadMembers()
  }

  async function handleDelete(id: number) {
    const token = getToken(); if (!token) return
    await adminDelete(`team-members/${id}`, token)
    setDeleteId(null)
    loadMembers()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a3c6e]">Tim</h1>
          <p className="text-slate-400 text-sm mt-0.5">{members.length} anggota tim</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#1a3c6e] hover:bg-[#15336b] text-white text-sm font-medium rounded-xl transition shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Anggota
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-200" />
              <div className="p-3 space-y-1.5"><div className="h-3.5 bg-slate-200 rounded w-2/3" /><div className="h-3 bg-slate-200 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Belum ada anggota tim</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((m, index) => (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group ${m.is_active ? "border-slate-200" : "border-slate-200 opacity-60"}`}
            >
              <div className="aspect-square bg-slate-100 overflow-hidden relative">
                {m.photo_url ? (
                  <img src={imgUrl(m.photo_url)!} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-slate-200">{m.name.charAt(0)}</span>
                  </div>
                )}
                {!m.is_active && (
                  <div className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-black/40 text-white rounded-full backdrop-blur-sm">Nonaktif</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                <p className="text-xs text-slate-400 truncate">{m.position}</p>
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100">
                  <button onClick={() => openEdit(m)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a3c6e]/10 text-slate-400 hover:text-[#1a3c6e] transition"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(m.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800">{editId ? "Edit Anggota" : "Tambah Anggota"}</h3>
                  <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition text-lg font-light">✕</button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Photo */}
                  <div className="flex justify-center">
                    {form.photoPreview ? (
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200">
                        <img src={form.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setForm(f => ({ ...f, photo: null, photoPreview: null }))} className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center text-slate-500 hover:text-red-500 transition"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#1a3c6e]/40 hover:bg-slate-50 transition">
                        <Upload className="w-5 h-5 text-slate-300 mb-1" />
                        <span className="text-xs text-slate-400">Foto</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const f = e.target.files?.[0]; if (!f) return
                          setForm(prev => ({ ...prev, photo: f, photoPreview: URL.createObjectURL(f) }))
                        }} />
                      </label>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Nama <span className="text-red-400">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Jabatan <span className="text-red-400">*</span></label>
                    <input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Contoh: CEO & Founder" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Urutan</label>
                      <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Status</label>
                      <select value={form.is_active ? "true" : "false"} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "true" }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition">
                        <option value="true">Aktif</option>
                        <option value="false">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">Batal</button>
                  <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.position.trim()} className="flex-1 py-2.5 text-sm font-medium bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-xl transition disabled:opacity-50">
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm pointer-events-auto">
                <h3 className="text-base font-semibold text-slate-800">Hapus Anggota?</h3>
                <p className="text-sm text-slate-400 mt-1">Anggota tim ini akan dihapus permanen.</p>
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