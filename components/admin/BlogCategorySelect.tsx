"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Search, X, Plus, Check } from "lucide-react"
import { BlogCategory } from "@/types"
import { getToken } from "@/lib/auth"

interface Props {
  categories: BlogCategory[]
  value: string
  onChange: (id: string) => void
  onCategoryAdded: (cat: BlogCategory) => void
}

export default function BlogCategorySelect({ categories, value, onChange, onCategoryAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = categories.find(c => String(c.id) === value)
  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
        setShowNew(false)
        setNewName("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleAdd() {
    if (!newName.trim()) return
    const token = getToken(); if (!token) return
    setSaving(true)
    try {
      const fd = new FormData(); fd.append("name", newName.trim())
      const res = await fetch("/api/admin/blog/categories", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd })
      const json = await res.json()
      if (json.success) {
        onCategoryAdded(json.data)
        onChange(String(json.data.id))
        setNewName(""); setShowNew(false); setOpen(false); setSearch("")
      }
    } finally { setSaving(false) }
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setSearch("") }}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition hover:border-slate-300"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {selected ? selected.name : "Tanpa Kategori"}
        </span>
        <div className="flex items-center gap-1.5">
          {selected && (
            <span onClick={e => { e.stopPropagation(); onChange("") }}
              className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full transition">
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Dropdown — selalu ke bawah */}
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari kategori..."
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              {search && <X className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => setSearch("")} />}
            </div>
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto">
            {/* Tanpa kategori */}
            <button type="button" onClick={() => { onChange(""); setOpen(false); setSearch("") }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition hover:bg-slate-50 ${!value ? "text-[#1a3c6e] font-medium" : "text-slate-500"}`}>
              <span>Tanpa Kategori</span>
              {!value && <Check className="w-3.5 h-3.5" />}
            </button>

            {filtered.length === 0 && search && (
              <p className="px-3 py-3 text-xs text-slate-400 text-center">Tidak ada hasil untuk "{search}"</p>
            )}

            {filtered.map(c => (
              <button key={c.id} type="button"
                onClick={() => { onChange(String(c.id)); setOpen(false); setSearch("") }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition hover:bg-slate-50 ${String(c.id) === value ? "text-[#1a3c6e] font-medium bg-blue-50/50" : "text-slate-700"}`}>
                <span>{c.name}</span>
                {String(c.id) === value && <Check className="w-3.5 h-3.5 text-[#1a3c6e]" />}
              </button>
            ))}
          </div>

          {/* Tambah baru */}
          <div className="border-t border-slate-100 p-2">
            {!showNew ? (
              <button type="button" onClick={() => setShowNew(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#1a3c6e] hover:bg-blue-50 rounded-lg transition font-medium">
                <Plus className="w-3.5 h-3.5" /> Tambah kategori baru
              </button>
            ) : (
              <div className="flex gap-2">
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd() } if (e.key === "Escape") { setShowNew(false); setNewName("") } }}
                  placeholder="Nama kategori baru..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
                <button type="button" onClick={handleAdd} disabled={saving || !newName.trim()}
                  className="px-3 py-1.5 bg-[#1a3c6e] text-white rounded-lg text-sm hover:bg-[#15336b] transition disabled:opacity-50">
                  {saving ? "..." : <Check className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => { setShowNew(false); setNewName("") }}
                  className="px-2 py-1.5 border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
