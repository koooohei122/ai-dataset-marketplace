# OAuth設定ガイド（Google/GitHub）

エンドユーザーがGoogle/GitHubアカウントで簡単にログインできるようにするための設定手順です。

## 📋 設定の流れ

1. Google OAuth設定
2. GitHub OAuth設定
3. 環境変数の設定（Vercel）
4. 動作確認

---

## 🔵 Google OAuth設定

### ステップ1: Google Cloud Consoleでプロジェクト作成

1. https://console.cloud.google.com にアクセス
2. Googleアカウントでログイン
3. プロジェクトを選択（または新規作成）
   - プロジェクト名: `AI Dataset Marketplace`（任意）

### ステップ2: OAuth同意画面の設定

1. 左メニューから「APIとサービス」→「OAuth同意画面」を選択
2. ユーザータイプを選択：
   - **外部**を選択（一般ユーザーが使用するため）
   - 「作成」をクリック
3. アプリ情報を入力：
   - **アプリ名**: `AI Dataset Marketplace`
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **アプリのロゴ**: 任意（オプション）
   - **アプリのホームページ**: `https://ai-dataset-marketplace.vercel.app`
   - **プライバシーポリシーURL**: 任意（オプション）
   - **利用規約URL**: 任意（オプション）
   - **承認済みのドメイン**: `vercel.app`（Vercelのドメイン）
4. 「保存して次へ」をクリック
5. スコープ設定：
   - デフォルトのスコープでOK（email, profile, openid）
   - 「保存して次へ」をクリック
6. テストユーザー（開発中のみ必要）：
   - テストユーザーを追加（任意）
   - 「保存して次へ」をクリック
7. 概要を確認して「ダッシュボードに戻る」

### ステップ3: OAuth 2.0 クライアント IDの作成

1. 左メニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
3. アプリケーションの種類を選択：
   - **ウェブアプリケーション**を選択
4. 名前を入力：
   - **名前**: `AI Dataset Marketplace Web Client`
5. 承認済みのリダイレクト URIを追加：
   ```
   https://ai-dataset-marketplace.vercel.app/api/auth/callback/google
   ```
   - 開発環境用（ローカル）も追加する場合：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. 「作成」をクリック
7. **クライアント ID**と**クライアント シークレット**をコピー
   - ⚠️ シークレットは一度しか表示されないので、必ずコピーしてください

### ステップ4: 取得した情報

- **GOOGLE_CLIENT_ID**: クライアント ID（例: `123456789-abcdefghijklmnop.apps.googleusercontent.com`）
- **GOOGLE_CLIENT_SECRET**: クライアント シークレット（例: `GOCSPX-xxxxxxxxxxxxx`）

---

## 🐙 GitHub OAuth設定

### ステップ1: GitHubでOAuth Appを作成

1. https://github.com にログイン
2. 右上のアイコンをクリック→「Settings」
3. 左メニューから「Developer settings」を選択
4. 「OAuth Apps」を選択
5. 「New OAuth App」をクリック

### ステップ2: OAuth App情報を入力

1. **Application name**: `AI Dataset Marketplace`
2. **Homepage URL**: `https://ai-dataset-marketplace.vercel.app`
3. **Application description**: `AI Dataset Marketplace - データセット販売・購入プラットフォーム`（任意）
4. **Authorization callback URL**: 
   ```
   https://ai-dataset-marketplace.vercel.app/api/auth/callback/github
   ```
   - 開発環境用（ローカル）も追加する場合：
   ```
   http://localhost:3000/api/auth/callback/github
   ```
5. 「Register application」をクリック

### ステップ3: Client Secretを生成

1. 作成されたOAuth Appのページで「Generate a new client secret」をクリック
2. 確認画面で「I understand, generate a new client secret」をクリック
3. **Client ID**と**Client secret**をコピー
   - ⚠️ Client secretは一度しか表示されないので、必ずコピーしてください

### ステップ4: 取得した情報

- **GITHUB_CLIENT_ID**: Client ID（例: `Iv1.xxxxxxxxxxxxx`）
- **GITHUB_CLIENT_SECRET**: Client secret（例: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

---

## ⚙️ 環境変数の設定

### Vercelでの設定

1. https://vercel.com にアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables** を開く
4. 以下の環境変数を追加：

```env
GOOGLE_CLIENT_ID=取得したGoogleクライアントID
GOOGLE_CLIENT_SECRET=取得したGoogleクライアントシークレット
GITHUB_CLIENT_ID=取得したGitHubクライアントID
GITHUB_CLIENT_SECRET=取得したGitHubクライアントシークレット
```

5. 各環境変数を追加後、「Save」をクリック
6. **重要**: 環境変数を追加したら、**再デプロイ**が必要です
   - 「Deployments」タブから最新のデプロイを選択
   - 「Redeploy」をクリック

### ローカル環境での設定（開発用）

`.env.local`ファイルに追加：

```env
GOOGLE_CLIENT_ID=取得したGoogleクライアントID
GOOGLE_CLIENT_SECRET=取得したGoogleクライアントシークレット
GITHUB_CLIENT_ID=取得したGitHubクライアントID
GITHUB_CLIENT_SECRET=取得したGitHubクライアントシークレット
```

---

## ✅ 動作確認

### 1. 再デプロイ後

1. https://ai-dataset-marketplace.vercel.app/auth/signin にアクセス
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウント選択画面が表示されればOK
4. 同様に「GitHubでログイン」も確認

### 2. ログインフロー確認

- Google/GitHubアカウントでログイン
- 初回ログイン時は自動的にアカウントが作成される
- ログイン後、トップページにリダイレクトされる

---

## 🔒 セキュリティ注意事項

1. **Client Secretは絶対に公開しない**
   - GitHubにコミットしない（`.env.local`は`.gitignore`に含まれています）
   - 環境変数としてのみ管理

2. **リダイレクトURIの確認**
   - 本番環境と開発環境で異なるURIを設定
   - 正確なURLを設定（末尾のスラッシュに注意）

3. **OAuth同意画面の設定**
   - 本番環境では「公開」に設定する必要があります
   - 開発中は「テスト」モードで動作します

---

## 🐛 トラブルシューティング

### Google OAuthが動作しない場合

1. **リダイレクトURIが正しいか確認**
   - `https://ai-dataset-marketplace.vercel.app/api/auth/callback/google`
   - 末尾にスラッシュがないか確認

2. **OAuth同意画面の設定確認**
   - テストモードの場合、テストユーザーを追加する必要があります
   - 本番環境では「公開」に設定

3. **環境変数が正しく設定されているか確認**
   - Vercelの環境変数を確認
   - 再デプロイを実行

### GitHub OAuthが動作しない場合

1. **リダイレクトURIが正しいか確認**
   - `https://ai-dataset-marketplace.vercel.app/api/auth/callback/github`

2. **Client Secretが正しいか確認**
   - Client Secretを再生成して設定し直す

3. **環境変数が正しく設定されているか確認**
   - Vercelの環境変数を確認
   - 再デプロイを実行

---

## 📝 チェックリスト

- [ ] Google Cloud Consoleでプロジェクト作成
- [ ] OAuth同意画面の設定
- [ ] Google OAuth 2.0 クライアント ID作成
- [ ] Google Client ID/Secretを取得
- [ ] GitHub OAuth App作成
- [ ] GitHub Client ID/Secretを取得
- [ ] Vercelに環境変数を設定
- [ ] 再デプロイを実行
- [ ] 動作確認（Googleログイン）
- [ ] 動作確認（GitHubログイン）

---

## 🎉 完了

設定が完了すると、エンドユーザーは以下の方法でログインできます：

1. **メール/パスワード** - 従来通り
2. **Googleアカウント** - ワンクリックでログイン
3. **GitHubアカウント** - ワンクリックでログイン

これで、ユーザーは自分が使い慣れたアカウントで簡単にログインできるようになります！

