import type { Metadata } from "next"
import type { BlogPost } from "@/types"
import { notFound } from "next/navigation"
import BlogDetailClient from "./BlogDetailClient"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080"

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/blog/posts/${slug}`, {
      next: { tags: ["blog-posts"], revalidate: 300 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch { return null }
}

async function getRelatedPosts(categoryId: number | null, currentSlug: string): Promise<BlogPost[]> {
  try {
    const params = new URLSearchParams({ page: "1", limit: "4" })
    if (categoryId) params.set("category_id", String(categoryId))
    const res = await fetch(`${BACKEND_URL}/api/v1/public/blog/posts?${params}`, {
      next: { tags: ["blog-posts"], revalidate: 300 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []).filter((p: BlogPost) => p.slug && p.slug !== currentSlug).slice(0, 3)
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!slug || slug === "undefined") return { title: "Artikel tidak ditemukan" }
  const post = await getPost(slug)
  if (!post) return { title: "Artikel tidak ditemukan" }
  return {
    title: `${post.title}`,
    description: post.excerpt || post.title,
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!slug || slug === "undefined") notFound()
  const post = await getPost(slug)
  if (!post) notFound()
  const related = await getRelatedPosts(post.category_id, slug)
  return <BlogDetailClient post={post} related={related} />
}