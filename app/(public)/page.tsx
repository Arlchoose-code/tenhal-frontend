import HomeClient from "./HomeClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

async function getData(path: string, tags: string[]) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/${path}`, { next: { tags } })
    if (!res.ok) return null
    return (await res.json()).data
  } catch { return null }
}

export default async function HomePage() {
  const [pageContent, faqContent, allJobs, countries, settings] = await Promise.all([
    getData("page-content/home", ["page-content"]),
    getData("page-content/faq", ["page-content"]),
    getData("jobs?per_page=100", ["jobs"]),
    getData("countries", ["countries"]),
    getData("site-settings", ["site-settings"]),
  ])

  // Extract unique sectors from jobs
  const sectors: string[] = []
  if (allJobs) {
    for (const job of allJobs) {
      if (job.sector && !sectors.includes(job.sector)) {
        sectors.push(job.sector)
      }
    }
  }

  return (
    <HomeClient
      jobs={(allJobs ?? []).slice(0, 6)}
      allJobsForSectors={allJobs ?? []}
      sectors={sectors}
      countries={countries ?? []}
      pageContent={pageContent ?? {}}
      faqContent={faqContent ?? {}}
      settings={settings ?? {}}
    />
  )
}