"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  ArrowRight, CheckCircle2, Globe2, ChevronDown, MapPin, Plus,
  ArrowUpRight, Shield, Star, Phone, Mail, MessageCircle, Clock,
  Plane, FileCheck, GraduationCap, Building2, Briefcase
} from "lucide-react"
import type { Job, Country } from "@/types"

const B = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
const img = (url: string) => !url ? null : url.startsWith("http") ? url : `${B}/${url}`

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}
const stag: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }

function Rev({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div ref={ref} variants={stag} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  )
}

function Marquee({ children, speed = 35, reverse = false }: { children: React.ReactNode; speed?: number; reverse?: boolean }) {
  return (
    <div className="overflow-hidden w-full" style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}>
      <motion.div className="flex gap-4 w-max"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}>
        {children}{children}
      </motion.div>
    </div>
  )
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let s = 0; const step = Math.ceil(to / 50)
    const t = setInterval(() => { s += step; if (s >= to) { setVal(to); clearInterval(t) } else setVal(s) }, 28)
    return () => clearInterval(t)
  }, [inView, to])
  return <span ref={ref}>{val}{suffix}</span>
}

function Dot({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div className="absolute rounded-full bg-white pointer-events-none"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ y: [0, -20, 0], opacity: [0.12, 0.45, 0.12] }}
      transition={{ duration: 3 + delay, repeat: Infinity, delay, ease: "easeInOut" }} />
  )
}

function AirplanePath() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 600" preserveAspectRatio="none">
      <motion.path d="M-50,300 Q200,100 400,250 Q600,400 800,150 Q1000,0 1300,200"
        stroke="rgba(147,210,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="8 12"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "loop" }} />
      <motion.path d="M-50,420 Q300,200 550,360 Q750,490 950,260 Q1100,120 1300,300"
        stroke="rgba(147,210,255,0.07)" strokeWidth="1" fill="none" strokeDasharray="5 15"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.8, repeatType: "loop" }} />
    </svg>
  )
}

const SECTOR_ICONS: Record<string, string> = {
  technical: "⚙️", construction: "🏗️", warehouse: "📦",
  hospitality: "🏨", healthcare: "🏥", transportation: "🚛",
  manufacturing: "🏭", agriculture: "🌾", it: "💻", finance: "💼",
}
const sectorIcon = (s: string) => {
  const k = s.toLowerCase().replace(/\s+/g, "")
  for (const [key, v] of Object.entries(SECTOR_ICONS)) if (k.includes(key)) return v
  return "💼"
}

const EU_FLAGS: Record<string, string> = {
  "Hungaria": "🇭🇺","Hungary": "🇭🇺","Polandia": "🇵🇱","Poland": "🇵🇱",
  "Ceko": "🇨🇿","Czech": "🇨🇿","Austria": "🇦🇹","Turki": "🇹🇷","Turkey": "🇹🇷",
  "Slovakia": "🇸🇰","Jerman": "🇩🇪","Germany": "🇩🇪","Belanda": "🇳🇱",
  "Netherlands": "🇳🇱","Belgia": "🇧🇪","Belgium": "🇧🇪","Romania": "🇷🇴",
  "Kroasia": "🇭🇷","Croatia": "🇭🇷",
}

interface Props {
  jobs: Job[]; allJobsForSectors: Job[]; sectors: string[]
  countries: Country[]; pageContent: Record<string, { title: string; content: string }>
  faqContent: Record<string, { title: string; content: string }>; settings: Record<string, string>
}

export default function HomeClient({ jobs, sectors, countries, pageContent, faqContent, settings }: Props) {
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  const hero = pageContent["hero"] ?? {}
  const keunggulan = pageContent["keunggulan"] ?? {}
  const wa = settings["whatsapp"] || ""
  const faqs = Object.entries(faqContent)
  const displaySectors = sectors.length > 0 ? sectors : ["Technical","Construction","Warehouse","Hospitality","Healthcare","Transportation"]
  const getFlag = (c: Country) => EU_FLAGS[c.name] || "🌍"

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #020b1a 0%, #071530 30%, #0c2348 60%, #0f3060 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        <AirplanePath />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.25, 0.12] }} transition={{ duration: 9, repeat: Infinity }}
          className="absolute top-[5%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(56,139,253,0.35) 0%, transparent 70%)" }} />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.06, 0.16, 0.06] }} transition={{ duration: 12, repeat: Infinity, delay: 4 }}
          className="absolute bottom-[10%] left-[0%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,179,237,0.2) 0%, transparent 70%)" }} />
        {[...Array(14)].map((_, i) => (
          <Dot key={i} x={`${4 + i * 7}%`} y={`${12 + (i % 6) * 13}%`} size={i % 4 === 0 ? 5 : i % 3 === 0 ? 4 : 2.5} delay={i * 0.35} />
        ))}
        <motion.div animate={{ x: ["-10%", "110%"], y: ["60%", "20%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", repeatType: "loop" }}
          className="absolute pointer-events-none opacity-[0.1]">
          <Plane className="w-10 h-10 text-white" style={{ transform: "rotate(-20deg)" }} />
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 90" fill="none" preserveAspectRatio="none" className="w-full block">
            <path d="M0,50 C240,90 480,10 720,50 C960,90 1200,10 1440,50 L1440,90 L0,90 Z" fill="white" />
          </svg>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 pt-44 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={stag} initial="hidden" animate="show">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300 text-xs font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                P3MI Resmi · Terdaftar & Terpercaya
              </motion.div>
              <motion.h1 variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.0] tracking-tight mb-3">
                {hero.title ? hero.title : <>Karir <br /><span style={{ WebkitTextStroke: "2px rgba(147,210,255,0.7)", color: "transparent" }}>Internasional</span><br />Dimulai di Sini</>}
              </motion.h1>
              <motion.div variants={fadeUp} className="w-16 h-1 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 mb-6" />
              <motion.p variants={fadeUp} className="text-lg text-white/60 leading-relaxed mb-10 max-w-[500px]">
                {hero.content || "TenHal membuka jalan ke Eropa — pelatihan intensif, proses legal P3MI, dan pendampingan penuh hingga kamu berangkat."}
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-14">
                {wa && (
                  <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(56,139,253,0.5)" }} whileTap={{ scale: 0.96 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-xl shadow-blue-900/40">
                    Daftar Gratis Sekarang
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.3, repeat: Infinity }}>
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </motion.a>
                )}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/layanan/lowongan"
                    className="inline-flex items-center gap-2 px-7 py-4 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-2xl text-sm transition-colors">
                    Lihat Lowongan
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center">
                {[{ num: 11, suf: "+", label: "Negara" }, { num: 100, suf: "+", label: "Alumni" }, { num: 7, suf: "+ thn", label: "Pengalaman" }].map((s, i) => (
                  <div key={s.label} className="flex items-center">
                    <div className="text-center px-6">
                      <div className="text-3xl font-black text-white tracking-tight"><Counter to={s.num} suffix={s.suf} /></div>
                      <div className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mt-0.5">{s.label}</div>
                    </div>
                    {i < 2 && <div className="w-px h-8 bg-white/15" />}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Boarding pass card */}
            <motion.div initial={{ opacity: 0, y: 60, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="hidden lg:block relative">
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                style={{ transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)" }}>
                <div className="bg-gradient-to-br from-[#071530] to-[#1a3c6e] p-7 pb-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[10px] font-black text-sky-300/70 uppercase tracking-[0.2em]">Boarding Pass</div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                      <span className="text-[10px] font-bold text-white/60">P3MI</span>
                      <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-green-400">Verified</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Dari</div>
                      <div className="text-5xl font-black text-white tracking-tight">CGK</div>
                      <div className="text-xs text-white/50 mt-1">Jakarta, Indonesia 🇮🇩</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Plane className="w-8 h-8 text-sky-400" />
                      </motion.div>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-px bg-white/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <div className="w-12 h-px bg-white/20" />
                      </div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider">Direct</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Ke</div>
                      <div className="text-5xl font-black text-sky-300 tracking-tight">EUR</div>
                      <div className="text-xs text-white/50 mt-1">11 negara tujuan 🌍</div>
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute -left-4 w-8 h-8 rounded-full bg-[#071530]" />
                  <div className="w-full border-t-2 border-dashed border-slate-200 mx-4" />
                  <div className="absolute -right-4 w-8 h-8 rounded-full bg-[#071530]" />
                </div>
                <div className="bg-white p-6">
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {[{ l: "Passenger", v: "Alumni Tenhal" }, { l: "Class", v: "Skilled Worker" }, { l: "Gate", v: "P3MI Legal" }].map(f => (
                      <div key={f.l}>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">{f.l}</div>
                        <div className="text-xs font-black text-[#0f1f3d]">{f.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lowongan Terbuka</div>
                    <div className="space-y-2.5">
                      {jobs.slice(0, 3).map((job, i) => (
                        <Link key={job.id} href={job.type === "internship" ? `/layanan/magang/${job.slug}` : `/layanan/lowongan/${job.slug}`}>
                          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + i * 0.12 }} whileHover={{ x: 3 }}
                            className="flex items-center justify-between group cursor-pointer">
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#0f1f3d] truncate group-hover:text-blue-600 transition-colors">{job.title}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" />{job.country?.name}
                              </div>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
                          </motion.div>
                        </Link>
                      ))}
                      {jobs.length === 0 && <div className="text-xs text-slate-400 text-center py-2">Segera hadir...</div>}
                    </div>
                  </div>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
                className="absolute -left-16 top-16 bg-white rounded-2xl shadow-2xl px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🎓</span>
                  <div><div className="text-xs font-black text-slate-800">Pelatihan 7 Minggu</div><div className="text-[10px] text-slate-400">Bahasa & Skill</div></div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }}
                whileHover={{ scale: 1.05 }}
                className="absolute -right-12 bottom-24 bg-white rounded-2xl shadow-2xl px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">✈️</span>
                  <div><div className="text-xs font-black text-slate-800">Siap Berangkat</div><div className="text-[10px] text-slate-400">Legal & aman</div></div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile boarding pass */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:hidden mt-6 mx-auto max-w-sm w-full">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {/* top dark section */}
              <div className="bg-gradient-to-br from-[#071530] to-[#1a3c6e] px-5 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-black text-sky-300/70 uppercase tracking-[0.2em]">Boarding Pass</div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2.5 py-1">
                    <span className="text-[10px] font-bold text-white/60">P3MI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-400">Verified</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Dari</div>
                    <div className="text-4xl font-black text-white tracking-tight">CGK</div>
                    <div className="text-[11px] text-white/50 mt-0.5">Jakarta 🇮🇩</div>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <Plane className="w-6 h-6 text-sky-400" />
                    </motion.div>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-px bg-white/20" />
                      <div className="w-1 h-1 rounded-full bg-sky-400" />
                      <div className="w-8 h-px bg-white/20" />
                    </div>
                    <div className="text-[10px] text-white/30 uppercase">Direct</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Ke</div>
                    <div className="text-4xl font-black text-sky-300 tracking-tight">EUR</div>
                    <div className="text-[11px] text-white/50 mt-0.5">11 negara 🌍</div>
                  </div>
                </div>
              </div>
              {/* tear line */}
              <div className="relative flex items-center">
                <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#071530]" />
                <div className="w-full border-t-2 border-dashed border-slate-200 mx-3" />
                <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#071530]" />
              </div>
              {/* bottom white section */}
              <div className="bg-white px-5 py-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[{ l: "Passenger", v: "Alumni Tenhal" }, { l: "Class", v: "Skilled Worker" }, { l: "Gate", v: "P3MI Legal" }].map(f => (
                    <div key={f.l}>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">{f.l}</div>
                      <div className="text-[11px] font-black text-[#0f1f3d]">{f.v}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lowongan Terbuka</div>
                  <div className="space-y-2">
                    {jobs.slice(0, 3).map((job, i) => (
                      <Link key={job.id} href={job.type === "internship" ? `/layanan/magang/${job.slug}` : `/layanan/lowongan/${job.slug}`}>
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }} whileHover={{ x: 2 }}
                          className="flex items-center justify-between group">
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#0f1f3d] truncate group-hover:text-blue-600 transition-colors">{job.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />{job.country?.name}
                            </div>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 flex-shrink-0 ml-2" />
                        </motion.div>
                      </Link>
                    ))}
                    {jobs.length === 0 && <div className="text-xs text-slate-400 text-center py-1">Segera hadir...</div>}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/30">
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ══ KEUNGGULAN ══ */}
      <section className="py-28 sm:py-36 bg-white relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40"
          style={{ background: "radial-gradient(circle, #e8f4ff 0%, transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4">
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-5">
                  Kenapa Tenhal
                </motion.div>
                <motion.h2 variants={fadeUp}
                  className="text-4xl sm:text-5xl font-black text-[#0a1628] leading-[1.05] mb-6 tracking-tight">
                  {keunggulan.title || <><span>Keunggulan</span><br />Nyata</>}
                </motion.h2>
                <motion.p variants={fadeUp} className="text-slate-500 leading-relaxed mb-10 text-base">
                  {keunggulan.content || "Bukan sekedar agen tenaga kerja. Kami adalah mitra perjalanan karir global Anda."}
                </motion.p>
                <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden">
                  {[{ num: 11, suf: "+", label: "Negara" }, { num: 100, suf: "+", label: "Alumni" }, { num: 7, suf: " thn", label: "Pengalaman" }].map(s => (
                    <motion.div key={s.label} variants={fadeUp}
                      className="bg-white text-center py-5 px-2 hover:bg-blue-50 transition-colors">
                      <div className="text-2xl font-black text-[#0a1628]"><Counter to={s.num} suffix={s.suf} /></div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{s.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "🏛️", n: "01", color: "bg-blue-600", title: "100% Legal & Resmi", tag: "P3MI Terdaftar", desc: "Terdaftar resmi sebagai P3MI. Proses aman, transparan, dan sesuai regulasi Kemenaker." },
                  { icon: "🎓", n: "02", color: "bg-indigo-600", title: "Pelatihan Intensif", tag: "7 Minggu Program", desc: "Program pelatihan Bahasa Inggris dan keterampilan kerja intensif selama 7 minggu." },
                  { icon: "🌍", n: "03", color: "bg-sky-600", title: "Jaringan Eropa", tag: "11+ Negara", desc: "Bermitra langsung dengan perusahaan-perusahaan di Eropa Tengah dan Timur." },
                  { icon: "🤝", n: "04", color: "bg-teal-600", title: "Full Support", tag: "Daftar s/d Berangkat", desc: "Pendampingan penuh mulai dari konsultasi, dokumen, hingga keberangkatan." },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp}
                    whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}
                    className="group relative bg-white border border-slate-100 rounded-2xl p-6 cursor-pointer transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 group-hover:bg-blue-500 transition-colors duration-400" />
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 ${item.color} rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black text-slate-300 tracking-widest">{item.n}</span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{item.tag}</span>
                        </div>
                        <h3 className="font-black text-[#0a1628] text-base mb-2 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ══ CARA KERJA ══ */}
      <section className="py-28 sm:py-36 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #020b1a 0%, #071530 40%, #0c2348 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <motion.div animate={{ scale: [1, 1.35, 1], opacity: [0.08, 0.2, 0.08] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(56,139,253,0.2) 0%, transparent 65%)" }} />
        <motion.div animate={{ x: ["-5%", "105%"], opacity: [0, 0.3, 0.3, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear", times: [0, 0.05, 0.95, 1] }}
          className="absolute top-1/4 pointer-events-none">
          <Plane className="w-6 h-6 text-sky-400" style={{ transform: "rotate(-10deg)" }} />
        </motion.div>
        {[...Array(8)].map((_, i) => (
          <Dot key={i} x={`${8 + i * 12}%`} y={`${15 + (i % 4) * 22}%`} size={i % 3 === 0 ? 4 : 2.5} delay={i * 0.5} />
        ))}

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="text-center mb-20">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/12 rounded-full text-[11px] font-black text-sky-300/80 uppercase tracking-[0.2em] mb-6">
                ✈️ Journey to Europe
              </motion.div>
              <motion.h2 variants={fadeUp}
                className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
                Dari Indonesia<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400">ke Eropa</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/45 max-w-sm mx-auto">
                4 langkah mudah, transparan, didampingi penuh
              </motion.p>
            </div>
          </Rev>

          <div className="relative">
            {/* Timeline line desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ background: "linear-gradient(to bottom, transparent, rgba(56,139,253,0.3) 15%, rgba(56,139,253,0.3) 85%, transparent)" }} />

            <div className="space-y-8 lg:space-y-0">
              {[
                { step: "01", icon: "📋", title: "Daftar & Konsultasi", sub: "GRATIS", desc: "Isi formulir online, lalu tim kami hubungi untuk konsultasi jalur karir terbaik sesuai profil kamu. Tidak ada biaya apapun.", detail: "Jakarta → Proses", color: "from-sky-500 to-blue-600", side: "left" },
                { step: "02", icon: "🎓", title: "Pelatihan Intensif", sub: "7 MINGGU", desc: "Pelatihan Bahasa Inggris intensif, keterampilan kerja, dan pembekalan budaya negara tujuan bersama trainer profesional.", detail: "Indonesia · 7 Minggu", color: "from-indigo-500 to-violet-600", side: "right" },
                { step: "03", icon: "🪪", title: "Seleksi & Dokumen", sub: "LEGAL P3MI", desc: "Proses seleksi bersama perusahaan Eropa, pengurusan dokumen perjalanan, visa kerja, dan verifikasi legalitas P3MI.", detail: "Verified · P3MI", color: "from-violet-500 to-purple-600", side: "left" },
                { step: "04", icon: "✈️", title: "Berangkat ke Eropa!", sub: "11+ NEGARA", desc: "Terbang dengan semua dokumen lengkap, asuransi kerja, dan dukungan penuh dari tim Tenhal bahkan setelah tiba di sana.", detail: "Europe · Arrival", color: "from-teal-500 to-emerald-600", side: "right" },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: item.side === "left" ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="lg:grid lg:grid-cols-2 lg:gap-12 items-center mb-8 lg:mb-0">
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <motion.div whileHover={{ y: -6, scale: 1.01 }}
                      className="group relative bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-sky-400/30 rounded-3xl p-8 transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at 30% 30%, rgba(56,139,253,0.1) 0%, transparent 70%)" }} />
                      <div className="flex items-start gap-5">
                        <motion.div animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7 }}
                          className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-xl`}>
                          {item.icon}
                        </motion.div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-black text-white/25 tracking-[0.2em]">{item.step}</span>
                            <span className="text-[10px] font-black text-sky-400/80 tracking-widest uppercase">{item.sub}</span>
                          </div>
                          <h3 className="text-xl font-black text-white mb-3 group-hover:text-sky-200 transition-colors">{item.title}</h3>
                          <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">{item.desc}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                        <Plane className="w-3.5 h-3.5 text-sky-400/60" />
                        <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{item.detail}</span>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${item.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-3xl`} />
                    </motion.div>
                  </div>
                  <div className={`hidden lg:flex justify-center items-center ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                    <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.3 }}
                      className={`relative w-12 h-12 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center shadow-xl text-white font-black text-sm z-10`}>
                      {item.step}
                      <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.color}`} />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {wa && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.6 }}
              className="mt-16 flex justify-center">
              <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(56,139,253,0.5)" }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-9 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-2xl shadow-blue-900/50">
                <MessageCircle className="w-4 h-4" />
                Mulai Perjalananmu — Gratis!
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.a>
            </motion.div>
          )}
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section className="py-28 sm:py-36 bg-[#f7f9fc] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] pointer-events-none opacity-60"
          style={{ background: "radial-gradient(ellipse at 0% 100%, #dbeafe 0%, transparent 60%)" }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Rev>
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-5">
                Tentang Kami
              </motion.div>
              <motion.h2 variants={fadeUp}
                className="text-4xl sm:text-5xl font-black text-[#0a1628] leading-[1.05] tracking-tight mb-6">
                Mitra Karir Global<br />yang Kamu Butuhkan
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500 leading-relaxed mb-8 text-base max-w-md">
                Kami adalah TenHal Bekerja Bersama — mendampingi tenaga kerja dan mahasiswa magang Indonesia meraih karir di Eropa dengan standar tertinggi.
              </motion.p>
              <motion.div variants={stag} className="grid grid-cols-2 gap-3 mb-10">
                {[
                  { text: "Legal & Terpercaya", icon: "🏛️" },
                  { text: "Pelatihan Lengkap", icon: "🎓" },
                  { text: "Pendampingan Penuh", icon: "🤝" },
                  { text: "Jaringan 11 Negara", icon: "🌍" },
                ].map(item => (
                  <motion.div key={item.text} variants={fadeUp} whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-default">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-bold text-slate-700">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/tentang-kami"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#0a1628] text-white font-bold rounded-2xl text-sm hover:bg-[#1a3c6e] transition-colors shadow-xl shadow-slate-900/20">
                  Tentang Tenhal <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </Rev>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="relative rounded-3xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, #071530 0%, #0c2348 50%, #1a3c6e 100%)" }}>
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="p-8">
                  <div className="text-[11px] font-black text-sky-300/60 uppercase tracking-[0.2em] mb-5">Negara Tujuan Kami</div>
                  <div className="grid grid-cols-3 gap-3">
                    {(countries.length > 0 ? countries.slice(0, 9) : [
                      { id: 1, name: "Hungaria" }, { id: 2, name: "Polandia" }, { id: 3, name: "Austria" },
                      { id: 4, name: "Ceko" }, { id: 5, name: "Slovakia" }, { id: 6, name: "Turki" },
                      { id: 7, name: "Jerman" }, { id: 8, name: "Belanda" }, { id: 9, name: "Romania" },
                    ] as Country[]).map((c, i) => (
                      <motion.div key={c.id}
                        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                        whileHover={{ scale: 1.08, y: -3 }}
                        className="flex flex-col items-center gap-1.5 bg-white/8 hover:bg-white/15 rounded-2xl p-3.5 transition-all cursor-default group">
                        {c.flag_url
                          ? <img src={img(c.flag_url) || ""} alt={c.name} className="h-8 rounded-md shadow-md group-hover:scale-110 transition-transform" />
                          : <span className="text-3xl leading-none">{getFlag(c)}</span>}
                        <span className="text-[10px] text-white/70 font-bold text-center leading-tight">{c.name}</span>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.7 }}
                    className="mt-5 flex items-center gap-3 bg-white/8 rounded-2xl p-4 border border-white/10">
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="w-9 h-9 bg-sky-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Globe2 className="w-5 h-5 text-sky-400" />
                    </motion.div>
                    <div>
                      <div className="text-sm font-black text-white">11+ Negara Tujuan</div>
                      <div className="text-[11px] text-white/50">& terus berkembang setiap tahun</div>
                    </div>
                    <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="ml-auto">
                      <ArrowRight className="w-4 h-4 text-sky-400/50" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ SEKTOR ══ */}
      <section className="py-28 sm:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
              <div>
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">
                  Bidang Kerja
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#0a1628] tracking-tight">
                  Sektor Industri
                </motion.h2>
              </div>
              <motion.p variants={fadeUp} className="text-slate-400 text-base max-w-xs">
                Pilih sektor yang paling sesuai dengan keahlianmu
              </motion.p>
            </div>
          </Rev>
        </div>
        {displaySectors.length > 6 ? (
          <div className="space-y-4">
            <Marquee speed={displaySectors.length * 5}>
              {displaySectors.map((s, i) => (
                <Link key={i} href={`/layanan/sektor/${encodeURIComponent(s)}`}
                  className="flex-shrink-0 group flex items-center gap-3 px-6 py-4 bg-[#f7f9fc] hover:bg-gradient-to-r hover:from-[#071530] hover:to-[#1a3c6e] rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-xl transition-all duration-300 min-w-[170px]">
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{sectorIcon(s)}</span>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-white transition-colors whitespace-nowrap">{s}</span>
                </Link>
              ))}
            </Marquee>
            <Marquee speed={displaySectors.length * 6} reverse>
              {displaySectors.map((s, i) => (
                <Link key={i} href={`/layanan/sektor/${encodeURIComponent(s)}`}
                  className="flex-shrink-0 group flex items-center gap-3 px-6 py-4 bg-white hover:bg-gradient-to-r hover:from-[#071530] hover:to-[#1a3c6e] rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-300 min-w-[170px] shadow-sm">
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{sectorIcon(s)}</span>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-white transition-colors whitespace-nowrap">{s}</span>
                </Link>
              ))}
            </Marquee>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {displaySectors.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -6, scale: 1.03 }}>
                  <Link href={`/layanan/sektor/${encodeURIComponent(s)}`}
                    className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-100 bg-white hover:bg-gradient-to-br hover:from-[#071530] hover:to-[#1a3c6e] hover:border-transparent hover:shadow-2xl transition-all duration-300 text-center">
                    <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{sectorIcon(s)}</span>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-white transition-colors">{s}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ══ JOBS ══ */}
      {jobs.length > 0 && (
        <section className="py-28 sm:py-32 bg-[#f7f9fc] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <Rev>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <motion.div variants={fadeUp}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">
                    Lowongan
                  </motion.div>
                  <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#0a1628] tracking-tight">Kerja di Eropa</motion.h2>
                </div>
                <motion.div variants={fadeUp} whileHover={{ x: 4 }}>
                  <Link href="/layanan/lowongan" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-[#0a1628] hover:text-blue-600 transition-colors">
                    Semua <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map(job => (
                  <motion.div key={job.id} variants={fadeUp} whileHover={{ y: -8 }}>
                    <Link href={job.type === "internship" ? `/layanan/magang/${job.slug}` : `/layanan/lowongan/${job.slug}`}
                      className="group block bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/70 hover:border-blue-100 transition-all duration-300 h-full">
                      {job.thumbnail_url ? (
                        <div className="h-48 bg-slate-100 overflow-hidden">
                          <img src={img(job.thumbnail_url) || ""} alt={job.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                      ) : (
                        <div className="h-32 bg-gradient-to-br from-[#071530] to-[#1a3c6e] flex items-center justify-center">
                          <Building2 className="w-10 h-10 text-white/20" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${job.type === "internship" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
                            {job.type === "internship" ? "✈️ Magang" : "💼 Full Time"}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1.5">
                            {job.country?.flag_url
                              ? <img src={img(job.country.flag_url) || ""} alt="" className="h-4 rounded-sm" />
                              : <span>{EU_FLAGS[job.country?.name || ""] || "🌍"}</span>}
                            {job.country?.name}
                          </span>
                        </div>
                        <h3 className="font-black text-[#0a1628] group-hover:text-blue-700 transition-colors text-base mb-1 line-clamp-2">{job.title}</h3>
                        <p className="text-xs text-slate-400 mb-4">{job.sector} · {job.city}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          {job.salary ? <span className="font-black text-[#0a1628] text-sm">{job.salary_currency} {job.salary}</span> : <span className="text-xs text-slate-400">Salary TBD</span>}
                          <span className="text-xs font-bold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Lihat <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <motion.div variants={fadeUp} className="mt-10 text-center md:hidden">
                <Link href="/layanan/lowongan" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0a1628] text-white text-sm font-bold rounded-2xl">
                  Semua Lowongan <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </Rev>
          </div>
        </section>
      )}

      {/* ══ COUNTRIES ══ */}
      {countries.length > 0 && (
        <section className="py-24 sm:py-28 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-12">
            <Rev>
              <div className="text-center">
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">
                  Destinasi
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#0a1628] tracking-tight">Negara Tujuan</motion.h2>
              </div>
            </Rev>
          </div>
          <div className="space-y-4">
            <Marquee speed={25}>
              {countries.map(c => (
                <div key={c.id} className="flex-shrink-0 group flex flex-col items-center gap-2 px-6 py-5 bg-[#f7f9fc] border border-slate-100 rounded-2xl min-w-[120px] hover:bg-gradient-to-b hover:from-[#071530] hover:to-[#1a3c6e] hover:border-transparent hover:shadow-xl transition-all duration-300 cursor-default">
                  {c.flag_url ? <img src={img(c.flag_url) || ""} alt={c.name} className="h-9 rounded-lg shadow-md group-hover:scale-110 transition-transform" /> : <span className="text-4xl leading-none">{getFlag(c)}</span>}
                  <span className="text-xs font-bold text-slate-700 group-hover:text-white transition-colors whitespace-nowrap">{c.name}</span>
                </div>
              ))}
            </Marquee>
            <Marquee speed={30} reverse>
              {[...countries].reverse().map(c => (
                <div key={c.id} className="flex-shrink-0 group flex flex-col items-center gap-2 px-6 py-5 bg-white border border-slate-100 rounded-2xl min-w-[120px] shadow-sm hover:bg-gradient-to-b hover:from-[#071530] hover:to-[#1a3c6e] hover:border-transparent hover:shadow-xl transition-all duration-300 cursor-default">
                  {c.flag_url ? <img src={img(c.flag_url) || ""} alt={c.name} className="h-9 rounded-lg shadow-md group-hover:scale-110 transition-transform" /> : <span className="text-4xl leading-none">{getFlag(c)}</span>}
                  <span className="text-xs font-bold text-slate-600 group-hover:text-white transition-colors whitespace-nowrap">{c.name}</span>
                </div>
              ))}
            </Marquee>
          </div>
        </section>
      )}

      {/* ══ FAQ ══ */}
      {faqs.length > 0 && (
        <section className="py-28 sm:py-32 bg-[#f7f9fc] relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] pointer-events-none opacity-50"
            style={{ background: "radial-gradient(circle, #dbeafe 0%, transparent 65%)" }} />
          <div className="relative max-w-3xl mx-auto px-5 sm:px-8">
            <Rev>
              <div className="text-center mb-14">
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">
                  FAQ
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-[#0a1628] tracking-tight mb-3">Ada Pertanyaan?</motion.h2>
                <motion.p variants={fadeUp} className="text-slate-500">Jawaban atas pertanyaan yang sering kami terima</motion.p>
              </div>
              <motion.div variants={stag} className="space-y-2.5">
                {faqs.map(([key, item]) => (
                  <motion.div key={key} variants={fadeUp} whileHover={{ x: openFaq === key ? 0 : 3 }}>
                    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${openFaq === key ? "border-blue-200 shadow-lg shadow-blue-50" : "border-slate-100"}`}>
                      <button onClick={() => setOpenFaq(openFaq === key ? null : key)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50/60 transition group">
                        <span className={`font-bold text-sm sm:text-base pr-4 ${openFaq === key ? "text-blue-700" : "text-[#0a1628]"}`}>{item.title}</span>
                        <motion.div animate={{ rotate: openFaq === key ? 45 : 0 }} transition={{ duration: 0.2 }}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${openFaq === key ? "bg-blue-600" : "bg-slate-100 group-hover:bg-blue-50"}`}>
                          <Plus className={`w-4 h-4 ${openFaq === key ? "text-white" : "text-slate-500"}`} />
                        </motion.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {openFaq === key && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
                            <div className="px-6 pb-5 pt-3 text-sm text-slate-500 leading-relaxed border-t border-blue-50">{item.content}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </Rev>
          </div>
        </section>
      )}

      {/* ══ CONTACT + MAP ══ */}
      <section className="py-28 sm:py-36 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #020b1a 0%, #071530 35%, #0c2348 70%, #0f3060 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full border border-white/[0.04] pointer-events-none" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] rounded-full border border-white/[0.04] pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.35, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(56,139,253,0.3) 0%, transparent 65%)" }} />
        <AirplanePath />
        {[...Array(10)].map((_, i) => (
          <Dot key={i} x={`${3 + i * 10}%`} y={`${8 + (i % 5) * 18}%`} size={i % 3 === 0 ? 4 : 2} delay={i * 0.45} />
        ))}

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/12 rounded-full text-[11px] font-black text-sky-300/80 uppercase tracking-[0.2em] mb-6">
              🛫 Siap Berangkat?
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.08 }}
              className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight leading-tight pb-2">
              Wujudkan Karir<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400 inline-block">Globalmu Sekarang</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-white/40 max-w-md mx-auto text-lg">
              Tim kami siap 7 hari seminggu. Konsultasi gratis, no commitment.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:col-span-3 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: "📞", label: "Telepon", val: settings["phone"] || "+62 821-2458-5755", href: `tel:${settings["phone"] || ""}`, grad: "from-sky-500 to-blue-600" },
                  { icon: "✉️", label: "Email", val: settings["email"] || "info@tenhalbekerja.com", href: `mailto:${settings["email"] || ""}`, grad: "from-indigo-500 to-violet-600" },
                  { icon: "📍", label: "Alamat", val: settings["address"] || "Mampang Square, B5, Jakarta", href: "map-anchor", grad: "from-teal-500 to-emerald-600" },
                ].map((c, i) => (
                  <motion.a key={i}
                    href={c.href === "map-anchor" ? "#" : c.href}
                    onClick={c.href === "map-anchor" ? (e) => { e.preventDefault(); document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "center" }) } : undefined}
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group flex flex-col gap-3 p-5 bg-white/[0.06] hover:bg-white/[0.11] border border-white/10 hover:border-sky-400/25 rounded-2xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(56,139,253,0.12) 0%, transparent 70%)" }} />
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3 + i, repeat: Infinity, delay: i }}
                      className={`w-11 h-11 bg-gradient-to-br ${c.grad} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                      {c.icon}
                    </motion.div>
                    <div>
                      <div className="text-[10px] font-black text-white/35 uppercase tracking-[0.15em] mb-1">{c.label}</div>
                      <div className="text-xs text-white/65 group-hover:text-white/90 font-medium leading-relaxed break-all transition-colors">{c.val}</div>
                    </div>
                    <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.grad} scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left`} />
                  </motion.a>
                ))}
              </div>

              <motion.div id="map" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="bg-white/[0.06] px-4 py-3 flex items-center gap-2.5 border-b border-white/[0.07]">
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>📍</motion.span>
                  <span className="text-xs font-bold text-white/50 tracking-wide">Lokasi Kantor — Tenhal Bekerja Bersama</span>
                </div>
                <div dangerouslySetInnerHTML={{
                  __html: (settings["google_maps_embed"] ||
                    `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0953199066107!2d106.82364707486764!3d-6.251169893737267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f300078feaab%3A0x28564b3e4b0d8a63!2sTenhal%20Bekerja%20Bersama!5e0!3m2!1sid!2sid!4v1773208885485!5m2!1sid!2sid" style="border:0;display:block;width:100%;height:280px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`)
                    .replace(/width="[^"]*"/, 'width="100%"')
                    .replace(/height="[^"]*"/, 'height="280"')
                    .replace(/style="[^"]*"/, 'style="border:0;display:block;width:100%;height:280px;"')
                }} />
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-2">
              <div className="bg-white rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <div className="h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600" />
                <div className="p-7 sm:p-8">
                  <div className="flex items-center gap-3 mb-7">
                    <motion.div animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 3.5, repeat: Infinity }}
                      className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                      🛫
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-black text-[#0a1628]">Mulai Konsultasi</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Gratis · Cepat · No commitment</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                      { emoji: "⚡", val: "< 1 jam", sub: "Respon WA" },
                      { emoji: "🏛️", val: "P3MI", sub: "Legal resmi" },
                      { emoji: "⭐", val: "4.9/5", sub: "2400+ alumni" },
                    ].map((t, i) => (
                      <motion.div key={i} whileHover={{ y: -3 }}
                        className="flex flex-col items-center text-center p-2.5 bg-slate-50 rounded-xl border border-slate-100 transition-all">
                        <span className="text-lg mb-1">{t.emoji}</span>
                        <div className="text-xs font-black text-[#0a1628]">{t.val}</div>
                        <div className="text-[9px] text-slate-400 font-medium">{t.sub}</div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="w-full h-px bg-slate-100 mb-5" />
                  <div className="space-y-3">
                    {wa && (
                      <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(34,197,94,0.35)" }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 w-full px-5 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-2xl transition-all">
                        <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-lg flex-shrink-0">💬</motion.span>
                        <div className="text-left flex-1">
                          <div className="text-sm font-black">Chat WhatsApp</div>
                          <div className="text-xs text-white/70">Respon &lt; 1 jam</div>
                        </div>
                        <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.3, repeat: Infinity }}>
                          <ArrowRight className="w-4 h-4 opacity-75" />
                        </motion.span>
                      </motion.a>
                    )}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Link href="/hubungi-kami"
                        className="flex items-center gap-3 w-full px-5 py-4 bg-[#071530] hover:bg-[#0f2347] text-white font-bold rounded-2xl transition-colors">
                        <span className="text-lg flex-shrink-0">✉️</span>
                        <div className="text-left flex-1">
                          <div className="text-sm font-black">Kirim Pesan</div>
                          <div className="text-xs text-white/55">Via formulir kontak</div>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-40" />
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Link href="/layanan/lowongan"
                        className="flex items-center gap-3 w-full px-5 py-4 bg-slate-50 hover:bg-blue-50 text-[#0a1628] font-bold rounded-2xl transition-colors border border-slate-100 hover:border-blue-100">
                        <span className="text-lg flex-shrink-0">🌍</span>
                        <div className="text-left flex-1">
                          <div className="text-sm font-black">Cari Lowongan</div>
                          <div className="text-xs text-slate-400">Lihat posisi tersedia</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-400 opacity-60" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating WA */}
      {wa && (
        <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: "spring" }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-2xl shadow-green-900/40 flex items-center justify-center text-2xl overflow-hidden">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>💬</motion.div>
          <motion.div animate={{ scale: [1, 1.9, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-green-500" />
        </motion.a>
      )}

    </div>
  )
}