"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface ReviewForm {
  rating: number
  title: string
  comment: string
  pros: string[]
  cons: string[]
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [dataset, setDataset] = useState<{ id: string; title: string } | null>(null)
  const [formData, setFormData] = useState<ReviewForm>({
    rating: 5,
    title: "",
    comment: "",
    pros: [],
    cons: [],
  })
  const [proInput, setProInput] = useState("")
  const [conInput, setConInput] = useState("")

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
    }
  }

  const handleAddPro = () => {
    if (proInput.trim()) {
      setFormData({
        ...formData,
        pros: [...formData.pros, proInput.trim()],
      })
      setProInput("")
    }
  }

  const handleRemovePro = (index: number) => {
    setFormData({
      ...formData,
      pros: formData.pros.filter((_, i) => i !== index),
    })
  }

  const handleAddCon = () => {
    if (conInput.trim()) {
      setFormData({
        ...formData,
        cons: [...formData.cons, conInput.trim()],
      })
      setConInput("")
    }
  }

  const handleRemoveCon = (index: number) => {
    setFormData({
      ...formData,
      cons: formData.cons.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !dataset) return

    setLoading(true)

    try {
      const response = await fetch(`/api/datasets/${dataset.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`エラー: ${data.error || "レビューの投稿に失敗しました"}`)
        setLoading(false)
        return
      }

      router.push(`/datasets/${dataset.id}`)
    } catch (error) {
      console.error("Review submission error:", error)
      alert("レビュー投稿中にエラーが発生しました")
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

  if (!dataset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4">
        <Link href={`/datasets/${dataset.id}`} className="text-blue-600 hover:underline">
          ← データセット詳細に戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">レビューを投稿</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">{dataset.title}</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border rounded-lg p-6">
          <label className="block text-sm font-medium mb-4">
            評価 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, rating })}
                className={`text-4xl ${
                  formData.rating >= rating
                    ? "text-yellow-500"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {formData.rating === 5 && "最高"}
            {formData.rating === 4 && "良い"}
            {formData.rating === 3 && "普通"}
            {formData.rating === 2 && "悪い"}
            {formData.rating === 1 && "最悪"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="レビューのタイトル"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            コメント <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            required
            rows={6}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="レビューの詳細を記入してください..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">良い点</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={proInput}
              onChange={(e) => setProInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddPro()
                }
              }}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="良い点を入力してEnter"
            />
            <button
              type="button"
              onClick={handleAddPro}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.pros.map((pro, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center gap-2"
              >
                {pro}
                <button
                  type="button"
                  onClick={() => handleRemovePro(index)}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">改善点</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={conInput}
              onChange={(e) => setConInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddCon()
                }
              }}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="改善点を入力してEnter"
            />
            <button
              type="button"
              onClick={handleAddCon}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.cons.map((con, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm flex items-center gap-2"
              >
                {con}
                <button
                  type="button"
                  onClick={() => handleRemoveCon(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href={`/datasets/${dataset.id}`}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.comment}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? "投稿中..." : "レビューを投稿"}
          </button>
        </div>
      </form>
    </div>
  )
}

