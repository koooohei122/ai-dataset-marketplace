# メール通知機能の設定

## 概要

メール通知機能を有効にするには、SMTP設定が必要です。

## 設定方法

### 1. Gmail SMTPを使用する場合（無料）

`.env.local`ファイルに以下を追加：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**Gmail App Passwordの取得方法：**
1. Googleアカウント設定 → セキュリティ
2. 2段階認証を有効化
3. アプリパスワードを生成
4. 生成されたパスワードを`SMTP_PASSWORD`に設定

### 2. Resendを使用する場合（推奨、無料プランあり）

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

ResendのAPIキーを取得：
1. https://resend.com にサインアップ
2. API Keysからキーを取得
3. 環境変数に設定

### 3. SendGridを使用する場合

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

## 現在の実装

- ✅ 購入確認メール（購入者へ）
- ✅ 購入リクエスト通知（販売者へ、手動決済時）
- ✅ レビュー通知（販売者へ）

## 注意事項

- メール設定がない場合、メール送信はスキップされます（開発環境）
- 本番環境では必ずメール設定を行ってください
- Gmailの無料プランには送信制限があります（1日500通）

## テスト

メール送信機能をテストするには：

1. 環境変数を設定
2. 購入またはレビューを投稿
3. メールが届くことを確認

