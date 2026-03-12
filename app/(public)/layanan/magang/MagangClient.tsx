"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import type { Variants, TargetAndTransition } from "framer-motion"
import {
  ArrowRight, MessageCircle, ChevronDown,
  MapPin, Briefcase, Clock, Globe, Search, Filter
} from "lucide-react"
import type { Job } from "@/types"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const stag: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

function Rev({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div ref={ref} variants={stag} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  )
}

function Dot({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div className="absolute rounded-full bg-white/30 pointer-events-none"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ y: [0, -18, 0], opacity: [0.1, 0.5, 0.1] } as TargetAndTransition}
      transition={{ duration: 3.5 + delay, repeat: Infinity, delay, ease: "easeInOut" }} />
  )
}

const imgUrl = (url: string) => {
  if (!url) return null
  if (url.startsWith("http")) return url.replace(/^https?:\/\/[^/]+/, "/api")
  if (url.startsWith("/uploads")) return `/api${url}`
  return `/api/${url}`
}

function InternshipCard({ job }: { job: Job }) {
  const thumb = imgUrl(job.thumbnail_url)
  const expired = job.expired_at ? new Date(job.expired_at) < new Date() : false

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -8, boxShadow: "0 30px 80px rgba(0,0,0,0.1)" }}
      className="group bg-white border border-slate-100 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col">
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex-shrink-0">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🏭</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {job.country && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
            {job.country.flag_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgUrl(job.country.flag_url) || ""} alt={job.country.name} className="w-4 h-3 object-cover rounded-sm" />
            )}
            <span className="text-[11px] font-bold text-slate-700">{job.country.name}</span>
          </div>
        )}
        <div className={`absolute top-3 right-3 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase ${expired ? "bg-red-500" : "bg-green-500"}`}>
          {expired ? "Tutup" : "Buka"}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {job.sector && (
          <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-600 text-[11px] font-black rounded-lg uppercase tracking-wider mb-3 w-fit">
            {job.sector}
          </span>
        )}
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
        <div className="mt-auto">
          <Link href={`/layanan/magang/${job.slug}`}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className={`w-full py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2
                ${expired
                  ? "bg-slate-100 text-slate-400 pointer-events-none"
                  : "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-900/20 hover:shadow-xl"}`}>
              {expired ? "Program Tutup" : <><span>Lihat Detail</span><ArrowRight className="w-4 h-4" /></>}
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

interface Props {
  internships: Job[]
  settings: Record<string, string>
}

export default function MagangClient({ internships, settings }: Props) {
  const wa = settings["whatsapp"] || ""
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState("")
  const [sector, setSector] = useState(searchParams.get("sector") || "Semua")

  useEffect(() => {
    const s = searchParams.get("sector")
    if (s) setSector(s)
    else setSector("Semua")
  }, [searchParams])

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOp = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // Sectors dari data real, bukan hardcode
  const sectors = useMemo(() => {
    const s = Array.from(new Set(internships.map(j => j.sector).filter(Boolean)))
    return ["Semua", ...s]
  }, [internships])

  const filtered = useMemo(() => internships.filter(j => {
    const matchSearch = !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.country?.name?.toLowerCase().includes(search.toLowerCase()) ||
      j.city?.toLowerCase().includes(search.toLowerCase())
    const matchSector = sector === "Semua" || j.sector === sector
    return matchSearch && matchSector
  }), [internships, search, sector])

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
        {[...Array(14)].map((_, i) => (
          <Dot key={i} x={`${3 + i * 7}%`} y={`${10 + (i % 6) * 13}%`} size={i % 4 === 0 ? 5 : i % 3 === 0 ? 3.5 : 2} delay={i * 0.32} />
        ))}
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[8%] text-7xl opacity-[0.06] pointer-events-none select-none hidden lg:block">✈️</motion.div>
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
              Program Magang Internasional
            </motion.div>
            <motion.h1 variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-4">
              Magang
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
              Raih pengalaman kerja internasional nyata di Eropa. Tenhal mendampingi dari seleksi, dokumen, hingga keberangkatanmu.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center mb-14">
              <motion.a href="#program" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-xl shadow-blue-900/40">
                Lihat Program
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
                { n: String(internships.length || "—"), l: "Program Aktif" },
                { n: "11+", l: "Negara Tujuan" },
                { n: "100%", l: "Didampingi" },
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
      <section id="program" className="py-28 sm:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="text-center mb-12">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">
                <Globe className="w-3 h-3" /> Program Tersedia
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#0a1628] tracking-tight mb-3">
                Pilih Program Magangmu
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500 max-w-sm mx-auto">
                Semua program didampingi penuh oleh tim Tenhal — dari pendaftaran sampai berangkat
              </motion.p>
            </div>
          </Rev>

          {/* Filter */}
          <div className="flex flex-wrap gap-3 mb-8 items-center">
            <div className="relative flex-1 min-w-48 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Cari program, negara, kota..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition shadow-sm" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {sectors.map(s => (
                <button key={s} onClick={() => {
                  setSector(s)
                  const params = new URLSearchParams()
                  if (s !== "Semua") params.set("sector", s)
                  router.replace(`/layanan/magang${params.toString() ? `?${params}` : ""}`, { scroll: false })
                }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sector === s ? "bg-[#0a1628] text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-slate-400 font-medium">
                {internships.length === 0 ? "Belum ada program magang tersedia saat ini" : "Tidak ada program yang sesuai filter"}
              </p>
              {wa && internships.length === 0 && (
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition">
                  <MessageCircle className="w-4 h-4" /> Tanya Program via WA
                </a>
              )}
            </motion.div>
          ) : (
            <motion.div key={`${search}-${sector}`} variants={stag} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map(job => <InternshipCard key={job.id} job={job} />)}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg,#020b1a 0%,#071530 40%,#0c2348 100%)" }}>
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.2, 0.08] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(56,139,253,0.2) 0%,transparent 65%)" }} />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <Rev>
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.07] border border-white/10 rounded-full text-[11px] font-black text-sky-300/80 uppercase tracking-[0.2em] mb-6">
              💬 Masih Ragu?
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Konsultasi Gratis<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400">Tanpa Komitmen</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 mb-8 max-w-sm mx-auto">
              Tim Tenhal siap jawab semua pertanyaanmu soal program magang di Eropa
            </motion.p>
            {wa && (
              <motion.div variants={fadeUp}>
                <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-black rounded-2xl text-sm shadow-xl">
                  <MessageCircle className="w-4 h-4" /> Chat WhatsApp Sekarang
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.3, repeat: Infinity }}><ArrowRight className="w-4 h-4" /></motion.span>
                </motion.a>
              </motion.div>
            )}
          </Rev>
        </div>
      </section>

      {wa && (
        <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: "spring" }}
          whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-2xl shadow-green-900/40 flex items-center justify-center text-2xl overflow-hidden">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>💬</motion.div>
          <motion.div animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-green-500" />
        </motion.a>
      )}
    </div>
  )
}