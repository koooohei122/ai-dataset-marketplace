# AIデータセットマーケットプレイス 仕様書

## 1. プロジェクト概要

### 1.1 目的
AI開発者、研究者、企業が高品質なデータセットを購入・販売できるマーケットプレイスプラットフォームを構築する。

### 1.2 主要機能
- データセットの検索・閲覧
- データセットの購入・販売
- データセットのプレビュー・サンプル提供
- レビュー・評価システム
- ライセンス管理
- 決済システム
- ユーザー管理（購入者・販売者）

## 2. 技術スタック

### 2.1 フロントエンド
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **状態管理**: React Context / Zustand
- **フォーム管理**: React Hook Form + Zod
- **認証**: NextAuth.js / Auth.js

### 2.2 バックエンド
- **API**: Next.js API Routes / tRPC
- **データベース**: PostgreSQL (Prisma ORM)
  - **無料オプション**: Supabase（無料プラン）、Neon（無料プラン）、Railway（無料プラン）
- **ファイルストレージ**: 
  - **無料オプション**: Supabase Storage（無料枠: 1GB）、Cloudflare R2（無料枠: 10GB/月）、GitHub LFS
- **決済**: 
  - **無料オプション**: 手動決済（銀行振込、PayPal個人送金）、Stripe（手数料のみ、初期費用なし）
  - **代替案**: 無料プラットフォーム（手数料なし、販売者と直接取引）
- **検索**: PostgreSQL Full-Text Search（無料、組み込み）
- **画像処理**: Sharp（無料、オープンソース）

### 2.3 インフラ（無料構成）
- **ホスティング**: Vercel（無料プラン: 100GB帯域幅/月、無制限のデプロイ）
- **CDN**: Vercel組み込みCDN（無料）
- **監視**: Sentry（無料プラン: 5,000エラー/月）
- **分析**: 
  - Plausible（無料プラン: 10,000ページビュー/月）
  - Google Analytics（完全無料）
  - Vercel Analytics（無料プラン）

## 3. データモデル

### 3.1 ユーザー (User)
```typescript
{
  id: string (UUID)
  email: string (unique)
  name: string
  role: 'buyer' | 'seller' | 'admin'
  avatar?: string
  bio?: string
  createdAt: DateTime
  updatedAt: DateTime
  // 販売者情報
  sellerProfile?: {
    companyName?: string
    verified: boolean
    rating: number
    totalSales: number
  }
}
```

### 3.2 データセット (Dataset)
```typescript
{
  id: string (UUID)
  title: string
  description: string
  category: string // 'image', 'text', 'audio', 'video', 'tabular', 'multimodal'
  tags: string[]
  price: number // 0以上（0 = 無料、Epic Games Fabのような仕組み）
  currency: 'JPY' | 'USD' | 'EUR'
  isFree: boolean // 無料データセットかどうか（price === 0 と同等だが明示的に管理）
  license: string // 'commercial', 'non-commercial', 'academic', 'custom'
  licenseDetails?: string
  size: number // bytes
  fileCount: number
  format: string[] // ['CSV', 'JSON', 'PNG', etc.]
  language?: string[]
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt?: DateTime
  status: 'draft' | 'published' | 'archived'
  sellerId: string (FK)
  // 統計情報
  views: number
  purchases: number
  rating: number
  reviewCount: number
  // メタデータ
  metadata: {
    dimensions?: { width: number, height: number }
    sampleRate?: number
    duration?: number
    columns?: string[]
    rowCount?: number
  }
  // AI拡張情報
  augmentationInfo?: {
    enabled: boolean
    multiplier: number // 拡張倍率（例: 2 = 2倍に拡張）
    quality: 'fast' | 'standard' | 'high'
    originalFileCount: number
    generatedFileCount: number
    augmentationMethod: string // 'stable-diffusion', 'llm', 'audio-gen', etc.
    completedAt?: DateTime
  }
}
```

### 3.3 データセットファイル (DatasetFile)
```typescript
{
  id: string (UUID)
  datasetId: string (FK)
  fileName: string
  filePath: string // S3/R2 path
  fileSize: number
  fileType: string
  order: number
  isSample: boolean // プレビュー用サンプル
  createdAt: DateTime
}
```

### 3.4 購入 (Purchase)
```typescript
{
  id: string (UUID)
  userId: string (FK)
  datasetId: string (FK)
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'refunded'
  paymentMethod: string
  transactionId: string
  purchasedAt: DateTime
  downloadExpiresAt?: DateTime
  downloadCount: number
  maxDownloads: number
}
```

### 3.5 レビュー (Review)
```typescript
{
  id: string (UUID)
  userId: string (FK)
  datasetId: string (FK)
  purchaseId: string (FK) // 購入者のみレビュー可能
  rating: number // 1-5
  title: string
  comment: string
  pros?: string[]
  cons?: string[]
  verifiedPurchase: boolean
  helpfulCount: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 3.6 カテゴリ (Category)
```typescript
{
  id: string (UUID)
  name: string
  slug: string (unique)
  description?: string
  parentId?: string (FK) // 階層構造
  icon?: string
  order: number
}
```

## 4. 機能仕様

### 4.1 ユーザー認証・管理
- **登録・ログイン**
  - メールアドレス + パスワード
  - OAuth (Google, GitHub)
  - メール認証
- **プロフィール管理**
  - 基本情報編集
  - アバターアップロード
  - 販売者申請・審査
- **購入履歴**
  - 購入済みデータセット一覧
  - ダウンロード履歴
  - 領収書発行

### 4.2 データセット検索・閲覧
- **検索機能**
  - キーワード検索（タイトル、説明、タグ）
  - カテゴリフィルタ
  - 価格範囲フィルタ
  - ライセンスタイプフィルタ
  - 評価フィルタ
  - ソート（新着、人気、価格、評価）
- **詳細ページ**
  - データセット情報表示
  - サンプルデータプレビュー
  - レビュー一覧
  - 関連データセット推薦
  - 購入ボタン

### 4.3 データセット販売
- **作成・編集**
  - 基本情報入力フォーム
  - ファイルアップロード（ドラッグ&ドロップ対応）
  - サンプルファイル指定
  - プレビュー生成
  - 下書き保存
  - 公開・非公開設定
- **AIデータ拡張機能（新機能）**
  - アップロード時に自動でデータ拡張を実行するオプション
  - ユーザーのローカルCPU/GPUを使用してAI生成を実行
  - データタイプ別の拡張方法:
    - **画像データ**: Stable Diffusion等を使用した画像生成・バリエーション生成
    - **テキストデータ**: LLM（GPT等）を使用したテキスト生成・パラフレーズ
    - **音声データ**: 音声生成モデルを使用した音声バリエーション生成
    - **表形式データ**: 生成モデルを使用した行データ生成
  - 拡張倍率の設定（例: 2倍、3倍、5倍）
  - 生成品質の設定（高速/標準/高品質）
  - リアルタイム進捗表示
  - 生成されたデータの自動統合
  - 元データと生成データの識別タグ付け
- **管理**
  - 販売中データセット一覧
  - 売上統計
  - レビュー管理
  - 価格変更

### 4.4 価格設定・決済システム

#### 4.4.1 価格設定
- **出品ユーザーの価格設定**
  - 自由に価格を設定可能（0円以上）
  - 0円 = 無料データセット（Epic Games Fabのような仕組み）
  - 有料データセットも自由に価格設定可能
  - 価格変更はいつでも可能（購入済みユーザーには影響なし）

- **無料データセットの特徴**
  - 購入ボタンが「無料でダウンロード」に変更
  - 購入フローが簡略化（決済不要）
  - レビュー・評価は有料と同様に可能

#### 4.4.2 購入フロー

**無料データセットの場合:**
1. 「無料でダウンロード」をクリック
2. ログイン（未ログインの場合）
3. 即座にダウンロード権限付与
4. ダウンロード可能

**有料データセットの場合（手動決済方式）:**
1. カート追加
2. 購入申請
3. 販売者への通知（メール/プラットフォーム内通知）
4. 購入者が販売者に直接支払い（銀行振込、PayPal個人送金等）
5. 販売者が支払い確認後、ダウンロード権限を手動で付与
6. 購入完了・ダウンロード権限付与

**有料データセットの場合（自動決済方式）:**
1. カート追加
2. 決済情報入力
3. 決済処理（Stripe/PayPal）
4. 購入完了・ダウンロード権限自動付与

#### 4.4.3 プラットフォーム手数料（マージン）

- **手数料の仕組み**
  - 販売価格から一定の割合をプラットフォーム運営者が取得
  - 残りを販売者に支払い
  - 例: 価格¥10,000、手数料15%の場合
    - プラットフォーム手数料: ¥1,500
    - 販売者への支払い: ¥8,500

- **手数料率の設定**
  - **デフォルト手数料率**: 15%（推奨、業界標準）
  - **可変手数料率**: 運営者が設定可能（例: 10-20%）
  - **無料データセット**: 手数料なし（¥0のため）

- **手数料計算の詳細**
  - 決済手数料（Stripe等）は別途発生する場合あり
  - 決済手数料は販売者負担または運営者負担（設定可能）
  - 例: Stripe手数料3.6% + 40円の場合
    - プラットフォーム手数料: 販売価格 × 15%
    - 決済手数料: 販売価格 × 3.6% + 40円
    - 販売者への支払い: 販売価格 - プラットフォーム手数料 - 決済手数料

- **売上管理**
  - 販売者ダッシュボードで売上を確認可能
  - プラットフォーム手数料と販売者への支払い額を明示
  - 販売者への支払い（手動、月次または都度）
  - 税務処理（販売者自身で対応）

#### 4.4.4 支払い方法

- **無料データセット**: 支払い不要
- **有料データセット（手動決済）**:
  - 銀行振込（日本国内、手数料なし）
  - PayPal個人送金（手数料あり）
  - 暗号通貨（オプション、手数料なし）
- **有料データセット（自動決済）**:
  - クレジットカード（Stripe統合、手数料のみ、初期費用なし）
  - PayPal（手数料あり）

### 4.5 ダウンロード管理
- **ダウンロード権限**
  - 購入後30日間有効
  - 最大5回ダウンロード可能
  - 期限切れ・回数制限超過時の再購入
- **ダウンロード方式**
  - 直接ダウンロード（小規模データ）
  - メール送信（大規模データ）
  - ストリーミング（超大規模データ）

### 4.6 レビュー・評価
- **レビュー投稿**
  - 購入者のみ投稿可能
  - 5段階評価 + コメント
  - 長所・短所の記入
  - 画像添付（オプション）
- **レビュー表示**
  - 評価順・新着順ソート
  - 「役に立った」投票
  - 販売者返信機能

## 5. UI/UX設計

### 5.1 ページ構成
- **トップページ**
  - ヒーローセクション
  - カテゴリ一覧
  - 人気データセット
  - 新着データセット
  - 検索バー
- **検索結果ページ**
  - フィルタサイドバー
  - グリッド/リスト表示切替
  - ページネーション
- **データセット詳細ページ**
  - 画像ギャラリー
  - タブ構成（概要、サンプル、レビュー、仕様）
  - 固定購入ボタン
- **ダッシュボード**
  - 購入者: 購入履歴、ウィッシュリスト
  - 販売者: 販売管理、売上統計、アップロード
- **プロフィールページ**
  - ユーザー情報
  - 販売データセット一覧（販売者の場合）
  - レビュー履歴

### 5.2 デザイン原則
- **モダンでクリーンなデザイン**
- **レスポンシブ対応**（モバイルファースト）
- **アクセシビリティ対応**（WCAG 2.1 AA準拠）
- **ダークモード対応**
- **日本語・英語対応**（i18n）

## 6. セキュリティ・プライバシー

### 6.1 データ保護
- ファイルの暗号化保存
- ダウンロードURLの有効期限設定
- 不正アクセス防止（レート制限）
- 個人情報保護（GDPR準拠）

### 6.2 コンテンツ管理
- アップロードファイルのウイルススキャン
- 不適切コンテンツの自動検出
- 著作権侵害の報告機能
- モデレーション機能

## 7. パフォーマンス要件

### 7.1 ページ読み込み速度
- 初回読み込み: < 2秒
- 画像最適化: WebP形式、遅延読み込み
- コード分割: 動的インポート

### 7.2 スケーラビリティ
- ファイルストレージ: オブジェクトストレージ（S3/R2）
- CDN配信: 静的アセットの高速配信
- データベース: インデックス最適化、読み取りレプリカ

## 8. 開発フェーズ

### Phase 1: MVP（最小機能）
- ユーザー認証
- データセット一覧・検索
- データセット詳細表示
- 基本的な購入フロー
- ファイルアップロード・ダウンロード

### Phase 2: 機能拡張
- レビューシステム
- 販売者ダッシュボード
- 売上管理
- 高度な検索・フィルタ
- AIデータ拡張機能（画像データ対応）

### Phase 3: 最適化
- パフォーマンス最適化
- SEO対策
- 分析・レポート機能
- マルチカレンシー対応
- AIデータ拡張機能の拡張（テキスト・音声・表形式データ対応）

## 9. 運用・保守

### 9.1 モニタリング
- エラートラッキング（Sentry）
- パフォーマンス監視
- ユーザー行動分析

### 9.2 バックアップ（無料構成）
- **データベース**: 
  - Supabase: 自動バックアップ（有料プラン）、無料プランは手動エクスポート
  - 定期的な手動バックアップ（pg_dump）
- **ファイル**: 
  - Supabase Storage: 自動レプリケーション（有料プラン）
  - 無料プランは手動バックアップ推奨
  - GitHub LFSを使用する場合は自動バックアップ

## 10. 今後の拡張案

- AIによるデータセット推薦
- データセットのバージョン管理
- API連携（外部システムとの統合）
- サブスクリプションモデル
- データセットのカスタマイズオーダー
- コミュニティ機能（フォーラム、ディスカッション）

