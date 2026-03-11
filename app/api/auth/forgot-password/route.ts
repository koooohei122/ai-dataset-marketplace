import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"

const EXPIRY_MINUTES = 60

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, name: true },
    })

    // ユーザーが存在しない場合も同じレスポンスを返す（メールアドレス列挙攻撃対策）
    if (!user) {
      return NextResponse.json({ message: "送信しました" })
    }

    // 既存のトークンを削除
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    })

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: { email: user.email, token, expiresAt },
    })

    // メール送信（失敗しても200を返す）
    await sendPasswordResetEmail(user.email, user.name || "ユーザー", token).catch(() => {})

    return NextResponse.json({ message: "送信しました" })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
