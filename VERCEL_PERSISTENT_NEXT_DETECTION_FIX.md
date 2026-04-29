# Vercelで「Next.jsのバージョンが検出されません」が消えない場合

`package.json` に `next` があるのに同エラーが続く場合、Vercel側のプロジェクト紐付け情報が壊れている可能性があります。

## 最短の復旧手順（強制リセット）
1. Vercel Dashboard → 対象 Project → Settings → General
2. Root Directory を一度空にして保存
3. 再度 Root Directory を `.` に設定して保存
4. Deployments で **Redeploy (without cache)**

## それでもダメな場合（高確率で解消）
1. 現在のVercel Projectを削除（または切断）
2. GitHub Integration から **同じリポジトリを再Import**
3. Framework Preset を **Next.js** 明示選択
4. Root Directory を `.` に設定
5. Environment Variables を再登録
6. 初回デプロイを実行

## 併せて確認
- Git連携先が正しいリポジトリか
- Production Branch が `main` か
- `package.json` はリポジトリ直下にあるか
- `dependencies.next` が存在するか
