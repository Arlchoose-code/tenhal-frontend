"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import { adminGet, adminPostForm } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Upload, X, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Country } from "@/types"
import RichTextEditor from "@/components/admin/RichTextEditor"

// ─── Types ───────────────────────────────────────────────
interface FormField {
  label: string
  field_name: string
  field_type: string
  placeholder: string
  options: string        // JSON array string, hanya untuk select
  is_required: boolean
  step_number: number
  sort_order: number
}

const FIELD_TYPES = [
  { value: "text",     label: "Teks" },
  { value: "textarea", label: "Paragraf" },
  { value: "select",   label: "Pilihan (dropdown)" },
  { value: "file",     label: "Upload File" },
  { value: "date",     label: "Tanggal" },
  { value: "number",   label: "Angka" },
]

function toSnake(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
}

function blankField(step = 1, order = 0): FormField {
  return { label: "", field_name: "", field_type: "text", placeholder: "", options: "[]", is_required: false, step_number: step, sort_order: order }
}

// ─── Field Row ────────────────────────────────────────────
function FieldRow({ field, index, totalSteps, onChange, onRemove }: {
  field: FormField
  index: number
  totalSteps: number
  onChange: (index: number, updated: FormField) => void
  onRemove: (index: number) => void
}) {
  const [open, setOpen] = useState(true)
  const [optionInput, setOptionInput] = useState("")

  function set<K extends keyof FormField>(key: K, value: FormField[K]) {
    onChange(index, { ...field, [key]: value })
  }

  function handleLabelBlur() {
    if (!field.field_name) set("field_name", toSnake(field.label))
  }

  // Options untuk select
  function parsedOptions(): string[] {
    try { return JSON.parse(field.options) } catch { return [] }
  }
  function addOption() {
    if (!optionInput.trim()) return
    set("options", JSON.stringify([...parsedOptions(), optionInput.trim()]))
    setOptionInput("")
  }
  function removeOption(i: number) {
    const opts = parsedOptions(); opts.splice(i, 1)
    set("options", JSON.stringify(opts))
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer select-none" onClick={() => setOpen(o => !o)}>
        <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
        <span className="flex-1 text-sm font-medium text-slate-700 truncate">
          {field.label || <span className="text-slate-400 italic">Field {index + 1}</span>}
        </span>
        <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full">{FIELD_TYPES.find(t => t.value === field.field_type)?.label ?? field.field_type}</span>
        {field.is_required && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-400 border border-red-200 rounded-full">Wajib</span>}
        <button type="button" onClick={e => { e.stopPropagation(); onRemove(index) }} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-4 space-y-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Label <span className="text-red-400">*</span></label>
                  <input value={field.label} onChange={e => set("label", e.target.value)} onBlur={handleLabelBlur}
                    placeholder="Contoh: Nama Lengkap"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Field Name</label>
                  <input value={field.field_name} onChange={e => set("field_name", toSnake(e.target.value))}
                    placeholder="nama_lengkap"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Tipe Field</label>
                  <select value={field.field_type} onChange={e => set("field_type", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition">
                    {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Placeholder</label>
                  <input value={field.placeholder} onChange={e => set("placeholder", e.target.value)}
                    placeholder="Teks bantuan..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
                </div>
              </div>

              {/* Options untuk select */}
              {field.field_type === "select" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Pilihan</label>
                  <div className="flex gap-2">
                    <input value={optionInput} onChange={e => setOptionInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOption() } }}
                      placeholder="Tambah pilihan, Enter untuk simpan"
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
                    <button type="button" onClick={addOption} className="px-3 py-2 bg-[#1a3c6e] text-white rounded-lg text-sm hover:bg-[#15336b] transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {parsedOptions().length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {parsedOptions().map((opt, i) => (
                        <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">
                          {opt}
                          <button type="button" onClick={() => removeOption(i)} className="text-slate-400 hover:text-red-400 transition"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={field.is_required} onChange={e => set("is_required", e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-[#1a3c6e]" />
                  <span className="text-xs font-medium text-slate-600">Wajib diisi</span>
                </label>
                {totalSteps > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Step</span>
                    <select value={field.step_number} onChange={e => set("step_number", Number(e.target.value))}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition">
                      {Array.from({ length: totalSteps }, (_, i) => <option key={i + 1} value={i + 1}>Step {i + 1}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function CreateJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [countries, setCountries] = useState<Country[]>([])
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [totalSteps, setTotalSteps] = useState(1)
  const [useForm, setUseForm] = useState(false)

  const [form, setForm] = useState({
    title: "", type: "job", sector: "", country_id: "", city: "",
    salary: "", salary_currency: "EUR", description: "", requirements: "",
    is_active: true, expired_at: "", sheet_id: "",
  })

  useEffect(() => {
    const token = getToken(); if (!token) return
    adminGet<Country[]>("countries", token).then(setCountries).catch(console.error)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }))
  }

  function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setThumbnail(file); setThumbnailPreview(URL.createObjectURL(file))
  }

  function addField() {
    setFields(prev => [...prev, blankField(1, prev.length)])
  }

  function updateField(index: number, updated: FormField) {
    setFields(prev => prev.map((f, i) => i === index ? updated : f))
  }

  function removeField(index: number) {
    setFields(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true)
    const token = getToken(); if (!token) return

    try {
      let formTemplateId: string | null = null

      // Kalau ada fields, buat form template dulu
      if (useForm && fields.length > 0) {
        const validFields = fields.filter(f => f.label && f.field_name)
        if (validFields.length > 0) {
          const templateRes = await fetch("/api/admin/form-templates", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              name: `Form - ${form.title || "Lowongan Baru"}`,
              description: "",
              fields: validFields.map((f, i) => ({ ...f, sort_order: i })),
            }),
          })
          const templateJson = await templateRes.json()
          if (!templateJson.success) { setError("Gagal membuat form: " + templateJson.message); return }
          formTemplateId = String(templateJson.data.id)
        }
      }

      // Buat job
      const fd = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (key === "is_active") { fd.append(key, value ? "true" : "false"); return }
        if (value === "") return
        if (key === "expired_at" && String(value).includes("T")) { fd.append(key, String(value).slice(0, 10)); return }
        fd.append(key, String(value))
      })
      if (formTemplateId) fd.append("form_template_id", formTemplateId)
      if (form.sheet_id) fd.append("sheet_id", form.sheet_id)
      if (thumbnail) fd.append("thumbnail", thumbnail)

      const res = await adminPostForm("jobs", fd, token)
      if (res.success) router.push("/admin/jobs")
      else setError(res.message || "Gagal menyimpan lowongan")
    } catch (err) {
      console.error(err); setError("Terjadi kesalahan")
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/jobs" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1a3c6e]">Tambah Lowongan</h1>
          <p className="text-slate-400 text-sm mt-0.5">Isi detail lowongan baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Informasi Dasar */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1a3c6e]">Informasi Dasar</h2>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Judul Lowongan <span className="text-red-400">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="Contoh: Staff Produksi di Hungary"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tipe</label>
              <select name="type" value={form.type} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition">
                <option value="job">Pekerjaan</option>
                <option value="internship">Magang</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Sektor</label>
              <input name="sector" value={form.sector} onChange={handleChange} placeholder="Contoh: Manufaktur"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Negara <span className="text-red-400">*</span></label>
              <select name="country_id" value={form.country_id} onChange={handleChange} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition">
                <option value="">Pilih Negara</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kota</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Contoh: Budapest"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Gaji</label>
              <input name="salary" value={form.salary} onChange={handleChange} placeholder="Contoh: 1500 - 2000"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Mata Uang</label>
              <select name="salary_currency" value={form.salary_currency} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition">
                <option value="EUR">EUR</option><option value="USD">USD</option>
                <option value="GBP">GBP</option><option value="AED">AED</option><option value="IDR">IDR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1a3c6e]">Deskripsi</h2>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Deskripsi Pekerjaan</label>
            <RichTextEditor value={form.description} onChange={(val) => setForm(prev => ({ ...prev, description: val }))} placeholder="Jelaskan detail pekerjaan..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Persyaratan</label>
            <RichTextEditor value={form.requirements} onChange={(val) => setForm(prev => ({ ...prev, requirements: val }))} placeholder="Tuliskan persyaratan pelamar..." />
          </div>
        </div>

        {/* Form Pendaftaran */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-[#1a3c6e]">Form Pendaftaran</h2>
              <p className="text-xs text-slate-400 mt-0.5">Field yang harus diisi pelamar saat mendaftar</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setUseForm(v => !v)} className={`w-10 h-5 rounded-full transition-colors ${useForm ? "bg-[#1a3c6e]" : "bg-slate-200"} relative flex-shrink-0 cursor-pointer`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useForm ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-xs font-medium text-slate-600">{useForm ? "Aktif" : "Tidak ada form"}</span>
            </label>
          </div>

          <AnimatePresence>
            {useForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="p-5 space-y-3">
                  {/* Step control */}
                  <div className="flex items-center gap-3 pb-1">
                    <span className="text-xs font-medium text-slate-600">Jumlah Step:</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setTotalSteps(s => Math.max(1, s - 1))} className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition text-sm">−</button>
                      <span className="w-6 text-center text-sm font-semibold text-slate-700">{totalSteps}</span>
                      <button type="button" onClick={() => setTotalSteps(s => s + 1)} className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition text-sm">+</button>
                    </div>
                    <span className="text-xs text-slate-400">{totalSteps === 1 ? "Form 1 halaman" : `${totalSteps} langkah`}</span>
                  </div>

                  {/* Fields */}
                  {fields.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-400">Belum ada field</p>
                      <p className="text-xs text-slate-300 mt-1">Klik tombol di bawah untuk menambah</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <FieldRow key={index} field={field} index={index} totalSteps={totalSteps} onChange={updateField} onRemove={removeField} />
                      ))}
                    </div>
                  )}

                  <button type="button" onClick={addField}
                    className="w-full py-2.5 border border-dashed border-[#1a3c6e]/30 rounded-xl text-sm font-medium text-[#1a3c6e] hover:bg-[#1a3c6e]/5 transition flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Field
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Google Sheet */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#1a3c6e]">Google Sheet</h2>
              <p className="text-xs text-slate-400 mt-0.5">Data pelamar akan otomatis masuk ke sheet ini</p>
            </div>
          </div>

          {/* Panduan */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-blue-700">📋 Cara mendapatkan Sheet ID:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-500">
              <li>Buka <a href="https://sheets.google.com/create" target="_blank" className="text-blue-600 underline">sheets.google.com/create</a> untuk membuat spreadsheet baru</li>
              <li>Klik kanan tab di bawah → <b>Rename</b> → ganti jadi <b className="font-mono">Pelamar</b></li>
              <li>Klik <b>Bagikan</b> → tambahkan email berikut sebagai <b>Editor</b>:<br />
                <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 select-all">tenhal-sheets@tenhal-bekerja.iam.gserviceaccount.com</span>
              </li>
              <li>Copy ID dari URL spreadsheet:<br />
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">docs.google.com/spreadsheets/d/<b className="text-blue-600">ID_DI_SINI</b>/edit</span>
              </li>
              <li>Paste ID tersebut di kolom di bawah</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Sheet ID</label>
            <input
              name="sheet_id"
              value={form.sheet_id}
              onChange={handleChange}
              placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition font-mono"
            />
            {form.sheet_id && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${form.sheet_id}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
              >
                🔗 Buka spreadsheet ini
              </a>
            )}
          </div>
        </div>

        {/* Pengaturan */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1a3c6e]">Pengaturan</h2>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tanggal Kadaluarsa</label>
            <input type="datetime-local" name="expired_at" value={form.expired_at} onChange={handleChange}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_active" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-[#1a3c6e]" />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Tampilkan lowongan (aktif)</label>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1a3c6e]">Thumbnail</h2>
          {thumbnailPreview ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
              <img src={thumbnailPreview} alt="Preview" className="w-full h-full" style={{ objectFit: "fill" }} />
              <button type="button" onClick={() => { setThumbnail(null); setThumbnailPreview(null) }} className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-slate-500 hover:text-red-500 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#1a3c6e]/40 hover:bg-slate-50 transition">
              <Upload className="w-6 h-6 text-slate-300 mb-2" />
              <span className="text-sm text-slate-400">Klik untuk upload thumbnail</span>
              <span className="text-xs text-slate-300 mt-1">JPG, PNG, WebP — maks 2MB</span>
              <input type="file" accept="image/*" onChange={handleThumbnail} className="hidden" />
            </label>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <div className="flex gap-3">
          <Link href="/admin/jobs" className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition text-center">Batal</Link>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 text-sm font-medium bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            {loading ? "Menyimpan..." : "Simpan Lowongan"}
          </button>
        </div>
      </form>
    </motion.div>
  )
}