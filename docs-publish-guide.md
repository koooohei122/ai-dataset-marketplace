# 仕様書をWeb上で公開する方法

## 方法1: GitHub Pages（推奨・最も簡単）

### 手順

1. **GitHubリポジトリを作成**
   ```bash
   # リポジトリを初期化
   cd ai-dataset-marketplace
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **GitHubにプッシュ**
   - GitHubで新しいリポジトリを作成
   - リモートを追加してプッシュ
   ```bash
   git remote add origin https://github.com/yourusername/ai-dataset-marketplace.git
   git branch -M main
   git push -u origin main
   ```

3. **GitHub Pagesを有効化**
   - リポジトリの Settings → Pages
   - Source: `main` ブランチ、`/docs` フォルダを選択
   - または、`/ (root)` を選択してREADMEを公開

4. **アクセス**
   - `https://yourusername.github.io/ai-dataset-marketplace/`
   - または `https://yourusername.github.io/ai-dataset-marketplace/SPECIFICATION.md`

### MarkdownをHTMLに変換（見栄えを良くする）

GitHub PagesはMarkdownを自動でHTMLに変換しますが、より見栄えを良くするには：

- **MkDocs** を使用（推奨）
- **Docusaurus** を使用
- **GitBook** を使用

## 方法2: Vercel（静的サイトとして）

### 手順

1. **Vercelアカウント作成**
   - https://vercel.com にアクセス
   - GitHubアカウントでログイン

2. **プロジェクトをインポート**
   - New Project → GitHubリポジトリを選択
   - Framework Preset: Other
   - Build Command: 不要（静的ファイルのみ）
   - Output Directory: `.` または `docs`

3. **デプロイ**
   - 自動でデプロイされる
   - URL: `https://your-project.vercel.app`

## 方法3: Netlify（静的サイトとして）

### 手順

1. **Netlifyアカウント作成**
   - https://netlify.com にアクセス
   - GitHubアカウントでログイン

2. **サイトをデプロイ**
   - Add new site → Import an existing project
   - GitHubリポジトリを選択
   - Build command: 不要
   - Publish directory: `.` または `docs`

3. **デプロイ**
   - 自動でデプロイされる
   - URL: `https://your-project.netlify.app`

## 方法4: MarkdownをHTMLに変換して公開

### MkDocsを使用（推奨）

1. **MkDocsをインストール**
   ```bash
   pip install mkdocs mkdocs-material
   ```

2. **MkDocsプロジェクトを作成**
   ```bash
   mkdocs new .
   ```

3. **設定ファイルを編集** (`mkdocs.yml`)
   ```yaml
   site_name: AIデータセットマーケットプレイス 仕様書
   theme:
     name: material
     language: ja
   
   nav:
     - Home: README.md
     - 仕様書: SPECIFICATION.md
     - 技術仕様書: TECHNICAL_SPEC.md
     - AIデータ拡張機能: AI_AUGMENTATION_SPEC.md
     - 無料運営ガイド: FREE_HOSTING_GUIDE.md
     - 価格設定・手数料: PRICING_AND_COMMISSION.md
     - 使用シナリオ: USAGE_SCENARIOS.md
   
   markdown_extensions:
     - pymdownx.highlight
     - pymdownx.superfences
     - pymdownx.tabbed
   ```

4. **ビルド**
   ```bash
   mkdocs build
   ```

5. **公開**
   - `site/` フォルダをGitHub Pages、Vercel、Netlifyにデプロイ

## 方法5: 簡単なHTMLページを作成

MarkdownをHTMLに変換する簡単なスクリプトを作成することもできます。

## 推奨: GitHub Pages + MkDocs

最も簡単で見栄えも良い方法です。

1. GitHubリポジトリにプッシュ
2. MkDocsでビルド
3. `gh-pages` ブランチにデプロイ
4. GitHub Pagesで公開

詳細は上記の手順を参照してください。

