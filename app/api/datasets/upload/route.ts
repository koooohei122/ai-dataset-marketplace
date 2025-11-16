import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@/lib/supabase"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // ユーザーIDを取得（データベースから取得）
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

    const userId = user.id

    const formData = await request.formData()
    
    // 基本情報を取得
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const tagsString = formData.get("tags") as string
    const price = parseFloat(formData.get("price") as string)
    const license = formData.get("license") as string
    const licenseDetails = formData.get("licenseDetails") as string
    const languageString = formData.get("language") as string
    const enableAugmentation = formData.get("enableAugmentation") === "true"
    const augmentationMultiplier = parseInt(formData.get("augmentationMultiplier") as string)
    const augmentationQuality = formData.get("augmentationQuality") as string

    // タグと言語を配列に変換
    const tags = tagsString
      ? tagsString.split(",").map((tag) => tag.trim()).filter(Boolean)
      : []
    const language = languageString
      ? languageString.split(",").map((lang) => lang.trim()).filter(Boolean)
      : []

    // ファイルを取得
    const files = formData.getAll("files") as File[]
    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one file is required" },
        { status: 400 }
      )
    }

    // ファイルサイズと形式を計算
    let totalSize = 0
    const formats = new Set<string>()
    
    files.forEach((file) => {
      totalSize += file.size
      const ext = file.name.split(".").pop()?.toUpperCase()
      if (ext) formats.add(ext)
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

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split(".").pop()
      const fileName = `${randomUUID()}.${fileExt}`
      const filePath = `datasets/${userId}/${fileName}`

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
        console.error("Upload error:", error)
        return NextResponse.json(
          { error: `Failed to upload file: ${file.name}` },
          { status: 500 }
        )
      }

      uploadedFiles.push({
        fileName: file.name,
        filePath: data.path,
        fileSize: BigInt(file.size),
        fileType: fileExt || "unknown",
        order: i,
        isSample: i < 10, // 最初の10ファイルをサンプルとして設定
      })
    }

    // データセットを作成
    const dataset = await prisma.dataset.create({
      data: {
        title,
        description,
        categoryId,
        tags,
        price,
        isFree: price === 0,
        currency: "JPY",
        license,
        licenseDetails: licenseDetails || null,
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
          : null,
        files: {
          create: uploadedFiles,
        },
      },
      include: {
        files: true,
      },
    })

    // AI拡張が有効な場合は、バックグラウンドで処理を開始（将来実装）
    if (enableAugmentation) {
      // TODO: AI拡張処理を開始
      // クライアントサイドで処理する場合は、フロントエンドで実装
    }

    return NextResponse.json({ id: dataset.id })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload dataset" },
      { status: 500 }
    )
  }
}

