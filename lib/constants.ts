// アプリケーション全体で使用する定数

// ダウンロード関連
export const DOWNLOAD_EXPIRY_DAYS = 30
export const MAX_DOWNLOADS = 5

// プラットフォーム手数料
export const DEFAULT_PLATFORM_FEE_RATE = 15.0
export const STRIPE_FEE_RATE = 0.036

// ファイルアップロード関連
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024 // 500MB (全ファイル合計)
export const MAX_FILES_PER_DATASET = 1000

// 許可されるファイルタイプ
export const ALLOWED_FILE_TYPES = [
  // 画像
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // テキスト
  'text/plain',
  'text/csv',
  'text/json',
  'application/json',
  // データ
  'application/xml',
  'application/zip',
  'application/x-tar',
  'application/x-gzip',
  // その他
  'application/octet-stream',
]

// パスワード関連
export const MIN_PASSWORD_LENGTH = 8
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?&]{8,}$/

// レート制限
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15分
export const RATE_LIMIT_MAX_REQUESTS = 100

