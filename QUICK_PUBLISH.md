# 仕様書をWeb上で公開する（クイックガイド）

## 🚀 最も簡単な方法: GitHub Pages

### ステップ1: GitHubリポジトリを作成

1. https://github.com にアクセス
2. 新しいリポジトリを作成: `ai-dataset-marketplace`
3. リポジトリをクローンまたはファイルをアップロード

### ステップ2: GitHub Pagesを有効化

1. リポジトリの **Settings** → **Pages** に移動
2. **Source** で `main` ブランチ、`/ (root)` を選択
3. **Save** をクリック

### ステップ3: アクセス

数分後、以下のURLでアクセス可能になります：

```
https://yourusername.github.io/ai-dataset-marketplace/
```

Markdownファイルは直接アクセスできます：
- `https://yourusername.github.io/ai-dataset-marketplace/SPECIFICATION.md`
- `https://yourusername.github.io/ai-dataset-marketplace/TECHNICAL_SPEC.md`

## 📚 より見栄えを良くする: MkDocs

### ステップ1: MkDocsをインストール

```bash
pip install mkdocs mkdocs-material
```

### ステップ2: ドキュメントをビルド

```bash
mkdocs build
```

### ステップ3: ローカルで確認

```bash
mkdocs serve
```

ブラウザで `http://127.0.0.1:8000` にアクセス

### ステップ4: GitHub Pagesにデプロイ

```bash
mkdocs gh-deploy
```

これで `gh-pages` ブランチに自動デプロイされ、GitHub Pagesで公開されます。

## 🌐 その他の方法

### Vercel

1. https://vercel.com にアクセス
2. GitHubリポジトリをインポート
3. 自動デプロイ

### Netlify

1. https://netlify.com にアクセス
2. GitHubリポジトリをインポート
3. 自動デプロイ

## 💡 推奨

**GitHub Pages + MkDocs** が最も簡単で見栄えも良いです。

1. GitHubリポジトリにプッシュ
2. `mkdocs gh-deploy` を実行
3. 完了！

詳細は `docs-publish-guide.md` を参照してください。

