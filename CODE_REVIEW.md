# コードレビュー結果

## 🔴 重大な問題（即座に修正が必要）

### 1. **セキュリティ: ファイルアップロードの検証不足**
**場所**: `app/api/datasets/upload/route.ts`

**問題点**:
- ファイルサイズ制限がない（DoS攻撃のリスク）
- ファイルタイプの検証がない（悪意のあるファイルのアップロードが可能）
- ファイル名のサニタイズがない（パストラバーサル攻撃のリスク）

**修正案**:
```typescript
// ファイルサイズ制限（例: 50MB）
const MAX_FILE_SIZE = 50 * 1024 * 1024
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'text/csv', 'application/json']

files.forEach((file) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File ${file.name} exceeds maximum size`)
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`)
  }
  // ファイル名のサニタイズ
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
})
```

### 2. **データベーススキーマの不一致**
**場所**: `app/api/purchase/create/route.ts`

**問題点**:
- `paymentMethod`と`transactionId`フィールドがスキーマに存在しない可能性
- `downloadExpiresAt`と`maxDownloads`がスキーマに存在しない可能性

**確認が必要**: Prismaスキーマを確認して、これらのフィールドが存在するか確認してください。

### 3. **環境変数の検証不足**
**場所**: 複数ファイル

**問題点**:
- 必須環境変数が設定されていない場合のエラーハンドリングが不十分
- 開発環境と本番環境で異なる動作をする可能性

**修正案**:
```typescript
// lib/env.ts を作成
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}
```

## 🟡 重要な問題（できるだけ早く修正）

### 4. **トランザクション処理の欠如**
**場所**: `app/api/datasets/upload/route.ts`

**問題点**:
- ファイルアップロードが成功したが、データベースへの保存が失敗した場合、ファイルが孤立する
- 逆に、データベース保存が成功したが、ファイルアップロードが失敗した場合、不整合が発生

**修正案**:
```typescript
// Prismaトランザクションを使用
await prisma.$transaction(async (tx) => {
  // 1. データセットを作成
  const dataset = await tx.dataset.create({...})
  
  // 2. ファイルをアップロード
  // 3. 失敗した場合は自動的にロールバック
})
```

### 5. **パフォーマンス: N+1クエリ問題**
**場所**: `app/api/datasets/[id]/reviews/route.ts`

**問題点**:
- レビュー作成時に複数のデータベースクエリが順次実行されている
- 評価計算のため、全レビューを取得している（非効率）

**修正案**:
```typescript
// 1つのクエリで評価を計算
const avgRating = await prisma.review.aggregate({
  where: { datasetId: dataset.id },
  _avg: { rating: true },
  _count: true,
})
```

### 6. **エラーメッセージの情報漏洩**
**場所**: 複数ファイル

**問題点**:
- エラーメッセージが詳細すぎて、内部構造を暴露している可能性

**修正案**:
```typescript
// 本番環境では詳細なエラーを隠す
const errorMessage = process.env.NODE_ENV === 'production'
  ? 'An error occurred'
  : error.message
```

### 7. **型安全性の問題**
**場所**: `app/api/wishlist/route.ts`

**問題点**:
- `as any`の使用により型安全性が失われている

**修正案**:
```typescript
// Prismaの型を正しく使用
import { Prisma } from '@prisma/client'

const wishlistItems = await prisma.wishlist.findMany({
  where: { userId: user.id },
  include: {
    dataset: {
      include: {
        category: true,
        seller: { select: { name: true } },
      },
    },
  },
  orderBy: { createdAt: 'desc' },
}) satisfies Prisma.WishlistGetPayload<{
  include: {
    dataset: {
      include: {
        category: true
        seller: { select: { name: true } }
      }
    }
  }
}>[]
```

## 🟢 改善提案（優先度: 中）

### 8. **コードの重複**
**場所**: 複数ファイル

**問題点**:
- ユーザーID取得のロジックが複数箇所で重複している

**修正案**:
```typescript
// lib/auth-helpers.ts を作成
export async function getUserIdFromSession(session: Session | null) {
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
  
  if (!user) {
    throw new Error('User not found')
  }
  
  return user.id
}
```

### 9. **マジックナンバー**
**場所**: 複数ファイル

**問題点**:
- ハードコードされた値（30日、5回、15%など）が散在している

**修正案**:
```typescript
// lib/constants.ts を作成
export const DOWNLOAD_EXPIRY_DAYS = 30
export const MAX_DOWNLOADS = 5
export const DEFAULT_PLATFORM_FEE_RATE = 15.0
export const STRIPE_FEE_RATE = 0.036
```

### 10. **ファイルダウンロードの実装が不完全**
**場所**: `app/api/datasets/[id]/download/route.ts`

**問題点**:
- ZIPファイルの作成が実装されていない
- 最初のファイルのみを返している

**修正案**:
```typescript
// archiver ライブラリを使用してZIPファイルを作成
import archiver from 'archiver'

const archive = archiver('zip', { zlib: { level: 9 } })
// すべてのファイルをZIPに追加
// ストリームとして返す
```

### 11. **入力検証の強化**
**場所**: `app/api/auth/signup/route.ts`

**問題点**:
- メールアドレスの形式検証がない
- パスワードの強度チェックが不十分

**修正案**:
```typescript
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Za-z0-9@$!%*#?&]/),
})
```

### 12. **レート制限の欠如**
**場所**: APIルート全般

**問題点**:
- APIエンドポイントにレート制限がない（DoS攻撃のリスク）

**修正案**:
```typescript
// next-rate-limit などのライブラリを使用
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大100リクエスト
})
```

## 📝 その他の改善提案

### 13. **ロギングの改善**
- 構造化ロギング（例: Winston, Pino）の導入
- エラートラッキング（例: Sentry）の統合

### 14. **テストの追加**
- 単体テスト
- 統合テスト
- E2Eテスト

### 15. **ドキュメント**
- APIドキュメント（OpenAPI/Swagger）
- コードコメントの追加

### 16. **パフォーマンス最適化**
- データベースクエリの最適化
- キャッシングの導入（Redis）
- 画像の最適化

## ✅ 良い点

1. **認証・認可**: NextAuth.jsを使用した適切な認証実装
2. **型安全性**: TypeScriptを使用した型定義
3. **エラーハンドリング**: 基本的なエラーハンドリングが実装されている
4. **セキュリティ**: パスワードのハッシュ化（bcrypt）が実装されている
5. **データベース**: Prismaを使用した型安全なデータベースアクセス

## 📊 優先度マトリックス

| 問題 | 優先度 | 影響度 | 修正難易度 |
|------|--------|--------|------------|
| ファイルアップロード検証 | 🔴 高 | 高 | 低 |
| スキーマ不一致 | 🔴 高 | 高 | 中 |
| トランザクション処理 | 🟡 中 | 中 | 中 |
| N+1クエリ | 🟡 中 | 中 | 低 |
| コード重複 | 🟢 低 | 低 | 低 |
| レート制限 | 🟡 中 | 中 | 低 |

## 🎯 次のステップ

1. **即座に修正**: セキュリティ関連の問題（1, 2, 3）
2. **今週中に修正**: トランザクション処理、N+1クエリ
3. **今月中に修正**: コードの重複、マジックナンバー
4. **継続的改善**: テスト、ドキュメント、パフォーマンス最適化

