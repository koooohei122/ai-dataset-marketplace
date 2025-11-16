export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          AIデータセットマーケットプレイス
        </h1>
        <p className="text-center text-lg mb-8">
          AI開発者、研究者、企業向けのデータセット販売・購入プラットフォーム
        </p>
        <div className="text-center">
          <p className="mb-4">🚧 現在準備中です 🚧</p>
          <p className="text-sm text-gray-500">
            詳細は <a href="/README.md" className="underline">README.md</a> を参照してください
          </p>
        </div>
      </div>
    </main>
  );
}

