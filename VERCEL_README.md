# Vercelデプロイガイド

## ✅ ビルド確認済み

ビルドは成功しています。Vercelへのデプロイ準備が整いました。

## 🚀 デプロイ手順

### 1. GitHubリポジトリにプッシュ

```bash
git add .
git commit -m "Vercelデプロイ準備完了"
git push origin main
```

### 2. Vercelでプロジェクトを作成

1. [Vercel](https://vercel.com)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定を確認

### 3. 環境変数を設定

Vercelダッシュボードの「Settings」>「Environment Variables」で以下を設定：

#### 必須環境変数

```
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=ランダムな文字列（32文字以上推奨）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### オプション環境変数（OAuth用）

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### オプション環境変数（メール送信用）

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 4. デプロイ

「Deploy」ボタンをクリックしてデプロイを開始します。

## 📋 デプロイ前チェックリスト

- [ ] ビルドが成功する（`npm run build`）
- [ ] すべての必須環境変数が設定されている
- [ ] データベースが外部接続を許可している
- [ ] Supabase Storageに`datasets`バケットが作成されている
- [ ] Prismaマイグレーションが適用されている

## 🔧 ビルド設定

Vercelは自動的に以下を検出します：

- **Framework**: Next.js
- **Build Command**: `npm run build`（Prisma generate含む）
- **Output Directory**: `.next`
- **Install Command**: `npm install`

`vercel.json`で設定をカスタマイズできます。

## ⚠️ 注意事項

### 環境変数の設定

すべての必須環境変数をVercelダッシュボードで設定してください。
設定されていない場合、アプリケーションが起動しません。

### Prismaマイグレーション

初回デプロイ後、データベースのマイグレーションを実行してください：

```bash
# ローカルで実行
npx prisma migrate deploy
```

または、Vercelのビルドコマンドに追加（既に`package.json`に含まれています）。

### Supabase Storage

Supabase Storageに`datasets`バケットを作成してください：

1. Supabaseダッシュボード > Storage
2. 「Create bucket」をクリック
3. バケット名: `datasets`
4. Public bucket: `false`（推奨）

## 🐛 トラブルシューティング

### ビルドエラー

**エラー**: `Missing required environment variable`

**解決方法**:
- Vercelダッシュボードで環境変数を確認
- すべての必須環境変数が設定されているか確認

### ランタイムエラー

**エラー**: `Database connection failed`

**解決方法**:
- `DATABASE_URL`が正しく設定されているか確認
- データベースが外部接続を許可しているか確認
- 接続プールURLを使用しているか確認（Supabaseの場合）

### Supabaseエラー

**エラー**: `Supabase client initialization failed`

**解決方法**:
- `SUPABASE_URL`と`SUPABASE_ANON_KEY`が正しく設定されているか確認
- Supabaseプロジェクトがアクティブか確認

## 📊 デプロイ後の確認

1. **ホームページ**: `https://your-app.vercel.app`
2. **認証**: サインアップ/サインインが動作するか
3. **データベース**: データセット一覧が表示されるか
4. **ファイルアップロード**: Supabase Storageへの接続が正常か

## 🔗 参考リンク

- [Vercel環境変数の設定](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

