"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface WishlistButtonProps {
  datasetId: string
}

export default function WishlistButton({ datasetId }: WishlistButtonProps) {
  const { data: session } = useSession()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      checkWishlist()
    }
  }, [session, datasetId])

  const checkWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist")
      if (response.ok) {
        const datasets = await response.json()
        setIsInWishlist(datasets.some((d: { id: string }) => d.id === datasetId))
      }
    } catch (error) {
      console.error("Failed to check wishlist:", error)
    }
  }

  const handleToggle = async () => {
    if (!session) return

    setLoading(true)
    try {
      if (isInWishlist) {
        const response = await fetch(`/api/wishlist/${datasetId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setIsInWishlist(false)
        }
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ datasetId }),
        })
        if (response.ok) {
          setIsInWishlist(true)
        }
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-lg ${
        isInWishlist
          ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      } hover:opacity-80 disabled:opacity-50`}
    >
      {isInWishlist ? "❤️ ウィッシュリストから削除" : "🤍 ウィッシュリストに追加"}
    </button>
  )
}

