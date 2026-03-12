"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import type { Variants } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Tag, BookOpen, ArrowRight, Share2 } from "lucide-react"
import type { BlogPost } from "@/types"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function img(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url.replace(/^https?:\/\/[^/]+/, "/api")
  if (url.startsWith("/uploads")) return `/api${url}`
  return `/api/${url}`
}

function formatDate(d: string) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function readingTime(content: string) {
  const words = content?.replace(/<[^>]+>/g, "").split(/\s+/).length || 0
  return Math.max(1, Math.ceil(words / 200))
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
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

interface Props {
  post: BlogPost
  related: BlogPost[]
}

export default function BlogDetailClient({ post, related }: Props) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY  = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])
  const heroOp = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const thumb = img(post.thumbnail_url)
  const minutes = readingTime(post.content)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section ref={heroRef} className="relative min-h-[65vh] flex items-end overflow-hidden pb-0"
        style={{ background: "linear-gradient(160deg,#020b1a 0%,#071530 30%,#0c2348 60%,#0f3060 100%)" }}>
        <GridBg />

        <motion.div className="absolute top-[-5%] right-[-8%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(56,139,253,0.3) 0%,transparent 70%)" }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 8, repeat: Infinity }} />

        {/* thumbnail bg blur */}
        {thumb && (
          <div className="absolute inset-0">
            <img src={thumb} alt="" className="w-full h-full object-cover opacity-10 blur-sm scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020b1a]/80 via-[#0c2348]/60 to-[#0c2348]" />
          </div>
        )}

        {/* wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full block">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,10 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOp }}
          className="relative w-full max-w-4xl mx-auto px-5 sm:px-8 pt-36 pb-24">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>

            {/* back */}
            <motion.div variants={fadeUp} className="mb-8">
              <Link href="/blog"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white/90 text-sm font-semibold transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Blog
              </Link>
            </motion.div>

            {/* badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2.5 mb-5">
              {post.category && (
                <span className="px-3.5 py-1.5 bg-sky-500/90 text-white text-xs font-black rounded-full">
                  {post.category.name}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-white/40 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="flex items-center gap-1.5 text-white/40 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" /> {minutes} menit baca
              </span>
              {post.author?.name && (
                <span className="text-white/40 text-xs font-medium">
                  oleh <span className="text-white/70 font-bold">{post.author.name}</span>
                </span>
              )}
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              {post.title}
            </motion.h1>

            {post.excerpt && (
              <motion.p variants={fadeUp} className="text-lg text-white/55 leading-relaxed max-w-2xl">
                {post.excerpt}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════ CONTENT ══════════ */}
      <section className="bg-white py-16 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">

          {/* thumbnail */}
          {thumb && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl overflow-hidden shadow-2xl mb-12 -mt-8 relative z-10 border border-slate-100">
              <img src={thumb} alt={post.title} className="w-full h-72 sm:h-96 object-cover" />
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">

            {/* article body */}
            <motion.article
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-3">
              <div
                className="prose prose-lg prose-slate max-w-none
                  prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h3:text-xl
                  prose-p:text-slate-600 prose-p:leading-relaxed
                  prose-a:text-sky-600 prose-a:font-semibold hover:prose-a:text-sky-500
                  prose-strong:text-slate-900 prose-strong:font-black
                  prose-img:rounded-2xl prose-img:shadow-lg
                  prose-blockquote:border-sky-400 prose-blockquote:bg-sky-50 prose-blockquote:rounded-xl prose-blockquote:py-2 prose-blockquote:not-italic
                  prose-code:bg-slate-100 prose-code:text-sky-600 prose-code:rounded prose-code:px-1
                  prose-pre:bg-slate-900 prose-pre:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* tags */}
              {post.tags?.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                  <Tag className="w-4 h-4 text-slate-400" />
                  {post.tags.map(tag => (
                    <Link key={tag.id} href={`/blog?tag=${tag.slug}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 text-xs font-bold rounded-lg transition-colors">
                      #{tag.name}
                    </Link>
                  ))}
                </motion.div>
              )}

              {/* share */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="mt-8 flex items-center gap-3">
                <span className="text-sm text-slate-400 font-medium">Bagikan artikel ini:</span>
                <motion.button onClick={handleShare}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-sm font-bold rounded-xl transition-colors">
                  <Share2 className="w-4 h-4" /> Bagikan
                </motion.button>
              </motion.div>
            </motion.article>

            {/* sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="lg:col-span-1 space-y-5 lg:sticky lg:top-24">

              {/* article info */}
              <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Info Artikel</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Diterbitkan</p>
                      <p className="text-sm font-semibold text-slate-700">{formatDate(post.published_at || post.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Estimasi Baca</p>
                      <p className="text-sm font-semibold text-slate-700">{minutes} menit</p>
                    </div>
                  </div>
                  {post.category && (
                    <div className="flex items-start gap-2.5">
                      <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Kategori</p>
                        <p className="text-sm font-semibold text-slate-700">{post.category.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="relative rounded-2xl p-6 overflow-hidden"
                style={{ background: "linear-gradient(135deg,#071530 0%,#0c2348 100%)" }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
                <p className="text-sky-300/70 text-[10px] font-black uppercase tracking-widest mb-2">Tertarik kerja di luar negeri?</p>
                <h4 className="text-white font-black text-base mb-3 leading-tight">Konsultasi gratis dengan tim Tenhal</h4>
                <Link href="/hubungi-kami"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-xl text-xs shadow-lg">
                  Hubungi Kami <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* back to blog */}
              <Link href="/blog"
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Semua Artikel
              </Link>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* ══════════ RELATED POSTS ══════════ */}
      {related.length > 0 && (
        <section className="bg-slate-50 py-20 px-5 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="mb-10 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-3">
                <BookOpen className="w-3.5 h-3.5" /> Artikel Terkait
              </span>
              <h2 className="text-3xl font-black text-slate-900">Baca Juga</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.filter(p => !!p.slug).map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -6 }}>
                  <Link href={p.slug ? `/blog/${p.slug}` : "#"} className="block group">
                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                      {img(p.thumbnail_url) ? (
                        <img src={img(p.thumbnail_url)!} alt={p.title}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-44 bg-gradient-to-br from-[#071530] to-[#1a3c6e] flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                      <div className="p-5">
                        {p.category && (
                          <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">{p.category.name}</span>
                        )}
                        <h3 className="font-black text-slate-900 group-hover:text-blue-700 transition-colors text-sm mt-1 line-clamp-2 leading-snug">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-3 text-sky-600 text-xs font-black group-hover:gap-3 transition-all">
                          Baca <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="h-0.5 bg-gradient-to-r from-sky-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}