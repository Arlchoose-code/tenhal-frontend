"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getToken } from "@/lib/auth"
import { adminGet, adminPutForm } from "@/lib/api"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { BlogPost, BlogCategory, BlogTag } from "@/types"
import RichTextEditor from "@/components/admin/RichTextEditor"
import BlogCategorySelect from "@/components/admin/BlogCategorySelect"
import BlogTagPicker from "@/components/admin/BlogTagPicker"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function imgUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState("")

  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", category_id: "", is_published: false,
  })

  useEffect(() => {
    const token = getToken(); if (!token) return
    Promise.all([
      adminGet<BlogPost>(`blog/posts/${id}`, token),
      adminGet<BlogCategory[]>("blog/categories", token),
      adminGet<BlogTag[]>("blog/tags", token),
    ]).then(([post, cats, allTags]) => {
      setForm({
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        category_id: post.category_id ? String(post.category_id) : "",
        is_published: post.is_published,
      })
      setSelectedTags(post.tags?.map(t => t.id) ?? [])
      if (post.thumbnail_url) setThumbnailPreview(imgUrl(post.thumbnail_url))
      setCategories(cats)
      setTags(allTags)
    }).catch(console.error).finally(() => setPageLoading(false))
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function toggleTag(tagId: number) {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId])
  }

  function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setThumbnail(file); setThumbnailPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true)
    const token = getToken(); if (!token) return
    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("excerpt", form.excerpt)
      fd.append("content", form.content)
      fd.append("is_published", form.is_published ? "true" : "false")
      if (form.category_id) fd.append("category_id", form.category_id)
      fd.append("tag_ids", selectedTags.join(","))
      if (thumbnail) fd.append("thumbnail", thumbnail)
      const res = await adminPutForm(`blog/posts/${id}`, fd, token)
      if (res.success) router.push("/admin/blog")
      else setError(res.message || "Gagal menyimpan artikel")
    } catch { setError("Terjadi kesalahan") }
    finally { setLoading(false) }
  }

  if (pageLoading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-48" />
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-slate-200 rounded-lg" />)}
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/blog" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1a3c6e]">Edit Artikel</h1>
          <p className="text-slate-400 text-sm mt-0.5">Perbarui isi artikel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1a3c6e]">Informasi Artikel</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Judul <span className="text-red-400">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="Masukkan judul artikel..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Ringkasan (Excerpt)</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2}
              placeholder="Ringkasan singkat artikel..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Kategori</label>
            <BlogCategorySelect
              categories={categories}
              value={form.category_id}
              onChange={id => setForm(prev => ({ ...prev, category_id: id }))}
              onCategoryAdded={cat => setCategories(prev => [...prev, cat])}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1a3c6e]">Konten</h2>
          <RichTextEditor value={form.content} onChange={(val) => setForm(prev => ({ ...prev, content: val }))} placeholder="Tulis isi artikel di sini..." />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#1a3c6e]">Tag</h2>
          <BlogTagPicker
            tags={tags}
            selected={selectedTags}
            onToggle={toggleTag}
            onTagAdded={tag => { setTags(prev => [...prev, tag]); setSelectedTags(prev => [...prev, tag.id]) }}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1a3c6e]">Thumbnail</h2>
          {thumbnailPreview ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
              <img src={thumbnailPreview} alt="Preview" className="w-full h-full" style={{ objectFit: "fill" }} />
              <button type="button" onClick={() => { setThumbnail(null); setThumbnailPreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-slate-500 hover:text-red-500 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#1a3c6e]/40 hover:bg-slate-50 transition">
              <Upload className="w-6 h-6 text-slate-300 mb-2" />
              <span className="text-sm text-slate-400">Klik untuk upload thumbnail baru</span>
              <span className="text-xs text-slate-300 mt-1">JPG, PNG, WebP — maks 2MB</span>
              <input type="file" accept="image/*" onChange={handleThumbnail} className="hidden" />
            </label>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1a3c6e]">Publikasikan</p>
              <p className="text-xs text-slate-400 mt-0.5">Artikel tampil di halaman publik</p>
            </div>
            <div onClick={() => setForm(prev => ({ ...prev, is_published: !prev.is_published }))}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${form.is_published ? "bg-[#1a3c6e]" : "bg-slate-200"} relative flex-shrink-0`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </div>
        </div>

        {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <Link href="/admin/blog" className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition text-center">Batal</Link>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium bg-[#1a3c6e] hover:bg-[#15336b] text-white rounded-xl transition disabled:opacity-50 shadow-sm">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </motion.div>
  )
}