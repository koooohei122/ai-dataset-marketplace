# Supabase設定ガイド

## 📋 接続情報の取得

Project URL: `https://ldfsutigtryclnsfeezf.supabase.co`

### ステップ1: Database URLの取得

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. **Settings** → **Database** に移動
4. **Connection string** セクションを開く
5. **URI** を選択
6. パスワードを入力してDatabase URLを取得
   - 形式: `postgresql://postgres:[YOUR-PASSWORD]@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres`

### ステップ2: API Keysの取得

1. **Settings** → **API** に移動
2. **Project API keys** セクションで以下を取得:
   - **anon public**: 公開キー（フロントエンド用）
   - **service_role**: 秘密キー（サーバーサイド用、注意して扱う）

### ステップ3: 環境変数の設定

以下の情報を取得したら、環境変数に設定してください。

## 🔐 環境変数の設定

### Vercelでの設定

1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables** に移動
4. 以下の環境変数を追加:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres
SUPABASE_URL=https://ldfsutigtryclnsfeezf.supabase.co
SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service_role key]
NEXTAUTH_URL=https://ai-dataset-marketplace.vercel.app
NEXTAUTH_SECRET=[ランダムな文字列]
```

### ローカルでの設定

`.env.local` ファイルを作成（既に存在する場合は更新）:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres
SUPABASE_URL=https://ldfsutigtryclnsfeezf.supabase.co
SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service_role key]
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[ランダムな文字列]
```

### NEXTAUTH_SECRETの生成

PowerShellで実行:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

## 🗄️ データベースマイグレーション

環境変数を設定したら、以下を実行:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

これでデータベースにテーブルが作成されます。

## ✅ 確認

マイグレーション後、Supabaseダッシュボードの **Table Editor** でテーブルが作成されていることを確認してください。

