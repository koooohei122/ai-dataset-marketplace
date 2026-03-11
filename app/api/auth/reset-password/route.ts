import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { MIN_PASSWORD_LENGTH } from "@/lib/constants"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください` },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 400 })
    }

    if (new Date(resetToken.expiresAt) < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } })
      return NextResponse.json({ error: "トークンの有効期限が切れています" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashed },
    })

    await prisma.passwordResetToken.delete({ where: { token } })

    return NextResponse.json({ message: "パスワードを更新しました" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
