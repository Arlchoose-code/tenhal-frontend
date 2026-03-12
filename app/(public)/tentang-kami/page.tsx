import type { Metadata } from "next"
import type { TeamMember } from "@/types"
import TentangKamiClient from "./TentangKamiClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

export const metadata: Metadata = { title: "Tentang Kami" }

async function getPageContent() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/page-content/about`, { next: { tags: ["page-content"] } })
    if (!res.ok) return {}
    const json = await res.json()
    return json.data ?? {}
  } catch { return {} }
}

async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/team-members`, { next: { tags: ["team"] } })
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

export default async function TentangKamiPage() {
  const [pageContent, team, settings] = await Promise.all([
    getPageContent(),
    getTeamMembers(),
    getSiteSettings(),
  ])

  return <TentangKamiClient pageContent={pageContent} team={team} settings={settings} />
}