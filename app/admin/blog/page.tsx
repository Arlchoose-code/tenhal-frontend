"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import { adminDelete, adminPatch, adminPostForm, adminPutForm, adminPost } from "@/lib/api"
import Pagination from "@/components/ui/pagination"
import { motion, AnimatePresence } from "framer-motion"
import { BlogPost, BlogCategory, BlogTag } from "@/types"
import {
  Plus, Search, Pencil, Trash2, Eye, ToggleLeft, ToggleRight,
  BookOpen, Tag, X, ChevronDown,
} from "lucide-react"
import Link from "next/link"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function imgUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}

interface PostsResponse {
  data: BlogPost[]
  meta: { total: number; total_pages: number; page: number }
}

type Tab = "posts" | "categories" | "tags"

export default function BlogPage() {
  const [tab, setTab] = useState<Tab>("posts")

  // ── Posts ──
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [postsMeta, setPostsMeta] = useState({ total: 0, total_pages: 1, page: 1 })
  const [postsLoading, setPostsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [deletePostId, setDeletePostId] = useState<number | null>(null)

  // ── Categories ──
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [catsMeta, setCatsMeta] = useState({ total: 0, total_pages: 1, page: 1 })
  const [catsPage, setCatsPage] = useState(1)
  const [catsSearch, setCatsSearch] = useState("")
  const [catsLoading, setCatsLoading] = useState(true)
  const [newCatName, setNewCatName] = useState("")
  const [catSaving, setCatSaving] = useState(false)
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null)
  const [editCatId, setEditCatId] = useState<number | null>(null)
  const [editCatName, setEditCatName] = useState("")
  const [editCatSaving, setEditCatSaving] = useState(false)

  // ── Tags ──
  const [tags, setTags] = useState<BlogTag[]>([])
  const [tagsMeta, setTagsMeta] = useState({ total: 0, total_pages: 1, page: 1 })
  const [tagsPage, setTagsPage] = useState(1)
  const [tagsSearch, setTagsSearch] = useState("")
  const [tagsLoading, setTagsLoading] = useState(true)
  const [newTagName, setNewTagName] = useState("")
  const [tagSaving, setTagSaving] = useState(false)
  const [deleteTagId, setDeleteTagId] = useState<number | null>(null)
  const [editTagId, setEditTagId] = useState<number | null>(null)
  const [editTagName, setEditTagName] = useState("")
  const [editTagSaving, setEditTagSaving] = useState(false)

  async function loadPosts(p = page, s = search) {
    const token = getToken(); if (!token) return
    setPostsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), per_page: "12", ...(s && { search: s }) })
      const res = await fetch(`/api/admin/blog/posts?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const json: PostsResponse = await res.json()
      setPosts(json.data ?? [])
      setPostsMeta(json.meta ?? { total: 0, total_pages: 1, page: 1 })
    } finally { setPostsLoading(false) }
  }

  async function loadCategories(p = catsPage, s = catsSearch) {
    const token = getToken(); if (!token) return
    setCatsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), per_page: "15", ...(s && { search: s }) })
      const res = await fetch(`/api/admin/blog/categories?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setCategories(json.data ?? [])
      setCatsMeta(json.meta ?? { total: 0, total_pages: 1, page: 1 })
    } finally { setCatsLoading(false) }
  }

  async function loadTags(p = tagsPage, s = tagsSearch) {
    const token = getToken(); if (!token) return
    setTagsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), per_page: "20", ...(s && { search: s }) })
      const res = await fetch(`/api/admin/blog/tags?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setTags(json.data ?? [])
      setTagsMeta(json.meta ?? { total: 0, total_pages: 1, page: 1 })
    } finally { setTagsLoading(false) }
  }

  useEffect(() => { loadPosts(page, search) }, [page, search])
  useEffect(() => { loadCategories(catsPage, catsSearch) }, [catsPage, catsSearch])
  useEffect(() => { loadTags(tagsPage, tagsSearch) }, [tagsPage, tagsSearch])

  async function handleTogglePublish(id: number) {
    const token = getToken(); if (!token) return
    await adminPatch(`blog/posts/${id}/toggle`, {}, token)
    loadPosts(page, search)
  }

  async function handleDeletePost(id: number) {
    const token = getToken(); if (!token) return
    await adminDelete(`blog/posts/${id}`, token)
    setDeletePostId(null)
    loadPosts(page, search)
  }

  async function handleCreateCategory() {
    if (!newCatName.trim()) return
    const token = getToken(); if (!token) return
    setCatSaving(true)
    const fd = new FormData(); fd.append("name", newCatName.trim())
    await adminPostForm("blog/categories", fd, token)
    setNewCatName("")
    await loadCategories()
    setCatSaving(false)
  }

  async function handleUpdateCategory(id: number) {
    if (!editCatName.trim()) return
    const token = getToken(); if (!token) return
    setEditCatSaving(true)
    const fd = new FormData(); fd.append("name", editCatName.trim())
    await adminPutForm(`blog/categories/${id}`, fd, token)
    setEditCatId(null)
    await loadCategories()
    setEditCatSaving(false)
  }

  async function handleDeleteCategory(id: number) {
    const token = getToken(); if (!token) return
    await adminDelete(`blog/categories/${id}`, token)
    setDeleteCatId(null)
    loadCategories(catsPage, catsSearch)
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return
    const token = getToken(); if (!token) return
    setTagSaving(true)
    const fd = new FormData(); fd.append("name", newTagName.trim())
    await adminPostForm("blog/tags", fd, token)
    setNewTagName("")
    await loadTags()
    setTagSaving(false)
  }

  async function handleUpdateTag(id: number) {
    if (!editTagName.trim()) return
    const token = getToken(); if (!token) return
    setEditTagSaving(true)
    const fd = new FormData(); fd.append("name", editTagName.trim())
    await adminPutForm(`blog/tags/${id}`, fd, token)
    setEditTagId(null)
    await loadTags()
    setEditTagSaving(false)
  }

  async function handleDeleteTag(id: number) {
    const token = getToken(); if (!token) return
    await adminDelete(`blog/tags/${id}`, token)
    setDeleteTagId(null)
    loadTags(tagsPage, tagsSearch)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a3c6e]">Blog</h1>
          <p className="text-slate-400 text-sm mt-0.5">{postsMeta.total} total artikel</p>
        </div>
        {tab === "posts" && (
          <Link href="/admin/blog/create" className="flex items-center gap-2 px-4 py-2 bg-[#1a3c6e] hover:bg-[#15336b] text-white text-sm font-medium rounded-xl transition shadow-sm">
            <Plus className="w-4 h-4" /> Tulis Artikel
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["posts", "categories", "tags"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${tab === t ? "bg-white text-[#1a3c6e] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "posts" ? "Artikel" : t === "categories" ? "Kategori" : "Tag"}
          </button>
        ))}
      </div>

      {/* ── POSTS TAB ── */}
      {tab === "posts" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Cari artikel..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm" />
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-slate-200" />
                  <div className="p-4 space-y-2"><div className="h-4 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-200 rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Belum ada artikel</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post, index) => (
                <motion.div key={post.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                    {post.thumbnail_url ? (
                      <img src={imgUrl(post.thumbnail_url)!} alt={post.title} className="w-full h-full group-hover:scale-105 transition-transform duration-300" style={{ objectFit: "fill" }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-slate-200" /></div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm ${post.is_published ? "bg-green-500/90 text-white" : "bg-black/40 text-white"}`}>
                        {post.is_published ? "Publik" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-1">{post.title}</h3>
                    <p className="text-xs text-slate-400 mb-3">
                      {post.category_name || post.category?.name || "Tanpa kategori"}
                    </p>
                    <div className="flex items-center gap-1 pt-3 border-t border-slate-100">
                      <Link href={`/admin/blog/${post.id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1a3c6e]/10 transition text-slate-400 hover:text-[#1a3c6e]">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleTogglePublish(post.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition">
                        {post.is_published
                          ? <ToggleRight className="w-4 h-4 text-green-500" />
                          : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                      </button>
                      <Link href={`/admin/blog/${post.id}/edit`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-[#1a3c6e]">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setDeletePostId(post.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition text-slate-400 hover:text-red-500 ml-auto">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <Pagination
              page={page}
              totalPages={postsMeta.total_pages}
              total={postsMeta.total}
              itemLabel="artikel"
              onPageChange={setPage}
              variant="admin"
            />
        </div>
      )}

      {/* ── CATEGORIES TAB ── */}
      {tab === "categories" && (
        <div className="space-y-4">
          {/* add new */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3">
            <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleCreateCategory() }}
              placeholder="Nama kategori baru..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
            <button onClick={handleCreateCategory} disabled={catSaving || !newCatName.trim()}
              className="px-4 py-2 bg-[#1a3c6e] hover:bg-[#15336b] text-white text-sm font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>

          {/* search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Cari kategori..." value={catsSearch}
              onChange={e => { setCatsSearch(e.target.value); setCatsPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {catsLoading ? (
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center justify-between animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3" /><div className="h-6 w-16 bg-slate-200 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">Belum ada kategori</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {categories.map(cat => (
                  <div key={cat.id} className="px-5 py-3.5 flex items-center justify-between group">
                    {editCatId === cat.id ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          autoFocus
                          value={editCatName}
                          onChange={e => setEditCatName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleUpdateCategory(cat.id); if (e.key === "Escape") setEditCatId(null) }}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-[#1a3c6e]/30 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition"
                        />
                        <button onClick={() => handleUpdateCategory(cat.id)} disabled={editCatSaving || !editCatName.trim()}
                          className="px-3 py-1.5 bg-[#1a3c6e] text-white text-xs font-medium rounded-lg hover:bg-[#15336b] transition disabled:opacity-50">
                          {editCatSaving ? "..." : "Simpan"}
                        </button>
                        <button onClick={() => setEditCatId(null)} className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-50 transition">
                          Batal
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{cat.name}</p>
                          <p className="text-xs text-slate-400">{cat.slug}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => { setEditCatId(cat.id); setEditCatName(cat.name) }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a3c6e]/10 text-slate-300 hover:text-[#1a3c6e] transition">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteCatId(cat.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* pagination */}
          <Pagination
            page={catsPage}
            totalPages={catsMeta.total_pages}
            total={catsMeta.total}
            itemLabel="kategori"
            onPageChange={p => setCatsPage(p)}
            variant="admin"
          />
        </div>
      )}

      {/* ── TAGS TAB ── */}
      {tab === "tags" && (
        <div className="space-y-4">
          {/* add new */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3">
            <input value={newTagName} onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleCreateTag() }}
              placeholder="Nama tag baru..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition" />
            <button onClick={handleCreateTag} disabled={tagSaving || !newTagName.trim()}
              className="px-4 py-2 bg-[#1a3c6e] hover:bg-[#15336b] text-white text-sm font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>

          {/* search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Cari tag..." value={tagsSearch}
              onChange={e => { setTagsSearch(e.target.value); setTagsPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            {tagsLoading ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-7 w-20 bg-slate-200 rounded-full animate-pulse" />)}
              </div>
            ) : tags.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Belum ada tag</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {tags.map(tag => (
                  <div key={tag.id} className="px-1 py-3 flex items-center justify-between group">
                    {editTagId === tag.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          autoFocus
                          value={editTagName}
                          onChange={e => setEditTagName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleUpdateTag(tag.id); if (e.key === "Escape") setEditTagId(null) }}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-[#1a3c6e]/30 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition"
                        />
                        <button onClick={() => handleUpdateTag(tag.id)} disabled={editTagSaving || !editTagName.trim()}
                          className="px-3 py-1.5 bg-[#1a3c6e] text-white text-xs font-medium rounded-lg hover:bg-[#15336b] transition disabled:opacity-50">
                          {editTagSaving ? "..." : "Simpan"}
                        </button>
                        <button onClick={() => setEditTagId(null)} className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-50 transition">
                          Batal
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm text-slate-700">{tag.name}</span>
                          <span className="text-xs text-slate-400">{tag.slug}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => { setEditTagId(tag.id); setEditTagName(tag.name) }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a3c6e]/10 text-slate-300 hover:text-[#1a3c6e] transition">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTagId(tag.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* pagination */}
          <Pagination
            page={tagsPage}
            totalPages={tagsMeta.total_pages}
            total={tagsMeta.total}
            itemLabel="tag"
            onPageChange={p => setTagsPage(p)}
            variant="admin"
          />
        </div>
      )}

      {/* Delete Modals */}
      {[
        { id: deletePostId, onClose: () => setDeletePostId(null), onConfirm: () => handleDeletePost(deletePostId!), label: "artikel ini" },
        { id: deleteCatId, onClose: () => setDeleteCatId(null), onConfirm: () => handleDeleteCategory(deleteCatId!), label: "kategori ini. Blog yang menggunakannya tetap ada" },
        { id: deleteTagId, onClose: () => setDeleteTagId(null), onConfirm: () => handleDeleteTag(deleteTagId!), label: "tag ini. Blog yang menggunakannya tetap ada" },
      ].map((modal, i) => (
        <AnimatePresence key={i}>
          {modal.id && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={modal.onClose} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm pointer-events-auto">
                  <h3 className="text-base font-semibold text-slate-800">Hapus?</h3>
                  <p className="text-sm text-slate-400 mt-1">Yakin hapus {modal.label}?</p>
                  <div className="flex gap-3 mt-5">
                    <button onClick={modal.onClose} className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">Batal</button>
                    <button onClick={modal.onConfirm} className="flex-1 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition">Hapus</button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      ))}
    </motion.div>
  )
}