import type { Metadata } from "next"
import { notFound } from "next/navigation"
import MagangDetailClient from "./MagangDetailClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const res = await fetch(`${BACKEND_URL}/api/v1/public/jobs/${slug}`)
    if (!res.ok) return { title: "Program Magang — Tenhal" }
    const json = await res.json()
    return { title: `${json.data?.title ?? "Program Magang"}` }
  } catch {
    return { title: "Program Magang" }
  }
}

async function getJob(slug: string) {
  const res = await fetch(`${BACKEND_URL}/api/v1/public/jobs/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? null
}

async function getSiteSettings() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/site-settings`, { next: { tags: ["site-settings"] } })
    if (!res.ok) return {}
    const json = await res.json()
    return json.data ?? {}
  } catch { return {} }
}

export default async function MagangDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [job, settings] = await Promise.all([getJob(slug), getSiteSettings()])
  if (!job || job.type !== "internship") notFound()
  return <MagangDetailClient job={job} settings={settings} />
}