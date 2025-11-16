import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        dataset: {
          include: {
            category: true,
            seller: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    } as any)

    const datasets = wishlistItems.map((item: any) => item.dataset)

    return NextResponse.json(datasets)
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { datasetId } = body

    // 既に追加されているかチェック
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_datasetId: {
          userId: user.id,
          datasetId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Already in wishlist" },
        { status: 400 }
      )
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        datasetId,
      },
    })

    return NextResponse.json(wishlistItem)
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    )
  }
}

