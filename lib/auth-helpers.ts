// 認証関連のヘルパー関数

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Session } from "next-auth"

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * セッションからユーザーIDを取得
 * @throws {AuthError} セッションが無効な場合
 */
export async function getUserIdFromSession(session: Session | null): Promise<string> {
  if (!session?.user?.email) {
    throw new AuthError('Unauthorized', 401)
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    throw new AuthError('User not found', 404)
  }

  return user.id
}

/**
 * リクエストから認証されたユーザーIDを取得
 * @throws {AuthError} 認証されていない場合
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  return getUserIdFromSession(session)
}

/**
 * セッションを取得（認証チェック付き）
 * @throws {AuthError} 認証されていない場合
 */
export async function getAuthenticatedSession(): Promise<Session> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new AuthError('Unauthorized', 401)
  }
  return session
}

