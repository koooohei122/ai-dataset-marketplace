# 環境変数設定ガイド

## 📋 現在の状況

✅ 取得済み:
- SUPABASE_URL: `https://ldfsutigtryclnsfeezf.supabase.co`
- SUPABASE_ANON_KEY: 設定済み
- SUPABASE_SERVICE_ROLE_KEY: 設定済み

⏳ まだ必要:
- DATABASE_URL（データベースパスワードを含む）

## 🔐 Database URLの取得方法

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. **Settings** → **Database** に移動
4. **Connection string** セクションを開く
5. **URI** タブを選択
6. データベースパスワードを入力（プロジェクト作成時に設定したパスワード）
7. 表示されたURLをコピー

形式: `postgresql://postgres:[YOUR-PASSWORD]@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres`

## 📝 環境変数の設定

### ローカル環境（.env.local）

`.env.local` ファイルを作成（`.env.local.example`をコピー）:

```bash
cp .env.local.example .env.local
```

その後、`.env.local`を編集して以下を設定:
- `DATABASE_URL`: 上記で取得したDatabase URL
- `NEXTAUTH_SECRET`: ランダムな文字列（下記コマンドで生成）

### NEXTAUTH_SECRETの生成

PowerShellで実行:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

### Vercelでの設定

1. Vercelダッシュボードにアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 以下の環境変数を追加:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres
SUPABASE_URL=https://ldfsutigtryclnsfeezf.supabase.co
SUPABASE_ANON_KEY=[SupabaseダッシュボードのSettings→APIで取得]
SUPABASE_SERVICE_ROLE_KEY=[SupabaseダッシュボードのSettings→APIで取得]
NEXTAUTH_URL=https://ai-dataset-marketplace.vercel.app
NEXTAUTH_SECRET=[生成したシークレット]
```

## 🗄️ データベースマイグレーション

環境変数を設定したら、以下を実行:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

これでデータベースにテーブルが作成されます。

## ✅ 確認

マイグレーション後、Supabaseダッシュボードの **Table Editor** で以下のテーブルが作成されていることを確認:
- users
- accounts
- sessions
- categories
- datasets
- dataset_files
- purchases
- reviews
- carts
- wishlists
- seller_profiles
- platform_settings

