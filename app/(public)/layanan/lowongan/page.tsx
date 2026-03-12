import type { Metadata } from "next"
import { Suspense } from "react"
import LowonganClient from "./LowonganClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

export const metadata: Metadata = { title: "Lowongan Kerja & Magang di Eropa" }

async function getAllJobs() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/jobs?type=job&per_page=100`, {
      next: { tags: ["jobs"], revalidate: 300 }
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
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

export default async function LowonganPage() {
  const [jobs, settings] = await Promise.all([getAllJobs(), getSiteSettings()])
  return (
    <Suspense>
      <LowonganClient jobs={jobs} settings={settings} />
    </Suspense>
  )
}