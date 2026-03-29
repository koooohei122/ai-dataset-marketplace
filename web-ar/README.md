# Web AR Occlusion MVP

スマホ / PC のカメラで画像ターゲットを認識し、3D キャラクターを表示する Web AR アプリです。
手や人物が前に入ると、MediaPipe Selfie Segmentation によって 3D キャラが隠れます。

---

## 必要環境

| 項目 | 要件 |
|------|------|
| Node.js | v18 以上推奨 (v20 LTS でテスト済み) |
| ブラウザ | Chrome 最新版（PC / Android）を推奨 |
| カメラ | WebRTC 対応カメラ |
| ネット | 初回起動時に CDN から MindAR / MediaPipe モデルを取得 |

---

## セットアップ & 起動

```bash
# 1. このディレクトリへ移動
cd web-ar

# 2. 依存パッケージをインストール
npm install

# 3. 開発サーバー起動
npm run dev
# → http://localhost:5173 で起動

# ビルド（本番用）
npm run build
npm run preview
```

---

## ターゲット画像の準備（最重要）

MindAR は `.mind` ファイル（コンパイル済みバイナリ）を使います。

### 手順

1. **マーカー画像を用意する**
   特徴点が多い画像（QR コード、雑誌の表紙、ロゴなど）を `target.jpg` として保存。

2. **`.mind` ファイルを生成する**
   [MindAR Image Target Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile) をブラウザで開く
   → 画像をアップロード → Compile → `targets.mind` をダウンロード

3. **ファイルを配置する**
   ```
   web-ar/public/targets/targets.mind   ← ここに置く
   web-ar/public/targets/marker.jpg     ← マーカー画像（参照用）
   ```

4. アプリを起動し、カメラに `marker.jpg` を映すと認識されます。

> `.mind` が存在しない場合は自動で **デバッグモード（固定アンカー）** になります。
> キャラが画面中央に固定表示されるので、モデルの確認には使えます。

---

## 3D モデルの差し替え

```
web-ar/public/models/character.glb   ← ここに置く
```

- **GLTF / GLB 形式**を使用
- アニメーション付きモデル推奨（`idle` / `Idle` / `walk` などのクリップ名を優先検出）
- モデルがない場合は青いカプセルのフォールバックキャラが表示されます

### 位置・スケール調整

`src/config.ts` の `character` セクションを変更するだけです：

```ts
character: {
  position: [0, 0.08, 0],   // ターゲット中心からの X/Y/Z オフセット
  scale:    [0.15, 0.15, 0.15], // 大きくしたければ 0.3 など
  rotation: [0, 0, 0],         // ラジアン
},
```

---

## スマホ確認方法

カメラ API は **HTTPS** が必要です（localhost は例外）。

### 方法 A: mkcert でローカル HTTPS

```bash
# mkcert インストール (Mac)
brew install mkcert
mkcert -install
mkcert localhost 192.168.x.x   # ← 自分の LAN IP を入力

# vite.config.ts に以下を追加
import { readFileSync } from 'fs';
server: {
  https: {
    key: readFileSync('./localhost+1-key.pem'),
    cert: readFileSync('./localhost+1.pem'),
  },
  host: true,
}
```

### 方法 B: ngrok でトンネル

```bash
npx ngrok http 5173
# HTTPS URL が発行される → スマホからアクセス
```

---

## 設定ファイル一覧 (`src/config.ts`)

| キー | 説明 |
|------|------|
| `modelPath` | GLB モデルパス |
| `targetPath` | `.mind` ファイルパス |
| `character.position/scale/rotation` | キャラ配置 |
| `segmentation.enabled` | オクルージョン ON/OFF デフォルト |
| `segmentation.modelSelection` | `0`=精度重視 `1`=速度重視 |
| `segmentation.inferenceWidth/Height` | 推論解像度（小さいほど速い） |
| `segmentation.maxFps` | セグメンテーションの最大 FPS |
| `performance.autoDisableOcclusionBelowFps` | この FPS 以下でオクルージョン自動 OFF |
| `debug` | デバッグ表示のデフォルト |
| `useFixedAnchor` | `true` で固定アンカーモード強制 |

---

## よくあるエラーと対処

### カメラが起動しない
- HTTPS でアクセスしているか確認（スマホ）
- ブラウザのカメラ権限を許可しているか確認
- Chrome の場合: `chrome://settings/content/camera`

### `MINDAR is not defined`
- `index.html` の CDN スクリプトが読み込めていない
- ネットワーク接続を確認。オフライン環境では別途 `mind-ar` を手動ホストする必要があります

### targets.mind が 404
- `public/targets/targets.mind` に正確に配置されているか確認
- ファイル名は大文字小文字を区別します

### キャラが表示されない（デバッグモード）
- `src/config.ts` の `useFixedAnchor: true` にして固定表示を確認
- コンソールでエラーを確認（F12）

### MediaPipe モデルが読み込まれない
- 初回起動時はネットワークが必要（CDN からダウンロード）
- オフラインで使う場合: `src/hooks/useSegmentation.ts` の `locateFile` を修正してローカルファイルを指すようにする

### ビルドエラー: TypeScript 型エラー
```bash
npm run build 2>&1 | head -30
```
- `src/types/mindar.d.ts` が正しく参照されているか確認

---

## オクルージョンの限界

- **完全なオクルージョンではありません。** MediaPipe のマスクは多少荒く、エッジがぼやけます
- キャラの体の一部が人物の背後に隠れるように見える程度の「それっぽい」効果です
- 輝度変化が激しい背景では誤検出が増えます
- 推論は 15fps 上限のため、高速に動く手には追従が遅れます
- 低スペック端末では FPS が落ちると自動的にオクルージョンが無効化されます

---

## フォルダ構成

```
web-ar/
├── index.html              # CDN script タグあり
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx            # エントリーポイント
│   ├── App.tsx             # 画面遷移 (Start → AR)
│   ├── config.ts           # 全設定値 ← 最初にここを触る
│   ├── types/
│   │   └── mindar.d.ts     # MindAR 型定義
│   ├── components/
│   │   ├── ARView.tsx      # AR 画面全体
│   │   ├── OcclusionLayer.tsx  # 前景マスク canvas
│   │   ├── StatusOverlay.tsx   # ステータス表示
│   │   └── ControlPanel.tsx    # トグルボタン
│   ├── hooks/
│   │   ├── useARScene.ts   # MindAR + Three.js 管理
│   │   └── useSegmentation.ts  # MediaPipe 管理
│   ├── ar/
│   │   ├── sceneBuilder.ts # ライト設定
│   │   └── characterLoader.ts  # GLB 読み込み + フォールバック
│   └── utils/
│       └── fpsMonitor.ts   # FPS 計測
└── public/
    ├── targets/            # targets.mind をここへ
    └── models/             # character.glb をここへ
```

---

## 最初に触るべき箇所

1. **`src/config.ts`** — モデルパス・キャラ位置・スケールの調整
2. **`public/targets/targets.mind`** — マーカーファイルの配置
3. **`public/models/character.glb`** — キャラモデルの配置
4. **`index.html`** — MindAR の CDN バージョンを変えたい場合

---

## 今後の拡張ステップ

### 次のレベル: 建物認識 / VPS
- [Immersal](https://immersal.com/) または [ARCore Geospatial API](https://developers.google.com/ar/develop/geospatial) の WebXR 版を検討
- 建物の特徴点マップを事前スキャンし、`.imdf` / `.vps` データとして管理

### GPS 連動
- `navigator.geolocation` で緯度経度を取得
- Three.js カメラに device orientation (`DeviceOrientationEvent`) を反映
- [AR.js](https://ar-js-org.github.io/AR.js-Docs/) の location-based AR モードが参考になる

### オクルージョン精度向上
- [BodyPix](https://github.com/tensorflow/tfjs-models/tree/master/body-segmentation) や TensorFlow.js の `body-segmentation` に切り替えて精度を上げる
- WebGPU が使えるブラウザでは `@mediapipe/tasks-vision` を使うとより高速

### マルチターゲット
- `CONFIG.targetPath` を複数の `.mind` ファイルに対応させる
- MindAR の `maxTrack` を増やして複数キャラを同時表示

---

*Built with MindAR + Three.js + MediaPipe + React + Vite*
