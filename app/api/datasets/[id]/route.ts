import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: {
        id: params.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            sellerProfile: {
              select: {
                verified: true,
              },
            },
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        files: {
          where: {
            isSample: true,
          },
          select: {
            id: true,
            fileName: true,
            isSample: true,
          },
          take: 10,
        },
      },
    })

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      )
    }

    // 閲覧数を増やす
    await prisma.dataset.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(dataset)
  } catch (error) {
    console.error("Error fetching dataset:", error)
    return NextResponse.json(
      { error: "Failed to fetch dataset" },
      { status: 500 }
    )
  }
}

