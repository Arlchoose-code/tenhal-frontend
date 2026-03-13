"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  ArrowRight, MapPin, Briefcase, Clock, Globe, Search, Filter, ArrowUpRight, MessageCircle, ChevronDown
} from "lucide-react"
import type { Job } from "@/types"

function Rev({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div ref={ref} variants={stag} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  )
}

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
        <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex-shrink-0">
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
            {job.sector && (
              <span className="text-[11px] text-slate-400 font-medium">{job.sector}</span>
            )}
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
  settings: Record<string, string>
}

export default function LowonganClient({ jobs, settings }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wa = settings["whatsapp"] || ""

  // jobs sudah difilter type=job dari server, tapi filter lagi untuk keamanan
  const jobsOnly = useMemo(() => jobs.filter(j => j.type === "job"), [jobs])

  const [search, setSearch] = useState("")
  const [sector, setSector] = useState(searchParams.get("sector") || "Semua")

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOp = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    const s = searchParams.get("sector")
    if (s) setSector(s)
    else setSector("Semua")
  }, [searchParams])

  const sectors = useMemo(() => {
    const s = Array.from(new Set(jobsOnly.map(j => j.sector).filter(Boolean))) as string[]
    return ["Semua", ...s]
  }, [jobsOnly])

  const filtered = useMemo(() => jobsOnly.filter(j => {
    const matchSearch = !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.country?.name?.toLowerCase().includes(search.toLowerCase()) ||
      j.city?.toLowerCase().includes(search.toLowerCase()) ||
      j.sector?.toLowerCase().includes(search.toLowerCase())
    const matchSector = sector === "Semua" || j.sector === sector
    return matchSearch && matchSector
  }), [jobsOnly, search, sector])

  function handleSectorClick(s: string) {
    setSector(s)
    const params = new URLSearchParams()
    if (s !== "Semua") params.set("sector", s)
    router.replace(`/layanan/lowongan${params.toString() ? `?${params}` : ""}`, { scroll: false })
  }

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(160deg,#020b1a 0%,#071530 30%,#0c2348 60%,#0f3060 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "70px 70px" }} />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.28, 0.12] }} transition={{ duration: 9, repeat: Infinity }}
          className="absolute top-[-5%] right-[-8%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(56,139,253,0.35) 0%,transparent 70%)" }} />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.06, 0.18, 0.06] }} transition={{ duration: 12, repeat: Infinity, delay: 4 }}
          className="absolute bottom-[5%] left-[-8%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(99,179,237,0.2) 0%,transparent 70%)" }} />
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[8%] text-7xl opacity-[0.06] pointer-events-none select-none hidden lg:block">💼</motion.div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-full block">
            <path d="M0,60 C360,100 720,0 1080,60 C1260,90 1380,20 1440,60 L1440,100 L0,100 Z" fill="white" />
          </svg>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOp }}
          className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 pt-40 pb-32">
          <motion.div variants={stag} initial="hidden" animate="show" className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Lowongan Kerja di Eropa
            </motion.div>
            <motion.h1 variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-4">
              Kerja
              <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300">di Eropa</span>
                <motion.span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.8 }} />
              </span>
              <br />
              <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.3)", color: "transparent" }}>Bersama Tenhal</span>
            </motion.h1>
            <motion.div variants={fadeUp} className="w-16 h-1 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 mx-auto mt-6 mb-6" />
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/55 leading-relaxed mb-10 max-w-xl mx-auto">
              Lowongan kerja full-time di Eropa, semua diproses legal P3MI dan didampingi penuh oleh tim Tenhal.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center mb-14">
              <motion.a href="#listing" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-xl shadow-blue-900/40">
                Lihat Lowongan
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.3, repeat: Infinity }}><ArrowRight className="w-4 h-4" /></motion.span>
              </motion.a>
              {wa && (
                <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-4 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-2xl text-sm transition-colors">
                  <MessageCircle className="w-4 h-4" /> Konsultasi Gratis
                </motion.a>
              )}
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center justify-center">
              {[
                { n: String(jobsOnly.length || "—"), l: "Lowongan Tersedia" },
                { n: "11+", l: "Negara Tujuan" },
                { n: "100%", l: "Legal P3MI" },
              ].map((s, i) => (
                <div key={s.l} className="flex items-center">
                  <div className="text-center px-7">
                    <div className="text-2xl sm:text-3xl font-black text-white">{s.n}</div>
                    <div className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mt-0.5">{s.l}</div>
                  </div>
                  {i < 2 && <div className="w-px h-8 bg-white/15" />}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/30">
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* LISTING */}
      <section id="listing" className="py-28 sm:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="text-center mb-12">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">
                <Globe className="w-3 h-3" /> Lowongan Tersedia
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#0a1628] tracking-tight mb-3">
                Pilih Lowonganmu
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500 max-w-sm mx-auto">
                Semua lowongan diproses legal P3MI dan didampingi penuh oleh tim Tenhal
              </motion.p>
            </div>
          </Rev>

          {/* Filter */}
          <div className="flex flex-wrap gap-3 mb-8 items-center">
            <div className="relative flex-1 min-w-48 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Cari lowongan, negara, kota, sektor..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {sectors.map(s => (
                <button key={s} onClick={() => handleSectorClick(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sector === s ? "bg-[#0a1628] text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-slate-400 font-medium mb-2">
                {jobsOnly.length === 0 ? "Belum ada lowongan tersedia saat ini" : "Tidak ada lowongan yang sesuai filter"}
              </p>
              {(search || sector !== "Semua") && (
                <button onClick={() => { setSearch(""); setSector("Semua"); router.replace("/layanan/lowongan", { scroll: false }) }}
                  className="mt-3 text-sm font-bold text-blue-600 hover:underline">
                  Reset filter
                </button>
              )}
              {wa && jobsOnly.length === 0 && (
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition">
                  💬 Tanya Lowongan via WA
                </a>
              )}
            </motion.div>
          ) : (
            <motion.div key={`${search}-${sector}`} variants={stag} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map(job => <JobCard key={job.id} job={job} />)}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      {wa && (
        <section className="py-20 relative overflow-hidden"
          style={{ background: "linear-gradient(150deg,#020b1a 0%,#071530 40%,#0c2348 100%)" }}>
          <div className="relative max-w-2xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Butuh Bantuan Memilih?
            </h2>
            <p className="text-white/50 mb-8 max-w-sm mx-auto">
              Tim Tenhal siap membantu kamu memilih program yang paling cocok
            </p>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-black rounded-2xl text-sm shadow-xl">
              💬 Chat WhatsApp Sekarang <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      )}

      {/* Floating WA */}
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