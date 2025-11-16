import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { formatError, logError } from "@/lib/error-handler"
import { MIN_PASSWORD_LENGTH } from "@/lib/constants"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // バリデーション
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "すべてのフィールドが必要です" },
        { status: 400 }
      )
    }

    // 名前の検証
    const trimmedName = name.trim()
    if (trimmedName.length < 1 || trimmedName.length > 100) {
      return NextResponse.json(
        { error: "名前は1文字以上100文字以下である必要があります" },
        { status: 400 }
      )
    }

    // メールアドレスの検証
    const trimmedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      )
    }

    // パスワードの検証
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上である必要があります` },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に使用されています" },
        { status: 400 }
      )
    }

    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash(password, 10)

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        role: "BUYER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(
      { message: "アカウントが作成されました", user },
      { status: 201 }
    )
  } catch (error) {
    logError(error, "Signup")
    const errorResponse = formatError(error)
    
    // Prismaの一意制約エラーの場合
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: "このメールアドレスは既に使用されています" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    )
  }
}

