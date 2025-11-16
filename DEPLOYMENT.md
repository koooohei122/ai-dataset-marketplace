# デプロイ手順

GitHubアカウント: **koooohei122**

## 🚀 デプロイまでの手順

### ステップ1: GitHubリポジトリの作成

1. https://github.com/new にアクセス
2. リポジトリ名: `ai-dataset-marketplace`
3. 説明: `AI開発者、研究者、企業向けのデータセット販売・購入プラットフォーム`
4. Public または Private を選択
5. 「Create repository」をクリック

### ステップ2: ローカルでGitを初期化

```bash
cd ai-dataset-marketplace
git init
git add .
git commit -m "Initial commit: Next.js project setup"
git branch -M main
git remote add origin https://github.com/koooohei122/ai-dataset-marketplace.git
git push -u origin main
```

### ステップ3: Vercelでデプロイ

1. https://vercel.com にアクセス
2. GitHubアカウント（koooohei122）でログイン
3. 「Add New Project」をクリック
4. `ai-dataset-marketplace` リポジトリを選択
5. プロジェクト設定:
   - Framework Preset: **Next.js**（自動検出）
   - Root Directory: `./`
   - Build Command: `pnpm build`（自動）
   - Output Directory: `.next`（自動）
6. 環境変数を設定（後述）
7. 「Deploy」をクリック

### ステップ4: 環境変数の設定

Vercelのプロジェクト設定 → Environment Variables で以下を設定：

```env
# Database (Supabase作成後)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key

# OAuth (オプション)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email (オプション)
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com

# Platform Settings
PLATFORM_FEE_RATE=15.00
PAYMENT_FEE_BEARER=SELLER
ALLOW_FREE_DATASETS=true
```

### ステップ5: デプロイ完了

デプロイが完了すると、以下のURLでアクセス可能になります：

```
https://ai-dataset-marketplace.vercel.app
```

または、カスタムドメインを設定した場合：

```
https://yourdomain.com
```

## 📝 チェックリスト

- [ ] GitHubリポジトリ作成
- [ ] ローカルでGit初期化・プッシュ
- [ ] Vercelアカウント作成
- [ ] Vercelでプロジェクト作成
- [ ] Supabaseプロジェクト作成（データベース用）
- [ ] 環境変数設定
- [ ] デプロイ実行
- [ ] 動作確認

## 🔄 今後の更新

コードを更新したら、GitHubにプッシュするだけで自動デプロイされます：

```bash
git add .
git commit -m "Update: 機能追加"
git push
```

Vercelが自動的に新しいデプロイを開始します。

## 🆘 トラブルシューティング

### デプロイエラー

- 環境変数がすべて設定されているか確認
- ビルドログを確認（VercelのDeployments → 該当デプロイ → Build Logs）

### データベース接続エラー

- SupabaseのDatabase URLが正しいか確認
- ファイアウォール設定を確認

## 📞 次のステップ

Supabaseの接続情報を取得したら、環境変数を設定してデプロイを完了させましょう！

