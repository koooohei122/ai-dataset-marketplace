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

      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { downloadCount: { increment: 1 } },
      })
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
    const passThrough = new PassThrough()
    const archive = archiver("zip", { zlib: { level: 6 } })

    archive.on("error", (err) => {
      logError(err, "Archiver")
      passThrough.destroy(err)
    })

    archive.pipe(passThrough)

    // Supabase Storageから各ファイルを取得してZIPに追加
    for (const file of files) {
      const { data, error } = await supabase.storage
        .from("datasets")
        .download(file.filePath)

      if (error || !data) {
        logError(error ?? new Error("No data"), `Supabase Storage Download: ${file.fileName}`)
        continue
      }

      const buffer = Buffer.from(await data.arrayBuffer())
      archive.append(buffer, { name: file.fileName })
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
