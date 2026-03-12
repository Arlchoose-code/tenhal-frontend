import type { Metadata } from "next"
import PelatihanBahasaClient from "./PelatihanBahasaClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

export const metadata: Metadata = { title: "Pelatihan Bahasa" }

async function getPageContent() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/page-content/layanan`, { next: { tags: ["page-content"] } })
    if (!res.ok) return {}
    const json = await res.json()
    return json.data ?? {}
  } catch { return {} }
}

async function getSiteSettings() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/site-settings`, { next: { tags: ["site-settings"] } })
    if (!res.ok) return {}
    const json = await res.json()
    return json.data ?? {}
  } catch { return {} }
}

export default async function PelatihanBahasaPage() {
  const [pageContent, settings] = await Promise.all([getPageContent(), getSiteSettings()])
  return <PelatihanBahasaClient pageContent={pageContent} settings={settings} />
}