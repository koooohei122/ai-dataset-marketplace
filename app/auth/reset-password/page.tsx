"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { MIN_PASSWORD_LENGTH } from "@/lib/constants"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("無効なリンクです。パスワードリセットをやり直してください。")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`)
      return
    }

    if (password !== confirm) {
      setError("パスワードが一致しません")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setDone(true)
        setTimeout(() => router.push("/auth/signin"), 3000)
      } else {
        setError(data.error || "エラーが発生しました")
      }
    } catch {
      setError("通信エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4">パスワードを更新しました</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            3秒後にログインページに移動します
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">新しいパスワードを設定</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">新しいパスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!token}
              autoFocus
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder={`${MIN_PASSWORD_LENGTH}文字以上`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">パスワード（確認）</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={!token}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="もう一度入力してください"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? "更新中..." : "パスワードを更新"}
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
