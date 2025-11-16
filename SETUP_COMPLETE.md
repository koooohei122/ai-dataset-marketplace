# セットアップ完了 ✅

## 完了した設定

1. ✅ `.env.local` ファイルを作成
2. ✅ OpenAI APIキーを設定
3. ✅ GPT-4o mini をデフォルトモデルに設定

## 次のステップ

### 1. 開発サーバーの起動

```bash
pnpm dev
```

または

```bash
npm run dev
```

### 2. ブラウザでアクセス

- **自動化基盤**: http://localhost:3000/automation
- **トップページ**: http://localhost:3000

### 3. 動作確認

1. `/automation` ページにアクセス
2. 簡単な要件を入力（例: 「Hello Worldを表示するページを作成」）
3. 「自動開発を開始」をクリック
4. 進捗を確認

## トラブルシューティング

### APIキーが認識されない場合

1. 開発サーバーを再起動してください
2. `.env.local` ファイルがプロジェクトルートにあることを確認
3. APIキーが `sk-` で始まることを確認

### エラーが発生する場合

- ブラウザのコンソール（F12）でエラーを確認
- ターミナルのログを確認
- OpenAI Dashboard でAPIキーの有効性を確認

## 料金について

GPT-4o mini を使用した場合の目安：
- **1プロジェクト**: 約$0.05（約7.5円）
- **月間20プロジェクト**: 約$1.00（約150円）

詳細は OpenAI Dashboard → Usage で確認できます。

## 参考リンク

- [OpenAI API ドキュメント](https://platform.openai.com/docs)
- [OpenAI 料金ページ](https://openai.com/api/pricing/)
- [AI自動化開発基盤 ドキュメント](./AUTOMATION_README.md)

