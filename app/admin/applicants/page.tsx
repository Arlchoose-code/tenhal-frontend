"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import { adminDelete } from "@/lib/api"
import Pagination from "@/components/ui/pagination"
import { motion, AnimatePresence } from "framer-motion"
import { Applicant } from "@/types"
import {
  Search, Trash2, Eye, ChevronDown, Users, Mail, Phone,
  Briefcase, Globe, FileText, BarChart2, List, ChevronRight,
  Download,
} from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function resolveUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}

// Helper: cari nilai dari answers by field_name
function getAnswer(answers: Applicant["answers"], fieldName: string): string {
  return answers?.find(a => a.field_name === fieldName)?.value ?? ""
}
function getFileUrl(answers: Applicant["answers"], fieldName: string): string {
  return answers?.find(a => a.field_name === fieldName)?.file_url ?? ""
}
// Ambil nama dari answers — coba common field names, fallback ke answer text pertama
const NAME_FIELDS = ["full_name", "nama", "name", "nama_lengkap", "applicant_name", "fullname", "nama_pelamar"]
function getDisplayName(answers: Applicant["answers"]): string {
  // coba field name yang umum dulu
  for (const f of NAME_FIELDS) {
    const v = getAnswer(answers, f)
    if (v) return v
  }
  // fallback: cari field yang mengandung kata "name" atau "nama" di field_name-nya
  const byKeyword = answers?.find(a =>
    (a.field_name.includes("name") || a.field_name.includes("nama")) && a.value
  )
  if (byKeyword?.value) return byKeyword.value
  // fallback terakhir: answer text pertama yang bukan file
  const first = answers?.find(a => a.value && !a.file_url && a.field_type !== "file" && a.field_type !== "checkbox")
  return first?.value || "—"
}
function getInitial(answers: Applicant["answers"]): string {
  const name = getDisplayName(answers)
  return name && name !== "—" ? name.charAt(0).toUpperCase() : "?"
}
function getEmail(answers: Applicant["answers"]): string {
  return getAnswer(answers, "email")
}
function getPhone(answers: Applicant["answers"]): string {
  return getAnswer(answers, "phone") || getAnswer(answers, "telepon") || getAnswer(answers, "no_hp")
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface AnswerOption { value: string; count: number }
interface FieldSummary {
  field_name: string; field_type: string
  responses: number; options?: AnswerOption[]; samples?: string[]
}
interface StatusCount { status: string; count: number }
interface JobSummary {
  job_id: number; job_title: string; total: number
  by_status: StatusCount[]; fields: FieldSummary[]
}
interface OverallStats { total_applicants: number; total_jobs: number; by_status: StatusCount[] }
interface SummaryData { overall: OverallStats; jobs: JobSummary[] }
interface ApplicantsResponse {
  data: Applicant[]
  meta: { page: number; total: number; total_pages: number }
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: "Menunggu", color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-200" },
  reviewed: { label: "Ditinjau", color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200"   },
  accepted: { label: "Diterima", color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200"  },
  rejected: { label: "Ditolak",  color: "text-red-500",    bg: "bg-red-50",     border: "border-red-200"    },
}
const DONUT_COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"]
const BAR_COLORS   = ["#1a3c6e","#3b82f6","#06b6d4","#8b5cf6","#f59e0b","#22c55e","#ef4444","#ec4899"]

function BarChart({ options }: { options: AnswerOption[] }) {
  const max = Math.max(...options.map(o => o.count), 1)
  const total = options.reduce((s, o) => s + o.count, 0)
  return (
    <div className="space-y-2 mt-3">
      {options.map((opt, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium truncate max-w-[65%]">{opt.value}</span>
            <span className="text-slate-500">{opt.count} ({total > 0 ? Math.round(opt.count / total * 100) : 0}%)</span>
          </div>
          <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${(opt.count / max) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="h-full rounded-full"
              style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data, total }: { data: StatusCount[]; total: number }) {
  const r = 40; const circ = 2 * Math.PI * r
  let offset = 0
  const slices = data.map((d, i) => {
    const dash = total > 0 ? (d.count / total) * circ : 0
    const s = { ...d, dash, gap: circ - dash, offset, color: DONUT_COLORS[i] }
    offset += dash; return s
  })
  return (
    <div className="flex items-center gap-5">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {total === 0
            ? <circle cx={50} cy={50} r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
            : slices.map((s, i) => (
              <circle key={i} cx={50} cy={50} r={r} fill="none"
                stroke={s.color} strokeWidth="14"
                strokeDasharray={`${s.dash} ${s.gap}`}
                strokeDashoffset={-s.offset} />
            ))
          }
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-800">{total}</span>
          <span className="text-[10px] text-slate-400">total</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1 min-w-0">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
            <span className="text-xs text-slate-600 flex-1">{STATUS_CFG[d.status]?.label ?? d.status}</span>
            <span className="text-xs font-bold text-slate-800">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ApplicantsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [view, setView] = useState<"summary" | "responses">("summary")
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set())
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [meta, setMeta] = useState({ page: 1, total_pages: 1, total: 0 })
  const [respLoading, setRespLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState(searchParams.get("status") ?? "")
  const [jobId, setJobId] = useState(searchParams.get("job_id") ?? "")
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<Applicant | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  function refreshSummary() {
    const token = getToken(); if (!token) return
    fetch("/api/admin/applicants/summary", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(json => setSummary(json.data))
  }

  useEffect(() => {
    const token = getToken(); if (!token) return
    fetch("/api/admin/applicants/summary", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(json => { setSummary(json.data); setSummaryLoading(false) })
  }, [])

  async function loadApplicants(p = page, s = search, st = status, jid = jobId) {
    const token = getToken(); if (!token) return
    setRespLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(p), per_page: "20",
        ...(s && { search: s }),
        ...(st && { status: st }),
        ...(jid && { job_id: jid }),
      })
      const res = await fetch(`/api/admin/applicants?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const json: ApplicantsResponse = await res.json()
      setApplicants(json.data ?? [])
      setMeta(json.meta ?? { page: 1, total_pages: 1, total: 0 })
    } finally { setRespLoading(false) }
  }

  useEffect(() => {
    if (view === "responses") loadApplicants(page, search, status, jobId)
  }, [view, page, search, status, jobId])

  async function handleStatusChange(id: number, newStatus: string) {
    const token = getToken(); if (!token) return
    setUpdatingId(id)
    await fetch(`/api/admin/applicants/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    })
    setUpdatingId(null)
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } as Applicant : a))
    if (detail?.id === id) setDetail(prev => prev ? { ...prev, status: newStatus } as Applicant : null)
  }

  async function handleDelete(id: number) {
    const token = getToken(); if (!token) return
    await adminDelete(`applicants/${id}`, token)
    setDeleteId(null)
    if (detail?.id === id) setDetail(null)
    loadApplicants(); refreshSummary()
  }

  function toggleJob(id: number) {
    setExpandedJobs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1a3c6e]">Pelamar</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {summary ? `${summary.overall.total_applicants} total pelamar · ${summary.overall.total_jobs} lowongan` : "Memuat..."}
          </p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setView("summary")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition ${view === "summary" ? "bg-white text-[#1a3c6e] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <BarChart2 className="w-3.5 h-3.5" /> Ringkasan
          </button>
          <button onClick={() => { setView("responses"); if (applicants.length === 0) loadApplicants() }}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition ${view === "responses" ? "bg-white text-[#1a3c6e] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <List className="w-3.5 h-3.5" /> Semua Respons
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>

          {/* SUMMARY VIEW */}
          {view === "summary" && (
            <div className="space-y-5">
              {summaryLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse space-y-3">
                      <div className="h-5 bg-slate-200 rounded w-1/3" />
                      <div className="h-20 bg-slate-100 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : summary ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
                      <p className="text-xs text-slate-400 font-medium">Total Pelamar</p>
                      <p className="text-3xl font-bold text-[#1a3c6e] mt-1">{summary.overall.total_applicants}</p>
                    </div>
                    {summary.overall.by_status.map(s => {
                      const cfg = STATUS_CFG[s.status]
                      return (
                        <div key={s.status} className={`border rounded-2xl p-4 shadow-sm ${cfg?.bg} ${cfg?.border}`}>
                          <p className={`text-xs font-medium ${cfg?.color}`}>{cfg?.label ?? s.status}</p>
                          <p className={`text-3xl font-bold mt-1 ${cfg?.color}`}>{s.count}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-700 mb-4">Distribusi Status Keseluruhan</p>
                    <DonutChart data={summary.overall.by_status} total={summary.overall.total_applicants} />
                  </div>

                  {summary.jobs.length === 0 ? (
                    <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl">
                      <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">Belum ada pelamar</p>
                    </div>
                  ) : summary.jobs.map(job => (
                    <motion.div key={`${job.job_id}-${job.job_title}`}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                      <button onClick={() => toggleJob(job.job_id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#1a3c6e]/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-4 h-4 text-[#1a3c6e]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{job.job_title}</p>
                            <p className="text-xs text-slate-400">{job.total} respons · {job.fields.length} pertanyaan form</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <div className="hidden sm:flex gap-1">
                            {job.by_status.filter(s => s.count > 0).map(s => {
                              const cfg = STATUS_CFG[s.status]
                              return (
                                <span key={s.status} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${cfg?.bg} ${cfg?.color} ${cfg?.border}`}>
                                  {s.count} {cfg?.label}
                                </span>
                              )
                            })}
                          </div>
                          {expandedJobs.has(job.job_id)
                            ? <ChevronDown className="w-4 h-4 text-slate-400" />
                            : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedJobs.has(job.job_id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            className="overflow-hidden">
                            <div className="border-t border-slate-100 p-5 space-y-4">
                              <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Status Pelamar</p>
                                <DonutChart data={job.by_status} total={job.total} />
                              </div>
                              <button onClick={() => { setJobId(String(job.job_id)); setView("responses") }}
                                className="w-full py-2 text-sm font-medium text-[#1a3c6e] border border-[#1a3c6e]/20 rounded-xl hover:bg-[#1a3c6e]/5 transition flex items-center justify-center gap-2">
                                <List className="w-4 h-4" /> Lihat semua respons lowongan ini
                              </button>
                              {job.fields.length > 0 && (
                                <>
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ringkasan Jawaban per Pertanyaan</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {job.fields.map((field, fi) => (
                                      <div key={fi} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                        <div className="flex items-start justify-between gap-2">
                                          <p className="text-sm font-semibold text-slate-700 leading-snug">{field.field_name}</p>
                                          <span className="text-[10px] px-2 py-0.5 bg-[#1a3c6e]/10 text-[#1a3c6e] rounded-full font-medium flex-shrink-0 whitespace-nowrap">
                                            {field.responses} jawaban
                                          </span>
                                        </div>
                                        {field.field_type === "file" && (
                                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5" /> {field.responses} file diunggah
                                          </p>
                                        )}
                                        {field.field_type === "option" && field.options && <BarChart options={field.options} />}
                                        {field.field_type === "text" && field.samples && field.samples.length > 0 && (
                                          <div className="mt-2 space-y-1.5">
                                            {field.samples.map((s, si) => (
                                              <p key={si} className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 line-clamp-2 italic">"{s}"</p>
                                            ))}
                                            {field.responses > field.samples.length && (
                                              <p className="text-[10px] text-slate-400">+{field.responses - field.samples.length} jawaban lainnya</p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </>
              ) : null}
            </div>
          )}

          {/* RESPONSES VIEW */}
          {view === "responses" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Cari nama, email, jawaban..." value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm" />
                </div>
                <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
                  className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm">
                  <option value="">Semua Status</option>
                  {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                {jobId && (
                  <button onClick={() => { setJobId(""); setPage(1) }}
                    className="px-3 py-2 bg-[#1a3c6e]/10 border border-[#1a3c6e]/20 rounded-xl text-sm text-[#1a3c6e] font-medium hover:bg-[#1a3c6e]/20 transition flex items-center gap-2">
                    Filter: {summary?.jobs.find(j => String(j.job_id) === jobId)?.job_title ?? `Job #${jobId}`} ✕
                  </button>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {respLoading ? (
                  <div className="divide-y divide-slate-100">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                          <div className="h-3 bg-slate-200 rounded w-1/4" />
                        </div>
                        <div className="h-6 w-20 bg-slate-200 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : applicants.length === 0 ? (
                  <div className="py-20 text-center">
                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Tidak ada pelamar ditemukan</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {applicants.map((applicant, index) => {
                      const cfg = STATUS_CFG[applicant.status]
                      const name = getDisplayName(applicant.answers)
                      const initial = getInitial(applicant.answers)
                      const email = getEmail(applicant.answers)
                      return (
                        <motion.div key={applicant.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}
                          className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition group">
                          <div className="w-8 h-8 rounded-full bg-[#1a3c6e]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#1a3c6e]">{initial}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                            <p className="text-xs text-slate-400 truncate">{applicant.job_title || applicant.job?.title || "—"}</p>
                          </div>
                          <p className="text-xs text-slate-400 hidden md:block truncate max-w-[160px]">{email || "—"}</p>
                          <div className="relative flex-shrink-0">
                            <select value={applicant.status}
                              onChange={e => handleStatusChange(applicant.id, e.target.value)}
                              disabled={updatingId === applicant.id}
                              className={`text-xs px-2.5 py-1 rounded-full font-medium appearance-none pr-6 cursor-pointer border focus:outline-none transition disabled:opacity-60 ${cfg?.bg} ${cfg?.color} ${cfg?.border}`}>
                              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                          </div>
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition flex-shrink-0">
                            <button onClick={() => setDetail(applicant)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a3c6e]/10 text-slate-400 hover:text-[#1a3c6e] transition"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteId(applicant.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              <Pagination
                page={page}
                totalPages={meta.total_pages}
                total={meta.total}
                itemLabel="pelamar"
                onPageChange={setPage}
                variant="admin"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Detail Side Panel */}
      <AnimatePresence>
        {detail && (() => {
          const name = getDisplayName(detail.answers)
          const email = getEmail(detail.answers)
          const phone = getPhone(detail.answers)
          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetail(null)} />
              <motion.div
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.25 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">

                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a3c6e]/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#1a3c6e]">{getInitial(detail.answers)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{name}</p>
                      <p className="text-xs text-slate-400">{detail.job_title || detail.job?.title || "—"}</p>
                    </div>
                  </div>
                  <button onClick={() => setDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition text-lg">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                    <select value={detail.status}
                      onChange={e => handleStatusChange(detail.id, e.target.value)}
                      disabled={updatingId === detail.id}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium appearance-none cursor-pointer border focus:outline-none transition disabled:opacity-60 ${STATUS_CFG[detail.status]?.bg} ${STATUS_CFG[detail.status]?.color} ${STATUS_CFG[detail.status]?.border}`}>
                      {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>

                  {/* Kontak — dari answers */}
                  {(email || phone) && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kontak</p>
                      {email && (
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <a href={`mailto:${email}`} className="hover:text-[#1a3c6e] transition truncate">{email}</a>
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <a href={`tel:${phone}`} className="hover:text-[#1a3c6e] transition">{phone}</a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lowongan */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lowongan</p>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{detail.job_title || detail.job?.title || "—"}</span>
                    </div>
                    {!detail.job_id && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="text-xs">⚠️</span>
                        <span className="text-xs text-amber-700 font-medium">Lowongan ini sudah dihapus</span>
                      </div>
                    )}
                    {detail.job?.country?.name && (
                      <div className="flex items-center gap-3 text-sm text-slate-700">
                        <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{detail.job.country.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Semua answers dari DB */}
                  {detail.answers && detail.answers.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jawaban Form</p>
                      {detail.answers.map(ans => (
                        <div key={ans.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                          <div className="px-3 py-2 bg-slate-100 border-b border-slate-200">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{ans.field_name}</p>
                          </div>
                          <div className="px-3 py-2.5">
                            {ans.file_url ? (
                              <a href={resolveUrl(ans.file_url)!} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-[#1a3c6e] font-medium hover:underline">
                                <Download className="w-3.5 h-3.5" /> Lihat / Download File
                              </a>
                            ) : (
                              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {ans.value || <span className="text-slate-400 italic">Tidak diisi</span>}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jawaban Form</p>
                      <div className="flex flex-col items-center gap-2 py-8 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-3xl">📋</span>
                        <p className="text-sm font-medium text-slate-500">Data jawaban tidak tersedia</p>
                        <p className="text-xs text-slate-400 text-center max-w-[220px]">Lowongan & form template sudah dihapus sebelum fitur snapshot diterapkan</p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                    Mendaftar: {new Date(detail.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
                  {email && (
                    <button
                      onClick={() => {
                        const subject = encodeURIComponent(`Re: Lamaran ${detail.job_title || detail.job?.title || ""}`)
                        const to = encodeURIComponent(email)
                        router.push(`/admin/email/inbox?compose=1&to=${to}&subject=${subject}`)
                      }}
                      className="flex-1 py-2 text-sm font-medium bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-xl transition text-center flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" /> Balas Email
                    </button>
                  )}
                  <button onClick={() => setDeleteId(detail.id)}
                    className="py-2 px-4 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </>
          )
        })()}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm pointer-events-auto">
                <h3 className="text-base font-semibold text-slate-800">Hapus Pelamar?</h3>
                <p className="text-sm text-slate-400 mt-1">Semua data dan jawaban form pelamar ini akan dihapus permanen.</p>
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