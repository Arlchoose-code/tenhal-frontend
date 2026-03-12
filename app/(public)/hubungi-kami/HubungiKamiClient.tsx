"use client"

import { useRef, useState } from "react"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import type { Variants, TargetAndTransition } from "framer-motion"
import {
  Send, MessageCircle, Mail, Phone, MapPin, Clock,
  ArrowRight, CheckCircle2, Plane, Globe2, Sparkles, HeartHandshake
} from "lucide-react"
import { apiPost } from "@/lib/api"

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

function GridBg({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      opacity,
      backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
      backgroundSize: "70px 70px"
    }} />
  )
}

function GlowOrb({ className, color, animate: anim }: { className: string; color: string; animate?: TargetAndTransition }) {
  return (
    <motion.div className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ background: color }}
      animate={anim ?? { scale: [1, 1.25, 1], opacity: [0.12, 0.28, 0.12] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
  )
}

interface Props { settings: Record<string, string> }

export default function HubungiKamiClient({ settings }: Props) {
  const wa = settings["whatsapp"] || ""
  const email = settings["email"] || "info@tenhal.com"
  const phone = settings["phone"] || wa
  const address = settings["address"] || "Jakarta, Indonesia"
  const officeHours = settings["office_hours"] || "Senin–Jumat, 08.00–17.00 WIB"

  const cleanWa = wa.replace(/^\+/, "")
  const cleanPhone = phone.replace(/^\+/, "")

  const heroRef = useRef(null)
  const formSectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY  = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOp = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", subject: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [focused, setFocused] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name || !form.email || !form.message) {
      setError("Harap lengkapi nama, email, dan pesan.")
      return
    }
    setLoading(true)
    try {
      const res = await apiPost("public/contact", form)
      if (res.success) {
        setSuccess(true)
        setForm({ first_name: "", last_name: "", email: "", subject: "", message: "" })
      } else {
        setError(res.message || "Gagal mengirim pesan. Coba lagi.")
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const contactCards = [
    {
      icon: <MessageCircle className="w-7 h-7" />,
      color: "from-emerald-500 to-teal-600",
      bg: "from-emerald-50 to-teal-50",
      border: "border-emerald-100 hover:border-emerald-300",
      label: "WhatsApp",
      value: cleanWa ? `+${cleanWa}` : "—",
      desc: "Respons cepat, biasanya dalam menit",
      href: cleanWa ? `https://wa.me/${cleanWa}` : undefined,
      cta: "Chat Sekarang",
    },
    {
      icon: <Mail className="w-7 h-7" />,
      color: "from-sky-500 to-blue-600",
      bg: "from-sky-50 to-blue-50",
      border: "border-sky-100 hover:border-sky-300",
      label: "Email",
      value: email,
      desc: "Kami balas dalam 1×24 jam kerja",
      href: `mailto:${email}`,
      cta: "Kirim Email",
    },
    {
      icon: <Phone className="w-7 h-7" />,
      color: "from-indigo-500 to-violet-600",
      bg: "from-indigo-50 to-violet-50",
      border: "border-indigo-100 hover:border-indigo-300",
      label: "Telepon",
      value: cleanPhone ? `+${cleanPhone}` : "—",
      desc: "Jam kerja Senin–Jumat",
      href: cleanPhone ? `tel:+${cleanPhone}` : undefined,
      cta: "Hubungi Kami",
    },
  ]

  const subjectOptions = [
    "Informasi Program Magang",
    "Informasi Lowongan Kerja",
    "Pelatihan Bahasa",
    "Konsultasi Umum",
    "Kemitraan & Kerjasama",
    "Lainnya",
  ]

  return (
    <div className="overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(160deg,#020b1a 0%,#071530 30%,#0c2348 60%,#0f3060 100%)" }}>
        <GridBg />
        <GlowOrb className="top-[-5%] right-[-8%] w-[700px] h-[700px]"
          color="radial-gradient(circle,rgba(56,139,253,0.35) 0%,transparent 70%)" />
        <GlowOrb className="bottom-[5%] left-[-8%] w-[550px] h-[550px]"
          color="radial-gradient(circle,rgba(99,179,237,0.18) 0%,transparent 70%)"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.06, 0.18, 0.06] }} />
        <GlowOrb className="top-[40%] left-[30%] w-[300px] h-[300px]"
          color="radial-gradient(circle,rgba(147,51,234,0.12) 0%,transparent 70%)"
          animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.15, 0.05] }} />

        {/* rotating rings */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/[0.03] pointer-events-none" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.05] pointer-events-none" />

        {[...Array(18)].map((_, i) => (
          <Dot key={i} x={`${3 + i * 5.5}%`} y={`${8 + (i % 7) * 12}%`}
            size={i % 4 === 0 ? 5 : i % 3 === 0 ? 3.5 : 2} delay={i * 0.28} />
        ))}

        <motion.div animate={{ x: ["-5%", "105%"], y: ["65%", "15%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", repeatType: "loop" }}
          className="absolute pointer-events-none opacity-[0.07]">
          <Plane className="w-14 h-14 text-white" style={{ transform: "rotate(-20deg)" }} />
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full block">
            <path d="M0,60 C240,110 480,10 720,70 C960,130 1200,20 1440,70 L1440,120 L0,120 Z" fill="white" />
          </svg>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOp }}
          className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 pt-44 pb-44">
          <motion.div variants={stag} initial="hidden" animate="show" className="max-w-4xl mx-auto text-center">

            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 mb-8 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300 text-xs font-black uppercase tracking-widest">
              <motion.span className="w-2 h-2 rounded-full bg-sky-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }} />
              Tim kami siap membantu kamu
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-5xl sm:text-7xl lg:text-[7rem] font-black text-white leading-[0.9] tracking-tight mb-6">
              Hubungi
              <br />
              <span className="relative inline-block">
                <span style={{ WebkitTextStroke: "2px rgba(147,210,255,0.7)", color: "transparent" }}>Kami</span>
                <motion.span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 rounded-full"
                  initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 1.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/50 leading-relaxed mt-8 mb-12 max-w-2xl mx-auto">
              Punya pertanyaan seputar program kerja di luar negeri atau magang internasional?
              <br className="hidden sm:block" />
              Tim kami siap membantumu dari konsultasi hingga keberangkatan.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center mb-20">
              {cleanWa && (
                <motion.a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(56,139,253,0.6)" }} whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-3 px-9 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-2xl shadow-blue-900/50">
                  <MessageCircle className="w-4 h-4" />
                  Chat WhatsApp
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.3, repeat: Infinity }}>
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </motion.a>
              )}
              <motion.button
                onClick={() => formSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-2xl text-sm transition-colors">
                Kirim Pesan <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* stats */}
            <motion.div variants={fadeUp} className="flex items-center justify-center">
              {[{ n: "1×24 jam", l: "Respons Email" }, { n: "Menit", l: "Respons WA" }, { n: "11+", l: "Negara Tujuan" }].map((s, i) => (
                <div key={s.l} className="flex items-center">
                  <div className="text-center px-8">
                    <div className="text-3xl font-black text-white tracking-tight">{s.n}</div>
                    <div className="text-[11px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{s.l}</div>
                  </div>
                  {i < 2 && <div className="w-px h-10 bg-white/10" />}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════ CONTACT CARDS ══════════ */}
      <section className="bg-white py-24 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#dbeafe 0%,transparent 70%)" }} />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#d1fae5 0%,transparent 70%)" }} />

        <div className="max-w-6xl mx-auto relative">
          <Rev>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-4">
                <Globe2 className="w-3.5 h-3.5" /> Cara Menghubungi Kami
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                Pilih cara yang paling
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600"> mudah</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {contactCards.map((card, i) => (
                <motion.a key={i}
                  href={card.href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`group relative bg-gradient-to-br ${card.bg} rounded-3xl border-2 ${card.border} p-8 shadow-lg hover:shadow-2xl transition-all duration-400 overflow-hidden cursor-pointer block`}>

                  <motion.div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-15 transition-opacity duration-500`} />

                  <div className="relative mb-7">
                    <motion.div
                      animate={{ rotate: [0, 6, -6, 0] }}
                      transition={{ duration: 5 + i * 2, repeat: Infinity, delay: i * 0.8 }}
                      whileHover={{ rotate: 0, scale: 1.15 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-xl`}>
                      {card.icon}
                    </motion.div>
                    <motion.div className={`absolute top-0 left-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color}`}
                      animate={{ scale: [1, 1.6, 2], opacity: [0, 0.12, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }} />
                  </div>

                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">{card.label}</p>
                  <p className="text-slate-800 font-black text-lg mb-1.5 break-all leading-tight">{card.value}</p>
                  <p className="text-slate-400 text-xs mb-5 font-medium">{card.desc}</p>

                  <span className={`inline-flex items-center gap-2 text-sm font-black bg-gradient-to-r ${card.color} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}>
                    {card.cta}
                    <ArrowRight className="w-4 h-4 text-sky-500 group-hover:translate-x-1 transition-transform" />
                  </span>

                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-3xl`} />
                </motion.a>
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* ══════════ FORM + SIDEBAR ══════════ */}
      <section ref={formSectionRef} className="relative py-28 px-5 sm:px-8 overflow-hidden"
        style={{ background: "linear-gradient(150deg,#020b1a 0%,#071530 40%,#0c2348 100%)" }}>
        <GridBg opacity={0.05} />
        <GlowOrb className="top-1/4 right-0 w-[500px] h-[500px]"
          color="radial-gradient(circle,rgba(56,139,253,0.2) 0%,transparent 70%)" />
        <GlowOrb className="bottom-0 left-0 w-[400px] h-[400px]"
          color="radial-gradient(circle,rgba(99,179,237,0.1) 0%,transparent 70%)"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.15, 0.05] }} />

        {/* floating shapes */}
        {[
          { cls: "top-20 left-[10%] w-8 h-8 border-2 border-sky-400/20 rotate-45", d: 0 },
          { cls: "top-40 right-[15%] w-6 h-6 bg-indigo-400/10 rounded-full", d: 2 },
          { cls: "bottom-32 left-[20%] w-10 h-10 border border-white/10 rounded-xl", d: 4 },
          { cls: "bottom-20 right-[25%] w-5 h-5 bg-sky-400/15 rounded-full", d: 1 },
        ].map((s, i) => (
          <motion.div key={i} className={`absolute pointer-events-none ${s.cls}`}
            animate={{ y: [0, -25, 0], x: [0, 12, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 12 + s.d, repeat: Infinity, ease: "easeInOut", delay: s.d }} />
        ))}

        {[...Array(8)].map((_, i) => (
          <Dot key={i} x={`${5 + i * 12}%`} y={`${10 + (i % 4) * 22}%`} size={i % 3 === 0 ? 4 : 2.5} delay={i * 0.5} />
        ))}

        <div className="relative max-w-7xl mx-auto">
          <Rev>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.07] border border-white/10 rounded-full text-[11px] font-black text-sky-300/80 uppercase tracking-[0.2em] mb-5">
                <HeartHandshake className="w-3.5 h-3.5" /> Kirim Pesan Langsung
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Ada yang ingin kamu
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400">tanyakan?</span>
              </h2>
              <p className="text-white/40 mt-4 max-w-lg mx-auto">
                Isi form di bawah — tim kami merespons dalam 1×24 jam kerja.
              </p>
            </motion.div>
          </Rev>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* FORM */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-white/[0.06] backdrop-blur-sm rounded-3xl border border-white/10 p-8 sm:p-10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(56,139,253,0.08) 0%,transparent 60%)" }} />

                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div key="success"
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="flex flex-col items-center justify-center py-16 text-center gap-5">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="relative w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        <motion.div className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                          animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }} />
                      </motion.div>
                      <div>
                        <h3 className="text-3xl font-black text-white mb-2">Pesan Terkirim! 🎉</h3>
                        <p className="text-white/50 max-w-xs">Terima kasih! Tim kami akan membalas dalam 1×24 jam kerja.</p>
                      </div>
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setSuccess(false)}
                        className="mt-2 px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-xl text-sm shadow-xl">
                        Kirim Pesan Lain
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handleSubmit} className="space-y-5 relative">

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(["first_name", "last_name"] as const).map((field) => (
                          <div key={field}>
                            <label className="block text-[11px] font-black text-white/50 uppercase tracking-widest mb-2">
                              {field === "first_name" ? "Nama Depan *" : "Nama Belakang"}
                            </label>
                            <div className="relative">
                              <input type="text" name={field} value={form[field]}
                                onChange={handleChange}
                                onFocus={() => setFocused(field)} onBlur={() => setFocused(null)}
                                placeholder={field === "first_name" ? "Budi" : "Santoso"}
                                className={`w-full px-4 py-3.5 rounded-xl border text-white text-sm font-medium placeholder-white/20 outline-none transition-all duration-200 bg-white/[0.07] ${focused === field ? "border-sky-400/60 bg-white/[0.12] shadow-lg shadow-sky-900/20" : "border-white/10 hover:border-white/20"}`} />
                              {focused === field && (
                                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                                  className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400 to-blue-500 rounded-full origin-left" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {[
                        { name: "email", label: "Email *", type: "email", placeholder: "budi@email.com" },
                      ].map(f => (
                        <div key={f.name}>
                          <label className="block text-[11px] font-black text-white/50 uppercase tracking-widest mb-2">{f.label}</label>
                          <div className="relative">
                            <input type={f.type} name={f.name} value={form[f.name as keyof typeof form]}
                              onChange={handleChange}
                              onFocus={() => setFocused(f.name)} onBlur={() => setFocused(null)}
                              placeholder={f.placeholder}
                              className={`w-full px-4 py-3.5 rounded-xl border text-white text-sm font-medium placeholder-white/20 outline-none transition-all duration-200 bg-white/[0.07] ${focused === f.name ? "border-sky-400/60 bg-white/[0.12] shadow-lg shadow-sky-900/20" : "border-white/10 hover:border-white/20"}`} />
                            {focused === f.name && (
                              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400 to-blue-500 rounded-full origin-left" />
                            )}
                          </div>
                        </div>
                      ))}

                      <div>
                        <label className="block text-[11px] font-black text-white/50 uppercase tracking-widest mb-2">Topik</label>
                        <div className="relative">
                          <select name="subject" value={form.subject}
                            onChange={handleChange}
                            onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                            className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium outline-none transition-all duration-200 bg-white/[0.07] appearance-none ${focused === "subject" ? "border-sky-400/60 bg-white/[0.12]" : "border-white/10 hover:border-white/20"} ${form.subject ? "text-white" : "text-white/30"}`}>
                            <option value="" className="bg-[#0c2348]">Pilih topik pertanyaan</option>
                            {subjectOptions.map(opt => (
                              <option key={opt} value={opt} className="bg-[#0c2348] text-white">{opt}</option>
                            ))}
                          </select>
                          {focused === "subject" && (
                            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                              className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400 to-blue-500 rounded-full origin-left" />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-white/50 uppercase tracking-widest mb-2">Pesan *</label>
                        <div className="relative">
                          <textarea name="message" value={form.message}
                            onChange={handleChange}
                            onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                            placeholder="Ceritakan kebutuhanmu di sini…" rows={5}
                            className={`w-full px-4 py-3.5 rounded-xl border text-white text-sm font-medium placeholder-white/20 outline-none transition-all duration-200 resize-none bg-white/[0.07] ${focused === "message" ? "border-sky-400/60 bg-white/[0.12] shadow-lg shadow-sky-900/20" : "border-white/10 hover:border-white/20"}`} />
                          {focused === "message" && (
                            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                              className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400 to-blue-500 rounded-full origin-left" />
                          )}
                          <div className="absolute bottom-3 right-3 text-[10px] text-white/20 font-mono">{form.message.length}</div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-red-300 text-sm font-medium bg-red-500/10 px-4 py-3 rounded-xl border border-red-400/20">
                            ⚠️ {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <motion.button type="submit" disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "none" : "0 0 50px rgba(56,139,253,0.5)" }}
                        whileTap={{ scale: loading ? 1 : 0.97 }}
                        className="w-full flex items-center justify-center gap-3 py-4 px-8 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-2xl shadow-blue-900/40 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden relative">
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                          animate={{ x: ["-200%", "200%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
                        {loading ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            Mengirim…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Kirim Pesan
                            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.3, repeat: Infinity }}>
                              <ArrowRight className="w-4 h-4" />
                            </motion.span>
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-2 space-y-5">

              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-white/[0.06] backdrop-blur-sm rounded-3xl border border-white/10 p-8 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
                <div className="text-[11px] font-black text-sky-300/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-5 h-px bg-sky-400/40" /> Informasi Kantor
                </div>
                <div className="space-y-5">
                  {[
                    { icon: <MapPin className="w-5 h-5" />, label: "Alamat", value: address, color: "text-sky-400" },
                    { icon: <Clock className="w-5 h-5" />, label: "Jam Operasional", value: officeHours, color: "text-indigo-400" },
                    { icon: <Mail className="w-5 h-5" />, label: "Email", value: email, color: "text-blue-400" },
                  ].map((item, i) => (
                    <motion.div key={i} className="flex gap-4 group" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      <div className={`flex-shrink-0 mt-0.5 ${item.color}`}>{item.icon}</div>
                      <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5">{item.label}</p>
                        <p className="text-white/70 font-medium text-sm group-hover:text-white transition-colors">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {cleanWa && (
                <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-3xl p-8"
                  style={{ background: "linear-gradient(135deg,#052e16 0%,#065f46 100%)" }}>
                  <GlowOrb className="top-[-20%] right-[-10%] w-48 h-48"
                    color="radial-gradient(circle,rgba(52,211,153,0.4) 0%,transparent 70%)" />
                  <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute top-8 left-8 w-16 h-16 rounded-full border-2 border-emerald-400/30" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 flex items-center justify-center mb-5">
                      <MessageCircle className="w-6 h-6 text-emerald-300" />
                    </div>
                    <p className="text-emerald-300/70 text-[11px] font-black uppercase tracking-widest mb-2">Butuh respons cepat?</p>
                    <h4 className="text-white font-black text-xl mb-2">Chat via WhatsApp</h4>
                    <p className="text-white/40 text-sm mb-6">Biasanya kami balas dalam hitungan menit.</p>
                    <motion.a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(52,211,153,0.4)" }} whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-xl text-sm shadow-xl">
                      <MessageCircle className="w-4 h-4" /> Mulai Chat
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.3, repeat: Infinity }}>
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </motion.a>
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.24, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-white/[0.04] rounded-3xl border border-white/[0.08] p-7">
                <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-4">Mengapa Menghubungi Kami?</p>
                <div className="space-y-3">
                  {[
                    { icon: "✅", text: "Konsultasi gratis tanpa komitmen" },
                    { icon: "🌍", text: "Program kerja & magang ke 11+ negara" },
                    { icon: "📋", text: "Terdaftar resmi sebagai P3MI di Kemenaker RI" },
                    { icon: "🤝", text: "Pendampingan penuh dari awal hingga tujuan" },
                  ].map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.08 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 text-sm text-white/60 hover:text-white/90 transition-colors cursor-default">
                      <span className="text-base">{item.icon}</span>
                      <span className="font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ MAPS ══════════ */}
      <section className="bg-white py-24 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#dbeafe 0%,transparent 70%)" }} />

        <div className="max-w-6xl mx-auto relative">
          <Rev>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-4">
                <MapPin className="w-3.5 h-3.5" /> Lokasi Kami
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                Temukan kami di
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600"> sini</span>
              </h2>
              <p className="text-slate-400 mt-3 max-w-md mx-auto text-sm">
                Kunjungi kantor kami untuk konsultasi langsung — kami dengan senang hati menyambut kamu.
              </p>
            </motion.div>

            <motion.div variants={fadeUp}
              className="rounded-3xl overflow-hidden border border-slate-100 shadow-2xl">
              {/* header bar */}
              <div className="bg-gradient-to-r from-[#071530] to-[#0c2348] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    📍
                  </motion.span>
                  <div>
                    <p className="text-white font-black text-sm">Tenhal Bekerja Bersama</p>
                    <p className="text-white/40 text-xs">{address}</p>
                  </div>
                </div>
                <motion.a
                  href={`https://maps.google.com/?q=Tenhal+Bekerja+Bersama`}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-300 text-xs font-bold rounded-xl transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" /> Buka Maps
                </motion.a>
              </div>

              {/* map embed */}
              <div dangerouslySetInnerHTML={{
                __html: (settings["google_maps_embed"] ||
                  `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0953199066107!2d106.82364707486764!3d-6.251169893737267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f300078feaab%3A0x28564b3e4b0d8a63!2sTenhal%20Bekerja%20Bersama!5e0!3m2!1sid!2sid!4v1773208885485!5m2!1sid!2sid" style="border:0;display:block;width:100%;height:420px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`)
                  .replace(/width="[^"]*"/, 'width="100%"')
                  .replace(/height="[^"]*"/, 'height="420"')
                  .replace(/style="[^"]*"/, 'style="border:0;display:block;width:100%;height:420px;"')
              }} />
            </motion.div>
          </Rev>
        </div>
      </section>

      {/* FLOATING WA */}
      {cleanWa && (
        <motion.a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, type: "spring" }}
          whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-2xl shadow-green-900/40 flex items-center justify-center text-2xl overflow-hidden">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>💬</motion.div>
          <motion.div animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-green-500" />
        </motion.a>
      )}

    </div>
  )
}