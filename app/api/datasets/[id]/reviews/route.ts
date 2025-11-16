import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // データセットが存在するか確認
    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
    })

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      )
    }

    // 購入済みかチェック（無料データセットの場合はスキップ）
    let purchaseId: string | null = null
    if (!dataset.isFree) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: user.id,
          datasetId: dataset.id,
          status: "COMPLETED",
        },
      })

      if (!purchase) {
        return NextResponse.json(
          { error: "Purchase required to review" },
          { status: 403 }
        )
      }

      purchaseId = purchase.id
    }

    // 既にレビューを投稿しているかチェック
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_datasetId: {
          userId: user.id,
          datasetId: dataset.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { rating, title, comment, pros, cons } = body

    // バリデーション
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    if (!title || !comment) {
      return NextResponse.json(
        { error: "Title and comment are required" },
        { status: 400 }
      )
    }

    // レビューを作成
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        datasetId: dataset.id,
        purchaseId: purchaseId || "", // 無料データセットの場合は空文字列
        rating: parseInt(rating),
        title,
        comment,
        pros: pros || [],
        cons: cons || [],
        verifiedPurchase: !dataset.isFree,
      },
    })

    // データセットの評価を更新
    const allReviews = await prisma.review.findMany({
      where: { datasetId: dataset.id },
      select: { rating: true },
    })

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.dataset.update({
      where: { id: dataset.id },
      data: {
        rating: averageRating,
        reviewCount: allReviews.length,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Review creation error:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { datasetId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

