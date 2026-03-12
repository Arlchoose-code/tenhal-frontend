"use client"

import { useRef, useState, useCallback } from "react"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import Link from "next/link"
import {
  Search, Tag, BookOpen, ArrowRight, Calendar, Clock,
  ChevronLeft, ChevronRight, Plane, X, ChevronDown, SlidersHorizontal
} from "lucide-react"
import type { BlogPost, BlogCategory, BlogTag, PaginationMeta } from "@/types"
import Pagination from "@/components/ui/pagination"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function img(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url.replace(/^https?:\/\/[^/]+/, "/api")
  if (url.startsWith("/uploads")) return `/api${url}`
  return `/api/${url}`
}
function formatDate(d: string) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}
function readingTime(content: string) {
  return Math.max(1, Math.ceil((content?.replace(/<[^>]+>/g, "").split(/\s+/).length || 0) / 200))
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
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

function GridBg() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{
      backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
      backgroundSize: "64px 64px"
    }} />
  )
}

/* ─── BlogCard ─── */
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const thumb = img(post.thumbnail_url)
  const mins = readingTime(post.content)
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 9) * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full">
      <Link href={post.slug ? `/blog/${post.slug}` : "#"} className="flex flex-col h-full">
        <div className="relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300">

          {/* thumbnail */}
          <div className="relative h-[200px] flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#071530] to-[#0f3060]">
            {thumb
              ? <img src={thumb} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-white/10" /></div>
            }
            {/* dim on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

            {/* category pill */}
            {post.category && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-sky-500 text-white text-[11px] font-black rounded-lg tracking-wide shadow-lg">
                {post.category.name}
              </span>
            )}

            {/* reading time pill */}
            <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white/90 text-[11px] font-semibold rounded-lg">
              <Clock className="w-3 h-3" />{mins} mnt
            </span>
          </div>

          {/* body */}
          <div className="flex flex-col flex-1 p-5">
            <p className="text-[11px] text-slate-400 font-medium mb-2 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {formatDate(post.published_at || post.created_at)}
            </p>

            <h3 className="font-black text-slate-900 text-[15px] leading-snug line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">{post.excerpt}</p>
            )}

            {/* tags row */}
            {post.tags?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {post.tags.slice(0, 3).map(t => (
                  <span key={t.id} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-semibold rounded-md">
                    #{t.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sky-600 text-xs font-black mt-auto group-hover:gap-2.5 transition-all">
              Baca artikel <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* accent line */}
          <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-sky-500 to-blue-600 group-hover:w-full transition-all duration-500" />
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Skeleton card ─── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white animate-pulse">
      <div className="h-[200px] bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-100 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-4/5" />
        <div className="h-4 bg-slate-100 rounded w-3/5" />
        <div className="h-3 bg-slate-100 rounded w-2/4 mt-4" />
      </div>
    </div>
  )
}

/* ─── Filter panel ─── */
const TAG_STEP = 10
function FilterPanel({
  categories, tags, activeCategory, activeTag, search,
  onCategory, onTag, onSearch, onClear, hasFilters
}: {
  categories: BlogCategory[]
  tags: BlogTag[]
  activeCategory: string | null
  activeTag: string | null
  search: string
  onCategory: (s: string | null) => void
  onTag: (s: string | null) => void
  onSearch: (s: string) => void
  onClear: () => void
  hasFilters: boolean
}) {
  const [shownTags, setShownTags] = useState(TAG_STEP)
  const [open, setOpen] = useState(false)
  const catScrollRef = useRef<HTMLDivElement>(null)
  const visibleTags = tags.slice(0, shownTags)

  const scrollCat = (dir: "l" | "r") =>
    catScrollRef.current?.scrollBy({ left: dir === "l" ? -180 : 180, behavior: "smooth" })

  return (
    <div className="mb-10">
      {/* top row: search + toggle filter */}
      <div className="flex items-center gap-3 mb-4">
        {/* search */}
        <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-400 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Cari artikel…"
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-300 outline-none font-medium"
          />
          <AnimatePresence>
            {search && (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSearch("")}>
                <X className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* filter toggle */}
        <motion.button
          onClick={() => setOpen(o => !o)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black border transition-all flex-shrink-0 ${open || hasFilters ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"}`}>
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] font-black flex items-center justify-center">
              {[activeCategory, activeTag].filter(Boolean).length}
            </span>
          )}
        </motion.button>
      </div>

      {/* filter drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">

              {/* categories */}
              {categories.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kategori</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => scrollCat("l")}
                      className="flex-shrink-0 w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all hidden sm:flex">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div ref={catScrollRef} className="flex gap-2 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>
                      <button onClick={() => onCategory(null)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all border ${!activeCategory ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                        Semua
                      </button>
                      {categories.map(c => (
                        <motion.button key={c.id} onClick={() => onCategory(c.slug)}
                          whileTap={{ scale: 0.97 }}
                          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all border ${activeCategory === c.slug ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                          {c.name}
                        </motion.button>
                      ))}
                    </div>
                    <button onClick={() => scrollCat("r")}
                      className="flex-shrink-0 w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all hidden sm:flex">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* divider */}
              {categories.length > 0 && tags.length > 0 && (
                <div className="h-px bg-slate-200" />
              )}

              {/* tags */}
              {tags.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {visibleTags.map(t => (
                      <motion.button key={t.id}
                        onClick={() => onTag(activeTag === t.slug ? null : t.slug)}
                        whileTap={{ scale: 0.97 }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeTag === t.slug ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                        #{t.name}
                      </motion.button>
                    ))}

                    {/* load more */}
                    {shownTags < tags.length && (
                      <motion.button
                        onClick={() => setShownTags(s => s + TAG_STEP)}
                        whileTap={{ scale: 0.97 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 flex items-center gap-1 transition-all">
                        +{Math.min(TAG_STEP, tags.length - shownTags)} lainnya
                        <ChevronDown className="w-3 h-3" />
                      </motion.button>
                    )}

                    {/* collapse */}
                    {shownTags > TAG_STEP && (
                      <motion.button
                        onClick={() => setShownTags(TAG_STEP)}
                        whileTap={{ scale: 0.97 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 flex items-center gap-1 transition-all">
                        Lebih sedikit
                        <ChevronDown className="w-3 h-3 rotate-180" />
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {/* footer */}
              {hasFilters && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">
                    {[activeCategory && "kategori", activeTag && "tag"].filter(Boolean).join(" + ")} aktif
                  </span>
                  <button onClick={onClear}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-black rounded-lg transition-colors">
                    <X className="w-3 h-3" /> Reset filter
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main ─── */
interface Props {
  initialPosts: BlogPost[]
  initialMeta: PaginationMeta
  categories: BlogCategory[]
  tags: BlogTag[]
  initialTagSlug?: string | null
  initialCategorySlug?: string | null
}

export default function BlogClient({ initialPosts, initialMeta, categories, tags, initialTagSlug = null, initialCategorySlug = null }: Props) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY  = useTransform(scrollYProgress, [0, 1], ["0%", "28%"])
  const heroOp = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  const [posts, setPosts]           = useState<BlogPost[]>(initialPosts)
  const [meta, setMeta]             = useState<PaginationMeta>(initialMeta)
  const [search, setSearch]         = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategorySlug)
  const [activeTag, setActiveTag]   = useState<string | null>(initialTagSlug)
  const [loading, setLoading]       = useState(false)

  const fetchPosts = useCallback(async (p = 1, s = search, cat = activeCategory, tag = activeTag) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: "9" })
      if (s) params.set("search", s)
      if (cat) params.set("category_slug", cat)
      if (tag) params.set("tag_slug", tag)
      const res = await fetch(`/api/public/blog/posts?${params}`)
      const json = await res.json()
      setPosts(json.data ?? [])
      setMeta(json.meta ?? { page: p, limit: 9, total: 0, total_pages: 1 })
    } finally {
      setLoading(false)
    }
  }, [search, activeCategory, activeTag])

  // debounced search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearch = (val: string) => {
    setSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchPosts(1, val, activeCategory, activeTag), 400)
  }

  const handleCategory = (slug: string | null) => { setActiveCategory(slug); fetchPosts(1, search, slug, activeTag) }
  const handleTag      = (slug: string | null) => { setActiveTag(slug);      fetchPosts(1, search, activeCategory, slug) }
  const handlePage     = (p: number) => { fetchPosts(p); window.scrollTo({ top: 0, behavior: "smooth" }) }
  const handleClear    = () => { setSearch(""); setActiveCategory(null); setActiveTag(null); fetchPosts(1, "", null, null) }

  const hasFilters = !!(search || activeCategory || activeTag)

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative min-h-[68vh] flex items-center overflow-hidden"
        style={{ background: "linear-gradient(160deg,#020b1a 0%,#071530 30%,#0c2348 60%,#0f3060 100%)" }}>
        <GridBg />

        {/* glows */}
        <motion.div className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(56,139,253,0.28) 0%,transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 9, repeat: Infinity }} />
        <motion.div className="absolute bottom-0 left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(99,179,237,0.15) 0%,transparent 70%)" }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 8, repeat: Infinity }} />

        {/* rings */}
        {[900, 650, 420].map((s, i) => (
          <motion.div key={s}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 50 + i * 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] pointer-events-none"
            style={{ width: s, height: s }} />
        ))}

        {/* floating dots */}
        {[...Array(14)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full bg-white/25 pointer-events-none"
            style={{ left: `${4 + i * 7}%`, top: `${10 + (i % 6) * 13}%`, width: i % 4 === 0 ? 5 : 3, height: i % 4 === 0 ? 5 : 3 }}
            animate={{ y: [0, -16, 0], opacity: [0.1, 0.45, 0.1] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }} />
        ))}

        {/* plane */}
        <motion.div animate={{ x: ["-10%", "110%"], y: ["70%", "10%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute pointer-events-none opacity-[0.06]">
          <Plane className="w-14 h-14 text-white" style={{ transform: "rotate(-22deg)" }} />
        </motion.div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 90" fill="none" preserveAspectRatio="none" className="w-full block">
            <path d="M0,50 C300,90 600,10 900,55 C1100,85 1300,15 1440,50 L1440,90 L0,90 Z" fill="white" />
          </svg>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOp }}
          className="relative w-full max-w-5xl mx-auto px-5 sm:px-8 pt-40 pb-32 text-center">
          <motion.div variants={stag} initial="hidden" animate="show">

            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 mb-7 rounded-full border border-sky-400/25 bg-sky-400/10 text-sky-300 text-[11px] font-black uppercase tracking-widest">
              <motion.span className="w-1.5 h-1.5 rounded-full bg-sky-400"
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }} />
              Tips · Info · Inspirasi
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-5">
              Blog
              <span className="block relative w-fit mx-auto mt-1">
                <span style={{ WebkitTextStroke: "2px rgba(147,210,255,0.65)", color: "transparent" }}>Tenhal</span>
                <motion.span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                  initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base sm:text-lg text-white/45 max-w-lg mx-auto leading-relaxed mt-6 mb-10">
              Panduan kerja luar negeri, cerita sukses alumni, dan update program terbaru dari Tenhal.
            </motion.p>

            {/* stats row */}
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-0 bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden">
              {[
                { n: String(initialMeta.total || 0), l: "Artikel" },
                { n: String(categories.length), l: "Kategori" },
                { n: String(tags.length), l: "Tag" },
              ].map((s, i) => (
                <div key={s.l} className="flex items-center">
                  <div className="text-center px-6 py-4">
                    <div className="text-2xl font-black text-white tracking-tight">{s.n}</div>
                    <div className="text-[10px] text-white/35 font-black uppercase tracking-widest mt-0.5">{s.l}</div>
                  </div>
                  {i < 2 && <div className="w-px h-8 bg-white/10" />}
                </div>
              ))}
            </motion.div>

          </motion.div>
        </motion.div>
      </section>

      {/* ══ POSTS ══ */}
      <section className="bg-white py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">

          <FilterPanel
            categories={categories} tags={tags}
            activeCategory={activeCategory} activeTag={activeTag} search={search}
            onCategory={handleCategory} onTag={handleTag}
            onSearch={handleSearch} onClear={handleClear} hasFilters={hasFilters}
          />

          {/* active filter badges */}
          <AnimatePresence>
            {hasFilters && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex flex-wrap items-center gap-2 mb-6 -mt-4">
                <span className="text-xs text-slate-400 font-medium">Filter aktif:</span>
                {activeCategory && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold rounded-lg">
                    {categories.find(c => c.slug === activeCategory)?.name || activeCategory}
                    <button onClick={() => handleCategory(null)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {activeTag && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold rounded-lg">
                    #{tags.find(t => t.slug === activeTag)?.name || activeTag}
                    <button onClick={() => handleTag(null)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {search && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold rounded-lg">
                    "{search}"
                    <button onClick={() => handleSearch("")}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-black text-slate-700 mb-1">Artikel tidak ditemukan</h3>
                <p className="text-slate-400 text-sm mb-6">Coba ubah kata kunci atau hapus filter</p>
                <button onClick={handleClear}
                  className="px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl text-sm shadow-lg shadow-blue-100">
                  Reset Filter
                </button>
              </motion.div>
            ) : (
              <motion.div key="grid"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.filter(p => !!p.slug).map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* pagination */}
          {!loading && (
            <div className="mt-14">
              <Pagination
                page={meta.page}
                totalPages={meta.total_pages}
                total={meta.total}
                itemLabel="artikel"
                onPageChange={handlePage}
                variant="public"
              />
            </div>
          )}

        </div>
      </section>
    </div>
  )
}