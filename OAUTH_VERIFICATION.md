# OAuth動作確認ガイド

## ✅ 環境変数設定完了

Vercelに環境変数を設定されたとのこと、ありがとうございます！

## 🔍 動作確認手順

### 1. 再デプロイの確認

環境変数を追加した後、**再デプロイが必要**です。

1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. 「Deployments」タブを開く
4. 最新のデプロイを確認
   - 環境変数を追加した後に自動で再デプロイされていない場合
   - 「Redeploy」ボタンをクリックして手動で再デプロイ

### 2. ログインページでの確認

1. https://ai-dataset-marketplace.vercel.app/auth/signin にアクセス
2. 以下のボタンが表示されているか確認：
   - 「Googleでログイン」ボタン
   - 「GitHubでログイン」ボタン

### 3. Google OAuth動作確認

1. 「Googleでログイン」ボタンをクリック
2. 以下のいずれかが表示されればOK：
   - ✅ Googleアカウント選択画面が表示される
   - ✅ Googleログイン画面が表示される
3. エラーが表示される場合：
   - 「redirect_uri_mismatch」エラー → リダイレクトURIが正しく設定されているか確認
   - 「invalid_client」エラー → Client ID/Secretが正しいか確認

### 4. GitHub OAuth動作確認

1. 「GitHubでログイン」ボタンをクリック
2. 以下のいずれかが表示されればOK：
   - ✅ GitHubログイン画面が表示される
   - ✅ GitHubアカウント認証画面が表示される
3. エラーが表示される場合：
   - 「redirect_uri_mismatch」エラー → リダイレクトURIが正しく設定されているか確認
   - 「bad_verification_code」エラー → Client Secretが正しいか確認

### 5. 初回ログイン確認

1. GoogleまたはGitHubでログイン
2. 初回ログイン時は自動的にアカウントが作成される
3. ログイン後、トップページ（`/`）にリダイレクトされる
4. ヘッダーにユーザー名が表示される

## 🐛 よくある問題と解決方法

### 問題1: ボタンをクリックしても何も起こらない

**原因**: 環境変数が正しく設定されていない、または再デプロイされていない

**解決方法**:
1. Vercelの環境変数を再確認
2. 再デプロイを実行
3. ブラウザのコンソールでエラーを確認

### 問題2: redirect_uri_mismatch エラー

**原因**: Google/GitHubのリダイレクトURI設定が間違っている

**解決方法**:
- Google: `https://ai-dataset-marketplace.vercel.app/api/auth/callback/google`
- GitHub: `https://ai-dataset-marketplace.vercel.app/api/auth/callback/github`
- 末尾にスラッシュがないか確認
- 正確にコピー&ペースト

### 問題3: invalid_client エラー

**原因**: Client IDまたはClient Secretが間違っている

**解決方法**:
1. Google/GitHubで正しい認証情報を再取得
2. Vercelの環境変数を更新
3. 再デプロイ

### 問題4: ログイン後、エラーページに遷移する

**原因**: NEXTAUTH_URLが正しく設定されていない可能性

**解決方法**:
- Vercelの環境変数で `NEXTAUTH_URL=https://ai-dataset-marketplace.vercel.app` を確認

## ✅ 正常に動作している場合

以下のようになれば成功です：

1. 「Googleでログイン」をクリック
2. Googleアカウント選択画面が表示
3. アカウントを選択
4. 許可をクリック
5. サイトに戻り、ログイン状態になる
6. ヘッダーにユーザー名が表示される

## 📝 チェックリスト

- [ ] Vercelで再デプロイを実行
- [ ] ログインページでボタンが表示される
- [ ] Googleログインが動作する
- [ ] GitHubログインが動作する
- [ ] 初回ログインでアカウントが作成される
- [ ] ログイン後、正しくリダイレクトされる

## 🎉 完了

すべてのチェックが完了すれば、エンドユーザーはGoogle/GitHubアカウントで簡単にログインできるようになります！

