# Vercelデプロイチェックリスト

## ✅ ビルド確認

ビルドは成功しています：
- ✓ コンパイル成功
- ✓ 型チェック成功
- ✓ 全ページ生成完了

## 🔧 必要な環境変数

Vercelのダッシュボードで以下の環境変数を設定してください：

### 必須環境変数

#### データベース
```
DATABASE_URL=postgresql://...
```

#### NextAuth
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=ランダムな文字列（openssl rand -base64 32で生成）
```

#### Supabase
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### オプション環境変数（OAuth用）

#### Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### GitHub OAuth
```
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### オプション環境変数（メール送信用）

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### オプション環境変数（その他）

```
NODE_ENV=production
```

## 📝 Vercelデプロイ手順

1. **GitHubリポジトリを接続**
   - Vercelダッシュボードで「New Project」を選択
   - GitHubリポジトリを選択

2. **環境変数を設定**
   - プロジェクト設定 > Environment Variables
   - 上記の環境変数をすべて設定

3. **ビルド設定の確認**
   - Build Command: `npm run build`（デフォルト）
   - Output Directory: `.next`（デフォルト）
   - Install Command: `npm install`（デフォルト）

4. **デプロイ**
   - 「Deploy」ボタンをクリック

## ⚠️ 注意事項

### 環境変数の必須チェック

現在、`lib/env.ts`で必須環境変数のチェックが厳しすぎる可能性があります。
Vercelデプロイ時に環境変数が設定されていない場合、アプリケーションが起動しません。

**対処方法**:
- すべての必須環境変数をVercelダッシュボードで設定してください
- または、`lib/env.ts`の`getRequiredEnv`をオプショナルに変更してください

### Prismaのマイグレーション

Vercelデプロイ後、データベースのマイグレーションを実行する必要があります：

```bash
# ローカルで実行
npx prisma migrate deploy
```

または、Vercelのビルドコマンドに追加：

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Supabase Storageの設定

Supabase Storageに`datasets`バケットを作成してください：

1. Supabaseダッシュボード > Storage
2. 「Create bucket」をクリック
3. バケット名: `datasets`
4. Public bucket: `false`（推奨）

## 🔍 デプロイ後の確認事項

1. **ホームページが表示されるか**
   - `https://your-app.vercel.app`

2. **認証が動作するか**
   - サインアップ/サインインができるか

3. **データベース接続が正常か**
   - データセット一覧が表示されるか

4. **ファイルアップロードが動作するか**
   - Supabase Storageへの接続が正常か

5. **エラーログの確認**
   - Vercelダッシュボード > Functions > Logs

## 🐛 トラブルシューティング

### ビルドエラー

**エラー**: `Missing required environment variable`

**解決方法**:
- Vercelダッシュボードで環境変数を設定
- または、`lib/env.ts`を修正してオプショナルにする

### ランタイムエラー

**エラー**: `Database connection failed`

**解決方法**:
- `DATABASE_URL`が正しく設定されているか確認
- データベースが外部接続を許可しているか確認

### Supabaseエラー

**エラー**: `Supabase client initialization failed`

**解決方法**:
- `SUPABASE_URL`と`SUPABASE_ANON_KEY`が正しく設定されているか確認
- Supabaseプロジェクトがアクティブか確認

## 📚 参考リンク

- [Vercel環境変数の設定](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

