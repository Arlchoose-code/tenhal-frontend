"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  ArrowRight, MapPin, Briefcase, Clock, ArrowUpRight, ArrowLeft
} from "lucide-react"
import type { Job } from "@/types"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}
const stag: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const imgUrl = (url: string) => {
  if (!url) return null
  if (url.startsWith("http")) return url.replace(/^https?:\/\/[^/]+/, "/api")
  if (url.startsWith("/uploads")) return `/api${url}`
  return `/api/${url}`
}

const EU_FLAGS: Record<string, string> = {
  "Hungaria": "🇭🇺","Hungary": "🇭🇺","Polandia": "🇵🇱","Poland": "🇵🇱",
  "Ceko": "🇨🇿","Czech": "🇨🇿","Austria": "🇦🇹","Turki": "🇹🇷","Turkey": "🇹🇷",
  "Slovakia": "🇸🇰","Jerman": "🇩🇪","Germany": "🇩🇪","Belanda": "🇳🇱",
  "Netherlands": "🇳🇱","Belgia": "🇧🇪","Belgium": "🇧🇪","Romania": "🇷🇴",
  "Kroasia": "🇭🇷","Croatia": "🇭🇷",
}

function JobCard({ job }: { job: Job }) {
  const thumb = imgUrl(job.thumbnail_url)
  const expired = job.expired_at ? new Date(job.expired_at) < new Date() : false
  const href = job.type === "internship" ? `/layanan/magang/${job.slug}` : `/layanan/lowongan/${job.slug}`

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -6 }}>
      <Link href={href}
        className="group block bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-slate-200/70 hover:border-blue-100 transition-all duration-300 h-full">
        <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
              {job.type === "internship" ? "🎓" : "💼"}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {job.country && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
              {job.country.flag_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgUrl(job.country.flag_url) || ""} alt={job.country.name} className="w-4 h-3 object-cover rounded-sm" />
              ) : (
                <span className="text-xs">{EU_FLAGS[job.country.name] || "🌍"}</span>
              )}
              <span className="text-[11px] font-bold text-slate-700">{job.country.name}</span>
            </div>
          )}
          <div className={`absolute top-3 right-3 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase ${expired ? "bg-red-500" : "bg-green-500"}`}>
            {expired ? "Tutup" : "Buka"}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider
              ${job.type === "internship" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
              {job.type === "internship" ? "✈️ Magang" : "💼 Full Time"}
            </span>
          </div>
          <h3 className="font-black text-[#0a1628] text-base leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
            {job.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {job.city && <div className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3 h-3" />{job.city}</div>}
            {job.salary && <div className="flex items-center gap-1 text-xs text-slate-500"><Briefcase className="w-3 h-3" />{job.salary} {job.salary_currency}</div>}
            {job.expired_at && !expired && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />s/d {new Date(job.expired_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
            {job.salary
              ? <span className="font-black text-[#0a1628] text-sm">{job.salary_currency} {job.salary}</span>
              : <span className="text-xs text-slate-400">Salary TBD</span>}
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Lihat <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

interface Props {
  jobs: Job[]
  sector: string
  settings: Record<string, string>
}

const SECTOR_ICONS: Record<string, string> = {
  technical: "⚙️", construction: "🏗️", warehouse: "📦",
  hospitality: "🏨", healthcare: "🏥", transportation: "🚛",
  manufacturing: "🏭", agriculture: "🌾", it: "💻", finance: "💼",
}
const sectorIcon = (s: string) => {
  const k = s.toLowerCase().replace(/\s+/g, "")
  for (const [key, v] of Object.entries(SECTOR_ICONS)) if (k.includes(key)) return v
  return "🏢"
}

export default function SektorClient({ jobs, sector, settings }: Props) {
  const wa = settings["whatsapp"] || ""
  const heroRef = useRef(null)

  const jobsInSector = jobs.filter(j => j.sector === sector)
  const jobOnly = jobsInSector.filter(j => j.type === "job")
  const internshipOnly = jobsInSector.filter(j => j.type === "internship")

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section ref={heroRef} className="relative py-28 sm:py-32 flex items-center overflow-hidden"
        style={{ background: "linear-gradient(160deg,#020b1a 0%,#071530 30%,#0c2348 60%,#0f3060 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "70px 70px" }} />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.2, 0.08] }} transition={{ duration: 9, repeat: Infinity }}
          className="absolute top-[5%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(56,139,253,0.3) 0%, transparent 70%)" }} />

        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div variants={stag} initial="hidden" animate="show">
            {/* Breadcrumb */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-white/30 text-xs font-medium mb-8">
              <Link href="/" className="hover:text-white/60 transition">Home</Link>
              <span>/</span>
              <span className="text-white/50">Sektor</span>
              <span>/</span>
              <span className="text-white/80">{sector}</span>
            </motion.div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <div>
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2.5 px-4 py-2 mb-5 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300 text-xs font-bold uppercase tracking-widest">
                  <span className="text-lg">{sectorIcon(sector)}</span> Sektor {sector}
                </motion.div>
                <motion.h1 variants={fadeUp}
                  className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tight mb-3">
                  {sector}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400 inline-block pb-1">
                    di Eropa
                  </span>
                </motion.h1>
                <motion.p variants={fadeUp} className="text-white/50 text-base max-w-md">
                  Lowongan kerja dan magang di sektor {sector} — semua didampingi penuh oleh tim Tenhal
                </motion.p>
              </div>

              <motion.div variants={fadeUp} className="flex gap-4 sm:ml-auto flex-shrink-0">
                <div className="text-center px-6 py-4 bg-white/8 border border-white/10 rounded-2xl">
                  <div className="text-2xl font-black text-white">{jobOnly.length}</div>
                  <div className="text-[11px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Kerja</div>
                </div>
                <div className="text-center px-6 py-4 bg-white/8 border border-white/10 rounded-2xl">
                  <div className="text-2xl font-black text-white">{internshipOnly.length}</div>
                  <div className="text-[11px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Magang</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LISTING */}
      <section className="py-20 sm:py-28 bg-[#f7f9fc]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          {jobsInSector.length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-slate-400 font-medium mb-6">Belum ada lowongan di sektor {sector} saat ini</p>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Home
              </Link>
            </div>
          ) : (
            <>
              {/* Lowongan Kerja */}
              {jobOnly.length > 0 && (
                <div className="mb-14">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm">💼</span>
                      <h2 className="text-2xl font-black text-[#0a1628]">Lowongan Kerja</h2>
                      <span className="text-sm text-slate-400 font-medium">({jobOnly.length})</span>
                    </div>
                    <Link href="/layanan/lowongan" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition">
                      Lihat semua <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <motion.div variants={stag} initial="hidden" animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {jobOnly.map(job => <JobCard key={job.id} job={job} />)}
                  </motion.div>
                </div>
              )}

              {/* Program Magang */}
              {internshipOnly.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white text-sm">✈️</span>
                      <h2 className="text-2xl font-black text-[#0a1628]">Program Magang</h2>
                      <span className="text-sm text-slate-400 font-medium">({internshipOnly.length})</span>
                    </div>
                    <Link href="/layanan/magang" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition">
                      Lihat semua <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <motion.div variants={stag} initial="hidden" animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {internshipOnly.map(job => <JobCard key={job.id} job={job} />)}
                  </motion.div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      {wa && (
        <section className="py-20 relative overflow-hidden"
          style={{ background: "linear-gradient(150deg,#020b1a 0%,#071530 40%,#0c2348 100%)" }}>
          <div className="relative max-w-2xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Tertarik di Sektor {sector}?
            </h2>
            <p className="text-white/50 mb-8 max-w-sm mx-auto">
              Konsultasi gratis dengan tim Tenhal untuk menentukan jalur terbaik untukmu
            </p>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-black rounded-2xl text-sm shadow-xl">
              💬 Chat WhatsApp Sekarang <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      )}

      {wa && (
        <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: "spring" }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl overflow-hidden">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>💬</motion.div>
          <motion.div animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-green-500" />
        </motion.a>
      )}
    </div>
  )
}