"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { clearTokens } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Globe,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Lowongan", icon: Briefcase },
  { href: "/admin/applicants", label: "Pelamar", icon: Users },
  { href: "/admin/language-registrations", label: "Kelas Bahasa", icon: GraduationCap },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/contacts", label: "Pesan Masuk", icon: MessageSquare },
  { href: "/admin/team-members", label: "Tim", icon: Users },
  { href: "/admin/countries", label: "Negara", icon: Globe },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

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
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  isActive
                    ? "bg-white shadow-sm"
                    : "bg-white/10 group-hover:bg-white/15"
                )}>
                  <item.icon className={cn(
                    "w-3.5 h-3.5 transition-all duration-200",
                    isActive ? "text-[#1a3c6e]" : "text-white/70 group-hover:text-white"
                  )} />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 group"
        >
          <div className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-red-400/10 flex items-center justify-center flex-shrink-0 transition-all duration-200">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}