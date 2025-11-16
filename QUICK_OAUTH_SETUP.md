# OAuth設定クイックガイド

## 🚀 最短5分で設定完了！

### 1. Google OAuth（3分）

1. https://console.cloud.google.com → プロジェクト作成
2. 「APIとサービス」→「OAuth同意画面」
   - 外部 → アプリ名入力 → 保存
3. 「認証情報」→「OAuth 2.0 クライアント ID作成」
   - ウェブアプリケーション
   - リダイレクトURI: `https://ai-dataset-marketplace.vercel.app/api/auth/callback/google`
4. **Client ID**と**Client Secret**をコピー

### 2. GitHub OAuth（2分）

1. https://github.com/settings/developers → 「New OAuth App」
2. 入力：
   - Homepage: `https://ai-dataset-marketplace.vercel.app`
   - Callback: `https://ai-dataset-marketplace.vercel.app/api/auth/callback/github`
3. 「Generate a new client secret」→ **Client ID**と**Client Secret**をコピー

### 3. Vercelに設定（1分）

1. Vercel → プロジェクト → Settings → Environment Variables
2. 以下を追加：
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   ```
3. **再デプロイ**（重要！）

### 4. 完了！

https://ai-dataset-marketplace.vercel.app/auth/signin で「Googleでログイン」「GitHubでログイン」が動作します。

詳細は `OAUTH_SETUP_GUIDE.md` を参照してください。

