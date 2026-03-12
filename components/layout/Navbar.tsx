"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, Globe, MapPin, Mail, Phone } from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function imgUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${BACKEND_URL}/${url}`
}

// Real SVG social icons
const IgIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const LiIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const FbIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TtIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

const YtIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
)

interface NavbarProps { settings: Record<string, string> }

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  {
    label: "Layanan Tenhal", href: "#",
    children: [
      { label: "Lowongan Kerja", href: "/layanan/lowongan", desc: "Cari pekerjaan di luar negeri" },
      { label: "Pelatihan Bahasa", href: "/layanan/pelatihan-bahasa", desc: "Kursus intensif 7 minggu" },
      { label: "Magang", href: "/layanan/magang", desc: "Program magang di Eropa" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Hubungi Kami", href: "/hubungi-kami" },
]

export default function Navbar({ settings }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [layananOpen, setLayananOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const logoUrl = imgUrl(settings["logo_url"] || "")
  const siteName = settings["seo_site_name"] || "Tenhal"
  const whatsapp = settings["whatsapp"] || ""

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const isHome = pathname === "/"
  const transparent = !scrolled && isHome && !menuOpen

  const socials = [
    { key: "instagram_url", Icon: IgIcon, label: "Instagram", color: "hover:bg-pink-500" },
    { key: "linkedin_url", Icon: LiIcon, label: "LinkedIn", color: "hover:bg-blue-600" },
    { key: "facebook_url", Icon: FbIcon, label: "Facebook", color: "hover:bg-blue-500" },
    { key: "tiktok_url", Icon: TtIcon, label: "TikTok", color: "hover:bg-slate-700" },
    { key: "youtube_url", Icon: YtIcon, label: "YouTube", color: "hover:bg-red-600" },
  ].filter(s => settings[s.key])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* ── Top bar ── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
            style={{ background: "linear-gradient(90deg, #060f24 0%, #0f1f3d 40%, #1a3c6e 75%, #1565d8 100%)" }}
          >
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-2.5 flex items-center justify-between gap-4">
              {/* Left — contact info */}
              <div className="flex items-center gap-5 flex-wrap">
                <motion.a href={`tel:${settings["phone"] || ""}`} whileHover={{ x: 2 }}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition text-xs font-medium">
                  <Phone className="w-3 h-3 text-sky-400" />
                  <span className="hidden sm:inline">{settings["phone"] || "+62 821-2458-5755"}</span>
                </motion.a>
                <motion.a href={`mailto:${settings["email"] || ""}`} whileHover={{ x: 2 }}
                  className="hidden md:flex items-center gap-1.5 text-white/70 hover:text-white transition text-xs font-medium">
                  <Mail className="w-3 h-3 text-sky-400" />
                  <span>{settings["email"] || "info@tenhalbekerja.com"}</span>
                </motion.a>
                <motion.div whileHover={{ x: 2 }}
                  className="hidden lg:flex items-center gap-1.5 text-white/60 text-xs font-medium">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  <span>{settings["address"] || "Mampang Square, Unit B5, Jakarta"}</span>
                </motion.div>
              </div>

              {/* Right — social icons */}
              <div className="flex items-center gap-1">
                {socials.length > 0 ? socials.map(({ key, Icon, label, color }) => (
                  <motion.a key={key}
                    href={settings[key]} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -1 }} whileTap={{ scale: 0.9 }}
                    title={label}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white bg-white/10 ${color} transition-all duration-200`}>
                    <Icon />
                  </motion.a>
                )) : (
                  // Fallback: show placeholder social icons
                  [
                    { Icon: IgIcon, label: "Instagram", color: "hover:bg-pink-500" },
                    { Icon: LiIcon, label: "LinkedIn", color: "hover:bg-blue-600" },
                    { Icon: FbIcon, label: "Facebook", color: "hover:bg-blue-500" },
                  ].map(({ Icon, label, color }) => (
                    <div key={label}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white/40 bg-white/10 ${color} transition-all duration-200`}>
                      <Icon />
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main nav ── */}
      <motion.nav
        animate={{
          backgroundColor: transparent ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.97)",
          boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.10)" : "none",
        }}
        transition={{ duration: 0.3 }}
        className="backdrop-blur-md"
        style={transparent ? { background: "linear-gradient(to bottom, rgba(6,15,36,0.75) 0%, rgba(6,15,36,0) 100%)" } : {}}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-10 sm:h-11 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${transparent ? "bg-white/20 backdrop-blur-sm" : "bg-gradient-to-br from-[#1a3c6e] to-[#1565d8]"}`}>
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className={`font-black text-lg leading-none block transition-colors ${transparent ? "text-white" : "text-[#1a3c6e]"}`}>{siteName}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest leading-none transition-colors ${transparent ? "text-white/50" : "text-slate-400"}`}>Bekerja Bersama</span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} ref={dropdownRef} className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${transparent ? "text-white hover:bg-white/10" : "text-slate-700 hover:text-[#1a3c6e] hover:bg-[#e8f0fe]"}`}>
                    {link.label}
                    <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 pt-2 z-50">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-w-[220px] p-1.5">
                          {link.children.map((child, i) => (
                            <motion.div key={child.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                              <Link href={child.href} onClick={() => setDropdownOpen(false)}
                                className="flex flex-col px-4 py-3 rounded-xl hover:bg-[#e8f0fe] transition group">
                                <span className="text-sm font-semibold text-[#0f1f3d] group-hover:text-[#1a3c6e]">{child.label}</span>
                                <span className="text-xs text-slate-400 mt-0.5">{child.desc}</span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === link.href
                    ? transparent ? "bg-white/20 text-white" : "bg-[#e8f0fe] text-[#1a3c6e]"
                    : transparent ? "text-white hover:bg-white/10" : "text-slate-700 hover:text-[#1a3c6e] hover:bg-[#e8f0fe]"
                  }`}>
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            {whatsapp && (
              <motion.a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className={`hidden lg:inline-flex items-center px-5 py-2.5 text-sm font-bold rounded-xl transition-colors shadow-sm ${transparent ? "bg-white text-[#1a3c6e] hover:bg-white/90" : "bg-[#1a3c6e] text-white hover:bg-[#15336b]"}`}>
                Daftar Sekarang
              </motion.a>
            )}
            <motion.button onClick={() => setMenuOpen(!menuOpen)} whileTap={{ scale: 0.9 }}
              className={`lg:hidden p-2 rounded-xl transition-colors ${transparent ? "text-white hover:bg-white/10" : "text-[#1a3c6e] hover:bg-[#e8f0fe]"}`}>
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white/98 backdrop-blur-md border-t border-slate-100 shadow-xl">
            <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) =>
                link.children ? (
                  <motion.div key={link.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <button onClick={() => setLayananOpen(!layananOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 rounded-xl hover:bg-[#e8f0fe] hover:text-[#1a3c6e] transition">
                      {link.label}
                      <motion.span animate={{ rotate: layananOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4" />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {layananOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="pl-4 py-1 flex flex-col gap-0.5">
                            {link.children.map((child) => (
                              <Link key={child.href} href={child.href} onClick={() => setMenuOpen(false)}
                                className="px-4 py-2.5 text-sm text-slate-600 rounded-xl hover:bg-[#e8f0fe] hover:text-[#1a3c6e] transition">
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div key={link.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={link.href} onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-3 text-sm font-semibold rounded-xl transition ${pathname === link.href ? "bg-[#1a3c6e] text-white" : "text-slate-700 hover:bg-[#e8f0fe] hover:text-[#1a3c6e]"}`}>
                      {link.label}
                    </Link>
                  </motion.div>
                )
              )}
              {whatsapp && (
                <motion.a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 px-5 py-3.5 bg-[#1a3c6e] text-white text-sm font-bold rounded-xl text-center shadow-md">
                  Daftar Sekarang
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}