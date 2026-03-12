"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import { ArrowRight, MessageCircle, CheckCircle2, ChevronDown, X, Loader2, GraduationCap } from "lucide-react"

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
      animate={{ y: [0, -18, 0], opacity: [0.1, 0.5, 0.1] }}
      transition={{ duration: 3.5 + delay, repeat: Infinity, delay, ease: "easeInOut" }} />
  )
}

const CLASS_OPTIONS = [
  { value: "regular", label: "Regular", desc: "Cocok untuk pemula, belajar dari dasar", icon: "📚", price: "Terjangkau" },
  { value: "super_intensive", label: "Super Intensif", desc: "Program cepat 7 minggu full schedule", icon: "⚡", price: "Populer" },
  { value: "conversation_interview", label: "Conversation & Interview", desc: "Fokus percakapan & persiapan interview kerja", icon: "🎯", price: "Premium" },
]

const BENEFITS = [
  { icon: "🏛️", title: "Instruktur Bersertifikat", desc: "Diajarkan oleh pengajar profesional berpengalaman di bidang bahasa dan dunia kerja internasional" },
  { icon: "📋", title: "Materi Terstruktur", desc: "Kurikulum dirancang khusus untuk persiapan bekerja di luar negeri, bukan sekadar kursus biasa" },
  { icon: "🎯", title: "Fokus Praktikal", desc: "Latihan percakapan, simulasi interview, dan pembekalan budaya negara tujuan" },
  { icon: "📜", title: "Sertifikat Resmi", desc: "Dapatkan sertifikat pelatihan yang diakui sebagai bukti kompetensi bahasa" },
  { icon: "🤝", title: "Koneksi Langsung", desc: "Peserta prioritas untuk penempatan kerja melalui jaringan mitra Tenhal di Eropa" },
  { icon: "💬", title: "Support Setelah Lulus", desc: "Tim Tenhal terus mendampingi proses dokumen dan keberangkatan setelah pelatihan selesai" },
]

const STEPS = [
  { n: "01", icon: "📝", title: "Daftar Online", desc: "Isi formulir pendaftaran, pilih jenis kelas sesuai kebutuhan dan jadwal kamu" },
  { n: "02", icon: "📞", title: "Konfirmasi Tim", desc: "Tim Tenhal akan menghubungi kamu dalam 1x24 jam untuk konfirmasi dan info lebih lanjut" },
  { n: "03", icon: "🎓", title: "Mulai Belajar", desc: "Ikuti program pelatihan intensif bersama instruktur berpengalaman" },
  { n: "04", icon: "✈️", title: "Siap ke Eropa!", desc: "Lulus pelatihan, kantongi sertifikat, dan prioritas penempatan kerja bersama Tenhal" },
]

interface FormState {
  first_name: string; last_name: string; email: string; phone: string
  age: string; address: string; city: string; district: string
  postal_code: string; class_type: string; job_interest: string
}

const EMPTY: FormState = {
  first_name: "", last_name: "", email: "", phone: "",
  age: "", address: "", city: "", district: "",
  postal_code: "", class_type: "", job_interest: "",
}

interface Props {
  settings: Record<string, string>
  pageContent: Record<string, { title: string; content: string }>
}

export default function PelatihanBahasaClient({ settings, pageContent }: Props) {
  const wa = settings["whatsapp"] || ""
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [selectedClass, setSelectedClass] = useState("")

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOp = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const hero = pageContent["pelatihan_bahasa_hero"] ?? {}

  function set(k: keyof FormState, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function openForm(classType = "") {
    setForm({ ...EMPTY, class_type: classType })
    setSelectedClass(classType)
    setSuccess(false)
    setError("")
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.class_type) { setError("Pilih jenis kelas terlebih dahulu"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/public/language-class/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: Number(form.age) || 0 }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.message || "Gagal mengirim pendaftaran")
      }
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ══ */}
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

        {/* animated graduation cap */}
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[8%] text-6xl opacity-[0.07] pointer-events-none select-none hidden lg:block">
          🎓
        </motion.div>

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
              Program Unggulan Tenhal
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-4">
              Pelatihan
              <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300">
                  Bahasa
                </span>
                <motion.span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
              </span>
              <br />
              <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.3)", color: "transparent" }}>Intensif</span>
            </motion.h1>

            <motion.div variants={fadeUp} className="w-16 h-1 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 mx-auto mt-6 mb-6" />

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/55 leading-relaxed mb-10 max-w-xl mx-auto">
              {hero.content || "Program pelatihan Bahasa Inggris intensif 7 minggu dirancang khusus untuk persiapan bekerja di Eropa — dari nol hingga siap interview."}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center mb-16">
              <motion.button onClick={() => openForm()}
                whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(56,139,253,0.5)" }} whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-xl shadow-blue-900/40">
                Daftar Sekarang — Gratis!
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.3, repeat: Infinity }}>
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.button>
              {wa && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-4 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-2xl text-sm transition-colors">
                    <MessageCircle className="w-4 h-4" /> Tanya via WA
                  </a>
                </motion.div>
              )}
            </motion.div>

            {/* quick stats */}
            <motion.div variants={fadeUp} className="flex items-center justify-center">
              {[{ n: "7 Minggu", l: "Program" }, { n: "3 Kelas", l: "Pilihan" }, { n: "100%", l: "Praktikal" }].map((s, i) => (
                <div key={s.l} className="flex items-center">
                  <div className="text-center px-7">
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{s.n}</div>
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

      {/* ══ JENIS KELAS ══ */}
      <section className="py-28 sm:py-36 bg-white relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle,#e8f4ff 0%,transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="text-center mb-14">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">
                Pilih Kelasmu
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a1628] tracking-tight leading-tight mb-3">
                3 Jenis Kelas<br />Tersedia
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500 max-w-sm mx-auto">
                Pilih program yang paling sesuai dengan kebutuhanmu
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {CLASS_OPTIONS.map((cls, i) => (
                <motion.div key={cls.value} variants={fadeUp}
                  whileHover={{ y: -10, boxShadow: "0 30px 80px rgba(0,0,0,0.1)" }}
                  className="group relative bg-white border border-slate-100 rounded-3xl p-7 sm:p-8 overflow-hidden cursor-pointer transition-all duration-300"
                  onClick={() => openForm(cls.value)}>
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-blue-500 transition-all duration-500 rounded-t-3xl" />
                  {cls.price === "Populer" && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                      Populer
                    </div>
                  )}
                  <motion.div whileHover={{ rotate: 15, scale: 1.15 }} className="text-4xl mb-5 inline-block">{cls.icon}</motion.div>
                  <h3 className="font-black text-[#0a1628] text-xl mb-2 group-hover:text-blue-700 transition-colors">{cls.label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">{cls.desc}</p>
                  <motion.div whileHover={{ x: 4 }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:text-blue-700">
                    Daftar Kelas Ini <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* ══ KEUNGGULAN ══ */}
      <section className="py-28 sm:py-36 bg-[#f7f9fc] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] pointer-events-none opacity-40"
          style={{ background: "radial-gradient(ellipse at 0% 100%,#dbeafe 0%,transparent 60%)" }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              <div className="lg:col-span-4">
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-5">
                  Keunggulan
                </motion.div>
                <motion.h2 variants={fadeUp}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a1628] leading-[1.0] mb-6 tracking-tight">
                  Kenapa<br />Pelatihan<br />Tenhal?
                </motion.h2>
                <motion.p variants={fadeUp} className="text-slate-500 leading-relaxed text-base mb-8">
                  Bukan sekadar kursus bahasa biasa — program kami dirancang spesifik untuk persiapan kerja internasional.
                </motion.p>
                <motion.button variants={fadeUp} onClick={() => openForm()}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#0a1628] text-white font-bold rounded-2xl text-sm hover:bg-[#1a3c6e] transition-colors shadow-xl shadow-slate-900/20">
                  Daftar Sekarang <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BENEFITS.map((b, i) => (
                  <motion.div key={i} variants={fadeUp}
                    whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(0,0,0,0.07)" }}
                    className="group bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 hover:border-blue-100 transition-all duration-300 overflow-hidden relative">
                    <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-slate-100 group-hover:bg-gradient-to-b group-hover:from-sky-400 group-hover:to-blue-600 transition-all duration-400 rounded-l-2xl" />
                    <motion.div whileHover={{ rotate: 12, scale: 1.15 }} className="text-2xl mb-3 inline-block">{b.icon}</motion.div>
                    <h3 className="font-black text-[#0a1628] text-sm sm:text-base mb-1.5 group-hover:text-blue-700 transition-colors">{b.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ══ ALUR PENDAFTARAN ══ */}
      <section className="py-28 sm:py-36 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg,#020b1a 0%,#071530 40%,#0c2348 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.2, 0.08] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(56,139,253,0.2) 0%,transparent 65%)" }} />
        {[...Array(8)].map((_, i) => (
          <Dot key={i} x={`${8 + i * 12}%`} y={`${12 + (i % 4) * 22}%`} size={i % 3 === 0 ? 4 : 2.5} delay={i * 0.5} />
        ))}

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="text-center mb-16 sm:mb-20">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.07] border border-white/10 rounded-full text-[11px] font-black text-sky-300/80 uppercase tracking-[0.2em] mb-6">
                📋 Cara Daftar
              </motion.div>
              <motion.h2 variants={fadeUp}
                className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Alur<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400">Pendaftaran</span>
              </motion.h2>
            </div>
          </Rev>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className="group relative bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-sky-400/30 rounded-3xl p-7 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 30% 30%,rgba(56,139,253,0.1) 0%,transparent 70%)" }} />
                {/* connector line for desktop */}
                {i < 3 && <div className="hidden lg:block absolute top-10 -right-2.5 w-5 h-px bg-white/10 z-10" />}
                <div className="text-[10px] font-black text-sky-400/60 tracking-[0.2em] uppercase mb-3">{step.n}</div>
                <motion.div whileHover={{ rotate: 10, scale: 1.15 }} className="text-3xl mb-4 inline-block">{step.icon}</motion.div>
                <h3 className="font-black text-white text-base mb-2 group-hover:text-sky-200 transition-colors">{step.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed group-hover:text-white/65 transition-colors">{step.desc}</p>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.5 }}
            className="mt-14 flex justify-center">
            <motion.button onClick={() => openForm()}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(56,139,253,0.5)" }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-2xl shadow-blue-900/50">
              <GraduationCap className="w-4 h-4" />
              Mulai Pendaftaran Sekarang
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute -top-32 right-0 w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle,#e8f4ff 0%,transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <Rev>
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-5">
              Masih ada pertanyaan?
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-[#0a1628] mb-4 tracking-tight">
              Konsultasi Gratis<br />via WhatsApp
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 mb-8 max-w-sm mx-auto">
              Tim Tenhal siap menjawab pertanyaanmu seputar program pelatihan bahasa — response dalam 1 jam!
            </motion.p>
            {wa && (
              <motion.div variants={fadeUp}>
                <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.04, boxShadow: "0 12px 40px rgba(34,197,94,0.3)" }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-black rounded-2xl text-sm shadow-xl">
                  <MessageCircle className="w-4 h-4" />
                  Chat WhatsApp Sekarang
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.3, repeat: Infinity }}>
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </motion.a>
              </motion.div>
            )}
          </Rev>
        </div>
      </section>

      {/* ══ MODAL FORM ══ */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => !loading && setShowForm(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">

              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
                {/* header */}
                <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
                      🎓
                    </div>
                    <div>
                      <h3 className="font-black text-[#0a1628] text-base">Daftar Pelatihan Bahasa</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Isi data dengan benar, tim kami akan menghubungimu</p>
                    </div>
                  </div>
                  <button onClick={() => !loading && setShowForm(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-7">
                  {success ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="py-12 text-center">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
                        className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      </motion.div>
                      <h4 className="text-xl font-black text-[#0a1628] mb-2">Pendaftaran Berhasil! 🎉</h4>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
                        Tim Tenhal akan menghubungi kamu dalam 1×24 jam untuk konfirmasi dan info selanjutnya.
                      </p>
                      {wa && (
                        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-600 transition">
                          <MessageCircle className="w-4 h-4" /> Chat via WhatsApp
                        </a>
                      )}
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* pilih kelas */}
                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-3">
                          Jenis Kelas <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {CLASS_OPTIONS.map(cls => (
                            <button key={cls.value} type="button"
                              onClick={() => set("class_type", cls.value)}
                              className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${form.class_type === cls.value
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"}`}>
                              {cls.price === "Populer" && (
                                <span className="absolute top-2 right-2 text-[9px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-full">POPULER</span>
                              )}
                              <div className="text-xl mb-1.5">{cls.icon}</div>
                              <div className="text-xs font-black text-[#0a1628]">{cls.label}</div>
                              {form.class_type === cls.value && (
                                <CheckCircle2 className="absolute bottom-2 right-2 w-4 h-4 text-blue-500" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* nama */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { k: "first_name" as const, label: "Nama Depan", req: true, placeholder: "Budi" },
                          { k: "last_name" as const, label: "Nama Belakang", req: false, placeholder: "Santoso" },
                        ].map(f => (
                          <div key={f.k}>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">
                              {f.label} {f.req && <span className="text-red-400">*</span>}
                            </label>
                            <input type="text" placeholder={f.placeholder} value={form[f.k]}
                              onChange={e => set(f.k, e.target.value)}
                              required={f.req}
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition" />
                          </div>
                        ))}
                      </div>

                      {/* kontak */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Email <span className="text-red-400">*</span></label>
                          <input type="email" placeholder="budi@email.com" value={form.email}
                            onChange={e => set("email", e.target.value)} required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">No. HP / WhatsApp <span className="text-red-400">*</span></label>
                          <input type="tel" placeholder="081234567890" value={form.phone}
                            onChange={e => set("phone", e.target.value)} required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition" />
                        </div>
                      </div>

                      {/* umur & minat */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Usia <span className="text-red-400">*</span></label>
                          <input type="number" placeholder="25" min="17" max="60" value={form.age}
                            onChange={e => set("age", e.target.value)} required
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Minat Pekerjaan</label>
                          <input type="text" placeholder="Contoh: Teknisi, Warehouse..." value={form.job_interest}
                            onChange={e => set("job_interest", e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition" />
                        </div>
                      </div>

                      {/* alamat */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Alamat Lengkap <span className="text-red-400">*</span></label>
                        <input type="text" placeholder="Jl. Contoh No.1" value={form.address}
                          onChange={e => set("address", e.target.value)} required
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { k: "city" as const, label: "Kota", placeholder: "Jakarta", req: true },
                          { k: "district" as const, label: "Kecamatan", placeholder: "Mampang", req: false },
                          { k: "postal_code" as const, label: "Kode Pos", placeholder: "12345", req: false },
                        ].map(f => (
                          <div key={f.k}>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">
                              {f.label} {f.req && <span className="text-red-400">*</span>}
                            </label>
                            <input type="text" placeholder={f.placeholder} value={form[f.k]}
                              onChange={e => set(f.k, e.target.value)} required={f.req}
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition" />
                          </div>
                        ))}
                      </div>

                      {error && (
                        <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                          {error}
                        </motion.p>
                      )}
                    </form>
                  )}
                </div>

                {/* footer */}
                {!success && (
                  <div className="px-7 py-5 border-t border-slate-100 flex-shrink-0 flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-400">Pendaftaran gratis, tidak ada biaya apapun</p>
                    <motion.button onClick={handleSubmit} disabled={loading}
                      whileHover={!loading ? { scale: 1.03 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
                      className="inline-flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 transition-all">
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                      ) : (
                        <>Kirim Pendaftaran <ArrowRight className="w-4 h-4" /></>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* floating WA */}
      {wa && (
        <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: "spring" }}
          whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-2xl shadow-green-900/40 flex items-center justify-center text-2xl overflow-hidden">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>💬</motion.div>
          <motion.div animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-green-500" />
        </motion.a>
      )}

    </div>
  )
}