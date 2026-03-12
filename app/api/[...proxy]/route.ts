import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL!

async function proxyRequest(
  req: NextRequest,
  params: Promise<{ proxy: string[] }>
) {
  const { proxy } = await params
  const path = proxy.join("/")
  const search = req.nextUrl.searchParams.toString()
  const url = `${BACKEND_URL}/api/v1/${path}${search ? `?${search}` : ""}`

  const contentType = req.headers.get("content-type") ?? ""
const isMultipart = contentType.includes("multipart/form-data")

const headers: HeadersInit = {}
const auth = req.headers.get("authorization")
if (auth) headers["Authorization"] = auth

// Kalau bukan multipart, set JSON
// Kalau multipart, JANGAN set Content-Type sama sekali
// biar fetch otomatis set boundary yang benar
if (!isMultipart) {
  headers["Content-Type"] = "application/json"
}

 const hasBody = req.method !== "GET" && req.method !== "HEAD"
let body: BodyInit | undefined = undefined
if (hasBody) {
  if (isMultipart) {
    body = await req.formData()
  } else {
    body = await req.text()
  }
}

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body: body as BodyInit,
    })

    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type":
          res.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { success: false, message: "Backend tidak dapat dijangkau" },
      { status: 502 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  return proxyRequest(req, params)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  return proxyRequest(req, params)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  return proxyRequest(req, params)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  return proxyRequest(req, params)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  return proxyRequest(req, params)
}