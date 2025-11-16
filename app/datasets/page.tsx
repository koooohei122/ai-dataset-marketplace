"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

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
  createdAt: Date
  seller: {
    name: string
  }
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all")
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "rating" | "price">("newest")

  useEffect(() => {
    fetchCategories()
    fetchDatasets()
  }, [selectedCategory, priceFilter, sortBy])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchDatasets = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append("category", selectedCategory)
      if (priceFilter === "free") params.append("isFree", "true")
      if (priceFilter === "paid") params.append("isFree", "false")
      params.append("sortBy", sortBy)

      const response = await fetch(`/api/datasets?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setDatasets(data)
      }
    } catch (error) {
      console.error("Failed to fetch datasets:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch =
      dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

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
        <h1 className="text-3xl font-bold mb-4">データセット一覧</h1>
        
        {/* 検索バー */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="データセットを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* フィルタ */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">カテゴリ</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">価格</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as "all" | "free" | "paid")}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="free">無料</option>
              <option value="paid">有料</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">並び替え</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "popular" | "rating" | "price")}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">新着順</option>
              <option value="popular">人気順</option>
              <option value="rating">評価順</option>
              <option value="price">価格順</option>
            </select>
          </div>
        </div>
      </div>

      {filteredDatasets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">データセットが見つかりませんでした</p>
          <Link
            href="/upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            最初のデータセットをアップロード
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <Link
              key={dataset.id}
              href={`/datasets/${dataset.id}`}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{dataset.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  {dataset.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  {dataset.category.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm">{dataset.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({dataset.reviewCount})</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {dataset.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  {dataset.isFree ? (
                    <span className="text-2xl font-bold text-green-600">無料</span>
                  ) : (
                    <span className="text-2xl font-bold">
                      ¥{dataset.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {dataset.views} views • {dataset.purchases} purchases
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
