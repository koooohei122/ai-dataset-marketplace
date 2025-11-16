import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
      select: {
        price: true,
        isFree: true,
      },
    })

    if (!dataset || dataset.isFree) {
      return NextResponse.json(
        { error: "Free dataset or not found" },
        { status: 400 }
      )
    }

    // プラットフォーム設定を取得
    const settings = await prisma.platformSettings.findFirst()
    const platformFeeRate = settings?.platformFeeRate || 15.0

    // 手数料を計算
    const price = Number(dataset.price)
    const platformFee = Math.floor(price * (platformFeeRate / 100))
    const sellerAmount = price - platformFee

    // 決済手数料（Stripe使用時、約3.6%）
    const paymentFee = Math.ceil(price * 0.036)

    return NextResponse.json({
      amount: price,
      platformFee,
      platformFeeRate,
      sellerAmount,
      paymentFee,
    })
  } catch (error) {
    console.error("Error calculating purchase:", error)
    return NextResponse.json(
      { error: "Failed to calculate purchase" },
      { status: 500 }
    )
  }
}

