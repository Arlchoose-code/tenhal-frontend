import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
function imgUrl(url: string) {
  if (!url) return null
  if (url.startsWith("http")) return url.replace(/^https?:\/\/[^/]+/, "")
  return `${BACKEND_URL}/${url}`
}

interface FooterProps {
  settings: Record<string, string>
}

export default function Footer({ settings }: FooterProps) {
  const logoUrl = imgUrl(settings["logo_url"] || "")
  const siteName = settings["seo_site_name"] || "Tenhal Bekerja Bersama"
  const copyright = settings["copyright"] || `© ${new Date().getFullYear()} PT Tenhal Bekerja Bersama`
  const whatsapp = settings["whatsapp"] || ""

  return (
    <footer className="bg-[#0f2548] text-white">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={siteName} width={160} height={48} className="h-12 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold text-white">{siteName}</span>
              )}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              {settings["seo_description"] || "Membantu tenaga kerja Indonesia mendapatkan pekerjaan impian di Eropa dengan bimbingan profesional dan pendampingan penuh."}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {settings["instagram_url"] && (
                <a href={settings["instagram_url"]} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-[#1a3c6e] rounded-lg flex items-center justify-center transition">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings["facebook_url"] && (
                <a href={settings["facebook_url"]} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-[#1a3c6e] rounded-lg flex items-center justify-center transition">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings["linkedin_url"] && (
                <a href={settings["linkedin_url"]} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-[#1a3c6e] rounded-lg flex items-center justify-center transition">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings["youtube_url"] && (
                <a href={settings["youtube_url"]} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-[#1a3c6e] rounded-lg flex items-center justify-center transition">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/10 hover:bg-[#1a3c6e] rounded-lg flex items-center justify-center transition text-xs font-bold">
                  WA
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Navigasi</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Tentang Kami", href: "/tentang-kami" },
                { label: "Lowongan Kerja", href: "/layanan/lowongan" },
                { label: "Blog", href: "/blog" },
                { label: "Hubungi Kami", href: "/hubungi-kami" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-300 hover:text-white transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              {settings["email"] && (
                <li>
                  <a href={`mailto:${settings["email"]}`} className="hover:text-white transition">
                    {settings["email"]}
                  </a>
                </li>
              )}
              {settings["phone"] && (
                <li>
                  <a href={`tel:${settings["phone"]}`} className="hover:text-white transition">
                    {settings["phone"]}
                  </a>
                </li>
              )}
              {settings["address"] && (
                <li className="leading-relaxed">{settings["address"]}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">{copyright}</p>
          <p className="text-xs text-slate-500">Powered by Tenhal</p>
        </div>
      </div>
    </footer>
  )
}