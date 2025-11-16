# サイト開設手順書

実際にサイトを開設するための詳細な手順です。

## 🎯 目標

AIデータセットマーケットプレイスを**完全無料**で開設し、以下のURLでアクセス可能にする：
- `https://your-project.vercel.app`（Vercelの無料ドメイン）
- または `https://yourdomain.com`（カスタムドメイン）

## 📦 ステップ1: プロジェクトのセットアップ

### 1.1 Next.jsプロジェクトの作成

```bash
cd ai-dataset-marketplace
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

### 1.2 必要なパッケージのインストール

```bash
# 認証
pnpm add next-auth @auth/prisma-adapter

# データベース
pnpm add @prisma/client
pnpm add -D prisma

# UIコンポーネント
pnpm add @radix-ui/react-*  # shadcn/ui用
pnpm add class-variance-authority clsx tailwind-merge

# フォーム
pnpm add react-hook-form @hookform/resolvers zod

# その他
pnpm add date-fns
```

### 1.3 Prismaのセットアップ

```bash
pnpm prisma init
```

## 🔧 ステップ2: サービスアカウントの作成

### 2.1 Supabaseプロジェクト作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでログイン
4. 新しいプロジェクトを作成:
   - **名前**: `ai-dataset-marketplace`
   - **データベースパスワード**: 強力なパスワードを設定（メモしておく）
   - **リージョン**: 最寄りのリージョン（例: Northeast Asia (Tokyo)）

5. プロジェクト作成後、以下を取得:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon key**: Settings → API → Project API keys → anon public
   - **service_role key**: Settings → API → Project API keys → service_role（秘密）
   - **Database URL**: Settings → Database → Connection string → URI

### 2.2 Vercelアカウント作成

1. https://vercel.com にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントでログイン
4. 完了（まだプロジェクトは作成しない）

### 2.3 Google OAuth設定（オプション）

1. https://console.cloud.google.com にアクセス
2. 新しいプロジェクトを作成: `AI Dataset Marketplace`
3. 「APIとサービス」→「認証情報」
4. 「OAuth同意画面」を設定:
   - ユーザータイプ: 外部
   - アプリ名: AI Dataset Marketplace
   - ユーザーサポートメール: あなたのメール
   - 開発者の連絡先情報: あなたのメール
5. 「認証情報を作成」→「OAuth 2.0 クライアントID」
6. アプリケーションの種類: ウェブアプリケーション
7. 承認済みのリダイレクトURI: 
   - `http://localhost:3000/api/auth/callback/google`（開発用）
   - `https://your-project.vercel.app/api/auth/callback/google`（本番用）
8. **Client ID** と **Client Secret** を取得（メモしておく）

### 2.4 GitHub OAuth設定（オプション）

1. GitHubにログイン
2. Settings → Developer settings → OAuth Apps
3. 「New OAuth App」をクリック
4. 設定:
   - **Application name**: `AI Dataset Marketplace`
   - **Homepage URL**: `https://your-project.vercel.app`
   - **Authorization callback URL**: `https://your-project.vercel.app/api/auth/callback/github`
5. **Client ID** と **Client Secret** を取得（メモしておく）

### 2.5 Resendアカウント作成（オプション）

1. https://resend.com にアクセス
2. アカウント作成
3. API Keys → Create API Key
4. **API Key** を取得（メモしておく）

## 🔐 ステップ3: 環境変数の設定

### 3.1 ローカル環境変数（`.env.local`）

プロジェクトルートに `.env.local` ファイルを作成：

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Supabase
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key" # openssl rand -base64 32 で生成

# OAuth (オプション)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email (オプション)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Platform Settings
PLATFORM_FEE_RATE=15.00
PAYMENT_FEE_BEARER=SELLER
ALLOW_FREE_DATASETS=true
```

### 3.2 NEXTAUTH_SECRETの生成

```bash
# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))

# Mac/Linux
openssl rand -base64 32
```

## 🗄️ ステップ4: データベースのセットアップ

### 4.1 Prismaスキーマの作成

`prisma/schema.prisma` にデータベーススキーマを定義（TECHNICAL_SPEC.mdを参照）

### 4.2 マイグレーション実行

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

## 🚀 ステップ5: 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` にアクセスして確認

## 🌐 ステップ6: Vercelにデプロイ

### 6.1 GitHubリポジトリにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ai-dataset-marketplace.git
git push -u origin main
```

### 6.2 Vercelでプロジェクトを作成

1. https://vercel.com にアクセス
2. 「Add New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `pnpm build`（自動検出される）
   - Output Directory: `.next`（自動検出される）

### 6.3 環境変数の設定

Vercelのプロジェクト設定で、`.env.local` と同じ環境変数を設定

### 6.4 デプロイ

「Deploy」をクリック → 数分でデプロイ完了

### 6.5 アクセス

デプロイ完了後、以下のURLでアクセス可能：
```
https://your-project.vercel.app
```

## 📝 チェックリスト

サイト開設までのチェックリスト：

- [ ] Next.jsプロジェクト作成
- [ ] 必要なパッケージインストール
- [ ] Supabaseプロジェクト作成
- [ ] Vercelアカウント作成
- [ ] OAuth設定（Google、GitHub）
- [ ] 環境変数設定
- [ ] データベースマイグレーション
- [ ] ローカルで動作確認
- [ ] GitHubにプッシュ
- [ ] Vercelにデプロイ
- [ ] 本番環境で動作確認

## 🆘 トラブルシューティング

### データベース接続エラー

- SupabaseのDatabase URLが正しいか確認
- ファイアウォール設定を確認（SupabaseのSettings → Database → Connection pooling）

### OAuthエラー

- リダイレクトURIが正しいか確認
- Client IDとSecretが正しいか確認

### デプロイエラー

- 環境変数がすべて設定されているか確認
- ビルドログを確認

## 📞 サポート

問題が発生した場合は、エラーメッセージと一緒に教えてください。解決方法を提案します。

