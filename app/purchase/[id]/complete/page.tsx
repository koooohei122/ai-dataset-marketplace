"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Purchase {
  id: string
  status: string
  dataset: {
    id: string
    title: string
  }
  downloadExpiresAt: Date
  maxDownloads: number
  downloadCount: number
}

export default function PurchaseCompletePage() {
  const params = useParams()
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPurchase(params.id as string)
    }
  }, [params.id])

  const fetchPurchase = async (id: string) => {
    try {
      const response = await fetch(`/api/purchase/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPurchase(data)
      }
    } catch (error) {
      console.error("Failed to fetch purchase:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!purchase) return

    try {
      const response = await fetch(`/api/datasets/${purchase.dataset.id}/download`, {
        method: "GET",
      })

      if (response.ok) {
        // ダウンロード処理
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${purchase.dataset.title}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // ダウンロード数を更新
        fetchPurchase(purchase.id)
      } else {
        alert("ダウンロードに失敗しました")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("ダウンロード中にエラーが発生しました")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">購入情報が見つかりません</h2>
          <Link href="/datasets" className="text-blue-600 hover:underline">
            データセット一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  const isExpired = new Date(purchase.downloadExpiresAt) < new Date()
  const canDownload = purchase.status === "COMPLETED" && !isExpired && purchase.downloadCount < purchase.maxDownloads

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="border rounded-lg p-8 text-center">
        {purchase.status === "COMPLETED" ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-4">購入が完了しました</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {purchase.dataset.title}
            </p>

            {canDownload ? (
              <div className="space-y-4">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
                >
                  ダウンロード
                </button>
                <p className="text-sm text-gray-500">
                  残りダウンロード回数: {purchase.maxDownloads - purchase.downloadCount}回
                  <br />
                  有効期限: {new Date(purchase.downloadExpiresAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            ) : (
              <div className="text-red-600">
                {isExpired
                  ? "ダウンロードの有効期限が切れています"
                  : "ダウンロード回数の上限に達しました"}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold mb-4">決済待ち</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              販売者に連絡して決済を完了してください
            </p>
            <p className="text-sm text-gray-500">
              決済が完了次第、ダウンロードが可能になります
            </p>
          </>
        )}

        <div className="mt-8">
          <Link
            href={`/datasets/${purchase.dataset.id}`}
            className="text-blue-600 hover:underline"
          >
            データセット詳細に戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

