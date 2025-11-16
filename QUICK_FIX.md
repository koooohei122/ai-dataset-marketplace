# クイック修正方法

## 問題

Prismaが.env.localファイルを読み込んでいません。

## 解決方法

### 方法1: .envファイルも作成（推奨）

`.env.local`の内容を`.env`ファイルにもコピーしてください。

1. `.env.local`ファイルを開く
2. 内容をすべてコピー
3. `.env`ファイルを作成（プロジェクトルートに）
4. 内容をペースト

### 方法2: 環境変数を直接設定

PowerShellで以下を実行：

```powershell
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres"
npx prisma migrate dev --name init
```

### 方法3: Supabaseから直接コピー

1. Supabaseダッシュボード → Settings → Database
2. Connection string → URI
3. パスワードを入力
4. 「Copy」ボタンをクリック
5. `.env`ファイルの`DATABASE_URL=`の後に貼り付け

## 確認

`.env`ファイルを作成したら、再度以下を実行：

```bash
npx prisma migrate dev --name init
```

