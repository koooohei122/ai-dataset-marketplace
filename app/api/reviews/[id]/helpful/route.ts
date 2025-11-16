import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    // 参考になった数を増やす
    const updated = await prisma.review.update({
      where: { id: params.id },
      data: { helpfulCount: { increment: 1 } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating helpful count:", error)
    return NextResponse.json(
      { error: "Failed to update helpful count" },
      { status: 500 }
    )
  }
}

