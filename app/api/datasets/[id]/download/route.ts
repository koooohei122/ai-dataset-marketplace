import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@/lib/supabase"
import { getAuthenticatedUserId } from "@/lib/auth-helpers"
import { formatError, logError } from "@/lib/error-handler"
import archiver from "archiver"
import { PassThrough } from "stream"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthenticatedUserId()

    const dataset = await prisma.dataset.findUnique({
      where: { id: params.id },
      include: {
        files: {
          where: { isSample: false },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
    }

    // 販売者本人は無制限でダウンロード可能
    const isSeller = dataset.sellerId === userId

    let purchaseId: string | null = null
    if (!dataset.isFree && !isSeller) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId,
          datasetId: dataset.id,
          status: "COMPLETED",
        },
      })

      if (!purchase) {
        return NextResponse.json({ error: "Purchase required" }, { status: 403 })
      }

      if (purchase.downloadCount >= purchase.maxDownloads) {
        return NextResponse.json({ error: "Download limit reached" }, { status: 403 })
      }

      if (purchase.downloadExpiresAt && new Date(purchase.downloadExpiresAt) < new Date()) {
        return NextResponse.json({ error: "Download expired" }, { status: 403 })
      }

      purchaseId = purchase.id
    }

    const files = dataset.files
    if (files.length === 0) {
      return NextResponse.json({ error: "No files found" }, { status: 404 })
    }

    const supabase = createServerClient()

    // ファイルが1つだけの場合は直接ストリーム
    if (files.length === 1) {
      const file = files[0]
      const { data, error } = await supabase.storage
        .from("datasets")
        .download(file.filePath)

      if (error || !data) {
        logError(error ?? new Error("No data"), "Supabase Storage Download")
        return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
      }

      // ファイル取得成功後にダウンロード回数を記録
      if (purchaseId) {
        await prisma.purchase.update({
          where: { id: purchaseId },
          data: { downloadCount: { increment: 1 } },
        })
      }

      const buffer = Buffer.from(await data.arrayBuffer())
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": data.type || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
          "Content-Length": buffer.length.toString(),
        },
      })
    }

    // 複数ファイルはZIPにまとめてストリーム
    // 全ファイルを先に取得してから回数をカウント（途中失敗でもカウントが無駄にならないよう）
    const fileBuffers: { fileName: string; buffer: Buffer }[] = []
    for (const file of files) {
      const { data, error } = await supabase.storage
        .from("datasets")
        .download(file.filePath)

      if (error || !data) {
        logError(error ?? new Error("No data"), `Supabase Storage Download: ${file.fileName}`)
        return NextResponse.json(
          { error: `ファイル "${file.fileName}" の取得に失敗しました` },
          { status: 500 }
        )
      }

      fileBuffers.push({
        fileName: file.fileName,
        buffer: Buffer.from(await data.arrayBuffer()),
      })
    }

    // 全ファイル取得成功後にダウンロード回数を記録
    if (purchaseId) {
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { downloadCount: { increment: 1 } },
      })
    }

    const passThrough = new PassThrough()
    const archive = archiver("zip", { zlib: { level: 6 } })

    archive.on("error", (err) => {
      logError(err, "Archiver")
      passThrough.destroy(err)
    })

    archive.pipe(passThrough)

    for (const { fileName, buffer } of fileBuffers) {
      archive.append(buffer, { name: fileName })
    }

    archive.finalize()

    const safeTitle = dataset.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_")
    const zipName = `${safeTitle || "dataset"}.zip`

    // PassThrough を ReadableStream に変換
    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on("data", (chunk) => controller.enqueue(chunk))
        passThrough.on("end", () => controller.close())
        passThrough.on("error", (err) => controller.error(err))
      },
    })

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(zipName)}"`,
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    logError(error, "Dataset Download")
    const errorResponse = formatError(error)
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.code === "AUTH_ERROR" ? 401 : 500 }
    )
  }
}
