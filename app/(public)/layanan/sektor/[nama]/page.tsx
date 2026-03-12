import type { Metadata } from "next"
import { notFound } from "next/navigation"
import SektorClient from "./SektorClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

export async function generateMetadata({ params }: { params: Promise<{ nama: string }> }): Promise<Metadata> {
  const { nama } = await params
  const sector = decodeURIComponent(nama)
  return { title: `Sektor ${sector} — Lowongan & Magang di Eropa` }
}

async function getJobsBySector(sector: string) {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/v1/public/jobs?per_page=100`,
      { next: { tags: ["jobs"], revalidate: 300 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    const all = json.data ?? []
    return all.filter((j: { sector: string }) => j.sector === sector)
  } catch { return [] }
}

async function getSiteSettings() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/site-settings`, {
      next: { tags: ["site-settings"] }
    })
    if (!res.ok) return {}
    const json = await res.json()
    return json.data ?? {}
  } catch { return {} }
}

export default async function SektorPage({ params }: { params: Promise<{ nama: string }> }) {
  const { nama } = await params
  const sector = decodeURIComponent(nama)

  const [jobs, settings] = await Promise.all([getJobsBySector(sector), getSiteSettings()])

  // 404 kalau sektor tidak dikenal (tidak ada job sama sekali di DB untuk sektor ini)
  // Biarkan render meski kosong supaya halaman tetap ada
  if (!sector) notFound()

  return <SektorClient jobs={jobs} sector={sector} settings={settings} />
}