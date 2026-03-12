"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import { adminDelete, adminPatch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Pencil, Trash2, ToggleLeft, ToggleRight,
  Calendar, Tag, BookOpen, Eye, AlertCircle, User,
} from "lucide-react"
import Link from "next/link"
import { BlogPost } from "@/types"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function imgUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}
function formatDate(dateStr: string) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace("/admin/login"); return }
    fetch(`/api/admin/blog/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { if (j.success) setPost(j.data); else setError("Artikel tidak ditemukan") })
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false))
  }, [id])

  async function handleToggle() {
    const token = getToken(); if (!token || !post) return
    await adminPatch(`blog/posts/${post.id}/toggle`, {}, token)
    setPost(prev => prev ? { ...prev, is_published: !prev.is_published } : null)
  }

  async function handleDelete() {
    const token = getToken(); if (!token || !post) return
    await adminDelete(`blog/posts/${post.id}`, token)
    router.push("/admin/blog")
  }

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-48" />
      <div className="h-56 bg-slate-200 rounded-xl" />
      <div className="h-48 bg-slate-200 rounded-xl" />
    </div>
  )

  if (error || !post) return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/blog" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-[#1a3c6e]">Detail Artikel</h1>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-600">{error || "Artikel tidak ditemukan"}</p>
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#1a3c6e]">{post.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.is_published ? "bg-green-50 text-green-600 border border-green-200" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                {post.is_published ? "Publik" : "Draft"}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">Dibuat {formatDate(post.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleToggle}
            className={`px-3 py-2 text-sm font-medium rounded-xl border transition ${post.is_published ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "border-green-200 text-green-600 bg-green-50 hover:bg-green-100"}`}>
            {post.is_published
              ? <><ToggleRight className="w-4 h-4 inline mr-1.5 text-green-500" />Sembunyikan</>
              : <><ToggleLeft className="w-4 h-4 inline mr-1.5" />Publikasikan</>}
          </button>
          <Link href={`/admin/blog/${post.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-[#1a3c6e] hover:bg-[#15336b] text-white transition">
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button onClick={() => setShowDelete(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Konten utama */}
        <div className="col-span-2 space-y-5">

          {/* Thumbnail */}
          {post.thumbnail_url && (
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img src={imgUrl(post.thumbnail_url)!} alt={post.title} className="w-full h-full" style={{ objectFit: "fill" }} />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-600 italic">{post.excerpt}</p>
            </div>
          )}

          {/* Konten */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-[#1a3c6e]">Konten Artikel</h2>
            </div>
            {post.content ? (
              <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <p className="text-sm text-slate-400 italic">Belum ada konten</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Info Artikel</h3>

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Penulis</p>
                <p className="text-sm font-medium text-slate-700">{post.author?.name ?? "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Kategori</p>
                <p className="text-sm font-medium text-slate-700">{post.category_name || post.category?.name || "Tanpa kategori"}</p>
              </div>
            </div>

            {post.published_at && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Dipublikasikan</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(post.published_at)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Terakhir diubah</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(post.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tag</h3>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(tag => (
                  <span key={tag.id} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                    <Tag className="w-3 h-3 text-slate-400" />{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</h3>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${post.is_published ? "bg-green-50" : "bg-slate-100"}`}>
              <Eye className={`w-4 h-4 ${post.is_published ? "text-green-500" : "text-slate-400"}`} />
              <span className={`text-sm font-medium ${post.is_published ? "text-green-700" : "text-slate-500"}`}>
                {post.is_published ? "Publik & Ditampilkan" : "Draft (Tersembunyi)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowDelete(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm pointer-events-auto">
                <h3 className="text-base font-semibold text-slate-800">Hapus Artikel?</h3>
                <p className="text-sm text-slate-400 mt-1">Artikel ini akan dihapus permanen dan tidak bisa dikembalikan.</p>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowDelete(false)} className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">Batal</button>
                  <button onClick={handleDelete} className="flex-1 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition">Hapus</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}