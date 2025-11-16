import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const status = searchParams.get("status") || "PUBLISHED"

    const where: any = {
      status: status,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    const datasets = await prisma.dataset.findMany({
      where,
      include: {
        seller: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    })

    return NextResponse.json(datasets)
  } catch (error) {
    console.error("Error fetching datasets:", error)
    return NextResponse.json(
      { error: "Failed to fetch datasets" },
      { status: 500 }
    )
  }
}

