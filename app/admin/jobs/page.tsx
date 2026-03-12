"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import { adminDelete, adminPatch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Job } from "@/types"
import {
  Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight,
  MapPin, Globe, Briefcase, Eye, DollarSign, Tag,
} from "lucide-react"
import Link from "next/link"
import Pagination from "@/components/ui/pagination"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

interface JobsResponse {
  data: Job[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

function getThumbnailUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [meta, setMeta] = useState({ page: 1, total_pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  async function loadJobs(currentPage: number, currentSearch: string) {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/jobs?page=${currentPage}&per_page=12&search=${currentSearch}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json: JobsResponse = await res.json()
      setJobs(json.data ?? [])
      setMeta(json.meta ?? { page: 1, total_pages: 1, total: 0 })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs(page, search)
  }, [page, search])

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    setPage(1)
  }

  async function handleToggle(id: number) {
    const token = getToken(); if (!token) return
    await adminPatch(`jobs/${id}/toggle`, {}, token)
    loadJobs(page, search)
  }

  async function handleDelete(id: number) {
    const token = getToken(); if (!token) return
    await adminDelete(`jobs/${id}`, token)
    setDeleteId(null)
    loadJobs(page, search)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a3c6e]">Lowongan</h1>
          <p className="text-slate-400 text-sm mt-0.5">{meta.total} total lowongan</p>
        </div>
        <Link href="/admin/jobs/create" className="flex items-center gap-2 px-4 py-2 bg-[#1a3c6e] hover:bg-[#15336b] text-white text-sm font-medium rounded-xl transition shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Lowongan
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text" placeholder="Cari lowongan..." value={search}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e] transition shadow-sm"
        />
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm bg-white border border-slate-200 rounded-2xl">
          Belum ada lowongan
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer"
                onClick={() => router.push(`/admin/jobs/${job.id}`)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-[#1a3c6e]/10 to-[#1a3c6e]/5 overflow-hidden">
                  {job.thumbnail_url ? (
                    <img
                      src={getThumbnailUrl(job.thumbnail_url)!}
                      alt={job.title}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-300" style={{ objectFit: "fill" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Briefcase className="w-10 h-10 text-[#1a3c6e]/20" />
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm ${job.is_active ? "bg-green-500/90 text-white" : "bg-black/40 text-white"}`}>
                      {job.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#1a3c6e]/80 text-white backdrop-blur-sm">
                      {job.type === "job" ? "Kerja" : "Magang"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-2">{job.title}</h3>

                  <div className="space-y-1 mb-3">
                    {job.country?.name && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        <span>{job.country.name}{job.city ? `, ${job.city}` : ""}</span>
                      </div>
                    )}
                    {job.sector && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Tag className="w-3 h-3 flex-shrink-0" />
                        <span>{job.sector}</span>
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <DollarSign className="w-3 h-3 flex-shrink-0" />
                        <span>{job.salary} {job.salary_currency}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-3 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/admin/jobs/${job.id}`)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1a3c6e]/10 transition-colors text-slate-400 hover:text-[#1a3c6e]"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(job.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                      title={job.is_active ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {job.is_active
                        ? <ToggleRight className="w-4 h-4 text-green-500" />
                        : <ToggleLeft className="w-4 h-4 text-slate-400" />
                      }
                    </button>
                    <button
                      onClick={() => router.push(`/admin/jobs/${job.id}/edit`)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-[#1a3c6e]"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(job.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500 ml-auto"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={meta.total_pages}
        total={meta.total}
        itemLabel="lowongan"
        onPageChange={setPage}
        variant="admin"
      />

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-base font-semibold text-slate-800">Hapus Lowongan?</h3>
                <p className="text-sm text-slate-400 mt-1">Lowongan dan form pendaftarannya akan dihapus. Data pelamar yang sudah masuk tetap tersimpan.</p>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2 text-sm font-medium border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">Batal</button>
                  <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition">Hapus</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}