# Supabase接続文字列ガイド

## 問題

DATABASE_URLの形式が正しくない可能性があります。パスワードに特殊文字が含まれている場合、URLエンコードが必要です。

## 解決方法

### 方法1: Supabaseダッシュボードから直接コピー（最も確実）

1. https://supabase.com/dashboard にログイン
2. プロジェクトを選択
3. **Settings** → **Database**
4. **Connection string** セクション
5. **URI** タブを選択
6. データベースパスワードを入力
7. **「Copy」ボタンをクリック**（これで正しい形式でコピーされます）
8. `.env`ファイルの`DATABASE_URL=`の後に貼り付け

### 方法2: 接続プーリングを使用（推奨）

Supabaseの接続プーリングを使用すると、特殊文字の問題を回避できます。

1. Supabaseダッシュボード → **Settings** → **Database**
2. **Connection string** → **Connection pooling** タブ
3. **Transaction mode** または **Session mode** を選択
4. パスワードを入力
5. **「Copy」ボタンをクリック**

**Transaction mode (推奨):**
```
postgresql://postgres.ldfsutigtryclnsfeezf:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**Session mode:**
```
postgresql://postgres.ldfsutigtryclnsfeezf:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

### 方法3: パスワードのURLエンコード

パスワードに特殊文字が含まれている場合、URLエンコードが必要です：

- `/` → `%2F`
- `@` → `%40`
- `:` → `%3A`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`
- `?` → `%3F`
- `&` → `%26`
- `=` → `%3D`
- `+` → `%2B`
- `%` → `%25`
- ` ` (スペース) → `%20`

## 確認

修正後、以下のコマンドで確認：

```bash
npx prisma migrate dev --name init
```

成功すると、データベースにテーブルが作成されます。

