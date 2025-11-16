"use client"

import { signIn } from "next-auth/react"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">
            ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AIデータセットマーケットプレイスにログイン
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Googleでログイン
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            GitHubでログイン
          </button>
        </div>
      </div>
    </div>
  )
}

