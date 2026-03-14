"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { clearTokens, getToken } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import {
  LayoutDashboard, Briefcase, Users, BookOpen, MessageSquare,
  GraduationCap, Globe, Settings, LogOut, ChevronRight,
  Mail, Inbox, Send, AlertCircle, Settings2, ChevronDown,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard",              label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/jobs",                   label: "Lowongan",     icon: Briefcase },
  { href: "/admin/applicants",             label: "Pelamar",      icon: Users,          countKey: "applicants" },
  { href: "/admin/language-registrations", label: "Kelas Bahasa", icon: GraduationCap,  countKey: "language" },
  { href: "/admin/blog",                   label: "Blog",         icon: BookOpen },
  { href: "/admin/contacts",               label: "Pesan Masuk",  icon: MessageSquare,  countKey: "contacts" },
  { href: "/admin/team-members",           label: "Tim",          icon: Users },
  { href: "/admin/countries",              label: "Negara",       icon: Globe },
  { href: "/admin/settings",               label: "Pengaturan",   icon: Settings },
]

const emailSubItems = [
  { href: "/admin/email/inbox",    label: "Kotak Masuk",     icon: Inbox,        countKey: "inbox" },
  { href: "/admin/email/sent",     label: "Terkirim",        icon: Send,         countKey: "sent" },
  { href: "/admin/email/failed",   label: "Gagal",           icon: AlertCircle,  countKey: "failed" },
  { href: "/admin/email/settings", label: "Pengaturan SMTP", icon: Settings2,    countKey: null },
]

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [emailOpen, setEmailOpen] = useState(pathname.startsWith("/admin/email"))
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [navCounts, setNavCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (pathname.startsWith("/admin/email")) setEmailOpen(true)
  }, [pathname])

  useEffect(() => {
    function fetchCounts() {
      const token = getToken()
      if (!token) return
      fetch("/api/admin/email/counts", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(json => { if (json.data) setCounts(json.data) })
        .catch(() => {})
    }
    function fetchNavCounts() {
      const token = getToken()
      if (!token) return
      fetch("/api/admin/sidebar-counts", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(json => { if (json.data) setNavCounts(json.data) })
        .catch(() => {})
    }
    fetchCounts()
    fetchNavCounts()
    const t = setTimeout(() => { fetchCounts(); fetchNavCounts() }, 1000)
    window.addEventListener("email:read", fetchCounts)
    // Listen event dari halaman lain (contacts read, applicant update, dll)
    window.addEventListener("sidebar:refresh", () => { fetchCounts(); fetchNavCounts() })
    return () => {
      clearTimeout(t)
      window.removeEventListener("email:read", fetchCounts)
      window.removeEventListener("sidebar:refresh", () => {})
    }
  }, [])

  function handleLogout() {
    clearTokens()
    router.replace("/admin/login")
  }

  return (
    <div className="h-full flex flex-col bg-[#1a3c6e]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-[#1a3c6e] font-black text-sm">T</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Tenhal <span className="text-blue-300">Admin</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <motion.div key={item.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}>
              <Link href={item.href} onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                )}>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  isActive ? "bg-white shadow-sm" : "bg-white/10 group-hover:bg-white/15")}>
                  <item.icon className={cn("w-3.5 h-3.5 transition-all duration-200",
                    isActive ? "text-[#1a3c6e]" : "text-white/70 group-hover:text-white")} />
                </div>
                <span className="flex-1">{item.label}</span>
                {"countKey" in item && item.countKey && navCounts[item.countKey] > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {navCounts[item.countKey] > 99 ? "99+" : navCounts[item.countKey]}
                  </span>
                )}
                {isActive && !("countKey" in item && item.countKey && navCounts[item.countKey] > 0) && (
                  <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          )
        })}

        {/* Email Dropdown */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: navItems.length * 0.04, duration: 0.3, ease: "easeOut" }}>
          <button onClick={() => setEmailOpen(v => !v)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
              pathname.startsWith("/admin/email") ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
            )}>
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
              pathname.startsWith("/admin/email") ? "bg-white shadow-sm" : "bg-white/10 group-hover:bg-white/15")}>
              <Mail className={cn("w-3.5 h-3.5 transition-all duration-200",
                pathname.startsWith("/admin/email") ? "text-[#1a3c6e]" : "text-white/70 group-hover:text-white")} />
            </div>
            <span className="flex-1 text-left">Email</span>
            {(counts.inbox > 0) && (
              <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                {counts.inbox > 99 ? "99+" : counts.inbox}
              </span>
            )}
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", emailOpen && "rotate-180")} />
          </button>

          <AnimatePresence initial={false}>
            {emailOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="mt-0.5 ml-3 pl-3 border-l border-white/10 space-y-0.5 py-1">
                  {emailSubItems.map(sub => {
                    const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/")
                    const count = sub.countKey ? counts[sub.countKey] : null
                    return (
                      <Link key={sub.href} href={sub.href} onClick={onClose}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group",
                          isSubActive ? "bg-white/20 text-white" : "text-white/50 hover:text-white hover:bg-white/10"
                        )}>
                        <sub.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="flex-1">{sub.label}</span>
                        {count != null && count > 0 && (
                          <span className={cn("text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center",
                            sub.countKey === "inbox" ? "bg-red-500 text-white" :
                            sub.countKey === "failed" ? "bg-orange-500 text-white" :
                            "bg-white/20 text-white")}>
                            {count > 99 ? "99+" : count}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 group">
          <div className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-red-400/10 flex items-center justify-center flex-shrink-0 transition-all duration-200">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}