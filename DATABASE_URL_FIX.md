# DATABASE_URL修正ガイド

## エラー内容

`invalid port number in database URL` というエラーが発生しています。

## 原因

DATABASE_URLの形式が正しくないか、パスワードに特殊文字が含まれている可能性があります。

## 解決方法

### 1. パスワードに特殊文字が含まれている場合

パスワードに `@`, `:`, `/`, `?`, `#`, `[`, `]` などの特殊文字が含まれている場合、URLエンコードが必要です。

例：
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`

### 2. 正しい形式

```
DATABASE_URL=postgresql://postgres:エンコードされたパスワード@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres
```

### 3. Supabaseから直接取得する方法（推奨）

1. Supabaseダッシュボードにログイン
2. **Settings** → **Database**
3. **Connection string** → **URI** タブ
4. パスワードを入力
5. **「Copy」ボタンをクリック**（これで正しい形式でコピーされます）

### 4. 接続プーリングを使用する場合

Supabaseでは接続プーリングも提供されています：

**Transaction mode (推奨):**
```
postgresql://postgres.ldfsutigtryclnsfeezf:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**Session mode:**
```
postgresql://postgres.ldfsutigtryclnsfeezf:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

## 確認方法

.env.localファイルのDATABASE_URLが以下の形式になっているか確認：

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ldfsutigtryclnsfeezf.supabase.co:5432/postgres
```

**重要**: 
- `[PASSWORD]`を実際のパスワードに置き換える
- パスワードに特殊文字がある場合はURLエンコードする
- または、Supabaseダッシュボードから直接コピーする

