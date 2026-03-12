"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import type { TargetAndTransition } from "framer-motion"
import type { Variants } from "framer-motion"
import { ArrowRight, MessageCircle, Plane, Globe2, ChevronDown } from "lucide-react"
import type { TeamMember } from "@/types"

/* ─── helpers ─────────────────────────────────────────────── */
const img = (url: string) => {
  if (!url) return null
  if (url.startsWith("http")) return url.replace(/^https?:\/\/[^/]+/, "/api")
  if (url.startsWith("/uploads")) return `/api${url}`
  return `/api/${url}`
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const stag: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

/* ─── micro components ─────────────────────────────────────── */
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

/* ─── main ─────────────────────────────────────────────────── */
interface Props {
  pageContent: Record<string, { title: string; content: string; image_url?: string }>
  team: TeamMember[]
  settings: Record<string, string>
}

export default function TentangKamiClient({ pageContent, team, settings }: Props) {
  const wa = settings["whatsapp"] || ""
  const [hoveredMember, setHoveredMember] = useState<number | null>(null)

  const bg      = pageContent["latar_belakang"]    ?? {}
  const penempatan = pageContent["penempatan_pekerja"] ?? {}
  const bahasa  = pageContent["pelatihan_bahasa"]  ?? {}
  const karir   = pageContent["pendampingan_karir"] ?? {}
  const visi    = pageContent["visi"]              ?? {}
  const misi    = pageContent["misi"]              ?? {}

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY  = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOp = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const services = [
    { icon: "🌍", color: "from-sky-500 to-blue-600",    n: "01", tag: "Penempatan Kerja",
      title: penempatan.title || "Penempatan Tenaga Kerja",
      content: penempatan.content || "Kami menghubungkan tenaga kerja Indonesia dengan perusahaan-perusahaan terpercaya di Eropa." },
    { icon: "🎓", color: "from-indigo-500 to-violet-600", n: "02", tag: "Pelatihan Bahasa",
      title: bahasa.title || "Pelatihan Bahasa Intensif",
      content: bahasa.content || "Program pelatihan Bahasa Inggris dan bahasa negara tujuan intensif selama 7 minggu." },
    { icon: "🤝", color: "from-teal-500 to-emerald-600",  n: "03", tag: "Pendampingan Karir",
      title: karir.title || "Pendampingan Karir Penuh",
      content: karir.content || "Kami mendampingi dari konsultasi, dokumen, hingga keberangkatan dan adaptasi di negara tujuan." },
  ]

  const stats = [
    { icon: "🏛️", num: "P3MI",   label: "Terdaftar & Legal", color: "from-sky-500 to-blue-600" },
    { icon: "🌍", num: "11+",    label: "Negara Tujuan",      color: "from-indigo-500 to-violet-600" },
    { icon: "👥", num: "100+",   label: "Alumni Bekerja",     color: "from-teal-500 to-emerald-600" },
    { icon: "⭐", num: "7+ thn", label: "Pengalaman",         color: "from-amber-500 to-orange-500" },
  ]

  const values = [
    { icon: "🏛️", title: "Integritas",   desc: "Beroperasi penuh transparansi, terdaftar resmi sebagai P3MI di Kemenaker RI." },
    { icon: "🤝", title: "Kepercayaan",  desc: "Dibangun atas kepercayaan ribuan alumni yang telah berhasil berkarir di Eropa." },
    { icon: "🌱", title: "Pertumbuhan",  desc: "Terus berkembang, membuka jalur ke lebih banyak negara dan sektor industri." },
    { icon: "❤️", title: "Kepedulian",   desc: "Setiap peserta adalah prioritas — kami hadir dari awal hingga tujuan." },
  ]

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(160deg,#020b1a 0%,#071530 30%,#0c2348 60%,#0f3060 100%)" }}>
        <GridBg />
        <GlowOrb className="top-[-5%] right-[-8%] w-[650px] h-[650px]"
          color="radial-gradient(circle,rgba(56,139,253,0.35) 0%,transparent 70%)" />
        <GlowOrb className="bottom-[5%] left-[-8%] w-[500px] h-[500px]"
          color="radial-gradient(circle,rgba(99,179,237,0.18) 0%,transparent 70%)"
          animate={{ scale:[1.2,1,1.2], opacity:[0.06,0.18,0.06] }} />

        {/* floating dots */}
        {[...Array(16)].map((_,i)=>(
          <Dot key={i} x={`${3+i*6}%`} y={`${10+(i%7)*12}%`}
            size={i%4===0?5:i%3===0?3.5:2} delay={i*0.3} />
        ))}

        {/* animated plane */}
        <motion.div animate={{ x:["-5%","105%"], y:["65%","20%"] }}
          transition={{ duration:20, repeat:Infinity, ease:"easeInOut", repeatType:"loop" }}
          className="absolute pointer-events-none opacity-[0.08]">
          <Plane className="w-12 h-12 text-white" style={{ transform:"rotate(-20deg)" }} />
        </motion.div>

        {/* wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" className="w-full block">
            <path d="M0,60 C360,100 720,0 1080,60 C1260,90 1380,20 1440,60 L1440,100 L0,100 Z" fill="white"/>
          </svg>
        </div>

        <motion.div style={{ y:heroY, opacity:heroOp }}
          className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 pt-40 pb-32">
          <motion.div variants={stag} initial="hidden" animate="show" className="max-w-3xl mx-auto text-center">

            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              P3MI Resmi · Terdaftar & Terpercaya
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-4">
              Mengenal
              <br/>
              <span className="relative inline-block">
                <span style={{ WebkitTextStroke:"2px rgba(147,210,255,0.7)", color:"transparent" }}>Tenhal</span>
                <motion.span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                  initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ delay:1, duration:0.8, ease:[0.22,1,0.36,1] }} />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/55 leading-relaxed mt-8 mb-10 max-w-xl mx-auto">
              Perusahaan penempatan tenaga kerja profesional yang mendampingi warga Indonesia meraih karir impian di Eropa.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center mb-16">
              {wa && (
                <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale:1.04, boxShadow:"0 0 50px rgba(56,139,253,0.5)" }} whileTap={{ scale:0.96 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-xl shadow-blue-900/40">
                  Konsultasi Gratis
                  <motion.span animate={{ x:[0,5,0] }} transition={{ duration:1.3, repeat:Infinity }}>
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </motion.a>
              )}
              <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                <Link href="/lowongan"
                  className="inline-flex items-center gap-2 px-7 py-4 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-2xl text-sm transition-colors">
                  Lihat Lowongan
                </Link>
              </motion.div>
            </motion.div>

            {/* stat row */}
            <motion.div variants={fadeUp} className="flex items-center justify-center">
              {[{n:"11+",l:"Negara"},{n:"100+",l:"Alumni"},{n:"7+ thn",l:"Pengalaman"}].map((s,i)=>(
                <div key={s.l} className="flex items-center">
                  <div className="text-center px-7">
                    <div className="text-3xl font-black text-white tracking-tight">{s.n}</div>
                    <div className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mt-0.5">{s.l}</div>
                  </div>
                  {i<2 && <div className="w-px h-8 bg-white/15"/>}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2, repeat:Infinity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/30">
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ══════════════════════ STATS ══════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-40 pointer-events-none"
          style={{ background:"radial-gradient(circle,#e8f4ff 0%,transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((s,i)=>(
                <motion.div key={i} variants={fadeUp}
                  whileHover={{ y:-8, boxShadow:"0 24px 60px rgba(0,0,0,0.1)" }}
                  className="group relative bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 text-center overflow-hidden cursor-default transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-blue-500 transition-all duration-500 rounded-t-3xl" />
                  <motion.div
                    whileHover={{ rotate:[0,10,-10,0], scale:1.15 }}
                    transition={{ duration:0.5 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-5 shadow-lg`}>
                    {s.icon}
                  </motion.div>
                  <div className="text-3xl sm:text-4xl font-black text-[#0a1628] mb-1.5">{s.num}</div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* ══════════════════════ LATAR BELAKANG ══════════════════════ */}
      <section className="py-28 sm:py-40 bg-[#f7f9fc] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[700px] h-[500px] pointer-events-none opacity-50"
          style={{ background:"radial-gradient(ellipse at 0% 100%,#dbeafe 0%,transparent 60%)" }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <Rev>
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-5">
                Latar Belakang
              </motion.div>
              <motion.h2 variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a1628] leading-[1.0] tracking-tight mb-6">
                {bg.title || <><span>Mengapa</span><br />Kami Hadir?</>}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500 leading-relaxed mb-10 text-base sm:text-lg max-w-md">
                {bg.content || "Kami hadir untuk menjembatani peluang kerja internasional berkualitas bagi tenaga kerja Indonesia, dengan proses yang legal, aman, dan transparan."}
              </motion.p>
              <motion.div variants={stag} className="grid grid-cols-2 gap-3">
                {[
                  { text:"Legal & Terpercaya", icon:"🏛️" },
                  { text:"Pelatihan Lengkap",  icon:"🎓" },
                  { text:"Pendampingan Penuh", icon:"🤝" },
                  { text:"Jaringan 11 Negara", icon:"🌍" },
                ].map(item=>(
                  <motion.div key={item.text} variants={fadeUp}
                    whileHover={{ x:5, boxShadow:"0 8px 24px rgba(0,0,0,0.06)" }}
                    className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-100 transition-all cursor-default">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-bold text-slate-700">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </Rev>

            {/* values card */}
            <motion.div initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}>
              <div className="relative rounded-3xl overflow-hidden"
                style={{ background:"linear-gradient(135deg,#071530 0%,#0c2348 50%,#1a3c6e 100%)" }}>
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{ backgroundImage:"radial-gradient(white 1px,transparent 1px)", backgroundSize:"22px 22px" }} />
                <GlowOrb className="top-[-20%] right-[-10%] w-[300px] h-[300px]"
                  color="radial-gradient(circle,rgba(56,139,253,0.25) 0%,transparent 70%)" />
                <div className="relative p-8 sm:p-10">
                  <div className="text-[11px] font-black text-sky-300/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="w-5 h-px bg-sky-400/40" /> Nilai-Nilai Kami
                  </div>
                  <div className="space-y-3">
                    {values.map((v,i)=>(
                      <motion.div key={i}
                        initial={{ opacity:0, x:24 }} whileInView={{ opacity:1, x:0 }}
                        viewport={{ once:true }} transition={{ delay:i*0.1, ease:[0.22,1,0.36,1] }}
                        whileHover={{ x:6 }}
                        className="group flex items-start gap-4 bg-white/[0.06] hover:bg-white/[0.13] border border-white/5 hover:border-sky-400/20 rounded-2xl p-4 transition-all cursor-default">
                        <motion.div whileHover={{ rotate:15, scale:1.2 }}
                          className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                          {v.icon}
                        </motion.div>
                        <div>
                          <div className="font-black text-white text-sm mb-0.5">{v.title}</div>
                          <div className="text-xs text-white/45 leading-relaxed group-hover:text-white/65 transition-colors">{v.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ VISI MISI ══════════════════════ */}
      <section className="py-28 sm:py-40 relative overflow-hidden"
        style={{ background:"linear-gradient(150deg,#020b1a 0%,#071530 40%,#0c2348 100%)" }}>
        <GridBg />
        <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px]"
          color="radial-gradient(circle,rgba(56,139,253,0.15) 0%,transparent 65%)"
          animate={{ scale:[1,1.4,1], opacity:[0.08,0.22,0.08] }} />
        {[...Array(8)].map((_,i)=>(
          <Dot key={i} x={`${8+i*12}%`} y={`${12+(i%4)*22}%`} size={i%3===0?4:2.5} delay={i*0.5} />
        ))}

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="text-center mb-16 sm:mb-20">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.07] border border-white/10 rounded-full text-[11px] font-black text-sky-300/80 uppercase tracking-[0.2em] mb-6">
                🎯 Arah & Tujuan
              </motion.div>
              <motion.h2 variants={fadeUp}
                className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
                Visi & Misi<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400">Kami</span>
              </motion.h2>
            </div>
          </Rev>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {[
              { icon:"🔭", label:"Visi", grad:"from-sky-500 to-blue-600",
                title: visi.title || "Menjadi Jembatan Terbaik",
                content: visi.content || "Menjadi perusahaan penempatan tenaga kerja Indonesia terpercaya yang membuka akses karir global berkualitas bagi seluruh lapisan masyarakat." },
              { icon:"🚀", label:"Misi", grad:"from-indigo-500 to-violet-600",
                title: misi.title || "Langkah Nyata Kami",
                content: misi.content || "Memberikan pelayanan penempatan tenaga kerja yang legal, aman, dan profesional melalui pelatihan intensif, pendampingan penuh, dan jaringan mitra Eropa yang kuat." },
            ].map((item,i)=>(
              <motion.div key={i}
                initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.15, duration:0.7, ease:[0.22,1,0.36,1] }}
                whileHover={{ y:-8, scale:1.01 }}
                className="group relative bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-sky-400/30 rounded-3xl p-8 sm:p-10 transition-all duration-400 overflow-hidden cursor-default">
                {/* hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background:"radial-gradient(ellipse at 20% 20%,rgba(56,139,253,0.12) 0%,transparent 65%)" }} />
                <div className="flex items-start gap-5 sm:gap-6">
                  <motion.div
                    animate={{ rotate:[0,6,-6,0] }}
                    transition={{ duration:5+i*2, repeat:Infinity, delay:i*0.8 }}
                    className={`w-16 h-16 bg-gradient-to-br ${item.grad} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-2xl`}>
                    {item.icon}
                  </motion.div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-sky-400/70 tracking-[0.2em] uppercase mb-2">{item.label}</div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-3 group-hover:text-sky-100 transition-colors leading-tight">{item.title}</h3>
                    <p className="text-sm sm:text-base text-white/45 leading-relaxed group-hover:text-white/70 transition-colors">{item.content}</p>
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${item.grad} scale-x-0 group-hover:scale-x-100 transition-transform duration-600 origin-left`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ LAYANAN ══════════════════════ */}
      <section className="py-28 sm:py-40 bg-white relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
          style={{ background:"radial-gradient(circle,#e8f4ff 0%,transparent 70%)" }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Rev>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              <div className="lg:col-span-4">
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-5">
                  Layanan Kami
                </motion.div>
                <motion.h2 variants={fadeUp}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a1628] leading-[1.0] mb-6 tracking-tight">
                  Apa yang<br />Kami<br />Tawarkan
                </motion.h2>
                <motion.p variants={fadeUp} className="text-slate-500 leading-relaxed text-base">
                  Layanan lengkap dari konsultasi hingga keberangkatan, semua dalam satu atap.
                </motion.p>
              </div>

              <div className="lg:col-span-8 space-y-4">
                {services.map((item,i)=>(
                  <motion.div key={i} variants={fadeUp}
                    whileHover={{ x:6, boxShadow:"0 20px 60px rgba(0,0,0,0.07)" }}
                    className="group relative bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 cursor-default transition-all duration-300 overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-slate-100 group-hover:bg-gradient-to-b group-hover:from-sky-400 group-hover:to-blue-600 transition-all duration-500 rounded-l-2xl" />
                    <div className="flex items-start gap-5">
                      <motion.div whileHover={{ rotate:15, scale:1.15 }}
                        className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                        {item.icon}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black text-slate-200 tracking-widest">{item.n}</span>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{item.tag}</span>
                        </div>
                        <h3 className="font-black text-[#0a1628] text-base sm:text-lg mb-1.5 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.content}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* ══════════════════════ TIM ══════════════════════ */}
      {team.length > 0 && (
        <section className="py-28 sm:py-40 bg-[#f7f9fc] relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] pointer-events-none opacity-40"
            style={{ background:"radial-gradient(circle,#dbeafe 0%,transparent 65%)" }} />
          <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
            <Rev>
              <div className="text-center mb-16">
                <motion.div variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">
                  Tim Kami
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a1628] tracking-tight mb-3 leading-tight">
                  Orang-orang di<br />Balik Tenhal
                </motion.h2>
                <motion.p variants={fadeUp} className="text-slate-500 max-w-sm mx-auto text-base">
                  Tim profesional yang berdedikasi membantu kamu meraih karir internasional
                </motion.p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {team.map((member,i)=>(
                  <motion.div key={member.id} variants={fadeUp}
                    whileHover={{ y:-10 }}
                    onHoverStart={()=>setHoveredMember(member.id)}
                    onHoverEnd={()=>setHoveredMember(null)}
                    className="group cursor-default">

                    {/* photo */}
                    <div className="relative w-full aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden mb-4 shadow-md group-hover:shadow-2xl transition-all duration-400">
                      {member.photo_url ? (
                        <img src={img(member.photo_url) || ""} alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#071530] to-[#1a3c6e] text-white text-4xl sm:text-5xl font-black">
                          {member.name.charAt(0)}
                        </div>
                      )}

                      {/* overlay on hover */}
                      <AnimatePresence>
                        {hoveredMember===member.id && (
                          <motion.div
                            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            transition={{ duration:0.2 }}
                            className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-[#0a1628]/20 to-transparent flex items-end p-4">
                            <div>
                              <div className="text-white font-black text-sm leading-tight">{member.name}</div>
                              <div className="text-sky-300 text-xs font-semibold mt-0.5">{member.position}</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* corner accent */}
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px]">👤</span>
                      </div>
                    </div>

                    <h3 className="font-black text-[#0a1628] text-sm group-hover:text-blue-700 transition-colors text-center leading-tight">{member.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold mt-1 text-center">{member.position}</p>
                  </motion.div>
                ))}
              </div>
            </Rev>
          </div>
        </section>
      )}

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section className="py-28 sm:py-40 relative overflow-hidden"
        style={{ background:"linear-gradient(160deg,#020b1a 0%,#071530 35%,#0c2348 70%,#0f3060 100%)" }}>
        <GridBg />
        <GlowOrb className="top-1/4 right-1/4 w-[400px] h-[400px]"
          color="radial-gradient(circle,rgba(56,139,253,0.3) 0%,transparent 65%)" />
        <motion.div animate={{ rotate:360 }} transition={{ duration:60, repeat:Infinity, ease:"linear" }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full border border-white/[0.04] pointer-events-none" />
        <motion.div animate={{ rotate:-360 }} transition={{ duration:45, repeat:Infinity, ease:"linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] rounded-full border border-white/[0.04] pointer-events-none" />
        {[...Array(10)].map((_,i)=>(
          <Dot key={i} x={`${3+i*10}%`} y={`${8+(i%5)*18}%`} size={i%3===0?4:2} delay={i*0.4} />
        ))}

        <div className="relative max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <motion.div initial={{ opacity:0, scale:0.85 }} whileInView={{ opacity:1, scale:1 }}
            viewport={{ once:true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.07] border border-white/10 rounded-full text-[11px] font-black text-sky-300/80 uppercase tracking-[0.2em] mb-6">
            🛫 Siap Bergabung?
          </motion.div>
          <motion.h2 initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:0.08, ease:[0.22,1,0.36,1] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-tight">
            Bergabunglah<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400">Bersama Kami</span>
          </motion.h2>
          <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }}
            viewport={{ once:true }} transition={{ delay:0.2 }}
            className="text-white/40 max-w-md mx-auto text-lg mb-12">
            Raih impian karir internasional bersama tim profesional Tenhal. Konsultasi gratis, tanpa komitmen.
          </motion.p>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:0.3 }}
            className="flex flex-wrap justify-center gap-4">
            {wa && (
              <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale:1.05, boxShadow:"0 24px 60px rgba(56,139,253,0.5)" }} whileTap={{ scale:0.97 }}
                className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl text-sm shadow-2xl shadow-blue-900/50">
                <MessageCircle className="w-4 h-4" />
                Konsultasi Gratis via WA
                <motion.span animate={{ x:[0,5,0] }} transition={{ duration:1.2, repeat:Infinity }}>
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.a>
            )}
            <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
              <Link href="/lowongan"
                className="inline-flex items-center gap-2 px-7 py-4 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold rounded-2xl text-sm transition-colors">
                Lihat Lowongan <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Floating WA */}
      {wa && (
        <motion.a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
          initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
          transition={{ delay:2, type:"spring" }}
          whileHover={{ scale:1.12 }} whileTap={{ scale:0.9 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-2xl shadow-green-900/40 flex items-center justify-center text-2xl overflow-hidden">
          <motion.div animate={{ scale:[1,1.15,1] }} transition={{ duration:2, repeat:Infinity }}>💬</motion.div>
          <motion.div animate={{ scale:[1,2,1], opacity:[0.3,0,0.3] }}
            transition={{ duration:2, repeat:Infinity }}
            className="absolute inset-0 rounded-full bg-green-500" />
        </motion.a>
      )}

    </div>
  )
}