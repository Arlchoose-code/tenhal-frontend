import { revalidateTag, revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  const tag = req.nextUrl.searchParams.get("tag")
  const path = req.nextUrl.searchParams.get("path")

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { success: false, message: "Invalid secret" },
      { status: 401 }
    )
  }

  if (tag) {
    revalidateTag(tag, "max")
    return NextResponse.json({
      success: true,
      revalidated: true,
      tag,
    })
  }

  if (path) {
    revalidatePath(path)
    return NextResponse.json({
      success: true,
      revalidated: true,
      path,
    })
  }

  return NextResponse.json(
    { success: false, message: "tag atau path harus diisi" },
    { status: 400 }
  )
}