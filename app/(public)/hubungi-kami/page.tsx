import type { Metadata } from "next"
import HubungiKamiClient from "./HubungiKamiClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

export const metadata: Metadata = { title: "Hubungi Kami" }

async function getSiteSettings() {
  try {
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

export default async function HubungiKamiPage() {
  const settings = await getSiteSettings()
  return <HubungiKamiClient settings={settings} />
}