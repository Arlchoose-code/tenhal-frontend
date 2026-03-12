"use client"

import { usePathname } from "next/navigation"
import { Menu, X, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navLabels: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/jobs": "Lowongan",
  "/admin/applicants": "Pelamar",
  "/admin/language-registrations": "Kelas Bahasa",
  "/admin/blog": "Blog",
  "/admin/contacts": "Pesan Masuk",
  "/admin/team-members": "Tim",
  "/admin/countries": "Negara",
  "/admin/settings": "Pengaturan",
}

interface TopbarProps {
  sidebarOpen: boolean
  onToggle: () => void
}

export default function Topbar({ sidebarOpen, onToggle }: TopbarProps) {
  const pathname = usePathname()

  const label = Object.entries(navLabels).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? "Admin"

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 sticky top-0 z-10 flex-shrink-0">
      <button
        onClick={onToggle}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {sidebarOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">Admin</span>
        <span className="text-slate-300">/</span>
        <motion.span
          key={label}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="font-medium text-[#1a3c6e]"
        >
          {label}
        </motion.span>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#1a3c6e] flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
      </div>
    </header>
  )
}