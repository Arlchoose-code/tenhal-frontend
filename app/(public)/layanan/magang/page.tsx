import type { Metadata } from "next"
import { Suspense } from "react"
import MagangClient from "./MagangClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

export const metadata: Metadata = { title: "Program Magang di Eropa" }

async function getInternships() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/jobs?type=internship&per_page=100`, {
      next: { tags: ["jobs"], revalidate: 300 }
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch { return [] }
}

async function getSiteSettings() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/site-settings`, { next: { tags: ["site-settings"] } })
    if (!res.ok) return {}
    const json = await res.json()
    return json.data ?? {}
  } catch { return {} }
}

export default async function MagangPage() {
  const [internships, settings] = await Promise.all([getInternships(), getSiteSettings()])
  return (
    <Suspense>
      <MagangClient internships={internships} settings={settings} />
    </Suspense>
  )
}