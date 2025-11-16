# 環境変数確認ガイド

## 問題

PrismaがDATABASE_URLを読み込めていません。以下の確認をお願いします。

## 確認事項

### 1. .env.localファイルの確認

`.env.local`ファイルがプロジェクトルート（`ai-dataset-marketplace`フォルダ）に存在するか確認してください。

### 2. DATABASE_URLの形式確認

`.env.local`ファイル内の`DATABASE_URL`が以下の形式になっているか確認してください：

```
DATABASE_URL=postgresql://postgres:[実際のパスワード]@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres
```

**重要**: `[YOUR-PASSWORD]`や`[実際のパスワード]`という文字列ではなく、**実際のデータベースパスワード**に置き換える必要があります。

### 3. Database URLの取得方法

もしDatabase URLをまだ取得していない場合：

1. Supabaseダッシュボードにログイン: https://supabase.com/dashboard
2. プロジェクトを選択
3. **Settings** → **Database** に移動
4. **Connection string** セクションを開く
5. **URI** タブを選択
6. データベースパスワードを入力（プロジェクト作成時に設定したパスワード）
7. 表示されたURLをコピー

### 4. .envファイルも作成（オプション）

Prismaは`.env`ファイルを優先的に読み込みます。`.env.local`が読み込まれない場合は、`.env`ファイルも作成してください（内容は同じです）。

## 確認後の次のステップ

DATABASE_URLが正しく設定されたら、以下を実行：

```bash
npx prisma migrate dev --name init
```

これでデータベースにテーブルが作成されます。

