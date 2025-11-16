"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Dataset {
  id: string
  title: string
  price: number
  isFree: boolean
  status: string
  views: number
  purchases: number
  createdAt: Date
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalViews: 0,
  })

  useEffect(() => {
    if (session) {
      fetchMyDatasets()
    }
  }, [session])

  const fetchMyDatasets = async () => {
    try {
      const response = await fetch("/api/datasets/my")
      if (response.ok) {
        const data = await response.json()
        setDatasets(data.datasets)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch datasets:", error)
    } finally {
      setLoading(false)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">ダッシュボード</h1>
        <Link
          href="/upload"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新しいデータセットをアップロード
        </Link>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <h3 className="text-sm text-gray-500 mb-2">総売上</h3>
          <p className="text-3xl font-bold">¥{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-sm text-gray-500 mb-2">総購入数</h3>
          <p className="text-3xl font-bold">{stats.totalSales}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-sm text-gray-500 mb-2">総閲覧数</h3>
          <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* データセット一覧 */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">あなたのデータセット</h2>
        {datasets.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-gray-500 mb-4">まだデータセットがありません</p>
            <Link
              href="/upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              最初のデータセットをアップロード
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {datasets.map((dataset) => (
              <Link
                key={dataset.id}
                href={`/datasets/${dataset.id}`}
                className="block border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{dataset.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>ステータス: {dataset.status}</span>
                      <span>{dataset.views} views</span>
                      <span>{dataset.purchases} purchases</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {dataset.isFree ? (
                      <span className="text-2xl font-bold text-green-600">無料</span>
                    ) : (
                      <span className="text-2xl font-bold">
                        ¥{dataset.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

