# 無料で運営するためのガイド

このドキュメントでは、AIデータセットマーケットプレイスを**完全無料**で作成・運営する方法を説明します。

## 📊 無料で利用できるサービスの一覧

### 1. ホスティング（フロントエンド + API）

#### ✅ Vercel（推奨）
- **無料プラン**:
  - 100GB帯域幅/月
  - 無制限のデプロイ
  - 自動HTTPS
  - グローバルCDN
  - サーバーレス関数（100GB時間/月）
- **制限**: 
  - 個人プロジェクトのみ
  - チーム機能は有料
- **登録**: https://vercel.com

#### その他のオプション
- **Netlify**: 100GB帯域幅/月、無制限のデプロイ
- **Cloudflare Pages**: 無制限の帯域幅、無制限のデプロイ
- **GitHub Pages**: 静的サイトのみ（Next.jsの静的エクスポートが必要）

### 2. データベース

#### ✅ Supabase（推奨）
- **無料プラン**:
  - PostgreSQL 500MB
  - 2プロジェクト
  - 50,000行/月のAPIリクエスト
  - リアルタイム機能
  - 認証機能（組み込み）
- **制限**: 
  - プロジェクトは7日間非アクティブで一時停止
- **登録**: https://supabase.com

#### ✅ Neon
- **無料プラン**:
  - PostgreSQL 0.5GB
  - 自動スリープ（非アクティブ時）
  - 無制限のプロジェクト
- **制限**: 
  - スリープからの復帰に数秒かかる
- **登録**: https://neon.tech

#### ✅ Railway
- **無料プラン**:
  - $5クレジット/月
  - PostgreSQL利用可能
  - 自動デプロイ
- **制限**: 
  - クレジットを使い切ると停止
- **登録**: https://railway.app

### 3. ファイルストレージ

#### ✅ Supabase Storage（推奨）
- **無料プラン**:
  - 1GBストレージ
  - 2GB帯域幅/月
  - ファイルアップロードAPI
- **制限**: 
  - 1GBを超えると有料
- **使用方法**: Supabaseプロジェクトに含まれる

#### ✅ Cloudflare R2
- **無料プラン**:
  - 10GBストレージ/月
  - 1,000,000読み取り/月
  - 1,000,000書き込み/月
- **制限**: 
  - 帯域幅は無料（AWS S3と異なる）
- **登録**: https://www.cloudflare.com/products/r2

#### ✅ GitHub LFS（小規模データ向け）
- **無料プラン**:
  - 1GBストレージ
  - 1GB帯域幅/月
- **制限**: 
  - リポジトリに紐づく
  - 大規模データには不向き

### 4. 認証

#### ✅ NextAuth.js + OAuth（完全無料）
- **Google OAuth**: Google Cloud Consoleで無料作成
- **GitHub OAuth**: GitHubで無料作成
- **メール認証**: Resend無料プランまたはGmail SMTP

### 5. メール送信

#### ✅ Resend（推奨）
- **無料プラン**:
  - 3,000通/月
  - 100通/日
- **登録**: https://resend.com

#### ✅ Gmail SMTP
- **無料**: Gmailアカウントがあれば利用可能
- **制限**: 
  - 1日500通まで
  - アプリパスワードが必要

### 6. 決済システム

#### ✅ 手動決済（完全無料）
- **方法**: 
  - 購入者が販売者に直接支払い（銀行振込、PayPal個人送金等）
  - 販売者が支払い確認後、手動でダウンロード権限を付与
- **メリット**: 
  - 手数料なし
  - 初期費用なし
- **デメリット**: 
  - 自動化されていない
  - 販売者の作業負担

#### ✅ Stripe（手数料のみ）
- **初期費用**: なし
- **手数料**: 3.6% + 40円/取引
- **登録**: https://stripe.com

### 7. 監視・エラー追跡

#### ✅ Sentry
- **無料プラン**:
  - 5,000エラー/月
  - 1プロジェクト
  - 30日間のエラー履歴
- **登録**: https://sentry.io

### 8. 分析

#### ✅ Google Analytics
- **完全無料**: 無制限
- **登録**: https://analytics.google.com

#### ✅ Plausible
- **無料プラン**: 10,000ページビュー/月
- **登録**: https://plausible.io

#### ✅ Vercel Analytics
- **無料プラン**: Vercelにデプロイすれば自動で利用可能

## 🚀 推奨構成（完全無料）

```
┌─────────────────────────────────────────┐
│  フロントエンド + API                    │
│  Vercel (無料)                          │
└─────────────────────────────────────────┘
           │
           ├─→ Supabase (無料)
           │   ├─ PostgreSQL データベース
           │   └─ Storage (1GB)
           │
           ├─→ Resend (無料)
           │   └─ メール送信 (3,000通/月)
           │
           ├─→ Google Analytics (無料)
           │   └─ アクセス分析
           │
           └─→ Sentry (無料)
               └─ エラー追跡 (5,000エラー/月)
```

## 📝 セットアップ手順

### ステップ1: Supabaseプロジェクトの作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでログイン
4. 新しいプロジェクトを作成
5. プロジェクト設定:
   - 名前: `ai-dataset-marketplace`
   - データベースパスワード: 強力なパスワードを設定
   - リージョン: 最寄りのリージョンを選択

6. プロジェクト作成後、以下を取得:
   - `Project URL` (例: `https://xxxxx.supabase.co`)
   - `anon key` (公開キー)
   - `service_role key` (秘密キー、サーバーサイドのみ)
   - `Database URL` (接続文字列)

### ステップ2: Vercelプロジェクトの作成

1. https://vercel.com にアクセス
2. GitHubアカウントでログイン
3. リポジトリをインポート
4. 環境変数を設定（後述）

### ステップ3: Resendアカウントの作成

1. https://resend.com にアクセス
2. アカウント作成
3. APIキーを取得
4. ドメインを検証（オプション、カスタムドメイン使用時）

### ステップ4: Google OAuthの設定

1. https://console.cloud.google.com にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「認証情報」
4. 「OAuth同意画面」を設定
5. 「認証情報を作成」→「OAuth 2.0 クライアントID」
6. アプリケーションの種類: 「ウェブアプリケーション」
7. 承認済みのリダイレクトURI: `https://yourdomain.com/api/auth/callback/google`
8. クライアントIDとシークレットを取得

### ステップ5: GitHub OAuthの設定

1. GitHubにログイン
2. Settings → Developer settings → OAuth Apps
3. 「New OAuth App」をクリック
4. 設定:
   - Application name: `AI Dataset Marketplace`
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
5. クライアントIDとシークレットを取得

### ステップ6: 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を設定:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Supabase
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth
NEXTAUTH_URL="https://yourdomain.vercel.app"
NEXTAUTH_SECRET="your-secret-key" # openssl rand -base64 32

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Analytics (オプション)
NEXT_PUBLIC_GA_ID="your-google-analytics-id"
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"
```

## 💰 コスト試算

### 完全無料構成の場合

| サービス | 月額コスト | 制限 |
|---------|-----------|------|
| Vercel | ¥0 | 100GB帯域幅/月 |
| Supabase | ¥0 | 500MB DB、1GB Storage |
| Resend | ¥0 | 3,000通/月 |
| Google Analytics | ¥0 | 無制限 |
| Sentry | ¥0 | 5,000エラー/月 |
| **合計** | **¥0** | - |

### 小規模運用（月間1,000ユーザー想定）

- 帯域幅: 約10-20GB/月（Vercel無料枠内）
- データベース: 約100-200MB（Supabase無料枠内）
- ストレージ: 約500MB-1GB（Supabase無料枠内）
- メール: 約500-1,000通/月（Resend無料枠内）
- **結論: 完全無料で運用可能**

## ⚠️ 無料プランの制限と対策

### 1. Supabaseの7日間非アクティブ停止

**問題**: 7日間アクセスがないとプロジェクトが一時停止

**対策**:
- 定期的にアクセスする（cron jobでping）
- Vercelの無料プランで定期的にAPIを呼び出す
- またはNeonを使用（自動スリープだが復帰可能）

### 2. Vercelの帯域幅制限

**問題**: 100GB/月を超えると有料

**対策**:
- 画像の最適化（WebP、遅延読み込み）
- CDNキャッシュの活用
- 大容量ファイルは外部ストレージを使用

### 3. Supabase Storageの1GB制限

**問題**: 1GBを超えると有料

**対策**:
- 小規模データセットのみ受け入れる
- 大容量データはCloudflare R2に移行（10GB無料）
- または販売者に直接配布を依頼

### 4. Resendの3,000通/月制限

**問題**: 3,000通を超えると有料

**対策**:
- 重要なメールのみ送信
- バッチ処理でメール送信を最適化
- Gmail SMTPを併用

## 🔄 スケールアップ時の移行計画

無料プランから有料プランへの移行は簡単です：

1. **Vercel**: 無料→有料への移行は自動（制限を超えた場合）
2. **Supabase**: プランを変更するだけ（データはそのまま）
3. **Resend**: プランを変更するだけ

## 📚 参考リソース

- [Vercel無料プランの詳細](https://vercel.com/pricing)
- [Supabase無料プランの詳細](https://supabase.com/pricing)
- [Resend無料プランの詳細](https://resend.com/pricing)
- [Neon無料プランの詳細](https://neon.tech/pricing)

## 🎯 まとめ

この構成により、**完全無料**でAIデータセットマーケットプレイスを運営できます。小規模から中規模の運用であれば、無料プランで十分対応可能です。成長に合わせて段階的に有料プランに移行することも可能です。

