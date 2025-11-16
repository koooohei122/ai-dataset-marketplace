import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@/lib/supabase"

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

    // データセットを取得
    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
      include: {
        files: true,
      },
    })

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      )
    }

    // 購入済みかチェック（無料データセットの場合はスキップ）
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
          { error: "Purchase required" },
          { status: 403 }
        )
      }

      // ダウンロード回数と有効期限をチェック
      if (purchase.downloadCount >= purchase.maxDownloads) {
        return NextResponse.json(
          { error: "Download limit reached" },
          { status: 403 }
        )
      }

      if (purchase.downloadExpiresAt && new Date(purchase.downloadExpiresAt) < new Date()) {
        return NextResponse.json(
          { error: "Download expired" },
          { status: 403 }
        )
      }

      // ダウンロード数を増やす
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { downloadCount: { increment: 1 } },
      })
    }

    // Supabase Storageからファイルをダウンロード
    const supabase = createServerClient()
    
    // すべてのファイルをZIPとしてダウンロード（簡易実装）
    // 実際の実装では、ZIPファイルを作成する必要があります
    const fileUrls = dataset.files.map((file) => {
      const { data } = supabase.storage
        .from("datasets")
        .getPublicUrl(file.filePath)
      return { name: file.fileName, url: data.publicUrl }
    })

    // 簡易実装：最初のファイルのURLを返す
    // 実際にはZIPファイルを作成して返す必要があります
    if (fileUrls.length > 0) {
      return NextResponse.redirect(fileUrls[0].url)
    }

    return NextResponse.json(
      { error: "No files found" },
      { status: 404 }
    )
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "Failed to download dataset" },
      { status: 500 }
    )
  }
}

