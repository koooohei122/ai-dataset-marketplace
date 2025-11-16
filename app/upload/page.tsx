"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UploadedFile {
  file: File
  preview?: string
  progress: number
}

export default function UploadPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  // フォームデータ
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [tags, setTags] = useState("")
  const [price, setPrice] = useState("0")
  const [license, setLicense] = useState("commercial")
  const [licenseDetails, setLicenseDetails] = useState("")
  const [language, setLanguage] = useState("")
  const [enableAugmentation, setEnableAugmentation] = useState(false)
  const [augmentationMultiplier, setAugmentationMultiplier] = useState("2")
  const [augmentationQuality, setAugmentationQuality] = useState("standard")
  
  // ファイル
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  // カテゴリを取得
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error)
  }, [])

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const newFiles = selectedFiles.map((file) => ({
      file,
      progress: 0,
    }))
    setFiles([...files, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("categoryId", categoryId)
      formData.append("tags", tags)
      formData.append("price", price)
      formData.append("license", license)
      formData.append("licenseDetails", licenseDetails)
      formData.append("language", language)
      formData.append("enableAugmentation", enableAugmentation.toString())
      formData.append("augmentationMultiplier", augmentationMultiplier)
      formData.append("augmentationQuality", augmentationQuality)

      // ファイルを追加
      files.forEach((fileObj, index) => {
        formData.append(`files`, fileObj.file)
      })

      const response = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/datasets/${data.id}`)
      } else {
        const error = await response.json()
        alert(`エラー: ${error.error || "アップロードに失敗しました"}`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("アップロード中にエラーが発生しました")
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">データセットをアップロード</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ステップ1: 基本情報 */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">基本情報</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 日本の街角画像データセット 50,000枚"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                説明 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="データセットの詳細な説明を入力してください..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                タグ（カンマ区切り）
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 画像, 街角, 日本, 都市"
              />
              <p className="text-sm text-gray-500 mt-1">
                カンマで区切って複数のタグを入力できます
              </p>
            </div>
          </div>
        </div>

        {/* ステップ2: 価格・ライセンス */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">価格・ライセンス</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                価格（円） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                0円に設定すると無料データセットになります
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                ライセンス <span className="text-red-500">*</span>
              </label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="commercial">商用利用可</option>
                <option value="non-commercial">非商用のみ</option>
                <option value="academic">学術利用</option>
                <option value="custom">カスタム</option>
              </select>
            </div>

            {license === "custom" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  ライセンス詳細
                </label>
                <textarea
                  value={licenseDetails}
                  onChange={(e) => setLicenseDetails(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="カスタムライセンスの詳細を記入してください"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                言語（カンマ区切り）
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 日本語, 英語"
              />
            </div>
          </div>
        </div>

        {/* ステップ3: ファイルアップロード */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">ファイル</h2>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block"
              >
                <div className="text-4xl mb-4">📁</div>
                <p className="text-lg font-medium mb-2">
                  ファイルをドラッグ&ドロップ
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  またはクリックしてファイルを選択
                </p>
                <button
                  type="button"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ファイルを選択
                </button>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">選択されたファイル ({files.length})</h3>
                {files.map((fileObj, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{fileObj.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(fileObj.file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ステップ4: AI拡張設定（オプション） */}
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">AIデータ拡張（オプション）</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enableAugmentation}
                onChange={(e) => setEnableAugmentation(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-medium">AI拡張を有効にする</span>
            </label>

            {enableAugmentation && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    拡張倍率
                  </label>
                  <select
                    value={augmentationMultiplier}
                    onChange={(e) => setAugmentationMultiplier(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2">2倍</option>
                    <option value="3">3倍</option>
                    <option value="5">5倍</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    生成品質
                  </label>
                  <select
                    value={augmentationQuality}
                    onChange={(e) => setAugmentationQuality(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fast">高速</option>
                    <option value="standard">標準</option>
                    <option value="high">高品質</option>
                  </select>
                </div>

                <p className="text-sm text-gray-500">
                  ⚠️ AI拡張はユーザーのローカルCPU/GPUを使用します。処理には時間がかかる場合があります。
                </p>
              </>
            )}
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <Link
            href="/datasets"
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading || !title || !description || !categoryId || files.length === 0}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "アップロード中..." : "データセットを公開"}
          </button>
        </div>
      </form>
    </div>
  )
}

