import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUserId, getAuthenticatedSession } from "@/lib/auth-helpers"
import { formatError, logError } from "@/lib/error-handler"
import { DOWNLOAD_EXPIRY_DAYS, MAX_DOWNLOADS, DEFAULT_PLATFORM_FEE_RATE, STRIPE_FEE_RATE } from "@/lib/constants"
import { sendPurchaseConfirmationEmail, sendPurchaseRequestEmail } from "@/lib/email"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    // 認証チェック
    const session = await getAuthenticatedSession()
    const userId = await getAuthenticatedUserId()

    const body = await request.json()
    const { datasetId, paymentMethod } = body

    // 入力検証
    if (!datasetId) {
      return NextResponse.json(
        { error: "Dataset ID is required" },
        { status: 400 }
      )
    }

    if (!paymentMethod && typeof paymentMethod !== 'string') {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      )
    }

    // データセットを取得
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
      select: {
        id: true,
        price: true,
        isFree: true,
        sellerId: true,
      },
    })

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      )
    }

    // 自分自身のデータセットは購入できない
    if (dataset.sellerId === userId) {
      return NextResponse.json(
        { error: "Cannot purchase your own dataset" },
        { status: 400 }
      )
    }

    // 既に購入済みかチェック
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: userId,
        datasetId: dataset.id,
        status: "COMPLETED",
      },
    })

    if (existingPurchase) {
      return NextResponse.json(
        { error: "Already purchased" },
        { status: 400 }
      )
    }

    // プラットフォーム設定を取得
    const settings = await prisma.platformSettings.findFirst()
    const platformFeeRate = Number(settings?.platformFeeRate || DEFAULT_PLATFORM_FEE_RATE)

    // 手数料を計算
    const amount = dataset.isFree ? 0 : Number(dataset.price)
    const platformFee = dataset.isFree ? 0 : Math.floor(amount * (platformFeeRate / 100))
    const paymentFee = paymentMethod === "stripe" && !dataset.isFree
      ? Math.ceil(amount * STRIPE_FEE_RATE)
      : null
    const sellerAmount = amount - platformFee - (paymentFee || 0)

    // 購入レコードを作成
    const purchase = await prisma.purchase.create({
      data: {
        userId: userId,
        datasetId: dataset.id,
        amount,
        currency: "JPY",
        status: dataset.isFree ? "COMPLETED" : "PENDING",
        paymentMethod: paymentMethod || (dataset.isFree ? "free" : "manual"),
        transactionId: randomUUID(),
        downloadExpiresAt: new Date(Date.now() + DOWNLOAD_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        maxDownloads: MAX_DOWNLOADS,
        platformFee,
        platformFeeRate,
        paymentFee,
        sellerAmount,
      },
    })

    // 無料データセットの場合は即座に完了
    if (dataset.isFree) {
      // データセットの購入数を増やす
      await prisma.dataset.update({
        where: { id: dataset.id },
        data: { purchases: { increment: 1 } },
      })

      // 購入確認メールを送信（非同期、エラーは無視）
      prisma.dataset.findUnique({
        where: { id: dataset.id },
        select: { title: true },
      }).then((datasetInfo) => {
        if (datasetInfo && session.user.email) {
          sendPurchaseConfirmationEmail(
            session.user.email,
            datasetInfo.title,
            purchase.id
          ).catch((err) => logError(err, "Email Send"))
        }
      }).catch(() => {})

      return NextResponse.json({
        purchaseId: purchase.id,
        status: "completed",
      })
    }

    // Stripe決済の場合
    if (paymentMethod === "stripe") {
      // TODO: Stripe Checkout Sessionを作成
      // 現在は手動決済のみ対応
      return NextResponse.json({
        purchaseId: purchase.id,
        status: "pending",
        message: "Stripe決済は今後実装予定です。現在は手動決済をご利用ください。",
      })
    }

    // 手動決済の場合
    // 販売者にメール通知（非同期、エラーは無視）
    Promise.all([
      prisma.user.findUnique({
        where: { id: dataset.sellerId },
        select: { email: true, name: true },
      }),
      prisma.dataset.findUnique({
        where: { id: dataset.id },
        select: { title: true },
      }),
    ]).then(([seller, datasetInfo]) => {
      if (seller?.email && datasetInfo) {
        sendPurchaseRequestEmail(
          seller.email,
          session.user.name || session.user.email || 'Unknown',
          datasetInfo.title,
          amount,
          purchase.id
        ).catch((err) => logError(err, "Email Send"))
      }
    }).catch(() => {})

    return NextResponse.json({
      purchaseId: purchase.id,
      status: "pending",
      message: "販売者に連絡して決済を完了してください",
    })
  } catch (error) {
    logError(error, "Purchase Creation")
    const errorResponse = formatError(error)
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.code === 'AUTH_ERROR' ? 401 : 500 }
    )
  }
}

