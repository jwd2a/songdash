import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo (use a real database in production)
const moments = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { song, highlights, createdAt } = body

    // Generate a unique ID
    const momentId = Math.random().toString(36).substring(2, 15)

    // Store the moment
    moments.set(momentId, {
      id: momentId,
      song,
      highlights,
      createdAt,
      views: 0,
    })

    return NextResponse.json({
      id: momentId,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/shared/${momentId}`,
    })
  } catch (error) {
    console.error("Create moment error:", error)
    return NextResponse.json({ error: "Failed to create moment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Moment ID is required" }, { status: 400 })
  }

  const moment = moments.get(id)

  if (!moment) {
    return NextResponse.json({ error: "Moment not found" }, { status: 404 })
  }

  // Increment view count
  moment.views += 1
  moments.set(id, moment)

  return NextResponse.json(moment)
}
