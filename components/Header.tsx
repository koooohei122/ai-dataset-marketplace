"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
          AI Dataset Marketplace
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/datasets" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            データセット
          </Link>
          
          {session ? (
            <>
              <Link href="/wishlist" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                ウィッシュリスト
              </Link>
              <Link href="/purchases" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                購入履歴
              </Link>
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                ダッシュボード
              </Link>
              <Link href="/upload" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                アップロード
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  ログアウト
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

