"use client"

import { useRef, useState, useMemo } from "react"
import Link from "next/link"
import { motion, useInView, AnimatePresence } from "framer-motion"
import type { Variants, TargetAndTransition } from "framer-motion"
import {
  ArrowLeft, ArrowRight, MessageCircle, MapPin, Briefcase,
  Clock, Globe, CheckCircle2, Upload,
  Loader2, ChevronRight, Calendar
} from "lucide-react"
import type { Job, FormField } from "@/types"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const stag: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function Rev({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div ref={ref} variants={stag} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  )
}

const imgUrl = (url: string) => {
  if (!url) return null
  if (url.startsWith("http")) return url.replace(/^https?:\/\/[^/]+/, "/api")
  if (url.startsWith("/uploads")) return `/api${url}`
  return `/api/uploads/${url}`
}

/* ─── Dynamic Field — render berdasarkan field_type dari DB ─── */
/* field_type yang valid: text | textarea | select | file | date | number */
function DynamicField({ field, value, onChange }: {
  field: FormField
  value: string
  onChange: (v: string) => void
}) {
  const options = useMemo(() => {
    if (!field.options) return []
    try { return JSON.parse(field.options) as string[] }
    catch { return field.options.split(",").map(s => s.trim()).filter(Boolean) }
  }, [field.options])

  const base = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition bg-white"

  switch (field.field_type) {
    case "select":
      return (
        <select value={value} onChange={e => onChange(e.target.value)} className={base}>
          <option value="">-- Pilih {field.label} --</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    case "textarea":
      return (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || `Masukkan ${field.label}...`}
          rows={4} className={base + " resize-none"} />
      )
    case "date":
      return <input type="date" value={value} onChange={e => onChange(e.target.value)} className={base} />
    case "number":
      return (
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || `Masukkan ${field.label}...`} className={base} />
      )
    case "file":
      return null // ditangani FileUploadField
    default: // text dan semua field_type lain
      return (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || `Masukkan ${field.label}...`} className={base} />
      )
  }
}

function FileUploadField({ field, file, onChange }: {
  field: FormField
  file: File | null
  onChange: (f: File | null) => void
}) {
  return (
    <label className={`flex items-center gap-3 w-full px-4 py-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-all
      ${file ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}>
      <Upload className={`w-4 h-4 flex-shrink-0 ${file ? "text-blue-500" : "text-slate-400"}`} />
      <span className={`text-sm truncate ${file ? "text-blue-700 font-medium" : "text-slate-400"}`}>
        {file ? file.name : field.placeholder || `Upload ${field.label}...`}
      </span>
      <input type="file" className="sr-only" onChange={e => onChange(e.target.files?.[0] ?? null)} />
    </label>
  )
}

/* ─── FORM — 100% dari FormTemplate DB, zero hardcode ─── */
interface AnswerMap { [fieldName: string]: string }
interface FileMap { [fieldName: string]: File }

function ApplyForm({ job, wa }: { job: Job; wa: string }) {
  const fields = useMemo(() =>
    (job.form_template?.fields ?? [])
      .slice()
      .sort((a, b) => (a.step_number - b.step_number) || (a.sort_order - b.sort_order)),
    [job.form_template]
  )

  // Kelompokkan per step_number
  const steps = useMemo<FormField[][]>(() => {
    if (!fields.length) return []
    const map: Record<number, FormField[]> = {}
    fields.forEach(f => {
      if (!map[f.step_number]) map[f.step_number] = []
      map[f.step_number].push(f)
    })
    return Object.values(map)
  }, [fields])

  const totalSteps = steps.length
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [fileAnswers, setFileAnswers] = useState<FileMap>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const stepFields = steps[step] ?? []

  function validateStep(): boolean {
    setError("")
    for (const f of stepFields.filter(f => f.is_required)) {
      if (f.field_type === "file") {
        if (!fileAnswers[f.field_name]) {
          setError(`"${f.label}" wajib diupload`)
          return false
        }
      } else if (!answers[f.field_name]?.trim()) {
        setError(`"${f.label}" wajib diisi`)
        return false
      }
    }
    return true
  }

  function nextStep() {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    if (!validateStep()) return
    setLoading(true); setError("")
    try {
      // full_name, email, phone diambil dari answers sesuai field_name di DB
      const full_name = answers["full_name"] ?? ""
      const email = answers["email"] ?? ""
      const phone = answers["phone"] ?? ""

      const answersArr = fields
        .filter(f => f.field_type !== "file")
        .map(f => ({
          form_field_id: f.id,
          field_name: f.field_name,
          value: answers[f.field_name] ?? "",
        }))

      const hasFiles = Object.keys(fileAnswers).length > 0
      if (hasFiles) {
        const fd = new FormData()
        fd.append("job_id", String(job.id))
        fd.append("full_name", full_name)
        fd.append("email", email)
        fd.append("phone", phone)
        answersArr.forEach((a, i) => {
          fd.append(`answers[${i}][field_name]`, a.field_name)
          fd.append(`answers[${i}][value]`, a.value)
          fd.append(`answers[${i}][form_field_id]`, String(a.form_field_id))
        })
        let fileIdx = answersArr.length
        Object.entries(fileAnswers).forEach(([fieldName, file]) => {
          const f = fields.find(ff => ff.field_name === fieldName)
          fd.append(`answers[${fileIdx}][field_name]`, fieldName)
          fd.append(`answers[${fileIdx}][value]`, "")
          if (f?.id) fd.append(`answers[${fileIdx}][form_field_id]`, String(f.id))
          fd.append(`answers[${fileIdx}][file]`, file)
          fileIdx++
        })
        const res = await fetch("/api/public/apply/upload", { method: "POST", body: fd })
        if (!res.ok) { const j = await res.json(); throw new Error(j.message || "Gagal mengirim") }
      } else {
        const res = await fetch("/api/public/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: job.id, full_name, email, phone, answers: answersArr }),
        })
        if (!res.ok) { const j = await res.json(); throw new Error(j.message || "Gagal mengirim") }
      }
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const backHref = job.type === "internship" ? "/layanan/magang" : "/layanan/lowongan"
    const backLabel = job.type === "internship" ? "Lihat Program Magang Lain" : "Lihat Lowongan Lain"
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </motion.div>
        <h4 className="text-2xl font-black text-[#0a1628] mb-2">Lamaran Terkirim! 🎉</h4>
        <p className="text-slate-500 max-w-xs mx-auto mb-8">Tim Tenhal akan menghubungi kamu dalam 1×24 jam.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition">
              <MessageCircle className="w-4 h-4" /> Tanya via WhatsApp
            </a>
          )}
          <Link href={backHref}
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition">
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
        </div>
      </motion.div>
    )
  }

  // Tidak ada FormTemplate yang di-assign ke job ini
  if (!fields.length) {
    return (
      <div className="py-6 text-center">
        <p className="text-slate-400 text-sm mb-4">Tidak ada form khusus untuk program ini.</p>
        {wa && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition">
            <MessageCircle className="w-4 h-4" /> Daftar via WhatsApp
          </a>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Step progress */}
      {totalSteps > 1 && (
        <div className="flex items-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-400
              ${i < step ? "bg-blue-500" : i === step ? "bg-gradient-to-r from-sky-500 to-blue-600" : "bg-slate-100"}`} />
          ))}
          <span className="text-[11px] font-bold text-slate-400 ml-1 flex-shrink-0">{step + 1}/{totalSteps}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">

          {/* label nama step/template */}
          {step === 0 && job.form_template && (
            <div className="pb-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{job.form_template.name}</p>
              {job.form_template.description && <p className="text-xs text-slate-400 mt-1">{job.form_template.description}</p>}
            </div>
          )}

          {/* render fields dari DB — tidak ada field hardcode */}
          {stepFields.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {field.label}
                {field.is_required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.field_type === "file" ? (
                <FileUploadField
                  field={field}
                  file={fileAnswers[field.field_name] ?? null}
                  onChange={f => setFileAnswers(prev => ({ ...prev, [field.field_name]: f! }))}
                />
              ) : (
                <DynamicField
                  field={field}
                  value={answers[field.field_name] ?? ""}
                  onChange={v => setAnswers(prev => ({ ...prev, [field.field_name]: v }))}
                />
              )}
            </div>
          ))}

          {error && (
            <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              ⚠️ {error}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
        {step > 0 ? (
          <button onClick={() => { setStep(s => s - 1); setError("") }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        ) : <div />}

        {step < totalSteps - 1 ? (
          <motion.button onClick={nextStep} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-xl text-sm shadow-lg shadow-blue-900/20">
            Lanjut <ArrowRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button onClick={handleSubmit} disabled={loading}
            whileHover={!loading ? { scale: 1.03 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
            className="inline-flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-xl text-sm shadow-lg shadow-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</> : <>Kirim Lamaran <ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        )}
      </div>
    </div>
  )
}

/* ─── MAIN ─── */
interface Props {
  job: Job
  settings: Record<string, string>
}

export default function MagangDetailClient({ job, settings }: Props) {
  const wa = settings["whatsapp"] || ""
  const thumb = imgUrl(job.thumbnail_url)
  const expired = job.expired_at ? new Date(job.expired_at) < new Date() : false

  return (
    <div className="overflow-x-hidden min-h-screen bg-[#f7f9fc]">

      {/* HERO BANNER */}
      <div className="relative h-72 sm:h-80 lg:h-96 overflow-hidden"
        style={{ background: "linear-gradient(160deg,#020b1a 0%,#071530 40%,#0c2348 100%)" }}>
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={job.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 flex flex-col justify-end pb-8 pt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-medium mb-4">
              <Link href="/layanan/magang" className="hover:text-white/70 transition">Program Magang</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/70 line-clamp-1">{job.title}</span>
            </div>
            <div className="flex flex-wrap items-start gap-3 mb-3">
              {job.sector && (
                <span className="px-2.5 py-1 bg-sky-400/20 border border-sky-400/30 text-sky-300 text-[11px] font-black rounded-lg uppercase tracking-wider">
                  {job.sector}
                </span>
              )}
              <span className={`px-2.5 py-1 text-[11px] font-black rounded-lg uppercase tracking-wider
                ${expired ? "bg-red-500/20 border border-red-400/30 text-red-300" : "bg-green-500/20 border border-green-400/30 text-green-300"}`}>
                {expired ? "⛔ Ditutup" : "✅ Buka"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl">
              {job.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* LEFT */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-3">
              {job.country && (
                <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                  {job.country.flag_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl(job.country.flag_url) || ""} alt={job.country.name} className="w-5 h-3.5 object-cover rounded" />
                  )}
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{job.country.name}</span>
                </div>
              )}
              {job.city && (
                <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{job.city}</span>
                </div>
              )}
              {job.salary && (
                <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{job.salary} {job.salary_currency}</span>
                </div>
              )}
              {job.expired_at && (
                <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">
                    Deadline: {new Date(job.expired_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              )}
              {job.type && (
                <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700 capitalize">{job.type === "internship" ? "Magang" : job.type}</span>
                </div>
              )}
            </motion.div>

            {job.description && (
              <Rev>
                <motion.div variants={fadeUp} className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm">
                  <h2 className="text-lg font-black text-[#0a1628] mb-4">Tentang Program</h2>
                  <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: job.description }} />
                </motion.div>
              </Rev>
            )}

            {job.requirements && (
              <Rev>
                <motion.div variants={fadeUp} className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm">
                  <h2 className="text-lg font-black text-[#0a1628] mb-4">Persyaratan</h2>
                  <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: job.requirements }} />
                </motion.div>
              </Rev>
            )}

            <div className="lg:hidden">
              <Link href={job.type === "job" ? "/layanan/lowongan" : "/layanan/magang"}
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0a1628] transition">
                <ArrowLeft className="w-4 h-4" /> {job.type === "job" ? "Kembali ke semua lowongan" : "Kembali ke semua program magang"}
              </Link>
            </div>
          </div>

          {/* RIGHT — form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm">

                {expired ? (
                  <div className="py-8 text-center">
                    <div className="text-4xl mb-3">⛔</div>
                    <h3 className="font-black text-[#0a1628] text-base mb-2">Program Sudah Tutup</h3>
                    <p className="text-sm text-slate-400 mb-5">Pendaftaran untuk program ini sudah tidak tersedia</p>
                    {wa && (
                      <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition">
                        <MessageCircle className="w-4 h-4" /> Tanya Program Lain
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-lg shadow-md flex-shrink-0">✈️</div>
                      <div>
                        <h3 className="font-black text-[#0a1628] text-base">Daftar Program Ini</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {job.form_template?.fields?.length
                            ? `${job.form_template.fields.length} pertanyaan dari tim Tenhal`
                            : "Hubungi kami untuk mendaftar"}
                        </p>
                      </div>
                    </div>
                    <ApplyForm job={job} wa={wa} />
                  </>
                )}
              </motion.div>

              {wa && (
                <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 bg-green-50 border border-green-100 rounded-2xl p-5 group transition-all hover:border-green-200 hover:shadow-md">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💬</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800">Ada pertanyaan?</p>
                    <p className="text-xs text-slate-500">Chat langsung tim Tenhal via WhatsApp</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-500 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              )}

              <div className="hidden lg:block text-center">
                <Link href={job.type === "job" ? "/layanan/lowongan" : "/layanan/magang"}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#0a1628] transition">
                  <ArrowLeft className="w-4 h-4" /> {job.type === "job" ? "Kembali ke semua lowongan" : "Kembali ke semua program"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {wa && (
        <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: "spring" }}
          whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl overflow-hidden">
          <motion.div animate={{ scale: [1, 1.15, 1] } as TargetAndTransition} transition={{ duration: 2, repeat: Infinity }}>💬</motion.div>
          <motion.div animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] } as TargetAndTransition} transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-green-500" />
        </motion.a>
      )}
    </div>
  )
}