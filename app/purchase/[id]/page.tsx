"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Dataset {
  id: string
  title: string
  description: string
  price: number
  isFree: boolean
  currency: string
  seller: {
    name: string
  }
}

interface PurchaseInfo {
  amount: number
  platformFee: number
  platformFeeRate: number
  sellerAmount: number
  paymentFee?: number
}

export default function PurchasePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"manual" | "stripe">("manual")

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
        
        // 購入情報を計算
        if (!data.isFree) {
          const purchaseInfoResponse = await fetch(`/api/purchase/calculate/${id}`)
          if (purchaseInfoResponse.ok) {
            const purchaseData = await purchaseInfoResponse.json()
            setPurchaseInfo(purchaseData)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch dataset:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!dataset || !session) return

    setProcessing(true)

    try {
      const response = await fetch("/api/purchase/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          datasetId: dataset.id,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`エラー: ${data.error || "購入に失敗しました"}`)
        setProcessing(false)
        return
      }

      // 購入成功
      if (paymentMethod === "manual") {
        // 手動決済の場合は、販売者への連絡方法を表示
        router.push(`/purchase/${data.purchaseId}/complete`)
      } else {
        // Stripe決済の場合は、決済ページにリダイレクト
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        }
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("購入処理中にエラーが発生しました")
      setProcessing(false)
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

  if (dataset.isFree) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <Link href={`/datasets/${dataset.id}`} className="text-blue-600 hover:underline">
            ← データセット詳細に戻る
          </Link>
        </div>

        <div className="border rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{dataset.title}</h1>
          <p className="text-2xl font-bold text-green-600 mb-8">無料</p>
          <button
            onClick={handlePurchase}
            disabled={processing}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {processing ? "処理中..." : "無料でダウンロード"}
          </button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{dataset.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{dataset.description}</p>

          <div className="border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">決済方法を選択</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="manual"
                  checked={paymentMethod === "manual"}
                  onChange={(e) => setPaymentMethod(e.target.value as "manual")}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-semibold">手動決済</div>
                  <div className="text-sm text-gray-500">
                    販売者に直接連絡して決済を行います
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={(e) => setPaymentMethod(e.target.value as "stripe")}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-semibold">クレジットカード（Stripe）</div>
                  <div className="text-sm text-gray-500">
                    安全にクレジットカードで決済
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">購入内容</h2>
            
            {purchaseInfo && (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>販売価格</span>
                  <span className="font-semibold">¥{dataset.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>プラットフォーム手数料 ({purchaseInfo.platformFeeRate}%)</span>
                  <span>¥{purchaseInfo.platformFee.toLocaleString()}</span>
                </div>
                {purchaseInfo.paymentFee && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>決済手数料</span>
                    <span>¥{purchaseInfo.paymentFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>合計</span>
                  <span>¥{purchaseInfo.amount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={processing || !purchaseInfo}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {processing ? "処理中..." : "購入する"}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              ✓ 購入後30日間ダウンロード可能<br />
              ✓ 最大5回までダウンロード可能
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

