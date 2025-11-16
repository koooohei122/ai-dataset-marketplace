"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import ReviewsSection from "@/components/ReviewsSection"

interface Dataset {
  id: string
  title: string
  description: string
  price: number
  isFree: boolean
  currency: string
  views: number
  purchases: number
  rating: number
  reviewCount: number
  tags: string[]
  license: string
  fileCount: number
  size: number
  format: string[]
  createdAt: Date
  seller: {
    id: string
    name: string
    sellerProfile?: {
      verified: boolean
    }
  }
  category: {
    name: string
  }
  files: Array<{
    id: string
    fileName: string
    isSample: boolean
  }>
}

export default function DatasetDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchDataset(params.id as string)
    }
  }, [params.id])

  const fetchDataset = async (id: string) => {
    try {
      const response = await fetch(`/api/datasets/${id}`)
      if (response.ok) {
        const data = await response.json()
        setDataset(data)
      }
    } catch (error) {
      console.error("Failed to fetch dataset:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (!dataset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">データセットが見つかりません</h2>
          <Link href="/datasets" className="text-blue-600 hover:underline">
            データセット一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-4">
        <Link href="/datasets" className="text-blue-600 hover:underline">
          ← データセット一覧に戻る
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{dataset.title}</h1>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-gray-500">by {dataset.seller.name}</span>
              {dataset.seller.sellerProfile?.verified && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  ✓ 認証済み
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold">{dataset.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({dataset.reviewCount}レビュー)</span>
              </div>
              <span className="text-sm text-gray-500">
                {dataset.views} views • {dataset.purchases} purchases
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {dataset.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">説明</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {dataset.description}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">レビュー</h2>
            <ReviewsSection datasetId={dataset.id} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">詳細情報</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">カテゴリ</dt>
                <dd className="font-semibold">{dataset.category.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">ライセンス</dt>
                <dd className="font-semibold">{dataset.license}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">ファイル数</dt>
                <dd className="font-semibold">{dataset.fileCount} files</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">サイズ</dt>
                <dd className="font-semibold">{formatFileSize(Number(dataset.size))}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">形式</dt>
                <dd className="font-semibold">{dataset.format.join(", ")}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <div className="mb-6">
              {dataset.isFree ? (
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-green-600">無料</span>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold">
                    ¥{dataset.price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {session ? (
              dataset.isFree ? (
                <Link
                  href={`/api/datasets/${dataset.id}/download`}
                  className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-4"
                >
                  無料でダウンロード
                </Link>
              ) : (
                <Link
                  href={`/purchase/${dataset.id}`}
                  className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
                >
                  購入する
                </Link>
              )
            ) : (
              <Link
                href="/auth/signin"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
              >
                ログインして購入
              </Link>
            )}

            <div className="text-sm text-gray-500 space-y-2">
              <p>✓ 購入後30日間ダウンロード可能</p>
              <p>✓ 最大5回までダウンロード可能</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

