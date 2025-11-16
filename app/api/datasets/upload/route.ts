import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@/lib/supabase"
import { getAuthenticatedUserId } from "@/lib/auth-helpers"
import { validateFiles, sanitizeFileName } from "@/lib/file-validation"
import { formatError, logError } from "@/lib/error-handler"
import { DOWNLOAD_EXPIRY_DAYS, MAX_DOWNLOADS } from "@/lib/constants"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    // 認証チェック
    const userId = await getAuthenticatedUserId()

    const formData = await request.formData()
    
    // 基本情報を取得とバリデーション
    const title = (formData.get("title") as string)?.trim()
    const description = (formData.get("description") as string)?.trim()
    const categoryId = formData.get("categoryId") as string
    const tagsString = formData.get("tags") as string
    const price = parseFloat(formData.get("price") as string)
    const license = formData.get("license") as string
    const licenseDetails = (formData.get("licenseDetails") as string)?.trim() || null
    const languageString = formData.get("language") as string
    const enableAugmentation = formData.get("enableAugmentation") === "true"
    const augmentationMultiplier = parseInt(formData.get("augmentationMultiplier") as string) || 2
    const augmentationQuality = formData.get("augmentationQuality") as string || "medium"

    // 入力検証
    if (!title || title.length < 3 || title.length > 200) {
      return NextResponse.json(
        { error: "Title must be between 3 and 200 characters" },
        { status: 400 }
      )
    }

    if (!description || description.length < 10 || description.length > 5000) {
      return NextResponse.json(
        { error: "Description must be between 10 and 5000 characters" },
        { status: 400 }
      )
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      )
    }

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a valid number >= 0" },
        { status: 400 }
      )
    }

    // カテゴリの存在確認
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      )
    }

    // タグと言語を配列に変換
    const tags = tagsString
      ? tagsString.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 20) // 最大20タグ
      : []
    const language = languageString
      ? languageString.split(",").map((lang) => lang.trim()).filter(Boolean)
      : []

    // ファイルを取得と検証
    const files = formData.getAll("files") as File[]
    validateFiles(files)

    // ファイルサイズと形式を計算
    let totalSize = 0
    const formats = new Set<string>()
    
    files.forEach((file) => {
      totalSize += file.size
      const ext = file.name.split(".").pop()?.toUpperCase()
      if (ext) formats.add(ext)
    })

    // トランザクションでデータセット作成とファイルアップロードを実行
    const dataset = await prisma.$transaction(async (tx) => {
      // まずデータセットを作成（ファイル情報は後で更新）
      const dataset = await tx.dataset.create({
        data: {
          title,
          description,
          categoryId,
          tags,
          price,
          isFree: price === 0,
          currency: "JPY",
          license,
          licenseDetails,
          language,
          size: BigInt(totalSize),
          fileCount: files.length,
          format: Array.from(formats),
          status: "PUBLISHED",
          sellerId: userId,
          publishedAt: new Date(),
          augmentationInfo: enableAugmentation
            ? {
                enabled: true,
                multiplier: augmentationMultiplier,
                quality: augmentationQuality,
                originalFileCount: files.length,
                generatedFileCount: 0,
                augmentationMethod: "pending",
              }
            : undefined,
        },
      })

      // Supabase Storageにファイルをアップロード
      const supabase = createServerClient()
      const uploadedFiles: Array<{
        fileName: string
        filePath: string
        fileSize: bigint
        fileType: string
        order: number
        isSample: boolean
      }> = []

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const sanitizedFileName = sanitizeFileName(file.name)
          const fileExt = sanitizedFileName.split(".").pop()
          const fileName = `${randomUUID()}.${fileExt}`
          const filePath = `datasets/${userId}/${dataset.id}/${fileName}`

          // ファイルをバッファに変換
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          // Supabase Storageにアップロード
          const { data, error } = await supabase.storage
            .from("datasets")
            .upload(filePath, buffer, {
              contentType: file.type,
              upsert: false,
            })

          if (error) {
            // エラーが発生した場合、既にアップロードしたファイルを削除
            for (const uploaded of uploadedFiles) {
              await supabase.storage
                .from("datasets")
                .remove([uploaded.filePath])
                .catch(() => {}) // 削除エラーは無視
            }
            throw new Error(`Failed to upload file: ${sanitizedFileName} - ${error.message}`)
          }

          uploadedFiles.push({
            fileName: sanitizedFileName,
            filePath: data.path,
            fileSize: BigInt(file.size),
            fileType: fileExt || "unknown",
            order: i,
            isSample: i < 10, // 最初の10ファイルをサンプルとして設定
          })
        }

        // ファイル情報をデータベースに保存
        await tx.datasetFile.createMany({
          data: uploadedFiles.map((file) => ({
            datasetId: dataset.id,
            fileName: file.fileName,
            filePath: file.filePath,
            fileSize: file.fileSize,
            fileType: file.fileType,
            order: file.order,
            isSample: file.isSample,
          })),
        })

        return dataset
      } catch (error) {
        // ファイルアップロードに失敗した場合、データセットを削除
        await tx.dataset.delete({ where: { id: dataset.id } }).catch(() => {})
        throw error
      }
    })

    // AI拡張が有効な場合は、バックグラウンドで処理を開始（将来実装）
    if (enableAugmentation) {
      // TODO: AI拡張処理を開始
      // クライアントサイドで処理する場合は、フロントエンドで実装
    }

    return NextResponse.json({ id: dataset.id }, { status: 201 })
  } catch (error) {
    logError(error, "Dataset Upload")
    const errorResponse = formatError(error)
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.code === 'AUTH_ERROR' ? 401 : errorResponse.code?.startsWith('FILE_') ? 400 : 500 }
    )
  }
}

