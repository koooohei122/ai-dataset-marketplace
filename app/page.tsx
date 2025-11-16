"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function Home() {
  const { data: session } = useSession()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          AIデータセットマーケットプレイス
        </h1>
        <p className="text-center text-lg mb-8">
          AI開発者、研究者、企業向けのデータセット販売・購入プラットフォーム
        </p>
        
        <div className="text-center mb-8">
          {session ? (
            <div className="space-y-4">
              <p className="text-lg">
                ようこそ、{session.user?.name || session.user?.email}さん！
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/datasets"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  データセット一覧
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  ログアウト
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="mb-4">🚧 現在開発中です 🚧</p>
              <Link
                href="/auth/signin"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ログイン
              </Link>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            詳細は{" "}
            <a
              href="https://github.com/koooohei122/ai-dataset-marketplace"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              GitHub
            </a>{" "}
            を参照してください
          </p>
        </div>
      </div>
    </main>
  );
}
