import { fetchPublic } from "@/lib/api"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

async function getSiteSettings() {
  try {
    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"
    const res = await fetch(`${BACKEND_URL}/api/v1/public/site-settings`, {
      next: { tags: ["site-settings"] },
    })
    if (!res.ok) return {}
    const json = await res.json()
    return json.data ?? {}
  } catch {
    return {}
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <>
      <Navbar settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  )
}