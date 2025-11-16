"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Dataset {
  id: string
  title: string
  description: string
  price: number
  isFree: boolean
  rating: number
  reviewCount: number
  category: {
    name: string
  }
}

export default function WishlistPage() {
  const { data: session } = useSession()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchWishlist()
    }
  }, [session])

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist")
      if (response.ok) {
        const data = await response.json()
        setDatasets(data)
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${datasetId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchWishlist()
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
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
      <h1 className="text-3xl font-bold mb-8">ウィッシュリスト</h1>

      {datasets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">ウィッシュリストにデータセットがありません</p>
          <Link
            href="/datasets"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            データセットを探す
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <div key={dataset.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <Link href={`/datasets/${dataset.id}`}>
                <h3 className="text-xl font-semibold mb-2">{dataset.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                  {dataset.description}
                </p>
              </Link>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{dataset.category.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm">{dataset.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  {dataset.isFree ? (
                    <span className="text-2xl font-bold text-green-600">無料</span>
                  ) : (
                    <span className="text-2xl font-bold">¥{dataset.price.toLocaleString()}</span>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(dataset.id)}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

