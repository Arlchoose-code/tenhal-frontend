"use client"

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"
import { adminDelete, adminPostForm, adminPutForm } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Pencil, Upload, X, Globe } from "lucide-react"

interface Country {
  id: number
  name: string
  flag_url: string
  is_active: boolean
  sort_order: number
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function imgUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}

interface CountryForm { name: string; sort_order: string; is_active: boolean; flag: File | null; flagPreview: string | null }
const blankForm = (): CountryForm => ({ name: "", sort_order: "0", is_active: true, flag: null, flagPreview: null })

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<CountryForm>(blankForm())
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  async function loadCountries() {
    const token = getToken(); if (!token) return
    setLoading(true)
    const res = await fetch("/api/admin/countries", { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    setCountries(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadCountries() }, [])

  function openCreate() { setEditId(null); setForm(blankForm()); setShowForm(true) }
  function openEdit(c: Country) {
    setEditId(c.id)
    setForm({ name: c.name, sort_order: String(c.sort_order), is_active: c.is_active, flag: null, flagPreview: imgUrl(c.flag_url) })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    const token = getToken(); if (!token) return
    setSaving(true)
    const fd = new FormData()
    fd.append("name", form.name)
    fd.append("sort_order", form.sort_order)
    fd.append("is_active", form.is_active ? "true" : "false")
    if (form.flag) fd.append("flag", form.flag)
    if (editId) await adminPutForm(`countries/${editId}`, fd, token)
    else await adminPostForm("countries", fd, token)
    setSaving(false); setShowForm(false); loadCountries()
  }

  async function handleDelete(id: number) {
    const token = getToken(); if (!token) return
    await adminDelete(`countries/${id}`, token)
    setDeleteId(null); loadCountries()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a3c6e]">Negara</h1>
          <p className="text-slate-400 text-sm mt-0.5">{countries.length} negara terdaftar</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#1a3c6e] hover:bg-[#15336b] text-white text-sm font-medium rounded-xl transition shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Negara
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-4 animate-pulse">
                <div className="w-8 h-6 rounded bg-slate-200 flex-shrink-0" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="ml-auto h-6 w-16 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : countries.length === 0 ? (
          <div className="py-20 text-center">
            <Globe className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Belum ada negara</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {countries.map((c, index) => (
              <motion.div key={c.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition group"
              >
                <div className="w-10 h-7 rounded overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                  {c.flag_url ? (
                    <img src={imgUrl(c.flag_url)!} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Globe className="w-3.5 h-3.5 text-slate-300" /></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                  {c.is_active ? "Aktif" : "Nonaktif"}
                </span>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(c)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a3c6e]/10 text-slate-400 hover:text-[#1a3c6e] transition"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm pointer-events-auto">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800">{editId ? "Edit Negara" : "Tambah Negara"}</h3>
                  <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition text-lg font-light">✕</button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Flag preview */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                      {form.flagPreview ? (
                        <img src={form.flagPreview} alt="Flag" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Globe className="w-5 h-5 text-slate-300" /></div>
                      )}
                    </div>
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#1a3c6e]/40 hover:bg-slate-50 transition text-sm text-slate-400">
                      <Upload className="w-4 h-4" /> Upload bendera
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const f = e.target.files?.[0]; if (!f) return
                        setForm(prev => ({ ...prev, flag: f, flagPreview: URL.createObjectURL(f) }))
                      }} />
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Nama Negara <span className="text-red-400">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Hungary" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
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
                  <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex-1 py-2.5 text-sm font-medium bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-xl transition disabled:opacity-50">
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
                <h3 className="text-base font-semibold text-slate-800">Hapus Negara?</h3>
                <p className="text-sm text-slate-400 mt-1">Negara ini akan dihapus. Lowongan yang terkait tetap ada.</p>
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