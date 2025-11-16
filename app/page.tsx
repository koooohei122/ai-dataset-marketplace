"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">
          AIデータセットマーケットプレイス
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          AI開発者、研究者、企業向けのデータセット販売・購入プラットフォーム
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/datasets"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
          >
            データセットを探す
          </Link>
          {session && (
            <Link
              href="/upload"
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold"
            >
              データセットを販売
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 border rounded-lg">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">豊富なデータセット</h3>
          <p className="text-gray-600 dark:text-gray-400">
            画像、テキスト、音声など、様々なタイプのデータセットを提供
          </p>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-semibold mb-2">柔軟な価格設定</h3>
          <p className="text-gray-600 dark:text-gray-400">
            無料から有料まで、自由に価格を設定可能
          </p>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AIデータ拡張</h3>
          <p className="text-gray-600 dark:text-gray-400">
            アップロード時に自動でデータセットを拡張
          </p>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">人気のカテゴリ</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/datasets?category=image"
            className="px-6 py-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            画像データ
          </Link>
          <Link
            href="/datasets?category=text"
            className="px-6 py-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
          >
            テキストデータ
          </Link>
          <Link
            href="/datasets?category=audio"
            className="px-6 py-3 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800"
          >
            音声データ
          </Link>
        </div>
      </div>
    </div>
  )
}
