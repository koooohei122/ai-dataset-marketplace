import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUserId } from "@/lib/auth-helpers"
import { formatError, logError } from "@/lib/error-handler"
import { sendReviewNotificationEmail } from "@/lib/email"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const userId = await getAuthenticatedUserId()

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
    let purchaseId: string = ""
    if (!dataset.isFree) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: userId,
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
          userId: userId,
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
        userId: userId,
        datasetId: dataset.id,
        purchaseId: purchaseId, // 無料データセットの場合は空文字列
        rating: parseInt(rating),
        title,
        comment,
        pros: pros || [],
        cons: cons || [],
        verifiedPurchase: !dataset.isFree,
      },
    })

    // データセットの評価を更新（集計クエリを使用してN+1問題を回避）
    const reviewStats = await prisma.review.aggregate({
      where: { datasetId: dataset.id },
      _avg: { rating: true },
      _count: true,
    })

    await prisma.dataset.update({
      where: { id: dataset.id },
      data: {
        rating: reviewStats._avg.rating || 0,
        reviewCount: reviewStats._count,
      },
    })

    // 販売者にメール通知（非同期、エラーは無視）
    Promise.all([
      prisma.user.findUnique({
        where: { id: dataset.sellerId },
        select: { email: true },
      }),
      prisma.dataset.findUnique({
        where: { id: dataset.id },
        select: { title: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
    ]).then(([seller, datasetInfo, reviewer]) => {
      if (seller?.email && datasetInfo && reviewer?.name) {
        sendReviewNotificationEmail(
          seller.email,
          datasetInfo.title,
          reviewer.name,
          parseInt(rating)
        ).catch((err) => logError(err, "Email Send"))
      }
    }).catch(() => {})

    return NextResponse.json(review)
  } catch (error) {
    logError(error, "Review Creation")
    const errorResponse = formatError(error)
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.code === 'AUTH_ERROR' ? 401 : 500 }
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

