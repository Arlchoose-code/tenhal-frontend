"use client"

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Upload, Check, Globe, Mail, Phone, MapPin, Image, Share2, Search, FileText, ChevronDown, ChevronRight } from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function imgUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface SiteSettings { [key: string]: string }

interface PageContent {
  id: number
  page: string
  section: string
  title: string
  content: string
}

// ─── Config sections ──────────────────────────────────────────────────────────
const SETTING_SECTIONS = [
  {
    id: "general",
    label: "Umum",
    icon: Globe,
    keys: [
      { key: "logo_url",   label: "Logo",    type: "image" as const },
      { key: "favicon_url",label: "Favicon", type: "image" as const },
      { key: "address",    label: "Alamat",  type: "textarea" as const },
      { key: "email",      label: "Email",   type: "email" as const },
      { key: "phone",      label: "Telepon", type: "text" as const },
      { key: "whatsapp",   label: "Nomor WhatsApp (format: 628...)", type: "text" as const },
      { key: "copyright",  label: "Teks Copyright", type: "text" as const },
      { key: "google_maps_embed", label: "Google Maps Embed URL", type: "textarea" as const },
    ],
  },
  {
    id: "social",
    label: "Sosial Media",
    icon: Share2,
    keys: [
      { key: "instagram_url", label: "Instagram URL", type: "url" as const },
      { key: "facebook_url",  label: "Facebook URL",  type: "url" as const },
      { key: "linkedin_url",  label: "LinkedIn URL",  type: "url" as const },
      { key: "tiktok_url",    label: "TikTok URL",    type: "url" as const },
      { key: "youtube_url",   label: "YouTube URL",   type: "url" as const },
      { key: "twitter_url",   label: "Twitter/X URL", type: "url" as const },
    ],
  },
  {
    id: "seo",
    label: "SEO",
    icon: Search,
    keys: [
      { key: "seo_site_name",              label: "Nama Situs",                   type: "text" as const },
      { key: "seo_title_default",           label: "Title Default (tab browser)",  type: "text" as const },
      { key: "seo_title_separator",         label: "Pemisah Title (contoh: \" | \")", type: "text" as const },
      { key: "seo_description",             label: "Meta Description",             type: "textarea" as const },
      { key: "seo_keywords",                label: "Meta Keywords (pisahkan koma)", type: "textarea" as const },
      { key: "seo_og_image",                label: "OG Image (Open Graph)",        type: "image" as const },
      { key: "seo_canonical_base_url",      label: "Canonical Base URL",           type: "url" as const },
      { key: "seo_robots",                  label: "Robots Meta",                  type: "text" as const },
      { key: "seo_twitter_card",            label: "Twitter Card Type",            type: "text" as const },
      { key: "seo_twitter_site",            label: "Twitter @username",            type: "text" as const },
      { key: "seo_google_site_verification",label: "Google Site Verification",     type: "text" as const },
      { key: "seo_google_analytics_id",     label: "Google Analytics ID (G-...)",  type: "text" as const },
    ],
  },
]

const PAGE_LABELS: Record<string, string> = {
  home: "Beranda", about: "Tentang Kami", language: "Kelas Bahasa",
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [pageContents, setPageContents] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)

  // Per-key saving/saved state
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  // File uploads (image keys)
  const [files, setFiles] = useState<Record<string, File>>({})
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({})

  // Active section tab
  const [activeSection, setActiveSection] = useState("general")

  // Page content edits & saving
  const [pcEdits, setPcEdits] = useState<Record<number, { title: string; content: string }>>({})
  const [pcSaving, setPcSaving] = useState<number | null>(null)
  const [pcSaved, setPcSaved] = useState<Set<number>>(new Set())
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set(["home"]))

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken()
    if (!token) return

    Promise.all([
      fetch("/api/admin/site-settings", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/admin/page-contents", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([settingsJson, contentsJson]) => {
      setSettings(settingsJson.data ?? {})
      const contents: PageContent[] = contentsJson.data ?? []
      setPageContents(contents)
      // Init edits
      const edits: typeof pcEdits = {}
      contents.forEach(c => { edits[c.id] = { title: c.title, content: c.content } })
      setPcEdits(edits)
      setLoading(false)
    })
  }, [])

  // ── Save setting ────────────────────────────────────────────────────────────
  async function handleSaveSetting(key: string, isImage = false) {
    const token = getToken()
    if (!token) return
    setSaving(key)
    try {
      if (isImage && files[key]) {
        const fd = new FormData()
        fd.append("file", files[key])
        await fetch(`/api/admin/site-settings/${key}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
      } else {
        await fetch(`/api/admin/site-settings/${key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ value: settings[key] ?? "" }),
        })
      }
      setSaved(prev => new Set([...prev, key]))
      setTimeout(() => setSaved(prev => { const n = new Set(prev); n.delete(key); return n }), 2500)
    } finally {
      setSaving(null)
    }
  }

  // ── Save page content ───────────────────────────────────────────────────────
  async function handleSavePageContent(id: number) {
    const token = getToken()
    if (!token) return
    setPcSaving(id)
    try {
      await fetch(`/api/admin/page-contents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(pcEdits[id]),
      })
      setPcSaved(prev => new Set([...prev, id]))
      setTimeout(() => setPcSaved(prev => { const n = new Set(prev); n.delete(id); return n }), 2500)
    } finally {
      setPcSaving(null)
    }
  }

  // ── Group page contents by page ─────────────────────────────────────────────
  const contentsByPage = pageContents.reduce((acc, c) => {
    if (!acc[c.page]) acc[c.page] = []
    acc[c.page].push(c)
    return acc
  }, {} as Record<string, PageContent[]>)

  // ── Render helpers ──────────────────────────────────────────────────────────
  function renderSettingField(cfg: { key: string; label: string; type: string }) {
    const { key, label, type } = cfg
    const val = settings[key] ?? ""
    const isSaving = saving === key
    const isSaved = saved.has(key)

    const SaveBtn = (
      <button
        onClick={() => handleSaveSetting(key, type === "image")}
        disabled={isSaving || (type === "image" && !files[key])}
        className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition flex items-center gap-1.5 disabled:opacity-40 ${
          isSaved ? "bg-green-500 text-white" : "bg-[#1a3c6e] hover:bg-[#15336b] text-white"
        }`}
      >
        {isSaved ? <Check className="w-3.5 h-3.5" /> : isSaving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {isSaved ? "Tersimpan" : isSaving ? "..." : "Simpan"}
      </button>
    )

    if (type === "image") {
      const preview = filePreviews[key] || (val ? imgUrl(val) : null)
      return (
        <div key={key} className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {preview
                ? <img src={preview} alt={label} className="w-full h-full object-contain p-1" />
                : <Image className="w-5 h-5 text-slate-300" />}
            </div>
            <label className="flex-1 flex items-center gap-2 px-3 py-2.5 border border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#1a3c6e]/40 hover:bg-slate-50 transition text-sm text-slate-400">
              <Upload className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{files[key]?.name ?? "Pilih file gambar..."}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files?.[0]; if (!f) return
                setFiles(prev => ({ ...prev, [key]: f }))
                setFilePreviews(prev => ({ ...prev, [key]: URL.createObjectURL(f) }))
              }} />
            </label>
            {SaveBtn}
          </div>
        </div>
      )
    }

    if (type === "textarea") {
      return (
        <div key={key} className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <div className="flex gap-2 items-start">
            <textarea
              value={val}
              onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
              rows={3}
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition resize-none"
            />
            {SaveBtn}
          </div>
        </div>
      )
    }

    return (
      <div key={key} className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex gap-2">
          <input
            type={type === "email" ? "email" : type === "url" ? "url" : "text"}
            value={val}
            onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={`Masukkan ${label.toLowerCase()}...`}
            className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition"
          />
          {SaveBtn}
        </div>
      </div>
    )
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-32" />
      <div className="flex gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-9 w-24 bg-slate-200 rounded-xl" />)}</div>
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-11 bg-slate-200 rounded-lg" />)}
      </div>
    </div>
  )

  // ── Render ──────────────────────────────────────────────────────────────────
  const activeConfig = SETTING_SECTIONS.find(s => s.id === activeSection)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1a3c6e]">Pengaturan</h1>
        <p className="text-slate-400 text-sm mt-0.5">Konfigurasi website Tenhal</p>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {[
          ...SETTING_SECTIONS.map(s => ({ id: s.id, label: s.label, icon: s.icon })),
          { id: "page-contents", label: "Konten Halaman", icon: FileText },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition ${
                activeSection === tab.id
                  ? "bg-[#1a3c6e] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-[#1a3c6e]/30 hover:text-[#1a3c6e]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Settings Panel ── */}
      {activeSection !== "page-contents" && activeConfig && (
        <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <activeConfig.icon className="w-4 h-4 text-[#1a3c6e]" />
            <h2 className="text-sm font-semibold text-[#1a3c6e]">{activeConfig.label}</h2>
          </div>
          <div className="p-5 space-y-5">
            {activeConfig.keys.map(cfg => renderSettingField(cfg))}
          </div>
        </motion.div>
      )}

      {/* ── Page Contents Panel ── */}
      {activeSection === "page-contents" && (
        <motion.div key="page-contents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="space-y-3">
          {Object.keys(contentsByPage).length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-xl">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Belum ada konten halaman</p>
            </div>
          ) : (
            Object.entries(contentsByPage).map(([page, contents]) => {
              const isExpanded = expandedPages.has(page)
              return (
                <div key={page} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  {/* Page accordion header */}
                  <button
                    onClick={() => setExpandedPages(prev => {
                      const n = new Set(prev)
                      if (n.has(page)) n.delete(page); else n.add(page)
                      return n
                    })}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#1a3c6e]" />
                      <span className="text-sm font-semibold text-[#1a3c6e]">
                        {PAGE_LABELS[page] ?? page}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{contents.length} section</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 divide-y divide-slate-100">
                          {contents.map(c => {
                            const edit = pcEdits[c.id] ?? { title: c.title, content: c.content }
                            const isSavingPc = pcSaving === c.id
                            const isSavedPc = pcSaved.has(c.id)
                            return (
                              <div key={c.id} className="p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.section}</span>
                                  <button
                                    onClick={() => handleSavePageContent(c.id)}
                                    disabled={isSavingPc}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                      isSavedPc ? "bg-green-500 text-white" : "bg-[#1a3c6e] hover:bg-[#15336b] text-white"
                                    } disabled:opacity-50`}
                                  >
                                    {isSavedPc ? <Check className="w-3 h-3" /> : isSavingPc ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
                                    {isSavedPc ? "Tersimpan" : isSavingPc ? "..." : "Simpan"}
                                  </button>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-slate-600">Judul</label>
                                  <input
                                    value={edit.title}
                                    onChange={e => setPcEdits(prev => ({ ...prev, [c.id]: { ...prev[c.id], title: e.target.value } }))}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-slate-600">Konten</label>
                                  <textarea
                                    value={edit.content}
                                    onChange={e => setPcEdits(prev => ({ ...prev, [c.id]: { ...prev[c.id], content: e.target.value } }))}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition resize-none"
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </motion.div>
      )}
    </motion.div>
  )
}