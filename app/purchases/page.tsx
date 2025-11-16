"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Purchase {
  id: string
  amount: number
  currency: string
  status: string
  purchasedAt: Date
  downloadCount: number
  maxDownloads: number
  downloadExpiresAt: Date
  dataset: {
    id: string
    title: string
    isFree: boolean
  }
}

export default function PurchasesPage() {
  const { data: session } = useSession()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchPurchases()
    }
  }, [session])

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/purchases")
      if (response.ok) {
        const data = await response.json()
        setPurchases(data)
      }
    } catch (error) {
      console.error("Failed to fetch purchases:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `dataset.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        fetchPurchases()
      } else {
        alert("ダウンロードに失敗しました")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("ダウンロード中にエラーが発生しました")
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ログインが必要です</h2>
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">購入履歴</h1>

      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">購入履歴がありません</p>
          <Link
            href="/datasets"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            データセットを探す
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const isExpired = new Date(purchase.downloadExpiresAt) < new Date()
            const canDownload =
              purchase.status === "COMPLETED" &&
              !isExpired &&
              purchase.downloadCount < purchase.maxDownloads

            return (
              <div key={purchase.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/datasets/${purchase.dataset.id}`}
                      className="text-xl font-semibold hover:text-blue-600"
                    >
                      {purchase.dataset.title}
                    </Link>
                    <div className="mt-2 text-sm text-gray-500">
                      購入日: {new Date(purchase.purchasedAt).toLocaleDateString("ja-JP")}
                    </div>
                  </div>
                  <div className="text-right">
                    {purchase.dataset.isFree ? (
                      <span className="text-2xl font-bold text-green-600">無料</span>
                    ) : (
                      <span className="text-2xl font-bold">
                        ¥{purchase.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <div>
                      ステータス:{" "}
                      <span
                        className={`font-semibold ${
                          purchase.status === "COMPLETED"
                            ? "text-green-600"
                            : purchase.status === "PENDING"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {purchase.status === "COMPLETED"
                          ? "完了"
                          : purchase.status === "PENDING"
                          ? "決済待ち"
                          : "返金済み"}
                      </span>
                    </div>
                    <div>
                      ダウンロード: {purchase.downloadCount}/{purchase.maxDownloads}回
                    </div>
                    <div>
                      有効期限: {new Date(purchase.downloadExpiresAt).toLocaleDateString("ja-JP")}
                    </div>
                  </div>
                  {canDownload ? (
                    <button
                      onClick={() => handleDownload(purchase.dataset.id)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      ダウンロード
                    </button>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {isExpired
                        ? "有効期限切れ"
                        : purchase.downloadCount >= purchase.maxDownloads
                        ? "ダウンロード上限"
                        : "決済待ち"}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

