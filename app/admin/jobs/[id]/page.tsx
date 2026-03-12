"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import { adminDelete, adminPatch } from "@/lib/api"
import { motion } from "framer-motion"
import {
  ArrowLeft, Pencil, Trash2, ToggleLeft, ToggleRight,
  Globe, MapPin, DollarSign, Tag, Calendar, Briefcase,
  FileText, ClipboardList, Eye, AlertCircle,
  CheckCircle, Type, AlignLeft, Hash, ChevronDown,
  Upload, CalendarDays, Users,
} from "lucide-react"
import Link from "next/link"
import { AnimatePresence } from "framer-motion"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

function getThumbnailUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

const FIELD_TYPE_ICON: Record<string, React.ReactNode> = {
  text:     <Type className="w-3.5 h-3.5" />,
  textarea: <AlignLeft className="w-3.5 h-3.5" />,
  select:   <ChevronDown className="w-3.5 h-3.5" />,
  file:     <Upload className="w-3.5 h-3.5" />,
  date:     <CalendarDays className="w-3.5 h-3.5" />,
  number:   <Hash className="w-3.5 h-3.5" />,
}

const FIELD_TYPE_LABEL: Record<string, string> = {
  text: "Teks", textarea: "Paragraf", select: "Pilihan",
  file: "Upload File", date: "Tanggal", number: "Angka",
}

interface FormField {
  id: number
  label: string
  field_name: string
  field_type: string
  placeholder: string
  options: string
  is_required: boolean
  step_number: number
  sort_order: number
}

interface JobDetail {
  id: number
  title: string
  slug: string
  type: string
  sector: string
  country: { id: number; name: string; flag_url: string }
  city: string
  salary: string
  salary_currency: string
  description: string
  requirements: string
  thumbnail_url: string
  is_active: boolean
  form_template_id: number | null
  form_template?: { id: number; name: string; fields: FormField[] }
  expired_at: string | null
  created_at: string
  updated_at: string
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDelete, setShowDelete] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace("/admin/login"); return }
    fetch(`/api/admin/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { if (j.success) setJob(j.data); else setError("Lowongan tidak ditemukan") })
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false))
  }, [id])

  async function handleToggle() {
    const token = getToken(); if (!token || !job) return
    await adminPatch(`jobs/${job.id}/toggle`, {}, token)
    setJob(prev => prev ? { ...prev, is_active: !prev.is_active } : null)
  }

  async function handleDelete() {
    const token = getToken(); if (!token || !job) return
    await adminDelete(`jobs/${job.id}`, token)
    router.push("/admin/jobs")
  }

  // Group fields by step
  const steps = job?.form_template?.fields
    ? [...new Set(job.form_template.fields.map(f => f.step_number))].sort()
    : []
  const fieldsByStep = (step: number) =>
    job?.form_template?.fields?.filter(f => f.step_number === step).sort((a, b) => a.sort_order - b.sort_order) ?? []

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-48" />
      <div className="h-64 bg-slate-200 rounded-xl" />
      <div className="h-48 bg-slate-200 rounded-xl" />
    </div>
  )

  if (error || !job) return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/jobs" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-[#1a3c6e]">Detail Lowongan</h1>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-600">{error || "Lowongan tidak ditemukan"}</p>
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/jobs" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#1a3c6e]">{job.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.is_active ? "bg-green-50 text-green-600 border border-green-200" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                {job.is_active ? "Aktif" : "Nonaktif"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                {job.type === "job" ? "Pekerjaan" : "Magang"}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">Dibuat {formatDate(job.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleToggle} className={`px-3 py-2 text-sm font-medium rounded-xl border transition ${job.is_active ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "border-green-200 text-green-600 bg-green-50 hover:bg-green-100"}`}>
            {job.is_active ? <><ToggleRight className="w-4 h-4 inline mr-1.5 text-green-500" />Nonaktifkan</> : <><ToggleLeft className="w-4 h-4 inline mr-1.5" />Aktifkan</>}
          </button>
          <Link href={`/admin/jobs/${job.id}/edit`} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-[#1a3c6e] hover:bg-[#15336b] text-white transition">
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button onClick={() => setShowDelete(true)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Kolom kiri — info utama */}
        <div className="col-span-2 space-y-5">

          {/* Thumbnail */}
          {job.thumbnail_url && (
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img src={getThumbnailUrl(job.thumbnail_url)!} alt={job.title} className="w-full h-full" style={{ objectFit: "fill" }} />
            </div>
          )}

          {/* Deskripsi */}
          {job.description && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-[#1a3c6e]">Deskripsi Pekerjaan</h2>
              </div>
              <div
                className="prose prose-sm max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>
          )}

          {/* Persyaratan */}
          {job.requirements && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-[#1a3c6e]">Persyaratan</h2>
              </div>
              <div
                className="prose prose-sm max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: job.requirements }}
              />
            </div>
          )}

          {/* Preview Form */}
          {job.form_template && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-[#1a3c6e]">Preview Form Pendaftaran</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {job.form_template.fields?.length ?? 0} field
                  </span>
                </div>
                {steps.length > 1 && (
                  <div className="flex items-center gap-1">
                    {steps.map(s => (
                      <button key={s} onClick={() => setActiveStep(s)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition ${activeStep === s ? "bg-[#1a3c6e] text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                        Step {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Dynamic fields per step */}
                {steps.length > 0 ? (
                  <div className="space-y-4">
                    {steps.length > 1 && (
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step {activeStep}</p>
                    )}
                    {fieldsByStep(activeStep).map((field) => {
                      const opts = (() => { try { return JSON.parse(field.options || "[]") } catch { return [] } })()
                      return (
                        <div key={field.id} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700">
                              {field.label}
                              {field.is_required && <span className="text-red-400 ml-1">*</span>}
                            </label>
                            <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              {FIELD_TYPE_ICON[field.field_type]}
                              {FIELD_TYPE_LABEL[field.field_type] ?? field.field_type}
                            </span>
                          </div>

                          {field.field_type === "textarea" && (
                            <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 min-h-[72px]">
                              {field.placeholder || "Tulis jawaban..."}
                            </div>
                          )}
                          {field.field_type === "select" && (
                            <div className="space-y-1.5">
                              {opts.length > 0 ? opts.map((opt: string, i: number) => (
                                <label key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                                  <div className="w-4 h-4 rounded border border-slate-300 flex-shrink-0" />
                                  <span className="text-sm text-slate-700">{opt}</span>
                                </label>
                              )) : (
                                <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 flex items-center justify-between">
                                  Pilih opsi... <ChevronDown className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          )}
                          {field.field_type === "file" && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                              <Upload className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-400">{field.placeholder || "Klik untuk upload file"}</span>
                            </div>
                          )}
                          {field.field_type === "date" && (
                            <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 flex items-center justify-between">
                              {field.placeholder || "Pilih tanggal"} <CalendarDays className="w-4 h-4" />
                            </div>
                          )}
                          {(field.field_type === "text" || field.field_type === "number") && (
                            <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400">
                              {field.placeholder || (field.field_type === "number" ? "0" : "Ketik jawaban...")}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-sm">Tidak ada field dalam form ini</div>
                )}

                {/* Submit button preview */}
                <div className="pt-2">
                  <div className="w-full py-2.5 bg-[#1a3c6e]/80 text-white text-sm font-medium rounded-xl text-center">
                    {steps.length > 1 && activeStep < steps.length ? `Lanjut ke Step ${activeStep + 1} →` : "Kirim Pendaftaran"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kolom kanan — sidebar info */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Info Lowongan</h3>

            {job.country?.name && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Negara</p>
                  <p className="text-sm font-medium text-slate-700">{job.country.name}</p>
                </div>
              </div>
            )}
            {job.city && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Kota</p>
                  <p className="text-sm font-medium text-slate-700">{job.city}</p>
                </div>
              </div>
            )}
            {job.salary && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Gaji</p>
                  <p className="text-sm font-medium text-slate-700">{job.salary} {job.salary_currency}</p>
                </div>
              </div>
            )}
            {job.sector && (
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Sektor</p>
                  <p className="text-sm font-medium text-slate-700">{job.sector}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Tipe</p>
                <p className="text-sm font-medium text-slate-700">{job.type === "job" ? "Pekerjaan" : "Magang"}</p>
              </div>
            </div>
            {job.expired_at && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Kadaluarsa</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(job.expired_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</h3>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${job.is_active ? "bg-green-50" : "bg-slate-100"}`}>
              <CheckCircle className={`w-4 h-4 ${job.is_active ? "text-green-500" : "text-slate-400"}`} />
              <span className={`text-sm font-medium ${job.is_active ? "text-green-700" : "text-slate-500"}`}>
                {job.is_active ? "Aktif & Ditampilkan" : "Nonaktif"}
              </span>
            </div>
            {job.form_template ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Ada Form ({job.form_template.fields?.length ?? 0} field)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Tidak ada form</span>
              </div>
            )}
          </div>

          {/* Link ke applicants */}
          <Link
            href={`/admin/applicants?job_id=${job.id}`}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#1a3c6e]/5 border border-[#1a3c6e]/20 rounded-xl hover:bg-[#1a3c6e]/10 transition"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1a3c6e]" />
              <span className="text-sm font-medium text-[#1a3c6e]">Lihat Pelamar</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-[#1a3c6e] rotate-180" />
          </Link>
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowDelete(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-base font-semibold text-slate-800">Hapus Lowongan?</h3>
                <p className="text-sm text-slate-400 mt-1">Lowongan dan form pendaftarannya akan dihapus. Data pelamar yang sudah masuk tetap tersimpan.</p>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowDelete(false)} className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">Batal</button>
                  <button onClick={handleDelete} className="flex-1 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition">Hapus</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}