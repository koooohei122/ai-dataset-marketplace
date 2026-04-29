# マージ手順（最短）

この環境ではGitHub上の実マージ操作までは実行できないため、以下の手順で実施してください。

1. 変更ブランチをpush
   ```bash
   git push origin work
   ```
2. GitHubでPRを開く（base: `main`, compare: `work`）
3. CIが成功していることを確認
4. `Squash and merge`（または運用ルールに従う）
5. VercelのProduction Deploy成功を確認
6. 本番URLをハードリロードして反映確認

## 補足
- もし `work` ではなく別ブランチを使う場合、上記コマンドのブランチ名を置き換えてください。
