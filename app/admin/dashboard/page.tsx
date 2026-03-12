"use client"

import { useEffect, useState } from "react"
import { getToken } from "@/lib/auth"
import { adminGet } from "@/lib/api"
import { motion } from "framer-motion"
import {
  Briefcase,
  Users,
  BookOpen,
  MessageSquare,
  GraduationCap,
  TrendingUp,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

interface DashboardData {
  stats: {
    total_jobs: number
    total_active_jobs: number
    total_applicants: number
    total_language_registrations: number
    total_unread_messages: number
  }
  recent_applicants: {
    id: number
    full_name: string
    job_title: string
    job_id: number | null
    status: string
    created_at: string
  }[]
  recent_language_registrations: {
    id: number
    first_name: string
    last_name: string
    class_type: string
    status: string
    created_at: string
  }[]
}

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  reviewed: "bg-blue-50 text-blue-600 border border-blue-200",
  accepted: "bg-green-50 text-green-600 border border-green-200",
  rejected: "bg-red-50 text-red-500 border border-red-200",
}

const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  reviewed: "Ditinjau",
  accepted: "Diterima",
  rejected: "Ditolak",
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
} as const

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
} as const

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    adminGet<DashboardData>("dashboard", token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = data
    ? [
        {
          label: "Total Lowongan",
          value: data.stats.total_jobs,
          icon: Briefcase,
          color: "text-[#1a3c6e]",
          bg: "bg-[#1a3c6e]/10",
        },
        {
          label: "Lowongan Aktif",
          value: data.stats.total_active_jobs,
          icon: Briefcase,
          color: "text-green-600",
          bg: "bg-green-50",
        },
        {
          label: "Total Pelamar",
          value: data.stats.total_applicants,
          icon: Users,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Kelas Bahasa",
          value: data.stats.total_language_registrations,
          icon: GraduationCap,
          color: "text-purple-600",
          bg: "bg-purple-50",
        },
        {
          label: "Pesan Belum Dibaca",
          value: data.stats.total_unread_messages,
          icon: MessageSquare,
          color: "text-pink-600",
          bg: "bg-pink-50",
        },
      ]
    : []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold text-[#1a3c6e]">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Selamat datang kembali 👋</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm cursor-default"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a3c6e]">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Applicants */}
        <motion.div
          variants={item}
          className="bg-white border border-slate-200 rounded-xl shadow-sm"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1a3c6e]" />
            <h2 className="font-semibold text-[#1a3c6e] text-sm">Pelamar Terbaru</h2>
          </div>
          {data?.recent_applicants && data.recent_applicants.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.recent_applicants.map((applicant) => (
                <motion.div
                  key={applicant.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-5 py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{applicant.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{applicant.job_title ?? "-"}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusStyle[applicant.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {statusLabel[applicant.status] ?? applicant.status}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-slate-400 text-sm">Belum ada pelamar</div>
          )}
        </motion.div>

        {/* Recent Language Registrations */}
        <motion.div
          variants={item}
          className="bg-white border border-slate-200 rounded-xl shadow-sm"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#1a3c6e]" />
            <h2 className="font-semibold text-[#1a3c6e] text-sm">Pendaftaran Kelas Bahasa</h2>
          </div>
          {data?.recent_language_registrations && data.recent_language_registrations.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.recent_language_registrations.map((reg) => (
                <motion.div
                  key={reg.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-5 py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{reg.first_name} {reg.last_name}</p>
                    <p className="text-xs text-slate-400 truncate">{reg.class_type?.replace(/_/g, " ") ?? "-"}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(reg.created_at)}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-slate-400 text-sm">Belum ada pendaftaran</div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}