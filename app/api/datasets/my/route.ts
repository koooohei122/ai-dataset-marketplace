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

    // ユーザーのデータセットを取得
    const datasets = await prisma.dataset.findMany({
      where: {
        sellerId: user.id,
      },
      select: {
        id: true,
        title: true,
        price: true,
        isFree: true,
        status: true,
        views: true,
        purchases: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 統計情報を計算
    const stats = {
      totalSales: datasets.reduce((sum, d) => sum + d.purchases, 0),
      totalRevenue: datasets.reduce((sum, d) => {
        // プラットフォーム手数料15%を考慮
        const revenue = d.isFree ? 0 : Number(d.price) * d.purchases * 0.85
        return sum + revenue
      }, 0),
      totalViews: datasets.reduce((sum, d) => sum + d.views, 0),
    }

    return NextResponse.json({ datasets, stats })
  } catch (error) {
    console.error("Error fetching user datasets:", error)
    return NextResponse.json(
      { error: "Failed to fetch datasets" },
      { status: 500 }
    )
  }
}

