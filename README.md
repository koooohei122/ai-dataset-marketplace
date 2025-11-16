# AIデータセットマーケットプレイス

AI開発者、研究者、企業向けのデータセット販売・購入プラットフォーム

## 📋 プロジェクト概要

高品質なAIデータセットを購入・販売できるマーケットプレイスです。データセットの検索、プレビュー、購入、レビューまで一貫した体験を提供します。

### ✨ 主要機能

- **🚀 AI自動化開発基盤**: 要件を入力するだけで、仕様書からコード、テスト、レビュー、デプロイまで自動化（新機能）
- **データセットの検索・購入**: 豊富なカテゴリから目的のデータセットを検索・購入
- **データセットの販売**: 簡単な手順でデータセットを販売開始
- **AIデータ拡張機能**: アップロード時にローカルのCPU/GPUを使用して自動でデータセットを拡張
- **レビュー・評価システム**: 購入者がレビューを投稿し、データセットの品質を評価
- **柔軟な決済**: 手動決済（無料）または自動決済（Stripe、手数料のみ）

## 🚀 技術スタック（無料構成）

- **フロントエンド**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド**: Next.js API Routes, Prisma, PostgreSQL
- **認証**: NextAuth.js + OAuth (Google, GitHub)
- **データベース**: Supabase（無料プラン: 500MB）
- **ストレージ**: Supabase Storage（無料プラン: 1GB）または Cloudflare R2（無料プラン: 10GB/月）
- **決済**: 手動決済（銀行振込、PayPal個人送金）または Stripe（手数料のみ）
- **メール**: Resend（無料プラン: 3,000通/月）
- **分析**: Google Analytics（完全無料）または Plausible（無料プラン）
- **監視**: Sentry（無料プラン: 5,000エラー/月）
- **デプロイ**: Vercel（無料プラン: 100GB帯域幅/月）

**💡 完全無料で運営可能です！詳細は[無料運営ガイド](./FREE_HOSTING_GUIDE.md)を参照してください。**

## 📁 ドキュメント

- [🚀 AI自動化開発基盤](./AUTOMATION_README.md) - 要件から完成システムまで自動化する基盤の使い方
- [仕様書](./SPECIFICATION.md) - 機能仕様、データモデル、UI/UX設計
- [技術仕様書](./TECHNICAL_SPEC.md) - データベーススキーマ、API設計、実装詳細
- [AIデータ拡張機能](./AI_AUGMENTATION_SPEC.md) - AIデータ拡張機能の詳細仕様
- [無料運営ガイド](./FREE_HOSTING_GUIDE.md) - 完全無料で運営するためのガイド
- [価格設定・手数料システム](./PRICING_AND_COMMISSION.md) - 価格設定とプラットフォーム手数料の詳細仕様

## 🛠️ セットアップ

### 必要な環境

- Node.js 18.17+
- PostgreSQL 14+
- pnpm 8+ (推奨) または npm/yarn

### インストール

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な値を設定

# データベースのセットアップ
pnpm prisma migrate dev
pnpm prisma generate

# 開発サーバーの起動
pnpm dev
```

### 環境変数

`.env.example`を参照してください。無料で運営する場合は、以下の主要な環境変数が必要です：

**無料構成（推奨）**:
- `DATABASE_URL` - Supabase PostgreSQL接続文字列
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` - Supabase認証情報
- `NEXTAUTH_SECRET` - NextAuth.jsのシークレットキー
- `RESEND_API_KEY` - Resendメール送信APIキー
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth（無料）
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - GitHub OAuth（無料）

**AI自動化基盤を使用する場合（追加）**:
- `OPENAI_API_KEY` - OpenAI APIキー（有料、必須）
- `VERCEL_TOKEN` - Vercel APIトークン（デプロイ機能を使用する場合）

**詳細は[無料運営ガイド](./FREE_HOSTING_GUIDE.md)と[AI自動化開発基盤](./AUTOMATION_README.md)を参照してください。**

## 📝 開発フェーズ

### Phase 1: MVP（現在）
- [ ] ユーザー認証システム
- [ ] データセット一覧・検索
- [ ] データセット詳細表示
- [ ] 基本的な購入フロー
- [ ] ファイルアップロード・ダウンロード

### Phase 2: 機能拡張
- [ ] レビューシステム
- [ ] 販売者ダッシュボード
- [ ] 売上管理
- [ ] 高度な検索・フィルタ
- [ ] AIデータ拡張機能（画像データ対応）

### Phase 3: 最適化
- [ ] パフォーマンス最適化
- [ ] SEO対策
- [ ] 分析・レポート機能
- [ ] マルチカレンシー対応
- [ ] AIデータ拡張機能の拡張（テキスト・音声・表形式データ対応）

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します。IssueやPull Requestをお気軽に作成してください。

## 🔗 リンク

- **GitHub**: https://github.com/koooohei122/ai-dataset-marketplace
- **デプロイURL**: https://ai-dataset-marketplace.vercel.app/
- **ステータス**: 🟢 デプロイ済み（開発中）

## 📄 ライセンス

このプロジェクトのライセンス情報は後日追加予定です。

