// 環境変数の検証と取得

export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue
}

// よく使う環境変数の型安全な取得
export const env = {
  // データベース
  databaseUrl: () => {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is required. Please set it in your environment variables.')
    }
    return url
  },
  
  // NextAuth
  nextAuthUrl: () => {
    const url = process.env.NEXTAUTH_URL
    if (!url) {
      throw new Error('NEXTAUTH_URL is required. Please set it in your environment variables.')
    }
    return url
  },
  nextAuthSecret: () => {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET is required. Please set it in your environment variables.')
    }
    return secret
  },
  
  // OAuth
  googleClientId: () => getOptionalEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: () => getOptionalEnv('GOOGLE_CLIENT_SECRET'),
  githubClientId: () => getOptionalEnv('GITHUB_CLIENT_ID'),
  githubClientSecret: () => getOptionalEnv('GITHUB_CLIENT_SECRET'),
  
  // Supabase
  supabaseUrl: () => {
    const url = process.env.SUPABASE_URL
    if (!url) {
      throw new Error('SUPABASE_URL is required. Please set it in your environment variables.')
    }
    return url
  },
  supabaseAnonKey: () => {
    const key = process.env.SUPABASE_ANON_KEY
    if (!key) {
      throw new Error('SUPABASE_ANON_KEY is required. Please set it in your environment variables.')
    }
    return key
  },
  supabaseServiceRoleKey: () => getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
  
  // メール
  smtpHost: () => getOptionalEnv('SMTP_HOST', 'smtp.gmail.com'),
  smtpPort: () => parseInt(getOptionalEnv('SMTP_PORT', '587')),
  smtpUser: () => getOptionalEnv('SMTP_USER'),
  smtpPassword: () => getOptionalEnv('SMTP_PASSWORD'),
  emailFrom: () => getOptionalEnv('EMAIL_FROM'),
  
  // その他
  nodeEnv: () => getOptionalEnv('NODE_ENV', 'development'),
  isProduction: () => env.nodeEnv() === 'production',
  isDevelopment: () => env.nodeEnv() === 'development',
}

