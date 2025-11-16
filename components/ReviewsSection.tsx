"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  pros: string[]
  cons: string[]
  verifiedPurchase: boolean
  helpfulCount: number
  createdAt: Date
  user: {
    name: string
    avatar?: string
  }
}

interface ReviewsSectionProps {
  datasetId: string
}

export default function ReviewsSection({ datasetId }: ReviewsSectionProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [datasetId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      })
      if (response.ok) {
        fetchReviews()
      }
    } catch (error) {
      console.error("Failed to mark helpful:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      {session && (
        <div className="mb-6">
          <Link
            href={`/datasets/${datasetId}/review`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            レビューを投稿
          </Link>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>まだレビューがありません</p>
          {session && (
            <Link
              href={`/datasets/${datasetId}/review`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              最初のレビューを投稿
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold">{review.user.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-yellow-500 ${
                              review.rating >= star ? "" : "opacity-30"
                            }`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      {review.verifiedPurchase && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                          購入済み
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString("ja-JP")}
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                {review.comment}
              </p>

              {review.pros.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                    良い点
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {review.pros.map((pro, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                      >
                        {pro}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {review.cons.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                    改善点
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {review.cons.map((con, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm"
                      >
                        {con}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600"
                >
                  参考になった ({review.helpfulCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

