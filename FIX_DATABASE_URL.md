# DATABASE_URL修正が必要です

## 問題

`.env`ファイルの`DATABASE_URL`に`[YOUR_PASSWORD]`というプレースホルダーが残っています。

現在の内容：
```
DATABASE_URL=postgresql://postgres:L5.BxmmcQQMFN6/[YOUR_PASSWORD]@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres
```

## 修正方法

### 方法1: Supabaseダッシュボードから直接コピー（推奨）

1. https://supabase.com/dashboard にログイン
2. プロジェクトを選択
3. **Settings** → **Database**
4. **Connection string** → **URI** タブ
5. データベースパスワードを入力
6. **「Copy」ボタンをクリック**
7. `.env`ファイルの`DATABASE_URL=`の後に貼り付け

### 方法2: 手動で修正

`.env`ファイルを開いて、`[YOUR_PASSWORD]`を実際のデータベースパスワードに置き換えてください。

**重要**: パスワードに特殊文字（`/`, `@`, `:`, `#`など）が含まれている場合、URLエンコードが必要です：
- `/` → `%2F`
- `@` → `%40`
- `:` → `%3A`
- `#` → `%23`

### 方法3: 接続プーリングを使用

Supabaseの接続プーリングを使用する場合：

**Transaction mode (推奨):**
```
postgresql://postgres.ldfsutigtryclnsfeezf:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**Session mode:**
```
postgresql://postgres.ldfsutigtryclnsfeezf:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

## 修正後の確認

`.env`ファイルを修正したら、再度以下を実行：

```bash
npx prisma migrate dev --name init
```

