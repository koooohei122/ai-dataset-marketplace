// エラーハンドリングユーティリティ

import { env } from './env'
import { AuthError } from './auth-helpers'
import { FileValidationError } from './file-validation'

export interface ErrorResponse {
  error: string
  code?: string
  details?: unknown
}

/**
 * エラーを安全な形式に変換
 * 本番環境では詳細なエラー情報を隠す
 */
export function formatError(error: unknown): ErrorResponse {
  const isProduction = env.isProduction()

  // 既知のエラータイプ
  if (error instanceof AuthError) {
    return {
      error: isProduction ? 'Authentication failed' : error.message,
      code: 'AUTH_ERROR',
    }
  }

  if (error instanceof FileValidationError) {
    return {
      error: isProduction ? 'File validation failed' : error.message,
      code: error.code,
    }
  }

  // Prismaエラー
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string }
    return {
      error: isProduction
        ? 'Database operation failed'
        : prismaError.message,
      code: prismaError.code,
    }
  }

  // 一般的なエラー
  if (error instanceof Error) {
    return {
      error: isProduction ? 'An error occurred' : error.message,
      code: 'UNKNOWN_ERROR',
      details: isProduction ? undefined : error.stack,
    }
  }

  // 不明なエラー
  return {
    error: isProduction ? 'An unexpected error occurred' : String(error),
    code: 'UNKNOWN_ERROR',
  }
}

/**
 * エラーログを記録
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}] ` : ''
  
  if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr}Error:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
  } else {
    console.error(`${timestamp} ${contextStr}Error:`, error)
  }
}

