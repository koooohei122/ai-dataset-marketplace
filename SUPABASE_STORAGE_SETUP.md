# Supabase Storage設定ガイド

## 📦 ストレージバケットの作成

データセットファイルをアップロードするために、Supabase Storageにバケットを作成する必要があります。

### 手順

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. **Storage** をクリック
4. **Create a new bucket** をクリック
5. 以下の設定でバケットを作成:
   - **Name**: `datasets`
   - **Public bucket**: ✅ チェックを外す（プライベート）
   - **File size limit**: 適切なサイズを設定（例: 100MB）
   - **Allowed MIME types**: すべて許可（または特定のタイプを指定）

6. **Create bucket** をクリック

### バケットポリシーの設定

バケットを作成後、適切なポリシーを設定する必要があります。

1. 作成したバケットをクリック
2. **Policies** タブを開く
3. **New Policy** をクリック
4. 以下のポリシーを追加:

**アップロード用ポリシー（認証済みユーザー）:**
```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'datasets' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**読み取り用ポリシー（購入済みユーザー）:**
```sql
CREATE POLICY "Users can read purchased datasets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'datasets');
```

または、より簡単な方法として、**RLS (Row Level Security) を無効にする**こともできます（開発中のみ推奨）。

### 確認

バケットが作成されたら、以下のコマンドで確認できます：

```bash
npm run dev
```

アップロードページ（`/upload`）からファイルをアップロードしてテストしてください。

## 🔐 セキュリティ注意事項

- 本番環境では、適切なRLSポリシーを設定してください
- ファイルサイズの制限を設定してください
- ウイルススキャンなどのセキュリティ対策を検討してください

