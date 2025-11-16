# 接続プーリングを使用する方法

## 問題

パスワードに特殊文字が含まれているため、通常の接続文字列でエラーが発生しています。

## 解決方法: 接続プーリングを使用

Supabaseの接続プーリングを使用すると、特殊文字の問題を回避できます。

### 手順

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. **Settings** → **Database**
4. **Connection string** セクション
5. **Connection pooling** タブを選択
6. **Transaction mode** を選択（推奨）
7. データベースパスワードを入力
8. **「Copy」ボタンをクリック**
9. `.env`ファイルの`DATABASE_URL=`の行を、コピーした内容に置き換え

### 接続プーリングの形式

**Transaction mode (推奨):**
```
postgresql://postgres.ldfsutigtryclnsfeezf:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**Session mode:**
```
postgresql://postgres.ldfsutigtryclnsfeezf:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

### 注意点

- 接続プーリングを使用する場合、ホスト名が `db.ldfsutigtryclnsfeezf.supabase.co` から `aws-0-ap-northeast-1.pooler.supabase.com` に変わります
- ポート番号も `5432` から `6543` (Transaction mode) または `5432` (Session mode) に変わります
- ユーザー名が `postgres` から `postgres.ldfsutigtryclnsfeezf` に変わります

### 修正後

`.env`ファイルを修正したら、再度以下を実行：

```bash
npx prisma migrate dev --name init
```

