import type { Metadata } from "next"
import type { BlogPost, BlogCategory, BlogTag, PaginationMeta } from "@/types"
import BlogClient from "./BlogClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

export const metadata: Metadata = { title: "Blog" }

async function getBlogPosts(tagSlug?: string, categorySlug?: string): Promise<{ data: BlogPost[]; meta: PaginationMeta }> {
  try {
    const params = new URLSearchParams({ page: "1", limit: "9" })
    if (tagSlug) params.set("tag_slug", tagSlug)
    if (categorySlug) params.set("category_slug", categorySlug)
    const res = await fetch(`${BACKEND_URL}/api/v1/public/blog/posts?${params}`, {
      next: { tags: ["blog-posts"], revalidate: 300 },
    })
    if (!res.ok) return { data: [], meta: { page: 1, limit: 9, total: 0, total_pages: 1 } }
    const json = await res.json()
    return { data: json.data ?? [], meta: json.meta ?? { page: 1, limit: 9, total: 0, total_pages: 1 } }
  } catch {
    return { data: [], meta: { page: 1, limit: 9, total: 0, total_pages: 1 } }
  }
}

async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/blog/categories`, {
      next: { tags: ["blog-categories"], revalidate: 3600 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch { return [] }
}

async function getBlogTags(): Promise<BlogTag[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/blog/tags`, {
      next: { tags: ["blog-tags"], revalidate: 3600 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch { return [] }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ tag?: string; category?: string }> }) {
  const { tag, category } = await searchParams
  const [{ data: posts, meta }, categories, tags] = await Promise.all([
    getBlogPosts(tag, category),
    getBlogCategories(),
    getBlogTags(),
  ])
  return (
    <BlogClient
      initialPosts={posts}
      initialMeta={meta}
      categories={categories}
      tags={tags}
      initialTagSlug={tag ?? null}
      initialCategorySlug={category ?? null}
    />
  )
}