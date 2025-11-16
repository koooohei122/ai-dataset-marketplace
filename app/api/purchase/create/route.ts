import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"
import { sendPurchaseConfirmationEmail, sendPurchaseRequestEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { datasetId, paymentMethod } = body

    // ユーザーIDを取得
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
    if (dataset.sellerId === user.id) {
      return NextResponse.json(
        { error: "Cannot purchase your own dataset" },
        { status: 400 }
      )
    }

    // 既に購入済みかチェック
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
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
    const platformFeeRate = settings?.platformFeeRate || 15.0

    // 手数料を計算
    const amount = dataset.isFree ? 0 : Number(dataset.price)
    const platformFee = dataset.isFree ? 0 : Math.floor(amount * (platformFeeRate / 100))
    const sellerAmount = amount - platformFee
    const paymentFee = paymentMethod === "stripe" && !dataset.isFree
      ? Math.ceil(amount * 0.036)
      : null

    // 購入レコードを作成
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        datasetId: dataset.id,
        amount,
        currency: "JPY",
        status: dataset.isFree ? "COMPLETED" : paymentMethod === "stripe" ? "PENDING" : "PENDING",
        paymentMethod: paymentMethod || (dataset.isFree ? "free" : "manual"),
        transactionId: randomUUID(),
        downloadExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        maxDownloads: 5,
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

      // 購入確認メールを送信
      const datasetInfo = await prisma.dataset.findUnique({
        where: { id: dataset.id },
        select: { title: true },
      })
      if (datasetInfo) {
        await sendPurchaseConfirmationEmail(
          session.user.email!,
          datasetInfo.title,
          purchase.id
        )
      }

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
    // 販売者にメール通知
    const seller = await prisma.user.findUnique({
      where: { id: dataset.sellerId },
      select: { email: true, name: true },
    })
    const datasetInfo = await prisma.dataset.findUnique({
      where: { id: dataset.id },
      select: { title: true },
    })

    if (seller && datasetInfo) {
      await sendPurchaseRequestEmail(
        seller.email,
        session.user.name || session.user.email!,
        datasetInfo.title,
        amount,
        purchase.id
      )
    }

    return NextResponse.json({
      purchaseId: purchase.id,
      status: "pending",
      message: "販売者に連絡して決済を完了してください",
    })
  } catch (error) {
    console.error("Purchase creation error:", error)
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    )
  }
}

