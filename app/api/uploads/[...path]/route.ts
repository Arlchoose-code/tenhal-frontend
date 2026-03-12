import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL!

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const url = `${BACKEND_URL}/uploads/${path.join("/")}`

  try {
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("Upload proxy error:", error)
    return new NextResponse(null, { status: 502 })
  }
}