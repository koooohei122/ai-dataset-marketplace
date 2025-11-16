import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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

    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
      include: {
        dataset: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!purchase || purchase.userId !== user.id) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(purchase)
  } catch (error) {
    console.error("Error fetching purchase:", error)
    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 }
    )
  }
}

