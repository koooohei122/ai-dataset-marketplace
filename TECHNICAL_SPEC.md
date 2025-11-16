# 技術仕様書

## 1. データベーススキーマ（Prisma）

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  passwordHash  String?
  role          UserRole  @default(BUYER)
  avatar        String?
  bio           String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  datasets      Dataset[]
  purchases     Purchase[]
  reviews       Review[]
  sellerProfile SellerProfile?

  @@index([email])
  @@map("users")
}

enum UserRole {
  BUYER
  SELLER
  ADMIN
}

model SellerProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  companyName String?
  verified    Boolean  @default(false)
  rating      Float    @default(0)
  totalSales  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("seller_profiles")
}

model Category {
  id          String     @id @default(uuid())
  name        String
  slug        String     @unique
  description String?
  parentId    String?
  icon        String?
  order       Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  datasets Dataset[]

  @@index([slug])
  @@map("categories")
}

model Dataset {
  id            String        @id @default(uuid())
  title         String
  description   String        @db.Text
  categoryId    String
  tags          String[]
  price         Decimal       @db.Decimal(10, 2) // 0以上（0 = 無料）
  isFree        Boolean       @default(false)    // 無料データセットかどうか
  currency      String        @default("JPY")
  license       String
  licenseDetails String?      @db.Text
  size          BigInt
  fileCount     Int
  format        String[]
  language      String[]
  status        DatasetStatus @default(DRAFT)
  sellerId      String
  views         Int           @default(0)
  purchases     Int           @default(0)
  rating        Float         @default(0)
  reviewCount   Int           @default(0)
  metadata      Json?
  augmentationInfo Json?      // AI拡張情報
  publishedAt   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  category      Category      @relation(fields: [categoryId], references: [id])
  seller        User          @relation(fields: [sellerId], references: [id])
  files         DatasetFile[]
  purchases_rel Purchase[]
  reviews       Review[]

  @@index([categoryId])
  @@index([sellerId])
  @@index([status])
  @@index([createdAt])
  @@fulltext([title, description])
  @@map("datasets")
}

enum DatasetStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model DatasetFile {
  id         String   @id @default(uuid())
  datasetId  String
  fileName   String
  filePath   String
  fileSize   BigInt
  fileType   String
  order      Int      @default(0)
  isSample   Boolean  @default(false)
  isGenerated Boolean @default(false) // AI生成されたファイルかどうか
  sourceFileId String? // 元になったファイルのID（生成ファイルの場合）
  createdAt  DateTime @default(now())

  dataset Dataset @relation(fields: [datasetId], references: [id], onDelete: Cascade)

  @@index([datasetId])
  @@index([isGenerated])
  @@map("dataset_files")
}

model Purchase {
  id               String         @id @default(uuid())
  userId           String
  datasetId        String
  amount           Decimal        @db.Decimal(10, 2) // 販売価格
  currency         String
  status           PurchaseStatus @default(PENDING)
  paymentMethod    String
  transactionId    String         @unique
  purchasedAt      DateTime       @default(now())
  downloadExpiresAt DateTime?
  downloadCount    Int            @default(0)
  maxDownloads     Int            @default(5)
  // 手数料情報
  platformFee      Decimal        @db.Decimal(10, 2) // プラットフォーム手数料
  platformFeeRate  Decimal        @db.Decimal(5, 2)  // 手数料率（例: 15.00 = 15%）
  paymentFee        Decimal?      @db.Decimal(10, 2) // 決済手数料（Stripe等）
  sellerAmount     Decimal        @db.Decimal(10, 2) // 販売者への支払い額

  user    User    @relation(fields: [userId], references: [id])
  dataset Dataset @relation(fields: [datasetId], references: [id])

  @@index([userId])
  @@index([datasetId])
  @@index([status])
  @@map("purchases")
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  REFUNDED
}

model Review {
  id              String   @id @default(uuid())
  userId          String
  datasetId       String
  purchaseId      String
  rating          Int      // 1-5
  title           String
  comment         String   @db.Text
  pros            String[]
  cons            String[]
  verifiedPurchase Boolean @default(true)
  helpfulCount    Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id])
  dataset Dataset @relation(fields: [datasetId], references: [id])
  purchase Purchase @relation(fields: [purchaseId], references: [id])

  @@unique([userId, datasetId]) // 1ユーザー1レビュー
  @@index([datasetId])
  @@index([rating])
  @@map("reviews")
}

model Cart {
  id        String   @id @default(uuid())
  userId    String   @unique
  items     Json     // { datasetId: string, addedAt: DateTime }[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("carts")
}

model Wishlist {
  id        String   @id @default(uuid())
  userId    String
  datasetId String
  createdAt DateTime @default(now())

  @@unique([userId, datasetId])
  @@index([userId])
  @@map("wishlists")
}

model PlatformSettings {
  id                String   @id @default(uuid())
  platformFeeRate   Decimal  @db.Decimal(5, 2) @default(15.00) // デフォルト15%
  paymentFeeBearer  String   @default("SELLER") // 'SELLER' | 'PLATFORM' | 'BUYER'
  minPrice          Decimal? @db.Decimal(10, 2) // 最小価格（オプション）
  maxPrice          Decimal? @db.Decimal(10, 2) // 最大価格（オプション）
  allowFreeDatasets Boolean  @default(true)     // 無料データセットを許可
  updatedAt         DateTime @updatedAt
  updatedBy         String? // 更新者（管理者ID）

  @@map("platform_settings")
}
```

## 2. API エンドポイント設計

### 2.1 認証API
```
POST   /api/auth/register          - ユーザー登録
POST   /api/auth/login             - ログイン
POST   /api/auth/logout            - ログアウト
POST   /api/auth/verify-email      - メール認証
POST   /api/auth/reset-password    - パスワードリセット
GET    /api/auth/session           - セッション取得
```

### 2.2 データセットAPI
```
GET    /api/datasets               - データセット一覧（検索・フィルタ）
GET    /api/datasets/:id           - データセット詳細
POST   /api/datasets               - データセット作成（販売者）
PUT    /api/datasets/:id           - データセット更新
DELETE /api/datasets/:id           - データセット削除
GET    /api/datasets/:id/sample    - サンプルデータ取得
GET    /api/datasets/:id/reviews   - レビュー一覧
GET    /api/datasets/trending      - 人気データセット
GET    /api/datasets/recent        - 新着データセット
```

### 2.3 購入API
```
GET    /api/purchases              - 購入履歴
POST   /api/purchases              - 購入実行
GET    /api/purchases/:id          - 購入詳細
GET    /api/purchases/:id/download - ダウンロードURL取得
```

### 2.4 カートAPI
```
GET    /api/cart                   - カート取得
POST   /api/cart                   - カートに追加
DELETE /api/cart/:datasetId        - カートから削除
POST   /api/cart/checkout          - チェックアウト
```

### 2.5 レビューAPI
```
POST   /api/reviews                - レビュー投稿
PUT    /api/reviews/:id            - レビュー更新
DELETE /api/reviews/:id            - レビュー削除
POST   /api/reviews/:id/helpful    - 「役に立った」投票
```

### 2.6 ユーザーAPI
```
GET    /api/users/me               - 自分のプロフィール
PUT    /api/users/me               - プロフィール更新
GET    /api/users/:id              - ユーザープロフィール
POST   /api/users/seller/apply     - 販売者申請
```

### 2.7 ファイルアップロードAPI
```
POST   /api/upload                 - ファイルアップロード
POST   /api/upload/sample          - サンプルファイルアップロード
DELETE /api/upload/:fileId         - ファイル削除
```

### 2.8 AIデータ拡張API
```
POST   /api/augmentation/start     - データ拡張開始
GET    /api/augmentation/:id/status - 拡張処理の状態確認
POST   /api/augmentation/:id/cancel - 拡張処理のキャンセル
GET    /api/augmentation/models    - 利用可能なAIモデル一覧
POST   /api/augmentation/preview  - 拡張プレビュー（サンプル生成）
```

### 2.9 プラットフォーム設定API（管理者用）
```
GET    /api/platform/settings     - プラットフォーム設定取得
PUT    /api/platform/settings     - プラットフォーム設定更新（手数料率等）
GET    /api/platform/revenue     - プラットフォーム収益統計
GET    /api/platform/sellers     - 販売者別売上統計
```

### 2.10 売上管理API（販売者用）
```
GET    /api/seller/revenue        - 売上統計
GET    /api/seller/payouts        - 支払い履歴
POST   /api/seller/payout/request - 出金申請
GET    /api/seller/transactions   - 取引履歴
```

## 3. 環境変数設定（無料構成）

```env
# Database (無料オプション)
# Supabase無料プラン: 500MB、2プロジェクト
DATABASE_URL="postgresql://user:password@db.xxxxx.supabase.co:5432/postgres"

# または Neon無料プラン: 0.5GB、自動スリープ
# DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb"

# または Railway無料プラン: $5クレジット/月
# DATABASE_URL="postgresql://user:password@containers-us-west-xxx.railway.app:5432/railway"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key" # openssl rand -base64 32 で生成

# OAuth (無料)
GOOGLE_CLIENT_ID="" # Google Cloud Consoleで無料作成
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID="" # GitHub OAuth App無料作成
GITHUB_CLIENT_SECRET=""

# File Storage (無料オプション)
# Supabase Storage (無料枠: 1GB)
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# または Cloudflare R2 (無料枠: 10GB/月、1,000,000読み取り/月)
# CLOUDFLARE_R2_ACCOUNT_ID=""
# CLOUDFLARE_R2_ACCESS_KEY_ID=""
# CLOUDFLARE_R2_SECRET_ACCESS_KEY=""
# CLOUDFLARE_R2_BUCKET_NAME="ai-dataset-marketplace"

# Payment (オプション - 手動決済の場合は不要)
# Stripe (手数料のみ、初期費用なし)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Email (無料オプション)
# Resend無料プラン: 3,000通/月
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# または Gmail SMTP (無料、制限あり)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASSWORD="" # アプリパスワード

# Search (PostgreSQL Full-Text Search - 無料、組み込み)
# 追加の検索サービスは不要

# Analytics (無料)
# Plausible無料プラン: 10,000ページビュー/月
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=""

# または Google Analytics (完全無料)
NEXT_PUBLIC_GA_ID=""

# または Vercel Analytics (無料プラン)
# Vercelにデプロイすれば自動で利用可能

# Platform Settings (プラットフォーム設定)
PLATFORM_FEE_RATE=15.00  # デフォルト手数料率（15%）
PAYMENT_FEE_BEARER=SELLER # 'SELLER' | 'PLATFORM' | 'BUYER'
ALLOW_FREE_DATASETS=true  # 無料データセットを許可
```

## 4. ファイル構造

```
ai-dataset-marketplace/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   ├── page.tsx              # トップページ
│   │   ├── datasets/
│   │   │   ├── page.tsx          # 検索結果
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 詳細ページ
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # ダッシュボード
│   │   │   ├── purchases/        # 購入履歴
│   │   │   └── upload/           # アップロード
│   │   └── profile/
│   ├── api/
│   │   ├── auth/
│   │   ├── datasets/
│   │   ├── purchases/
│   │   ├── reviews/
│   │   ├── upload/
│   │   └── augmentation/        # AI拡張API
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dataset/
│   │   ├── DatasetCard.tsx
│   │   ├── DatasetDetail.tsx
│   │   └── DatasetPreview.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   └── FilterSidebar.tsx
│   ├── review/
│   │   └── ReviewList.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── stripe.ts
│   ├── s3.ts
│   ├── augmentation/             # AI拡張機能
│   │   ├── image.ts              # 画像拡張
│   │   ├── text.ts               # テキスト拡張
│   │   ├── audio.ts              # 音声拡張
│   │   ├── tabular.ts            # 表形式拡張
│   │   └── client.ts             # クライアント側処理
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── images/
├── types/
│   └── index.ts
├── hooks/
│   ├── useCart.ts
│   ├── useDataset.ts
│   └── useAugmentation.ts        # AI拡張フック
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 5. 主要な機能実装のポイント

### 5.1 ファイルアップロード
- クライアント: ドラッグ&ドロップ、進捗表示
- サーバー: マルチパートアップロード、S3直接アップロード（Presigned URL）
- バリデーション: ファイルタイプ、サイズ制限
- 処理: 画像のリサイズ・最適化、メタデータ抽出

### 5.2 検索機能
- PostgreSQL Full-Text Search（初期）
- 将来的にAlgolia統合
- ファジー検索、タイポ許容
- 検索結果のハイライト

### 5.3 決済フロー
- Stripe Checkout Session作成
- Webhookで決済完了を検知
- 購入レコード作成・ダウンロード権限付与
- メール通知送信

### 5.4 ダウンロード管理
- Presigned URL生成（有効期限30分）
- ダウンロード回数・期限チェック
- 大容量ファイルは分割ダウンロード対応

### 5.5 レビューシステム
- 購入確認（Purchaseテーブルとの紐付け）
- 評価の自動計算（Dataset.rating更新）
- スパム検出・モデレーション

### 5.6 AIデータ拡張機能
- **クライアントサイド処理（推奨）**
  - WebGPU/WebAssemblyを使用したブラウザ上でのAI生成
  - ユーザーのローカルリソース（CPU/GPU）を活用
  - サーバー負荷を軽減
  - プライバシー保護（データがローカルに留まる）
  
- **実装アーキテクチャ**
  - **画像データ**: 
    - Stable Diffusion WebUI / ComfyUI API統合
    - ONNX Runtime for Web（ブラウザ上で実行）
    - 画像バリエーション生成、スタイル転送
  - **テキストデータ**:
    - Transformers.js（ブラウザ上でLLM実行）
    - パラフレーズ生成、要約、拡張
    - ローカルLLM（Ollama等）との統合オプション
  - **音声データ**:
    - Web Audio API + 音声生成モデル
    - 音声バリエーション、ノイズ追加、ピッチ変更
  - **表形式データ**:
    - 生成モデル（GAN、VAE）を使用した行データ生成
    - 統計的特性を保持した合成データ生成

- **処理フロー**
  1. ユーザーがファイルアップロード時に「AI拡張を有効にする」を選択
  2. 拡張倍率（2倍、3倍、5倍）と品質設定を選択
  3. クライアント側でAIモデルをロード（初回は時間がかかる）
  4. 各ファイルに対してAI生成を実行
  5. 進捗をリアルタイムで表示（WebSocket / Server-Sent Events）
  6. 生成されたファイルを自動的にデータセットに追加
  7. 元ファイルと生成ファイルを識別タグで区別

- **フォールバック機能**
  - GPUが利用できない場合: CPUで実行（遅いが動作）
  - ブラウザが対応していない場合: サーバーサイド処理に切り替え
  - 大容量データの場合: サーバーサイド処理を推奨

- **パフォーマンス最適化**
  - バッチ処理（複数ファイルをまとめて処理）
  - モデルの量子化（軽量化）
  - プログレッシブ生成（低解像度→高解像度）
  - キャッシング（同じファイルの再生成を回避）

- **ユーザー体験**
  - 初回利用時のチュートリアル
  - 処理時間の見積もり表示
  - キャンセル機能
  - 生成結果のプレビュー
  - 生成ファイルの個別削除機能

## 6. セキュリティ対策

### 6.1 認証・認可
- JWT トークン（NextAuth.js）
- ロールベースアクセス制御（RBAC）
- CSRF対策
- レート制限（API Routes）

### 6.2 データ保護
- パスワードハッシュ化（bcrypt）
- 機密情報の環境変数管理
- SQLインジェクション対策（Prisma）
- XSS対策（React自動エスケープ）

### 6.3 ファイルセキュリティ
- ウイルススキャン（ClamAV）
- ファイルタイプ検証
- アクセス制御（Presigned URL）
- ストレージの暗号化

## 7. パフォーマンス最適化

### 7.1 フロントエンド
- 画像最適化（next/image）
- コード分割（動的インポート）
- 静的生成（ISR）
- キャッシング戦略

### 7.2 バックエンド
- データベースインデックス最適化
- クエリ最適化（N+1問題回避）
- Redis キャッシング（オプション）
- CDN配信

## 8. テスト戦略

### 8.1 単体テスト
- ユーティリティ関数
- コンポーネント（React Testing Library）
- API Routes（Jest）

### 8.2 統合テスト
- データベース操作
- 認証フロー
- 決済フロー

### 8.3 E2Eテスト
- Playwright / Cypress
- 主要ユーザーフロー

## 9. デプロイメント（無料構成）

### 9.1 開発環境
- ローカルPostgreSQL（Docker Compose）またはSupabaseローカル開発
- Next.js開発サーバー（`pnpm dev`）

### 9.2 本番環境（無料構成）
- **Vercel**（フロントエンド + API、無料プラン）
  - 自動デプロイ（GitHub連携）
  - グローバルCDN（無料）
  - HTTPS自動設定
- **Supabase**（PostgreSQL + Storage、無料プラン）
  - 500MBデータベース
  - 1GBストレージ
  - リアルタイム機能
- **Resend**（メール送信、無料プラン）
  - 3,000通/月
- **Google Analytics**（分析、完全無料）
- **Sentry**（エラー追跡、無料プラン）
  - 5,000エラー/月

### 9.3 デプロイ手順

1. **Supabaseプロジェクト作成**
   ```bash
   # Supabaseでプロジェクトを作成
   # DATABASE_URLを取得
   ```

2. **Vercelにデプロイ**
   ```bash
   # Vercel CLIを使用
   npm i -g vercel
   vercel
   
   # またはGitHubと連携して自動デプロイ
   ```

3. **環境変数の設定**
   - Vercelのダッシュボードで環境変数を設定
   - または`vercel env add`コマンドで設定

4. **データベースマイグレーション**
   ```bash
   pnpm prisma migrate deploy
   pnpm prisma generate
   ```

## 10. モニタリング・ログ

### 10.1 エラー追跡
- Sentry統合
- エラーログの自動通知

### 10.2 パフォーマンス監視
- Vercel Analytics
- データベースクエリ監視

### 10.3 ユーザー行動分析
- Plausible / Google Analytics
- カスタムイベント追跡

