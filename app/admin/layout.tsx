"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getToken } from "@/lib/auth"
import { cn } from "@/lib/utils"
import Sidebar from "@/components/admin/Sidebar"
import Topbar from "@/components/admin/Topbar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (pathname === "/admin/login") return
    const token = getToken()
    if (!token) router.replace("/admin/login")
  }, [pathname, router])

  if (!mounted) return null
  if (pathname === "/admin/login") return <>{children}</>

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 h-full">
        <Sidebar />
      </aside>

      {/* Sidebar mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 flex flex-col transition-transform duration-300 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar
          sidebarOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className={`flex-1 overflow-hidden ${pathname.startsWith("/admin/email/inbox") || pathname.startsWith("/admin/email/sent") || pathname.startsWith("/admin/email/failed") ? "flex flex-col" : "overflow-y-auto p-6"}`}>
          {children}
        </main>
      </div>
    </div>
  )
}