// ファイル検証ユーティリティ

import { MAX_FILE_SIZE, MAX_TOTAL_SIZE, ALLOWED_FILE_TYPES } from './constants'

export class FileValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'FileValidationError'
  }
}

/**
 * ファイル名をサニタイズ
 */
export function sanitizeFileName(fileName: string): string {
  // 危険な文字を削除または置換
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // 英数字、ドット、アンダースコア、ハイフンのみ許可
    .replace(/^\.+/, '') // 先頭のドットを削除
    .replace(/\.+$/, '') // 末尾のドットを削除
    .substring(0, 255) // ファイル名の最大長を制限
}

/**
 * 単一ファイルの検証
 */
export function validateFile(file: File): void {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(
      `File "${file.name}" exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      'FILE_TOO_LARGE'
    )
  }

  // ファイルタイプチェック
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new FileValidationError(
      `File type "${file.type}" is not allowed`,
      'INVALID_FILE_TYPE'
    )
  }

  // ファイル名の検証
  if (!file.name || file.name.trim().length === 0) {
    throw new FileValidationError('File name is required', 'INVALID_FILE_NAME')
  }

  // ファイル名が長すぎる場合
  if (file.name.length > 255) {
    throw new FileValidationError('File name is too long', 'FILE_NAME_TOO_LONG')
  }
}

/**
 * 複数ファイルの検証
 */
export function validateFiles(files: File[]): void {
  if (files.length === 0) {
    throw new FileValidationError('At least one file is required', 'NO_FILES')
  }

  if (files.length > 1000) {
    throw new FileValidationError('Too many files', 'TOO_MANY_FILES')
  }

  // 各ファイルを検証
  files.forEach(validateFile)

  // 合計サイズをチェック
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  if (totalSize > MAX_TOTAL_SIZE) {
    throw new FileValidationError(
      `Total file size exceeds maximum of ${MAX_TOTAL_SIZE / 1024 / 1024}MB`,
      'TOTAL_SIZE_TOO_LARGE'
    )
  }
}

