"use client"

import { useState } from "react"
import { Search, X, Plus, Tag } from "lucide-react"
import { BlogTag } from "@/types"
import { getToken } from "@/lib/auth"

interface Props {
  tags: BlogTag[]
  selected: number[]
  onToggle: (id: number) => void
  onTagAdded: (tag: BlogTag) => void
}

export default function BlogTagPicker({ tags, selected, onToggle, onTagAdded }: Props) {
  const [search, setSearch] = useState("")
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)

  const selectedTags = tags.filter(t => selected.includes(t.id))
  const unselectedFiltered = tags
    .filter(t => !selected.includes(t.id))
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
  const selectedFiltered = tags
    .filter(t => selected.includes(t.id))
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  async function handleAdd() {
    if (!newName.trim()) return
    const token = getToken(); if (!token) return
    setSaving(true)
    try {
      const fd = new FormData(); fd.append("name", newName.trim())
      const res = await fetch("/api/admin/blog/tags", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd })
      const json = await res.json()
      if (json.success) {
        onTagAdded(json.data)
        setNewName("")
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map(t => (
            <span key={t.id}
              className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-[#1a3c6e] text-white text-xs font-medium rounded-full">
              <Tag className="w-2.5 h-2.5" />
              {t.name}
              <button type="button" onClick={() => onToggle(t.id)}
                className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search + tambah baru */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3c6e]/20 focus-within:border-[#1a3c6e] transition">
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari atau tambah tag..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          {search && <X className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600 flex-shrink-0" onClick={() => setSearch("")} />}
        </div>
      </div>

      {/* List scrollable */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-44 overflow-y-auto">
          {/* Selected dulu */}
          {selectedFiltered.map(t => (
            <button key={t.id} type="button" onClick={() => onToggle(t.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left bg-blue-50/60 hover:bg-blue-50 border-b border-slate-100 transition">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded flex items-center justify-center bg-[#1a3c6e] flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#1a3c6e] font-medium">{t.name}</span>
              </div>
            </button>
          ))}

          {/* Unselected */}
          {unselectedFiltered.map(t => (
            <button key={t.id} type="button" onClick={() => onToggle(t.id)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition">
              <div className="w-4 h-4 rounded border-2 border-slate-300 flex-shrink-0" />
              {t.name}
            </button>
          ))}

          {/* Empty state */}
          {selectedFiltered.length === 0 && unselectedFiltered.length === 0 && (
            <div className="px-3 py-4 text-xs text-slate-400 text-center">
              {search ? `Tidak ada tag "${search}"` : "Belum ada tag"}
            </div>
          )}
        </div>

        {/* Tambah tag baru — pinned di bawah list */}
        <div className="border-t border-slate-200 px-3 py-2 bg-slate-50">
          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd() } }}
              placeholder="+ Buat tag baru..."
              className="flex-1 bg-transparent text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none py-0.5"
            />
            {newName.trim() && (
              <button type="button" onClick={handleAdd} disabled={saving}
                className="flex items-center gap-1 px-2 py-1 bg-[#1a3c6e] text-white text-xs rounded-md hover:bg-[#15336b] transition disabled:opacity-50 font-medium">
                {saving ? "..." : <><Plus className="w-3 h-3" /> Buat</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-slate-400">{selected.length} tag dipilih</p>
      )}
    </div>
  )
}
