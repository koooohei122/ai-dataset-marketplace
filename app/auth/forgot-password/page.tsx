"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSent(true)
      } else {
        const data = await response.json()
        setError(data.error || "エラーが発生しました")
      }
    } catch {
      setError("通信エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-4">メールを送信しました</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {email} にパスワードリセット用のリンクを送信しました。
            メールが届かない場合はスパムフォルダをご確認ください。
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ログインページに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">パスワードをリセット</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            登録済みのメールアドレスを入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? "送信中..." : "リセットリンクを送信"}
          </button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              ← ログインに戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
